'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  CheckCheck, 
  Inbox, 
  Clock, 
  ArrowRight, 
  Send, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { formatRelativeTime, formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

const TYPE_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  NEW_SUBMISSION: { icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
  RETURNED: { icon: RotateCcw, color: 'text-amber-600', bg: 'bg-amber-50' },
  NEEDS_REVIEW: { icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
  PENDING_APPROVAL: { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  APPROVED: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  REJECTED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  SLA_WARNING: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  NEW_COMMENT: { icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'PUT' });
      if (res.ok) {
        toast.success('ทำเครื่องหมายว่าอ่านแล้วทั้งหมด');
        setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      toast.error('ไม่สามารถทำรายการได้');
    }
  };

  const handleMarkSingle = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      // silent
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-[var(--surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent-muted)] text-[var(--accent)] flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-page-title text-[var(--foreground)] tracking-tight">การแจ้งเตือน (Notifications)</h1>
          </div>
          <p className="text-[13px] text-[var(--foreground-muted)] mt-1.5">
            รายการแจ้งเตือนสถานะโครงการ การพิจารณาคำขอ และการแจ้งเตือนตามกรอบระยะเวลา SLA
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[var(--accent)] bg-[var(--accent-muted)] border border-[var(--border)] rounded-[var(--radius-md)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>ทำเครื่องหมายว่าอ่านแล้ว ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-card)] divide-y divide-[var(--border-muted)] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-[var(--surface-muted)] rounded-[var(--radius-md)]" />
            ))}
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((n) => {
            const config = TYPE_ICONS[n.type] || { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-100' };
            const Icon = config.icon;

            return (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkSingle(n.id)}
                className={cn(
                  'p-5 flex items-start gap-4 transition-colors cursor-pointer group',
                  !n.isRead 
                    ? 'bg-[var(--accent-muted)]/40 hover:bg-[var(--accent-muted)]/60' 
                    : 'hover:bg-[var(--surface-muted)]'
                )}
              >
                {/* Type Icon */}
                <div
                  className={cn(
                    'w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0 mt-0.5',
                    config.bg,
                    config.color
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[var(--accent)] flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--foreground-subtle)] whitespace-nowrap">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                    {n.message}
                  </p>

                  {n.projectId && (
                    <div className="pt-2">
                      <Link
                        href={`/projects/${n.projectId}`}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)] hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>ดูโครงการที่เกี่ยวข้อง</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-[var(--foreground-muted)] space-y-2">
            <Inbox className="w-10 h-10 text-[var(--foreground-subtle)] mx-auto" />
            <p className="text-[14px] font-medium text-[var(--foreground)]">ไม่มีการแจ้งเตือนในขณะนี้</p>
            <p className="text-[12px] text-[var(--foreground-muted)]">เมื่อมีกิจกรรมเกี่ยวกับโครงการของคุณ จะปรากฏขึ้นที่นี่</p>
          </div>
        )}
      </div>
    </div>
  );
}
