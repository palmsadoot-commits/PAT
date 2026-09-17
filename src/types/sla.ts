export type SLAStatus = 'ON_TRACK' | 'DUE_SOON' | 'OVERDUE' | 'COMPLETED';

export interface SLASetting {
  id: string;
  workflowStep: string;
  name: string;
  durationDays: number;
  warningDays: number;
  isActive: boolean;
}

export interface SLATracking {
  projectId: string;
  workflowStep: string;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  status: SLAStatus;
}
