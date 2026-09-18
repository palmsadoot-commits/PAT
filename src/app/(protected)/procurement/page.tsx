'use client';

import React, { useEffect, useState } from 'react';
import { 
  Scale, 
  FileEdit, 
  Award, 
  FileCheck, 
  Layers, 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  FolderKanban, 
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { ProcurementGovernanceWorkspace, RtmTraceabilityItem } from '@/types/procurement';
import { ProcurementDashboard } from '@/components/procurement/procurement-dashboard';
import { TorBuilderWorkspace } from '@/components/procurement/tor-builder-workspace';
import { EvaluationBoardWorkspace } from '@/components/procurement/evaluation-board-workspace';
import { AcceptanceWorkspace } from '@/components/procurement/acceptance-workspace';
import { OfficialFormsModal } from '@/components/procurement/official-forms-modal';
import { EvidenceDrawer } from '@/components/procurement/evidence-drawer';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProcurementWorkspacePage() {
  const [workspaces, setWorkspaces] = useState<ProcurementGovernanceWorkspace[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('PRJ-2569-0001');
  const [activeTab, setActiveTab] = useState<'overview' | 'tor' | 'evaluation' | 'acceptance'>('overview');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formModalType, setFormModalType] = useState<'APPOINTMENT_ORDER' | 'CONFLICT_DECLARATION' | 'FORM_BK01' | 'EVALUATION_REPORT' | 'NOTICE_175' | 'ACCEPTANCE_CERTIFICATE'>('FORM_BK01');
  
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [selectedRtmItem, setSelectedRtmItem] = useState<RtmTraceabilityItem | null>(null);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/procurement');
      if (res.ok) {
        const json = await res.json();
        const list = json.data?.workspaces || [];
        setWorkspaces(list);
        if (list.length > 0 && !list.some((w: any) => w.projectId === selectedProjectId)) {
          setSelectedProjectId(list[0].projectId);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error('ไม่สามารถโหลดข้อมูลการจัดซื้อจัดจ้างได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const selectedWorkspace = workspaces.find(w => w.projectId === selectedProjectId) || workspaces[0];

  const handleOpenFormModal = (type: typeof formModalType) => {
    setFormModalType(type);
    setFormModalOpen(true);
  };

  const handleOpenEvidenceDrawer = (item: RtmTraceabilityItem) => {
    setSelectedRtmItem(item);
    setEvidenceDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-xs text-[var(--foreground-muted)]">กำลังโหลด Procurement Governance & Acceptance Workspace...</p>
      </div>
    );
  }

  if (!selectedWorkspace) {
    return (
      <div className="workspace-panel p-12 text-center space-y-3">
        <Scale className="w-12 h-12 text-[var(--foreground-muted)] mx-auto opacity-50" />
        <h2 className="text-base font-bold text-[var(--foreground)]">ไม่พบข้อมูลการจัดซื้อจัดจ้าง</h2>
        <p className="text-xs text-[var(--foreground-muted)]">กรุณาตรวจสอบว่ามีข้อมูลโครงการที่ผ่านการอนุมัติแล้ว</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Project Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight">
                ศูนย์กำกับกระบวนการจัดซื้อจัดจ้างและตรวจรับพัสดุภาครัฐ
              </h1>
              <p className="text-xs text-[var(--foreground-muted)]">
                Procurement Governance & Acceptance Workspace (พ.ร.บ. จัดซื้อจัดจ้างฯ พ.ศ. ๒๕๖๐)
              </p>
            </div>
          </div>
        </div>

        {/* Project Selector Dropdown & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-1.5 shadow-2xs">
            <FolderKanban className="w-4 h-4 text-blue-600 shrink-0" />
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-bold text-[var(--foreground)] focus:outline-hidden cursor-pointer"
            >
              {workspaces.map(w => (
                <option key={w.projectId} value={w.projectId}>
                  [{w.projectNo || w.projectId}] {w.projectNameTh}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchWorkspaces}
            className="w-8 h-8 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center hover:bg-[var(--surface-muted)] cursor-pointer text-[var(--foreground-muted)]"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
            activeTab === 'overview'
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}
        >
          <Layers className="w-4 h-4" />
          <span>ภาพรวมและกำกับเวลา (Overview & SLA)</span>
        </button>

        <button
          onClick={() => setActiveTab('tor')}
          className={cn(
            "py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
            activeTab === 'tor'
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}
        >
          <FileEdit className="w-4 h-4" />
          <span>คณะจัดทำ TOR และราคากลาง</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[var(--surface-inset)]">โมดูล A</span>
        </button>

        <button
          onClick={() => setActiveTab('evaluation')}
          className={cn(
            "py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
            activeTab === 'evaluation'
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}
        >
          <Award className="w-4 h-4" />
          <span>คณะกรรมการพิจารณาผล</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[var(--surface-inset)]">โมดูล B</span>
        </button>

        <button
          onClick={() => setActiveTab('acceptance')}
          className={cn(
            "py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
            activeTab === 'acceptance'
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}
        >
          <FileCheck className="w-4 h-4" />
          <span>คณะกรรมการตรวจรับพัสดุ & RTM</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">โมดูล C</span>
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'overview' && (
        <ProcurementDashboard
          workspaces={workspaces}
          selectedWorkspace={selectedWorkspace}
          onSelectProject={setSelectedProjectId}
          onNavigateTab={setActiveTab}
          onOpenFormModal={handleOpenFormModal}
          onRefresh={fetchWorkspaces}
        />
      )}

      {activeTab === 'tor' && (
        <TorBuilderWorkspace
          workspace={selectedWorkspace}
          onRefresh={fetchWorkspaces}
          onOpenFormModal={handleOpenFormModal}
        />
      )}

      {activeTab === 'evaluation' && (
        <EvaluationBoardWorkspace
          workspace={selectedWorkspace}
          onRefresh={fetchWorkspaces}
          onOpenFormModal={handleOpenFormModal}
        />
      )}

      {activeTab === 'acceptance' && (
        <AcceptanceWorkspace
          workspace={selectedWorkspace}
          onRefresh={fetchWorkspaces}
          onOpenEvidenceDrawer={handleOpenEvidenceDrawer}
          onOpenFormModal={handleOpenFormModal}
        />
      )}

      {/* Official Government Forms Modal */}
      <OfficialFormsModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        formType={formModalType}
        workspace={selectedWorkspace}
        selectedCommitteeType={activeTab === 'tor' ? 'TOR_PRICE' : activeTab === 'evaluation' ? 'EVALUATION' : 'ACCEPTANCE'}
      />

      {/* Evidence Drawer */}
      <EvidenceDrawer
        isOpen={evidenceDrawerOpen}
        onClose={() => setEvidenceDrawerOpen(false)}
        item={selectedRtmItem}
        projectNameTh={selectedWorkspace.projectNameTh}
      />
    </div>
  );
}
