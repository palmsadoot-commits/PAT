'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderKanban, 
  ClipboardCheck, 
  CheckCircle2, 
  FileText, 
  BarChart3, 
  Bell, 
  Users, 
  Users2,
  Settings, 
  ScrollText,
  ListTodo,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  userRole: string;
  userName?: string;
  userEmail?: string;
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: any;
  badge?: boolean;
  roles?: string[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'หลัก',
    items: [
      { name: 'แดชบอร์ด', path: '/dashboard', icon: LayoutDashboard },
      { name: 'โครงการทั้งหมด', path: '/projects', icon: FolderKanban },
      { name: 'งานของฉัน', path: '/my-tasks', icon: ListTodo, badge: true },
    ],
  },
  {
    label: 'กระบวนการ',
    items: [
      { name: 'คิวตรวจสอบ', path: '/review', icon: ClipboardCheck, roles: ['SUPER_ADMIN', 'ADMIN', 'REVIEWER', 'OFFICER'] },
      { name: 'คิวอนุมัติ', path: '/approval', icon: CheckCircle2, roles: ['SUPER_ADMIN', 'ADMIN', 'APPROVER', 'EXECUTIVE'] },
      { name: 'ภาระงานและทรัพยากร', path: '/workload', icon: Users2 },
      { name: 'กำกับดูแล DPM', path: '/governance', icon: ShieldCheck },
    ],
  },
  {
    label: 'ข้อมูล',
    items: [
      { name: 'เอกสาร', path: '/documents', icon: FileText },
      { name: 'รายงาน', path: '/reports', icon: BarChart3 },
    ],
  },
  {
    label: 'ระบบ',
    items: [
      { name: 'การแจ้งเตือน', path: '/notifications', icon: Bell },
      { name: 'ผู้ใช้งาน', path: '/users', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { name: 'ตั้งค่า', path: '/settings', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { name: 'ประวัติระบบ', path: '/audit-logs', icon: ScrollText, roles: ['SUPER_ADMIN', 'ADMIN', 'EXECUTIVE'] },
    ],
  },
];

export function AppSidebar({ userRole, userName = 'User', userEmail, isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const toggleMobileNavigation = () => setIsMobileOpen((open) => !open);
    window.addEventListener('pat:toggle-navigation', toggleMobileNavigation);
    return () => window.removeEventListener('pat:toggle-navigation', toggleMobileNavigation);
  }, []);

  const canAccess = (roles?: string[]) => {
    if (!roles) return true;
    return roles.includes(userRole);
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[#0b2436] text-white">
      {/* Header Area */}
      <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-4">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden whitespace-nowrap group">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-[#1b829b] to-[#0a5669] text-white shadow-md ring-1 ring-white/20 transition-transform group-hover:scale-105">
            <span className="font-mono text-xs font-black tracking-tighter">PAT</span>
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex flex-col animate-in fade-in duration-300">
              <span className="text-[13px] font-bold leading-tight tracking-wider text-white">PAT WORKSPACE</span>
              <span className="text-[10px] font-medium text-slate-300">ระบบติดตามขออนุมัติโครงการ</span>
            </div>
          )}
        </Link>
        <button 
          className="ml-auto rounded-[var(--radius-sm)] p-1 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-label="ปิดเมนู"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin" aria-label="เมนูหลัก">
        {NAV_SECTIONS.map((section, idx) => {
          const visibleItems = section.items.filter(item => canAccess(item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="mb-4 px-3">
              {(!isCollapsed || isMobileOpen) && (
                <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  {section.label}
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      title={isCollapsed && !isMobileOpen ? item.name : undefined}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "group relative flex h-9 items-center gap-3 rounded-[var(--radius-md)] px-3 py-1.5 transition-all text-[13px]",
                        isActive 
                          ? "bg-white/15 font-bold text-white shadow-xs" 
                          : "font-medium text-slate-300 hover:bg-white/8 hover:text-white"
                      )}
                    >
                      {isActive && (
                        <div className="absolute bottom-1.5 left-0 top-1.5 w-[3px] rounded-r-full bg-[#52d1c8]" />
                      )}
                      <item.icon className={cn(
                        "w-[17px] h-[17px] shrink-0 transition-colors",
                        isActive ? "text-[#52d1c8]" : "text-slate-400 group-hover:text-slate-200"
                      )} />
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom Area */}
      <div className="shrink-0 border-t border-white/10 p-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-[#72e1d9]">
            {getInitial(userName)}
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex flex-col truncate">
              <span className="truncate text-[13px] font-medium text-white">{userName}</span>
              <span className="truncate text-[11px] text-slate-400">{userRole}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[#081d2a]/60 backdrop-blur-[1px] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={cn(
          "fixed top-0 left-0 h-screen z-50 transition-all duration-300 lg:translate-x-0",
          isMobileOpen ? "w-[17.5rem] translate-x-0" : "-translate-x-full lg:translate-x-0",
          !isMobileOpen && isCollapsed ? "lg:w-[var(--sidebar-collapsed-width,68px)]" : "lg:w-[var(--sidebar-width,272px)]"
        )}
      >
        <SidebarContent />

        {/* Desktop Collapse Toggle */}
        <button
          className="absolute -right-3 top-16 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--foreground-muted)] shadow-sm transition-transform hover:text-[var(--foreground)] lg:flex"
          onClick={onToggle}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>
    </>
  );
}
