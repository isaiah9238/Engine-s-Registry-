import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { initializeApp as initAdminApp, getApps as getAdminApps, getApp as getAdminApp, cert } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Prevent unhandled exceptions or rejections from terminating the dev server process
process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught exception (kept alive):', err?.message || err);
});

process.on('unhandledRejection', (reason: any) => {
  console.error('[Server] Unhandled rejection (kept alive):', reason?.message || reason);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy-resolve Gemini API key from environment or secrets file
let cachedAiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (cachedAiClient) return cachedAiClient;
  let apiKey = process.env.GEMINI_API_KEY || '';
  try {
    if (!apiKey && fs.existsSync('/app/.dev.env.json')) {
      const devSecrets = JSON.parse(fs.readFileSync('/app/.dev.env.json', 'utf8'));
      apiKey = devSecrets.GEMINI_API_KEY || '';
    }
  } catch {
    // ignore
  }
  cachedAiClient = new GoogleGenAI({ apiKey: apiKey || 'placeholder-key' });
  return cachedAiClient;
}

// Initialize Firebase Admin SDK with Service Account Key (idempotent)
let adminDb: FirebaseFirestore.Firestore | null = null;
let adminAuth: any = null;
let adminAppInfo: { projectId?: string; clientEmail?: string; databaseId?: string } | null = null;

function initFirebaseAdmin() {
  if (adminDb) return;
  try {
    let saRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!saRaw && fs.existsSync('/app/.dev.env.json')) {
      const devSecrets = JSON.parse(fs.readFileSync('/app/.dev.env.json', 'utf8'));
      saRaw = devSecrets.FIREBASE_SERVICE_ACCOUNT;
    }

    if (saRaw) {
      const serviceAccount = typeof saRaw === 'string' ? JSON.parse(saRaw) : saRaw;
      const targetDatabaseId =
        process.env.FIRESTORE_DATABASE_ID || 'ai-studio-cf7d8c68-3d56-4be3-9582-2d8d0481bcfc';

      const adminApp =
        getAdminApps().length === 0
          ? initAdminApp({
              credential: cert(serviceAccount),
              projectId: serviceAccount.project_id || 'gen-lang-client-0573899362',
              storageBucket:
                process.env.FIREBASE_STORAGEBUCKET || 'gen-lang-client-0573899362.firebasestorage.app',
            })
          : getAdminApp();

      adminDb = getAdminFirestore(adminApp, targetDatabaseId);
      adminAuth = getAdminAuth(adminApp);
      adminAppInfo = {
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        databaseId: targetDatabaseId,
      };
      console.log(
        `[Firebase Admin] Authenticated with Service Account (${serviceAccount.client_email}) for database ${targetDatabaseId}`
      );
    }
  } catch (adminErr: any) {
    console.warn('[Firebase Admin] Notice during initialization:', adminErr?.message || adminErr);
  }
}

initFirebaseAdmin();

async function startServer() {
  const app = express();
  const port = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route: Generate standard 768-dimensional Vector Embeddings for Dynamic Tool Selection & Agent Memories
  app.post('/api/embed', async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Text string is required for vector embedding' });
        return;
      }

      const response = await getAi().models.embedContent({
        model: 'gemini-embedding-001',
        contents: text.slice(0, 8000),
        config: {
          outputDimensionality: 768,
        },
      });

      const values = response.embeddings?.[0]?.values || [];
      res.json({
        embedding: values,
        dimensions: values.length,
        model: 'gemini-embedding-001',
      });
    } catch (err: any) {
      console.warn('Gemini vector embedding server notice:', err?.message || err);
      res.status(500).json({
        error: err?.message || 'Failed to generate 768-dim vector embedding',
      });
    }
  });

  // API Route: Gemini Skill Architect Chat Bot
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { messages, context } = req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: 'Messages array is required' });
        return;
      }

      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const systemInstruction = `You are the Gemini Skill Architect Copilot, embedded directly into the Agent Engine & Skill Registry Studio.
Your role is to guide and assist users in designing, writing, auditing, formatting, and refining autonomous agent skills according to the SKILL.md specification and progressive disclosure standards.

Knowledge & Frameworks You Master:
1. Template 1: Basic Open Standard (Instruction-Only lightweight markdown guidance)
2. Template 2: Studio Alchemist Enterprise Standard (Progressive Disclosure, pinned CLI commands like "npx -y firebase-tools@latest", referenced docs)
3. Template 3: Strobes 4-Layer Methodology (Methodology Layer SKILL.md, Scripts Layer scripts/, Shared Library scripts/lib/, Data Layer project.db SQLite, 6 operational assessment phases)
4. Template 4: write-skill Meta-Skill Ingestion Payload (parametersSchema map, 768-dim vector text representation, machine-digestible JSON contracts, deterministic in-process validators)

Operational Principles:
- Zero-Pill Discipline: Never generate empty conversational filler or vague fluff. Every sentence must establish a concrete operational boundary, trigger condition, or instruction.
- Schema Invariance: Clearly specify parameter names, types (string, number, boolean, object, array), and required flags.
- Positive Instruction: State clearly what the agent MUST do rather than only listing negative restrictions.

When the user asks you to create or improve a skill, output production-ready Markdown with valid YAML frontmatter and well-structured Markdown sections (# Title, ## Description & Mission, ## When to Use, ## When NOT to Use, ## Parameters, ## Instructions / Phases, ## Examples, ## Scaffolding).

${context ? `Studio Active Context:\n${JSON.stringify(context, null, 2)}` : ''}`;

      let response;
      let usedModel = 'gemini-3.1-flash-lite';
      try {
        response = await getAi().models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
      } catch (primaryErr: any) {
        console.warn('Primary model gemini-3.1-flash-lite fallback notice:', primaryErr?.message || primaryErr);
        usedModel = 'gemini-3.8-flash';
        response = await getAi().models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
      }

      const reply = response.text || 'I could not generate a response. Please try again.';
      res.json({
        reply,
        model: usedModel,
      });
    } catch (err: any) {
      console.error('Gemini chat error:', err?.message || err);
      res.status(500).json({
        error: err?.message || 'Failed to generate chat response from Gemini',
      });
    }
  });

  // API Route: Server-Side Firestore Skills Management (Powered by Firebase Admin)
  app.get('/api/skills', async (_req: Request, res: Response) => {
    try {
      initFirebaseAdmin();
      if (!adminDb) {
        res.status(503).json({ error: 'Firebase Admin SDK not initialized' });
        return;
      }
      const snapshot = await adminDb.collection('skills').get();
      const skills = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      res.json({ skills, count: skills.length });
    } catch (err: any) {
      console.error('Failed to query skills via Firebase Admin:', err);
      res.status(500).json({ error: err?.message || 'Failed to fetch skills' });
    }
  });

  app.post('/api/skills', async (req: Request, res: Response) => {
    try {
      initFirebaseAdmin();
      if (!adminDb) {
        res.status(503).json({ error: 'Firebase Admin SDK not initialized' });
        return;
      }
      const skillData = req.body;
      if (!skillData || !skillData.id) {
        res.status(400).json({ error: 'Valid skill object with id is required' });
        return;
      }

      // Automatically generate 768-dim vector embedding if not provided
      if (!skillData.embedding || !Array.isArray(skillData.embedding)) {
        try {
          const semanticText = `${skillData.name} ${skillData.title} ${skillData.description} ${skillData.category}`;
          const embedRes = await getAi().models.embedContent({
            model: 'gemini-embedding-001',
            contents: semanticText.slice(0, 8000),
            config: { outputDimensionality: 768 },
          });
          skillData.embedding = embedRes.embeddings?.[0]?.values || [];
        } catch (embedErr) {
          console.warn('Embedding generation notice during skill save:', embedErr);
        }
      }

      skillData.updatedAt = new Date().toISOString();
      await adminDb.collection('skills').doc(skillData.id).set(skillData, { merge: true });

      res.json({
        success: true,
        skillId: skillData.id,
        embedded: Boolean(skillData.embedding?.length),
        savedAt: skillData.updatedAt,
      });
    } catch (err: any) {
      console.error('Failed to save skill via Firebase Admin:', err);
      res.status(500).json({ error: err?.message || 'Failed to save skill' });
    }
  });

  app.delete('/api/skills/:id', async (req: Request, res: Response) => {
    try {
      initFirebaseAdmin();
      if (!adminDb) {
        res.status(503).json({ error: 'Firebase Admin SDK not initialized' });
        return;
      }
      const skillId = req.params.id;
      if (!skillId) {
        res.status(400).json({ error: 'Skill ID is required' });
        return;
      }
      await adminDb.collection('skills').doc(skillId).delete();
      res.json({ success: true, deletedId: skillId });
    } catch (err: any) {
      console.error('Failed to delete skill via Firebase Admin:', err);
      res.status(500).json({ error: err?.message || 'Failed to delete skill' });
    }
  });

  // API Routes: Skill Version Snapshots Subcollection Management
  app.get('/api/skills/:id/versions', async (req: Request, res: Response) => {
    try {
      initFirebaseAdmin();
      if (!adminDb) {
        res.status(503).json({ error: 'Firebase Admin SDK not initialized' });
        return;
      }
      const skillId = req.params.id;
      const snapshot = await adminDb
        .collection('skills')
        .doc(skillId)
        .collection('versions')
        .orderBy('createdAt', 'desc')
        .get();

      const versions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      res.json({ versions, count: versions.length });
    } catch (err: any) {
      console.warn('Notice querying skill versions via Firebase Admin:', err?.message || err);
      res.json({ versions: [], count: 0 });
    }
  });

  app.post('/api/skills/:id/versions', async (req: Request, res: Response) => {
    try {
      initFirebaseAdmin();
      if (!adminDb) {
        res.status(503).json({ error: 'Firebase Admin SDK not initialized' });
        return;
      }
      const skillId = req.params.id;
      const versionData = req.body;
      if (!versionData || !versionData.id) {
        res.status(400).json({ error: 'Valid version snapshot object with id is required' });
        return;
      }

      await adminDb
        .collection('skills')
        .doc(skillId)
        .collection('versions')
        .doc(versionData.id)
        .set(versionData, { merge: true });

      res.json({ success: true, versionId: versionData.id, skillId });
    } catch (err: any) {
      console.error('Failed to save skill version via Firebase Admin:', err);
      res.status(500).json({ error: err?.message || 'Failed to save version snapshot' });
    }
  });

  // Health and System Diagnostics
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'operational',
      capabilities: [
        'Vector(768)',
        'AgentMemory',
        'SemanticToolSelection',
        'CloudStorage',
        'FirebaseAdmin',
      ],
      vectorDimensions: 768,
      firebaseAdmin: {
        initialized: Boolean(adminDb),
        projectId: adminAppInfo?.projectId || null,
        serviceAccountEmail: adminAppInfo?.clientEmail || null,
        targetDatabase: adminAppInfo?.databaseId || null,
      },
    });
  });

  // Bind port 3000 immediately so pre-warming and health checks succeed without waiting for Vite initialization
  app.listen(port, '0.0.0.0', () => {
    console.log(`Agent Engine Full-Stack Server listening on http://0.0.0.0:${port}`);
  });

  // Mount Vite middlewares in development or serve static in production
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vitePromise = createViteServer({
      server: { middlewareMode: true, hmr: false, watch: null },
      appType: 'spa',
    });

    app.use(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const vite = await vitePromise;
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  }
}

startServer();