import { NextRequest } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { successResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, errorResponse } from '@/lib/utils/api-response';
import { createAuditLog } from '@/lib/services/audit-service';
import { createNotification } from '@/lib/services/notification-service';
import { getClientIP, getUserAgent } from '@/lib/auth/middleware';
import { nowISO } from '@/lib/utils/date-utils';
import { Project, User, ProjectHistory } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    // Role check: Only ADMIN, SUPER_ADMIN, or OFFICER can rebalance/reassign workload
    if (!['SUPER_ADMIN', 'ADMIN', 'OFFICER'].includes(session.role)) {
      return forbiddenResponse('คุณไม่มีสิทธิ์ในการโอนย้ายหรือมอบหมายงานโครงการ');
    }

    const body = await req.json();
    const { projectId, newOwnerId, reason } = body;

    if (!projectId || !newOwnerId) {
      return errorResponse('กรุณาระบุรหัสโครงการและผู้รับผิดชอบใหม่', 'BAD_REQUEST', 400);
    }

    const storage = getStorage();
    const [project, newOwner, previousOwner] = await Promise.all([
      storage.getById<Project>(COLLECTIONS.PROJECTS, projectId),
      storage.getById<User>(COLLECTIONS.USERS, newOwnerId),
      storage.getById<User>(COLLECTIONS.USERS, body.previousOwnerId || ''),
    ]);

    if (!project || project.isDeleted) {
      return notFoundResponse('ไม่พบโครงการที่ระบุ');
    }

    if (!newOwner || !newOwner.isActive) {
      return notFoundResponse('ไม่พบบุคลากรปลายทาง หรือบัญชีถูกระงับการใช้งาน');
    }

    const oldOwnerId = project.ownerId;
    const oldOwnerName = previousOwner?.fullName || oldOwnerId;
    const newOwnerName = newOwner.fullName || newOwner.username;

    // 1. Update project owner
    const updatedProject = await storage.update<Project>(
      COLLECTIONS.PROJECTS,
      projectId,
      {
        ownerId: newOwnerId,
        updatedAt: nowISO(),
        updatedBy: session.userId,
      },
      project.version
    );

    // 2. Add history record
    const historyEntry: ProjectHistory = {
      id: `HIST-${Date.now()}`,
      projectId,
      fromStatus: project.status,
      toStatus: project.status,
      action: 'SUBMIT', // recorded as reassign action
      comment: `โอนย้ายผู้รับผิดชอบโครงการจาก ${oldOwnerName} ไปยัง ${newOwnerName}${reason ? ` (เหตุผล: ${reason})` : ''}`,
      performedBy: session.fullName || session.username,
      performedAt: nowISO(),
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
    };
    await storage.create<ProjectHistory>(COLLECTIONS.PROJECT_HISTORY, historyEntry);

    // 3. Create Audit Log
    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      module: 'WORKLOAD',
      recordId: projectId,
      description: `โอนย้ายโครงการ "${project.projectName}" ให้ ${newOwnerName}`,
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
    });

    // 4. Create Notification for new owner
    await createNotification({
      userId: newOwnerId,
      type: 'NEW_SUBMISSION',
      title: 'ได้รับมอบหมายโครงการใหม่',
      message: `คุณได้รับมอบหมายให้เป็นผู้รับผิดชอบโครงการ "${project.projectName}" (${project.projectNo})`,
      projectId: project.id,
    });

    return successResponse(updatedProject, 'โอนย้ายผู้รับผิดชอบโครงการเรียบร้อยแล้ว');
  } catch (err: any) {
    console.error('Failed to reassign project:', err);
    return errorResponse(err.message || 'ไม่สามารถโอนย้ายโครงการได้', 'REASSIGN_ERROR', 500);
  }
}
