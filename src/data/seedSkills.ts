/**
 * Seed Skills for the Agent Engine Skill Registry
 * Built according to the SKILL.md specification and ingestion pipeline standard.
 */
import type { SkillRecord } from '../types/skill';

export const SEED_SKILLS: SkillRecord[] = [
  {
    id: 'write-skill',
    name: 'write-skill',
    title: 'Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine',
    description: 'Enables autonomous agents to design, author, audit, validate, and register new SKILL.md files. Evaluates existing skill logic to improve output quality, prevent redundancy, and systematically determine which skill in the registry is best for a given job.',
    category: 'Meta-Engineering',
    version: '1.2.0',
    authorId: 'system-agent-engine',
    authorEmail: 'isaiah9238@gmail.com',
    status: 'verified',
    isPublic: true,
    createdAt: new Date('2026-10-01T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-04T00:00:00Z').toISOString(),
    skillMarkdown: `---
name: write-skill
description: |
  Enables autonomous agents to design, author, audit, validate, and register new SKILL.md files.
  Evaluates existing skill logic to improve output quality, prevent redundancy, and systematically
  determine which skill in the registry is best for a given job.
version: 1.2.0
category: Meta-Engineering
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
      category: 'Meta-Engineering',
      version: '1.2.0',
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
    category: 'Thermodynamics & Hardware',
    version: '2.0.0',
    authorId: 'system-agent-engine',
    authorEmail: 'isaiah9238@gmail.com',
    status: 'published',
    isPublic: true,
    createdAt: new Date('2026-10-02T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-04T00:00:00Z').toISOString(),
    skillMarkdown: `---
name: neuromorphic-energy-optimizer
description: |
  Models compute resource constraints, Landauer dissipation limits (E = kB * T * ln(2)),
  von Neumann memory bus bottlenecks, and Spike-Timing-Dependent Plasticity (STDP)
  for high-efficiency neuromorphic architectures.
version: 2.0.0
category: Thermodynamics & Hardware
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
      category: 'Thermodynamics & Hardware',
      version: '2.0.0',
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
    category: 'Orchestration',
    version: '1.1.0',
    authorId: 'system-agent-engine',
    authorEmail: 'isaiah9238@gmail.com',
    status: 'published',
    isPublic: true,
    createdAt: new Date('2026-10-03T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-04T00:00:00Z').toISOString(),
    skillMarkdown: `---
name: agent-task-router
description: |
  Analyzes user prompts, extracts intent vectors, queries the skill registry database,
  checks parameter requirements, and returns the highest-scoring skill candidate with confidence intervals.
version: 1.1.0
category: Orchestration
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
      category: 'Orchestration',
      version: '1.1.0',
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
    category: 'Integrations & Workspace',
    version: '1.0.0',
    authorId: 'system-agent-engine',
    authorEmail: 'isaiah9238@gmail.com',
    status: 'verified',
    isPublic: true,
    createdAt: new Date('2026-10-04T00:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-04T00:00:00Z').toISOString(),
    skillMarkdown: `---
name: workspace-skill-sync
description: |
  Provides bi-directional synchronization between the local Agent Engine database
  and Google Drive (for backup, archival, and sharing of SKILL.md bundles)
  and Gmail (for ingestion digests and team distribution).
version: 1.0.0
category: Integrations & Workspace
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
      category: 'Integrations & Workspace',
      version: '1.0.0',
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
  }
];
