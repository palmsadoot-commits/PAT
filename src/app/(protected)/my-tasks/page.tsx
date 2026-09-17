'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ListTodo, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  FolderKanban, 
  Filter,
  Calendar,
  Building2,
  UserCheck
} from 'lucide-react';
import { formatBudgetFull, formatDate, formatRelativeTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'ร่าง', color: 'var(--status-draft)', bg: 'var(--status-draft-bg)' },
  SUBMITTED: { label: 'ยื่นเสนอ', color: 'var(--status-submitted)', bg: 'var(--status-submitted-bg)' },
  DOCUMENT_CHECK: { label: 'ตรวจเอกสาร', color: 'var(--status-checking)', bg: 'var(--status-checking-bg)' },
  UNDER_REVIEW: { label: 'กำลังพิจารณา', color: 'var(--status-review)', bg: 'var(--status-review-bg)' },
  RETURNED: { label: 'ตีกลับแก้ไข', color: 'var(--status-returned)', bg: 'var(--status-returned-bg)' },
  PENDING_APPROVAL: { label: 'รออนุมัติ', color: 'var(--status-pending)', bg: 'var(--status-pending-bg)' },
  APPROVED: { label: 'อนุมัติแล้ว', color: 'var(--status-approved)', bg: 'var(--status-approved-bg)' },
  REJECTED: { label: 'ไม่อนุมัติ', color: 'var(--status-rejected)', bg: 'var(--status-rejected-bg)' },
  IN_PROGRESS: { label: 'กำลังดำเนินการ', color: 'var(--status-progress)', bg: 'var(--status-progress-bg)' },
  COMPLETED: { label: 'เสร็จสิ้น', color: 'var(--status-completed)', bg: 'var(--status-completed-bg)' },
  CANCELLED: { label: 'ยกเลิก', color: 'var(--status-cancelled)', bg: 'var(--status-cancelled-bg)' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  HIGH: { label: 'เร่งด่วน', color: 'text-red-700', dot: 'bg-red-500' },
  MEDIUM: { label: 'ปกติ', color: 'text-amber-700', dot: 'bg-amber-500' },
  LOW: { label: 'ต่ำ', color: 'text-emerald-700', dot: 'bg-emerald-500' },
};

export default function MyTasksPage() {
  const [session, setSession] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'urgent' | 'completed'>('pending');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [sessionRes, projRes] = await Promise.all([
          fetch('/api/auth/session'),
          fetch('/api/projects?pageSize=100'),
        ]);

        if (sessionRes.ok) {
          const s = await sessionRes.json();
          setSession(s.data);
        }

        if (projRes.ok) {
          const p = await projRes.json();
          setProjects(p.data || []);
        }
      } catch (err) {
        console.error('Failed to load my tasks:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const role = session?.role || '';
  const userId = session?.id || '';

  // Filter tasks based on role and action requirements
  const filterTasksForRole = (p: any) => {
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
      return ['SUBMITTED', 'DOCUMENT_CHECK', 'UNDER_REVIEW', 'PENDING_APPROVAL', 'RETURNED'].includes(p.status);
    }
    if (role === 'REVIEWER') {
      return ['SUBMITTED', 'DOCUMENT_CHECK', 'UNDER_REVIEW'].includes(p.status);
    }
    if (role === 'APPROVER' || role === 'EXECUTIVE') {
      return p.status === 'PENDING_APPROVAL';
    }
    if (role === 'PROJECT_OWNER' || role === 'OFFICER') {
      return p.ownerId === userId || ['DRAFT', 'RETURNED'].includes(p.status);
    }
    return false;
  };

  const pendingTasks = projects.filter(filterTasksForRole);
  const urgentTasks = pendingTasks.filter((p) => p.priority === 'HIGH' || p.status === 'RETURNED');
  const completedTasks = projects.filter((p) => ['APPROVED', 'COMPLETED'].includes(p.status));

  const displayList = 
    activeTab === 'pending' ? pendingTasks :
    activeTab === 'urgent' ? urgentTasks :
    completedTasks;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-card)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent-muted)] text-[var(--accent)] flex items-center justify-center font-bold">
              <ListTodo className="w-4 h-4" />
            </div>
            <h1 className="text-page-title text-[var(--foreground)] tracking-tight">ศูนย์รวมงานของฉัน (My Tasks)</h1>
          </div>
          <p className="text-[13px] text-[var(--foreground-muted)] mt-1.5">
            ติดตามและจัดการงานที่รอการดำเนินการ ตรวจสอบ และอนุมัติตามบทบาทหน้าที่ของคุณ ({session?.role || 'ผู้ใช้งาน'})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[var(--surface-muted)] border border-[var(--border)] px-3.5 py-2 rounded-[var(--radius-md)] text-right">
            <span className="text-[11px] text-[var(--foreground-muted)] font-medium block">งานรอดำเนินการ</span>
            <span className="text-base font-bold text-[var(--foreground)] tabular-nums block">
              {pendingTasks.length} รายการ
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[var(--border)] pb-1">
        <button
          onClick={() => setActiveTab('pending')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-t-[var(--radius-md)] border-b-2 transition-all cursor-pointer',
            activeTab === 'pending'
              ? 'border-[var(--accent)] text-[var(--accent)] font-semibold bg-[var(--surface)]'
              : 'border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]'
          )}
        >
          <Clock className="w-4 h-4" />
          <span>รอดำเนินการ ({pendingTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('urgent')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-t-[var(--radius-md)] border-b-2 transition-all cursor-pointer',
            activeTab === 'urgent'
              ? 'border-red-500 text-red-600 font-semibold bg-[var(--surface)]'
              : 'border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]'
          )}
        >
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span>เร่งด่วน / ตีกลับ ({urgentTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-t-[var(--radius-md)] border-b-2 transition-all cursor-pointer',
            activeTab === 'completed'
              ? 'border-emerald-500 text-emerald-600 font-semibold bg-[var(--surface)]'
              : 'border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]'
          )}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>เสร็จสิ้นแล้ว ({completedTasks.length})</span>
        </button>
      </div>

      {/* Task List */}
      <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-card)] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-[var(--surface-muted)] rounded-[var(--radius-md)]" />
            ))}
          </div>
        ) : displayList.length > 0 ? (
          <div className="divide-y divide-[var(--border-muted)]">
            {displayList.map((p) => {
              const status = STATUS_CONFIG[p.status] || STATUS_CONFIG.DRAFT;
              const priority = PRIORITY_CONFIG[p.priority] || PRIORITY_CONFIG.MEDIUM;

              return (
                <div
                  key={p.id}
                  className="p-5 hover:bg-[var(--surface-muted)] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-[var(--accent)] bg-[var(--accent-muted)] px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--border)]">
                        {p.projectNo || p.id}
                      </span>

                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={{ color: status.color, backgroundColor: status.bg }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }} />
                        {status.label}
                      </span>

                      <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--surface-muted)]', priority.color)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', priority.dot)} />
                        {priority.label}
                      </span>

                      <span className="text-[11px] text-[var(--foreground-muted)] flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-[var(--foreground-subtle)]" />
                        {p.organizationName}
                      </span>
                    </div>

                    <Link
                      href={`/projects/${p.id}`}
                      className="text-[15px] font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors block truncate"
                    >
                      {p.projectName}
                    </Link>

                    <div className="text-[12px] text-[var(--foreground-muted)] flex items-center gap-3 flex-wrap">
                      <span>ผู้รับผิดชอบ: <strong className="font-medium text-[var(--foreground)]">{p.ownerName || 'เจ้าหน้าที่'}</strong></span>
                      <span>•</span>
                      <span>งบประมาณ: <strong className="font-medium text-[var(--foreground)] tabular-nums">{formatBudgetFull(p.budget)}</strong></span>
                      <span>•</span>
                      <span>ปรับปรุงเมื่อ {formatDate(p.updatedAt || p.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/projects/${p.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-[var(--radius-md)] transition-colors shadow-xs"
                    >
                      <span>เปิดโครงการ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-[var(--foreground-muted)] space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[var(--foreground-subtle)] mx-auto" />
            <p className="text-[14px] font-medium text-[var(--foreground)]">ไม่มีงานในหมวดหมู่นี้</p>
            <p className="text-[12px] text-[var(--foreground-muted)]">คุณไม่มีรายการที่ต้องดำเนินการในขณะนี้</p>
          </div>
        )}
      </div>
    </div>
  );
}
