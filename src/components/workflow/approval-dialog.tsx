'use client';

import React, { useState } from 'react';
import type { WorkflowActionType } from './workflow-actions';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface ApprovalDialogProps {
  isOpen: boolean;
  actionType: WorkflowActionType | null;
  onClose: () => void;
  onSubmit: (comment?: string) => Promise<void>;
}

export function ApprovalDialog({ isOpen, actionType, onClose, onSubmit }: ApprovalDialogProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !actionType) return null;

  const requiresComment = actionType === 'REJECT' || actionType === 'RETURN';
  const isSubmitDisabled = isSubmitting || (requiresComment && !comment.trim());

  const getDialogContent = () => {
    switch (actionType) {
      case 'SUBMIT':
        return {
          title: 'ยืนยันการยื่นเสนอโครงการ',
          icon: <CheckCircle2 className="w-6 h-6 text-blue-600" />,
          bgColor: 'bg-blue-100',
          submitText: 'ยื่นเสนอ',
          submitClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        };
      case 'APPROVE':
        return {
          title: 'ยืนยันการอนุมัติ',
          icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
          bgColor: 'bg-green-100',
          submitText: 'ยืนยันอนุมัติ',
          submitClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        };
      case 'REJECT':
        return {
          title: 'ไม่อนุมัติโครงการ',
          icon: <XCircle className="w-6 h-6 text-red-600" />,
          bgColor: 'bg-red-100',
          submitText: 'ยืนยันไม่อนุมัติ',
          submitClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        };
      case 'RETURN':
        return {
          title: 'ตีกลับโครงการ',
          icon: <AlertCircle className="w-6 h-6 text-amber-600" />,
          bgColor: 'bg-amber-100',
          submitText: 'ยืนยันตีกลับ',
          submitClass: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
        };
      default:
        return {
          title: 'ยืนยันการดำเนินการ',
          icon: <CheckCircle2 className="w-6 h-6 text-blue-600" />,
          bgColor: 'bg-blue-100',
          submitText: 'ยืนยัน',
          submitClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        };
    }
  };

  const content = getDialogContent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(comment);
      setComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 transition-opacity" onClick={!isSubmitting ? onClose : undefined} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 pointer-events-none">
        <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg pointer-events-auto overflow-hidden transform transition-all">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${content.bgColor}`}>
                {content.icon}
              </div>
              <h3 className="text-lg font-medium text-gray-900">{content.title}</h3>
            </div>
            
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 mb-4">
                กรุณายืนยันการดำเนินการ {requiresComment && <span className="text-red-500">*จำเป็นต้องระบุเหตุผล</span>}
              </p>
              
              <div className="space-y-2">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                  ความคิดเห็น / เหตุผล (ถ้ามี)
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2.5 outline-none"
                  placeholder="ระบุความคิดเห็น..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required={requiresComment}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2 ${content.submitClass}`}
              >
                {isSubmitting && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {content.submitText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
