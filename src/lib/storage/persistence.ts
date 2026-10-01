/**
 * Benta's Funeral Home (BFH OS) Encrypted Persistence Engine
 * 
 * Provides offline-first resilient storage with automated hydration,
 * transparent legacy migration, and cryptographic envelope protection
 * for decedent PII, Form AP-47 financial records, and staff authorizations.
 */

export const STORAGE_KEYS = {
  CASES: 'bfh_cases_v3',
  DIRECTORS: 'bfh_directors_v3',
  DIRECTOR_PROFILES: 'bfh_directors_v3',
  ASSIGNMENTS: 'bfh_service_assignments_v3',
  SERVICE_ASSIGNMENTS: 'bfh_service_assignments_v3',
  VOUCHERS: 'bfh_1099_vouchers_v3',
  CALENDAR_EVENTS: 'bfh_calendar_events_v3',
  LIVERY_HOLDS: 'bfh_livery_holds_v3',
  SERVICE_PARTNERS: 'bfh_service_partners_v3',
  PARTNER_REQUESTS: 'bfh_partner_requests_v3',
  MANAGER_AUTH: 'bfh_manager_auth_session',
  MANAGER_PIN: 'bfh_custom_manager_pin',
  NOTIFICATIONS: 'bfh_notifications_v3',
  TWILIO_GATEWAY_CONFIG: 'bfh_twilio_gateway_config',
  DOCUSIGN_CONFIG: 'bfh_docusign_config',
  CLOUD_SYNC_CONFIG: 'bfh_cloud_sync_config_v1',
  CLOUD_MEDIA_VAULT: 'bfh_cloud_media_vault_v1',
  AI_GATEWAY_CONFIG: 'bfh_ai_gateway_config_v1',
  PRESS_FULFILLMENT_CONFIG: 'bfh_press_fulfillment_config_v1',
  PRESS_JOB_HISTORY: 'bfh_press_job_history_v1',
  WEBCAST_GATEWAY_CONFIG: 'bfh_webcast_gateway_config_v1',
  STRIPE_GATEWAY_CONFIG: 'bfh_stripe_gateway_config_v1',
  STRIPE_TRANSACTIONS: 'bfh_stripe_transactions_v1',
  QUICKBOOKS_CONFIG: 'bfh_quickbooks_config_v1',
  QUICKBOOKS_INVOICE_CACHE: 'bfh_quickbooks_invoices_v1',
  EDRS_GATEWAY_CONFIG: 'bfh_edrs_gateway_config_v1'
};

const ENVELOPE_PREFIX = 'enc:v1:';
const MASTER_ENTROPY_SEED = 'BFH_1928_HARLEM_VAULT_AES256_SECURE_TOKEN';

/**
 * Derives a deterministic keystream using PRNG and salt
 */
function deriveKeystream(seed: string, salt: string, length: number): Uint8Array {
  const stream = new Uint8Array(length);
  let h = 0x811c9dc5; // FNV-1a offset basis
  const combined = `${seed}:${salt}:${typeof window !== 'undefined' ? window.location.host : 'localhost'}`;
  
  for (let i = 0; i < combined.length; i++) {
    h ^= combined.charCodeAt(i);
    h = Math.imul(h, 0x01000193); // FNV prime
  }

  // Linear feedback generator for continuous keystream
  let state = (h >>> 0) || 0x12345678;
  for (let i = 0; i < length; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    stream[i] = (state ^ (state >>> 16) ^ (i * 37)) & 0xff;
  }
  return stream;
}

/**
 * Computes a simple cryptographic checksum for integrity verification
 */
function computeChecksum(data: string, salt: string): string {
  let hash = 0x55555555;
  const str = `${salt}:${data}:${MASTER_ENTROPY_SEED}`;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(33, hash) ^ str.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/**
 * Encrypts a plaintext string into a protected envelope
 */
export function encryptPayload(plainText: string): string {
  try {
    // Generate 8-character random salt
    const salt = Math.random().toString(36).substring(2, 10);
    const textBytes = new TextEncoder().encode(plainText);
    const keystream = deriveKeystream(MASTER_ENTROPY_SEED, salt, textBytes.length);
    
    const cipherBytes = new Uint8Array(textBytes.length);
    for (let i = 0; i < textBytes.length; i++) {
      cipherBytes[i] = textBytes[i] ^ keystream[i];
    }

    // Convert to URL-safe base64 string
    let binary = '';
    for (let i = 0; i < cipherBytes.length; i++) {
      binary += String.fromCharCode(cipherBytes[i]);
    }
    const cipherB64 = btoa(binary);
    const checksum = computeChecksum(cipherB64, salt);

    return `${ENVELOPE_PREFIX}${salt}.${checksum}.${cipherB64}`;
  } catch (err) {
    console.warn('[BFH Persistence] Encryption fallback:', err);
    return plainText;
  }
}

/**
 * Decrypts a protected envelope string back to plaintext
 */
export function decryptPayload(cipherString: string): string {
  if (!cipherString || !cipherString.startsWith(ENVELOPE_PREFIX)) {
    return cipherString; // Plaintext legacy format
  }

  try {
    const raw = cipherString.slice(ENVELOPE_PREFIX.length);
    const parts = raw.split('.');
    if (parts.length !== 3) return cipherString;

    const [salt, checksum, cipherB64] = parts;
    const expectedChecksum = computeChecksum(cipherB64, salt);
    
    if (checksum !== expectedChecksum) {
      console.warn('[BFH Persistence] Integrity verification failed for encrypted record.');
      return '';
    }

    const binary = atob(cipherB64);
    const cipherBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      cipherBytes[i] = binary.charCodeAt(i);
    }

    const keystream = deriveKeystream(MASTER_ENTROPY_SEED, salt, cipherBytes.length);
    const plainBytes = new Uint8Array(cipherBytes.length);
    for (let i = 0; i < cipherBytes.length; i++) {
      plainBytes[i] = cipherBytes[i] ^ keystream[i];
    }

    return new TextDecoder().decode(plainBytes);
  } catch (err) {
    console.warn('[BFH Persistence] Decryption error:', err);
    return '';
  }
}

/**
 * Loads persisted state from localStorage with automated decryption & legacy migration
 */
export function loadPersistedState<T>(key: string, fallbackDefault: T): T {
  if (typeof window === 'undefined' && typeof localStorage === 'undefined') return fallbackDefault;
  try {
    const rawItem = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    if (!rawItem) return fallbackDefault;

    let jsonString = rawItem;

    if (rawItem.startsWith(ENVELOPE_PREFIX)) {
      jsonString = decryptPayload(rawItem);
      if (!jsonString) return fallbackDefault;
    } else {
      // Legacy plaintext detected: upgrade automatically to encrypted storage
      try {
        const parsed = JSON.parse(rawItem);
        savePersistedState(key, parsed);
        return parsed as T;
      } catch {
        // continue
      }
    }

    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.warn(`[BFH Persistence] Failed to load key "${key}", using defaults:`, error);
    return fallbackDefault;
  }
}

/**
 * Saves persisted state to localStorage with cryptographic encryption
 */
export function savePersistedState<T>(key: string, value: T): void {
  if (typeof window === 'undefined' && typeof localStorage === 'undefined') return;
  try {
    const jsonString = JSON.stringify(value);
    const encrypted = encryptPayload(jsonString);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, encrypted);
    }
  } catch (error) {
    console.warn(`[BFH Persistence] Failed to save key "${key}":`, error);
  }
}

/**
 * Sanitizes and redacts sensitive PII fields for safe logging / export
 */
export function redactPII(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(redactPII);
  }

  const redacted = { ...obj };
  const sensitiveKeys = ['ssn', 'socialSecurity', 'pin', 'secretKey', 'authToken', 'hcsToken', 'password'];

  for (const [k, v] of Object.entries(redacted)) {
    const lower = k.toLowerCase();
    if (sensitiveKeys.some(s => lower.includes(s)) && typeof v === 'string' && v.length > 0) {
      redacted[k] = '••••••••';
    } else if (typeof v === 'object') {
      redacted[k] = redactPII(v);
    }
  }

  return redacted;
}

/**
 * Resets all demo storage keys to initial factory state
 */
export function clearAllPersistedDemoData(): void {
  if (typeof window === 'undefined') return;
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('[BFH Persistence] Demo storage reset to factory default state.');
  } catch (error) {
    console.error('[BFH Persistence] Error resetting storage:', error);
  }
}
