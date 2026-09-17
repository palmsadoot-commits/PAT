'use client';

import React, { useState } from 'react';
import { ProjectDPMLifecycle } from '@/types';
import { formatBudgetFull, formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import { 
  Settings2, 
  GitPullRequest, 
  AlertTriangle, 
  FileSpreadsheet, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ExternalLink,
  HelpCircle,
  TrendingUp,
  Search
} from 'lucide-react';

interface MidstreamPanelProps {
  dpm: ProjectDPMLifecycle;
}

export function MidstreamPanel({ dpm }: MidstreamPanelProps) {
  const [rtmCategory, setRtmCategory] = useState<string>('ALL');
  const [rtmSearch, setRtmSearch] = useState<string>('');

  const contract = dpm.contract;
  const rtmList = dpm.rtm || [];
  const crList = dpm.changeRequests || [];
  const riskList = dpm.risks || [];

  const filteredRtm = rtmList.filter(item => {
    if (rtmCategory !== 'ALL' && item.category !== rtmCategory) return false;
    if (rtmSearch.trim()) {
      const q = rtmSearch.toLowerCase();
      return item.torRequirementNo.toLowerCase().includes(q) ||
        item.torRequirementText.toLowerCase().includes(q) ||
        item.useCaseOrProcess.toLowerCase().includes(q) ||
        item.screenId.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. CONTRACT & PROCUREMENT SUMMARY */}
      {contract && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border-muted)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[var(--radius-md)] bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)]">
                  ข้อมูลการจัดซื้อจัดจ้างและสัญญา (Procurement & Contract Management)
                </h3>
                <p className="text-[11px] text-[var(--foreground-muted)]">
                  สัญญาจ้างพัฒนาระบบดิจิทัลและการบริหารคู่สัญญาภาครัฐ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                วิธี: {contract.procurementMethod}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-[var(--foreground-subtle)] uppercase tracking-wider block">เลขที่สัญญา</span>
              <span className="text-xs font-mono font-bold text-[var(--foreground)]">{contract.contractNo}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-[var(--foreground-subtle)] uppercase tracking-wider block">คู่สัญญา (ผู้รับจ้าง)</span>
              <span className="text-xs font-bold text-[var(--foreground)] truncate block">{contract.vendorName}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-[var(--foreground-subtle)] uppercase tracking-wider block">วงเงินสัญญา</span>
              <span className="text-xs font-bold text-emerald-700 tabular-nums block">{formatBudgetFull(contract.contractValue)}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-[var(--foreground-subtle)] uppercase tracking-wider block">ระยะเวลารับประกัน</span>
              <span className="text-xs font-bold text-[var(--foreground)] block">{contract.guaranteePeriodMonths} เดือน</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. REQUIREMENT TRACEABILITY MATRIX (RTM) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-5 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface-muted)]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--foreground)]">
                  เมทริกซ์ตรวจสอบย้อนกลับ (Requirement Traceability Matrix: RTM)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Traceability 100% (V-Model)
                </span>
              </div>
              <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
                เชื่อมโยงข้อกำหนด TOR $\rightarrow$ กระบวนงาน $\rightarrow$ หน้าจอ $\rightarrow$ รายงาน $\rightarrow$ จุดเชื่อมโยง $\rightarrow$ กรณีทดสอบ
              </p>
            </div>
          </div>

          {/* RTM Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--foreground-subtle)] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหาข้อกำหนด, หน้าจอ..."
                value={rtmSearch}
                onChange={(e) => setRtmSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] outline-none focus:border-[var(--accent)] text-[var(--foreground)] w-44"
              />
            </div>

            <select
              value={rtmCategory}
              onChange={(e) => setRtmCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] outline-none text-[var(--foreground)] cursor-pointer"
            >
              <option value="ALL">ทุกหมวดหมู่</option>
              <option value="FUNCTIONAL">Functional</option>
              <option value="NON_FUNCTIONAL">Non-Functional</option>
              <option value="SECURITY">Security</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--surface-muted)] text-[var(--foreground-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                <th className="py-3 px-4 font-semibold">ข้อกำหนด TOR</th>
                <th className="py-3 px-4 font-semibold">กระบวนงาน / Use Case</th>
                <th className="py-3 px-4 font-semibold">หน้าจอ (Screen ID)</th>
                <th className="py-3 px-4 font-semibold">รายงาน (Report)</th>
                <th className="py-3 px-4 font-semibold">เชื่อมโยง (Interface)</th>
                <th className="py-3 px-4 font-semibold">กรณีทดสอบ (Test Scenario)</th>
                <th className="py-3 px-4 font-semibold text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-muted)]">
              {filteredRtm.map((row) => (
                <tr key={row.id} className="hover:bg-[var(--surface-muted)]/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-blue-700 block">{row.torRequirementNo}</span>
                    <span className="text-[11px] text-[var(--foreground-muted)] line-clamp-2">{row.torRequirementText}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-[var(--foreground)] max-w-xs">
                    {row.useCaseOrProcess}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-purple-700 font-semibold">
                    {row.screenId}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-[var(--foreground-muted)]">
                    {row.reportName}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-stone-600">
                    {row.interfaceId}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-[var(--foreground)]">
                    {row.testScenarioId}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ครบถ้วน
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. CHANGE CONTROL BOARD (CCB) & CHANGE REQUESTS */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-5 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface-muted)]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
              <GitPullRequest className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--foreground)]">
                  คณะกรรมการควบคุมการเปลี่ยนแปลง (Change Control Board: CCB)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  {crList.length} รายการคำขอ
                </span>
              </div>
              <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
                กลไกวิเคราะห์ผลกระทบ (Change Impact Analysis) เวลา งบประมาณ ขอบเขต และบันทึกมติ CCB
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {crList.map((cr) => (
            <div
              key={cr.id}
              className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)]/30 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]">
                    {cr.crNumber}
                  </span>
                  <h4 className="text-xs font-bold text-[var(--foreground)]">
                    {cr.title}
                  </h4>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                      cr.priority === 'HIGH' || cr.priority === 'CRITICAL'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    )}
                  >
                    ความสำคัญ: {cr.priority}
                  </span>
                </div>

                <span
                  className={cn(
                    'text-[11px] font-bold px-2.5 py-1 rounded-full border',
                    cr.ccbDecision === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : cr.ccbDecision === 'DEFERRED_TO_BACKLOG'
                      ? 'bg-stone-100 text-stone-700 border-stone-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  )}
                >
                  มติ CCB: {cr.ccbDecision === 'APPROVED' ? 'อนุมัติให้ดำเนินการ' : 'จัดเก็บเข้า Backlog ระยะที่ 2'}
                </span>
              </div>

              <div className="text-[11px] text-[var(--foreground-muted)]">
                <strong>เหตุผลความจำเป็น: </strong> {cr.reason}
              </div>

              {/* Impact Analysis Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[var(--surface)] p-3 rounded-[var(--radius-md)] border border-[var(--border-muted)] text-xs">
                <div>
                  <span className="text-[10px] text-[var(--foreground-subtle)] block">ผลกระทบเวลา (Schedule)</span>
                  <span className="font-bold text-[var(--foreground)]">+{cr.impactAnalysis.scheduleImpactDays} วัน</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--foreground-subtle)] block">ผลกระทบงบประมาณ (Cost)</span>
                  <span className="font-bold text-emerald-700 tabular-nums">
                    {cr.impactAnalysis.costImpactBaht > 0 ? `+${cr.impactAnalysis.costImpactBaht.toLocaleString()} บาท` : 'ไม่มีค่าใช้จ่ายเพิ่ม'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--foreground-subtle)] block">ข้อกำหนด RTM ที่กระทบ</span>
                  <span className="font-mono text-[11px] text-blue-700">{cr.impactAnalysis.rtmAffectedIds.join(', ')}</span>
                </div>
              </div>

              {cr.ccbComments && (
                <div className="text-[11px] text-[var(--foreground)] bg-amber-50/50 border border-amber-200/60 p-2.5 rounded-[var(--radius-md)]">
                  <span className="font-bold text-amber-900">ความเห็นและมติกรรมการ CCB: </span>
                  {cr.ccbComments}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. RISK REGISTER & 5x5 MATRIX */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-5 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface-muted)]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-red-50 text-red-700 border border-red-200 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                ทะเบียนความเสี่ยงและแผนรับมือ (Risk Register & Mitigation)
              </h3>
              <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
                ประเมินระดับความรุนแรงตามโอกาสเกิด (Likelihood 1-5) $\times$ ผลกระทบ (Impact 1-5)
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--surface-muted)] text-[var(--foreground-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                <th className="py-3 px-4 font-semibold">รหัส</th>
                <th className="py-3 px-4 font-semibold">ประเด็นความเสี่ยง</th>
                <th className="py-3 px-4 font-semibold text-center">ระดับ (L x I)</th>
                <th className="py-3 px-4 font-semibold text-center">ความรุนแรง</th>
                <th className="py-3 px-4 font-semibold">มาตรการป้องกัน / ลดความเสี่ยง (Mitigation Plan)</th>
                <th className="py-3 px-4 font-semibold">ผู้รับผิดชอบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-muted)]">
              {riskList.map((risk) => (
                <tr key={risk.id} className="hover:bg-[var(--surface-muted)]/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[var(--foreground)]">{risk.riskCode}</td>
                  <td className="py-3.5 px-4 font-semibold text-[var(--foreground)] max-w-xs">
                    {risk.riskTitle}
                    <span className="text-[10px] font-normal text-[var(--foreground-muted)] block mt-0.5">หมวด: {risk.category}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono tabular-nums">
                    {risk.likelihood} x {risk.impact} = <strong>{risk.riskScore}</strong>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                        risk.severityLevel === 'HIGH' || risk.severityLevel === 'EXTREME'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      )}
                    >
                      {risk.severityLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[11px] text-[var(--foreground)] max-w-sm leading-relaxed">
                    {risk.mitigationPlan}
                  </td>
                  <td className="py-3.5 px-4 text-[11px] text-[var(--foreground-muted)]">
                    {risk.riskOwner}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
