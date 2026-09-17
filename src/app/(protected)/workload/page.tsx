'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users2, 
  RefreshCw, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  ArrowRightLeft,
  SlidersHorizontal,
  Building2
} from 'lucide-react';
import { MetricRow } from '@/components/dashboard/metric-row';
import { WorkloadMatrix, WorkloadItem } from '@/components/workload/workload-matrix';
import { ReassignDialog } from '@/components/workload/reassign-dialog';
import { cn } from '@/lib/utils';
import { formatBudgetFull } from '@/lib/utils/format';

export default function WorkloadPage() {
  const [data, setData] = useState<{
    summary: {
      totalPersonnel: number;
      overloadedCount: number;
      nearCapacityCount: number;
      healthyCount: number;
      avgUtilization: number;
      totalActiveBudget: number;
    };
    months: Array<{ key: string; label: string; full: string }>;
    workloads: WorkloadItem[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Reassign Modal State
  const [reassignProject, setReassignProject] = useState<{
    id: string;
    projectNo: string;
    projectName: string;
    budget: number;
    currentOwnerName: string;
    currentOwnerId: string;
  } | null>(null);
  const [isReassignOpen, setIsReassignOpen] = useState(false);

  const fetchWorkload = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/workload');
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to load workload data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkload();
  }, []);

  const handleOpenReassign = (project: {
    id: string;
    projectNo: string;
    projectName: string;
    budget: number;
    currentOwnerName: string;
    currentOwnerId: string;
  }) => {
    setReassignProject(project);
    setIsReassignOpen(true);
  };

  // Filter workload list
  const filteredWorkloads = (data?.workloads || []).filter((w) => {
    const matchesSearch =
      search.trim() === '' ||
      w.fullName.toLowerCase().includes(search.toLowerCase()) ||
      w.username.toLowerCase().includes(search.toLowerCase()) ||
      w.organizationName.toLowerCase().includes(search.toLowerCase()) ||
      w.projects.some((p) =>
        p.projectName.toLowerCase().includes(search.toLowerCase()) ||
        p.projectNo.toLowerCase().includes(search.toLowerCase())
      );

    const matchesRole = roleFilter === '' || w.role === roleFilter;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'OVERLOADED' && w.workloadStatus === 'OVERLOADED') ||
      (statusFilter === 'NEAR_CAPACITY' && w.workloadStatus === 'NEAR_CAPACITY') ||
      (statusFilter === 'HEALTHY' && w.workloadStatus === 'HEALTHY');

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse pb-16">
        <div className="h-8 w-60 bg-[var(--surface-muted)] rounded-[var(--radius-md)]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[var(--surface-muted)] rounded-[var(--radius-lg)]" />
          ))}
        </div>
        <div className="h-96 bg-[var(--surface-muted)] rounded-[var(--radius-xl)]" />
      </div>
    );
  }

  const summary = data?.summary || {
    totalPersonnel: 0,
    overloadedCount: 0,
    nearCapacityCount: 0,
    healthyCount: 0,
    avgUtilization: 0,
    totalActiveBudget: 0,
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-card)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent-muted)] text-[var(--accent)] flex items-center justify-center font-bold">
              <Users2 className="w-4 h-4" />
            </div>
            <h1 className="text-page-title text-[var(--foreground)] tracking-tight">
              ติดตามภาระงานและการจัดสรรทรัพยากร (Workload & Resources)
            </h1>
          </div>
          <p className="text-[13px] text-[var(--foreground-muted)] mt-1.5">
            เครื่องมือบริหารความจุบุคลากรในสไตล์ ClickUp™ เพื่อกระจายโครงการและป้องกันความล่าช้าในกระบวนการพิจารณา
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchWorkload}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[var(--foreground-muted)] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] hover:bg-[var(--surface-muted)] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
            <span>{refreshing ? 'กำลังรีเฟรช...' : 'รีเฟรชข้อมูล'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Row */}
      <MetricRow
        metrics={[
          {
            label: 'บุคลากรทั้งหมด',
            value: summary.totalPersonnel,
            suffix: 'ท่าน',
            detail: `งบประมาณที่รับผิดชอบ ${formatBudgetFull(summary.totalActiveBudget)}`,
          },
          {
            label: 'ภาระงานเกินเกณฑ์ (>100%)',
            value: summary.overloadedCount,
            suffix: 'ท่าน',
            color: 'text-red-600',
            detail: 'ต้องการการเกลี่ยงานเพื่อป้องกันคอขวด',
          },
          {
            label: 'ความจุพร้อมรับงาน (≤75%)',
            value: summary.healthyCount,
            suffix: 'ท่าน',
            color: 'text-emerald-600',
            detail: 'มีขีดความสามารถพร้อมรับมอบหมายโครงการเพิ่ม',
          },
          {
            label: 'อัตราการใช้กำลังพลเฉลี่ย',
            value: `${summary.avgUtilization}%`,
            color: summary.avgUtilization > 85 ? 'text-amber-600' : 'text-[var(--foreground)]',
            detail: 'เกณฑ์ความจุตามบทบาทหน้าที่ (2-4 โครงการต่อท่าน)',
          },
        ]}
      />

      {/* Filter and View Controls Toolbar */}
      <div className="bg-[var(--surface)] p-4 rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[var(--foreground-subtle)] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="ค้นหาชื่อบุคลากร หรือชื่อโครงการ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)]"
          />
        </div>

        {/* Filter Pills & Selects */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter Tabs */}
          <div className="flex items-center bg-[var(--surface-muted)] p-1 rounded-[var(--radius-md)] border border-[var(--border)] text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={cn(
                'px-2.5 py-1 rounded-[var(--radius-sm)] font-medium transition-colors cursor-pointer',
                statusFilter === 'ALL'
                  ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-xs font-semibold'
                  : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
              )}
            >
              ทั้งหมด ({data?.workloads.length || 0})
            </button>
            <button
              onClick={() => setStatusFilter('OVERLOADED')}
              className={cn(
                'px-2.5 py-1 rounded-[var(--radius-sm)] font-medium transition-colors cursor-pointer flex items-center gap-1',
                statusFilter === 'OVERLOADED'
                  ? 'bg-red-50 text-red-700 font-semibold shadow-xs'
                  : 'text-red-600 hover:text-red-700'
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>เกินเกณฑ์ ({summary.overloadedCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('NEAR_CAPACITY')}
              className={cn(
                'px-2.5 py-1 rounded-[var(--radius-sm)] font-medium transition-colors cursor-pointer flex items-center gap-1',
                statusFilter === 'NEAR_CAPACITY'
                  ? 'bg-amber-50 text-amber-700 font-semibold shadow-xs'
                  : 'text-amber-600 hover:text-amber-700'
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>ใกล้เต็ม ({summary.nearCapacityCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('HEALTHY')}
              className={cn(
                'px-2.5 py-1 rounded-[var(--radius-sm)] font-medium transition-colors cursor-pointer flex items-center gap-1',
                statusFilter === 'HEALTHY'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs'
                  : 'text-emerald-600 hover:text-emerald-700'
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>พร้อมรับงาน ({summary.healthyCount})</span>
            </button>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)] cursor-pointer"
          >
            <option value="">ทุกบทบาทหน้าที่</option>
            <option value="PROJECT_OWNER">เจ้าของโครงการ (Project Owner)</option>
            <option value="OFFICER">เจ้าหน้าที่ตรวจเอกสาร (Officer)</option>
            <option value="REVIEWER">ผู้ตรวจสอบ/กรรมการ (Reviewer)</option>
            <option value="APPROVER">ผู้อนุมัติ (Approver)</option>
            <option value="ADMIN">ผู้ดูแลระบบ (Admin)</option>
            <option value="SUPER_ADMIN">ผู้บริหารเทคโนโลยี (Super Admin)</option>
            <option value="EXECUTIVE">ผู้บริหารระดับสูง (Executive)</option>
            <option value="VIEWER">ผู้ตรวจราชการ (Viewer)</option>
          </select>
        </div>
      </div>

      {/* Workload Matrix */}
      <WorkloadMatrix
        workloads={filteredWorkloads}
        months={data?.months || []}
        onReassignClick={handleOpenReassign}
      />

      {/* Reassign Project Dialog */}
      <ReassignDialog
        isOpen={isReassignOpen}
        onClose={() => setIsReassignOpen(false)}
        project={reassignProject}
        candidates={data?.workloads || []}
        onSuccess={fetchWorkload}
      />
    </div>
  );
}
