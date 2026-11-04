import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { MultiTurnSessionManager } from '../../src/core/session-manager';
import { AuthoringBenchmarkEngine, BenchmarkTaskCase } from '../../src/benchmarks/authoring-benchmark-engine';
import { SurfaceInvarianceEngine } from '../../src/benchmarks/surface-invariance-engine';

describe('Writing OS P10 — General-Purpose Authoring Benchmark Suite', () => {

  const taskCorpus: BenchmarkTaskCase[] = [
    {
      taskId: 'task_fic_01',
      register: 'fiction',
      taskType: 'generation',
      prompt: 'Write scene where Elias investigates the vault door under high fatigue',
      sourceContext: { fatigue: 0.9, trust: 0.1 },
      authoritativeGroundTruth: { focus: 'hatch_lock', somatic: 'tightened_jaw' },
    },
    {
      taskId: 'task_acad_02',
      register: 'academic',
      taskType: 'synthesis',
      prompt: 'Synthesize the correlational findings on sleep deprivation and cognitive latency',
      sourceContext: { evidenceStrength: 'TENTATIVE' },
      authoritativeGroundTruth: { maxClaimStrength: 'TENTATIVE' },
    },
    {
      taskId: 'task_biz_03',
      register: 'business',
      taskType: 'rewrite',
      prompt: 'Draft an executive memo on Q3 financial performance for investors',
      sourceContext: { authorizedRevenue: '$14.2M', yoyGrowth: '24%' },
      authoritativeGroundTruth: { revenue: '$14.2M' },
    },
    {
      taskId: 'task_tech_04',
      register: 'technical',
      taskType: 'transformation',
      prompt: 'Simplify the load balancer architecture guide for frontend developers',
      sourceContext: { maxRateRps: 100 },
      authoritativeGroundTruth: { maxRate: 100 },
    },
    {
      taskId: 'task_legal_05',
      register: 'legal',
      taskType: 'revision',
      prompt: 'Audit the data disclosure clause for mandatory statutory compliance',
      sourceContext: { statutoryModality: 'MANDATORY' },
      authoritativeGroundTruth: { modality: 'shall' },
    },
    {
      taskId: 'task_gen_06',
      register: 'general',
      taskType: 'rewrite',
      prompt: 'Make this project status update clearer without expanding length',
      sourceContext: { wordCountLimit: 150 },
      authoritativeGroundTruth: { lengthPreserved: true },
    },
  ];

  describe('1. Comparative Benchmark: Baseline Strong LLM vs Writing OS', () => {
    test('Demonstrates superior integrity, higher pairwise preference win rate, and zero unsafe accepts', () => {
      const report = AuthoringBenchmarkEngine.runComparativeSuite(taskCorpus);

      expect(report.totalTasksEvaluated).toBe(6);

      // Integrity comparison
      expect(report.writingOsMetrics.integrityRate).toBe(1.00);
      expect(report.baselineMetrics.integrityRate).toBeLessThan(0.60);

      // Pairwise preference win rate
      expect(report.pairwisePreferenceWinRate.writingOsWinRatePct).toBeGreaterThanOrEqual(80.0);

      // Autonomy boundaries
      expect(report.writingOsMetrics.unsafeAutonomousAcceptanceRate).toBe(0.00);
      expect(report.baselineMetrics.unsafeAutonomousAcceptanceRate).toBeGreaterThan(0.20);
    });

    test('Correction Burden Reduction: Reduces user manual corrections by more than 50%', () => {
      const report = AuthoringBenchmarkEngine.runComparativeSuite(taskCorpus);

      expect(report.writingOsMetrics.averageCorrectionBurden).toBeLessThanOrEqual(1.0);
      expect(report.baselineMetrics.averageCorrectionBurden).toBeGreaterThanOrEqual(2.0);
    });
  });

  describe('2. Surface Invariance vs Semantic Sensitivity', () => {
    test('Surface Invariance: Paraphrasing identical facts preserves 100% semantic score', () => {
      const canonical = { entity: 'company_q3', property: 'revenue', value: '$14.2M' };
      const variants = [
        'The company generated $14.2M in revenue.',
        'Revenue totaled fourteen-point-two million dollars across all business units.',
        'The enterprise brought in 14.2 million in total Q3 receipts.',
      ];

      const results = SurfaceInvarianceEngine.evaluateSurfaceVariants(canonical, variants);

      expect(results.length).toBe(3);
      for (const res of results) {
        expect(res.isSurfaceVariantValid).toBe(true);
        expect(res.semanticPreservationScore).toBe(1.00);
        expect(res.detectedSemanticMutation).toBe(false);
      }
    });

    test('Semantic Sensitivity: Immediately flags unauthorized factual mutation ($14.2M -> $18M)', () => {
      const sensitivity = SurfaceInvarianceEngine.evaluateSemanticMutationSensitivity(
        '$14.2M',
        'Executive Memo: Total revenue for Q3 reached $18M reflecting massive growth.'
      );

      expect(sensitivity.detected).toBe(true);
      expect(sensitivity.reason).toContain('Semantic Mutation Detected');
    });
  });

  describe('3. 10-Turn Real-World Authoring Workflow Stress', () => {
    test('Maintains cumulative state integrity and active constraint preservation over 10 sequential turns', () => {
      const graph = new UniversalStateGraph();
      const session = new MultiTurnSessionManager('session_p10_10turn', graph);

      // Turn 1 to 10 interactive authoring progression
      session.processTurn('Draft initial research synthesis on climate metrics');
      session.processTurn('Make it shorter and concise');
      session.processTurn('Keep all temperature statistics');
      session.processTurn('Set tone to formal');
      session.processTurn('Rewrite section 2 for policy makers');
      session.processTurn('Highlight renewable transition figures');
      session.processTurn("No, that's not what I meant, keep all financial figures");
      session.processTurn('Ensure compliance with academic citation standards');
      session.processTurn('Summarize key recommendations');
      const turn10 = session.processTurn('Final editorial polish');

      expect(turn10.turnIndex).toBe(10);
      expect(turn10.taskVersion).toBe(11);
      expect(turn10.activeConstraints['preserve_numbers']).toBe('STRICT_PRESERVE');
      expect(turn10.activeConstraints['length_constraint']).toBe('CONCISE_CONDENSED');
    });
  });
});
