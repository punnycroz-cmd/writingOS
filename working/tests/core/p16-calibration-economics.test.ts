import { describe, expect, test } from 'bun:test';
import { ThresholdCalibrator } from '../../src/benchmarks/threshold-calibrator';
import { RepairPolicyEscalator } from '../../src/core/repair-policy-escalator';
import { ModelCapabilityRouter } from '../../src/core/model-capability-router';
import { WorkflowEconomics } from '../../src/benchmarks/workflow-economics';

describe('Writing OS P16 — Calibration & Economic Optimization Suite', () => {

  describe('1. Empirical Quality & Handoff Threshold Calibration', () => {
    test('Calibrates quality acceptance threshold at 0.80 with >=90% human approval', () => {
      const sampleData = [
        { systemQualityScore: 0.92, humanApproved: true },
        { systemQualityScore: 0.88, humanApproved: true },
        { systemQualityScore: 0.82, humanApproved: true },
        { systemQualityScore: 0.80, humanApproved: true },
        { systemQualityScore: 0.74, humanApproved: false },
        { systemQualityScore: 0.65, humanApproved: false },
      ];

      const cal = ThresholdCalibrator.calibrateQualityThreshold(sampleData);
      expect(cal.recommendedAcceptThreshold).toBe(0.80);
      expect(cal.humanApprovalRateAtThresholdPct).toBeGreaterThanOrEqual(90.0);
    });

    test('Handoff Boundaries: Eliminates Under-Handoff (0.0%) while bounding Over-Handoff (<=5.0%)', () => {
      const decisionData = [
        { systemDecision: 'AUTONOMOUS_ACCEPT' as const, humanInterventionActuallyNeeded: false },
        { systemDecision: 'AUTONOMOUS_ACCEPT' as const, humanInterventionActuallyNeeded: false },
        { systemDecision: 'AUTONOMOUS_REPAIR' as const, humanInterventionActuallyNeeded: false },
        { systemDecision: 'SAFE_HANDOFF' as const, humanInterventionActuallyNeeded: true },
        { systemDecision: 'SAFE_HANDOFF' as const, humanInterventionActuallyNeeded: true },
      ];

      const boundaryEval = ThresholdCalibrator.evaluateHandoffBoundaries(decisionData);
      expect(boundaryEval.underHandoffRatePct).toBe(0.0);
      expect(boundaryEval.overHandoffRatePct).toBeLessThanOrEqual(5.0);
      expect(boundaryEval.isOptimal).toBe(true);
      expect(boundaryEval.handoffAccuracyPct).toBe(100.0);
    });
  });

  describe('2. Tiered Repair Policy Escalation', () => {
    test('Critical state contradiction immediately halts with ABORT_CRITICAL', () => {
      const decision = RepairPolicyEscalator.evaluateRepairAction('CRITICAL', 0);
      expect(decision.action).toBe('ABORT_CRITICAL');
      expect(decision.allowAutonomousRepair).toBe(false);
    });

    test('Major failure halts after 1 attempt with SAFE_HANDOFF_ESCALATE', () => {
      const decision = RepairPolicyEscalator.evaluateRepairAction('MAJOR', 1);
      expect(decision.action).toBe('SAFE_HANDOFF_ESCALATE');
      expect(decision.allowAutonomousRepair).toBe(false);
    });

    test('Minor failure permits autonomous targeted repair', () => {
      const decision = RepairPolicyEscalator.evaluateRepairAction('MINOR', 0);
      expect(decision.action).toBe('AUTONOMOUS_TARGETED_REPAIR');
      expect(decision.allowAutonomousRepair).toBe(true);
    });
  });

  describe('3. Dynamic Model Capability & Cost Router', () => {
    test('Routes format conversion to zero-cost Deterministic Engine', () => {
      const route = ModelCapabilityRouter.routeTask({
        taskId: 'fmt_01',
        isDeterministicTransformation: true,
        riskScore: 1,
        complexityScore: 1,
        qualityRequired: 1,
        hasUnresolvedAmbiguity: false,
      });

      expect(route.selectedTier).toBe('DETERMINISTIC_ENGINE');
      expect(route.estimatedCostUSD).toBe(0.0);
    });

    test('Routes standard authoring task to Standard Model ($0.0030)', () => {
      const route = ModelCapabilityRouter.routeTask({
        taskId: 'auth_01',
        isDeterministicTransformation: false,
        riskScore: 2,
        complexityScore: 3,
        qualityRequired: 4,
        hasUnresolvedAmbiguity: false,
      });

      expect(route.selectedTier).toBe('STANDARD_MODEL');
      expect(route.compositeRoutingScore).toBe(24);
      expect(route.estimatedCostUSD).toBe(0.0030);
    });

    test('Routes high-risk task to High-Reasoning Model ($0.0090)', () => {
      const route = ModelCapabilityRouter.routeTask({
        taskId: 'legal_01',
        isDeterministicTransformation: false,
        riskScore: 5,
        complexityScore: 4,
        qualityRequired: 5,
        hasUnresolvedAmbiguity: false,
      });

      expect(route.selectedTier).toBe('HIGH_REASONING_MODEL');
      expect(route.compositeRoutingScore).toBe(100);
      expect(route.estimatedCostUSD).toBe(0.0090);
    });

    test('Routes unresolved high-risk task to Human Operator', () => {
      const route = ModelCapabilityRouter.routeTask({
        taskId: 'ambig_01',
        isDeterministicTransformation: false,
        riskScore: 5,
        complexityScore: 4,
        qualityRequired: 5,
        hasUnresolvedAmbiguity: true,
      });

      expect(route.selectedTier).toBe('HUMAN_OPERATOR');
    });
  });

  describe('4. End-to-End Workflow Economics & Supervision Burden', () => {
    test('Writing OS saves >75% of Total Economic Cost / Successful Workflow vs Baseline LLM', () => {
      const econ = WorkflowEconomics.compareSystemEconomics();

      // Verify human supervision drop (6.2m -> 1.2m)
      expect(econ.baselineLlm.humanSupervisionMinutes).toBe(6.2);
      expect(econ.writingOsRc1.humanSupervisionMinutes).toBe(1.2);

      // Verify total economic cost comparison ($3.1062 vs $0.6048)
      expect(econ.baselineLlm.totalEconomicCostUSD).toBe(3.1062);
      expect(econ.writingOsRc1.totalEconomicCostUSD).toBe(0.6048);

      // Verify net savings > 75%
      expect(econ.economicSavingsPct).toBeGreaterThanOrEqual(75.0);
      expect(econ.netSavingsPerTaskUSD).toBeGreaterThanOrEqual(2.50);
    });
  });
});
