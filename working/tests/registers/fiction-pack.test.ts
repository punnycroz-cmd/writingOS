import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { TaskContractValidator } from '../../src/core/task-contract';
import { FictionPack, CharacterConsciousnessEngine, CanonInvariantEngine } from '../../src/registers/fiction-pack';

describe('Writing OS Registers — Fiction Pack Specification', () => {
  test('Flags somatic friction violations when high-trauma character sprints effortlessly', () => {
    const graph = new UniversalStateGraph();
    const task = TaskContractValidator.normalize({ register: 'fiction', objective: 'Scene 1' });
    const fictionPack = new FictionPack();

    // Register character with high trauma (e.g. 8.5/10)
    CharacterConsciousnessEngine.registerCharacter(graph, {
      id: 'protagonist',
      name: 'Elias',
      initialTrauma: 8.5,
    });

    const badScene = 'Elias leaped out of bed and sprinted effortlessly across the courtyard with easy agility.';
    const audit = fictionPack.auditText(badScene, graph, task);

    expect(audit.passed).toBe(false);
    expect(audit.violations[0]).toContain('Somatic Friction Violation');
  });

  test('Passes cleanly when character experiences somatic cost and fatigue', () => {
    const graph = new UniversalStateGraph();
    const task = TaskContractValidator.normalize({ register: 'fiction', objective: 'Scene 1' });
    const fictionPack = new FictionPack();

    CharacterConsciousnessEngine.registerCharacter(graph, {
      id: 'protagonist',
      name: 'Elias',
      initialTrauma: 8.5,
    });

    const goodScene = 'Elias hauled his legs over the rail. His knees buckled under his weight, and he caught the iron bar with white knuckles.';
    const audit = fictionPack.auditText(goodScene, graph, task);

    expect(audit.passed).toBe(true);
    expect(audit.violations.length).toBe(0);
  });
});
