'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

export interface MetricItem {
  label: string;
  value: string | number;
  suffix?: string;
  detail?: string;
  color?: string;
  accentColor?: string;
  href?: string;
}

interface MetricRowProps {
  metrics: MetricItem[];
}

export function MetricRow({ metrics }: MetricRowProps) {
  return (
    <div className="workspace-panel grid grid-cols-2 overflow-hidden lg:grid-cols-4">
      {metrics.map((metric, i) => {
        const Content = (
          <div
            className={cn(
              'group relative min-w-0 border-b border-r border-[var(--border)] p-4 sm:p-5 transition-all hover:bg-[var(--surface-inset)] even:border-r-0 lg:border-b-0 lg:even:border-r lg:last:border-r-0',
              metric.href && 'cursor-pointer'
            )}
          >
            {/* Subtle top indicator bar */}
            <div 
              className={cn(
                'absolute left-0 top-0 h-[3px] w-full transition-opacity',
                metric.accentColor || 'bg-transparent group-hover:bg-[var(--accent)]'
              )} 
            />

            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--foreground-muted)]">
                {metric.label}
              </p>
              {metric.href && (
                <ChevronRight className="h-3.5 w-3.5 text-[var(--foreground-subtle)] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
              )}
            </div>

            <div className="mt-2 flex items-baseline gap-1.5">
              <span
                className={cn(
                  'text-2xl sm:text-3xl font-bold tabular-nums tracking-tight',
                  metric.color || 'text-[var(--foreground)]'
                )}
              >
                {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
              </span>
              {metric.suffix && (
                <span className="text-[12px] font-semibold text-[var(--foreground-muted)]">{metric.suffix}</span>
              )}
            </div>

            {metric.detail && (
              <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-[var(--foreground-subtle)] truncate">
                {metric.detail}
              </p>
            )}
          </div>
        );

        if (metric.href) {
          return (
            <Link key={i} href={metric.href} className="block">
              {Content}
            </Link>
          );
        }

        return <div key={i}>{Content}</div>;
      })}
    </div>
  );
}
