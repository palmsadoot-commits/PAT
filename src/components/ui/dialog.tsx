'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: DialogSize;
}

const SIZE_CLASSES: Record<DialogSize, string> = {
  sm: 'sm:max-w-[400px]',
  md: 'sm:max-w-[500px]',
  lg: 'sm:max-w-[640px]',
  xl: 'sm:max-w-[860px]',
  '2xl': 'sm:max-w-[1080px]',
};

export function Dialog({
  open,
  onClose,
  children,
  className,
  size = 'md',
}: DialogProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!open || !mounted) {
    return null;
  }

  const dialogContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 overlay-backdrop animate-fade-in transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Panel */}
      <div
        className={cn(
          'relative z-10 w-full bg-white rounded-[var(--radius-xl)] shadow-overlay shadow-[var(--shadow-overlay)] animate-scale-in overflow-hidden border border-[var(--border-muted)]',
          SIZE_CLASSES[size],
          className
        )}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}

export interface DialogHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  onClose?: () => void;
}

export function DialogHeader({
  title,
  description,
  onClose,
  children,
  className,
  ...props
}: DialogHeaderProps) {
  return (
    <div
      className={cn('px-6 pt-6 pb-4 border-b border-[var(--border)]', className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 flex-1">
          {title && (
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-secondary text-sm">{description}</p>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)] rounded-md p-1.5 transition-colors -mr-2 -mt-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            aria-label="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export interface DialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DialogBody({ className, children, ...props }: DialogBodyProps) {
  return (
    <div className={cn('px-6 py-4 text-sm text-[var(--foreground)]', className)} {...props}>
      {children}
    </div>
  );
}

export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DialogFooter({
  className,
  children,
  ...props
}: DialogFooterProps) {
  return (
    <div
      className={cn(
        'px-6 py-4 bg-[var(--surface-muted)]/40 border-t border-[var(--border)] rounded-b-[var(--radius-xl)] flex items-center justify-end gap-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
