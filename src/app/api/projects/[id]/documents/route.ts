import { NextRequest } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/services/audit-service';
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils/api-response';
import { getClientIP, getUserAgent } from '@/lib/auth/middleware';
import { nowISO } from '@/lib/utils/date-utils';
import { Project, ProjectDocument, User } from '@/types';

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

    const [allDocs, users] = await Promise.all([
      storage.get<ProjectDocument>(COLLECTIONS.PROJECT_DOCUMENTS),
      storage.get<User>(COLLECTIONS.USERS),
    ]);

    const userMap = new Map(users.map((u) => [u.id, u.fullName || u.username]));

    const projectDocs = allDocs
      .filter((d) => d.projectId === id && !d.isDeleted)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .map((d) => ({
        ...d,
        uploaderName: userMap.get(d.uploadedBy) || d.uploadedBy,
      }));

    return successResponse(projectDocs, 'ดึงรายการเอกสารสำเร็จ');
  } catch (error: any) {
    console.error('Project documents GET error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการดึงเอกสาร', 'SERVER_ERROR', 500);
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

    if (!hasPermission(session.role, 'document:upload')) {
      return forbiddenResponse('คุณไม่มีสิทธิ์อัปโหลดเอกสาร');
    }

    const { id } = await params;
    const storage = getStorage();
    const project = await storage.getById<Project>(COLLECTIONS.PROJECTS, id);

    if (!project || project.isDeleted) {
      return notFoundResponse('ไม่พบโครงการที่ต้องการเพิ่มเอกสาร');
    }

    const body = await req.json();
    const {
      fileName,
      originalName,
      documentType,
      fileSize,
      mimeType,
      blobUrl,
    } = body;

    if (!fileName) {
      return errorResponse('กรุณาระบุชื่อไฟล์', 'MISSING_FILENAME', 400);
    }

    const docId = `DOC-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const now = nowISO();

    const newDoc: ProjectDocument = {
      id: docId,
      projectId: id,
      fileName: fileName.trim(),
      originalName: originalName || fileName.trim(),
      fileType: fileName.split('.').pop()?.toLowerCase() || 'pdf',
      mimeType: mimeType || 'application/pdf',
      fileSize: Number(fileSize) || 102400,
      documentType: documentType || 'SUPPORTING',
      uploadedBy: session.userId,
      uploadedAt: now,
      version: 1,
      blobUrl: blobUrl || `/api/documents/${docId}/download`,
      isDeleted: false,
    };

    await storage.append(COLLECTIONS.PROJECT_DOCUMENTS, newDoc);

    // Audit Log
    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);
    await createAuditLog({
      userId: session.userId,
      action: 'UPLOAD',
      module: 'documents',
      recordId: newDoc.id,
      description: `อัปโหลดเอกสาร: "${newDoc.fileName}" สำหรับโครงการ ${project.projectNo}`,
      ipAddress,
      userAgent,
      metadata: { projectId: id, documentType: newDoc.documentType, fileSize: newDoc.fileSize },
    });

    return successResponse(newDoc, 'อัปโหลดเอกสารสำเร็จ');
  } catch (error: any) {
    console.error('Project document POST error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการอัปโหลดเอกสาร', 'SERVER_ERROR', 500);
  }
}
