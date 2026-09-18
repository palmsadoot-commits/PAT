'use client';

import React, { useState } from 'react';
import { X, ExternalLink, FileText, CheckCircle2, AlertTriangle, GitCommit, ShieldCheck, Scale, Eye } from 'lucide-react';
import { RtmTraceabilityItem } from '@/types/procurement';
import { cn } from '@/lib/utils';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: RtmTraceabilityItem | null;
  projectNameTh: string;
}

export function EvidenceDrawer({ isOpen, onClose, item, projectNameTh }: EvidenceDrawerProps) {
  const [activeTab, setActiveTab] = useState<'evidence' | 'comparison'>('evidence');

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl h-full flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--surface-muted)]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                {item.torReqCode}
              </span>
              <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                งวดที่ {item.milestoneNo}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[var(--foreground)] line-clamp-1">
              {item.requirementTitleTh}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-[var(--foreground-muted)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-[var(--border)] px-5 bg-[var(--surface)]">
          <button
            onClick={() => setActiveTab('evidence')}
            className={cn(
              "py-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer",
              activeTab === 'evidence'
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            )}
          >
            หลักฐานเชิงประจักษ์ (Evidence Details)
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={cn(
              "py-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer",
              activeTab === 'comparison'
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            )}
          >
            เปรียบเทียบ ๔ ด้าน (4-Way Comparison)
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'evidence' ? (
            <div className="space-y-4">
              {/* Evidence Card */}
              <div className="workspace-panel p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                    เอกสาร/บันทึกการส่งมอบ
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                    item.verdict === 'PASS' ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                    item.verdict === 'FAIL' ? "bg-red-50 text-red-800 border-red-200" :
                    "bg-amber-50 text-amber-800 border-amber-200"
                  )}>
                    ผลตรวจ: {item.verdict}
                  </span>
                </div>

                <div className="p-3 bg-[var(--surface-muted)] rounded-[var(--radius-md)] border border-[var(--border)] flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <div className="space-y-1 flex-1">
                    <p className="text-xs font-bold text-[var(--foreground)]">
                      {item.evidenceFileName || item.evidenceRef || 'ยังไม่มีไฟล์หลักฐานแนบ'}
                    </p>
                    <p className="text-[11px] text-[var(--foreground-muted)]">
                      ประเภทหลักฐาน: <span className="font-semibold">{item.evidenceType}</span>
                    </p>
                    {item.evidenceRef && (
                      <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 pt-1 font-mono">
                        <ExternalLink className="w-3 h-3" />
                        <span>Ref ID: {item.evidenceRef}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Acceptance Criteria & Test Case */}
              <div className="workspace-panel p-4 space-y-3">
                <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>เกณฑ์การตรวจรับตามสัญญา (Acceptance Criteria)</span>
                </h4>
                <p className="text-xs text-[var(--foreground-muted)] leading-relaxed p-2.5 bg-[var(--surface-inset)] rounded border border-[var(--border-muted)]">
                  {item.acceptanceCriteriaTh}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-[var(--foreground-muted)] block">รหัสกรณีทดสอบ (Test Case ID):</span>
                    <span className="font-mono font-bold text-[var(--foreground)]">{item.testCaseId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--foreground-muted)] block">ผลการทดสอบ:</span>
                    <span className={cn(
                      "font-bold",
                      item.testResult === 'PASS' ? "text-emerald-600" : "text-red-600"
                    )}>
                      {item.testResult}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inspector Review Notes */}
              <div className="workspace-panel p-4 space-y-2">
                <span className="text-[11px] font-bold text-[var(--foreground)] block">
                  บันทึกความเห็นของกรรมการตรวจรับ:
                </span>
                <p className="text-xs text-[var(--foreground-muted)] leading-relaxed italic">
                  "{item.inspectorNotesTh || 'ไม่มีบันทึกเพิ่มเติม'}"
                </p>
                {item.reviewedBy && (
                  <p className="text-[10px] text-right text-[var(--foreground-subtle)] pt-1">
                    ตรวจรับรองโดย: <strong>{item.reviewedBy}</strong> ({item.reviewedAt ? new Date(item.reviewedAt).toLocaleDateString('th-TH') : '-'})
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* 4-Way Comparison View */
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-[var(--radius-md)] text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
                <strong>เครื่องมือเปรียบเทียบ ๔ ด้าน:</strong> ตรวจสอบความสอดคล้องระหว่างข้อกำหนดใน TOR, ข้อความในสัญญา, คำขอเปลี่ยนแปลง (Change Order) และงานที่ส่งมอบจริง เพื่อป้องกันการรับมอบที่ไม่ตรงสเปก
              </div>

              <div className="grid grid-cols-1 gap-3">
                {/* 1. TOR Specification */}
                <div className="p-3 rounded-[var(--radius-md)] border border-neutral-200 dark:border-neutral-800 bg-[var(--surface-muted)] space-y-1">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                    ๑. ข้อกำหนดใน TOR (Baseline Spec)
                  </span>
                  <p className="text-xs font-semibold text-[var(--foreground)]">
                    [{item.torReqCode}] {item.requirementTitleTh}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {item.acceptanceCriteriaTh}
                  </p>
                </div>

                {/* 2. Contract Clause */}
                <div className="p-3 rounded-[var(--radius-md)] border border-blue-200 dark:border-blue-900/60 bg-blue-50/20 space-y-1">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
                    ๒. ข้อความตามสัญญาจ้าง (Contract Clause)
                  </span>
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                    {item.contractClause}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    งวดงานที่ {item.milestoneNo} ({item.milestoneTitleTh})
                  </p>
                </div>

                {/* 3. Change Order */}
                <div className="p-3 rounded-[var(--radius-md)] border border-amber-200 dark:border-amber-900/60 bg-amber-50/20 space-y-1">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                    ๓. การเปลี่ยนแปลงที่อนุมัติ (Change Order / CCB)
                  </span>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    ไม่มีการขอเปลี่ยนแปลงข้อกำหนดในข้อนี้ (คงตาม Baseline เดิม ๑๐๐%)
                  </p>
                </div>

                {/* 4. Actual Deliverable */}
                <div className="p-3 rounded-[var(--radius-md)] border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                    ๔. งานที่ส่งมอบจริง (Actual Deliverable & Evidence)
                  </span>
                  <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                    {item.evidenceFileName || item.evidenceRef}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    ผลทดสอบ: {item.testResult} | มติกรรมการ: <strong>{item.verdict}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-muted)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold hover:bg-[var(--surface-inset)] cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
