/**
 * Agent Memory Repository: Firestore Persistence + Real-time Sync + Vector Integration
 * Collection: agent_memories/
 */
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import type { AgentMemoryRecord, MemoryCategory } from '../types/agentMemory';
import { SEED_AGENT_MEMORIES } from '../data/seedMemories';
import { generateEmbedding768 } from './vectorSearch';

const MEMORIES_COLLECTION = 'agent_memories';

export async function fetchAllAgentMemories(): Promise<AgentMemoryRecord[]> {
  if (!auth.currentUser) {
    return SEED_AGENT_MEMORIES;
  }

  try {
    const q = query(collection(db, MEMORIES_COLLECTION));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return SEED_AGENT_MEMORIES;
    }

    const firestoreMemories: AgentMemoryRecord[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      firestoreMemories.push({
        id: docSnap.id,
        agentId: data.agentId || 'agent-core-alchemist',
        content: data.content || '',
        embedding: Array.isArray(data.embedding) ? data.embedding : [],
        category: data.category || 'semantic',
        updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(),
        title: data.title || '',
        tags: data.tags || [],
      });
    });

    const merged = new Map<string, AgentMemoryRecord>();
    SEED_AGENT_MEMORIES.forEach((m) => merged.set(m.id, m));
    firestoreMemories.forEach((m) => merged.set(m.id, m));

    return Array.from(merged.values());
  } catch (error) {
    console.warn('Firestore fetch agent_memories notice, using seed memories:', error);
    return SEED_AGENT_MEMORIES;
  }
}

export function subscribeToAgentMemories(
  onUpdate: (memories: AgentMemoryRecord[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  if (!auth.currentUser) {
    onUpdate(SEED_AGENT_MEMORIES);
    return () => {};
  }

  try {
    const q = query(collection(db, MEMORIES_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate(SEED_AGENT_MEMORIES);
          return;
        }

        const list: AgentMemoryRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            agentId: data.agentId || auth.currentUser?.uid || 'agent-core',
            content: data.content || '',
            embedding: Array.isArray(data.embedding) ? data.embedding : [],
            category: data.category || 'semantic',
            updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(),
            title: data.title || '',
            tags: data.tags || [],
          });
        });

        const merged = new Map<string, AgentMemoryRecord>();
        SEED_AGENT_MEMORIES.forEach((m) => merged.set(m.id, m));
        list.forEach((m) => merged.set(m.id, m));

        onUpdate(Array.from(merged.values()));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, MEMORIES_COLLECTION);
        onError?.(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, MEMORIES_COLLECTION);
    return () => {};
  }
}

export async function saveAgentMemory(
  partial: Partial<AgentMemoryRecord> & { content: string; category: MemoryCategory }
): Promise<AgentMemoryRecord> {
  const memoryId = partial.id || `mem-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const agentId = partial.agentId || auth.currentUser?.uid || 'agent-core-alchemist';

  // Compute 768-dimensional vector embedding if missing or invalid dimension
  let embedding = partial.embedding;
  if (!embedding || embedding.length !== 768) {
    embedding = await generateEmbedding768(partial.content);
  }

  const record: AgentMemoryRecord = {
    id: memoryId,
    agentId,
    content: partial.content,
    embedding,
    category: partial.category,
    updatedAt: new Date().toISOString(),
    title: partial.title || partial.content.slice(0, 48) + '...',
    tags: partial.tags || [partial.category],
  };

  if (!auth.currentUser) {
    return record;
  }

  try {
    const docRef = doc(db, MEMORIES_COLLECTION, memoryId);
    await setDoc(
      docRef,
      {
        agentId: record.agentId,
        content: record.content,
        embedding: record.embedding,
        category: record.category,
        title: record.title,
        tags: record.tags,
        updatedAt: record.updatedAt,
      },
      { merge: true }
    );
    return record;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${MEMORIES_COLLECTION}/${memoryId}`);
    return record;
  }
}

export async function deleteAgentMemory(memoryId: string): Promise<void> {
  if (!auth.currentUser) return;
  try {
    await deleteDoc(doc(db, MEMORIES_COLLECTION, memoryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${MEMORIES_COLLECTION}/${memoryId}`);
  }
}
