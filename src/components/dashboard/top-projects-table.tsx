'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatBudgetFull } from '@/lib/utils/format'

interface TopProjectsTableProps {
  projects: Array<{
    id: string;
    projectNo: string;
    projectName: string;
    organizationName: string;
    budget: number;
    status: string;
    priority: string;
    dpmPhase: string;
  }>;
}

const statusMap: Record<string, { label: string; colorClass: string }> = {
  DRAFT: { label: 'ร่าง', colorClass: 'bg-[var(--foreground-muted)]' },
  SUBMITTED: { label: 'ยื่นเสนอ', colorClass: 'bg-blue-500' },
  DOCUMENT_CHECK: { label: 'ตรวจเอกสาร', colorClass: 'bg-indigo-500' },
  UNDER_REVIEW: { label: 'พิจารณา', colorClass: 'bg-purple-500' },
  PENDING_APPROVAL: { label: 'รออนุมัติ', colorClass: 'bg-amber-500' },
  APPROVED: { label: 'อนุมัติ', colorClass: 'bg-[var(--success)]' },
  REJECTED: { label: 'ไม่อนุมัติ', colorClass: 'bg-[var(--danger)]' },
  IN_PROGRESS: { label: 'ดำเนินการ', colorClass: 'bg-[var(--accent)]' },
  COMPLETED: { label: 'เสร็จสิ้น', colorClass: 'bg-[var(--success)]' },
  RETURNED: { label: 'ตีกลับ', colorClass: 'bg-rose-500' },
  CANCELLED: { label: 'ยกเลิก', colorClass: 'bg-[var(--foreground-muted)]' }
};

const dpmPhaseMap: Record<string, { label: string; colorClass: string }> = {
  UPSTREAM: { label: 'ต้นน้ำ', colorClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  MIDSTREAM: { label: 'กลางน้ำ', colorClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  DOWNSTREAM: { label: 'ปลายน้ำ', colorClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' }
};

const priorityColor: Record<string, string> = {
  HIGH: 'bg-[var(--danger)]',
  MEDIUM: 'bg-[var(--warning)]',
  LOW: 'bg-[var(--success)]'
};

export function TopProjectsTable({ projects }: TopProjectsTableProps) {
  const topProjects = projects.slice(0, 5);

  return (
    <div className="workspace-panel flex flex-col p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[15px] font-semibold text-[var(--foreground)]">
          โครงการงบประมาณสูง (Top Projects by Budget)
        </h3>
        <Link 
          href="/projects" 
          className="text-[13px] text-[var(--accent)] hover:underline"
        >
          ดูทั้งหมด &rarr;
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-muted)] text-[var(--foreground-muted)] text-[11px] uppercase tracking-wider">
              <th className="py-2 px-3 font-medium w-8 text-center">#</th>
              <th className="py-2 px-3 font-medium">ชื่อโครงการ</th>
              <th className="py-2 px-3 font-medium text-right">งบประมาณ</th>
              <th className="py-2 px-3 font-medium text-center">สถานะ</th>
              <th className="py-2 px-3 font-medium text-center">DPM Phase</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-muted)]">
            {topProjects.map((project, index) => {
              const statusInfo = statusMap[project.status] || { label: project.status, colorClass: 'bg-gray-500' };
              const dpmInfo = dpmPhaseMap[project.dpmPhase] || { label: project.dpmPhase, colorClass: 'bg-gray-100 text-gray-700' };
              const pColor = priorityColor[project.priority] || 'bg-gray-400';

              return (
                <tr 
                  key={project.id} 
                  className="group hover:bg-[var(--surface-muted)] transition-colors relative"
                >
                  <td className="py-2 px-3 text-center text-[var(--foreground-muted)] tabular-nums">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full", pColor)} />
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-2 px-3 max-w-[200px]">
                    <Link href={`/projects/${project.id}`} className="block">
                      <div className="truncate font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                        {project.projectName}
                      </div>
                      <div className="text-[11px] text-[var(--foreground-muted)] font-mono mt-0.5 truncate">
                        {project.projectNo} • {project.organizationName}
                      </div>
                    </Link>
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-[var(--foreground)]">
                    {formatBudgetFull(project.budget)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="inline-flex items-center gap-1.5 text-[11px]">
                      <div className={cn("w-2 h-2 rounded-full", statusInfo.colorClass)} />
                      <span className="text-[var(--foreground-subtle)]">{statusInfo.label}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap",
                      dpmInfo.colorClass
                    )}>
                      {dpmInfo.label}
                    </span>
                  </td>
                </tr>
              )
            })}
            {topProjects.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[var(--foreground-muted)]">
                  ไม่พบข้อมูลโครงการ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
