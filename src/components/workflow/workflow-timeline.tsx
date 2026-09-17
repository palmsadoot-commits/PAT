import React from 'react';
import { Check, Clock, X, AlertCircle } from 'lucide-react';
import type { ProjectStatus } from '../projects/status-badge';

export interface WorkflowHistoryEntry {
  id: string;
  status: ProjectStatus;
  date: string;
  user: string;
  comment?: string;
}

interface WorkflowTimelineProps {
  currentStatus: ProjectStatus;
  history: WorkflowHistoryEntry[];
}

const WORKFLOW_STEPS = [
  { id: 'DRAFT', label: 'ร่างโครงการ' },
  { id: 'SUBMITTED', label: 'ยื่นเสนอ' },
  { id: 'DOCUMENT_CHECK', label: 'ตรวจสอบเอกสาร' },
  { id: 'UNDER_REVIEW', label: 'พิจารณา' },
  { id: 'PENDING_APPROVAL', label: 'รออนุมัติ' },
  { id: 'APPROVED', label: 'อนุมัติแล้ว' },
  { id: 'IN_PROGRESS', label: 'กำลังดำเนินการ' },
  { id: 'COMPLETED', label: 'เสร็จสิ้น' },
];

export function WorkflowTimeline({ currentStatus, history }: WorkflowTimelineProps) {
  // Utility to determine step state
  const getStepState = (stepId: string, index: number) => {
    // Handling alternative flows like REJECTED, RETURNED, CANCELLED by checking history
    const historyItem = history.find(h => h.status === stepId);
    const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStatus);
    
    if (['REJECTED', 'CANCELLED', 'RETURNED'].includes(currentStatus)) {
       if (historyItem) return 'completed';
       if (index <= currentIndex) return 'completed'; // simplified logic
    }

    if (currentStatus === stepId) return 'current';
    if (historyItem || index < currentIndex) return 'completed';
    return 'pending';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">สถานะดำเนินการ</h3>
      
      <div className="relative">
        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gray-200" />
        
        <div className="space-y-6">
          {WORKFLOW_STEPS.map((step, index) => {
            const state = getStepState(step.id, index);
            const historyItem = history.find(h => h.status === step.id) || 
                               (state === 'current' ? history[history.length - 1] : undefined);

            return (
              <div key={step.id} className="relative flex gap-4">
                <div className="relative z-10 flex h-10 w-10 items-center justify-center bg-white">
                  {state === 'completed' && (
                    <div className="h-8 w-8 rounded-full bg-[var(--accent-muted)] border-2 border-[var(--accent)] text-[var(--accent)] flex items-center justify-center shadow-xs">
                      <Check className="h-4 w-4 stroke-[2.5]" />
                    </div>
                  )}
                  {state === 'current' && (
                    <div className="relative flex items-center justify-center">
                      <span className="absolute -inset-1 rounded-full bg-sky-400/30 animate-ping pointer-events-none" style={{ animationDuration: '2.5s' }} />
                      <div className="relative h-9 w-9 rounded-full bg-gradient-to-br from-[#0f6f89] to-[#085266] text-white flex items-center justify-center font-black text-[13px] border-2 shadow-md animate-stepper-active">
                        <span>{index + 1}</span>
                        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75" style={{ animationDuration: '1.6s' }} />
                          <span className="relative inline-flex rounded-full h-3 w-3 border border-white bg-cyan-400 shadow-xs" />
                        </span>
                      </div>
                    </div>
                  )}
                  {state === 'pending' && (
                    <div className="h-8 w-8 rounded-full border-2 border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground-subtle)] font-bold text-[12px] flex items-center justify-center">
                      <span>{index + 1}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex-1">
                  <p className={`text-sm font-medium ${
                    state === 'pending' ? 'text-gray-500' : 'text-gray-900'
                  }`}>
                    {step.label}
                  </p>
                  
                  {historyItem && (state === 'completed' || state === 'current') && (
                    <div className="mt-1 text-sm text-gray-500 flex flex-col sm:flex-row sm:gap-2">
                      <span>{historyItem.user}</span>
                      <span className="hidden sm:inline text-gray-300">•</span>
                      <span>{new Date(historyItem.date).toLocaleString('th-TH')}</span>
                    </div>
                  )}
                  
                  {historyItem?.comment && (
                    <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {historyItem.comment}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Alternative branches display */}
          {['RETURNED', 'REJECTED', 'CANCELLED'].includes(currentStatus) && (
            <div className="relative flex gap-4 mt-6">
              <div className="relative z-10 flex h-10 w-10 items-center justify-center bg-white">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 border-white ring-4 ring-white ${
                  currentStatus === 'RETURNED' ? 'bg-amber-100' : 'bg-red-100'
                }`}>
                  {currentStatus === 'RETURNED' ? (
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
              
              <div className="pt-2 flex-1">
                <p className={`text-sm font-medium ${
                  currentStatus === 'RETURNED' ? 'text-amber-700' : 'text-red-700'
                }`}>
                  {currentStatus === 'RETURNED' ? 'ตีกลับแก้ไข' : currentStatus === 'REJECTED' ? 'ไม่อนุมัติ' : 'ยกเลิก'}
                </p>
                {history.length > 0 && history[history.length - 1].status === currentStatus && (
                  <div className="mt-1 text-sm text-gray-500 flex flex-col sm:flex-row sm:gap-2">
                    <span>{history[history.length - 1].user}</span>
                    <span className="hidden sm:inline text-gray-300">•</span>
                    <span>{new Date(history[history.length - 1].date).toLocaleString('th-TH')}</span>
                  </div>
                )}
                {history[history.length - 1]?.comment && (
                  <div className="mt-2 text-sm text-gray-600 bg-red-50 p-3 rounded-lg border border-red-100">
                    {history[history.length - 1].comment}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
