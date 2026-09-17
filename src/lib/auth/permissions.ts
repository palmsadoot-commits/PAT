import { UserRole, Permission } from '@/types';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'project:create', 'project:read', 'project:update', 'project:delete', 'project:submit', 'project:approve', 'project:reject', 'project:return',
    'document:upload', 'document:download', 'document:delete',
    'report:view', 'report:export',
    'user:manage',
    'audit:view', 'system:manage'
  ],
  ADMIN: ['project:create','project:read','project:update','project:delete','project:submit','project:return','document:upload','document:download','document:delete','report:view','report:export','user:manage','audit:view'],
  OFFICER: ['project:create','project:read','project:update','project:submit','document:upload','document:download','report:view','report:export'],
  PROJECT_OWNER: ['project:create','project:read','project:update','project:submit','document:upload','document:download','document:delete'],
  REVIEWER: ['project:read','project:return','document:download','report:view'],
  APPROVER: ['project:read','project:approve','project:reject','project:return','document:download','report:view','report:export'],
  EXECUTIVE: ['project:read','document:download','report:view','report:export','audit:view'],
  VIEWER: ['project:read','document:download','report:view'],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}
