import { NextRequest, NextResponse } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { Project, Organization, Department, User } from '@/types';
import { PROJECT_STATUS_LABELS, PRIORITY_LABELS, PROJECT_TYPE_LABELS } from '@/lib/utils/constants';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!hasPermission(session.role, 'report:export')) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { type } = await params;
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

    const projects = allProjects.filter((p) => !p.isDeleted);

    // Build CSV with UTF-8 BOM (\uFEFF) so Excel opens Thai correctly without garbled text
    let csvContent = '\uFEFF';

    if (type === 'projects') {
      const headers = ['เลขที่โครงการ', 'ชื่อโครงการ', 'ปีงบประมาณ', 'หน่วยงาน', 'กลุ่มงาน/ฝ่าย', 'ผู้รับผิดชอบ', 'ประเภท', 'งบประมาณ (บาท)', 'ความเร่งด่วน', 'สถานะ', 'วันที่สร้าง'];
      csvContent += headers.map((h) => `"${h}"`).join(',') + '\n';

      projects.forEach((p) => {
        const row = [
          p.projectNo || p.id,
          p.projectName.replace(/"/g, '""'),
          p.fiscalYear,
          orgMap.get(p.organizationId) || '',
          deptMap.get(p.departmentId) || '',
          userMap.get(p.ownerId) || '',
          PROJECT_TYPE_LABELS[p.projectType]?.th || p.projectType,
          p.budget,
          PRIORITY_LABELS[p.priority]?.th || p.priority,
          PROJECT_STATUS_LABELS[p.status]?.th || p.status,
          p.createdAt,
        ];
        csvContent += row.map((val) => `"${val}"`).join(',') + '\n';
      });
    } else if (type === 'budget') {
      const headers = ['รหัสหน่วยงาน', 'ชื่อหน่วยงาน', 'จำนวนโครงการ', 'งบประมาณรวม (บาท)', 'งบประมาณที่อนุมัติแล้ว (บาท)', 'งบประมาณที่รอพิจารณา (บาท)'];
      csvContent += headers.map((h) => `"${h}"`).join(',') + '\n';

      orgs.forEach((org) => {
        const orgProjects = projects.filter((p) => p.organizationId === org.id);
        const totalBudget = orgProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
        const approved = orgProjects.filter((p) => ['APPROVED', 'IN_PROGRESS', 'COMPLETED'].includes(p.status)).reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
        const pending = orgProjects.filter((p) => ['PENDING_APPROVAL', 'UNDER_REVIEW', 'DOCUMENT_CHECK'].includes(p.status)).reduce((sum, p) => sum + (Number(p.budget) || 0), 0);

        const row = [org.code, org.name.replace(/"/g, '""'), orgProjects.length, totalBudget, approved, pending];
        csvContent += row.map((val) => `"${val}"`).join(',') + '\n';
      });
    } else {
      csvContent += `"ข้อมูลรายงาน","${type}"\n`;
    }

    const filename = `report-${type}-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (error: any) {
    console.error('Export CSV error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
