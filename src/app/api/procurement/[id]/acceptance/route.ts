import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { successResponse, unauthorizedResponse, errorResponse, notFoundResponse } from '@/lib/utils/api-response';
import { 
  getProcurementWorkspace, 
  updateRtmVerdict, 
  updateDigitalChecklistItem, 
  addDefectLog, 
  updateDefectStatus,
  issueNotice175,
  createAcceptanceCertificates
} from '@/lib/storage/procurement-store';
import { validateMilestoneAcceptanceGate } from '@/lib/procurement/acceptance-gate-validator';

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

    if (action === 'UPDATE_RTM_VERDICT') {
      const { rtmId, verdict, inspectorNotesTh, evidenceRef, evidenceFileName } = body;
      const updated = updateRtmVerdict(
        id, 
        rtmId, 
        verdict, 
        inspectorNotesTh, 
        session.fullName || session.username,
        evidenceRef,
        evidenceFileName
      );
      return successResponse(updated, 'บันทึกผลการตรวจรับ Requirement สำเร็จ');
    }

    if (action === 'UPDATE_DIGITAL_CHECKLIST') {
      const { itemId, isVerified, evidenceUrlOrRef, notesTh } = body;
      const updated = updateDigitalChecklistItem(
        id,
        itemId,
        isVerified,
        evidenceUrlOrRef,
        session.fullName || session.username,
        notesTh
      );
      return successResponse(updated, 'บันทึกรายการตรวจรับดิจิทัลสำเร็จ');
    }

    if (action === 'ADD_DEFECT') {
      const { milestoneNo, rtmReqCode, titleTh, descriptionTh, severity, assignedTo, targetResolutionDate } = body;
      const newDefect = addDefectLog(id, {
        milestoneNo: Number(milestoneNo) || ws.activeMilestoneNo,
        rtmReqCode,
        titleTh: titleTh || '',
        descriptionTh: descriptionTh || '',
        severity: severity || 'MEDIUM',
        status: 'OPEN',
        assignedTo: assignedTo || 'ผู้รับจ้าง',
        reportedDate: new Date().toISOString().split('T')[0],
        targetResolutionDate: targetResolutionDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
      });
      return successResponse(newDefect, 'บันทึกรายการข้อบกพร่อง (Defect) สำเร็จ');
    }

    if (action === 'UPDATE_DEFECT_STATUS') {
      const { defectId, status, retestEvidenceUrl } = body;
      const updated = updateDefectStatus(id, defectId, status, retestEvidenceUrl);
      return successResponse(updated, 'ปรับปรุงสถานะข้อบกพร่องสำเร็จ');
    }

    if (action === 'ISSUE_NOTICE_175') {
      const { milestoneNo, defectsSummaryTh } = body;
      const notice = issueNotice175(id, {
        milestoneNo: Number(milestoneNo) || ws.activeMilestoneNo,
        defectsSummaryTh: defectsSummaryTh || 'รายการส่งมอบยังไม่ถูกต้องครบถ้วนตามข้อกำหนด TOR และสัญญา',
        contractorName: ws.contractorName,
        contractNo: ws.contractNumber
      });
      return successResponse(notice, 'ออกหนังสือแจ้งผู้รับจ้างตามระเบียบ ข้อ ๑๗๕ สำเร็จ (กำหนดเวลา ๓ วันทำการ)');
    }

    if (action === 'FINALIZE_ACCEPTANCE') {
      // 1. Run gatekeeper verification
      const gateCheck = validateMilestoneAcceptanceGate({
        milestoneNo: ws.activeMilestoneNo,
        rtmItems: ws.rtmMatrix || [],
        digitalChecklist: ws.digitalChecklist || [],
        defects: ws.defects || []
      });

      if (!gateCheck.canAcceptMilestone) {
        return errorResponse(
          `ไม่สามารถปิดตรวจรับงวดงานได้: ${gateCheck.blockingReasonsTh.join(', ')}`,
          'GATE_CHECK_FAILED',
          400
        );
      }

      // 2. Generate dual-copy certificates
      const signers = (ws.acceptanceCommittee?.members || []).map(m => ({
        fullName: m.fullName,
        position: m.position,
        committeeRole: m.committeeRole === 'CHAIR' ? 'ประธานกรรมการตรวจรับพัสดุ' : m.committeeRole === 'SECRETARY' ? 'กรรมการและเลขานุการ' : 'กรรมการตรวจรับพัสดุ',
        signedAt: new Date().toISOString()
      }));

      if (signers.length === 0) {
        signers.push({
          fullName: session.fullName || session.username,
          position: (session as any).position || 'ประธานกรรมการตรวจรับพัสดุ',
          committeeRole: 'ประธานกรรมการตรวจรับพัสดุ',
          signedAt: new Date().toISOString()
        });
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const milestoneTitle = `งวดที่ ${ws.activeMilestoneNo}`;
      const amount = Math.round((ws.contractValueBaht || 10000000) / (ws.totalMilestones || 3));

      const certificates = createAcceptanceCertificates(id, {
        milestoneNo: ws.activeMilestoneNo,
        milestoneTitleTh: milestoneTitle,
        deliveredDate: todayStr,
        inspectionCompletedDate: todayStr,
        approvedAmountBaht: amount,
        penaltyDays: 0,
        penaltyPerDayBaht: 0,
        signers
      });

      return successResponse({
        certificates,
        message: 'ลงนามตรวจรับพัสดุสำเร็จ สร้างใบสำคัญการตรวจรับ ๒ ฉบับและส่งต่อข้อมูลสู่ระบบการเบิกจ่ายเรียบร้อยแล้ว'
      }, 'ตรวจรับพัสดุสำเร็จ');
    }

    return errorResponse('Invalid action', 'BAD_REQUEST', 400);
  } catch (error: any) {
    console.error('Procurement POST [id]/acceptance error:', error);
    return errorResponse(error.message || 'เกิดข้อผิดพลาดในการตรวจรับพัสดุ', 'SERVER_ERROR', 500);
  }
}
