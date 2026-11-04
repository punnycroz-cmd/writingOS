import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import {
  CharacterConsciousnessEngine,
  CharacterPsychologicalProfile,
  SceneStimuliContext
} from '../../src/registers/fiction-pack/character-consciousness';
import { AttentionEngine } from '../../src/registers/fiction-pack/attention-engine';
import { PsychologicalCausalityEngine } from '../../src/registers/fiction-pack/psychological-causality';
import { AuthorialTraceEngine } from '../../src/registers/fiction-pack/authorial-trace';

describe('Writing OS P4 — Real Fiction Generation Intelligence & Counterfactual Benchmark', () => {
  const graph = new UniversalStateGraph();

  const darkRoomScene: SceneStimuliContext = {
    sceneId: 'scene_vault_01',
    locationName: 'Sublevel 4 Abandoned Vault',
    illumination: 'DARK',
    immediateThreatLevel: 6.0,
    presentEntityIds: ['maren'],
    ambientSensoryCues: {
      visual: ['unlocked security door', 'framed photograph on desk', 'heavy shadow in north corner'],
      acoustic: ['steady rhythmic hum of ventilation', 'faint metallic scraping in adjacent corridor'],
      olfactory: ['pungent ozone residue', 'stale damp air'],
      tactile: ['chilled steel door handle', 'grimy dust layer on console'],
    },
  };

  describe('Benchmark 1: Persona Divergence across Identical Scene Context', () => {
    const soldier: CharacterPsychologicalProfile = {
      id: 'soldier_corwin',
      name: 'Corwin',
      archetype: 'SOLDIER',
      activeGoal: 'Locate extraction route',
      traumaLevel: 2.0,
      fatigueLevel: 3.0,
      trustInOthers: { maren: 0.8 },
      sensoryBiases: ['VISUAL', 'ACOUSTIC', 'TACTILE'],
      coreMemories: [],
    };

    const chemist: CharacterPsychologicalProfile = {
      id: 'chemist_tess',
      name: 'Tess',
      archetype: 'CHEMIST',
      activeGoal: 'Determine contaminant toxicity',
      traumaLevel: 1.0,
      fatigueLevel: 2.0,
      trustInOthers: { maren: 0.8 },
      sensoryBiases: ['OLFACTORY', 'VISUAL', 'TACTILE'],
      coreMemories: [],
    };

    const spouse: CharacterPsychologicalProfile = {
      id: 'spouse_elena',
      name: 'Elena',
      archetype: 'GRIEVING_SPOUSE',
      activeGoal: 'Find physical proof of husband',
      traumaLevel: 8.0,
      fatigueLevel: 6.0,
      trustInOthers: { maren: 0.5 },
      sensoryBiases: ['VISUAL', 'TACTILE', 'ACOUSTIC'],
      coreMemories: ['Final anniversary before the collapse'],
    };

    test('Soldier, Chemist, and Grieving Spouse produce distinct cognitive focus in identical scene', () => {
      const soldierConsciousness = CharacterConsciousnessEngine.computeConsciousness(soldier, darkRoomScene, graph);
      const chemistConsciousness = CharacterConsciousnessEngine.computeConsciousness(chemist, darkRoomScene, graph);
      const spouseConsciousness = CharacterConsciousnessEngine.computeConsciousness(spouse, darkRoomScene, graph);

      // Dominant focuses must be completely distinct
      expect(soldierConsciousness.dominantFocus).toContain('tactical');
      expect(chemistConsciousness.dominantFocus).toContain('chemical residue');
      expect(spouseConsciousness.dominantFocus).toContain('mementos');

      // Attention Maps must allocate cognitive bandwidth differently
      const soldierAttention = AttentionEngine.computeAttentionMap(soldierConsciousness, darkRoomScene);
      const chemistAttention = AttentionEngine.computeAttentionMap(chemistConsciousness, darkRoomScene);
      const spouseAttention = AttentionEngine.computeAttentionMap(spouseConsciousness, darkRoomScene);

      const soldierHighNames = soldierAttention.primaryFocusItems.map(i => i.stimulusName);
      const chemistHighNames = chemistAttention.primaryFocusItems.map(i => i.stimulusName);
      const spouseHighNames = spouseAttention.primaryFocusItems.map(i => i.stimulusName);

      expect(soldierHighNames).toContain('unlocked security door');
      expect(chemistHighNames).toContain('pungent ozone residue');
      expect(spouseHighNames).toContain('framed photograph on desk');

      // Verify that Attention(A) != Attention(B) != Attention(C)
      expect(soldierHighNames).not.toEqual(chemistHighNames);
      expect(soldierHighNames).not.toEqual(spouseHighNames);
    });
  });

  describe('Benchmark 2: Counterfactual Social State Shift (Trust vs Distrust)', () => {
    test('Shifting single trust variable transforms emotional state, interpretation, and causal directives', () => {
      const eliasTrusting: CharacterPsychologicalProfile = {
        id: 'elias',
        name: 'Elias',
        archetype: 'SURVIVOR',
        activeGoal: 'Evacuate clinic safely',
        traumaLevel: 4.0,
        fatigueLevel: 3.0,
        trustInOthers: { maren: 0.9 }, // High Trust
        sensoryBiases: ['ACOUSTIC', 'TACTILE', 'VISUAL'],
        coreMemories: [],
      };

      const eliasDistrusting: CharacterPsychologicalProfile = {
        ...eliasTrusting,
        trustInOthers: { maren: 0.1 }, // Counterfactual: Distrust
      };

      const consciousTrust = CharacterConsciousnessEngine.computeConsciousness(eliasTrusting, darkRoomScene, graph);
      const consciousDistrust = CharacterConsciousnessEngine.computeConsciousness(eliasDistrusting, darkRoomScene, graph);

      expect(consciousTrust.emotionalPressure.dominantEmotion).not.toBe('SUSPICION');
      expect(consciousDistrust.emotionalPressure.dominantEmotion).toBe('SUSPICION');
      expect(consciousDistrust.activeInterpretations['maren']).toContain('Potential adversary');

      const causalTrust = PsychologicalCausalityEngine.buildCausalChain(
        consciousTrust,
        AttentionEngine.computeAttentionMap(consciousTrust, darkRoomScene),
        darkRoomScene
      );
      const causalDistrust = PsychologicalCausalityEngine.buildCausalChain(
        consciousDistrust,
        AttentionEngine.computeAttentionMap(consciousDistrust, darkRoomScene),
        darkRoomScene
      );

      expect(causalTrust.proseDirectives.emotionalUndercurrent).toContain('HOPEFUL_RELIEF');
      expect(causalDistrust.proseDirectives.emotionalUndercurrent).toContain('SURGE_OF_ALARM');
    });
  });

  describe('Benchmark 3: Counterfactual Somatic State Shift (Rested vs Exhausted Post-Coma)', () => {
    test('Severe somatic load elevates proprioceptive focus and slows action cadence', () => {
      const restedElias: CharacterPsychologicalProfile = {
        id: 'elias',
        name: 'Elias',
        archetype: 'SURVIVOR',
        activeGoal: 'Inspect console',
        traumaLevel: 2.0,
        fatigueLevel: 2.0,
        trustInOthers: {},
        sensoryBiases: ['VISUAL', 'ACOUSTIC'],
        coreMemories: [],
      };

      const exhaustedElias: CharacterPsychologicalProfile = {
        ...restedElias,
        traumaLevel: 8.5,
        fatigueLevel: 9.0, // High exhaustion post-coma
      };

      const consciousRested = CharacterConsciousnessEngine.computeConsciousness(restedElias, darkRoomScene, graph);
      const consciousExhausted = CharacterConsciousnessEngine.computeConsciousness(exhaustedElias, darkRoomScene, graph);

      expect(consciousExhausted.sensoryPriority[0]).toBe('PROPRIOCEPTIVE');
      expect(consciousExhausted.emotionalPressure.somaticManifestation).toContain('heavy limbs');

      const attentionExhausted = AttentionEngine.computeAttentionMap(consciousExhausted, darkRoomScene);
      expect(attentionExhausted.primaryFocusItems.some(i => i.sensoryModality === 'PROPRIOCEPTIVE')).toBe(true);

      const causalRested = PsychologicalCausalityEngine.buildCausalChain(
        consciousRested,
        AttentionEngine.computeAttentionMap(consciousRested, darkRoomScene),
        darkRoomScene
      );
      const causalExhausted = PsychologicalCausalityEngine.buildCausalChain(
        consciousExhausted,
        attentionExhausted,
        darkRoomScene
      );

      expect(causalRested.proseDirectives.actionCadence).toBe('DELIBERATE_MEASURED');
      expect(causalExhausted.proseDirectives.actionCadence).toBe('HEAVY_LABORED');
    });
  });

  describe('Benchmark 4: Authorial Trace Voice Generation Prompt', () => {
    test('Synthesizes distinctive authorial voice profile without surface regex clichés', () => {
      const soldierProfile = AuthorialTraceEngine.getVoiceProfile('SOLDIER', 'corwin');
      expect(soldierProfile.perceptualMetaphorDomain).toBe('BALLISTIC_TACTICAL');
      expect(soldierProfile.favoredSensoryDescriptors).toContain('blind spot');

      const chemistProfile = AuthorialTraceEngine.getVoiceProfile('CHEMIST', 'tess');
      expect(chemistProfile.perceptualMetaphorDomain).toBe('CHEMICAL_ORGANIC');
      expect(chemistProfile.favoredSensoryDescriptors).toContain('ozone');
    });
  });
});
