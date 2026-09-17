export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'OFFICER' 
  | 'PROJECT_OWNER' 
  | 'REVIEWER' 
  | 'APPROVER' 
  | 'EXECUTIVE' 
  | 'VIEWER';

export type Permission = 
  | 'project:create' 
  | 'project:read' 
  | 'project:update' 
  | 'project:delete' 
  | 'project:submit' 
  | 'project:return' 
  | 'project:approve' 
  | 'project:reject' 
  | 'document:upload' 
  | 'document:download' 
  | 'document:delete' 
  | 'report:view' 
  | 'report:export' 
  | 'user:manage' 
  | 'system:manage' 
  | 'audit:view';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  email: string;
  fullName: string;
  fullNameEn?: string;
  role: UserRole;
  organizationId: string;
  departmentId: string;
  position: string;
  isActive: boolean;
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}
