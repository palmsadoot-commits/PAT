'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Layers, Settings, Flag, CheckCircle2, Bug, GitPullRequestDraft } from 'lucide-react';

export interface DPMPhaseTrackerProps {
  upstreamCount: number;
  midstreamCount: number;
  downstreamCount: number;
  uatPassRate: number;      // e.g. 97.5
  openDefectsCount: number;
  totalDefects: number;
  pendingCCBCount: number;
  onDrillDownPhase?: (phase: 'UPSTREAM' | 'MIDSTREAM' | 'DOWNSTREAM') => void;
  onDrillDownDefects?: () => void;
  onDrillDownCCB?: () => void;
}

export function DPMPhaseTracker({
  upstreamCount,
  midstreamCount,
  downstreamCount,
  uatPassRate,
  openDefectsCount,
  totalDefects,
  pendingCCBCount,
  onDrillDownPhase,
  onDrillDownDefects,
  onDrillDownCCB,
}: DPMPhaseTrackerProps) {
  const total = upstreamCount + midstreamCount + downstreamCount;
  
  const getUatColor = (rate: number) => {
    if (rate > 95) return 'text-[var(--success)]';
    if (rate > 85) return 'text-[var(--warning)]';
    return 'text-[var(--danger)]';
  };

  const defectColor = openDefectsCount > 5 ? 'text-[var(--danger)]' : 'text-[var(--foreground-muted)]';
  const ccbColor = pendingCCBCount > 0 ? 'text-[var(--warning)]' : 'text-[var(--foreground-muted)]';

  return (
    <div className="workspace-panel p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-[var(--foreground)]">วงจรชีวิตโครงการ DPM (Project Lifecycle)</h3>
        {onDrillDownPhase && (
          <button
            type="button"
            onClick={() => onDrillDownPhase('UPSTREAM')}
            className="text-[12px] font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] hover:underline cursor-pointer"
          >
            เจาะลึกวงจร DPM →
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div 
          onClick={() => onDrillDownPhase?.('UPSTREAM')}
          className={cn(
            "flex flex-col gap-2 p-2.5 rounded-[var(--radius-md)] bg-[var(--surface-muted)] relative overflow-hidden transition-all group",
            onDrillDownPhase && "cursor-pointer hover:bg-indigo-50/60 hover:shadow-xs border border-transparent hover:border-indigo-200"
          )}
          title="คลิกเพื่อเจาะลึกโครงการระยะต้นน้ำ (Charter, TOR, ราคากลาง, e-Bidding)"
        >
          <div className="flex items-center justify-between text-[var(--foreground-muted)]">
            <div className="flex items-center gap-1.5">
              <Layers size={14} className="text-indigo-600" />
              <span className="text-[11px] font-medium">ต้นน้ำ (Upstream)</span>
            </div>
            {onDrillDownPhase && (
              <span className="opacity-0 group-hover:opacity-100 text-[10px] text-indigo-600 font-bold transition-opacity">
                ↗
              </span>
            )}
          </div>
          <div className="text-xl font-bold tabular-nums text-[var(--foreground)]">{upstreamCount}</div>
          <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 w-full" />
        </div>
        
        <div 
          onClick={() => onDrillDownPhase?.('MIDSTREAM')}
          className={cn(
            "flex flex-col gap-2 p-2.5 rounded-[var(--radius-md)] bg-[var(--surface-muted)] relative overflow-hidden transition-all group",
            onDrillDownPhase && "cursor-pointer hover:bg-violet-50/60 hover:shadow-xs border border-transparent hover:border-violet-200"
          )}
          title="คลิกเพื่อเจาะลึกโครงการระยะกลางน้ำ (สัญญาจ้าง, พัฒนาระบบ, RTM)"
        >
          <div className="flex items-center justify-between text-[var(--foreground-muted)]">
            <div className="flex items-center gap-1.5">
              <Settings size={14} className="text-violet-600" />
              <span className="text-[11px] font-medium">กลางน้ำ (Midstream)</span>
            </div>
            {onDrillDownPhase && (
              <span className="opacity-0 group-hover:opacity-100 text-[10px] text-violet-600 font-bold transition-opacity">
                ↗
              </span>
            )}
          </div>
          <div className="text-xl font-bold tabular-nums text-[var(--foreground)]">{midstreamCount}</div>
          <div className="absolute bottom-0 left-0 h-1 bg-violet-500 w-full" />
        </div>
        
        <div 
          onClick={() => onDrillDownPhase?.('DOWNSTREAM')}
          className={cn(
            "flex flex-col gap-2 p-2.5 rounded-[var(--radius-md)] bg-[var(--surface-muted)] relative overflow-hidden transition-all group",
            onDrillDownPhase && "cursor-pointer hover:bg-emerald-50/60 hover:shadow-xs border border-transparent hover:border-emerald-200"
          )}
          title="คลิกเพื่อเจาะลึกโครงการระยะปลายน้ำ (ATP, UAT, ตรวจรับพัสดุ)"
        >
          <div className="flex items-center justify-between text-[var(--foreground-muted)]">
            <div className="flex items-center gap-1.5">
              <Flag size={14} className="text-emerald-600" />
              <span className="text-[11px] font-medium">ปลายน้ำ (Downstream)</span>
            </div>
            {onDrillDownPhase && (
              <span className="opacity-0 group-hover:opacity-100 text-[10px] text-emerald-600 font-bold transition-opacity">
                ↗
              </span>
            )}
          </div>
          <div className="text-xl font-bold tabular-nums text-[var(--foreground)]">{downstreamCount}</div>
          <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 w-full" />
        </div>
      </div>

      {total > 0 && (
        <div className="flex h-2 w-full rounded-full overflow-hidden">
          <div className="bg-indigo-500 h-full" style={{ width: `${(upstreamCount / total) * 100}%` }} />
          <div className="bg-violet-500 h-full" style={{ width: `${(midstreamCount / total) * 100}%` }} />
          <div className="bg-emerald-500 h-full" style={{ width: `${(downstreamCount / total) * 100}%` }} />
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-muted)]">
        <div 
          onClick={() => onDrillDownPhase?.('DOWNSTREAM')}
          className={cn(
            "flex items-center gap-1.5 p-1 rounded-md transition-colors",
            onDrillDownPhase && "cursor-pointer hover:bg-[var(--surface-muted)]"
          )}
          title="คลิกเพื่อดูการทดสอบและการตรวจรับ"
        >
          <CheckCircle2 size={14} className={getUatColor(uatPassRate)} />
          <div className="flex flex-col">
            <span className="text-[11px] text-[var(--foreground-muted)]">UAT ผ่าน</span>
            <span className={cn("text-[13px] font-medium tabular-nums", getUatColor(uatPassRate))}>
              {uatPassRate.toFixed(1)}%
            </span>
          </div>
        </div>

        <div 
          onClick={onDrillDownDefects}
          className={cn(
            "flex items-center gap-1.5 p-1 rounded-md transition-colors",
            onDrillDownDefects && "cursor-pointer hover:bg-red-50/60"
          )}
          title="คลิกเพื่อเจาะลึกรายการ Defects ทั้งหมด"
        >
          <Bug size={14} className={defectColor} />
          <div className="flex flex-col">
            <span className="text-[11px] text-[var(--foreground-muted)]">Defects เปิด</span>
            <span className={cn("text-[13px] font-medium tabular-nums", defectColor)}>
              {openDefectsCount}/{totalDefects}
            </span>
          </div>
        </div>

        <div 
          onClick={onDrillDownCCB}
          className={cn(
            "flex items-center gap-1.5 p-1 rounded-md transition-colors",
            onDrillDownCCB && "cursor-pointer hover:bg-amber-50/60"
          )}
          title="คลิกเพื่อเจาะลึกคำขอเปลี่ยนแปลง CCB ทั้งหมด"
        >
          <GitPullRequestDraft size={14} className={ccbColor} />
          <div className="flex flex-col">
            <span className="text-[11px] text-[var(--foreground-muted)]">CCB รอ</span>
            <span className={cn("text-[13px] font-medium tabular-nums", ccbColor)}>
              {pendingCCBCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
