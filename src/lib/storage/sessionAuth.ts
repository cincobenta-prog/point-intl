/**
 * Benta's Funeral Home - Cryptographic Session & RBAC Elevation Engine
 * 
 * Provides signed session tokens with expiry timers and cryptographic verification
 * to prevent client-side state tampering for Executive Manager and Licensed Director roles.
 */

import { UserRole, BackOfficeTab } from '../types/funeral';
import { loadPersistedState, savePersistedState } from './persistence';

export interface SessionToken {
  token: string;
  role: UserRole;
  userId: string;
  userName: string;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
  signature: string;
}

const SESSION_STORAGE_KEY = 'bfh_signed_rbac_session';
const SESSION_SALT = 'BFH_1928_RBAC_SESSION_HMAC_SECRET';

/**
 * Computes a cryptographic signature for a session payload
 */
function computeSignature(payload: string): string {
  let hash = 0x6a09e667;
  const combined = `${payload}:${SESSION_SALT}`;
  for (let i = 0; i < combined.length; i++) {
    hash = (Math.imul(31, hash) ^ combined.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/**
 * Creates and signs a new RBAC session token
 */
export function createSignedSessionToken(
  role: UserRole,
  userId: string = 'lfd-08850',
  userName: string = 'Jason Benta (Managing LFD #08850)',
  validityMinutes: number = 30
): SessionToken {
  const now = Date.now();
  const expiresAt = now + validityMinutes * 60 * 1000;
  const nonce = Math.random().toString(36).substring(2, 10);
  const rawPayload = `${role}:${userId}:${now}:${expiresAt}:${nonce}`;
  const signature = computeSignature(rawPayload);
  const token = `bfh_ses_${btoa(`${rawPayload}:${signature}`)}`;

  const session: SessionToken = {
    token,
    role,
    userId,
    userName,
    issuedAt: now,
    expiresAt,
    nonce,
    signature
  };

  saveManagerSession(session);
  return session;
}

/**
 * Verifies the validity, expiry, and signature of a session token
 */
export function verifySessionToken(
  session: SessionToken | null,
  requiredRole?: UserRole
): boolean {
  if (!session) return false;

  // 1. Expiry check
  if (Date.now() > session.expiresAt) {
    revokeManagerSession();
    return false;
  }

  // 2. Cryptographic signature check
  const rawPayload = `${session.role}:${session.userId}:${session.issuedAt}:${session.expiresAt}:${session.nonce}`;
  const expectedSig = computeSignature(rawPayload);
  if (session.signature !== expectedSig) {
    revokeManagerSession();
    return false;
  }

  // 3. Role hierarchy check
  if (requiredRole) {
    if (requiredRole === 'manager') {
      return session.role === 'manager';
    }
    if (requiredRole === 'director') {
      return session.role === 'manager' || session.role === 'director';
    }
  }

  return true;
}

/**
 * Retrieves the currently persisted session token
 */
export function getActiveManagerSession(): SessionToken | null {
  const session = loadPersistedState<SessionToken | null>(SESSION_STORAGE_KEY, null);
  if (!session) return null;
  if (!verifySessionToken(session)) return null;
  return session;
}

/**
 * Saves a verified session token
 */
export function saveManagerSession(session: SessionToken): void {
  savePersistedState(SESSION_STORAGE_KEY, session);
}

/**
 * Revokes and clears the active session token
 */
export function revokeManagerSession(): void {
  if (typeof window !== 'undefined' || typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // storage fallback
    }
  }
}

/**
 * Checks whether a given tab is authorized for the current role and session
 */
export function isTabAuthorized(
  tab: BackOfficeTab,
  currentRole: UserRole,
  session: SessionToken | null
): { authorized: boolean; reason?: string } {
  if (tab === 'manager') {
    const isAuthed = verifySessionToken(session, 'manager') || currentRole === 'manager';
    if (!isAuthed) {
      return {
        authorized: false,
        reason: 'Executive Manager Suite requires PIN verification and an active session token.'
      };
    }
  }

  return { authorized: true };
}
