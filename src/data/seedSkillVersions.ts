import type { SkillVersionSnapshot } from '../types/skill';

export const SEED_SKILL_VERSIONS: Record<string, SkillVersionSnapshot[]> = {
  'write-skill': [
    {
      id: 'snap-write-skill-v1-3-0',
      skillId: 'write-skill',
      version: '1.3.0',
      title: 'Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine',
      description: 'Enables autonomous agents to design, author, audit, validate, and register new SKILL.md files. Evaluates existing skill logic to improve output quality, prevent redundancy, and systematically determine which skill in the registry is best for a given job.',
      category: 'orchestration',
      status: 'published',
      authorEmail: 'isaiahmsmith@aihomev2.com',
      authorId: 'system-architect',
      changeLog: 'Added Epistemic Hierarchy, Information Flow Pipeline, confidence-gated routing (0.85/0.50), and verification-first execution.',
      codeFiles: JSON.stringify({
        'validator.ts': {
          filename: 'validator.ts',
          language: 'typescript',
          description: 'Runtime schema validation harness for newly authored skills.',
          content: `export function validateSkillStructure(manifest: Record<string, any>): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!manifest.name || !/^[a-z0-9-_]+$/.test(manifest.name)) {
    issues.push('Skill name must be valid kebab-case.');
  }
  if (!manifest.description || manifest.description.length < 30) {
    issues.push('Description must be detailed and at least 30 characters.');
  }
  if (!Array.isArray(manifest.parameters) || manifest.parameters.length === 0) {
    issues.push('Skills must declare explicit parameters.');
  }
  return { valid: issues.length === 0, issues };
}`,
        },
        'epistemic_pipeline.ts': {
          filename: 'epistemic_pipeline.ts',
          language: 'typescript',
          description: 'Confidence-gated decision engine and epistemic hierarchy validator.',
          content: `export interface RoutingDecision {
  confidence: number;
  route: 'direct' | 'verify' | 'synthesize';
  selectedSkill?: string;
}

export function evaluateRoutingConfidence(similarity: number): RoutingDecision {
  if (similarity >= 0.85) return { confidence: similarity, route: 'direct' };
  if (similarity >= 0.50) return { confidence: similarity, route: 'verify' };
  return { confidence: similarity, route: 'synthesize' };
}`,
        },
      }, null, 2),
      skillMarkdown: `---
name: write-skill
title: "Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine"
description: >
  Enables autonomous agents to design, author, audit, validate, and register new SKILL.md files.
version: 1.3.0
category: orchestration
securityClearance: public
isExecutable: true
runtime: in_process
---
# Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine
## Epistemic Hierarchy
1. Evidence > Similarity
2. Truth > Fluency
3. Verification > Confidence
4. Adaptive Effort > Maximum Effort
5. Workflow > Raw Token Prediction
`,
      summaryJson: JSON.stringify({
        schemaVersion: '2026.1',
        skillId: 'write-skill',
        version: '1.3.0',
        runtime: 'in_process',
        title: 'Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine',
      }, null, 2),
      parameters: JSON.stringify([
        { name: 'skillName', type: 'string', required: true, description: 'Kebab-case machine identifier slug.' },
        { name: 'title', type: 'string', required: true, description: 'Human-readable title.' },
        { name: 'mission', type: 'string', required: true, description: 'Concise statement of operational boundaries.' },
        { name: 'targetCapabilities', type: 'array', required: true, description: 'Encapsulated tools and patterns.' },
      ], null, 2),
      runtime: 'in_process',
      securityClearance: 'public',
      createdAt: '2026-10-19T20:30:00.000Z',
      isCurrent: true,
    },
    {
      id: 'snap-write-skill-v1-2-0',
      skillId: 'write-skill',
      version: '1.2.0',
      title: 'Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine',
      description: 'Enables autonomous agents to design, author, audit, validate, and register new SKILL.md files. Evaluates existing skill logic to improve output quality.',
      category: 'orchestration',
      status: 'published',
      authorEmail: 'isaiahmsmith@aihomev2.com',
      authorId: 'system-architect',
      changeLog: 'Added GCS cloud bundle storage paths, Google Drive export sync, and structured IngestionDocumentPayload formatting.',
      codeFiles: JSON.stringify({
        'validator.ts': {
          filename: 'validator.ts',
          language: 'typescript',
          description: 'Runtime schema validation harness for newly authored skills.',
          content: `export function validateSkillStructure(manifest: Record<string, any>): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!manifest.name || !/^[a-z0-9-_]+$/.test(manifest.name)) {
    issues.push('Skill name must be valid kebab-case.');
  }
  if (!manifest.description || manifest.description.length < 30) {
    issues.push('Description must be detailed and at least 30 characters.');
  }
  return { valid: issues.length === 0, issues };
}`,
        },
        'script.js': {
          filename: 'script.js',
          language: 'javascript',
          description: 'In-process executable script for write-skill evaluation.',
          content: `export async function execute(params) {
  const { skillName, title, mission } = params || {};
  return {
    success: Boolean(skillName && title),
    validatedAt: new Date().toISOString(),
  };
}`,
        },
      }, null, 2),
      skillMarkdown: `---
name: write-skill
title: "Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine"
version: 1.2.0
category: orchestration
securityClearance: public
isExecutable: true
runtime: in_process
---
# Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine (v1.2.0)
A high-precision database and authoring studio for autonomous agent capabilities.
`,
      summaryJson: JSON.stringify({
        schemaVersion: '2026.1',
        skillId: 'write-skill',
        version: '1.2.0',
        runtime: 'in_process',
        title: 'Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine',
      }, null, 2),
      parameters: JSON.stringify([
        { name: 'skillName', type: 'string', required: true, description: 'Kebab-case machine identifier.' },
        { name: 'title', type: 'string', required: true, description: 'Title string.' },
      ], null, 2),
      runtime: 'in_process',
      securityClearance: 'public',
      createdAt: '2026-10-12T14:15:00.000Z',
      isCurrent: false,
    },
    {
      id: 'snap-write-skill-v1-1-0',
      skillId: 'write-skill',
      version: '1.1.0',
      title: 'Skill Architect: Decision Engine & Matrix Matcher',
      description: 'Prototype agent skill authoring tool with automated capability matrix matching and similarity heuristics.',
      category: 'orchestration',
      status: 'verified',
      authorEmail: 'isaiahmsmith@aihomev2.com',
      authorId: 'system-architect',
      changeLog: 'Introduced cosine similarity heuristic comparison (0.85 threshold) to prevent redundant skill creation.',
      codeFiles: JSON.stringify({
        'validator.ts': {
          filename: 'validator.ts',
          language: 'typescript',
          description: 'Basic validator.',
          content: `export function validateSkillStructure(manifest: Record<string, any>) {
  return { valid: Boolean(manifest.name && manifest.description), issues: [] };
}`,
        },
      }, null, 2),
      skillMarkdown: `---
name: write-skill
title: "Skill Architect: Decision Engine & Matrix Matcher"
version: 1.1.0
category: orchestration
---
# Skill Architect (v1.1.0)
Initial decision engine matcher prototype.
`,
      parameters: JSON.stringify([
        { name: 'skillName', type: 'string', required: true, description: 'Name of the skill.' },
      ], null, 2),
      runtime: 'in_process',
      securityClearance: 'public',
      createdAt: '2026-10-06T09:00:00.000Z',
      isCurrent: false,
    },
    {
      id: 'snap-write-skill-v1-0-0',
      skillId: 'write-skill',
      version: '1.0.0',
      title: 'Skill Architect: Meta-Skill Authoring Baseline',
      description: 'Initial proof-of-concept for parsing and generating SKILL.md documents with YAML frontmatter.',
      category: 'orchestration',
      status: 'draft',
      authorEmail: 'isaiahmsmith@aihomev2.com',
      authorId: 'system-architect',
      changeLog: 'Initial proof-of-concept release with basic YAML frontmatter extraction.',
      codeFiles: JSON.stringify({
        'parser.ts': {
          filename: 'parser.ts',
          language: 'typescript',
          description: 'Simple regex YAML frontmatter parser.',
          content: `export function parseYamlFrontmatter(text: string) {
  const match = text.match(/^---([\\s\\S]*?)---/);
  return match ? { raw: match[1] } : null;
}`,
        },
      }, null, 2),
      skillMarkdown: `---
name: write-skill
title: "Skill Architect: Meta-Skill Authoring Baseline"
version: 1.0.0
---
# Baseline Write Skill
`,
      parameters: JSON.stringify([], null, 2),
      runtime: 'in_process',
      securityClearance: 'public',
      createdAt: '2026-10-01T12:00:00.000Z',
      isCurrent: false,
    },
  ],

  'toroidal-color-matrix': [
    {
      id: 'snap-toroidal-v1-0-0',
      skillId: 'toroidal-color-matrix',
      version: '1.0.0',
      title: 'Toroidal Color Matrix: 7-Layer Parametric Transformation Engine',
      description: 'Engineers, calculates, and renders high-dimensional toroidal color manifolds across 7 discrete transformation layers with Three.js shaders.',
      category: 'analysis',
      status: 'verified',
      authorEmail: 'isaiah9238@gmail.com',
      changeLog: 'Complete 7-layer implementation: OKLab perceptual coordinates, 8-fold radial symmetry harmonics, and dynamic hysteresis relaxation.',
      codeFiles: JSON.stringify({
        'torus_math.ts': {
          filename: 'torus_math.ts',
          language: 'typescript',
          description: '7-layer toroidal manifold coordinate transformation pipeline.',
          content: `export function evaluateTorusPoint(u: number, v: number, R: number, r: number) {
  const x = (R + r * Math.cos(v)) * Math.cos(u);
  const y = (R + r * Math.cos(v)) * Math.sin(u);
  const z = r * Math.sin(v);
  return [x, y, z];
}`,
        },
      }, null, 2),
      skillMarkdown: `---
name: toroidal-color-matrix
title: "Toroidal Color Matrix: 7-Layer Parametric Transformation Engine"
version: 1.0.0
category: analysis
---
# Toroidal Color Matrix: 7-Layer Parametric Transformation Engine
`,
      createdAt: '2026-10-18T16:20:00.000Z',
      isCurrent: true,
    },
    {
      id: 'snap-toroidal-v0-9-0',
      skillId: 'toroidal-color-matrix',
      version: '0.9.0',
      title: 'Toroidal Color Matrix: 5-Layer Parameterization Engine',
      description: 'Earlier 5-layer parameterization engine with static OKLab coordinates before hysteresis relaxation was introduced.',
      category: 'analysis',
      status: 'draft',
      authorEmail: 'isaiah9238@gmail.com',
      changeLog: 'Added 5-layer coordinate calculation and basic Three.js canvas integration.',
      codeFiles: JSON.stringify({
        'torus_math.ts': {
          filename: 'torus_math.ts',
          language: 'typescript',
          description: '5-layer torus math.',
          content: `export function evaluateTorus5Layer(u: number, v: number) {
  return { u, v, layerCount: 5 };
}`,
        },
      }, null, 2),
      skillMarkdown: `---
name: toroidal-color-matrix
title: "Toroidal Color Matrix: 5-Layer Parameterization Engine"
version: 0.9.0
category: analysis
---
# Toroidal Color Matrix (5-Layer)
`,
      createdAt: '2026-10-10T11:00:00.000Z',
      isCurrent: false,
    },
  ],

  'multi-tier-agent-memory': [
    {
      id: 'snap-memory-v1-0-0',
      skillId: 'multi-tier-agent-memory',
      version: '1.0.0',
      title: 'Multi-Tier Agent Memory & Semantic Vector Indexer',
      description: 'Manages episodic working memory, persistent 768-D vector semantic recall via Firestore, and immutable procedural rule injection.',
      category: 'cognitive-architecture',
      status: 'verified',
      authorEmail: 'isaiah9238@gmail.com',
      changeLog: 'Production release: Full 3-tier layering (Procedural, Semantic Vector 768-D, Episodic Working Memory) with cosine similarity matching.',
      codeFiles: JSON.stringify({
        'memory_indexer.ts': {
          filename: 'memory_indexer.ts',
          language: 'typescript',
          description: 'Vector-indexed agent memory store.',
          content: `export interface AgentMemoryItem {
  id: string;
  tier: 'episodic' | 'semantic' | 'procedural';
  content: string;
  embedding?: number[];
}`,
        },
      }, null, 2),
      skillMarkdown: `---
name: multi-tier-agent-memory
title: "Multi-Tier Agent Memory & Semantic Vector Indexer"
version: 1.0.0
category: cognitive-architecture
---
# Multi-Tier Agent Memory
`,
      createdAt: '2026-10-18T18:00:00.000Z',
      isCurrent: true,
    },
    {
      id: 'snap-memory-v0-9-0',
      skillId: 'multi-tier-agent-memory',
      version: '0.9.0',
      title: 'Agent Working Memory Cache',
      description: 'Early prototype with ephemeral in-memory cache and localStorage persistence without vector index integration.',
      category: 'cognitive-architecture',
      status: 'draft',
      authorEmail: 'isaiah9238@gmail.com',
      changeLog: 'Initial in-memory episodic cache without vector embeddings.',
      codeFiles: JSON.stringify({
        'cache.ts': {
          filename: 'cache.ts',
          language: 'typescript',
          description: 'Local storage cache.',
          content: `export const memoryCache = new Map<string, string>();`,
        },
      }, null, 2),
      skillMarkdown: `---
name: multi-tier-agent-memory
title: "Agent Working Memory Cache"
version: 0.9.0
category: cognitive-architecture
---
# Agent Working Memory Cache (v0.9.0)
`,
      createdAt: '2026-10-08T15:30:00.000Z',
      isCurrent: false,
    },
  ],

  'custom-security-scanner': [
    {
      id: 'snap-scanner-v1-0-0',
      skillId: 'custom-security-scanner',
      version: '1.0.0',
      title: 'Zero-Trust Security & Policy Scanner',
      description: 'Audits runtime execution endpoints, enforces zero-trust policy invariants, and prevents unauthorized tool execution.',
      category: 'security-audit',
      status: 'verified',
      authorEmail: 'isaiah9238@gmail.com',
      changeLog: 'Added strict TLS 1.3 verification, endpoint URL structure guards, and ABAC policy checks.',
      codeFiles: JSON.stringify({
        'script.ts': {
          filename: 'script.ts',
          language: 'typescript',
          description: 'Zero-trust runtime scanner.',
          content: `export async function execute(params: { targetEndpoint: string; enforceStrictTls?: boolean }) {
  const { targetEndpoint, enforceStrictTls = true } = params;
  const isHttps = targetEndpoint.startsWith('https://');
  return {
    passed: isHttps,
    tlsVersion: isHttps ? 'TLS 1.3' : 'UNENCRYPTED',
  };
}`,
        },
      }, null, 2),
      skillMarkdown: `---
name: custom-security-scanner
title: "Zero-Trust Security & Policy Scanner"
version: 1.0.0
category: security-audit
---
# Zero-Trust Security & Policy Scanner
`,
      createdAt: '2026-10-18T12:00:00.000Z',
      isCurrent: true,
    },
    {
      id: 'snap-scanner-v0-8-0',
      skillId: 'custom-security-scanner',
      version: '0.8.0',
      title: 'Simple Endpoint URL Scanner',
      description: 'Basic URL syntax validation without TLS or zero-trust invariant checks.',
      category: 'security-audit',
      status: 'draft',
      authorEmail: 'isaiah9238@gmail.com',
      changeLog: 'Initial URL syntax regex checker.',
      codeFiles: JSON.stringify({
        'validator.ts': {
          filename: 'validator.ts',
          language: 'typescript',
          description: 'URL regex validator.',
          content: `export function isValidUrl(url: string) { return url.startsWith('http'); }`,
        },
      }, null, 2),
      skillMarkdown: `---
name: custom-security-scanner
title: "Simple Endpoint URL Scanner"
version: 0.8.0
category: security-audit
---
# Simple Endpoint URL Scanner (v0.8.0)
`,
      createdAt: '2026-10-05T10:00:00.000Z',
      isCurrent: false,
    },
  ],
};
