'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Waves, 
  Settings2, 
  Target, 
  GitPullRequest, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Layers,
  ArrowRight
} from 'lucide-react';
import { formatBudgetFull } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/projects/status-badge';

export default function GovernancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'ccb' | 'risks'>('portfolio');

  useEffect(() => {
    const fetchGov = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/dpm/governance');
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGov();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin mx-auto" />
        <p className="text-xs text-[var(--foreground-muted)]">กำลังโหลดข้อมูลศูนย์กำกับดูแล DPM...</p>
      </div>
    );
  }

  const summary = data?.summary || {};
  const projects = data?.recentProjectsDpm || [];
  const ccbRequests = data?.pendingChangeRequests || [];
  const risks = data?.topRisks || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="text-page-title text-[var(--foreground)] tracking-tight">
                ศูนย์กำกับดูแลโครงการดิจิทัลภาครัฐ (DPM Governance Console)
              </h1>
            </div>
            <p className="text-[13px] text-[var(--foreground-muted)]">
              ติดตามและบริหารโครงการดิจิทัลภาครัฐแบบครบวงจร ตั้งแต่ต้นน้ำ ถึง ปลายน้ำ ตามกรอบมาตรฐาน PMBOK & IT Governance
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>เกณฑ์มาตรฐาน DGA & PMBOK</span>
            </span>
          </div>
        </div>

        {/* Top 4 Phase Stat Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[var(--border-muted)]">
          <div className="p-4 rounded-[var(--radius-lg)] border border-blue-200/80 bg-blue-50/40 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-800 text-xs font-bold">
              <Waves className="w-4 h-4" />
              <span>ช่วงต้นน้ำ (Upstream)</span>
            </div>
            <div className="text-2xl font-bold text-blue-900 tabular-nums">
              {summary.upstreamCount || 0} <span className="text-xs font-normal text-blue-700">โครงการ</span>
            </div>
            <span className="text-[10px] text-blue-700 block">กฎบัตรโครงการ & วิเคราะห์ RACI</span>
          </div>

          <div className="p-4 rounded-[var(--radius-lg)] border border-purple-200/80 bg-purple-50/40 space-y-1">
            <div className="flex items-center gap-1.5 text-purple-800 text-xs font-bold">
              <Settings2 className="w-4 h-4" />
              <span>ช่วงกลางน้ำ (Midstream)</span>
            </div>
            <div className="text-2xl font-bold text-purple-900 tabular-nums">
              {summary.midstreamCount || 0} <span className="text-xs font-normal text-purple-700">โครงการ</span>
            </div>
            <span className="text-[10px] text-purple-700 block">จัดซื้อจัดจ้าง, RTM & ควบคุม CCB</span>
          </div>

          <div className="p-4 rounded-[var(--radius-lg)] border border-emerald-200/80 bg-emerald-50/40 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
              <Target className="w-4 h-4" />
              <span>ช่วงปลายน้ำ (Downstream)</span>
            </div>
            <div className="text-2xl font-bold text-emerald-900 tabular-nums">
              {summary.downstreamCount || 0} <span className="text-xs font-normal text-emerald-700">โครงการ</span>
            </div>
            <span className="text-[10px] text-emerald-700 block">แผนตรวจรับ (ATP), UAT & ปิดโครงการ</span>
          </div>

          <div className="p-4 rounded-[var(--radius-lg)] border border-amber-200/80 bg-amber-50/40 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>อัตราผ่าน UAT เฉลี่ย</span>
            </div>
            <div className="text-2xl font-bold text-amber-900 tabular-nums">
              {summary.uatPassRate || 97.5}%
            </div>
            <span className="text-[10px] text-amber-700 block">
              {summary.openDefectsCount || 0} ข้อบกพร่องรอแก้ไข
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-[var(--radius-md)] transition-colors cursor-pointer',
            activeTab === 'portfolio'
              ? 'bg-[var(--accent)] text-white shadow-xs'
              : 'text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]'
          )}
        >
          <Layers className="w-4 h-4" />
          <span>แฟ้มโครงการตามวงจรชีวิต DPM ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ccb')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-[var(--radius-md)] transition-colors cursor-pointer',
            activeTab === 'ccb'
              ? 'bg-[var(--accent)] text-white shadow-xs'
              : 'text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]'
          )}
        >
          <GitPullRequest className="w-4 h-4" />
          <span>วาระเปลี่ยนแปลงเข้า CCB ({summary.pendingCCBCount || ccbRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('risks')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-[var(--radius-md)] transition-colors cursor-pointer',
            activeTab === 'risks'
              ? 'bg-[var(--accent)] text-white shadow-xs'
              : 'text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]'
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>ความเสี่ยงระดับสูงที่ต้องเฝ้าระวัง ({summary.highRiskCount || risks.length})</span>
        </button>
      </div>

      {/* Tab 1: All Projects Portfolio */}
      {activeTab === 'portfolio' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[var(--surface-muted)] text-[var(--foreground-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                  <th className="py-3.5 px-4 font-semibold">รหัสโครงการ</th>
                  <th className="py-3.5 px-4 font-semibold">ชื่อโครงการ</th>
                  <th className="py-3.5 px-4 font-semibold text-right">งบประมาณ</th>
                  <th className="py-3.5 px-4 font-semibold text-center">สถานะขออนุมัติ</th>
                  <th className="py-3.5 px-4 font-semibold text-center">ช่วงวงจรชีวิต DPM</th>
                  <th className="py-3.5 px-4 font-semibold">ความก้าวหน้ารายช่วง</th>
                  <th className="py-3.5 px-4 font-semibold text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-muted)]">
                {projects.map((p: any) => {
                  const phaseLabel = p.dpmPhase === 'UPSTREAM'
                    ? { name: 'ต้นน้ำ', color: 'bg-blue-50 text-blue-700 border-blue-200' }
                    : p.dpmPhase === 'MIDSTREAM'
                    ? { name: 'กลางน้ำ', color: 'bg-purple-50 text-purple-700 border-purple-200' }
                    : { name: 'ปลายน้ำ', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

                  return (
                    <tr key={p.id} className="hover:bg-[var(--surface-muted)]/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        {p.projectNo}
                      </td>
                      <td className="py-3 px-4 font-bold text-[var(--foreground)] max-w-xs truncate">
                        {p.projectName}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[var(--foreground)] tabular-nums">
                        {formatBudgetFull(p.budget)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={p.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold border', phaseLabel.color)}>
                          {phaseLabel.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 min-w-[140px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-[var(--foreground-muted)]">
                            <span>ต้นน้ำ {p.phaseProgress.upstream}%</span>
                            <span>กลางน้ำ {p.phaseProgress.midstream}%</span>
                            <span>ปลายน้ำ {p.phaseProgress.downstream}%</span>
                          </div>
                          <div className="flex h-1.5 rounded-full overflow-hidden bg-stone-100 gap-0.5">
                            <div className="bg-blue-500 rounded-l-full" style={{ width: `${p.phaseProgress.upstream / 3}%` }} />
                            <div className="bg-purple-500" style={{ width: `${p.phaseProgress.midstream / 3}%` }} />
                            <div className="bg-emerald-500 rounded-r-full" style={{ width: `${p.phaseProgress.downstream / 3}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          href={`/projects/${p.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent)] hover:underline"
                        >
                          <span>เปิดแฟ้ม DPM</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Pending CCB Requests */}
      {activeTab === 'ccb' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-muted)]">
            <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
              คำขอเปลี่ยนแปลงความต้องการที่รอการพิจารณาจากคณะกรรมการ CCB
            </h3>
            <span className="text-[11px] text-[var(--foreground-muted)]">
              เกณฑ์การพิจารณา: Critical & High เข้าประชุมพิจารณา / Medium & Low เข้า Backlog
            </span>
          </div>

          <div className="space-y-3">
            {ccbRequests.map((cr: any) => (
              <div key={cr.id} className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)]/20 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[var(--surface)] border">
                      {cr.crNumber}
                    </span>
                    <h4 className="text-xs font-bold text-[var(--foreground)]">{cr.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                      {cr.priority}
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--foreground-muted)] font-medium">
                    โครงการ: {cr.projectName}
                  </span>
                </div>

                <p className="text-[11px] text-[var(--foreground-muted)]">
                  {cr.reason}
                </p>

                <div className="grid grid-cols-3 gap-2 bg-[var(--surface)] p-2.5 rounded text-xs border border-[var(--border-muted)]">
                  <div>
                    <span className="text-[10px] text-[var(--foreground-subtle)] block">ผลกระทบเวลา</span>
                    <span className="font-bold text-[var(--foreground)]">+{cr.impactAnalysis?.scheduleImpactDays || 0} วัน</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--foreground-subtle)] block">ผลกระทบงบประมาณ</span>
                    <span className="font-bold text-emerald-700">
                      {cr.impactAnalysis?.costImpactBaht ? `+${cr.impactAnalysis.costImpactBaht.toLocaleString()} บ.` : 'ไม่มีค่าใช้จ่ายเพิ่ม'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--foreground-subtle)] block">RTM ที่เกี่ยวข้อง</span>
                    <span className="font-mono text-[11px] text-blue-700">{cr.impactAnalysis?.rtmAffectedIds?.join(', ') || '-'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Top Risks */}
      {activeTab === 'risks' && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-muted)]">
            <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
              ทะเบียนความเสี่ยงระดับสูงระดับพอร์ตโฟลิโอ (Enterprise High Risks)
            </h3>
            <span className="text-[11px] text-[var(--foreground-muted)]">
              เกณฑ์: Likelihood x Impact $\ge$ 10 หรือระดับ High/Extreme
            </span>
          </div>

          <div className="space-y-3">
            {risks.map((r: any) => (
              <div key={r.id} className="p-4 rounded-[var(--radius-lg)] border border-red-200/80 bg-red-50/20 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-white text-red-700 border border-red-200">
                      {r.riskCode}
                    </span>
                    <h4 className="text-xs font-bold text-[var(--foreground)]">{r.riskTitle}</h4>
                  </div>
                  <span className="font-mono text-xs font-bold text-red-700">
                    L({r.likelihood}) x I({r.impact}) = Score: {r.riskScore}
                  </span>
                </div>

                <div className="text-xs text-[var(--foreground)] space-y-1">
                  <p><strong>มาตรการลดความเสี่ยง: </strong> {r.mitigationPlan}</p>
                  <p className="text-[var(--foreground-muted)]"><strong>แผนรองรับเหตุฉุกเฉิน: </strong> {r.contingencyPlan}</p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[var(--foreground-subtle)] pt-1 border-t border-red-200/60">
                  <span>ผู้รับผิดชอบ: {r.riskOwner}</span>
                  <span>โครงการ: {r.projectName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
