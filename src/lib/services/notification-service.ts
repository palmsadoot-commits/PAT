import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { Notification, NotificationType } from '@/types';
import { nowISO } from '@/lib/utils/date-utils';

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  projectId?: string;
}): Promise<Notification> {
  try {
    const storage = getStorage();
    const notification: Notification = {
      id: `NTF-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      projectId: params.projectId,
      isRead: false,
      createdAt: nowISO(),
    };

    await storage.append(COLLECTIONS.NOTIFICATIONS, notification);
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return {
      id: `NTF-${Date.now()}`,
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      projectId: params.projectId,
      isRead: false,
      createdAt: nowISO(),
    };
  }
}
