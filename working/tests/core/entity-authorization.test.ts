import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { EntityPropertyAuthorizer } from '../../src/core/entity-authorization';

describe('Writing OS Core — Entity Property Authorization Layer', () => {
  test('Enforces Entity Existence != Property Authorization', () => {
    const graph = new UniversalStateGraph();
    // Entity exists with properties, but ONLY "headquarters" is authorized
    graph.registerEntity({
      id: 'apex_biotech',
      entityType: 'CORPORATION',
      displayName: 'Apex Biotech',
      properties: {
        headquarters: 'Boston, MA',
        internal_revenue: '$20M',
      },
      initialAuthorizedProperties: ['headquarters'],
    });

    // Query 1: Accessing authorized property
    const authDecision = EntityPropertyAuthorizer.authorize({
      entityId: 'apex_biotech',
      propertyName: 'headquarters',
      purportedValue: 'Boston, MA',
      accessingContext: 'EXECUTIVE_SUMMARY',
    }, graph);

    expect(authDecision.isAuthorized).toBe(true);
    expect(authDecision.recommendation).toBe('ALLOW');

    // Query 2: Accessing known but unauthorized property (e.g. internal revenue)
    const unauthDecision = EntityPropertyAuthorizer.authorize({
      entityId: 'apex_biotech',
      propertyName: 'internal_revenue',
      purportedValue: '$20M',
      accessingContext: 'EXECUTIVE_SUMMARY',
    }, graph);

    expect(unauthDecision.isAuthorized).toBe(false);
    expect(unauthDecision.recommendation).toBe('FLAG_FOR_HANDOFF');
    expect(unauthDecision.violationReason).toContain('Entity Existence != Property Authorization');

    // Query 3: Now explicitly authorize internal_revenue with evidence
    graph.authorizeProperty('apex_biotech', 'internal_revenue', {
      sourceId: '10-K Filing',
      sourceType: 'DOCUMENT',
      timestamp: Date.now(),
      confidence: 1.0,
    });

    const nowAuthDecision = EntityPropertyAuthorizer.authorize({
      entityId: 'apex_biotech',
      propertyName: 'internal_revenue',
      purportedValue: '$20M',
      accessingContext: 'EXECUTIVE_SUMMARY',
    }, graph);

    expect(nowAuthDecision.isAuthorized).toBe(true);
    expect(nowAuthDecision.recommendation).toBe('ALLOW');
  });

  test('Blocks access when property is declared UNKNOWN in State Graph', () => {
    const graph = new UniversalStateGraph();
    graph.registerEntity({
      id: 'agent_x',
      entityType: 'CHARACTER',
      displayName: 'Agent X',
    });
    graph.addUnknown('agent_x.real_name');

    const decision = EntityPropertyAuthorizer.authorize({
      entityId: 'agent_x',
      propertyName: 'real_name',
      accessingContext: 'SCENE_REVISION',
    }, graph);

    expect(decision.isAuthorized).toBe(false);
    expect(decision.recommendation).toBe('BLOCK');
    expect(decision.violationReason).toContain('unauthorized state leak');
  });
});
