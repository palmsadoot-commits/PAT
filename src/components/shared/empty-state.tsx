import React from 'react';
import { FolderSearch } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  icon = <FolderSearch className="h-10 w-10 text-[var(--accent)]" />, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-active)] bg-[var(--surface-inset)] p-10 text-center sm:p-12">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-muted)]">
        {icon}
      </div>
      <h3 className="mb-2 text-[16px] font-bold text-[var(--foreground)]">{title}</h3>
      <p className="mb-6 max-w-sm text-[13px] leading-relaxed text-[var(--foreground-muted)]">{description}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="h-9 rounded-[var(--radius-md)] bg-[var(--primary)] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
