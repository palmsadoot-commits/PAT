import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { executeWorkflowTransition } from '@/lib/services/workflow-service';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils/api-response';
import { getClientIP, getUserAgent } from '@/lib/auth/middleware';

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
    const comment = body?.comment;

    if (!comment || comment.trim() === '') {
      return errorResponse('กรุณาระบุเหตุผลการไม่อนุมัติโครงการ', 'MISSING_COMMENT', 400);
    }

    const updated = await executeWorkflowTransition({
      projectId: id,
      action: 'REJECT',
      userId: session.userId,
      userRole: session.role,
      comment: comment.trim(),
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
    });

    return successResponse(updated, 'บันทึกการไม่อนุมัติโครงการสำเร็จ');
  } catch (err: any) {
    return errorResponse(err.message || 'ไม่สามารถไม่อนุมัติโครงการได้', 'WORKFLOW_ERROR', 400);
  }
}
