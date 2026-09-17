'use client';

import React, { useEffect, useState } from 'react';
import { 
  ScrollText, 
  Search, 
  Shield, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  User,
  Activity
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

const ACTION_COLORS: Record<string, { label: string; color: string; bg: string }> = {
  STATUS_CHANGE: { label: 'STATUS_CHANGE', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  LOGIN: { label: 'LOGIN', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  LOGOUT: { label: 'LOGOUT', color: 'text-stone-700', bg: 'bg-stone-100 border-stone-200' },
  DELETE: { label: 'DELETE', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  CREATE: { label: 'CREATE', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  UPDATE: { label: 'UPDATE', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  UPLOAD: { label: 'UPLOAD', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
  DOWNLOAD: { label: 'DOWNLOAD', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('pageSize', '20');
      if (search.trim()) params.set('search', search.trim());
      if (action) params.set('action', action);

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setLogs(json.data || []);
        if (json.pagination) setPagination(json.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, action]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-card)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent-muted)] text-[var(--accent)] flex items-center justify-center font-bold">
              <ScrollText className="w-4 h-4" />
            </div>
            <h1 className="text-page-title text-[var(--foreground)] tracking-tight">บันทึกประวัติการใช้งาน (Audit Trail)</h1>
          </div>
          <p className="text-[13px] text-[var(--foreground-muted)] mt-1.5">
            เก็บบันทึกประวัติกิจกรรมและการดำเนินงานทั้งหมดเพื่อความโปร่งใสและตรวจสอบย้อนหลัง ({pagination.total.toLocaleString()} รายการ)
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[var(--surface)] p-4 rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-card)] grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-[var(--foreground-subtle)] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ใช้, คำอธิบายกิจกรรม, หรือ IP Address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)]"
          />
        </div>

        <div>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)] cursor-pointer"
          >
            <option value="">ทุกประเภทการกระทำ (All Actions)</option>
            <option value="LOGIN">LOGIN (เข้าสู่ระบบ)</option>
            <option value="LOGOUT">LOGOUT (ออกจากระบบ)</option>
            <option value="CREATE">CREATE (สร้าง)</option>
            <option value="UPDATE">UPDATE (แก้ไข)</option>
            <option value="DELETE">DELETE (ลบ)</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE (เปลี่ยนสถานะ)</option>
            <option value="UPLOAD">UPLOAD (อัปโหลด)</option>
            <option value="DOWNLOAD">DOWNLOAD (ดาวน์โหลด)</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-card)] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-[var(--surface-muted)] rounded-[var(--radius-md)]" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[var(--surface-muted)] text-[var(--foreground-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                  <th className="py-3.5 px-4 font-semibold">วัน-เวลา</th>
                  <th className="py-3.5 px-4 font-semibold">ผู้ใช้งาน</th>
                  <th className="py-3.5 px-4 font-semibold">ประเภท (Action)</th>
                  <th className="py-3.5 px-4 font-semibold">โมดูล</th>
                  <th className="py-3.5 px-4 font-semibold">รายละเอียดกิจกรรม</th>
                  <th className="py-3.5 px-4 font-semibold text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-muted)]">
                {logs.map((log) => {
                  const actionStyle = ACTION_COLORS[log.action] || { label: log.action, color: 'text-stone-700', bg: 'bg-stone-100 border-stone-200' };

                  return (
                    <tr key={log.id} className="hover:bg-[var(--surface-muted)] transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[var(--foreground-subtle)] whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[var(--foreground)] whitespace-nowrap">
                        {log.userName}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={cn('px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border', actionStyle.color, actionStyle.bg)}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[var(--foreground-muted)] font-mono text-[11px] whitespace-nowrap">
                        {log.module}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--foreground)] max-w-md truncate">
                        {log.description}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[var(--foreground-subtle)] text-[11px] whitespace-nowrap">
                        {log.ipAddress}
                      </td>
                    </tr>
                  );
                })}
                {!logs.length && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-[var(--foreground-muted)] text-xs">
                      ไม่พบบันทึกกิจกรรมตามเงื่อนไข
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-[var(--border-muted)] flex items-center justify-between bg-[var(--surface)] text-xs text-[var(--foreground-muted)]">
            <div>
              หน้า {pagination.page} จาก {pagination.totalPages} (ทั้งหมด {pagination.total.toLocaleString()} รายการ)
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fetchLogs(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface)] hover:bg-[var(--surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchLogs(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface)] hover:bg-[var(--surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
