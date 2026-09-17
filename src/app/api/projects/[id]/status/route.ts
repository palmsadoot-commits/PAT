import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { executeWorkflowTransition } from '@/lib/services/workflow-service';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils/api-response';
import { getClientIP, getUserAgent } from '@/lib/auth/middleware';
import { WorkflowAction } from '@/types';

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
    const { action, comment, version } = body;

    if (!action) {
      return errorResponse('กรุณาระบุ action ในการเปลี่ยนสถานะ', 'MISSING_ACTION', 400);
    }

    const updated = await executeWorkflowTransition({
      projectId: id,
      action: action as WorkflowAction,
      userId: session.userId,
      userRole: session.role,
      comment: comment ? comment.trim() : undefined,
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
      expectedVersion: version,
    });

    return successResponse(updated, 'เปลี่ยนสถานะโครงการเรียบร้อยแล้ว');
  } catch (err: any) {
    return errorResponse(err.message || 'ไม่สามารถเปลี่ยนสถานะโครงการได้', 'WORKFLOW_ERROR', 400);
  }
}
