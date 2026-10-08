import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve Gemini API key from environment or secrets file
let apiKey = process.env.GEMINI_API_KEY || '';
try {
  if (!apiKey && fs.existsSync('/app/.dev.env.json')) {
    const devSecrets = JSON.parse(fs.readFileSync('/app/.dev.env.json', 'utf8'));
    apiKey = devSecrets.GEMINI_API_KEY || '';
  }
} catch {
  // ignore
}

const ai = new GoogleGenAI({ apiKey });

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route: Generate standard 768-dimensional Vector Embeddings for Dynamic Tool Selection & Agent Memories
  app.post('/api/embed', async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Text string is required for vector embedding' });
        return;
      }

      const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text.slice(0, 8000), // Protect token boundaries
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

      // Convert messages to @google/genai content structures
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
        response = await ai.models.generateContent({
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
        response = await ai.models.generateContent({
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

  // Health and System Diagnostics
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'operational',
      capabilities: ['Vector(768)', 'AgentMemory', 'SemanticToolSelection', 'CloudStorage'],
      vectorDimensions: 768,
    });
  });

  // Mount Vite middlewares in development or serve static in production
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Agent Engine Full-Stack Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
