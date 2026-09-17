import { NextRequest } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse } from '@/lib/utils/api-response';
import { nowISO } from '@/lib/utils/date-utils';
import { Notification } from '@/types';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    const { id } = await params;
    const storage = getStorage();
    const allNotifs = await storage.get<Notification>(COLLECTIONS.NOTIFICATIONS);
    const index = allNotifs.findIndex((n) => n.id === id);

    if (index === -1) {
      return notFoundResponse('ไม่พบการแจ้งเตือน');
    }

    allNotifs[index] = {
      ...allNotifs[index],
      isRead: true,
      readAt: nowISO(),
    };

    await storage.replace(COLLECTIONS.NOTIFICATIONS, allNotifs);

    return successResponse(allNotifs[index], 'ทำเครื่องหมายว่าอ่านแล้ว');
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือน', 'SERVER_ERROR', 500);
  }
}
