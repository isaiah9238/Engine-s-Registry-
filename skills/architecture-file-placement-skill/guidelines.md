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
├── hooks/                # Reusable client hooks (SWR / TanStack Query wrappers, local storage bindings)
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
| **Query & Fetch Hooks** | `src/hooks/` | `use[Feature][Action].ts` (e.g., `useSkillQuery.ts`) | Adhere to SWR/Query patterns; avoid redundant imperative