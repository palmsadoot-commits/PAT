import { ProjectStatus, WorkflowAction, UserRole } from '@/types';

export interface WorkflowTransition {
  from: ProjectStatus;
  to: ProjectStatus;
  action: WorkflowAction;
  requiredRoles: UserRole[];
  requiresComment: boolean;
  label: { th: string; en: string };
  confirmMessage: { th: string; en: string };
}

export const WORKFLOW_TRANSITIONS: WorkflowTransition[] = [
  { from: 'DRAFT', to: 'SUBMITTED', action: 'SUBMIT', requiredRoles: ['PROJECT_OWNER','OFFICER','ADMIN','SUPER_ADMIN'], requiresComment: false, label: { th: 'ส่งคำขอ', en: 'Submit' }, confirmMessage: { th: 'ยืนยันการส่งคำขอ?', en: 'Confirm submission?' } },
  { from: 'SUBMITTED', to: 'DOCUMENT_CHECK', action: 'RECEIVE', requiredRoles: ['OFFICER','ADMIN','SUPER_ADMIN'], requiresComment: false, label: { th: 'รับเรื่อง', en: 'Receive' }, confirmMessage: { th: 'ยืนยันการรับเรื่อง?', en: 'Confirm receive?' } },
  { from: 'DOCUMENT_CHECK', to: 'UNDER_REVIEW', action: 'DOCS_COMPLETE', requiredRoles: ['REVIEWER','ADMIN','SUPER_ADMIN'], requiresComment: false, label: { th: 'เอกสารครบ', en: 'Documents Complete' }, confirmMessage: { th: 'ยืนยันว่าเอกสารครบถ้วน?', en: 'Confirm documents are complete?' } },
  { from: 'DOCUMENT_CHECK', to: 'RETURNED', action: 'DOCS_INCOMPLETE', requiredRoles: ['REVIEWER','ADMIN','SUPER_ADMIN'], requiresComment: true, label: { th: 'เอกสารไม่ครบ', en: 'Documents Incomplete' }, confirmMessage: { th: 'ตีกลับเพื่อแก้ไขเอกสาร?', en: 'Return for document correction?' } },
  { from: 'UNDER_REVIEW', to: 'PENDING_APPROVAL', action: 'REVIEW_COMPLETE', requiredRoles: ['REVIEWER','ADMIN','SUPER_ADMIN'], requiresComment: false, label: { th: 'พิจารณาเสร็จ', en: 'Review Complete' }, confirmMessage: { th: 'ส่งเสนอผู้มีอำนาจอนุมัติ?', en: 'Submit for approval?' } },
  { from: 'UNDER_REVIEW', to: 'RETURNED', action: 'REVIEW_RETURN', requiredRoles: ['REVIEWER','ADMIN','SUPER_ADMIN'], requiresComment: true, label: { th: 'ตีกลับแก้ไข', en: 'Return for Revision' }, confirmMessage: { th: 'ตีกลับโครงการเพื่อแก้ไข?', en: 'Return project for revision?' } },
  { from: 'RETURNED', to: 'SUBMITTED', action: 'RESUBMIT', requiredRoles: ['PROJECT_OWNER','OFFICER','ADMIN','SUPER_ADMIN'], requiresComment: false, label: { th: 'ส่งใหม่', en: 'Resubmit' }, confirmMessage: { th: 'ส่งคำขออีกครั้ง?', en: 'Resubmit request?' } },
  { from: 'PENDING_APPROVAL', to: 'APPROVED', action: 'APPROVE', requiredRoles: ['APPROVER','SUPER_ADMIN'], requiresComment: false, label: { th: 'อนุมัติ', en: 'Approve' }, confirmMessage: { th: 'ยืนยันการอนุมัติโครงการ?', en: 'Approve this project?' } },
  { from: 'PENDING_APPROVAL', to: 'REJECTED', action: 'REJECT', requiredRoles: ['APPROVER','SUPER_ADMIN'], requiresComment: true, label: { th: 'ไม่อนุมัติ', en: 'Reject' }, confirmMessage: { th: 'ยืนยันการไม่อนุมัติโครงการ?', en: 'Reject this project?' } },
  { from: 'PENDING_APPROVAL', to: 'RETURNED', action: 'RETURN', requiredRoles: ['APPROVER','SUPER_ADMIN'], requiresComment: true, label: { th: 'ตีกลับ', en: 'Return' }, confirmMessage: { th: 'ตีกลับโครงการเพื่อแก้ไข?', en: 'Return project for correction?' } },
  { from: 'APPROVED', to: 'IN_PROGRESS', action: 'START', requiredRoles: ['OFFICER','ADMIN','SUPER_ADMIN'], requiresComment: false, label: { th: 'เริ่มดำเนินการ', en: 'Start' }, confirmMessage: { th: 'เริ่มดำเนินโครงการ?', en: 'Start project execution?' } },
  { from: 'IN_PROGRESS', to: 'COMPLETED', action: 'COMPLETE', requiredRoles: ['OFFICER','ADMIN','SUPER_ADMIN'], requiresComment: false, label: { th: 'เสร็จสิ้น', en: 'Complete' }, confirmMessage: { th: 'ยืนยันว่าโครงการเสร็จสิ้น?', en: 'Mark project as completed?' } },
  { from: 'DRAFT', to: 'CANCELLED', action: 'CANCEL', requiredRoles: ['PROJECT_OWNER','ADMIN','SUPER_ADMIN'], requiresComment: true, label: { th: 'ยกเลิก', en: 'Cancel' }, confirmMessage: { th: 'ยกเลิกโครงการ?', en: 'Cancel project?' } },
  { from: 'SUBMITTED', to: 'CANCELLED', action: 'CANCEL', requiredRoles: ['PROJECT_OWNER','ADMIN','SUPER_ADMIN'], requiresComment: true, label: { th: 'ยกเลิก', en: 'Cancel' }, confirmMessage: { th: 'ยกเลิกโครงการ?', en: 'Cancel project?' } },
  { from: 'RETURNED', to: 'CANCELLED', action: 'CANCEL', requiredRoles: ['PROJECT_OWNER','ADMIN','SUPER_ADMIN'], requiresComment: true, label: { th: 'ยกเลิก', en: 'Cancel' }, confirmMessage: { th: 'ยกเลิกโครงการ?', en: 'Cancel project?' } },
];

export function getAvailableTransitions(currentStatus: ProjectStatus, userRole: UserRole): WorkflowTransition[] {
  return WORKFLOW_TRANSITIONS.filter(t => t.from === currentStatus && t.requiredRoles.includes(userRole));
}

export function isTransitionAllowed(from: ProjectStatus, to: ProjectStatus, action: WorkflowAction, userRole: UserRole): boolean {
  return WORKFLOW_TRANSITIONS.some(t => t.from === from && t.to === to && t.action === action && t.requiredRoles.includes(userRole));
}

export function getTransition(from: ProjectStatus, action: WorkflowAction): WorkflowTransition | undefined {
  return WORKFLOW_TRANSITIONS.find(t => t.from === from && t.action === action);
}

export const WORKFLOW_STEPS = [
  { status: 'DRAFT', label: { th: 'ร่างโครงการ', en: 'Draft' }, order: 1 },
  { status: 'SUBMITTED', label: { th: 'ส่งคำขอ', en: 'Submitted' }, order: 2 },
  { status: 'DOCUMENT_CHECK', label: { th: 'ตรวจเอกสาร', en: 'Document Check' }, order: 3 },
  { status: 'UNDER_REVIEW', label: { th: 'พิจารณา', en: 'Under Review' }, order: 4 },
  { status: 'PENDING_APPROVAL', label: { th: 'รออนุมัติ', en: 'Pending Approval' }, order: 5 },
  { status: 'APPROVED', label: { th: 'อนุมัติแล้ว', en: 'Approved' }, order: 6 },
  { status: 'IN_PROGRESS', label: { th: 'ดำเนินการ', en: 'In Progress' }, order: 7 },
  { status: 'COMPLETED', label: { th: 'เสร็จสิ้น', en: 'Completed' }, order: 8 },
] as const;
