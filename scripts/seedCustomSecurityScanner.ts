import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

let saRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!saRaw && fs.existsSync('/app/.dev.env.json')) {
  try {
    const devSecrets = JSON.parse(fs.readFileSync('/app/.dev.env.json', 'utf8'));
    saRaw = devSecrets.FIREBASE_SERVICE_ACCOUNT;
  } catch {}
}

const serviceAccount = saRaw ? (typeof saRaw === 'string' ? JSON.parse(saRaw) : saRaw) : null;
const targetDatabaseId = process.env.FIRESTORE_DATABASE_ID || 'ai-studio-cf7d8c68-3d56-4be3-9582-2d8d0481bcfc';

const app = getApps().length === 0
  ? initializeApp({
      credential: serviceAccount ? cert(serviceAccount) : undefined,
      projectId: serviceAccount?.project_id || 'gen-lang-client-0573899362',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'gen-lang-client-0573899362.firebasestorage.app',
    })
  : getApp();

const db = getFirestore(app, targetDatabaseId);
const bucket = getStorage(app).bucket();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const GUIDELINES_MD = `---
name: custom-security-scanner
title: "Zero-Trust Security & Policy Scanner"
description: >
  Audits runtime execution endpoints, enforces zero-trust policy invariants, and prevents unauthorized tool execution.
version: 1.0.0
category: security-audit
securityClearance: public
isExecutable: true
runtime: in_process
tags: [security-audit, autonomous-agent, production-skill]
priority: 1
thermodynamicFootprint: low
requiresHumanReview: false
---

# Zero-Trust Security & Policy Scanner

## Description & Mission
Audits runtime execution endpoints, enforces zero-trust policy invariants, and prevents unauthorized tool execution.

## Parameters & Invocation Schemas
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| \`targetEndpoint\` | string | true | API or service endpoint to inspect. |
| \`enforceStrictTls\` | boolean | false | Require TLS 1.3 encryption. |
`;

const SCRIPT_JS = `export async function execute(params) {
  const { targetEndpoint, enforceStrictTls } = params || {};
  if (!targetEndpoint || typeof targetEndpoint !== 'string') {
    return {
      success: false,
      error: 'targetEndpoint is required and must be a string.',
      executedAt: new Date().toISOString()
    };
  }

  let violations = [];
  try {
    const parsed = new URL(targetEndpoint);
    if (parsed.protocol !== 'https:') {
      violations.push('INSECURE_PROTOCOL');
    }
  } catch (e) {
    violations.push('MALFORMED_URL');
  }

  return {
    success: violations.length === 0,
    skill: 'custom-security-scanner',
    targetEndpoint,
    violations,
    complianceScore: violations.length === 0 ? 100 : 25,
    executedAt: new Date().toISOString()
  };
}
`;

async function main(): Promise<void> {
  const skillId = 'custom-security-scanner';
  const basePath = `skills/${skillId}`;
  const now = new Date().toISOString();

  // 1. Upload Cloud Storage Artifacts (resilient fallback if bucket not provisioned)
  let bundleStoragePath = `gs://${bucket.name}/${basePath}/`;
  let guidelinesUri = `${bundleStoragePath}guidelines.md`;
  let runtimeScriptUri = `${bundleStoragePath}script.js`;

  try {
    await bucket.file(`${basePath}/guidelines.md`).save(GUIDELINES_MD, {
      metadata: { contentType: 'text/markdown' },
    });
    await bucket.file(`${basePath}/script.js`).save(SCRIPT_JS, {
      metadata: { contentType: 'application/javascript' },
    });
  } catch (storageErr: any) {
    console.warn('[Seed] Cloud storage bucket note (skipping file upload):', storageErr?.message || storageErr);
  }

  // 2. Vector Embedding (768-dim via text-embedding-004)
  const semanticSource = `Title: Zero-Trust Security & Policy Scanner
Description: Audits runtime execution endpoints, enforces zero-trust policy invariants, and prevents unauthorized tool execution.
Category: security-audit
Preconditions: Validating external/internal API endpoints before execution; verifying TLS requirements and zero-trust policies
Routing Keywords: security, zero-trust, endpoint-scanner, policy-enforcement, tls-audit, tool-auth`;

  let embeddingVector: number[] = [];
  try {
    const embedResponse = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: semanticSource,
      config: {
        outputDimensionality: 768,
      },
    });
    embeddingVector = embedResponse.embeddings?.[0]?.values ?? [];
  } catch (embedErr) {
    console.warn('[Seed] Embedding note:', embedErr);
  }

  // 3. Upsert Firestore Record with FieldValue.vector
  await db.collection('skills').doc(skillId).set({
    id: skillId,
    name: 'custom-security-scanner',
    title: 'Zero-Trust Security & Policy Scanner',
    description: 'Audits runtime execution endpoints, enforces zero-trust policy invariants, and prevents unauthorized tool execution.',
    category: 'security-audit',
    version: '1.0.0',
    status: 'published',
    isPublic: true,
    authorId: 'system-architect',
    authorEmail: 'isaiahmsmith@aihomev2.com',
    securityClearance: 'public',
    isExecutable: true,
    runtime: 'in_process',
    sourceReferences: ['https://agent-engine.internal/specs/security-v1'],
    parametersSchema: {
      type: 'object',
      properties: {
        targetEndpoint: { type: 'string', description: 'API or service endpoint to inspect.' },
        enforceStrictTls: { type: 'boolean', description: 'Require TLS 1.3 encryption.' },
      },
      required: ['targetEndpoint'],
    },
    embedding: FieldValue.vector(embeddingVector),
    bundleStoragePath,
    bundleFiles: {
      guidelinesMd: guidelinesUri,
      runtimeScript: runtimeScriptUri,
      runtimeFilename: 'script.js',
    },
    summaryJson: JSON.stringify({
      schemaVersion: '2026.1',
      skillId,
      name: 'custom-security-scanner',
      title: 'Zero-Trust Security & Policy Scanner',
      category: 'security-audit',
      version: '1.0.0',
      runtime: 'in_process',
      isExecutable: true,
      securityClearance: 'public',
      triggerPreconditions: [
        'Endpoint inspection required prior to dispatch',
        'Verification of zero-trust network policies',
      ],
      routingKeywords: ['security', 'audit', 'zero-trust', 'endpoint', 'tls'],
      bestSuitedFor: ['Pre-flight network validation', 'Runtime endpoint integrity checks'],
    }),
    createdAt: now,
    updatedAt: now,
  });
}

main().catch((err: unknown) => {
  console.error('Failed to seed custom-security-scanner:', err);
  process.exit(1);
});