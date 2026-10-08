/**
 * Mind Map Node Hierarchy and Specifications
 * Derived from NotebookLM Mind Map and the 4 Standard Agent Skill Architectures.
 */

export interface MindMapNode {
  id: string;
  label: string;
  category?: 'root' | 'branch' | 'subbranch' | 'leaf';
  description?: string;
  guidelines?: string[];
  codeSnippet?: string;
  templateId?: 'basic' | 'enterprise' | 'executable' | 'ingestion';
  children?: MindMapNode[];
  isExpanded?: boolean;
}

export const AGENT_SKILL_MIND_MAP: MindMapNode = {
  id: 'root',
  label: 'Agent Skill Templates',
  category: 'root',
  description: 'Foundational taxonomy and execution standards for authoring autonomous AI agent skills.',
  guidelines: [
    'Enforces zero-pill discipline and anti-slop rules.',
    'Provides 4 production architectures ranging from lightweight prompts to 4-layer state-aware toolkits.',
    'Optimized for 768-dimensional vector retrieval and autonomous routing via write-skill.',
  ],
  children: [
    {
      id: 'core-template',
      label: 'Core Template Structure',
      category: 'branch',
      description: 'The fundamental markdown and metadata layout required by all agent systems.',
      guidelines: [
        'Separates metadata parsing from agent reasoning body.',
        'Ensures compatibility with open-standard skill registries.',
      ],
      children: [
        {
          id: 'yaml-frontmatter',
          label: 'YAML Frontmatter',
          category: 'subbranch',
          description: 'Machine-readable header demarcated by triple dashes (---). Parsed prior to prompt ingestion.',
          children: [
            {
              id: 'yf-name',
              label: 'name: my-skill-name',
              category: 'leaf',
              description: 'Unique kebab-case machine slug. Must match regex ^[a-z0-9-_]+$.',
              codeSnippet: 'name: cryptographic-vault-evaluator',
            },
            {
              id: 'yf-desc',
              label: 'description: A clear description of what this skill does',
              category: 'leaf',
              description: 'High-density semantic summary. Critical for vector similarity matching and agent dispatch.',
              codeSnippet: 'description: Audits key vaults, enforces zero-trust ABAC policies, and rotates ephemeral secrets across distributed workloads.',
            },
            {
              id: 'yf-tags',
              label: 'tags & metadata (runtime, version, category)',
              category: 'leaf',
              description: 'Operational classification parameters for ABAC and runtime execution targets.',
              codeSnippet: "version: 1.0.0\ncategory: security-audit\nsecurityClearance: public\nruntime: in_process",
            },
          ],
        },
        {
          id: 'markdown-body',
          label: 'Markdown Body',
          category: 'subbranch',
          description: 'Human-readable instructions, rules, constraints, and verifiable examples.',
          children: [
            {
              id: 'mb-title',
              label: 'Skill Title Heading (# My Skill Name)',
              category: 'leaf',
              description: 'Single H1 header identifying the cognitive skill.',
              codeSnippet: '# Skill Architect: Autonomous Meta-Skill Authoring',
            },
            {
              id: 'mb-purpose',
              label: 'Detailed Description of purpose',
              category: 'leaf',
              description: 'In-depth mission statement outlining boundaries, goals, and core logic.',
            },
            {
              id: 'mb-when',
              label: 'When to Use This Skill (Use case list)',
              category: 'leaf',
              description: 'Explicit trigger preconditions. Prevents unnecessary skill invocations.',
              codeSnippet: "## When to Use\n- User requests creation of new agent skill.\n- Auditing or upgrading existing SKILL.md documents.\n\n## When NOT to Use\n- For simple one-off questions without procedural workflow requirements.",
            },
            {
              id: 'mb-instructions',
              label: 'Instructions Section (Step-by-step guidance)',
              category: 'leaf',
              description: 'Numbered deterministic phases or state transitions guiding agent decision trees.',
            },
            {
              id: 'mb-examples',
              label: 'Examples Section (Real-world examples)',
              category: 'leaf',
              description: 'Multi-turn few-shot prompt/action/expected-outcome demonstrations.',
            },
          ],
        },
      ],
    },
    {
      id: 'authoring-schema',
      label: 'Comprehensive Authoring Schema',
      category: 'branch',
      description: 'Extended schema required for programmatic authoring, validation, and registry ingestion.',
      children: [
        {
          id: 'manifest-metadata',
          label: 'Manifest & Metadata',
          category: 'subbranch',
          description: 'Structured parameters for registry discovery, RBAC clearance, and lifecycle tracking.',
          children: [
            {
              id: 'mm-slug',
              label: 'skillName: Kebab-case machine identifier slug',
              category: 'leaf',
              description: 'Primary registry key and tool call signature name.',
            },
            {
              id: 'mm-title',
              label: 'title: Clear human-readable title',
              category: 'leaf',
              description: 'Display title in management consoles and agent tooling bars.',
            },
            {
              id: 'mm-mission',
              label: 'mission: Concise statement of operational boundaries',
              category: 'leaf',
              description: 'Defines what the skill will execute and what it must explicitly refuse.',
            },
            {
              id: 'mm-category',
              label: 'category: Domain classification',
              category: 'leaf',
              description: 'Domain taxonomy (orchestration, security-audit, math-geometry, cloud-infrastructure).',
            },
          ],
        },
        {
          id: 'params-inputs',
          label: 'Parameters & Inputs',
          category: 'subbranch',
          description: 'Strict JSON schema parameter specifications and runtime type checking.',
          children: [
            {
              id: 'pi-list',
              label: 'parametersList: Explicit inputs with types',
              category: 'leaf',
              description: 'Formal tool parameter definitions mapping directly to JSON Schema / tool call schemas.',
              codeSnippet: 'parametersList: [\n  { name: "targetUrl", type: "string", required: true, description: "Endpoint URL to scan." }\n]',
            },
            {
              id: 'pi-constraints',
              label: 'Required constraints and default values',
              category: 'leaf',
              description: 'Defensive boundary rules preventing agent hallucination and runaway execution.',
            },
          ],
        },
        {
          id: 'walkthroughs-refs',
          label: 'Walkthroughs & References',
          category: 'subbranch',
          description: 'Traceability anchors, scaffolded code scripts, and test suites.',
          children: [
            {
              id: 'wr-examples',
              label: 'examplesList: Multi-turn prompt walkthroughs',
              category: 'leaf',
              description: 'Realistic multi-turn dialogues showing edge cases and recoveries.',
            },
            {
              id: 'wr-refs',
              label: 'referencesList: External documentation and API specs',
              category: 'leaf',
              description: 'Grounded URLs and specification documents verifying authoritative behavior.',
            },
            {
              id: 'wr-code',
              label: 'codeScaffolding: Helper scripts and test harnesses',
              category: 'leaf',
              description: 'Executable Node/Python/WASM modules packaged into Cloud Storage bundles.',
              codeSnippet: "export function validateSkillStructure(manifest) {\n  // Validation logic\n  return { valid: true, issues: [] };\n}",
            },
          ],
        },
      ],
    },
    {
      id: 'principles-rules',
      label: 'Usage Principles & Rules',
      category: 'branch',
      description: 'Cognitive principles maximizing model performance, token economy, and thermodynamic efficiency.',
      children: [
        {
          id: 'prog-disclosure',
          label: 'Progressive Disclosure Model',
          category: 'subbranch',
          description: 'Two-tier memory model: lightweight index metadata first, full instructions on demand.',
          children: [
            {
              id: 'pd-meta',
              label: 'Lightweight metadata loaded first',
              category: 'leaf',
              description: 'Only name, description, category, and 768-dim embeddings reside in primary search index.',
            },
            {
              id: 'pd-full',
              label: 'Full instructions loaded only when relevant',
              category: 'leaf',
              description: 'Detailed SKILL.md body and code bundles fetched only upon tool invocation routing.',
            },
          ],
        },
        {
          id: 'best-practices',
          label: 'Authoring Best Practices',
          category: 'subbranch',
          description: 'Guarantees robust model compliance and clean code generation.',
          children: [
            {
              id: 'bp-zero-pill',
              label: 'Zero-Pill Discipline: Avoid empty filler phrases',
              category: 'leaf',
              description: 'Cut generic pleasantries, AI disclaimers, and redundant fluff. Every word must constrain behavior.',
            },
            {
              id: 'bp-schema',
              label: 'Schema Invariance: Enforce explicit type boundaries',
              category: 'leaf',
              description: 'Use strict TypeScript/JSON schemas with required arrays and regex checks.',
            },
            {
              id: 'bp-positive',
              label: 'Positive Instruction: Focus on patterns to use',
              category: 'leaf',
              description: 'State what the agent MUST do rather than solely listing negatives.',
            },
          ],
        },
      ],
    },
    {
      id: 'standard-templates',
      label: 'Standardized Architectures (The 4 Templates)',
      category: 'branch',
      description: 'The 4 canonical skill templates from Studio Alchemist and production agent frameworks.',
      children: [
        {
          id: 'tpl-basic',
          label: 'Template 1: Basic Open Standard (Instruction-Only)',
          category: 'subbranch',
          templateId: 'basic',
          description: 'Single-turn prompt augmentation and general development tasks without heavy tooling.',
          codeSnippet: `---\nname: data-pipeline-cleaner\ndescription: Cleans and standardizes raw CSV datasets for ingest.\n---\n\n# Data Pipeline Cleaner\n\n## When to Use\n- Cleaning unstructured tabular data.\n\n## Instructions\n1. Check column headers.\n2. Coerce timestamps to ISO 8601.\n3. Drop NaN values in primary keys.`,
        },
        {
          id: 'tpl-enterprise',
          label: 'Template 2: Studio Alchemist Enterprise (Progressive Disclosure)',
          category: 'subbranch',
          templateId: 'enterprise',
          description: 'Cloud infrastructure management, CLI version-pinning, and linked reference documents.',
          codeSnippet: `---\nname: firebase-feature-manager\ntitle: "Cloud Deployment Manager"\ndescription: Enterprise cloud orchestration using pinned CLI toolchains.\nversion: 1.0.0\ncategory: cloud-infrastructure\ngenkit-managed: true\n---\n\n# Cloud Deployment Manager\n\n## Prerequisites\n- Node.js >= 18.0.0\n- npx -y firebase-tools@latest --version\n\n## References\n- [setup.md](./setup.md)\n- [schema.md](./schema.md)`,
        },
        {
          id: 'tpl-executable',
          label: 'Template 3: Strobes 4-Layer Methodology (State-Aware)',
          category: 'subbranch',
          templateId: 'executable',
          description: 'Multi-phase security audits with persistent SQLite state and 4 coordinated architectural layers.',
          codeSnippet: `# 4-Layer Architecture Overview\n1. Methodology Layer (SKILL.md)\n2. Scripts Layer (scripts/)\n3. Shared Library Layer (scripts/lib/)\n4. Data Layer (project.db SQLite)\n\n## Phase-by-Phase Methodology\n- Phase 1: Scoping & Initialization\n- Phase 2: Enumeration\n- Phase 3: Vulnerability Analysis\n- Phase 4: Exploitation\n- Phase 5: Evidence Capture\n- Phase 6: Reporting`,
        },
        {
          id: 'tpl-ingestion',
          label: 'Template 4: Skill Architect / Meta-Skill Ingestion (write-skill)',
          category: 'subbranch',
          templateId: 'ingestion',
          description: 'Self-authoring meta-skill with parametersSchema map, runtime validation, and 768-dim vector embedding.',
          codeSnippet: `---\nname: write-skill\ntitle: "Skill Architect: Autonomous Meta-Skill Authoring"\ndescription: Enables autonomous agents to design, author, audit, validate, and register new SKILL.md files.\nversion: 1.2.0\ncategory: orchestration\nruntime: in_process\nsecurityClearance: public\nisExecutable: true\n---`,
        },
      ],
    },
  ],
};

export const TEMPLATE_PRESETS = [
  {
    id: 'basic',
    name: 'Template 1: Basic Open Standard',
    description: 'Lightweight instruction-only skill with minimal YAML and step-by-step guidance.',
    category: 'development',
    runtime: 'in_process',
    markdown: `---
name: my-basic-skill
description: Concise 1-2 sentence description of what this skill does and when an agent should invoke it.
---

# My Basic Skill

## When to Use This Skill
- Use when the user requests [scenario 1].
- Use when [scenario 2].

## When NOT to Use This Skill
- Do not use for [out-of-scope scenario 1].
- Do not use when [alternative skill/tool] is better suited.

## Instructions & Core Workflow
1. **Step 1: Preparation**: Describe initial checks or environment inspection.
2. **Step 2: Execution**: Detail the primary decision logic or code transformation.
3. **Step 3: Verification**: Detail how to verify and test the resulting output.

## Operational Rules & Constraints
- Constraint 1: Never expose secrets or hardcoded credentials.
- Constraint 2: Ensure output strictly conforms to the requested format.

## Examples

### Example 1: Standard Usage
**Prompt**: "Execute standard task on sample input."
**Expected Outcome**:
\`\`\`json
{
  "status": "completed",
  "result": "Sample output"
}
\`\`\`
`,
  },
  {
    id: 'enterprise',
    name: 'Template 2: Studio Alchemist Enterprise',
    description: 'Enterprise standard with progressive disclosure, CLI version-pinning, and linked reference guides.',
    category: 'cloud-infrastructure',
    runtime: 'in_process',
    markdown: `---
name: enterprise-cloud-feature
title: "Enterprise Cloud Management & Deployer"
description: >
  Detailed description explaining the precise technical domain, SDK requirements, and operational boundaries.
version: 1.0.0
category: cloud-infrastructure
genkit-managed: true
---

# Enterprise Cloud Management & Deployer

## Prerequisites
Before executing any commands, verify the following prerequisites:
1. **Tooling**: Ensure Node.js (>=18.0.0) is installed.
2. **CLI Version**: Explicitly verify CLI installation with pinned syntax:
   \`\`\`bash
   npx -y firebase-tools@latest --version
   \`\`\`
3. **Authentication**: Verify user login state. Do NOT proceed if unauthenticated.

## Usage Principles
- **Strict Command Syntax**: Always execute CLI tools using pinned npx syntax.
- **Reference First**: Always consult linked reference files prior to relying on ungrounded assumptions.
- **Conditional Paths**: If operating system differences affect execution, stop and clarify.

## References
Consult these dedicated guides in the skill directory before generating configuration or code:
- [\`setup.md\`](./setup.md): Environment initialization and project bootstrapping.
- [\`schema.md\`](./schema.md): Database schemas, indexes, and type definitions.
- [\`security_rules.md\`](./security_rules.md): Authorization policies and access control matrices.

## Examples & Code Patterns

### Example 1: Production Initialization
\`\`\`typescript
import { initializeApp } from 'firebase-admin/app';
// Implementation details with error handling
\`\`\`
`,
  },
  {
    id: 'executable',
    name: 'Template 3: Strobes 4-Layer Methodology',
    description: 'Methodology-driven state-aware toolkit with persistent SQLite database and 6 execution phases.',
    category: 'security-audit',
    runtime: 'mcp',
    markdown: `---
name: autonomous-security-audit
title: "Autonomous Penetration Testing & Assessment"
description: >
  Methodology-driven security skill for multi-phase vulnerability evaluation with persistent SQLite state.
triggers:
  - "Perform security audit on target"
  - "Run web penetration test"
permissions:
  - "execute_cli_script"
  - "read_write_workspace"
phases: 6
---

# 4-Layer Architecture Overview
This skill operates across four coordinated layers:
1. **Methodology Layer (\`SKILL.md\`)**: Defines operational rules and phase-by-phase decision trees.
2. **Scripts Layer (\`scripts/\`)**: Deterministic CLI utilities for tool orchestration.
3. **Shared Library Layer (\`scripts/lib/\`)**: Common parsers, HTTP helpers, and logging utilities.
4. **Data Layer (\`project.db\`)**: Local SQLite database storing session targets, findings, and evidence.

---

## Phase-by-Phase Methodology

### Phase 1: Target Scoping & Initialization
- **Action**: Initialize session database: \`python3 scripts/init_session.py --target <target-url>\`.
- **Decision Tree**: If target is unreachable, halt execution and report network failure.

### Phase 2: Reconnaissance & Enumeration
- **Action**: Run enumeration scripts: \`python3 scripts/enum_services.py\`.
- **State Update**: Store discovered endpoints in \`project.db\`.

### Phase 3: Vulnerability Analysis
- **Action**: Execute targeted scanners against active endpoints stored in \`project.db\`.

### Phase 4: Exploitation & Validation
- **Constraint**: Validate findings manually or via script before flagging as confirmed.

### Phase 5: Documentation & Evidence Collection
- **Action**: Export evidence logs into \`/workspace/scratch/evidence/\`.

### Phase 6: Final Reporting
- **Action**: Synthesize SQLite findings into a final security report.

---

## Tool Invocation Rules
- Executable scripts must be invoked via standard subprocess calls.
- All scan results MUST be written to \`project.db\` to maintain persistent context across steps.
`,
  },
  {
    id: 'ingestion',
    name: 'Template 4: Meta-Skill Ingestion Payload (write-skill)',
    description: 'Autonomous meta-skill authoring standard with JSON Schema parameters, 768-dim vector embedding, and runtime validation.',
    category: 'orchestration',
    runtime: 'in_process',
    markdown: `---
name: custom-autonomous-skill
title: "Autonomous Domain Intelligence Engine"
description: >
  High-density semantic summary enabling autonomous agents to execute complex domain workflows with validation.
version: 1.0.0
category: orchestration
securityClearance: public
isExecutable: true
runtime: in_process
sourceReferences:
  - "notebook://studio-alchemist/domain.ipynb"
tags: [meta-skill, domain-workflow, validation-engine]
dependencies: ["js-yaml", "@types/node", "lucide-react"]
priority: 1
thermodynamicFootprint: low
requiresHumanReview: false
---

# Autonomous Domain Intelligence Engine

## Description & Mission
Provides robust procedural workflows for specialized autonomous tasks. Enforces strict input validation, zero-pill discipline, and verifiable returns.

## Preconditions & Skill Selection Guidance

### When to Use
- When task requires structured procedural execution.
- When inputs conform to declared parametersSchema.

### When NOT to Use
- For simple one-off questions without workflow state.
- When an existing higher-priority skill already handles this intent.

## Parameters & Invocation Schemas

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| \`inputQuery\` | string | true | Primary input argument. |
| \`options\` | object | false | Execution configuration options. |

## Operational Rules & Ingestion Pipeline Constraints
1. **Zero-Pill Discipline & Anti-Slop**: Every section must serve a verifiable function.
2. **Schema Invariance**: Enforce explicit type boundaries.
3. **Determinism**: Propose upgrade if semantic overlap > 0.85.

## Scaffolded Code & Reference Implementations
\`\`\`typescript
export async function execute(params) {
  // Runtime validation logic
  return { success: true, timestamp: new Date().toISOString() };
}
\`\`\`
`,
  },
];
