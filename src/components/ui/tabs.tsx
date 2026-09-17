'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={cn('border-b border-[var(--border)] w-full', className)}>
      <TabList>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Tab
              key={tab.id}
              active={isActive}
              icon={tab.icon}
              count={tab.count}
              disabled={tab.disabled}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </Tab>
          );
        })}
      </TabList>
    </div>
  );
}

export interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TabList({ className, children, ...props }: TabListProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 -mb-px overflow-x-auto scrollbar-thin',
        className
      )}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: LucideIcon;
  count?: number;
}

export function Tab({
  active = false,
  icon: Icon,
  count,
  disabled = false,
  className,
  children,
  ...props
}: TabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2',
        active
          ? 'border-[var(--accent)] text-[var(--foreground)]'
          : 'border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:border-[var(--border-active)]',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      {...props}
    >
      {Icon && (
        <Icon
          className={cn(
            'w-4 h-4 shrink-0 transition-colors',
            active ? 'text-[var(--accent)]' : 'text-[var(--foreground-muted)]'
          )}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
      {count !== undefined && (
        <span
          className={cn(
            'ml-1.5 px-2 py-0.5 text-xs font-semibold rounded-full tabular-nums leading-none',
            active
              ? 'bg-[var(--accent-muted)] text-[var(--accent-foreground)]'
              : 'bg-[var(--surface-muted)] text-[var(--foreground-muted)]'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
