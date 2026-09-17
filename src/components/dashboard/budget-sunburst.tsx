'use client';

import { cn } from '@/lib/utils';
import { formatBudgetFull } from '@/lib/utils/format';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export interface BudgetSunburstProps {
  orgData: Array<{ name: string; fullName: string; budget: number; projectsCount: number }>;
  totalBudget: number;
  budgetUtilization: number;
  committedBudget: number;
  onSelectOrg?: (orgName: string) => void;
}

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#94a3b8'];

export function BudgetSunburst({
  orgData,
  totalBudget,
  budgetUtilization,
  committedBudget,
  onSelectOrg,
}: BudgetSunburstProps) {
  const topOrgs = [...orgData].sort((a, b) => b.budget - a.budget).slice(0, 5);
  const committedPercentage = totalBudget > 0 ? (committedBudget / totalBudget) * 100 : 0;

  return (
    <div className="workspace-panel flex flex-col p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-[var(--foreground)]">
          การกระจายงบประมาณ (Budget Distribution)
        </h3>
        {onSelectOrg && (
          <button
            type="button"
            onClick={() => onSelectOrg('ALL')}
            className="text-[12px] font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] hover:underline cursor-pointer"
          >
            เจาะลึกงบประมาณ →
          </button>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-[200px]">
        {/* Donut Chart */}
        <div 
          onClick={() => onSelectOrg?.('ALL')}
          className={cn(
            "relative w-full md:w-1/2 h-[200px] flex items-center justify-center transition-transform",
            onSelectOrg && "cursor-pointer hover:scale-102"
          )}
          title="คลิกเพื่อดูการจัดสรรงบประมาณทั้งหมด"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={orgData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="budget"
                stroke="none"
              >
                {orgData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    onClick={(e) => {
                      e?.stopPropagation?.();
                      onSelectOrg?.(entry.name);
                    }}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${formatBudgetFull(value)} บาท`, 'งบประมาณ']}
                contentStyle={{ 
                  backgroundColor: 'var(--surface)', 
                  borderColor: 'var(--border)',
                  fontSize: '11px',
                  borderRadius: 'var(--radius-sm)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold tabular-nums text-[var(--accent)]">
              {budgetUtilization}%
            </span>
            <span className="text-[11px] text-[var(--foreground-muted)]">
              งบฯ อนุมัติ
            </span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="w-full md:w-1/2 flex flex-col justify-center gap-2">
          {topOrgs.map((org, index) => (
            <div 
              key={index} 
              onClick={() => onSelectOrg?.(org.name)}
              className={cn(
                "flex items-center gap-2 text-[13px] p-1.5 rounded-lg transition-colors group",
                onSelectOrg && "cursor-pointer hover:bg-[var(--surface-muted)]"
              )}
              title={`คลิกเพื่อเจาะลึกโครงการของ ${org.fullName}`}
            >
              <div 
                className="w-2.5 h-2.5 rounded-full shrink-0" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex-1 truncate text-[var(--foreground)] group-hover:text-[var(--primary)] font-medium" title={org.fullName}>
                {org.name}
              </div>
              <div className="flex flex-col items-end">
                <span className="tabular-nums font-medium">
                  {formatBudgetFull(org.budget)}
                </span>
                <span className="text-[11px] text-[var(--foreground-muted)] group-hover:text-[var(--accent)] flex items-center gap-0.5">
                  <span>{org.projectsCount} โครงการ</span>
                  <span className="opacity-0 group-hover:opacity-100 text-[10px]">↗</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom Progress Bar */}
      <div 
        onClick={() => onSelectOrg?.('ALL')}
        className={cn(
          "mt-4 pt-4 border-t border-[var(--border-muted)] transition-opacity",
          onSelectOrg && "cursor-pointer hover:opacity-90"
        )}
      >
        <div className="flex justify-between text-[11px] mb-1">
          <span className="text-[var(--foreground-muted)]">งบผูกพัน (Committed Budget)</span>
          <span className="tabular-nums font-medium">
            {formatBudgetFull(committedBudget)} / {formatBudgetFull(totalBudget)}
          </span>
        </div>
        <div className="w-full h-1.5 bg-[var(--surface-muted)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--accent)] rounded-full"
            style={{ width: `${Math.min(committedPercentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
