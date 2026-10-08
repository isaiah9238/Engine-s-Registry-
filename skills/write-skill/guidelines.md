---
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
dependencies: ["js-yaml", "@types/node", "lucide-react"]
priority: 1
thermodynamicFootprint: low
requiresHumanReview: false
---

# Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine

## Description & Mission
The `write-skill` meta-skill is the core cognitive blueprint of the Agent Engine. It empowers an autonomous system to reflectively generate new specialized capabilities, audit existing skill logic, and determine optimal routing paths when dispatched on complex tasks. It enforces strict separation of concerns, defensive parameter schemas, verifiable examples, and machine-digestible ingestion summaries.

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
| `skillName` | string | true | Kebab-case machine identifier (e.g., `data-pipeline-cleaner`). |
| `title` | string | true | Clear, descriptive human-readable title. |
| `mission` | string | true | Concise statement of the skill's purpose and operational boundaries. |
| `targetCapabilities` | array | true | Specific tools, APIs, or reasoning patterns the skill encapsulates. |
| `parametersList` | array | true | Explicit inputs with types, default values, and required constraints. |
| `examplesList` | array | true | High-fidelity multi-turn prompt/action/expected-outcome walkthroughs. |
| `codeScaffolding` | object | false | Optional map of helper functions, scripts, or test harnesses. |
| `referencesList` | array | false | External documentation, API specs, and foundational research citations. |

## Operational Rules & Ingestion Pipeline Constraints
1. **Zero-Pill Discipline & Anti-Slop:** Every section must serve a verifiable function. Avoid empty filler phrases.
2. **Schema Invariance:** Every parameter must include explicit type boundaries and regex patterns where applicable.
3. **Determinism in Selection:** Before generating a new skill, compare similarity against the active registry. If cosine or semantic overlap exceeds 0.85, propose an upgrade rather than a duplicate.
4. **Summary JSON Synthesis:** Every authored skill must generate a strict JSON payload conforming to the Ingestion Pipeline Contract.

## In-Context Examples & Multi-Turn Walkthroughs

### Example 1: Authoring a Cloud Storage Sync Skill
* **Prompt:** "Create a skill for managing S3 and Google Cloud Storage bucket backups with checksum verification."
* **Scenario Context:** Developer needs automated multi-cloud archival.
* **Expected Outcome:** Generates a valid SKILL.md with YAML frontmatter, parameters for `sourceBucket`, `targetBucket`, `verifyChecksum`, and scaffolding for MD5 comparisons.

### Example 2: Determining Best Skill for a Machine Learning Task
* **Prompt:** "The user wants to optimize low-power inference on edge neuromorphic hardware."
* **Scenario Context:** Agent queries registry for neuromorphic and low-power.
* **Expected Outcome:** Evaluates `write-skill` vs `neuromorphic-energy-optimizer`. Returns `neuromorphic-energy-optimizer` with confidence 98% and provides rationale based on Landauer limits and SNN event-driven timing.

## Scaffolded Code & Reference Implementations

### `validator.ts`
Runtime schema validation harness for newly authored skills.
```typescript
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
```
