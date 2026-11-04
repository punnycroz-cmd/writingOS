import { describe, expect, test } from 'bun:test';
import { BibleConstitutionConsistencyEngine } from '../../src/core/bible-constitution-consistency';

describe('Writing OS P28 — Bible-Constitution Consistency & Epistemic Scope Suite', () => {

  describe('1. Bidirectional Consistency Completeness (Bible <-> Constitution)', () => {
    test('Verifies all 10 Bible Parts are mapped to Constitution and Evidence without contradiction', () => {
      const traces = BibleConstitutionConsistencyEngine.BIDIRECTIONAL_TRACES;

      expect(traces.length).toBe(10);

      traces.forEach(trace => {
        expect(trace.mappedConstitutionArticles.length).toBeGreaterThanOrEqual(1);
        expect(trace.operationalMechanism.length).toBeGreaterThan(10);
        expect(trace.evidencePhaseIds.length).toBeGreaterThanOrEqual(2);
        expect(trace.nonContradictionVerified).toBe(true);
      });
    });
  });

  describe('2. v4 Preservation Matrix Audit', () => {
    test('Verifies that all 7 foundational v4 concepts are preserved, promoted, or superseded to negative ledger', () => {
      const items = BibleConstitutionConsistencyEngine.V4_PRESERVATION_MATRIX;

      expect(items.length).toBe(7);

      const naturalness = items.find(i => i.conceptId === 'V4_001_NATURALNESS');
      expect(naturalness?.v5Status).toBe('RETAINED_AND_REFINED');
      expect(naturalness?.v5DestinationPart).toBe(4);

      const causality = items.find(i => i.conceptId === 'V4_003_PSYCHOLOGICAL_CAUSALITY');
      expect(causality?.v5Status).toBe('PROMOTED');
      expect(causality?.v5DestinationPart).toBe(5);

      const bannedWords = items.find(i => i.conceptId === 'V4_006_BANNED_WORDS');
      expect(bannedWords?.v5Status).toBe('SUPERSEDED_TO_NEGATIVE_LEDGER');
      expect(bannedWords?.v5DestinationPart).toBe(10);
    });
  });

  describe('3. Anti-Overclaim & Epistemic Scope Audit', () => {
    test('Rejects ungrounded marketing claims and validates disciplined empirical formulations', () => {
      // 1. Unbounded claim -> FAIL
      const badAudit = BibleConstitutionConsistencyEngine.executeAntiOverclaimAudit(
        'Writing OS guarantees zero hallucinations and human-level perfection in all tasks.'
      );
      expect(badAudit.passed).toBe(false);
      expect(badAudit.violatingTermsFound).toContain('guarantees zero hallucinations');
      expect(badAudit.violatingTermsFound).toContain('human-level perfection');

      // 2. Disciplined claim -> PASS
      const goodAudit = BibleConstitutionConsistencyEngine.executeAntiOverclaimAudit(
        'Writing OS demonstrated 0% safety-critical state violations across evaluated test suites.'
      );
      expect(goodAudit.passed).toBe(true);
      expect(goodAudit.violatingTermsFound.length).toBe(0);
    });
  });

  describe('4. Implementation Leakage Audit', () => {
    test('Verifies that ephemeral constants are not masquerading as universal writing laws', () => {
      const cleanContent = `
        Part I defines the 8 immutable Constitutional Invariants.
        Part IX explains that operational policies (like qualityThreshold and retry limits)
        are calibrated dynamically in the Policy Registry.
      `;

      const audit = BibleConstitutionConsistencyEngine.executeImplementationLeakageAudit(cleanContent);
      expect(audit.leakageDetected).toBe(false);
      expect(audit.leakedConstants.length).toBe(0);
    });
  });

  describe('5. Known Limitations Ledger Completeness', () => {
    test('Confirms all 3 known operational boundaries are documented with current mitigations', () => {
      const limits = BibleConstitutionConsistencyEngine.KNOWN_LIMITATIONS;

      expect(limits.length).toBe(3);

      const limitIds = limits.map(l => l.limitationId);
      expect(limitIds).toContain('LIMIT_001_LONG_HORIZON_COREF');
      expect(limitIds).toContain('LIMIT_002_DOMAIN_CALIBRATION_DRIFT');
      expect(limitIds).toContain('LIMIT_003_POETIC_AMBIGUITY');

      limits.forEach(limit => {
        expect(limit.description.length).toBeGreaterThan(20);
        expect(limit.currentMitigation.length).toBeGreaterThan(15);
        expect(limit.futureResearchDirection.length).toBeGreaterThan(15);
      });
    });
  });
});
