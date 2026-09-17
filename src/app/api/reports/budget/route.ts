import { NextRequest } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils/api-response';
import { Project, Organization } from '@/types';

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

    const storage = getStorage();
    const [allProjects, orgs] = await Promise.all([
      storage.get<Project>(COLLECTIONS.PROJECTS),
      storage.get<Organization>(COLLECTIONS.ORGANIZATIONS),
    ]);

    let projects = allProjects.filter((p) => !p.isDeleted);
    if (fiscalYear) {
      projects = projects.filter((p) => Number(p.fiscalYear) === Number(fiscalYear));
    }

    const budgetByOrg = orgs.map((org) => {
      const orgProjects = projects.filter((p) => p.organizationId === org.id);
      const totalBudget = orgProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
      const approvedProjects = orgProjects.filter((p) => p.status === 'APPROVED' || p.status === 'IN_PROGRESS' || p.status === 'COMPLETED');
      const approvedBudget = approvedProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
      const pendingProjects = orgProjects.filter((p) => p.status === 'PENDING_APPROVAL' || p.status === 'UNDER_REVIEW' || p.status === 'DOCUMENT_CHECK');
      const pendingBudget = pendingProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);

      return {
        orgId: org.id,
        orgName: org.name,
        orgCode: org.code,
        projectCount: orgProjects.length,
        totalBudget,
        approvedBudget,
        pendingBudget,
      };
    });

    return successResponse(budgetByOrg, 'สร้างรายงานงบประมาณสำเร็จ');
  } catch (error: any) {
    console.error('Budget report error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการสร้างรายงานงบประมาณ', 'SERVER_ERROR', 500);
  }
}
