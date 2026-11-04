import { describe, expect, test } from 'bun:test';
import { TaskContractValidator } from '../../src/core/task-contract';
import { UniversalStateGraph } from '../../src/core/state-model';
import { UniversalClaimStateEngine } from '../../src/core/claim-state';

describe('Writing OS P2-H — Contract & State Fuzzing Suite', () => {
  test('Throws clean error on missing required objective', () => {
    expect(() => {
      TaskContractValidator.normalize({ register: 'fiction' });
    }).toThrow("TaskContract Error: 'objective' is required.");
  });

  test('Rejects entity registration with empty string or whitespace ID', () => {
    const graph = new UniversalStateGraph();
    expect(() => {
      graph.registerEntity({ id: '   ', entityType: 'TEST', displayName: 'Blank' });
    }).toThrow("StateGraph Error: Entity 'id' must be a non-empty string.");
  });

  test('Safely handles evaluation of non-existent entity with extreme string values', () => {
    const graph = new UniversalStateGraph();
    const extremeText = 'A'.repeat(10000);

    const result = UniversalClaimStateEngine.evaluateClaim({
      assertionText: extremeText,
      subjectId: 'non_existent_entity_xyz',
      predicate: 'random_attribute',
      assertedValue: 'random_val',
    }, graph, 'STRICT_NONE');

    expect(result.status).toBe('UNSUPPORTED');
    expect(result.confidence).toBe(0.95);
  });
});
