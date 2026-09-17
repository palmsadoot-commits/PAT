'use client';

import React, { useState } from 'react';
import { 
  UserCheck, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  X,
  Building2,
  FolderKanban
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatBudgetFull } from '@/lib/utils/format';

interface ReassignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    projectNo: string;
    projectName: string;
    budget: number;
    currentOwnerName?: string;
    currentOwnerId?: string;
  } | null;
  candidates: Array<{
    userId: string;
    fullName: string;
    role: string;
    position: string;
    organizationName: string;
    activeCount: number;
    capacity: number;
    utilization: number;
    workloadStatus: 'HEALTHY' | 'NEAR_CAPACITY' | 'OVERLOADED';
  }>;
  onSuccess: () => void;
}

export function ReassignDialog({
  isOpen,
  onClose,
  project,
  candidates,
  onSuccess,
}: ReassignDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !project) return null;

  // Filter out the current owner from candidate list
  const eligibleCandidates = candidates.filter((c) => c.userId !== project.currentOwnerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error('กรุณาเลือกผู้รับผิดชอบใหม่');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/workload/reassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          newOwnerId: selectedUserId,
          previousOwnerId: project.currentOwnerId,
          reason,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'ไม่สามารถโอนย้ายโครงการได้');
      }

      toast.success('โอนย้ายงานสำเร็จและปรับสมดุลภาระงานเรียบร้อยแล้ว');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error('เกิดข้อผิดพลาด', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCandidate = candidates.find((c) => c.userId === selectedUserId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-muted)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent-muted)] text-[var(--accent)] flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[var(--foreground)]">โอนย้ายงานเพื่อเกลี่ยภาระงาน (Rebalance)</h3>
              <p className="text-[11px] text-[var(--foreground-muted)]">กระจายงานให้บุคลากรที่มีความจุว่างเพื่อลดปัญหาคอขวด</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[var(--foreground-subtle)] hover:text-[var(--foreground)] rounded-[var(--radius-sm)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Project to Reassign */}
        <div className="bg-[var(--surface-muted)] p-3.5 rounded-[var(--radius-md)] border border-[var(--border)] space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-[var(--accent)] bg-[var(--surface)] px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--border)]">
              {project.projectNo}
            </span>
            <span className="font-semibold text-[var(--foreground)] truncate">{project.projectName}</span>
          </div>
          <div className="text-[11px] text-[var(--foreground-muted)] flex items-center gap-3">
            <span>งบประมาณ: <strong className="font-medium text-[var(--foreground)] tabular-nums">{formatBudgetFull(project.budget)}</strong></span>
            {project.currentOwnerName && (
              <span>ผู้รับผิดชอบเดิม: <strong className="font-medium text-[var(--foreground)]">{project.currentOwnerName}</strong></span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Candidate Selection */}
          <div className="space-y-2">
            <label className="block font-semibold text-[var(--foreground)]">
              เลือกผู้รับผิดชอบใหม่ <span className="text-red-500">*</span>
            </label>
            <div className="max-h-52 overflow-y-auto space-y-1.5 border border-[var(--border)] rounded-[var(--radius-md)] p-2">
              {eligibleCandidates.map((c) => {
                const isSelected = selectedUserId === c.userId;
                const isOverloaded = c.workloadStatus === 'OVERLOADED';

                return (
                  <div
                    key={c.userId}
                    onClick={() => setSelectedUserId(c.userId)}
                    className={cn(
                      'p-2.5 rounded-[var(--radius-md)] border transition-all cursor-pointer flex items-center justify-between gap-3',
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--accent-muted)] ring-1 ring-[var(--accent)]'
                        : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)]'
                    )}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--foreground)] truncate">{c.fullName}</span>
                        <span className="text-[10px] text-[var(--foreground-subtle)] bg-[var(--surface-muted)] px-1.5 py-0.5 rounded">
                          {c.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--foreground-muted)] truncate">{c.organizationName}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Capacity Pill */}
                      <span
                        className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full border tabular-nums',
                          isOverloaded
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : c.workloadStatus === 'NEAR_CAPACITY'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        )}
                      >
                        {c.activeCount}/{c.capacity} งาน ({c.utilization}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-[var(--foreground)]">
              เหตุผลหรือหมายเหตุในการโอนย้ายงาน
            </label>
            <textarea
              rows={2}
              placeholder="เช่น เกลี่ยภาระงานเนื่องจากผู้รับผิดชอบเดิมมีโครงการเกินเกณฑ์ความจุ..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)] text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-muted)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-[var(--foreground-muted)] bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] rounded-[var(--radius-md)] transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedUserId}
              className="flex items-center gap-1.5 px-5 py-2 font-semibold text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-[var(--radius-md)] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <span>{submitting ? 'กำลังบันทึก...' : 'ยืนยันโอนย้ายงาน'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
