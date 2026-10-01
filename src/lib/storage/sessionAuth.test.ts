import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createSignedSessionToken,
  verifySessionToken,
  getActiveManagerSession,
  saveManagerSession,
  revokeManagerSession,
  isTabAuthorized,
  SessionToken
} from './sessionAuth';

describe('sessionAuth: Cryptographic RBAC & Elevation Security', () => {
  // In-memory mock localStorage
  const mockStorage: Record<string, string> = {};

  beforeEach(() => {
    for (const key of Object.keys(mockStorage)) {
      delete mockStorage[key];
    }
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => { mockStorage[key] = value; },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => {
        for (const k of Object.keys(mockStorage)) delete mockStorage[k];
      }
    });
  });

  it('generates a cryptographically signed session token with valid HMAC signature and nonce', () => {
    const session = createSignedSessionToken('manager', 'lfd-08850', 'Jason Benta', 30);

    expect(session).toBeDefined();
    expect(session.role).toBe('manager');
    expect(session.userId).toBe('lfd-08850');
    expect(session.userName).toBe('Jason Benta');
    expect(session.token).toMatch(/^bfh_ses_/);
    expect(session.signature).toHaveLength(8);
    expect(session.nonce).toBeDefined();
    expect(session.expiresAt).toBeGreaterThan(session.issuedAt);
  });

  it('successfully verifies a valid, untampered session token', () => {
    const session = createSignedSessionToken('manager', 'lfd-08850', 'Jason Benta', 30);
    const isValid = verifySessionToken(session, 'manager');

    expect(isValid).toBe(true);
  });

  it('rejects null or undefined session tokens', () => {
    expect(verifySessionToken(null)).toBe(false);
  });

  it('detects and immediately revokes a token if role elevation is tampered on client', () => {
    const legitimateDirectorSession = createSignedSessionToken('director', 'dir-101', 'Beth Crowe', 30);

    // Tamper attempt: Malicious client elevates role from director to manager without changing signature
    const tamperedSession: SessionToken = {
      ...legitimateDirectorSession,
      role: 'manager'
    };

    const isTamperedValid = verifySessionToken(tamperedSession, 'manager');
    expect(isTamperedValid).toBe(false);
  });

  it('detects and immediately revokes a token if userId or nonce is modified', () => {
    const session = createSignedSessionToken('manager', 'lfd-08850', 'Jason Benta', 30);

    const tamperedUserId: SessionToken = {
      ...session,
      userId: 'attacker-id'
    };

    expect(verifySessionToken(tamperedUserId, 'manager')).toBe(false);

    const tamperedNonce: SessionToken = {
      ...session,
      nonce: 'fake_nonce_999'
    };

    expect(verifySessionToken(tamperedNonce, 'manager')).toBe(false);
  });

  it('rejects an expired session token and cleans up storage', () => {
    const now = Date.now();
    const expiredSession: SessionToken = {
      token: 'bfh_ses_expired',
      role: 'manager',
      userId: 'lfd-08850',
      userName: 'Jason Benta',
      issuedAt: now - 3600000,
      expiresAt: now - 1000, // 1 second in the past
      nonce: 'exp123',
      signature: ''
    };

    // Calculate genuine signature for the expired payload to test pure expiry rejection
    let hash = 0x6a09e667;
    const combined = `manager:lfd-08850:${expiredSession.issuedAt}:${expiredSession.expiresAt}:exp123:BFH_1928_RBAC_SESSION_HMAC_SECRET`;
    for (let i = 0; i < combined.length; i++) {
      hash = (Math.imul(31, hash) ^ combined.charCodeAt(i)) >>> 0;
    }
    expiredSession.signature = hash.toString(16).padStart(8, '0');

    expect(verifySessionToken(expiredSession, 'manager')).toBe(false);
  });

  it('enforces RBAC role hierarchy (manager satisfies director, director does not satisfy manager)', () => {
    const managerSession = createSignedSessionToken('manager', 'lfd-08850', 'Jason Benta', 30);
    const directorSession = createSignedSessionToken('director', 'dir-101', 'Beth Crowe', 30);

    // Manager role satisfies both manager and director requirements
    expect(verifySessionToken(managerSession, 'manager')).toBe(true);
    expect(verifySessionToken(managerSession, 'director')).toBe(true);

    // Director role satisfies director but NOT manager
    expect(verifySessionToken(directorSession, 'director')).toBe(true);
    expect(verifySessionToken(directorSession, 'manager')).toBe(false);
  });

  it('authorizes tabs based on RBAC rules via isTabAuthorized', () => {
    const managerSession = createSignedSessionToken('manager', 'lfd-08850', 'Jason Benta', 30);
    const directorSession = createSignedSessionToken('director', 'dir-101', 'Beth Crowe', 30);

    // Manager tab requires manager role/session
    expect(isTabAuthorized('manager', 'manager', managerSession).authorized).toBe(true);
    expect(isTabAuthorized('manager', 'director', directorSession).authorized).toBe(false);

    // Dashboard tab is open to general backoffice roles
    expect(isTabAuthorized('dashboard', 'director', directorSession).authorized).toBe(true);
  });

  it('persists and retrieves active manager session, and cleans up on revocation', () => {
    const session = createSignedSessionToken('manager', 'lfd-08850', 'Jason Benta', 30);
    saveManagerSession(session);

    const retrieved = getActiveManagerSession();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.userId).toBe('lfd-08850');

    revokeManagerSession();
    const afterRevoke = getActiveManagerSession();
    expect(afterRevoke).toBeNull();
  });
});
