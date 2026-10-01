/**
 * Benta's Funeral Home (BFH OS) - Offline-First IndexedDB Vault
 * 
 * Provides resilient high-capacity binary blob storage for:
 * 1. High-resolution memorial photography and tribute slideshow media.
 * 2. Scanned Form AP-47, Death Certificates, and DocuSign PDF binaries.
 * 3. Batesville Casket HD dimensional assets & wood finish textures.
 * 4. Offline action sync queue for directors operating at remote church/cemetery locations.
 */

export type VaultStoreCategory = 
  | 'memorial_media' 
  | 'case_documents' 
  | 'batesville_assets' 
  | 'offline_queue';

export interface VaultBlobRecord {
  id: string;
  caseId?: string;
  category: VaultStoreCategory;
  name: string;
  mimeType: string;
  data: Blob | string | ArrayBuffer;
  sizeBytes: number;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface VaultStorageMetrics {
  totalBlobs: number;
  totalBytes: number;
  formattedSize: string;
  categoryCounts: Record<VaultStoreCategory, number>;
}

const DB_NAME = 'bfh_digital_vault_db';
const DB_VERSION = 1;

// In-memory mock fallback for SSR or environments where IDB is unavailable
const memoryFallbackVault = new Map<string, VaultBlobRecord>();

/**
 * Calculates byte size of arbitrary data
 */
function calculateDataSize(data: Blob | string | ArrayBuffer): number {
  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    return data.size;
  }
  if (typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer) {
    return data.byteLength;
  }
  if (typeof data === 'string') {
    return new TextEncoder().encode(data).length;
  }
  return 0;
}

/**
 * Opens or initializes the IndexedDB database instance
 */
export function openVaultDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported in this environment.'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Memorial Media Store
      if (!db.objectStoreNames.contains('memorial_media')) {
        const store = db.createObjectStore('memorial_media', { keyPath: 'id' });
        store.createIndex('caseId', 'caseId', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 2. Case Documents Store
      if (!db.objectStoreNames.contains('case_documents')) {
        const store = db.createObjectStore('case_documents', { keyPath: 'id' });
        store.createIndex('caseId', 'caseId', { unique: false });
        store.createIndex('mimeType', 'mimeType', { unique: false });
      }

      // 3. Batesville Casket Assets Store
      if (!db.objectStoreNames.contains('batesville_assets')) {
        const store = db.createObjectStore('batesville_assets', { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: false });
      }

      // 4. Offline Actions Sync Queue
      if (!db.objectStoreNames.contains('offline_queue')) {
        const store = db.createObjectStore('offline_queue', { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Stores a binary blob or file into IndexedDB with fallback
 */
export async function storeVaultBlob(
  record: Omit<VaultBlobRecord, 'sizeBytes' | 'createdAt' | 'updatedAt'> & {
    data: Blob | string | ArrayBuffer;
    createdAt?: number;
    updatedAt?: number;
  }
): Promise<VaultBlobRecord> {
  const now = Date.now();
  const sizeBytes = calculateDataSize(record.data);

  const fullRecord: VaultBlobRecord = {
    ...record,
    sizeBytes,
    createdAt: record.createdAt || now,
    updatedAt: record.updatedAt || now
  };

  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(record.category, 'readwrite');
      const store = tx.objectStore(record.category);
      const req = store.put(fullRecord);

      req.onsuccess = () => resolve(fullRecord);
      req.onerror = () => reject(req.error);
    });
  } catch {
    // In-memory fallback
    const key = `${record.category}:${record.id}`;
    memoryFallbackVault.set(key, fullRecord);
    return fullRecord;
  }
}

/**
 * Retrieves a blob record by category and ID
 */
export async function getVaultBlob(
  category: VaultStoreCategory,
  id: string
): Promise<VaultBlobRecord | null> {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(category, 'readonly');
      const store = tx.objectStore(category);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    const key = `${category}:${id}`;
    return memoryFallbackVault.get(key) || null;
  }
}

/**
 * Lists all blobs belonging to a specific case number / ID
 */
export async function listVaultBlobsByCase(
  caseId: string
): Promise<VaultBlobRecord[]> {
  const results: VaultBlobRecord[] = [];

  try {
    const db = await openVaultDB();
    const categories: VaultStoreCategory[] = ['memorial_media', 'case_documents'];

    for (const cat of categories) {
      const catResults = await new Promise<VaultBlobRecord[]>((resolve, reject) => {
        const tx = db.transaction(cat, 'readonly');
        const store = tx.objectStore(cat);
        const index = store.index('caseId');
        const req = index.getAll(caseId);

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
      results.push(...catResults);
    }
    return results;
  } catch {
    for (const item of memoryFallbackVault.values()) {
      if (item.caseId === caseId) {
        results.push(item);
      }
    }
    return results;
  }
}

/**
 * Lists all blobs in a given category
 */
export async function listVaultBlobsByCategory(
  category: VaultStoreCategory
): Promise<VaultBlobRecord[]> {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(category, 'readonly');
      const store = tx.objectStore(category);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    const list: VaultBlobRecord[] = [];
    for (const item of memoryFallbackVault.values()) {
      if (item.category === category) {
        list.push(item);
      }
    }
    return list;
  }
}

/**
 * Deletes a blob from the vault
 */
export async function deleteVaultBlob(
  category: VaultStoreCategory,
  id: string
): Promise<boolean> {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(category, 'readwrite');
      const store = tx.objectStore(category);
      const req = store.delete(id);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch {
    const key = `${category}:${id}`;
    return memoryFallbackVault.delete(key);
  }
}

/**
 * Computes storage usage metrics across all IndexedDB stores
 */
export async function getVaultStorageMetrics(): Promise<VaultStorageMetrics> {
  const categories: VaultStoreCategory[] = [
    'memorial_media',
    'case_documents',
    'batesville_assets',
    'offline_queue'
  ];

  let totalBlobs = 0;
  let totalBytes = 0;
  const categoryCounts: Record<VaultStoreCategory, number> = {
    memorial_media: 0,
    case_documents: 0,
    batesville_assets: 0,
    offline_queue: 0
  };

  try {
    const db = await openVaultDB();
    for (const cat of categories) {
      const items = await new Promise<VaultBlobRecord[]>((resolve, reject) => {
        const tx = db.transaction(cat, 'readonly');
        const store = tx.objectStore(cat);
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });

      categoryCounts[cat] = items.length;
      totalBlobs += items.length;
      for (const it of items) {
        totalBytes += it.sizeBytes || 0;
      }
    }
  } catch {
    for (const it of memoryFallbackVault.values()) {
      categoryCounts[it.category] = (categoryCounts[it.category] || 0) + 1;
      totalBlobs += 1;
      totalBytes += it.sizeBytes || 0;
    }
  }

  const mb = totalBytes / (1024 * 1024);
  const formattedSize = mb > 1 ? `${mb.toFixed(2)} MB` : `${(totalBytes / 1024).toFixed(1)} KB`;

  return {
    totalBlobs,
    totalBytes,
    formattedSize,
    categoryCounts
  };
}

/**
 * Clears an entire storage category
 */
export async function clearVaultCategory(
  category: VaultStoreCategory
): Promise<void> {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(category, 'readwrite');
      const store = tx.objectStore(category);
      const req = store.clear();

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    for (const [key, item] of memoryFallbackVault.entries()) {
      if (item.category === category) {
        memoryFallbackVault.delete(key);
      }
    }
  }
}
