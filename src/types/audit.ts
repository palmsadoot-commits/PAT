export type AuditAction = 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'UPLOAD' 
  | 'DOWNLOAD' 
  | 'SUBMIT' 
  | 'RETURN' 
  | 'APPROVE' 
  | 'REJECT' 
  | 'STATUS_CHANGE';

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  module: string;
  recordId?: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
  createdAt: string;
}
