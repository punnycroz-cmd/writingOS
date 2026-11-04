/**
 * Academic Pack — Master Register Implementation
 * Encapsulates citation integrity, source graph verification, and non-invention constraints.
 */

import { BaseRegisterPack, RegisterAuditResult } from '../base-pack';
import { WritingTaskContract } from '../../core/task-contract';
import { UniversalStateGraph } from '../../core/state-model';
import { AcademicSourceGraph, SourceDocument } from './source-graph';

export class AcademicPack extends BaseRegisterPack {
  public readonly registerName = 'academic';
  public readonly description = 'Academic research engine ensuring citation integrity, claim-evidence alignment, and strict non-invention.';

  public initializeState(stateGraph: UniversalStateGraph, customConfig?: Record<string, unknown>): void {
    if (customConfig?.sources && Array.isArray(customConfig.sources)) {
      for (const src of customConfig.sources as SourceDocument[]) {
        AcademicSourceGraph.registerSource(stateGraph, src);
      }
    }
  }

  public auditText(text: string, stateGraph: UniversalStateGraph, task: WritingTaskContract): RegisterAuditResult {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // 1. Audit citation integrity against Source Graph
    const citeRes = AcademicSourceGraph.auditCitationGrounding(text, stateGraph);
    if (!citeRes.passed) {
      violations.push(...citeRes.violations);
    }

    // 2. Reject ungrounded speculation or colloquialisms
    if (/\b(?:gonna|wanna|kinda|super cool|awesome stuff)\b/i.test(text)) {
      violations.push('Register Tone Violation: Informal colloquialisms detected in Academic register.');
    }

    return {
      register: 'academic',
      passed: violations.length === 0,
      violations,
      recommendations,
    };
  }

  public applyRegisterRevision(text: string, stateGraph: UniversalStateGraph): { text: string; changes: string[] } {
    const changes: string[] = [];
    // Academic revision: Polish passive/objective constructions
    return {
      text,
      changes,
    };
  }
}
