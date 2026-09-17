'use client';

import React from 'react';
import { ProjectDPMLifecycle } from '@/types';
import { formatBudgetFull } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Target, 
  Clock, 
  Coins, 
  Award,
  AlertTriangle,
  UserCheck,
  Building,
  CheckCheck
} from 'lucide-react';

interface UpstreamPanelProps {
  dpm: ProjectDPMLifecycle;
}

export function UpstreamPanel({ dpm }: UpstreamPanelProps) {
  const charter = dpm.charter;
  const tc = charter?.tripleConstraints;

  return (
    <div className="space-y-6">
      {/* 1. PROJECT CHARTER (กฎบัตรโครงการ) */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-5 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface-muted)]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[var(--foreground)]">
                  กฎบัตรโครงการ (Project Charter)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {charter?.status === 'APPROVED' ? 'อนุมัติกฎบัตรแล้ว' : 'ฉบับร่าง'}
                </span>
              </div>
              <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
                เอกสารสถาปนาโครงการ กำหนดอำนาจหน้าที่ผู้จัดการโครงการ และเป้าหมายเชิงยุทธศาสตร์
              </p>
            </div>
          </div>

          {charter?.approvedBy && (
            <div className="text-right text-[11px] text-[var(--foreground-muted)]">
              <span>อนุมัติโดย: </span>
              <strong className="text-[var(--foreground)]">{charter.approvedBy}</strong>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Triple Constraints (ข้อจำกัด 3 ด้านหลัก + คุณภาพ) */}
          <div>
            <span className="text-[11px] font-bold text-[var(--foreground-subtle)] uppercase tracking-wider block mb-3">
              ข้อจำกัดโครงการและมาตรฐานคุณภาพ (Project Triple Constraints & Quality)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)]/40 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-700 text-xs font-bold">
                  <Target className="w-3.5 h-3.5" />
                  <span>ขอบเขต (Scope)</span>
                </div>
                <p className="text-[11px] text-[var(--foreground)] leading-relaxed line-clamp-3">
                  {tc?.scope || 'พัฒนาระบบดิจิทัลครบวงจร'}
                </p>
              </div>

              <div className="p-3.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)]/40 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>ระยะเวลา (Time)</span>
                </div>
                <p className="text-[11px] text-[var(--foreground)] leading-relaxed">
                  {tc?.time || '12 เดือนทำการ'}
                </p>
              </div>

              <div className="p-3.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)]/40 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                  <Coins className="w-3.5 h-3.5" />
                  <span>งบประมาณ (Cost)</span>
                </div>
                <p className="text-[13px] font-bold text-[var(--foreground)] tabular-nums">
                  {formatBudgetFull(tc?.cost || 0)}
                </p>
              </div>

              <div className="p-3.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)]/40 space-y-1">
                <div className="flex items-center gap-1.5 text-purple-700 text-xs font-bold">
                  <Award className="w-3.5 h-3.5" />
                  <span>คุณภาพ (Quality)</span>
                </div>
                <p className="text-[11px] text-[var(--foreground)] leading-relaxed line-clamp-3">
                  {tc?.quality || 'มาตรฐาน CMMI / ISO 29110'}
                </p>
              </div>
            </div>
          </div>

          {/* Business Case & Strategic Alignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] space-y-1.5">
              <span className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                ความจำเป็นทางธุรกิจและบริการ (Business Case)
              </span>
              <p className="text-xs text-[var(--foreground)] leading-relaxed">
                {charter?.businessCase}
              </p>
            </div>

            <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] space-y-1.5">
              <span className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                ความสอดคล้องเชิงยุทธศาสตร์ (Strategic Alignment)
              </span>
              <p className="text-xs text-[var(--foreground)] leading-relaxed">
                {charter?.strategicAlignment}
              </p>
            </div>
          </div>

          {/* Objectives */}
          <div>
            <span className="text-[11px] font-bold text-[var(--foreground-subtle)] uppercase tracking-wider block mb-2">
              วัตถุประสงค์เชิงรูปธรรม (Specific Objectives)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {charter?.objectives?.map((obj, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[var(--foreground)] bg-[var(--surface-muted)]/30 p-2.5 rounded-[var(--radius-md)] border border-[var(--border-muted)]">
                  <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project Leadership Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--border-muted)]">
            <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--surface-muted)]/50 border border-[var(--border-muted)]">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                SP
              </div>
              <div>
                <span className="text-[10px] text-[var(--foreground-muted)] block">ผู้สนับสนุนโครงการ (Project Sponsor)</span>
                <span className="text-xs font-bold text-[var(--foreground)]">{charter?.sponsorName}</span>
                <span className="text-[11px] text-[var(--foreground-subtle)] block">{charter?.sponsorPosition}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--surface-muted)]/50 border border-[var(--border-muted)]">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                PM
              </div>
              <div>
                <span className="text-[10px] text-[var(--foreground-muted)] block">ผู้จัดการโครงการ (Project Manager)</span>
                <span className="text-xs font-bold text-[var(--foreground)]">{charter?.projectManagerName}</span>
                <span className="text-[11px] text-[var(--foreground-subtle)] block">{charter?.projectManagerPosition}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RACI MATRIX & STAKEHOLDERS */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-5 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface-muted)]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                ผังความรับผิดชอบ (RACI Matrix) และผู้มีส่วนได้เสีย (Stakeholders)
              </h3>
              <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5">
                กำหนดหน้าที่ให้คณะทำงาน (Responsible, Accountable, Consulted, Informed)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">R = ผู้ปฏิบัติ</span>
            <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">A = ผู้ตัดสินใจ</span>
            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">C = ผู้ให้คำปรึกษา</span>
            <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">I = ผู้รับทราบ</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[var(--surface-muted)] text-[var(--foreground-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                <th className="py-3 px-4 font-semibold">ขั้นตอน / กิจกรรม</th>
                <th className="py-3 px-4 font-semibold text-center">ช่วงงาน</th>
                <th className="py-3 px-4 font-semibold text-blue-800">Responsible (R)</th>
                <th className="py-3 px-4 font-semibold text-red-800">Accountable (A)</th>
                <th className="py-3 px-4 font-semibold text-purple-800">Consulted (C)</th>
                <th className="py-3 px-4 font-semibold text-stone-600">Informed (I)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-muted)]">
              {dpm.raciMatrix?.map((row) => (
                <tr key={row.activityId} className="hover:bg-[var(--surface-muted)]/50 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-[var(--foreground)] max-w-xs">
                    {row.activityName}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--surface-muted)] text-[var(--foreground-muted)] border border-[var(--border)]">
                      {row.stage}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-blue-900 font-medium">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-[11px]">
                      {row.responsible}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-red-900 font-bold">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-red-50 border border-red-200 text-[11px]">
                      {row.accountable}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-purple-900">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200 text-[11px]">
                      {row.consulted}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-700">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-[11px]">
                      {row.informed}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. DIGITAL LAW COMPLIANCE CHECKLIST */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-5">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
            การตรวจสอบความสอดคล้องตามกฎหมายและระเบียบดิจิทัลภาครัฐ (Digital Law Compliance)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {dpm.compliance?.map((comp, idx) => (
            <div key={idx} className="p-3.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)]/30 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-[var(--foreground)] leading-snug">
                  {comp.actName}
                </span>
                <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {comp.status === 'COMPLIANT' ? 'สอดคล้อง 100%' : 'ระหว่างตรวจ'}
                </span>
              </div>
              <p className="text-[11px] text-[var(--foreground-muted)] leading-relaxed">
                {comp.details}
              </p>
              <span className="text-[10px] text-[var(--foreground-subtle)] block pt-1">
                ผู้รับผิดชอบ: {comp.responsibleTeam}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
