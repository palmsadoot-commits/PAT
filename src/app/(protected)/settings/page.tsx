'use client';

import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  Clock, 
  Save, 
  Download, 
  Upload, 
  Shield, 
  RefreshCw,
  Database,
  Sliders,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [systemConfig, setSystemConfig] = useState<any>({
    appName: 'ระบบติดตามขออนุมัติโครงการ',
    appNameEn: 'Project Approval Tracking System',
    defaultPageSize: 10,
    maxFileSize: 10485760,
    currentFiscalYear: 2569,
  });

  const [slaSettings, setSlaSettings] = useState<any[]>([
    { workflowStep: 'DOCUMENT_CHECK', durationDays: 3, warningDays: 1 },
    { workflowStep: 'UNDER_REVIEW', durationDays: 5, warningDays: 2 },
    { workflowStep: 'PENDING_APPROVAL', durationDays: 3, warningDays: 1 },
  ]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      if (res.ok) {
        const json = await res.json();
        if (json.data?.system) setSystemConfig(json.data.system);
        if (json.data?.sla?.length) setSlaSettings(json.data.sla);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemConfig,
          sla: slaSettings,
        }),
      });
      if (!res.ok) throw new Error('ไม่สามารถบันทึกการตั้งค่าได้');
      toast.success('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSlaChange = (index: number, field: string, value: number) => {
    const next = [...slaSettings];
    next[index] = { ...next[index], [field]: Number(value) };
    setSlaSettings(next);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-[var(--surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-card)] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent-muted)] text-[var(--accent)] flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <h1 className="text-page-title text-[var(--foreground)] tracking-tight">ตั้งค่าระบบ (System Settings)</h1>
          </div>
          <p className="text-[13px] text-[var(--foreground-muted)] mt-1.5">
            กำหนดค่าพารามิเตอร์ทั่วไปในระบบ เกณฑ์ระยะเวลาพิจารณา (SLA) และการสำรองข้อมูล
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* System Config Card */}
        <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] border border-[var(--border)] p-6 shadow-[var(--shadow-card)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-muted)]">
            <Sliders className="w-4 h-4 text-[var(--accent)]" />
            <h2 className="text-[15px] font-semibold text-[var(--foreground)]">
              ข้อมูลพื้นฐานระบบ (General Information)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[var(--foreground)] mb-1.5">ชื่อระบบ (ภาษาไทย)</label>
              <input
                type="text"
                value={systemConfig.appName || ''}
                onChange={(e) => setSystemConfig({ ...systemConfig, appName: e.target.value })}
                className="w-full p-2.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--foreground)] mb-1.5">ชื่อระบบ (ภาษาอังกฤษ)</label>
              <input
                type="text"
                value={systemConfig.appNameEn || ''}
                onChange={(e) => setSystemConfig({ ...systemConfig, appNameEn: e.target.value })}
                className="w-full p-2.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--foreground)] mb-1.5">ปีงบประมาณปัจจุบัน</label>
              <input
                type="number"
                value={systemConfig.currentFiscalYear || 2569}
                onChange={(e) => setSystemConfig({ ...systemConfig, currentFiscalYear: Number(e.target.value) })}
                className="w-full p-2.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--foreground)] mb-1.5">จำนวนแถวที่แสดงต่อหน้า (Default)</label>
              <input
                type="number"
                value={systemConfig.defaultPageSize || 10}
                onChange={(e) => setSystemConfig({ ...systemConfig, defaultPageSize: Number(e.target.value) })}
                className="w-full p-2.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)]"
              />
            </div>
          </div>
        </div>

        {/* SLA Config Card */}
        <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] border border-[var(--border)] p-6 shadow-[var(--shadow-card)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-muted)]">
            <Clock className="w-4 h-4 text-[var(--accent)]" />
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--foreground)]">เกณฑ์ระยะเวลาการพิจารณา (SLA Thresholds)</h2>
              <p className="text-[11px] text-[var(--foreground-muted)]">
                กำหนดระยะเวลาสูงสุดที่อนุญาตในแต่ละขั้นตอนก่อนถือว่าเกินกำหนด (Overdue)
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {slaSettings.map((sla, idx) => (
              <div 
                key={sla.workflowStep} 
                className="p-4 bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs"
              >
                <div className="font-semibold text-[var(--foreground)]">
                  {sla.workflowStep === 'DOCUMENT_CHECK'
                    ? '1. ตรวจสอบเอกสาร (Document Check)'
                    : sla.workflowStep === 'UNDER_REVIEW'
                    ? '2. การพิจารณากลั่นกรอง (Under Review)'
                    : '3. การพิจารณาอนุมัติ (Pending Approval)'}
                </div>

                <div>
                  <label className="block text-[var(--foreground-muted)] text-[11px] mb-1">ระยะเวลาสูงสุด (วันทำการ)</label>
                  <input
                    type="number"
                    min={1}
                    value={sla.durationDays}
                    onChange={(e) => handleSlaChange(idx, 'durationDays', Number(e.target.value))}
                    className="w-full p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] outline-none focus:border-[var(--accent)] font-semibold text-[var(--foreground)] tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-[var(--foreground-muted)] text-[11px] mb-1">แจ้งเตือนล่วงหน้า (วัน)</label>
                  <input
                    type="number"
                    min={1}
                    value={sla.warningDays}
                    onChange={(e) => handleSlaChange(idx, 'warningDays', Number(e.target.value))}
                    className="w-full p-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] outline-none focus:border-[var(--accent)] text-[var(--foreground)] tabular-nums"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Backup and Storage Card */}
        <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] border border-[var(--border)] p-6 shadow-[var(--shadow-card)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-muted)]">
            <Database className="w-4 h-4 text-[var(--accent)]" />
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--foreground)]">สำรองและถ่ายโอนข้อมูล (Backup & Export)</h2>
              <p className="text-[11px] text-[var(--foreground-muted)]">
                ส่งออกข้อมูลทั้งหมดในระบบเป็นไฟล์ JSON เพื่อสำรองหรือกู้คืน
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/api/backup/export"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[var(--foreground)] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] hover:bg-[var(--surface-muted)] transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 text-[var(--accent)]" />
              <span>ดาวน์โหลดไฟล์สำรองข้อมูล (JSON Backup)</span>
            </a>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-[var(--radius-md)] shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าทั้งหมด'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
