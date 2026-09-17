import { NextRequest } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils/api-response';
import { Project, ProjectHistory, Organization, SLASetting } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    if (!hasPermission(session.role, 'report:view')) {
      return forbiddenResponse('คุณไม่มีสิทธิ์เข้าถึงรายงาน');
    }

    const storage = getStorage();
    const [allProjects, history, orgs, slaSettings] = await Promise.all([
      storage.get<Project>(COLLECTIONS.PROJECTS),
      storage.get<ProjectHistory>(COLLECTIONS.PROJECT_HISTORY),
      storage.get<Organization>(COLLECTIONS.ORGANIZATIONS),
      storage.get<SLASetting>(COLLECTIONS.SLA_SETTINGS),
    ]);

    const orgMap = new Map(orgs.map((o) => [o.id, o.name]));
    const slaStepMap = new Map(slaSettings.map((s) => [s.workflowStep, s.durationDays]));

    const inProgressProjects = allProjects.filter(
      (p) => !p.isDeleted && ['DOCUMENT_CHECK', 'UNDER_REVIEW', 'PENDING_APPROVAL'].includes(p.status)
    );

    const slaItems = inProgressProjects.map((p) => {
      // Find when it entered current status
      const currentStatusHistory = history
        .filter((h) => h.projectId === p.id && h.toStatus === p.status)
        .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())[0];

      const enteredDate = currentStatusHistory ? new Date(currentStatusHistory.performedAt) : new Date(p.updatedAt || p.createdAt);
      const now = new Date();
      const usedDays = Math.max(1, Math.round((now.getTime() - enteredDate.getTime()) / (1000 * 60 * 60 * 24)));
      const maxDays = slaStepMap.get(p.status) || 5;
      const remainingDays = maxDays - usedDays;

      let slaStatus: 'ON_TRACK' | 'DUE_SOON' | 'OVERDUE' = 'ON_TRACK';
      if (remainingDays < 0) {
        slaStatus = 'OVERDUE';
      } else if (remainingDays <= 1) {
        slaStatus = 'DUE_SOON';
      }

      return {
        projectId: p.id,
        projectNo: p.projectNo,
        projectName: p.projectName,
        organizationName: orgMap.get(p.organizationId) || '',
        currentStatus: p.status,
        enteredDate: enteredDate.toISOString(),
        usedDays,
        maxDays,
        remainingDays,
        slaStatus,
      };
    });

    const summary = {
      totalTracked: slaItems.length,
      onTrack: slaItems.filter((i) => i.slaStatus === 'ON_TRACK').length,
      dueSoon: slaItems.filter((i) => i.slaStatus === 'DUE_SOON').length,
      overdue: slaItems.filter((i) => i.slaStatus === 'OVERDUE').length,
    };

    return successResponse({ summary, items: slaItems }, 'สร้างรายงาน SLA สำเร็จ');
  } catch (error: any) {
    console.error('SLA report error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการสร้างรายงาน SLA', 'SERVER_ERROR', 500);
  }
}
