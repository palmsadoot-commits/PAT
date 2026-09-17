'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  Download, 
  Trash2, 
  FileCheck, 
  ChevronLeft, 
  ChevronRight,
  FolderKanban,
  FileSpreadsheet,
  FileCode,
  File
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

const DOC_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PROPOSAL: { label: 'ข้อเสนอโครงการ', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  BUDGET: { label: 'แผนงบประมาณ', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  OFFICIAL_LETTER: { label: 'หนังสือนำส่งราชการ', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  SUPPORTING: { label: 'เอกสารประกอบ', color: 'text-stone-700', bg: 'bg-stone-100 border-stone-200' },
  APPROVAL: { label: 'เอกสารอนุมัติ', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [docType, setDocType] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 12, total: 0, totalPages: 1 });

  const fetchDocs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('pageSize', '12');
      if (search.trim()) params.set('search', search.trim());
      if (docType) params.set('documentType', docType);

      const res = await fetch(`/api/documents?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setDocuments(json.data || []);
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
      fetchDocs(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, docType]);

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้?')) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('ไม่สามารถลบเอกสารได้');
      toast.success('ลบเอกสารสำเร็จ');
      fetchDocs(pagination.page);
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '150 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-card)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent-muted)] text-[var(--accent)] flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <h1 className="text-page-title text-[var(--foreground)] tracking-tight">คลังเอกสารโครงการ (Document Repository)</h1>
          </div>
          <p className="text-[13px] text-[var(--foreground-muted)] mt-1.5">
            ค้นหา ตรวจสอบ และดาวน์โหลดเอกสารประกอบโครงการทั้งหมดในระบบ ({pagination.total.toLocaleString()} รายการ)
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[var(--surface)] p-4 rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-card)] grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-[var(--foreground-subtle)] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="ค้นหาชื่อเอกสาร หรือเลขที่/ชื่อโครงการ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)]"
          />
        </div>

        <div>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)] cursor-pointer"
          >
            <option value="">ทุกประเภทเอกสาร</option>
            <option value="PROPOSAL">ข้อเสนอโครงการ (Proposal)</option>
            <option value="BUDGET">แผนงบประมาณ (Budget Plan)</option>
            <option value="OFFICIAL_LETTER">หนังสือนำส่งราชการ (Official Letter)</option>
            <option value="SUPPORTING">เอกสารประกอบอื่นๆ (Supporting)</option>
            <option value="APPROVAL">เอกสารการอนุมัติ (Approval)</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-[var(--surface-muted)] rounded-[var(--radius-xl)] border border-[var(--border)]" />
          ))}
        </div>
      ) : documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => {
            const config = DOC_TYPE_CONFIG[doc.documentType] || DOC_TYPE_CONFIG.SUPPORTING;
            return (
              <div
                key={doc.id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-4 shadow-[var(--shadow-card)] hover:border-[var(--border-active)] transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', config.color, config.bg)}>
                      {config.label}
                    </span>
                    <span className="text-[11px] text-[var(--foreground-subtle)] font-mono">
                      {formatFileSize(doc.fileSize)}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                    {doc.fileName}
                  </h3>

                  <div className="text-[11px] text-[var(--foreground-muted)] space-y-0.5 pt-1">
                    <p className="truncate">
                      โครงการ: <span className="text-[var(--foreground)] font-medium">{doc.projectName || 'โครงการ'}</span>
                    </p>
                    <p className="text-[10px] text-[var(--foreground-subtle)]">
                      อัปโหลดเมื่อ {formatDate(doc.uploadedAt)} โดย {doc.uploaderName || doc.uploadedBy}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--border-muted)]">
                  <Link
                    href={`/projects/${doc.projectId}`}
                    className="text-[11px] font-medium text-[var(--accent)] hover:underline"
                  >
                    เปิดโครงการ →
                  </Link>

                  <div className="flex items-center gap-1">
                    <a
                      href={`/api/documents/${doc.id}/download`}
                      className="p-1.5 text-[var(--foreground-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-muted)] rounded-[var(--radius-sm)] transition-colors"
                      title="ดาวน์โหลดเอกสาร"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 text-[var(--foreground-subtle)] hover:text-red-600 hover:bg-red-50 rounded-[var(--radius-sm)] transition-colors cursor-pointer"
                      title="ลบเอกสาร"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] border border-[var(--border)] p-12 text-center text-[var(--foreground-muted)] space-y-2">
          <FolderKanban className="w-10 h-10 text-[var(--foreground-subtle)] mx-auto" />
          <p className="text-[14px] font-medium text-[var(--foreground)]">ไม่พบเอกสารตามเงื่อนไขที่ค้นหา</p>
          <p className="text-[12px] text-[var(--foreground-muted)]">ลองค้นหาด้วยคำอื่นหรือเปลี่ยนตัวกรอง</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] flex items-center justify-between text-xs text-[var(--foreground-muted)] shadow-[var(--shadow-card)]">
          <div>
            หน้า {pagination.page} จาก {pagination.totalPages} (ทั้งหมด {pagination.total.toLocaleString()} รายการ)
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fetchDocs(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface)] hover:bg-[var(--surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchDocs(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface)] hover:bg-[var(--surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
