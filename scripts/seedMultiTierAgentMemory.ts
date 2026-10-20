import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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
    })
  : getApp();

const db = getFirestore(app, targetDatabaseId);
const ai = new GoogleGenAI({ apiKey: process.env.apiKey || '' });

async function seed() {
  console.log('[Seed] Seeding multi-tier-agent-memory skill into database:', targetDatabaseId);

  const manifest = JSON.parse(fs.readFileSync('skills/multi-tier-agent-memory-skill/manifest.json', 'utf8'));
  const guidelines = fs.readFileSync('skills/multi-tier-agent-memory-skill/guidelines.md', 'utf8');

  let embedding: number[] = [];
  try {
    const embedRes = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: `${manifest.title} ${guidelines.slice(0, 4000)} ${manifest.category}`,
      config: { outputDimensionality: 768 },
    });
    embedding = embedRes.embeddings?.[0]?.values || [];
  } catch (err) {
    console.warn('[Seed] Embedding note:', err);
  }

  const skillDoc = {
    id: manifest.name,
    name: manifest.name,
    title: manifest.title,
    description: 'Manages episodic working memory, persistent 768-D vector semantic recall via Firestore, and immutable procedural rule injection.',
    category: manifest.category,
    version: manifest.version,
    status: 'verified',
    isPublic: true,
    securityClearance: manifest.securityClearance || 'public',
    isExecutable: manifest.isExecutable ?? true,
    runtime: manifest.runtime || 'in_process',
    authorId: 'isaiah9238@gmail.com',
    authorEmail: 'isaiah9238@gmail.com',
    skillMarkdown: guidelines,
    parametersSchema: manifest.parametersSchema,
    parameters: JSON.stringify(manifest.parametersSchema, null, 2),
    embedding,
    updatedAt: new Date().toISOString(),
  };

  await db.collection('skills').doc(manifest.name).set(skillDoc, { merge: true });
  console.log(`[Seed] Successfully seeded ${manifest.name} with ${embedding.length}-dim vector!`);
}

seed().catch(console.error);
