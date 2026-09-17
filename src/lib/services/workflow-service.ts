import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { Project, ProjectStatus, WorkflowAction, UserRole, ProjectHistory } from '@/types';
import { getTransition } from '@/lib/workflow/transitions';
import { createAuditLog } from './audit-service';
import { createNotification } from './notification-service';
import { nowISO } from '@/lib/utils/date-utils';
import { NotFoundError } from '@/lib/storage/adapter';

export interface ExecuteTransitionParams {
  projectId: string;
  action: WorkflowAction;
  userId: string;
  userRole: UserRole;
  comment?: string;
  ipAddress: string;
  userAgent: string;
  expectedVersion?: number;
}

export async function executeWorkflowTransition(params: ExecuteTransitionParams): Promise<Project> {
  const storage = getStorage();
  const project = await storage.getById<Project>(COLLECTIONS.PROJECTS, params.projectId);

  if (!project || project.isDeleted) {
    throw new NotFoundError('projects', params.projectId);
  }

  // 1. Find the transition
  const transition = getTransition(project.status, params.action);
  if (!transition) {
    throw new Error(
      `ไม่อนุญาตให้เปลี่ยนสถานะจาก "${project.status}" ด้วยคำสั่ง "${params.action}"`
    );
  }

  // 2. Validate Role
  if (!transition.requiredRoles.includes(params.userRole)) {
    throw new Error(
      `บทบาทผู้ใช้งาน "${params.userRole}" ไม่มีสิทธิ์ดำเนินการ "${transition.label.th}"`
    );
  }

  // 3. Validate Comment if required
  if (transition.requiresComment && (!params.comment || params.comment.trim() === '')) {
    throw new Error(`การดำเนินการ "${transition.label.th}" จำเป็นต้องระบุเหตุผลหรือข้อคิดเห็น`);
  }

  const previousStatus = project.status;
  const newStatus = transition.to;
  const currentVersion = params.expectedVersion !== undefined ? params.expectedVersion : project.version;

  // 4. Update the project in persistent storage (optimistic concurrency handled by StorageAdapter)
  const updatedProject = await storage.update<Project>(
    COLLECTIONS.PROJECTS,
    project.id,
    {
      status: newStatus,
      updatedAt: nowISO(),
      updatedBy: params.userId,
    },
    currentVersion
  );

  // 5. Append to Project History
  const historyEntry: ProjectHistory = {
    id: `HIST-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    projectId: project.id,
    fromStatus: previousStatus,
    toStatus: newStatus,
    action: params.action,
    comment: params.comment || '',
    performedBy: params.userId,
    performedAt: nowISO(),
    ipAddress: params.ipAddress || '127.0.0.1',
    userAgent: params.userAgent || 'Unknown',
  };
  await storage.append(COLLECTIONS.PROJECT_HISTORY, historyEntry);

  // 6. Record in Audit Log
  await createAuditLog({
    userId: params.userId,
    action: 'STATUS_CHANGE',
    module: 'projects',
    recordId: project.id,
    description: `เปลี่ยนสถานะโครงการ "${project.projectNo || project.projectName}" จาก ${previousStatus} เป็น ${newStatus} (${transition.label.th})`,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: {
      fromStatus: previousStatus,
      toStatus: newStatus,
      action: params.action,
      comment: params.comment,
    },
  });

  // 7. Create Notification to project owner
  if (project.ownerId && project.ownerId !== params.userId) {
    let notifType: any = 'NEEDS_REVIEW';
    if (newStatus === 'APPROVED') notifType = 'APPROVED';
    else if (newStatus === 'REJECTED') notifType = 'REJECTED';
    else if (newStatus === 'RETURNED') notifType = 'RETURNED';
    else if (newStatus === 'PENDING_APPROVAL') notifType = 'PENDING_APPROVAL';

    await createNotification({
      userId: project.ownerId,
      type: notifType,
      title: `สถานะโครงการ ${project.projectNo || project.projectName} มีการเปลี่ยนแปลง`,
      message: `โครงการเปลี่ยนสถานะเป็น "${transition.label.th}" โดย ${params.userId}${params.comment ? ` (เหตุผล: ${params.comment})` : ''}`,
      projectId: project.id,
    });
  }

  return updatedProject;
}
