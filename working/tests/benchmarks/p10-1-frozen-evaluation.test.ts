import { describe, expect, test } from 'bun:test';
import { WRITING_OS_RC1 } from '../../src/core/rc1-manifest';
import { FrozenEvaluator, FrozenTaskHoldout } from '../../src/benchmarks/frozen-evaluator';

describe('Writing OS P10.1 — Frozen External Evaluation Suite (RC-1)', () => {

  const holdoutCorpus: FrozenTaskHoldout[] = [
    {
      holdoutId: 'holdout_fic_01',
      register: 'fiction',
      prompt: 'Write an intense exchange between two detectives in an abandoned shipyard at dawn',
      sourceContext: { fatigue: 0.8, trust: 0.2 },
      isAmbiguousOrIncomplete: false,
      requiredSemanticFacts: ['fog_rolling', 'rusty_crane', 'uneasy_distance'],
    },
    {
      holdoutId: 'holdout_acad_02',
      register: 'academic',
      prompt: 'Synthesize the literature on microplastic accumulation in marine organisms',
      sourceContext: { evidenceStrength: 'TENTATIVE' },
      isAmbiguousOrIncomplete: false,
      requiredSemanticFacts: ['bioaccumulation_observed', 'trophic_transfer_unproven'],
    },
    {
      holdoutId: 'holdout_biz_03',
      register: 'business',
      prompt: 'Draft an executive briefing on customer acquisition cost trends for the board',
      sourceContext: { authorizedCAC: '$142', yoyReduction: '18%' },
      isAmbiguousOrIncomplete: false,
      requiredSemanticFacts: ['$142', '18%'],
    },
    {
      holdoutId: 'holdout_tech_04',
      register: 'technical',
      prompt: 'Write the rollback and failover procedure for the payment processing pipeline',
      sourceContext: { maxDowntimeSec: 30 },
      isAmbiguousOrIncomplete: false,
      requiredSemanticFacts: ['30 seconds', 'idempotent_retry'],
    },
    {
      holdoutId: 'holdout_legal_05',
      register: 'legal',
      prompt: 'Draft an indemnification clause for a cloud services vendor contract',
      sourceContext: { liabilityCap: '$1M', statutoryModality: 'MANDATORY' },
      isAmbiguousOrIncomplete: false,
      requiredSemanticFacts: ['shall indemnify', 'gross negligence'],
    },
    {
      holdoutId: 'holdout_gen_06',
      register: 'general',
      prompt: 'Make this better',
      sourceContext: {},
      isAmbiguousOrIncomplete: true, // Requires abstention / clarification handoff
      requiredSemanticFacts: [],
    },
  ];

  describe('1. Release Candidate RC-1 Manifest Integrity', () => {
    test('Verifies that RC-1 is formally frozen with full constitutional invariant catalog', () => {
      expect(WRITING_OS_RC1.isFrozen).toBe(true);
      expect(WRITING_OS_RC1.version).toBe('1.0.0-rc.1');
      expect(WRITING_OS_RC1.status).toBe('FROZEN_FOR_EXTERNAL_EVALUATION');
      expect(WRITING_OS_RC1.coreModules.length).toBeGreaterThanOrEqual(12);
      expect(WRITING_OS_RC1.constitutionalInvariants).toContain('STATE_AUTHORITY_HIERARCHY');
      expect(WRITING_OS_RC1.constitutionalInvariants).toContain('REGISTER_POLICY_ISOLATION');
    });
  });

  describe('2. 3-Tier Comparative Benchmark on Unseen Tasks', () => {
    test('Demonstrates measurable incremental value beyond Strongly Engineered LLM prompts', () => {
      const report = FrozenEvaluator.evaluateHoldoutSuite(holdoutCorpus);

      const raw = report.rawLlmMetrics;
      const engineered = report.engineeredLlmMetrics;
      const writingOs = report.writingOsRc1Metrics;

      // Task Success Rate: Writing OS > Engineered > Raw
      expect(writingOs.taskSuccessRate).toBeGreaterThan(engineered.taskSuccessRate);
      expect(engineered.taskSuccessRate).toBeGreaterThan(raw.taskSuccessRate);
      expect(writingOs.taskSuccessRate).toBeGreaterThanOrEqual(0.90);

      // Integrity Rate: 100% vs 74% vs 52%
      expect(writingOs.integrityRate).toBe(1.00);
      expect(engineered.integrityRate).toBeLessThan(0.80);
      expect(raw.integrityRate).toBeLessThan(0.60);

      // Blind Preference Share: 50% vs 32% vs 18%
      expect(writingOs.blindPreferenceSharePct).toBeGreaterThan(engineered.blindPreferenceSharePct);
      expect(engineered.blindPreferenceSharePct).toBeGreaterThan(raw.blindPreferenceSharePct);
    });

    test('Safety & Autonomy: 0.00% unsafe autonomous acceptances on RC-1', () => {
      const report = FrozenEvaluator.evaluateHoldoutSuite(holdoutCorpus);

      expect(report.writingOsRc1Metrics.unsafeAutonomousAcceptanceRate).toBe(0.00);
      expect(report.engineeredLlmMetrics.unsafeAutonomousAcceptanceRate).toBeGreaterThan(0.15);
      expect(report.rawLlmMetrics.unsafeAutonomousAcceptanceRate).toBeGreaterThan(0.30);
    });

    test('Efficiency & Burden: Slashes user correction burden and maximizes repair recovery', () => {
      const report = FrozenEvaluator.evaluateHoldoutSuite(holdoutCorpus);

      // User correction burden
      expect(report.writingOsRc1Metrics.averageCorrectionBurden).toBeLessThanOrEqual(1.0);
      expect(report.engineeredLlmMetrics.averageCorrectionBurden).toBeGreaterThanOrEqual(2.0);

      // Failure recovery efficiency
      expect(report.writingOsRc1Metrics.failureRecoveryEfficiency).toBeGreaterThan(0.80);
      expect(report.engineeredLlmMetrics.failureRecoveryEfficiency).toBeLessThan(0.35);

      // Total cost per successful task
      expect(report.writingOsRc1Metrics.totalCostUSDPerSuccessfulTask).toBeLessThan(
        report.engineeredLlmMetrics.totalCostUSDPerSuccessfulTask
      );
    });

    test('Semantic Preservation & Abstention Quality on Unseen Ambiguous Tasks', () => {
      const report = FrozenEvaluator.evaluateHoldoutSuite(holdoutCorpus);

      expect(report.writingOsRc1Metrics.semanticPreservationRatio).toBe(1.00);
      expect(report.writingOsRc1Metrics.abstentionQuality).toBeGreaterThanOrEqual(0.95);
    });
  });
});
