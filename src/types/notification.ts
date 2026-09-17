export type NotificationType = 
  | 'NEW_SUBMISSION' 
  | 'RETURNED' 
  | 'NEEDS_REVIEW' 
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'SLA_WARNING' 
  | 'SLA_BREACH' 
  | 'NEW_COMMENT';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  projectId?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}
