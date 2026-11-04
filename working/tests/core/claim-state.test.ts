import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { UniversalClaimStateEngine } from '../../src/core/claim-state';

describe('Writing OS Core — Universal Claim-State Resolution', () => {
  test('Resolves SUPPORTED when assertion matches established state claim', () => {
    const graph = new UniversalStateGraph();
    graph.registerEntity({
      id: 'apollo_mission',
      entityType: 'SPACE_MISSION',
      displayName: 'Apollo 11',
    });
    graph.registerClaim({
      id: 'c1',
      subjectId: 'apollo_mission',
      predicate: 'launch_year',
      objectValue: '1969',
    });

    const res = UniversalClaimStateEngine.evaluateClaim({
      assertionText: 'Apollo 11 launched in 1969.',
      subjectId: 'apollo_mission',
      predicate: 'launch_year',
      assertedValue: '1969',
    }, graph, 'STRICT_NONE');

    expect(res.status).toBe('SUPPORTED');
    expect(res.confidence).toBe(1.0);
  });

  test('Resolves CONTRADICTED when assertion conflicts with ground truth in state', () => {
    const graph = new UniversalStateGraph();
    graph.registerEntity({
      id: 'mercury_planet',
      entityType: 'ASTRONOMICAL_BODY',
      displayName: 'Mercury',
    });
    graph.registerClaim({
      id: 'c2',
      subjectId: 'mercury_planet',
      predicate: 'order_from_sun',
      objectValue: 'first',
    });

    const res = UniversalClaimStateEngine.evaluateClaim({
      assertionText: 'Mercury is the third planet from the sun.',
      subjectId: 'mercury_planet',
      predicate: 'order_from_sun',
      assertedValue: 'third',
    }, graph, 'STRICT_NONE');

    expect(res.status).toBe('CONTRADICTED');
    expect(res.reason).toContain('conflicts with established state');
  });

  test('Resolves UNKNOWN when property is explicitly marked unknown', () => {
    const graph = new UniversalStateGraph();
    graph.registerEntity({
      id: 'patient_402',
      entityType: 'MEDICAL_PATIENT',
      displayName: 'Anonymous Patient',
    });
    graph.addUnknown('patient_402.birth_date');

    const res = UniversalClaimStateEngine.evaluateClaim({
      assertionText: 'The patient was born on May 12, 1984.',
      subjectId: 'patient_402',
      predicate: 'birth_date',
      assertedValue: 'May 12, 1984',
    }, graph, 'LICENSED_FICTION');

    expect(res.status).toBe('UNKNOWN');
    expect(res.reason).toContain('explicitly marked as UNKNOWN');
  });

  test('Resolves UNSUPPORTED under STRICT_NONE policy for novel entities', () => {
    const graph = new UniversalStateGraph();

    const res = UniversalClaimStateEngine.evaluateClaim({
      assertionText: 'Acme Corp increased revenue by 40%.',
      subjectId: 'acme_corp',
      predicate: 'growth',
      assertedValue: '40%',
    }, graph, 'STRICT_NONE');

    expect(res.status).toBe('UNSUPPORTED');
  });
});
