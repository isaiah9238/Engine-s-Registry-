# IngestionDocumentPayload: write-skill

```json
{
  "id": "write-skill",
  "name": "write-skill",
  "title": "Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine",
  "description": "Enables autonomous agents to design, author, audit, validate, and register new SKILL.md files. Evaluates existing skill logic to improve output quality, prevent redundancy, and systematically determine which skill in the registry is best for a given job.",
  "category": "orchestration",
  "version": "1.2.0",
  "status": "published",
  "isPublic": true,
  "authorId": "system-architect",
  "authorEmail": "isaiahmsmith@aihomev2.com",
  "securityClearance": "public",
  "isExecutable": true,
  "runtime": "in_process",
  "sourceReferences": [
    "notebook://studio-alchemist/meta-authoring.ipynb",
    "[https://agent-engine.internal/specs/skill-v1](https://agent-engine.internal/specs/skill-v1)"
  ],
  "parametersSchema": {
    "type": "object",
    "properties": {
      "skillName": {
        "type": "string",
        "description": "Kebab-case machine identifier slug."
      },
      "title": {
        "type": "string",
        "description": "Human-readable title."
      },
      "mission": {
        "type": "string",
        "description": "Concise statement of operational boundaries."
      },
      "targetCapabilities": {
        "type": "array",
        "description": "Specific tools, APIs, or reasoning patterns the skill encapsulates."
      },
      "parametersList": {
        "type": "array",
        "description": "Explicit inputs with types and constraints."
      },
      "examplesList": {
        "type": "array",
        "description": "Multi-turn walkthrough examples."
      }
    },
    "required": [
      "skillName",
      "title",
      "mission",
      "targetCapabilities",
      "parametersList",
      "examplesList"
    ]
  },
  "bundleStoragePath": "gs://gen-lang-client-0573899362.firebasestorage.app/skills/write-skill/",
  "bundleFiles": {
    "guidelinesMd": "gs://gen-lang-client-0573899362.firebasestorage.app/skills/write-skill/guidelines.md",
    "runtimeScript": "gs://gen-lang-client-0573899362.firebasestorage.app/skills/write-skill/script.js",
    "runtimeFilename": "script.js"
  },
  "summaryJson": "{\"schemaVersion\":\"2026.1\",\"skillId\":\"write-skill\",\"name\":\"write-skill\",\"title\":\"Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine\",\"description\":\"Enables autonomous agents to design, author, audit, validate, and register new SKILL.md files. Evaluates existing skill logic to improve output quality, prevent redundancy, and systematically determine which skill in the registry is best for a given job.\",\"category\":\"orchestration\",\"version\":\"1.2.0\",\"runtime\":\"in_process\",\"isExecutable\":true,\"securityClearance\":\"public\",\"triggerPreconditions\":[\"User requests creation of new agent skill\",\"Agent requires procedural self-improvement\",\"Determining which skill is best for a job\",\"Auditing or upgrading existing SKILL.md documents\"],\"routingKeywords\":[\"meta-skill\",\"author-skill\",\"write-skill\",\"evaluate-skill\",\"best-skill\",\"registry\",\"ingestion\"],\"parametersSchema\":{\"type\":\"object\",\"properties\":{\"skillName\":{\"type\":\"string\",\"description\":\"Kebab-case machine identifier slug.\"},\"title\":{\"type\":\"string\",\"description\":\"Human-readable title.\"},\"mission\":{\"type\":\"string\",\"description\":\"Concise statement of operational boundaries.\"},\"targetCapabilities\":{\"type\":\"array\",\"description\":\"Specific tools, APIs, or reasoning patterns encapsulated.\"},\"parametersList\":{\"type\":\"array\",\"description\":\"Explicit inputs with types and constraints.\"},\"examplesList\":{\"type\":\"array\",\"description\":\"Multi-turn walkthrough examples.\"}},\"required\":[\"skillName\",\"title\",\"mission\",\"targetCapabilities\",\"parametersList\",\"examplesList\"]},\"dependencies\":{\"npm\":[\"js-yaml\",\"@types/node\"],\"oauthScopes\":[\"[https://www.googleapis.com/auth/drive.file](https://www.googleapis.com/auth/drive.file)\"]},\"evaluationRubric\":{\"priority\":1,\"thermodynamicFootprint\":\"low\",\"requiresHumanReview\":false,\"verificationLevel\":\"strict\"},\"bestSuitedFor\":[\"Bootstrapping new agent engine skills\",\"Routing incoming prompts to optimal skills\",\"Auditing prompt drift in legacy skills\"],\"unsuitedFor\":[\"Simple one-off questions without procedural workflow requirements\"]}",
  "parameters": "[{\"name\":\"skillName\",\"type\":\"string\",\"required\":true,\"description\":\"Kebab-case machine identifier (e.g., data-pipeline-cleaner).\"},{\"name\":\"title\",\"type\":\"string\",\"required\":true,\"description\":\"Clear, descriptive human-readable title.\"},{\"name\":\"mission\",\"type\":\"string\",\"required\":true,\"description\":\"Concise statement of the skill's purpose and operational boundaries.\"},{\"name\":\"targetCapabilities\",\"type\":\"array\",\"required\":true,\"description\":\"Specific tools, APIs, or reasoning patterns the skill encapsulates.\"},{\"name\":\"parametersList\",\"type\":\"array\",\"required\":true,\"description\":\"Explicit inputs with types, default values, and required constraints.\"},{\"name\":\"examplesList\",\"type\":\"array\",\"required\":true,\"description\":\"High-fidelity multi-turn prompt/action/expected-outcome walkthroughs.\"},{\"name\":\"codeScaffolding\",\"type\":\"object\",\"required\":false,\"description\":\"Optional map of helper functions, scripts, or test harnesses.\"},{\"name\":\"referencesList\",\"type\":\"array\",\"required\":false,\"description\":\"External documentation, API specs, and foundational research citations.\"}]",
  "examples": "[{\"title\":\"Authoring a Cloud Storage Sync Skill\",\"prompt\":\"Create a skill for managing S3 and Google Cloud Storage bucket backups with checksum verification.\",\"scenario\":\"Developer needs automated multi-cloud archival.\",\"invocations\":\"write_skill({ skillName: 'cloud-storage-sync', title: 'Cloud Storage Sync & Backup', ... })\",\"expectedOutcome\":\"Generates a valid SKILL.md with YAML frontmatter, parameters for sourceBucket, targetBucket, verifyChecksum, and scaffolding for MD5 comparisons.\"},{\"title\":\"Determining Best Skill for a Machine Learning Task\",\"prompt\":\"The user wants to optimize low-power inference on edge neuromorphic hardware.\",\"scenario\":\"Agent queries registry for neuromorphic and low-power.\",\"invocations\":\"write_skill_evaluate({ query: 'optimize low-power edge neuromorphic inference' })\",\"expectedOutcome\":\"Evaluates write-skill vs neuromorphic-energy-optimizer. Returns neuromorphic-energy-optimizer with confidence 98% and provides rationale based on Landauer limits and SNN event-driven timing.\"}]",
  "references": "[{\"title\":\"Agent Skills Architecture Specification\",\"type\":\"spec\",\"description\":\"Official standard for agent skill registry.\"},{\"title\":\"Prompt Engineering & Metacognitive Reasoning\",\"type\":\"paper\",\"description\":\"Chain-of-thought and structured tool registration patterns.\"}]",
  "dependencies": "[\"js-yaml\", \"@types/node\"]",
  "codeFiles": "{\"validator.ts\":{\"filename\":\"validator.ts\",\"language\":\"typescript\",\"description\":\"Runtime schema validation harness for newly authored skills.\",\"content\":\"export function validateSkillStructure(manifest: Record<string, any>): { valid: boolean; issues: string[] } {\\n  const issues: string[] = [];\\n  if (!manifest.name || !/^[a-z0-9-_]+$/.test(manifest.name)) {\\n    issues.push('Skill name must be valid kebab-case.');\\n  }\\n  if (!manifest.description || manifest.description.length < 30) {\\n    issues.push('Description must be detailed and at least 30 characters.');\\n  }\\n  if (!Array.isArray(manifest.parameters) || manifest.parameters.length === 0) {\\n    issues.push('Skills must declare explicit parameters.');\\n  }\\n  return { valid: issues.length === 0, issues };\\n}\"}}",
  "createdAt": "2026-10-04T21:30:00.000Z",
  "updatedAt": "2026-10-04T21:30:00.000Z"
}
```
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
  - "[https://agent-engine.internal/specs/skill-v1](https://agent-engine.internal/specs/skill-v1)"
tags: [meta-skill, skill-authoring, decision-engine, prompt-engineering, ingestion-pipeline]
dependencies: ["js-yaml", "@types/node"]
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
- **Prompt:** "Create a skill for managing S3 and Google Cloud Storage bucket backups with checksum verification."
- **Scenario Context:** Developer needs automated multi-cloud archival.
- **Expected Outcome:** Generates a valid SKILL.md with YAML frontmatter, parameters for `sourceBucket`, `targetBucket`, `verifyChecksum`, and scaffolding for MD5 comparisons.

### Example 2: Determining Best Skill for a Machine Learning Task
- **Prompt:** "The user wants to optimize low-power inference on edge neuromorphic hardware."
- **Scenario Context:** Agent queries registry for neuromorphic and low-power.
- **Expected Outcome:** Evaluates `write-skill` vs `neuromorphic-energy-optimizer`. Returns `neuromorphic-energy-optimizer` with confidence 98% and provides rationale based on Landauer limits and SNN event-driven timing.

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

---

## 3. GCS Storage Bundle: `script.js` (In-Process Executable)

```javascript
/**
 * In-process runtime handler for write-skill
 * Performs structural validation and synthesizes skill manifests.
 */
export async function execute(params) {
  const { skillName, title, mission, targetCapabilities, parametersList, examplesList } = params;

  const errors = [];
  if (!skillName || !/^[a-z0-9-_]+$/.test(skillName)) {
    errors.push('skillName must be valid kebab-case string.');
  }
  if (!title || typeof title !== 'string') {
    errors.push('title is required.');
  }
  if (!mission || typeof mission !== 'string') {
    errors.push('mission is required.');
  }
  if (!Array.isArray(targetCapabilities) || targetCapabilities.length === 0) {
    errors.push('targetCapabilities must be a non-empty array.');
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
    message: `Skill ${skillName} validated and ready for ingestion pipeline.`
  };
}

Title: Skill Architect: Autonomous Meta-Skill Authoring & Decision Engine
Description: Enables autonomous agents to design, author, audit, validate, and register new SKILL.md files. Evaluates existing skill logic to improve output quality, prevent redundancy, and systematically determine which skill in the registry is best for a given job.
Category: orchestration
Preconditions: User requests creation of new agent skill; Agent requires procedural self-improvement; Determining which skill is best for a job; Auditing or upgrading existing SKILL.md documents
Routing Keywords: meta-skill, author-skill, write-skill, evaluate-skill, best-skill, registry, ingestion
Best Suited For: Bootstrapping new agent engine skills; Routing incoming prompts to optimal skills; Auditing prompt drift in legacy skills