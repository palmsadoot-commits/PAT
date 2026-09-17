import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/services/audit-service';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  conflictResponse, 
  unauthorizedResponse, 
  forbiddenResponse 
} from '@/lib/utils/api-response';
import { getClientIP, getUserAgent } from '@/lib/auth/middleware';
import { ConflictError } from '@/lib/storage/adapter';
import { nowISO } from '@/lib/utils/date-utils';
import { 
  Project, 
  Organization, 
  Department, 
  User, 
  ProjectDocument, 
  ProjectHistory, 
  ProjectComment 
} from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    if (!hasPermission(session.role, 'project:read')) {
      return forbiddenResponse('คุณไม่มีสิทธิ์เข้าถึงรายละเอียดโครงการ');
    }

    const { id } = await params;
    const storage = getStorage();

    // Fetch project
    const project = await storage.getById<Project>(COLLECTIONS.PROJECTS, id);
    if (!project || project.isDeleted) {
      return notFoundResponse('ไม่พบโครงการที่ระบุ หรือโครงการถูกลบแล้ว');
    }

    // Fetch related collections
    const [organizations, departments, users, allDocs, allHistory, allComments] = await Promise.all([
      storage.get<Organization>(COLLECTIONS.ORGANIZATIONS),
      storage.get<Department>(COLLECTIONS.DEPARTMENTS),
      storage.get<User>(COLLECTIONS.USERS),
      storage.get<ProjectDocument>(COLLECTIONS.PROJECT_DOCUMENTS),
      storage.get<ProjectHistory>(COLLECTIONS.PROJECT_HISTORY),
      storage.get<ProjectComment>(COLLECTIONS.PROJECT_COMMENTS),
    ]);

    const org = organizations.find((o) => o.id === project.organizationId);
    const dept = departments.find((d) => d.id === project.departmentId);
    const owner = users.find((u) => u.id === project.ownerId);

    const documents = allDocs.filter((d) => d.projectId === project.id && !d.isDeleted);
    const history = allHistory
      .filter((h) => h.projectId === project.id)
      .sort((a, b) => new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime());

    // Map user names onto history
    const userMap = new Map(users.map((u) => [u.id, u.fullName || u.username]));
    const enrichedHistory = history.map((h) => ({
      ...h,
      performerName: userMap.get(h.performedBy) || h.performedBy,
    }));

    const comments = allComments
      .filter((c) => c.projectId === project.id && !c.isDeleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((c) => ({
        ...c,
        userName: userMap.get(c.userId) || c.userId,
      }));

    // Read DPM Lifecycle data if available
    const { getDpmData } = await import('@/lib/storage/dpm-store');
    const dpmAll = getDpmData();
    const dpm = dpmAll[project.id] || null;

    const fullDetail = {
      ...project,
      organizationName: org?.name || 'กระทรวงแรงงาน',
      organizationCode: org?.code || '',
      departmentName: dept?.name || '',
      departmentCode: dept?.code || '',
      ownerName: owner?.fullName || owner?.username || project.ownerId,
      ownerPosition: owner?.position || '',
      documents,
      history: enrichedHistory,
      comments,
      dpm,
    };

    return successResponse(fullDetail, 'ดึงข้อมูลโครงการสำเร็จ');
  } catch (error: any) {
    console.error('Project GET [id] error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโครงการ', 'SERVER_ERROR', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    if (!hasPermission(session.role, 'project:update')) {
      return forbiddenResponse('คุณไม่มีสิทธิ์แก้ไขข้อมูลโครงการ');
    }

    const { id } = await params;
    const body = await req.json();
    const storage = getStorage();

    const existing = await storage.getById<Project>(COLLECTIONS.PROJECTS, id);
    if (!existing || existing.isDeleted) {
      return notFoundResponse('ไม่พบโครงการที่ต้องการแก้ไข');
    }

    // Role check: PROJECT_OWNER can only edit their own draft or returned projects
    if (session.role === 'PROJECT_OWNER') {
      if (existing.ownerId !== session.userId && existing.createdBy !== session.userId) {
        return forbiddenResponse('คุณสามารถแก้ไขเฉพาะโครงการที่เป็นเจ้าของเท่านั้น');
      }
      if (existing.status !== 'DRAFT' && existing.status !== 'RETURNED') {
        return forbiddenResponse('ไม่สามารถแก้ไขโครงการที่อยู่ระหว่างการพิจารณาหรืออนุมัติแล้วได้');
      }
    }

    // Optimistic Concurrency Check
    const expectedVersion = typeof body.version === 'number' ? body.version : existing.version;
    if (existing.version !== expectedVersion) {
      return conflictResponse(
        'ข้อมูลถูกแก้ไขโดยผู้ใช้งานอื่นแล้ว กรุณารีเฟรชข้อมูลก่อนบันทึกอีกครั้ง'
      );
    }

    const updates: Partial<Project> = {
      projectName: body.projectName !== undefined ? body.projectName.trim() : existing.projectName,
      fiscalYear: body.fiscalYear !== undefined ? Number(body.fiscalYear) : existing.fiscalYear,
      organizationId: body.organizationId || existing.organizationId,
      departmentId: body.departmentId || existing.departmentId,
      projectType: body.projectType || existing.projectType,
      description: body.description !== undefined ? body.description : existing.description,
      principle: body.principle !== undefined ? body.principle : existing.principle,
      objectives: body.objectives !== undefined ? body.objectives : existing.objectives,
      target: body.target !== undefined ? body.target : existing.target,
      kpi: body.kpi !== undefined ? body.kpi : existing.kpi,
      expectedOutcome: body.expectedOutcome !== undefined ? body.expectedOutcome : existing.expectedOutcome,
      budget: body.budget !== undefined ? Number(body.budget) : existing.budget,
      budgetSource: body.budgetSource || existing.budgetSource,
      priority: body.priority || existing.priority,
      startDate: body.startDate || existing.startDate,
      endDate: body.endDate || existing.endDate,
      updatedAt: nowISO(),
      updatedBy: session.userId,
    };

    let updatedProject: Project;
    try {
      updatedProject = await storage.update<Project>(
        COLLECTIONS.PROJECTS,
        id,
        updates,
        expectedVersion
      );
    } catch (err) {
      if (err instanceof ConflictError) {
        return conflictResponse();
      }
      throw err;
    }

    // Audit Log
    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);
    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      module: 'projects',
      recordId: updatedProject.id,
      description: `แก้ไขข้อมูลโครงการ: ${updatedProject.projectNo} - ${updatedProject.projectName} (เวอร์ชัน ${updatedProject.version})`,
      ipAddress,
      userAgent,
      metadata: { version: updatedProject.version, budget: updatedProject.budget },
    });

    return successResponse(updatedProject, 'บันทึกการแก้ไขโครงการสำเร็จ');
  } catch (error: any) {
    console.error('Project PUT [id] error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการแก้ไขโครงการ', 'SERVER_ERROR', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    if (!hasPermission(session.role, 'project:delete')) {
      return forbiddenResponse('คุณไม่มีสิทธิ์ลบโครงการ');
    }

    const { id } = await params;
    const storage = getStorage();
    const existing = await storage.getById<Project>(COLLECTIONS.PROJECTS, id);

    if (!existing || existing.isDeleted) {
      return notFoundResponse('ไม่พบโครงการที่ต้องการลบ');
    }

    // Soft Delete (updatedAt, deletedAt, deletedBy, isDeleted = true)
    await storage.delete(COLLECTIONS.PROJECTS, id, session.userId);

    // Audit Log
    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);
    await createAuditLog({
      userId: session.userId,
      action: 'DELETE',
      module: 'projects',
      recordId: id,
      description: `ลบโครงการ (Soft Delete): ${existing.projectNo} - ${existing.projectName}`,
      ipAddress,
      userAgent,
    });

    return successResponse({ id }, 'ลบโครงการสำเร็จ');
  } catch (error: any) {
    console.error('Project DELETE [id] error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการลบโครงการ', 'SERVER_ERROR', 500);
  }
}
