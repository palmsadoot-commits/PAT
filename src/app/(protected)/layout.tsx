'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { CommandMenu } from '@/components/layout/command-menu';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);

  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('pat-sidebar-collapsed');
    if (stored !== null) {
      setIsCollapsed(stored === 'true');
    }
  }, []);

  // Save sidebar collapsed state
  const handleToggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('pat-sidebar-collapsed', String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) throw new Error('Not authenticated');
        const data = await res.json();
        setUser(data.data);

        // Fetch unread notifications count
        try {
          const notifRes = await fetch('/api/notifications');
          if (notifRes.ok) {
            const notifData = await notifRes.json();
            const unread = (notifData.data || []).filter((n: any) => !n.isRead).length;
            setNotificationCount(unread);
          }
        } catch {
          // Ignore notification error
        }
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, [router, pathname]);

  // Global keyboard shortcut for command menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandMenuOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] gap-3">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[13px] text-[var(--foreground-muted)]">กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...</p>
      </div>
    );
  }

  if (!user) return null;

  const userSession = {
    name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
    role: user.role,
    email: user.email || `${user.username}@mol.go.th`,
    username: user.username,
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Sidebar */}
      <AppSidebar
        userRole={user.role}
        userName={userSession.name}
        userEmail={userSession.email}
        isCollapsed={isCollapsed}
        onToggle={handleToggleSidebar}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-[var(--ease-default)] ${
          isCollapsed ? 'lg:pl-[68px]' : 'lg:pl-[272px]'
        }`}
      >
        <AppHeader
          userSession={userSession}
          notificationCount={notificationCount}
          onMenuToggle={handleToggleSidebar}
          onCommandMenuOpen={() => setIsCommandMenuOpen(true)}
        />

        <main className="flex-1 w-full max-w-[1520px] mx-auto px-4 py-5 md:px-6 md:py-7 lg:px-8 lg:py-8">
          <div className="animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>

      {/* Command Menu */}
      <CommandMenu
        isOpen={isCommandMenuOpen}
        onClose={() => setIsCommandMenuOpen(false)}
      />
    </div>
  );
}
