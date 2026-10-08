/**
 * Agent Memory & Cognitive Vector Store Types
 * Structure:
 * ├── agent_memories/ (Vector indexed)
 * │   └── {memoryId}
 * │       ├── agentId: string
 * │       ├── content: string
 * │       ├── embedding: Vector(768)
 * │       ├── category: "semantic" | "episodic" | "procedural"
 * │       └── updatedAt: Timestamp
 */

export type MemoryCategory = 'semantic' | 'episodic' | 'procedural';

export interface AgentMemoryRecord {
  id: string;
  agentId: string;
  content: string;
  embedding: number[]; // Vector(768)
  category: MemoryCategory;
  updatedAt: string;
  title?: string;
  tags?: string[];
  relevanceScore?: number; // Calculated dynamically during vector search
}

export interface MemoryVectorSearchResult {
  memory: AgentMemoryRecord;
  similarity: number; // Cosine similarity 0.0 - 1.0
  distance: number;   // Cosine distance (1 - similarity)
}

export interface ToolVectorSearchResult {
  skillId: string;
  skillName: string;
  skillTitle: string;
  description: string;
  similarity: number;
  parametersSchema?: Record<string, any>;
  bundleStoragePath?: string;
}
