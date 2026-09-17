'use client';

import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Building2, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  PieChart, 
  TrendingUp,
  FolderKanban
} from 'lucide-react';
import { formatBudgetFull } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<'projects' | 'budget' | 'sla'>('projects');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports/${activeReport}`);
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

  useEffect(() => {
    fetchReport();
  }, [activeReport]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-card)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent-muted)] text-[var(--accent)] flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-page-title text-[var(--foreground)] tracking-tight">รายงานและสถิติ (Reports & Analytics)</h1>
          </div>
          <p className="text-[13px] text-[var(--foreground-muted)] mt-1.5">
            รายงานวิเคราะห์ข้อมูลโครงการ งบประมาณรายหน่วยงาน และการติดตามระยะเวลาตามเกณฑ์ SLA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/api/reports/export/${activeReport}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-[var(--radius-md)] shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ส่งออก CSV (Excel)</span>
          </a>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[var(--border)] pb-1">
        <button
          onClick={() => setActiveReport('projects')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-t-[var(--radius-md)] border-b-2 transition-all cursor-pointer',
            activeReport === 'projects'
              ? 'border-[var(--accent)] text-[var(--accent)] font-semibold bg-[var(--surface)]'
              : 'border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]'
          )}
        >
          <FolderKanban className="w-4 h-4" />
          <span>รายงานสรุปโครงการทั้งหมด</span>
        </button>

        <button
          onClick={() => setActiveReport('budget')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-t-[var(--radius-md)] border-b-2 transition-all cursor-pointer',
            activeReport === 'budget'
              ? 'border-[var(--accent)] text-[var(--accent)] font-semibold bg-[var(--surface)]'
              : 'border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]'
          )}
        >
          <Building2 className="w-4 h-4" />
          <span>รายงานงบประมาณรายหน่วยงาน</span>
        </button>

        <button
          onClick={() => setActiveReport('sla')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-t-[var(--radius-md)] border-b-2 transition-all cursor-pointer',
            activeReport === 'sla'
              ? 'border-[var(--accent)] text-[var(--accent)] font-semibold bg-[var(--surface)]'
              : 'border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]'
          )}
        >
          <Clock className="w-4 h-4" />
          <span>รายงานการติดตามเกณฑ์ SLA</span>
        </button>
      </div>

      {/* Report Data Card */}
      <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-card)] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-[var(--surface-muted)] rounded-[var(--radius-md)]" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeReport === 'projects' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[var(--surface-muted)] text-[var(--foreground-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                    <th className="py-3 px-4 font-semibold">เลขที่</th>
                    <th className="py-3 px-4 font-semibold">ชื่อโครงการ</th>
                    <th className="py-3 px-4 font-semibold">ปีงบฯ</th>
                    <th className="py-3 px-4 font-semibold">หน่วยงาน</th>
                    <th className="py-3 px-4 font-semibold text-right">งบประมาณ</th>
                    <th className="py-3 px-4 font-semibold text-center">ความเร่งด่วน</th>
                    <th className="py-3 px-4 font-semibold text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-muted)]">
                  {Array.isArray(data) && data.map((item: any) => (
                    <tr key={item.id} className="hover:bg-[var(--surface-muted)] transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-[var(--accent)]">{item.projectNo}</td>
                      <td className="py-3 px-4 font-semibold text-[var(--foreground)] max-w-xs truncate">{item.projectName}</td>
                      <td className="py-3 px-4 text-[var(--foreground-muted)]">{item.fiscalYear}</td>
                      <td className="py-3 px-4 text-[var(--foreground-muted)]">{item.organizationName}</td>
                      <td className="py-3 px-4 text-right font-bold text-[var(--foreground)] tabular-nums">
                        {formatBudgetFull(item.budget)}
                      </td>
                      <td className="py-3 px-4 text-center text-[var(--foreground-muted)]">{item.priorityName}</td>
                      <td className="py-3 px-4 text-center font-medium text-[var(--foreground)]">{item.statusName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeReport === 'budget' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[var(--surface-muted)] text-[var(--foreground-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                    <th className="py-3 px-4 font-semibold">รหัส</th>
                    <th className="py-3 px-4 font-semibold">ชื่อหน่วยงาน</th>
                    <th className="py-3 px-4 font-semibold text-center">จำนวนโครงการ</th>
                    <th className="py-3 px-4 font-semibold text-right">งบประมาณรวม</th>
                    <th className="py-3 px-4 font-semibold text-right text-emerald-600">อนุมัติแล้ว</th>
                    <th className="py-3 px-4 font-semibold text-right text-orange-600">รอพิจารณา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-muted)]">
                  {Array.isArray(data) && data.map((item: any) => (
                    <tr key={item.orgId} className="hover:bg-[var(--surface-muted)] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-[var(--foreground-muted)]">{item.orgCode}</td>
                      <td className="py-3.5 px-4 font-bold text-[var(--foreground)]">{item.orgName}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-[var(--accent)] tabular-nums">{item.projectCount}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-[var(--foreground)] tabular-nums">
                        {formatBudgetFull(item.totalBudget)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700 tabular-nums">
                        {formatBudgetFull(item.approvedBudget)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-orange-700 tabular-nums">
                        {formatBudgetFull(item.pendingBudget)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeReport === 'sla' && (
              <div>
                {/* Summary Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 border-b border-[var(--border)] bg-[var(--surface-muted)]/50">
                  <div className="bg-[var(--surface)] p-3 rounded-[var(--radius-md)] border border-[var(--border)] text-center">
                    <span className="text-[11px] text-[var(--foreground-muted)] block">โครงการในกระบวนการ</span>
                    <span className="text-xl font-bold text-[var(--foreground)] tabular-nums">{data?.summary?.totalTracked || 0}</span>
                  </div>
                  <div className="bg-[var(--surface)] p-3 rounded-[var(--radius-md)] border border-[var(--border)] text-center">
                    <span className="text-[11px] text-emerald-700 block">ตามเกณฑ์ (On Track)</span>
                    <span className="text-xl font-bold text-emerald-700 tabular-nums">{data?.summary?.onTrack || 0}</span>
                  </div>
                  <div className="bg-[var(--surface)] p-3 rounded-[var(--radius-md)] border border-[var(--border)] text-center">
                    <span className="text-[11px] text-amber-700 block">ใกล้ครบกำหนด (Due Soon)</span>
                    <span className="text-xl font-bold text-amber-700 tabular-nums">{data?.summary?.dueSoon || 0}</span>
                  </div>
                  <div className="bg-[var(--surface)] p-3 rounded-[var(--radius-md)] border border-[var(--border)] text-center">
                    <span className="text-[11px] text-red-700 block">เกินกำหนด (Overdue)</span>
                    <span className="text-xl font-bold text-red-700 tabular-nums">{data?.summary?.overdue || 0}</span>
                  </div>
                </div>

                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[var(--surface-muted)] text-[var(--foreground-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                      <th className="py-3 px-4 font-semibold">เลขที่</th>
                      <th className="py-3 px-4 font-semibold">ชื่อโครงการ</th>
                      <th className="py-3 px-4 font-semibold">ขั้นตอนปัจจุบัน</th>
                      <th className="py-3 px-4 font-semibold text-center">เวลาที่ใช้ไป / เกณฑ์ SLA</th>
                      <th className="py-3 px-4 font-semibold text-center">สถานะ SLA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-muted)]">
                    {data?.items?.map((item: any) => (
                      <tr key={item.projectId} className="hover:bg-[var(--surface-muted)] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-[var(--accent)]">{item.projectNo}</td>
                        <td className="py-3.5 px-4 font-semibold text-[var(--foreground)]">{item.projectName}</td>
                        <td className="py-3.5 px-4 text-[var(--foreground-muted)]">{item.currentStatus}</td>
                        <td className="py-3.5 px-4 text-center tabular-nums font-medium text-[var(--foreground)]">
                          {item.usedDays} / {item.maxDays} วันทำการ
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={cn(
                              'px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
                              item.slaStatus === 'OVERDUE'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : item.slaStatus === 'DUE_SOON'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            )}
                          >
                            {item.slaStatus === 'OVERDUE'
                              ? 'เกินกำหนด SLA'
                              : item.slaStatus === 'DUE_SOON'
                              ? 'ใกล้ครบกำหนด'
                              : 'ตามกำหนด'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
