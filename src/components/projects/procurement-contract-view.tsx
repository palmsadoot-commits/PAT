'use client';

import React, { useState } from 'react';
import { ProjectDPMLifecycle } from '@/types';
import { formatBudgetFull, formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import {
  Scale,
  FileSignature,
  Users,
  Building,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Info
} from 'lucide-react';

interface ProcurementContractViewProps {
  dpm: ProjectDPMLifecycle;
  projectBudget?: number;
}

export function ProcurementContractView({ dpm, projectBudget }: ProcurementContractViewProps) {
  const contract = dpm.contract;
  const committees = dpm.committees || [];
  const milestones = dpm.milestones || [];

  const [activeCommitteeTab, setActiveCommitteeTab] = useState<string>('ACCEPTANCE');

  if (!contract) {
    return (
      <div className="workspace-panel p-8 text-center">
        <Scale className="w-12 h-12 text-[var(--foreground-subtle)] mx-auto mb-3 opacity-60" />
        <h3 className="text-base font-bold text-[var(--foreground)]">ยังไม่มีข้อมูลสัญญาและการจัดซื้อจัดจ้าง</h3>
        <p className="text-xs text-[var(--foreground-muted)] mt-1 max-w-md mx-auto">
          โครงการจะเข้าสู่กระบวนการจัดซื้อจัดจ้างและการแต่งตั้งคณะกรรมการตามระเบียบกระทรวงการคลังฯ พ.ศ. ๒๕๖๐ เมื่อผ่านการอนุมัติโครงการแล้ว
        </p>
      </div>
    );
  }

  // Calculate milestone financial summary
  const totalMilestones = milestones.length;
  const paidMilestones = milestones.filter(m => m.paymentStatus === 'PAID');
  const paidAmount = paidMilestones.reduce((sum, m) => sum + (m.amountBaht || 0), 0);
  const paidPercent = contract.contractValue > 0 ? Math.round((paidAmount / contract.contractValue) * 100) : 0;
  const currentMilestone = milestones.find(m => m.isCurrentMilestone) || milestones[0];

  return (
    <div className="space-y-6">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* HEADER: Public Procurement Act B.E. 2560 Compliance Banner     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/5 to-transparent border border-blue-200/60 dark:border-blue-800/40 rounded-[var(--radius-xl)] p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-[var(--foreground)]">
                  การจัดซื้อจัดจ้างและการบริหารสัญญาภาครัฐ
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300">
                  พ.ร.บ. จัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. ๒๕๖๐
                </span>
              </div>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                ติดตามขั้นตอนการแต่งตั้งคณะกรรมการ ๓ คณะ, สัญญาจ้าง, งวดงาน-งวดเงิน, และการตรวจรับตามระเบียบกระทรวงการคลังฯ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] font-semibold text-[var(--foreground)] shadow-xs">
              วิธีจัดหา: <span className="text-[var(--accent)] font-bold">{contract.procurementMethod}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* KPI METRIC CARDS                                              */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Contract Value vs Median Price */}
        <div className="workspace-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              วงเงินตามสัญญาจ้าง
            </span>
            <FileSignature className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-[var(--foreground)] tabular-nums">
              {formatBudgetFull(contract.contractValue)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-emerald-700 font-medium">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>ประหยัดได้ {formatBudgetFull(contract.savingsAmount)} ({contract.savingsPercent}%)</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-[var(--border-muted)] text-[10px] text-[var(--foreground-subtle)] flex justify-between">
            <span>ราคากลาง: {formatBudgetFull(contract.medianPrice)}</span>
          </div>
        </div>

        {/* Card 2: Current Milestone */}
        <div className="workspace-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              งวดงานปัจจุบัน
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-[var(--foreground)]">
              งวดที่ {currentMilestone ? currentMilestone.milestoneNo : 1} จาก {totalMilestones} งวด
            </div>
            <div className="text-[11px] text-[var(--foreground-muted)] mt-1 truncate">
              {currentMilestone ? currentMilestone.title : 'กำลังดำเนินงาน'}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-[var(--border-muted)] text-[10px] text-[var(--foreground-subtle)] flex justify-between">
            <span>เบิกจ่ายแล้ว: {paidPercent}% ({formatBudgetFull(paidAmount)})</span>
          </div>
        </div>

        {/* Card 3: Penalty / Overdue Tracking (Clause 162) */}
        <div className={cn(
          "workspace-panel p-4 flex flex-col justify-between",
          contract.totalOverdueDays > 0 ? "border-red-300 bg-red-50/20" : ""
        )}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              การส่งมอบและค่าปรับ (ข้อ ๑๖๒)
            </span>
            {contract.totalOverdueDays > 0 ? (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <div className="mt-2">
            {contract.totalOverdueDays > 0 ? (
              <>
                <div className="text-xl font-bold text-red-700 tabular-nums">
                  ค่าปรับ {formatBudgetFull(contract.totalPenaltyBaht)}
                </div>
                <div className="text-[11px] text-red-600 font-semibold mt-1">
                  ล่าช้า {contract.totalOverdueDays} วัน ({contract.penaltyPercentOfContract}% ของสัญญา)
                </div>
              </>
            ) : (
              <>
                <div className="text-xl font-bold text-emerald-700">
                  ส่งมอบตรงตามกำหนด
                </div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1">
                  ไม่มีค่าปรับสะสม (0 บาท)
                </div>
              </>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-[var(--border-muted)] text-[10px] text-[var(--foreground-subtle)] flex justify-between">
            <span>อัตราค่าปรับ: {contract.dailyPenaltyRatePercent}% ต่อวัน</span>
            {contract.penaltyThresholdExceeded && (
              <span className="text-red-700 font-bold">เกินเกณฑ์ 10%!</span>
            )}
          </div>
        </div>

        {/* Card 4: Contract Guarantee */}
        <div className="workspace-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              หลักประกันสัญญา (๕%)
            </span>
            <Building className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-[var(--foreground)] tabular-nums">
              {formatBudgetFull(contract.guaranteeAmount)}
            </div>
            <div className="text-[11px] text-[var(--foreground-muted)] mt-1 truncate">
              {contract.guaranteeBank}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-[var(--border-muted)] text-[10px] text-[var(--foreground-subtle)] flex justify-between">
            <span>เลขที่: {contract.guaranteeNo}</span>
            <span>หมดอายุ: {formatDate(contract.guaranteeExpiryDate)}</span>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 1: COMMITTEES UNDER REGULATION B.E. 2560               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="workspace-panel p-5 sm:p-6" aria-labelledby="committees-title">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border-muted)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 id="committees-title" className="text-sm font-bold text-[var(--foreground)]">
                คณะกรรมการตามระเบียบกระทรวงการคลังฯ พ.ศ. ๒๕๖๐
              </h3>
              <p className="text-[11px] text-[var(--foreground-muted)]">
                คำสั่งแต่งตั้งและรายชื่อคณะกรรมการผู้รับผิดชอบ ๓ คณะตลอดวงจรโครงการ
              </p>
            </div>
          </div>

          {/* Committee Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-muted)] rounded-[var(--radius-md)] border border-[var(--border-muted)]">
            {[
              { id: 'TOR_PRICE', label: '๑. คณะกรรมการร่าง TOR/ราคากลาง' },
              { id: 'BIDDING_SELECTION', label: '๒. คณะกรรมการพิจารณาผล e-Bidding' },
              { id: 'ACCEPTANCE', label: '๓. คณะกรรมการตรวจรับพัสดุ' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCommitteeTab(tab.id)}
                className={cn(
                  'px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                  activeCommitteeTab === tab.id
                    ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs'
                    : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Committee Details */}
        {committees
          .filter((com) => com.type === activeCommitteeTab)
          .map((committee) => (
            <div key={committee.id} className="space-y-4">
              {/* Committee Meta Banner */}
              <div className="bg-[var(--surface-inset)] p-4 rounded-[var(--radius-md)] border border-[var(--border-muted)] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--foreground)]">{committee.typeNameTh}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                      committee.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                      committee.status === 'OVERDUE' ? "bg-red-50 text-red-800 border-red-200" :
                      "bg-blue-50 text-blue-800 border-blue-200"
                    )}>
                      {committee.status === 'COMPLETED' ? 'ดำเนินการแล้วเสร็จ' :
                       committee.status === 'OVERDUE' ? `ล่าช้า ${committee.delayDays} วัน` : 'อยู่ระหว่างปฏิบัติหน้าที่'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--foreground-muted)] flex items-center gap-3">
                    <span className="font-semibold text-[var(--accent)]">{committee.orderNumber}</span>
                    <span>·</span>
                    <span>สั่ง ณ วันที่ {formatDate(committee.orderDate)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-[var(--foreground-muted)]">
                  <div>
                    <span className="block text-[10px] text-[var(--foreground-subtle)] uppercase">กรอบเวลาดำเนินการ</span>
                    <span className="font-medium text-[var(--foreground)]">
                      {formatDate(committee.startDate)} – {formatDate(committee.targetEndDate)}
                    </span>
                  </div>
                  {committee.actualEndDate && (
                    <div>
                      <span className="block text-[10px] text-[var(--foreground-subtle)] uppercase">แล้วเสร็จจริง</span>
                      <span className="font-medium text-emerald-700">
                        {formatDate(committee.actualEndDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Members Table */}
              <div className="overflow-x-auto border border-[var(--border-muted)] rounded-[var(--radius-md)]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[var(--surface-muted)] text-[var(--foreground-muted)] border-b border-[var(--border-muted)] uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-4 font-semibold">หน้าที่ในคณะกรรมการ</th>
                      <th className="py-2.5 px-4 font-semibold">ชื่อ-นามสกุล</th>
                      <th className="py-2.5 px-4 font-semibold">ตำแหน่งราชการ</th>
                      <th className="py-2.5 px-4 font-semibold">สังกัด/หน่วยงาน</th>
                      <th className="py-2.5 px-4 font-semibold">ช่องทางการติดต่อ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-muted)]">
                    {committee.members.map((member, idx) => (
                      <tr key={idx} className="hover:bg-[var(--surface-muted)]/40 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full font-bold text-[10px]",
                            member.role === 'CHAIRMAN' ? "bg-amber-100 text-amber-900 border border-amber-300" :
                            member.role === 'SECRETARY' ? "bg-purple-100 text-purple-900 border border-purple-300" :
                            "bg-gray-100 text-gray-800 border border-gray-300"
                          )}>
                            {member.roleNameTh}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-[var(--foreground)] whitespace-nowrap">
                          {member.name}
                        </td>
                        <td className="py-3 px-4 text-[var(--foreground-muted)]">
                          {member.position}
                        </td>
                        <td className="py-3 px-4 text-[var(--foreground-muted)]">
                          {member.department}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3 text-[11px]">
                            {member.phone && (
                              <a href={`tel:${member.phone}`} className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline">
                                <Phone className="w-3 h-3" />
                                {member.phone} {member.internalPhone ? `(ต่อ ${member.internalPhone})` : ''}
                              </a>
                            )}
                            {member.email && (
                              <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1 text-[var(--foreground-muted)] hover:text-[var(--accent)]">
                                <Mail className="w-3 h-3" />
                                {member.email}
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 2: CONTRACT & VENDOR DOSSIER                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="workspace-panel p-5 sm:p-6" aria-labelledby="contract-dossier-title">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[var(--border-muted)]">
          <div className="w-8 h-8 rounded-[var(--radius-md)] bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <h3 id="contract-dossier-title" className="text-sm font-bold text-[var(--foreground)]">
              รายละเอียดสัญญาและข้อมูลคู่สัญญา (Contract & Contractor Details)
            </h3>
            <p className="text-[11px] text-[var(--foreground-muted)]">
              ข้อมูลนิติบุคคลผู้รับจ้าง เลขประจำตัวผู้เสียภาษี และเงื่อนไขการประกันสัญญา
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column A: Contract Terms */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider text-[var(--accent)] border-b border-[var(--border-muted)] pb-1.5">
              ข้อมูลสัญญาจ้าง
            </h4>
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-[10px] text-[var(--foreground-subtle)] uppercase">เลขที่สัญญา</dt>
                <dd className="font-mono font-bold text-[var(--foreground)]">{contract.contractNo}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-[var(--foreground-subtle)] uppercase">วันที่ลงนามสัญญา</dt>
                <dd className="font-medium text-[var(--foreground)]">{formatDate(contract.contractSignDate)}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-[var(--foreground-subtle)] uppercase">วันเริ่มต้นสัญญา</dt>
                <dd className="font-medium text-[var(--foreground)]">{formatDate(contract.contractStartDate)}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-[var(--foreground-subtle)] uppercase">วันสิ้นสุดสัญญา</dt>
                <dd className="font-medium text-[var(--foreground)]">{formatDate(contract.contractEndDate)}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-[var(--foreground-subtle)] uppercase">ระยะเวลารับประกัน</dt>
                <dd className="font-bold text-[var(--foreground)]">{contract.guaranteePeriodMonths} เดือน</dd>
              </div>
              <div>
                <dt className="text-[10px] text-[var(--foreground-subtle)] uppercase">อัตราค่าปรับล่าช้า</dt>
                <dd className="font-bold text-red-600">ร้อยละ {contract.dailyPenaltyRatePercent} ต่อวัน</dd>
              </div>
            </dl>
          </div>

          {/* Column B: Contractor Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider text-[var(--accent)] border-b border-[var(--border-muted)] pb-1.5">
              ข้อมูลคู่สัญญา (ผู้รับจ้าง)
            </h4>
            <div className="bg-[var(--surface-inset)] p-3.5 rounded-[var(--radius-md)] border border-[var(--border-muted)] space-y-2 text-xs">
              <div>
                <span className="font-bold text-[var(--foreground)] text-[13px] block">{contract.vendorName}</span>
                <span className="text-[11px] text-[var(--foreground-muted)] font-mono">
                  เลขประจำตัวผู้เสียภาษี: {contract.vendorTaxId}
                </span>
              </div>
              <p className="text-[11px] text-[var(--foreground-muted)] leading-relaxed">
                {contract.vendorAddress}
              </p>
              <div className="pt-2 border-t border-[var(--border-muted)] flex flex-col gap-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-[var(--foreground)]">{contract.vendorContactPerson}</span>
                </div>
                <div className="flex items-center gap-3 text-[var(--foreground-subtle)]">
                  <span>โทร: {contract.vendorPhone}</span>
                  <span>·</span>
                  <span>อีเมล: {contract.vendorEmail}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 3: MILESTONE & PAYMENT BREAKDOWN (% SPLIT)             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="workspace-panel p-5 sm:p-6" aria-labelledby="milestones-title">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border-muted)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 id="milestones-title" className="text-sm font-bold text-[var(--foreground)]">
                การแบ่งงวดงาน งวดเงิน และการตรวจรับพัสดุ (Milestone & Payment Tracking)
              </h3>
              <p className="text-[11px] text-[var(--foreground-muted)]">
                แจกแจงสัดส่วนเปอร์เซ็นต์ (% ของวงเงินสัญญา), เนื้องานที่ส่งมอบ, และผลการตรวจรับรายงวด
              </p>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="flex-1">
              <div className="flex justify-between text-[11px] font-semibold mb-1">
                <span>เบิกจ่ายสะสม</span>
                <span className="text-emerald-700 font-bold tabular-nums">{paidPercent}%</span>
              </div>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                  style={{ width: `${paidPercent}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Milestones Cards / Timeline */}
        <div className="space-y-4">
          {milestones.map((ms) => {
            const isCurrent = ms.isCurrentMilestone;
            const isOverdue = ms.isOverdue;
            const isAccepted = ms.committeeVerdict === 'ACCEPTED';
            const isPaid = ms.paymentStatus === 'PAID';

            return (
              <div
                key={ms.id}
                className={cn(
                  'rounded-[var(--radius-lg)] border p-4 sm:p-5 transition-all space-y-3',
                  isCurrent
                    ? 'border-[var(--accent)] bg-blue-50/10 shadow-xs'
                    : 'border-[var(--border)] bg-[var(--surface)]',
                  isOverdue ? 'border-red-300 bg-red-50/10' : ''
                )}
              >
                {/* Milestone Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-muted)] pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-bold font-mono',
                      isPaid ? 'bg-emerald-100 text-emerald-900' :
                      isCurrent ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                      'bg-gray-100 text-gray-800'
                    )}>
                      งวดที่ {ms.milestoneNo}
                    </span>

                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                      สัดส่วน {ms.percentageOfContract}% ของสัญญา
                    </span>

                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white animate-pulse">
                        งวดงานปัจจุบัน (Active)
                      </span>
                    )}

                    {isOverdue && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
                        ส่งมอบล่าช้า {ms.overdueDays} วัน (มีค่าปรับ)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-700 tabular-nums">
                        {formatBudgetFull(ms.amountBaht)}
                      </div>
                      <span className="text-[10px] text-[var(--foreground-subtle)]">
                        ({ms.percentageOfContract}% ของมูลค่าสัญญา)
                      </span>
                    </div>

                    <span className={cn(
                      "text-[11px] font-bold px-2.5 py-1 rounded-full border",
                      isPaid ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                      isAccepted ? "bg-blue-50 text-blue-800 border-blue-200" :
                      isOverdue ? "bg-red-50 text-red-800 border-red-200" :
                      "bg-amber-50 text-amber-800 border-amber-200"
                    )}>
                      {isPaid ? 'เบิกจ่ายเงินแล้ว' :
                       isAccepted ? 'ตรวจรับแล้ว (รอเบิกจ่าย)' :
                       isOverdue ? 'ล่าช้า-รอตรวจรับ' : 'อยู่ระหว่างดำเนินการ'}
                    </span>
                  </div>
                </div>

                {/* Milestone Details */}
                <div>
                  <h4 className="text-xs font-bold text-[var(--foreground)] mb-1">
                    {ms.title}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-[var(--foreground-muted)] pt-1">
                    <div>
                      <span className="text-[10px] text-[var(--foreground-subtle)] uppercase block">กำหนดส่งมอบตามสัญญา</span>
                      <span className="font-semibold text-[var(--foreground)]">{formatDate(ms.dueDate)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--foreground-subtle)] uppercase block">วันที่ส่งมอบงานจริง</span>
                      <span className={cn("font-semibold", isOverdue ? "text-red-700" : "text-[var(--foreground)]")}>
                        {ms.deliveredDate ? formatDate(ms.deliveredDate) : 'ยังไม่ส่งมอบ'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--foreground-subtle)] uppercase block">วันที่คณะกรรมการตรวจรับ</span>
                      <span className="font-semibold text-[var(--foreground)]">
                        {ms.inspectionDate ? formatDate(ms.inspectionDate) : 'รอดำเนินการ'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deliverables Box */}
                <div className="bg-[var(--surface-muted)]/40 p-3 rounded-[var(--radius-md)] border border-[var(--border-muted)]">
                  <span className="text-[10px] font-bold text-[var(--foreground-subtle)] uppercase tracking-wider block mb-1.5">
                    เอกสารและเนื้องานที่ต้องส่งมอบในงวดนี้:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[var(--foreground)]">
                    {ms.deliverables.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-[11px]">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overdue & Penalty breakdown inside milestone */}
                {isOverdue && ms.penaltyAmountBaht && ms.penaltyAmountBaht > 0 && (
                  <div className="bg-red-50/70 border border-red-200 rounded-[var(--radius-md)] p-3 text-xs text-red-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">การคิดค่าปรับงวดงานนี้:</span> ส่งมอบงานล่าช้ากว่ากำหนดสัญญาจำนวน <strong>{ms.overdueDays} วัน</strong> คิดค่าปรับตามระเบียบพัสดุฯ ข้อ ๑๖๒ (ร้อยละ ๐.๑ ต่อวัน ของวงเงินสัญญา) เป็นเงินค่าปรับทั้งสิ้น <strong>{formatBudgetFull(ms.penaltyAmountBaht)}</strong> โดยจะหักออกจากเงินค่าจ้างประจำงวดก่อนการเบิกจ่าย
                    </div>
                  </div>
                )}

                {/* Committee Comments */}
                {ms.committeeComments && (
                  <div className="text-[11px] text-[var(--foreground-muted)] border-t border-[var(--border-muted)] pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span>
                      <strong className="text-[var(--foreground)]">มติความเห็นคณะกรรมการตรวจรับ:</strong> {ms.committeeComments}
                    </span>
                    {ms.handoverNoteRef && (
                      <span className="font-mono text-[10px] font-bold text-[var(--accent)]">
                        เลขที่หนังสือส่งมอบ: {ms.handoverNoteRef}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 4: CLAUSE 162 LIQUIDATED DAMAGES CALCULATOR           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-slate-100 rounded-[var(--radius-xl)] p-5 sm:p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                หลักเกณฑ์การคำนวณค่าปรับตามระเบียบพัสดุภาครัฐ พ.ศ. ๒๕๖๐ (ข้อ ๑๖๒ - ๑๘๓)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ข้อกำหนดทางกฎหมายสำหรับการบริหารสัญญาและการตรวจรับพัสดุในงานจ้างดิจิทัล
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
              ข้อ ๑๖๒ (๒) งานจ้างที่ไม่ต้องการความต่อเนื่อง
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">สูตรการคิดค่าปรับ</span>
            <div className="font-mono text-amber-400 text-[11px] leading-relaxed">
              ค่าปรับรายวัน = วงเงินสัญญา ({formatBudgetFull(contract.contractValue)}) × ๐.๑%
            </div>
            <span className="text-slate-300 text-[11px] block mt-1">
              = <strong>{formatBudgetFull((contract.contractValue * 0.1) / 100)} บาท/วัน</strong>
            </span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">ยอดค่าปรับสะสมปัจจุบัน</span>
            <div className="font-mono text-xl font-bold text-white">
              {formatBudgetFull(contract.totalPenaltyBaht)}
            </div>
            <span className="text-slate-300 text-[11px] block mt-1">
              คำนวณจากล่าช้า {contract.totalOverdueDays} วัน ({contract.penaltyPercentOfContract}% ของสัญญา)
            </span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">เกณฑ์บอกเลิกสัญญา (ข้อ ๑๘๓)</span>
            <div className="text-[11px] text-slate-300 leading-relaxed">
              หากค่าปรับรวมเกิน <strong>ร้อยละ ๑๐</strong> ของวงเงินตามสัญญา ({formatBudgetFull(contract.contractValue * 0.1)}) ส่วนราชการต้องพิจารณาบอกเลิกสัญญา เว้นแต่ผู้รับจ้างยอมชำระค่าปรับโดยไม่มีเงื่อนไข
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
