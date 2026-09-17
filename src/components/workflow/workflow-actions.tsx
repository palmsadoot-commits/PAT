'use client';

import React, { useState } from 'react';
import { 
  Check, 
  X, 
  ArrowLeftRight, 
  Send, 
  FileCheck, 
  FileX, 
  CheckCircle2, 
  Play, 
  Award,
  Ban,
  Inbox
} from 'lucide-react';
import type { ProjectStatus } from '../projects/status-badge';

export type ActionType = 
  | 'SUBMIT' 
  | 'RECEIVE'
  | 'DOCS_COMPLETE' 
  | 'DOCS_INCOMPLETE' 
  | 'REVIEW_COMPLETE' 
  | 'REVIEW_RETURN' 
  | 'APPROVE' 
  | 'REJECT' 
  | 'RETURN' 
  | 'START' 
  | 'COMPLETE' 
  | 'CANCEL' 
  | 'RESUBMIT';

export type WorkflowActionType = ActionType;

interface WorkflowActionsProps {
  projectId: string;
  currentStatus: ProjectStatus;
  userRole: string;
  onAction: (action: ActionType, comment?: string) => Promise<void>;
  loading?: boolean;
}

export function WorkflowActions({ projectId, currentStatus, userRole, onAction, loading = false }: WorkflowActionsProps) {
  const [activeModal, setActiveModal] = useState<{
    action: ActionType;
    label: string;
    requiresComment: boolean;
    color: string;
  } | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Determine allowed actions based on workflow transition map
  const getActions = () => {
    const actions: { action: ActionType; label: string; icon: any; variant: string; requiresComment: boolean }[] = [];

    const isSuperAdmin = userRole === 'SUPER_ADMIN';
    const isAdmin = userRole === 'ADMIN' || isSuperAdmin;
    const isOfficer = userRole === 'OFFICER' || isAdmin;
    const isReviewer = userRole === 'REVIEWER' || isAdmin;
    const isApprover = userRole === 'APPROVER' || isSuperAdmin;
    const isOwner = userRole === 'PROJECT_OWNER' || isAdmin;

    if (currentStatus === 'DRAFT' && (isOwner || isOfficer)) {
      actions.push({
        action: 'SUBMIT',
        label: 'ส่งขออนุมัติโครงการ',
        icon: Send,
        variant: 'bg-blue-600 hover:bg-blue-700 text-white',
        requiresComment: false,
      });
      actions.push({
        action: 'CANCEL',
        label: 'ยกเลิกโครงการ',
        icon: Ban,
        variant: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300',
        requiresComment: true,
      });
    }

    if (currentStatus === 'SUBMITTED' && isOfficer) {
      actions.push({
        action: 'RECEIVE',
        label: 'รับเรื่องเพื่อตรวจเอกสาร',
        icon: Inbox,
        variant: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        requiresComment: false,
      });
      actions.push({
        action: 'CANCEL',
        label: 'ยกเลิกโครงการ',
        icon: Ban,
        variant: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300',
        requiresComment: true,
      });
    }

    if (currentStatus === 'DOCUMENT_CHECK' && (isReviewer || isOfficer)) {
      actions.push({
        action: 'DOCS_COMPLETE',
        label: 'เอกสารครบถ้วน (ส่งต่อพิจารณา)',
        icon: FileCheck,
        variant: 'bg-purple-600 hover:bg-purple-700 text-white',
        requiresComment: false,
      });
      actions.push({
        action: 'DOCS_INCOMPLETE',
        label: 'เอกสารไม่ครบ (ตีกลับแก้ไข)',
        icon: FileX,
        variant: 'bg-amber-600 hover:bg-amber-700 text-white',
        requiresComment: true,
      });
    }

    if (currentStatus === 'UNDER_REVIEW' && isReviewer) {
      actions.push({
        action: 'REVIEW_COMPLETE',
        label: 'พิจารณาเรียบร้อย (เสนอผู้มีอำนาจ)',
        icon: CheckCircle2,
        variant: 'bg-orange-600 hover:bg-orange-700 text-white',
        requiresComment: false,
      });
      actions.push({
        action: 'REVIEW_RETURN',
        label: 'ตีกลับโครงการให้ปรับปรุง',
        icon: ArrowLeftRight,
        variant: 'bg-amber-600 hover:bg-amber-700 text-white',
        requiresComment: true,
      });
    }

    if (currentStatus === 'PENDING_APPROVAL' && isApprover) {
      actions.push({
        action: 'APPROVE',
        label: 'อนุมัติโครงการ',
        icon: Check,
        variant: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs',
        requiresComment: false,
      });
      actions.push({
        action: 'RETURN',
        label: 'ตีกลับเพื่อทบทวน',
        icon: ArrowLeftRight,
        variant: 'bg-amber-600 hover:bg-amber-700 text-white',
        requiresComment: true,
      });
      actions.push({
        action: 'REJECT',
        label: 'ไม่อนุมัติโครงการ',
        icon: X,
        variant: 'bg-red-600 hover:bg-red-700 text-white',
        requiresComment: true,
      });
    }

    if (currentStatus === 'RETURNED' && (isOwner || isOfficer)) {
      actions.push({
        action: 'RESUBMIT',
        label: 'ส่งคำขอใหม่หลังแก้ไข',
        icon: Send,
        variant: 'bg-blue-600 hover:bg-blue-700 text-white',
        requiresComment: false,
      });
      actions.push({
        action: 'CANCEL',
        label: 'ยกเลิกโครงการ',
        icon: Ban,
        variant: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
        requiresComment: true,
      });
    }

    if (currentStatus === 'APPROVED' && isOfficer) {
      actions.push({
        action: 'START',
        label: 'เริ่มดำเนินโครงการ',
        icon: Play,
        variant: 'bg-cyan-600 hover:bg-cyan-700 text-white',
        requiresComment: false,
      });
    }

    if (currentStatus === 'IN_PROGRESS' && isOfficer) {
      actions.push({
        action: 'COMPLETE',
        label: 'บันทึกเสร็จสิ้นโครงการ',
        icon: Award,
        variant: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        requiresComment: false,
      });
    }

    return actions;
  };

  const actions = getActions();
  if (actions.length === 0) return null;

  const handleSubmit = async () => {
    if (!activeModal) return;
    if (activeModal.requiresComment && !comment.trim()) {
      alert('กรุณาระบุเหตุผลหรือข้อคิดเห็น');
      return;
    }

    try {
      setSubmitting(true);
      await onAction(activeModal.action, comment.trim());
      setActiveModal(null);
      setComment('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="workspace-panel p-4 sm:p-5" aria-labelledby="workflow-actions-title">
        <div id="workflow-actions-title" className="workspace-eyebrow mb-3">
          การดำเนินการในขั้นตอนนี้
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.action}
                disabled={loading || submitting}
                onClick={() => {
                  if (act.requiresComment || act.action === 'APPROVE' || act.action === 'CANCEL') {
                    setActiveModal({
                      action: act.action,
                      label: act.label,
                      requiresComment: act.requiresComment,
                      color: act.variant,
                    });
                  } else {
                    onAction(act.action);
                  }
                }}
                className={`flex h-9 items-center gap-2 rounded-[var(--radius-md)] px-3.5 text-[12px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ${act.variant} disabled:opacity-50`}
              >
                <Icon className="w-4 h-4" />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Confirmation & Comment Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#081d2a]/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-overlay)] sm:p-6">
            <div>
              <p className="workspace-eyebrow mb-1.5">ยืนยันการทำรายการ</p>
              <h3 className="text-lg font-bold text-[var(--foreground)]">{activeModal.label}</h3>
              <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                {activeModal.requiresComment 
                  ? 'กรุณากรอกเหตุผลหรือข้อเสนอแนะในการดำเนินการนี้ (จำเป็นต้องระบุ)'
                  : 'ยืนยันการดำเนินการสำหรับโครงการนี้'}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--foreground)]">
                ข้อคิดเห็น / เหตุผลประกอบ {activeModal.requiresComment && <span className="text-red-500">*</span>}
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={activeModal.requiresComment ? 'ระบุเหตุผลในการดำเนินการ เช่น เอกสารแนบไม่ครบถ้วน...' : 'ข้อคิดเห็นเพิ่มเติม (ไม่บังคับ)'}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)] p-3 text-xs leading-relaxed text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent)]/15"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[var(--border-muted)] pt-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setActiveModal(null);
                  setComment('');
                }}
                className="h-9 rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-3.5 text-xs font-semibold text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-muted)]"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={submitting || (activeModal.requiresComment && !comment.trim())}
                onClick={handleSubmit}
                className={`h-9 rounded-[var(--radius-md)] px-3.5 text-xs font-bold text-white transition-all ${
                  activeModal.action === 'REJECT' || activeModal.action === 'CANCEL' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : activeModal.action === 'RETURN' || activeModal.action === 'DOCS_INCOMPLETE' || activeModal.action === 'REVIEW_RETURN'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-50`}
              >
                {submitting ? 'กำลังบันทึก...' : 'ยืนยันการทำรายการ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
