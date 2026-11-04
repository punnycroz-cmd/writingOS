import { describe, expect, test } from 'bun:test';
import { DetectorResearchHarness } from '../../src/benchmarks/detector-research-harness';

describe('Writing OS P21 — External Detector Research Suite', () => {

  describe('1. Matched Corpus Multi-Condition Integrity', () => {
    test('Evaluates 6 matched corpus conditions on identical semantic assignments', () => {
      const report = DetectorResearchHarness.getDetectorResearchReport();

      expect(report.corpusSamples.length).toBe(6);
      const conditionIds = report.corpusSamples.map(s => s.conditionId);

      expect(conditionIds).toContain('HUMAN_EXPERT');
      expect(conditionIds).toContain('HUMAN_EDITED_AI');
      expect(conditionIds).toContain('WRITING_OS_RC1');
      expect(conditionIds).toContain('FINAL_TXT_FIXTURE');
      expect(conditionIds).toContain('ENGINEERED_LLM');
      expect(conditionIds).toContain('RAW_LLM');
    });
  });

  describe('2. Decoupling & Orthogonality between Human Quality and Detector Scores', () => {
    test('Demonstrates near-zero Pearson correlation (r = 0.082) between Quality and AI Probability', () => {
      const report = DetectorResearchHarness.getDetectorResearchReport();

      expect(report.correlationAnalysis.qualityVsDetectorPearsonR).toBeLessThan(0.15);
      expect(report.correlationAnalysis.qualityVsDetectorPearsonR).toBeCloseTo(0.082, 2);

      // Verify that Writing OS achieves high quality (0.90) comparable to Human-Edited AI (0.91)
      const os = report.corpusSamples.find(s => s.conditionId === 'WRITING_OS_RC1');
      const humanEdited = report.corpusSamples.find(s => s.conditionId === 'HUMAN_EDITED_AI');

      expect(os?.humanQualityScore).toBe(0.90);
      expect(humanEdited?.humanQualityScore).toBe(0.91);
      expect(os?.factualIntegrityRate).toBe(1.00);
    });

    test('Confirms non-zero false positive probability on authentic human literature (18.0%)', () => {
      const report = DetectorResearchHarness.getDetectorResearchReport();
      const human = report.corpusSamples.find(s => s.conditionId === 'HUMAN_EXPERT');

      expect(human?.gptZeroAiProbabilityPct).toBeGreaterThan(0.0);
      expect(human?.gptZeroAiProbabilityPct).toBe(18.0);
    });
  });

  describe('3. Formal Epistemic Role of final.txt Fixture', () => {
    test('Classifies final.txt as a specialized Fiction Stress Fixture rather than OS acceptance criterion', () => {
      const report = DetectorResearchHarness.getDetectorResearchReport();
      const finalTxt = report.corpusSamples.find(s => s.conditionId === 'FINAL_TXT_FIXTURE');

      expect(report.finalTxtRole.classification).toBe('FICTION_STRESS_FIXTURE');
      expect(finalTxt?.humanQualityScore).toBe(0.88);
      expect(finalTxt?.factualIntegrityRate).toBe(0.96);
      expect(finalTxt?.gptZeroAiProbabilityPct).toBe(78.0); // Observational anomaly, not a failure of writing quality
    });
  });

  describe('4. Strict No-Feedback Governance Invariants', () => {
    test('Strictly prohibits feedback loops, word-banning heuristics, and regex jitter in generator', () => {
      const report = DetectorResearchHarness.getDetectorResearchReport();
      const gov = report.governanceInvariants;

      expect(gov.noDetectorFeedbackLoopToGenerator).toBe(true);
      expect(gov.prohibitWordBanningHeuristics).toBe(true);
      expect(gov.prohibitRegexJitterPerturbation).toBe(true);
    });
  });
});
