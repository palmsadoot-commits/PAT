import { NextRequest, NextResponse } from 'next/server';
import { getStorage, COLLECTIONS } from '@/lib/storage/factory';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/permissions';
import { createAuditLog } from '@/lib/services/audit-service';
import { notFoundResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/utils/api-response';
import { getClientIP, getUserAgent } from '@/lib/auth/middleware';
import { ProjectDocument } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    if (!hasPermission(session.role, 'document:download')) {
      return forbiddenResponse('คุณไม่มีสิทธิ์ดาวน์โหลดเอกสาร');
    }

    const { id } = await params;
    const storage = getStorage();
    const doc = await storage.getById<ProjectDocument>(COLLECTIONS.PROJECT_DOCUMENTS, id);

    if (!doc || doc.isDeleted) {
      return notFoundResponse('ไม่พบเอกสารที่ต้องการดาวน์โหลด');
    }

    // Audit download action
    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);
    await createAuditLog({
      userId: session.userId,
      action: 'DOWNLOAD',
      module: 'documents',
      recordId: doc.id,
      description: `ดาวน์โหลดเอกสาร: "${doc.fileName}" (โครงการ ${doc.projectId})`,
      ipAddress,
      userAgent,
    });

    // If doc has a real Vercel Blob URL, redirect to it
    if (doc.blobUrl && doc.blobUrl.startsWith('http')) {
      return NextResponse.redirect(doc.blobUrl);
    }

    // Otherwise generate a standard simulated file response with the document's name
    const dummyContent = `ระบบติดตามขออนุมัติโครงการ (Project Approval Tracking System)\n\nเอกสาร: ${doc.fileName}\nประเภท: ${doc.documentType}\nรหัสโครงการ: ${doc.projectId}\nวันที่อัปโหลด: ${doc.uploadedAt}\n\nเอกสารนี้จัดเก็บและรับรองโดยระบบดิจิทัลกระทรวงแรงงาน`;
    
    return new NextResponse(dummyContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(doc.fileName)}`,
      },
    });
  } catch (error: any) {
    console.error('Download document error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
