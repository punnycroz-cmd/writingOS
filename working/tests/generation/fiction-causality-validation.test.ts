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

describe('Writing OS P4.1 — Generation Intelligence Causality Validation Suite', () => {
  const graph = new UniversalStateGraph();

  const rich20StimuliScene: SceneStimuliContext = {
    sceneId: 'scene_rich_vault_20',
    locationName: 'Sublevel 4 Abandoned Chemical Vault',
    illumination: 'DARK',
    immediateThreatLevel: 7.0,
    presentEntityIds: ['maren'],
    ambientSensoryCues: {
      visual: [
        'unlocked reinforced security hatch',
        'framed yellowed photograph on steel desk',
        'heavy shadow concealing north corner',
        'cracked glass indicator dial',
        'rust flakes on floor grating',
        'faint LED pulse on console',
      ],
      acoustic: [
        'steady rhythmic hum of primary turbine',
        'faint metallic scraping in adjacent corridor',
        'water dripping onto copper pipe',
        'distant air pressure whistle',
        'hollow footstep echo',
      ],
      olfactory: [
        'pungent ozone residue',
        'stale damp concrete odor',
        'faint trace of copper oxidation',
        'decayed synthetic insulation smell',
      ],
      tactile: [
        'chilled steel door handle',
        'grimy dust layer on console',
        'cold air draft against neck',
        'vibration in metal floor plates',
        'grease film on emergency lever',
      ],
    },
  };

  test('Test 1: Attention Causality — Internal state shift alters attention map for identical character and scene', () => {
    const eliasAlert: CharacterPsychologicalProfile = {
      id: 'elias',
      name: 'Elias Thorne',
      archetype: 'SURVIVOR',
      activeGoal: 'Inspect perimeter',
      traumaLevel: 1.0,
      fatigueLevel: 1.0,
      trustInOthers: { maren: 0.8 },
      sensoryBiases: ['VISUAL', 'ACOUSTIC'],
      coreMemories: [],
    };

    const eliasExhausted: CharacterPsychologicalProfile = {
      ...eliasAlert,
      traumaLevel: 8.5,
      fatigueLevel: 9.0, // High somatic load
    };

    const consciousAlert = CharacterConsciousnessEngine.computeConsciousness(eliasAlert, rich20StimuliScene, graph);
    const consciousExhausted = CharacterConsciousnessEngine.computeConsciousness(eliasExhausted, rich20StimuliScene, graph);

    const attentionAlert = AttentionEngine.computeAttentionMap(consciousAlert, rich20StimuliScene);
    const attentionExhausted = AttentionEngine.computeAttentionMap(consciousExhausted, rich20StimuliScene);

    // Attention maps must diverge
    expect(attentionAlert.primaryFocusItems.map(i => i.stimulusName)).not.toEqual(
      attentionExhausted.primaryFocusItems.map(i => i.stimulusName)
    );
    expect(attentionExhausted.primaryFocusItems.some(i => i.sensoryModality === 'PROPRIOCEPTIVE')).toBe(true);
  });

  test('Test 2: Interpretation Causality — Raw perception bifurcation triggers divergent emotion and action beats', () => {
    const elias: CharacterPsychologicalProfile = {
      id: 'elias',
      name: 'Elias',
      archetype: 'SURVIVOR',
      activeGoal: 'Survive encounter',
      traumaLevel: 4.0,
      fatigueLevel: 3.0,
      trustInOthers: { maren: 0.5 },
      sensoryBiases: ['ACOUSTIC', 'TACTILE'],
      coreMemories: [],
    };

    const consciousness = CharacterConsciousnessEngine.computeConsciousness(elias, rich20StimuliScene, graph);
    const attention = AttentionEngine.computeAttentionMap(consciousness, rich20StimuliScene);

    // Intervention A: Interprets action as reaching for a weapon
    const chainHostile = PsychologicalCausalityEngine.buildCausalChain(consciousness, attention, rich20StimuliScene, {
      perceivedStimulusOverride: 'Maren reaches toward the metal drawer',
      interpretationOverride: 'She is reaching for a concealed weapon to eliminate witness.',
    });

    // Intervention B: Interprets action as reaching for medical chart
    const chainMedical = PsychologicalCausalityEngine.buildCausalChain(consciousness, attention, rich20StimuliScene, {
      perceivedStimulusOverride: 'Maren reaches toward the metal drawer',
      interpretationOverride: 'She is reaching for the medical emergency chart to offer aid.',
    });

    // Emotion and Action Beats MUST causally diverge
    expect(chainHostile.beats.find(b => b.stage === 'EMOTION')?.description).toContain('SURGE_OF_ALARM');
    expect(chainMedical.beats.find(b => b.stage === 'EMOTION')?.description).toContain('HOPEFUL_RELIEF');

    expect(chainHostile.proseDirectives.actionCadence).toBe('DEFENSIVE_RETREAT');
    expect(chainMedical.proseDirectives.actionCadence).toBe('COOPERATIVE_ADVANCE');
  });

  test('Test 3: Selective Omission — 20 stimuli filtered with zero IGNORED stimuli leaking into directives', () => {
    const soldier: CharacterPsychologicalProfile = {
      id: 'soldier_corwin',
      name: 'Corwin',
      archetype: 'SOLDIER',
      activeGoal: 'Locate extraction route',
      traumaLevel: 2.0,
      fatigueLevel: 2.0,
      trustInOthers: {},
      sensoryBiases: ['TACTILE', 'ACOUSTIC'],
      coreMemories: [],
    };

    const consciousness = CharacterConsciousnessEngine.computeConsciousness(soldier, rich20StimuliScene, graph);
    const attention = AttentionEngine.computeAttentionMap(consciousness, rich20StimuliScene);

    expect(attention.filteredOutItems.length).toBeGreaterThan(0);
    const ignoredNames = attention.filteredOutItems.map(i => i.stimulusName);

    const causalChain = PsychologicalCausalityEngine.buildCausalChain(consciousness, attention, rich20StimuliScene);
    const mandatoryAnchors = causalChain.proseDirectives.mandatorySensoryAnchors;

    // Invariant: Zero IGNORED items may appear in mandatory sensory anchors
    for (const ignored of ignoredNames) {
      expect(mandatoryAnchors).not.toContain(ignored);
    }
  });

  test('Test 4: Trace Dynamism — Same character adapts voice and metaphor across 3 distinct psychological contexts', () => {
    const elias: CharacterPsychologicalProfile = {
      id: 'elias',
      name: 'Elias',
      archetype: 'SURVIVOR',
      activeGoal: 'Survive',
      traumaLevel: 2.0,
      fatigueLevel: 2.0,
      trustInOthers: {},
      sensoryBiases: ['TACTILE', 'ACOUSTIC'],
      coreMemories: [],
    };

    const consciousCombat = CharacterConsciousnessEngine.computeConsciousness(
      { ...elias, traumaLevel: 7.0 },
      { ...rich20StimuliScene, immediateThreatLevel: 9.0 },
      graph
    );
    const consciousGrief = CharacterConsciousnessEngine.computeConsciousness(
      { ...elias, archetype: 'GRIEVING_SPOUSE', traumaLevel: 4.0, fatigueLevel: 2.0 },
      rich20StimuliScene,
      graph
    );
    const consciousChemist = CharacterConsciousnessEngine.computeConsciousness(
      { ...elias, archetype: 'CHEMIST' },
      rich20StimuliScene,
      graph
    );

    const voiceCombat = AuthorialTraceEngine.computeDynamicVoiceProfile(elias.id, consciousCombat, { isCombatOrImminentDanger: true });
    const voiceGrief = AuthorialTraceEngine.computeDynamicVoiceProfile(elias.id, consciousGrief);
    const voiceChemist = AuthorialTraceEngine.computeDynamicVoiceProfile(elias.id, consciousChemist);

    expect(voiceCombat.perceptualMetaphorDomain).toBe('BALLISTIC_TACTICAL');
    expect(voiceCombat.sentenceRhythmPreference).toBe('FRAGMENTED_BREATHLESS');

    expect(voiceGrief.perceptualMetaphorDomain).toBe('ELEGIAC_SPATIAL');
    expect(voiceGrief.sentenceRhythmPreference).toBe('LYRICAL_CADENCED');

    expect(voiceChemist.perceptualMetaphorDomain).toBe('CHEMICAL_ORGANIC');
    expect(voiceChemist.sentenceRhythmPreference).toBe('ANALYTICAL_DENSE');
  });

  test('Test 5: Generation Dependency — P4 Directives structurally condition the generation prompt', () => {
    const soldier: CharacterPsychologicalProfile = {
      id: 'soldier_corwin',
      name: 'Corwin',
      archetype: 'SOLDIER',
      activeGoal: 'Secure room',
      traumaLevel: 3.0,
      fatigueLevel: 2.0,
      trustInOthers: {},
      sensoryBiases: ['TACTILE', 'ACOUSTIC'],
      coreMemories: [],
    };

    const consciousness = CharacterConsciousnessEngine.computeConsciousness(soldier, rich20StimuliScene, graph);
    const attention = AttentionEngine.computeAttentionMap(consciousness, rich20StimuliScene);
    const causal = PsychologicalCausalityEngine.buildCausalChain(consciousness, attention, rich20StimuliScene);
    const voice = AuthorialTraceEngine.computeDynamicVoiceProfile(soldier.id, consciousness);

    const fullPrompt = AuthorialTraceEngine.composeGenerationPrompt(causal, consciousness, voice);

    expect(fullPrompt).toContain('COGNITIVE FOCUS:');
    expect(fullPrompt).toContain('METAPHOR DOMAIN: BALLISTIC_TACTICAL');
    expect(fullPrompt).toContain('CAUSAL PROGRESSION BEATS:');
    expect(fullPrompt).toContain('[PERCEPTION]');
    expect(fullPrompt).toContain('[ACTION]');
  });

  test('Test 6: Positive Counterfactual — Social trust inversion causally alters action and directives', () => {
    const trusting: CharacterPsychologicalProfile = {
      id: 'elias',
      name: 'Elias',
      archetype: 'SURVIVOR',
      activeGoal: 'Converse',
      traumaLevel: 2.0,
      fatigueLevel: 2.0,
      trustInOthers: { maren: 0.95 },
      sensoryBiases: ['TACTILE'],
      coreMemories: [],
    };

    const distrusting: CharacterPsychologicalProfile = {
      ...trusting,
      trustInOthers: { maren: 0.05 },
    };

    const consciousTrust = CharacterConsciousnessEngine.computeConsciousness(trusting, rich20StimuliScene, graph);
    const consciousDistrust = CharacterConsciousnessEngine.computeConsciousness(distrusting, rich20StimuliScene, graph);

    expect(consciousTrust.emotionalPressure.dominantEmotion).not.toBe('SUSPICION');
    expect(consciousDistrust.emotionalPressure.dominantEmotion).toBe('SUSPICION');
  });

  test('Test 7: Negative Counterfactual (Unrelated-State Invariance) — Irrelevant state change leaves directives 100% identical', () => {
    const baseCharacter: CharacterPsychologicalProfile = {
      id: 'elias',
      name: 'Elias',
      archetype: 'SURVIVOR',
      activeGoal: 'Examine door',
      traumaLevel: 3.0,
      fatigueLevel: 2.0,
      trustInOthers: { maren: 0.7 },
      sensoryBiases: ['TACTILE', 'ACOUSTIC'],
      coreMemories: ['childhood memory'],
    };

    // State 1: Register unreferenced property 'favorite_beverage = tea'
    const graph1 = new UniversalStateGraph();
    const entity1 = graph1.registerEntity({
      id: 'elias',
      entityType: 'CHARACTER',
      displayName: 'Elias',
      properties: { favorite_beverage: 'tea' },
    });

    // State 2: Register unreferenced property 'favorite_beverage = coffee'
    const graph2 = new UniversalStateGraph();
    const entity2 = graph2.registerEntity({
      id: 'elias',
      entityType: 'CHARACTER',
      displayName: 'Elias',
      properties: { favorite_beverage: 'coffee' },
    });

    const conscious1 = CharacterConsciousnessEngine.computeConsciousness(baseCharacter, rich20StimuliScene, graph1);
    const conscious2 = CharacterConsciousnessEngine.computeConsciousness(baseCharacter, rich20StimuliScene, graph2);

    const attention1 = AttentionEngine.computeAttentionMap(conscious1, rich20StimuliScene);
    const attention2 = AttentionEngine.computeAttentionMap(conscious2, rich20StimuliScene);

    const causal1 = PsychologicalCausalityEngine.buildCausalChain(conscious1, attention1, rich20StimuliScene);
    const causal2 = PsychologicalCausalityEngine.buildCausalChain(conscious2, attention2, rich20StimuliScene);

    // Negative Counterfactual: Zero divergence in attention and causal beats
    expect(attention1.totalCognitiveLoad).toBe(attention2.totalCognitiveLoad);
    expect(causal1.beats.map(b => b.description)).toEqual(causal2.beats.map(b => b.description));
    expect(causal1.proseDirectives).toEqual(causal2.proseDirectives);
  });

  test('Test 8: Defensive Inconsistency Handling — Throws explicit Cognitive Inconsistency when state violates physical constraints', () => {
    const invalidGraph = new UniversalStateGraph();
    invalidGraph.registerEntity({
      id: 'blind_seer',
      entityType: 'CHARACTER',
      displayName: 'Tiresias',
      properties: { is_blind: true },
    });

    const impossibleProfile: CharacterPsychologicalProfile = {
      id: 'blind_seer',
      name: 'Tiresias',
      archetype: 'SURVIVOR',
      activeGoal: 'Navigate',
      traumaLevel: 1.0,
      fatigueLevel: 1.0,
      trustInOthers: {},
      sensoryBiases: ['VISUAL'], // Impossible: Totally blind character with VISUAL priority
      coreMemories: [],
    };

    expect(() => {
      CharacterConsciousnessEngine.computeConsciousness(impossibleProfile, rich20StimuliScene, invalidGraph);
    }).toThrow('Cognitive Inconsistency');
  });
});
