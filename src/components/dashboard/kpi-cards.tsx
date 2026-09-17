'use client';

import React from 'react';
import { 
  FolderKanban, 
  FileSearch, 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  CheckSquare, 
  ArrowLeftRight, 
  XCircle 
} from 'lucide-react';

interface KPICardsProps {
  stats: {
    total: number;
    documentCheck: number;
    pendingApproval: number;
    approved: number;
    inProgress: number;
    completed: number;
    returned: number;
    rejected: number;
  }
}

export function KPICards({ stats }: KPICardsProps) {
  const cards = [
    { label: 'โครงการทั้งหมด', value: stats.total, icon: FolderKanban, color: 'text-gray-600', bgColor: 'bg-gray-100' },
    { label: 'รอตรวจสอบ', value: stats.documentCheck, icon: FileSearch, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
    { label: 'รออนุมัติ', value: stats.pendingApproval, icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-100' },
    { label: 'อนุมัติแล้ว', value: stats.approved, icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-100' },
    { label: 'กำลังดำเนินการ', value: stats.inProgress, icon: PlayCircle, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
    { label: 'เสร็จสิ้น', value: stats.completed, icon: CheckSquare, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
    { label: 'ตีกลับ', value: stats.returned, icon: ArrowLeftRight, color: 'text-amber-600', bgColor: 'bg-amber-100' },
    { label: 'ไม่อนุมัติ', value: stats.rejected, icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div 
            key={index} 
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</h3>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.bgColor} ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
