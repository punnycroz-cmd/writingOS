import { describe, expect, test } from 'bun:test';
import { ProductionRolloutManager } from '../../src/core/production-rollout-v1';

describe('Writing OS P31 — Controlled Production Rollout & Live Observability Suite', () => {

  describe('1. Progressive Canary Promotion Lifecycle', () => {
    test('Promotes traffic sequentially 5% -> 10% -> 25% -> 50% -> 100% under perfect SLO compliance', () => {
      const manager = new ProductionRolloutManager();
      expect(manager.getCurrentStage()).toBe('STAGE_1_5_PCT');

      const perfectSLOs = ProductionRolloutManager.evaluateSLOs({
        integrityBreaches: 0,
        staleCommits: 0,
        crossTenantLeaks: 0,
        ghostCommits: 0,
        unknownOutcomeMishandled: 0,
        crashRecoverySuccessRate: 1.0,
      });

      expect(perfectSLOs.allSLOsMet).toBe(true);

      // 5% -> 10%
      const step1 = manager.promoteCanaryStage(perfectSLOs);
      expect(step1.promoted).toBe(true);
      expect(step1.newStage).toBe('STAGE_2_10_PCT');

      // 10% -> 25%
      const step2 = manager.promoteCanaryStage(perfectSLOs);
      expect(step2.promoted).toBe(true);
      expect(step2.newStage).toBe('STAGE_3_25_PCT');

      // 25% -> 50%
      const step3 = manager.promoteCanaryStage(perfectSLOs);
      expect(step3.promoted).toBe(true);
      expect(step3.newStage).toBe('STAGE_4_50_PCT');

      // 50% -> 100%
      const step4 = manager.promoteCanaryStage(perfectSLOs);
      expect(step4.promoted).toBe(true);
      expect(step4.newStage).toBe('STAGE_5_100_PCT');
    });

    test('Strictly blocks canary promotion if any safety SLO is breached', () => {
      const manager = new ProductionRolloutManager();

      const flawedSLOs = ProductionRolloutManager.evaluateSLOs({
        integrityBreaches: 1, // Breach detected!
        staleCommits: 0,
        crossTenantLeaks: 0,
        ghostCommits: 0,
        unknownOutcomeMishandled: 0,
        crashRecoverySuccessRate: 1.0,
      });

      expect(flawedSLOs.allSLOsMet).toBe(false);

      const result = manager.promoteCanaryStage(flawedSLOs);
      expect(result.promoted).toBe(false);
      expect(result.newStage).toBe('STAGE_1_5_PCT');
      expect(result.reason).toContain('Promotion blocked');
    });
  });

  describe('2. Live Telemetry & Safe Autonomy Rate Calculation', () => {
    test('Accurately aggregates live telemetry, safe autonomy rate, first-pass acceptance, and latency percentiles', () => {
      const sampleLogs = [
        { isAutonomous: true, isAccepted: true, hasIntegrityViolation: false, requiredRepair: false, isControlledHandoff: false, latencyMs: 150, costUsd: 0.005 },
        { isAutonomous: true, isAccepted: true, hasIntegrityViolation: false, requiredRepair: true, isControlledHandoff: false, latencyMs: 320, costUsd: 0.008 },
        { isAutonomous: true, isAccepted: true, hasIntegrityViolation: false, requiredRepair: false, isControlledHandoff: false, latencyMs: 160, costUsd: 0.005 },
        { isAutonomous: false, isAccepted: true, hasIntegrityViolation: false, requiredRepair: false, isControlledHandoff: true, latencyMs: 210, costUsd: 0.004, failureMode: 'TASK_AMBIGUOUS' as const },
      ];

      const snapshot = ProductionRolloutManager.calculateTelemetryMetrics(sampleLogs);

      expect(snapshot.totalTasksProcessed).toBe(4);
      // 3/4 tasks were autonomous, accepted, and integrity-safe = 75%
      expect(snapshot.safeAutonomyRate).toBe(0.75);
      // 3/4 tasks accepted without repair = 75%
      expect(snapshot.userAcceptedWithoutManualRepairRate).toBe(0.75);
      // 1/4 tasks was controlled handoff = 25%
      expect(snapshot.controlledHandoffRate).toBe(0.25);

      expect(snapshot.latencyP50Ms).toBeGreaterThan(100);
      expect(snapshot.latencyP99Ms).toBeGreaterThanOrEqual(320);
      expect(snapshot.avgCostPerTaskUsd).toBeGreaterThan(0);
      expect(snapshot.failureModeDistribution['TASK_AMBIGUOUS']).toBe(1);
    });
  });

  describe('3. Production Drift Detection & Hierarchy of Change Integration', () => {
    test('Generates structured Evidence Cards when handoff or cost metrics exceed baselines', () => {
      const highHandoffSnapshot = {
        totalTasksProcessed: 100,
        safeAutonomyRate: 0.70,
        userAcceptedWithoutManualRepairRate: 0.65,
        controlledHandoffRate: 0.22, // 22% handoff rate exceeds 15% threshold
        latencyP50Ms: 200,
        latencyP90Ms: 400,
        latencyP95Ms: 450,
        latencyP99Ms: 600,
        avgCostPerTaskUsd: 0.015, // $0.015 exceeds $0.010 threshold
        failureModeDistribution: { TASK_AMBIGUOUS: 22 },
      };

      const alerts = ProductionRolloutManager.checkProductionDrift(highHandoffSnapshot, {
        maxAllowedControlledHandoffRate: 0.15,
        maxAllowedAvgCostUsd: 0.010,
      });

      expect(alerts.length).toBe(2);

      const handoffAlert = alerts.find(a => a.metricName === 'CONTROLLED_HANDOFF_RATE');
      expect(handoffAlert?.driftDetected).toBe(true);
      expect(handoffAlert?.generatedEvidenceCard.cardId).toContain('EVID_DRIFT_HANDOFF');
      expect(handoffAlert?.generatedEvidenceCard.recommendedAction).toContain('calibrating register pack');

      const costAlert = alerts.find(a => a.metricName === 'AVG_COST_PER_TASK_USD');
      expect(costAlert?.driftDetected).toBe(true);
      expect(costAlert?.generatedEvidenceCard.cardId).toContain('EVID_DRIFT_COST');
    });
  });
});
