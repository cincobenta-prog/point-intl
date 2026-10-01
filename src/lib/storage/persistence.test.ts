import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  savePersistedState,
  loadPersistedState,
  STORAGE_KEYS
} from './persistence';

describe('persistence: Encrypted Storage Engine & Checksum Integrity', () => {
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

  it('encrypts data on save with enc:v1: prefix and stores no plaintext', () => {
    const sensitiveCaseData = {
      caseNumber: 'BFH-2026-0089',
      decedentName: 'Eleanor Vance',
      ssn: '000-12-3456',
      informantPhone: '(212) 555-0199'
    };

    savePersistedState(STORAGE_KEYS.CASES, sensitiveCaseData);

    const rawInStorage = mockStorage[STORAGE_KEYS.CASES];
    expect(rawInStorage).toBeDefined();
    expect(rawInStorage.startsWith('enc:v1:')).toBe(true);

    // Verify plaintext is NOT present in storage
    expect(rawInStorage).not.toContain('Eleanor Vance');
    expect(rawInStorage).not.toContain('000-12-3456');
    expect(rawInStorage).not.toContain('(212) 555-0199');
  });

  it('decrypts stored ciphertext back into original structured data', () => {
    const complexData = {
      id: 'case-99',
      items: [
        { name: 'Full Traditional Service', price: 6500 },
        { name: 'Batesville Franklin Cherry Casket', price: 3800 }
      ],
      isApproved: true,
      timestamp: 1774900000000
    };

    savePersistedState('test_complex_record', complexData);
    const loaded = loadPersistedState('test_complex_record', null);

    expect(loaded).toEqual(complexData);
  });

  it('transparently auto-upgrades legacy unencrypted JSON to encrypted format', () => {
    const legacyPlaintext = JSON.stringify({ legacyField: 'old_unencrypted_value', count: 42 });
    mockStorage['legacy_key'] = legacyPlaintext;

    // Load reads legacy plaintext smoothly
    const loaded = loadPersistedState<{ legacyField: string; count: number } | null>('legacy_key', null);
    expect(loaded).toEqual({ legacyField: 'old_unencrypted_value', count: 42 });

    // Writing it again upgrades it to encrypted format
    savePersistedState('legacy_key', loaded);
    expect(mockStorage['legacy_key'].startsWith('enc:v1:')).toBe(true);
  });

  it('safely falls back to default value when encountering corrupted ciphertext without throwing exceptions', () => {
    mockStorage['corrupt_key'] = 'enc:v1:invalidsalt:corrupteddata:badchecksum';

    const defaultValue = { safe: true };
    const loaded = loadPersistedState('corrupt_key', defaultValue);

    expect(loaded).toEqual(defaultValue);
  });

  it('returns fallback default value when key does not exist', () => {
    const defaultValue = { cases: [] };
    const loaded = loadPersistedState('non_existent_key', defaultValue);

    expect(loaded).toEqual(defaultValue);
  });
});
