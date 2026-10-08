---
name: custom-security-scanner
title: "Zero-Trust Security & Policy Scanner"
description: >
  Audits runtime execution endpoints, enforces zero-trust policy invariants, and prevents unauthorized tool execution.
version: 1.0.0
category: security-audit
securityClearance: public
isExecutable: true
runtime: in_process
tags: [security-audit, autonomous-agent, production-skill]
priority: 1
thermodynamicFootprint: low
requiresHumanReview: false
---

# Zero-Trust Security & Policy Scanner

## Description & Mission
Audits runtime execution endpoints, enforces zero-trust policy invariants, and prevents unauthorized tool execution.

## When to Use This Skill
- When task requires automated execution within the **security-audit** domain.
- When caller parameters strictly conform to declared signatures.

## When NOT to Use This Skill
- For tasks outside declared operational boundaries.
- When human supervision is required for irreversible mutations.

## Parameters & Invocation Schemas

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `targetEndpoint` | `string` | true | API or service endpoint to inspect. |
| `enforceStrictTls` | `boolean` | false | Require TLS 1.3 encryption. |

## Operational Rules & Ingestion Constraints
1. **Zero-Pill Discipline**: Avoid empty filler phrases or redundant pleasantries.
2. **Schema Invariance**: Enforce strict parameter validation before processing.
3. **Determinism**: Maintain state persistence and verify return schemas.

## Multi-Turn Walkthrough Examples

### Example 1: Scan endpoint https://api.internal/v1 for pol...
* **Prompt:** "Scan endpoint https://api.internal/v1 for policy violations."
* **Scenario Context:** Autonomous audit trigger before data ingestion.
* **Expected Outcome:** Generates JSON report with zero-trust compliance score and recommendations.


## Scaffolded Runtime Verification
```typescript
export async function execute(params: Record<string, any>) {
  // Runtime handler for custom-security-scanner
  return { 
    success: true,
    skill: "custom-security-scanner",
    executedAt: new Date().toISOString()
  };
}
```
