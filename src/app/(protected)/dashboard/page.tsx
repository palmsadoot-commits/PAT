'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ExecutiveKPIStrip } from '@/components/dashboard/executive-kpi-strip';
import { ApprovalPipeline } from '@/components/dashboard/approval-pipeline';
import { BudgetSunburst } from '@/components/dashboard/budget-sunburst';
import { DPMPhaseTracker } from '@/components/dashboard/dpm-phase-tracker';
import { RiskHeatmap } from '@/components/dashboard/risk-heatmap';
import { TimelineGauge } from '@/components/dashboard/timeline-gauge';
import { TopProjectsTable } from '@/components/dashboard/top-projects-table';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { ActionRequired } from '@/components/dashboard/action-required';
import { RiskDrillDownModal } from '@/components/dashboard/drilldown/risk-drilldown-modal';
import { DPMDrillDownModal } from '@/components/dashboard/drilldown/dpm-drilldown-modal';
import { BudgetDrillDownModal } from '@/components/dashboard/drilldown/budget-drilldown-modal';
import { TimelineDrillDownModal } from '@/components/dashboard/drilldown/timeline-drilldown-modal';
import { formatBudgetFull } from '@/lib/utils/format';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Drill-down modal states
  const [riskModalOpen, setRiskModalOpen] = useState(false);
  const [riskInitialSeverity, setRiskInitialSeverity] = useState<string>('ALL');
  const [riskInitialProjectId, setRiskInitialProjectId] = useState<string | undefined>(undefined);

  const [dpmModalOpen, setDpmModalOpen] = useState(false);
  const [dpmInitialTab, setDpmInitialTab] = useState<'PHASE' | 'DEFECTS' | 'CCB'>('PHASE');
  const [dpmInitialPhase, setDpmInitialPhase] = useState<'UPSTREAM' | 'MIDSTREAM' | 'DOWNSTREAM'>('UPSTREAM');

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [budgetInitialOrg, setBudgetInitialOrg] = useState<string | undefined>(undefined);

  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [timelineInitialFilter, setTimelineInitialFilter] = useState<'ALL' | 'ON_TRACK' | 'AT_RISK' | 'OVERDUE'>('ALL');

  const handleOpenRiskDrillDown = (severity = 'ALL', projectId?: string) => {
    setRiskInitialSeverity(severity);
    setRiskInitialProjectId(projectId);
    setRiskModalOpen(true);
  };

  const handleOpenDpmPhase = (phase: 'UPSTREAM' | 'MIDSTREAM' | 'DOWNSTREAM') => {
    setDpmInitialTab('PHASE');
    setDpmInitialPhase(phase);
    setDpmModalOpen(true);
  };

  const handleOpenDpmDefects = () => {
    setDpmInitialTab('DEFECTS');
    setDpmModalOpen(true);
  };

  const handleOpenDpmCCB = () => {
    setDpmInitialTab('CCB');
    setDpmModalOpen(true);
  };

  const handleOpenBudgetDrillDown = (orgName = 'ALL') => {
    setBudgetInitialOrg(orgName);
    setBudgetModalOpen(true);
  };

  const handleOpenTimelineDrillDown = (status: 'ALL' | 'ON_TRACK' | 'AT_RISK' | 'OVERDUE' = 'ALL') => {
    setTimelineInitialFilter(status);
    setTimelineModalOpen(true);
  };

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-5 w-48 bg-[var(--surface-muted)] rounded-[var(--radius-md)]" />
            <div className="h-7 w-64 bg-[var(--surface-muted)] rounded-[var(--radius-md)] mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-[var(--surface-muted)] rounded-[var(--radius-lg)]" />
          ))}
        </div>
        <div className="h-28 bg-[var(--surface-muted)] rounded-[var(--radius-lg)]" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-72 bg-[var(--surface-muted)] rounded-[var(--radius-lg)]" />
          <div className="h-72 bg-[var(--surface-muted)] rounded-[var(--radius-lg)]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="h-52 bg-[var(--surface-muted)] rounded-[var(--radius-lg)]" />
          <div className="h-52 bg-[var(--surface-muted)] rounded-[var(--radius-lg)]" />
          <div className="h-52 bg-[var(--surface-muted)] rounded-[var(--radius-lg)]" />
        </div>
      </div>
    );
  }

  const counts = data?.statusCounts || {};
  const orgChartData = data?.charts?.byOrg || [];
  const metrics = data?.metrics || {};
  const dpm = data?.dpm || {};
  const timeline = data?.timeline || {};

  // Activities directly from API
  const activities = data?.activities || [];

  // Projects that need attention
  const actionProjects = (data?.recentProjects || []).filter((p: any) =>
    ['SUBMITTED', 'DOCUMENT_CHECK', 'UNDER_REVIEW', 'PENDING_APPROVAL', 'RETURNED'].includes(p.status)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* ═══════════════════ Page Header ═══════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="workspace-eyebrow mb-1">PAT DIGITAL WORKSPACE · FY 2568–2569</p>
          <h1 className="text-display text-[var(--foreground)]">แดชบอร์ดผู้บริหาร</h1>
          <p className="mt-0.5 text-[13px] text-[var(--foreground-muted)]">
            ภาพรวมการบริหารโครงการดิจิทัลกระทรวงแรงงาน — สนับสนุนการตัดสินใจ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] font-semibold text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-muted)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{refreshing ? 'กำลังโหลด...' : 'รีเฟรช'}</span>
          </button>

          <Link
            href="/projects/new"
            className="flex h-9 items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--primary)] px-3.5 text-[13px] font-semibold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>สร้างโครงการใหม่</span>
          </Link>
        </div>
      </div>

      {/* ═══════════════════ ZONE A: Executive KPI Strip ═══════════════════ */}
      <ExecutiveKPIStrip
        totalProjects={data?.totalProjects || 0}
        totalBudget={data?.totalBudget || 0}
        approvalRate={metrics.approvalRate || 0}
        averageApprovalDays={metrics.averageApprovalDays || 0}
        highRiskCount={dpm.highRiskCount || 0}
        budgetUtilization={metrics.budgetUtilization || 0}
        pendingCCBCount={dpm.pendingCCBCount || 0}
        onDrillDownProjects={() => { window.location.href = '/projects'; }}
        onDrillDownApproval={() => handleOpenTimelineDrillDown('ON_TRACK')}
        onDrillDownSLA={() => handleOpenTimelineDrillDown('OVERDUE')}
        onDrillDownRisk={() => handleOpenRiskDrillDown('HIGH_EXTREME')}
        onDrillDownBudget={() => handleOpenBudgetDrillDown('ALL')}
        onDrillDownCCB={handleOpenDpmCCB}
      />

      {/* ═══════════════════ ZONE B: Approval Pipeline ═══════════════════ */}
      <ApprovalPipeline statusCounts={counts} />

      {/* ═══════════════════ ZONE C: Analysis Grid ═══════════════════ */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* C-Left: Budget Distribution */}
        <BudgetSunburst
          orgData={orgChartData}
          totalBudget={data?.totalBudget || 0}
          budgetUtilization={metrics.budgetUtilization || 0}
          committedBudget={metrics.committedBudget || 0}
          onSelectOrg={handleOpenBudgetDrillDown}
        />

        {/* C-Right: DPM Lifecycle */}
        <DPMPhaseTracker
          upstreamCount={dpm.upstreamCount || 0}
          midstreamCount={dpm.midstreamCount || 0}
          downstreamCount={dpm.downstreamCount || 0}
          uatPassRate={dpm.uatPassRate || 100}
          openDefectsCount={dpm.openDefectsCount || 0}
          totalDefects={dpm.totalDefects || 0}
          pendingCCBCount={dpm.pendingCCBCount || 0}
          onDrillDownPhase={handleOpenDpmPhase}
          onDrillDownDefects={handleOpenDpmDefects}
          onDrillDownCCB={handleOpenDpmCCB}
        />
      </div>

      {/* ═══════════════════ ZONE C2: Risk + Timeline ═══════════════════ */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <RiskHeatmap
          highRiskCount={dpm.highRiskCount || 0}
          topRisks={dpm.topRisks || []}
          onOpenDrillDown={handleOpenRiskDrillDown}
        />

        <TimelineGauge
          onTrack={timeline.onTrack || 0}
          atRisk={timeline.atRisk || 0}
          overdue={timeline.overdue || 0}
          adherencePercent={timeline.adherencePercent || 100}
          onSelectTimelineStatus={handleOpenTimelineDrillDown}
        />

        {/* Mini Budget Chart */}
        <section className="workspace-panel p-5" aria-labelledby="budget-by-org-title">
          <div className="flex items-center justify-between mb-3">
            <h2 id="budget-by-org-title" className="text-[15px] font-semibold text-[var(--foreground)]">
              งบฯ ตามหน่วยงาน
            </h2>
            <button
              type="button"
              onClick={() => handleOpenBudgetDrillDown('ALL')}
              className="text-[12px] font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <BarChart3 className="w-3 h-3" />
              <span>เจาะลึกทั้งหมด</span>
            </button>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orgChartData.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-muted)" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: 'var(--foreground-muted)' }}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: 'var(--foreground-muted)' }}
                  width={80}
                />
                <Tooltip
                  formatter={(value: any) => [formatBudgetFull(Number(value)), 'งบประมาณ']}
                  contentStyle={{
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: '11px',
                    boxShadow: 'var(--shadow-md)',
                  }}
                />
                <Bar 
                  dataKey="budget" 
                  fill="var(--accent)" 
                  radius={[0, 3, 3, 0]} 
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(entry: any) => {
                    if (entry?.name) handleOpenBudgetDrillDown(entry.name);
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* ═══════════════════ ZONE D: Bottom Row ═══════════════════ */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Top Projects + Action Required */}
        <div className="lg:col-span-3 space-y-5">
          <TopProjectsTable projects={data?.topProjects || []} />
          <ActionRequired projects={actionProjects} totalProjects={actionProjects.length} />
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed activities={activities} />
        </div>
      </div>

      {/* ═══════════════════ DRILL-DOWN MODALS ═══════════════════ */}
      <RiskDrillDownModal
        open={riskModalOpen}
        onClose={() => setRiskModalOpen(false)}
        risks={data?.allRisks || []}
        initialSeverity={riskInitialSeverity}
        initialProjectId={riskInitialProjectId}
      />

      <DPMDrillDownModal
        open={dpmModalOpen}
        onClose={() => setDpmModalOpen(false)}
        projects={data?.projectsList || []}
        defects={data?.allDefects || []}
        changeRequests={data?.allChangeRequests || []}
        initialTab={dpmInitialTab}
        initialPhase={dpmInitialPhase}
      />

      <BudgetDrillDownModal
        open={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        orgData={orgChartData}
        projects={data?.projectsList || []}
        totalBudget={data?.totalBudget || 0}
        initialOrgName={budgetInitialOrg}
      />

      <TimelineDrillDownModal
        open={timelineModalOpen}
        onClose={() => setTimelineModalOpen(false)}
        projects={data?.projectsList || []}
        initialFilter={timelineInitialFilter}
      />
    </div>
  );
}
