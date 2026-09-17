import { NextRequest } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { paginatedResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils/api-response';
import { ProjectDocument, Project, User } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    if (!hasPermission(session.role, 'document:download')) {
      return forbiddenResponse('คุณไม่มีสิทธิ์เข้าถึงรายการเอกสาร');
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const documentType = searchParams.get('documentType') || '';
    const projectId = searchParams.get('projectId') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    const storage = getStorage();
    const [allDocs, allProjects, allUsers] = await Promise.all([
      storage.get<ProjectDocument>(COLLECTIONS.PROJECT_DOCUMENTS),
      storage.get<Project>(COLLECTIONS.PROJECTS),
      storage.get<User>(COLLECTIONS.USERS),
    ]);

    const projectMap = new Map(allProjects.map((p) => [p.id, { no: p.projectNo, name: p.projectName }]));
    const userMap = new Map(allUsers.map((u) => [u.id, u.fullName || u.username]));

    let docs = allDocs.filter((d) => !d.isDeleted);

    if (projectId) {
      docs = docs.filter((d) => d.projectId === projectId);
    }

    if (documentType) {
      docs = docs.filter((d) => d.documentType === documentType);
    }

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      docs = docs.filter((d) => {
        const prj = projectMap.get(d.projectId);
        const nameMatch = (d.fileName || '').toLowerCase().includes(q);
        const prjMatch = (prj?.no || '').toLowerCase().includes(q) || (prj?.name || '').toLowerCase().includes(q);
        return nameMatch || prjMatch;
      });
    }

    docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    const total = docs.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginated = docs.slice(startIndex, startIndex + pageSize).map((d) => {
      const prj = projectMap.get(d.projectId);
      return {
        ...d,
        projectNo: prj?.no || d.projectId,
        projectName: prj?.name || '',
        uploaderName: userMap.get(d.uploadedBy) || d.uploadedBy,
      };
    });

    return paginatedResponse(paginated, {
      page,
      pageSize,
      total,
      totalPages,
    }, 'ดึงรายการเอกสารทั้งหมดสำเร็จ');
  } catch (error: any) {
    console.error('All documents GET error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการดึงรายการเอกสาร', 'SERVER_ERROR', 500);
  }
}
