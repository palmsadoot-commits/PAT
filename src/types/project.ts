export type ProjectStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'DOCUMENT_CHECK' 
  | 'UNDER_REVIEW' 
  | 'RETURNED' 
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type ProjectType = 
  | 'DIGITAL' 
  | 'INFRASTRUCTURE' 
  | 'RESEARCH' 
  | 'TRAINING' 
  | 'SERVICE' 
  | 'OTHER';

export type ProjectPriority = 
  | 'HIGH' 
  | 'MEDIUM' 
  | 'LOW';

export interface AssignedOfficerInfo {
  id: string;
  fullName: string;
  position: string;
  department: string;
  organization: string;
  phone: string;
  internalPhone: string;
  email: string;
  lineId?: string;
  assignedAt: string;
  slaDueDate: string;
  slaDaysAllowed: number;
  daysPending: number;
  isOverdue: boolean;
  overdueDays?: number;
  currentStep: string;
  currentStepNameTh: string;
}

export interface OwnerContactInfo {
  fullName: string;
  position: string;
  department: string;
  organization: string;
  phone: string;
  internalPhone: string;
  email: string;
  lineId?: string;
}

export interface Project {
  id: string;
  projectNo: string;
  projectName: string;
  fiscalYear: number;
  organizationId: string;
  departmentId: string;
  ownerId: string;
  projectType: ProjectType;
  description: string;
  principle: string;
  objectives: string;
  target: string;
  kpi: string;
  expectedOutcome: string;
  budget: number;
  budgetSource: string;
  priority: ProjectPriority;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
  // Contact & Bottleneck Tracking
  ownerContact?: OwnerContactInfo;
  assignedOfficer?: AssignedOfficerInfo | null;
  assignedReviewer?: AssignedOfficerInfo | null;
  assignedApprover?: AssignedOfficerInfo | null;
  assignedInspector?: AssignedOfficerInfo | null;
  periodLabel?: string;
}

export interface ProjectComment {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  commentText?: string;
  userName?: string;
  isInternal?: boolean;
}
