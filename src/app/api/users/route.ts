import { NextRequest } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { hashPassword } from '@/lib/auth/password';
import { createAuditLog } from '@/lib/services/audit-service';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils/api-response';
import { getClientIP, getUserAgent } from '@/lib/auth/middleware';
import { nowISO } from '@/lib/utils/date-utils';
import { User, Organization, Department } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    if (!hasPermission(session.role, 'user:manage')) {
      return forbiddenResponse('คุณไม่มีสิทธิ์จัดการข้อมูลผู้ใช้งาน');
    }

    const storage = getStorage();
    const [rawUsers, orgs, depts] = await Promise.all([
      storage.get<any>(COLLECTIONS.USERS),
      storage.get<Organization>(COLLECTIONS.ORGANIZATIONS),
      storage.get<Department>(COLLECTIONS.DEPARTMENTS),
    ]);

    const orgMap = new Map(orgs.map((o) => [o.id, o.name]));
    const deptMap = new Map(depts.map((d) => [d.id, d.name]));

    const users = rawUsers.map((u: any) => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username,
      email: u.email || `${u.username}@mol.go.th`,
      role: u.role,
      organizationId: u.organizationId || u.orgId || 'ORG-001',
      organizationName: orgMap.get(u.organizationId || u.orgId) || 'กระทรวงแรงงาน',
      departmentId: u.departmentId || 'DEP-001',
      departmentName: deptMap.get(u.departmentId) || '',
      position: u.position || 'เจ้าหน้าที่',
      isActive: u.isActive !== undefined ? u.isActive : true,
      createdAt: u.createdAt || nowISO(),
    }));

    return successResponse(users, 'ดึงรายชื่อผู้ใช้งานสำเร็จ');
  } catch (error: any) {
    console.error('Users GET error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน', 'SERVER_ERROR', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    if (!hasPermission(session.role, 'user:manage')) {
      return forbiddenResponse('คุณไม่มีสิทธิ์สร้างผู้ใช้งาน');
    }

    const body = await req.json();
    const { username, password, fullName, email, role, organizationId, departmentId, position } = body;

    if (!username || !password || !fullName || !role) {
      return errorResponse('กรุณากรอกข้อมูลสำคัญ (ชื่อผู้ใช้, รหัสผ่าน, ชื่อ-นามสกุล, บทบาท)', 'MISSING_FIELDS', 400);
    }

    const storage = getStorage();
    const existingUsers = await storage.get<any>(COLLECTIONS.USERS);

    if (existingUsers.some((u: any) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      return errorResponse('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว', 'USERNAME_EXISTS', 400);
    }

    const passwordHash = await hashPassword(password);
    const userId = `USR-${(existingUsers.length + 1).toString().padStart(3, '0')}`;
    const now = nowISO();

    const newUser: User = {
      id: userId,
      username: username.trim().toLowerCase(),
      passwordHash,
      email: email || `${username.trim().toLowerCase()}@mol.go.th`,
      fullName: fullName.trim(),
      role,
      organizationId: organizationId || 'ORG-001',
      departmentId: departmentId || 'DEP-001',
      position: position || 'เจ้าหน้าที่',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await storage.append(COLLECTIONS.USERS, newUser);

    // Audit log
    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);
    await createAuditLog({
      userId: session.userId,
      action: 'CREATE',
      module: 'users',
      recordId: newUser.id,
      description: `สร้างผู้ใช้งานใหม่: ${newUser.username} (${newUser.fullName}, บทบาท ${newUser.role})`,
      ipAddress,
      userAgent,
    });

    const safeUser = { ...newUser, passwordHash: undefined };
    return successResponse(safeUser, 'สร้างผู้ใช้งานสำเร็จ');
  } catch (error: any) {
    console.error('Users POST error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน', 'SERVER_ERROR', 500);
  }
}
