import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { User, UserRole } from '@/types';

const SESSION_COOKIE_NAME = 'pat-session';
const SESSION_MAX_AGE = 8 * 60 * 60; // 8 hours in seconds

interface SessionPayload {
  userId: string;
  username: string;
  fullName: string;
  role: UserRole;
  organizationId: string;
  departmentId: string;
  exp: number;
  iat: number;
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || 'pat-system-default-secret-key-mol-ops-2026-super-secure';
  return new TextEncoder().encode(secret);
}

/**
 * Create a new session for a user
 */
export async function createSession(user: User): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    userId: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    organizationId: user.organizationId,
    departmentId: user.departmentId,
    exp: now + SESSION_MAX_AGE,
    iat: now,
  };

  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .setIssuedAt()
    .sign(getSecret());

  // Set the cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return token;
}

/**
 * Get the current session from the cookie
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Destroy the current session
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Check if the current request is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

/**
 * Get the current user's role from the session
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const session = await getSession();
  return session?.role || null;
}

/**
 * Get the current user's ID from the session
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.userId || null;
}

export type { SessionPayload };
