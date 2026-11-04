import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { UniversalClaimStateEngine } from '../../src/core/claim-state';

describe('Writing OS P2-D — Temporal Order & Timeline Reasoning Suite', () => {
  const graph = new UniversalStateGraph();

  // Establish canonical timeline: Event A -> Event B -> Event C
  graph.registerEntity({ id: 'event_a', entityType: 'EVENT', displayName: 'Grid Collapse' });
  graph.registerEntity({ id: 'event_b', entityType: 'EVENT', displayName: 'Hospital Evacuation' });
  graph.registerEntity({ id: 'event_c', entityType: 'EVENT', displayName: 'Rebel Broadcast' });

  graph.registerRelation({ sourceEntityId: 'event_a', targetEntityId: 'event_b', relationType: 'BEFORE' });
  graph.registerRelation({ sourceEntityId: 'event_b', targetEntityId: 'event_c', relationType: 'BEFORE' });

  test('Validates transitive chronological ordering (Event A occurred before Event C)', () => {
    const claim = UniversalClaimStateEngine.evaluateClaim({
      assertionText: 'The Grid Collapse occurred before the Rebel Broadcast.',
      subjectId: 'event_a',
      predicate: 'occurred_before',
      assertedValue: 'event_c',
    }, graph, 'LICENSED_FICTION');

    expect(claim.status).toBe('SUPPORTED');
    expect(claim.confidence).toBe(1.0);
  });

  test('Detects chronological inverted contradiction (Event C occurred before Event A)', () => {
    const claim = UniversalClaimStateEngine.evaluateClaim({
      assertionText: 'The Rebel Broadcast occurred before the Grid Collapse.',
      subjectId: 'event_c',
      predicate: 'occurred_before',
      assertedValue: 'event_a',
    }, graph, 'LICENSED_FICTION');

    expect(claim.status).toBe('CONTRADICTED');
    expect(claim.reason).toContain('Temporal contradiction');
  });
});
