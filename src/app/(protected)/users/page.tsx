'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Shield, 
  Building2, 
  CheckCircle, 
  XCircle, 
  X,
  Mail,
  User,
  Key
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ROLE_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  SUPER_ADMIN: { label: 'ผู้ดูแลระบบสูงสุด', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  ADMIN: { label: 'ผู้ดูแลระบบ', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  OFFICER: { label: 'เจ้าหน้าที่โครงการ', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
  PROJECT_OWNER: { label: 'เจ้าของโครงการ', color: 'text-stone-700', bg: 'bg-stone-100 border-stone-200' },
  REVIEWER: { label: 'ผู้ตรวจสอบ', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
  APPROVER: { label: 'ผู้อนุมัติ', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  EXECUTIVE: { label: 'ผู้บริหาร', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  VIEWER: { label: 'ผู้ดูข้อมูล', color: 'text-slate-700', bg: 'bg-slate-100 border-slate-200' },
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newUser, setNewUser] = useState({
    username: '',
    password: 'password123',
    fullName: '',
    email: '',
    role: 'OFFICER',
    organizationId: 'ORG-001',
    departmentId: 'DEP-001',
    position: 'เจ้าหน้าที่โครงการ',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'ไม่สามารถสร้างผู้ใช้ได้');

      toast.success('สร้างบัญชีผู้ใช้งานสำเร็จ');
      setIsModalOpen(false);
      setNewUser({
        username: '',
        password: 'password123',
        fullName: '',
        email: '',
        role: 'OFFICER',
        organizationId: 'ORG-001',
        departmentId: 'DEP-001',
        position: 'เจ้าหน้าที่โครงการ',
      });
      fetchUsers();
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.fullName || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q) ||
      (u.organizationName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface)] p-6 rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-card)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent-muted)] text-[var(--accent)] flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="text-page-title text-[var(--foreground)] tracking-tight">จัดการผู้ใช้งานในระบบ (User Management)</h1>
          </div>
          <p className="text-[13px] text-[var(--foreground-muted)] mt-1.5">
            กำหนดสิทธิ์ บทบาทหน้าที่ และสังกัดหน่วยงานของผู้ใช้งานในระบบ ({users.length} บัญชี)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-[var(--radius-md)] shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>เพิ่มผู้ใช้งานใหม่</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-[var(--surface)] p-4 rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-card)]">
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--foreground-subtle)] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="ค้นหาด้วยชื่อผู้ใช้, ชื่อ-นามสกุล, หรือบทบาท..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)]"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-card)] overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-[var(--surface-muted)] rounded-[var(--radius-md)]" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[var(--surface-muted)] text-[var(--foreground-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                  <th className="py-3.5 px-4 font-semibold">ชื่อ-นามสกุล</th>
                  <th className="py-3.5 px-4 font-semibold">ชื่อผู้ใช้ (Username)</th>
                  <th className="py-3.5 px-4 font-semibold">บทบาท (Role)</th>
                  <th className="py-3.5 px-4 font-semibold">หน่วยงาน / กลุ่มงาน</th>
                  <th className="py-3.5 px-4 font-semibold">ตำแหน่ง</th>
                  <th className="py-3.5 px-4 font-semibold text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-muted)]">
                {filteredUsers.map((u) => {
                  const roleBadge = ROLE_BADGES[u.role] || { label: u.role, color: 'text-stone-700', bg: 'bg-stone-100 border-stone-200' };

                  return (
                    <tr key={u.id} className="hover:bg-[var(--surface-muted)] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[var(--foreground)] flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[var(--accent-muted)] text-[var(--accent)] flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {u.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <span>{u.fullName}</span>
                          <span className="text-[10px] text-[var(--foreground-subtle)] block">{u.email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[var(--foreground-muted)]">{u.username}</td>
                      <td className="py-3.5 px-4">
                        <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-semibold border', roleBadge.color, roleBadge.bg)}>
                          {roleBadge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[var(--foreground-muted)]">
                        <div className="font-medium text-[var(--foreground)]">{u.organizationName}</div>
                        <div className="text-[10px] text-[var(--foreground-subtle)]">{u.departmentName}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[var(--foreground-muted)]">{u.position}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium',
                            u.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                          )}
                        >
                          <span className={cn('w-1.5 h-1.5 rounded-full', u.isActive ? 'bg-emerald-500' : 'bg-red-500')} />
                          {u.isActive ? 'เปิดใช้งาน' : 'ระงับ'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] max-w-md w-full p-6 shadow-2xl border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-muted)]">
              <h3 className="text-[15px] font-bold text-[var(--foreground)]">เพิ่มผู้ใช้งานใหม่</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[var(--foreground-subtle)] hover:text-[var(--foreground)] rounded-[var(--radius-sm)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[var(--foreground)] mb-1">ชื่อผู้ใช้ (Username) *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น officer4"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full p-2.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--foreground)] mb-1">รหัสผ่านเริ่มต้น *</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full p-2.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none font-mono text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--foreground)] mb-1">ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายประสิทธิ์ มั่งคั่ง"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  className="w-full p-2.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--foreground)] mb-1">อีเมล</label>
                <input
                  type="email"
                  placeholder="email@mol.go.th"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full p-2.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--foreground)] mb-1">บทบาท (Role) *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full p-2.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)] cursor-pointer"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="OFFICER">OFFICER</option>
                    <option value="PROJECT_OWNER">PROJECT_OWNER</option>
                    <option value="REVIEWER">REVIEWER</option>
                    <option value="APPROVER">APPROVER</option>
                    <option value="EXECUTIVE">EXECUTIVE</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--foreground)] mb-1">ตำแหน่ง</label>
                  <input
                    type="text"
                    value={newUser.position}
                    onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                    className="w-full p-2.5 bg-[var(--surface-muted)] border border-[var(--border)] rounded-[var(--radius-md)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] outline-none text-[var(--foreground)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-muted)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-[var(--foreground-muted)] bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] rounded-[var(--radius-md)] transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 font-semibold text-[var(--primary-foreground)] bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-[var(--radius-md)] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึกผู้ใช้'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
