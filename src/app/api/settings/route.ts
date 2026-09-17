import { NextRequest } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/services/audit-service';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils/api-response';
import { getClientIP, getUserAgent } from '@/lib/auth/middleware';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    const storage = getStorage();
    const [systemSettings, slaSettings] = await Promise.all([
      storage.get<any>(COLLECTIONS.SYSTEM_SETTINGS),
      storage.get<any>(COLLECTIONS.SLA_SETTINGS),
    ]);

    return successResponse({
      system: systemSettings[0] || {},
      sla: slaSettings,
    }, 'ดึงการตั้งค่าระบบสำเร็จ');
  } catch (error: any) {
    console.error('Settings GET error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการดึงการตั้งค่า', 'SERVER_ERROR', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    if (!hasPermission(session.role, 'system:manage')) {
      return forbiddenResponse('คุณไม่มีสิทธิ์แก้ไขการตั้งค่าระบบ');
    }

    const body = await req.json();
    const { system, sla } = body;
    const storage = getStorage();

    if (system) {
      await storage.replace(COLLECTIONS.SYSTEM_SETTINGS, [system]);
    }

    if (sla && Array.isArray(sla)) {
      await storage.replace(COLLECTIONS.SLA_SETTINGS, sla);
    }

    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);
    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      module: 'settings',
      description: `ปรับปรุงการตั้งค่าระบบและเกณฑ์ SLA`,
      ipAddress,
      userAgent,
    });

    return successResponse({ system, sla }, 'บันทึกการตั้งค่าระบบสำเร็จ');
  } catch (error: any) {
    console.error('Settings PUT error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า', 'SERVER_ERROR', 500);
  }
}
