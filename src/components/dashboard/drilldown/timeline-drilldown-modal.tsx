'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Timer,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
  ExternalLink,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/format';

export interface TimelineDrillDownProject {
  id: string;
  projectNo: string;
  projectName: string;
  organizationName: string;
  budget: number;
  status: string;
  startDate?: string;
  endDate?: string;
  timelineStatus: 'ON_TRACK' | 'AT_RISK' | 'OVERDUE';
  daysRemaining: number;
  assignedOfficer?: any;
}

export interface TimelineDrillDownModalProps {
  open: boolean;
  onClose: () => void;
  projects: TimelineDrillDownProject[];
  initialFilter?: 'ALL' | 'ON_TRACK' | 'AT_RISK' | 'OVERDUE';
}

export function TimelineDrillDownModal({
  open,
  onClose,
  projects,
  initialFilter = 'ALL',
}: TimelineDrillDownModalProps) {
  const [filter, setFilter] = useState<'ALL' | 'ON_TRACK' | 'AT_RISK' | 'OVERDUE'>(initialFilter);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (open) {
      if (initialFilter) setFilter(initialFilter);
    } else {
      setSearchQuery('');
    }
  }, [open, initialFilter]);

  const onTrackCount = projects.filter(p => p.timelineStatus === 'ON_TRACK').length;
  const atRiskCount = projects.filter(p => p.timelineStatus === 'AT_RISK').length;
  const overdueCount = projects.filter(p => p.timelineStatus === 'OVERDUE').length;

  const filteredProjects = projects.filter(p => {
    if (filter !== 'ALL' && p.timelineStatus !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.projectName.toLowerCase().includes(q) || (p.projectNo || '').toLowerCase().includes(q) || p.organizationName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <Dialog open={open} onClose={onClose} size="2xl" className="max-h-[92vh] flex flex-col">
      <DialogHeader
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[var(--foreground)]">
                  การติดตามการดำเนินงานตามกรอบเวลา (Timeline & SLA Tracking)
                </span>
              </div>
              <p className="text-[12px] text-[var(--foreground-muted)] font-normal mt-0.5">
                จำแนกโครงการตามสถานะการส่งมอบ: ตรงเวลา, มีความเสี่ยงล่าช้า (&lt;30 วัน) และเกินกำหนดสัญญา
              </p>
            </div>
          </div>
        }
        onClose={onClose}
      />

      <DialogBody className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={cn(
              "p-3 rounded-lg border text-left cursor-pointer transition-all",
              filter === 'ALL'
                ? "bg-[var(--surface-active)] border-[var(--primary)] ring-1 ring-[var(--primary)]"
                : "bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-muted)]"
            )}
          >
            <span className="text-[11px] text-[var(--foreground-muted)] block font-medium">ทั้งหมด (Active)</span>
            <span className="text-xl font-bold tabular-nums text-[var(--foreground)]">{projects.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('ON_TRACK')}
            className={cn(
              "p-3 rounded-lg border text-left cursor-pointer transition-all",
              filter === 'ON_TRACK'
                ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500"
                : "bg-[var(--surface)] border-[var(--border)] hover:bg-emerald-50/50"
            )}
          >
            <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-medium">
              <CheckCircle2 size={13} />
              <span>ตรงเวลา (On Track)</span>
            </div>
            <span className="text-xl font-bold tabular-nums text-emerald-600">{onTrackCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('AT_RISK')}
            className={cn(
              "p-3 rounded-lg border text-left cursor-pointer transition-all",
              filter === 'AT_RISK'
                ? "bg-amber-50 border-amber-500 ring-1 ring-amber-500"
                : "bg-[var(--surface)] border-[var(--border)] hover:bg-amber-50/50"
            )}
          >
            <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-medium">
              <AlertCircle size={13} />
              <span>เสี่ยงล่าช้า (&lt;30 วัน)</span>
            </div>
            <span className="text-xl font-bold tabular-nums text-amber-600">{atRiskCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('OVERDUE')}
            className={cn(
              "p-3 rounded-lg border text-left cursor-pointer transition-all",
              filter === 'OVERDUE'
                ? "bg-red-50 border-red-500 ring-1 ring-red-500"
                : "bg-[var(--surface)] border-[var(--border)] hover:bg-red-50/50"
            )}
          >
            <div className="flex items-center gap-1.5 text-red-700 text-[11px] font-medium">
              <XCircle size={13} />
              <span>เกินกำหนด (Overdue)</span>
            </div>
            <span className="text-xl font-bold tabular-nums text-red-600">{overdueCount}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อโครงการ, รหัส, หรือหน่วยงาน..."
            className="w-full h-9 pl-9 pr-3 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface)] placeholder:text-[var(--foreground-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)] shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--surface-muted)]/80 border-b border-[var(--border)] text-[11px] font-semibold text-[var(--foreground-muted)] uppercase">
                <th className="py-2.5 px-3">เลขที่ / โครงการ</th>
                <th className="py-2.5 px-3">หน่วยงาน</th>
                <th className="py-2.5 px-3">กรอบเวลาสัญญา</th>
                <th className="py-2.5 px-3 text-center">สถานะเวลา</th>
                <th className="py-2.5 px-3">ผู้รับผิดชอบ / ค้างที่ใคร</th>
                <th className="py-2.5 px-3 text-right">แอ็กชัน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-muted)] text-[12px]">
              {filteredProjects.map((p) => {
                const isOverdue = p.timelineStatus === 'OVERDUE';
                const isAtRisk = p.timelineStatus === 'AT_RISK';

                return (
                  <tr key={p.id} className="hover:bg-[var(--surface-muted)]/40 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-semibold text-[var(--foreground)] block line-clamp-1">
                        {p.projectName}
                      </span>
                      <span className="text-[10px] text-[var(--foreground-muted)] font-mono">
                        {p.projectNo}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[var(--foreground-muted)]">
                      {p.organizationName}
                    </td>
                    <td className="py-3 px-3 text-[11px]">
                      {p.startDate && p.endDate ? (
                        <div className="space-y-0.5">
                          <span className="text-[var(--foreground)] block tabular-nums">
                            {formatDate(p.startDate)} – {formatDate(p.endDate)}
                          </span>
                          <span className={cn(
                            "text-[10px] font-medium block tabular-nums",
                            isOverdue && "text-red-600 font-bold",
                            isAtRisk && "text-amber-700 font-bold",
                            !isOverdue && !isAtRisk && "text-[var(--foreground-subtle)]"
                          )}>
                            {isOverdue ? `เกินกำหนดสัญญา ${Math.abs(p.daysRemaining)} วัน` : `คงเหลือ ${p.daysRemaining} วัน`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[var(--foreground-subtle)]">ไม่ระบุวันสิ้นสุด</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        p.timelineStatus === 'ON_TRACK' && "bg-emerald-100 text-emerald-800",
                        p.timelineStatus === 'AT_RISK' && "bg-amber-100 text-amber-800",
                        p.timelineStatus === 'OVERDUE' && "bg-red-100 text-red-800 animate-pulse"
                      )}>
                        {p.timelineStatus === 'ON_TRACK' && <CheckCircle2 size={11} />}
                        {p.timelineStatus === 'AT_RISK' && <AlertCircle size={11} />}
                        {p.timelineStatus === 'OVERDUE' && <XCircle size={11} />}
                        {p.timelineStatus === 'ON_TRACK' ? 'ตรงเวลา' : p.timelineStatus === 'AT_RISK' ? 'เสี่ยงล่าช้า' : 'เกินกำหนด'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px]">
                      {p.assignedOfficer ? (
                        <div>
                          <span className="font-semibold text-[var(--foreground)] block">
                            {p.assignedOfficer.officerName}
                          </span>
                          <span className="text-[10px] text-[var(--foreground-muted)] block">
                            {p.assignedOfficer.officerPosition} (ต่อ {p.assignedOfficer.internalPhone})
                          </span>
                        </div>
                      ) : (
                        <span className="text-[var(--foreground-subtle)]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/projects/${p.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[var(--accent)] hover:underline"
                      >
                        <span>เปิดดู</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DialogBody>

      <DialogFooter className="flex justify-between items-center">
        <div className="text-[12px] text-[var(--foreground-muted)]">
          แสดง <span className="font-bold text-[var(--foreground)] tabular-nums">{filteredProjects.length}</span> โครงการ
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 text-[13px] font-medium rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
        >
          ปิดหน้าต่าง
        </button>
      </DialogFooter>
    </Dialog>
  );
}
