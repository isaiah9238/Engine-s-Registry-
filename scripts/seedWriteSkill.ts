import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { GoogleGenAI } from '@google/genai';

// 1. Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json'),
    storageBucket: 'gen-lang-client-0573899362.firebasestorage.app',
  });
}

const db = getFirestore();
const bucket = getStorage().bucket();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 2. Define File Payloads
const GUIDELINES_MD = `---
name: write-skill
title: "Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine"
description: >
  Enables autonomous agents to design, author, audit, validate, and register new SKILL.md files.
  Evaluates existing skill logic to improve output quality, prevent redundancy, and systematically
  determine which skill in the registry is best for a given job.
version: 1.2.0
category: orchestration
securityClearance: public
isExecutable: true
runtime: in_process
sourceReferences:
  - "notebook://studio-alchemist/meta-authoring.ipynb"
  - "https://agent-engine.internal/specs/skill-v1"
tags: [meta-skill, skill-authoring, decision-engine, prompt-engineering, ingestion-pipeline]
dependencies: ["js-yaml", "@types/node"]
priority: 1
thermodynamicFootprint: low
requiresHumanReview: false
---

# Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine

## Description & Mission
The write-skill meta-skill is the core cognitive blueprint of the Agent Engine. It empowers an autonomous system to reflectively generate new specialized capabilities, audit existing skill logic, and determine optimal routing paths when dispatched on complex tasks. It enforces strict separation of concerns, defensive parameter schemas, verifiable examples, and machine-digestible ingestion summaries.

## Preconditions & Skill Selection Guidance

### When to Use
- When the user tasks the agent with a novel capability not covered by existing registry skills.
- When an existing skill exhibits drift, hallucinations, outdated schemas, or missing constraints.
- When determining "Which skill is best for this job?" through automated capability matrix matching.
- When transforming raw workflow notes or API specifications into production-grade SKILL.md documentation.

### When NOT to Use
- For trivial, single-step tasks that do not require reusable procedural memory or multi-turn rules.
- When an exact, high-confidence skill already exists in the registry.

## Parameters & Invocation Schemas

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| \`skillName\` | string | true | Kebab-case machine identifier (e.g., data-pipeline-cleaner). |
| \`title\` | string | true | Clear, descriptive human-readable title. |
| \`mission\` | string | true | Concise statement of the skill's purpose and operational boundaries. |
| \`targetCapabilities\` | array | true | Specific tools, APIs, or reasoning patterns the skill encapsulates. |
| \`parametersList\` | array | true | Explicit inputs with types, default values, and required constraints. |
| \`examplesList\` | array | true | High-fidelity multi-turn prompt/action/expected-outcome walkthroughs. |
| \`codeScaffolding\` | object | false | Optional map of helper functions, scripts, or test harnesses. |
| \`referencesList\` | array | false | External documentation, API specs, and foundational research citations. |

## Operational Rules & Ingestion Pipeline Constraints
1. **Zero-Pill Discipline & Anti-Slop:** Every section must serve a verifiable function. Avoid empty filler phrases.
2. **Schema Invariance:** Every parameter must include explicit type boundaries and regex patterns where applicable.
3. **Determinism in Selection:** Before generating a new skill, compare similarity against the active registry. If cosine or semantic overlap exceeds 0.85, propose an upgrade rather than a duplicate.
4. **Summary JSON Synthesis:** Every authored skill must generate a strict JSON payload conforming to the Ingestion Pipeline Contract.

## In-Context Examples & Multi-Turn Walkthroughs

### Example 1: Authoring a Cloud Storage Sync Skill
* **Prompt:** "Create a skill for managing S3 and Google Cloud Storage bucket backups with checksum verification."
* **Scenario Context:** Developer needs automated multi-cloud archival.
* **Expected Outcome:** Generates a valid SKILL.md with YAML frontmatter, parameters for sourceBucket, targetBucket, verifyChecksum, and scaffolding for MD5 comparisons.

### Example 2: Determining Best Skill for a Machine Learning Task
* **Prompt:** "The user wants to optimize low-power inference on edge neuromorphic hardware."
* **Scenario Context:** Agent queries registry for neuromorphic and low-power.
* **Expected Outcome:** Evaluates write-skill vs neuromorphic-energy-optimizer. Returns neuromorphic-energy-optimizer with confidence 98% and provides rationale based on Landauer limits and SNN event-driven timing.

## Scaffolded Code & Reference Implementations

### validator.ts
\`\`\`typescript
export function validateSkillStructure(manifest: Record<string, any>): { valid: boolean; issues: string[] } {
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
}
\`\`\`

## References & Technical Foundations
- **Agent Skills Architecture Specification:** Official standard for agent skill registry.
- **Prompt Engineering & Metacognitive Reasoning:** Chain-of-thought and structured tool registration patterns.
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
  
  await bucket.file(`${basePath}/guidelines.md`).save(GUIDELINES_MD, {
    metadata: { contentType: 'text/markdown' },
  });

  await bucket.file(`${basePath}/script.js`).save(SCRIPT_JS, {
    metadata: { contentType: 'application/javascript' },
  });

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

  const embedResponse = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: semanticSource,
    config: {
      outputDimensionality: 768,
    },
  });

  const embeddingVector = embedResponse.embeddings?.[0]?.values ?? [];

  // 3. Upsert Firestore Document
  console.log(`Writing record to Firestore at /skills/${skillId}...`);
  const now = new Date().toISOString();

  await db.collection('skills').doc(skillId).set({
    id: skillId,
    name: 'write-skill',
    title: 'Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine',
    description: 'Enables autonomous agents to design, author, audit, validate, and register new SKILL.md files. Evaluates existing skill logic to improve output quality, prevent redundancy, and systematically determine which skill in the registry is best for a given job.',
    category: 'orchestration',
    version: '1.2.0',
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
    embedding: FieldValue.vector(embeddingVector),
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
      version: '1.2.0',
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
  });

  console.log(`Successfully registered and bundled [${skillId}].`);
}

main().catch((err) => {
  console.error('Ingestion failed:', err);
  process.exit(1);
});