import React from 'react';
import { StatusBadge } from './status-badge';
import { PriorityBadge } from './priority-badge';
import { Building2, UserCircle2, Wallet, Calendar, Edit } from 'lucide-react';
import type { ProjectStatus } from './status-badge';
import type { Priority } from './priority-badge';

interface ProjectHeaderProps {
  project: {
    code: string;
    name: string;
    status: any;
    budget: number;
    organization: string;
    department: string;
    ownerName: string;
    priority: any;
    fiscalYear: string;
  };
  onEdit?: () => void;
  canEdit?: boolean;
}

export function ProjectHeader({ project, onEdit, canEdit = false }: ProjectHeaderProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        
        {/* Title and Badges */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-2.5 py-1 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
              {project.code}
            </span>
            <StatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
            <span className="px-2.5 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">
              ปีงบประมาณ {project.fiscalYear}
            </span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            {project.name}
          </h1>
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="flex-shrink-0">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Edit className="w-4 h-4" />
              แก้ไขโครงการ
            </button>
          </div>
        )}
      </div>

      {/* Meta Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-start gap-3">
          <Wallet className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-500">งบประมาณที่ขอ</p>
            <p className="text-base font-semibold text-gray-900">{formatCurrency(project.budget)}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-500">หน่วยงาน</p>
            <p className="text-base font-medium text-gray-900">{project.organization}</p>
            <p className="text-sm text-gray-500">{project.department}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <UserCircle2 className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-500">ผู้รับผิดชอบโครงการ</p>
            <p className="text-base font-medium text-gray-900">{project.ownerName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
