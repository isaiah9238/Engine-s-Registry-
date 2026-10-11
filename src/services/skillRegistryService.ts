import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  type Firestore,
  type DocumentData,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type FirestoreDataConverter,
} from 'firebase/firestore';
import { db } from './firebase';
import { getCachedSkill, setCachedSkill } from './localRegistryCache';
import type {
  AgentSkillDocument,
  SkillCategory,
  SkillParameterDeclaration,
  SkillExample,
  SkillReference,
} from '../types/skill';

/**
 * Defensive deserializer for safely handling raw stringified or legacy document fields.
 */
const safeJsonParse = <T>(value: unknown, fallback: T): T => {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== 'string') return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

/**
 * Strict Firestore Data Converter for AgentSkillDocument entities.
 * Enforces zero 'any' leaks and validates bi-directional serialization.
 */
export const skillDocumentConverter: FirestoreDataConverter<AgentSkillDocument> = {
  toFirestore(skill: AgentSkillDocument): DocumentData {
    return {
      id: skill.id,
      name: skill.name,
      title: skill.title,
      description: skill.description,
      category: skill.category,
      version: skill.version,
      status: skill.status,
      isPublic: skill.isPublic,
      authorId: skill.authorId,
      authorEmail: skill.authorEmail,
      securityClearance: skill.securityClearance,
      isExecutable: skill.isExecutable,
      runtime: skill.runtime,
      sourceReferences: skill.sourceReferences,
      parametersSchema: skill.parametersSchema,
      bundleStoragePath: skill.bundleStoragePath,
      bundleFiles: skill.bundleFiles,
      summaryJson: skill.summaryJson,
      parameters: JSON.stringify(skill.parameters),
      examples: JSON.stringify(skill.examples),
      references: JSON.stringify(skill.references),
      dependencies: JSON.stringify(skill.dependencies),
      codeFiles: JSON.stringify(skill.codeFiles),
      createdAt: skill.createdAt,
      updatedAt: new Date().toISOString(),
    };
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions
  ): AgentSkillDocument {
    const data = snapshot.data(options);

    return {
      id: snapshot.id,
      name: String(data.name || snapshot.id),
      title: String(data.title || ''),
      description: String(data.description || ''),
      category: (data.category as SkillCategory) || 'orchestration',
      version: String(data.version || '1.0.0'),
      status: data.status || 'draft',
      isPublic: Boolean(data.isPublic),
      authorId: String(data.authorId || ''),
      authorEmail: String(data.authorEmail || ''),
      securityClearance: data.securityClearance || 'public',
      isExecutable: Boolean(data.isExecutable),
      runtime: data.runtime || 'in_process',
      sourceReferences: Array.isArray(data.sourceReferences) ? data.sourceReferences : [],
      parametersSchema:
        typeof data.parametersSchema === 'object' && data.parametersSchema !== null
          ? data.parametersSchema
          : {},
      bundleStoragePath: String(data.bundleStoragePath || ''),
      bundleFiles: data.bundleFiles || {
        guidelinesMd: '',
        runtimeScript: '',
        runtimeFilename: 'script.js',
      },
      summaryJson: String(data.summaryJson || '{}'),
      parameters: safeJsonParse<SkillParameterDeclaration[]>(data.parameters, []),
      examples: safeJsonParse<SkillExample[]>(data.examples, []),
      references: safeJsonParse<SkillReference[]>(data.references, []),
      dependencies: safeJsonParse<string[]>(data.dependencies, []),
      codeFiles: safeJsonParse<Record<string, { filename: string; language: string; content: string }>>(
        data.codeFiles,
        {}
      ),
      createdAt: String(data.createdAt || new Date().toISOString()),
      updatedAt: String(data.updatedAt || new Date().toISOString()),
    };
  },
};

/**
 * Service orchestrating CRUD operations and cache-driven queries for skills.
 */
export class SkillRegistryService {
  private readonly firestore: Firestore;
  private readonly collectionPath = 'skills';

  constructor(customDb?: Firestore) {
    this.firestore = customDb || db;
  }

  private getCollectionRef() {
    return collection(this.firestore, this.collectionPath).withConverter(skillDocumentConverter);
  }

  /**
   * Retrieves a single skill document by ID, checking local cache before remote query.
   */
  public async getSkillById(skillId: string): Promise<AgentSkillDocument | null> {
    const cached = getCachedSkill(skillId);
    if (cached) {
      return cached;
    }

    const docRef = doc(this.getCollectionRef(), skillId);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      return null;
    }

    const skill = docSnapshot.data();
    setCachedSkill(skill);
    return skill;
  }

  /**
   * Lists published skills filtered by category with explicit ordering.
   */
  public async listSkillsByCategory(
    category: SkillCategory,
    maxResults = 50
  ): Promise<AgentSkillDocument[]> {
    const q = query(
      this.getCollectionRef(),
      where('category', '==', category),
      where('status', '==', 'published'),
      orderBy('updatedAt', 'desc'),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(q);
    const skills = querySnapshot.docs.map((docSnap) => docSnap.data());

    skills.forEach((skill) => setCachedSkill(skill));
    return skills;
  }

  /**
   * Fetches all registered skills with optional status filtering.
   */
  public async getAllSkills(statusFilter?: AgentSkillDocument['status']): Promise<AgentSkillDocument[]> {
    const q = statusFilter
      ? query(
          this.getCollectionRef(),
          where('status', '==', statusFilter),
          orderBy('updatedAt', 'desc')
        )
      : query(this.getCollectionRef(), orderBy('updatedAt', 'desc'));

    const querySnapshot = await getDocs(q);
    const skills = querySnapshot.docs.map((docSnap) => docSnap.data());

    skills.forEach((skill) => setCachedSkill(skill));
    return skills;
  }

  /**
   * Upserts a skill document to Firestore and invalidates/updates local cache.
   */
  public async saveSkill(skill: AgentSkillDocument): Promise<void> {
    const docRef = doc(this.getCollectionRef(), skill.id);
    await setDoc(docRef, skill);
    setCachedSkill(skill);
  }

  /**
   * Deletes a skill document by ID.
   */
  public async deleteSkill(skillId: string): Promise<void> {
    const docRef = doc(this.getCollectionRef(), skillId);
    await deleteDoc(docRef);
  }
}

export const skillRegistryService = new SkillRegistryService();
export const skillRegistryService = new SkillRegistryService();