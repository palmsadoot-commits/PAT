'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileCheck, 
  Layers, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  FileText, 
  Send, 
  Plus, 
  Eye, 
  Lock, 
  ArrowRight,
  RefreshCw,
  Server,
  Database,
  Cpu,
  Terminal,
  FileSignature
} from 'lucide-react';
import { 
  ProcurementGovernanceWorkspace, 
  RtmTraceabilityItem, 
  RtmVerdict, 
  DefectSeverity, 
  DigitalDeepDiveItem 
} from '@/types/procurement';
import { formatBudgetFull, formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AcceptanceWorkspaceProps {
  workspace: ProcurementGovernanceWorkspace;
  onRefresh: () => void;
  onOpenEvidenceDrawer: (item: RtmTraceabilityItem) => void;
  onOpenFormModal: (type: 'NOTICE_175' | 'ACCEPTANCE_CERTIFICATE' | 'APPOINTMENT_ORDER') => void;
}

export function AcceptanceWorkspace({
  workspace,
  onRefresh,
  onOpenEvidenceDrawer,
  onOpenFormModal
}: AcceptanceWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'rtm' | 'digital_checklist' | 'defects' | 'notices175'>('rtm');
  const [selectedMilestone, setSelectedMilestone] = useState<number>(workspace.activeMilestoneNo || 1);

  // Defect Modal
  const [isAddDefectOpen, setIsAddDefectOpen] = useState(false);
  const [defectTitle, setDefectTitle] = useState('');
  const [defectDesc, setDefectDesc] = useState('');
  const [defectSeverity, setDefectSeverity] = useState<DefectSeverity>('HIGH');
  const [defectReqCode, setDefectReqCode] = useState('');
  const [submittingDefect, setSubmittingDefect] = useState(false);

  // Finalizing Milestone Acceptance
  const [finalizing, setFinalizing] = useState(false);

  // Notice 175 Modal
  const [isNotice175Open, setIsNotice175Open] = useState(false);
  const [noticeSummary, setNoticeSummary] = useState('');
  const [submittingNotice, setSubmittingNotice] = useState(false);

  // Milestone Gate Calculation
  const milestoneRtm = workspace.rtmMatrix.filter(r => r.milestoneNo === selectedMilestone);
  const milestoneDefects = workspace.defects.filter(d => d.milestoneNo === selectedMilestone);
  const openCriticalDefects = milestoneDefects.filter(d => (d.severity === 'CRITICAL' || d.severity === 'HIGH') && d.status !== 'CLOSED' && d.status !== 'RESOLVED');
  const missingEvidenceRtm = milestoneRtm.filter(r => !r.evidenceRef || r.verdict !== 'PASS');
  const canAccept = openCriticalDefects.length === 0 && missingEvidenceRtm.length === 0;

  // Handle RTM Verdict Update
  const handleUpdateVerdict = async (rtmId: string, verdict: RtmVerdict) => {
    try {
      const res = await fetch(`/api/procurement/${workspace.projectId}/acceptance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_RTM_VERDICT',
          rtmId,
          verdict
        })
      });

      if (!res.ok) throw new Error('เกิดข้อผิดพลาดในการปรับสถานะ');
      toast.success('ปรับสถานะการตรวจรับ Requirement สำเร็จ');
      onRefresh();
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    }
  };

  // Handle Digital Checklist Verification
  const handleToggleDigitalChecklist = async (item: DigitalDeepDiveItem) => {
    try {
      const res = await fetch(`/api/procurement/${workspace.projectId}/acceptance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_DIGITAL_CHECKLIST',
          itemId: item.id,
          isVerified: !item.isVerified
        })
      });

      if (!res.ok) throw new Error('เกิดข้อผิดพลาดในการบันทึกรายการตรวจรับดิจิทัล');
      toast.success(`ปรับปรุงสถานะการตรวจสอบ "${item.titleTh}" เรียบร้อยแล้ว`);
      onRefresh();
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    }
  };

  // Handle Add Defect
  const handleAddDefect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!defectTitle) return;

    try {
      setSubmittingDefect(true);
      const res = await fetch(`/api/procurement/${workspace.projectId}/acceptance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_DEFECT',
          milestoneNo: selectedMilestone,
          rtmReqCode: defectReqCode,
          titleTh: defectTitle,
          descriptionTh: defectDesc,
          severity: defectSeverity
        })
      });

      if (!res.ok) throw new Error('เกิดข้อผิดพลาดในการบันทึก Defect');
      toast.success('บันทึกข้อบกพร่อง (Defect) เรียบร้อยแล้ว');
      setIsAddDefectOpen(false);
      setDefectTitle('');
      setDefectDesc('');
      onRefresh();
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    } finally {
      setSubmittingDefect(false);
    }
  };

  // Handle Issue Notice 175
  const handleIssueNotice175 = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingNotice(true);
      const res = await fetch(`/api/procurement/${workspace.projectId}/acceptance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ISSUE_NOTICE_175',
          milestoneNo: selectedMilestone,
          defectsSummaryTh: noticeSummary || 'รายการส่งมอบยังไม่ถูกต้องครบถ้วนตามข้อกำหนด TOR และสัญญา'
        })
      });

      if (!res.ok) throw new Error('เกิดข้อผิดพลาดในการออกหนังสือ');
      toast.success('ออกหนังสือแจ้งแก้ไขพัสดุตามระเบียบ ข้อ ๑๗๕ สำเร็จ (กำหนดเวลา ๓ วันทำการ)');
      setIsNotice175Open(false);
      setNoticeSummary('');
      onRefresh();
      onOpenFormModal('NOTICE_175');
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    } finally {
      setSubmittingNotice(false);
    }
  };

  // Handle Finalize Acceptance
  const handleFinalizeAcceptance = async () => {
    if (!canAccept) {
      toast.error('ไม่สามารถลงนามตรวจรับได้: กรุณาตรวจสอบข้อบกพร่องวิกฤตและหลักฐานที่ยังตกค้าง');
      return;
    }

    try {
      setFinalizing(true);
      const res = await fetch(`/api/procurement/${workspace.projectId}/acceptance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'FINALIZE_ACCEPTANCE' })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'เกิดข้อผิดพลาดในการตรวจรับ');

      toast.success(json.data?.message || 'ลงนามตรวจรับพัสดุสำเร็จ สร้างใบสำคัญ ๒ ฉบับและส่งต่อการเบิกจ่ายเรียบร้อย');
      onRefresh();
      onOpenFormModal('ACCEPTANCE_CERTIFICATE');
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="workspace-panel p-5 bg-gradient-to-r from-emerald-900/10 via-teal-900/5 to-transparent border-emerald-200/80 dark:border-emerald-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-[var(--foreground)]">
                  โมดูล C: คณะกรรมการตรวจรับพัสดุ (Acceptance & Traceability Workspace)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300">
                  ระเบียบ กค. ๒๕๖๐ ข้อ ๑๗๕, ๑๗๖
                </span>
              </div>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                สอบกลับความต้องการแบบ RTM 100%, ตรวจรับระบบดิจิทัลเชิงลึก ๙ มิติ, ป้องกันการตรวจรับจากเพียง Demo, และควบคุมหนังสือแจ้ง ๓ วันทำการ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onOpenFormModal('APPOINTMENT_ORDER')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-muted)] cursor-pointer text-[var(--foreground)] shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>คำสั่งตรวจรับ</span>
            </button>
            <button
              onClick={() => setIsNotice175Open(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 cursor-pointer shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>ออกหนังสือแจ้งข้อ ๑๗๕ (๓ วัน)</span>
            </button>
            <button
              onClick={() => onOpenFormModal('ACCEPTANCE_CERTIFICATE')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-sm"
            >
              <FileSignature className="w-3.5 h-3.5" />
              <span>ใบตรวจรับ ๒ ฉบับ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gatekeeper & Milestone Header */}
      <div className="workspace-panel p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[var(--foreground-muted)]">เลือกงวดงานตรวจรับ:</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map(num => (
                <button
                  key={num}
                  onClick={() => setSelectedMilestone(num)}
                  className={cn(
                    "px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-bold transition-all cursor-pointer",
                    selectedMilestone === num
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-[var(--surface-muted)] text-[var(--foreground-muted)] hover:bg-[var(--surface-inset)]"
                  )}
                >
                  งวดที่ {num} {num === workspace.activeMilestoneNo && '(งวดปัจจุบัน)'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {canAccept ? (
              <button
                onClick={handleFinalizeAcceptance}
                disabled={finalizing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{finalizing ? 'กำลังลงนาม...' : 'ลงนามตรวจรับและส่งเบิกจ่าย (Pass Gate)'}</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                <Lock className="w-4 h-4 text-red-600" />
                <span>ถูกล็อกโดย Gatekeeper (พบข้อบกพร่องวิกฤตหรือหลักฐานไม่ครบ)</span>
              </div>
            )}
          </div>
        </div>

        {/* Gatekeeper Status Alerts */}
        {!canAccept && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-[var(--radius-lg)] text-xs text-red-900 dark:text-red-300 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>เงื่อนไขที่ขัดขวางการตรวจรับงวดที่ {selectedMilestone} (Acceptance Gate Blockers):</span>
            </p>
            <ul className="list-disc list-inside pl-5 space-y-0.5">
              {openCriticalDefects.length > 0 && (
                <li>มีข้อบกพร่องระดับวิกฤต/ระดับสูงคงค้าง {openCriticalDefects.length} รายการ ที่ยังไม่ได้รับการแก้ไขและทดสอบซ้ำ</li>
              )}
              {missingEvidenceRtm.length > 0 && (
                <li>มีข้อกำหนด TOR ในงวดนี้ {missingEvidenceRtm.length} รายการ ที่ยังไม่มีหลักฐานแนบหรือยังไม่ผ่านเกณฑ์การตรวจวัด</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Tabs Switcher: RTM vs Digital Checklist vs Defects vs Notices */}
      <div className="flex items-center border-b border-[var(--border)] overflow-x-auto">
        <button
          onClick={() => setActiveTab('rtm')}
          className={cn(
            "py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2",
            activeTab === 'rtm'
              ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
              : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}
        >
          <Layers className="w-4 h-4" />
          <span>Requirement Traceability Matrix (RTM)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[var(--surface-inset)]">{milestoneRtm.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('digital_checklist')}
          className={cn(
            "py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2",
            activeTab === 'digital_checklist'
              ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
              : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>รายการตรวจรับระบบดิจิทัล ๙ มิติ</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[var(--surface-inset)]">๙ มิติ</span>
        </button>

        <button
          onClick={() => setActiveTab('defects')}
          className={cn(
            "py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2",
            activeTab === 'defects'
              ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
              : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>ทะเบียนข้อบกพร่อง (Defect Backlog)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 text-red-800 font-bold">{milestoneDefects.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('notices175')}
          className={cn(
            "py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2",
            activeTab === 'notices175'
              ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
              : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}
        >
          <Clock className="w-4 h-4" />
          <span>หนังสือแจ้งข้อบกพร่องตามข้อ ๑๗๕ (๓ วัน)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[var(--surface-inset)]">{workspace.notices175.length}</span>
        </button>
      </div>

      {/* Tab 1: RTM Matrix Explorer */}
      {activeTab === 'rtm' && (
        <div className="workspace-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              เมทริกซ์เชื่อมโยงย้อนกลับ ๙ ลำดับ (TOR ID → Requirement → สัญญา → งวดงาน → เกณฑ์ตรวจรับ → Test Case → ผลทดสอบ → หลักฐาน → มติตรวจรับ)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground-muted)] font-bold">
                  <th className="p-2.5">รหัส TOR</th>
                  <th className="p-2.5">ข้อสัญญา & ขอบเขตความต้องการ</th>
                  <th className="p-2.5">เกณฑ์การตรวจรับตามสัญญา</th>
                  <th className="p-2.5">Test Case & ผลตรวจ</th>
                  <th className="p-2.5">หลักฐานประกอบ</th>
                  <th className="p-2.5 text-center">มติการตรวจรับ</th>
                  <th className="p-2.5 text-right">การกระทำ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-muted)]">
                {milestoneRtm.map(r => (
                  <tr key={r.id} className="hover:bg-[var(--surface-muted)] transition-colors">
                    <td className="p-2.5 align-top">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        {r.torReqCode}
                      </span>
                    </td>
                    <td className="p-2.5 align-top max-w-xs space-y-0.5">
                      <p className="font-bold text-[var(--foreground)]">{r.requirementTitleTh}</p>
                      <p className="text-[11px] text-[var(--foreground-subtle)] line-clamp-1">{r.contractClause}</p>
                    </td>
                    <td className="p-2.5 align-top max-w-xs text-[11px] text-[var(--foreground-muted)]">
                      {r.acceptanceCriteriaTh}
                    </td>
                    <td className="p-2.5 align-top space-y-1">
                      <span className="font-mono text-[11px] block">{r.testCaseId}</span>
                      <span className={cn(
                        "px-1.5 py-0.2 rounded text-[10px] font-bold",
                        r.testResult === 'PASS' ? "bg-emerald-100 text-emerald-800" :
                        r.testResult === 'FAIL' ? "bg-red-100 text-red-800" :
                        "bg-neutral-100 text-neutral-700"
                      )}>
                        {r.testResult}
                      </span>
                    </td>
                    <td className="p-2.5 align-top">
                      {r.evidenceRef ? (
                        <button
                          onClick={() => onOpenEvidenceDrawer(r)}
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[120px]">{r.evidenceFileName || r.evidenceRef}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-red-500 font-semibold">รอหลักฐาน</span>
                      )}
                    </td>
                    <td className="p-2.5 align-top text-center">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                        r.verdict === 'PASS' ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                        r.verdict === 'FAIL' ? "bg-red-50 text-red-800 border-red-200" :
                        r.verdict === 'PASS_CONDITIONAL' ? "bg-amber-50 text-amber-800 border-amber-200" :
                        "bg-neutral-50 text-neutral-600 border-neutral-200"
                      )}>
                        {r.verdict}
                      </span>
                    </td>
                    <td className="p-2.5 align-top text-right space-x-1">
                      <button
                        onClick={() => handleUpdateVerdict(r.id, 'PASS')}
                        className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                        title="รับรองว่าผ่าน"
                      >
                        ผ่าน
                      </button>
                      <button
                        onClick={() => handleUpdateVerdict(r.id, 'FAIL')}
                        className="px-2 py-1 rounded text-[10px] font-bold bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                        title="ไม่ผ่าน"
                      >
                        ไม่ผ่าน
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Digital Deep-Dive Checklist (9 Dimensions) */}
      {activeTab === 'digital_checklist' && (
        <div className="workspace-panel p-5 space-y-4">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              รายการตรวจรับงานจ้างพัฒนาระบบดิจิทัลเชิงลึก ๙ มิติ
            </h3>
            <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
              ป้องกันการตรวจรับจากเพียง Demo หรือเอกสาร โดยบังคับการตรวจสอบหลักฐานจริงครบทุกมิติ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workspace.digitalChecklist.map(item => (
              <div
                key={item.id}
                className={cn(
                  "p-4 rounded-[var(--radius-lg)] border transition-all space-y-2",
                  item.isVerified
                    ? "bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-300 dark:border-emerald-800"
                    : "bg-[var(--surface-muted)] border-[var(--border)]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--surface-inset)] text-[var(--foreground-muted)]">
                      {item.category}
                    </span>
                    <h4 className="text-xs font-bold text-[var(--foreground)] line-clamp-1">
                      {item.titleTh}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleToggleDigitalChecklist(item)}
                    className={cn(
                      "px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors shrink-0",
                      item.isVerified
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-inset)]"
                    )}
                  >
                    {item.isVerified ? '✓ ตรวจสอบแล้ว' : 'รอตรวจสอบ'}
                  </button>
                </div>

                <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                  {item.specificationTh}
                </p>

                <div className="text-[11px] text-[var(--foreground-subtle)] pt-1 border-t border-[var(--border-muted)] flex items-center justify-between">
                  <span>หลักฐาน: <strong className="text-[var(--foreground)]">{item.evidenceRequiredTh}</strong></span>
                  {item.verifiedBy && (
                    <span className="text-emerald-700 dark:text-emerald-400">ผู้รับรอง: {item.verifiedBy}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Defects Backlog */}
      {activeTab === 'defects' && (
        <div className="workspace-panel p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                ทะเบียนข้อบกพร่องที่ตรวจพบ (Defect Backlog)
              </h3>
              <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                ข้อบกพร่องระดับ Critical/High จะบล็อกการลงนามตรวจรับโดยอัตโนมัติ
              </p>
            </div>

            <button
              onClick={() => setIsAddDefectOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-bold bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>บันทึกข้อบกพร่องใหม่</span>
            </button>
          </div>

          <div className="space-y-3">
            {milestoneDefects.map(d => (
              <div
                key={d.id}
                className={cn(
                  "p-4 rounded-[var(--radius-lg)] border space-y-2",
                  d.severity === 'CRITICAL' ? "bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-900" :
                  d.severity === 'HIGH' ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900" :
                  "bg-[var(--surface-muted)] border-[var(--border)]"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold text-white",
                      d.severity === 'CRITICAL' ? "bg-red-600" :
                      d.severity === 'HIGH' ? "bg-amber-600" :
                      "bg-blue-600"
                    )}>
                      {d.severity}
                    </span>
                    <span className="font-mono text-xs font-bold text-[var(--foreground)]">{d.defectCode}</span>
                    <h4 className="text-xs font-bold text-[var(--foreground)]">{d.titleTh}</h4>
                  </div>

                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold",
                    d.status === 'RESOLVED' || d.status === 'CLOSED' ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                  )}>
                    {d.status}
                  </span>
                </div>

                <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                  {d.descriptionTh}
                </p>

                <div className="flex items-center justify-between text-[11px] text-[var(--foreground-subtle)] pt-1 border-t border-[var(--border-muted)]">
                  <span>มอบหมายให้: <strong>{d.assignedTo}</strong></span>
                  <span>กำหนดเสร็จ: <strong>{d.targetResolutionDate}</strong></span>
                  {d.resolvedDate && <span className="text-emerald-600">แก้ไขเสร็จเมื่อ: {d.resolvedDate}</span>}
                </div>
              </div>
            ))}

            {milestoneDefects.length === 0 && (
              <div className="p-8 text-center text-xs text-emerald-600 font-medium">
                ✓ ไม่พบข้อบกพร่องคงค้างในงวดนี้
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Notices 175 */}
      {activeTab === 'notices175' && (
        <div className="workspace-panel p-5 space-y-4">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              ทะเบียนหนังสือแจ้งข้อบกพร่องตามระเบียบกระทรวงการคลังฯ ข้อ ๑๗๕ (กรอบเวลา ๓ วันทำการ)
            </h3>
            <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
              ข้อ ๑๗๕ วรรคสาม กำหนดให้ทำหนังสือแจ้งผู้รับจ้างภายใน ๓ วันทำการนับแต่วันตรวจพบ
            </p>
          </div>

          <div className="space-y-3">
            {workspace.notices175.map(n => (
              <div key={n.id} className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[var(--foreground)]">{n.noticeNo}</span>
                    <span className="text-xs text-[var(--foreground-muted)]">งวดที่ {n.milestoneNo}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                    กำหนดแจ้งภายใน: {n.slaDeadlineDate}
                  </span>
                </div>
                <p className="text-xs text-[var(--foreground)]">{n.defectsSummaryTh}</p>
                <div className="flex items-center justify-between text-[11px] text-[var(--foreground-subtle)] pt-1 border-t border-[var(--border-muted)]">
                  <span>ผู้รับจ้าง: {n.contractorName}</span>
                  <span className="font-semibold text-emerald-600">สถานะ: จัดส่งหนังสือเรียบร้อย</span>
                </div>
              </div>
            ))}

            {workspace.notices175.length === 0 && (
              <div className="p-8 text-center text-xs text-[var(--foreground-muted)]">
                ยังไม่มีการออกหนังสือแจ้งข้อบกพร่องตามข้อ ๑๗๕ ในโครงการนี้
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add Defect */}
      {isAddDefectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-sm font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-3">
              บันทึกข้อบกพร่อง (Defect Logger) ประจำงวดที่ {selectedMilestone}
            </h3>

            <form onSubmit={handleAddDefect} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[var(--foreground)]">หัวข้อข้อบกพร่อง</label>
                <input
                  type="text"
                  value={defectTitle}
                  onChange={e => setDefectTitle(e.target.value)}
                  placeholder="เช่น การคำนวณภาษีหัก ณ ที่จ่ายคลาดเคลื่อน"
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[var(--foreground)]">ระดับความรุนแรง (Severity)</label>
                  <select
                    value={defectSeverity}
                    onChange={e => setDefectSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)]"
                  >
                    <option value="CRITICAL">วิกฤต (Critical - บล็อกการตรวจรับ)</option>
                    <option value="HIGH">สูง (High - บล็อกการตรวจรับ)</option>
                    <option value="MEDIUM">ปานกลาง (Medium)</option>
                    <option value="LOW">ต่ำ (Low)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[var(--foreground)]">รหัส TOR ที่เกี่ยวข้อง</label>
                  <input
                    type="text"
                    value={defectReqCode}
                    onChange={e => setDefectReqCode(e.target.value)}
                    placeholder="เช่น TOR-REQ-3.1"
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--foreground)]">รายละเอียดและวิธีการจำลองปัญหา (Reproduction Steps)</label>
                <textarea
                  rows={3}
                  value={defectDesc}
                  onChange={e => setDefectDesc(e.target.value)}
                  placeholder="ระบุพฤติกรรมของระบบที่ไม่สอดคล้องกับ TOR หรือสัญญา"
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsAddDefectOpen(false)}
                  className="px-4 py-1.5 rounded-[var(--radius-md)] border border-[var(--border)] font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submittingDefect}
                  className="px-4 py-1.5 rounded-[var(--radius-md)] bg-red-600 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {submittingDefect ? 'กำลังบันทึก...' : 'บันทึก Defect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Issue Notice 175 */}
      {isNotice175Open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-sm font-bold text-[var(--foreground)] border-b border-[var(--border)] pb-3">
              ออกหนังสือแจ้งผู้รับจ้างตามระเบียบกระทรวงการคลังฯ ข้อ ๑๗๕ (๓ วันทำการ)
            </h3>

            <form onSubmit={handleIssueNotice175} className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded text-amber-900 dark:text-amber-300">
                <strong>ระเบียบ ข้อ ๑๗๕ วรรคสาม:</strong> กรณีที่ตรวจพบว่าการส่งมอบไม่ถูกต้องหรือไม่ครบถ้วน ให้ทำหนังสือแจ้งผู้รับจ้างภายใน ๓ วันทำการนับถัดจากวันตรวจพบ
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--foreground)]">สรุปรายการข้อบกพร่องที่ต้องแจ้งแก้ไข</label>
                <textarea
                  rows={4}
                  value={noticeSummary}
                  onChange={e => setNoticeSummary(e.target.value)}
                  placeholder="ระบุข้อบกพร่องตามบันทึกการตรวจรับ เช่น ปัญหา Timeout ของระบบ หรือเอกสารที่ยังขาดส่ง"
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsNotice175Open(false)}
                  className="px-4 py-1.5 rounded-[var(--radius-md)] border border-[var(--border)] font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submittingNotice}
                  className="px-4 py-1.5 rounded-[var(--radius-md)] bg-amber-600 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {submittingNotice ? 'กำลังออกหนังสือ...' : 'ออกหนังสือแจ้งทันที'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
