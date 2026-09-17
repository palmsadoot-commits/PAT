import { NextRequest } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { paginatedResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils/api-response';
import { AuditLog, User } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    if (!hasPermission(session.role, 'audit:view')) {
      return forbiddenResponse('คุณไม่มีสิทธิ์เข้าถึงบันทึกการใช้งานระบบ');
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const action = searchParams.get('action') || '';
    const moduleName = searchParams.get('module') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    const storage = getStorage();
    const [allLogs, allUsers] = await Promise.all([
      storage.get<AuditLog>(COLLECTIONS.AUDIT_LOGS),
      storage.get<User>(COLLECTIONS.USERS),
    ]);

    const userMap = new Map(allUsers.map((u) => [u.id, u.fullName || u.username]));

    let logs = [...allLogs];

    if (action) {
      logs = logs.filter((l) => l.action === action);
    }

    if (moduleName) {
      logs = logs.filter((l) => l.module === moduleName);
    }

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      logs = logs.filter((l) => {
        const uName = (userMap.get(l.userId) || '').toLowerCase();
        const desc = (l.description || '').toLowerCase();
        const ip = (l.ipAddress || '').toLowerCase();
        return uName.includes(q) || desc.includes(q) || ip.includes(q) || l.action.toLowerCase().includes(q);
      });
    }

    // Newest first
    logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = logs.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginated = logs.slice(startIndex, startIndex + pageSize).map((l) => ({
      ...l,
      userName: userMap.get(l.userId) || l.userId,
    }));

    return paginatedResponse(paginated, {
      page,
      pageSize,
      total,
      totalPages,
    }, 'ดึงบันทึกการใช้งานสำเร็จ');
  } catch (error: any) {
    console.error('Audit logs GET error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการดึงบันทึกการใช้งาน', 'SERVER_ERROR', 500);
  }
}
