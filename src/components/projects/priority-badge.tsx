'use client';

import React from 'react';

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
  HIGH: { label: 'เร่งด่วน', className: 'bg-red-50 text-red-700 border-red-200' },
  MEDIUM: { label: 'ปกติ', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  LOW: { label: 'ต่ำ', className: 'bg-green-50 text-green-700 border-green-200' },
};

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
  
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-2.5 py-0.5 text-sm';

  return (
    <span className={`inline-flex items-center font-medium rounded-md border ${sizeClasses} ${config.className}`}>
      {config.label}
    </span>
  );
}
