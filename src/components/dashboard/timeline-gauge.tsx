'use client'

import { Timer, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TimelineGaugeProps {
  onTrack: number;
  atRisk: number;
  overdue: number;
  adherencePercent: number;
  onSelectTimelineStatus?: (status: 'ALL' | 'ON_TRACK' | 'AT_RISK' | 'OVERDUE') => void;
}

export function TimelineGauge({
  onTrack,
  atRisk,
  overdue,
  adherencePercent,
  onSelectTimelineStatus,
}: TimelineGaugeProps) {
  const total = onTrack + atRisk + overdue;
  const onTrackWidth = total > 0 ? (onTrack / total) * 100 : 0;
  const atRiskWidth = total > 0 ? (atRisk / total) * 100 : 0;
  const overdueWidth = total > 0 ? (overdue / total) * 100 : 0;

  const getAdherenceColor = (percent: number) => {
    if (percent > 80) return 'text-[var(--success)]';
    if (percent >= 60) return 'text-[var(--warning)]';
    return 'text-[var(--danger)]';
  };

  return (
    <div className="workspace-panel flex flex-col p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-[var(--foreground-muted)]" />
          <h3 className="text-[15px] font-semibold text-[var(--foreground)]">
            การดำเนินการตามแผน (Timeline Adherence)
          </h3>
        </div>
        {onSelectTimelineStatus && (
          <button
            type="button"
            onClick={() => onSelectTimelineStatus('ALL')}
            className="text-[12px] font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] hover:underline cursor-pointer"
          >
            ติดตามแผนงาน →
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div 
          onClick={() => onSelectTimelineStatus?.('ALL')}
          className={cn(
            "text-center mb-6 transition-transform",
            onSelectTimelineStatus && "cursor-pointer hover:scale-102"
          )}
          title="คลิกเพื่อดูการติดตามกรอบเวลาทั้งหมด"
        >
          <div className={cn("text-3xl font-bold tabular-nums", getAdherenceColor(adherencePercent))}>
            {adherencePercent}%
          </div>
          <div className="text-[13px] text-[var(--foreground-subtle)] mt-1 flex items-center justify-center gap-1 font-medium">
            <span>ตรงตามแผนงาน</span>
            {onSelectTimelineStatus && <span className="text-[11px] text-[var(--accent)]">เจาะลึก ↗</span>}
          </div>
        </div>

        <div 
          onClick={() => onSelectTimelineStatus?.('ALL')}
          className={cn(
            "w-full flex h-3 rounded-full overflow-hidden mb-4 bg-[var(--surface-inset)] transition-opacity",
            onSelectTimelineStatus && "cursor-pointer hover:opacity-90"
          )}
        >
          <div className="bg-[var(--success)] h-full transition-all" style={{ width: `${onTrackWidth}%` }} title={`ตรงเวลา: ${onTrack}`} />
          <div className="bg-[var(--warning)] h-full transition-all" style={{ width: `${atRiskWidth}%` }} title={`เสี่ยงล่าช้า: ${atRisk}`} />
          <div className="bg-[var(--danger)] h-full transition-all" style={{ width: `${overdueWidth}%` }} title={`เกินกำหนด: ${overdue}`} />
        </div>

        <div className="flex justify-between items-center text-[11px] tabular-nums text-[var(--foreground-muted)]">
          <div 
            onClick={() => onSelectTimelineStatus?.('ON_TRACK')}
            className={cn(
              "flex items-center gap-1.5 p-1 rounded-md transition-colors",
              onSelectTimelineStatus && "cursor-pointer hover:bg-emerald-50 text-emerald-800 font-medium"
            )}
            title="คลิกเพื่อดูโครงการที่ตรงเวลา"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
            <span>ตรงเวลา: {onTrack}</span>
          </div>

          <div 
            onClick={() => onSelectTimelineStatus?.('AT_RISK')}
            className={cn(
              "flex items-center gap-1.5 p-1 rounded-md transition-colors",
              onSelectTimelineStatus && "cursor-pointer hover:bg-amber-50 text-amber-900 font-medium"
            )}
            title="คลิกเพื่อดูโครงการที่เสี่ยงล่าช้า (<30 วัน)"
          >
            <AlertCircle className="w-3.5 h-3.5 text-[var(--warning)]" />
            <span>เสี่ยงล่าช้า: {atRisk}</span>
          </div>

          <div 
            onClick={() => onSelectTimelineStatus?.('OVERDUE')}
            className={cn(
              "flex items-center gap-1.5 p-1 rounded-md transition-colors",
              onSelectTimelineStatus && "cursor-pointer hover:bg-red-50 text-red-700 font-bold"
            )}
            title="คลิกเพื่อดูโครงการที่เกินกำหนดส่งมอบ"
          >
            <XCircle className="w-3.5 h-3.5 text-[var(--danger)]" />
            <span>เกินกำหนด: {overdue}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
