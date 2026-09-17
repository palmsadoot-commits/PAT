import { NextRequest } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils/api-response';
import { Project, Organization, Department, User } from '@/types';
import { PROJECT_STATUS_LABELS, PRIORITY_LABELS, PROJECT_TYPE_LABELS } from '@/lib/utils/constants';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    if (!hasPermission(session.role, 'report:view')) {
      return forbiddenResponse('คุณไม่มีสิทธิ์เข้าถึงรายงาน');
    }

    const { searchParams } = new URL(req.url);
    const fiscalYear = searchParams.get('fiscalYear');
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');

    const storage = getStorage();
    const [allProjects, orgs, depts, users] = await Promise.all([
      storage.get<Project>(COLLECTIONS.PROJECTS),
      storage.get<Organization>(COLLECTIONS.ORGANIZATIONS),
      storage.get<Department>(COLLECTIONS.DEPARTMENTS),
      storage.get<User>(COLLECTIONS.USERS),
    ]);

    const orgMap = new Map(orgs.map((o) => [o.id, o.name]));
    const deptMap = new Map(depts.map((d) => [d.id, d.name]));
    const userMap = new Map(users.map((u) => [u.id, u.fullName || u.username]));

    let filtered = allProjects.filter((p) => !p.isDeleted);

    if (fiscalYear) {
      filtered = filtered.filter((p) => Number(p.fiscalYear) === Number(fiscalYear));
    }
    if (organizationId) {
      filtered = filtered.filter((p) => p.organizationId === organizationId);
    }
    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }

    const reportData = filtered.map((p) => ({
      id: p.id,
      projectNo: p.projectNo,
      projectName: p.projectName,
      fiscalYear: p.fiscalYear,
      organizationName: orgMap.get(p.organizationId) || '',
      departmentName: deptMap.get(p.departmentId) || '',
      ownerName: userMap.get(p.ownerId) || '',
      projectTypeName: PROJECT_TYPE_LABELS[p.projectType]?.th || p.projectType,
      budget: p.budget,
      priorityName: PRIORITY_LABELS[p.priority]?.th || p.priority,
      statusName: PROJECT_STATUS_LABELS[p.status]?.th || p.status,
      status: p.status,
      startDate: p.startDate,
      endDate: p.endDate,
      createdAt: p.createdAt,
    }));

    return successResponse(reportData, 'สร้างรายงานโครงการสำเร็จ');
  } catch (error: any) {
    console.error('Projects report error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการสร้างรายงาน', 'SERVER_ERROR', 500);
  }
}
