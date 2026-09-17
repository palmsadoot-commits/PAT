'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  ListTodo,
  Settings, 
  ScrollText, 
  PlusCircle,
  Search,
  Command,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

type CommandItem = {
  id: string;
  name: string;
  icon: React.ElementType;
  path: string;
  section: 'นำทาง' | 'การดำเนินการ';
};

const COMMANDS: CommandItem[] = [
  { id: 'dashboard', name: 'แดชบอร์ด', icon: LayoutDashboard, path: '/dashboard', section: 'นำทาง' },
  { id: 'projects', name: 'โครงการทั้งหมด', icon: FolderKanban, path: '/projects', section: 'นำทาง' },
  { id: 'my-tasks', name: 'งานของฉัน', icon: ListTodo, path: '/my-tasks', section: 'นำทาง' },
  { id: 'workload', name: 'ภาระงานและทรัพยากร', icon: Users2, path: '/workload', section: 'นำทาง' },
  { id: 'governance', name: 'กำกับดูแล DPM (ต้นน้ำ-ปลายน้ำ)', icon: ShieldCheck, path: '/governance', section: 'นำทาง' },
  { id: 'review', name: 'คิวตรวจสอบ', icon: ClipboardCheck, path: '/review', section: 'นำทาง' },
  { id: 'approval', name: 'คิวอนุมัติ', icon: CheckCircle2, path: '/approval', section: 'นำทาง' },
  { id: 'documents', name: 'เอกสาร', icon: FileText, path: '/documents', section: 'นำทาง' },
  { id: 'reports', name: 'รายงาน', icon: BarChart3, path: '/reports', section: 'นำทาง' },
  { id: 'notifications', name: 'การแจ้งเตือน', icon: Bell, path: '/notifications', section: 'นำทาง' },
  { id: 'users', name: 'ผู้ใช้งาน', icon: Users, path: '/users', section: 'นำทาง' },
  { id: 'settings', name: 'ตั้งค่า', icon: Settings, path: '/settings', section: 'นำทาง' },
  { id: 'audit-logs', name: 'ประวัติระบบ', icon: ScrollText, path: '/audit-logs', section: 'นำทาง' },
  { id: 'new-project', name: 'สร้างโครงการใหม่', icon: PlusCircle, path: '/projects/new', section: 'การดำเนินการ' },
];

export function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filteredCommands = COMMANDS.filter(cmd => 
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

  const sections = ['นำทาง', 'การดำเนินการ'] as const;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        router.push(filteredCommands[selectedIndex].path);
        onClose();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, router, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg bg-white rounded-[var(--radius-xl)] shadow-overlay overflow-hidden mx-4 flex flex-col max-h-[70vh]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
          <Search className="w-5 h-5 text-[var(--foreground-muted)]" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent outline-none text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] text-sm"
            placeholder="ค้นหาหรือพิมพ์คำสั่ง..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-1 text-[11px] text-[var(--foreground-subtle)] font-medium border border-[var(--border-muted)] px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--surface-muted)]">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[50vh] p-2 flex-1">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-sm text-[var(--foreground-muted)]">
              ไม่พบผลลัพธ์
            </div>
          ) : (
            sections.map(section => {
              const sectionItems = filteredCommands.filter(cmd => cmd.section === section);
              if (sectionItems.length === 0) return null;

              return (
                <div key={section} className="mb-4 last:mb-0">
                  <div className="px-3 mb-1 text-[11px] font-medium text-[var(--foreground-subtle)] uppercase tracking-wider">
                    {section}
                  </div>
                  {sectionItems.map((cmd) => {
                    const globalIndex = filteredCommands.findIndex(c => c.id === cmd.id);
                    const isSelected = selectedIndex === globalIndex;
                    
                    return (
                      <div
                        key={cmd.id}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] cursor-pointer text-sm transition-colors",
                          isSelected 
                            ? "bg-[var(--accent-muted)] text-[var(--accent)]" 
                            : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                        )}
                        onClick={() => {
                          router.push(cmd.path);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <cmd.icon className={cn("w-[18px] h-[18px]", isSelected ? "text-[var(--accent)]" : "text-[var(--foreground-muted)]")} />
                        <span>{cmd.name}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
