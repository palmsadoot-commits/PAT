import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { successResponse, unauthorizedResponse, errorResponse, notFoundResponse } from '@/lib/utils/api-response';
import { getProcurementWorkspace, toggleSlaPause } from '@/lib/storage/procurement-store';

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
    const body = await req.json();
    const { action, committeeType, pauseReason, documentRef, authorizedPosition } = body;

    const ws = getProcurementWorkspace(id);
    if (!ws) {
      return notFoundResponse(`ไม่พบโครงการ ${id}`);
    }

    if (action === 'PAUSE' && (!pauseReason || !documentRef)) {
      return errorResponse('การหยุดนับเวลา (SLA Pause) ต้องระบุเหตุผลและเอกสารอ้างอิงอย่างชัดเจน', 'BAD_REQUEST', 400);
    }

    const record = toggleSlaPause(id, {
      action: action === 'PAUSE' ? 'PAUSE' : 'RESUME',
      committeeType: committeeType || 'ACCEPTANCE',
      pauseReason: pauseReason || 'หยุดเวลาตามคำสั่งผู้มีอำนาจ',
      documentRef: documentRef || 'หนังสือราชการ',
      authorizedBy: session.fullName || session.username,
      authorizedPosition: authorizedPosition || (session as any).position || 'ผู้มีอำนาจสั่งการ'
    });

    return successResponse(record, action === 'PAUSE' ? 'หยุดเวลานับ SLA สำเร็จ' : 'เริ่มนับเวลา SLA ต่อเนื่องสำเร็จ');
  } catch (error: any) {
    console.error('Procurement POST [id]/sla-pause error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการปรับสถานะ SLA Pause', 'SERVER_ERROR', 500);
  }
}
