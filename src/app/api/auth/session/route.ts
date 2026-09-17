import { getSession } from '@/lib/auth/session';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { successResponse, unauthorizedResponse } from '@/lib/utils/api-response';
import { User } from '@/types';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return unauthorizedResponse('ยังไม่ได้เข้าสู่ระบบ');
  }

  // Optionally fetch fresh user info from storage
  try {
    const storage = getStorage();
    const rawUsers = await storage.get<any>(COLLECTIONS.USERS);
    const userMatch = rawUsers.find((u: any) => u.id === session.userId);

    const userData = {
      id: session.userId,
      username: session.username,
      fullName: session.fullName,
      role: session.role,
      organizationId: session.organizationId,
      departmentId: session.departmentId,
      position: userMatch?.position || 'เจ้าหน้าที่',
      email: userMatch?.email || `${session.username}@mol.go.th`,
      avatar: userMatch?.avatar,
    };

    return successResponse(userData, 'ดึงข้อมูลเซสชันสำเร็จ');
  } catch (error) {
    return successResponse(session, 'ดึงข้อมูลเซสชันสำเร็จ');
  }
}
