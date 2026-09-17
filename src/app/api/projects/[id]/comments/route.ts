import { NextRequest } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { createNotification } from '@/lib/services/notification-service';
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils/api-response';
import { nowISO } from '@/lib/utils/date-utils';
import { Project, ProjectComment, User } from '@/types';

export async function GET(
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

    const [allComments, users] = await Promise.all([
      storage.get<ProjectComment>(COLLECTIONS.PROJECT_COMMENTS),
      storage.get<User>(COLLECTIONS.USERS),
    ]);

    const userMap = new Map(users.map((u) => [u.id, u.fullName || u.username]));

    const projectComments = allComments
      .filter((c) => c.projectId === id && !c.isDeleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((c) => ({
        ...c,
        userName: userMap.get(c.userId) || c.userId,
      }));

    return successResponse(projectComments, 'ดึงความคิดเห็นสำเร็จ');
  } catch (error: any) {
    console.error('Comments GET error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการดึงความคิดเห็น', 'SERVER_ERROR', 500);
  }
}

export async function POST(
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
    const project = await storage.getById<Project>(COLLECTIONS.PROJECTS, id);

    if (!project || project.isDeleted) {
      return notFoundResponse('ไม่พบโครงการ');
    }

    const body = await req.json();
    const { content } = body;

    if (!content || content.trim() === '') {
      return errorResponse('กรุณากรอกข้อความความคิดเห็น', 'EMPTY_COMMENT', 400);
    }

    const newComment: ProjectComment = {
      id: `CMT-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      projectId: id,
      userId: session.userId,
      content: content.trim(),
      createdAt: nowISO(),
      updatedAt: nowISO(),
      isDeleted: false,
    };

    await storage.append(COLLECTIONS.PROJECT_COMMENTS, newComment);

    // Notify project owner if someone else commented
    if (project.ownerId && project.ownerId !== session.userId) {
      await createNotification({
        userId: project.ownerId,
        type: 'NEW_COMMENT',
        title: `มีความคิดเห็นใหม่ในโครงการ ${project.projectNo || project.projectName}`,
        message: `${session.fullName || session.username}: "${content.trim().slice(0, 50)}${content.length > 50 ? '...' : ''}"`,
        projectId: project.id,
      });
    }

    return successResponse({
      ...newComment,
      userName: session.fullName || session.username,
    }, 'เพิ่มความคิดเห็นสำเร็จ');
  } catch (error: any) {
    console.error('Comments POST error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการเพิ่มความคิดเห็น', 'SERVER_ERROR', 500);
  }
}
