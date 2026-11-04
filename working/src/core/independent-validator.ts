/**
 * Writing OS Core — Independent Validator Architecture
 * Enforces the core invariant: The Generator context != The Validator context.
 */

import { UniversalStateGraph } from './state-model';
import { WritingTaskContract } from './task-contract';
import { HandoffDecision, HandoffRouter } from './handoff';

export interface ValidationContext {
  task: WritingTaskContract;
  stateGraph: UniversalStateGraph;
  candidateText: string;
  deterministicRules: Array<(text: string, state: UniversalStateGraph) => { passed: boolean; ruleId: string; reason: string }>;
}

export interface ValidationReport {
  isValid: boolean;
  deterministicViolations: string[];
  handoffs: HandoffDecision[];
  confidenceScore: number;
}

export class IndependentValidator {
  public static validate(context: ValidationContext): ValidationReport {
    const violations: string[] = [];
    const handoffs: HandoffDecision[] = [];

    // 1. Run all registered deterministic validation rules
    for (const rule of context.deterministicRules) {
      const res = rule(context.candidateText, context.stateGraph);
      if (!res.passed) {
        violations.push(`[${res.ruleId}] ${res.reason}`);
        handoffs.push(
          HandoffRouter.routeDecision({
            ruleId: res.ruleId,
            isDeterministicViolation: true,
            isAmbiguous: false,
            severity: 'CRITICAL',
            description: res.reason,
            sourceContext: context.candidateText.slice(0, 100),
          })
        );
      }
    }

    const isValid = violations.length === 0;
    const confidenceScore = isValid ? 1.0 : Math.max(0.0, 1.0 - (violations.length * 0.25));

    return {
      isValid,
      deterministicViolations: violations,
      handoffs,
      confidenceScore,
    };
  }
}
