'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, 
  ChevronRight, 
  UserCheck, 
  ArrowRightLeft, 
  FolderKanban, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatBudgetFull, formatDate } from '@/lib/utils/format';

export interface WorkloadItem {
  userId: string;
  username: string;
  fullName: string;
  role: string;
  position: string;
  organizationId: string;
  organizationName: string;
  departmentId: string;
  departmentName: string;
  capacity: number;
  activeCount: number;
  completedCount: number;
  totalBudget: number;
  utilization: number;
  workloadStatus: 'HEALTHY' | 'NEAR_CAPACITY' | 'OVERLOADED';
  monthlyDistribution: Array<{
    monthKey: string;
    label: string;
    full: string;
    count: number;
    densityStatus: 'NONE' | 'LOW' | 'OPTIMAL' | 'HIGH';
  }>;
  projects: Array<{
    id: string;
    projectNo: string;
    projectName: string;
    budget: number;
    status: string;
    priority: string;
    startDate: string;
    endDate: string;
    userRoleInProject?: string;
    periodLabel?: string;
  }>;
}

interface WorkloadMatrixProps {
  workloads: WorkloadItem[];
  months: Array<{ key: string; label: string; full: string }>;
  onReassignClick: (project: {
    id: string;
    projectNo: string;
    projectName: string;
    budget: number;
    currentOwnerName: string;
    currentOwnerId: string;
  }) => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'ร่าง', color: 'var(--status-draft)', bg: 'var(--status-draft-bg)' },
  SUBMITTED: { label: 'ยื่นเสนอ', color: 'var(--status-submitted)', bg: 'var(--status-submitted-bg)' },
  DOCUMENT_CHECK: { label: 'ตรวจเอกสาร', color: 'var(--status-checking)', bg: 'var(--status-checking-bg)' },
  UNDER_REVIEW: { label: 'พิจารณา', color: 'var(--status-review)', bg: 'var(--status-review-bg)' },
  RETURNED: { label: 'ตีกลับ', color: 'var(--status-returned)', bg: 'var(--status-returned-bg)' },
  PENDING_APPROVAL: { label: 'รออนุมัติ', color: 'var(--status-pending)', bg: 'var(--status-pending-bg)' },
  APPROVED: { label: 'อนุมัติแล้ว', color: 'var(--status-approved)', bg: 'var(--status-approved-bg)' },
  REJECTED: { label: 'ไม่อนุมัติ', color: 'var(--status-rejected)', bg: 'var(--status-rejected-bg)' },
  IN_PROGRESS: { label: 'ดำเนินการ', color: 'var(--status-progress)', bg: 'var(--status-progress-bg)' },
  COMPLETED: { label: 'เสร็จสิ้น', color: 'var(--status-completed)', bg: 'var(--status-completed-bg)' },
};

export function WorkloadMatrix({ workloads, months, onReassignClick }: WorkloadMatrixProps) {
  // Expanded person rows state
  const [expandedUserIds, setExpandedUserIds] = useState<Set<string>>(new Set());

  const toggleExpand = (userId: string) => {
    setExpandedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedUserIds(new Set(workloads.map((w) => w.userId)));
  };

  const collapseAll = () => {
    setExpandedUserIds(new Set());
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] overflow-hidden">
      {/* Table Action Controls */}
      <div className="px-5 py-3 border-b border-[var(--border-muted)] flex items-center justify-between text-xs bg-[var(--surface-muted)]/40">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[var(--foreground)]">
            แสดงผลบุคลากร {workloads.length} ราย
          </span>
          <span className="text-[var(--foreground-subtle)]">|</span>
          <button
            onClick={expandAll}
            className="text-[var(--accent)] hover:underline font-medium cursor-pointer"
          >
            ขยายทั้งหมด
          </button>
          <button
            onClick={collapseAll}
            className="text-[var(--foreground-muted)] hover:underline font-medium cursor-pointer"
          >
            ย่อทั้งหมด
          </button>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-[var(--foreground-muted)]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            ปกติ (≤ 75%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            ใกล้เต็ม (76-100%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            ภาระงานเกินเกณฑ์ (&gt; 100%)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[var(--surface-muted)] text-[var(--foreground-muted)] border-b border-[var(--border)] uppercase tracking-wider">
              {/* Personnel Column */}
              <th className="py-3 px-4 font-semibold min-w-[280px] w-[320px] sticky left-0 bg-[var(--surface-muted)] z-10 shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                บุคลากรและขีดความจุ (Resource & Capacity)
              </th>

              {/* 12 Months Timeline Columns */}
              {months.map((m) => (
                <th
                  key={m.key}
                  className="py-3 px-2 font-semibold text-center min-w-[58px] border-l border-[var(--border-muted)]"
                  title={m.full}
                >
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border-muted)]">
            {workloads.map((user) => {
              const isExpanded = expandedUserIds.has(user.userId);
              const isOverloaded = user.workloadStatus === 'OVERLOADED';
              const isNear = user.workloadStatus === 'NEAR_CAPACITY';

              return (
                <React.Fragment key={user.userId}>
                  {/* Main Personnel Row */}
                  <tr className="hover:bg-[var(--surface-muted)]/60 transition-colors group">
                    {/* Personnel Info Cell */}
                    <td className="py-3.5 px-4 sticky left-0 bg-[var(--surface)] group-hover:bg-[var(--surface-muted)]/60 transition-colors z-10 shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={() => toggleExpand(user.userId)}
                          className="p-1 hover:bg-[var(--surface-muted)] rounded text-[var(--foreground-subtle)] hover:text-[var(--foreground)] mt-0.5 cursor-pointer flex-shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-[var(--accent)]" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--foreground)] text-[13px] truncate">
                              {user.fullName}
                            </span>
                            <span className="text-[10px] text-[var(--foreground-subtle)] font-medium px-1.5 py-0.5 bg-[var(--surface-muted)] rounded border border-[var(--border)] flex-shrink-0">
                              {user.role}
                            </span>
                          </div>

                          <div className="text-[11px] text-[var(--foreground-muted)] truncate mt-0.5">
                            {user.organizationName} · {user.position}
                          </div>

                          {/* Capacity Progress Bar */}
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[var(--foreground-subtle)]">ความจุโครงการ</span>
                              <span
                                className={cn(
                                  'font-bold tabular-nums',
                                  isOverloaded
                                    ? 'text-red-600'
                                    : isNear
                                    ? 'text-amber-600'
                                    : 'text-emerald-600'
                                )}
                              >
                                {user.activeCount}/{user.capacity} โครงการ ({user.utilization}%)
                              </span>
                            </div>

                            <div className="h-1.5 w-full bg-[var(--surface-muted)] rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full transition-all duration-300 rounded-full',
                                  isOverloaded
                                    ? 'bg-red-500'
                                    : isNear
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                )}
                                style={{ width: `${Math.min(user.utilization, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Timeline Month Cells */}
                    {user.monthlyDistribution.map((m) => {
                      const count = m.count;
                      const hasProjects = count > 0;
                      const cellOverload = count > user.capacity;
                      const cellNear = count === user.capacity;

                      return (
                        <td
                          key={m.monthKey}
                          className="py-3 px-1 text-center border-l border-[var(--border-muted)] align-middle"
                        >
                          {hasProjects ? (
                            <div
                              className={cn(
                                'mx-auto w-8 h-8 rounded-lg flex flex-col items-center justify-center font-bold text-xs tabular-nums shadow-xs transition-transform hover:scale-105',
                                cellOverload
                                  ? 'bg-red-100 text-red-700 border border-red-200'
                                  : cellNear
                                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              )}
                              title={`${user.fullName}: ${count} โครงการในเดือน${m.full}`}
                            >
                              <span>{count}</span>
                            </div>
                          ) : (
                            <span className="text-[var(--foreground-subtle)] text-[11px] select-none">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Expanded Project Cards Row */}
                  {isExpanded && (
                    <tr className="bg-[var(--surface-muted)]/40 border-b border-[var(--border)]">
                      <td colSpan={13} className="p-4 pl-12">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-1.5">
                              <FolderKanban className="w-3.5 h-3.5 text-[var(--accent)]" />
                              โครงการที่กำลังรับผิดชอบ ({user.projects.length} รายการ)
                            </span>
                            <span className="text-[11px] text-[var(--foreground-muted)]">
                              งบประมาณรวมที่ดูแล: <strong className="text-[var(--foreground)] tabular-nums">{formatBudgetFull(user.totalBudget)}</strong>
                            </span>
                          </div>

                          {user.projects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                              {user.projects.map((prj) => {
                                const status = STATUS_CONFIG[prj.status] || STATUS_CONFIG.DRAFT;

                                return (
                                  <div
                                    key={prj.id}
                                    className="bg-[var(--surface)] p-3 rounded-[var(--radius-md)] border border-[var(--border)] shadow-xs hover:border-[var(--border-active)] transition-all flex flex-col justify-between gap-2"
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-mono text-[10px] font-bold text-[var(--accent)] bg-[var(--accent-muted)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                                            {prj.projectNo}
                                          </span>
                                          {prj.userRoleInProject && (
                                            <span className="text-[10px] font-medium text-[var(--foreground-muted)] bg-[var(--surface-muted)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                                              {prj.userRoleInProject}
                                            </span>
                                          )}
                                        </div>

                                        <span
                                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                          style={{ color: status.color, backgroundColor: status.bg }}
                                        >
                                          {status.label}
                                        </span>
                                      </div>

                                      <Link
                                        href={`/projects/${prj.id}`}
                                        className="font-semibold text-xs text-[var(--foreground)] hover:text-[var(--accent)] transition-colors line-clamp-2"
                                      >
                                        {prj.projectName}
                                      </Link>

                                      <div className="text-[11px] text-[var(--foreground-muted)] tabular-nums">
                                        งบประมาณ: {formatBudgetFull(prj.budget)}
                                      </div>

                                      {prj.periodLabel && (
                                        <div className="text-[10px] text-[var(--foreground-subtle)] flex items-center gap-1 pt-0.5">
                                          <Calendar className="w-3 h-3 text-[var(--accent)] flex-shrink-0" />
                                          <span className="truncate">{prj.periodLabel}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Action Bar */}
                                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border-muted)] mt-1">
                                      <Link
                                        href={`/projects/${prj.id}`}
                                        className="text-[11px] text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                                      >
                                        <span>รายละเอียด</span>
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </Link>

                                      <button
                                        onClick={() =>
                                          onReassignClick({
                                            id: prj.id,
                                            projectNo: prj.projectNo,
                                            projectName: prj.projectName,
                                            budget: prj.budget,
                                            currentOwnerName: user.fullName,
                                            currentOwnerId: user.userId,
                                          })
                                        }
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-[var(--radius-sm)] transition-colors cursor-pointer shadow-xs"
                                        title="โอนย้ายโครงการนี้ให้ผู้อื่น"
                                      >
                                        <ArrowRightLeft className="w-3 h-3" />
                                        <span>โอนย้ายงาน</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-[var(--foreground-subtle)] py-2">
                              ไม่มีโครงการที่อยู่ระหว่างดำเนินการในขณะนี้
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
