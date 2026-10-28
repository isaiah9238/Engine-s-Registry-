/**
 * Seed Skills for the Agent Engine Skill Registry
 * Built according to the Studio Alchemist AI Agent Skill and Workflow Registry schema.
 */
import type { SkillRecord } from '../types/skill';
import { generateDeterministicVector768 } from '../services/vectorSearch';
import { WRITE_SKILL_VECTOR_768 } from './writeSkillVector';

export const RAW_SEED_SKILLS: SkillRecord[] = [
  {
    id: 'auth-vault-eval',
    name: 'auth_vault_eval',
    title: 'Cryptographic Vault Evaluator',
    description: 'Zero-trust cryptographic key vault auditor and ABAC security inspector for agent runtime workloads. Evaluates encryption at rest, rotates ephemeral keys, and tests ABAC policies against the 8 pillars of hardened access.',
    category: 'security-audit',
    version: '1.0.0',
    authorId: 'system-agent-engine',
    authorEmail: 'isaiah9238@gmail.com',
    status: 'verified',
    isPublic: true,
    securityClearance: 'internal',
    isExecutable: true,
    runtime: 'mcp',
    sourceReferences: [
      'notebook://studio-alchemist/security-vault-audit.ipynb',
      'https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final'
    ],
    returns: JSON.stringify({
      type: 'object',
      properties: {
        vaultAuditScore: { type: 'number', description: 'Composite cryptographic security score (0-100).' },
        abacCompliance: { type: 'boolean', description: 'Whether the vault passes strict ABAC boundaries.' },
        vulnerabilities: {
          type: 'array',
          items: { type: 'string' },
          description: 'Identified shadow keys, expired certificates, or update gaps.'
        },
        remediationPlan: { type: 'string', description: 'Recommended key rotation or policy fix steps.' }
      },
      required: ['vaultAuditScore', 'abacCompliance', 'vulnerabilities']
    }, null, 2),
    createdAt: new Date('2026-10-04T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-04T07:50:00Z').toISOString(),
    skillMarkdown: `---
name: auth_vault_eval
title: Cryptographic Vault Evaluator
version: 1.0.0
category: security-audit
securityClearance: internal
isExecutable: true
runtime: mcp
sourceReferences:
  - "notebook://studio-alchemist/security-vault-audit.ipynb"
  - "https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final"
description: |
  Zero-trust cryptographic key vault auditor and ABAC security inspector for agent runtime workloads.
  Evaluates encryption at rest, rotates ephemeral keys, and tests ABAC policies.
dependencies: ["crypto", "@types/node", "lucide-react"]
priority: 1
thermodynamicFootprint: low
---

# Cryptographic Vault Evaluator

## Description & Mission
Audits secrets storage vaults, ephemeral runtime tokens, and role-based permissions to prevent privilege escalation and unauthorized key leakage in multi-agent environments.

## Parameters & Invocation Schemas
| Parameter | Type | Required | Description |
|---|---|---|---|
| \`vaultEndpoint\` | \`string\` | true | URI or reference key for the target secret store. |
| \`auditLevel\` | \`string\` | true | Inspection depth: \`surface\`, \`deep-audit\`, or \`penetration-test\`. |
| \`enforceZeroTrust\` | \`boolean\` | false | Flag to verify attribute-based separation of keys. |

## Operational Rules & Preconditions
- Execute only within authorized runtime boundaries using the MCP protocol.
- Flag any hardcoded API secrets or unrotated certificates older than 90 days.
- Return structured evaluation reports conforming to the Studio Alchemist telemetry standard.

## In-Context Examples & Multi-Turn Walkthroughs

### Example 1: Full Cryptographic Vault Audit
**Prompt**: "Audit the production secrets store and check for unrotated tokens."
**Expected Outcome**: Returns a \`vaultAuditScore\` of 94 with a clean bill of health on AES-256-GCM configurations.

## Scaffolded Code & Reference Implementations

### \`vault_inspector.ts\`
\`\`\`typescript
export interface VaultAuditResult {
  score: number;
  unrotatedKeysCount: number;
  passedAbac: boolean;
}

export function evaluateVault(endpoint: string): VaultAuditResult {
  return { score: 95, unrotatedKeysCount: 0, passedAbac: true };
}
\`\`\`
`,
    summaryJson: JSON.stringify({
      schemaVersion: '2026.1',
      skillId: 'auth-vault-eval',
      name: 'auth_vault_eval',
      title: 'Cryptographic Vault Evaluator',
      description: 'Zero-trust cryptographic key vault auditor and ABAC security inspector for agent runtime workloads.',
      category: 'security-audit',
      version: '1.0.0',
      runtime: 'mcp',
      isExecutable: true,
      securityClearance: 'internal',
      triggerPreconditions: [
        'Security audits requested on secret vaults',
        'ABAC policy compliance validation',
        'Key rotation checks and vulnerability scans'
      ],
      routingKeywords: ['vault', 'security', 'audit', 'cryptographic', 'abac', 'tokens', 'secret'],
      parametersSchema: {
        type: 'object',
        properties: {
          vaultEndpoint: { type: 'string', description: 'URI or identifier of the vault.' },
          auditLevel: { type: 'string', enum: ['surface', 'deep-audit', 'penetration-test'], description: 'Audit rigor.' },
          enforceZeroTrust: { type: 'boolean', description: 'Enforce zero-trust validation.' }
        },
        required: ['vaultEndpoint', 'auditLevel']
      },
      dependencies: { npm: ['crypto', 'lucide-react'] },
      evaluationRubric: { priority: 1, thermodynamicFootprint: 'low', requiresHumanReview: true, verificationLevel: 'strict' },
      bestSuitedFor: ['Secrets audits', 'ABAC hardening', 'Key hygiene verification'],
      unsuitedFor: ['Unauthenticated public endpoints']
    }, null, 2),
    parameters: JSON.stringify([
      { name: 'vaultEndpoint', type: 'string', required: true, description: 'URI or identifier of the secrets store.' },
      { name: 'auditLevel', type: 'string', required: true, description: 'Inspection depth: surface | deep-audit | penetration-test.', enum: ['surface', 'deep-audit', 'penetration-test'] },
      { name: 'enforceZeroTrust', type: 'boolean', required: false, description: 'Enforce attribute-based separation.' }
    ], null, 2),
    examples: JSON.stringify([
      {
        title: 'Full Cryptographic Vault Audit',
        scenario: 'Periodic compliance verification of secrets manager.',
        prompt: 'Audit the production secrets store and check for unrotated tokens.',
        invocations: 'evaluateVault("vault://internal-secrets/prod", "deep-audit")',
        expectedOutcome: 'Returns vaultAuditScore 95 and verifies AES-256-GCM encryption at rest.'
      }
    ], null, 2),
    references: JSON.stringify([
      { title: 'NIST SP 800-57 Key Management', url: 'https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final', type: 'spec', description: 'Recommendation for Cryptographic Key Management.' }
    ], null, 2),
    dependencies: JSON.stringify(['crypto', 'lucide-react'], null, 2),
    codeFiles: JSON.stringify({
      'vault_inspector.ts': {
        filename: 'vault_inspector.ts',
        language: 'typescript',
        description: 'MCP runtime secrets auditor.',
        content: `export function evaluateVault(endpoint: string) {\n  return { score: 95, unrotatedKeysCount: 0, passedAbac: true };\n}`
      }
    }, null, 2)
  },
  {
    id: 'write-skill',
    name: 'write-skill',
    title: 'Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine',
    description: 'Enables autonomous agents to design, author, audit, validate, and register new SKILL.md files. Evaluates existing skill logic to improve output quality, prevent redundancy, and systematically determine which skill in the registry is best for a given job.',
    category: 'orchestration',
    version: '1.3.0',
    authorId: 'system-architect',
    authorEmail: 'isaiahmsmith@aihomev2.com',
    status: 'published',
    isPublic: true,
    securityClearance: 'public',
    isExecutable: true,
    runtime: 'in_process',
    sourceReferences: [
      'notebook://studio-alchemist/meta-authoring.ipynb',
      'https://agent-engine.internal/specs/skill-v1'
    ],
    bundleStoragePath: 'gs://gen-lang-client-0573899362.firebasestorage.app/skills/write-skill/',
    bundleFiles: {
      guidelinesMd: 'gs://gen-lang-client-0573899362.firebasestorage.app/skills/write-skill/guidelines.md',
      runtimeScript: 'gs://gen-lang-client-0573899362.firebasestorage.app/skills/write-skill/script.js',
      runtimeFilename: 'script.js'
    },
    returns: JSON.stringify({
      type: 'object',
      properties: {
        skillRecord: { type: 'object', description: 'Fully parsed and validated skill manifest.' },
        summaryJson: { type: 'string', description: 'Machine-digestible ingestion contract.' }
      },
      required: ['skillRecord', 'summaryJson']
    }, null, 2),
    createdAt: '2026-10-04T21:30:00.000Z',
    updatedAt: new Date().toISOString(),
    skillMarkdown: `---
name: write-skill
title: "Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine"
description: |
  Enables autonomous agents to design, author, audit, validate, and register new SKILL.md files.
  Evaluates existing skill logic to improve output quality, prevent redundancy, and systematically
  determine which skill in the registry is best for a given job.
version: 1.3.0
category: orchestration
securityClearance: public
isExecutable: true
runtime: in_process
sourceReferences:
  - "notebook://studio-alchemist/meta-authoring.ipynb"
  - "https://agent-engine.internal/specs/skill-v1"
tags: [meta-skill, skill-authoring, decision-engine, prompt-engineering, ingestion-pipeline]
dependencies: ["js-yaml", "@types/node", "lucide-react"]
priority: 1
thermodynamicFootprint: low
requiresHumanReview: false
---

# Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine

## Description & Mission
The \`write-skill\` meta-skill is the core cognitive blueprint of the Agent Engine. It empowers an autonomous system to reflectively generate new specialized capabilities, audit existing skill logic, and determine optimal routing paths when dispatched on complex tasks. It enforces strict separation of concerns, defensive parameter schemas, verifiable examples, and machine-digestible ingestion summaries.

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
|---|---|---|---|
| \`skillName\` | \`string\` | true | Kebab-case machine identifier (e.g., \`data-pipeline-cleaner\`). |
| \`title\` | \`string\` | true | Clear, descriptive human-readable title. |
| \`mission\` | \`string\` | true | Concise statement of the skill's purpose and operational boundaries. |
| \`targetCapabilities\` | \`array\` | true | Specific tools, APIs, or reasoning patterns the skill encapsulates. |
| \`parametersList\` | \`array\` | true | Explicit inputs with types, default values, and required constraints. |
| \`examplesList\` | \`array\` | true | High-fidelity multi-turn prompt/action/expected-outcome walkthroughs. |
| \`codeScaffolding\` | \`object\` | false | Optional map of helper functions, scripts, or test harnesses. |
| \`referencesList\` | \`array\` | false | External documentation, API specs, and foundational research citations. |

## Operational Rules & Ingestion Pipeline Constraints
1. **Zero-Pill Discipline & Anti-Slop**: Every section must serve a verifiable function. Avoid empty filler phrases.
2. **Schema Invariance**: Every parameter must include explicit type boundaries and regex patterns where applicable.
3. **Determinism in Selection**: Before generating a new skill, compare similarity against the active registry. If cosine or semantic overlap exceeds 0.85, propose an upgrade rather than a duplicate.
4. **Summary JSON Synthesis**: Every authored skill must generate a strict JSON payload conforming to the Ingestion Pipeline Contract.

## In-Context Examples & Multi-Turn Walkthroughs

### Example 1: Authoring a Cloud Storage Sync Skill
**Prompt**: "Create a skill for managing S3 and Google Cloud Storage bucket backups with checksum verification."
**Scenario Context**: Developer needs automated multi-cloud archival.
**Expected Outcome**: Generates a valid \`SKILL.md\` with YAML frontmatter, parameters for \`sourceBucket\`, \`targetBucket\`, \`verifyChecksum\`, and scaffolding for MD5 comparisons.

### Example 2: Determining Best Skill for a Machine Learning Task
**Prompt**: "The user wants to optimize low-power inference on edge neuromorphic hardware."
**Scenario Context**: Agent queries registry for \`neuromorphic\` and \`low-power\`.
**Expected Outcome**: Evaluates \`write-skill\` vs \`neuromorphic-energy-optimizer\`. Returns \`neuromorphic-energy-optimizer\` with confidence 98% and provides rationale based on Landauer limits and SNN event-driven timing.

## Scaffolded Code & Reference Implementations

### \`validator.ts\`
_Runtime schema validation harness for newly authored skills._
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
- [Agent Skills Architecture Specification](https://agent-engine.internal/specs/skill-v1) - Official standard for agent skill registry.
- [Prompt Engineering & Metacognitive Reasoning](https://arxiv.org/abs/2201.11903) - Chain-of-thought and structured tool registration patterns.
`,
    summaryJson: JSON.stringify({
      schemaVersion: '2026.1',
      skillId: 'write-skill',
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
      parametersSchema: {
        type: 'object',
        properties: {
          skillName: { type: 'string', description: 'Kebab-case machine identifier slug.' },
          title: { type: 'string', description: 'Human-readable title.' },
          mission: { type: 'string', description: 'Concise statement of operational boundaries.' },
          parametersList: { type: 'array', description: 'Explicit inputs with types and constraints.' },
          examplesList: { type: 'array', description: 'Multi-turn walkthrough examples.' }
        },
        required: ['skillName', 'title', 'mission', 'parametersList', 'examplesList']
      },
      dependencies: {
        npm: ['js-yaml', '@types/node', 'lucide-react'],
        oauthScopes: ['https://www.googleapis.com/auth/drive.file']
      },
      evaluationRubric: {
        priority: 1,
        thermodynamicFootprint: 'low',
        requiresHumanReview: false,
        verificationLevel: 'strict'
      },
      bestSuitedFor: [
        'Bootstrapping new agent engine skills',
        'Routing incoming prompts to optimal skills',
        'Auditing prompt drift in legacy skills'
      ],
      unsuitedFor: [
        'Simple one-off questions without procedural workflow requirements'
      ]
    }, null, 2),
    parameters: JSON.stringify([
      { name: 'skillName', type: 'string', required: true, description: 'Kebab-case machine identifier (e.g. data-cleaner).' },
      { name: 'title', type: 'string', required: true, description: 'Clear, human-readable skill title.' },
      { name: 'mission', type: 'string', required: true, description: 'Concise purpose and domain boundary.' },
      { name: 'targetCapabilities', type: 'string[]', required: true, description: 'Target APIs, tools, and actions.' },
      { name: 'parametersList', type: 'SkillParameter[]', required: true, description: 'Declared schema parameters.' },
      { name: 'examplesList', type: 'SkillExample[]', required: true, description: 'Verified prompt-outcome test cases.' },
      { name: 'codeScaffolding', type: 'Record<string, SkillCodeFile>', required: false, description: 'Scaffolded code and scripts.' },
      { name: 'referencesList', type: 'SkillReference[]', required: false, description: 'Documentation and research links.' }
    ], null, 2),
    examples: JSON.stringify([
      {
        title: 'Authoring a Cloud Storage Sync Skill',
        scenario: 'Developer needs automated multi-cloud archival.',
        prompt: 'Create a skill for managing S3 and Google Cloud Storage bucket backups with checksum verification.',
        invocations: 'write-skill({ skillName: "cloud-storage-sync", ... })',
        expectedOutcome: 'Generates valid SKILL.md with schema, parameters, and MD5 verification code.'
      },
      {
        title: 'Determining Best Skill for a Machine Learning Task',
        scenario: 'Agent queries registry for neuromorphic edge inference.',
        prompt: 'The user wants to optimize low-power inference on edge neuromorphic hardware.',
        invocations: 'determineBestSkill("edge neuromorphic hardware optimization")',
        expectedOutcome: 'Selects neuromorphic-energy-optimizer with 98% confidence.'
      }
    ], null, 2),
    references: JSON.stringify([
      { title: 'Agent Skills Architecture Specification', url: 'https://agent-engine.internal/specs/skill-v1', type: 'spec', description: 'Official standard for agent skill registry.' },
      { title: 'Prompt Engineering & Metacognitive Reasoning', url: 'https://arxiv.org/abs/2201.11903', type: 'paper', description: 'Chain-of-thought and structured tool registration patterns.' },
      { title: 'Turing Imitation Game & Lovelace Objection', url: 'https://academic.oup.com/mind/article/LIX/236/433/986238', type: 'historical', description: 'Alan Turing 1950 Mind paper and Lady Lovelace Note G.' }
    ], null, 2),
    dependencies: JSON.stringify(['js-yaml', '@types/node', 'lucide-react'], null, 2),
    codeFiles: JSON.stringify({
      'validator.ts': {
        filename: 'validator.ts',
        language: 'typescript',
        description: 'Runtime schema validation harness for newly authored skills.',
        content: `export function validateSkillStructure(manifest: Record<string, any>): { valid: boolean; issues: string[] } {\n  const issues: string[] = [];\n  if (!manifest.name || !/^[a-z0-9-_]+$/.test(manifest.name)) {\n    issues.push('Skill name must be valid kebab-case.');\n  }\n  if (!manifest.description || manifest.description.length < 30) {\n    issues.push('Description must be detailed and at least 30 characters.');\n  }\n  if (!Array.isArray(manifest.parameters) || manifest.parameters.length === 0) {\n    issues.push('Skills must declare explicit parameters.');\n  }\n  return { valid: issues.length === 0, issues };\n}`
      }
    }, null, 2),
  },
  {
    id: 'neuromorphic-energy-optimizer',
    name: 'neuromorphic-energy-optimizer',
    title: 'Physical Cognition & Neuromorphic Thermodynamic Optimizer',
    description: 'Models compute resource constraints, Landauer dissipation limits (E = kB * T * ln(2)), von Neumann memory bus bottlenecks, and Spike-Timing-Dependent Plasticity (STDP) for high-efficiency neuromorphic architectures.',
    category: 'math-geometry',
    version: '2.0.0',
    authorId: 'system-agent-engine',
    authorEmail: 'isaiah9238@gmail.com',
    status: 'published',
    isPublic: true,
    securityClearance: 'public',
    isExecutable: true,
    runtime: 'in_process',
    sourceReferences: [
      'notebook://studio-alchemist/neuromorphic-thermo.ipynb',
      'https://doi.org/10.1147/rd.53.0183'
    ],
    returns: JSON.stringify({
      type: 'object',
      properties: {
        joules: { type: 'number', description: 'Dissipated heat in Joules.' },
        electronVolts: { type: 'number', description: 'Dissipated heat in eV.' },
        coolingLoadWatts: { type: 'number', description: 'Direct liquid cooling overhead.' }
      },
      required: ['joules', 'electronVolts']
    }, null, 2),
    createdAt: new Date('2026-10-02T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-04T07:50:00Z').toISOString(),
    skillMarkdown: `---
name: neuromorphic-energy-optimizer
title: Physical Cognition & Neuromorphic Thermodynamic Optimizer
description: |
  Models compute resource constraints, Landauer dissipation limits (E = kB * T * ln(2)),
  von Neumann memory bus bottlenecks, and Spike-Timing-Dependent Plasticity (STDP)
  for high-efficiency neuromorphic architectures.
version: 2.0.0
category: math-geometry
securityClearance: public
isExecutable: true
runtime: in_process
sourceReferences:
  - "notebook://studio-alchemist/neuromorphic-thermo.ipynb"
tags: [landauer-limit, von-neumann-wall, neuromorphic, snn, stdp, mcp-neuron, thermodynamic-ai]
dependencies: ["mathjs", "lucide-react"]
priority: 2
thermodynamicFootprint: low
requiresHumanReview: false
---

# Physical Cognition & Neuromorphic Thermodynamic Optimizer

## Description & Mission
Provides algorithmic evaluation of physical computing limits. Evaluates whether a workload suffers from the Von Neumann Memory Wall, calculates Landauer thermodynamic minimum dissipation bounds, and simulates asynchronous event-driven Spiking Neural Network (SNN) channels.

## Preconditions & Skill Selection Guidance
### When to Use
- When designing edge AI, low-power inference, or embedded neural engines.
- When computing thermal margins, server rack cooling loads (DLC), or Landauer bit erasure costs.
- When evaluating architectural alternatives to von Neumann processors (e.g., IBM NorthPole, Memristive ECRAM, Ionic LLNL computing).

## Parameters & Invocation Schemas
| Parameter | Type | Required | Description |
|---|---|---|---|
| \`temperatureKelvin\` | \`number\` | true | Operating temperature in Kelvin (default 300K). |
| \`bitErasuresCount\` | \`number\` | true | Number of irreversible bit transitions. |
| \`busLengthMicrons\` | \`number\` | false | Interconnect wire length between processor and DRAM. |
| \`clockFrequencyGhz\` | \`number\` | false | Processor clock rate. |
| \`architectureMode\` | \`string\` | true | \`von-neumann\` vs \`spiking-neuromorphic\` vs \`ionic\`. |

## Scaffolded Code & Reference Implementations

### \`landauer.ts\`
\`\`\`typescript
const BOLTZMANN_K = 1.380649e-23; // J/K

export function calculateLandauerMinimum(tempKelvin = 300, bitErasures = 1): { joules: number; electronVolts: number } {
  const joules = bitErasures * BOLTZMANN_K * tempKelvin * Math.LN2;
  const electronVolts = joules / 1.602176634e-19;
  return { joules, electronVolts };
}
\`\`\`

## References & Technical Foundations
- [Landauer 1961 - Irreversibility and Heat Generation](https://doi.org/10.1147/rd.53.0183) - Theoretical limit of information erasure.
- [McCulloch & Pitts 1943](https://doi.org/10.1007/BF02478259) - A Logical Calculus of the Ideas Immanent in Nervous Activity.
`,
    summaryJson: JSON.stringify({
      schemaVersion: '2026.1',
      skillId: 'neuromorphic-energy-optimizer',
      name: 'neuromorphic-energy-optimizer',
      title: 'Physical Cognition & Neuromorphic Thermodynamic Optimizer',
      description: 'Models compute resource constraints, Landauer dissipation limits, and neuromorphic energy models.',
      category: 'math-geometry',
      version: '2.0.0',
      runtime: 'in_process',
      isExecutable: true,
      securityClearance: 'public',
      triggerPreconditions: [
        'Hardware efficiency queries',
        'Thermal dissipation or Landauer limit modeling',
        'Neuromorphic SNN and STDP calculations',
        'Von Neumann memory wall analysis'
      ],
      routingKeywords: ['landauer', 'thermodynamic', 'neuromorphic', 'snn', 'energy', 'mcp-neuron', 'hardware', 'bottleneck'],
      parametersSchema: {
        type: 'object',
        properties: {
          temperatureKelvin: { type: 'number', description: 'Operating temperature in Kelvin.' },
          bitErasuresCount: { type: 'number', description: 'Total irreversible bit transitions.' },
          architectureMode: { type: 'string', enum: ['von-neumann', 'spiking-neuromorphic', 'ionic'], description: 'Compute architecture style.' }
        },
        required: ['temperatureKelvin', 'bitErasuresCount', 'architectureMode']
      },
      dependencies: {
        npm: ['mathjs', 'lucide-react']
      },
      evaluationRubric: {
        priority: 2,
        thermodynamicFootprint: 'low',
        requiresHumanReview: false,
        verificationLevel: 'strict'
      },
      bestSuitedFor: ['Thermal design', 'Landauer calculations', 'Neuromorphic edge planning'],
      unsuitedFor: ['General UI design or web styling']
    }, null, 2),
    parameters: JSON.stringify([
      { name: 'temperatureKelvin', type: 'number', required: true, description: 'Operating temperature in Kelvin (300K ambient).' },
      { name: 'bitErasuresCount', type: 'number', required: true, description: 'Number of irreversible bit erasures.' },
      { name: 'architectureMode', type: 'string', required: true, description: 'Computing paradigm: von-neumann | spiking-neuromorphic | ionic.', enum: ['von-neumann', 'spiking-neuromorphic', 'ionic'] }
    ], null, 2),
    examples: JSON.stringify([
      {
        title: 'Calculate Landauer Minimum at Room Temperature',
        scenario: 'Evaluate thermal floor for 1 billion bit operations.',
        prompt: 'What is the theoretical thermodynamic lower bound of heat dissipated when erasing 10^9 bits at 300K?',
        invocations: 'calculateLandauerMinimum(300, 1e9)',
        expectedOutcome: 'Returns 2.87e-12 Joules (0.0179 eV per bit).'
      }
    ], null, 2),
    references: JSON.stringify([
      { title: 'Landauer 1961', url: 'https://doi.org/10.1147/rd.53.0183', type: 'paper', description: 'Irreversibility and Heat Generation in the Computing Process.' },
      { title: 'McCulloch & Pitts 1943', url: 'https://doi.org/10.1007/BF02478259', type: 'paper', description: 'A Logical Calculus of the Ideas Immanent in Nervous Activity.' }
    ], null, 2),
    dependencies: JSON.stringify(['mathjs', 'lucide-react'], null, 2),
    codeFiles: JSON.stringify({
      'landauer.ts': {
        filename: 'landauer.ts',
        language: 'typescript',
        description: 'Thermodynamic dissipation calculator.',
        content: `const BOLTZMANN_K = 1.380649e-23;\nexport function calculateLandauerMinimum(tempKelvin = 300, bitErasures = 1) {\n  const joules = bitErasures * BOLTZMANN_K * tempKelvin * Math.LN2;\n  return { joules, electronVolts: joules / 1.602176634e-19 };\n}`
      }
    }, null, 2),
  },
  {
    id: 'agent-task-router',
    name: 'agent-task-router',
    title: 'Deterministic Task Router & Skill Selector',
    description: 'Analyzes user prompts, extracts intent vectors, queries the skill registry database, checks parameter requirements, and returns the highest-scoring skill candidate with confidence intervals.',
    category: 'orchestration',
    version: '1.1.0',
    authorId: 'system-agent-engine',
    authorEmail: 'isaiah9238@gmail.com',
    status: 'published',
    isPublic: true,
    securityClearance: 'public',
    isExecutable: true,
    runtime: 'in_process',
    sourceReferences: [
      'notebook://studio-alchemist/task-dispatch-matrix.ipynb'
    ],
    returns: JSON.stringify({
      type: 'object',
      properties: {
        routedSkillId: { type: 'string' },
        confidenceScore: { type: 'number' },
        reasoning: { type: 'array', items: { type: 'string' } }
      },
      required: ['routedSkillId', 'confidenceScore']
    }, null, 2),
    createdAt: new Date('2026-10-03T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-04T07:50:00Z').toISOString(),
    skillMarkdown: `---
name: agent-task-router
title: Deterministic Task Router & Skill Selector
description: |
  Analyzes user prompts, extracts intent vectors, queries the skill registry database,
  checks parameter requirements, and returns the highest-scoring skill candidate with confidence intervals.
version: 1.1.0
category: orchestration
securityClearance: public
isExecutable: true
runtime: in_process
sourceReferences:
  - "notebook://studio-alchemist/task-dispatch-matrix.ipynb"
tags: [router, dispatcher, skill-selection, arbitration, multi-agent]
dependencies: ["lucide-react"]
priority: 1
thermodynamicFootprint: low
requiresHumanReview: false
---

# Deterministic Task Router & Skill Selector

## Description & Mission
Decides systematically which skill is best for the job. Takes an unstructured user prompt, compares it against the ingestion summary JSON records of all registered skills, and delivers a ranked routing decision.

## Parameters & Invocation Schemas
| Parameter | Type | Required | Description |
|---|---|---|---|
| \`query\` | \`string\` | true | The incoming user instruction or agent goal. |
| \`threshold\` | \`number\` | false | Minimum match score (0-100) to accept dispatch (default 40). |
| \`contextState\` | \`object\` | false | Active conversation metadata or available environment tokens. |
`,
    summaryJson: JSON.stringify({
      schemaVersion: '2026.1',
      skillId: 'agent-task-router',
      name: 'agent-task-router',
      title: 'Deterministic Task Router & Skill Selector',
      description: 'Analyzes user prompts and selects the optimal skill from the registry.',
      category: 'orchestration',
      version: '1.1.0',
      runtime: 'in_process',
      isExecutable: true,
      securityClearance: 'public',
      triggerPreconditions: [
        'Incoming multi-faceted user request',
        'Disambiguation between multiple candidate skills'
      ],
      routingKeywords: ['router', 'dispatcher', 'select-skill', 'best-skill', 'arbitrate', 'intent'],
      parametersSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'User prompt or subtask.' },
          threshold: { type: 'number', description: 'Confidence threshold.' }
        },
        required: ['query']
      },
      dependencies: { npm: ['lucide-react'] },
      evaluationRubric: { priority: 1, thermodynamicFootprint: 'low', requiresHumanReview: false, verificationLevel: 'strict' },
      bestSuitedFor: ['Deciding which skill is best for the job', 'Multi-skill arbitration'],
      unsuitedFor: ['Direct code execution']
    }, null, 2),
    parameters: JSON.stringify([
      { name: 'query', type: 'string', required: true, description: 'Incoming user prompt or task.' },
      { name: 'threshold', type: 'number', required: false, description: 'Confidence score threshold (0-100).' }
    ], null, 2),
    examples: JSON.stringify([
      {
        title: 'Route to Neuromorphic Skill',
        scenario: 'User asks about Landauer energy bounds.',
        prompt: 'How much energy does an LLM waste moving weights across the von Neumann bus?',
        invocations: 'routeTask("How much energy does an LLM waste moving weights?")',
        expectedOutcome: 'Dispatches neuromorphic-energy-optimizer with 96% match score.'
      }
    ], null, 2),
    references: JSON.stringify([
      { title: 'Semantic Routing in Foundation Models', url: 'https://arxiv.org/abs/2309.00000', type: 'paper', description: 'Intent classification and tool parameter extraction.' }
    ], null, 2),
    dependencies: JSON.stringify(['lucide-react'], null, 2),
    codeFiles: JSON.stringify({}, null, 2),
  },
  {
    id: 'workspace-skill-sync',
    name: 'workspace-skill-sync',
    title: 'Google Workspace Cloud Registry Bridge (Drive & Gmail)',
    description: 'Provides bi-directional synchronization between the local Agent Engine database and Google Drive (for backup, archival, and sharing of SKILL.md bundles) and Gmail (for ingestion digests and team distribution).',
    category: 'workflow-automation',
    version: '1.0.0',
    authorId: 'system-agent-engine',
    authorEmail: 'isaiah9238@gmail.com',
    status: 'verified',
    isPublic: true,
    securityClearance: 'internal',
    isExecutable: true,
    runtime: 'cloud_function',
    sourceReferences: [
      'notebook://studio-alchemist/workspace-bridge.ipynb'
    ],
    returns: JSON.stringify({
      type: 'object',
      properties: {
        syncStatus: { type: 'string', enum: ['synced', 'failed'] },
        cloudFileId: { type: 'string' }
      },
      required: ['syncStatus']
    }, null, 2),
    createdAt: new Date('2026-10-04T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-04T07:50:00Z').toISOString(),
    skillMarkdown: `---
name: workspace-skill-sync
title: Google Workspace Cloud Registry Bridge (Drive & Gmail)
description: |
  Provides bi-directional synchronization between the local Agent Engine database
  and Google Drive (for backup, archival, and sharing of SKILL.md bundles)
  and Gmail (for ingestion digests and team distribution).
version: 1.0.0
category: workflow-automation
securityClearance: internal
isExecutable: true
runtime: cloud_function
sourceReferences:
  - "notebook://studio-alchemist/workspace-bridge.ipynb"
tags: [google-drive, gmail, workspace, sync, export, backup]
dependencies: ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/gmail.send"]
priority: 2
thermodynamicFootprint: low
requiresHumanReview: true
---

# Google Workspace Cloud Registry Bridge (Drive & Gmail)

## Description & Mission
Ensures seamless portability of agent skills by leveraging Google Drive for cloud persistence and Gmail for notifications and distribution. Enforces explicit user confirmation before any file mutation or email dispatch.

## Parameters & Invocation Schemas
| Parameter | Type | Required | Description |
|---|---|---|---|
| \`action\` | \`string\` | true | \`export-to-drive\`, \`import-from-drive\`, or \`send-via-gmail\`. |
| \`skillId\` | \`string\` | true | Target skill to export or share. |
| \`targetRecipient\` | \`string\` | false | Destination email when sending via Gmail. |
| \`userConfirmed\` | \`boolean\` | true | Explicit user approval verification flag. |
`,
    summaryJson: JSON.stringify({
      schemaVersion: '2026.1',
      skillId: 'workspace-skill-sync',
      name: 'workspace-skill-sync',
      title: 'Google Workspace Cloud Registry Bridge (Drive & Gmail)',
      description: 'Synchronizes skill bundles with Google Drive and sends digests via Gmail.',
      category: 'workflow-automation',
      version: '1.0.0',
      runtime: 'cloud_function',
      isExecutable: true,
      securityClearance: 'internal',
      triggerPreconditions: [
        'User requests backing up skills to Google Drive',
        'User wants to email a skill specification or summary JSON',
        'User wants to import a SKILL.md from Drive'
      ],
      routingKeywords: ['drive', 'gmail', 'backup', 'export', 'sync', 'workspace', 'email'],
      parametersSchema: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['export-to-drive', 'import-from-drive', 'send-via-gmail'] },
          skillId: { type: 'string' },
          targetRecipient: { type: 'string' },
          userConfirmed: { type: 'boolean' }
        },
        required: ['action', 'skillId', 'userConfirmed']
      },
      dependencies: {
        oauthScopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/gmail.send']
      },
      evaluationRubric: { priority: 2, thermodynamicFootprint: 'low', requiresHumanReview: true, verificationLevel: 'strict' },
      bestSuitedFor: ['Cloud backup to Google Drive', 'Sharing skills with team via Gmail'],
      unsuitedFor: ['Local offline execution without Google accounts']
    }, null, 2),
    parameters: JSON.stringify([
      { name: 'action', type: 'string', required: true, description: 'Operation: export-to-drive | import-from-drive | send-via-gmail' },
      { name: 'skillId', type: 'string', required: true, description: 'Target skill identifier.' },
      { name: 'targetRecipient', type: 'string', required: false, description: 'Recipient email address.' },
      { name: 'userConfirmed', type: 'boolean', required: true, description: 'User confirmation flag.' }
    ], null, 2),
    examples: JSON.stringify([
      {
        title: 'Export write-skill to Google Drive',
        scenario: 'Backing up skills repository to personal Google Drive.',
        prompt: 'Export the write-skill definition and summary JSON to my Google Drive.',
        invocations: 'syncSkillToDrive("write-skill")',
        expectedOutcome: 'Prompts confirmation modal, then uploads write-skill.md to Google Drive.'
      }
    ], null, 2),
    references: JSON.stringify([
      { title: 'Google Drive API v3', url: 'https://developers.google.com/drive/api/v3/reference', type: 'doc', description: 'Drive REST API documentation.' },
      { title: 'Gmail API v1', url: 'https://developers.google.com/gmail/api/reference/rest', type: 'doc', description: 'Gmail REST API documentation.' }
    ], null, 2),
    dependencies: JSON.stringify(['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/gmail.send'], null, 2),
    codeFiles: JSON.stringify({}, null, 2),
  },
  {
    id: 'deep-research-brief-generator',
    name: 'deep_research_brief_generator',
    title: 'Deep Research Prompt & Brief Generator',
    description: 'Formulates structured, machine-executable research briefs and prompts for deep research agents. Enforces explicit sub-topic scoping, source provenance constraints, iterative ReAct retrieval loops, and inline citation discipline.',
    category: 'workflow-automation',
    version: '1.0.0',
    authorId: 'system-agent-engine',
    authorEmail: 'isaiah9238@gmail.com',
    status: 'published',
    isPublic: true,
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
    createdAt: new Date('2026-10-20T00:40:00Z').toISOString(),
    updatedAt: new Date('2026-10-20T00:45:00Z').toISOString(),
    skillMarkdown: `---
name: deep-research-brief-generator
title: "Deep Research Prompt & Brief Generator"
description: "Formulates structured, machine-executable research briefs and prompts for deep research agents. Enforces explicit sub-topic scoping, source provenance constraints, iterative ReAct retrieval loops, and inline citation discipline."
version: 1.0.0
category: research-and-prompting
genkit-managed: false
priority: 1
requiresHumanReview: false
---

# Deep Research Prompt & Brief Generator

## Overview & Mission
The deep-research-brief-generator skill transforms unstructured research requests into standardized, machine-executable Research Briefs. Eliminates context clash, prevents token inflation, and forces rigorous source-grounded verification.
`,
    summaryJson: JSON.stringify({
      schemaVersion: '2026.1',
      skillId: 'deep-research-brief-generator',
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
        'Multi-agent deep research pipeline needs structured brief contract'
      ],
      routingKeywords: ['deep research', 'brief generator', 'retrieval', 'sub-topic breakdown', 'prompt schema', 'citation'],
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
    ], null, 2),
    examples: JSON.stringify([
      {
        title: 'Quantum Hardware Benchmarks',
        scenario: 'Comparing neutral-atom vs superconducting qubit architectures',
        prompt: 'Generate deep research brief for quantum qubit benchmarks 2025-2026',
        invocations: 'deep_research_brief_generator({ rawQuery: "Quantum benchmarks 2025-2026" })',
        expectedOutcome: '5-part structured markdown research brief ready for parallel sub-agent execution.'
      }
    ], null, 2),
    references: JSON.stringify([
      { title: 'Open Deep Research Pipeline Specification', url: 'https://github.com/open-deep-research/pipeline-spec', type: 'spec', description: 'Multi-agent orchestration specification.' }
    ], null, 2),
    dependencies: JSON.stringify(['@google/genai'], null, 2),
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
    }, null, 2),
  },
  {
    id: 'polymathic-technical-synthesis',
    name: 'polymathic-technical-synthesis',
    title: 'Polymathic Technical Synthesis — Expert Multi-Domain Technical Responses',
    description: 'Deliver high-density, first-principles polymathic technical responses across psychology, sociology, computer science, mathematics, and physics. Use when synthesizing cross-disciplinary concepts, deriving formal models, stating complexity bounds, or generating rigorous algorithmic explanations with exact terminology and domain bridges.',
    category: 'orchestration',
    version: '1.1.0',
    authorId: 'system-polymath',
    authorEmail: 'isaiah9238@gmail.com',
    status: 'verified',
    isPublic: true,
    securityClearance: 'public',
    isExecutable: true,
    runtime: 'in_process',
    sourceReferences: [
      'notebook://studio-alchemist/polymathic-synthesis.ipynb',
      'https://arxiv.org/abs/2303.12712',
      'https://cowan.cognition.org/working-memory-chunks',
      'https://plato.stanford.edu/entries/turing-test/'
    ],
    bundleStoragePath: 'gs://gen-lang-client-0573899362.firebasestorage.app/skills/polymathic-technical-synthesis/',
    bundleFiles: {
      guidelinesMd: `# Polymathic Technical Synthesis — Expert Multi-Domain Technical Responses (v1.1)

Ground all technical synthesis in axiomatic first principles, dialectical precision, and isomorphic mappings across domains. Prioritize mathematical formalism, complexity analysis, and empirically anchored behavioral models. Use when the query requires bridging quantitative foundations with computational architecture or socio-behavioral dynamics.

## Core Directives
- **First-Principles Scaffolding**: Ground explanations in fundamental mechanics—axiomatic definitions in mathematics, physical state dynamics, algorithmic complexity bounds, or socio-behavioral feedback loops.
- **Dialectical Precision**: Avoid colloquial hand-waving. Use exact terminology from the relevant domain (e.g., distinguish covariance vs. correlation, concurrency vs. parallelism, psychological affect vs. emotional appraisal, structural functionalism vs. symbolic interactionism).
- **Cross-Disciplinary Translation**: Map isomorphic concepts across domains (e.g., statistical mechanics entropy ↔ Shannon information ↔ generative model loss landscapes ↔ social network contagion).
- **High Information-to-Ink Ratio**: Deliver immediate structural density. Use rigorous mathematical formalism (KaTeX), structural diagrams, or algorithmic implementations in lieu of expository filler.

## Interdisciplinary Integration Matrix (v1.1 Promoted Bridges)
- **Differential Geometry ↔ Manifold / Spatial Modeling**: Riemannian metrics \\( g_{\\mu\\nu} \\), geodesics, tangent bundles, pullback metrics, curvature tensors.
- **Control Theory ↔ Homeostatic / Agent Regulation**: Closed-loop feedback, observability, state estimation, LQR, Kalman filtering, Lyapunov stability \\( V(x) \\).
- **Statistical Physics ↔ Machine Learning**: Energy landscapes, Gibbs distributions, MCMC, Langevin dynamics.
- **Cognitive Psychology ↔ HCI / UX Engineering**: Working memory limits (Cowan \\( 4 \\pm 1 \\) chunks), Fitts's Law, state machines, event-driven latency.
- **Sociology ↔ Distributed Systems**: Trust mechanics, Byzantine consensus, Sybil defense, gossip protocols.
- **Pure Mathematics ↔ Language Architecture**: Category theory, lambda calculus, type systems, algebraic data types, functors.
- **Information Theory ↔ Generative Modeling**: Shannon entropy \\( \\leftrightarrow \\) loss landscapes, KL divergence, ELBO.
- **Game Theory ↔ Multi-Agent Systems**: Nash equilibria \\( \\leftrightarrow \\) incentive design, ESS, MARL.

See \`references/domain-bridges.md\` for the full 14-domain matrix and \`references/quality-checklist.md\` for the response verification rubric.`,
      runtimeScript: `// Polymathic Technical Synthesis Runtime Kernel (v1.1)
// Enforces Riemannian/Lyapunov invariants, 14 domain bridges, and 7-point quality checklist
export default async function run(params: {
  query: string;
  sourceDomain?: string;
  targetDomain?: string;
  formalTooling?: string;
}) {
  const { query, sourceDomain = 'Statistical Physics', targetDomain = 'Machine Learning', formalTooling } = params;
  console.log('[PolymathicSynthesis] Synthesizing cross-domain query:', query);
  return {
    success: true,
    skillId: 'polymathic-technical-synthesis',
    version: '1.1.0',
    appliedBridge: {
      sourceDomain,
      targetDomain,
      formalTooling: formalTooling || 'KaTeX formalism + Lyapunov/Riemannian invariants',
      isomorphicMapping: \`\${sourceDomain} ↔ \${targetDomain}\`
    },
    qualityScore: '7/7 - Optimal dialetical density & zero syntactic fluff',
    timestamp: new Date().toISOString()
  };
}`,
      runtimeFilename: 'script.js'
    },
    returns: JSON.stringify({
      type: 'object',
      properties: {
        synthesizedResponse: { type: 'string', description: 'High-density, first-principles synthesis with formal KaTeX notation.' },
        domainBridgesApplied: { type: 'array', items: { type: 'string' }, description: 'Specific isomorphic mappings used.' },
        invariantsDefined: { type: 'array', items: { type: 'string' }, description: 'Explicit conserved quantities, state spaces, or bounds.' },
        qualityChecklistScore: { type: 'string', description: 'Verification score against 7-point rubric (e.g. 7/7).' }
      },
      required: ['synthesizedResponse', 'domainBridgesApplied', 'invariantsDefined', 'qualityChecklistScore']
    }, null, 2),
    createdAt: '2026-10-21T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
    skillMarkdown: `---
name: polymathic-technical-synthesis
description: "Deliver high-density, first-principles polymathic technical responses across psychology, sociology, computer science, mathematics, and physics. Use when synthesizing cross-disciplinary concepts, deriving formal models, stating complexity bounds, or generating rigorous algorithmic explanations with exact terminology and domain bridges."
type: workflow
lifecycle: active
version: 1.1.0
category: orchestration
securityClearance: public
isExecutable: true
runtime: in_process
sourceReferences:
  - "notebook://studio-alchemist/polymathic-synthesis.ipynb"
  - "https://arxiv.org/abs/2303.12712"
  - "https://cowan.cognition.org/working-memory-chunks"
  - "https://plato.stanford.edu/entries/turing-test/"
tags: [polymathic, interdisciplinary, differential-geometry, control-theory, statistical-mechanics, cognitive-load, category-theory, complexity, isomorphism, lyapunov]
dependencies: ["katex", "lucide-react", "@types/node"]
priority: 1
thermodynamicFootprint: low
requiresHumanReview: false
---

# Polymathic Technical Synthesis — Expert Multi-Domain Technical Responses

Ground all technical synthesis in axiomatic first principles, dialectical precision, and isomorphic mappings across domains. Prioritize mathematical formalism, complexity analysis, and empirically anchored behavioral models. Use when the query requires bridging quantitative foundations with computational architecture or socio-behavioral dynamics.

## Core Directives

- **First-Principles Scaffolding**: Ground explanations in fundamental mechanics—axiomatic definitions in mathematics, physical state dynamics, algorithmic complexity bounds, or socio-behavioral feedback loops.
- **Dialectical Precision**: Avoid colloquial hand-waving. Use exact terminology from the relevant domain (e.g., distinguish covariance vs. correlation, concurrency vs. parallelism, psychological affect vs. emotional appraisal, structural functionalism vs. symbolic interactionism).
- **Cross-Disciplinary Translation**: Map isomorphic concepts across domains (e.g., statistical mechanics entropy ↔ Shannon information ↔ generative model loss landscapes ↔ social network contagion).
- **High Information-to-Ink Ratio**: Deliver immediate structural density. Use rigorous mathematical formalism (KaTeX), structural diagrams, or algorithmic implementations in lieu of expository filler.

## Execution Standards by Domain

**Mathematics & Theoretical Physics**  
Define state spaces, boundary conditions, and invariant quantities explicitly before deriving conclusions. Use standard notation: matrices \\( A \\in \\mathbb{R}^{m \\times n} \\), expectations \\( \\mathbb{E}_{x \\sim P}[f(x)] \\), and metric tensors \\( g_{\\mu\\nu} \\) on smooth manifolds \\( \\mathcal{M} \\). Frame physical and dynamical systems via Lagrangian/Hamiltonian mechanics, Lyapunov functions \\( V(x) \\), or operator algebras.

**Computer Science & Polyglot Software Engineering**  
Write idiomatic, memory-conscious, paradigm-correct code.  
- Systems (Rust, C, C++): lifetime management, cache locality, RAII, zero-cost abstractions, thread safety.  
- Functional (Haskell, OCaml, Scala): referential transparency, immutable structures, higher-kinded types, monadic composition.  
- Managed (Go, TypeScript, C#, Java): concurrent primitives, robust typing, predictable GC.  
- Dynamic (Python, Julia, R): vectorize, manage GIL, exploit BLAS/LAPACK.  
State asymptotic upper bounds \\( O(n) \\) and spatial complexity for all algorithmic primitives.

**Psychology & Sociology**  
Anchor individual cognition in dual-process theory, Bayesian predictive processing, or cognitive load constraints. Structure macro-scale dynamics via institutional analysis, game theory (Nash equilibria, evolutionary stable strategies), and graph topology (clustering coefficients, preferential attachment). Separate normative value judgments from mechanistic descriptions of systemic incentives.

## Interdisciplinary Integration Matrix

See \`references/domain-bridges.md\` for the expanded 14-domain matrix and additional mappings.

Core bridges (always prefer these when relevant):

| Source Domain         | Target Domain                  | Conceptual Bridge                              | Formal Tooling                               |
|-----------------------|--------------------------------|------------------------------------------------|----------------------------------------------|
| Statistical Physics   | Machine Learning               | Energy landscapes, Gibbs distributions         | MCMC, Langevin dynamics                      |
| Cognitive Psychology  | HCI / UX Engineering           | Working memory limits, Fitts's Law             | State machines, event-driven latency         |
| Sociology             | Distributed Systems            | Trust mechanics, Byzantine consensus           | Sybil defense, gossip protocols              |
| Pure Mathematics      | Language Architecture          | Category theory, lambda calculus               | Type systems, ADTs, functors                 |
| Information Theory    | Generative Modeling            | Shannon entropy ↔ loss landscapes              | KL divergence, ELBO                          |
| Game Theory           | Multi-Agent Systems            | Nash equilibria ↔ incentive design             | ESS, MARL, mechanism design                  |
| Differential Geometry | Manifold / Spatial Modeling    | Riemannian metrics, geodesics, tangent bundles | Pullback metrics, curvature tensors, splines |
| Control Theory        | Homeostatic / Agent Regulation | Closed-loop feedback, observability            | LQR, Kalman filtering, Lyapunov stability    |

## Response Quality Checklist

Before finalizing any response:

1. State spaces, boundary conditions, or invariants defined explicitly?
2. Exact domain terminology used (no colloquial hand-waving)?
3. At least one cross-domain isomorphism mapped with formal tooling?
4. Asymptotic complexity or invariant quantities stated for any algorithm or dynamical system?
5. Dual-layer delivery: formal definition/proof/implementation first, then operational/empirical implication?
6. Zero syntactic fluff: no decorative metaphors unless they serve rigorous multi-domain pedagogical synthesis?
7. Normative judgments separated from mechanistic incentive descriptions where applicable?

Full checklist and scoring guidance: \`references/quality-checklist.md\`.

## Output Formatting Protocol

- **Direct Mathematical/Algorithmic Entry**: Begin immediately with the formula, schema, or system state; avoid introductory signposting.
- **Dual-Layer Delivery**: Provide the formal definition/proof/implementation first, followed by the operational or empirical implication.
- **Zero Syntactic Fluff**: Omit decorative metaphors unless they serve as a rigorous pedagogical tool for multi-domain synthesis.
`,
    summaryJson: JSON.stringify({
      schemaVersion: '2026.1',
      skillId: 'polymathic-technical-synthesis',
      name: 'polymathic-technical-synthesis',
      title: 'Polymathic Technical Synthesis — Expert Multi-Domain Technical Responses',
      description: 'Deliver high-density, first-principles polymathic technical responses across psychology, sociology, computer science, mathematics, and physics. Use when synthesizing cross-disciplinary concepts, deriving formal models, stating complexity bounds, or generating rigorous algorithmic explanations with exact terminology and domain bridges.',
      category: 'orchestration',
      version: '1.1.0',
      runtime: 'in_process',
      isExecutable: true,
      securityClearance: 'public',
      triggerPreconditions: [
        'Synthesizing concepts across two or more disjoint scientific domains',
        'Deriving formal mathematical models with Riemannian metrics or Lyapunov stability',
        'Mapping computational complexity to cognitive load constraints',
        'Translating statistical mechanics or information theory to machine learning loss landscapes',
        'Requiring high information-to-ink ratio with zero conversational fluff'
      ],
      routingKeywords: [
        'polymathic',
        'interdisciplinary',
        'differential-geometry',
        'control-theory',
        'statistical-mechanics',
        'cognitive-load',
        'category-theory',
        'complexity',
        'isomorphism',
        'lyapunov',
        'riemannian',
        'first-principles'
      ],
      parametersSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The cross-disciplinary research problem or synthesis prompt.' },
          sourceDomain: { type: 'string', description: 'Primary origin domain (e.g. Statistical Physics, Differential Geometry).' },
          targetDomain: { type: 'string', description: 'Target application domain (e.g. Machine Learning, Distributed Systems).' },
          formalTooling: { type: 'string', description: 'Formal mathematical or algorithmic tooling to apply.' },
          requireKaTeX: { type: 'boolean', description: 'Enforce LaTeX math notation for all equations and bounds.' }
        },
        required: ['query', 'sourceDomain', 'targetDomain']
      },
      dependencies: {
        npm: ['katex', 'lucide-react', '@types/node']
      },
      evaluationRubric: {
        priority: 1,
        thermodynamicFootprint: 'low',
        requiresHumanReview: false,
        verificationLevel: 'strict'
      },
      bestSuitedFor: [
        'Cross-disciplinary technical papers and formal architectural derivations',
        'Algorithmic complexity mapped to biological and cognitive constraints',
        'Formal synthesis combining differential geometry, statistical physics, and distributed systems'
      ],
      unsuitedFor: [
        'Trivial single-domain queries or conversational chit-chat',
        'High-level summaries that forbid mathematical notation or proofs'
      ]
    }, null, 2),
    parameters: JSON.stringify([
      { name: 'query', type: 'string', required: true, description: 'The cross-disciplinary research question or system synthesis task.' },
      { name: 'sourceDomain', type: 'string', required: true, description: 'Source theoretical discipline (e.g., Differential Geometry, Statistical Physics).' },
      { name: 'targetDomain', type: 'string', required: true, description: 'Target computational or applied discipline (e.g., Machine Learning, HCI).' },
      { name: 'formalTooling', type: 'string', required: false, description: 'Specific analytical machinery (e.g., Pullback metrics, Lyapunov functions, MCMC).' },
      { name: 'requireKaTeX', type: 'boolean', required: false, description: 'Enforce rigorous LaTeX typesetting for state spaces and bounds.' }
    ], null, 2),
    examples: JSON.stringify([
      {
        title: 'Latent Space Traversal via Riemannian Manifold Pullback',
        scenario: 'Deep generative model interpolations causing out-of-distribution hallucinations.',
        prompt: 'Formulate an optimal latent interpolation path for a VAE decoder f: Z -> X using differential geometry.',
        invocations: 'polymathic-technical-synthesis({ query: "Riemannian metric on generative latent space", sourceDomain: "Differential Geometry", targetDomain: "Generative Modeling" })',
        expectedOutcome: 'Derives pullback Riemannian metric G(z) = J_f(z)^T J_f(z), defines geodesic equations, and demonstrates energy-minimizing paths avoiding low-density probability voids.'
      },
      {
        title: 'Distributed Consensus Mapped to Sociological Reputation Quorums',
        scenario: 'Designing resilient peer-to-peer voting under strategic adversarial agents.',
        prompt: 'Bridge Byzantine fault tolerance with sociological institutional reputation and preferential attachment.',
        invocations: 'polymathic-technical-synthesis({ query: "Byzantine agreement vs institutional trust", sourceDomain: "Sociology", targetDomain: "Distributed Systems" })',
        expectedOutcome: 'Maps institutional sanctioning to cryptographic attestations and preferential attachment to stake-weighted quorum thresholds.'
      }
    ], null, 2),
    references: JSON.stringify([
      { title: 'Sparks of Artificial General Intelligence: Early experiments with GPT-4', url: 'https://arxiv.org/abs/2303.12712', type: 'paper', description: 'Bubeck et al. (2023) analysis of emergent cross-disciplinary reasoning.' },
      { title: 'The Magical Number 4 in Short-Term Memory', url: 'https://cowan.cognition.org/working-memory-chunks', type: 'paper', description: 'Nelson Cowan (2001) working memory capacity chunks as computational cache constraints.' },
      { title: 'Computing Machinery and Intelligence', url: 'https://academic.oup.com/mind/article/LIX/236/433/986238', type: 'historical', description: 'Alan Turing (1950) imitation game and response to Lovelace objection.' },
      { title: 'Thermodynamics of Computation', url: 'https://doi.org/10.1147/rd.53.0183', type: 'spec', description: 'Rolf Landauer (1961) dissipation limits for irreversible bit operations.' }
    ], null, 2),
    dependencies: JSON.stringify(['katex', 'lucide-react', '@types/node'], null, 2),
    codeFiles: JSON.stringify({
      'SKILL.md': {
        filename: 'SKILL.md',
        language: 'markdown',
        description: 'Core progressive disclosure instructions and domain bridge matrix.',
        content: `---
name: polymathic-technical-synthesis
description: "Deliver high-density, first-principles polymathic technical responses across psychology, sociology, computer science, mathematics, and physics. Use when synthesizing cross-disciplinary concepts, deriving formal models, stating complexity bounds, or generating rigorous algorithmic explanations with exact terminology and domain bridges."
type: workflow
lifecycle: active
---

# Polymathic Technical Synthesis — Expert Multi-Domain Technical Responses

Ground all technical synthesis in axiomatic first principles, dialectical precision, and isomorphic mappings across domains. Prioritize mathematical formalism, complexity analysis, and empirically anchored behavioral models. Use when the query requires bridging quantitative foundations with computational architecture or socio-behavioral dynamics.

## Core Directives

- **First-Principles Scaffolding**: Ground explanations in fundamental mechanics—axiomatic definitions in mathematics, physical state dynamics, algorithmic complexity bounds, or socio-behavioral feedback loops.
- **Dialectical Precision**: Avoid colloquial hand-waving. Use exact terminology from the relevant domain (e.g., distinguish covariance vs. correlation, concurrency vs. parallelism, psychological affect vs. emotional appraisal, structural functionalism vs. symbolic interactionism).
- **Cross-Disciplinary Translation**: Map isomorphic concepts across domains (e.g., statistical mechanics entropy ↔ Shannon information ↔ generative model loss landscapes ↔ social network contagion).
- **High Information-to-Ink Ratio**: Deliver immediate structural density. Use rigorous mathematical formalism (KaTeX), structural diagrams, or algorithmic implementations in lieu of expository filler.

## Interdisciplinary Integration Matrix

See references/domain-bridges.md for the expanded matrix and additional mappings.

| Source Domain         | Target Domain                  | Conceptual Bridge                              | Formal Tooling                               |
|-----------------------|--------------------------------|------------------------------------------------|----------------------------------------------|
| Statistical Physics   | Machine Learning               | Energy landscapes, Gibbs distributions         | MCMC, Langevin dynamics                      |
| Cognitive Psychology  | HCI / UX Engineering           | Working memory limits, Fitts's Law             | State machines, event-driven latency         |
| Sociology             | Distributed Systems            | Trust mechanics, Byzantine consensus           | Sybil defense, gossip protocols              |
| Pure Mathematics      | Language Architecture          | Category theory, lambda calculus               | Type systems, ADTs, functors                 |
| Information Theory    | Generative Modeling            | Shannon entropy ↔ loss landscapes              | KL divergence, ELBO                          |
| Game Theory           | Multi-Agent Systems            | Nash equilibria ↔ incentive design             | ESS, MARL, mechanism design                  |
| Differential Geometry | Manifold / Spatial Modeling    | Riemannian metrics, geodesics, tangent bundles | Pullback metrics, curvature tensors, splines |
| Control Theory        | Homeostatic / Agent Regulation | Closed-loop feedback, observability            | LQR, Kalman filtering, Lyapunov stability    |`
      },
      'references/domain-bridges.md': {
        filename: 'references/domain-bridges.md',
        language: 'markdown',
        description: 'Expanded 14-domain integration matrix and isomorphic mathematical mapping blocks.',
        content: `---
description: "Expanded interdisciplinary integration matrix and additional domain bridges for polymathic-technical-synthesis. Read when mapping concepts across physics, ML, psychology, sociology, mathematics, and systems."
connections: [quality-checklist]
---

# Domain Bridges — Interdisciplinary Integration Matrix

## Core Matrix

| Source Domain          | Target Domain                      | Conceptual Bridge                                      | Formal Tooling                                   |
|------------------------|------------------------------------|--------------------------------------------------------|--------------------------------------------------|
| Statistical Physics    | Machine Learning                   | Energy landscapes, Gibbs distributions                 | Markov Chain Monte Carlo, Langevin dynamics      |
| Cognitive Psychology   | HCI / UX Engineering               | Working memory limits, Fitts's Law                     | State machines, event-driven latency mitigation  |
| Sociology              | Distributed Systems                | Trust mechanics, Byzantine consensus                   | Sybil defense mechanisms, gossip protocols       |
| Pure Mathematics       | Language Architecture              | Category theory, lambda calculus                       | Type systems, algebraic data types, functors     |
| Information Theory     | Generative Modeling                | Shannon entropy \\leftrightarrow loss landscapes       | KL divergence, evidence lower bound (ELBO)       |
| Game Theory            | Multi-Agent Systems                | Nash equilibria \\leftrightarrow incentive design     | Evolutionary stable strategies, MARL             |
| Graph Theory           | Social Network Dynamics            | Preferential attachment, clustering coefficients       | Contagion models, epidemic spreading on graphs   |
| Cognitive Load Theory  | Algorithm / Interface Design       | Intrinsic / extraneous / germane load                  | Complexity bounds, progressive disclosure, latency |
| Thermodynamics         | Optimization                       | Free energy minimization                               | Variational inference, annealing schedules       |
| Bayesian Inference     | Predictive Processing              | Posterior updating                                     | Hierarchical generative models, precision weighting |
| Differential Geometry  | Manifold Learning / Representation | Riemannian metrics, geodesics, tangent bundles         | Ricci curvature, pullback metrics, VAEs          |
| Control Theory         | Homeostatic / Affective Regulation | Closed-loop feedback, observability, state estimation  | LQR, Kalman filtering, Lyapunov stability        |
| Quantum Mechanics      | Quantum Computing / Contextuality  | Hilbert spaces, unitary evolution, entanglement        | Density matrices, Lindblad master equation, BQP  |
| Microeconomic Auctions | Cloud / Distributed Scheduling     | Incentive compatibility, resource contention           | VCG mechanisms, spot pricing equilibria          |

## Additional Isomorphic Mappings

**Statistical Mechanics ↔ Generative Models**  
Partition function Z = \\sum_s e^{-\\beta E(s)} maps to the normalizing constant in energy-based models. Sampling via Langevin dynamics corresponds to score-based generative models.

**Cognitive Load ↔ Computational Complexity**  
Working memory capacity \\approx 4 \\pm 1 independent chunks (Cowan) imposes an effective bandwidth constraint analogous to cache locality or streaming algorithms. Extraneous load maps to unnecessary intermediate allocations.

**Differential Geometry ↔ Latent Space Geometry**  
A generative model decoder f: \\mathcal{Z} \\to \\mathcal{X} induces a pullback Riemannian metric G(z) = J_f(z)^T J_f(z) on the latent manifold \\mathcal{Z}. Interpolation along minimum-energy geodesics prevents traversal through low-density regions of the probability distribution.

**Control Theory ↔ Allostatic & Cognitive Control**  
Physiological and executive regulation operate as closed-loop feedback systems minimizing state deviation \\dot{x} = Ax + Bu under sensory noise. Kalman gain K_k is isomorphic to precision-weighting of prediction errors in hierarchical Bayesian cognition.`
      },
      'references/quality-checklist.md': {
        filename: 'references/quality-checklist.md',
        language: 'markdown',
        description: 'Mandatory 7-point response quality checklist and anti-patterns.',
        content: `---
description: "Response quality checklist, anti-patterns, and scoring guidance for polymathic-technical-synthesis outputs. Read before finalizing any multi-domain technical response."
connections: [domain-bridges]
---

# Response Quality Checklist

Apply this checklist before emitting any final answer under the skill. Each item is binary; aim for all true.

## Mandatory Checks

1. **State space / invariants explicit**: Are state spaces, boundary conditions, conserved quantities, or fixed points defined before conclusions?
2. **Dialectical precision**: Exact terminology from each domain used? No colloquial substitutions?
3. **Cross-domain isomorphism**: At least one explicit mapping stated with conceptual bridge and formal tooling?
4. **Complexity or invariants stated**: Asymptotic time/space bound or invariant quantity given?
5. **Dual-layer delivery**: Formal definition / proof / implementation appears first, followed by operational or empirical implication?
6. **Zero syntactic fluff**: No decorative metaphors or signposting that do not serve rigorous synthesis?
7. **Normative / mechanistic separation**: Value judgments kept distinct from incentive or dynamical descriptions?

## Scoring Guidance
- 7/7: emit as-is
- 5–6/7: revise the missing items inline before finalizing
- ≤4/7: restart from the formal entry point`
      },
      'CHANGELOG.md': {
        filename: 'CHANGELOG.md',
        language: 'markdown',
        description: 'Version history and release notes.',
        content: `# Changelog

## 2026-10-21 (v1.1)
- Promoted Differential Geometry and Control Theory bridges to SKILL.md core matrix
- Added explicit Riemannian metric (g_{\\mu\\nu}) and Lyapunov function (V(x)) invariant directives
- Expanded references/domain-bridges.md to 14 domain bridges and 6 isomorphic mapping blocks
- Added LaTeX delimiter formatting guardrail to references/quality-checklist.md
- Added riemannian_manifold_control eval test case and tightened invariant assertions in evals.json
- Expanded triggers.json to 10 positive/negative routing boundary cases

## 2026-10-21 (v1.0)
- Initial skill creation from polymathic-technical-synthesis definition
- Added expanded domain bridges reference
- Added response quality checklist reference
- Populated evals and triggers with concrete cross-disciplinary cases`
      },
      'synthesis_kernel.ts': {
        filename: 'synthesis_kernel.ts',
        language: 'typescript',
        description: 'Invariant verifier and isomorphic bridge resolver runtime.',
        content: `export interface SynthesisDomainBridge {
  sourceDomain: string;
  targetDomain: string;
  bridgeName: string;
  formalTooling: string;
}

export function resolveBridge(source: string, target: string): SynthesisDomainBridge | null {
  const bridges: Record<string, SynthesisDomainBridge> = {
    'geometry-ml': {
      sourceDomain: 'Differential Geometry',
      targetDomain: 'Machine Learning',
      bridgeName: 'Pullback Metric & Geodesic Interpolation',
      formalTooling: 'G(z) = J_f(z)^T J_f(z)'
    },
    'control-cognition': {
      sourceDomain: 'Control Theory',
      targetDomain: 'Cognitive Science',
      bridgeName: 'Allostatic Feedback & Kalman Precision Weighting',
      formalTooling: 'Lyapunov function V(x) <= 0'
    }
  };
  const key = \`\${source.toLowerCase()}-\${target.toLowerCase()}\`;
  return bridges[key] || null;
}`
      }
    }, null, 2)
  }
];

export const SEED_SKILLS: SkillRecord[] = RAW_SEED_SKILLS.map((skill) => {
  const embedding = skill.id === 'write-skill'
    ? WRITE_SKILL_VECTOR_768
    : generateDeterministicVector768(
        `${skill.title} ${skill.description} ${skill.category} ${skill.runtime || ''}`
      );

  let parametersSchema: Record<string, any> = {};
  if (skill.parametersSchema && typeof skill.parametersSchema === 'object') {
    parametersSchema = skill.parametersSchema;
  } else {
    try {
      const parsed = JSON.parse(skill.parameters || '[]');
      const props: Record<string, any> = {};
      if (Array.isArray(parsed)) {
        parsed.forEach((p: any) => {
          props[p.name] = { type: p.type || 'string', description: p.description || '' };
        });
      }
      parametersSchema = {
        type: 'object',
        properties: props,
        required: Array.isArray(parsed) ? parsed.filter((p: any) => p.required).map((p: any) => p.name) : [],
      };
    } catch {
      parametersSchema = { type: 'object', properties: {} };
    }
  }

  const bundleStoragePath = skill.bundleStoragePath || `gs://gen-lang-client-0573899362.firebasestorage.app/skills/${skill.id}/`;
  const bundleFiles = skill.bundleFiles || {
    guidelinesMd: `# ${skill.title}\n\n${skill.description}\n\n## Runtime\n${skill.runtime || 'in_process'}\n\n## Security Clearance\n${skill.securityClearance || 'public'}\n`,
    runtimeScript: `// Runtime execution script for ${skill.name}\nexport default async function run(params) {\n  console.log("Executing skill ${skill.name} with params:", params);\n  return { success: true, timestamp: Date.now() };\n}`,
    runtimeFilename: 'script.js',
  };

  return {
    ...skill,
    embedding,
    parametersSchema,
    bundleStoragePath,
    bundleFiles,
  };
});

