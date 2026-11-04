/**
 * Fiction Pack — Master Register Implementation
 * Encapsulates character state, canon invariants, and craft pacing for fiction projects.
 */

import { BaseRegisterPack, RegisterAuditResult } from '../base-pack';
import { WritingTaskContract } from '../../core/task-contract';
import { UniversalStateGraph } from '../../core/state-model';
import { CharacterStateLedger } from './character-state';
import { CanonInvariantEngine } from './canon-invariants';

export class FictionPack extends BaseRegisterPack {
  public readonly registerName = 'fiction';
  public readonly description = 'Fiction narrative engine supporting character consciousness, somatic costs, and canon invariants.';

  public initializeState(stateGraph: UniversalStateGraph, customConfig?: Record<string, unknown>): void {
    if (customConfig?.characters && Array.isArray(customConfig.characters)) {
      for (const char of customConfig.characters) {
        CharacterStateLedger.registerCharacter(stateGraph, char);
      }
    }
  }

  public auditText(text: string, stateGraph: UniversalStateGraph, task: WritingTaskContract): RegisterAuditResult {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // 1. Audit Canon invariants
    const canonRes = CanonInvariantEngine.auditCanon(text);
    if (!canonRes.passed) {
      violations.push(...canonRes.violations);
    }

    // 2. Audit Somatic friction for registered characters
    const characters = stateGraph.getAllEntities().filter(e => e.entityType === 'CHARACTER');
    for (const char of characters) {
      const somaticRes = CharacterStateLedger.auditSomaticFriction(text, stateGraph, char.id);
      if (!somaticRes.passed && somaticRes.violation) {
        violations.push(somaticRes.violation);
      }
    }

    return {
      register: 'fiction',
      passed: violations.length === 0,
      violations,
      recommendations,
    };
  }

  public applyRegisterRevision(text: string, stateGraph: UniversalStateGraph): { text: string; changes: string[] } {
    const changes: string[] = [];
    // Fiction-specific revision: Ensure sensory grounding
    return {
      text,
      changes,
    };
  }
}
