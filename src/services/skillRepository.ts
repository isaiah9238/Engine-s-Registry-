/**
 * Skill Repository: Firestore Persistence + Real-time Sync + Seed fallback + Skill Matcher
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
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import type { SkillRecord, SkillMatchResult, IngestionSummaryJson } from '../types/skill';
import { SEED_SKILLS } from '../data/seedSkills';

const SKILLS_COLLECTION = 'skills';

export async function fetchAllSkills(): Promise<SkillRecord[]> {
  try {
    const q = query(collection(db, SKILLS_COLLECTION));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return SEED_SKILLS;
    }

    const firestoreSkills: SkillRecord[] = [];
    snapshot.forEach((docSnap) => {
      firestoreSkills.push(docSnap.data() as SkillRecord);
    });

    // Merge seed skills that may not yet be persisted
    const mergedMap = new Map<string, SkillRecord>();
    SEED_SKILLS.forEach((s) => mergedMap.set(s.id, s));
    firestoreSkills.forEach((s) => mergedMap.set(s.id, s));

    return Array.from(mergedMap.values());
  } catch (error) {
    console.warn('Firestore fetch failed, using fallback in-memory seed skills:', error);
    return SEED_SKILLS;
  }
}

export function subscribeToSkills(
  onUpdate: (skills: SkillRecord[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  try {
    const q = query(collection(db, SKILLS_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate(SEED_SKILLS);
          return;
        }
        const list: SkillRecord[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as SkillRecord);
        });

        const mergedMap = new Map<string, SkillRecord>();
        SEED_SKILLS.forEach((s) => mergedMap.set(s.id, s));
        list.forEach((s) => mergedMap.set(s.id, s));

        onUpdate(Array.from(mergedMap.values()));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, SKILLS_COLLECTION);
        onError?.(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, SKILLS_COLLECTION);
    return () => {};
  }
}

export async function saveSkill(skill: SkillRecord): Promise<void> {
  const path = `${SKILLS_COLLECTION}/${skill.id}`;
  try {
    const docRef = doc(db, SKILLS_COLLECTION, skill.id);
    const sanitizedSkill = {
      ...skill,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, sanitizedSkill, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSkill(skillId: string): Promise<void> {
  const path = `${SKILLS_COLLECTION}/${skillId}`;
  try {
    const docRef = doc(db, SKILLS_COLLECTION, skillId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Evaluates which skill in the registry is best for a given user query or job.
 */
export function evaluateBestSkillForJob(query: string, skills: SkillRecord[]): SkillMatchResult[] {
  if (!query || !query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  const queryTokens = lowerQuery
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const results: SkillMatchResult[] = skills.map((skill) => {
    let score = 0;
    const reasons: string[] = [];

    let summary: IngestionSummaryJson | null = null;
    try {
      summary = JSON.parse(skill.summaryJson);
    } catch {
      // ignore
    }

    // 1. Exact Name/Title Hit
    if (lowerQuery.includes(skill.name.toLowerCase())) {
      score += 45;
      reasons.push(`Direct mention of skill name: '${skill.name}' (+45)`);
    }

    const titleTokens = skill.title.toLowerCase().split(/\s+/);
    const titleOverlap = titleTokens.filter((t) => queryTokens.includes(t));
    if (titleOverlap.length > 0) {
      score += Math.min(30, titleOverlap.length * 10);
      reasons.push(`Matches key title terms: [${titleOverlap.join(', ')}]`);
    }

    // 2. Routing Keywords from Summary JSON
    if (summary?.routingKeywords) {
      const keywordHits = summary.routingKeywords.filter((kw) =>
        lowerQuery.includes(kw.toLowerCase())
      );
      if (keywordHits.length > 0) {
        score += Math.min(35, keywordHits.length * 12);
        reasons.push(`Ingestion routing keywords triggered: [${keywordHits.join(', ')}]`);
      }
    }

    // 3. Trigger Preconditions Hit
    if (summary?.triggerPreconditions) {
      for (const pre of summary.triggerPreconditions) {
        const preWords = pre.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        const overlap = preWords.filter((w) => queryTokens.includes(w));
        if (overlap.length >= 2) {
          score += 20;
          reasons.push(`Satisfies declared trigger precondition: "${pre}"`);
          break;
        }
      }
    }

    // 4. Description Semantic Density
    const descWords = skill.description.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const descHits = descWords.filter((w) => queryTokens.includes(w));
    if (descHits.length > 0) {
      score += Math.min(15, descHits.length * 3);
    }

    // 5. Check if query matches "unsuitedFor"
    if (summary?.unsuitedFor) {
      for (const un of summary.unsuitedFor) {
        const unWords = un.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        const unOverlap = unWords.filter((w) => queryTokens.includes(w));
        if (unOverlap.length >= 2) {
          score -= 30;
          reasons.push(`Flags unsuited operational boundary: "${un}" (-30 penalty)`);
        }
      }
    }

    // Cap between 0 and 100
    const clampedScore = Math.min(100, Math.max(0, Math.round(score)));

    let confidence: 'High' | 'Medium' | 'Low' = 'Low';
    if (clampedScore >= 70) confidence = 'High';
    else if (clampedScore >= 40) confidence = 'Medium';

    const fitAssessment =
      clampedScore >= 70
        ? `Primary optimal skill for this job. Strong overlap with declared capabilities.`
        : clampedScore >= 40
        ? `Moderate fit. Consider as complementary tool or fallback pipeline.`
        : `Low relevance. Task requires alternative capabilities.`;

    return {
      skillId: skill.id,
      skillName: skill.name,
      skillTitle: skill.title,
      score: clampedScore,
      confidence,
      reasons: reasons.length > 0 ? reasons : ['Baseline semantic scan without specific keyword matches.'],
      fitAssessment,
    };
  });

  return results.sort((a, b) => b.score - a.score);
}
