'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  ShieldCheck,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  Info,
  Grid3X3,
  ListFilter,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DrillDownRiskItem {
  id: string;
  projectId: string;
  projectName: string;
  projectNo: string;
  organizationId: string;
  organizationName: string;
  riskCode: string;
  riskTitle: string;
  category: string;
  likelihood: number;
  impact: number;
  riskScore: number;
  severityLevel: string;
  mitigationPlan: string;
  contingencyPlan: string;
  riskOwner: string;
  status: string;
}

export interface RiskDrillDownModalProps {
  open: boolean;
  onClose: () => void;
  risks: DrillDownRiskItem[];
  initialSeverity?: string; // 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'
  initialProjectId?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  ALL: 'ทุกหมวดหมู่',
  TECHNICAL: 'ด้านเทคนิค (Technical)',
  MANAGEMENT: 'ด้านการบริหาร (Management)',
  SCHEDULE: 'ด้านระยะเวลา (Schedule)',
  BUDGET: 'ด้านงบประมาณ (Budget)',
  LEGAL: 'ด้านกฎหมาย/ระเบียบ (Legal)',
};

export function RiskDrillDownModal({
  open,
  onClose,
  risks,
  initialSeverity = 'ALL',
  initialProjectId,
}: RiskDrillDownModalProps) {
  const [severityFilter, setSeverityFilter] = useState<string>(initialSeverity);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<{ l: number; i: number } | null>(null);
  const [showMatrix, setShowMatrix] = useState<boolean>(true);

  // Sync initialSeverity when opened
  React.useEffect(() => {
    if (open) {
      if (initialSeverity) setSeverityFilter(initialSeverity);
      if (initialProjectId) {
        const found = risks.find(r => r.projectId === initialProjectId);
        if (found) setSearchQuery(found.projectName);
      }
    } else {
      setSelectedCell(null);
      setSearchQuery('');
    }
  }, [open, initialSeverity, initialProjectId, risks]);

  // Statistics
  const stats = useMemo(() => {
    let extreme = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    let closed = 0;

    risks.forEach((r) => {
      const sev = r.severityLevel?.toUpperCase();
      if (r.status === 'CLOSED') closed++;
      if (sev === 'EXTREME') extreme++;
      else if (sev === 'HIGH') high++;
      else if (sev === 'MEDIUM') medium++;
      else if (sev === 'LOW') low++;
    });

    return { total: risks.length, highAndExtreme: extreme + high, extreme, high, medium, low, closed };
  }, [risks]);

  // Matrix counts (Likelihood 1-5, Impact 1-5)
  const matrixCounts = useMemo(() => {
    const grid: Record<string, number> = {};
    for (let l = 1; l <= 5; l++) {
      for (let i = 1; i <= 5; i++) {
        grid[`${l}-${i}`] = 0;
      }
    }
    risks.forEach((r) => {
      const key = `${r.likelihood || 1}-${r.impact || 1}`;
      if (grid[key] !== undefined) grid[key]++;
    });
    return grid;
  }, [risks]);

  // Filtered risks
  const filteredRisks = useMemo(() => {
    return risks.filter((r) => {
      // Matrix cell filter
      if (selectedCell) {
        if (r.likelihood !== selectedCell.l || r.impact !== selectedCell.i) return false;
      }

      // Severity filter
      if (severityFilter === 'HIGH_EXTREME') {
        const sev = r.severityLevel?.toUpperCase();
        if (sev !== 'HIGH' && sev !== 'EXTREME') return false;
      } else if (severityFilter !== 'ALL') {
        if (r.severityLevel?.toUpperCase() !== severityFilter) return false;
      }

      // Category filter
      if (categoryFilter !== 'ALL' && r.category?.toUpperCase() !== categoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && r.status?.toUpperCase() !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesProject = r.projectName.toLowerCase().includes(query);
        const matchesCode = (r.projectNo || '').toLowerCase().includes(query) || (r.riskCode || '').toLowerCase().includes(query);
        const matchesTitle = r.riskTitle.toLowerCase().includes(query);
        const matchesOwner = (r.riskOwner || '').toLowerCase().includes(query);
        if (!matchesProject && !matchesCode && !matchesTitle && !matchesOwner) return false;
      }

      return true;
    });
  }, [risks, severityFilter, categoryFilter, statusFilter, searchQuery, selectedCell]);

  const getCellColor = (l: number, i: number) => {
    const score = l * i;
    if (score >= 20) return 'bg-red-700 text-white hover:bg-red-800';
    if (score >= 15) return 'bg-red-500 text-white hover:bg-red-600';
    if (score >= 8) return 'bg-amber-400 text-amber-950 hover:bg-amber-500';
    return 'bg-emerald-200 text-emerald-900 hover:bg-emerald-300';
  };

  const getSeverityBadge = (level: string) => {
    const sev = level?.toUpperCase();
    if (sev === 'EXTREME') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-800 text-white border border-red-900">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          วิกฤต (EXTREME)
        </span>
      );
    }
    if (sev === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
          สูง (HIGH)
        </span>
      );
    }
    if (sev === 'MEDIUM') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          ปานกลาง (MEDIUM)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        ต่ำ (LOW)
      </span>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} size="2xl" className="max-h-[92vh] flex flex-col">
      <DialogHeader
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[var(--foreground)]">
                  ทะเบียนและเมทริกซ์ความเสี่ยงโครงการ (Enterprise Project Risk Register)
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-[var(--surface-muted)] text-[var(--foreground-muted)] border border-[var(--border)]">
                  {stats.total} รายการ
                </span>
              </div>
              <p className="text-[12px] text-[var(--foreground-muted)] font-normal mt-0.5">
                จำแนกความเสี่ยงตามระดับโอกาสเกิด (Likelihood) และผลกระทบ (Impact) พร้อมมาตรการควบคุม
              </p>
            </div>
          </div>
        }
        onClose={onClose}
      />

      <DialogBody className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            type="button"
            onClick={() => { setSeverityFilter('ALL'); setSelectedCell(null); }}
            className={cn(
              "p-3 rounded-lg border text-left transition-all cursor-pointer",
              severityFilter === 'ALL' && !selectedCell
                ? "bg-[var(--surface-active)] border-[var(--primary)] ring-1 ring-[var(--primary)]"
                : "bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-muted)]"
            )}
          >
            <span className="text-[11px] text-[var(--foreground-muted)] font-medium block">ความเสี่ยงทั้งหมด</span>
            <span className="text-xl font-bold tabular-nums text-[var(--foreground)]">{stats.total}</span>
          </button>

          <button
            type="button"
            onClick={() => { setSeverityFilter('HIGH_EXTREME'); setSelectedCell(null); }}
            className={cn(
              "p-3 rounded-lg border text-left transition-all cursor-pointer",
              severityFilter === 'HIGH_EXTREME'
                ? "bg-red-50 border-red-500 ring-1 ring-red-500"
                : "bg-[var(--surface)] border-[var(--border)] hover:bg-red-50/50"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-red-700 font-medium">สูง/วิกฤต (High/Ext)</span>
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            </div>
            <span className="text-xl font-bold tabular-nums text-red-600">{stats.highAndExtreme}</span>
          </button>

          <button
            type="button"
            onClick={() => { setSeverityFilter('MEDIUM'); setSelectedCell(null); }}
            className={cn(
              "p-3 rounded-lg border text-left transition-all cursor-pointer",
              severityFilter === 'MEDIUM'
                ? "bg-amber-50 border-amber-500 ring-1 ring-amber-500"
                : "bg-[var(--surface)] border-[var(--border)] hover:bg-amber-50/50"
            )}
          >
            <span className="text-[11px] text-amber-700 font-medium block">ปานกลาง (Medium)</span>
            <span className="text-xl font-bold tabular-nums text-amber-600">{stats.medium}</span>
          </button>

          <button
            type="button"
            onClick={() => { setSeverityFilter('LOW'); setSelectedCell(null); }}
            className={cn(
              "p-3 rounded-lg border text-left transition-all cursor-pointer",
              severityFilter === 'LOW'
                ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500"
                : "bg-[var(--surface)] border-[var(--border)] hover:bg-emerald-50/50"
            )}
          >
            <span className="text-[11px] text-emerald-700 font-medium block">ต่ำ (Low)</span>
            <span className="text-xl font-bold tabular-nums text-emerald-600">{stats.low}</span>
          </button>

          <button
            type="button"
            onClick={() => { setStatusFilter(statusFilter === 'CLOSED' ? 'ALL' : 'CLOSED'); }}
            className={cn(
              "p-3 rounded-lg border text-left transition-all cursor-pointer",
              statusFilter === 'CLOSED'
                ? "bg-slate-100 border-slate-500 ring-1 ring-slate-500"
                : "bg-[var(--surface)] border-[var(--border)] hover:bg-slate-50"
            )}
          >
            <span className="text-[11px] text-[var(--foreground-muted)] font-medium block">แก้ไขแล้ว (Closed)</span>
            <span className="text-xl font-bold tabular-nums text-slate-700">{stats.closed}</span>
          </button>
        </div>

        {/* Matrix 5x5 Collapsible Section */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-[var(--foreground-muted)]" />
              <h4 className="text-[13px] font-semibold text-[var(--foreground)]">
                เมทริกซ์วิเคราะห์ความเสี่ยง 5x5 (Risk Assessment Matrix)
              </h4>
              {selectedCell && (
                <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  กรอง L={selectedCell.l} x I={selectedCell.i}
                  <button
                    onClick={() => setSelectedCell(null)}
                    className="ml-1.5 font-bold hover:text-blue-950"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowMatrix(!showMatrix)}
              className="text-[12px] font-medium text-[var(--accent)] hover:underline"
            >
              {showMatrix ? 'ซ่อนเมทริกซ์' : 'แสดงเมทริกซ์'}
            </button>
          </div>

          {showMatrix && (
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center pt-1">
              <div className="relative">
                {/* Y-axis label */}
                <div className="absolute -left-7 top-1/2 -translate-y-1/2 -rotate-90 text-[11px] font-semibold text-[var(--foreground-muted)] whitespace-nowrap">
                  โอกาสเกิด (Likelihood)
                </div>

                {/* 5x5 Grid */}
                <div className="grid grid-rows-5 gap-1.5 ml-4">
                  {[5, 4, 3, 2, 1].map((l) => (
                    <div key={`l-${l}`} className="flex items-center gap-1.5">
                      <span className="w-4 text-right text-[11px] font-bold text-[var(--foreground-muted)] tabular-nums">
                        {l}
                      </span>
                      {[1, 2, 3, 4, 5].map((i) => {
                        const count = matrixCounts[`${l}-${i}`] || 0;
                        const isSelected = selectedCell?.l === l && selectedCell?.i === i;
                        return (
                          <button
                            key={`cell-${l}-${i}`}
                            type="button"
                            onClick={() => {
                              if (isSelected) setSelectedCell(null);
                              else setSelectedCell({ l, i });
                            }}
                            className={cn(
                              "w-11 h-9 rounded-md flex flex-col items-center justify-center transition-all cursor-pointer relative",
                              getCellColor(l, i),
                              isSelected && "ring-2 ring-black ring-offset-2 scale-105 z-10",
                              count === 0 && "opacity-40"
                            )}
                            title={`โอกาสเกิด: ${l}, ผลกระทบ: ${i} (คะแนน: ${l * i}) - จำนวน ${count} รายการ`}
                          >
                            <span className="text-[12px] font-bold tabular-nums leading-none">
                              {count}
                            </span>
                            <span className="text-[8px] opacity-75 leading-none mt-0.5">
                              {l * i}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                  {/* X-axis labels */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="w-4" />
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={`i-${i}`} className="w-11 text-center text-[11px] font-bold text-[var(--foreground-muted)] tabular-nums">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>

                {/* X-axis label */}
                <div className="text-center text-[11px] font-semibold text-[var(--foreground-muted)] mt-1 ml-4">
                  ผลกระทบ (Impact)
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-2 text-[11px] text-[var(--foreground-muted)] border-t sm:border-t-0 sm:border-l border-[var(--border)] pt-3 sm:pt-0 sm:pl-5">
                <span className="font-semibold text-[var(--foreground)]">เกณฑ์ระดับความรุนแรง:</span>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-red-700" />
                  <span>วิกฤต (Extreme: 20-25)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-red-500" />
                  <span>สูง (High: 15-19)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-amber-400" />
                  <span>ปานกลาง (Medium: 7-14)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-emerald-200" />
                  <span>ต่ำ (Low: 1-6)</span>
                </div>
                <span className="text-[10px] text-[var(--foreground-subtle)] mt-1">
                  *คลิกช่องตารางเพื่อกรองรายการความเสี่ยง
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อโครงการ, รหัสความเสี่ยง, หรือผู้รับผิดชอบ..."
              className="w-full h-9 pl-9 pr-3 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface)] placeholder:text-[var(--foreground-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 text-[12px] font-medium rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 text-[12px] font-medium rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="ALL">ทุกสถานะ</option>
              <option value="MONITORING">MONITORING (เฝ้าระวัง)</option>
              <option value="OPEN">OPEN (เปิดอยู่)</option>
              <option value="CLOSED">CLOSED (แก้ไขแล้ว)</option>
            </select>

            {(severityFilter !== 'ALL' || categoryFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery || selectedCell) && (
              <button
                type="button"
                onClick={() => {
                  setSeverityFilter('ALL');
                  setCategoryFilter('ALL');
                  setStatusFilter('ALL');
                  setSearchQuery('');
                  setSelectedCell(null);
                }}
                className="h-9 px-2.5 text-[12px] font-medium text-[var(--danger)] hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>

        {/* Risk Table */}
        <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--surface-muted)]/80 border-b border-[var(--border)] text-[11px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
                  <th className="py-2.5 px-3">โครงการ / รหัส</th>
                  <th className="py-2.5 px-3">รายละเอียดความเสี่ยง</th>
                  <th className="py-2.5 px-3 text-center">ระดับ / คะแนน</th>
                  <th className="py-2.5 px-3">มาตรการป้องกันและแผนฉุกเฉิน</th>
                  <th className="py-2.5 px-3">ผู้รับผิดชอบ</th>
                  <th className="py-2.5 px-3 text-center">สถานะ</th>
                  <th className="py-2.5 px-3 text-right">แอ็กชัน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-muted)] text-[12px]">
                {filteredRisks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-[var(--foreground-muted)]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ShieldCheck className="w-8 h-8 text-[var(--success)]" />
                        <span className="font-medium">ไม่พบรายการความเสี่ยงที่ตรงกับเงื่อนไขการค้นหา</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRisks.map((r) => (
                    <tr key={r.id} className="hover:bg-[var(--surface-muted)]/40 transition-colors">
                      <td className="py-3 px-3 align-top min-w-[170px]">
                        <span className="font-semibold text-[var(--foreground)] block line-clamp-2">
                          {r.projectName}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--surface-muted)] text-[var(--foreground-subtle)] font-mono">
                            {r.projectNo || r.projectId}
                          </span>
                          <span className="text-[10px] text-[var(--foreground-muted)]">
                            {r.riskCode}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 align-top min-w-[220px]">
                        <span className="text-[13px] font-medium text-[var(--foreground)] leading-snug block">
                          {r.riskTitle}
                        </span>
                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-muted)] text-[var(--foreground-subtle)] font-medium">
                          {r.category}
                        </span>
                      </td>

                      <td className="py-3 px-3 align-top text-center min-w-[130px]">
                        {getSeverityBadge(r.severityLevel)}
                        <div className="text-[11px] text-[var(--foreground-muted)] mt-1 tabular-nums font-medium">
                          L: {r.likelihood} × I: {r.impact} = <span className="font-bold text-[var(--foreground)]">{r.riskScore}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 align-top min-w-[240px] space-y-1">
                        <div>
                          <span className="text-[10px] font-bold text-blue-700 block uppercase">มาตรการป้องกัน (Mitigation):</span>
                          <p className="text-[11px] text-[var(--foreground-muted)] line-clamp-2 leading-relaxed">
                            {r.mitigationPlan || '-'}
                          </p>
                        </div>
                        {r.contingencyPlan && (
                          <div className="pt-0.5">
                            <span className="text-[10px] font-bold text-amber-700 block uppercase">แผนเผชิญเหตุ (Contingency):</span>
                            <p className="text-[11px] text-[var(--foreground-muted)] line-clamp-2 leading-relaxed">
                              {r.contingencyPlan}
                            </p>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 align-top min-w-[140px]">
                        <span className="text-[11px] text-[var(--foreground)] font-medium block">
                          {r.riskOwner || '-'}
                        </span>
                        <span className="text-[10px] text-[var(--foreground-muted)] block mt-0.5">
                          {r.organizationName}
                        </span>
                      </td>

                      <td className="py-3 px-3 align-top text-center min-w-[90px]">
                        <span className={cn(
                          "px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider",
                          r.status === 'MONITORING' && "bg-blue-50 text-blue-700 border border-blue-200",
                          r.status === 'OPEN' && "bg-amber-50 text-amber-700 border border-amber-200",
                          r.status === 'CLOSED' && "bg-slate-100 text-slate-600 border border-slate-200"
                        )}>
                          {r.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 align-top text-right min-w-[100px]">
                        <Link
                          href={`/projects/${r.projectId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] hover:bg-[var(--accent-muted)] rounded-md transition-colors"
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
      </DialogBody>

      <DialogFooter className="flex justify-between items-center">
        <div className="text-[12px] text-[var(--foreground-muted)]">
          แสดง <span className="font-bold text-[var(--foreground)] tabular-nums">{filteredRisks.length}</span> จากทั้งหมด <span className="tabular-nums">{stats.total}</span> รายการ
        </div>
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
