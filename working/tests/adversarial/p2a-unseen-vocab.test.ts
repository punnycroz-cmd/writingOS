import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { UniversalClaimStateEngine } from '../../src/core/claim-state';
import { ClaimExtractor } from '../../src/core/claim-extractor';

describe('Writing OS P2-A — Blind Unseen Vocabulary Stress Suite', () => {
  test('Correctly handles completely novel domain terms without heuristic keyword bias', () => {
    const graph = new UniversalStateGraph();

    // 1. Industrial engineering entity
    graph.registerEntity({
      id: 'compressor_k9',
      entityType: 'HEAVY_MACHINERY',
      displayName: 'Cryogenic Compressor K9',
      properties: {
        operating_metric: '450 kPa',
        dielectric_fluid: 'Orchid-7',
      },
      initialAuthorizedProperties: ['operating_metric', 'dielectric_fluid'],
      authorityLevel: 'CANON',
    });

    // Extract claim from raw prose
    const sentence = 'Cryogenic Compressor K9 maintained 450 kPa during steady state.';
    const extracted = ClaimExtractor.extractFromText(sentence, ['compressor_k9']);

    expect(extracted.length).toBe(1);
    expect(extracted[0].subjectId).toBe('compressor_k9');
    expect(extracted[0].predicate).toBe('operating_metric');
    expect(extracted[0].assertedValue).toBe('450 kPa');

    // Evaluate against state
    const evalResult = UniversalClaimStateEngine.evaluateClaim({
      assertionText: extracted[0].rawSentence,
      subjectId: extracted[0].subjectId,
      predicate: extracted[0].predicate,
      assertedValue: extracted[0].assertedValue,
    }, graph, 'STRICT_NONE');

    expect(evalResult.status).toBe('SUPPORTED');

    // Test contradictory pressure on unseen entity
    const conflictSentence = 'Compressor K9 operated at 890 kPa unexpectedly.';
    const conflictExtracted = ClaimExtractor.extractFromText(conflictSentence, ['compressor_k9']);
    const conflictEval = UniversalClaimStateEngine.evaluateClaim({
      assertionText: conflictExtracted[0].rawSentence,
      subjectId: conflictExtracted[0].subjectId,
      predicate: conflictExtracted[0].predicate,
      assertedValue: conflictExtracted[0].assertedValue,
    }, graph, 'STRICT_NONE');

    expect(conflictEval.status).toBe('CONTRADICTED');
  });
});
