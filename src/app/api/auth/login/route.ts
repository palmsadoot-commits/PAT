import { NextRequest } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/services/audit-service';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { getClientIP, getUserAgent } from '@/lib/auth/middleware';
import { User } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return errorResponse('กรุณาระบุชื่อผู้ใช้และรหัสผ่าน', 'MISSING_CREDENTIALS', 400);
    }

    const storage = getStorage();
    const rawUsers = await storage.get<any>(COLLECTIONS.USERS);

    // Normalize username or aliases
    let targetUsername = username.trim().toLowerCase();
    if (targetUsername === 'admin') targetUsername = 'admin1';
    if (targetUsername === 'somchai') targetUsername = 'owner1';
    if (targetUsername === 'owner') targetUsername = 'owner1';
    if (targetUsername === 'reviewer') targetUsername = 'reviewer1';
    if (targetUsername === 'approver') targetUsername = 'approver1';
    if (targetUsername === 'officer') targetUsername = 'officer1';
    if (targetUsername === 'executive' || targetUsername === 'executive1' || targetUsername === 'exec') targetUsername = 'exec1';
    if (targetUsername === 'viewer') targetUsername = 'viewer1';

    const userMatch = rawUsers.find(
      (u: any) => u.username.toLowerCase() === targetUsername || u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!userMatch) {
      return errorResponse('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'INVALID_CREDENTIALS', 401);
    }

    if (!userMatch.isActive) {
      return errorResponse('บัญชีผู้ใช้นี้ถูกระงับการใช้งาน', 'ACCOUNT_INACTIVE', 403);
    }

    // Verify password hash
    const isPasswordValid = await verifyPassword(password, userMatch.passwordHash);
    if (!isPasswordValid) {
      return errorResponse('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'INVALID_CREDENTIALS', 401);
    }

    // Normalize user to match User interface
    const user: User = {
      id: userMatch.id,
      username: userMatch.username,
      passwordHash: userMatch.passwordHash,
      email: userMatch.email || `${userMatch.username}@mol.go.th`,
      fullName: userMatch.fullName || `${userMatch.firstName || ''} ${userMatch.lastName || ''}`.trim() || userMatch.username,
      role: userMatch.role,
      organizationId: userMatch.organizationId || userMatch.orgId || 'ORG-001',
      departmentId: userMatch.departmentId || 'DEP-001',
      position: userMatch.position || 'เจ้าหน้าที่',
      isActive: userMatch.isActive,
      avatar: userMatch.avatar,
      createdAt: userMatch.createdAt || new Date().toISOString(),
      updatedAt: userMatch.updatedAt || new Date().toISOString(),
    };

    // Create session (sets HttpOnly cookie)
    await createSession(user);

    // Audit log
    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);
    await createAuditLog({
      userId: user.id,
      action: 'LOGIN',
      module: 'auth',
      recordId: user.id,
      description: `เข้าสู่ระบบสำเร็จ (${user.username} - ${user.role})`,
      ipAddress,
      userAgent,
    });

    const safeUser = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      organizationId: user.organizationId,
      departmentId: user.departmentId,
      position: user.position,
      email: user.email,
    };

    return successResponse(safeUser, 'เข้าสู่ระบบสำเร็จ');
  } catch (error: any) {
    console.error('Login error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดภายในระบบ', 'SERVER_ERROR', 500);
  }
}
