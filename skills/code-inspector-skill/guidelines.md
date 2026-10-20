---
name: code-inspector
title: "Autonomous Code Inspector, Author & Project Finalizer"
description: >
  Inspects existing project files, imports, and interface contracts prior to creating new files.
  Generates production-grade implementations aligned with architectural conventions and executes
  finalization checks across the build and type system.
version: 1.0.0
category: development
securityClearance: local_fs
isExecutable: true
runtime: in_process
tags: [code-inspection, automated-authoring, import-resolution, typescript, static-analysis]
priority: 1
thermodynamicFootprint: low
requiresHumanReview: false
---

# Autonomous Code Inspector, Author & Project Finalizer

## Description & Mission
The `code-inspector` skill acts as a gatekeeper and autonomous generator for code modification and expansion. When a new file or dependency is required, it proactively analyzes the surrounding codebase, validates import paths and exported types, constructs the new file according to established repository conventions, and performs final verification to guarantee zero breaking changes.

## 3-Phase Execution Pipeline

[Phase 1: Pre-Creation Inspection]
├── Audit target destination (enforcing architecture-file-placement)
├── Inspect incoming/outgoing module imports and circular dependency risks
└── Verify existing TypeScript contracts, schemas, and shared utilities
│
▼
[Phase 2: Autonomous File Generation]
├── Author strict, strongly-typed code (zero implicit any, pure functions where applicable)
├── Apply unified module alias conventions (@/ mapping to src/)
└── Document internal interfaces and boundary expectations
│
▼
[Phase 3: Integration Finalization]
├── Update central barrel exports (index.ts) if applicable
├── Run incremental TypeScript compilation check (tsc --noEmit)
└── Validate bundler module resolution

## Concrete Operational Rules

1. **Pre-Flight Inspection Checklist**:
   - Inspect existing types in `src/types/` before declaring duplicate interfaces.
   - Scan target directories to ensure the new file matches the established naming pattern (`kebab-case` for utils/scripts, `PascalCase` for React components).
   - Verify that Node-only native dependencies (`fs`, `path`, `better-sqlite3`, `firebase-admin`) are never introduced into client-side bundles.

2. **Code Authoring Standards**:
   - Always declare explicit return types on exported functions.
   - Prefer named exports over default exports for enhanced refactoring visibility.
   - Leverage configured workspace aliases (`@/...`) rather than deep relative parent traversal (`../../..`).

3. **Finalization Safeguards**:
   - Do not overwrite existing files without explicit delta diff confirmation.
   - Ensure new files are registered in any active subcollection or local service registries.

## Integration Invariants

- **Contract Parity**: Every created service or utility must provide exact typing matching its dependent consumer.
- **Fail-Fast Integrity**: If missing dependencies or peer version mismatches are detected during pre-inspection, halt generation and surface the resolution requirement immediately.