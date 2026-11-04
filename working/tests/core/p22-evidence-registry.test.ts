import { describe, expect, test } from 'bun:test';
import { EvidenceRegistry } from '../../src/core/evidence-registry';

describe('Writing OS P22 — Evidence Registry & Architectural Ledger Suite', () => {

  describe('1. L0–L7 Evidence Taxonomy & Status Classifications', () => {
    test('Verifies STATE_AUTHORITY_HIERARCHY has Level 7 evidence across 11 phases', () => {
      const card = EvidenceRegistry.getCard('STATE_AUTHORITY_HIERARCHY');

      expect(card).toBeDefined();
      expect(card?.status).toBe('PROVEN_WITHIN_TESTED_SCOPE');
      expect(card?.highestEvidenceLevel).toBe('LEVEL_7_PRODUCTION_OBSERVATION');
      expect(card?.supportingPhases.length).toBeGreaterThanOrEqual(10);
      expect(card?.sampleSize).toBe(450);
      expect(card?.independentReplicationPhases).toContain('P14');
      expect(card?.independentReplicationPhases).toContain('P20');
      expect(card?.confidenceRating).toBe('HIGH_WITHIN_SCOPE');
    });

    test('Verifies PERSISTENT_STATE_BURDEN_REDUCTION has Level 6 Independent Replication evidence', () => {
      const card = EvidenceRegistry.getCard('PERSISTENT_STATE_BURDEN_REDUCTION');

      expect(card).toBeDefined();
      expect(card?.status).toBe('STRONGLY_SUPPORTED');
      expect(card?.highestEvidenceLevel).toBe('LEVEL_6_INDEPENDENT_REPLICATION');
      expect(card?.sampleSize).toBe(180);
      expect(card?.independentReplicationPhases).toContain('P19');
    });
  });

  describe('2. External Metrics Non-Authoritative Invariant', () => {
    test('Verifies EXTERNAL_METRICS_NON_AUTHORITATIVE is formally recorded', () => {
      const card = EvidenceRegistry.getCard('EXTERNAL_METRICS_NON_AUTHORITATIVE');

      expect(card).toBeDefined();
      expect(card?.status).toBe('PROVEN_WITHIN_TESTED_SCOPE');
      expect(card?.supportingPhases).toContain('P21');
      expect(card?.counterevidenceObserved).toContain('18.0%');
    });
  });

  describe('3. Negative & Superseded Evidence Ledger', () => {
    test('Preserves why naive word-banning (P4) and detector optimization (P21) were rejected', () => {
      const negCards = EvidenceRegistry.getAllNegativeCards();

      expect(negCards.length).toBeGreaterThanOrEqual(2);

      const wordBanCard = negCards.find(c => c.id.includes('WORD_BANNING'));
      expect(wordBanCard?.rejectionPhase).toBe('P4');
      expect(wordBanCard?.supersededBy).toBe('PSYCHOLOGICAL_CAUSALITY_AND_ATTENTION_FILTERING');

      const detectorOptCard = negCards.find(c => c.id.includes('DETECTOR_SCORE_OPTIMIZATION'));
      expect(detectorOptCard?.rejectionPhase).toBe('P21');
      expect(detectorOptCard?.supersededBy).toBe('INDEPENDENT_DECOUPLED_QUALITY_AND_INTEGRITY_GATES');
    });
  });

  describe('4. Architecture Decision Records (ADRs 001 – 007)', () => {
    test('Verifies all 7 foundational Architecture Decision Records are registered', () => {
      const adrs = EvidenceRegistry.getAllAdrs();

      expect(adrs.length).toBe(7);

      const adrIds = adrs.map(a => a.adrId);
      expect(adrIds).toEqual(['ADR-001', 'ADR-002', 'ADR-003', 'ADR-004', 'ADR-005', 'ADR-006', 'ADR-007']);

      adrs.forEach(adr => {
        expect(adr.status).toBe('ACCEPTED_INVARIANT');
        expect(adr.title.length).toBeGreaterThan(5);
        expect(adr.decision.length).toBeGreaterThan(10);
      });
    });
  });
});
