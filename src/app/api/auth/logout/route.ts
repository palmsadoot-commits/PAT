import { NextRequest } from 'next/server';
import { destroySession, getSession } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/services/audit-service';
import { successResponse } from '@/lib/utils/api-response';
import { getClientIP, getUserAgent } from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (session) {
      const ipAddress = getClientIP(req);
      const userAgent = getUserAgent(req);
      await createAuditLog({
        userId: session.userId,
        action: 'LOGOUT',
        module: 'auth',
        recordId: session.userId,
        description: `ออกจากระบบ (${session.username})`,
        ipAddress,
        userAgent,
      });
    }

    await destroySession();
    return successResponse(null, 'ออกจากระบบสำเร็จ');
  } catch (error: any) {
    console.error('Logout error:', error);
    await destroySession();
    return successResponse(null, 'ออกจากระบบสำเร็จ');
  }
}
