'use client';

import { cn } from '@/lib/utils';
import { formatBudgetFull } from '@/lib/utils/format';
import { 
  FolderKanban, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Wallet, 
  GitPullRequestDraft 
} from 'lucide-react';

export interface ExecutiveKPIStripProps {
  totalProjects: number;
  totalBudget: number;
  approvalRate: number;        
  averageApprovalDays: number; 
  highRiskCount: number;
  budgetUtilization: number;   
  pendingCCBCount: number;
  onDrillDownProjects?: () => void;
  onDrillDownApproval?: () => void;
  onDrillDownSLA?: () => void;
  onDrillDownRisk?: () => void;
  onDrillDownBudget?: () => void;
  onDrillDownCCB?: () => void;
}

export function ExecutiveKPIStrip({
  totalProjects,
  totalBudget,
  approvalRate,
  averageApprovalDays,
  highRiskCount,
  budgetUtilization,
  pendingCCBCount,
  onDrillDownProjects,
  onDrillDownApproval,
  onDrillDownSLA,
  onDrillDownRisk,
  onDrillDownBudget,
  onDrillDownCCB,
}: ExecutiveKPIStripProps) {
  const cards = [
    {
      id: 'projects',
      label: 'โครงการทั้งหมด (Total Projects)',
      value: totalProjects,
      suffix: ' โครงการ',
      detail: `งบประมาณรวม ${formatBudgetFull(totalBudget)} บาท`,
      icon: FolderKanban,
      color: 'bg-[var(--foreground-muted)]',
      textClass: 'text-[var(--foreground)]',
      onClick: onDrillDownProjects,
    },
    {
      id: 'approval',
      label: 'อัตราการอนุมัติ (Approval Rate)',
      value: approvalRate,
      suffix: '%',
      detail: approvalRate >= 80 ? 'อยู่ในเกณฑ์ดี' : 'ต่ำกว่าเกณฑ์',
      icon: TrendingUp,
      color: approvalRate >= 80 ? 'bg-[var(--success)]' : 'bg-[var(--warning)]',
      textClass: approvalRate >= 80 ? 'text-[var(--success)]' : 'text-[var(--warning)]',
      onClick: onDrillDownApproval,
    },
    {
      id: 'sla',
      label: 'เวลาเฉลี่ยอนุมัติ (Avg Approval)',
      value: averageApprovalDays,
      suffix: ' วัน',
      detail: averageApprovalDays > 5 ? 'ล่าช้ากว่ากำหนด' : 'ตามกำหนดเวลา',
      icon: Clock,
      color: averageApprovalDays > 5 ? 'bg-[var(--warning)]' : 'bg-[var(--success)]',
      textClass: averageApprovalDays > 5 ? 'text-[var(--warning)]' : 'text-[var(--success)]',
      onClick: onDrillDownSLA,
    },
    {
      id: 'risk',
      label: 'โครงการเสี่ยงสูง (High Risk)',
      value: highRiskCount,
      suffix: ' รายการ',
      detail: highRiskCount > 0 ? 'ต้องติดตามใกล้ชิด' : 'ปกติ',
      icon: AlertTriangle,
      color: highRiskCount > 0 ? 'bg-[var(--danger)]' : 'bg-[var(--foreground-muted)]',
      textClass: highRiskCount > 0 ? 'text-[var(--danger)]' : 'text-[var(--foreground)]',
      onClick: onDrillDownRisk,
    },
    {
      id: 'budget',
      label: 'การเบิกจ่ายงบ (Budget Util)',
      value: budgetUtilization,
      suffix: '%',
      detail: 'ของงบประมาณที่อนุมัติแล้ว',
      icon: Wallet,
      color: 'bg-[var(--accent)]',
      textClass: 'text-[var(--accent)]',
      onClick: onDrillDownBudget,
    },
    {
      id: 'ccb',
      label: 'รอการพิจารณา CCB (Pending CCB)',
      value: pendingCCBCount,
      suffix: ' รายการ',
      detail: pendingCCBCount > 0 ? 'รอดำเนินการ' : 'ไม่มีรายการค้าง',
      icon: GitPullRequestDraft,
      color: pendingCCBCount > 0 ? 'bg-[var(--warning)]' : 'bg-[var(--foreground-muted)]',
      textClass: pendingCCBCount > 0 ? 'text-[var(--warning)]' : 'text-[var(--foreground)]',
      onClick: onDrillDownCCB,
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div 
          key={card.id} 
          onClick={card.onClick}
          className={cn(
            "workspace-panel relative overflow-hidden rounded-[var(--radius-md)] flex flex-col p-3 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-md)] transition-all group",
            card.onClick && "cursor-pointer hover:border-[var(--primary)] hover:shadow-lg hover:-translate-y-0.5"
          )}
          title={`คลิกเพื่อเจาะลึก ${card.label}`}
        >
          {/* Top accent bar */}
          <div className={cn("absolute top-0 left-0 right-0 h-[3px]", card.color)} />
          
          <div className="flex justify-between items-start mb-1">
            <span className="text-[11px] text-[var(--foreground-muted)] font-medium uppercase tracking-wider line-clamp-1">
              {card.label}
            </span>
            <card.icon className={cn("w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity", card.textClass)} />
          </div>
          
          <div className="flex items-baseline gap-1 my-1">
            <span className={cn("text-2xl font-bold tabular-nums", card.textClass)}>
              {card.value}
            </span>
            <span className="text-[11px] text-[var(--foreground-subtle)]">
              {card.suffix}
            </span>
          </div>
          
          <div className="mt-auto flex items-center justify-between text-[11px] text-[var(--foreground-subtle)]">
            <span className="truncate">{card.detail}</span>
            {card.onClick && (
              <span className="opacity-0 group-hover:opacity-100 text-[10px] font-semibold text-[var(--accent)] transition-opacity shrink-0 ml-1">
                เจาะลึก ↗
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
