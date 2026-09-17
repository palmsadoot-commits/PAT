'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'แดชบอร์ด',
  projects: 'โครงการ',
  new: 'สร้างใหม่',
  edit: 'แก้ไข',
  review: 'ตรวจสอบ',
  approval: 'อนุมัติ',
  documents: 'เอกสาร',
  notifications: 'การแจ้งเตือน',
  reports: 'รายงาน',
  users: 'ผู้ใช้งาน',
  settings: 'ตั้งค่า',
  'audit-logs': 'ประวัติระบบ',
  'my-tasks': 'งานของฉัน',
  workload: 'ภาระงานและทรัพยากร',
  governance: 'กำกับดูแล DPM (ต้นน้ำ-ปลายน้ำ)',
};

export function Breadcrumb() {
  const pathname = usePathname();
  
  if (!pathname || pathname === '/') return null;
  
  const segments = pathname.split('/').filter(Boolean);
  
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-[13px] gap-1.5 overflow-hidden whitespace-nowrap">
      <Link 
        href="/dashboard" 
        className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors flex items-center justify-center"
        aria-label="หน้าแรก"
      >
        <Home className="w-[15px] h-[15px]" />
      </Link>
      
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        
        // Handle UUIDs or long IDs
        const isId = segment.includes('-') && segment.length > 20;
        let displayLabel = ROUTE_LABELS[segment.toLowerCase()] || segment;
        
        if (isId) {
          displayLabel = `${segment.substring(0, 8)}...`;
        }
        
        return (
          <React.Fragment key={href}>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--foreground-subtle)] flex-shrink-0" />
            {isLast ? (
              <span className="text-[var(--foreground)] font-medium truncate" aria-current="page">
                {displayLabel}
              </span>
            ) : (
              <Link 
                href={href}
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors truncate"
              >
                {displayLabel}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
