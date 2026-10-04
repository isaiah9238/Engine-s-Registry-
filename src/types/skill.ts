/**
 * Core type definitions for the Agent Engine Skill Registry & Ingestion Pipeline
 */

export type SkillStatus = 'draft' | 'verified' | 'published' | 'archived';

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
  type: 'spec' | 'paper' | 'doc' | 'code' | 'historical';
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
  id: string;
  name: string;
  title: string;
  description: string;
  category: string;
  version: string;
  authorId: string;
  authorEmail: string;
  skillMarkdown: string;
  summaryJson: string; // JSON string of IngestionSummaryJson
  parameters: string;  // JSON string of SkillParameter[]
  examples: string;    // JSON string of SkillExample[]
  references: string;  // JSON string of SkillReference[]
  dependencies: string;// JSON string of string[]
  codeFiles: string;   // JSON string of Record<string, SkillCodeFile>
  status: SkillStatus;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
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
}
