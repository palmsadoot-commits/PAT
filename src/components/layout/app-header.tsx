'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Menu, Search, Command, LogOut, Settings, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Breadcrumb } from './breadcrumb';

interface AppHeaderProps {
  userSession: {
    name: string;
    role: string;
    email: string;
    username?: string;
  };
  notificationCount: number;
  onMenuToggle: () => void;
  onCommandMenuOpen: () => void;
}

export function AppHeader({ userSession, notificationCount, onMenuToggle, onCommandMenuOpen }: AppHeaderProps) {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      setIsUserDropdownOpen(false);
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-[var(--header-height)] items-center justify-between gap-4 border-b border-[var(--border)] bg-white/95 px-4 backdrop-blur-md md:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-3 min-w-0">
        <button 
          className="-ml-1.5 rounded-[var(--radius-sm)] p-2 text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] lg:hidden"
          onClick={onMenuToggle}
          aria-label="เปิดเมนูหลัก"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block overflow-hidden">
          <Breadcrumb />
        </div>
      </div>

      {/* Center Section: Search Bar */}
      <div className="hidden flex-1 justify-center md:flex">
        <button
          onClick={onCommandMenuOpen}
          className="group flex w-full max-w-[340px] items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-muted)] bg-[var(--surface-inset)] px-3.5 py-1.5 text-left transition-all hover:border-[var(--border-active)] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <Search className="w-4 h-4 text-[var(--foreground-subtle)] transition-colors group-hover:text-[var(--accent)]" />
          <span className="flex-1 text-[13px] text-[var(--foreground-muted)]">ค้นหาโครงการ, เลขที่, เอกสาร...</span>
          <div className="flex items-center gap-1 text-[10px] text-[var(--foreground-subtle)] font-mono font-semibold border border-[var(--border)] px-1.5 py-0.5 rounded-[var(--radius-xs)] bg-white shadow-xs">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right Section */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        {/* Mobile Search Trigger */}
        <button
          onClick={onCommandMenuOpen}
          aria-label="ค้นหา"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] md:hidden"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Fiscal Year Pill */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-[var(--border-muted)] bg-[var(--surface-inset)] px-2.5 py-1 text-[11px] font-semibold text-[var(--foreground-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          <span>ปีงบประมาณ 2569</span>
        </div>

        {/* Notification Bell */}
        <Link 
          href="/notifications" 
          aria-label="เปิดการแจ้งเตือน" 
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--foreground-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
        >
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--danger)]" />
            </span>
          )}
        </Link>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2 rounded-full p-0.5 pl-1 pr-1.5 transition-colors hover:bg-[var(--surface-muted)] sm:rounded-[var(--radius-lg)] sm:p-1.5"
            aria-expanded={isUserDropdownOpen}
            aria-label="เมนูผู้ใช้งาน"
          >
            <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
              {getInitial(userSession.name)}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-[12px] font-semibold leading-tight text-[var(--foreground)] truncate max-w-[120px]">
                {userSession.name}
              </p>
              <p className="text-[10px] text-[var(--foreground-subtle)] font-medium">
                {userSession.role}
              </p>
            </div>
          </button>

          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-overlay)] py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3.5 py-2.5 border-b border-[var(--border-muted)] bg-[var(--surface-inset)]">
                <p className="text-[13px] font-bold text-[var(--foreground)] truncate">{userSession.name}</p>
                <p className="text-[11px] text-[var(--foreground-muted)] truncate">{userSession.email}</p>
                <span className="mt-1.5 inline-block text-[10px] font-semibold bg-blue-50 text-[var(--accent)] border border-blue-100 px-2 py-0.5 rounded-full">
                  {userSession.role}
                </span>
              </div>
              <div className="p-1">
                <Link 
                  href="/settings" 
                  className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] rounded-[var(--radius-sm)] transition-colors"
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4 text-[var(--foreground-subtle)]" />
                  <span>ตั้งค่าระบบ</span>
                </Link>
                <Link 
                  href="/audit-logs" 
                  className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] rounded-[var(--radius-sm)] transition-colors"
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  <ScrollText className="w-4 h-4 text-[var(--foreground-subtle)]" />
                  <span>ประวัติระบบ (Audit Logs)</span>
                </Link>
              </div>
              <div className="my-1 border-t border-[var(--border-muted)]" />
              <div className="p-1">
                <button 
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold text-[var(--danger)] hover:bg-red-50 rounded-[var(--radius-sm)] transition-colors text-left"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
