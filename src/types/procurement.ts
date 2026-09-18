// ============================================================================
// Procurement Governance & Acceptance Workspace Types
// พระราชบัญญัติการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. ๒๕๖๐
// และระเบียบกระทรวงการคลังว่าด้วยการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. ๒๕๖๐
// ============================================================================

export type RuleCategory = 'STATUTORY' | 'AGENCY_SLA' | 'CONTRACT';

export interface GovernanceRuleConfig {
  id: string;
  category: RuleCategory;
  nameTh: string;
  legalReference: string; // e.g. "ระเบียบกระทรวงการคลังฯ พ.ศ. ๒๕๖๐ ข้อ ๒๕"
  durationDays: number;
  isBusinessDays: boolean;
  canBeEditedByOrder: boolean;
  lastReviewedDate: string;
  notesTh: string;
}

export interface SLAPauseRecord {
  id: string;
  committeeType: 'TOR_PRICE' | 'EVALUATION' | 'ACCEPTANCE';
  milestoneId?: string;
  pausedAt: string;
  resumedAt?: string | null;
  pauseReason: string;
  documentRef: string;
  authorizedBy: string;
  authorizedPosition: string;
  status: 'ACTIVE' | 'RESUMED' | 'CANCELLED';
}

// ─────────────────────────────────────────────────────────────
// COMMITTEE STRUCTURE & APPOINTMENTS (ข้อ ๒๑, ๒๕, ๒๖)
// ─────────────────────────────────────────────────────────────
export type CommitteeType = 'TOR_PRICE' | 'EVALUATION' | 'ACCEPTANCE';
export type CommitteeRole = 'CHAIR' | 'MEMBER' | 'SECRETARY' | 'ASSISTANT_SECRETARY';

export interface CommitteeMember {
  id: string;
  userId?: string;
  fullName: string;
  position: string;
  department: string;
  committeeRole: CommitteeRole;
  appointedDate: string;
  conflictDeclared: boolean;
  conflictDeclaredAt?: string;
  conflictDeclarationDetails?: string;
  isExternalExpert?: boolean;
}

export interface CommitteeAppointment {
  id: string;
  projectId: string;
  committeeType: CommitteeType;
  orderNumber: string; // e.g. "คำสั่งกระทรวงแรงงาน ที่ ๑๒๔/๒๕๖๙"
  orderDate: string;
  startDate: string;
  targetEndDate: string;
  allowedDays: number;
  isBusinessDays: boolean;
  headOfAgencyApproval: boolean;
  approvedBy: string;
  approvedPosition: string;
  members: CommitteeMember[];
  attachments: {
    name: string;
    url: string;
    uploadedAt: string;
  }[];
}

// ─────────────────────────────────────────────────────────────
// MODULE A: TOR & MEDIAN PRICE (ข้อ ๒๑, ๒๕, ๔๕-๔๖)
// ─────────────────────────────────────────────────────────────
export type TorSectionKey = 
  | 'OBJECTIVES' 
  | 'SCOPE_DELIVERABLES' 
  | 'SPECS_STANDARDS_SECURITY' 
  | 'EVALUATION_CRITERIA' 
  | 'MILESTONES_PAYMENT_ACCEPTANCE' 
  | 'TRAINING_IP_SOURCECODE' 
  | 'WARRANTY_DEFECT_PENALTY';

export interface AmbiguityWarning {
  keyword: string;
  contextSnippet: string;
  suggestedMeasurementTh: string;
  severity: 'WARNING' | 'CRITICAL';
}

export interface TorRequirementItem {
  id: string;
  reqCode: string; // e.g. "TOR-REQ-1.1"
  section: TorSectionKey;
  titleTh: string;
  specificationTh: string;
  acceptanceCriteriaTh: string;
  testMethod: 'INSPECTION' | 'DEMO' | 'AUTOMATED_TEST' | 'AUDIT_LOG' | 'SECURITY_SCAN' | 'CODE_REVIEW' | 'UAT';
  evidenceRequiredTh: string;
  responsibleRole: string;
  passFailThresholdTh: string;
  ambiguityWarnings?: AmbiguityWarning[];
  createdAt: string;
  updatedAt: string;
}

export interface TorSpecification {
  id: string;
  projectId: string;
  version: number;
  status: 'DRAFT' | 'LINTER_REVIEW' | 'APPROVED' | 'PUBLIC_HEARING';
  approvedAt?: string;
  approvedBy?: string;
  publicHearingStartDate?: string;
  publicHearingEndDate?: string;
  publicHearingFeedbackCount?: number;
  sections: {
    key: TorSectionKey;
    titleTh: string;
    items: TorRequirementItem[];
  }[];
}

export type PriceSourceType = 'CATALOGUE' | 'HISTORICAL_CONTRACT' | 'MARKET_SURVEY' | 'COST_ESTIMATE' | 'LIMITED_SOURCE';
export type SpecEquivalenceLevel = 'IDENTICAL' | 'EQUIVALENT' | 'SUPERIOR' | 'INFERIOR';

export interface PriceSurveyItem {
  id: string;
  sourceName: string;
  sourceType: PriceSourceType;
  documentRefOrUrl: string;
  surveyDate: string;
  surveyorName: string;
  surveyorPosition: string;
  quotedPriceBaht: number;
  specEquivalence: SpecEquivalenceLevel;
  specComparisonNotesTh: string;
  isExcludedAsOutlier: boolean;
  outlierExclusionReasonTh?: string;
}

export interface MedianPriceEvidencePackage {
  id: string;
  projectId: string;
  medianPriceBaht: number;
  calculationMethodTh: string;
  minSurveyedBaht: number;
  maxSurveyedBaht: number;
  medianSurveyedBaht: number;
  surveys: PriceSurveyItem[];
  certifiedBy: string;
  certifiedPosition: string;
  certifiedDate: string;
  announcementDate: string;
  disclosureFormBk01Url?: string; // แบบฟอร์มเปิดเผยราคากลาง บก.๐๑
}

// ─────────────────────────────────────────────────────────────
// MODULE B: EVALUATION COMMITTEE (ข้อ ๕๕)
// ─────────────────────────────────────────────────────────────
export type ProcurementMethod = 'E_BIDDING' | 'E_MARKET' | 'SELECTION' | 'SPECIFIC';

export interface BidderChecklistItem {
  criterionId: string;
  titleTh: string;
  descriptionTh: string;
  isPassed: boolean;
  notesTh?: string;
  evidenceDocRef?: string;
}

export interface BidderEvaluationRecord {
  id: string;
  bidderTaxId: string;
  bidderNameTh: string;
  submittedAt: string;
  quotedPriceBaht: number;
  // Checklist: คุณสมบัติ & ความขัดแย้ง/สมยอมราคา
  qualificationChecks: BidderChecklistItem[];
  collusionChecks: BidderChecklistItem[];
  technicalScore: number; // Max 100
  priceScore: number;
  totalCombinedScore: number;
  isDisqualified: boolean;
  disqualificationReasonTh?: string;
  factInquirySummaryTh?: string;
}

export interface EvaluationResolution {
  id: string;
  projectId: string;
  procurementMethod: ProcurementMethod;
  meetingDate: string;
  meetingNo: string;
  slaDaysAllowed: number;
  actualDaysUsed: number;
  isWithinSLA: boolean;
  bidders: BidderEvaluationRecord[];
  winningBidderName: string;
  awardedPriceBaht: number;
  dissentingOpinions: {
    memberFullName: string;
    position: string;
    opinionTh: string;
  }[];
  meetingMinutesText: string;
  recommendationReportText: string;
  signedByMembers: string[];
  headOfAgencyVerdict?: 'APPROVED' | 'RETURNED' | 'REJECTED';
  headOfAgencyVerdictAt?: string;
  roleConflictCheckPassed: boolean; // Verification that no member is on Acceptance Committee
}

// ─────────────────────────────────────────────────────────────
// MODULE C: ACCEPTANCE WORKSPACE & RTM (ข้อ ๑๗๕, ๑๗๖)
// ─────────────────────────────────────────────────────────────
export type RtmVerdict = 'NOT_STARTED' | 'PENDING_EVIDENCE' | 'PASS' | 'PASS_CONDITIONAL' | 'FAIL' | 'WAIVED';
export type DefectSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface RtmTraceabilityItem {
  id: string;
  torReqCode: string;
  contractClause: string;
  milestoneNo: number;
  milestoneTitleTh: string;
  requirementTitleTh: string;
  acceptanceCriteriaTh: string;
  testCaseId: string;
  testCaseTitleTh: string;
  testResult: 'PASS' | 'FAIL' | 'BLOCKED' | 'NOT_RUN';
  evidenceType: string;
  evidenceRef: string;
  evidenceFileName?: string;
  evidenceUrl?: string;
  verdict: RtmVerdict;
  inspectorNotesTh?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface DigitalDeepDiveItem {
  id: string;
  category: 
    | 'FUNCTIONAL' 
    | 'NON_FUNCTIONAL' 
    | 'DATA_MIGRATION' 
    | 'SECURITY' 
    | 'INTEGRATION' 
    | 'UAT' 
    | 'OPERATIONAL_READINESS' 
    | 'SOURCE_CODE_CONFIG' 
    | 'WARRANTY_SLA';
  titleTh: string;
  specificationTh: string;
  evidenceRequiredTh: string;
  isVerified: boolean;
  evidenceUrlOrRef?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  notesTh?: string;
}

export interface DefectLogItem {
  id: string;
  defectCode: string; // e.g. "DEF-2569-001"
  milestoneNo: number;
  rtmReqCode?: string;
  titleTh: string;
  descriptionTh: string;
  severity: DefectSeverity;
  status: 'OPEN' | 'IN_PROGRESS' | 'RETEST_REQUESTED' | 'RESOLVED' | 'CLOSED';
  assignedTo: string;
  reportedDate: string;
  targetResolutionDate: string;
  resolvedDate?: string;
  retestEvidenceUrl?: string;
}

export interface AcceptanceNotice175 {
  id: string;
  noticeNo: string; // e.g. "รง ๐๒๐๑/ว ๑๔๕"
  issueDate: string;
  slaDeadlineDate: string; // within 3 business days
  isWithinSLA: boolean;
  contractorName: string;
  contractNo: string;
  milestoneNo: number;
  defectsSummaryTh: string;
  formalLetterUrl?: string;
  status: 'SENT' | 'ACKNOWLEDGED_BY_CONTRACTOR' | 'RECTIFIED' | 'OVERDUE';
}

export interface AcceptanceCertificate {
  id: string;
  certificateNo: string; // e.g. "บร.๐๑/๒๕๖๙"
  issueDate: string;
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
  totalPenaltyBaht: number;
  netPayableBaht: number;
  isPartialAcceptance: boolean;
  partialAcceptanceReasonTh?: string;
  signers: {
    fullName: string;
    position: string;
    committeeRole: string;
    signedAt: string;
  }[];
  copyType: 'FINANCE_DISBURSEMENT' | 'CONTRACTOR_COPY';
  disbursementPayloadPrepared: boolean;
}

// ─────────────────────────────────────────────────────────────
// AGGREGATE WORKSPACE OBJECT
// ─────────────────────────────────────────────────────────────
export interface ProcurementGovernanceWorkspace {
  projectId: string;
  projectNo: string;
  projectNameTh: string;
  fiscalYear: number;
  budgetBaht: number;
  procurementMethod: ProcurementMethod;
  currentPhase: 'TOR_PRICE' | 'EVALUATION' | 'CONTRACT' | 'DELIVERY_ACCEPTANCE' | 'DISBURSED';
  contractNumber?: string;
  contractSignedDate?: string;
  contractValueBaht?: number;
  contractorName?: string;
  activeMilestoneNo: number;
  totalMilestones: number;
  
  rules: GovernanceRuleConfig[];
  slaPauses: SLAPauseRecord[];
  
  // 3 Committees
  torPriceCommittee?: CommitteeAppointment;
  evaluationCommittee?: CommitteeAppointment;
  acceptanceCommittee?: CommitteeAppointment;

  // Artifacts
  torSpecification?: TorSpecification;
  medianPricePackage?: MedianPriceEvidencePackage;
  evaluationResolution?: EvaluationResolution;
  
  // Acceptance & Traceability
  rtmMatrix: RtmTraceabilityItem[];
  digitalChecklist: DigitalDeepDiveItem[];
  defects: DefectLogItem[];
  notices175: AcceptanceNotice175[];
  certificates: AcceptanceCertificate[];
}
