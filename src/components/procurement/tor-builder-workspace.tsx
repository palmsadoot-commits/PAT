'use client';

import React, { useState } from 'react';
import { 
  FileEdit, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Plus, 
  Scale, 
  FileText, 
  ExternalLink, 
  Layers, 
  Sparkles,
  Search,
  ShieldAlert,
  Info,
  X
} from 'lucide-react';
import { ProcurementGovernanceWorkspace, TorSectionKey, PriceSourceType, SpecEquivalenceLevel } from '@/types/procurement';
import { formatBudgetFull } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TorBuilderWorkspaceProps {
  workspace: ProcurementGovernanceWorkspace;
  onRefresh: () => void;
  onOpenFormModal: (type: 'APPOINTMENT_ORDER' | 'CONFLICT_DECLARATION' | 'FORM_BK01') => void;
}

export function TorBuilderWorkspace({ workspace, onRefresh, onOpenFormModal }: TorBuilderWorkspaceProps) {
  const tor = workspace.torSpecification;
  const medianPkg = workspace.medianPricePackage;

  const [activeSection, setActiveSection] = useState<TorSectionKey>('OBJECTIVES');
  const [isAddReqModalOpen, setIsAddReqModalOpen] = useState(false);
  const [isAddSurveyModalOpen, setIsAddSurveyModalOpen] = useState(false);

  // New Requirement Form
  const [newTitleTh, setNewTitleTh] = useState('');
  const [newSpecTh, setNewSpecTh] = useState('');
  const [newCriteriaTh, setNewCriteriaTh] = useState('');
  const [newTestMethod, setNewTestMethod] = useState<'INSPECTION' | 'DEMO' | 'AUTOMATED_TEST' | 'AUDIT_LOG' | 'SECURITY_SCAN' | 'CODE_REVIEW' | 'UAT'>('INSPECTION');
  const [newEvidenceTh, setNewEvidenceTh] = useState('');
  const [submittingReq, setSubmittingReq] = useState(false);

  // New Price Survey Form
  const [surveySource, setSurveySource] = useState('');
  const [surveyType, setSurveyType] = useState<PriceSourceType>('MARKET_SURVEY');
  const [surveyRef, setSurveyRef] = useState('');
  const [surveyPrice, setSurveyPrice] = useState('');
  const [surveyEquivalence, setSurveyEquivalence] = useState<SpecEquivalenceLevel>('EQUIVALENT');
  const [surveyNotes, setSurveyNotes] = useState('');
  const [submittingSurvey, setSubmittingSurvey] = useState(false);

  // Handle Add Requirement
  const handleAddRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleTh || !newSpecTh) {
      toast.error('กรุณาระบุหัวข้อและข้อกำหนดความต้องการ');
      return;
    }

    try {
      setSubmittingReq(true);
      const res = await fetch(`/api/procurement/${workspace.projectId}/tor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_REQUIREMENT',
          sectionKey: activeSection,
          titleTh: newTitleTh,
          specificationTh: newSpecTh,
          acceptanceCriteriaTh: newCriteriaTh,
          testMethod: newTestMethod,
          evidenceRequiredTh: newEvidenceTh
        })
      });

      if (!res.ok) throw new Error('เกิดข้อผิดพลาดในการบันทึกข้อกำหนด');
      toast.success('เพิ่มข้อกำหนด TOR สำเร็จ');
      setIsAddReqModalOpen(false);
      setNewTitleTh('');
      setNewSpecTh('');
      setNewCriteriaTh('');
      setNewEvidenceTh('');
      onRefresh();
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    } finally {
      setSubmittingReq(false);
    }
  };

  // Handle Add Price Survey
  const handleAddSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveySource || !surveyPrice) {
      toast.error('กรุณากรอกชื่อแหล่งสืบราคาและราคาที่สำรวจ');
      return;
    }

    try {
      setSubmittingSurvey(true);
      const res = await fetch(`/api/procurement/${workspace.projectId}/tor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_PRICE_SURVEY',
          sourceName: surveySource,
          sourceType: surveyType,
          documentRefOrUrl: surveyRef,
          quotedPriceBaht: Number(surveyPrice),
          specEquivalence: surveyEquivalence,
          specComparisonNotesTh: surveyNotes
        })
      });

      if (!res.ok) throw new Error('เกิดข้อผิดพลาดในการบันทึกราคาสำรวจ');
      toast.success('บันทึกแหล่งสืบราคาและคำนวณราคากลางใหม่เรียบร้อยแล้ว');
      setIsAddSurveyModalOpen(false);
      setSurveySource('');
      setSurveyPrice('');
      setSurveyRef('');
      setSurveyNotes('');
      onRefresh();
    } catch (err: any) {
      toast.error('ข้อผิดพลาด', { description: err.message });
    } finally {
      setSubmittingSurvey(false);
    }
  };

  const currentSectionData = tor?.sections.find(s => s.key === activeSection);
  const totalItemsCount = (tor?.sections || []).reduce((acc, s) => acc + s.items.length, 0);
  const totalAmbiguityWarnings = (tor?.sections || []).reduce(
    (acc, s) => acc + s.items.reduce((iAcc, item) => iAcc + (item.ambiguityWarnings?.length || 0), 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="workspace-panel p-5 bg-gradient-to-r from-blue-900/10 via-indigo-900/5 to-transparent border-blue-200/80 dark:border-blue-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-[var(--foreground)]">
                  โมดูล A: คณะกรรมการจัดทำร่างขอบเขตงาน (TOR) และกำหนดราคากลาง
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300">
                  ระเบียบ กค. ๒๕๖๐ ข้อ ๒๑, ๒๕, ๔๕-๔๖
                </span>
              </div>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                สร้างข้อกำหนด ๗ ส่วน บังคับเกณฑ์ตรวจวัดได้ (Measurable Criteria) เตือนคำกำกวม และคำนวณราคากลางด้วยการเทียบเคียงสเปก
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onOpenFormModal('APPOINTMENT_ORDER')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-muted)] cursor-pointer text-[var(--foreground)] shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>คำสั่งแต่งตั้ง (ข้อ ๒๕)</span>
            </button>
            <button
              onClick={() => onOpenFormModal('CONFLICT_DECLARATION')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-muted)] cursor-pointer text-[var(--foreground)] shadow-2xs"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
              <span>คำรับรองผลประโยชน์</span>
            </button>
            <button
              onClick={() => onOpenFormModal('FORM_BK01')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-sm"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>เปิดเผยราคากลาง (บก.๐๑)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="workspace-panel p-4 space-y-1">
          <span className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">
            ข้อกำหนด TOR ทั้งหมด
          </span>
          <p className="text-2xl font-black text-[var(--foreground)] tabular-nums">
            {totalItemsCount} <span className="text-xs font-normal text-[var(--foreground-muted)]">รายการ</span>
          </p>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-medium">
            ครอบคลุม ๗ หมวดหมู่งาน
          </span>
        </div>

        <div className="workspace-panel p-4 space-y-1">
          <span className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">
            แจ้งเตือนคำกำกวม (Linter)
          </span>
          <p className="text-2xl font-black text-amber-600 tabular-nums">
            {totalAmbiguityWarnings} <span className="text-xs font-normal text-[var(--foreground-muted)]">จุด</span>
          </p>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-medium">
            {totalAmbiguityWarnings > 0 ? 'ตรวจพบคำที่ขาดเกณฑ์วัดชัดเจน' : 'ข้อกำหนดทั้งหมดมีเกณฑ์วัดเชิงตัวเลข'}
          </span>
        </div>

        <div className="workspace-panel p-4 space-y-1">
          <span className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">
            ราคากลางที่คำนวณได้
          </span>
          <p className="text-2xl font-black text-blue-700 dark:text-blue-400 tabular-nums">
            {medianPkg ? formatBudgetFull(medianPkg.medianPriceBaht) : 'รอคำนวณ'} <span className="text-xs font-normal text-[var(--foreground-muted)]">บาท</span>
          </p>
          <span className="text-[10px] text-[var(--foreground-muted)] block font-medium">
            จากแหล่งสืบราคา {medianPkg?.surveys.filter(s => !s.isExcludedAsOutlier).length || 0} แหล่ง
          </span>
        </div>

        <div className="workspace-panel p-4 space-y-1">
          <span className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider block">
            รับฟังความคิดเห็น (Public Hearing)
          </span>
          <p className="text-base font-bold text-[var(--foreground)] pt-1">
            {tor?.status === 'APPROVED' ? 'ผ่านการรับฟังแล้ว' : 'อยู่ระหว่างดำเนินการ'}
          </p>
          <span className="text-[10px] text-neutral-600 dark:text-neutral-400 block">
            ขั้นต่ำ ๓ วันทำการ (ระเบียบ ข้อ ๔๕-๔๖)
          </span>
        </div>
      </div>

      {/* Main TOR Sections & Requirements Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Navigation */}
        <div className="lg:col-span-1 workspace-panel p-3 space-y-1">
          <span className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider px-3 py-1 block">
            หมวดหมู่ขอบเขตงาน (๗ ส่วน)
          </span>
          {tor?.sections.map(section => {
            const itemCount = section.items.length;
            const warningCount = section.items.reduce((acc, i) => acc + (i.ambiguityWarnings?.length || 0), 0);

            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={cn(
                  "w-full text-left p-3 rounded-[var(--radius-md)] text-xs font-semibold transition-all cursor-pointer flex items-center justify-between gap-2",
                  activeSection === section.key
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : "text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                )}
              >
                <span className="line-clamp-1">{section.titleTh}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {warningCount > 0 && (
                    <span className={cn(
                      "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                      activeSection === section.key ? "bg-amber-400 text-black" : "bg-amber-100 text-amber-900"
                    )}>
                      {warningCount}
                    </span>
                  )}
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-mono",
                    activeSection === section.key ? "bg-white/20 text-white" : "bg-[var(--surface-inset)] text-[var(--foreground-subtle)]"
                  )}>
                    {itemCount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Section Detail & Requirements List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="workspace-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)]">
                  {currentSectionData?.titleTh}
                </h3>
                <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                  ข้อกำหนดและเกณฑ์ตรวจรับที่สามารถวัดผลได้เชิงประจักษ์
                </p>
              </div>

              <button
                onClick={() => setIsAddReqModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-bold bg-[var(--accent)] text-white hover:bg-[var(--accent-muted)] cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มข้อกำหนด</span>
              </button>
            </div>

            {/* Requirements Items */}
            <div className="space-y-3">
              {currentSectionData?.items.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] space-y-3 hover:border-[var(--accent)]/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        {item.reqCode}
                      </span>
                      <h4 className="text-xs font-bold text-[var(--foreground)]">
                        {item.titleTh}
                      </h4>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-inset)] text-[var(--foreground-muted)] font-mono">
                      วิธีตรวจ: {item.testMethod}
                    </span>
                  </div>

                  {/* Ambiguity Warning Banner if detected */}
                  {item.ambiguityWarnings && item.ambiguityWarnings.length > 0 && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-[var(--radius-md)] text-xs text-amber-900 dark:text-amber-300 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>แจ้งเตือนคำกำกวมที่ขาดเกณฑ์วัด (Linter Detected Ambiguity)</span>
                      </div>
                      {item.ambiguityWarnings.map((w, wIdx) => (
                        <div key={wIdx} className="text-[11px] pl-5 space-y-0.5">
                          <p>• พบคำว่า <strong className="underline">"{w.keyword}"</strong> ในข้อความ: <span className="italic text-neutral-600 dark:text-neutral-400">"{w.contextSnippet}"</span></p>
                          <p className="text-emerald-700 dark:text-emerald-400 font-medium">💡 ข้อเสนอแนะ: {w.suggestedMeasurementTh}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1 text-xs text-[var(--foreground-muted)] leading-relaxed">
                    <p><strong className="text-[var(--foreground)]">ข้อกำหนด (Specification):</strong> {item.specificationTh}</p>
                    <p className="p-2 bg-[var(--surface-inset)] rounded border border-[var(--border-muted)] mt-1">
                      <strong className="text-emerald-700 dark:text-emerald-400">เกณฑ์การตรวจรับที่วัดผลได้ (Acceptance Criteria):</strong> {item.acceptanceCriteriaTh}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[var(--foreground-subtle)] pt-1 border-t border-[var(--border-muted)]">
                    <span>หลักฐานที่ต้องใช้: <strong>{item.evidenceRequiredTh}</strong></span>
                    <span>เกณฑ์ผ่าน: <strong>{item.passFailThresholdTh}</strong></span>
                  </div>
                </div>
              ))}

              {(!currentSectionData?.items || currentSectionData.items.length === 0) && (
                <div className="p-8 text-center text-xs text-[var(--foreground-muted)]">
                  ยังไม่มีข้อกำหนดในหมวดนี้ คลิกปุ่ม "เพิ่มข้อกำหนด" เพื่อสร้างรายการใหม่
                </div>
              )}
            </div>
          </div>

          {/* Price Survey & Spec-Equivalence Table */}
          <div className="workspace-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>การสืบราคาและการเปรียบเทียบความเทียบเคียงของคุณลักษณะเฉพาะ (Price Survey & Spec-Equivalence)</span>
                </h3>
                <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                  เปรียบเทียบคุณลักษณะเฉพาะ (Specification) ก่อนการเทียบเคียงราคา และคัดแยก Outlier พร้อมระบุเหตุผล
                </p>
              </div>

              <button
                onClick={() => setIsAddSurveyModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-muted)] cursor-pointer text-[var(--foreground)] shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>เพิ่มแหล่งสืบราคา</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground-muted)] font-bold">
                    <th className="p-3">แหล่งที่มา / ผู้ประกอบการ</th>
                    <th className="p-3">ประเภท</th>
                    <th className="p-3">เอกสารอ้างอิง / URL</th>
                    <th className="p-3 text-center">ความเทียบเคียงสเปก</th>
                    <th className="p-3 text-right">ราคาที่เสนอ (บาท)</th>
                    <th className="p-3 text-center">สถานะฐานคำนวณ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-muted)]">
                  {medianPkg?.surveys.map(s => (
                    <tr key={s.id} className={cn("hover:bg-[var(--surface-muted)] transition-colors", s.isExcludedAsOutlier && "opacity-60 bg-red-50/20")}>
                      <td className="p-3 font-medium text-[var(--foreground)]">
                        {s.sourceName}
                        <span className="block text-[10px] text-[var(--foreground-subtle)]">สืบโดย: {s.surveyorName} ({s.surveyDate})</span>
                      </td>
                      <td className="p-3 text-[var(--foreground-muted)]">{s.sourceType}</td>
                      <td className="p-3 text-[var(--foreground-muted)] max-w-xs truncate" title={s.documentRefOrUrl}>
                        {s.documentRefOrUrl}
                      </td>
                      <td className="p-3 text-center">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold",
                          s.specEquivalence === 'IDENTICAL' ? "bg-emerald-100 text-emerald-800" :
                          s.specEquivalence === 'EQUIVALENT' ? "bg-blue-100 text-blue-800" :
                          s.specEquivalence === 'SUPERIOR' ? "bg-purple-100 text-purple-800" :
                          "bg-red-100 text-red-800"
                        )}>
                          {s.specEquivalence}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[var(--foreground)]">
                        {formatBudgetFull(s.quotedPriceBaht)}
                      </td>
                      <td className="p-3 text-center">
                        {s.isExcludedAsOutlier ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-800 font-semibold" title={s.outlierExclusionReasonTh}>
                            คัดออก (Outlier)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                            ใช้คำนวณ
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-blue-50/40 dark:bg-blue-950/20 rounded-[var(--radius-md)] border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300 flex items-center justify-between">
              <div>
                <strong>มติการคำนวณ:</strong> {medianPkg?.calculationMethodTh}
              </div>
              <div className="font-mono font-bold text-sm text-blue-900 dark:text-blue-200">
                ราคากลาง: {medianPkg ? formatBudgetFull(medianPkg.medianPriceBaht) : 0} บาท
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add Requirement */}
      {isAddReqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-2xl w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                เพิ่มข้อกำหนด TOR ในหมวด: {currentSectionData?.titleTh}
              </h3>
              <button onClick={() => setIsAddReqModalOpen(false)} className="text-[var(--foreground-muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRequirement} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[var(--foreground)]">หัวข้อความต้องการ (Title)</label>
                <input
                  type="text"
                  value={newTitleTh}
                  onChange={e => setNewTitleTh(e.target.value)}
                  placeholder="เช่น การเชื่อมโยงระบบ ThaID, ประสิทธิภาพเวลาตอบสนอง"
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--foreground)]">รายละเอียดข้อกำหนด (Specification)</label>
                <textarea
                  rows={3}
                  value={newSpecTh}
                  onChange={e => setNewSpecTh(e.target.value)}
                  placeholder="ระบุความต้องการทางเทคนิค (ระบบจะตรวจจับคำกำกวมให้อัตโนมัติ)"
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--foreground)]">เกณฑ์การตรวจรับที่วัดผลได้ (Acceptance Criteria)</label>
                <textarea
                  rows={2}
                  value={newCriteriaTh}
                  onChange={e => setNewCriteriaTh(e.target.value)}
                  placeholder="เช่น Response Time < 2 วินาที, UAT Pass Rate >= 95%"
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[var(--foreground)]">วิธีการตรวจวัด</label>
                  <select
                    value={newTestMethod}
                    onChange={e => setNewTestMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)]"
                  >
                    <option value="INSPECTION">ตรวจพินิจเอกสาร (Inspection)</option>
                    <option value="UAT">การทดสอบการยอมรับ (UAT)</option>
                    <option value="AUTOMATED_TEST">การทดสอบอัตโนมัติ (Automated Test)</option>
                    <option value="SECURITY_SCAN">ตรวจความปลอดภัย (Security Scan)</option>
                    <option value="CODE_REVIEW">ตรวจรหัสโปรแกรม (Code Review)</option>
                    <option value="AUDIT_LOG">ตรวจบันทึกระบบ (Audit Log)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[var(--foreground)]">หลักฐานที่ต้องใช้ (Evidence)</label>
                  <input
                    type="text"
                    value={newEvidenceTh}
                    onChange={e => setNewEvidenceTh(e.target.value)}
                    placeholder="เช่น UAT Sign-off Report, VAPT Report"
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsAddReqModalOpen(false)}
                  className="px-4 py-1.5 rounded-[var(--radius-md)] border border-[var(--border)] font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submittingReq}
                  className="px-4 py-1.5 rounded-[var(--radius-md)] bg-[var(--accent)] text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {submittingReq ? 'กำลังบันทึก...' : 'บันทึกข้อกำหนด'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Price Survey */}
      {isAddSurveyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                บันทึกแหล่งสืบราคา (Price Survey Record)
              </h3>
              <button onClick={() => setIsAddSurveyModalOpen(false)} className="text-[var(--foreground-muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSurvey} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[var(--foreground)]">ชื่อผู้ประกอบการ / แหล่งข้อมูล</label>
                <input
                  type="text"
                  value={surveySource}
                  onChange={e => setSurveySource(e.target.value)}
                  placeholder="เช่น บริษัท ดิจิทัล บิซ จำกัด"
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[var(--foreground)]">ประเภทแหล่งข้อมูล</label>
                  <select
                    value={surveyType}
                    onChange={e => setSurveyType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)]"
                  >
                    <option value="MARKET_SURVEY">สืบราคาจากท้องตลาด</option>
                    <option value="HISTORICAL_CONTRACT">สัญญาเดิมภาครัฐ</option>
                    <option value="CATALOGUE">บัญชีราคามาตรฐาน (Catalog)</option>
                    <option value="COST_ESTIMATE">ประมาณการต้นทุน</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[var(--foreground)]">ราคาที่เสนอ (บาท)</label>
                  <input
                    type="number"
                    value={surveyPrice}
                    onChange={e => setSurveyPrice(e.target.value)}
                    placeholder="เช่น 14500000"
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)] font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--foreground)]">ระดับความเทียบเคียงของสเปก (Spec-Equivalence)</label>
                <select
                  value={surveyEquivalence}
                  onChange={e => setSurveyEquivalence(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)]"
                >
                  <option value="IDENTICAL">ตรงตามสเปก 100% (Identical)</option>
                  <option value="EQUIVALENT">เทียบเท่าตามมาตรฐาน (Equivalent)</option>
                  <option value="SUPERIOR">สูงกว่าเกณฑ์ที่กำหนด (Superior)</option>
                  <option value="INFERIOR">ต่ำกว่าเกณฑ์ (Inferior - ระบบจะตัดออกอัตโนมัติ)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--foreground)]">เอกสารอ้างอิง / เลขที่ใบเสนอราคา / URL</label>
                <input
                  type="text"
                  value={surveyRef}
                  onChange={e => setSurveyRef(e.target.value)}
                  placeholder="เช่น ใบเสนอราคาเลขที่ QT-2026/08 ลงวันที่ ๑๒ ม.ค. ๒๕๖๙"
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--foreground)]">บันทึกผลการเปรียบเทียบคุณลักษณะ</label>
                <textarea
                  rows={2}
                  value={surveyNotes}
                  onChange={e => setSurveyNotes(e.target.value)}
                  placeholder="ระบุเหตุผลความเทียบเคียงหรือข้อสังเกต"
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-inset)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsAddSurveyModalOpen(false)}
                  className="px-4 py-1.5 rounded-[var(--radius-md)] border border-[var(--border)] font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submittingSurvey}
                  className="px-4 py-1.5 rounded-[var(--radius-md)] bg-blue-600 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {submittingSurvey ? 'กำลังบันทึก...' : 'บันทึกราคา'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
