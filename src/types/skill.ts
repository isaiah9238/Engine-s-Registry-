/**
 * Core type definitions for the Agent Engine Skill Registry & Ingestion Pipeline
 * Aligned with the Studio Alchemist AI Agent Skill and Workflow Registry
 */

export type SkillStatus = 'draft' | 'verified' | 'published' | 'archived';

export type StudioAlchemistCategory =
  | 'security-audit'
  | 'orchestration'
  | 'workflow-automation'
  | 'math-geometry'
  | 'system-tool'
  | 'meta-engineering';

export type SecurityClearance = 'public' | 'internal' | 'admin-only';

export type SkillRuntime = 'mcp' | 'in_process' | 'cloud_function';

export interface StudioAlchemistSkillEntry {
  // --- Core Identification ---
  id: string;                     // e.g., "auth-vault-eval"
  name: string;                   // "auth_vault_eval"
  title: string;                  // "Cryptographic Vault Evaluator"
  description: string;            // Concise summary for vector/semantic matching
  category: StudioAlchemistCategory | string; // Aligned with notebook domains

  // --- Operational State & ABAC ---
  status: SkillStatus;
  isPublic: boolean;
  authorId: string;
  securityClearance?: SecurityClearance;

  // --- Knowledge & Procedural Layer ---
  // Mirrors curated guides, protocol rules, and agent definitions
  skillMarkdown: string;
  sourceReferences?: string[];    // Links back to notebook sources or doc keys

  // --- Runtime Tool Execution (For active engine invocations) ---
  isExecutable: boolean;
  runtime?: SkillRuntime;
  parameters?: Record<string, any>; // JSON Schema for tool calling
  returns?: Record<string, any>;

  // --- Audit Telemetry ---
  createdAt: string;
  updatedAt: string;
}

export interface SkillParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: string | number | boolean;
  enum?: string[];
  example?: string;
}

export interface SkillReference {
  title: string;
  url?: string;
  type: 'spec' | 'paper' | 'doc' | 'code' | 'historical' | 'notebook';
  description: string;
}

export interface SkillCodeFile {
  filename: string;
  language: string;
  description: string;
  content: string;
}

export interface SkillExample {
  title: string;
  prompt: string;
  scenario: string;
  invocations: string;
  expectedOutcome: string;
}

export interface IngestionSummaryJson {
  schemaVersion: string;
  skillId: string;
  name: string;
  title: string;
  description: string;
  category: string;
  version: string;
  runtime?: SkillRuntime;
  isExecutable?: boolean;
  securityClearance?: SecurityClearance;
  triggerPreconditions: string[];
  routingKeywords: string[];
  parametersSchema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
  returnsSchema?: Record<string, any>;
  dependencies: {
    npm?: string[];
    python?: string[];
    systemTools?: string[];
    oauthScopes?: string[];
  };
  evaluationRubric: {
    priority: number;
    thermodynamicFootprint: 'low' | 'moderate' | 'high';
    requiresHumanReview: boolean;
    verificationLevel: 'strict' | 'relaxed';
  };
  bestSuitedFor: string[];
  unsuitedFor: string[];
}

export interface SkillRecord {
  // Core identification
  id: string;
  name: string;
  title: string;
  description: string;
  category: StudioAlchemistCategory | string;
  version: string;

  // Operational State & ABAC
  authorId: string;
  authorEmail: string;
  status: SkillStatus;
  isPublic: boolean;
  securityClearance?: SecurityClearance;

  // Knowledge & Procedural Layer
  skillMarkdown: string;
  summaryJson: string; // JSON string of IngestionSummaryJson
  parameters: string;  // JSON string of SkillParameter[] or Record<string, any>
  returns?: string;     // JSON string of Return Schema
  examples: string;    // JSON string of SkillExample[]
  references: string;  // JSON string of SkillReference[]
  dependencies: string;// JSON string of string[]
  codeFiles: string;   // JSON string of Record<string, SkillCodeFile>
  sourceReferences?: string[]; // Links back to notebook sources

  // Runtime Tool Execution & Vector Index
  isExecutable: boolean;
  runtime?: SkillRuntime;
  embedding?: number[];              // Vector(768) enables dynamic semantic tool selection
  parametersSchema?: Record<string, any>; // Tool call signatures (Map)
  returnsSchema?: Record<string, any>;    // Tool return signatures (Map)
  bundleStoragePath?: string;        // Points to GCS bucket: /skills/{skillId}/
  bundleFiles?: {
    guidelinesMd?: string;           // Cloud Storage guidelines.md
    runtimeScript?: string;          // runtime.wasm or script.js
    runtimeFilename?: 'script.js' | 'runtime.wasm' | string;
  };

  // Audit Telemetry
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionTrace {
  executionId: string;
  agentId: string;
  callerClearance?: SecurityClearance;
  runtime: SkillRuntime;
  inputParams: Record<string, any>;
  status: 'success' | 'error' | 'timeout';
  latencyMs: number;
  errorMessage?: string;
  timestamp: string;
}

export interface CachedSkillRecord {
  skillId: string;
  name: string;
  version: string;
  runtime: 'mcp' | 'in_process' | 'cloud_function';
  securityClearance: 'public' | 'internal' | 'admin-only';
  parametersSchema: Record<string, any>;
  guidelinesMd: string;
  bundleSha256?: string;
  binaryBlob?: ArrayBuffer; // Locally cached WASM/JS executable
  lastSyncedAt: number;     // Epoch timestamp for TTL eviction
}

export interface SkillMatchResult {
  skillId: string;
  skillName: string;
  skillTitle: string;
  score: number; // 0 to 100
  confidence: 'High' | 'Medium' | 'Low';
  reasons: string[];
  fitAssessment: string;
  suggestedParameters?: Record<string, string>;
  runtime?: SkillRuntime;
  securityClearance?: SecurityClearance;
}
