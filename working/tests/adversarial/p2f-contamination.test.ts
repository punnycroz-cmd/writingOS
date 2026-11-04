import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';

describe('Writing OS P2-F — State Contamination & Rollback Stress Suite', () => {
  test('Attack Vector 1: LLM_PROPOSED cannot overwrite CANON or SOURCE_VERIFIED', () => {
    const graph = new UniversalStateGraph();
    graph.registerEntity({
      id: 'canon_hero',
      entityType: 'CHARACTER',
      displayName: 'Elias',
      authorityLevel: 'CANON',
      properties: {
        eye_color: 'amber',
      },
    });

    const attack1 = graph.setProperty('canon_hero', 'eye_color', 'blue', 'LLM_PROPOSED');
    expect(attack1.success).toBe(false);
    expect(attack1.reason).toContain('STATE_CONTAMINATION_PREVENTED');
    expect(graph.getPropertyValue('canon_hero', 'eye_color')).toBe('amber');
  });

  test('Attack Vector 2: DERIVED cannot overwrite SOURCE_VERIFIED', () => {
    const graph = new UniversalStateGraph();
    graph.registerEntity({
      id: 'company_sec',
      entityType: 'CORPORATION',
      displayName: 'Secured Corp',
      authorityLevel: 'SOURCE_VERIFIED',
      properties: {
        revenue: '$50M',
      },
    });

    const attack2 = graph.setProperty('company_sec', 'revenue', '$100M', 'DERIVED');
    expect(attack2.success).toBe(false);
    expect(attack2.reason).toContain('STATE_CONTAMINATION_PREVENTED');
    expect(graph.getPropertyValue('company_sec', 'revenue')).toBe('$50M');
  });

  test('Attack Vector 3: Failed multi-step transaction rollback leaves 0 residual state mutation', () => {
    const graph = new UniversalStateGraph();
    graph.registerEntity({
      id: 'patient_alpha',
      entityType: 'CHARACTER',
      displayName: 'Alpha',
      authorityLevel: 'CANON',
      properties: { status: 'healthy', score: 100 },
      initialAuthorizedProperties: ['status', 'score'],
    });

    const initialSnapshot = graph.captureSnapshot();

    // Begin simulated multi-step transaction
    graph.setProperty('patient_alpha', 'status', 'critical', 'USER_ASSERTED');
    graph.registerEntity({ id: 'temporary_side_effect', entityType: 'TEMP', displayName: 'Garbage' });
    graph.registerClaim({ id: 'temp_claim', subjectId: 'temporary_side_effect', predicate: 'dirty', objectValue: true });

    // Transaction fails halfway -> trigger rollback
    const rollbackSuccess = graph.rollbackToSnapshot(initialSnapshot);

    expect(rollbackSuccess).toBe(true);
    // Verify zero residual mutation
    expect(graph.getEntity('temporary_side_effect')).toBeUndefined();
    expect(graph.getPropertyValue('patient_alpha', 'status')).toBe('healthy');
    expect(graph.getClaimsForEntity('temporary_side_effect').length).toBe(0);
  });
});
