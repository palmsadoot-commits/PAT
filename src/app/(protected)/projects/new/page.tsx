'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  PlusCircle, 
  Building2, 
  Calendar, 
  Wallet, 
  FileText, 
  Target,
  Sparkles,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    projectName: '',
    fiscalYear: 2569,
    organizationId: 'ORG-001',
    departmentId: 'DEP-001',
    projectType: 'DIGITAL',
    description: '',
    principle: '',
    objectives: '',
    target: '',
    kpi: '',
    expectedOutcome: '',
    budget: '',
    budgetSource: 'งบประมาณรายจ่ายประจำปี',
    priority: 'MEDIUM',
    startDate: '2026-10-01',
    endDate: '2027-09-30',
  });

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.charts?.byOrg) {
          setOrganizations(json.data.charts.byOrg);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName.trim() || !formData.budget) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budget: Number(formData.budget),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'ไม่สามารถสร้างโครงการได้');
      }

      toast.success('สร้างโครงการฉบับร่างเรียบร้อยแล้ว');
      router.push(`/projects/${json.data.id}`);
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-16">
      {/* Back link */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้ารายการโครงการ</span>
        </Link>
      </div>

      <header className="workspace-panel overflow-hidden">
        <div className="border-b border-[var(--border-muted)] px-5 py-5 sm:px-6">
          <p className="workspace-eyebrow mb-1.5">NEW PROJECT PROPOSAL</p>
          <h1 className="text-display text-[var(--foreground)]">สร้างข้อเสนอโครงการใหม่</h1>
          <p className="mt-1 text-[13px] text-[var(--foreground-muted)]">บันทึกเป็นฉบับร่างก่อนยื่นเข้าสู่กระบวนการพิจารณา</p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-[var(--border-muted)] bg-[var(--surface-inset)] text-center">
          {['ข้อมูลพื้นฐาน', 'งบประมาณและเวลา', 'รายละเอียดโครงการ'].map((label, index) => (
            <div key={label} className="px-2 py-3">
              <span className={cn('mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold', index === 0 ? 'bg-[var(--accent)] text-white' : 'bg-white text-[var(--foreground-muted)] border border-[var(--border)]')}>{index + 1}</span>
              <span className="mt-1 block truncate text-[10px] font-semibold text-[var(--foreground-muted)] sm:text-[11px]">{label}</span>
            </div>
          ))}
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Basic Information */}
        <section className="workspace-panel space-y-4 p-4 sm:p-5">
          <div className="flex items-center gap-2 border-b border-[var(--border-muted)] pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-muted)] text-[var(--accent)]"><Building2 className="h-4 w-4" /></div>
            <h2 className="text-[15px] font-semibold text-[var(--foreground)]">1. ข้อมูลพื้นฐานโครงการ</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                ชื่อโครงการ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="เช่น โครงการพัฒนาระบบบริการดิจิทัลเพื่อประชาชน ประจำปี 2569"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="w-full p-2.5 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none transition-all font-medium text-[var(--foreground)]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                  ปีงบประมาณ <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.fiscalYear}
                  onChange={(e) => setFormData({ ...formData, fiscalYear: Number(e.target.value) })}
                  className="w-full p-2.5 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)] cursor-pointer"
                >
                  <option value={2569}>ปีงบประมาณ 2569</option>
                  <option value={2568}>ปีงบประมาณ 2568</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">ประเภทโครงการ</label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  className="w-full p-2.5 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)] cursor-pointer"
                >
                  <option value="DIGITAL">ดิจิทัลและเทคโนโลยีสารสนเทศ</option>
                  <option value="INFRASTRUCTURE">โครงสร้างพื้นฐานและกายภาพ</option>
                  <option value="RESEARCH">การวิจัยและนวัตกรรม</option>
                  <option value="TRAINING">การฝึกอบรมและพัฒนาบุคลากร</option>
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
        </section>

        {/* Section 2: Budget & Timeline */}
        <section className="workspace-panel space-y-4 p-4 sm:p-5">
          <div className="flex items-center gap-2 border-b border-[var(--border-muted)] pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-muted)] text-[var(--accent)]"><Wallet className="h-4 w-4" /></div>
            <h2 className="text-[15px] font-semibold text-[var(--foreground)]">2. งบประมาณและระยะเวลาดำเนินงาน</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                งบประมาณที่ขออนุมัติ (บาท) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder="เช่น 2500000"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full p-2.5 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none font-semibold text-[var(--foreground)] tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">แหล่งที่มาของงบประมาณ</label>
              <input
                type="text"
                value={formData.budgetSource}
                onChange={(e) => setFormData({ ...formData, budgetSource: e.target.value })}
                className="w-full p-2.5 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">วันที่เริ่มโครงการ</label>
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
        </section>

        {/* Section 3: Principles & Objectives */}
        <section className="workspace-panel space-y-4 p-4 sm:p-5">
          <div className="flex items-center gap-2 border-b border-[var(--border-muted)] pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-muted)] text-[var(--accent)]"><FileText className="h-4 w-4" /></div>
            <h2 className="text-[15px] font-semibold text-[var(--foreground)]">3. หลักการ วัตถุประสงค์ และเป้าหมาย</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">หลักการและเหตุผล</label>
              <textarea
                rows={4}
                placeholder="ระบุที่มา ความจำเป็น ปัญหา และข้อกฎหมายหรือนโยบายที่เกี่ยวข้อง..."
                value={formData.principle}
                onChange={(e) => setFormData({ ...formData, principle: e.target.value })}
                className="w-full p-3 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)] leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">วัตถุประสงค์โครงการ</label>
                <textarea
                  rows={3}
                  placeholder="1. เพื่อยกระดับการให้บริการ...\n2. เพื่อบูรณาการระบบ..."
                  value={formData.objectives}
                  onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                  className="w-full p-3 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">เป้าหมายโครงการ</label>
                <textarea
                  rows={3}
                  placeholder="เป้าหมายเชิงปริมาณและเชิงคุณภาพ..."
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
                  placeholder="ตัวชี้วัดผลผลิต (Output) และผลลัพธ์ (Outcome)..."
                  value={formData.kpi}
                  onChange={(e) => setFormData({ ...formData, kpi: e.target.value })}
                  className="w-full p-3 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">ผลที่คาดว่าจะได้รับ</label>
                <textarea
                  rows={3}
                  placeholder="ประโยชน์ที่จะเกิดขึ้นต่อหน่วยงาน บุคลากร และประชาชน..."
                  value={formData.expectedOutcome}
                  onChange={(e) => setFormData({ ...formData, expectedOutcome: e.target.value })}
                  className="w-full p-3 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)] leading-relaxed"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Action buttons */}
        <div className="sticky bottom-3 z-20 flex items-center justify-end gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/95 p-3 shadow-[var(--shadow-card)] backdrop-blur sm:p-4">
          <Link
            href="/projects"
            className="px-5 py-2.5 text-xs font-semibold text-[var(--foreground-muted)] bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-muted)] rounded-[var(--radius-md)] transition-colors"
          >
            ยกเลิก
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-[var(--radius-md)] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? 'กำลังบันทึก...' : 'บันทึกเป็นฉบับร่าง (Save as Draft)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
