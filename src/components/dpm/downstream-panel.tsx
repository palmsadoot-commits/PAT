'use client';

import React from 'react';
import { ProjectDPMLifecycle } from '@/types';
import { formatBudgetFull, formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import { 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  Bug, 
  FileCheck2, 
  Award, 
  Sparkles, 
  BookOpen, 
  Clock, 
  Coins, 
  ShieldAlert,
  CalendarCheck
} from 'lucide-react';

interface DownstreamPanelProps {
  dpm: ProjectDPMLifecycle;
}

export function DownstreamPanel({ dpm }: DownstreamPanelProps) {
  const atp = dpm.atp;
  const defects = dpm.defects || [];
  const milestones = dpm.milestones || [];
  const closeout = dpm.closeout;

  return (
    <div className="space-y-6">
      {/* 1. ACCEPTANCE TEST PLAN (ATP) & UAT DASHBOARD */}
      {atp && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="p-5 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface-muted)]/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[var(--radius-md)] bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[var(--foreground)]">
                    แผนการตรวจรับงานและทดสอบระบบโดยผู้ใช้ (Acceptance Test Plan & UAT)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    กลยุทธ์: {atp.testStrategy} UAT
                  </span>
                </div>
                <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
                  เกณฑ์การยอมรับ (Acceptance Criteria), ความครอบคลุมการทดสอบ (Coverage), และความก้าวหน้ารายโมดูล
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-[var(--foreground-subtle)] block">Overall Test Coverage</span>
                <span className="text-sm font-bold text-emerald-700 tabular-nums">
                  {atp.overallTestCoveragePercent}%
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Entry & Exit Criteria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)]/30 space-y-2">
                <div className="flex items-center gap-1.5 text-blue-700 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>เกณฑ์ก่อนเริ่มการทดสอบ (Entry Criteria)</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[var(--foreground)]">
                  {atp.entryCriteria.map((crit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)]/30 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                  <Award className="w-3.5 h-3.5" />
                  <span>เกณฑ์การผ่านการทดสอบ (Exit Criteria)</span>
                </div>
                <ul className="space-y-1.5 text-xs text-[var(--foreground)]">
                  {atp.exitCriteria.map((crit, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Module Progress Table */}
            <div>
              <span className="text-[11px] font-bold text-[var(--foreground-subtle)] uppercase tracking-wider block mb-2.5">
                ความคืบหน้าการทดสอบรายโมดูลระบบ (Module UAT Progress)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {atp.modules.map((m, idx) => (
                  <div key={idx} className="p-3.5 rounded-[var(--radius-lg)] border border-[var(--border)] space-y-2 bg-[var(--surface)]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[var(--foreground)] truncate max-w-[200px]">{m.name}</span>
                      <span className="font-mono font-bold text-emerald-700 tabular-nums">{m.progressPercent}%</span>
                    </div>

                    <div className="w-full bg-[var(--border-muted)] h-2 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          m.progressPercent >= 100 ? 'bg-emerald-600' : 'bg-[var(--accent)]'
                        )}
                        style={{ width: `${m.progressPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[var(--foreground-muted)] pt-0.5">
                      <span>ทั้งหมด {m.totalTestCases} Scenarios</span>
                      <span className="text-emerald-700 font-semibold">ผ่าน: {m.passedTestCases}</span>
                      {m.failedTestCases > 0 && (
                        <span className="text-red-600 font-semibold">พบ Defect: {m.failedTestCases}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DEFECT MANAGEMENT */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-5 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface-muted)]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-red-50 text-red-700 border border-red-200 flex items-center justify-center font-bold">
              <Bug className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--foreground)]">
                  การบริหารข้อบกพร่องของระบบ (Defect Management)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {defects.filter(d => d.status === 'RESOLVED' || d.status === 'CLOSED').length} / {defects.length} แก้ไขแล้ว
                </span>
              </div>
              <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
                ติดตามข้อบกพร่องตามระดับความรุนแรง (Severity) พร้อมรอบการทดสอบและผู้รับผิดชอบ
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--surface-muted)] text-[var(--foreground-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                <th className="py-3 px-4 font-semibold">รหัส</th>
                <th className="py-3 px-4 font-semibold">รายละเอียดข้อบกพร่อง</th>
                <th className="py-3 px-4 font-semibold">โมดูล</th>
                <th className="py-3 px-4 font-semibold text-center">ระดับความรุนแรง</th>
                <th className="py-3 px-4 font-semibold text-center">รอบที่พบ</th>
                <th className="py-3 px-4 font-semibold">ผู้รับผิดชอบ</th>
                <th className="py-3 px-4 font-semibold text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-muted)]">
              {defects.map((def) => (
                <tr key={def.id} className="hover:bg-[var(--surface-muted)]/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[var(--foreground)]">{def.defectCode}</td>
                  <td className="py-3 px-4 font-medium text-[var(--foreground)] max-w-xs">{def.title}</td>
                  <td className="py-3 px-4 text-[var(--foreground-muted)] text-[11px]">{def.moduleName}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                        def.severity === 'CRITICAL'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : def.severity === 'MAJOR'
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      )}
                    >
                      {def.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-[11px] text-[var(--foreground-muted)] font-mono">
                    {def.foundInRound}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-[var(--foreground)]">
                    {def.assignedTo}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {def.status === 'RESOLVED' ? 'แก้ไขแล้ว' : def.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. DELIVERY & HANDOVER MILESTONES (ตรวจรับพัสดุและส่งมอบงาน) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-5 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface-muted)]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                การส่งมอบและตรวจรับงานตามสัญญา (Delivery & Inspection Milestones)
              </h3>
              <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
                กระบวนการตรวจรับของคณะกรรมการตรวจรับพัสดุ และการออกใบส่งมอบงาน
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {milestones.map((ms) => (
            <div
              key={ms.id}
              className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-[var(--foreground)]">
                    {ms.title}
                  </h4>
                  <span className="text-[11px] text-[var(--foreground-muted)]">
                    กำหนดส่งมอบ: {formatDate(ms.dueDate)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-700 tabular-nums">
                    {formatBudgetFull(ms.amountBaht)}
                  </span>
                  <span
                    className={cn(
                      'text-[11px] font-bold px-2.5 py-1 rounded-full border',
                      ms.committeeVerdict === 'ACCEPTED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    )}
                  >
                    มติตรวจรับ: {ms.committeeVerdict === 'ACCEPTED' ? 'ผ่านการตรวจรับ' : 'รอดำเนินการ'}
                  </span>
                </div>
              </div>

              {/* Deliverable list */}
              <div className="bg-[var(--surface-muted)]/40 p-3 rounded-[var(--radius-md)] border border-[var(--border-muted)]">
                <span className="text-[10px] font-bold text-[var(--foreground-subtle)] uppercase tracking-wider block mb-1.5">
                  รายการเอกสารและสิ่งที่ต้องส่งมอบในงวดนี้:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[var(--foreground)]">
                  {ms.deliverables.map((deliv, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{deliv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {ms.committeeComments && (
                <div className="text-[11px] text-[var(--foreground-muted)] flex items-center justify-between border-t border-[var(--border-muted)] pt-2 mt-2">
                  <span>
                    <strong>ความเห็นกรรมการ:</strong> {ms.committeeComments}
                  </span>
                  {ms.handoverNoteRef && (
                    <span className="font-mono font-bold text-[var(--accent)] text-[10px]">
                      เลขที่บันทึกส่งมอบ: {ms.handoverNoteRef}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. PROJECT CLOSEOUT & VALUE REALIZATION */}
      {closeout && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border)]">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                การปิดโครงการและการประเมินผลสัมฤทธิ์ (Project Closeout & Value Realization)
              </h3>
              <p className="text-[11px] text-[var(--foreground-muted)]">
                รายงานประเมินความคุ้มค่า ตัวชี้วัดผลสัมฤทธิ์ (KPI) และบทเรียนที่ได้รับ (Lessons Learned)
              </p>
            </div>
          </div>

          {/* KPI Scorecard */}
          <div>
            <span className="text-[11px] font-bold text-[var(--foreground-subtle)] uppercase tracking-wider block mb-3">
              ตารางประเมินผลสัมฤทธิ์ตามตัวชี้วัด (KPI Achievement Scorecard)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {closeout.kpiResults.map((kpi, idx) => (
                <div key={idx} className="p-3.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)]/30 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-semibold text-[var(--foreground-subtle)]">เป้าหมาย: {kpi.targetValue}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      {kpi.status === 'EXCEEDED' ? 'บรรลุเกินเป้า' : 'บรรลุเป้าหมาย'}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-emerald-700 tabular-nums">
                    {kpi.actualAchieved}
                  </div>
                  <p className="text-xs font-semibold text-[var(--foreground)] line-clamp-2">
                    {kpi.kpiName}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Value Realization Summary */}
          <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-blue-50/40 border-blue-200/60 space-y-1.5">
            <span className="text-xs font-bold text-blue-900 block">
              สรุปผลประโยชน์และความคุ้มค่า (Value Realization Summary)
            </span>
            <p className="text-xs text-blue-950 leading-relaxed">
              {closeout.valueRealizationSummary}
            </p>
          </div>

          {/* Lessons Learned */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-purple-700" />
              <span className="text-xs font-bold text-[var(--foreground)]">
                บทเรียนที่ได้รับและการถ่ายทอดองค์ความรู้ (Lessons Learned)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {closeout.lessonsLearned.map((lesson, idx) => (
                <div key={idx} className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] space-y-2 bg-[var(--surface)]">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--foreground-muted)] border">
                    หมวด: {lesson.category}
                  </span>
                  <div className="space-y-1 text-xs">
                    <p className="text-emerald-800 font-medium">
                      <strong>จุดเด่น/แนวทางที่ดี: </strong> {lesson.positiveFindings}
                    </p>
                    <p className="text-[var(--foreground-muted)]">
                      <strong>ปัญหาและการแก้ไข: </strong> {lesson.challengesAndSolutions}
                    </p>
                    <p className="text-blue-900 font-medium pt-1 border-t border-[var(--border-muted)]">
                      <strong>ข้อเสนอแนะสำหรับโครงการต่อไป: </strong> {lesson.recommendationsForNextProject}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
