import { describe, expect, test } from 'bun:test';
import { ClaimExtractor } from '../../src/core/claim-extractor';
import { UniversalStateGraph } from '../../src/core/state-model';
import { UniversalClaimStateEngine } from '../../src/core/claim-state';

describe('Writing OS Core P1 — Semantic Claim Extraction & Paraphrase Equivalence Benchmark', () => {
  const graph = new UniversalStateGraph();
  graph.registerEntity({
    id: 'elias',
    entityType: 'CHARACTER',
    displayName: 'Elias',
  });
  graph.registerClaim({
    id: 'c_coma_canonical',
    subjectId: 'elias',
    predicate: 'coma_duration',
    objectValue: '11 days',
    authorityLevel: 'CANON',
  });

  const testVariants = [
    {
      label: 'Direct active past',
      sentence: 'Elias had been unconscious for eleven days.',
      expectedValue: '11 days',
      expectedStatus: 'SUPPORTED',
    },
    {
      label: 'Passive / Inverted temporal subject',
      sentence: 'Eleven days passed while Elias remained unconscious.',
      expectedValue: '11 days',
      expectedStatus: 'SUPPORTED',
    },
    {
      label: 'Awakening action event',
      sentence: 'Elias finally woke after eleven days in a coma.',
      expectedValue: '11 days',
      expectedStatus: 'SUPPORTED',
    },
    {
      label: 'Prepositional temporal lead with pronoun',
      sentence: 'For eleven days, he had not regained consciousness.',
      expectedValue: '11 days',
      expectedStatus: 'SUPPORTED',
    },
    {
      label: 'Clinical third-party medical order',
      sentence: 'His doctors kept him under for eleven days.',
      expectedValue: '11 days',
      expectedStatus: 'SUPPORTED',
    },
    // Contradictory variants with "thirty days"
    {
      label: 'Contradictory direct active past',
      sentence: 'Elias was in a coma for thirty days.',
      expectedValue: '30 days',
      expectedStatus: 'CONTRADICTED',
    },
    {
      label: 'Contradictory passive temporal subject',
      sentence: 'Thirty days passed while Elias remained unconscious.',
      expectedValue: '30 days',
      expectedStatus: 'CONTRADICTED',
    },
    {
      label: 'Contradictory clinical third-party order',
      sentence: 'The doctors kept him under for thirty days.',
      expectedValue: '30 days',
      expectedStatus: 'CONTRADICTED',
    },
  ];

  for (const variant of testVariants) {
    test(`Semantic Equivalence [${variant.label}]: "${variant.sentence}"`, () => {
      const extracted = ClaimExtractor.extractFromText(variant.sentence, ['elias']);

      expect(extracted.length).toBeGreaterThanOrEqual(1);
      const claim = extracted[0];
      expect(claim.subjectId).toBe('elias');
      expect(claim.predicate).toBe('coma_duration');
      expect(claim.assertedValue).toBe(variant.expectedValue);

      // Validate resolution against State Graph
      const resolution = UniversalClaimStateEngine.evaluateClaim({
        assertionText: claim.rawSentence,
        subjectId: claim.subjectId,
        predicate: claim.predicate,
        assertedValue: claim.assertedValue,
      }, graph, 'LICENSED_FICTION');

      expect(resolution.status).toBe(variant.expectedStatus);
    });
  }
});
