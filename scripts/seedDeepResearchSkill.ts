import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

let saRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!saRaw) {
  const localKeyPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
  if (fs.existsSync(localKeyPath)) {
    try {
      saRaw = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
    } catch {}
  }
}
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
const apiKey = process.env.apiKey || process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const skillFilePath = path.resolve(process.cwd(), 'skills/deep-research-skill/deep-research-brief-generator.md');
const GUIDELINES_MD = fs.existsSync(skillFilePath)
  ? fs.readFileSync(skillFilePath, 'utf8')
  : '';

async function seed() {
  const skillId = 'deep-research-brief-generator';
  console.log(`[Seed] Registering [${skillId}] into database: ${targetDatabaseId}`);

  const semanticSource = `Title: Deep Research Prompt & Brief Generator
Description: Formulates structured, machine-executable research briefs and prompts for deep research agents. Enforces explicit sub-topic scoping, source provenance constraints, iterative ReAct retrieval loops, and inline citation discipline.
Category: research-and-prompting
Keywords: deep research, brief generator, react retrieval, sub-topic breakdown, prompt engineering, provenance`;

  let embeddingVector: number[] = [];
  if (apiKey) {
    try {
      const embedResponse = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: semanticSource,
        config: { outputDimensionality: 768 },
      });
      embeddingVector = embedResponse.embeddings?.[0]?.values ?? [];
    } catch (embedErr: any) {
      console.warn('[Seed] Embedding note:', embedErr?.message || embedErr);
    }
  }

  const now = new Date().toISOString();
  await db.collection('skills').doc(skillId).set({
    id: skillId,
    name: 'deep_research_brief_generator',
    title: 'Deep Research Prompt & Brief Generator',
    description: 'Formulates structured, machine-executable research briefs and prompts for deep research agents. Enforces explicit sub-topic scoping, source provenance constraints, iterative ReAct retrieval loops, and inline citation discipline.',
    category: 'workflow-automation',
    version: '1.0.0',
    status: 'published',
    isPublic: true,
    authorId: 'system-agent-engine',
    authorEmail: 'isaiah9238@gmail.com',
    securityClearance: 'public',
    isExecutable: true,
    runtime: 'in_process',
    sourceReferences: [
      'skills/deep-research-skill/deep-research-brief-generator.md',
      'https://github.com/open-deep-research/pipeline-spec'
    ],
    parametersSchema: {
      type: 'object',
      properties: {
        rawQuery: { type: 'string', description: 'Raw, unstructured user research request.' },
        scopeDimensions: { type: 'array', description: 'List of target sub-topics to parallelize.' },
        primarySourceTargets: { type: 'array', description: 'Mandatory authoritative domains and venues.' },
        requireInlineCitations: { type: 'boolean', description: 'Whether to mandate strict citation brackets.' }
      },
      required: ['rawQuery']
    },
    skillMarkdown: GUIDELINES_MD,
    ...(embeddingVector.length > 0 ? { embedding: FieldValue.vector(embeddingVector) } : {}),
    codeFiles: JSON.stringify({
      'prompt_assembler.ts': {
        filename: 'prompt_assembler.ts',
        language: 'typescript',
        description: 'Assembles machine-executable prompt templates with strict citation constraints.',
        content: `export interface DeepResearchBrief {
  objective: string;
  subTopics: string[];
  sourceConstraints: string[];
  reportFormat: string;
  verificationThreshold: number;
}

export function assembleDeepResearchBrief(input: {
  rawQuery: string;
  subTopics?: string[];
  sourceConstraints?: string[];
}): DeepResearchBrief {
  return {
    objective: input.rawQuery.trim(),
    subTopics: input.subTopics || ['Core mechanism', 'Comparative benchmarks', 'Edge cases and failure modes'],
    sourceConstraints: input.sourceConstraints || ['Peer-reviewed papers (arXiv)', 'Official specs', 'CVE database'],
    reportFormat: 'Executive Summary, Sub-Topic Deep Dives, Comparative Matrix, Source Provenance Table',
    verificationThreshold: 2
  };
}`
      }
    }),
    summaryJson: JSON.stringify({
      schemaVersion: '2026.1',
      skillId,
      name: 'deep_research_brief_generator',
      title: 'Deep Research Prompt & Brief Generator',
      description: 'Formulates structured, machine-executable research briefs and prompts for deep research agents.',
      category: 'workflow-automation',
      version: '1.0.0',
      runtime: 'in_process',
      isExecutable: true,
      securityClearance: 'public',
      triggerPreconditions: [
        'User initiates complex or ambiguous research request',
        'Multi-agent deep research pipeline needs structured brief contract',
        'Preventing hallucination and token blowup in deep retrieval loops'
      ],
      routingKeywords: ['deep research', 'brief generator', 'retrieval', 'sub-topic breakdown', 'prompt schema', 'citation'],
      parametersSchema: {
        type: 'object',
        properties: {
          rawQuery: { type: 'string', description: 'Raw, unstructured research prompt' }
        },
        required: ['rawQuery']
      },
      evaluationRubric: {
        priority: 1,
        thermodynamicFootprint: 'low',
        requiresHumanReview: false,
        verificationLevel: 'strict'
      },
      bestSuitedFor: [
        'Complex technical inquiries requiring multi-source synthesis',
        'Autonomous multi-agent research pipelines'
      ],
      unsuitedFor: ['Simple factual lookup questions']
    }, null, 2),
    parameters: JSON.stringify([
      { name: 'rawQuery', type: 'string', required: true, description: 'Raw, unstructured research inquiry.' },
      { name: 'depth', type: 'string', required: false, description: 'Depth level: standard, comprehensive, exhaustive.' }
    ]),
    examples: JSON.stringify([
      {
        title: 'Quantum Hardware Benchmarks',
        scenario: 'Comparing neutral-atom vs superconducting qubit architectures',
        prompt: 'Generate deep research brief for quantum qubit benchmarks 2025-2026',
        invocations: 'deep_research_brief_generator({ rawQuery: "Quantum benchmarks 2025-2026" })',
        expectedOutcome: '5-part structured markdown research brief ready for parallel sub-agent execution.'
      }
    ]),
    createdAt: now,
    updatedAt: now,
  });

  console.log(`[Seed] Successfully seeded [${skillId}] into Firestore.`);
}

seed().catch(err => {
  console.error('[Seed] Error seeding deep research skill:', err);
  process.exit(1);
});
