import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-[var(--status-rejected-border)] bg-[var(--status-rejected-bg)] p-8 text-center">
      <AlertTriangle className="mb-3 h-9 w-9 text-[var(--danger)]" />
      <h3 className="mb-1 text-[15px] font-bold text-[var(--foreground)]">เกิดข้อผิดพลาด</h3>
      <p className="mb-4 text-[13px] text-[var(--foreground-muted)]">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex h-9 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--status-rejected-border)] bg-white px-3.5 text-[13px] font-bold text-[var(--danger)] transition-colors hover:bg-[var(--status-rejected-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)] focus-visible:ring-offset-2"
        >
          <RefreshCcw className="w-4 h-4" />
          ลองใหม่อีกครั้ง
        </button>
      )}
    </div>
  );
}
