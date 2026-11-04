/**
 * Writing OS Core — Generation Observability & Trace Ledger
 * Immutable structured trace recording every step of the generation and validation lifecycle.
 */

import { RegisterType } from './task-contract';
import { StateGraphSnapshot } from './state-model';
import { GenerationPlan } from './generation-plan';
import { UntrustedCandidate } from './candidate-isolation';
import { HandoffAction } from './handoff';

export interface TargetedRepairRecord {
  repairId: string;
  targetedRegionId: string;
  originalSnippet: string;
  repairedSnippet: string;
  violationAddressed: string;
  timestamp: number;
}

export interface GenerationTrace {
  generationId: string;
  taskId: string;
  register: RegisterType;
  initialStateSnapshot: StateGraphSnapshot;
  plan: GenerationPlan;
  candidate: UntrustedCandidate;
  integrityEvaluation: {
    integrityScore: number;
    passed: boolean;
    violations: string[];
  };
  qualityEvaluation: {
    overallQualityScore: number;
    dimensionScores: Record<string, number>;
    diagnosticFeedback: string[];
  };
  finalDecision: HandoffAction;
  stateCommit: {
    committed: boolean;
    finalSnapshot?: StateGraphSnapshot;
  };
  repairHistory: TargetedRepairRecord[];
  timestamp: number;
}

export class GenerationTraceLedger {
  private static traces: Map<string, GenerationTrace> = new Map();

  public static recordTrace(trace: GenerationTrace): void {
    this.traces.set(trace.generationId, trace);
  }

  public static getTrace(generationId: string): GenerationTrace | undefined {
    return this.traces.get(generationId);
  }

  public static getAllTraces(): GenerationTrace[] {
    return Array.from(this.traces.values());
  }

  public static clearTraces(): void {
    this.traces.clear();
  }
}
