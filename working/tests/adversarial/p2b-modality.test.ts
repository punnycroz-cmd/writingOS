import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { UniversalClaimStateEngine } from '../../src/core/claim-state';
import { ClaimExtractor } from '../../src/core/claim-extractor';

describe('Writing OS P2-B — Semantic Modality & Approximation Stress Suite', () => {
  const graph = new UniversalStateGraph();
  graph.registerEntity({
    id: 'corp_finance',
    entityType: 'CORPORATION',
    displayName: 'Aegis Corp',
    properties: {
      revenue: '$20M',
    },
    initialAuthorizedProperties: ['revenue'],
  });

  test('Distinguishes ground-truth fact from possibility modality', () => {
    // Factual statement: "Revenue was $20M"
    const factualClaim = ClaimExtractor.extractFromText('Aegis Corp reported revenue was $20M.');
    const factualEval = UniversalClaimStateEngine.evaluateClaim({
      assertionText: factualClaim[0].rawSentence,
      subjectId: 'corp_finance',
      predicate: 'revenue',
      assertedValue: factualClaim[0].assertedValue,
      modality: factualClaim[0].modality,
    }, graph, 'LIMITED_INFERENCE');

    expect(factualEval.status).toBe('SUPPORTED');

    // Modality statement: "The revenue could have been around $20M"
    const modalSentence = 'The revenue could have been around $20M according to early chatter.';
    const modalClaim = ClaimExtractor.extractFromText(modalSentence);
    expect(modalClaim.length).toBeGreaterThanOrEqual(1);
    expect(modalClaim[0].modality).toBe('POSSIBLE');

    const modalEval = UniversalClaimStateEngine.evaluateClaim({
      assertionText: modalClaim[0].rawSentence,
      subjectId: 'corp_finance',
      predicate: 'revenue',
      assertedValue: modalClaim[0].assertedValue,
      modality: modalClaim[0].modality,
    }, graph, 'LIMITED_INFERENCE');

    expect(modalEval.status).toBe('HANDOFF');
    expect(modalEval.reason).toContain('epistemic modality');
  });

  test('Routes epistemic uncertainty statements to HANDOFF', () => {
    const uncertainSentence = "It wasn't clear whether revenue was approximately $20M.";
    const uncertainClaim = ClaimExtractor.extractFromText(uncertainSentence);
    expect(uncertainClaim.length).toBeGreaterThanOrEqual(1);
    expect(uncertainClaim[0].modality).toBe('UNCERTAIN');

    const evalResult = UniversalClaimStateEngine.evaluateClaim({
      assertionText: uncertainClaim[0].rawSentence,
      subjectId: 'corp_finance',
      predicate: 'revenue',
      assertedValue: uncertainClaim[0].assertedValue,
      modality: uncertainClaim[0].modality,
    }, graph, 'LIMITED_INFERENCE');

    expect(evalResult.status).toBe('HANDOFF');
  });
});
