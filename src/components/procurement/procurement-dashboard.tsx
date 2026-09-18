'use client';

import React, { useState } from 'react';
import { 
  Scale, 
  FileEdit, 
  Award, 
  FileCheck, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Pause, 
  Play, 
  ArrowRight,
  TrendingUp,
  FileText,
  AlertCircle,
  Building,
  CheckCircle2
} from 'lucide-react';
import { ProcurementGovernanceWorkspace, GovernanceRuleConfig } from '@/types/procurement';
import { formatBudgetFull, formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProcurementDashboardProps {
  workspaces: ProcurementGovernanceWorkspace[];
  selectedWorkspace: ProcurementGovernanceWorkspace;
  onSelectProject: (projectId: string) => void;
  onNavigateTab: (tab: 'tor' | 'evaluation' | 'acceptance' | 'overview') => void;
  onOpenFormModal: (type: 'APPOINTMENT_ORDER' | 'CONFLICT_DECLARATION' | 'FORM_BK01') => void;
  onRefresh: () => void;
}

const LIFECYCLE_STAGES = [
  { id: 'TOR', label: '๑. จัดทำ TOR' },
  { id: 'PRICE', label: '๒. ราคากลาง' },
  { id: 'SELECTION', label: '๓. คัดเลือก/e-Bidding' },
  { id: 'CONTRACT', label: '๔. สัญญาจ้าง' },
  { id: 'DELIVERY', label: '๕. ส่งมอบงาน' },
  { id: 'ACCEPTANCE', label: '๖. ตรวจรับพัสดุ' },
  { id: 'DISBURSEMENT', label: '๗. เบิกจ่ายเงิน' },
];

export function ProcurementDashboard({
  workspaces,
  selectedWorkspace,
  onSelectProject,
  onNavigateTab,
  onOpenFormModal,
  onRefresh
}: ProcurementDashboardProps) {
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [pauseDocRef, setPauseDocRef] = useState('');
  const [pauseCommittee, setPauseCommittee] = useState<'TOR_PRICE' | 'EVALUATION' | 'ACCEPTANCE'>('ACCEPTANCE');
  const [submittingPause, setSubmittingPause] = useState(false);

  // Active pauses
  const activePauses = selectedWorkspace.slaPauses.filter(p => p.status === 'ACTIVE');
  const isSlaPaused = activePauses.length > 0;

  // Handle SLA Pause / Resume
  const handleTogglePause = async (action: 'PAUSE' | 'RESUME') => {
    try {
      setSubmittingPause(true);
      const res = await fetch(`/api/procurement/${selectedWorkspace.projectId}/sla-pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          committeeType: pauseCommittee,
          pauseReason,
          documentRef: pauseDocRef
        })
      });

      if (!res.ok) throw new Error('เกิดข้อผิดพลาดในการปรับสถานะ SLA');
      toast.success(action === 'PAUSE' ? 'หยุดเวลานับ SLA เรียบร้อยแล้ว (มีผลบันทึกใน Audit Trail)' : 'เริ่มนับเวลา SLA ต่อเนื่องเรียบร้อยแล้ว');
      setIsPauseModalOpen(false);
      setPauseReason('');
      setPauseDocRef('');
      onRefresh();
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    } finally {
      setSubmittingPause(false);
    }
  };

  // Determine stage progress
  const getStageIndex = (phase: string) => {
    if (phase === 'TOR_PRICE') return 1;
    if (phase === 'EVALUATION') return 2;
    if (phase === 'CONTRACT') return 3;
    if (phase === 'DELIVERY_ACCEPTANCE') return 5;
    if (phase === 'DISBURSED') return 6;
    return 0;
  };
  const currentStageIndex = getStageIndex(selectedWorkspace.currentPhase);

  // Critical items
  const openCritDefects = selectedWorkspace.defects.filter(
    d => (d.severity === 'CRITICAL' || d.severity === 'HIGH') && d.status !== 'CLOSED' && d.status !== 'RESOLVED'
  );
  const unverifiedRtm = selectedWorkspace.rtmMatrix.filter(r => r.verdict !== 'PASS');

  return (
    <div className="space-y-6">
      {/* 7-Stage End-to-End Governance Timeline */}
      <div className="workspace-panel p-5 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="workspace-eyebrow">PROCUREMENT LIFECYCLE TIMELINE</p>
            <h2 className="text-sm font-bold text-[var(--foreground)] mt-0.5">
              เส้นทางกระบวนการจัดซื้อจัดจ้างและการบริหารสัญญาภาครัฐ (๗ ขั้นตอน)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {isSlaPaused ? (
              <button
                onClick={() => handleTogglePause('RESUME')}
                disabled={submittingPause}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5" />
                <span>เริ่มนับเวลาต่อ (Resume SLA)</span>
              </button>
            ) : (
              <button
                onClick={() => setIsPauseModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-muted)] cursor-pointer text-amber-700 dark:text-amber-400 shadow-2xs"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>หยุดเวลา (Pause SLA)</span>
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Timeline Tracker */}
        <div className="flex items-center justify-between relative min-w-[700px] py-3">
          <div className="absolute left-0 top-7 w-full h-[2px] bg-[var(--border-muted)] -z-10" />
          <div 
            className="absolute left-0 top-7 h-[2.5px] bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 -z-10 transition-all duration-500 rounded-full" 
            style={{ width: `${(currentStageIndex / (LIFECYCLE_STAGES.length - 1)) * 100}%` }}
          />

          {LIFECYCLE_STAGES.map((st, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div key={st.id} className="flex flex-col items-center gap-2 bg-[var(--surface)] px-2 select-none">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all",
                  isCompleted ? "bg-emerald-50 text-emerald-700 border-emerald-600" :
                  isCurrent ? "bg-blue-600 text-white border-blue-400 ring-4 ring-blue-100 dark:ring-blue-950 animate-pulse" :
                  "bg-[var(--surface-muted)] text-[var(--foreground-subtle)] border-[var(--border)]"
                )}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className={cn(
                  "text-[11px] font-medium text-center line-clamp-1",
                  isCurrent ? "font-bold text-[var(--accent)]" :
                  isCompleted ? "text-[var(--foreground)]" :
                  "text-[var(--foreground-subtle)]"
                )}>
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>

        {isSlaPaused && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-[var(--radius-md)] flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <Pause className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>SLA กำลังถูกหยุดชั่วคราว (Paused):</strong> {activePauses[0]?.pauseReason} (อ้างอิง: {activePauses[0]?.documentRef})
              </span>
            </div>
            <span className="text-[11px] text-amber-800 dark:text-amber-400 font-semibold">
              อนุมัติโดย: {activePauses[0]?.authorizedBy}
            </span>
          </div>
        )}
      </div>

      {/* 3 Committee Queues Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Committee 1: TOR & Median Price */}
        <div className="workspace-panel p-5 space-y-4 border-t-4 border-t-blue-600 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                ข้อ ๒๑, ๒๕, ๔๕-๔๖
              </span>
              <span className="text-xs text-[var(--foreground-muted)]">
                {selectedWorkspace.torPriceCommittee?.allowedDays || 20} วัน
              </span>
            </div>

            <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-blue-600" />
              <span>๑. คณะจัดทำ TOR และราคากลาง</span>
            </h3>

            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
              คำสั่ง: <strong>{selectedWorkspace.torPriceCommittee?.orderNumber || 'อยู่ระหว่างจัดทำ'}</strong>
              <br />
              ประธาน: <strong>{selectedWorkspace.torPriceCommittee?.members.find(m => m.committeeRole === 'CHAIR')?.fullName || '-'}</strong>
            </p>

            <div className="p-3 rounded bg-[var(--surface-muted)] text-xs space-y-1">
              <div className="flex justify-between">
                <span>ข้อกำหนด TOR:</span>
                <strong className="font-mono">{selectedWorkspace.torSpecification?.sections.reduce((a, s) => a + s.items.length, 0) || 0} ข้อ</strong>
              </div>
              <div className="flex justify-between">
                <span>ราคากลางที่สืบได้:</span>
                <strong className="font-mono text-blue-700 dark:text-blue-300">
                  {selectedWorkspace.medianPricePackage ? formatBudgetFull(selectedWorkspace.medianPricePackage.medianPriceBaht) : 0} ฿
                </strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('tor')}
            className="w-full py-2 px-3 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] text-xs font-bold hover:bg-[var(--surface-inset)] cursor-pointer flex items-center justify-center gap-1 text-[var(--foreground)]"
          >
            <span>เข้าสู่ Workspace จัดทำ TOR</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Committee 2: Evaluation Committee */}
        <div className="workspace-panel p-5 space-y-4 border-t-4 border-t-purple-600 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                ข้อ ๕๕ (SLA ๗ วัน)
              </span>
              <span className="text-xs text-[var(--foreground-muted)]">
                วิธี {selectedWorkspace.procurementMethod}
              </span>
            </div>

            <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>๒. คณะกรรมการพิจารณาผล</span>
            </h3>

            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
              คำสั่ง: <strong>{selectedWorkspace.evaluationCommittee?.orderNumber || 'อยู่ระหว่างจัดทำ'}</strong>
              <br />
              ประธาน: <strong>{selectedWorkspace.evaluationCommittee?.members.find(m => m.committeeRole === 'CHAIR')?.fullName || '-'}</strong>
            </p>

            <div className="p-3 rounded bg-[var(--surface-muted)] text-xs space-y-1">
              <div className="flex justify-between">
                <span>ผู้ยื่นข้อเสนอ:</span>
                <strong className="font-mono">{selectedWorkspace.evaluationResolution?.bidders.length || 0} ราย</strong>
              </div>
              <div className="flex justify-between">
                <span>ผู้ชนะการเสนอราคา:</span>
                <strong className="text-purple-700 dark:text-purple-300 truncate max-w-[120px]">
                  {selectedWorkspace.evaluationResolution?.winningBidderName || 'รอสรุปผล'}
                </strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('evaluation')}
            className="w-full py-2 px-3 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] text-xs font-bold hover:bg-[var(--surface-inset)] cursor-pointer flex items-center justify-center gap-1 text-[var(--foreground)]"
          >
            <span>เข้าสู่ Workspace พิจารณาผล</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Committee 3: Acceptance Committee */}
        <div className="workspace-panel p-5 space-y-4 border-t-4 border-t-emerald-600 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ข้อ ๑๗๕, ๑๗๖
              </span>
              <span className="text-xs text-[var(--foreground-muted)]">
                งวดที่ {selectedWorkspace.activeMilestoneNo}/{selectedWorkspace.totalMilestones}
              </span>
            </div>

            <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>๓. คณะกรรมการตรวจรับพัสดุ</span>
            </h3>

            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
              คำสั่ง: <strong>{selectedWorkspace.acceptanceCommittee?.orderNumber || 'อยู่ระหว่างจัดทำ'}</strong>
              <br />
              ประธาน: <strong>{selectedWorkspace.acceptanceCommittee?.members.find(m => m.committeeRole === 'CHAIR')?.fullName || '-'}</strong>
            </p>

            <div className="p-3 rounded bg-[var(--surface-muted)] text-xs space-y-1">
              <div className="flex justify-between">
                <span>Defect วิกฤตคงค้าง:</span>
                <strong className={openCritDefects.length > 0 ? "text-red-600 font-bold" : "text-emerald-600"}>
                  {openCritDefects.length} รายการ
                </strong>
              </div>
              <div className="flex justify-between">
                <span>ความสมบูรณ์ RTM:</span>
                <strong className="font-mono text-emerald-700 dark:text-emerald-300">
                  {selectedWorkspace.rtmMatrix.length > 0
                    ? `${Math.round((selectedWorkspace.rtmMatrix.filter(r => r.verdict === 'PASS').length / selectedWorkspace.rtmMatrix.length) * 100)}%`
                    : '100%'}
                </strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('acceptance')}
            className="w-full py-2 px-3 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] text-xs font-bold hover:bg-[var(--surface-inset)] cursor-pointer flex items-center justify-center gap-1 text-[var(--foreground)]"
          >
            <span>เข้าสู่ Workspace ตรวจรับ & RTM</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Rules Configuration & Governance Reference Table */}
      <div className="workspace-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>ตารางกำหนดกรอบเวลาและข้อกฎหมายกำกับ (Rules & Governance Configuration)</span>
            </h3>
            <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
              แยก "ระยะเวลาตามกฎหมาย" (Statutory), "SLA หน่วยงาน" (Agency SLA) และ "กำหนดส่งมอบตามสัญญา" (Contract Milestones)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground-muted)] font-bold">
                <th className="p-3">ประเภทข้อกำหนด</th>
                <th className="p-3">ชื่อกฎเกณฑ์และกระบวนการ</th>
                <th className="p-3">กฎหมาย / ระเบียบอ้างอิง</th>
                <th className="p-3 text-center">กรอบเวลา</th>
                <th className="p-3 text-center">วันที่ทบทวนกฎ</th>
                <th className="p-3">คำอธิบายและแนวทางปฏิบัติ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-muted)]">
              {selectedWorkspace.rules.map(rule => (
                <tr key={rule.id} className="hover:bg-[var(--surface-muted)] transition-colors">
                  <td className="p-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                      rule.category === 'STATUTORY' ? "bg-red-50 text-red-800 border-red-200" :
                      rule.category === 'AGENCY_SLA' ? "bg-blue-50 text-blue-800 border-blue-200" :
                      "bg-emerald-50 text-emerald-800 border-emerald-200"
                    )}>
                      {rule.category === 'STATUTORY' ? 'กฎหมายกำหนด' : rule.category === 'AGENCY_SLA' ? 'SLA หน่วยงาน' : 'สัญญาจ้าง'}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-[var(--foreground)]">{rule.nameTh}</td>
                  <td className="p-3 text-blue-700 dark:text-blue-400 font-medium">{rule.legalReference}</td>
                  <td className="p-3 text-center font-mono font-bold">
                    {rule.durationDays} {rule.isBusinessDays ? 'วันทำการ' : 'วัน'}
                  </td>
                  <td className="p-3 text-center text-[var(--foreground-muted)]">{rule.lastReviewedDate}</td>
                  <td className="p-3 text-[var(--foreground-muted)] max-w-sm">{rule.notesTh}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Pause SLA */}
      {isPauseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                <Pause className="w-4 h-4 text-amber-600" />
                <span>หยุดเวลานับ SLA (Pause SLA Timer)</span>
              </h3>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded text-xs text-amber-900 dark:text-amber-300">
              *ตามหลักธรรมาภิบาล: การหยุดนับเวลา SLA จะกระทำได้เฉพาะเมื่อมีเหตุผลอันสมควร มีหนังสือราชการอ้างอิง และได้รับการอนุมัติจากผู้มีอำนาจเท่านั้น*
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[var(--foreground)]">คณะกรรมการที่ต้องการหยุดเวลา</label>
                <select
                  value={pauseCommittee}
                  onChange={e => setPauseCommittee(e.target.value as any)}
                  className="w-full px-3 py-2 rounded border border-[var(--border)] bg-[var(--surface-inset)]"
                >
                  <option value="ACCEPTANCE">คณะกรรมการตรวจรับพัสดุ</option>
                  <option value="EVALUATION">คณะกรรมการพิจารณาผล</option>
                  <option value="TOR_PRICE">คณะจัดทำ TOR และราคากลาง</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--foreground)]">เหตุผลความจำเป็นในการหยุดเวลา</label>
                <textarea
                  rows={3}
                  value={pauseReason}
                  onChange={e => setPauseReason(e.target.value)}
                  placeholder="เช่น รอผลการประสานงานเชื่อมต่อ API จากหน่วยงานภายนอก หรือรอคำวินิจฉัยข้อกฎหมาย"
                  className="w-full px-3 py-2 rounded border border-[var(--border)] bg-[var(--surface-inset)]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--foreground)]">หนังสือราชการ / เอกสารอ้างอิง</label>
                <input
                  type="text"
                  value={pauseDocRef}
                  onChange={e => setPauseDocRef(e.target.value)}
                  placeholder="เช่น หนังสือ สป.รง. ที่ รง ๐๒๐๑/ว ๑๐๒ ลงวันที่..."
                  className="w-full px-3 py-2 rounded border border-[var(--border)] bg-[var(--surface-inset)]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsPauseModalOpen(false)}
                  className="px-4 py-1.5 rounded border border-[var(--border)] font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePause('PAUSE')}
                  disabled={submittingPause || !pauseReason || !pauseDocRef}
                  className="px-4 py-1.5 rounded bg-amber-600 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {submittingPause ? 'กำลังบันทึก...' : 'อนุมัติหยุดเวลานับ SLA'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
