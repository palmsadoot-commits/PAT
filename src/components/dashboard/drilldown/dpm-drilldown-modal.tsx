'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Layers,
  Settings,
  Flag,
  Bug,
  GitPullRequestDraft,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatBudgetFull } from '@/lib/utils/format';

export interface DPMProjectItem {
  id: string;
  projectNo: string;
  projectName: string;
  organizationName: string;
  budget: number;
  status: string;
  priority: string;
  dpmPhase: string;
  assignedOfficer?: any;
}

export interface DPMDefectItem {
  id: string;
  projectId: string;
  projectName: string;
  projectNo: string;
  organizationName: string;
  defectCode: string;
  title: string;
  moduleName: string;
  severity: string;
  status: string;
  assignedTo: string;
  reportedDate: string;
  resolvedDate?: string;
}

export interface DPMChangeRequestItem {
  id: string;
  projectId: string;
  projectName: string;
  projectNo: string;
  organizationName: string;
  crNumber: string;
  title: string;
  requesterName: string;
  requestDate: string;
  reason: string;
  priority: string;
  scheduleImpactDays: number;
  costImpactBaht: number;
  scopeDescription: string;
  ccbDecision: string;
  ccbComments?: string;
}

export interface DPMDrillDownModalProps {
  open: boolean;
  onClose: () => void;
  projects: DPMProjectItem[];
  defects: DPMDefectItem[];
  changeRequests: DPMChangeRequestItem[];
  initialTab?: 'PHASE' | 'DEFECTS' | 'CCB';
  initialPhase?: 'UPSTREAM' | 'MIDSTREAM' | 'DOWNSTREAM';
}

export function DPMDrillDownModal({
  open,
  onClose,
  projects,
  defects,
  changeRequests,
  initialTab = 'PHASE',
  initialPhase = 'UPSTREAM',
}: DPMDrillDownModalProps) {
  const [activeTab, setActiveTab] = useState<'PHASE' | 'DEFECTS' | 'CCB'>(initialTab);
  const [phaseFilter, setPhaseFilter] = useState<'ALL' | 'UPSTREAM' | 'MIDSTREAM' | 'DOWNSTREAM'>(initialPhase);
  const [defectFilter, setDefectFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (open) {
      if (initialTab) setActiveTab(initialTab);
      if (initialPhase) setPhaseFilter(initialPhase);
    } else {
      setSearchQuery('');
    }
  }, [open, initialTab, initialPhase]);

  // Phase counts
  const phaseCounts = {
    UPSTREAM: projects.filter(p => p.dpmPhase === 'UPSTREAM').length,
    MIDSTREAM: projects.filter(p => p.dpmPhase === 'MIDSTREAM').length,
    DOWNSTREAM: projects.filter(p => p.dpmPhase === 'DOWNSTREAM').length,
  };

  const openDefectCount = defects.filter(d => d.status === 'OPEN' || d.status === 'IN_PROGRESS').length;
  const pendingCCBCount = changeRequests.filter(cr => cr.ccbDecision === 'PENDING').length;

  // Filtered projects
  const filteredProjects = projects.filter(p => {
    if (phaseFilter !== 'ALL' && p.dpmPhase !== phaseFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.projectName.toLowerCase().includes(q) || (p.projectNo || '').toLowerCase().includes(q) || p.organizationName.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered defects
  const filteredDefects = defects.filter(d => {
    if (defectFilter === 'OPEN_ONLY' && (d.status !== 'OPEN' && d.status !== 'IN_PROGRESS')) return false;
    if (defectFilter === 'RESOLVED' && d.status !== 'RESOLVED' && d.status !== 'CLOSED') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return d.projectName.toLowerCase().includes(q) || d.title.toLowerCase().includes(q) || d.defectCode.toLowerCase().includes(q) || (d.assignedTo || '').toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered CRs
  const filteredCRs = changeRequests.filter(cr => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return cr.projectName.toLowerCase().includes(q) || cr.title.toLowerCase().includes(q) || cr.crNumber.toLowerCase().includes(q) || cr.requesterName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <Dialog open={open} onClose={onClose} size="2xl" className="max-h-[92vh] flex flex-col">
      <DialogHeader
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[var(--foreground)]">
                  วงจรชีวิตโครงการ DPM และการควบคุมคุณภาพ (Project Lifecycle & Quality Assurance)
                </span>
              </div>
              <p className="text-[12px] text-[var(--foreground-muted)] font-normal mt-0.5">
                ติดตามสถานะระยะต้นน้ำ-กลางน้ำ-ปลายน้ำ ทะเบียนข้อบกพร่อง (Defects) และวาระการเปลี่ยนแปลง (CCB)
              </p>
            </div>
          </div>
        }
        onClose={onClose}
      />

      {/* Main Tabs */}
      <div className="flex items-center gap-2 px-6 pt-3 border-b border-[var(--border)] bg-[var(--surface-muted)]/30">
        <button
          type="button"
          onClick={() => setActiveTab('PHASE')}
          className={cn(
            "flex items-center gap-2 py-2.5 px-3 text-[13px] font-semibold border-b-2 transition-all cursor-pointer",
            activeTab === 'PHASE'
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}
        >
          <Layers className="w-4 h-4" />
          <span>โครงการตามเฟส DPM</span>
          <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-[var(--surface-muted)] text-[var(--foreground-subtle)] font-mono">
            {projects.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DEFECTS')}
          className={cn(
            "flex items-center gap-2 py-2.5 px-3 text-[13px] font-semibold border-b-2 transition-all cursor-pointer",
            activeTab === 'DEFECTS'
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}
        >
          <Bug className="w-4 h-4" />
          <span>ทะเบียนข้อบกพร่อง (Defects)</span>
          {openDefectCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-red-100 text-red-700 font-bold font-mono">
              เปิด {openDefectCount}
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-emerald-100 text-emerald-700 font-mono">
              0 ค้าง
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CCB')}
          className={cn(
            "flex items-center gap-2 py-2.5 px-3 text-[13px] font-semibold border-b-2 transition-all cursor-pointer",
            activeTab === 'CCB'
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}
        >
          <GitPullRequestDraft className="w-4 h-4" />
          <span>คำขอเปลี่ยนแปลง (CCB)</span>
          {pendingCCBCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-amber-100 text-amber-800 font-bold font-mono">
              รอ {pendingCCBCount}
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-[var(--surface-muted)] text-[var(--foreground-subtle)] font-mono">
              {changeRequests.length}
            </span>
          )}
        </button>
      </div>

      <DialogBody className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Search box */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อโครงการ, รหัส หรือผู้รับผิดชอบ..."
            className="w-full h-9 pl-9 pr-3 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface)] placeholder:text-[var(--foreground-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        {/* TAB 1: PHASE */}
        {activeTab === 'PHASE' && (
          <div className="space-y-4">
            {/* Phase switchers */}
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPhaseFilter('ALL')}
                className={cn(
                  "p-2.5 rounded-lg border text-left cursor-pointer transition-all",
                  phaseFilter === 'ALL'
                    ? "bg-[var(--surface-active)] border-[var(--primary)] ring-1 ring-[var(--primary)]"
                    : "bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-muted)]"
                )}
              >
                <span className="text-[11px] text-[var(--foreground-muted)] block font-medium">ทุกเฟส (All Phases)</span>
                <span className="text-lg font-bold tabular-nums text-[var(--foreground)]">{projects.length}</span>
              </button>

              <button
                type="button"
                onClick={() => setPhaseFilter('UPSTREAM')}
                className={cn(
                  "p-2.5 rounded-lg border text-left cursor-pointer transition-all",
                  phaseFilter === 'UPSTREAM'
                    ? "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500"
                    : "bg-[var(--surface)] border-[var(--border)] hover:bg-indigo-50/50"
                )}
              >
                <div className="flex items-center gap-1 text-[11px] text-indigo-700 font-medium">
                  <Layers size={12} />
                  <span>ต้นน้ำ (Upstream)</span>
                </div>
                <span className="text-lg font-bold tabular-nums text-indigo-700">{phaseCounts.UPSTREAM}</span>
                <span className="text-[10px] text-indigo-600 block">Charter, TOR, Bidding</span>
              </button>

              <button
                type="button"
                onClick={() => setPhaseFilter('MIDSTREAM')}
                className={cn(
                  "p-2.5 rounded-lg border text-left cursor-pointer transition-all",
                  phaseFilter === 'MIDSTREAM'
                    ? "bg-violet-50 border-violet-500 ring-1 ring-violet-500"
                    : "bg-[var(--surface)] border-[var(--border)] hover:bg-violet-50/50"
                )}
              >
                <div className="flex items-center gap-1 text-[11px] text-violet-700 font-medium">
                  <Settings size={12} />
                  <span>กลางน้ำ (Midstream)</span>
                </div>
                <span className="text-lg font-bold tabular-nums text-violet-700">{phaseCounts.MIDSTREAM}</span>
                <span className="text-[10px] text-violet-600 block">สัญญา, พัฒนาระบบ, RTM</span>
              </button>

              <button
                type="button"
                onClick={() => setPhaseFilter('DOWNSTREAM')}
                className={cn(
                  "p-2.5 rounded-lg border text-left cursor-pointer transition-all",
                  phaseFilter === 'DOWNSTREAM'
                    ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500"
                    : "bg-[var(--surface)] border-[var(--border)] hover:bg-emerald-50/50"
                )}
              >
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <Flag size={12} />
                  <span>ปลายน้ำ (Downstream)</span>
                </div>
                <span className="text-lg font-bold tabular-nums text-emerald-700">{phaseCounts.DOWNSTREAM}</span>
                <span className="text-[10px] text-emerald-600 block">ATP, UAT, ตรวจรับ</span>
              </button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)] shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--surface-muted)]/80 border-b border-[var(--border)] text-[11px] font-semibold text-[var(--foreground-muted)] uppercase">
                    <th className="py-2.5 px-3">เลขที่ / โครงการ</th>
                    <th className="py-2.5 px-3">หน่วยงาน</th>
                    <th className="py-2.5 px-3 text-right">งบประมาณ</th>
                    <th className="py-2.5 px-3 text-center">เฟส DPM</th>
                    <th className="py-2.5 px-3 text-center">สถานะโครงการ</th>
                    <th className="py-2.5 px-3 text-right">แอ็กชัน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-muted)] text-[12px]">
                  {filteredProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-[var(--surface-muted)]/40 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-semibold text-[var(--foreground)] block line-clamp-1">
                          {p.projectName}
                        </span>
                        <span className="text-[10px] text-[var(--foreground-muted)] font-mono">
                          {p.projectNo}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[var(--foreground-muted)]">
                        {p.organizationName}
                      </td>
                      <td className="py-3 px-3 text-right font-medium tabular-nums text-[var(--foreground)]">
                        {formatBudgetFull(p.budget)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          p.dpmPhase === 'UPSTREAM' && "bg-indigo-100 text-indigo-700",
                          p.dpmPhase === 'MIDSTREAM' && "bg-violet-100 text-violet-700",
                          p.dpmPhase === 'DOWNSTREAM' && "bg-emerald-100 text-emerald-700"
                        )}>
                          {p.dpmPhase}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--surface-muted)] text-[var(--foreground)] border border-[var(--border-muted)]">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/projects/${p.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[var(--accent)] hover:underline"
                        >
                          <span>เปิดดู</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DEFECTS */}
        {activeTab === 'DEFECTS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDefectFilter('ALL')}
                  className={cn(
                    "px-3 py-1 rounded-md text-[12px] font-medium transition-colors",
                    defectFilter === 'ALL'
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "bg-[var(--surface-muted)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  )}
                >
                  ทั้งหมด ({defects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDefectFilter('OPEN_ONLY')}
                  className={cn(
                    "px-3 py-1 rounded-md text-[12px] font-medium transition-colors",
                    defectFilter === 'OPEN_ONLY'
                      ? "bg-red-600 text-white"
                      : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                  )}
                >
                  เปิดอยู่ / รอดำเนินการ ({openDefectCount})
                </button>
                <button
                  type="button"
                  onClick={() => setDefectFilter('RESOLVED')}
                  className={cn(
                    "px-3 py-1 rounded-md text-[12px] font-medium transition-colors",
                    defectFilter === 'RESOLVED'
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                  )}
                >
                  แก้ไขแล้ว ({defects.filter(d => d.status === 'RESOLVED' || d.status === 'CLOSED').length})
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)] shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--surface-muted)]/80 border-b border-[var(--border)] text-[11px] font-semibold text-[var(--foreground-muted)] uppercase">
                    <th className="py-2.5 px-3">รหัส / โครงการ</th>
                    <th className="py-2.5 px-3">รายละเอียดข้อบกพร่อง (Defect)</th>
                    <th className="py-2.5 px-3">โมดูล</th>
                    <th className="py-2.5 px-3 text-center">ความรุนแรง</th>
                    <th className="py-2.5 px-3 text-center">สถานะ</th>
                    <th className="py-2.5 px-3">ผู้รับผิดชอบ</th>
                    <th className="py-2.5 px-3 text-right">แอ็กชัน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-muted)] text-[12px]">
                  {filteredDefects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[var(--foreground-muted)]">
                        <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-[var(--success)]" />
                        <span>ไม่พบรายการข้อบกพร่องที่ค้างอยู่ในระบบ</span>
                      </td>
                    </tr>
                  ) : (
                    filteredDefects.map((d) => (
                      <tr key={d.id} className="hover:bg-[var(--surface-muted)]/40 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-[var(--foreground)] block">
                            {d.defectCode}
                          </span>
                          <span className="text-[11px] text-[var(--foreground-muted)] block line-clamp-1">
                            {d.projectName}
                          </span>
                        </td>
                        <td className="py-3 px-3 max-w-[280px]">
                          <span className="font-medium text-[var(--foreground)] block">
                            {d.title}
                          </span>
                          <span className="text-[10px] text-[var(--foreground-subtle)]">
                            รายงานเมื่อ {d.reportedDate}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[var(--foreground-muted)] text-[11px]">
                          {d.moduleName}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            d.severity === 'CRITICAL' && "bg-red-800 text-white",
                            d.severity === 'MAJOR' && "bg-red-100 text-red-700",
                            d.severity === 'MINOR' && "bg-amber-100 text-amber-700",
                            d.severity === 'COSMETIC' && "bg-slate-100 text-slate-600"
                          )}>
                            {d.severity}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            d.status === 'OPEN' && "bg-red-50 text-red-700 border border-red-200",
                            d.status === 'IN_PROGRESS' && "bg-amber-50 text-amber-700 border border-amber-200",
                            d.status === 'RESOLVED' && "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          )}>
                            {d.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[11px] text-[var(--foreground-muted)]">
                          {d.assignedTo}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/projects/${d.projectId}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)] hover:underline"
                          >
                            <span>เปิดดู</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CCB */}
        {activeTab === 'CCB' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)] shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--surface-muted)]/80 border-b border-[var(--border)] text-[11px] font-semibold text-[var(--foreground-muted)] uppercase">
                    <th className="py-2.5 px-3">เลขที่ CR / โครงการ</th>
                    <th className="py-2.5 px-3">หัวข้อคำขอเปลี่ยนแปลง</th>
                    <th className="py-2.5 px-3">ผู้ขอ / วันที่</th>
                    <th className="py-2.5 px-3 text-center">ผลกระทบ</th>
                    <th className="py-2.5 px-3 text-center">มติคณะกรรมการ CCB</th>
                    <th className="py-2.5 px-3 text-right">แอ็กชัน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-muted)] text-[12px]">
                  {filteredCRs.map((cr) => (
                    <tr key={cr.id} className="hover:bg-[var(--surface-muted)]/40 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-[var(--foreground)] block">
                          {cr.crNumber}
                        </span>
                        <span className="text-[11px] text-[var(--foreground-muted)] block line-clamp-1">
                          {cr.projectName}
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-[280px]">
                        <span className="font-medium text-[var(--foreground)] block leading-tight">
                          {cr.title}
                        </span>
                        <span className="text-[11px] text-[var(--foreground-muted)] mt-0.5 line-clamp-1">
                          เหตุผล: {cr.reason}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px]">
                        <span className="font-medium text-[var(--foreground)] block">
                          {cr.requesterName}
                        </span>
                        <span className="text-[10px] text-[var(--foreground-subtle)]">
                          {cr.requestDate}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-[11px]">
                        <div className="text-[var(--foreground)] font-medium">
                          เวลา: +{cr.scheduleImpactDays} วัน
                        </div>
                        <div className="text-[var(--foreground-muted)] text-[10px]">
                          งบ: +{formatBudgetFull(cr.costImpactBaht)}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          cr.ccbDecision === 'PENDING' && "bg-amber-100 text-amber-800 border border-amber-200 animate-pulse",
                          cr.ccbDecision === 'APPROVED' && "bg-emerald-100 text-emerald-800 border border-emerald-200",
                          cr.ccbDecision === 'REJECTED' && "bg-red-100 text-red-800 border border-red-200",
                          cr.ccbDecision === 'DEFERRED_TO_BACKLOG' && "bg-slate-100 text-slate-700 border border-slate-200"
                        )}>
                          {cr.ccbDecision === 'PENDING' ? 'รอพิจารณา' : cr.ccbDecision}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/projects/${cr.projectId}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)] hover:underline"
                        >
                          <span>เปิดดู</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogBody>

      <DialogFooter>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 text-[13px] font-medium rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
        >
          ปิดหน้าต่าง
        </button>
      </DialogFooter>
    </Dialog>
  );
}
