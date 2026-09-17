import { NextRequest, NextResponse } from 'next/server';
import { getSession, SessionPayload } from './session';
import { hasPermission } from './permissions';
import { Permission } from '@/types';
import { unauthorizedResponse, forbiddenResponse } from '@/lib/utils/api-response';

export interface AuthenticatedRequest extends NextRequest {
  session: SessionPayload;
}

/**
 * Middleware to require authentication for API routes
 */
export async function requireAuth(
  req: NextRequest,
  handler: (req: NextRequest, session: SessionPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  const session = await getSession();

  if (!session) {
    return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
  }

  return handler(req, session);
}

/**
 * Middleware to require specific permission
 */
export async function requirePermission(
  req: NextRequest,
  permission: Permission,
  handler: (req: NextRequest, session: SessionPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  const session = await getSession();

  if (!session) {
    return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
  }

  if (!hasPermission(session.role, permission)) {
    return forbiddenResponse('คุณไม่มีสิทธิ์ดำเนินการนี้');
  }

  return handler(req, session);
}

/**
 * Middleware to require any of the specified permissions
 */
export async function requireAnyPermission(
  req: NextRequest,
  permissions: Permission[],
  handler: (req: NextRequest, session: SessionPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  const session = await getSession();

  if (!session) {
    return unauthorizedResponse('กรุณาเข้าสู่ระบบ');
  }

  const hasAny = permissions.some((p) => hasPermission(session.role, p));
  if (!hasAny) {
    return forbiddenResponse('คุณไม่มีสิทธิ์ดำเนินการนี้');
  }

  return handler(req, session);
}

/**
 * Get client IP from request headers
 */
export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '0.0.0.0'
  );
}

/**
 * Get user agent from request headers
 */
export function getUserAgent(req: NextRequest): string {
  return req.headers.get('user-agent') || 'Unknown';
}
