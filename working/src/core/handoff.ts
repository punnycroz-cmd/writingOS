/**
 * Writing OS Core — First-Class Handoff System
 * Explicit multi-tier decision routing for autonomous execution, LLM escalation, and human review.
 */

export type HandoffAction = 
  | 'AUTONOMOUS_ACCEPT'   // Deterministically proven valid; execute directly
  | 'AUTONOMOUS_BLOCK'    // Deterministically proven invalid / invariant violation; reject immediately
  | 'LLM_HANDOFF'         // Semantic ambiguity requiring second-pass LLM reasoning with clean context
  | 'HUMAN_HANDOFF'       // Irreconcilable contradiction or high-risk decision requiring human review
  | 'EXECUTION_ERROR';    // System failure or missing dependency

export type SeverityLevel = 'CRITICAL' | 'MAJOR' | 'MODERATE' | 'MINOR' | 'INFO';

export interface HandoffDecision {
  action: HandoffAction;
  severity: SeverityLevel;
  ruleId: string;
  description: string;
  sourceContext: string;
  suggestedRemediation?: string;
  timestamp: number;
}

export class HandoffRouter {
  public static routeDecision(params: {
    ruleId: string;
    isDeterministicViolation: boolean;
    isAmbiguous: boolean;
    severity: SeverityLevel;
    description: string;
    sourceContext: string;
    suggestedRemediation?: string;
  }): HandoffDecision {
    const timestamp = Date.now();

    // 1. Hard Invariant: ANY deterministic violation MUST result in an AUTONOMOUS_BLOCK.
    // Zero fall-through to AUTONOMOUS_ACCEPT regardless of severity level.
    if (params.isDeterministicViolation) {
      return {
        action: 'AUTONOMOUS_BLOCK',
        severity: params.severity === 'INFO' ? 'MINOR' : params.severity,
        ruleId: params.ruleId,
        description: `Deterministic Violation [${params.severity}]: ${params.description}`,
        sourceContext: params.sourceContext,
        suggestedRemediation: params.suggestedRemediation,
        timestamp,
      };
    }

    // 2. Semantic Ambiguity Routing
    if (params.isAmbiguous) {
      if (params.severity === 'CRITICAL' || params.severity === 'MAJOR') {
        return {
          action: 'HUMAN_HANDOFF',
          severity: params.severity,
          ruleId: params.ruleId,
          description: `Critical Ambiguity: ${params.description}. Escalated to human editorial review.`,
          sourceContext: params.sourceContext,
          suggestedRemediation: params.suggestedRemediation,
          timestamp,
        };
      } else {
        return {
          action: 'LLM_HANDOFF',
          severity: params.severity,
          ruleId: params.ruleId,
          description: `Semantic Uncertainty: ${params.description}. Routing to independent semantic judge.`,
          sourceContext: params.sourceContext,
          suggestedRemediation: params.suggestedRemediation,
          timestamp,
        };
      }
    }

    // 3. Clean Valid Path
    return {
      action: 'AUTONOMOUS_ACCEPT',
      severity: 'INFO',
      ruleId: params.ruleId || 'VALIDATION_CLEAN',
      description: params.description || 'Validation passed successfully with zero invariant violations.',
      sourceContext: params.sourceContext,
      timestamp,
    };
  }
}
