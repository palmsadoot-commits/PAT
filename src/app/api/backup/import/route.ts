import { NextRequest } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/services/audit-service';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils/api-response';
import { getClientIP, getUserAgent } from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    if (!hasPermission(session.role, 'system:manage')) {
      return forbiddenResponse('คุณไม่มีสิทธิ์นำเข้าข้อมูลระบบ');
    }

    const body = await req.json();
    if (!body || !body.collections) {
      return errorResponse('รูปแบบไฟล์สำรองข้อมูลไม่ถูกต้อง', 'INVALID_BACKUP_FORMAT', 400);
    }

    const storage = getStorage();
    let restoredCollections = 0;

    for (const [collectionName, data] of Object.entries(body.collections)) {
      if (Array.isArray(data)) {
        await storage.replace(collectionName, data);
        restoredCollections++;
      }
    }

    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);
    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      module: 'system',
      description: `นำเข้าข้อมูลสำรอง (Restore Backup) จำนวน ${restoredCollections} ชุดข้อมูล`,
      ipAddress,
      userAgent,
    });

    return successResponse({ restoredCollections }, 'กู้คืนข้อมูลระบบสำเร็จ');
  } catch (error: any) {
    console.error('Backup import error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล', 'SERVER_ERROR', 500);
  }
}
