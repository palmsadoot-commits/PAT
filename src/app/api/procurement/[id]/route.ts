import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { successResponse, unauthorizedResponse, errorResponse, notFoundResponse } from '@/lib/utils/api-response';
import { getProcurementWorkspace, updateProcurementWorkspace } from '@/lib/storage/procurement-store';
import { validateCommitteeSeparationOfDuties } from '@/lib/procurement/separation-of-duty-guard';
import { validateMilestoneAcceptanceGate } from '@/lib/procurement/acceptance-gate-validator';

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
    const workspace = getProcurementWorkspace(id);
    if (!workspace) {
      return notFoundResponse(`ไม่พบข้อมูลการจัดซื้อจัดจ้างสำหรับโครงการ ${id}`);
    }

    // Run live compliance checks
    const conflictCheck = validateCommitteeSeparationOfDuties(
      workspace.evaluationCommittee?.members || [],
      workspace.acceptanceCommittee?.members || [],
      workspace.torPriceCommittee?.members || []
    );

    const gateCheck = validateMilestoneAcceptanceGate({
      milestoneNo: workspace.activeMilestoneNo,
      rtmItems: workspace.rtmMatrix || [],
      digitalChecklist: workspace.digitalChecklist || [],
      defects: workspace.defects || []
    });

    return successResponse({
      ...workspace,
      complianceChecks: {
        conflictCheck,
        milestoneGate: gateCheck
      }
    }, 'ดึงข้อมูล Workspace สำเร็จ');
  } catch (error: any) {
    console.error('Procurement GET [id] error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล Workspace', 'SERVER_ERROR', 500);
  }
}

export async function PATCH(
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

    const updated = updateProcurementWorkspace(id, body);
    return successResponse(updated, 'ปรับปรุงข้อมูลสำเร็จ');
  } catch (error: any) {
    console.error('Procurement PATCH [id] error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการปรับปรุงข้อมูล', 'SERVER_ERROR', 500);
  }
}
