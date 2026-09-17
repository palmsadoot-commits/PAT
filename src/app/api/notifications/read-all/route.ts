import { NextRequest } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/utils/api-response';
import { nowISO } from '@/lib/utils/date-utils';
import { Notification } from '@/types';

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    const storage = getStorage();
    const allNotifs = await storage.get<Notification>(COLLECTIONS.NOTIFICATIONS);
    const now = nowISO();

    let updatedCount = 0;
    const updatedNotifs = allNotifs.map((n) => {
      if (n.userId === session.userId || !n.isRead) {
        updatedCount++;
        return { ...n, isRead: true, readAt: now };
      }
      return n;
    });

    await storage.replace(COLLECTIONS.NOTIFICATIONS, updatedNotifs);

    return successResponse({ updatedCount }, 'ทำเครื่องหมายว่าอ่านแล้วทั้งหมด');
  } catch (error: any) {
    console.error('Mark all notifications read error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือน', 'SERVER_ERROR', 500);
  }
}
