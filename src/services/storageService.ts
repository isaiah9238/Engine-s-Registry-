/**
 * Firebase Cloud Storage Service for Agent Skill Bundles
 * Storage Structure:
 * └── /skills/{skillId}/
 *     ├── guidelines.md
 *     └── runtime.wasm / script.js
 */

import {
  ref,
  uploadString,
  getDownloadURL,
  getBytes,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { storage, storageBucketUrl, auth } from './firebase';

export interface SkillBundleFiles {
  guidelinesMd: string;
  runtimeScript: string;
  runtimeFilename: 'script.js' | 'runtime.wasm';
  storagePath: string; // gs://bucket/skills/{skillId}/
  downloadUrls?: {
    guidelines?: string;
    runtime?: string;
  };
}

export function getSkillBundleStoragePath(skillId: string): string {
  return `gs://${storageBucketUrl}/skills/${skillId}/`;
}

/**
 * Uploads a skill bundle to Firebase Cloud Storage (/skills/{skillId}/)
 */
export async function uploadSkillBundle(
  skillId: string,
  guidelinesMd: string,
  runtimeScript: string,
  runtimeFilename: 'script.js' | 'runtime.wasm' = 'script.js'
): Promise<SkillBundleFiles> {
  const basePath = `skills/${skillId}`;
  const gcsPath = getSkillBundleStoragePath(skillId);

  let guidelinesUrl: string | undefined;
  let runtimeUrl: string | undefined;

  try {
    // 1. Upload guidelines.md
    const guidelinesRef = ref(storage, `${basePath}/guidelines.md`);
    await uploadString(guidelinesRef, guidelinesMd, 'raw', {
      contentType: 'text/markdown; charset=utf-8',
      customMetadata: {
        skillId,
        uploadedBy: auth.currentUser?.email || 'agent-core',
      },
    });
    try {
      guidelinesUrl = await getDownloadURL(guidelinesRef);
    } catch {
      // ignore url error if restricted
    }

    // 2. Upload runtime.wasm or script.js
    const runtimeRef = ref(storage, `${basePath}/${runtimeFilename}`);
    const contentType = runtimeFilename === 'runtime.wasm'
      ? 'application/wasm'
      : 'application/javascript; charset=utf-8';

    await uploadString(runtimeRef, runtimeScript, 'raw', {
      contentType,
      customMetadata: {
        skillId,
        uploadedBy: auth.currentUser?.email || 'agent-core',
      },
    });
    try {
      runtimeUrl = await getDownloadURL(runtimeRef);
    } catch {
      // ignore
    }
  } catch (err) {
    console.warn('Firebase Cloud Storage upload notice (using memory cache):', err);
  }

  return {
    guidelinesMd,
    runtimeScript,
    runtimeFilename,
    storagePath: gcsPath,
    downloadUrls: {
      guidelines: guidelinesUrl,
      runtime: runtimeUrl,
    },
  };
}

/**
 * Downloads or inspects a skill bundle from Cloud Storage
 */
export async function getSkillBundle(
  skillId: string,
  fallbackGuidelines = '',
  fallbackScript = ''
): Promise<SkillBundleFiles> {
  const basePath = `skills/${skillId}`;
  const gcsPath = getSkillBundleStoragePath(skillId);

  let guidelinesMd = fallbackGuidelines;
  let runtimeScript = fallbackScript;
  let runtimeFilename: 'script.js' | 'runtime.wasm' = 'script.js';
  let guidelinesUrl: string | undefined;
  let runtimeUrl: string | undefined;

  try {
    const listRes = await listAll(ref(storage, basePath));
    for (const item of listRes.items) {
      if (item.name === 'guidelines.md') {
        try {
          guidelinesUrl = await getDownloadURL(item);
          const buf = await getBytes(item);
          guidelinesMd = new TextDecoder().decode(buf);
        } catch {
          // ignore
        }
      } else if (item.name === 'runtime.wasm' || item.name === 'script.js') {
        runtimeFilename = item.name as 'script.js' | 'runtime.wasm';
        try {
          runtimeUrl = await getDownloadURL(item);
          const buf = await getBytes(item);
          runtimeScript = new TextDecoder().decode(buf);
        } catch {
          // ignore
        }
      }
    }
  } catch {
    // Cloud storage bucket access might require configured CORS or auth
  }

  return {
    guidelinesMd,
    runtimeScript,
    runtimeFilename,
    storagePath: gcsPath,
    downloadUrls: {
      guidelines: guidelinesUrl,
      runtime: runtimeUrl,
    },
  };
}
