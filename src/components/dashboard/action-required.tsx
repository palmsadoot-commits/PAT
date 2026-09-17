'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { formatDate, formatBudgetFull } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

interface ActionProject {
  id: string;
  projectNo: string;
  projectName: string;
  status: string;
  priority: string;
  budget: number;
  organizationName: string;
  ownerName?: string;
  createdAt: string;
  updatedAt: string;
  assignedOfficer?: {
    fullName: string;
    phone: string;
    internalPhone: string;
    isOverdue: boolean;
    overdueDays?: number;
    daysPending: number;
  };
}

interface ActionRequiredProps {
  projects: ActionProject[];
  totalProjects?: number;
}

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'รอรับเรื่อง',
  DOCUMENT_CHECK: 'รอตรวจเอกสาร',
  UNDER_REVIEW: 'รอพิจารณา',
  PENDING_APPROVAL: 'รออนุมัติ',
  RETURNED: 'ตีกลับ-รอแก้ไข',
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: 'text-red-600',
  MEDIUM: 'text-amber-600',
  LOW: 'text-emerald-600',
};

export function ActionRequired({ projects, totalProjects }: ActionRequiredProps) {
  if (!projects?.length) return null;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border-muted)] flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--foreground)]">
            ต้องดำเนินการ / ติดตามคอขวด
          </h2>
          <p className="text-[12px] text-[var(--foreground-muted)] mt-0.5">
            โครงการที่รอการตอบสนองและผู้ได้รับมอบหมายให้ตรวจสอบ
          </p>
        </div>
        {(totalProjects || 0) > 5 && (
          <Link
            href="/projects?status=SUBMITTED,DOCUMENT_CHECK,UNDER_REVIEW,PENDING_APPROVAL,RETURNED"
            className="text-[12px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1 transition-colors"
          >
            ดูทั้งหมด
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      <div className="divide-y divide-[var(--border-muted)]">
        {projects.slice(0, 5).map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--surface-muted)] transition-colors group"
          >
            {/* Priority indicator */}
            <div className={cn('w-1 h-10 rounded-full flex-shrink-0', {
              'bg-red-500': p.priority === 'HIGH',
              'bg-amber-400': p.priority === 'MEDIUM',
              'bg-emerald-400': p.priority === 'LOW',
            })} />

            {/* Project info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">
                  {p.projectName}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--foreground-subtle)] flex-wrap">
                <span className="font-mono">{p.projectNo}</span>
                <span>·</span>
                <span>{p.organizationName}</span>
                <span>·</span>
                <span className="tabular-nums">{formatBudgetFull(p.budget)}</span>
                {p.assignedOfficer && (
                  <>
                    <span>·</span>
                    <span className={cn(
                      "font-medium",
                      p.assignedOfficer.isOverdue ? "text-red-600 font-bold" : "text-[var(--foreground-muted)]"
                    )}>
                      ผู้ตรวจ: {p.assignedOfficer.fullName} {p.assignedOfficer.internalPhone ? `(ต่อ ${p.assignedOfficer.internalPhone})` : ''}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Bottleneck / SLA badge */}
            {p.assignedOfficer?.isOverdue && (
              <span className="text-[10px] font-bold text-red-700 bg-red-100/80 border border-red-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                เกิน SLA {p.assignedOfficer.overdueDays} วัน
              </span>
            )}

            {/* Status label */}
            <span className="text-[11px] font-medium text-[var(--foreground-muted)] bg-[var(--surface-muted)] px-2 py-1 rounded-[var(--radius-sm)] flex-shrink-0">
              {STATUS_LABELS[p.status] || p.status}
            </span>

            <ArrowRight className="w-3.5 h-3.5 text-[var(--foreground-subtle)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
