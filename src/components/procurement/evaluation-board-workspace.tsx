'use client';

import React, { useState } from 'react';
import { 
  Users, 
  CheckSquare, 
  Award, 
  AlertCircle, 
  FileText, 
  ShieldAlert, 
  TrendingUp, 
  Scale, 
  Clock, 
  CheckCircle2, 
  XCircle,
  MessageSquare
} from 'lucide-react';
import { ProcurementGovernanceWorkspace, BidderEvaluationRecord } from '@/types/procurement';
import { formatBudgetFull } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EvaluationBoardWorkspaceProps {
  workspace: ProcurementGovernanceWorkspace;
  onRefresh: () => void;
  onOpenFormModal: (type: 'APPOINTMENT_ORDER' | 'CONFLICT_DECLARATION' | 'EVALUATION_REPORT') => void;
}

export function EvaluationBoardWorkspace({ workspace, onRefresh, onOpenFormModal }: EvaluationBoardWorkspaceProps) {
  const evalRes = workspace.evaluationResolution;
  const committee = workspace.evaluationCommittee;

  const [selectedBidder, setSelectedBidder] = useState<BidderEvaluationRecord | null>(
    evalRes?.bidders[0] || null
  );
  const [techScoreInput, setTechScoreInput] = useState<number>(selectedBidder?.technicalScore || 85);
  const [priceScoreInput, setPriceScoreInput] = useState<number>(selectedBidder?.priceScore || 40);
  const [savingScore, setSavingScore] = useState(false);
  const [approving, setApproving] = useState(false);

  // Check separation of duties
  const acceptanceMemberNames = (workspace.acceptanceCommittee?.members || []).map(m => m.fullName.trim());
  const conflictedMembers = (committee?.members || []).filter(m => acceptanceMemberNames.includes(m.fullName.trim()));
  const hasRoleConflict = conflictedMembers.length > 0;

  const handleSaveScore = async () => {
    if (!selectedBidder) return;
    try {
      setSavingScore(true);
      const res = await fetch(`/api/procurement/${workspace.projectId}/evaluation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_BIDDER_SCORE',
          bidderId: selectedBidder.id,
          technicalScore: techScoreInput,
          priceScore: priceScoreInput
        })
      });

      if (!res.ok) throw new Error('เกิดข้อผิดพลาดในการบันทึกคะแนน');
      toast.success('บันทึกคะแนนและคำนวณลำดับที่สำเร็จ');
      onRefresh();
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    } finally {
      setSavingScore(false);
    }
  };

  const handleApproveResolution = async () => {
    if (hasRoleConflict) {
      toast.error('ไม่สามารถอนุมัติได้: มีข้อขัดแย้งของกรรมการตามข้อ ๒๖');
      return;
    }

    try {
      setApproving(true);
      const res = await fetch(`/api/procurement/${workspace.projectId}/evaluation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE_RESOLUTION' })
      });

      if (!res.ok) throw new Error('เกิดข้อผิดพลาดในการอนุมัติผล');
      toast.success('หัวหน้าหน่วยงานอนุมัติผลสั่งซื้อสั่งจ้างเรียบร้อยแล้ว เข้าสู่ขั้นตอนทำสัญญา');
      onRefresh();
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="workspace-panel p-5 bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-transparent border-purple-200/80 dark:border-purple-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-[var(--foreground)]">
                  โมดูล B: คณะกรรมการพิจารณาผลการจัดซื้อจัดจ้าง (Evaluation Committee Workspace)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/40 dark:text-purple-300">
                  ระเบียบ กค. ๒๕๖๐ ข้อ ๕๕
                </span>
              </div>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                ตรวจคุณสมบัติ การสมยอมราคา (Anti-Collusion), ประเมินคะแนนเทคนิค-ราคา และบังคับการแยกบทบาทตามข้อ ๒๖
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onOpenFormModal('APPOINTMENT_ORDER')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-muted)] cursor-pointer text-[var(--foreground)] shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>คำสั่งพิจารณาผล (SLA ๗ วัน)</span>
            </button>
            <button
              onClick={() => onOpenFormModal('EVALUATION_REPORT')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 cursor-pointer shadow-sm"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>รายงานขออนุมัติสั่งจ้าง (ข้อ ๕๕)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role Separation Alert Banner (ข้อ ๒๖) */}
      {hasRoleConflict ? (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-[var(--radius-xl)] flex items-start gap-3 text-red-900 dark:text-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-sm">ตรวจพบข้อขัดแย้งของบทบาทตามระเบียบกระทรวงการคลังฯ ข้อ ๒๖</h4>
            <p>
              พบว่ามีรายชื่อบุคคลเป็นทั้ง <strong>กรรมการพิจารณาผล</strong> และ <strong>กรรมการตรวจรับพัสดุ</strong> ในโครงการเดียวกัน:
            </p>
            <ul className="list-disc list-inside font-semibold pl-2">
              {conflictedMembers.map(m => (
                <li key={m.id}>{m.fullName} ({m.position})</li>
              ))}
            </ul>
            <p className="text-[11px] text-red-700 dark:text-red-400">
              *ระเบียบข้อ ๒๖ วรรคท้าย ห้ามมิให้แต่งตั้งกรรมการพิจารณาผลเป็นกรรมการตรวจรับพัสดุ ต้องทำการแก้ไขคำสั่งแต่งตั้งก่อนอนุมัติผลสั่งจ้าง*
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-[var(--radius-lg)] flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>ผ่านการตรวจสอบการแยกหน้าที่ (Separation of Duties): ไม่พบรายชื่อซ้ำซ้อนกับคณะกรรมการตรวจรับพัสดุ</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">สอดคล้องระเบียบ ข้อ ๒๖</span>
        </div>
      )}

      {/* SLA Status Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="workspace-panel p-4 space-y-1">
          <span className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">
            กรอบเวลาพิจารณาผล (SLA)
          </span>
          <p className="text-xl font-bold text-[var(--foreground)]">
            {evalRes?.slaDaysAllowed || 7} วันทำการ
          </p>
          <span className="text-[10px] text-[var(--foreground-muted)] block">
            ใช้เวลาจริง: {evalRes?.actualDaysUsed || 5} วัน (ทันกำหนดเวลา)
          </span>
        </div>

        <div className="workspace-panel p-4 space-y-1">
          <span className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">
            วิธีจัดซื้อจัดจ้าง
          </span>
          <p className="text-xl font-bold text-purple-700 dark:text-purple-400">
            {workspace.procurementMethod}
          </p>
          <span className="text-[10px] text-[var(--foreground-muted)] block">
            เกณฑ์ Price-Performance (เทคนิค ๖๐% / ราคา ๔๐%)
          </span>
        </div>

        <div className="workspace-panel p-4 space-y-1">
          <span className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">
            ผู้ชนะการเสนอราคา
          </span>
          <p className="text-sm font-bold text-[var(--foreground)] line-clamp-1">
            {evalRes?.winningBidderName || 'อยู่ระหว่างพิจารณา'}
          </p>
          <span className="text-xs font-mono font-bold text-emerald-600 block">
            {evalRes ? formatBudgetFull(evalRes.awardedPriceBaht) : 0} บาท
          </span>
        </div>
      </div>

      {/* Bidders Evaluation & Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bidders List */}
        <div className="lg:col-span-1 workspace-panel p-4 space-y-3">
          <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
            รายชื่อผู้ยื่นข้อเสนอ ({evalRes?.bidders.length || 0} ราย)
          </h3>
          <div className="space-y-2">
            {evalRes?.bidders.map((bidder, idx) => (
              <button
                key={bidder.id}
                onClick={() => {
                  setSelectedBidder(bidder);
                  setTechScoreInput(bidder.technicalScore);
                  setPriceScoreInput(bidder.priceScore);
                }}
                className={cn(
                  "w-full text-left p-3 rounded-[var(--radius-lg)] border transition-all cursor-pointer space-y-1.5",
                  selectedBidder?.id === bidder.id
                    ? "border-purple-500 bg-purple-50/40 dark:bg-purple-950/20 shadow-xs"
                    : "border-[var(--border)] bg-[var(--surface-muted)] hover:border-[var(--border-strong)]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--surface-inset)] text-[var(--foreground-muted)]">
                    ลำดับที่ {idx + 1}
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--foreground)]">
                    {formatBudgetFull(bidder.quotedPriceBaht)} ฿
                  </span>
                </div>
                <p className="text-xs font-bold text-[var(--foreground)] line-clamp-1">
                  {bidder.bidderNameTh}
                </p>
                <div className="flex items-center justify-between text-[11px] text-[var(--foreground-muted)] pt-1">
                  <span>คะแนนรวม: <strong className="text-purple-700 dark:text-purple-400">{bidder.totalCombinedScore}</strong></span>
                  <span className={bidder.isDisqualified ? "text-red-600 font-bold" : "text-emerald-600 font-bold"}>
                    {bidder.isDisqualified ? 'ตกเกณฑ์' : 'ผ่านคุณสมบัติ'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Bidder Detail & Verification Checklists */}
        {selectedBidder && (
          <div className="lg:col-span-2 space-y-4">
            <div className="workspace-panel p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)]">
                    {selectedBidder.bidderNameTh}
                  </h3>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    เลขประจำตัวผู้เสียภาษี: <span className="font-mono">{selectedBidder.bidderTaxId}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[var(--foreground-muted)] block">ราคาที่เสนอ:</span>
                  <span className="text-base font-black font-mono text-emerald-600">
                    {formatBudgetFull(selectedBidder.quotedPriceBaht)} บาท
                  </span>
                </div>
              </div>

              {/* Qualification Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <span>การตรวจสอบคุณสมบัติและเอกสารหลักฐาน (Qualification Check)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedBidder.qualificationChecks.map(qc => (
                    <div key={qc.criterionId} className="p-2.5 rounded bg-[var(--surface-muted)] border border-[var(--border)] flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-[var(--foreground)]">{qc.titleTh}</p>
                        <p className="text-[11px] text-[var(--foreground-muted)]">{qc.descriptionTh}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anti-Collusion Checklist */}
              <div className="space-y-2 pt-2 border-t border-[var(--border-muted)]">
                <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  <span>การตรวจสอบการมีผลประโยชน์ร่วมกัน / การสมยอมราคา (Anti-Collusion & Joint Interest)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedBidder.collusionChecks.map(cc => (
                    <div key={cc.criterionId} className="p-2.5 rounded bg-[var(--surface-muted)] border border-[var(--border)] flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-[var(--foreground)]">{cc.titleTh}</p>
                        <p className="text-[11px] text-[var(--foreground-muted)]">{cc.descriptionTh}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scoring Inputs */}
              <div className="p-4 bg-[var(--surface-inset)] rounded-[var(--radius-lg)] border border-[var(--border-muted)] space-y-3">
                <h4 className="text-xs font-bold text-[var(--foreground)]">
                  การให้คะแนนและการคำนวณแบบถ่วงน้ำหนัก (Weighted Score)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="text-[11px] font-bold text-[var(--foreground-muted)] block mb-1">
                      คะแนนเทคนิค (๖๐%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={techScoreInput}
                      onChange={e => setTechScoreInput(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--surface)] font-mono font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[var(--foreground-muted)] block mb-1">
                      คะแนนราคา (๔๐%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="40"
                      value={priceScoreInput}
                      onChange={e => setPriceScoreInput(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--surface)] font-mono font-bold text-sm"
                    />
                  </div>
                  <div>
                    <button
                      onClick={handleSaveScore}
                      disabled={savingScore}
                      className="w-full py-2 px-3 rounded bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 cursor-pointer disabled:opacity-50"
                    >
                      {savingScore ? 'กำลังคำนวณ...' : 'คำนวณคะแนนรวม'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Head of Agency Approval Button */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                <div className="text-xs text-[var(--foreground-muted)]">
                  สถานะการอนุมัติ: <strong className={evalRes?.headOfAgencyVerdict === 'APPROVED' ? "text-emerald-600" : "text-amber-600"}>
                    {evalRes?.headOfAgencyVerdict === 'APPROVED' ? 'อนุมัติสั่งจ้างแล้ว' : 'รอการอนุมัติสั่งจ้าง'}
                  </strong>
                </div>

                {evalRes?.headOfAgencyVerdict !== 'APPROVED' && (
                  <button
                    onClick={handleApproveResolution}
                    disabled={approving || hasRoleConflict}
                    className="px-4 py-2 rounded-[var(--radius-md)] bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {approving ? 'กำลังดำเนินการ...' : 'หัวหน้าหน่วยงานอนุมัติสั่งจ้าง (ข้อ ๕๕)'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
