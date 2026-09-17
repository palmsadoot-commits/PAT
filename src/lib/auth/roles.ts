import { UserRole } from '@/types';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  APPROVER: 60,
  REVIEWER: 50,
  EXECUTIVE: 40,
  OFFICER: 30,
  PROJECT_OWNER: 20,
  VIEWER: 10,
};

export function isRoleHigherOrEqual(role: UserRole, targetRole: UserRole): boolean {
  return (ROLE_HIERARCHY[role] || 0) >= (ROLE_HIERARCHY[targetRole] || 0);
}

export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  return (ROLE_HIERARCHY[managerRole] || 0) > (ROLE_HIERARCHY[targetRole] || 0);
}
