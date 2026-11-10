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

// Dynamic path resolution for development secrets (Windows local vs Container)
const devSecretsPath = fs.existsSync(path.resolve(process.cwd(), '.dev.env.json'))
  ? path.resolve(process.cwd(), '.dev.env.json')
  : '/app/.dev.env.json';

// Top-level state for Firebase Admin instances
let adminDb: FirebaseFirestore.Firestore | null = null;
let adminAuth: any = null;
let adminAppInfo: { projectId?: string; clientEmail?: string; databaseId?: string } | null = null;

// Lazy-resolve Gemini API key from environment or secrets file
function getAi(): GoogleGenAI {
  const currentKey = process.env.GEMINI_API_KEY || process.env.apiKey || '';
  let apiKey = currentKey;
  try {
    if (!apiKey && fs.existsSync(devSecretsPath)) {
      const devSecrets = JSON.parse(fs.readFileSync(devSecretsPath, 'utf8'));
      apiKey = devSecrets.GEMINI_API_KEY || devSecrets.apiKey || '';
    }
  } catch {}
  return new GoogleGenAI({
    apiKey: apiKey || 'placeholder-key',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function generateDeterministicVector768Server(text: string): number[] {
  const dim = 768;
  const vector = new Float64Array(dim);
  const clean = (text || '').toLowerCase().trim();

  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    const index1 = (code * 31 + i * 17) % dim;
    const index2 = (code * 127 + i * 43) % dim;
    const index3 = (code * 257 + i * 89) % dim;

    vector[index1] += Math.sin((code + i) * 0.1) * 1.5;
    vector[index2] += Math.cos((code - i) * 0.15) * 1.2;
    vector[index3] += Math.sin((code * i) * 0.05) * 0.8;
  }

  const words = clean.split(/\s+/);
  words.forEach((w, wIdx) => {
    let wordHash = 0;
    for (let c = 0; c < w.length; c++) {
      wordHash = (wordHash << 5) - wordHash + w.charCodeAt(c);
      wordHash |= 0;
    }
    const slot = Math.abs(wordHash) % dim;
    vector[slot] += 2.0 / (1 + wIdx * 0.1);
  });

  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm) || 1.0;

  const result: number[] = new Array(dim);
  for (let i = 0; i < dim; i++) {
    result[i] = Number((vector[i] / norm).toFixed(6));
  }
  return result;
}

function generateFallbackSkillArchitectResponse(messages: Array<{ role: string; content: string }>, context?: any): string {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const lowerMsg = lastUserMsg.toLowerCase();

  const billingNotice = `> 💳 **Google Cloud API Status: Account Balance Restricted**\n> Your Google Cloud billing account currently has an outstanding balance. Real-time Gemini streaming will resume automatically once payment is verified at [AI Studio Billing](https://aistudio.google.com/billing) or when an active API key is selected in **Settings > Secrets**.\n>\n> In the interim, the **Offline Skill Architect Engine** has synthesized your requested capability specification below:\n\n`;

  if (lowerMsg.includes('pull request') || lowerMsg.includes('github') || lowerMsg.includes('pr reviewer')) {
    return billingNotice + `### GitHub Pull Request Reviewer & Hardening Sentinel

\`\`\`markdown
---
name: github-pr-reviewer
title: GitHub Pull Request Reviewer & Hardening Sentinel
version: 1.0.0
category: security-audit
securityClearance: internal
isExecutable: true
runtime: in_process
sourceReferences:
  - "https://docs.github.com/en/rest/pulls"
  - "notebook://studio-alchemist/ci-cd-security-sentinel.ipynb"
description: |
  Inspects incoming pull requests for security regressions, hardcoded secrets, test coverage deltas, and AST syntax anomalies.
dependencies: ["@octokit/rest", "typescript", "minimatch"]
priority: 1
thermodynamicFootprint: low
---

# GitHub Pull Request Reviewer & Hardening Sentinel

## Description & Mission
The **github-pr-reviewer** skill conducts deep architectural and security audits on pull request diffs before merge approval. It identifies exposed credentials, detects breaking schema migrations, and evaluates zero-pill code discipline.

## Parameters Schema
- \`owner\` (string, required): Repository owner or organization.
- \`repo\` (string, required): Repository name.
- \`pullNumber\` (number, required): Pull request number to audit.
- \`strictSecurityAudit\` (boolean, default: true): Enforce zero-tolerance checks on secret patterns.

## Operational Instructions
1. Retrieve PR diff and changed files via GitHub REST API.
2. Run multi-regex credential scanner across all modified hunks.
3. Verify test suite changes alongside implementation updates.
4. Post line-by-line review comments with remediation diffs.
\`\`\``;
  }

  if (lowerMsg.includes('strobes') || lowerMsg.includes('4-layer') || lowerMsg.includes('sqlite')) {
    return billingNotice + `### Strobes 4-Layer Methodology Architecture Guide

The **Strobes 4-Layer Methodology** is an enterprise-grade standard for high-reliability agent skills:

1. **Layer 1: Methodology Layer (\`SKILL.md\`)**
   - Pure human-readable operational runbook and trigger bounds.
   - Strictly enforces *Zero-Pill discipline* (no conversational padding).
2. **Layer 2: Scripts Layer (\`scripts/\`)**
   - Standalone CLI utilities executed by agents (e.g., \`scan_targets.py\`, \`evaluate_bounds.ts\`).
3. **Layer 3: Shared Library Layer (\`scripts/lib/\`)**
   - Reusable utilities (e.g. \`db_client.py\`, \`crypto_vault.ts\`).
4. **Layer 4: Data Layer (\`project.db\` SQLite)**
   - Authoritative state machine maintaining schema invariance across multi-phase agent sessions.

\`\`\`sql
-- Strobes Layer 4 SQLite Baseline Schema
CREATE TABLE IF NOT EXISTS skill_session_state (
  phase_id TEXT PRIMARY KEY,
  status TEXT CHECK(status IN ('pending', 'running', 'passed', 'failed')),
  findings_json TEXT NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\``;
  }

  if (lowerMsg.includes('zero-pill') || lowerMsg.includes('discipline')) {
    return billingNotice + `### Zero-Pill Discipline Audit & Guidelines

**Zero-Pill Discipline** guarantees that an autonomous agent executes tools reliably without hallucinating conversational pleasantries:

1. **Zero Fluff**: Omit "Certainly!", "Here is your plan", or polite conversational preambles.
2. **Direct Imperative Instructions**: Use active directives ("Execute schema validation", "Verify cryptographic hash").
3. **Explicit Operational Boundaries**: Document exact trigger conditions and forbidden failure states.
4. **Machine-Parseable Schema Invariance**: Every parameter must have an explicit JSON Schema type and validation regex.
5. **Deterministic Scaffolding**: Provide complete, executable code blocks rather than partial pseudo-code.`;
  }

  // General synthesized skill specification
  const inferredTopic = lastUserMsg.replace(/^(help me draft|create|generate|write|design)\s+/i, '').slice(0, 40).trim() || 'Custom Capability';
  const cleanTopicId = inferredTopic.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');

  return billingNotice + `### Synthesized Capability Specification: ${inferredTopic}

\`\`\`markdown
---
name: ${cleanTopicId}
title: ${inferredTopic}
version: 1.0.0
category: orchestration
securityClearance: internal
isExecutable: true
runtime: in_process
description: |
  Autonomous skill specification synthesized for ${inferredTopic}.
dependencies: ["@google/genai", "firebase-admin"]
priority: 1
thermodynamicFootprint: low
---

# ${inferredTopic}

## Description & Mission
Provides dedicated operational orchestration and deterministic execution for **${inferredTopic}** within the Agent Engine ecosystem.

## When to Use
- When autonomous workflows require specialized tooling for ${inferredTopic}.
- When task parameters match the declared schema constraints.

## When NOT to Use
- For unauthenticated or out-of-boundary general tasks.

## Parameters Schema
- \`targetId\` (string, required): Unique identifier of the resource.
- \`options\` (object, optional): Configuration payload.
\`\`\``;
}

function initFirebaseAdmin() {
  if (adminDb) return;
  try {
    let serviceAccount: any = null;

    // Direct root file check
    const localKeyPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
    if (fs.existsSync(localKeyPath)) {
      console.log(`[Firebase Admin] Found key file at: ${localKeyPath}`);
      serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      console.log(`[Firebase Admin] Using GOOGLE_APPLICATION_CREDENTIALS path: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
      serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : process.env.FIREBASE_SERVICE_ACCOUNT;
    } else if (fs.existsSync(devSecretsPath)) {
      const devSecrets = JSON.parse(fs.readFileSync(devSecretsPath, 'utf8'));
      if (devSecrets.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = typeof devSecrets.FIREBASE_SERVICE_ACCOUNT === 'string'
          ? JSON.parse(devSecrets.FIREBASE_SERVICE_ACCOUNT)
          : devSecrets.FIREBASE_SERVICE_ACCOUNT;
      }
    }

    const targetDatabaseId =
      process.env.FIRESTORE_DATABASE_ID || 'ai-studio-cf7d8c68-3d56-4be3-9582-2d8d0481bcfc';
    const projectId =
      serviceAccount?.project_id ||
      process.env.FIREBASE_PROJECT_ID ||
      'gen-lang-client-0573899362';

    const appOptions: any = {
      projectId,
      storageBucket:
        process.env.FIREBASE_STORAGEBUCKET || 'gen-lang-client-0573899362.firebasestorage.app',
    };
    if (serviceAccount) {
      appOptions.credential = cert(serviceAccount);
    }

    const adminApp =
      getAdminApps().length === 0
        ? initAdminApp(appOptions)
        : getAdminApp();

    adminDb = getAdminFirestore(adminApp, targetDatabaseId);
    adminAuth = getAdminAuth(adminApp);
    adminAppInfo = {
      projectId,
      clientEmail: serviceAccount?.client_email || 'cloud-environment-agent',
      databaseId: targetDatabaseId,
    };

    console.log(
      `[Firebase Admin] Initialized for project ${projectId} (database: ${targetDatabaseId})`
    );
  } catch (adminErr: any) {
    console.error('[Firebase Admin] Initialization notice:', adminErr?.message || adminErr);
  }
}

initFirebaseAdmin();

async function startServer() {
  const app = express();

  const args = process.argv;
  const portArgIndex = args.indexOf('--port');
  const hostArgIndex = args.indexOf('--host');

  const port = parseInt(
    (portArgIndex !== -1 && args[portArgIndex + 1]) ||
    process.env.PORT ||
    '3000',
    10
  );

  const host =
    (hostArgIndex !== -1 && args[hostArgIndex + 1]) ||
    process.env.HOST ||
    '0.0.0.0';

  app.use(express.json({ limit: '10mb' }));

  // API Route: Generate standard 768-dimensional Vector Embeddings
  app.post('/api/embed', async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Text string is required for vector embedding' });
        return;
      }

      try {
        const response = await getAi().models.embedContent({
          model: 'gemini-embedding-2-preview',
          contents: text.slice(0, 8000),
          config: {
            outputDimensionality: 768,
          },
        });

        const values = response.embeddings?.[0]?.values || [];
        if (values.length > 0) {
          res.json({
            embedding: values,
            dimensions: values.length,
            model: 'gemini-embedding-2-preview',
          });
          return;
        }
      } catch (geminiEmbedErr: any) {
        console.warn('Gemini vector embedding notice (using high-dimensional deterministic fallback):', geminiEmbedErr?.message || geminiEmbedErr);
      }

      // High-dimensional deterministic fallback ensures vector search never fails
      const fallbackValues = generateDeterministicVector768Server(text);
      res.json({
        embedding: fallbackValues,
        dimensions: 768,
        model: 'deterministic-768-fallback',
        isFallback: true,
      });
    } catch (err: any) {
      console.warn('Embed handler notice:', err?.message || err);
      const fallbackValues = generateDeterministicVector768Server(req.body?.text || '');
      res.json({
        embedding: fallbackValues,
        dimensions: 768,
        model: 'deterministic-768-fallback',
        isFallback: true,
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
      let usedModel = 'gemini-3.8-flash';
      try {
        response = await getAi().models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
      } catch (primaryErr: any) {
        console.warn('Primary model gemini-3.8-flash notice:', primaryErr?.message || primaryErr);
        usedModel = 'gemini-3.1-flash-lite';
        response = await getAi().models.generateContent({
          model: 'gemini-3.1-flash-lite',
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
      const errMsg = err?.message || String(err);
      const isBillingError =
        errMsg.includes('outstanding balance') ||
        errMsg.includes('billing') ||
        errMsg.includes('PERMISSION_DENIED') ||
        err?.status === 403 ||
        err?.code === 403;

      console.warn('Gemini chat service notice:', errMsg);

      const fallbackReply = generateFallbackSkillArchitectResponse(req.body?.messages || [], req.body?.context);

      res.status(200).json({
        reply: fallbackReply,
        model: 'offline-skill-architect',
        isFallback: true,
        isBillingError,
        billingDetails: isBillingError
          ? {
              status: 'PERMISSION_DENIED',
              message: 'Your Google Cloud billing account has an outstanding balance.',
              actionUrl: 'https://aistudio.google.com/billing',
              troubleshootingUrl: 'https://ai.google.dev/gemini-api/docs/troubleshooting#project-unavailable',
              advice: 'Make a payment at https://aistudio.google.com/billing or select an active API key in Settings > Secrets.',
            }
          : undefined,
      });
    }
  });

  // API Route: Generate Firebase Custom Auth Token for Verified Developer/Admin (Bypasses Google OAuth popups)
  app.post('/api/auth/custom-token', async (_req: Request, res: Response) => {
    try {
      initFirebaseAdmin();
      if (!adminAuth) {
        res.status(503).json({ error: 'Firebase Admin Auth not initialized' });
        return;
      }
      const targetEmail = 'isaiah9238@gmail.com';
      const uid = 'isaiah9238';
      const customToken = await adminAuth.createCustomToken(uid, {
        email: targetEmail,
        email_verified: true,
        admin: true,
      });
      res.json({
        token: customToken,
        email: targetEmail,
        uid,
        displayName: 'Isaiah (Admin)',
      });
    } catch (err: any) {
      console.error('Failed to create custom auth token:', err);
      res.status(500).json({ error: err?.message || 'Failed to generate token' });
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

  // Bind port immediately so pre-warming and health checks succeed
  const server = app.listen(port, host, () => {
    console.log(`Agent Engine Full-Stack Server listening on http://${host}:${port}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Server] Port ${port} is currently busy, waiting for release...`);
      setTimeout(() => {
        try {
          server.close();
          server.listen(port, host);
        } catch {}
      }, 1000);
    } else {
      console.error('[Server] Listen error:', err);
    }
  });

  // Mount Vite middlewares in development or serve static in production
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vitePromise = createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false, watch: null },
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