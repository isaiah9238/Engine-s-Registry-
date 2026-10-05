/**
 * Operational Subcollection Service: Execution Traces
 * Path: /skills/{skillId}/executions/{executionId}
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import type { ExecutionTrace, SkillRecord, SecurityClearance } from '../types/skill';

// In-memory trace cache per skill
const localTraceCache = new Map<string, ExecutionTrace[]>();

export async function recordExecutionTrace(
  skillId: string,
  trace: ExecutionTrace
): Promise<ExecutionTrace> {
  // Update local trace cache
  const existing = localTraceCache.get(skillId) || [];
  localTraceCache.set(skillId, [trace, ...existing].slice(0, 50));

  if (!auth.currentUser) {
    return trace;
  }

  try {
    const traceRef = doc(db, 'skills', skillId, 'executions', trace.executionId);
    await setDoc(traceRef, {
      executionId: trace.executionId,
      agentId: trace.agentId,
      callerClearance: trace.callerClearance || 'public',
      runtime: trace.runtime,
      inputParams: trace.inputParams,
      status: trace.status,
      latencyMs: trace.latencyMs,
      errorMessage: trace.errorMessage || null,
      timestamp: trace.timestamp,
    });
  } catch (error) {
    console.warn(`Execution trace save notice for /skills/${skillId}/executions/${trace.executionId}:`, error);
  }

  return trace;
}

export async function fetchExecutionTraces(skillId: string): Promise<ExecutionTrace[]> {
  const localTraces = localTraceCache.get(skillId) || [];

  if (!auth.currentUser) {
    return localTraces;
  }

  try {
    const tracesRef = collection(db, 'skills', skillId, 'executions');
    const q = query(tracesRef, limit(25));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return localTraces;
    }

    const fetched: ExecutionTrace[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      fetched.push({
        executionId: data.executionId || docSnap.id,
        agentId: data.agentId || 'anonymous-node',
        callerClearance: data.callerClearance,
        runtime: data.runtime || 'in_process',
        inputParams: data.inputParams || {},
        status: data.status || 'success',
        latencyMs: typeof data.latencyMs === 'number' ? data.latencyMs : 0,
        errorMessage: data.errorMessage || undefined,
        timestamp: data.timestamp || new Date().toISOString(),
      });
    });

    // Merge with local traces avoiding duplicates
    const merged = new Map<string, ExecutionTrace>();
    localTraces.forEach((t) => merged.set(t.executionId, t));
    fetched.forEach((t) => merged.set(t.executionId, t));

    const result = Array.from(merged.values());
    localTraceCache.set(skillId, result);
    return result;
  } catch (error) {
    console.warn('Execution traces fetch notice, returning local cache:', error);
    return localTraces;
  }
}

/**
 * Runs a simulated tool invocation conforming to parametersSchema and records an execution trace
 */
export async function simulateSkillExecution(
  skill: SkillRecord,
  inputParams: Record<string, any>,
  callerClearance: SecurityClearance = 'public',
  agentId = auth.currentUser?.uid || 'agent-core-alchemist'
): Promise<{ result: any; trace: ExecutionTrace }> {
  const start = performance.now();
  const executionId = `exec-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  let status: 'success' | 'error' | 'timeout' = 'success';
  let errorMessage: string | undefined;
  let simulatedOutput: any = {};

  try {
    // ABAC clearance verification
    const requiredClearance = skill.securityClearance || 'public';
    if (requiredClearance === 'admin-only' && callerClearance !== 'admin-only') {
      throw new Error(`PermissionDenied: Skill '${skill.name}' requires admin-only clearance. Caller asserted '${callerClearance}'.`);
    }
    if (requiredClearance === 'internal' && callerClearance === 'public') {
      throw new Error(`PermissionDenied: Skill '${skill.name}' requires internal or admin clearance. Caller asserted 'public'.`);
    }

    // Validate parameters schema required properties
    const schema = skill.parametersSchema || {};
    if (schema.required && Array.isArray(schema.required)) {
      for (const reqField of schema.required) {
        if (inputParams[reqField] === undefined || inputParams[reqField] === '') {
          throw new Error(`ValidationError: Missing required parameter '${reqField}' for tool '${skill.name}'.`);
        }
      }
    }

    // Simulate work with micro-delay
    await new Promise((resolve) => setTimeout(resolve, 80 + Math.random() * 70));

    simulatedOutput = {
      tool: skill.name,
      runtime: skill.runtime || 'in_process',
      executedAt: new Date().toISOString(),
      status: 'completed',
      output: {
        message: `Tool ${skill.title} executed successfully on node.`,
        echoParams: inputParams,
        computedMetrics: {
          thermodynamicEnergyJoule: 2.9e-21 * 768,
          confidence: 0.994,
        },
      },
    };
  } catch (err: any) {
    status = 'error';
    errorMessage = err?.message || 'Execution failed';
    simulatedOutput = {
      error: errorMessage,
      failedAt: new Date().toISOString(),
    };
  }

  const latencyMs = Math.round(performance.now() - start);

  const trace: ExecutionTrace = {
    executionId,
    agentId,
    callerClearance,
    runtime: (skill.runtime as any) || 'in_process',
    inputParams,
    status,
    latencyMs,
    errorMessage,
    timestamp: new Date().toISOString(),
  };

  await recordExecutionTrace(skill.id, trace);
  return { result: simulatedOutput, trace };
}
