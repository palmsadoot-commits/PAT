export type DPMPhase = 'UPSTREAM' | 'MIDSTREAM' | 'DOWNSTREAM';

// ----------------------------------------------------
// 1. ต้นน้ำ (UPSTREAM): Inception, Charter & Governance
// ----------------------------------------------------

export interface ProjectTripleConstraints {
  scope: string;       // ขอบเขตงานหลัก
  time: string;        // กรอบระยะเวลา
  cost: number;        // กรอบงบประมาณ
  quality: string;     // มาตรฐานคุณภาพและเกณฑ์ความสำเร็จ
}

export interface ProjectCharter {
  id: string;
  projectId: string;
  projectTitle: string;
  sponsorName: string;          // ผู้สนับสนุนโครงการ (Sponsor)
  sponsorPosition: string;
  projectManagerName: string;   // ผู้จัดการโครงการ (PM)
  projectManagerPosition: string;
  businessCase: string;         // เหตุผลความจำเป็นทางธุรกิจ/ยุทธศาสตร์
  strategicAlignment: string;   // ความสอดคล้องกับแผนยุทธศาสตร์องค์กร/ชาติ
  objectives: string[];         // วัตถุประสงค์เชิงรูปธรรม
  tripleConstraints: ProjectTripleConstraints;
  keyAssumptions: string[];     // ข้อสมมติฐานหลัก
  initialRisks: string[];       // ความเสี่ยงเบื้องต้น
  approvedAt?: string;
  approvedBy?: string;
  status: 'DRAFT' | 'APPROVED';
}

export interface Stakeholder {
  id: string;
  name: string;
  organization: string;
  role: string;                 // e.g. เจ้าของระบบ, ผู้ใช้งานหลัก, ผู้ดูแลระบบ
  influenceLevel: 'HIGH' | 'LOW';
  impactLevel: 'HIGH' | 'LOW';
  strategy: 'MANAGE_CLOSELY' | 'KEEP_SATISFIED' | 'KEEP_INFORMED' | 'MONITOR'; // Grid 4 ช่อง
  contactInfo: string;
}

export interface RACIEntry {
  activityId: string;
  activityName: string;
  stage: 'CHARTER' | 'TOR' | 'PROCUREMENT' | 'DEVELOPMENT' | 'TESTING' | 'ACCEPTANCE' | 'CLOSEOUT';
  responsible: string;   // R: ผู้ลงมือปฏิบัติ
  accountable: string;   // A: ผู้รับผิดชอบสูงสุด/ตัดสินใจ
  consulted: string;     // C: ผู้ให้คำปรึกษา
  informed: string;      // I: ผู้รับทราบข้อมูล
}

export interface DigitalLawCompliance {
  actName: string;       // e.g. พรบ. การบริหารงานและการให้บริการภาครัฐผ่านระบบดิจิทัล พ.ศ. 2562
  status: 'COMPLIANT' | 'IN_PROGRESS' | 'PENDING_REVIEW';
  details: string;
  responsibleTeam: string;
}

// ----------------------------------------------------
// 2. กลางน้ำ (MIDSTREAM): Procurement, RTM, CCB & Risk
// ----------------------------------------------------

export interface ProcurementCommitteeMember {
  role: 'CHAIRMAN' | 'MEMBER' | 'SECRETARY';
  roleNameTh: string; // ประธานกรรมการ, กรรมการ, กรรมการและเลขานุการ
  name: string;
  position: string;
  department: string;
  phone: string;
  internalPhone?: string;
  email: string;
}

export interface ProcurementCommittee {
  id: string;
  type: 'TOR_PRICE' | 'BIDDING_SELECTION' | 'ACCEPTANCE';
  typeNameTh: string; // e.g. คณะกรรมการจัดทำร่างขอบเขตของงานและราคากลาง, คณะกรรมการพิจารณาผล e-Bidding, คณะกรรมการตรวจรับพัสดุ
  orderNumber: string; // เลขที่คำสั่งแต่งตั้ง เช่น คำสั่งกระทรวงแรงงาน ที่ ๔๕/๒๕๖๙
  orderDate: string;
  members: ProcurementCommitteeMember[];
  startDate: string;
  targetEndDate: string;
  actualEndDate?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  delayDays?: number;
}

export interface ProcurementContract {
  contractNo: string;
  contractSignDate: string;
  contractStartDate: string;
  contractEndDate: string;
  approvedBudget: number;       // งบประมาณที่ได้รับอนุมัติ
  medianPrice: number;          // ราคากลาง
  contractValue: number;        // วงเงินตามสัญญา
  savingsAmount: number;        // ประหยัดงบได้ (บาท)
  savingsPercent: number;       // ประหยัดได้ (%)
  procurementMethod: string;    // e.g. ประกวดราคาอิเล็กทรอนิกส์ (e-Bidding), คัดเลือก, เฉพาะเจาะจง
  guaranteePeriodMonths: number;
  // ข้อมูลคู่สัญญา (ผู้รับจ้าง)
  vendorName: string;
  vendorTaxId: string;          // เลขประจำตัวผู้เสียภาษี 13 หลัก
  vendorAddress: string;
  vendorContactPerson: string;  // ผู้ประสานงานโครงการของคู่สัญญา
  vendorPhone: string;
  vendorEmail: string;
  // หลักประกันสัญญา
  guaranteeBank: string;        // ธนาคารผู้ออกหนังสือค้ำประกัน
  guaranteeNo: string;          // เลขที่หนังสือค้ำประกัน
  guaranteeAmount: number;      // จำนวนเงินค้ำประกัน (5% ของสัญญา)
  guaranteeExpiryDate: string;
  // ค่าปรับตามระเบียบพัสดุฯ ข้อ 162
  dailyPenaltyRatePercent: number; // อัตราค่าปรับต่อวัน เช่น 0.1 หรือ 0.2%
  totalOverdueDays: number;     // วันส่งมอบล่าช้าสะสม
  totalPenaltyBaht: number;     // ค่าปรับสะสม (บาท)
  penaltyPercentOfContract: number; // คิดเป็น % ของวงเงินสัญญา
  penaltyThresholdExceeded: boolean; // เกิน 10% หรือไม่
}

export interface RTMItem {
  id: string;
  torRequirementNo: string;     // เลขที่ข้อกำหนดใน TOR
  torRequirementText: string;   // รายละเอียดข้อกำหนด
  category: 'FUNCTIONAL' | 'NON_FUNCTIONAL' | 'SECURITY' | 'DATA';
  useCaseOrProcess: string;     // กระบวนงาน / Use Case ที่ตอบสนอง
  screenId: string;             // รหัสหน้าจอ (Screen ID)
  reportName: string;           // ชื่อรายงานที่เกี่ยวข้อง
  interfaceId: string;          // จุดเชื่อมโยงระบบ (Interface ID)
  testScenarioId: string;       // รหัสกรณีทดสอบ (Test Scenario)
  complianceStatus: 'FULLY_MET' | 'PARTIAL' | 'NOT_MET' | 'IN_DEVELOPMENT';
}

export interface ChangeRequest {
  id: string;
  crNumber: string;             // CR-2026-001
  title: string;
  requesterName: string;
  requestDate: string;
  reason: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impactAnalysis: {
    scheduleImpactDays: number; // ผลกระทบด้านเวลา (+วัน)
    costImpactBaht: number;     // ผลกระทบด้านงบประมาณ (+บาท)
    scopeDescription: string;   // ผลกระทบด้านขอบเขต
    rtmAffectedIds: string[];   // ข้อกำหนด RTM ที่ได้รับผลกระทบ
  };
  ccbDecision: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DEFERRED_TO_BACKLOG';
  ccbReviewDate?: string;
  ccbComments?: string;
}

export interface RiskItem {
  id: string;
  riskCode: string;             // RSK-01
  riskTitle: string;
  category: 'TECHNICAL' | 'MANAGEMENT' | 'SCHEDULE' | 'BUDGET' | 'LEGAL';
  likelihood: number;           // 1 to 5
  impact: number;               // 1 to 5
  riskScore: number;            // likelihood * impact (1-25)
  severityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  mitigationPlan: string;       // มาตรการป้องกัน/ลดความเสี่ยง
  contingencyPlan: string;      // แผนรองรับเมื่อเกิดเหตุ
  riskOwner: string;            // ผู้รับผิดชอบความเสี่ยง
  status: 'OPEN' | 'MONITORING' | 'CLOSED';
}

// ----------------------------------------------------
// 3. ปลายน้ำ (DOWNSTREAM): ATP, UAT, Delivery & Closeout
// ----------------------------------------------------

export interface AcceptanceTestPlan {
  testStrategy: 'WATERFALL' | 'AGILE' | 'HYBRID';
  entryCriteria: string[];      // เงื่อนไขก่อนเริ่มการทดสอบ
  exitCriteria: string[];       // เงื่อนไขก่อนผ่านการทดสอบ
  modules: {
    name: string;
    totalTestCases: number;
    passedTestCases: number;
    failedTestCases: number;
    progressPercent: number;
  }[];
  overallTestCoveragePercent: number;
}

export interface DefectItem {
  id: string;
  defectCode: string;           // DEF-001
  title: string;
  moduleName: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'COSMETIC';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  foundInRound: string;         // e.g. SIT, UAT Round 1, UAT Round 2
  assignedTo: string;
  reportedDate: string;
  resolvedDate?: string;
}

export interface DeliveryMilestone {
  id: string;
  milestoneNo: number;          // งวดที่ 1, 2, 3
  title: string;
  deliverables: string[];       // เอกสารและสิ่งที่ส่งมอบ
  amountBaht: number;           // เงินประจำงวด
  percentageOfContract: number; // สัดส่วน % ของวงเงินตามสัญญา (e.g. 20, 30, 50)
  dueDate: string;
  deliveredDate?: string;
  inspectionDate?: string;
  committeeVerdict: 'PENDING' | 'ACCEPTED' | 'ACCEPTED_WITH_RESERVATION' | 'REJECTED';
  committeeComments?: string;
  paymentStatus: 'PENDING' | 'ACCEPTED' | 'PAID';
  handoverNoteRef?: string;     // เลขที่บันทึกส่งมอบงาน
  isCurrentMilestone?: boolean; // งวดงานปัจจุบันที่กำลังดำเนินการ
  isOverdue?: boolean;          // ล่าช้ากว่ากำหนดตามสัญญา
  overdueDays?: number;         // จำนวนวันล่าช้า
  penaltyAmountBaht?: number;   // ค่าปรับงวดนี้ (บาท)
}

export interface ProjectCloseout {
  closeoutDate: string;
  kpiResults: {
    kpiName: string;
    targetValue: string;
    actualAchieved: string;
    status: 'EXCEEDED' | 'ACHIEVED' | 'PARTIALLY_ACHIEVED' | 'FAILED';
  }[];
  valueRealizationSummary: string; // การประเมินความคุ้มค่าและผลประโยชน์ที่ได้รับ
  lessonsLearned: {
    category: 'PROCESS' | 'TECHNOLOGY' | 'PEOPLE' | 'COMMUNICATION';
    positiveFindings: string;
    challengesAndSolutions: string;
    recommendationsForNextProject: string;
  }[];
  finalHandoverCertified: boolean;
  warrantyExpirationDate: string;
}

// ----------------------------------------------------
// Consolidated Project DPM Lifecycle Bundle
// ----------------------------------------------------

export interface ProjectDPMLifecycle {
  projectId: string;
  currentPhase: DPMPhase;
  phaseProgress: {
    upstream: number;   // 0 - 100%
    midstream: number;  // 0 - 100%
    downstream: number; // 0 - 100%
  };
  // Upstream
  charter?: ProjectCharter;
  stakeholders: Stakeholder[];
  raciMatrix: RACIEntry[];
  compliance: DigitalLawCompliance[];
  // Midstream & Procurement Act B.E. 2560
  committees?: ProcurementCommittee[];
  contract?: ProcurementContract;
  rtm: RTMItem[];
  changeRequests: ChangeRequest[];
  risks: RiskItem[];
  // Downstream
  atp?: AcceptanceTestPlan;
  defects: DefectItem[];
  milestones: DeliveryMilestone[];
  closeout?: ProjectCloseout;
}
