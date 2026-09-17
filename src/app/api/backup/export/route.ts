import { NextRequest, NextResponse } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/services/audit-service';
import { getClientIP, getUserAgent } from '@/lib/auth/middleware';
import { nowISO } from '@/lib/utils/date-utils';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!hasPermission(session.role, 'system:manage')) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const storage = getStorage();
    const backupData: Record<string, any> = {
      version: '1.0.0',
      exportedAt: nowISO(),
      exportedBy: session.userId,
      collections: {},
    };

    for (const [key, collectionName] of Object.entries(COLLECTIONS)) {
      try {
        backupData.collections[collectionName] = await storage.get(collectionName);
      } catch (err) {
        console.warn(`Could not export ${collectionName}:`, err);
      }
    }

    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);
    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE',
      module: 'system',
      description: 'สำรองข้อมูลทั้งระบบ (System Data Backup Export)',
      ipAddress,
      userAgent,
    });

    const filename = `pat-system-backup-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Backup export error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
