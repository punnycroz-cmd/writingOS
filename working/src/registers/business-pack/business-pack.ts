/**
 * Business Pack — Master Register Implementation
 * Encapsulates brand voice, audience alignment, and metric accuracy for business communications.
 */

import { BaseRegisterPack, RegisterAuditResult } from '../base-pack';
import { WritingTaskContract } from '../../core/task-contract';
import { UniversalStateGraph } from '../../core/state-model';
import { BusinessBrandEngine, BusinessEntityConfig } from './brand-voice';

export class BusinessPack extends BaseRegisterPack {
  public readonly registerName = 'business';
  public readonly description = 'Business communication engine ensuring executive clarity, audience fit, and metric authorization.';

  public initializeState(stateGraph: UniversalStateGraph, customConfig?: Record<string, unknown>): void {
    if (customConfig?.companyProfile) {
      BusinessBrandEngine.registerBusinessProfile(stateGraph, customConfig.companyProfile as BusinessEntityConfig);
    }
  }

  public auditText(text: string, stateGraph: UniversalStateGraph, task: WritingTaskContract): RegisterAuditResult {
    const violations: string[] = [];
    const recommendations: string[] = [];

    // 1. Audit financial metric grounding
    const metricRes = BusinessBrandEngine.auditBusinessClaims(text, stateGraph);
    if (!metricRes.passed) {
      violations.push(...metricRes.violations);
    }

    // 2. Executive clarity check (prohibit excessive rambling)
    if (text.length > 5000 && task.audience === 'EXECUTIVE') {
      recommendations.push('Length Notice: Executive briefs should remain punchy and action-oriented.');
    }

    return {
      register: 'business',
      passed: violations.length === 0,
      violations,
      recommendations,
    };
  }

  public applyRegisterRevision(text: string, stateGraph: UniversalStateGraph): { text: string; changes: string[] } {
    const changes: string[] = [];
    return {
      text,
      changes,
    };
  }
}
