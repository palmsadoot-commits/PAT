'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, ExternalLink } from 'lucide-react';

export interface RiskHeatmapItem {
  projectId?: string;
  projectName: string;
  projectNo?: string;
  description: string;
  severityLevel: string;
  status: string;
}

export interface RiskHeatmapProps {
  highRiskCount: number;
  topRisks: RiskHeatmapItem[];
  onOpenDrillDown?: (severity?: string, projectId?: string) => void;
}

export function RiskHeatmap({ highRiskCount, topRisks, onOpenDrillDown }: RiskHeatmapProps) {
  const hasRisks = highRiskCount > 0;
  
  return (
    <div className="workspace-panel p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[15px] font-semibold text-[var(--foreground)]">ความเสี่ยงโครงการ (Risk Overview)</h3>
          {hasRisks ? (
            <AlertTriangle size={16} className="text-[var(--danger)]" />
          ) : (
            <ShieldCheck size={16} className="text-[var(--success)]" />
          )}
        </div>
        {onOpenDrillDown && (
          <button
            type="button"
            onClick={() => onOpenDrillDown('HIGH_EXTREME')}
            className="text-[12px] font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>ดูทะเบียนความเสี่ยง →</span>
          </button>
        )}
      </div>

      <div 
        onClick={() => onOpenDrillDown?.('HIGH_EXTREME')}
        className={cn(
          "flex items-end gap-3 transition-opacity",
          onOpenDrillDown && "cursor-pointer hover:opacity-80"
        )}
        title="คลิกเพื่อเจาะลึกความเสี่ยงสูง/วิกฤต"
      >
        <div className={cn(
          "text-3xl font-bold tabular-nums",
          hasRisks ? "text-[var(--danger)]" : "text-[var(--success)]"
        )}>
          {highRiskCount}
        </div>
        <div className="text-[13px] text-[var(--foreground-muted)] pb-1 font-medium flex items-center gap-1">
          <span>ความเสี่ยงสูง (High Risks)</span>
          {onOpenDrillDown && <ChevronRight size={14} className="text-[var(--foreground-subtle)]" />}
        </div>
      </div>

      <div className="flex h-1.5 w-full rounded-full overflow-hidden">
        <div className="bg-red-500 h-full flex-1" />
        <div className="bg-red-800 h-full flex-1 border-l border-white/20" />
      </div>

      <div className="flex flex-col gap-2 mt-1">
        {!hasRisks || topRisks.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-4 text-[var(--success)] bg-[var(--success)]/10 rounded-[var(--radius-md)] border border-[var(--success)]/20">
            <CheckCircle2 size={16} />
            <span className="text-[13px] font-medium">ไม่พบความเสี่ยงระดับสูงในระบบ</span>
          </div>
        ) : (
          topRisks.slice(0, 3).map((risk, index) => {
            const isExtreme = risk.severityLevel?.toUpperCase() === 'EXTREME';
            return (
              <div 
                key={index} 
                onClick={() => onOpenDrillDown?.(risk.severityLevel, risk.projectId)}
                className={cn(
                  "flex gap-3 p-2.5 rounded-[var(--radius-md)] bg-[var(--surface-muted)] transition-all group",
                  onOpenDrillDown && "cursor-pointer hover:bg-[var(--surface-active)] hover:shadow-xs border border-transparent hover:border-[var(--border)]"
                )}
                title="คลิกเพื่อเจาะลึกความเสี่ยงรายการนี้"
              >
                <div className="mt-1">
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    isExtreme ? "bg-red-800 animate-pulse" : "bg-red-500"
                  )} />
                </div>
                <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[var(--foreground-subtle)] truncate">
                      {risk.projectName}
                    </span>
                    {onOpenDrillDown && (
                      <span className="opacity-0 group-hover:opacity-100 text-[11px] font-semibold text-[var(--accent)] transition-opacity">
                        เจาะลึก ↗
                      </span>
                    )}
                  </div>
                  <div className="text-[13px] text-[var(--foreground)] font-medium line-clamp-2 leading-snug">
                    {risk.description}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-[var(--surface-inset)] text-[var(--foreground-muted)] border border-[var(--border-muted)]">
                      {risk.status}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold",
                      isExtreme ? "text-red-800" : "text-red-600"
                    )}>
                      {isExtreme ? 'วิกฤต (EXTREME)' : 'สูง (HIGH)'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

