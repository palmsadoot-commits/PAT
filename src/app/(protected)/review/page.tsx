'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardCheck, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatBudgetFull, formatDate } from '@/lib/utils/format';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'ร่าง', color: 'var(--status-draft)', bg: 'var(--status-draft-bg)' },
  SUBMITTED: { label: 'ยื่นเสนอ', color: 'var(--status-submitted)', bg: 'var(--status-submitted-bg)' },
  DOCUMENT_CHECK: { label: 'ตรวจเอกสาร', color: 'var(--status-checking)', bg: 'var(--status-checking-bg)' },
  UNDER_REVIEW: { label: 'กำลังพิจารณา', color: 'var(--status-review)', bg: 'var(--status-review-bg)' },
  RETURNED: { label: 'ตีกลับแก้ไข', color: 'var(--status-returned)', bg: 'var(--status-returned-bg)' },
  PENDING_APPROVAL: { label: 'รออนุมัติ', color: 'var(--status-pending)', bg: 'var(--status-pending-bg)' },
  APPROVED: { label: 'อนุมัติแล้ว', color: 'var(--status-approved)', bg: 'var(--status-approved-bg)' },
  REJECTED: { label: 'ไม่อนุมัติ', color: 'var(--status-rejected)', bg: 'var(--status-rejected-bg)' },
  IN_PROGRESS: { label: 'กำลังดำเนินการ', color: 'var(--status-progress)', bg: 'var(--status-progress-bg)' },
  COMPLETED: { label: 'เสร็จสิ้น', color: 'var(--status-completed)', bg: 'var(--status-completed-bg)' },
  CANCELLED: { label: 'ยกเลิก', color: 'var(--status-cancelled)', bg: 'var(--status-cancelled-bg)' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  HIGH: { label: 'เร่งด่วน', color: 'text-red-700', dot: 'bg-red-500' },
  MEDIUM: { label: 'ปกติ', color: 'text-amber-700', dot: 'bg-amber-500' },
  LOW: { label: 'ต่ำ', color: 'text-emerald-700', dot: 'bg-emerald-500' },
};

export default function ReviewQueuePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStep, setFilterStep] = useState<string>('ALL');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects?status=SUBMITTED,DOCUMENT_CHECK,UNDER_REVIEW&pageSize=50');
      if (res.ok) {
        const json = await res.json();
        setProjects(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const filteredProjects = projects.filter((p) => {
    if (filterStep === 'ALL') return true;
    return p.status === filterStep;
  });

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <header className="workspace-panel relative overflow-hidden p-5 sm:p-6">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#7c3aed]" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="workspace-eyebrow mb-1">REVIEW DESK</p>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-purple-50 text-purple-700 border border-purple-200">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <h1 className="text-display text-[var(--foreground)]">คิวงานรอตรวจสอบ</h1>
            </div>
            <p className="mt-1 text-[13px] text-[var(--foreground-muted)]">
              รายการที่ยื่นเสนอ ตรวจสอบเอกสาร และอยู่ระหว่างการพิจารณากลั่นกรอง
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[var(--surface-inset)] px-3 py-1.5 text-xs font-bold tabular-nums text-[var(--foreground)] border border-[var(--border)]">
              ทั้งหมด {projects.length} รายการ
            </span>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {[
          { label: 'ทั้งหมด', value: 'ALL', count: projects.length },
          { label: 'ยื่นเสนอ (Submitted)', value: 'SUBMITTED', count: projects.filter(p => p.status === 'SUBMITTED').length },
          { label: 'ตรวจเอกสาร (Document Check)', value: 'DOCUMENT_CHECK', count: projects.filter(p => p.status === 'DOCUMENT_CHECK').length },
          { label: 'กำลังพิจารณา (Under Review)', value: 'UNDER_REVIEW', count: projects.filter(p => p.status === 'UNDER_REVIEW').length },
        ].map((tab) => {
          const isSelected = filterStep === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilterStep(tab.value)}
              className={cn(
                "whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                isSelected
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "bg-[var(--surface)] text-[var(--foreground-muted)] border border-[var(--border)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              )}
            >
              <span>{tab.label}</span>
              <span className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums",
                isSelected ? "bg-white/20 text-white" : "bg-[var(--surface-muted)] text-[var(--foreground-subtle)]"
              )}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Queue List */}
      <section className="workspace-panel overflow-hidden" aria-label="รายการคิวงานตรวจสอบ">
        {loading ? (
          <div className="animate-pulse divide-y divide-[var(--border-muted)]">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-[var(--surface)]" />)}
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-muted)]">
            {filteredProjects.map((p) => {
              const s = STATUS_CONFIG[p.status] || STATUS_CONFIG.DRAFT;
              const pr = PRIORITY_CONFIG[p.priority] || PRIORITY_CONFIG.MEDIUM;
              return (
                <article
                  key={p.id}
                  className="p-4 sm:p-5 transition-colors hover:bg-[var(--surface-inset)] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="case-id">
                        {p.projectNo || p.id}
                      </span>
                      <span className="status-chip" style={{ color: s.color, backgroundColor: s.bg }}>
                        {s.label}
                      </span>
                      <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold", pr.color)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", pr.dot, p.priority === 'HIGH' && 'animate-ping')} />
                        {pr.label}
                      </span>
                    </div>

                    <Link
                      href={`/projects/${p.id}`}
                      className="text-[15px] font-bold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors block line-clamp-1"
                    >
                      {p.projectName}
                    </Link>

                    <div className="text-[11px] text-[var(--foreground-muted)] flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>หน่วยงาน: <strong className="font-semibold text-[var(--foreground)]">{p.organizationName || '-'}</strong></span>
                      <span>•</span>
                      <span>ผู้รับผิดชอบ: {p.ownerName || '-'}</span>
                      <span>•</span>
                      <span className="tabular-nums font-bold text-[var(--foreground)]">
                        {formatBudgetFull(p.budget)}
                      </span>
                      <span>•</span>
                      <span>ยื่นเมื่อ {formatDate(p.createdAt)}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-end">
                    <Link
                      href={`/projects/${p.id}`}
                      className="inline-flex h-9 items-center gap-1.5 px-3.5 text-[12px] font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-[var(--radius-md)] shadow-xs transition-colors"
                    >
                      <span>เปิดตรวจสอบ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}

            {!filteredProjects.length && (
              <div className="py-16 text-center text-[var(--foreground-muted)] text-[13px]">
                <ClipboardCheck className="w-9 h-9 mx-auto mb-2 text-[var(--foreground-subtle)] opacity-40" />
                <p className="font-semibold text-[var(--foreground)]">ไม่มีโครงการในคิวงานรอตรวจสอบขั้นตอนนี้</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
