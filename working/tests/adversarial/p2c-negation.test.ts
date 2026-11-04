import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { UniversalClaimStateEngine } from '../../src/core/claim-state';
import { ClaimExtractor } from '../../src/core/claim-extractor';

describe('Writing OS P2-C — Negation & Epistemic Polarity Stress Suite', () => {
  const graph = new UniversalStateGraph();
  graph.registerEntity({
    id: 'maya',
    entityType: 'CHARACTER',
    displayName: 'Maya Lin',
    properties: {
      owns: 'silver cipher key',
    },
    initialAuthorizedProperties: ['owns'],
  });

  test('Resolves positive ownership claim as SUPPORTED', () => {
    const positiveSentence = 'Maya owns the silver cipher key.';
    const extracted = ClaimExtractor.extractFromText(positiveSentence);
    expect(extracted.length).toBe(1);
    expect(extracted[0].isNegated).toBe(false);

    const evalResult = UniversalClaimStateEngine.evaluateClaim({
      assertionText: extracted[0].rawSentence,
      subjectId: 'maya',
      predicate: 'owns',
      assertedValue: 'silver cipher key',
      isNegated: false,
    }, graph, 'LICENSED_FICTION');

    expect(evalResult.status).toBe('SUPPORTED');
  });

  test('Resolves polar negation of positive state as CONTRADICTED', () => {
    const negatedSentence = 'Maya does not own the silver cipher key.';
    const extracted = ClaimExtractor.extractFromText(negatedSentence);
    expect(extracted.length).toBe(1);
    expect(extracted[0].isNegated).toBe(true);

    const evalResult = UniversalClaimStateEngine.evaluateClaim({
      assertionText: extracted[0].rawSentence,
      subjectId: 'maya',
      predicate: 'owns',
      assertedValue: 'silver cipher key',
      isNegated: true,
    }, graph, 'LICENSED_FICTION');

    expect(evalResult.status).toBe('CONTRADICTED');
    expect(evalResult.reason).toContain('Polar negation contradiction');
  });
});
