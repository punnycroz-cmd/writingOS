import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { HandoffRouter } from '../../src/core/handoff';

describe('Writing OS P2-E — Multi-Hop Relational State Reasoning Suite', () => {
  test('Discovers 3-hop transitive relation path: Alice -> Key A -> Door B -> Room C', () => {
    const graph = new UniversalStateGraph();

    graph.registerEntity({ id: 'alice', entityType: 'CHARACTER', displayName: 'Alice' });
    graph.registerEntity({ id: 'key_a', entityType: 'ITEM', displayName: 'Brass Key A' });
    graph.registerEntity({ id: 'door_b', entityType: 'PORTAL', displayName: 'Reinforced Vault Door B' });
    graph.registerEntity({ id: 'room_c', entityType: 'LOCATION', displayName: 'Inner Sanctum Room C' });

    graph.registerRelation({ sourceEntityId: 'alice', targetEntityId: 'key_a', relationType: 'OWNS' });
    graph.registerRelation({ sourceEntityId: 'key_a', targetEntityId: 'door_b', relationType: 'OPENS' });
    graph.registerRelation({ sourceEntityId: 'door_b', targetEntityId: 'room_c', relationType: 'LEADS_TO' });

    // Multi-hop path query
    const path = graph.findRelationPath('alice', 'room_c', 4);

    expect(path).not.toBeNull();
    expect(path!.length).toBe(3);
    expect(path![0].relationType).toBe('OWNS');
    expect(path![1].relationType).toBe('OPENS');
    expect(path![2].relationType).toBe('LEADS_TO');
  });

  test('Routes unprovable multi-hop leap (Alice in Room C with ungrounded artifact) to HANDOFF', () => {
    const handoff = HandoffRouter.routeDecision({
      ruleId: 'MULTI_HOP_UNVERIFIED_PROP',
      isDeterministicViolation: false,
      isAmbiguous: true,
      severity: 'MODERATE',
      description: 'Access path is valid, but holding the gold chalice inside Room C lacks grounding evidence.',
      sourceContext: 'Alice unlocked Door B and picked up the gold chalice from the pedestal.',
    });

    expect(handoff.action).toBe('LLM_HANDOFF');
  });
});
