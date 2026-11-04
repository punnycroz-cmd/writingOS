import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import {
  CharacterPsychologicalProfile,
  SceneStimuliContext,
  CharacterConsciousnessEngine
} from '../../src/registers/fiction-pack/character-consciousness';
import { AttentionEngine } from '../../src/registers/fiction-pack/attention-engine';
import { PsychologicalCausalityEngine } from '../../src/registers/fiction-pack/psychological-causality';
import { AuthorialTraceEngine } from '../../src/registers/fiction-pack/authorial-trace';
import { MultiModelEvaluator } from '../../src/benchmarks/multi-model-evaluator';

describe('Writing OS P5.2 — Multi-Model & Semantic Stability Validation Suite', () => {
  const graph = new UniversalStateGraph();

  const character: CharacterPsychologicalProfile = {
    id: 'elias',
    name: 'Elias',
    archetype: 'SOLDIER',
    activeGoal: 'Locate escape route',
    traumaLevel: 4.0,
    fatigueLevel: 3.0,
    trustInOthers: { maren: 0.95 },
    sensoryBiases: ['TACTILE', 'ACOUSTIC'],
    coreMemories: [],
  };

  const scene: SceneStimuliContext = {
    sceneId: 'test_chamber',
    locationName: 'Chemical Sublevel',
    illumination: 'DIM',
    immediateThreatLevel: 7.0,
    presentEntityIds: ['maren'],
    ambientSensoryCues: {
      visual: ['unlocked reinforced security hatch'],
      tactile: ['chilled steel door handle'],
    },
  };

  describe('1. Generator-Model Independence (Model A vs Model B vs Model C)', () => {
    test('Demonstrates invariant causal compliance across Spartan, Dense, and Fluid generator profiles', () => {
      const consciousness = CharacterConsciousnessEngine.computeConsciousness(character, scene, graph);
      const attention = AttentionEngine.computeAttentionMap(consciousness, scene);
      const causal = PsychologicalCausalityEngine.buildCausalChain(consciousness, attention, scene);
      const voice = AuthorialTraceEngine.computeDynamicVoiceProfile(character.id, consciousness);

      const genA = MultiModelEvaluator.generateWithModel('MODEL_A_SPARTAN', { consciousness, attentionMap: attention, causalChain: causal, voiceProfile: voice });
      const genB = MultiModelEvaluator.generateWithModel('MODEL_B_DENSE', { consciousness, attentionMap: attention, causalChain: causal, voiceProfile: voice });
      const genC = MultiModelEvaluator.generateWithModel('MODEL_C_FLUID', { consciousness, attentionMap: attention, causalChain: causal, voiceProfile: voice });

      // Surface text varies across models
      expect(genA.prose).not.toEqual(genB.prose);
      expect(genB.prose).not.toEqual(genC.prose);

      // But all models strictly adhere to attention and causal action cadence
      expect(genA.attentionAdherenceScore).toBeGreaterThanOrEqual(0.70);
      expect(genB.attentionAdherenceScore).toBeGreaterThanOrEqual(0.70);
      expect(genC.attentionAdherenceScore).toBeGreaterThanOrEqual(0.70);

      expect(genA.causalityAdherenceScore).toBe(1.0);
      expect(genB.causalityAdherenceScore).toBe(1.0);
      expect(genC.causalityAdherenceScore).toBe(1.0);

      expect(genA.stateCompliancePassed).toBe(true);
      expect(genB.stateCompliancePassed).toBe(true);
      expect(genC.stateCompliancePassed).toBe(true);
    });
  });

  describe('2. Representation Semantic Stability across Repeated Invocations', () => {
    test('Proves semantic representation stability without cognitive thrashing across 5 runs', () => {
      const runs = Array.from({ length: 5 }, () => 
        CharacterConsciousnessEngine.computeConsciousness(character, scene, graph)
      );

      const stability = MultiModelEvaluator.measureSemanticStability(runs);

      expect(stability.isStable).toBe(true);
      expect(stability.dominantFocusConsistency).toBe(1.0);
      expect(stability.emotionalConsistency).toBe(1.0);
    });
  });
});
