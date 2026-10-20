/**
 * Skill Version Snapshot Service
 * Handles historical version tracking, diff inspection, and snapshot restoration
 */
import type { SkillRecord, SkillVersionSnapshot } from '../types/skill';
import { SEED_SKILL_VERSIONS } from '../data/seedSkillVersions';
import { saveSkill } from './skillRepository';

const LOCAL_STORAGE_PREFIX = 'skill_versions_';

function getLocalVersions(skillId: string): SkillVersionSnapshot[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${skillId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalVersion(skillId: string, snapshot: SkillVersionSnapshot) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalVersions(skillId);
    const updated = [snapshot, ...existing.filter((s) => s.id !== snapshot.id)];
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${skillId}`, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save version to localStorage', e);
  }
}

/**
 * Fetch all historical snapshots for a given skill
 */
export async function fetchSkillVersions(skill: SkillRecord): Promise<SkillVersionSnapshot[]> {
  const skillId = skill.id;
  const snapshotMap = new Map<string, SkillVersionSnapshot>();

  // 1. Load seed snapshots first
  const seeds = SEED_SKILL_VERSIONS[skillId] || [];
  seeds.forEach((s) => snapshotMap.set(s.id, { ...s }));

  // 2. Fetch server-persisted versions from /api/skills/:id/versions
  try {
    const res = await fetch(`/api/skills/${encodeURIComponent(skillId)}/versions`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.versions)) {
        data.versions.forEach((v: SkillVersionSnapshot) => snapshotMap.set(v.id, v));
      }
    }
  } catch (err) {
    console.warn('Notice querying server version history:', err);
  }

  // 3. Load locally stored versions
  const localList = getLocalVersions(skillId);
  localList.forEach((s) => snapshotMap.set(s.id, s));

  // 4. Ensure current live version is represented in the history
  const currentSnapshotId = `current-${skillId}-v${skill.version}`;
  if (!snapshotMap.has(currentSnapshotId)) {
    const liveSnapshot: SkillVersionSnapshot = {
      id: currentSnapshotId,
      skillId: skill.id,
      version: skill.version || '1.0.0',
      title: skill.title,
      description: skill.description,
      category: skill.category,
      status: skill.status,
      authorEmail: skill.authorEmail || 'system',
      authorId: skill.authorId,
      changeLog: 'Current live registry state',
      codeFiles: skill.codeFiles || '{}',
      skillMarkdown: skill.skillMarkdown || '',
      summaryJson: skill.summaryJson,
      parameters: skill.parameters,
      examples: skill.examples,
      references: skill.references,
      dependencies: skill.dependencies,
      runtime: skill.runtime,
      securityClearance: skill.securityClearance,
      createdAt: skill.updatedAt || skill.createdAt || new Date().toISOString(),
      isCurrent: true,
    };
    snapshotMap.set(currentSnapshotId, liveSnapshot);
  }

  const list = Array.from(snapshotMap.values());
  // Sort descending by creation date
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Create a new immutable snapshot of a skill
 */
export async function createSkillSnapshot(
  skill: SkillRecord,
  changeLog?: string
): Promise<SkillVersionSnapshot> {
  const timestamp = new Date().toISOString();
  const snapshotId = `snap-${skill.id}-v${skill.version.replace(/\./g, '-')}-${Date.now()}`;

  const snapshot: SkillVersionSnapshot = {
    id: snapshotId,
    skillId: skill.id,
    version: skill.version || '1.0.0',
    title: skill.title,
    description: skill.description,
    category: skill.category,
    status: skill.status,
    authorEmail: skill.authorEmail,
    authorId: skill.authorId,
    changeLog: changeLog || `Snapshot tagged at ${new Date().toLocaleTimeString()}`,
    codeFiles: skill.codeFiles || '{}',
    skillMarkdown: skill.skillMarkdown || '',
    summaryJson: skill.summaryJson,
    parameters: skill.parameters,
    examples: skill.examples,
    references: skill.references,
    dependencies: skill.dependencies,
    runtime: skill.runtime,
    securityClearance: skill.securityClearance,
    createdAt: timestamp,
    isCurrent: true,
  };

  // Save to local storage
  saveLocalVersion(skill.id, snapshot);

  // Attempt server persistence
  try {
    await fetch(`/api/skills/${encodeURIComponent(skill.id)}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot),
    });
  } catch (err) {
    console.warn('Notice saving version snapshot to server:', err);
  }

  return snapshot;
}

/**
 * Restore a skill from a historical snapshot
 */
export async function restoreSkillSnapshot(
  currentSkill: SkillRecord,
  snapshot: SkillVersionSnapshot
): Promise<SkillRecord> {
  const now = new Date().toISOString();

  // 1. Take an automatic safety backup of current state before rollback
  try {
    await createSkillSnapshot(
      currentSkill,
      `Automatic safety backup prior to restoring v${snapshot.version}`
    );
  } catch (snapErr) {
    console.warn('Pre-restore snapshot note:', snapErr);
  }

  // 2. Synthesize restored SkillRecord
  const restoredSkill: SkillRecord = {
    ...currentSkill,
    title: snapshot.title,
    description: snapshot.description,
    category: snapshot.category,
    version: snapshot.version,
    status: snapshot.status,
    skillMarkdown: snapshot.skillMarkdown,
    summaryJson: snapshot.summaryJson || currentSkill.summaryJson,
    codeFiles: snapshot.codeFiles || currentSkill.codeFiles,
    parameters: snapshot.parameters || currentSkill.parameters,
    examples: snapshot.examples || currentSkill.examples,
    references: snapshot.references || currentSkill.references,
    dependencies: snapshot.dependencies || currentSkill.dependencies,
    runtime: snapshot.runtime || currentSkill.runtime,
    securityClearance: snapshot.securityClearance || currentSkill.securityClearance,
    updatedAt: now,
  };

  // 3. Persist to Firestore & Server API
  await saveSkill(restoredSkill);

  // 4. Record restoration snapshot entry
  const restoreLogSnapshot: SkillVersionSnapshot = {
    id: `restore-${currentSkill.id}-v${snapshot.version}-${Date.now()}`,
    skillId: currentSkill.id,
    version: snapshot.version,
    title: snapshot.title,
    description: snapshot.description,
    category: snapshot.category,
    status: snapshot.status,
    authorEmail: currentSkill.authorEmail,
    authorId: currentSkill.authorId,
    changeLog: `Restored to snapshot v${snapshot.version} ("${snapshot.title}")`,
    codeFiles: restoredSkill.codeFiles,
    skillMarkdown: restoredSkill.skillMarkdown,
    summaryJson: restoredSkill.summaryJson,
    parameters: restoredSkill.parameters,
    examples: restoredSkill.examples,
    references: restoredSkill.references,
    dependencies: restoredSkill.dependencies,
    runtime: restoredSkill.runtime,
    securityClearance: restoredSkill.securityClearance,
    createdAt: now,
    isCurrent: true,
  };

  saveLocalVersion(currentSkill.id, restoreLogSnapshot);

  try {
    await fetch(`/api/skills/${encodeURIComponent(currentSkill.id)}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(restoreLogSnapshot),
    });
  } catch (err) {
    console.warn('Notice saving restoration snapshot to server:', err);
  }

  return restoredSkill;
}
