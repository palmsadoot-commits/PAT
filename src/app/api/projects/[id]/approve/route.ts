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
    let comment: string | undefined;
    try {
      const body = await req.json();
      comment = body.comment;
    } catch {
      // Body optional
    }

    const updated = await executeWorkflowTransition({
      projectId: id,
      action: 'APPROVE',
      userId: session.userId,
      userRole: session.role,
      comment,
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
    });

    return successResponse(updated, 'อนุมัติโครงการเรียบร้อยแล้ว');
  } catch (err: any) {
    return errorResponse(err.message || 'ไม่สามารถอนุมัติโครงการได้', 'WORKFLOW_ERROR', 400);
  }
}
