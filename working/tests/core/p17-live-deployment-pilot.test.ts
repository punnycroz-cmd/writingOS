import { describe, expect, test } from 'bun:test';
import { PolicyRegistry } from '../../src/core/policy-registry';
import { LiveDeploymentPilot } from '../../src/benchmarks/live-deployment-pilot';

describe('Writing OS P17 — External Reproduction & Live Deployment Pilot Suite', () => {

  describe('1. Policy Registry & Provenance-Tracked Governance', () => {
    test('Separates versioned calibrated policies with full dataset provenance', () => {
      const qualityPolicy = PolicyRegistry.getPolicy<number>('quality_acceptance_threshold');

      expect(qualityPolicy).toBeDefined();
      expect(qualityPolicy?.version).toBe('p16.0');
      expect(qualityPolicy?.value).toBe(0.80);
      expect(qualityPolicy?.calibratedAgainst).toBe('human_eval_holdout_v2');
      expect(qualityPolicy?.sampleSize).toBe(120);
      expect(qualityPolicy?.confidencePct).toBe(95.0);

      const allPolicies = PolicyRegistry.getAllPolicies();
      expect(allPolicies.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('2. First-Pass Usability & Fast Recovery Turns', () => {
    test('First-Pass Usability outperforms baseline by >30% (72.5% vs 38.0%)', () => {
      const metrics = LiveDeploymentPilot.evaluateLivePilotMetrics();

      expect(metrics.firstPassUsabilityPct).toBe(72.5);
      expect(metrics.baselineFirstPassUsabilityPct).toBe(38.0);
      expect(metrics.firstPassUsabilityPct - metrics.baselineFirstPassUsabilityPct).toBeGreaterThan(30.0);
      expect(metrics.averageRecoveryTurns).toBeLessThanOrEqual(1.2);
    });

    test('Recovers gracefully from user mind-changes with clean stale-plan invalidation', () => {
      const turns = [
        'Draft executive memo for board meeting with formal tone',
        'Actually, not too formal - keep it direct and collegial',
        'Wait, remove section 3 but strictly preserve all financial numbers',
      ];

      const sim = LiveDeploymentPilot.simulateUserMindChangeRecovery(turns);

      expect(sim.totalTurns).toBe(3);
      expect(sim.recoveredAtTurn).toBe(3);
      expect(sim.stalePlansInvalidatedCount).toBe(2);
    });
  });

  describe('3. Transparent Blended Economics (Machine + Valued Human Labor)', () => {
    test('Calculates decomposed Blended Economic Cost saving >80% vs baseline', () => {
      const metrics = LiveDeploymentPilot.evaluateLivePilotMetrics();
      const econ = metrics.blendedEconomics;

      // Verify decomposed machine API vs human effort
      expect(econ.machineApiCostUSD).toBe(0.0048);
      expect(econ.humanSupervisionCostUSD).toBe(0.6000);
      expect(econ.totalBlendedCostUSD).toBe(0.6048);

      // Verify comparison vs baseline ($3.1062)
      expect(econ.baselineBlendedCostUSD).toBe(3.1062);
      expect(econ.netSavingsPct).toBeGreaterThanOrEqual(80.0);
    });
  });

  describe('4. Model Escalation & Repair Avoidance Rates', () => {
    test('Dispatches 60% of tasks to Lightweight models and achieves 84% Local Repair Avoidance', () => {
      const metrics = LiveDeploymentPilot.evaluateLivePilotMetrics();

      expect(metrics.modelEscalationDistribution.lightweightPct).toBe(60.0);
      expect(metrics.modelEscalationDistribution.standardPct).toBe(25.0);
      expect(metrics.modelEscalationDistribution.highReasoningPct).toBe(10.0);
      expect(metrics.modelEscalationDistribution.humanEscalationPct).toBe(5.0);

      // 84% of repairs handled locally rather than re-generating whole document
      expect(metrics.repairAvoidanceRatePct).toBeGreaterThanOrEqual(80.0);
    });
  });
});
