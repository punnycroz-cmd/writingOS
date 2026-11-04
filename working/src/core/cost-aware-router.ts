/**
 * Writing OS Core — Cost-Aware Routing & Escalation Policy (P8.1)
 * Optimizes computational cost and latency by prioritizing cheap deterministic checks
 * before invoking expensive semantic LLM inference or human escalation.
 */

export type ExecutionTier = 'DETERMINISTIC_FAST_PATH' | 'SEMANTIC_LLM_PATH' | 'HUMAN_ESCALATION_PATH';

export interface RoutingDecision {
  selectedTier: ExecutionTier;
  estimatedCostUSD: number;
  reason: string;
  isHighRisk: boolean;
}

export class CostAwareRouter {
  public static routeTask(params: {
    isProvableDeterministically: boolean;
    hasAmbiguity: boolean;
    hasConstitutionalViolation: boolean;
    repairAttemptsCount: number;
  }): RoutingDecision {
    const { isProvableDeterministically, hasAmbiguity, hasConstitutionalViolation, repairAttemptsCount } = params;

    // 1. High Risk or Unresolved Oscillations -> Human Escalation
    if (hasConstitutionalViolation || repairAttemptsCount >= 3) {
      return {
        selectedTier: 'HUMAN_ESCALATION_PATH',
        estimatedCostUSD: 0.0,
        reason: 'High risk constitutional violation or exhausted repair budget requires human escalation.',
        isHighRisk: true,
      };
    }

    // 2. Cheap Deterministic Fast Path
    if (isProvableDeterministically && !hasAmbiguity) {
      return {
        selectedTier: 'DETERMINISTIC_FAST_PATH',
        estimatedCostUSD: 0.00001,
        reason: 'Task is provable via deterministic rule/state evaluation without LLM invocation.',
        isHighRisk: false,
      };
    }

    // 3. Standard Semantic LLM Inference Path
    return {
      selectedTier: 'SEMANTIC_LLM_PATH',
      estimatedCostUSD: 0.0045,
      reason: 'Task requires generative synthesis and semantic quality evaluation.',
      isHighRisk: false,
    };
  }
}
