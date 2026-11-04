/**
 * Writing OS Registers — Base Register Pack Interface
 * Standard contract implemented by all domain-specific register packs.
 */

import { WritingTaskContract, RegisterType } from '../core/task-contract';
import { UniversalStateGraph } from '../core/state-model';
import { ValidationReport } from '../core/independent-validator';

export interface RegisterAuditResult {
  register: RegisterType;
  passed: boolean;
  violations: string[];
  recommendations: string[];
}

export abstract class BaseRegisterPack {
  public abstract readonly registerName: RegisterType;
  public abstract readonly description: string;

  /**
   * Initializes domain-specific entities and rules into the State Graph
   */
  public abstract initializeState(stateGraph: UniversalStateGraph, customConfig?: Record<string, unknown>): void;

  /**
   * Domain-specific validation rules
   */
  public abstract auditText(text: string, stateGraph: UniversalStateGraph, task: WritingTaskContract): RegisterAuditResult;

  /**
   * Domain-specific revision / polishing pass
   */
  public abstract applyRegisterRevision(text: string, stateGraph: UniversalStateGraph): { text: string; changes: string[] };
}
