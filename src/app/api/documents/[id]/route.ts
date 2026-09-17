import { NextRequest } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/services/audit-service';
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils/api-response';
import { getClientIP, getUserAgent } from '@/lib/auth/middleware';
import { nowISO } from '@/lib/utils/date-utils';
import { ProjectDocument } from '@/types';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    if (!hasPermission(session.role, 'document:delete')) {
      return forbiddenResponse('คุณไม่มีสิทธิ์ลบเอกสาร');
    }

    const { id } = await params;
    const storage = getStorage();
    const allDocs = await storage.get<ProjectDocument>(COLLECTIONS.PROJECT_DOCUMENTS);
    const docIndex = allDocs.findIndex((d) => d.id === id);

    if (docIndex === -1 || allDocs[docIndex].isDeleted) {
      return notFoundResponse('ไม่พบเอกสารที่ต้องการลบ');
    }

    const targetDoc = allDocs[docIndex];

    // Project owner can only delete own documents
    if (session.role === 'PROJECT_OWNER' && targetDoc.uploadedBy !== session.userId) {
      return forbiddenResponse('คุณสามารถลบได้เฉพาะเอกสารที่คุณอัปโหลดเท่านั้น');
    }

    // Soft delete
    allDocs[docIndex] = {
      ...targetDoc,
      isDeleted: true,
      deletedAt: nowISO(),
      deletedBy: session.userId,
    };

    await storage.replace(COLLECTIONS.PROJECT_DOCUMENTS, allDocs);

    // Audit Log
    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);
    await createAuditLog({
      userId: session.userId,
      action: 'DELETE',
      module: 'documents',
      recordId: targetDoc.id,
      description: `ลบเอกสาร "${targetDoc.fileName}" ของโครงการ ${targetDoc.projectId}`,
      ipAddress,
      userAgent,
    });

    return successResponse({ id }, 'ลบเอกสารสำเร็จ');
  } catch (error: any) {
    console.error('Delete document error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการลบเอกสาร', 'SERVER_ERROR', 500);
  }
}
