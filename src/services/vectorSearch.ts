/**
 * Vector Search Engine & Dynamic Semantic Tool Selection
 * Generates and indexes 768-dimensional float vectors for:
 * 1. Skills dynamic tool selection (parametersSchema, description)
 * 2. Agent Memories (semantic, episodic, procedural recall)
 */

import type { SkillRecord } from '../types/skill';
import type { AgentMemoryRecord, MemoryVectorSearchResult, ToolVectorSearchResult, MemoryCategory } from '../types/agentMemory';

/**
 * Deterministic pseudo-semantic vector generator fallback
 * Generates an exact 768-dimensional normalized float vector if server API is unavailable
 */
export function generateDeterministicVector768(text: string): number[] {
  const dim = 768;
  const vector = new Float64Array(dim);
  const clean = text.toLowerCase().trim();

  // Multi-pass hash accumulator
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    const index1 = (code * 31 + i * 17) % dim;
    const index2 = (code * 127 + i * 43) % dim;
    const index3 = (code * 257 + i * 89) % dim;

    vector[index1] += Math.sin((code + i) * 0.1) * 1.5;
    vector[index2] += Math.cos((code - i) * 0.15) * 1.2;
    vector[index3] += Math.sin((code * i) * 0.05) * 0.8;
  }

  // Token level n-grams
  const words = clean.split(/\s+/);
  words.forEach((w, wIdx) => {
    let wordHash = 0;
    for (let c = 0; c < w.length; c++) {
      wordHash = (wordHash << 5) - wordHash + w.charCodeAt(c);
      wordHash |= 0;
    }
    const slot = Math.abs(wordHash) % dim;
    vector[slot] += 2.0 / (1 + wIdx * 0.1);
  });

  // Normalize vector to unit length (L2 norm)
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm) || 1.0;

  const result: number[] = new Array(dim);
  for (let i = 0; i < dim; i++) {
    result[i] = Number((vector[i] / norm).toFixed(6));
  }
  return result;
}

/**
 * Request real 768-dimensional embedding from server-side Gemini API with fallback
 */
export async function generateEmbedding768(text: string): Promise<number[]> {
  try {
    const response = await fetch('/api/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.embedding) && data.embedding.length > 0) {
        return data.embedding;
      }
    }
  } catch (err) {
    console.warn('Vector embedding server unreachable, using client deterministic embedding:', err);
  }

  // Fallback to high-dimensional deterministic vector
  return generateDeterministicVector768(text);
}

/**
 * Calculate Cosine Similarity between two N-dimensional vectors
 * Range: [-1.0, 1.0] (Normalized to [0.0, 1.0] for display)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;

  const minLen = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < minLen; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;
  const similarity = dotProduct / (normA * normB);
  // Clamp between -1 and 1
  return Math.max(-1, Math.min(1, similarity));
}

/**
 * Dynamic Semantic Tool Selection:
 * Given an agent goal or prompt, compute cosine distance across all registered skills' 768-dim embeddings
 */
export function rankSkillsByVector(
  queryEmbedding: number[],
  skills: SkillRecord[],
  topK = 5
): ToolVectorSearchResult[] {
  const scored = skills.map((skill) => {
    // If skill doesn't have an embedding yet, generate a deterministic one from its title and description
    const skillVec = skill.embedding && skill.embedding.length === 768
      ? skill.embedding
      : generateDeterministicVector768(`${skill.title} ${skill.description} ${skill.category}`);

    const sim = cosineSimilarity(queryEmbedding, skillVec);
    // Convert cosine similarity [-1, 1] to normalized relevance score [0, 1]
    const normalizedScore = Math.max(0, (sim + 1) / 2);

    return {
      skillId: skill.id,
      skillName: skill.name,
      skillTitle: skill.title,
      description: skill.description,
      similarity: Number(normalizedScore.toFixed(4)),
      parametersSchema: skill.parametersSchema || {},
      bundleStoragePath: skill.bundleStoragePath || `gs://gen-lang-client-0573899362.firebasestorage.app/skills/${skill.id}/`,
    };
  });

  return scored.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
}

/**
 * Agent Memory Vector K-NN Search
 * Finds the top nearest cognitive memories matching a query vector
 */
export function rankMemoriesByVector(
  queryEmbedding: number[],
  memories: AgentMemoryRecord[],
  topK = 10,
  categoryFilter?: MemoryCategory
): MemoryVectorSearchResult[] {
  const filtered = categoryFilter
    ? memories.filter((m) => m.category === categoryFilter)
    : memories;

  const results: MemoryVectorSearchResult[] = filtered.map((m) => {
    const memVec = m.embedding && m.embedding.length === 768
      ? m.embedding
      : generateDeterministicVector768(m.content);

    const sim = cosineSimilarity(queryEmbedding, memVec);
    const normalized = Math.max(0, (sim + 1) / 2);

    return {
      memory: {
        ...m,
        relevanceScore: Number(normalized.toFixed(4)),
      },
      similarity: Number(normalized.toFixed(4)),
      distance: Number((1 - normalized).toFixed(4)),
    };
  });

  return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
}
