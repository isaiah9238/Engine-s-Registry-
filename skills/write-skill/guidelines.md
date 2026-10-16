---
name: write-skill
title: "Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine"
description: >
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
tags: [meta-skill, skill-authoring, decision-engine, prompt-engineering, verification-pipeline]
dependencies: ["js-yaml", "@types/node"]
priority: 1
thermodynamicFootprint: low
requiresHumanReview: false
---

# Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine

## Description & Mission
The `write-skill` meta-skill is the core cognitive blueprint of the Agent Engine. It empowers an autonomous system to reflectively generate new specialized capabilities, audit existing skill logic, and determine optimal routing paths when dispatched on complex tasks. It enforces strict separation of concerns, defensive parameter schemas, verifiable examples, and machine-digestible ingestion summaries.

## Epistemic Hierarchy (Core Principles)
1. **Evidence > Similarity:** Ground logic and parameters in explicit requirements, not statistical plausibility.
2. **Truth > Fluency:** Prioritize deterministic schemas and strict verifiability over smooth-sounding prose.
3. **Verification > Confidence:** Mandatory validation check prior to emitting newly generated skills or answers.
4. **Adaptive Effort > Maximum Effort:** Penalize token padding. Calibrate execution depth to the real scope of the task.
5. **Workflow > Raw Token Prediction:** Multi-step pipelines must explicitly separate extraction, verification, and output generation.

## Information Flow Pipeline
When authoring, auditing, or executing skills, follow this discrete state progression:
```text
Input 
  ↓
Fact & Requirement Extraction
  ↓
Importance Ranking
  ↓
Workflow Selection (Existing vs. New Skill)
  ↓
Reasoning & Dependency Mapping
  ↓
Verification (Schema & Constraint Check)
  ↓
Generation (SKILL.md / Code)
  ↓
Self-Critique (Error Budget Audit)
  ↓
Final Output / Ingestion Registration
```

## Confidence-Gated Routing Engine
Route skill generation and task dispatch through three explicit confidence thresholds:   
1. High Confidence (> 0.85 match): Direct deterministic execution or immediate dispatch to an existing registry skill.   
2. Medium Confidence (0.50 - 0.85 match): Enforce internal schema verification, cross-consistency checks, and similarity comparison before proceeding.   
3. Low Confidence (< 0.50 match): Halt generation. Trigger external retrieval (docs/code) or issue a single clarifying prompt.

## Error Budgeting & Objective Function
Evaluate all newly authored skills against the calibrated reward objective:

## Reward=Accuracy+Evidence+Consistency+User Value-Unnecessary Work 

## Every authored skill must explicitly protect against the 5 Failure Modes:

1. Wrong facts / Hallucinations: Fabricated parameters, endpoints, or dependencies.
2. Missing facts: Omitting crucial runtime constraints, prerequisites, or typing bounds.
3. Incorrect sequence: Emitting execution steps in non-deterministic or illogical order.
4. Weak sources: Relying on ungrounded assumptions rather than official APIs or concrete examples.
5. Unsupported conclusions: Generating output formats that violate the defined schema.

## Preconditions & Skill Selection Guidance
a. When to Use
- When the user tasks the agent with a novel capability not covered by existing registry skills.   
- When an existing skill exhibits drift, hallucinations, outdated schemas, or missing constraints.   
- When determining "Which skill is best for this job?" through automated capability matrix matching.   
- When transforming raw workflow notes or API specifications into production-grade SKILL.md documentation.   

b. When NOT to Use
- For trivial, single-step tasks that do not require reusable procedural memory or multi-turn rules.   
- When an exact, high-confidence skill already exists in the registry.   

## Skill Ingestion Contract

| Parameter | Type | Required | Description |
|---|---|---|---|
| `skillName` | string | true | Kebab-case machine identifier (e.g., `data-pipeline-cleaner`). |
| `title` | string | true | Clear, descriptive human-readable title. |
| `mission` | string | true | Concise statement of the skill's purpose and operational boundaries. |
| `targetCapabilities` | array | true | Specific tools, APIs, or reasoning patterns encapsulated. |
| `parametersList` | array | true | Explicit inputs with types, default values, and required constraints. |
| `examplesList` | array | true | High-fidelity multi-turn prompt/action/expected-outcome walkthroughs. |
| `verificationGates` | array | false | Explicit check assertions executed before returning results. |
| `codeScaffolding` | object | false | Optional map of helper functions, scripts, or test harnesses. |
| `referencesList` | array | false | External documentation, API specs, and foundational research citations. |

## Operational Rules & Ingestion Pipeline Constraints
1. **Zero-Pill Discipline & Anti-Slop:** Every section must serve a verifiable function. Eliminate narrative fluff and redundant commentary.
2. **Schema Invariance:** Every parameter must include explicit type boundaries and regex patterns where applicable.
3. **Determinism in Selection:** Before generating a new skill, compare similarity against the active registry. If cosine or semantic overlap exceeds 0.85, propose an upgrade or alias rather than a duplicate.
4. **Summary JSON Synthesis:** Every authored skill must generate a strict JSON payload conforming to the Ingestion Pipeline Contract.

## In-Context Examples & Multi-Turn Walkthroughs

### Example 1: Authoring a Cloud Storage Sync Skill
- **Prompt:** "Create a skill for managing S3 and Google Cloud Storage bucket backups with checksum verification."
- **Scenario Context:** Developer needs automated multi-cloud archival.
- **Expected Outcome:** Generates a valid SKILL.md with YAML frontmatter, parameters for `sourceBucket`, `targetBucket`, `verifyChecksum`, and scaffolding for MD5 comparisons.

### Example 2: Determining Best Skill for a Machine Learning Task
- **Prompt:** "The user wants to optimize low-power inference on edge neuromorphic hardware."
- **Scenario Context:** Agent queries registry for neuromorphic and low-power.
- **Expected Outcome:** Evaluates `write-skill` vs `neuromorphic-energy-optimizer`. Returns `neuromorphic-energy-optimizer` with confidence 98% and provides rationale based on Landauer limits and SNN event-driven timing.

## Scaffolded Code & Reference Implementations

### `validator.ts`
Runtime schema validation harness for newly authored skills, incorporating pipeline checks:

```typescript
export interface ValidationResult {
  valid: boolean;
  issues: string[];
  warnings: string[];
}

export function validateSkillStructure(manifest: Record<string, any>): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Machine Identifier Check
  if (!manifest.name || !/^[a-z0-9-_]+$/.test(manifest.name)) {
    issues.push('Skill name must be valid kebab-case.');
  }

  // Description / Mission Density Check
  if (!manifest.description || manifest.description.length < 30) {
    issues.push('Description must be detailed and at least 30 characters.');
  }

  // Schema Invariance Check
  if (!Array.isArray(manifest.parameters) || manifest.parameters.length === 0) {
    issues.push('Skills must declare explicit parameters with typed constraints.');
  } else {
    manifest.parameters.forEach((param: any, idx: number) => {
      if (!param.name || !param.type) {
        issues.push(`Parameter at index ${idx} is missing required 'name' or 'type'.`);
      }
    });
  }

  // Verification Gate Check (Evidence-First Architecture)
  if (!Array.isArray(manifest.verificationGates) || manifest.verificationGates.length === 0) {
    warnings.push('Skill lacks declared verification gates. Adding runtime verification checks is strongly recommended.');
  }

  return { 
    valid: issues.length === 0, 
    issues, 
    warnings 
  };
}
```

---

### Companion Files to Keep Aligned
1. **`manifest.json`:** Bump `"version"` to `"1.3.0"` and ensure `summaryJson` mentions the verification gates and error-budgeting parameters[cite: 6].
2. **`seedWriteSkill.ts` (in `scripts/`):** Update the seed string or loader so your Firestore sync script pushes version 1.3.0 to your vector database with the new routing metadata.