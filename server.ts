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
