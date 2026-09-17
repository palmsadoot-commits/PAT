'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  PlusCircle, 
  Search, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet,
  X,
  FolderKanban
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatBudgetFull, formatDate } from '@/lib/utils/format';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'ร่าง', color: 'var(--status-draft)', bg: 'var(--status-draft-bg)' },
  SUBMITTED: { label: 'ยื่นเสนอ', color: 'var(--status-submitted)', bg: 'var(--status-submitted-bg)' },
  DOCUMENT_CHECK: { label: 'ตรวจเอกสาร', color: 'var(--status-checking)', bg: 'var(--status-checking-bg)' },
  UNDER_REVIEW: { label: 'กำลังพิจารณา', color: 'var(--status-review)', bg: 'var(--status-review-bg)' },
  RETURNED: { label: 'ตีกลับแก้ไข', color: 'var(--status-returned)', bg: 'var(--status-returned-bg)' },
  PENDING_APPROVAL: { label: 'รออนุมัติ', color: 'var(--status-pending)', bg: 'var(--status-pending-bg)' },
  APPROVED: { label: 'อนุมัติแล้ว', color: 'var(--status-approved)', bg: 'var(--status-approved-bg)' },
  REJECTED: { label: 'ไม่อนุมัติ', color: 'var(--status-rejected)', bg: 'var(--status-rejected-bg)' },
  IN_PROGRESS: { label: 'กำลังดำเนินการ', color: 'var(--status-progress)', bg: 'var(--status-progress-bg)' },
  COMPLETED: { label: 'เสร็จสิ้น', color: 'var(--status-completed)', bg: 'var(--status-completed-bg)' },
  CANCELLED: { label: 'ยกเลิก', color: 'var(--status-cancelled)', bg: 'var(--status-cancelled-bg)' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  HIGH: { label: 'เร่งด่วน', color: 'text-red-700', dot: 'bg-red-500' },
  MEDIUM: { label: 'ปกติ', color: 'text-amber-700', dot: 'bg-amber-500' },
  LOW: { label: 'ต่ำ', color: 'text-emerald-700', dot: 'bg-emerald-500' },
};

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });

  const initialStatus = searchParams.get('status') || '';
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(initialStatus);
  const [organizationId, setOrganizationId] = useState(searchParams.get('org') || '');
  const [fiscalYear, setFiscalYear] = useState(searchParams.get('year') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [organizations, setOrganizations] = useState<any[]>([]);

  const fetchProjects = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('pageSize', '10');
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);

      if (search.trim()) params.set('search', search.trim());
      if (status) params.set('status', status);
      if (organizationId) params.set('organizationId', organizationId);
      if (fiscalYear) params.set('fiscalYear', fiscalYear);
      if (priority) params.set('priority', priority);

      const res = await fetch(`/api/projects?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setProjects(json.data || []);
        if (json.pagination) {
          setPagination(json.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((json) => {
        if (json?.data?.charts?.byOrg) {
          setOrganizations(json.data.charts.byOrg);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, status, organizationId, fiscalYear, priority, sortBy, sortOrder]);

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setOrganizationId('');
    setFiscalYear('');
    setPriority('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const hasActiveFilters = !!(search || status || organizationId || fiscalYear || priority);

  return (
    <div className="space-y-5 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="workspace-eyebrow mb-1.5">PROJECT REGISTRY</p>
          <h1 className="text-display text-[var(--foreground)]">โครงการทั้งหมด</h1>
          <p className="mt-1 text-[13px] text-[var(--foreground-muted)]">
            ค้นหา ตรวจสอบ และติดตามสถานะโครงการ ({pagination.total.toLocaleString()} รายการ)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/reports/export/projects"
            className="flex h-9 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-muted)]"
            title="ส่งออกรายงาน Excel/CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </a>

          <Link
            href="/projects/new"
            className="flex h-9 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--primary-hover)]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>สร้างโครงการใหม่</span>
          </Link>
        </div>
      </div>

      {/* Quick Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {[
          { label: 'ทั้งหมด', value: '' },
          { label: 'รอตรวจสอบ/พิจารณา', value: 'SUBMITTED,DOCUMENT_CHECK,UNDER_REVIEW' },
          { label: 'รออนุมัติ', value: 'PENDING_APPROVAL' },
          { label: 'อนุมัติแล้ว / ดำเนินการ', value: 'APPROVED,IN_PROGRESS,COMPLETED' },
          { label: 'ตีกลับแก้ไข', value: 'RETURNED' },
          { label: 'ฉบับร่าง', value: 'DRAFT' },
        ].map((tab) => {
          const isSelected = status === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setStatus(tab.value)}
              className={cn(
                'whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                isSelected
                  ? 'bg-[var(--accent)] text-white shadow-xs'
                  : 'bg-[var(--surface)] text-[var(--foreground-muted)] border border-[var(--border)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <section className="workspace-panel space-y-3 p-3 sm:p-4" aria-label="ตัวกรองโครงการ">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อโครงการ, เลขที่โครงการ, หน่วยงาน..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)] py-1.5 pl-9 pr-3 text-[13px] text-[var(--foreground)] outline-none transition-all focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent)]/15"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 min-w-[130px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)] px-3 text-[13px] text-[var(--foreground)] outline-none transition-all focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent)]/15 cursor-pointer"
          >
            <option value="">ทุกสถานะ (All Status)</option>
            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>

          <select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            className="h-9 min-w-[120px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)] px-3 text-[13px] text-[var(--foreground)] outline-none transition-all focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent)]/15 cursor-pointer"
          >
            <option value="">ทุกปีงบฯ</option>
            <option value="2569">ปี 2569</option>
            <option value="2568">ปี 2568</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="h-9 min-w-[120px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)] px-3 text-[13px] text-[var(--foreground)] outline-none transition-all focus:border-[var(--accent)] focus:bg-white focus:ring-2 focus:ring-[var(--accent)]/15 cursor-pointer"
          >
            <option value="">ทุกความเร่งด่วน</option>
            <option value="HIGH">เร่งด่วน (High)</option>
            <option value="MEDIUM">ปกติ (Medium)</option>
            <option value="LOW">ต่ำ (Low)</option>
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2.5 border-t border-[var(--border-muted)] text-[11px] text-[var(--foreground-muted)]">
            <span>พบ <strong className="text-[var(--foreground)] font-semibold">{pagination.total.toLocaleString()}</strong> โครงการตรงตามเงื่อนไข</span>
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-[var(--accent)] hover:underline font-semibold cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>ล้างตัวกรองทั้งหมด</span>
            </button>
          </div>
        )}
      </section>

      <section className="workspace-panel overflow-hidden" aria-label="ตารางโครงการ">
        {loading ? (
          <div className="p-6 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-[var(--surface-muted)] rounded-[var(--radius-md)]"></div>
            ))}
          </div>
        ) : (
          <>
          <div className="divide-y divide-[var(--border-muted)] md:hidden">
            {projects.map((p: any) => {
              const s = STATUS_CONFIG[p.status] || STATUS_CONFIG.DRAFT;
              const pr = PRIORITY_CONFIG[p.priority] || PRIORITY_CONFIG.MEDIUM;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => router.push(`/projects/${p.id}`)}
                  className="block w-full space-y-3 px-4 py-4 text-left transition-colors hover:bg-[var(--surface-inset)] focus-visible:bg-[var(--surface-inset)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="case-id">{p.projectNo || p.id}</span>
                      <p className="mt-2 truncate text-[14px] font-semibold text-[var(--foreground)]">{p.projectName}</p>
                      <p className="mt-0.5 truncate text-[11px] text-[var(--foreground-muted)]">{p.organizationName || '-'}</p>
                    </div>
                    <span className="status-chip shrink-0" style={{ color: s.color, backgroundColor: s.bg }}>{s.label}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[11px] text-[var(--foreground-muted)]">
                    <span className={cn('inline-flex items-center gap-1.5 font-semibold', pr.color)}><span className={cn('h-1.5 w-1.5 rounded-full', pr.dot)} />{pr.label}</span>
                    <span className="font-semibold tabular-nums text-[var(--foreground)]">{formatBudgetFull(p.budget)}</span>
                    <span>{formatDate(p.updatedAt || p.createdAt)}</span>
                  </div>
                </button>
              );
            })}
            {projects.length === 0 && (
              <div className="px-6 py-14 text-center text-[var(--foreground-muted)]">
                <FolderKanban className="mx-auto h-9 w-9 text-[var(--foreground-subtle)]" />
                <p className="mt-3 text-[13px] font-semibold text-[var(--foreground)]">ไม่พบโครงการตามเงื่อนไขที่ค้นหา</p>
              </div>
            )}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--surface-muted)] text-gray-500 text-[11px] uppercase tracking-wider border-b border-[var(--border)]">
                  <th 
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-[var(--foreground)]"
                    onClick={() => {
                      setSortBy('projectNo');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>เลขที่โครงการ</span>
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-[var(--foreground)]"
                    onClick={() => {
                      setSortBy('projectName');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>ชื่อโครงการ</span>
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold">หน่วยงาน</th>
                  <th className="py-3 px-4 font-semibold">ผู้รับผิดชอบ / ค้างที่ใคร</th>
                  <th 
                    className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-[var(--foreground)]"
                    onClick={() => {
                      setSortBy('budget');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>งบประมาณ</span>
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold text-center">ความเร่งด่วน</th>
                  <th className="py-3 px-4 font-semibold text-center">สถานะ</th>
                  <th className="py-3 px-4 font-semibold text-right">วันที่ยื่น/แก้ไข</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[13px]">
                {projects.map((p: any) => {
                  const s = STATUS_CONFIG[p.status] || STATUS_CONFIG.DRAFT;
                  const pr = PRIORITY_CONFIG[p.priority] || PRIORITY_CONFIG.MEDIUM;
                  const assigned = p.assignedOfficer;
                  const owner = p.ownerContact;

                  return (
                    <tr 
                      key={p.id} 
                      onClick={() => router.push(`/projects/${p.id}`)}
                      className="hover:bg-[var(--surface-muted)] cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 text-[var(--foreground)] whitespace-nowrap">
                        <span className="case-id">
                          {p.projectNo || p.id}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">
                          {p.projectName}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-gray-500 whitespace-nowrap">
                        {p.organizationName || '-'}
                      </td>
                      <td className="py-3 px-4 text-[11px] whitespace-nowrap">
                        {assigned ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-[var(--foreground)] flex items-center gap-1">
                              <span className={cn("w-1.5 h-1.5 rounded-full", assigned.isOverdue ? "bg-red-500 animate-ping" : "bg-amber-500")} />
                              {assigned.fullName}
                            </span>
                            <span className={cn("text-[10px]", assigned.isOverdue ? "text-red-600 font-bold" : "text-[var(--foreground-subtle)]")}>
                              {assigned.isOverdue ? `เกิน SLA ${assigned.overdueDays} วัน (ค้าง ${assigned.daysPending} วัน)` : `ค้าง ${assigned.daysPending} วัน`}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-[var(--foreground-muted)]">{owner?.fullName || p.ownerName || '-'}</span>
                            <span className="text-[10px] text-[var(--foreground-subtle)]">{owner?.position ? owner.position.split('/')[0] : 'เจ้าของโครงการ'}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-[var(--foreground)] tabular-nums whitespace-nowrap">
                        {formatBudgetFull(p.budget)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-semibold", pr.color)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", pr.dot, p.priority === 'HIGH' && 'animate-ping')} />
                          {pr.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="status-chip" style={{ color: s.color, backgroundColor: s.bg }}>{s.label}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-[11px] text-gray-500 whitespace-nowrap">
                        {formatDate(p.updatedAt || p.createdAt)}
                      </td>
                    </tr>
                  )
                })}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-full bg-[var(--surface-muted)] flex items-center justify-center text-[var(--foreground-muted)]">
                          <FolderKanban className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-[14px] text-[var(--foreground)]">ไม่พบโครงการตามเงื่อนไขที่ค้นหา</p>
                          <p className="text-[12px] text-[var(--foreground-muted)] mt-1">
                            ลองปรับคำค้นหา หรือกดล้างตัวกรองเพื่อแสดงโครงการทั้งหมด
                          </p>
                        </div>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            className="mt-1 px-4 py-1.5 text-xs font-semibold text-[var(--accent-foreground)] bg-[var(--accent-muted)] rounded-[var(--radius-md)] hover:bg-[var(--accent)] hover:text-white transition-all cursor-pointer"
                          >
                            ล้างตัวกรองทั้งหมด
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </>
        )}

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]">
            <div className="text-[11px] text-gray-500">
              หน้า {pagination.page} จาก {pagination.totalPages}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchProjects(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 text-gray-500 hover:text-[var(--foreground)] border border-[var(--border)] bg-[var(--surface)] rounded-[var(--radius-md)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pNum = i + 1;
                return (
                  <button
                    key={pNum}
                    onClick={() => fetchProjects(pNum)}
                    className={cn(
                      "w-7 h-7 rounded-[var(--radius-md)] text-[11px] font-semibold transition-colors",
                      pagination.page === pNum
                        ? 'bg-[var(--accent)] text-white shadow-sm'
                        : 'bg-[var(--surface)] border border-[var(--border)] text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {pNum}
                  </button>
                );
              })}
              <button
                onClick={() => fetchProjects(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 text-gray-500 hover:text-[var(--foreground)] border border-[var(--border)] bg-[var(--surface)] rounded-[var(--radius-md)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
