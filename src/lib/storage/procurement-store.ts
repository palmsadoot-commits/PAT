// ============================================================================
// Procurement Store: Persistence & Governance Controller
// ============================================================================

import fs from 'fs';
import path from 'path';
import { 
  ProcurementGovernanceWorkspace, 
  RtmVerdict,
  PriceSurveyItem,
  DefectLogItem,
  AcceptanceNotice175,
  AcceptanceCertificate,
  SLAPauseRecord
} from '@/types/procurement';
import { calculateRule175Deadline, generateDualAcceptanceCertificates } from '@/lib/procurement/acceptance-gate-validator';
import { calculateMedianPriceStats } from '@/lib/procurement/median-price-calculator';
import { lintTorText } from '@/lib/procurement/tor-linter';

const DATA_FILE = path.join(process.cwd(), 'data', 'procurement-data.json');

function readRawData(): Record<string, ProcurementGovernanceWorkspace> {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return {};
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading procurement-data.json:', error);
    return {};
  }
}

function writeRawData(data: Record<string, ProcurementGovernanceWorkspace>) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing procurement-data.json:', error);
  }
}

export function getAllProcurementWorkspaces(): ProcurementGovernanceWorkspace[] {
  const map = readRawData();
  return Object.values(map);
}

export function getProcurementWorkspace(projectId: string): ProcurementGovernanceWorkspace | null {
  const map = readRawData();
  return map[projectId] || null;
}

export function updateProcurementWorkspace(
  projectId: string, 
  patch: Partial<ProcurementGovernanceWorkspace>
): ProcurementGovernanceWorkspace {
  const map = readRawData();
  const current = map[projectId];
  if (!current) {
    throw new Error(`ไม่พบข้อมูลการจัดซื้อจัดจ้างสำหรับโครงการ ${projectId}`);
  }

  const updated: ProcurementGovernanceWorkspace = {
    ...current,
    ...patch
  };

  map[projectId] = updated;
  writeRawData(map);
  return updated;
}

export function updateRtmVerdict(
  projectId: string, 
  rtmId: string, 
  verdict: RtmVerdict, 
  inspectorNotesTh?: string,
  reviewedBy?: string,
  evidenceRef?: string,
  evidenceFileName?: string
) {
  const ws = getProcurementWorkspace(projectId);
  if (!ws) throw new Error(`ไม่พบโครงการ ${projectId}`);

  const itemIndex = ws.rtmMatrix.findIndex(r => r.id === rtmId);
  if (itemIndex === -1) throw new Error(`ไม่พบ RTM ID ${rtmId}`);

  ws.rtmMatrix[itemIndex] = {
    ...ws.rtmMatrix[itemIndex],
    verdict,
    testResult: verdict === 'PASS' ? 'PASS' : verdict === 'FAIL' ? 'FAIL' : ws.rtmMatrix[itemIndex].testResult,
    inspectorNotesTh: inspectorNotesTh ?? ws.rtmMatrix[itemIndex].inspectorNotesTh,
    reviewedBy: reviewedBy ?? ws.rtmMatrix[itemIndex].reviewedBy,
    reviewedAt: new Date().toISOString(),
    evidenceRef: evidenceRef ?? ws.rtmMatrix[itemIndex].evidenceRef,
    evidenceFileName: evidenceFileName ?? ws.rtmMatrix[itemIndex].evidenceFileName
  };

  updateProcurementWorkspace(projectId, { rtmMatrix: ws.rtmMatrix });
  return ws.rtmMatrix[itemIndex];
}

export function updateDigitalChecklistItem(
  projectId: string,
  itemId: string,
  isVerified: boolean,
  evidenceUrlOrRef?: string,
  verifiedBy?: string,
  notesTh?: string
) {
  const ws = getProcurementWorkspace(projectId);
  if (!ws) throw new Error(`ไม่พบโครงการ ${projectId}`);

  const idx = ws.digitalChecklist.findIndex(d => d.id === itemId);
  if (idx === -1) throw new Error(`ไม่พบ Checklist Item ID ${itemId}`);

  ws.digitalChecklist[idx] = {
    ...ws.digitalChecklist[idx],
    isVerified,
    evidenceUrlOrRef: evidenceUrlOrRef ?? ws.digitalChecklist[idx].evidenceUrlOrRef,
    verifiedBy: verifiedBy ?? ws.digitalChecklist[idx].verifiedBy,
    verifiedAt: new Date().toISOString(),
    notesTh: notesTh ?? ws.digitalChecklist[idx].notesTh
  };

  updateProcurementWorkspace(projectId, { digitalChecklist: ws.digitalChecklist });
  return ws.digitalChecklist[idx];
}

export function addPriceSurveyItem(
  projectId: string, 
  item: Omit<PriceSurveyItem, 'id'>
): PriceSurveyItem {
  const ws = getProcurementWorkspace(projectId);
  if (!ws) throw new Error(`ไม่พบโครงการ ${projectId}`);
  if (!ws.medianPricePackage) throw new Error(`ยังไม่มี Package ราคากลางสำหรับโครงการนี้`);

  const newItem: PriceSurveyItem = {
    ...item,
    id: `SRV-${Date.now()}`
  };

  const updatedSurveys = [...ws.medianPricePackage.surveys, newItem];
  const stats = calculateMedianPriceStats(updatedSurveys);

  const updatedPackage = {
    ...ws.medianPricePackage,
    surveys: updatedSurveys,
    minSurveyedBaht: stats.minPrice,
    maxSurveyedBaht: stats.maxPrice,
    medianSurveyedBaht: stats.medianPrice,
    medianPriceBaht: stats.medianPrice,
    calculationMethodTh: stats.calculationMethodUsed
  };

  updateProcurementWorkspace(projectId, { medianPricePackage: updatedPackage });
  return newItem;
}

export function addDefectLog(
  projectId: string,
  defect: Omit<DefectLogItem, 'id' | 'defectCode'>
): DefectLogItem {
  const ws = getProcurementWorkspace(projectId);
  if (!ws) throw new Error(`ไม่พบโครงการ ${projectId}`);

  const count = ws.defects.length + 1;
  const newDefect: DefectLogItem = {
    ...defect,
    id: `DEF-${Date.now()}`,
    defectCode: `DEF-${ws.projectNo || ws.projectId}-${count.toString().padStart(3, '0')}`
  };

  const updatedDefects = [newDefect, ...ws.defects];
  updateProcurementWorkspace(projectId, { defects: updatedDefects });
  return newDefect;
}

export function updateDefectStatus(
  projectId: string,
  defectId: string,
  status: DefectLogItem['status'],
  retestEvidenceUrl?: string
) {
  const ws = getProcurementWorkspace(projectId);
  if (!ws) throw new Error(`ไม่พบโครงการ ${projectId}`);

  const idx = ws.defects.findIndex(d => d.id === defectId);
  if (idx === -1) throw new Error(`ไม่พบ Defect ID ${defectId}`);

  ws.defects[idx] = {
    ...ws.defects[idx],
    status,
    resolvedDate: (status === 'RESOLVED' || status === 'CLOSED') ? new Date().toISOString().split('T')[0] : ws.defects[idx].resolvedDate,
    retestEvidenceUrl: retestEvidenceUrl ?? ws.defects[idx].retestEvidenceUrl
  };

  updateProcurementWorkspace(projectId, { defects: ws.defects });
  return ws.defects[idx];
}

export function issueNotice175(
  projectId: string,
  params: {
    milestoneNo: number;
    defectsSummaryTh: string;
    contractorName?: string;
    contractNo?: string;
  }
): AcceptanceNotice175 {
  const ws = getProcurementWorkspace(projectId);
  if (!ws) throw new Error(`ไม่พบโครงการ ${projectId}`);

  const todayStr = new Date().toISOString().split('T')[0];
  const deadlineInfo = calculateRule175Deadline(todayStr);

  const newNotice: AcceptanceNotice175 = {
    id: `NOT175-${Date.now()}`,
    noticeNo: `รง ๐๒๐๑/ว ${Math.floor(100 + Math.random() * 900)}`,
    issueDate: todayStr,
    slaDeadlineDate: deadlineInfo.deadlineDate,
    isWithinSLA: true,
    contractorName: params.contractorName || ws.contractorName || 'คู่สัญญา',
    contractNo: params.contractNo || ws.contractNumber || 'สัญญาจ้าง',
    milestoneNo: params.milestoneNo,
    defectsSummaryTh: params.defectsSummaryTh,
    formalLetterUrl: `/docs/procurement/notice175-${Date.now()}.pdf`,
    status: 'SENT'
  };

  const updatedNotices = [newNotice, ...ws.notices175];
  updateProcurementWorkspace(projectId, { notices175: updatedNotices });
  return newNotice;
}

export function createAcceptanceCertificates(
  projectId: string,
  params: {
    milestoneNo: number;
    milestoneTitleTh: string;
    deliveredDate: string;
    inspectionCompletedDate: string;
    approvedAmountBaht: number;
    penaltyDays?: number;
    penaltyPerDayBaht?: number;
    signers: { fullName: string; position: string; committeeRole: string; signedAt: string }[];
    isPartialAcceptance?: boolean;
    partialAcceptanceReasonTh?: string;
  }
) {
  const ws = getProcurementWorkspace(projectId);
  if (!ws) throw new Error(`ไม่พบโครงการ ${projectId}`);

  const certNumber = `บร.${ws.activeMilestoneNo.toString().padStart(2, '0')}/๒๕๖๙`;

  const { financeCopy, contractorCopy } = generateDualAcceptanceCertificates({
    certificateNo: certNumber,
    contractNo: ws.contractNumber || 'สัญญาเลขที่ รง. ๑๔/๒๕๖๙',
    projectNameTh: ws.projectNameTh,
    contractorName: ws.contractorName || 'บริษัท ดิจิทัล โซลูชั่นส์ อินโนเวชั่น จำกัด (มหาชน)',
    milestoneNo: params.milestoneNo,
    milestoneTitleTh: params.milestoneTitleTh,
    deliveredDate: params.deliveredDate,
    inspectionCompletedDate: params.inspectionCompletedDate,
    approvedAmountBaht: params.approvedAmountBaht,
    penaltyDays: params.penaltyDays || 0,
    penaltyPerDayBaht: params.penaltyPerDayBaht || 0,
    signers: params.signers,
    isPartialAcceptance: params.isPartialAcceptance,
    partialAcceptanceReasonTh: params.partialAcceptanceReasonTh
  });

  const updatedCertificates = [...ws.certificates, financeCopy, contractorCopy];
  
  // Update phase to DISBURSED if last milestone
  const nextMilestone = Math.min(ws.totalMilestones, ws.activeMilestoneNo + 1);
  const nextPhase = ws.activeMilestoneNo === ws.totalMilestones ? 'DISBURSED' : 'DELIVERY_ACCEPTANCE';

  updateProcurementWorkspace(projectId, {
    certificates: updatedCertificates,
    activeMilestoneNo: nextMilestone,
    currentPhase: nextPhase
  });

  return { financeCopy, contractorCopy };
}

export function toggleSlaPause(
  projectId: string,
  params: {
    committeeType: 'TOR_PRICE' | 'EVALUATION' | 'ACCEPTANCE';
    milestoneId?: string;
    pauseReason: string;
    documentRef: string;
    authorizedBy: string;
    authorizedPosition: string;
    action: 'PAUSE' | 'RESUME';
  }
): SLAPauseRecord {
  const ws = getProcurementWorkspace(projectId);
  if (!ws) throw new Error(`ไม่พบโครงการ ${projectId}`);

  const nowISO = new Date().toISOString();

  if (params.action === 'PAUSE') {
    const newPause: SLAPauseRecord = {
      id: `PAUSE-${Date.now()}`,
      committeeType: params.committeeType,
      milestoneId: params.milestoneId,
      pausedAt: nowISO,
      resumedAt: null,
      pauseReason: params.pauseReason,
      documentRef: params.documentRef,
      authorizedBy: params.authorizedBy,
      authorizedPosition: params.authorizedPosition,
      status: 'ACTIVE'
    };
    const updated = [newPause, ...ws.slaPauses];
    updateProcurementWorkspace(projectId, { slaPauses: updated });
    return newPause;
  } else {
    // RESUME
    const activePauseIdx = ws.slaPauses.findIndex(p => p.committeeType === params.committeeType && p.status === 'ACTIVE');
    if (activePauseIdx === -1) throw new Error('ไม่พบรายการที่กำลังหยุดเวลา (SLA Pause)');

    ws.slaPauses[activePauseIdx] = {
      ...ws.slaPauses[activePauseIdx],
      resumedAt: nowISO,
      status: 'RESUMED'
    };
    updateProcurementWorkspace(projectId, { slaPauses: ws.slaPauses });
    return ws.slaPauses[activePauseIdx];
  }
}
