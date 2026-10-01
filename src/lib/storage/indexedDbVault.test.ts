import { describe, it, expect, beforeEach } from 'vitest';
import {
  storeVaultBlob,
  getVaultBlob,
  listVaultBlobsByCase,
  listVaultBlobsByCategory,
  deleteVaultBlob,
  getVaultStorageMetrics,
  clearVaultCategory
} from './indexedDbVault';

describe('indexedDbVault: Large Binary Blob Storage Engine', () => {
  beforeEach(async () => {
    await clearVaultCategory('memorial_media');
    await clearVaultCategory('case_documents');
    await clearVaultCategory('batesville_assets');
    await clearVaultCategory('offline_queue');
  });

  it('stores and retrieves binary memorial media blob with metadata', async () => {
    const mediaRecord = {
      id: 'photo-101',
      caseId: 'BFH-2026-0089',
      category: 'memorial_media' as const,
      name: 'Eleanor_Vance_Portrait_HighRes.jpg',
      mimeType: 'image/jpeg',
      data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...',
      metadata: { width: 1920, height: 1080, orientation: 'portrait' }
    };

    const stored = await storeVaultBlob(mediaRecord);
    expect(stored).toBeDefined();
    expect(stored.id).toBe('photo-101');
    expect(stored.sizeBytes).toBeGreaterThan(0);

    const retrieved = await getVaultBlob('memorial_media', 'photo-101');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Eleanor_Vance_Portrait_HighRes.jpg');
    expect(retrieved?.caseId).toBe('BFH-2026-0089');
    expect(retrieved?.metadata?.width).toBe(1920);
  });

  it('lists all documents and media associated with a specific case ID', async () => {
    await storeVaultBlob({
      id: 'ap47-signed',
      caseId: 'BFH-2026-0089',
      category: 'case_documents',
      name: 'NYS_Form_AP47_Signed.pdf',
      mimeType: 'application/pdf',
      data: 'JVBERi0xLjQKJ...'
    });

    await storeVaultBlob({
      id: 'portrait-1',
      caseId: 'BFH-2026-0089',
      category: 'memorial_media',
      name: 'Family_Slideshow_01.jpg',
      mimeType: 'image/jpeg',
      data: 'data:image/jpeg;base64,...'
    });

    await storeVaultBlob({
      id: 'other-case-doc',
      caseId: 'BFH-2026-0099',
      category: 'case_documents',
      name: 'Unrelated_Case_Doc.pdf',
      mimeType: 'application/pdf',
      data: 'JVBERi0x...'
    });

    const caseBlobs = await listVaultBlobsByCase('BFH-2026-0089');
    expect(caseBlobs.length).toBe(2);
    expect(caseBlobs.map(b => b.id)).toContain('ap47-signed');
    expect(caseBlobs.map(b => b.id)).toContain('portrait-1');

    const catBlobs = await listVaultBlobsByCategory('case_documents');
    expect(catBlobs.length).toBe(2);
    expect(catBlobs.map(b => b.id)).toContain('ap47-signed');
    expect(catBlobs.map(b => b.id)).toContain('other-case-doc');
  });

  it('computes storage metrics across all vault categories', async () => {
    await storeVaultBlob({
      id: 'casket-3d-model',
      category: 'batesville_assets',
      name: 'Batesville_Franklin_Cherry_3D.glb',
      mimeType: 'model/gltf-binary',
      data: 'glTF-mock-binary-data-stream'
    });

    const metrics = await getVaultStorageMetrics();
    expect(metrics.totalBlobs).toBeGreaterThan(0);
    expect(metrics.totalBytes).toBeGreaterThan(0);
    expect(metrics.formattedSize).toBeDefined();
    expect(metrics.categoryCounts.batesville_assets).toBe(1);
  });

  it('deletes blobs and supports category clearing', async () => {
    await storeVaultBlob({
      id: 'temp-upload',
      category: 'offline_queue',
      name: 'Pending_First_Call_Sync.json',
      mimeType: 'application/json',
      data: JSON.stringify({ decedent: 'Test' })
    });

    const beforeDelete = await getVaultBlob('offline_queue', 'temp-upload');
    expect(beforeDelete).not.toBeNull();

    const deleted = await deleteVaultBlob('offline_queue', 'temp-upload');
    expect(deleted).toBe(true);

    const afterDelete = await getVaultBlob('offline_queue', 'temp-upload');
    expect(afterDelete).toBeNull();
  });
});
