'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  Wallet, 
  Search, 
  AlertCircle, 
  Check, 
  X, 
  ArrowLeftRight, 
  Clock,
  Sparkles,
  Building2,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatBudgetFull, formatDate } from '@/lib/utils/format';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_APPROVAL: { label: 'รออนุมัติ', color: 'var(--status-pending)', bg: 'var(--status-pending-bg)' },
  DRAFT: { label: 'ร่าง', color: 'var(--status-draft)', bg: 'var(--status-draft-bg)' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  HIGH: { label: 'เร่งด่วน', color: 'text-[var(--danger)]', dot: 'bg-[var(--danger)]' },
  MEDIUM: { label: 'ปกติ', color: 'text-[var(--warning)]', dot: 'bg-[var(--warning)]' },
  LOW: { label: 'ต่ำ', color: 'text-[var(--foreground-muted)]', dot: 'bg-[var(--foreground-subtle)]' },
};

export default function ApprovalQueuePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Action modal
  const [actionModal, setActionModal] = useState<{
    project: any;
    action: 'APPROVE' | 'RETURN' | 'REJECT';
  } | null>(null);
  const [comment, setComment] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects?status=PENDING_APPROVAL&pageSize=50');
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

  const handleExecuteAction = async () => {
    if (!actionModal) return;
    if ((actionModal.action === 'RETURN' || actionModal.action === 'REJECT') && !comment.trim()) {
      toast.error('กรุณาระบุเหตุผลในการตีกลับหรือไม่อนุมัติ');
      return;
    }

    try {
      setSubmittingAction(true);
      const res = await fetch(`/api/projects/${actionModal.project.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionModal.action,
          comment: comment.trim(),
          version: actionModal.project.version,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'ไม่สามารถดำเนินการได้');
      }

      toast.success(
        actionModal.action === 'APPROVE' 
          ? 'อนุมัติโครงการเรียบร้อยแล้ว' 
          : actionModal.action === 'RETURN' 
          ? 'ตีกลับโครงการเรียบร้อยแล้ว' 
          : 'บันทึกไม่อนุมัติโครงการเรียบร้อยแล้ว'
      );
      setActionModal(null);
      setComment('');
      await fetchQueue();
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchSearch = !search.trim() || 
      p.projectName?.toLowerCase().includes(search.toLowerCase()) || 
      p.projectNo?.toLowerCase().includes(search.toLowerCase()) ||
      p.organizationName?.toLowerCase().includes(search.toLowerCase());
    const matchPriority = !priorityFilter || p.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  const totalPendingBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
  const urgentCount = projects.filter((p) => p.priority === 'HIGH').length;

  return (
    <div className="space-y-5 pb-16">
      {/* Executive Header */}
      <header className="workspace-panel relative overflow-hidden p-5 sm:p-6">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[var(--accent)]" />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="pl-1">
            <p className="workspace-eyebrow mb-1">EXECUTIVE APPROVAL DESK</p>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-muted)] text-[var(--accent)]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h1 className="text-display text-[var(--foreground)]">คิวอนุมัติโครงการ</h1>
            </div>
            <p className="mt-1 text-[13px] text-[var(--foreground-muted)]">
              รายการที่ผ่านการกลั่นกรองและรอการตัดสินใจของผู้มีอำนาจอนุมัติ
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)] px-4 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">โครงการในคิว</p>
              <p className="text-lg font-bold tabular-nums text-[var(--foreground)] mt-0.5">{projects.length} รายการ</p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)] px-4 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--danger)]">เร่งด่วน (High)</p>
              <p className="text-lg font-bold tabular-nums text-[var(--danger)] mt-0.5">{urgentCount} รายการ</p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)] px-4 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-foreground)]">งบประมาณรวม</p>
              <p className="text-lg font-bold tabular-nums text-[var(--foreground)] mt-0.5">{formatBudgetFull(totalPendingBudget)}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Filter Section */}
      <section className="workspace-panel p-3 sm:p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อโครงการ, เลขที่, หน่วยงาน..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)] py-1.5 pl-9 pr-3 text-[13px] text-[var(--foreground)] outline-none transition-all focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent)]/15"
          />
        </div>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-9 min-w-[130px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)] px-3 text-[13px] text-[var(--foreground)] outline-none transition-all focus:border-[var(--accent)] focus:bg-white cursor-pointer"
        >
          <option value="">ทุกความเร่งด่วน</option>
          <option value="HIGH">เร่งด่วน (High)</option>
          <option value="MEDIUM">ปกติ (Medium)</option>
          <option value="LOW">ต่ำ (Low)</option>
        </select>
      </section>

      {/* Queue List */}
      <section className="workspace-panel overflow-hidden" aria-labelledby="approval-queue-heading">
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-inset)] px-4 py-3 sm:px-5">
          <div>
            <h2 id="approval-queue-heading" className="text-[14px] font-bold text-[var(--foreground)]">รายการรอพิจารณา</h2>
            <p className="mt-0.5 text-[11px] text-[var(--foreground-muted)]">ตรวจสอบรายละเอียดและดำเนินการอนุมัติ</p>
          </div>
          <span className="rounded-full bg-[var(--accent-muted)] px-2.5 py-1 text-[11px] font-bold tabular-nums text-[var(--accent-foreground)]">
            {filteredProjects.length} รายการ
          </span>
        </div>

        {loading ? (
          <div className="animate-pulse divide-y divide-[var(--border-muted)]">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-[var(--surface)]" />)}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="divide-y divide-[var(--border-muted)]">
            {filteredProjects.map((p) => {
              const status = STATUS_CONFIG[p.status] || STATUS_CONFIG.DRAFT;
              const priority = PRIORITY_CONFIG[p.priority] || PRIORITY_CONFIG.MEDIUM;
              return (
                <article key={p.id} className="p-4 sm:p-5 transition-colors hover:bg-[var(--surface-inset)]">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="min-w-0 space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="case-id">{p.projectNo || p.id}</span>
                        <span className="status-chip" style={{ color: status.color, backgroundColor: status.bg }}>{status.label}</span>
                        <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-bold', priority.color)}>
                          <span className={cn('h-1.5 w-1.5 rounded-full', priority.dot, p.priority === 'HIGH' && 'animate-ping')} />
                          {priority.label}
                        </span>
                        <span className="text-[11px] text-[var(--foreground-subtle)]">ปี {p.fiscalYear}</span>
                      </div>

                      <Link href={`/projects/${p.id}`} className="block text-[15px] font-bold text-[var(--foreground)] transition-colors hover:text-[var(--accent)] line-clamp-1">
                        {p.projectName}
                      </Link>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--foreground-muted)]">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-[var(--foreground-subtle)]" />
                          <span>{p.organizationName || '-'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-[var(--foreground-subtle)]" />
                          <span>ผู้รับผิดชอบ: <strong className="font-semibold text-[var(--foreground)]">{p.ownerName || '-'}</strong></span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[var(--foreground-subtle)]" />
                          <span>ยื่นเมื่อ {formatDate(p.createdAt)}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--border-muted)]">
                      <div className="text-left lg:text-right pr-2">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">งบประมาณ</span>
                        <p className="text-[15px] font-bold tabular-nums text-[var(--foreground)]">{formatBudgetFull(p.budget)}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActionModal({ project: p, action: 'RETURN' })}
                          className="h-9 px-3 text-[12px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-[var(--radius-md)] transition-colors cursor-pointer"
                          title="ตีกลับเพื่อแก้ไข"
                        >
                          ตีกลับ
                        </button>
                        <button
                          type="button"
                          onClick={() => setActionModal({ project: p, action: 'APPROVE' })}
                          className="h-9 px-3.5 text-[12px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-[var(--radius-md)] transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                          title="อนุมัติโครงการ"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>อนุมัติ</span>
                        </button>
                        <Link 
                          href={`/projects/${p.id}`} 
                          className="h-9 w-9 flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-white text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] transition-colors"
                          title="เปิดดูรายละเอียดเต็ม"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-[var(--success)]" />
            <h2 className="mt-3 text-[15px] font-bold text-[var(--foreground)]">ไม่มีรายการรออนุมัติ</h2>
            <p className="mt-1 text-[12px] text-[var(--foreground-muted)]">คิวงานได้รับการจัดการครบถ้วนแล้ว</p>
          </div>
        )}
      </section>

      {/* Fast Action Modal for Executive */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#081d2a]/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-5 sm:p-6 shadow-[var(--shadow-overlay)]">
            <div className="border-b border-[var(--border-muted)] pb-3">
              <p className="workspace-eyebrow mb-1">
                {actionModal.action === 'APPROVE' ? 'ยืนยันการอนุมัติโครงการ' : 'ระบุเหตุผลการดำเนินการ'}
              </p>
              <h3 className="text-base font-bold text-[var(--foreground)]">
                {actionModal.project.projectName}
              </h3>
              <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                เลขที่: {actionModal.project.projectNo || actionModal.project.id} · งบประมาณ {formatBudgetFull(actionModal.project.budget)}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">
                {actionModal.action === 'APPROVE' ? 'บันทึกข้อคิดเห็นหรือคำสั่งการเพิ่มเติม (ไม่บังคับ)' : 'เหตุผลและข้อเสนอแนะในการตีกลับ *'}
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={actionModal.action === 'APPROVE' ? 'ระบุข้อคิดเห็น (หากมี)...' : 'กรุณาระบุจุดที่ต้องแก้ไขและเอกสารที่ต้องแนบเพิ่ม...'}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)] p-3 text-xs leading-relaxed text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent)]/15"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[var(--border-muted)] pt-3">
              <button
                type="button"
                disabled={submittingAction}
                onClick={() => {
                  setActionModal(null);
                  setComment('');
                }}
                className="h-9 rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 text-xs font-semibold text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-muted)] cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={submittingAction || (actionModal.action !== 'APPROVE' && !comment.trim())}
                onClick={handleExecuteAction}
                className={cn(
                  "h-9 rounded-[var(--radius-md)] px-4 text-xs font-bold text-white transition-all cursor-pointer shadow-xs disabled:opacity-50",
                  actionModal.action === 'APPROVE' 
                    ? "bg-emerald-600 hover:bg-emerald-700" 
                    : "bg-amber-600 hover:bg-amber-700"
                )}
              >
                {submittingAction ? 'กำลังบันทึก...' : actionModal.action === 'APPROVE' ? 'ยืนยันอนุมัติโครงการ' : 'ยืนยันตีกลับเพื่อแก้ไข'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
