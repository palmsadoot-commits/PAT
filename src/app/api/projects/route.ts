import { NextRequest } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/services/audit-service';
import { successResponse, errorResponse, paginatedResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils/api-response';
import { getClientIP, getUserAgent } from '@/lib/auth/middleware';
import { generateProjectId, generateProjectNo } from '@/lib/utils/id-generator';
import { nowISO } from '@/lib/utils/date-utils';
import { Project, Organization, Department, User } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    if (!hasPermission(session.role, 'project:read')) {
      return forbiddenResponse('คุณไม่มีสิทธิ์เข้าถึงรายการโครงการ');
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const organizationId = searchParams.get('organizationId') || undefined;
    const departmentId = searchParams.get('departmentId') || undefined;
    const fiscalYear = searchParams.get('fiscalYear') ? Number(searchParams.get('fiscalYear')) : undefined;
    const priority = searchParams.get('priority') || undefined;
    const projectType = searchParams.get('projectType') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const storage = getStorage();

    // Fetch collections
    const [allProjects, organizations, departments, users] = await Promise.all([
      storage.get<Project>(COLLECTIONS.PROJECTS),
      storage.get<Organization>(COLLECTIONS.ORGANIZATIONS),
      storage.get<Department>(COLLECTIONS.DEPARTMENTS),
      storage.get<User>(COLLECTIONS.USERS),
    ]);

    const orgMap = new Map(organizations.map((o) => [o.id, o.name]));
    const deptMap = new Map(departments.map((d) => [d.id, d.name]));
    const userMap = new Map(users.map((u) => [u.id, u.fullName || u.username]));

    // Filter active (non-deleted)
    let filtered = allProjects.filter((p) => !p.isDeleted);

    // If role is PROJECT_OWNER and not admin/officer/reviewer/approver/executive, can only see own projects if configured
    if (session.role === 'PROJECT_OWNER') {
      const viewAll = searchParams.get('all') === 'true';
      if (!viewAll) {
        filtered = filtered.filter((p) => p.ownerId === session.userId || p.createdBy === session.userId);
      }
    }

    // Apply filters
    if (status) {
      if (status.includes(',')) {
        const statuses = status.split(',');
        filtered = filtered.filter((p) => statuses.includes(p.status));
      } else {
        filtered = filtered.filter((p) => p.status === status);
      }
    }

    if (organizationId) {
      filtered = filtered.filter((p) => p.organizationId === organizationId);
    }

    if (departmentId) {
      filtered = filtered.filter((p) => p.departmentId === departmentId);
    }

    if (fiscalYear) {
      filtered = filtered.filter((p) => Number(p.fiscalYear) === fiscalYear);
    }

    if (priority) {
      filtered = filtered.filter((p) => p.priority === priority);
    }

    if (projectType) {
      filtered = filtered.filter((p) => p.projectType === projectType);
    }

    // Search query across name, projectNo, description, owner
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((p) => {
        const pNo = (p.projectNo || '').toLowerCase();
        const pName = (p.projectName || '').toLowerCase();
        const orgName = (orgMap.get(p.organizationId) || '').toLowerCase();
        const ownerName = (userMap.get(p.ownerId) || '').toLowerCase();
        return pNo.includes(q) || pName.includes(q) || orgName.includes(q) || ownerName.includes(q);
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'budget') {
        return (Number(a.budget) - Number(b.budget)) * order;
      }
      if (sortBy === 'projectName') {
        return (a.projectName || '').localeCompare(b.projectName || '') * order;
      }
      if (sortBy === 'projectNo') {
        return (a.projectNo || '').localeCompare(b.projectNo || '') * order;
      }
      const dateA = new Date(a[sortBy as keyof Project] as string || a.createdAt).getTime();
      const dateB = new Date(b[sortBy as keyof Project] as string || b.createdAt).getTime();
      return (dateA - dateB) * order;
    });

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize).map((p) => ({
      ...p,
      organizationName: orgMap.get(p.organizationId) || 'กระทรวงแรงงาน',
      departmentName: deptMap.get(p.departmentId) || '',
      ownerName: userMap.get(p.ownerId) || '',
    }));

    return paginatedResponse(paginated, {
      page,
      pageSize,
      total,
      totalPages,
    }, 'ดึงรายการโครงการสำเร็จ');
  } catch (error: any) {
    console.error('Projects GET error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการดึงรายการโครงการ', 'SERVER_ERROR', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    if (!hasPermission(session.role, 'project:create')) {
      return forbiddenResponse('คุณไม่มีสิทธิ์สร้างโครงการ');
    }

    const body = await req.json();
    const {
      projectName,
      fiscalYear,
      organizationId,
      departmentId,
      projectType,
      description,
      principle,
      objectives,
      target,
      kpi,
      expectedOutcome,
      budget,
      budgetSource,
      priority,
      startDate,
      endDate,
    } = body;

    if (!projectName || !budget || !organizationId) {
      return errorResponse('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน (ชื่อโครงการ, งบประมาณ, หน่วยงาน)', 'MISSING_FIELDS', 400);
    }

    const storage = getStorage();
    const currentProjects = await storage.get<Project>(COLLECTIONS.PROJECTS);
    const countInYear = currentProjects.filter((p) => Number(p.fiscalYear) === (Number(fiscalYear) || 2569)).length;

    const fyNumber = Number(fiscalYear) || 2569;
    const newProjectId = generateProjectId(fyNumber);
    const newProjectNo = generateProjectNo(fyNumber, countInYear + 1);

    const now = nowISO();
    const newProject: Project = {
      id: newProjectId,
      projectNo: newProjectNo,
      projectName: projectName.trim(),
      fiscalYear: fyNumber,
      organizationId: organizationId || session.organizationId || 'ORG-001',
      departmentId: departmentId || session.departmentId || 'DEP-001',
      ownerId: session.userId,
      projectType: projectType || 'DIGITAL',
      description: description || '',
      principle: principle || '',
      objectives: objectives || '',
      target: target || '',
      kpi: kpi || '',
      expectedOutcome: expectedOutcome || '',
      budget: Number(budget) || 0,
      budgetSource: budgetSource || 'งบประมาณรายจ่ายประจำปี',
      priority: priority || 'MEDIUM',
      startDate: startDate || now.split('T')[0],
      endDate: endDate || now.split('T')[0],
      status: 'DRAFT',
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: session.userId,
      updatedBy: session.userId,
      isDeleted: false,
    };

    // Save to persistent storage
    await storage.create(COLLECTIONS.PROJECTS, newProject);

    // Audit log
    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);
    await createAuditLog({
      userId: session.userId,
      action: 'CREATE',
      module: 'projects',
      recordId: newProject.id,
      description: `สร้างโครงการใหม่: ${newProject.projectNo} - ${newProject.projectName} (งบประมาณ ${newProject.budget.toLocaleString()} บาท)`,
      ipAddress,
      userAgent,
      metadata: { projectNo: newProject.projectNo, budget: newProject.budget },
    });

    return successResponse(newProject, 'สร้างโครงการสำเร็จ');
  } catch (error: any) {
    console.error('Projects POST error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการสร้างโครงการ', 'SERVER_ERROR', 500);
  }
}
