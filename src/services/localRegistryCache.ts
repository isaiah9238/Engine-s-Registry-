/**
 * Client Local Registry Cache (IndexedDB / Local Storage)
 * Schema follows specification:
 * interface CachedSkillRecord {
 *   skillId: string;
 *   name: string;
 *   version: string;
 *   runtime: 'mcp' | 'in_process' | 'cloud_function';
 *   securityClearance: 'public' | 'internal' | 'admin-only';
 *   parametersSchema: Record<string, any>;
 *   guidelinesMd: string;
 *   bundleSha256?: string;
 *   binaryBlob?: ArrayBuffer;
 *   lastSyncedAt: number;
 * }
 */

import type { CachedSkillRecord, SkillRecord } from '../types/skill';

const DB_NAME = 'AgentEngineLocalRegistry';
const STORE_NAME = 'skills_cache';
const DB_VERSION = 1;
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// In-memory fallback
const memoryCache = new Map<string, CachedSkillRecord>();

async function getDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return null;
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'skillId' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Calculates SHA-256 hash string for checksum verification
 */
export async function calculateSha256(content: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const buffer = new TextEncoder().encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // ignore
    }
  }
  // Simple deterministic fallback hash
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = (hash << 5) - hash + content.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Stores a skill in the local IndexedDB registry cache
 */
export async function cacheSkillLocally(skill: SkillRecord): Promise<CachedSkillRecord> {
  const guidelinesMd = skill.bundleFiles?.guidelinesMd || skill.skillMarkdown || '';
  const scriptContent = skill.bundleFiles?.runtimeScript || '';
  const bundleSha256 = await calculateSha256(guidelinesMd + scriptContent);

  const cachedRecord: CachedSkillRecord = {
    skillId: skill.id,
    name: skill.name,
    version: skill.version,
    runtime: (skill.runtime as any) || 'in_process',
    securityClearance: skill.securityClearance || 'public',
    parametersSchema: skill.parametersSchema || {},
    guidelinesMd,
    bundleSha256,
    binaryBlob: new TextEncoder().encode(scriptContent).buffer,
    lastSyncedAt: Date.now(),
  };

  memoryCache.set(skill.id, cachedRecord);

  const db = await getDB();
  if (db) {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(cachedRecord);
    } catch (err) {
      console.warn('IndexedDB write error:', err);
    }
  }

  return cachedRecord;
}

/**
 * Retrieves a skill from the local registry cache
 */
export async function getCachedSkill(skillId: string): Promise<CachedSkillRecord | null> {
  const db = await getDB();
  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(skillId);
        req.onsuccess = () => resolve(req.result || memoryCache.get(skillId) || null);
        req.onerror = () => resolve(memoryCache.get(skillId) || null);
      } catch {
        resolve(memoryCache.get(skillId) || null);
      }
    });
  }
  return memoryCache.get(skillId) || null;
}

/**
 * Retrieves all locally cached skills
 */
export async function getAllCachedSkills(): Promise<CachedSkillRecord[]> {
  const db = await getDB();
  if (db) {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).getAll();
        req.onsuccess = () => resolve(req.result || Array.from(memoryCache.values()));
        req.onerror = () => resolve(Array.from(memoryCache.values()));
      } catch {
        resolve(Array.from(memoryCache.values()));
      }
    });
  }
  return Array.from(memoryCache.values());
}

/**
 * Evicts expired items from the local cache based on TTL
 */
export async function evictExpiredCache(ttlMs = DEFAULT_TTL_MS): Promise<number> {
  const now = Date.now();
  let count = 0;

  // Clear memory cache
  for (const [id, record] of memoryCache.entries()) {
    if (now - record.lastSyncedAt > ttlMs) {
      memoryCache.delete(id);
      count++;
    }
  }

  const db = await getDB();
  if (db) {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const all: CachedSkillRecord[] = req.result || [];
        for (const item of all) {
          if (now - item.lastSyncedAt > ttlMs) {
            store.delete(item.skillId);
            count++;
          }
        }
      };
    } catch {
      // ignore
    }
  }

  return count;
}
