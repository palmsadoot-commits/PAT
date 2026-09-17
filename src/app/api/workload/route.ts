import { NextRequest } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/utils/api-response';
import { User, Project, Organization, Department } from '@/types';

// Fiscal year months (October to September) with year context for FY2569-2570
const FISCAL_MONTHS = [
  { key: '10', year: 2026, month: 10, label: 'ต.ค.', full: 'ตุลาคม 2569' },
  { key: '11', year: 2026, month: 11, label: 'พ.ย.', full: 'พฤศจิกายน 2569' },
  { key: '12', year: 2026, month: 12, label: 'ธ.ค.', full: 'ธันวาคม 2569' },
  { key: '01', year: 2027, month: 1,  label: 'ม.ค.', full: 'มกราคม 2570' },
  { key: '02', year: 2027, month: 2,  label: 'ก.พ.', full: 'กุมภาพันธ์ 2570' },
  { key: '03', year: 2027, month: 3,  label: 'มี.ค.', full: 'มีนาคม 2570' },
  { key: '04', year: 2027, month: 4,  label: 'เม.ย.', full: 'เมษายน 2570' },
  { key: '05', year: 2027, month: 5,  label: 'พ.ค.', full: 'พฤษภาคม 2570' },
  { key: '06', year: 2027, month: 6,  label: 'มิ.ย.', full: 'มิถุนายน 2570' },
  { key: '07', year: 2027, month: 7,  label: 'ก.ค.', full: 'กรกฎาคม 2570' },
  { key: '08', year: 2027, month: 8,  label: 'ส.ค.', full: 'สิงหาคม 2570' },
  { key: '09', year: 2027, month: 9,  label: 'ก.ย.', full: 'กันยายน 2570' },
];

// Role-based Capacity: realistic concurrent project capacity per role
const ROLE_CAPACITY: Record<string, number> = {
  SUPER_ADMIN: 2,   // กำกับดูแลโครงการยุทธศาสตร์ดิจิทัลระดับกระทรวง
  ADMIN: 3,         // ดูแลระบบสารสนเทศและโครงสร้างพื้นฐาน
  OFFICER: 4,       // ตรวจสอบความถูกต้องเอกสาร/งบประมาณ/พัสดุ
  REVIEWER: 3,      // พิจารณากลั่นกรองในคณะกรรมการ
  APPROVER: 3,      // พิจารณาลงนามอนุมัติ
  PROJECT_OWNER: 3, // ขับเคลื่อนและบริหารโครงการ
  EXECUTIVE: 2,     // กำกับนโยบายโครงการเร่งด่วน
  VIEWER: 2,        // ตรวจติดตามและประเมินผล
};

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    const storage = getStorage();
    const [users, projects, organizations, departments] = await Promise.all([
      storage.get<User>(COLLECTIONS.USERS),
      storage.get<Project>(COLLECTIONS.PROJECTS),
      storage.get<Organization>(COLLECTIONS.ORGANIZATIONS),
      storage.get<Department>(COLLECTIONS.DEPARTMENTS),
    ]);

    const activeUsers = users.filter((u) => u.isActive);
    const validProjects = projects.filter((p) => !p.isDeleted);

    // Map helpers
    const orgMap = new Map(organizations.map((o) => [o.id, o.name]));
    const deptMap = new Map(departments.map((d) => [d.id, d.name]));

    // Active project statuses that consume active capacity
    const ACTIVE_STATUSES = new Set([
      'DRAFT',
      'SUBMITTED',
      'DOCUMENT_CHECK',
      'UNDER_REVIEW',
      'RETURNED',
      'PENDING_APPROVAL',
      'APPROVED',
      'IN_PROGRESS',
    ]);

    const userWorkloads = activeUsers.map((user) => {
      // Determine which projects are under this user's active purview and their specific role
      const userProjectsWithRole: Array<Project & { userRoleInProject: string; periodLabel?: string }> = [];

      for (const p of validProjects) {
        let matchedRole: string | null = null;
        let isStageActive = false;

        if (user.role === 'OFFICER') {
          if ((p as any).assignedOfficer?.id === user.id && ['SUBMITTED', 'DOCUMENT_CHECK', 'IN_PROGRESS'].includes(p.status)) {
            matchedRole = p.status === 'IN_PROGRESS' ? 'ผู้กำกับติดตามเทคนิค' : 'เจ้าหน้าที่ตรวจเอกสาร';
            isStageActive = true;
          } else if (p.ownerId === user.id && ['DRAFT', 'RETURNED', 'APPROVED', 'IN_PROGRESS'].includes(p.status)) {
            matchedRole = 'เจ้าของโครงการ';
            isStageActive = true;
          }
        } else if (user.role === 'REVIEWER') {
          if ((p as any).assignedReviewer?.id === user.id && p.status === 'UNDER_REVIEW') {
            matchedRole = 'กรรมการกลั่นกรอง';
            isStageActive = true;
          }
        } else if (user.role === 'APPROVER') {
          if ((p as any).assignedApprover?.id === user.id && p.status === 'PENDING_APPROVAL') {
            matchedRole = 'ผู้มีอำนาจอนุมัติ';
            isStageActive = true;
          }
        } else if (user.role === 'EXECUTIVE') {
          if ((p as any).assignedApprover?.id === user.id && p.status === 'PENDING_APPROVAL') {
            matchedRole = 'ผู้บริหารกำกับนโยบาย';
            isStageActive = true;
          }
        } else if (user.role === 'VIEWER') {
          if ((p as any).assignedInspector?.id === user.id && p.status === 'IN_PROGRESS') {
            matchedRole = 'ผู้ตรวจราชการ';
            isStageActive = true;
          }
        } else if (['PROJECT_OWNER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
          if (p.ownerId === user.id && ['DRAFT', 'RETURNED', 'APPROVED', 'IN_PROGRESS', 'SUBMITTED', 'DOCUMENT_CHECK', 'UNDER_REVIEW', 'PENDING_APPROVAL'].includes(p.status)) {
            matchedRole = 'เจ้าของโครงการ';
            // Only stages where owner is actively drafting, revising, or executing count as primary active load
            isStageActive = ['DRAFT', 'RETURNED', 'APPROVED', 'IN_PROGRESS'].includes(p.status);
          }
        }

        if (matchedRole && isStageActive) {
          userProjectsWithRole.push({
            ...p,
            userRoleInProject: matchedRole,
            periodLabel: (p as any).periodLabel,
          });
        }
      }

      const activeProjects = userProjectsWithRole;
      const completedProjects = validProjects.filter((p) => p.ownerId === user.id && p.status === 'COMPLETED');

      const totalBudget = activeProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
      const activeCount = activeProjects.length;
      const capacity = ROLE_CAPACITY[user.role] || 3;
      const utilization = Math.round((activeCount / capacity) * 100);

      let workloadStatus: 'HEALTHY' | 'NEAR_CAPACITY' | 'OVERLOADED' = 'HEALTHY';
      if (utilization > 100) {
        workloadStatus = 'OVERLOADED';
      } else if (utilization >= 75) {
        workloadStatus = 'NEAR_CAPACITY';
      }

      // Calculate monthly project density across the 12 fiscal months using exact timestamp overlap
      const monthlyDistribution = FISCAL_MONTHS.map((m) => {
        const monthStart = new Date(m.year, m.month - 1, 1).getTime();
        const monthEnd = new Date(m.year, m.month, 0, 23, 59, 59).getTime();

        const projectsInMonth = activeProjects.filter((p) => {
          if (!p.startDate || !p.endDate) return true; // Default fallthrough if no date
          const pStart = new Date(p.startDate).getTime();
          const pEnd = new Date(p.endDate).getTime();
          return pStart <= monthEnd && pEnd >= monthStart;
        });

        const count = projectsInMonth.length;
        let densityStatus: 'NONE' | 'LOW' | 'OPTIMAL' | 'HIGH' = 'NONE';
        if (count > capacity) densityStatus = 'HIGH';
        else if (count >= 2) densityStatus = 'OPTIMAL';
        else if (count > 0) densityStatus = 'LOW';

        return {
          monthKey: m.key,
          label: m.label,
          full: m.full,
          count,
          densityStatus,
        };
      });

      return {
        userId: user.id,
        username: user.username,
        fullName: user.fullName || user.username,
        role: user.role,
        position: user.position || 'เจ้าหน้าที่',
        organizationId: user.organizationId,
        organizationName: orgMap.get(user.organizationId || '') || 'สำนักงานปลัดกระทรวงแรงงาน',
        departmentId: user.departmentId,
        departmentName: deptMap.get(user.departmentId || '') || 'กลุ่มงานทั่วไป',
        capacity,
        activeCount,
        completedCount: completedProjects.length,
        totalBudget,
        utilization,
        workloadStatus,
        monthlyDistribution,
        projects: activeProjects.map((p) => ({
          id: p.id,
          projectNo: p.projectNo,
          projectName: p.projectName,
          budget: p.budget || 0,
          status: p.status,
          priority: p.priority,
          startDate: p.startDate,
          endDate: p.endDate,
          userRoleInProject: p.userRoleInProject,
          periodLabel: p.periodLabel || '',
        })),
      };
    });

    // High-level KPI summary
    const totalPersonnel = userWorkloads.length;
    const overloadedCount = userWorkloads.filter((u) => u.workloadStatus === 'OVERLOADED').length;
    const nearCapacityCount = userWorkloads.filter((u) => u.workloadStatus === 'NEAR_CAPACITY').length;
    const healthyCount = userWorkloads.filter((u) => u.workloadStatus === 'HEALTHY').length;
    const avgUtilization =
      totalPersonnel > 0
        ? Math.round(userWorkloads.reduce((sum, u) => sum + u.utilization, 0) / totalPersonnel)
        : 0;
    const totalActiveBudget = userWorkloads.reduce((sum, u) => sum + u.totalBudget, 0);

    return successResponse({
      summary: {
        totalPersonnel,
        overloadedCount,
        nearCapacityCount,
        healthyCount,
        avgUtilization,
        totalActiveBudget,
      },
      months: FISCAL_MONTHS,
      workloads: userWorkloads,
    });
  } catch (err: any) {
    console.error('Failed to calculate workload:', err);
    return errorResponse(err.message || 'เกิดข้อผิดพลาดในการคำนวณภาระงาน', 'WORKLOAD_ERROR', 500);
  }
}
