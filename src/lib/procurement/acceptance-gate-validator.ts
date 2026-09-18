// ============================================================================
// Acceptance Gatekeeper & Rule 175 / 176 Validator
// ตรวจสอบเงื่อนไขความพร้อมในการตรวจรับพัสดุ และควบคุมกรอบเวลาแจ้งข้อบกพร่องตามข้อ ๑๗๕
// ============================================================================

import { 
  RtmTraceabilityItem, 
  DigitalDeepDiveItem, 
  DefectLogItem, 
  AcceptanceCertificate,
  AcceptanceNotice175 
} from '@/types/procurement';

export interface MilestoneAcceptanceGateResult {
  canAcceptMilestone: boolean;
  blockingReasonsTh: string[];
  warningReasonsTh: string[];
  unverifiedRtmCount: number;
  criticalDefectCount: number;
  unverifiedDigitalItemsCount: number;
  totalRtmCount: number;
  passedRtmCount: number;
  passPercentage: number;
}

/**
 * ตรวจสอบความพร้อมในการปิดตรวจรับงวดงาน (Gatekeeper)
 */
export function validateMilestoneAcceptanceGate(params: {
  milestoneNo: number;
  rtmItems: RtmTraceabilityItem[];
  digitalChecklist: DigitalDeepDiveItem[];
  defects: DefectLogItem[];
  hasPendingChangeOrders?: boolean;
}): MilestoneAcceptanceGateResult {
  const { milestoneNo, rtmItems, digitalChecklist, defects, hasPendingChangeOrders } = params;

  const blockingReasonsTh: string[] = [];
  const warningReasonsTh: string[] = [];

  // 1. ตรวจสอบ RTM ประจำงวด
  const milestoneRtm = rtmItems.filter(r => r.milestoneNo === milestoneNo);
  const totalRtmCount = milestoneRtm.length;
  const passedRtm = milestoneRtm.filter(r => r.verdict === 'PASS' || r.verdict === 'WAIVED');
  const passedRtmCount = passedRtm.length;
  const passPercentage = totalRtmCount > 0 ? Math.round((passedRtmCount / totalRtmCount) * 100) : 100;

  // รายการที่ยังไม่มีหลักฐาน หรือสถานะยังไม่ผ่าน
  const unverifiedRtm = milestoneRtm.filter(r => 
    r.verdict === 'NOT_STARTED' || 
    r.verdict === 'PENDING_EVIDENCE' || 
    r.verdict === 'FAIL' ||
    !r.evidenceRef || 
    r.evidenceRef.trim() === ''
  );
  const unverifiedRtmCount = unverifiedRtm.length;

  if (unverifiedRtmCount > 0) {
    blockingReasonsTh.push(`มีข้อกำหนด TOR ประจำงวด ${unverifiedRtmCount} รายการ ที่ยังไม่มีหลักฐานเชิงประจักษ์ หรือผลทดสอบยังไม่ผ่านเกณฑ์`);
  }

  // 2. ตรวจสอบ Defect ที่มีความรุนแรงระดับ CRITICAL หรือ HIGH คงค้าง
  const activeMilestoneDefects = defects.filter(d => 
    d.milestoneNo === milestoneNo && 
    (d.status === 'OPEN' || d.status === 'IN_PROGRESS' || d.status === 'RETEST_REQUESTED')
  );

  const criticalDefects = activeMilestoneDefects.filter(d => d.severity === 'CRITICAL');
  const highDefects = activeMilestoneDefects.filter(d => d.severity === 'HIGH');
  const criticalDefectCount = criticalDefects.length + highDefects.length;

  if (criticalDefects.length > 0) {
    blockingReasonsTh.push(`พบข้อบกพร่องระดับวิกฤต (Critical Defect) ตกค้าง ${criticalDefects.length} รายการ ห้ามปิดตรวจรับจนกว่าจะได้รับการแก้ไขและทดสอบซ้ำผ่าน 100%`);
  }
  if (highDefects.length > 0) {
    blockingReasonsTh.push(`พบข้อบกพร่องระดับสูง (High Defect) ตกค้าง ${highDefects.length} รายการ ต้องได้รับการแก้ไขหรือได้รับอนุมัติผ่อนผันอย่างเป็นลายลักษณ์อักษร`);
  }

  // 3. ตรวจสอบ Change Orders ที่ยังไม่อนุมัติ
  if (hasPendingChangeOrders) {
    blockingReasonsTh.push('มีคำขอเปลี่ยนแปลงข้อกำหนดหรือสัญญา (Change Order) ที่ยังรอการอนุมัติ ห้ามลงนามตรวจรับจนกว่าจะปรับปรุงสัญญาให้เรียบร้อย');
  }

  // 4. ตรวจสอบ Digital Checklist ๙ มิติ
  const unverifiedDigital = digitalChecklist.filter(item => !item.isVerified);
  const unverifiedDigitalItemsCount = unverifiedDigital.length;
  if (unverifiedDigitalItemsCount > 0) {
    warningReasonsTh.push(`มีรายการตรวจรับระบบดิจิทัลเชิงลึกที่ยังไม่ได้บันทึกรับรอง ${unverifiedDigitalItemsCount} รายการ`);
  }

  const canAcceptMilestone = blockingReasonsTh.length === 0;

  return {
    canAcceptMilestone,
    blockingReasonsTh,
    warningReasonsTh,
    unverifiedRtmCount,
    criticalDefectCount,
    unverifiedDigitalItemsCount,
    totalRtmCount,
    passedRtmCount,
    passPercentage
  };
}

/**
 * คำนวณกำหนดวันแจ้งผู้รับจ้างแก้ไขภายใน ๓ วันทำการ ตามระเบียบข้อ ๑๗๕
 */
export function calculateRule175Deadline(inspectionDate: string): {
  issueDate: string;
  deadlineDate: string;
  daysRemaining: number;
  isOverdue: boolean;
  legalTextTh: string;
} {
  const base = new Date(inspectionDate);
  // คำนวณ ๓ วันทำการ (ข้ามเสาร์-อาทิตย์)
  let addedDays = 0;
  const current = new Date(base);

  while (addedDays < 3) {
    current.setDate(current.getDate() + 1);
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
      addedDays++;
    }
  }

  const deadlineDateStr = current.toISOString().split('T')[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);

  const diffTime = current.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0;

  return {
    issueDate: inspectionDate,
    deadlineDate: deadlineDateStr,
    daysRemaining,
    isOverdue,
    legalTextTh: 'ตามระเบียบกระทรวงการคลังฯ พ.ศ. ๒๕๖๐ ข้อ ๑๗๕ วรรคสาม: กรณีที่ตรวจพบว่าการส่งมอบไม่ถูกต้องหรือไม่ครบถ้วน ให้ทำหนังสือแจ้งผู้รับจ้างภายใน ๓ วันทำการนับถัดจากวันตรวจพบ'
  };
}

/**
 * สร้างข้อมูลใบรับรองผลการปฏิบัติงาน / ใบตรวจรับพัสดุ (๒ ฉบับ ตามระเบียบ)
 * ฉบับที่ ๑: สำหรับส่งฝ่ายการเงินเพื่อขออนุมัติเบิกจ่าย
 * ฉบับที่ ๒: สำหรับมอบให้แก่คู่สัญญา / ผู้รับจ้าง
 */
export function generateDualAcceptanceCertificates(params: {
  certificateNo: string;
  contractNo: string;
  projectNameTh: string;
  contractorName: string;
  milestoneNo: number;
  milestoneTitleTh: string;
  deliveredDate: string;
  inspectionCompletedDate: string;
  approvedAmountBaht: number;
  penaltyDays: number;
  penaltyPerDayBaht: number;
  signers: { fullName: string; position: string; committeeRole: string; signedAt: string }[];
  isPartialAcceptance?: boolean;
  partialAcceptanceReasonTh?: string;
}): { financeCopy: AcceptanceCertificate; contractorCopy: AcceptanceCertificate } {
  const totalPenaltyBaht = params.penaltyDays * params.penaltyPerDayBaht;
  const netPayableBaht = Math.max(0, params.approvedAmountBaht - totalPenaltyBaht);

  const baseCertificate: Omit<AcceptanceCertificate, 'id' | 'copyType'> = {
    certificateNo: params.certificateNo,
    issueDate: params.inspectionCompletedDate,
    contractNo: params.contractNo,
    projectNameTh: params.projectNameTh,
    contractorName: params.contractorName,
    milestoneNo: params.milestoneNo,
    milestoneTitleTh: params.milestoneTitleTh,
    deliveredDate: params.deliveredDate,
    inspectionCompletedDate: params.inspectionCompletedDate,
    approvedAmountBaht: params.approvedAmountBaht,
    penaltyDays: params.penaltyDays,
    penaltyPerDayBaht: params.penaltyPerDayBaht,
    totalPenaltyBaht,
    netPayableBaht,
    isPartialAcceptance: !!params.isPartialAcceptance,
    partialAcceptanceReasonTh: params.partialAcceptanceReasonTh,
    signers: params.signers,
    disbursementPayloadPrepared: true
  };

  const financeCopy: AcceptanceCertificate = {
    ...baseCertificate,
    id: `CERT-${params.certificateNo}-FINANCE`,
    copyType: 'FINANCE_DISBURSEMENT'
  };

  const contractorCopy: AcceptanceCertificate = {
    ...baseCertificate,
    id: `CERT-${params.certificateNo}-CONTRACTOR`,
    copyType: 'CONTRACTOR_COPY'
  };

  return { financeCopy, contractorCopy };
}
