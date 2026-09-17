'use client';

import * as React from 'react';
import type { ProjectStatus, ProjectPriority } from '@/types';
import { cn } from '@/lib/utils';

export type BadgeSize = 'sm' | 'md';

interface StatusConfig {
  label: string;
  className: string;
  dotClassName: string;
}

const STATUS_MAP: Record<ProjectStatus, StatusConfig> = {
  DRAFT: {
    label: 'ร่าง',
    className: 'bg-[var(--status-draft-bg)] text-[var(--status-draft)] border-[var(--status-draft-border)]',
    dotClassName: 'bg-[var(--status-draft)]',
  },
  SUBMITTED: {
    label: 'ยื่นเสนอ',
    className: 'bg-[var(--status-submitted-bg)] text-[var(--status-submitted)] border-[var(--status-submitted-border)]',
    dotClassName: 'bg-[var(--status-submitted)]',
  },
  DOCUMENT_CHECK: {
    label: 'ตรวจเอกสาร',
    className: 'bg-[var(--status-checking-bg)] text-[var(--status-checking)] border-[var(--status-checking-border)]',
    dotClassName: 'bg-[var(--status-checking)]',
  },
  UNDER_REVIEW: {
    label: 'กำลังพิจารณา',
    className: 'bg-[var(--status-review-bg)] text-[var(--status-review)] border-[var(--status-review-border)]',
    dotClassName: 'bg-[var(--status-review)]',
  },
  RETURNED: {
    label: 'ตีกลับแก้ไข',
    className: 'bg-[var(--status-returned-bg)] text-[var(--status-returned)] border-[var(--status-returned-border)]',
    dotClassName: 'bg-[var(--status-returned)]',
  },
  PENDING_APPROVAL: {
    label: 'รออนุมัติ',
    className: 'bg-[var(--status-pending-bg)] text-[var(--status-pending)] border-[var(--status-pending-border)]',
    dotClassName: 'bg-[var(--status-pending)]',
  },
  APPROVED: {
    label: 'อนุมัติแล้ว',
    className: 'bg-[var(--status-approved-bg)] text-[var(--status-approved)] border-[var(--status-approved-border)]',
    dotClassName: 'bg-[var(--status-approved)]',
  },
  REJECTED: {
    label: 'ไม่อนุมัติ',
    className: 'bg-[var(--status-rejected-bg)] text-[var(--status-rejected)] border-[var(--status-rejected-border)]',
    dotClassName: 'bg-[var(--status-rejected)]',
  },
  IN_PROGRESS: {
    label: 'กำลังดำเนินการ',
    className: 'bg-[var(--status-progress-bg)] text-[var(--status-progress)] border-[var(--status-progress-border)]',
    dotClassName: 'bg-[var(--status-progress)]',
  },
  COMPLETED: {
    label: 'เสร็จสิ้น',
    className: 'bg-[var(--status-completed-bg)] text-[var(--status-completed)] border-[var(--status-completed-border)]',
    dotClassName: 'bg-[var(--status-completed)]',
  },
  CANCELLED: {
    label: 'ยกเลิก',
    className: 'bg-[var(--status-cancelled-bg)] text-[var(--status-cancelled)] border-[var(--status-cancelled-border)]',
    dotClassName: 'bg-[var(--status-cancelled)]',
  },
};

const PRIORITY_MAP: Record<ProjectPriority, { label: string; className: string; dotClassName: string }> = {
  HIGH: {
    label: 'เร่งด่วน',
    className: 'bg-[var(--danger-bg)] text-[var(--danger)] border-red-200',
    dotClassName: 'bg-[var(--danger)]',
  },
  MEDIUM: {
    label: 'ปกติ',
    className: 'bg-[var(--warning-bg)] text-[var(--warning)] border-amber-200',
    dotClassName: 'bg-[var(--warning)]',
  },
  LOW: {
    label: 'ต่ำ',
    className: 'bg-[var(--success-bg)] text-[var(--success)] border-emerald-200',
    dotClassName: 'bg-[var(--success)]',
  },
};

export interface StatusBadgeProps {
  status: ProjectStatus;
  size?: BadgeSize;
  className?: string;
}

export function StatusBadge({ status, size = 'sm', className }: StatusBadgeProps) {
  const config = STATUS_MAP[status] || {
    label: status,
    className: 'bg-[var(--surface-muted)] text-[var(--foreground-muted)] border-[var(--border)]',
    dotClassName: 'bg-[var(--foreground-muted)]',
  };

  const sizeClasses = size === 'md' ? 'px-2.5 py-1 text-sm' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap select-none transition-colors',
        sizeClasses,
        config.className,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dotClassName)} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}

export interface PriorityBadgeProps {
  priority: ProjectPriority | 'HIGH' | 'MEDIUM' | 'LOW';
  size?: BadgeSize;
  className?: string;
}

export function PriorityBadge({ priority, size = 'sm', className }: PriorityBadgeProps) {
  const config = PRIORITY_MAP[priority] || {
    label: priority,
    className: 'bg-[var(--surface-muted)] text-[var(--foreground-muted)] border-[var(--border)]',
    dotClassName: 'bg-[var(--foreground-muted)]',
  };

  const sizeClasses = size === 'md' ? 'px-2.5 py-1 text-sm' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap select-none transition-colors',
        sizeClasses,
        config.className,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dotClassName)} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
