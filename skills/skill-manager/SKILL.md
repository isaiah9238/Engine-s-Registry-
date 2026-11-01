---
name: skill-manager
title: SkillManager
version: 1.0.0
category: meta-engineering
securityClearance: internal
isExecutable: true
runtime: in_process
sourceReferences:
  - "https://agent-engine.ai.studio/docs/skill-manager"
  - "notebook://studio-alchemist/skill-lifecycle-orchestrator.ipynb"
description: |
  Core orchestration and lifecycle controller for the Agent Engine. Dynamically registers SKILL.md manifests into the Cloud Firestore Primary DB, queries the active capability catalog, and computes dependency graphs and runtime usage telemetry insights.
dependencies: ["firebase-admin", "@google/genai", "js-yaml"]
priority: 1
thermodynamicFootprint: low
---

# SkillManager

## Description & Mission
The **SkillManager** is the central management and meta-orchestration capability of the Agent Engine. It empowers autonomous agents and developers to programmatically register new capability manifests (taking a standard `SKILL.md` markdown file as input), discover registered skills across domains, and inspect deep telemetry insights—such as execution frequency, average latency, failure rates, and required dependencies.

---

## When to Use
- When an agent authors or retrieves a new `SKILL.md` file and needs to dynamically register it into the primary Cloud Firestore DB.
- When an orchestration agent needs to query available skills filtered by category, runtime target, or security clearance.
- When evaluating system health, dependency trees, or performance bottlenecks across registered agent skills.

## When NOT to Use
- Do NOT use for basic unit-level task execution; delegate directly to the target operational skill instead.
- Do NOT use to bypass security clearance boundaries; all registrations and queries enforce Attribute-Based Access Control (ABAC).

---

## Functional Interfaces & Parameters

### Function 1: `register_skill`
Registers and persists a new skill specification into the primary Cloud Firestore registry, automatically synthesizing the Ingestion Summary JSON and computing a 768-dimensional semantic vector embedding.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `skillMarkdown` | `string` | true | The full content of the `SKILL.md` file, including YAML frontmatter and operational rules. |
| `authorEmail` | `string` | false | The email address of the registering developer or agent (defaults to caller UID). |
| `isPublic` | `boolean` | false | Whether the skill should be discoverable across public agent teams (default: true). |

### Function 2: `list_skills`
Queries the active registry and returns summaries of available skills with their identifiers, titles, categories, and execution bindings.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `category` | `string` | false | Optional category filter (e.g., `orchestration`, `security-audit`, `scientific-synthesis`). |
| `status` | `string` | false | Filter by readiness status (`verified`, `published`, `draft`). |
| `runtime` | `string` | false | Filter by execution target (`in_process`, `mcp`, `cloud_function`). |
| `clearance` | `string` | false | Maximum clearance level allowed (`public`, `internal`, `admin-only`). |

### Function 3: `get_skill_insights`
Provides actionable intelligence on skill usage, operational reliability, thermodynamic footprint, and dependency graphs.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `skillId` | `string` | false | Unique identifier of a specific skill. If omitted, returns global registry-wide statistics. |
| `includeTelemetry` | `boolean` | false | Whether to fetch execution trace latency histograms and error distributions (default: true). |

---

## Example Usage Scenarios

### Scenario 1: Autonomous Ingestion of a New SKILL.md
**User / Agent Request**:
> "I have generated a new skill for automated SQL query sanitization in `sanitize-sql.SKILL.md`. Register it into the Agent Engine."

**Invocation**:
```json
{
  "function": "register_skill",
  "arguments": {
    "skillMarkdown": "---\nname: sanitize-sql\ntitle: SQL Query Sanitizer\nversion: 1.0.0\ncategory: security-audit\nsecurityClearance: internal\nisExecutable: true\nruntime: in_process\ndescription: Zero-trust AST-level SQL query validator and injection scanner.\n---\n\n# SQL Query Sanitizer\n\n## Description & Mission\nParses incoming raw SQL strings and validates AST nodes against SQL injection attack vectors.",
    "isPublic": true
  }
}
```

**Expected Return**:
```json
{
  "status": "success",
  "skillId": "sanitize-sql",
  "registeredAt": "2026-10-29T09:15:00.000Z",
  "embedded": true,
  "vectorDimensions": 768,
  "primaryRegistry": "Cloud Firestore DB"
}
```

---

### Scenario 2: Dynamic Skill Discovery by Orchestrator
**User / Agent Request**:
> "List all verified in-process skills related to workflow orchestration."

**Invocation**:
```json
{
  "function": "list_skills",
  "arguments": {
    "category": "orchestration",
    "status": "verified",
    "runtime": "in_process"
  }
}
```

**Expected Return**:
```json
{
  "totalMatches": 2,
  "skills": [
    {
      "id": "skill-manager",
      "name": "skill-manager",
      "title": "SkillManager",
      "category": "orchestration",
      "version": "1.0.0",
      "isExecutable": true
    },
    {
      "id": "write-skill",
      "name": "write-skill",
      "title": "write-skill Meta-Skill",
      "category": "orchestration",
      "version": "1.0.0",
      "isExecutable": true
    }
  ]
}
```

---

### Scenario 3: Telemetry & Dependency Health Audit
**User / Agent Request**:
> "Show me insights, dependency bottlenecks, and execution statistics for the skill registry."

**Invocation**:
```json
{
  "function": "get_skill_insights",
  "arguments": {
    "includeTelemetry": true
  }
}
```

**Expected Return**:
```json
{
  "totalSkills": 7,
  "categoryBreakdown": {
    "meta-engineering": 2,
    "security-audit": 1,
    "orchestration": 2,
    "scientific-synthesis": 2
  },
  "runtimeDistribution": {
    "in_process": 5,
    "mcp": 2
  },
  "dependencyGraph": {
    "topPackages": ["@google/genai", "firebase-admin", "lucide-react", "js-yaml"],
    "unmetDependencies": []
  },
  "telemetry": {
    "totalInvocations": 1420,
    "averageLatencyMs": 84.6,
    "overallSuccessRate": 0.992,
    "highLoadSkills": ["write-skill", "skill-manager"]
  }
}
```
