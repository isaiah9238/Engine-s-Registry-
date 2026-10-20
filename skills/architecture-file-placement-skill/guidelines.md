---
name: architecture-file-placement
title: "Repository Architecture & File Placement Specialist"
description: >
  Enforces deterministic, scalable folder structure and file placement conventions across modern
  TypeScript, React, Next.js, and modular Firebase architectures. Audits project trees, prevents
  architectural drift, and assigns precise file paths based on responsibility, lifecycle, and runtime boundaries.
version: 1.0.0
category: architecture
securityClearance: public
isExecutable: true
runtime: in_process
tags: [project-structure, file-placement, clean-architecture, typescript, react, firebase]
priority: 1
thermodynamicFootprint: low
requiresHumanReview: false
---

# Repository Architecture & File Placement Specialist

## Description & Mission
The `architecture-file-placement` skill provides a deterministic framework for structuring multi-file codebases and assigning file locations. It eliminates architectural ambiguity, prevents cross-boundary leakage (e.g., mixing client, server, and administrative tooling), and enforces predictable imports across large-scale frontend, backend, and full-stack projects.

## Architectural Placement Taxonomy

Files must be mapped strictly according to functional responsibility, operational environment, and dependency hierarchy:

src/
├── app/ | pages/         # Routing entry points (App Router page/layout boundaries or classic pages)
├── components/           # Reusable UI presentation units
│   ├── common/           # Pure, shared UI primitives (buttons, modals, tooltips)
│   └── [feature]/        # Domain-specific composite views and controls
├── hooks/                # Reusable client hooks (SWR / React Query wrappers, storage bindings)
├── services/             # External integration layers, API clients, and database repositories
├── types/                # Domain models, strict TypeScript interfaces, and enum contracts
├── data/                 # Static presets, constants, and deterministic seed manifests
├── utils/                # Pure mathematical, formatting, or parsing helper functions (side-effect free)
└── scripts/              # Autonomous ingestion, migration, and CLI utility scripts

## Concrete Placement Matrix

| File Type / Archetype | Target Directory | File Naming Convention | Rules & Constraints |
| :--- | :--- | :--- | :--- |
| **Domain Models & Contracts** | `src/types/` | `[entity].ts` (e.g., `skill.ts`, `agentMemory.ts`) | Strict type definitions only. Zero executable runtime code or state. Avoid `any`. |
| **Presentational Components** | `src/components/` | `[PascalCase].tsx` (e.g., `SkillCard.tsx`) | Pure React functional arrow components. Keep internal state transient. |
| **Database Repositories** | `src/services/` | `[domain]Repository.ts` | Abstract raw Firestore/Database operations behind typed async methods. |
| **External API / SDK Adapters** | `src/services/` | `[provider]Service.ts` or `[provider].ts` | Enforce singleton patterns for clients (Firebase Modular v10+, Google Gen AI). |
| **Local Cache & Storage** | `src/services/` | `[domain]Cache.ts` | Local-first synchronous/indexed caching logic isolated from UI. |
| **Query & Fetch Hooks** | `src/hooks/` | `use[Feature][Action].ts` (e.g., `useSkillQuery.ts`) | Adhere to SWR/Query patterns; avoid redundant imperative fetching. |
| **Utility Functions** | `src/utils/` | `[feature]Utils.ts` (e.g., `vectorMath.ts`) | Pure functions only. Zero side-effects or external network calls. |
| **Ingestion & CLI Scripts** | `scripts/` | `[action][Domain].ts` (e.g., `seedMemories.ts`) | Runnable via `tsx` or `node`. Direct execution scripts outside client bundles. |

## Boundary Separation Invariants

1. **Client vs. Server Boundary:** 
   - Files containing Node-only packages (`firebase-admin`, `better-sqlite3`, `fs`, `path`) must reside in root server controllers or `scripts/`.
   - Never import from `firebase-admin` inside `src/services/` or `src/components/`.

2. **Secrets & Credentials Boundary:**
   - Secret JSON files (`serviceAccountKey.json`, `client_secret.json`, `.dev.env.json`) reside in the project root, never inside `src/`.
   - All secret files must be explicitly declared in `.gitignore`.

3. **Absolute vs. Relative Aliases:**
   - Use the `@/` path alias mapped to `src/` for cross-feature imports.
   - Use relative imports (`./` or `../`) only within the same localized directory subtree.

## Execution Checklist

- [ ] Inspect source file dependencies for backend/native node imports before placing into `src/`.
- [ ] Confirm entity types reside in `src/types/` without runtime logic.
- [ ] Route all direct Firestore or Gemini API calls through dedicated abstraction classes in `src/services/`.
- [ ] Verify that no service account keys or private credentials exist inside the `src/` tree.