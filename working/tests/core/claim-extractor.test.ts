import { describe, expect, test } from 'bun:test';
import { ClaimExtractor } from '../../src/core/claim-extractor';
import { UniversalStateGraph } from '../../src/core/state-model';
import { UniversalClaimStateEngine } from '../../src/core/claim-state';

describe('Writing OS Core — Natural Language Claim Extractor & Resolution Bridge', () => {
  test('Extracts temporal coma claim and resolves contradiction against State Graph', () => {
    const graph = new UniversalStateGraph();
    graph.registerEntity({
      id: 'elias',
      entityType: 'CHARACTER',
      displayName: 'Elias',
    });
    graph.registerClaim({
      id: 'c_coma',
      subjectId: 'elias',
      predicate: 'coma_duration',
      objectValue: '11 days',
    });

    const rawSentence = 'Elias had been in a coma for 30 days before anyone noticed.';
    const extracted = ClaimExtractor.extractFromText(rawSentence, ['elias']);

    expect(extracted.length).toBe(1);
    expect(extracted[0].subjectId).toBe('elias');
    expect(extracted[0].predicate).toBe('coma_duration');
    expect(extracted[0].assertedValue).toBe('30 days');

    // Feed extracted claim directly into UniversalClaimStateEngine
    const resolution = UniversalClaimStateEngine.evaluateClaim({
      assertionText: extracted[0].rawSentence,
      subjectId: extracted[0].subjectId,
      predicate: extracted[0].predicate,
      assertedValue: extracted[0].assertedValue,
    }, graph, 'LICENSED_FICTION');

    expect(resolution.status).toBe('CONTRADICTED');
    expect(resolution.reason).toContain('Expected: "11 days", Asserted: "30 days"');
  });

  test('Extracts corporate revenue claim and validates against state', () => {
    const graph = new UniversalStateGraph();
    graph.registerEntity({
      id: 'apex_biotech',
      entityType: 'CORPORATION',
      displayName: 'Apex Biotech',
    });
    graph.registerClaim({
      id: 'c_rev',
      subjectId: 'apex_biotech',
      predicate: 'revenue',
      objectValue: '$20M',
    });

    const sentence = 'Apex Biotech recorded $20M in quarterly revenue following recent contracts.';
    const extracted = ClaimExtractor.extractFromText(sentence);

    expect(extracted.length).toBe(1);
    expect(extracted[0].subjectId).toBe('apex_biotech');
    expect(extracted[0].predicate).toBe('revenue');
    expect(extracted[0].assertedValue).toBe('$20M');

    const resolution = UniversalClaimStateEngine.evaluateClaim({
      assertionText: extracted[0].rawSentence,
      subjectId: extracted[0].subjectId,
      predicate: extracted[0].predicate,
      assertedValue: extracted[0].assertedValue,
    }, graph, 'LIMITED_INFERENCE');

    expect(resolution.status).toBe('SUPPORTED');
  });
});
