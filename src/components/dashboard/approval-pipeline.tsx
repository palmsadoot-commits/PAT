'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface PipelineStage {
  id: string;
  label: string;
  count: number;
  color: string;
  bgColor: string;
  statuses: string[];
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'drafting',
    label: 'ร่าง',
    count: 0,
    color: 'text-[var(--foreground)]',
    bgColor: 'bg-[var(--surface-inset)]',
    statuses: ['DRAFT'],
  },
  {
    id: 'submitted',
    label: 'ยื่นเสนอ',
    count: 0,
    color: 'text-[var(--accent)]',
    bgColor: 'bg-[var(--accent-muted)]',
    statuses: ['SUBMITTED'],
  },
  {
    id: 'reviewing',
    label: 'ตรวจสอบ',
    count: 0,
    color: 'text-[var(--accent)]',
    bgColor: 'bg-[var(--accent-muted)]',
    statuses: ['DOCUMENT_CHECK', 'UNDER_REVIEW'],
  },
  {
    id: 'pending',
    label: 'รออนุมัติ',
    count: 0,
    color: 'text-[var(--warning)]',
    bgColor: 'bg-[var(--warning-bg)]',
    statuses: ['PENDING_APPROVAL'],
  },
  {
    id: 'resolved',
    label: 'ดำเนินการ',
    count: 0,
    color: 'text-[var(--success)]',
    bgColor: 'bg-[var(--success-bg)]',
    statuses: ['APPROVED', 'IN_PROGRESS', 'COMPLETED'],
  },
];

interface ApprovalPipelineProps {
  statusCounts: Record<string, number>;
}

export function ApprovalPipeline({ statusCounts }: ApprovalPipelineProps) {
  const stages = PIPELINE_STAGES.map((stage) => ({
    ...stage,
    count: stage.statuses.reduce((sum, s) => sum + (statusCounts[s] || 0), 0),
  }));

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <section className="workspace-panel p-5" aria-labelledby="approval-pipeline-title">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 id="approval-pipeline-title" className="text-[15px] font-semibold text-[var(--foreground)]">
            ขั้นตอนการอนุมัติ
          </h2>
          <p className="text-[12px] text-[var(--foreground-muted)] mt-0.5">
            การกระจายตัวของ {total} โครงการในระบบ
          </p>
        </div>
        <Link
          href="/projects"
          className="text-[12px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
        >
          ดูทั้งหมด →
        </Link>
      </div>

      {/* Pipeline */}
      <div className="flex min-w-max items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {stages.map((stage, i) => (
          <React.Fragment key={stage.id}>
            <Link
              href={`/projects?status=${stage.statuses.join(',')}`}
              className={cn(
                'group relative min-w-[110px] flex-1 rounded-[var(--radius-md)] border border-[var(--border-muted)] p-3 text-center transition-all hover:border-[var(--border-active)] hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
                stage.bgColor
              )}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black/5 text-[9px] font-bold text-[var(--foreground-muted)]">
                  {i + 1}
                </span>
                <span className="text-[10px] font-semibold text-[var(--foreground-subtle)] uppercase">
                  ขั้นที่ {i + 1}
                </span>
              </div>
              <span className={cn('text-xl font-bold tabular-nums block', stage.color)}>
                {stage.count}
              </span>
              <span className="text-[11px] font-semibold text-[var(--foreground-muted)] block mt-0.5 group-hover:text-[var(--foreground)]">
                {stage.label}
              </span>
            </Link>
            {i < stages.length - 1 && (
              <ChevronRight className="w-4 h-4 text-[var(--foreground-subtle)] flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Stacked bar */}
      <div className="mt-3 flex h-2 rounded-full overflow-hidden bg-[var(--surface-muted)] p-0.5 border border-[var(--border-muted)]">
        {stages.map((stage) => {
          const width = total > 0 ? (stage.count / total) * 100 : 0;
          if (width === 0) return null;
          const colorMap: Record<string, string> = {
            drafting: 'bg-stone-400',
            submitted: 'bg-blue-500',
            reviewing: 'bg-violet-500',
            pending: 'bg-orange-500',
            resolved: 'bg-emerald-500',
          };
          return (
            <div
              key={stage.id}
              className={cn('transition-all duration-500 first:rounded-l-full last:rounded-r-full', colorMap[stage.id] || 'bg-gray-300')}
              style={{ width: `${width}%` }}
              title={`${stage.label}: ${stage.count}`}
            />
          );
        })}
      </div>

      {/* Attention row */}
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[var(--border-muted)] pt-3 text-[11px]">
        <span className="font-semibold text-[var(--foreground-muted)]">สถานะพิเศษที่ต้องติดตาม:</span>
        {(statusCounts['RETURNED'] || 0) > 0 && (
          <Link
            href="/projects?status=RETURNED"
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 font-bold text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            ตีกลับแก้ไข {statusCounts['RETURNED']} รายการ
          </Link>
        )}
        {(statusCounts['REJECTED'] || 0) > 0 && (
          <Link
            href="/projects?status=REJECTED"
            className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 font-bold text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            ไม่อนุมัติ {statusCounts['REJECTED']} รายการ
          </Link>
        )}
        {(statusCounts['CANCELLED'] || 0) > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            ยกเลิก {statusCounts['CANCELLED']} รายการ
          </span>
        )}
        {(statusCounts['RETURNED'] || 0) === 0 && (statusCounts['REJECTED'] || 0) === 0 && (
          <span className="text-[var(--foreground-subtle)]">ไม่มีรายการที่มีปัญหาหรือถูกตีกลับ</span>
        )}
      </div>
    </section>
  );
}
