/**
 * Writing OS Core — Policy Registry Layer (P17)
 * Formalizes the separation between immutable Constitutional Invariants and versioned Calibrated Policies.
 * Prevents runtime policy drift by maintaining provenance, calibration datasets, and effective dates.
 */

export interface PolicyRecord<T = unknown> {
  policyId: string;
  version: string;
  value: T;
  calibratedAgainst: string;
  sampleSize: number;
  confidencePct: number;
  effectiveDate: number;
  supersedes?: string;
  description: string;
}

export class PolicyRegistry {
  private static policies: Map<string, PolicyRecord> = new Map();

  static {
    // Seed default calibrated policies from Phase P16
    this.registerPolicy({
      policyId: 'quality_acceptance_threshold',
      version: 'p16.0',
      value: 0.80,
      calibratedAgainst: 'human_eval_holdout_v2',
      sampleSize: 120,
      confidencePct: 95.0,
      effectiveDate: Date.now(),
      description: 'Minimum quality score required for autonomous candidate acceptance.',
    });

    this.registerPolicy({
      policyId: 'max_targeted_repair_attempts',
      version: 'p16.0',
      value: 2,
      calibratedAgainst: 'repair_oscillation_bench_v1',
      sampleSize: 85,
      confidencePct: 98.0,
      effectiveDate: Date.now(),
      description: 'Maximum minor repair iterations permitted before escalating to Safe Handoff.',
    });

    this.registerPolicy({
      policyId: 'handoff_uncertainty_threshold',
      version: 'p16.0',
      value: 0.25,
      calibratedAgainst: 'open_world_ambiguity_matrix',
      sampleSize: 60,
      confidencePct: 92.0,
      effectiveDate: Date.now(),
      description: 'Ambiguity threshold triggering proactive Safe Handoff inquiry.',
    });
  }

  public static registerPolicy<T>(policy: PolicyRecord<T>): void {
    this.policies.set(policy.policyId, policy as PolicyRecord);
  }

  public static getPolicy<T>(policyId: string): PolicyRecord<T> | undefined {
    return this.policies.get(policyId) as PolicyRecord<T> | undefined;
  }

  public static getAllPolicies(): PolicyRecord[] {
    return Array.from(this.policies.values());
  }
}
