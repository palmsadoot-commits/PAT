'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Building2, Calendar, Wallet, User, Edit3, Trash2, 
  FileText, MessageSquare, History, Upload, Download, Check, Clock, 
  AlertCircle, FileCheck, Send, CheckCircle2, XCircle, Copy, Printer,
  Layers, Scale, Phone, Mail, MessageCircle, UserCheck, ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';
import { WorkflowActions, ActionType } from '@/components/workflow/workflow-actions';
import { DPMLifecycleView } from '@/components/dpm';
import { ProcurementContractView } from '@/components/projects/procurement-contract-view';
import { formatBudgetFull, formatDate, formatDateTime, formatRelativeTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'ร่าง', color: 'var(--status-draft)', bg: 'var(--status-draft-bg)' },
  SUBMITTED: { label: 'ยื่นเสนอ', color: 'var(--status-submitted)', bg: 'var(--status-submitted-bg)' },
  DOCUMENT_CHECK: { label: 'ตรวจเอกสาร', color: 'var(--status-checking)', bg: 'var(--status-checking-bg)' },
  UNDER_REVIEW: { label: 'กำลังพิจารณา', color: 'var(--status-review)', bg: 'var(--status-review-bg)' },
  RETURNED: { label: 'ตีกลับแก้ไข', color: 'var(--status-returned)', bg: 'var(--status-returned-bg)' },
  PENDING_APPROVAL: { label: 'รออนุมัติ', color: 'var(--status-pending)', bg: 'var(--status-pending-bg)' },
  APPROVED: { label: 'อนุมัติแล้ว', color: 'var(--status-approved)', bg: 'var(--status-approved-bg)' },
  REJECTED: { label: 'ไม่อนุมัติ', color: 'var(--status-rejected)', bg: 'var(--status-rejected-bg)' },
  IN_PROGRESS: { label: 'กำลังดำเนินการ', color: 'var(--status-progress)', bg: 'var(--status-progress-bg)' },
  COMPLETED: { label: 'เสร็จสิ้น', color: 'var(--status-completed)', bg: 'var(--status-completed-bg)' },
  CANCELLED: { label: 'ยกเลิก', color: 'var(--status-cancelled)', bg: 'var(--status-cancelled-bg)' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  HIGH: { label: 'เร่งด่วน', color: 'text-red-700', dot: 'bg-red-500' },
  MEDIUM: { label: 'ปกติ', color: 'text-amber-700', dot: 'bg-amber-500' },
  LOW: { label: 'ต่ำ', color: 'text-emerald-700', dot: 'bg-emerald-500' },
};

const WORKFLOW_STEPS = [
  { id: 'draft', label: 'ร่างโครงการ', statuses: ['DRAFT'] },
  { id: 'submitted', label: 'ยื่นเสนอ', statuses: ['SUBMITTED'] },
  { id: 'review', label: 'ตรวจสอบ', statuses: ['DOCUMENT_CHECK', 'UNDER_REVIEW'] },
  { id: 'approval', label: 'อนุมัติ', statuses: ['PENDING_APPROVAL'] },
  { id: 'done', label: 'ดำเนินการ', statuses: ['APPROVED', 'IN_PROGRESS', 'COMPLETED'] },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'procurement' | 'dpm' | 'documents' | 'comments' | 'history'>('overview');
  
  // Comments state
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Document upload modal
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('PROPOSAL');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProjectData = async () => {
    try {
      const [resProject, resSession] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch('/api/auth/session'),
      ]);

      if (!resProject.ok) {
        throw new Error('ไม่พบข้อมูลโครงการ');
      }

      const jsonProject = await resProject.json();
      setProject(jsonProject.data);

      if (resSession.ok) {
        const jsonSession = await resSession.json();
        setCurrentUser(jsonSession.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const handleWorkflowAction = async (action: ActionType, comment?: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, comment, version: project.version }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'ไม่สามารถทำรายการได้');
      }

      toast.success('ดำเนินการเปลี่ยนสถานะโครงการเรียบร้อยแล้ว');
      await fetchProjectData();
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await fetch(`/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'ไม่สามารถเพิ่มความคิดเห็นได้');
      }

      toast.success('เพิ่มความคิดเห็นเรียบร้อยแล้ว');
      setCommentText('');
      await fetchProjectData();
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    try {
      setUploadingDoc(true);
      const res = await fetch(`/api/projects/${projectId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: docName.trim().endsWith('.pdf') ? docName.trim() : `${docName.trim()}.pdf`,
          documentType: docType,
          fileSize: Math.floor(Math.random() * 800000) + 150000,
          mimeType: 'application/pdf',
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'ไม่สามารถอัปโหลดเอกสารได้');
      }

      toast.success('อัปโหลดเอกสารเรียบร้อยแล้ว');
      setDocName('');
      setIsDocModalOpen(false);
      await fetchProjectData();
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('คุณแน่ใจว่าต้องการลบเอกสารนี้ใช่หรือไม่?')) return;
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('ไม่สามารถลบเอกสารได้');
      toast.success('ลบเอกสารเรียบร้อยแล้ว');
      await fetchProjectData();
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    }
  };

  const handleDeleteProject = async () => {
    try {
      setDeleting(true);
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'ไม่สามารถลบโครงการได้');
      }
      toast.success('ลบโครงการเรียบร้อยแล้ว');
      router.push('/projects');
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-6 bg-[var(--surface-muted)] w-32 rounded-[var(--radius-md)]"></div>
        <div className="h-44 bg-[var(--surface-muted)] rounded-[var(--radius-xl)]"></div>
        <div className="h-24 bg-[var(--surface-muted)] rounded-[var(--radius-xl)]"></div>
        <div className="h-96 bg-[var(--surface-muted)] rounded-[var(--radius-xl)]"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] p-12 text-center border border-[var(--border)] shadow-[var(--shadow-card)] space-y-3">
        <AlertCircle className="w-12 h-12 text-[var(--foreground-muted)] mx-auto" />
        <h2 className="text-lg font-bold text-[var(--foreground)]">ไม่พบข้อมูลโครงการ</h2>
        <p className="text-[13px] text-[var(--foreground-subtle)]">โครงการนี้อาจถูกลบหรือไม่มีอยู่ในระบบ</p>
        <Link href="/projects" className="inline-block px-4 py-2 bg-[var(--accent)] text-white rounded-[var(--radius-md)] text-[13px] font-semibold hover:bg-[var(--accent-muted)]">
          กลับสู่หน้ารายการโครงการ
        </Link>
      </div>
    );
  }

  const canEdit = currentUser && (
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'ADMIN' ||
    (currentUser.role === 'PROJECT_OWNER' && (project.status === 'DRAFT' || project.status === 'RETURNED')) ||
    (currentUser.role === 'OFFICER' && (project.status === 'DRAFT' || project.status === 'RETURNED'))
  );

  const canDelete = currentUser && (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN');

  const statusInfo = STATUS_CONFIG[project.status] || { label: project.status, color: 'var(--foreground)', bg: 'var(--surface-muted)' };
  const priorityInfo = PRIORITY_CONFIG[project.priority] || { label: project.priority, color: 'text-gray-700', dot: 'bg-gray-500' };

  // Determine Stepper active index
  let currentStepIndex = WORKFLOW_STEPS.findIndex(s => s.statuses.includes(project.status));
  let isErrorState = false;
  if (currentStepIndex === -1) {
    if (project.status === 'RETURNED') {
      currentStepIndex = 1; // returned from check/review step usually
      isErrorState = true;
    } else if (project.status === 'REJECTED') {
      currentStepIndex = 3; // rejected during approval
      isErrorState = true;
    } else if (project.status === 'CANCELLED') {
      currentStepIndex = WORKFLOW_STEPS.length - 1;
      isErrorState = true;
    } else {
      currentStepIndex = 0;
    }
  }

  const latestReturnOrReject = (project.history || []).slice().reverse().find((h: any) => 
    h.toStatus === 'RETURNED' || h.toStatus === 'REJECTED'
  );

  return (
    <div className="space-y-5 pb-16">
      {/* Top Back Navigation & Tools */}
      <div className="flex items-center justify-between no-print">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปรายการโครงการ</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-[var(--foreground)] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] hover:bg-[var(--surface-muted)] transition-colors shadow-xs cursor-pointer"
            title="พิมพ์สรุปโครงการ"
          >
            <Printer className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
            <span className="hidden sm:inline">พิมพ์สรุป</span>
          </button>

          {canEdit && (
            <Link
              href={`/projects/${project.id}/edit`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-semibold text-[var(--foreground)] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] hover:bg-[var(--surface-muted)] transition-colors shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>แก้ไข</span>
            </Link>
          )}

          {canDelete && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-semibold text-[var(--danger)] bg-[var(--danger-bg)] border border-red-200 rounded-[var(--radius-md)] hover:bg-red-100 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ลบ</span>
            </button>
          )}
        </div>
      </div>

      {/* Alert Callout Banner for RETURNED / REJECTED */}
      {project.status === 'RETURNED' && (
        <div className="flex items-start gap-3.5 rounded-[var(--radius-lg)] border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-xs animate-fade-in">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-900">โครงการถูกส่งกลับเพื่อแก้ไข (Action Required)</h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              {latestReturnOrReject?.comment || 'กรุณาตรวจสอบเอกสารและข้อเสนอแนะเพื่อปรับปรุงให้ครบถ้วนก่อนส่งคำขอใหม่อีกครั้ง'}
            </p>
            {latestReturnOrReject?.performedBy && (
              <p className="text-[11px] text-amber-700 font-medium">
                ดำเนินการโดย: <strong className="font-semibold">{latestReturnOrReject.performedBy}</strong> ({formatDateTime(latestReturnOrReject.performedAt)})
              </p>
            )}
          </div>
        </div>
      )}

      {project.status === 'REJECTED' && (
        <div className="flex items-start gap-3.5 rounded-[var(--radius-lg)] border border-red-300 bg-red-50 p-4 text-red-900 shadow-xs animate-fade-in">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-red-900">โครงการไม่ได้รับการอนุมัติ (Proposal Rejected)</h3>
            <p className="text-xs text-red-800 leading-relaxed">
              {latestReturnOrReject?.comment || 'โครงการนี้ไม่ผ่านเกณฑ์การพิจารณาอนุมัติของคณะกรรมการ/ผู้มีอำนาจอนุมัติ'}
            </p>
            {latestReturnOrReject?.performedBy && (
              <p className="text-[11px] text-red-700 font-medium">
                ดำเนินการโดย: <strong className="font-semibold">{latestReturnOrReject.performedBy}</strong> ({formatDateTime(latestReturnOrReject.performedAt)})
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Project Case Header Card */}
      <section className="workspace-panel relative overflow-hidden p-5 sm:p-6 md:p-8">
        <div className="absolute inset-y-0 left-0 w-1 bg-[var(--accent)]" />
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(project.projectNo || project.id);
                toast.success('คัดลอกเลขที่โครงการแล้ว: ' + (project.projectNo || project.id));
              }}
              className="case-id group cursor-pointer hover:bg-[var(--accent)] hover:text-white transition-colors"
              title="คลิกเพื่อคัดลอกเลขที่โครงการ"
            >
              <span>{project.projectNo || project.id}</span>
              <Copy className="ml-1 h-3 w-3 opacity-60 group-hover:opacity-100" />
            </button>
            <span 
              className="status-chip"
              style={{ color: statusInfo.color, backgroundColor: statusInfo.bg }}
            >
              {statusInfo.label}
            </span>
            <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-inset)] px-2.5 py-1 text-[11px] font-bold", priorityInfo.color)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", priorityInfo.dot)} />
              {priorityInfo.label}
            </span>
            <span className="rounded-[var(--radius-sm)] border border-[var(--border-muted)] bg-[var(--surface-inset)] px-2 py-1 text-[11px] font-semibold text-[var(--foreground-muted)]">
              ปีงบประมาณ {project.fiscalYear}
            </span>
            <span className="text-[12px] text-[var(--foreground-subtle)] font-mono">v{project.version}</span>
          </div>

          <h1 className="text-display text-[var(--foreground)]">
            {project.projectName}
          </h1>
        </div>

        {/* Metadata Inline */}
        <div className="grid gap-3 border-t border-[var(--border-muted)] pt-4 text-[13px] sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
            <Building2 className="w-4 h-4 text-[var(--foreground-subtle)] shrink-0" />
            <span className="truncate"><strong className="text-[var(--foreground)] font-semibold">{project.organizationName}</strong> · {project.departmentName}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
            <User className="w-4 h-4 text-[var(--foreground-subtle)] shrink-0" />
            <span className="truncate"><strong className="text-[var(--foreground)] font-semibold">{project.ownerName}</strong> · {project.ownerPosition || 'เจ้าของโครงการ'}</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
            <Calendar className="w-4 h-4 text-[var(--foreground-subtle)] shrink-0" />
            <span className="text-[var(--foreground)] font-semibold">
              {formatDate(project.startDate)} - {formatDate(project.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
            <Wallet className="w-4 h-4 text-[var(--foreground-subtle)] shrink-0" />
            <span className="text-[var(--foreground)] font-semibold tabular-nums">{formatBudgetFull(project.budget)}</span>
          </div>
        </div>
      </section>

      {/* Dynamic Workflow Actions Bar */}
      {currentUser && (
        <WorkflowActions
          projectId={project.id}
          currentStatus={project.status}
          userRole={currentUser.role}
          onAction={handleWorkflowAction}
        />
      )}

      {/* Horizontal Stepper */}
      <section className="workspace-panel overflow-x-auto p-4 sm:p-5" aria-labelledby="project-progress-title">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="workspace-eyebrow">WORKFLOW PROGRESS</p>
            <h2 id="project-progress-title" className="mt-1 text-[14px] font-bold text-[var(--foreground)]">เส้นทางการพิจารณาโครงการ</h2>
          </div>
          <span className="status-chip" style={{ color: statusInfo.color, backgroundColor: statusInfo.bg }}>{statusInfo.label}</span>
        </div>
        <div className="flex items-center justify-between relative min-w-[540px] py-1">
          {/* Background baseline track */}
          <div className="absolute left-0 top-5 w-full h-[2px] bg-[var(--border-muted)] -z-10" />
          
          {/* Active progress fill line with gradient */}
          <div 
            className="absolute left-0 top-5 h-[2.5px] bg-gradient-to-r from-[var(--accent)] via-[#1687a5] to-[#38bdf8] -z-10 transition-all duration-500 rounded-full" 
            style={{ width: `${(Math.max(0, currentStepIndex) / (WORKFLOW_STEPS.length - 1)) * 100}%` }}
          />
          
          {WORKFLOW_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step.id} className="flex flex-col items-center gap-2.5 bg-[var(--surface)] px-3 select-none">
                {/* Step Circle Container */}
                <div className="relative flex items-center justify-center h-10 w-10">
                  {isCompleted ? (
                    // Completed Step: Clean checkmark with accent tint
                    <div className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)] shadow-xs transition-all">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  ) : isCurrent ? (
                    // Active Current Step: Prominent Number + Breathing Glow + Live Beacon Point
                    <div className="relative flex items-center justify-center">
                      {/* Ambient radar ping wave */}
                      <span 
                        className={cn(
                          "absolute -inset-1.5 rounded-full opacity-40 animate-ping pointer-events-none",
                          isErrorState ? "bg-rose-400" : "bg-sky-400"
                        )} 
                        style={{ animationDuration: '2.5s' }}
                      />

                      {/* Main Active Circle with Breathing Glow */}
                      <div 
                        className={cn(
                          "relative w-10 h-10 rounded-full flex items-center justify-center border-2 text-[14px] font-black tracking-tight shadow-md transition-all",
                          isErrorState 
                            ? "bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white animate-stepper-active-error" 
                            : "bg-gradient-to-br from-[#0f6f89] via-[#1483a0] to-[#085266] text-white animate-stepper-active"
                        )}
                      >
                        <span className="drop-shadow-xs font-black text-white">{index + 1}</span>

                        {/* Modern Live Status Beacon Point */}
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-20">
                          <span 
                            className={cn(
                              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-80",
                              isErrorState ? "bg-rose-400" : "bg-cyan-300"
                            )} 
                            style={{ animationDuration: '1.6s' }} 
                          />
                          <span 
                            className={cn(
                              "relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-white shadow-xs",
                              isErrorState ? "bg-rose-500" : "bg-cyan-400"
                            )} 
                          />
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Pending Step: Crisp subtle circle with visible step number
                    <div className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground-subtle)] font-bold text-[12px] transition-all">
                      <span>{index + 1}</span>
                    </div>
                  )}
                </div>

                {/* Step Labels */}
                <div className="flex flex-col items-center">
                  <span className={cn(
                    "transition-colors text-center",
                    isCurrent && isErrorState ? "text-[13px] font-bold text-[var(--danger)]" :
                    isCurrent ? "text-[13px] font-bold text-[var(--foreground)]" : 
                    isCompleted ? "text-[12px] font-medium text-[var(--foreground-muted)]" : "text-[12px] font-medium text-[var(--foreground-subtle)]"
                  )}>
                    {step.label}
                  </span>

                  {isCurrent ? (
                    <span 
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-2xs mt-1 transition-all"
                      style={{ 
                        color: isErrorState ? 'var(--danger)' : statusInfo.color, 
                        backgroundColor: isErrorState ? 'var(--danger-bg)' : statusInfo.bg,
                        borderColor: isErrorState ? 'var(--status-rejected-border)' : 'currentColor'
                      }}
                    >
                      <span 
                        className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" 
                        style={{ backgroundColor: isErrorState ? 'var(--danger)' : statusInfo.color }} 
                      />
                      <span>{statusInfo.label}</span>
                    </span>
                  ) : isCompleted ? (
                    <span className="text-[10px] text-[var(--accent)] font-medium mt-0.5">
                      ผ่านแล้ว
                    </span>
                  ) : (
                    <span className="text-[10px] text-[var(--foreground-subtle)] opacity-60 mt-0.5">
                      รอดำเนินการ
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tabs Content - Full Width */}
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex items-center gap-6 border-b border-[var(--border)] overflow-x-auto">
          {[
            { id: 'overview', icon: FileText, label: 'ข้อมูลโครงการ' },
            { id: 'procurement', icon: Scale, label: 'สัญญาและจัดซื้อจัดจ้าง (พ.ร.บ. พัสดุฯ)' },
            { id: 'dpm', icon: Layers, label: 'วงจรชีวิต DPM (ต้นน้ำ-ปลายน้ำ)' },
            { id: 'documents', icon: FileCheck, label: `เอกสารแนบ (${project.documents?.length || 0})` },
            { id: 'comments', icon: MessageSquare, label: `ความคิดเห็น (${project.comments?.length || 0})` },
            { id: 'history', icon: History, label: `ประวัติ (${project.history?.length || 0})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 py-3 font-semibold text-[13px] border-b-2 transition-all cursor-pointer whitespace-nowrap",
                activeTab === tab.id
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Section 0: Project Owner Contact & Bottleneck Assignment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Card A: Project Owner Contacts */}
              <section className="workspace-panel p-5">
                <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-[var(--border-muted)]">
                  <div className="w-8 h-8 rounded-[var(--radius-md)] bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[var(--foreground)]">
                      ผู้รับผิดชอบโครงการ (Project Owner)
                    </h3>
                    <p className="text-[11px] text-[var(--foreground-muted)]">
                      ช่องทางการติดต่อผู้รับผิดชอบโครงการโดยตรง
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[14px] font-bold text-[var(--foreground)] block">
                      {project.ownerContact?.fullName || project.ownerName}
                    </span>
                    <span className="text-[11px] text-[var(--foreground-muted)] block mt-0.5">
                      {project.ownerContact?.position || project.ownerPosition || 'เจ้าของโครงการ'}
                    </span>
                    <span className="text-[11px] text-[var(--foreground-subtle)] block">
                      {project.ownerContact?.department || project.departmentName} · {project.ownerContact?.organization || project.organizationName}
                    </span>
                  </div>

                  <div className="pt-2.5 border-t border-[var(--border-muted)] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-2 text-[var(--foreground)]">
                      <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>โทร: {project.ownerContact?.phone || '02-232-1000'}</span>
                      {project.ownerContact?.internalPhone && (
                        <span className="text-[var(--foreground-muted)] font-mono">(ต่อ {project.ownerContact.internalPhone})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[var(--foreground)]">
                      <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <a href={`mailto:${project.ownerContact?.email || 'contact@mol.go.th'}`} className="hover:underline truncate">
                        {project.ownerContact?.email || 'contact@mol.go.th'}
                      </a>
                    </div>
                    {project.ownerContact?.lineId && (
                      <div className="flex items-center gap-2 text-[var(--foreground)] col-span-2">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Line ID: <strong className="font-mono">{project.ownerContact.lineId}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Card B: Bottleneck / Current Step & Assigned Reviewer */}
              <section className={cn(
                "workspace-panel p-5",
                project.assignedOfficer?.isOverdue ? "border-red-300 bg-red-50/10" : ""
              )}>
                <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[var(--border-muted)]">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center font-bold border",
                      project.assignedOfficer?.isOverdue
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    )}>
                      {project.assignedOfficer?.isOverdue ? (
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-[14px] font-bold text-[var(--foreground)]">
                        สถานะการพิจารณาและการมอบหมาย (Bottleneck Tracking)
                      </h3>
                      <p className="text-[11px] text-[var(--foreground-muted)]">
                        ติดตามว่าเรื่องค้างอยู่ที่ใคร และการควบคุมเวลาตาม SLA
                      </p>
                    </div>
                  </div>

                  {project.assignedOfficer?.isOverdue ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                      เกินกำหนด SLA ({project.assignedOfficer.overdueDays} วัน)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      อยู่ในเกณฑ์ SLA ปกติ
                    </span>
                  )}
                </div>

                {project.assignedOfficer ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] block">
                        ขั้นตอนที่เรื่องค้างอยู่:
                      </span>
                      <span className="text-[13px] font-semibold text-[var(--foreground)] block mt-0.5">
                        {project.assignedOfficer.currentStepNameTh}
                      </span>
                    </div>

                    <div className="bg-[var(--surface-inset)] p-3 rounded-[var(--radius-md)] border border-[var(--border-muted)] space-y-2">
                      <div>
                        <span className="text-[10px] text-[var(--foreground-subtle)] uppercase block">ผู้มีอำนาจมอบหมายให้:</span>
                        <span className="font-bold text-[var(--foreground)] text-[12px]">{project.assignedOfficer.fullName}</span>
                        <span className="text-[11px] text-[var(--foreground-muted)] block">{project.assignedOfficer.position}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[var(--foreground-muted)] flex-wrap pt-1 border-t border-[var(--border-muted)]">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-blue-600" /> {project.assignedOfficer.phone} (ต่อ {project.assignedOfficer.internalPhone})
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-blue-600" /> {project.assignedOfficer.email}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--foreground-muted)] pt-1">
                      <div>
                        <span>วันที่มอบหมาย: </span>
                        <strong className="text-[var(--foreground)]">{formatDate(project.assignedOfficer.assignedAt)}</strong>
                      </div>
                      <div>
                        <span>กำหนดส่งตาม SLA: </span>
                        <strong className={cn(project.assignedOfficer.isOverdue ? "text-red-600" : "text-[var(--foreground)]")}>
                          {formatDate(project.assignedOfficer.slaDueDate)} ({project.assignedOfficer.slaDaysAllowed} วัน)
                        </strong>
                      </div>
                      <div className="col-span-2">
                        <span>ระยะเวลาที่เรื่องค้างอยู่: </span>
                        <strong className={cn(project.assignedOfficer.isOverdue ? "text-red-700" : "text-[var(--foreground)]")}>
                          {project.assignedOfficer.daysPending} วันทำการ
                        </strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-[var(--foreground-muted)]">
                    โครงการอยู่ในสถานะที่ได้รับการอนุมัติหรือดำเนินงานแล้ว
                  </div>
                )}
              </section>
            </div>

            {/* Section A: Specifications Definition List */}
            <section className="workspace-panel p-5 sm:p-6">
              <h3 className="text-[14px] font-bold text-[var(--foreground)] uppercase tracking-wide border-b border-[var(--border-muted)] pb-2.5 mb-4">
                สาระสำคัญของโครงการ (Project Dossier)
              </h3>
              <div className="gov-dl gov-dl-3col">
                <div className="gov-dl-item">
                  <div className="gov-dl-label">ประเภทโครงการ</div>
                  <div className="gov-dl-value">{project.projectType || 'DIGITAL'}</div>
                </div>
                <div className="gov-dl-item">
                  <div className="gov-dl-label">แหล่งงบประมาณ</div>
                  <div className="gov-dl-value">{project.budgetSource || 'งบประมาณรายจ่ายประจำปี'}</div>
                </div>
                <div className="gov-dl-item">
                  <div className="gov-dl-label">กรอบเวลาดำเนินการ</div>
                  <div className="gov-dl-value font-medium">{formatDate(project.startDate)} – {formatDate(project.endDate)}</div>
                </div>
                <div className="gov-dl-item">
                  <div className="gov-dl-label">หน่วยงานเจ้าของโครงการ</div>
                  <div className="gov-dl-value">{project.organizationName} ({project.departmentName})</div>
                </div>
                <div className="gov-dl-item">
                  <div className="gov-dl-label">ผู้รับผิดชอบโครงการ</div>
                  <div className="gov-dl-value">{project.ownerName} · {project.ownerPosition || 'เจ้าของโครงการ'}</div>
                </div>
                <div className="gov-dl-item">
                  <div className="gov-dl-label">วันที่บันทึกเข้าระบบ</div>
                  <div className="gov-dl-value">{formatDate(project.createdAt)}</div>
                </div>
              </div>
            </section>

            {/* Section B: Rationale */}
            <section className="workspace-panel p-5 sm:p-6">
              <h3 className="text-[14px] font-bold text-[var(--foreground)] uppercase tracking-wide border-b border-[var(--border-muted)] pb-2.5 mb-3">
                หลักการและเหตุผล
              </h3>
              <div className="text-[13px] text-[var(--foreground)] leading-relaxed whitespace-pre-line bg-[var(--surface-inset)] p-4 sm:p-5 rounded-[var(--radius-md)] border border-[var(--border-muted)]">
                {project.principle || 'ไม่มีการระบุหลักการและเหตุผล'}
              </div>
            </section>

            {/* Section C: Objectives & Target */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <section className="workspace-panel p-5">
                <h3 className="text-[14px] font-bold text-[var(--foreground)] uppercase tracking-wide border-b border-[var(--border-muted)] pb-2.5 mb-3">
                  วัตถุประสงค์
                </h3>
                <div className="text-[13px] text-[var(--foreground)] leading-relaxed whitespace-pre-line bg-[var(--surface-inset)] p-4 rounded-[var(--radius-md)] min-h-[110px] border border-[var(--border-muted)]">
                  {project.objectives || 'ไม่มีข้อมูลวัตถุประสงค์'}
                </div>
              </section>

              <section className="workspace-panel p-5">
                <h3 className="text-[14px] font-bold text-[var(--foreground)] uppercase tracking-wide border-b border-[var(--border-muted)] pb-2.5 mb-3">
                  เป้าหมาย
                </h3>
                <div className="text-[13px] text-[var(--foreground)] leading-relaxed whitespace-pre-line bg-[var(--surface-inset)] p-4 rounded-[var(--radius-md)] min-h-[110px] border border-[var(--border-muted)]">
                  {project.target || 'ไม่มีข้อมูลเป้าหมาย'}
                </div>
              </section>
            </div>

            {/* Section D: KPI & Expected Outcome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <section className="workspace-panel p-5">
                <h3 className="text-[14px] font-bold text-[var(--foreground)] uppercase tracking-wide border-b border-[var(--border-muted)] pb-2.5 mb-3">
                  ตัวชี้วัดความสำเร็จ (KPI)
                </h3>
                <div className="text-[13px] text-[var(--foreground)] leading-relaxed whitespace-pre-line bg-[var(--surface-inset)] p-4 rounded-[var(--radius-md)] min-h-[100px] border border-[var(--border-muted)]">
                  {project.kpi || 'ไม่มีข้อมูลตัวชี้วัด'}
                </div>
              </section>

              <section className="workspace-panel p-5">
                <h3 className="text-[14px] font-bold text-[var(--foreground)] uppercase tracking-wide border-b border-[var(--border-muted)] pb-2.5 mb-3">
                  ผลที่คาดว่าจะได้รับ
                </h3>
                <div className="text-[13px] text-[var(--foreground)] leading-relaxed whitespace-pre-line bg-[var(--surface-inset)] p-4 rounded-[var(--radius-md)] min-h-[100px] border border-[var(--border-muted)]">
                  {project.expectedOutcome || 'ไม่มีข้อมูล'}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Tab: Procurement & Contract (พ.ร.บ. พัสดุฯ ๒๕๖๐) */}
        {activeTab === 'procurement' && (
          <div className="animate-in fade-in duration-300">
            {project.dpm ? (
              <ProcurementContractView dpm={project.dpm} projectBudget={project.budget} />
            ) : (
              <div className="workspace-panel p-8 text-center">
                <Scale className="w-10 h-10 text-[var(--foreground-subtle)] mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold text-[var(--foreground)]">ยังไม่มีข้อมูลสัญญาและการจัดหาสำหรับโครงการนี้</p>
                <p className="text-xs text-[var(--foreground-muted)] mt-1">ข้อมูลจะแสดงเมื่อโครงการผ่านการอนุมัติและเข้าสู่ขั้นตอนการจัดซื้อจัดจ้าง</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: DPM Lifecycle (ต้นน้ำ-ปลายน้ำ) */}
        {activeTab === 'dpm' && (
          <div className="animate-in fade-in duration-300">
            <DPMLifecycleView projectId={project.id} />
          </div>
        )}

        {/* Tab 2: Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-[var(--foreground)]">เอกสารประกอบโครงการ</h3>
                <p className="text-[13px] text-[var(--foreground-subtle)] mt-1">เอกสารข้อเสนอ แผนงบประมาณ และหนังสือนำส่ง</p>
              </div>
              <button
                onClick={() => setIsDocModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold text-white bg-[var(--accent)] rounded-[var(--radius-md)] hover:bg-[var(--accent-muted)] transition-colors cursor-pointer shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>แนบเอกสารเพิ่ม</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.documents?.map((doc: any) => (
                <div key={doc.id} className="flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-[var(--radius-md)] bg-blue-50 text-[var(--accent)] flex items-center justify-center font-bold text-[11px] shrink-0 border border-blue-100">
                      PDF
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={`/api/documents/${doc.id}/download`}
                        className="p-1.5 text-[var(--foreground-subtle)] hover:text-[var(--accent)] hover:bg-blue-50 rounded-lg transition-colors"
                        title="ดาวน์โหลด"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1.5 text-[var(--foreground-subtle)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] rounded-lg transition-colors cursor-pointer"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-[var(--foreground)] line-clamp-2" title={doc.fileName}>{doc.fileName}</div>
                    <div className="text-[11px] text-[var(--foreground-subtle)] mt-1.5">
                      ประเภท: {doc.documentType}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--border-muted)] text-[11px] text-[var(--foreground-muted)] flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    <span>{doc.uploaderName || doc.uploadedBy}</span>
                    <span className="mx-1 text-[var(--foreground-subtle)]">•</span>
                    <span>{formatDate(doc.uploadedAt)}</span>
                  </div>
                </div>
              ))}
              {!project.documents?.length && (
                <div className="col-span-full p-12 text-center text-[13px] text-[var(--foreground-subtle)] bg-[var(--surface-inset)] rounded-[var(--radius-md)] border border-dashed border-[var(--border)]">
                  <FileCheck className="w-8 h-8 mx-auto mb-3 text-[var(--foreground-subtle)] opacity-50" />
                  ยังไม่มีเอกสารแนบสำหรับโครงการนี้
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Comments */}
        {activeTab === 'comments' && (
          <div className="space-y-6 max-w-3xl animate-in fade-in duration-300">
            <form onSubmit={handleAddComment} className="space-y-3 bg-[var(--surface-inset)] p-5 rounded-[var(--radius-md)] border border-[var(--border-muted)]">
              <label className="block text-[13px] font-semibold text-[var(--foreground)]">
                เพิ่มความคิดเห็น / ข้อเสนอแนะในการพิจารณา
              </label>
              <textarea
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="พิมพ์ข้อคิดเห็นหรือข้อซักถามถึงเจ้าของโครงการ..."
                className="w-full p-3.5 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] shadow-sm"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-[var(--accent)] rounded-[var(--radius-md)] hover:bg-[var(--accent-muted)] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingComment ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}</span>
                </button>
              </div>
            </form>

            <div className="space-y-4 pt-2">
              <h4 className="text-[15px] font-semibold text-[var(--foreground)]">
                ความคิดเห็นทั้งหมด ({project.comments?.length || 0})
              </h4>

              <div className="space-y-4">
                {project.comments?.map((c: any) => (
                  <div key={c.id} className="flex gap-4 p-5 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border)] shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-[var(--foreground-muted)]" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-[13px] text-[var(--foreground)]">{c.userName}</div>
                        <div className="text-[11px] text-[var(--foreground-subtle)]" title={formatDateTime(c.createdAt)}>
                          {formatRelativeTime ? formatRelativeTime(c.createdAt) : formatDateTime(c.createdAt)}
                        </div>
                      </div>
                      <p className="text-[13px] text-[var(--foreground-muted)] whitespace-pre-line leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))}
                {!project.comments?.length && (
                  <div className="py-12 text-center text-[13px] text-[var(--foreground-subtle)] bg-[var(--surface-inset)] rounded-[var(--radius-md)] border border-dashed border-[var(--border)]">
                    <MessageSquare className="w-8 h-8 mx-auto mb-3 text-[var(--foreground-subtle)] opacity-50" />
                    ยังไม่มีความคิดเห็นในโครงการนี้
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: History */}
        {activeTab === 'history' && (
          <div className="space-y-6 max-w-3xl animate-in fade-in duration-300">
            <div>
              <h3 className="text-[15px] font-semibold text-[var(--foreground)]">ประวัติการพิจารณาและเปลี่ยนสถานะ</h3>
              <p className="text-[13px] text-[var(--foreground-subtle)] mt-1">บันทึกทุกขั้นตอนการดำเนินงานโดยระบบ Audit Trail</p>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--border-muted)] mt-6">
              {project.history?.map((h: any, index: number) => {
                const isLatest = index === 0;
                return (
                  <div key={h.id} className="relative">
                    <div className={cn(
                      "absolute -left-[27px] top-1.5 w-3 h-3 rounded-full border-2 ring-2",
                      isLatest 
                        ? "bg-[var(--accent)] border-[var(--surface)] ring-[var(--accent-muted)] ring-opacity-20" 
                        : "bg-[var(--surface-muted)] border-[var(--border)] ring-transparent"
                    )}></div>
                    <div className="bg-[var(--surface)] p-5 rounded-[var(--radius-md)] border border-[var(--border)] shadow-sm space-y-2.5 hover:shadow-md transition-shadow">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-[13px] text-[var(--foreground)] bg-[var(--surface-muted)] px-2.5 py-1 rounded-md border border-[var(--border-muted)]">
                          {h.action} ({h.fromStatus} → {h.toStatus})
                        </span>
                        <span className="text-[11px] text-[var(--foreground-subtle)]">{formatDateTime(h.performedAt)}</span>
                      </div>
                      <div className="text-[12px] text-[var(--foreground-muted)] flex items-center gap-1.5 pt-1">
                        <User className="w-3.5 h-3.5 text-[var(--foreground-subtle)]" />
                        <span>ดำเนินการโดย: <span className="font-medium text-[var(--foreground)]">{h.performerName || h.performedBy}</span></span>
                      </div>
                      {h.comment && (
                        <div className="text-[13px] text-[var(--foreground-muted)] bg-[var(--surface-inset)] p-3 rounded-[var(--radius-md)] mt-2 italic flex gap-2 border border-[var(--border-muted)]">
                          <MessageSquare className="w-4 h-4 text-[var(--foreground-subtle)] shrink-0 mt-0.5" />
                          <span>{h.comment}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {!project.history?.length && (
                <div className="py-8 text-center text-[13px] text-[var(--foreground-subtle)]">
                  ยังไม่มีประวัติการดำเนินงาน
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {isDocModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] max-w-md w-full p-6 shadow-2xl border border-[var(--border)] space-y-5">
            <h3 className="text-[15px] font-semibold text-[var(--foreground)]">แนบเอกสารโครงการ</h3>
            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[var(--foreground)] mb-1.5">ชื่อเอกสาร *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ข้อเสนอโครงการ_ฉบับปรับปรุง.pdf"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full p-2.5 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[var(--foreground)] mb-1.5">ประเภทเอกสาร</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full p-2.5 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                >
                  <option value="PROPOSAL">ข้อเสนอโครงการ (Proposal)</option>
                  <option value="BUDGET">แผนงบประมาณ (Budget Plan)</option>
                  <option value="OFFICIAL_LETTER">หนังสือนำส่งราชการ (Official Letter)</option>
                  <option value="SUPPORTING">เอกสารประกอบอื่นๆ (Supporting)</option>
                  <option value="APPROVAL">เอกสารการอนุมัติ (Approval Certificate)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-medium text-[var(--foreground-muted)] bg-[var(--surface-muted)] hover:bg-[var(--border)] rounded-[var(--radius-md)] cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={uploadingDoc}
                  className="px-4 py-2 text-[13px] font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-muted)] rounded-[var(--radius-md)] disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {uploadingDoc ? 'กำลังบันทึก...' : 'บันทึกเอกสาร'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-[var(--surface)] rounded-[var(--radius-xl)] max-w-md w-full p-6 shadow-2xl border border-[var(--border)] space-y-5">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[var(--danger-bg)] text-[var(--danger)] flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-[15px] font-semibold text-[var(--foreground)]">ยืนยันการลบโครงการ</h3>
              <p className="text-[13px] text-[var(--foreground-muted)]">
                คุณแน่ใจหรือไม่ว่าต้องการลบโครงการ <span className="font-semibold text-[var(--foreground)]">{project.projectNo}</span>? โครงการจะถูกซ่อนออกจากระบบ (Soft Delete)
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-[13px] font-medium text-[var(--foreground-muted)] bg-[var(--surface-muted)] hover:bg-[var(--border)] rounded-[var(--radius-md)] cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteProject}
                className="px-4 py-2 text-[13px] font-semibold text-white bg-[var(--danger)] hover:bg-red-700 rounded-[var(--radius-md)] disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {deleting ? 'กำลังลบ...' : 'ยืนยันการลบ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
