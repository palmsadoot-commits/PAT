export const PROJECT_STATUS_LABELS: Record<string, { th: string; en: string; color: string }> = {
  DRAFT: { th: 'ฉบับร่าง', en: 'Draft', color: 'gray' },
  SUBMITTED: { th: 'ส่งแล้ว', en: 'Submitted', color: 'blue' },
  DOCUMENT_CHECK: { th: 'ตรวจเอกสาร', en: 'Document Check', color: 'indigo' },
  UNDER_REVIEW: { th: 'พิจารณา', en: 'Under Review', color: 'purple' },
  RETURNED: { th: 'ตีกลับ', en: 'Returned', color: 'amber' },
  PENDING_APPROVAL: { th: 'รออนุมัติ', en: 'Pending Approval', color: 'orange' },
  APPROVED: { th: 'อนุมัติแล้ว', en: 'Approved', color: 'green' },
  REJECTED: { th: 'ไม่อนุมัติ', en: 'Rejected', color: 'red' },
  IN_PROGRESS: { th: 'ดำเนินการ', en: 'In Progress', color: 'cyan' },
  COMPLETED: { th: 'เสร็จสิ้น', en: 'Completed', color: 'emerald' },
  CANCELLED: { th: 'ยกเลิก', en: 'Cancelled', color: 'slate' }
};

export const PRIORITY_LABELS: Record<string, { th: string; en: string; color: string }> = {
  HIGH: { th: 'สูง', en: 'High', color: 'red' },
  MEDIUM: { th: 'ปานกลาง', en: 'Medium', color: 'yellow' },
  LOW: { th: 'ต่ำ', en: 'Low', color: 'green' }
};

export const PROJECT_TYPE_LABELS: Record<string, { th: string; en: string }> = {
  DIGITAL: { th: 'ดิจิทัล', en: 'Digital' },
  INFRASTRUCTURE: { th: 'โครงสร้างพื้นฐาน', en: 'Infrastructure' },
  RESEARCH: { th: 'วิจัย', en: 'Research' },
  TRAINING: { th: 'ฝึกอบรม', en: 'Training' },
  SERVICE: { th: 'บริการ', en: 'Service' },
  OTHER: { th: 'อื่นๆ', en: 'Other' }
};

export const DOCUMENT_TYPE_LABELS: Record<string, { th: string; en: string }> = {
  PROPOSAL: { th: 'ข้อเสนอโครงการ', en: 'Proposal' },
  BUDGET: { th: 'เอกสารงบประมาณ', en: 'Budget' },
  OFFICIAL_LETTER: { th: 'หนังสือราชการ', en: 'Official Letter' },
  SUPPORTING: { th: 'เอกสารประกอบ', en: 'Supporting Document' },
  APPROVAL: { th: 'เอกสารอนุมัติ', en: 'Approval Document' },
  OTHER: { th: 'อื่นๆ', en: 'Other' }
};

export const ROLE_LABELS: Record<string, { th: string; en: string }> = {
  SUPER_ADMIN: { th: 'ผู้ดูแลระบบสูงสุด', en: 'Super Admin' },
  ADMIN: { th: 'ผู้ดูแลระบบ', en: 'Admin' },
  OFFICER: { th: 'เจ้าหน้าที่โครงการ', en: 'Project Officer' },
  PROJECT_OWNER: { th: 'เจ้าของโครงการ', en: 'Project Owner' },
  REVIEWER: { th: 'ผู้ตรวจสอบ', en: 'Reviewer' },
  APPROVER: { th: 'ผู้อนุมัติ', en: 'Approver' },
  EXECUTIVE: { th: 'ผู้บริหาร', en: 'Executive' },
  VIEWER: { th: 'ผู้ดูข้อมูล', en: 'Viewer' }
};

export const NOTIFICATION_TYPE_LABELS: Record<string, { th: string; en: string; icon: string }> = {
  STATUS_CHANGE: { th: 'เปลี่ยนสถานะ', en: 'Status Change', icon: 'RefreshCw' },
  DOCUMENT_ADDED: { th: 'เพิ่มเอกสาร', en: 'Document Added', icon: 'FilePlus' },
  COMMENT_ADDED: { th: 'เพิ่มความคิดเห็น', en: 'Comment Added', icon: 'MessageSquare' },
  ASSIGNED: { th: 'มอบหมาย', en: 'Assigned', icon: 'UserPlus' }
};

export const AUDIT_ACTION_LABELS: Record<string, { th: string; en: string }> = {
  CREATE: { th: 'สร้าง', en: 'Create' },
  UPDATE: { th: 'แก้ไข', en: 'Update' },
  DELETE: { th: 'ลบ', en: 'Delete' },
  VIEW: { th: 'ดู', en: 'View' }
};

export const WORKFLOW_ACTION_LABELS: Record<string, { th: string; en: string }> = {
  SUBMIT: { th: 'ส่งคำขอ', en: 'Submit' },
  RECEIVE: { th: 'รับเรื่อง', en: 'Receive' },
  DOCS_COMPLETE: { th: 'เอกสารครบ', en: 'Docs Complete' },
  DOCS_INCOMPLETE: { th: 'เอกสารไม่ครบ', en: 'Docs Incomplete' },
  REVIEW_COMPLETE: { th: 'พิจารณาเสร็จ', en: 'Review Complete' },
  REVIEW_RETURN: { th: 'ตีกลับแก้ไข', en: 'Review Return' },
  RESUBMIT: { th: 'ส่งใหม่', en: 'Resubmit' },
  APPROVE: { th: 'อนุมัติ', en: 'Approve' },
  REJECT: { th: 'ไม่อนุมัติ', en: 'Reject' },
  RETURN: { th: 'ตีกลับ', en: 'Return' },
  START: { th: 'เริ่มดำเนินการ', en: 'Start' },
  COMPLETE: { th: 'เสร็จสิ้น', en: 'Complete' },
  CANCEL: { th: 'ยกเลิก', en: 'Cancel' }
};

export const SIDEBAR_ITEMS = [
  { label: 'แดชบอร์ด', labelEn: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'โครงการ', labelEn: 'Projects', href: '/projects', icon: 'FolderKanban', badge: 'projectCount' },
  { label: 'สร้างโครงการ', labelEn: 'New Project', href: '/projects/new', icon: 'PlusCircle' },
  { label: 'รอตรวจสอบ', labelEn: 'Review', href: '/review', icon: 'ClipboardCheck' },
  { label: 'รออนุมัติ', labelEn: 'Approval', href: '/approval', icon: 'CheckCircle2' },
  { label: 'เอกสาร', labelEn: 'Documents', href: '/documents', icon: 'FileText' },
  { label: 'รายงาน', labelEn: 'Reports', href: '/reports', icon: 'BarChart3' },
  { separator: true },
  { label: 'การแจ้งเตือน', labelEn: 'Notifications', href: '/notifications', icon: 'Bell' },
  { label: 'ผู้ใช้งาน', labelEn: 'Users', href: '/users', icon: 'Users', permission: 'user:manage' },
  { label: 'ตั้งค่า', labelEn: 'Settings', href: '/settings', icon: 'Settings', permission: 'system:manage' },
  { label: 'บันทึกการใช้งาน', labelEn: 'Audit Logs', href: '/audit-logs', icon: 'ScrollText', permission: 'audit:view' },
] as const;

export const FILE_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedExtensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'],
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
  ],
} as const;

export const PAGINATION_DEFAULTS = { page: 1, pageSize: 10 } as const;
