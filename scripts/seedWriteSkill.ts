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

// 2. Load latest guidelines markdown
const guidelinesFilePath = 'skills/write-skill/guidelines.md';
const GUIDELINES_MD = fs.existsSync(guidelinesFilePath)
  ? fs.readFileSync(guidelinesFilePath, 'utf8')
  : `---
name: write-skill
title: "Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine"
description: >
  Enables autonomous agents to design, author, audit, validate, and register new SKILL.md files.
  Evaluates existing skill logic to improve output quality, prevent redundancy, and systematically
  determine which skill in the registry is best for a given job.
version: 1.3.0
category: orchestration
securityClearance: public
isExecutable: true
runtime: in_process
---
# Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine
`;

const SCRIPT_JS = `/**
 * In-process runtime handler for write-skill
 */
export async function execute(params) {
  const { skillName, title, mission, targetCapabilities, parametersList, examplesList } = params;
  
  const errors = [];
  if (!Array.isArray(targetCapabilities) || targetCapabilities.length === 0) {
    errors.push('targetCapabilities must be a non-empty array.');
  }
  if (!skillName || !/^[a-z0-9-_]+$/.test(skillName)) {
    errors.push('skillName must be valid kebab-case string.');
  }
  if (!title || typeof title !== 'string') {
    errors.push('title is required.');
  }
  if (!mission || typeof mission !== 'string') {
    errors.push('mission is required.');
  }
  if (!Array.isArray(parametersList) || parametersList.length === 0) {
    errors.push('parametersList must be a non-empty array.');
  }
  if (!Array.isArray(examplesList) || examplesList.length === 0) {
    errors.push('examplesList must be a non-empty array.');
  }

  if (errors.length > 0) {
    return {
      success: false,
      validationErrors: errors,
      timestamp: new Date().toISOString()
    };
  }

  const manifest = {
    skillId: skillName,
    name: skillName,
    title: title.trim(),
    mission: mission.trim(),
    targetCapabilities,
    parametersDeclared: parametersList.length,
    examplesDeclared: examplesList.length,
    validatedAt: new Date().toISOString(),
    status: 'draft'
  };

  return {
    success: true,
    manifest,
    message: \`Skill \${skillName} validated and ready for ingestion pipeline.\`
  };
}
`;

async function main() {
  const skillId = 'write-skill';
  console.log(`Starting ingestion pipeline for [${skillId}]...`);

  // 1. Upload Cloud Storage Files
  console.log('Uploading guidelines.md and script.js to Firebase Storage...');
  const basePath = `skills/${skillId}`;
  
  try {
    await bucket.file(`${basePath}/guidelines.md`).save(GUIDELINES_MD, {
      metadata: { contentType: 'text/markdown' },
    });

    await bucket.file(`${basePath}/script.js`).save(SCRIPT_JS, {
      metadata: { contentType: 'application/javascript' },
    });
  } catch (storageErr: any) {
    console.warn('[Seed] Cloud storage notice (skipping file upload):', storageErr?.message || storageErr);
  }

  const bundleStoragePath = `gs://${bucket.name}/${basePath}/`;
  const guidelinesUri = `${bundleStoragePath}guidelines.md`;
  const runtimeScriptUri = `${bundleStoragePath}script.js`;

  // 2. Compute 768-dim Vector Embedding
  console.log('Generating 768-dim vector embedding with @google/genai...');
  const semanticSource = `Title: Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine
Description: Enables autonomous agents to design, author, audit, validate, and register new SKILL.md files. Evaluates existing skill logic to improve output quality, prevent redundancy, and systematically determine which skill in the registry is best for a given job.
Category: orchestration
Preconditions: User requests creation of new agent skill; Agent requires procedural self-improvement; Determining which skill is best for a job; Auditing or upgrading existing SKILL.md documents
Routing Keywords: meta-skill, author-skill, write-skill, evaluate-skill, best-skill, registry, ingestion
Best Suited For: Bootstrapping new agent engine skills; Routing incoming prompts to optimal skills; Auditing prompt drift in legacy skills`;

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
  } catch (embedErr: any) {
    console.warn('[Seed] Embedding notice:', embedErr?.message || embedErr);
  }

  // 3. Upsert Firestore Document
  console.log(`Writing record to Firestore at /skills/${skillId}...`);
  const now = new Date().toISOString();

  await db.collection('skills').doc(skillId).set({
    id: skillId,
    name: 'write-skill',
    title: 'Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine',
    description: 'Enables autonomous agents to design, author, audit, validate, and register new SKILL.md files. Evaluates existing skill logic to improve output quality, prevent redundancy, and systematically determine which skill in the registry is best for a given job.',
    category: 'orchestration',
    version: '1.3.0',
    status: 'published',
    isPublic: true,
    authorId: 'system-architect',
    authorEmail: 'isaiahmsmith@aihomev2.com',
    securityClearance: 'public',
    isExecutable: true,
    runtime: 'in_process',
    sourceReferences: [
      'notebook://studio-alchemist/meta-authoring.ipynb',
      'https://agent-engine.internal/specs/skill-v1'
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        skillName: { type: 'string', description: 'Kebab-case machine identifier slug.' },
        title: { type: 'string', description: 'Human-readable title.' },
        mission: { type: 'string', description: 'Concise statement of operational boundaries.' },
        targetCapabilities: { type: 'array', description: 'Encapsulated tools, APIs, and reasoning patterns.' },
        parametersList: { type: 'array', description: 'Explicit inputs with types and constraints.' },
        examplesList: { type: 'array', description: 'Multi-turn walkthrough examples.' }
      },
      required: ['skillName', 'title', 'mission', 'targetCapabilities', 'parametersList', 'examplesList']
    },
    skillMarkdown: GUIDELINES_MD,
    ...(embeddingVector.length > 0 ? { embedding: FieldValue.vector(embeddingVector) } : {}),
    bundleStoragePath,
    bundleFiles: {
      guidelinesMd: guidelinesUri,
      runtimeScript: runtimeScriptUri,
      runtimeFilename: 'script.js'
    },
    summaryJson: JSON.stringify({
      schemaVersion: '2026.1',
      skillId,
      name: 'write-skill',
      title: 'Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine',
      description: 'Enables autonomous agents to design, author, audit, validate, and register new SKILL.md files. Evaluates existing skill logic to improve output quality, prevent redundancy, and systematically determine which skill in the registry is best for a given job.',
      category: 'orchestration',
      version: '1.3.0',
      runtime: 'in_process',
      isExecutable: true,
      securityClearance: 'public',
      triggerPreconditions: [
        'User requests creation of new agent skill',
        'Agent requires procedural self-improvement',
        'Determining which skill is best for a job',
        'Auditing or upgrading existing SKILL.md documents'
      ],
      routingKeywords: ['meta-skill', 'author-skill', 'write-skill', 'evaluate-skill', 'best-skill', 'registry', 'ingestion'],
      dependencies: {
        npm: ['js-yaml', '@types/node'],
        oauthScopes: ['https://www.googleapis.com/auth/drive.file']
      },
      evaluationRubric: {
        priority: 1,
        thermodynamicFootprint: 'low',
        requiresHumanReview: false,
        verificationLevel: 'strict'
      },
      bestSuitedFor: ['Bootstrapping new agent engine skills', 'Routing incoming prompts to optimal skills', 'Auditing prompt drift in legacy skills'],
      unsuitedFor: ['Simple one-off questions without procedural workflow requirements']
    }),
    createdAt: now,
    updatedAt: now,
  }, { merge: true });

  console.log(`Successfully registered and bundled [${skillId}].`);
}

main().catch((err) => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});