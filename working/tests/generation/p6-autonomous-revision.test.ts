import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { TaskContractValidator } from '../../src/core/task-contract';
import { CharacterPsychologicalProfile, SceneStimuliContext, CharacterConsciousnessEngine } from '../../src/registers/fiction-pack/character-consciousness';
import { AutonomousRevisionLoop } from '../../src/core/autonomous-revision-loop';
import { FailureLocalizer } from '../../src/core/failure-localizer';

describe('Writing OS P6 — Autonomous Revision & Closed-Loop Repair Suite', () => {
  const graph = new UniversalStateGraph();
  const task = TaskContractValidator.normalize({
    register: 'fiction',
    objective: 'Generate authentic atmospheric scene',
  });

  const character: CharacterPsychologicalProfile = {
    id: 'elias',
    name: 'Elias',
    archetype: 'SOLDIER',
    activeGoal: 'Navigate corridor',
    traumaLevel: 3.0,
    fatigueLevel: 2.0,
    trustInOthers: { maren: 0.9 },
    sensoryBiases: ['TACTILE'],
    coreMemories: [],
  };

  const scene: SceneStimuliContext = {
    sceneId: 'corridor',
    locationName: 'Sublevel',
    illumination: 'DIM',
    immediateThreatLevel: 5.0,
    presentEntityIds: ['maren'],
    ambientSensoryCues: {
      tactile: ['chilled steel door handle'],
    },
  };

  const consciousness = CharacterConsciousnessEngine.computeConsciousness(character, scene, graph);

  describe('1. Failure Localization & Clean Autonomous Repair', () => {
    test('Surgically repairs localized Voice Drift in paragraph 2 while keeping paragraphs 1 and 3 100% byte-identical', () => {
      const initialText = [
        'Elias adjusted his grip on the flashlight, keeping his boots centered on the grating.',
        'A wave of fear washed over him as gloomy shadows danced across the steel beams.',
        'He signaled Maren with a brief nod, gesturing toward the primary stairwell.',
      ].join('\n\n');

      const result = AutonomousRevisionLoop.executeLoop({
        initialCandidateProse: initialText,
        task,
        stateGraph: graph,
        consciousness,
        maxAttempts: 3,
        simulatedPatchGenerator: (defect) => {
          return 'The chilled steel handle vibrated under his palm as the turbine hum shifted frequency.';
        },
      });

      expect(result.isSuccessfullyRepaired).toBe(true);
      expect(result.finalDecision).toBe('ACCEPT_AUTONOMOUS');
      expect(result.totalAttempts).toBe(2);

      const finalParas = result.finalProse.split(/\n\s*\n/);
      expect(finalParas[0]).toBe('Elias adjusted his grip on the flashlight, keeping his boots centered on the grating.');
      expect(finalParas[1]).toBe('The chilled steel handle vibrated under his palm as the turbine hum shifted frequency.');
      expect(finalParas[2]).toBe('He signaled Maren with a brief nod, gesturing toward the primary stairwell.');
    });
  });

  describe('2. Repair Oscillation Cycle Detection & Clean Handoff', () => {
    test('Detects A -> B -> A cycle and cleanly halts with HANDOFF_OSCILLATION', () => {
      const initialText = [
        'Paragraph one is stable.',
        'A wave of fear washed over him in the dark.',
        'Paragraph three is stable.',
      ].join('\n\n');

      let flip = false;
      const result = AutonomousRevisionLoop.executeLoop({
        initialCandidateProse: initialText,
        task,
        stateGraph: graph,
        consciousness,
        maxAttempts: 4,
        simulatedPatchGenerator: () => {
          flip = !flip;
          return flip 
            ? 'A wave of fear washed over him in the dark.' // Oscillation back to defect
            : 'He felt a wave of fear washed over him.';
        },
      });

      expect(result.finalDecision).toBe('HANDOFF_OSCILLATION');
      expect(result.isSuccessfullyRepaired).toBe(false);
      expect(result.attemptsLedger.some(a => a.decision === 'HANDOFF_OSCILLATION')).toBe(true);
    });
  });

  describe('3. Quality Plateau Termination without Token Burning', () => {
    test('Halts when quality delta is below threshold and cleanly triggers HANDOFF_PLATEAU', () => {
      const initialText = [
        'Paragraph one is stable.',
        'A wave of fear washed over him.',
        'Paragraph three is stable.',
      ].join('\n\n');

      const result = AutonomousRevisionLoop.executeLoop({
        initialCandidateProse: initialText,
        task,
        stateGraph: graph,
        consciousness,
        maxAttempts: 3,
        simulatedPatchGenerator: () => {
          // Produces a minor tweak that still retains a generic cliché
          return 'Gloomy shadows danced along the wall.';
        },
      });

      expect(result.finalDecision).toBe('HANDOFF_PLATEAU');
      expect(result.isSuccessfullyRepaired).toBe(false);
      expect(result.attemptsLedger.some(a => a.decision === 'HANDOFF_PLATEAU')).toBe(true);
    });
  });
});
