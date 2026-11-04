import { describe, expect, test } from 'bun:test';
import { WritingBibleV5 } from '../../src/core/writing-bible-v5';

describe('Writing OS P27 — Writing Bible v5 Publication & Schema Suite', () => {

  describe('1. 10-Part Master Schema Completeness & Constitutional Alignment', () => {
    test('Verifies that Writing Bible v5 contains all 10 parts and maps to all 8 Constitutional Articles', () => {
      const validation = WritingBibleV5.validateBibleSchemaConsistency();

      expect(validation.isConsistent).toBe(true);
      expect(validation.totalParts).toBe(10);
      expect(validation.unmappedArticles.length).toBe(0);
      expect(validation.retainedV4ConceptsCount).toBe(6);
    });
  });

  describe('2. v4 to v5 Translation Matrix Fidelity', () => {
    test('Verifies that all foundational v4 literary concepts are retained or promoted in v5', () => {
      const matrix = WritingBibleV5.V4_TRANSLATION_MATRIX;

      const concepts = matrix.map(m => m.v4Concept);
      expect(concepts).toContain('Naturalness & Anti-AI Humanization');
      expect(concepts).toContain('Rule Hierarchy & Deontic Priority');
      expect(concepts).toContain('PASS / FAIL / DEFERRED Claim Triaging');
      expect(concepts).toContain('Psychological Causality in Fiction');
      expect(concepts).toContain('Surface Banned Word Lists & Simile Quotas');

      // Check demotion of superficial word lists to Part 10 Negative Ledger
      const bannedWordsEntry = matrix.find(m => m.v4Concept.includes('Banned Word Lists'));
      expect(bannedWordsEntry?.v5LocationPart).toBe(10);
      expect(bannedWordsEntry?.status).toBe('REFINED');
    });
  });

  describe('3. PASS / FAIL / DEFERRED Claim Triage Architecture', () => {
    test('Accurately routes verified, contradicted, and unrevealed claims', () => {
      const stateContext = {
        knownCanon: ['Captain Elias', 'Sector 7'],
        contradictedCanon: ['Elias died in 2042', 'Sector 7 is unpopulated'],
      };

      // 1. Verified claim -> PASS
      expect(WritingBibleV5.evaluateClaimTriage('Captain Elias observed the readout.', stateContext)).toBe('PASS');

      // 2. Contradicted claim -> FAIL
      expect(WritingBibleV5.evaluateClaimTriage('The report confirmed Elias died in 2042.', stateContext)).toBe('FAIL');

      // 3. Speculative / unrevealed claim -> DEFERRED
      expect(WritingBibleV5.evaluateClaimTriage('The mysterious signal came from an uncharted moon.', stateContext)).toBe('DEFERRED');
    });
  });

  describe('4. Negative Evidence Ledger & Fixture Non-Authority in Part X', () => {
    test('Confirms Part X governs empirical provenance and negative learnings', () => {
      const part10 = WritingBibleV5.PARTS.find(p => p.partNumber === 10);

      expect(part10).toBeDefined();
      expect(part10?.summary).toContain('Negative Evidence Ledger');
      expect(part10?.summary).toContain('final.txt fixture governance');
      expect(part10?.primaryEvidencePhases).toContain('P21');
      expect(part10?.primaryEvidencePhases).toContain('P22');
      expect(part10?.primaryEvidencePhases).toContain('P26');
    });
  });
});
