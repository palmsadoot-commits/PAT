import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { successResponse, unauthorizedResponse, errorResponse, notFoundResponse } from '@/lib/utils/api-response';
import { getProcurementWorkspace, updateProcurementWorkspace } from '@/lib/storage/procurement-store';
import { validateCommitteeSeparationOfDuties } from '@/lib/procurement/separation-of-duty-guard';

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
    const { action } = body;

    const ws = getProcurementWorkspace(id);
    if (!ws) {
      return notFoundResponse(`ไม่พบโครงการ ${id}`);
    }

    if (action === 'CHECK_SEPARATION_OF_DUTIES') {
      const result = validateCommitteeSeparationOfDuties(
        ws.evaluationCommittee?.members || [],
        ws.acceptanceCommittee?.members || [],
        ws.torPriceCommittee?.members || []
      );
      return successResponse(result, 'ตรวจสอบข้อขัดแย้งของคณะกรรมการสำเร็จ');
    }

    if (action === 'UPDATE_BIDDER_SCORE') {
      const { bidderId, technicalScore, priceScore } = body;
      if (!ws.evaluationResolution) throw new Error('ไม่พบข้อมูลการประเมินผล');

      const bIdx = ws.evaluationResolution.bidders.findIndex(b => b.id === bidderId);
      if (bIdx === -1) throw new Error(`ไม่พบผู้ยื่นข้อเสนอ ID ${bidderId}`);

      const bidder = ws.evaluationResolution.bidders[bIdx];
      const tech = Number(technicalScore) ?? bidder.technicalScore;
      const price = Number(priceScore) ?? bidder.priceScore;
      const combined = Math.round((tech * 0.6 + price * 0.4) * 10) / 10;

      ws.evaluationResolution.bidders[bIdx] = {
        ...bidder,
        technicalScore: tech,
        priceScore: price,
        totalCombinedScore: combined
      };

      // Recalculate winner
      const eligible = ws.evaluationResolution.bidders.filter(b => !b.isDisqualified);
      eligible.sort((a, b) => b.totalCombinedScore - a.totalCombinedScore);
      if (eligible.length > 0) {
        ws.evaluationResolution.winningBidderName = eligible[0].bidderNameTh;
        ws.evaluationResolution.awardedPriceBaht = eligible[0].quotedPriceBaht;
      }

      updateProcurementWorkspace(id, { evaluationResolution: ws.evaluationResolution });
      return successResponse(ws.evaluationResolution, 'บันทึกคะแนนสำเร็จ');
    }

    if (action === 'APPROVE_RESOLUTION') {
      if (!ws.evaluationResolution) throw new Error('ไม่พบข้อมูลการประเมินผล');
      
      ws.evaluationResolution.headOfAgencyVerdict = 'APPROVED';
      ws.evaluationResolution.headOfAgencyVerdictAt = new Date().toISOString();
      ws.currentPhase = 'CONTRACT';
      ws.contractorName = ws.evaluationResolution.winningBidderName;
      ws.contractValueBaht = ws.evaluationResolution.awardedPriceBaht;

      updateProcurementWorkspace(id, {
        evaluationResolution: ws.evaluationResolution,
        currentPhase: ws.currentPhase,
        contractorName: ws.contractorName,
        contractValueBaht: ws.contractValueBaht
      });

      return successResponse(ws.evaluationResolution, 'อนุมัติผลการจัดซื้อจัดจ้างสำเร็จ เข้าสู่ขั้นตอนจัดทำสัญญา');
    }

    return errorResponse('Invalid action', 'BAD_REQUEST', 400);
  } catch (error: any) {
    console.error('Procurement POST [id]/evaluation error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการประเมินผล', 'SERVER_ERROR', 500);
  }
}
