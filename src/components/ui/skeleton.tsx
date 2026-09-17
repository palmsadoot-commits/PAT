'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-[var(--surface-muted)] rounded-[var(--radius-md)]',
        className
      )}
      {...props}
    />
  );
}

export interface SkeletonTextProps {
  count?: number;
  className?: string;
  lineClassName?: string;
}

const LINE_WIDTHS = ['w-full', 'w-11/12', 'w-4/5', 'w-5/6', 'w-3/4', 'w-2/3'];

export function SkeletonText({
  count = 3,
  className,
  lineClassName,
}: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2.5', className)}>
      {Array.from({ length: count }).map((_, index) => {
        const widthClass = LINE_WIDTHS[index % LINE_WIDTHS.length];
        return (
          <Skeleton
            key={index}
            className={cn('h-4', widthClass, lineClassName)}
          />
        );
      })}
    </div>
  );
}

export interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'p-5 border border-[var(--border)] rounded-[var(--radius-lg)] bg-white space-y-4',
        className
      )}
    >
      {/* Header Area */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="space-y-2 flex-1 min-w-0">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>

      {/* Body Lines */}
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
    </div>
  );
}

export interface SkeletonTableProps {
  count?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({
  count = 5,
  columns = 4,
  className,
}: SkeletonTableProps) {
  return (
    <div
      className={cn(
        'w-full border border-[var(--border)] rounded-[var(--radius-lg)] bg-white overflow-hidden',
        className
      )}
    >
      {/* Table Header */}
      <div className="flex items-center gap-4 px-6 py-3.5 border-b border-[var(--border)] bg-[var(--surface-muted)]/50">
        {Array.from({ length: columns }).map((_, idx) => (
          <Skeleton
            key={idx}
            className={cn(
              'h-4',
              idx === 0 ? 'w-24 shrink-0' : 'flex-1',
              idx === columns - 1 ? 'w-16 shrink-0' : ''
            )}
          />
        ))}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-[var(--border)]">
        {Array.from({ length: count }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex items-center gap-4 px-6 py-4">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton
                key={colIdx}
                className={cn(
                  'h-4',
                  colIdx === 0 ? 'w-24 shrink-0' : 'flex-1',
                  colIdx === columns - 1 ? 'w-16 shrink-0' : ''
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
