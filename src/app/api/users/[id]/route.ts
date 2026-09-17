import { NextRequest } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { hashPassword } from '@/lib/auth/password';
import { createAuditLog } from '@/lib/services/audit-service';
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils/api-response';
import { getClientIP, getUserAgent } from '@/lib/auth/middleware';
import { nowISO } from '@/lib/utils/date-utils';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    if (!hasPermission(session.role, 'user:manage')) {
      return forbiddenResponse('คุณไม่มีสิทธิ์แก้ไขข้อมูลผู้ใช้งาน');
    }

    const { id } = await params;
    const body = await req.json();
    const storage = getStorage();

    const users = await storage.get<any>(COLLECTIONS.USERS);
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return notFoundResponse('ไม่พบผู้ใช้งานที่ต้องการแก้ไข');
    }

    const targetUser = users[userIndex];
    let passwordHash = targetUser.passwordHash;
    if (body.password && body.password.trim() !== '') {
      passwordHash = await hashPassword(body.password.trim());
    }

    const updatedUser = {
      ...targetUser,
      fullName: body.fullName !== undefined ? body.fullName.trim() : targetUser.fullName,
      email: body.email !== undefined ? body.email.trim() : targetUser.email,
      role: body.role || targetUser.role,
      organizationId: body.organizationId || targetUser.organizationId,
      departmentId: body.departmentId || targetUser.departmentId,
      position: body.position !== undefined ? body.position : targetUser.position,
      isActive: body.isActive !== undefined ? body.isActive : targetUser.isActive,
      passwordHash,
      updatedAt: nowISO(),
    };

    users[userIndex] = updatedUser;
    await storage.replace(COLLECTIONS.USERS, users);

    // Audit log
    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);
    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      module: 'users',
      recordId: id,
      description: `แก้ไขข้อมูลผู้ใช้งาน: ${targetUser.username} (${updatedUser.fullName})`,
      ipAddress,
      userAgent,
    });

    const safeUser = { ...updatedUser, passwordHash: undefined };
    return successResponse(safeUser, 'แก้ไขข้อมูลผู้ใช้งานสำเร็จ');
  } catch (error: any) {
    console.error('User update error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้งาน', 'SERVER_ERROR', 500);
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

    if (!hasPermission(session.role, 'user:manage')) {
      return forbiddenResponse('คุณไม่มีสิทธิ์ลบผู้ใช้งาน');
    }

    const { id } = await params;
    if (id === session.userId) {
      return errorResponse('ไม่สามารถลบบัญชีของตนเองได้', 'CANNOT_DELETE_SELF', 400);
    }

    const storage = getStorage();
    const users = await storage.get<any>(COLLECTIONS.USERS);
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return notFoundResponse('ไม่พบผู้ใช้งาน');
    }

    // Deactivate user instead of hard delete
    users[userIndex].isActive = false;
    users[userIndex].updatedAt = nowISO();
    await storage.replace(COLLECTIONS.USERS, users);

    // Audit log
    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);
    await createAuditLog({
      userId: session.userId,
      action: 'DELETE',
      module: 'users',
      recordId: id,
      description: `ระงับการใช้งานผู้ใช้: ${users[userIndex].username}`,
      ipAddress,
      userAgent,
    });

    return successResponse({ id }, 'ระงับการใช้งานผู้ใช้สำเร็จ');
  } catch (error: any) {
    console.error('User deactivate error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการระงับผู้ใช้งาน', 'SERVER_ERROR', 500);
  }
}
