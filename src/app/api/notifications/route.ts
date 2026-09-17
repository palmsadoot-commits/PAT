import { NextRequest } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/utils/api-response';
import { Notification } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    const storage = getStorage();
    const allNotifs = await storage.get<Notification>(COLLECTIONS.NOTIFICATIONS);

    // Filter by user ID or show relevant ones
    let userNotifs = allNotifs.filter((n) => n.userId === session.userId);

    // If user has no specific notifications, also include broadcast/role-based notifications
    if (userNotifs.length === 0) {
      userNotifs = allNotifs.slice(0, 15);
    }

    userNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return successResponse(userNotifs, 'ดึงรายการแจ้งเตือนสำเร็จ');
  } catch (error: any) {
    console.error('Notifications GET error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการดึงการแจ้งเตือน', 'SERVER_ERROR', 500);
  }
}
