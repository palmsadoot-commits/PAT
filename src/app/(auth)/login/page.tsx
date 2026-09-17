'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FolderKanban, ShieldCheck, ArrowRight, Lock, User, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemoUser {
  username: string;
  name: string;
  role: string;
  badge: string;
}

const DEMO_ACCOUNTS: DemoUser[] = [
  { username: 'admin', name: 'สมชาย รักชาติ (ผอ.ศูนย์ไอซีที)', role: 'SUPER_ADMIN', badge: 'ผู้ดูแลสูงสุด' },
  { username: 'somchai', name: 'สมศักดิ์ สว่างวงศ์ (ผอ.กลุ่มแรงงานนอกระบบ)', role: 'PROJECT_OWNER', badge: 'ผู้ยื่นโครงการ' },
  { username: 'reviewer1', name: 'สุชาติ ประเสริฐ (กรรมการกลั่นกรอง)', role: 'REVIEWER', badge: 'ผู้ตรวจสอบ' },
  { username: 'approver1', name: 'กิตติ ยิ่งใหญ่ (รองปลัดฯ / CIO)', role: 'APPROVER', badge: 'ผู้อนุมัติ' },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }

      toast.success('เข้าสู่ระบบสำเร็จ');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      toast.error('เข้าสู่ระบบไม่สำเร็จ', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const selectDemoAccount = (account: DemoUser) => {
    setUsername(account.username);
    setPassword('password123');
    setSelectedDemo(account.username);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--background)] px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

      <div className="relative w-full max-w-[440px] space-y-6">
        {/* Brand identity */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[var(--radius-xl)] bg-[var(--primary)] text-white shadow-md mb-2">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            ระบบติดตามขออนุมัติโครงการ
          </h1>
          <p className="text-[13px] text-[var(--foreground-muted)] max-w-sm mx-auto">
            แพลตฟอร์มบริหารและติดตามกระบวนการขออนุมัติโครงการดิจิทัลภาครัฐ
          </p>
        </div>

        {/* Login card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-7 shadow-[var(--shadow-card)] space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 rounded-[var(--radius-md)] text-xs border border-red-200 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--foreground)]">
                ชื่อผู้ใช้งาน
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[var(--foreground-subtle)] absolute left-3 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setSelectedDemo(null);
                  }}
                  placeholder="เช่น admin, somchai"
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none transition-all text-[var(--foreground)]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--foreground)]">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--foreground-subtle)] absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setSelectedDemo(null);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none transition-all text-[var(--foreground)]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-[var(--radius-md)] font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Selector */}
          <div className="pt-5 border-t border-[var(--border-muted)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                บัญชีทดสอบด่วน (คลิกเพื่อเลือก)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = selectedDemo === acc.username;
                return (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => selectDemoAccount(acc)}
                    className={cn(
                      'text-left p-2.5 rounded-[var(--radius-md)] border text-xs transition-all cursor-pointer flex flex-col justify-between relative',
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--accent-muted)] ring-1 ring-[var(--accent)]'
                        : 'border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)]'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[var(--foreground)] truncate">{acc.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-[var(--accent)] flex-shrink-0" />}
                    </div>
                    <span className="text-[10px] text-[var(--foreground-muted)] mt-0.5">{acc.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--foreground-subtle)]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>ระบบปลอดภัยด้วยการเข้ารหัสข้อมูลและสิทธิ์การเข้าถึง RBAC</span>
        </div>
      </div>
    </div>
  );
}
