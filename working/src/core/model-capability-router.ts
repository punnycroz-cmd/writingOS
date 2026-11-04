/**
 * Writing OS Core — Dynamic Model Capability & Cost Router (P16)
 * Dispatches authoring tasks across Deterministic Engines, Lightweight, Standard, and High-Reasoning models
 * based on multidimensional Risk x Complexity x Quality Requirement scoring.
 */

export interface TaskRoutingProfile {
  taskId: string;
  isDeterministicTransformation: boolean;
  riskScore: number;       // 1 (Low) to 5 (High)
  complexityScore: number; // 1 (Low) to 5 (High)
  qualityRequired: number; // 1 (Draft) to 5 (Executive/Publishable)
  hasUnresolvedAmbiguity: boolean;
}

export interface ModelRoutingDecision {
  selectedTier: 'DETERMINISTIC_ENGINE' | 'LIGHTWEIGHT_MODEL' | 'STANDARD_MODEL' | 'HIGH_REASONING_MODEL' | 'HUMAN_OPERATOR';
  compositeRoutingScore: number;
  estimatedCostUSD: number;
  routingRationale: string;
}

export class ModelCapabilityRouter {
  public static routeTask(profile: TaskRoutingProfile): ModelRoutingDecision {
    // 1. Unresolved critical ambiguity routes to human operator
    if (profile.hasUnresolvedAmbiguity && profile.riskScore >= 4) {
      return {
        selectedTier: 'HUMAN_OPERATOR',
        compositeRoutingScore: 125,
        estimatedCostUSD: 0.0,
        routingRationale: 'High-risk task contains unresolved ambiguity. Escalated to human operator.',
      };
    }

    // 2. Deterministic transformation uses zero-cost rule engine
    if (profile.isDeterministicTransformation) {
      return {
        selectedTier: 'DETERMINISTIC_ENGINE',
        compositeRoutingScore: 1,
        estimatedCostUSD: 0.0,
        routingRationale: 'Factual or structural format transformation handled deterministically with zero model cost.',
      };
    }

    // Calculate Composite Routing Score: Risk x Complexity x Quality
    const score = profile.riskScore * profile.complexityScore * profile.qualityRequired;

    if (score <= 20) {
      return {
        selectedTier: 'LIGHTWEIGHT_MODEL',
        compositeRoutingScore: score,
        estimatedCostUSD: 0.0005,
        routingRationale: `Low-complexity task (score: ${score}). Dispatched to Lightweight Model.`,
      };
    }

    if (score <= 60) {
      return {
        selectedTier: 'STANDARD_MODEL',
        compositeRoutingScore: score,
        estimatedCostUSD: 0.0030,
        routingRationale: `Standard authoring task (score: ${score}). Dispatched to Standard Model.`,
      };
    }

    return {
      selectedTier: 'HIGH_REASONING_MODEL',
      compositeRoutingScore: score,
      estimatedCostUSD: 0.0090,
      routingRationale: `High-risk/High-complexity task (score: ${score}). Dispatched to High-Reasoning Model.`,
    };
  }
}
