'use client';

import React from 'react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils/format';
import {
  Send,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileCheck,
  Eye,
  Rocket,
  Flag,
  ArrowRight,
  ClipboardCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActivityItem {
  id: string;
  projectId?: string;
  projectName: string;
  projectNo?: string;
  action: string;
  performerName: string;
  performedAt: string;
  toStatus?: string;
  comment?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const ACTION_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  SUBMIT: { icon: Send, color: 'text-blue-600 bg-blue-50', label: 'ยื่นเสนอโครงการ' },
  RECEIVE: { icon: FileCheck, color: 'text-indigo-600 bg-indigo-50', label: 'รับเรื่องตรวจเอกสาร' },
  ACKNOWLEDGE: { icon: FileCheck, color: 'text-indigo-600 bg-indigo-50', label: 'รับเรื่องตรวจเอกสาร' },
  PROCEED: { icon: Eye, color: 'text-violet-600 bg-violet-50', label: 'ส่งต่อพิจารณา' },
  START_REVIEW: { icon: Eye, color: 'text-violet-600 bg-violet-50', label: 'เริ่มพิจารณา' },
  DOCS_COMPLETE: { icon: ClipboardCheck, color: 'text-indigo-600 bg-indigo-50', label: 'ตรวจเอกสารครบถ้วน' },
  DOCS_INCOMPLETE: { icon: RotateCcw, color: 'text-amber-600 bg-amber-50', label: 'เอกสารไม่ครบถ้วน' },
  REVIEW_COMPLETE: { icon: CheckCircle2, color: 'text-purple-600 bg-purple-50', label: 'พิจารณาเสร็จสิ้น' },
  REVIEW_RETURN: { icon: RotateCcw, color: 'text-amber-600 bg-amber-50', label: 'ตีกลับเพื่อแก้ไข' },
  RECOMMEND: { icon: Send, color: 'text-orange-600 bg-orange-50', label: 'เสนอขออนุมัติ' },
  SEND_TO_APPROVAL: { icon: Send, color: 'text-orange-600 bg-orange-50', label: 'ส่งเข้ารออนุมัติ' },
  APPROVE: { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50', label: 'อนุมัติโครงการ' },
  REJECT: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'ไม่อนุมัติ' },
  RETURN: { icon: RotateCcw, color: 'text-amber-600 bg-amber-50', label: 'ตีกลับแก้ไข' },
  START: { icon: Rocket, color: 'text-cyan-600 bg-cyan-50', label: 'เริ่มดำเนินโครงการ' },
  START_WORK: { icon: Rocket, color: 'text-cyan-600 bg-cyan-50', label: 'เริ่มดำเนินโครงการ' },
  COMPLETE: { icon: Flag, color: 'text-emerald-600 bg-emerald-50', label: 'ดำเนินการเสร็จสิ้น' },
  RESUBMIT: { icon: Send, color: 'text-blue-600 bg-blue-50', label: 'ยื่นเสนอใหม่' },
  CANCEL: { icon: XCircle, color: 'text-slate-600 bg-slate-50', label: 'ยกเลิกโครงการ' },
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="workspace-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--foreground)]">
            กิจกรรมล่าสุด
          </h2>
          <p className="text-[11px] text-[var(--foreground-muted)]">
            บันทึกการดำเนินการโครงการในระบบ
          </p>
        </div>
        <Link
          href="/audit-logs"
          className="text-[12px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1 transition-colors"
        >
          ประวัติทั้งหมด
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-1">
        {activities.slice(0, 8).map((activity) => {
          const config = ACTION_CONFIG[activity.action] || {
            icon: Send,
            color: 'text-blue-600 bg-blue-50',
            label: activity.action || 'ดำเนินกิจกรรม',
          };
          const Icon = config.icon;

          const ItemContent = (
            <div className="flex items-start gap-3 p-2.5 rounded-[var(--radius-md)] hover:bg-[var(--surface-muted)] transition-colors group">
              <div
                className={cn(
                  'w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0 mt-0.5',
                  config.color
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[var(--foreground)] leading-snug">
                  <span className="font-semibold text-[var(--foreground)]">{activity.performerName}</span>
                  <span className="text-[var(--foreground-muted)]"> {config.label}</span>
                </p>
                <p className="text-[11px] text-[var(--foreground-subtle)] truncate mt-0.5 group-hover:text-[var(--foreground-muted)]">
                  {activity.projectNo && (
                    <span className="font-mono">{activity.projectNo} · </span>
                  )}
                  {activity.projectName}
                </p>
                {activity.comment && (
                  <p className="text-[11px] text-[var(--foreground-muted)] italic mt-1 bg-[var(--surface-muted)] px-2 py-0.5 rounded-[var(--radius-sm)] truncate">
                    &ldquo;{activity.comment}&rdquo;
                  </p>
                )}
              </div>

              <span className="text-[11px] text-[var(--foreground-subtle)] whitespace-nowrap flex-shrink-0">
                {formatRelativeTime(activity.performedAt)}
              </span>
            </div>
          );

          if (activity.projectId) {
            return (
              <Link
                key={activity.id}
                href={`/projects/${activity.projectId}`}
                className="block"
              >
                {ItemContent}
              </Link>
            );
          }

          return <div key={activity.id}>{ItemContent}</div>;
        })}

        {activities.length === 0 && (
          <div className="py-8 text-center text-[13px] text-[var(--foreground-subtle)]">
            ยังไม่มีกิจกรรมในระบบ
          </div>
        )}
      </div>
    </div>
  );
}

