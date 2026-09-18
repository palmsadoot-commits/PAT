import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/utils/api-response';
import { getAllProcurementWorkspaces } from '@/lib/storage/procurement-store';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
    }

    const workspaces = getAllProcurementWorkspaces();

    // Summary metrics for Governance Dashboard
    let totalBudget = 0;
    let totalContractValue = 0;
    let pendingTorCount = 0;
    let pendingEvaluationCount = 0;
    let activeAcceptanceCount = 0;
    let criticalDefectTotal = 0;
    let activeNotice175Count = 0;

    for (const ws of workspaces) {
      totalBudget += ws.budgetBaht || 0;
      totalContractValue += ws.contractValueBaht || 0;

      if (ws.currentPhase === 'TOR_PRICE') pendingTorCount++;
      else if (ws.currentPhase === 'EVALUATION') pendingEvaluationCount++;
      else if (ws.currentPhase === 'DELIVERY_ACCEPTANCE') activeAcceptanceCount++;

      const openCritDefects = (ws.defects || []).filter(
        d => (d.severity === 'CRITICAL' || d.severity === 'HIGH') && d.status !== 'CLOSED' && d.status !== 'RESOLVED'
      );
      criticalDefectTotal += openCritDefects.length;

      const openNotices = (ws.notices175 || []).filter(n => n.status === 'SENT');
      activeNotice175Count += openNotices.length;
    }

    return successResponse({
      workspaces,
      summary: {
        totalProjects: workspaces.length,
        totalBudget,
        totalContractValue,
        pendingTorCount,
        pendingEvaluationCount,
        activeAcceptanceCount,
        criticalDefectTotal,
        activeNotice175Count
      }
    }, 'ดึงข้อมูลภาพรวมการจัดซื้อจัดจ้างสำเร็จ');
  } catch (error: any) {
    console.error('Procurement GET list error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลการจัดซื้อจัดจ้าง', 'SERVER_ERROR', 500);
  }
}
