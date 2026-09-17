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
  Wallet,
  Building2,
  Search,
  ExternalLink,
  TrendingUp,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatBudgetFull } from '@/lib/utils/format';

export interface BudgetDrillDownProject {
  id: string;
  projectNo: string;
  projectName: string;
  organizationId: string;
  organizationName: string;
  budget: number;
  status: string;
  priority: string;
  dpmPhase: string;
}

export interface BudgetDrillDownOrgData {
  name: string;
  fullName: string;
  budget: number;
  projectsCount: number;
}

export interface BudgetDrillDownModalProps {
  open: boolean;
  onClose: () => void;
  orgData: BudgetDrillDownOrgData[];
  projects: BudgetDrillDownProject[];
  totalBudget: number;
  initialOrgName?: string;
}

export function BudgetDrillDownModal({
  open,
  onClose,
  orgData,
  projects,
  totalBudget,
  initialOrgName,
}: BudgetDrillDownModalProps) {
  const [selectedOrg, setSelectedOrg] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (open) {
      if (initialOrgName) {
        // Find matching org
        const match = orgData.find(o => o.name === initialOrgName || o.fullName === initialOrgName);
        if (match) setSelectedOrg(match.name);
        else setSelectedOrg('ALL');
      } else {
        setSelectedOrg('ALL');
      }
    } else {
      setSearchQuery('');
    }
  }, [open, initialOrgName, orgData]);

  // Current selected org stats
  const activeOrgInfo = selectedOrg !== 'ALL' ? orgData.find(o => o.name === selectedOrg) : null;
  const currentBudget = activeOrgInfo ? activeOrgInfo.budget : totalBudget;
  const currentCount = activeOrgInfo ? activeOrgInfo.projectsCount : projects.length;
  const percentOfTotal = totalBudget > 0 ? ((currentBudget / totalBudget) * 100).toFixed(1) : '0';

  // Filtered projects
  const filteredProjects = projects.filter(p => {
    if (selectedOrg !== 'ALL') {
      const match = orgData.find(o => o.name === selectedOrg);
      if (match && !p.organizationName.includes(match.name) && p.organizationName !== match.fullName) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.projectName.toLowerCase().includes(q) || (p.projectNo || '').toLowerCase().includes(q) || p.organizationName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <Dialog open={open} onClose={onClose} size="2xl" className="max-h-[92vh] flex flex-col">
      <DialogHeader
        title={
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[var(--foreground)]">
                  การจัดสรรและติดตามงบประมาณรายหน่วยงาน (Budget Allocation & Distribution)
                </span>
              </div>
              <p className="text-[12px] text-[var(--foreground-muted)] font-normal mt-0.5">
                วิเคราะห์การกระจายงบประมาณตาม 5 หน่วยงานในสังกัดกระทรวงแรงงาน
              </p>
            </div>
          </div>
        }
        onClose={onClose}
      />

      <DialogBody className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40">
            <span className="text-[11px] text-[var(--foreground-muted)] font-medium block">
              หน่วยงานที่เลือก
            </span>
            <span className="text-base font-bold text-[var(--foreground)] block truncate mt-0.5" title={activeOrgInfo?.fullName || 'ทุกหน่วยงานในสังกัด'}>
              {activeOrgInfo?.fullName || 'ทุกหน่วยงานในสังกัดกระทรวงแรงงาน'}
            </span>
            <span className="text-[11px] text-[var(--foreground-subtle)] mt-1 block">
              คิดเป็น {percentOfTotal}% ของงบประมาณรวมทั้งกระทรวง
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40">
            <span className="text-[11px] text-[var(--foreground-muted)] font-medium block">
              วงเงินงบประมาณ
            </span>
            <span className="text-xl font-bold tabular-nums text-[var(--accent)] block mt-0.5">
              {formatBudgetFull(currentBudget)} บาท
            </span>
            <span className="text-[11px] text-[var(--foreground-subtle)] mt-1 block">
              จากงบรวม {formatBudgetFull(totalBudget)} บาท
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40">
            <span className="text-[11px] text-[var(--foreground-muted)] font-medium block">
              จำนวนโครงการ
            </span>
            <span className="text-xl font-bold tabular-nums text-[var(--foreground)] block mt-0.5">
              {currentCount} โครงการ
            </span>
            <span className="text-[11px] text-[var(--foreground-subtle)] mt-1 block">
              จากทั้งหมด {projects.length} โครงการในระบบ
            </span>
          </div>
        </div>

        {/* Org Selector buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setSelectedOrg('ALL')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer",
              selectedOrg === 'ALL'
                ? "bg-[var(--foreground)] text-[var(--background)] shadow-xs"
                : "bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]"
            )}
          >
            ทุกหน่วยงาน ({projects.length})
          </button>
          {orgData.map((org) => (
            <button
              key={org.name}
              type="button"
              onClick={() => setSelectedOrg(org.name)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer",
                selectedOrg === org.name
                  ? "bg-[var(--accent)] text-white shadow-xs"
                  : "bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]"
              )}
            >
              <span>{org.name}</span>
              <span className="ml-1.5 opacity-80 tabular-nums font-mono text-[11px]">
                ({org.projectsCount})
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อโครงการ หรืองบประมาณ..."
            className="w-full h-9 pl-9 pr-3 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface)] placeholder:text-[var(--foreground-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        {/* Projects Table */}
        <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)] shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--surface-muted)]/80 border-b border-[var(--border)] text-[11px] font-semibold text-[var(--foreground-muted)] uppercase">
                <th className="py-2.5 px-3">เลขที่ / โครงการ</th>
                <th className="py-2.5 px-3">หน่วยงาน</th>
                <th className="py-2.5 px-3 text-right">งบประมาณ</th>
                <th className="py-2.5 px-3 text-center">สัดส่วนในหน่วยงาน</th>
                <th className="py-2.5 px-3 text-center">สถานะ</th>
                <th className="py-2.5 px-3 text-right">แอ็กชัน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-muted)] text-[12px]">
              {filteredProjects.map((p) => {
                const propPercent = currentBudget > 0 ? ((p.budget / currentBudget) * 100).toFixed(1) : '0';
                return (
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
                      {formatBudgetFull(p.budget)} บาท
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums text-[11px] text-[var(--foreground-muted)]">
                      {propPercent}%
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
                );
              })}
            </tbody>
          </table>
        </div>
      </DialogBody>

      <DialogFooter className="flex justify-between items-center">
        <div className="text-[12px] text-[var(--foreground-muted)]">
          แสดง <span className="font-bold text-[var(--foreground)] tabular-nums">{filteredProjects.length}</span> โครงการ
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
