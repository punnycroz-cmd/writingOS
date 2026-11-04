import { describe, expect, test } from 'bun:test';
import { ContextualFilterVerbAnalyzer, VoicePolisher } from '../../src/runtime/voice-polisher';

describe('Writing OS — Contextual Filter Verb & Somatic Grounding Upgrade Suite', () => {

  describe('1. Somatic Physical Grounding Protection (Anti-Anthropomorphism)', () => {
    test('Protects somatic sensations anchored directly in physiology (e.g. tightness behind sternum)', () => {
      const input = 'Cole felt the familiar tightness behind his sternum, calculating the fatal funnel.';
      const report = ContextualFilterVerbAnalyzer.analyze(input);

      expect(report.totalFilterVerbs).toBeGreaterThanOrEqual(1);
      expect(report.somaticGroundingCount).toBe(1);

      const occurrence = report.occurrences.find(o => o.category === 'SOMATIC_PHYSICAL_GROUNDING');
      expect(occurrence).toBeDefined();
      expect(occurrence?.isProtected).toBe(true);
      expect(occurrence?.suggestedAction).toBe('KEEP');
      expect(report.score).toBe(1.0);

      // Verify VoicePolisher keeps text intact without mangling into forced anthropomorphism
      const polishReport = VoicePolisher.polish(input);
      expect(polishReport.polishedText).toContain('felt the familiar tightness behind his sternum');
      expect(polishReport.filterVerbAnalysis?.somaticGroundingCount).toBe(1);
    });

    test('Protects neural/synaptic somatic perception in technical POV (Elias)', () => {
      const input = 'Elias felt the synaptic latency spike as the pulse surged through the neural circuit.';
      const report = ContextualFilterVerbAnalyzer.analyze(input);

      expect(report.somaticGroundingCount).toBe(1);
      expect(report.score).toBe(1.0);
    });
  });

  describe('2. Epistemic Uncertainty Protection', () => {
    test('Preserves subjective suspicion and doubt (e.g. "felt as though", "thought he saw")', () => {
      const input = 'Ren felt as though someone was watching them from the darkness above the conduit.';
      const report = ContextualFilterVerbAnalyzer.analyze(input);

      expect(report.epistemicUncertaintyCount).toBe(1);
      const occurrence = report.occurrences.find(o => o.category === 'EPISTEMIC_UNCERTAINTY');
      expect(occurrence?.isProtected).toBe(true);
      expect(occurrence?.reason).toContain('uncertainty and doubt');
      expect(report.score).toBe(1.0);
    });
  });

  describe('3. Abstract Emotional Telling Flagging', () => {
    test('Emits non-destructive suggestion when filter verb accompanies abstract emotion label', () => {
      const input = 'He felt a deep sadness and overwhelming anxiety about the future.';
      const report = ContextualFilterVerbAnalyzer.analyze(input);

      expect(report.abstractTellingCount).toBeGreaterThanOrEqual(1);
      const occurrence = report.occurrences.find(o => o.category === 'ABSTRACT_EMOTIONAL_TELLING');
      expect(occurrence).toBeDefined();
      expect(occurrence?.suggestedAction).toBe('SUGGEST_PHYSICAL_DRAMATIZATION');
      expect(report.score).toBeLessThan(1.0);
    });
  });

  describe('4. Density-Aware Gating', () => {
    test('Allows isolated natural filter verbs while flagging high-density formulaic stacking', () => {
      // Case A: Isolated healthy usage
      const naturalPass = 'Cole adjusted his grip. He felt the cold iron of the rail. The corridor remained silent.';
      const repA = ContextualFilterVerbAnalyzer.analyze(naturalPass);
      expect(repA.isDensityAcceptable).toBe(true);

      // Case B: High density formulaic stacking
      const stackedPass = 'He saw the door. He heard a whisper. He felt the fear. He noticed the shadow. He watched the light.';
      const repB = ContextualFilterVerbAnalyzer.analyze(stackedPass);
      expect(repB.totalFilterVerbs).toBeGreaterThanOrEqual(4);
      expect(repB.score).toBeLessThan(0.70);
    });
  });
});
