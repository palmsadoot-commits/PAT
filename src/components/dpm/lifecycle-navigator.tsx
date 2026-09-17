'use client';

import React from 'react';
import { DPMPhase } from '@/types';
import { cn } from '@/lib/utils';
import { Waves, Settings2, Target, CheckCircle2, AlertCircle } from 'lucide-react';

interface LifecycleNavigatorProps {
  currentPhase: DPMPhase;
  activePhase: DPMPhase;
  onSelectPhase: (phase: DPMPhase) => void;
  progress: {
    upstream: number;
    midstream: number;
    downstream: number;
  };
}

export function LifecycleNavigator({
  currentPhase,
  activePhase,
  onSelectPhase,
  progress,
}: LifecycleNavigatorProps) {
  const phases: {
    id: DPMPhase;
    number: string;
    name: string;
    subtext: string;
    icon: any;
    progress: number;
    color: string;
    activeBorder: string;
  }[] = [
    {
      id: 'UPSTREAM',
      number: 'ช่วงที่ 1',
      name: 'ต้นน้ำ (Upstream)',
      subtext: 'ริเริ่ม กฎบัตรโครงการ (Charter) & RACI',
      icon: Waves,
      progress: progress.upstream,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
      activeBorder: 'border-blue-600 ring-2 ring-blue-500/20'
    },
    {
      id: 'MIDSTREAM',
      number: 'ช่วงที่ 2',
      name: 'กลางน้ำ (Midstream)',
      subtext: 'จัดซื้อจัดจ้าง, RTM, บริหาร CCB & ความเสี่ยง',
      icon: Settings2,
      progress: progress.midstream,
      color: 'text-purple-700 bg-purple-50 border-purple-200',
      activeBorder: 'border-purple-600 ring-2 ring-purple-500/20'
    },
    {
      id: 'DOWNSTREAM',
      number: 'ช่วงที่ 3',
      name: 'ปลายน้ำ (Downstream)',
      subtext: 'แผนตรวจรับ (ATP), UAT, ส่งมอบ & ปิดโครงการ',
      icon: Target,
      progress: progress.downstream,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      activeBorder: 'border-emerald-600 ring-2 ring-emerald-500/20'
    },
  ];

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-[var(--border-muted)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
            วงจรชีวิตโครงการดิจิทัลภาครัฐ (Digital Project Lifecycle Navigation)
          </h3>
        </div>
        <span className="text-[11px] text-[var(--foreground-muted)]">
          อ้างอิงกรอบมาตรฐาน PMBOK & IT Governance ภาครัฐ
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {phases.map((p) => {
          const Icon = p.icon;
          const isActive = activePhase === p.id;
          const isComplete = p.progress >= 100;

          return (
            <button
              key={p.id}
              onClick={() => onSelectPhase(p.id)}
              className={cn(
                'p-3.5 rounded-[var(--radius-lg)] border text-left transition-all relative flex flex-col justify-between cursor-pointer group',
                isActive
                  ? `bg-[var(--surface)] ${p.activeBorder} shadow-xs`
                  : 'bg-[var(--surface-muted)]/50 border-[var(--border)] hover:bg-[var(--surface)] hover:border-[var(--border-active)]'
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-[var(--foreground-muted)]">
                      {p.number}
                    </span>
                    {isActive && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[var(--accent-muted)] text-[var(--accent)]">
                        มุมมองปัจจุบัน
                      </span>
                    )}
                  </div>
                  {isComplete ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100%
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-[var(--foreground)] tabular-nums">
                      {p.progress}%
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-2.5">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 border mt-0.5',
                      p.color
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-[var(--foreground-muted)] line-clamp-1 mt-0.5">
                      {p.subtext}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[var(--border-muted)] h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    isComplete
                      ? 'bg-emerald-600'
                      : p.progress > 50
                      ? 'bg-[var(--accent)]'
                      : 'bg-blue-500'
                  )}
                  style={{ width: `${Math.min(100, Math.max(0, p.progress))}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
