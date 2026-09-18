import { ProjectStatus } from './project';

export type WorkflowAction = 
  | 'SUBMIT' 
  | 'RECEIVE' 
  | 'DOCS_COMPLETE' 
  | 'DOCS_INCOMPLETE' 
  | 'REVIEW_COMPLETE' 
  | 'REVIEW_RETURN' 
  | 'APPROVE' 
  | 'REJECT' 
  | 'RETURN' 
  | 'START' 
  | 'COMPLETE' 
  | 'CANCEL' 
  | 'RESUBMIT';

export interface ProjectHistory {
  id: string;
  projectId: string;
  fromStatus: ProjectStatus;
  toStatus: ProjectStatus;
  action: WorkflowAction;
  comment: string;
  performedBy: string;
  performedAt: string;
  ipAddress: string;
  userAgent: string;
  // Aliases for backward compatibility
  actionBy?: string;
  actionAt?: string;
  comments?: string;
  performerName?: string;
}
