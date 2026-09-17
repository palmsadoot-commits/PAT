'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  RefreshCw, 
  Building2, 
  Wallet, 
  FileText 
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const [organizations, setOrganizations] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    projectName: '',
    fiscalYear: 2569,
    organizationId: '',
    departmentId: '',
    projectType: 'DIGITAL',
    description: '',
    principle: '',
    objectives: '',
    target: '',
    kpi: '',
    expectedOutcome: '',
    budget: 0,
    budgetSource: 'งบประมาณรายจ่ายประจำปี',
    priority: 'MEDIUM',
    startDate: '',
    endDate: '',
    version: 1,
  });

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setConflictError(null);
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error('ไม่พบข้อมูลโครงการ');
      const json = await res.json();
      const p = json.data;

      setFormData({
        projectName: p.projectName || '',
        fiscalYear: p.fiscalYear || 2569,
        organizationId: p.organizationId || '',
        departmentId: p.departmentId || '',
        projectType: p.projectType || 'DIGITAL',
        description: p.description || '',
        principle: p.principle || '',
        objectives: p.objectives || '',
        target: p.target || '',
        kpi: p.kpi || '',
        expectedOutcome: p.expectedOutcome || '',
        budget: p.budget || 0,
        budgetSource: p.budgetSource || 'งบประมาณรายจ่ายประจำปี',
        priority: p.priority || 'MEDIUM',
        startDate: p.startDate ? p.startDate.slice(0, 10) : '',
        endDate: p.endDate ? p.endDate.slice(0, 10) : '',
        version: p.version || 1,
      });

      fetch('/api/dashboard')
        .then((r) => r.json())
        .then((d) => {
          if (d?.data?.charts?.byOrg) {
            setOrganizations(d.data.charts.byOrg);
          }
        })
        .catch(() => {});
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setConflictError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (res.status === 409) {
        setConflictError(json.message || 'ข้อมูลถูกแก้ไขโดยผู้ใช้งานอื่นแล้ว กรุณารีเฟรชข้อมูลก่อนบันทึกอีกครั้ง');
        toast.error('เกิดข้อขัดแย้งในการบันทึก (Version Conflict)');
        return;
      }

      if (!res.ok) {
        throw new Error(json.message || 'ไม่สามารถแก้ไขโครงการได้');
      }

      toast.success('บันทึกการแก้ไขโครงการเรียบร้อยแล้ว');
      router.push(`/projects/${projectId}`);
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-[var(--foreground-muted)] space-y-2">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[var(--accent)]" />
        <p>กำลังโหลดข้อมูลโครงการ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Back Link */}
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ยกเลิกและกลับสู่หน้ารายละเอียด</span>
        </Link>
      </div>

      {conflictError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-[var(--radius-lg)] flex items-start justify-between gap-3 text-red-800 text-xs animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="font-semibold">{conflictError}</span>
          </div>
          <button
            onClick={fetchInitialData}
            className="flex items-center gap-1 bg-white border border-red-300 px-3 py-1.5 rounded-[var(--radius-md)] text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>รีเฟรชข้อมูลล่าสุด</span>
          </button>
        </div>
      )}

      {/* Header Panel */}
      <header className="workspace-panel overflow-hidden p-5 sm:p-6 relative">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[var(--accent)]" />
        <p className="workspace-eyebrow mb-1">PROJECT MODIFICATION · OPTIMISTIC LOCKING</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-display text-[var(--foreground)]">แก้ไขข้อมูลโครงการ</h1>
            <p className="text-[13px] text-[var(--foreground-muted)] mt-0.5">
              ปรับปรุงรายละเอียดและงบประมาณโครงการ (ระบบตรวจสอบความถูกต้องและควบคุมเวอร์ชัน)
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs text-[var(--foreground-subtle)] font-mono bg-[var(--surface-inset)] px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border)]">
            เวอร์ชันปัจจุบัน: v{formData.version}
          </span>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="workspace-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-muted)]">
            <Building2 className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="text-[15px] font-semibold text-[var(--foreground)]">1. ข้อมูลพื้นฐานโครงการ</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">ชื่อโครงการ *</label>
              <input
                type="text"
                required
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="w-full p-2.5 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none font-medium text-[var(--foreground)]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">ปีงบประมาณ *</label>
                <input
                  type="number"
                  required
                  value={formData.fiscalYear}
                  onChange={(e) => setFormData({ ...formData, fiscalYear: Number(e.target.value) })}
                  className="w-full p-2.5 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">ประเภทโครงการ</label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  className="w-full p-2.5 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)] cursor-pointer"
                >
                  <option value="DIGITAL">ดิจิทัลและเทคโนโลยี</option>
                  <option value="INFRASTRUCTURE">โครงสร้างพื้นฐาน</option>
                  <option value="RESEARCH">การวิจัยและพัฒนา</option>
                  <option value="TRAINING">การฝึกอบรมและพัฒนาทักษะ</option>
                  <option value="SERVICE">การบริการประชาชน</option>
                  <option value="OTHER">อื่นๆ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">ระดับความเร่งด่วน</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full p-2.5 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)] cursor-pointer"
                >
                  <option value="HIGH">เร่งด่วน (High)</option>
                  <option value="MEDIUM">ปกติ (Medium)</option>
                  <option value="LOW">ต่ำ (Low)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Budget & Timeline */}
        <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] border border-[var(--border)] p-6 shadow-[var(--shadow-card)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-muted)]">
            <Wallet className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="text-[15px] font-semibold text-[var(--foreground)]">2. งบประมาณและระยะเวลาดำเนินงาน</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">งบประมาณที่ขอ (บาท) *</label>
              <input
                type="number"
                required
                min={0}
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                className="w-full p-2.5 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none font-semibold text-[var(--foreground)] tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">แหล่งงบประมาณ</label>
              <input
                type="text"
                value={formData.budgetSource}
                onChange={(e) => setFormData({ ...formData, budgetSource: e.target.value })}
                className="w-full p-2.5 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">วันที่เริ่มต้นโครงการ</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-2.5 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">วันที่สิ้นสุดโครงการ</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full p-2.5 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Principles & Objectives */}
        <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] border border-[var(--border)] p-6 shadow-[var(--shadow-card)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-muted)]">
            <FileText className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="text-[15px] font-semibold text-[var(--foreground)]">3. หลักการ วัตถุประสงค์ และเป้าหมาย</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">หลักการและเหตุผล</label>
              <textarea
                rows={4}
                value={formData.principle}
                onChange={(e) => setFormData({ ...formData, principle: e.target.value })}
                className="w-full p-3 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)] leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">วัตถุประสงค์</label>
                <textarea
                  rows={3}
                  value={formData.objectives}
                  onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                  className="w-full p-3 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">เป้าหมาย</label>
                <textarea
                  rows={3}
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  className="w-full p-3 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)] leading-relaxed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">ตัวชี้วัดความสำเร็จ (KPI)</label>
                <textarea
                  rows={3}
                  value={formData.kpi}
                  onChange={(e) => setFormData({ ...formData, kpi: e.target.value })}
                  className="w-full p-3 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">ผลที่คาดว่าจะได้รับ</label>
                <textarea
                  rows={3}
                  value={formData.expectedOutcome}
                  onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                  className="w-full p-3 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)] leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-3 z-20 flex items-center justify-end gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/95 p-3 shadow-[var(--shadow-card)] backdrop-blur sm:p-4">
          <Link
            href={`/projects/${projectId}`}
            className="px-5 py-2.5 text-xs font-semibold text-[var(--foreground-muted)] bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-muted)] rounded-[var(--radius-md)] transition-colors"
          >
            ยกเลิก
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-[var(--radius-md)] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข (Save Changes)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
