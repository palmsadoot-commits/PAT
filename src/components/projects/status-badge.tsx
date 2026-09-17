'use client';

import React from 'react';

// Assuming these types exist in the project, we inline them here for the component if not imported
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

const STATUS_CONFIG: Record<ProjectStatus, { label: string; className: string }> = {
  DRAFT: { label: 'ร่าง', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  SUBMITTED: { label: 'ยื่นเสนอ', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  DOCUMENT_CHECK: { label: 'รอตรวจสอบเอกสาร', className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  UNDER_REVIEW: { label: 'กำลังพิจารณา', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  RETURNED: { label: 'ตีกลับแก้ไข', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  PENDING_APPROVAL: { label: 'รออนุมัติ', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  APPROVED: { label: 'อนุมัติแล้ว', className: 'bg-green-100 text-green-700 border-green-200' },
  REJECTED: { label: 'ไม่อนุมัติ', className: 'bg-red-100 text-red-700 border-red-200' },
  IN_PROGRESS: { label: 'กำลังดำเนินการ', className: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  COMPLETED: { label: 'เสร็จสิ้น', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'ยกเลิก', className: 'bg-slate-100 text-slate-700 border-slate-200' },
};

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${config.className}`}>
      {config.label}
    </span>
  );
}
