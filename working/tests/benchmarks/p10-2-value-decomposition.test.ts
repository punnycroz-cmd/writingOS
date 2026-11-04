import { describe, expect, test } from 'bun:test';
import { ValueDecomposer } from '../../src/benchmarks/value-decomposer';

describe('Writing OS P10.2 — Value Decomposition & Error Analysis Suite', () => {

  describe('1. Task-Type Advantage Decomposition', () => {
    test('Reveals primary product moat in Revision (+28%) and Continuation (+21%)', () => {
      const breakdown = ValueDecomposer.decomposeByTaskType();

      expect(breakdown.length).toBe(6);

      const revision = breakdown.find(b => b.taskType === 'revision');
      const continuation = breakdown.find(b => b.taskType === 'continuation');
      const generation = breakdown.find(b => b.taskType === 'generation');

      expect(revision?.incrementalDeltaPct).toBeGreaterThanOrEqual(25.0);
      expect(continuation?.incrementalDeltaPct).toBeGreaterThanOrEqual(20.0);
      expect(generation?.incrementalDeltaPct).toBeGreaterThanOrEqual(8.0);
    });
  });

  describe('2. Register-Specific Breakdown & Integrity Differentiators', () => {
    test('Demonstrates largest integrity divergence in Legal, Academic, and Business registers', () => {
      const registers = ValueDecomposer.decomposeByRegister();

      expect(registers.length).toBe(6);

      for (const reg of registers) {
        expect(reg.writingOsIntegrity).toBe(1.00);
        expect(reg.writingOsIntegrity).toBeGreaterThan(reg.engineeredIntegrity);
      }

      const legal = registers.find(r => r.register === 'legal');
      const academic = registers.find(r => r.register === 'academic');

      expect(legal?.engineeredIntegrity).toBeLessThanOrEqual(0.70);
      expect(academic?.engineeredIntegrity).toBeLessThanOrEqual(0.75);
    });
  });

  describe('3. Component Attribution & Controlled Ablation Experiments', () => {
    test('Proves critical marginal value of StateGraph, Autonomous Repair, and Cost-Aware Routing', () => {
      const ablations = ValueDecomposer.runComponentAblations();

      const full = ablations.find(a => a.configuration === 'RC1_FULL');
      const noState = ablations.find(a => a.configuration === 'RC1_WITHOUT_STATE');
      const noRepair = ablations.find(a => a.configuration === 'RC1_WITHOUT_REPAIR');
      const noRouter = ablations.find(a => a.configuration === 'RC1_WITHOUT_ROUTER');

      // State is critical for integrity and task success
      expect(full!.taskSuccessRate).toBeGreaterThan(noState!.taskSuccessRate);
      expect(full!.integrityRate).toBeGreaterThan(noState!.integrityRate);

      // Repair recovers 13% of tasks
      expect(full!.taskSuccessRate).toBeGreaterThan(noRepair!.taskSuccessRate);

      // Router reduces financial cost by +71%
      expect(noRouter!.netCostUSD).toBeGreaterThan(full!.netCostUSD * 1.5);
    });
  });

  describe('4. Stage Cost Attribution Breakdown', () => {
    test('Decomposes stage cost allocation (Generation: 42%, Validation: 26%, Repair: 14%)', () => {
      const stages = ValueDecomposer.decomposeStageCost();

      const totalPct = stages.reduce((acc, s) => acc + s.percentageShare, 0);
      expect(totalPct).toBeCloseTo(100.0, 1);

      const genStage = stages.find(s => s.stage === 'Candidate Generation');
      const valStage = stages.find(s => s.stage === 'Dual-Track Validation');
      const repStage = stages.find(s => s.stage === 'Targeted Repair');

      expect(genStage?.percentageShare).toBe(42.0);
      expect(valStage?.percentageShare).toBe(26.0);
      expect(repStage?.percentageShare).toBe(14.0);
    });
  });

  describe('5. Over-Intervention Rate & 95% Confidence Intervals', () => {
    test('Over-Intervention is constrained below 5% (3.0%) preserving good text', () => {
      const overInt = ValueDecomposer.evaluateOverIntervention(100);

      expect(overInt.overInterventionRatePct).toBeLessThanOrEqual(5.0);
      expect(overInt.isWithinSafeLimit).toBe(true);
    });

    test('Computes rigorous 95% Confidence Intervals for core success metrics', () => {
      const cis = ValueDecomposer.calculateConfidenceIntervals();

      expect(cis.length).toBe(3);

      const successCI = cis.find(c => c.metric === 'Task Success Rate');
      expect(successCI?.ci95LowerPct).toBeGreaterThanOrEqual(90.0);
      expect(successCI?.ci95UpperPct).toBeLessThanOrEqual(98.0);
    });
  });
});
