/**
 * Fiction Pack — Real Character Consciousness Engine (v5.0 Deep Intelligence)
 * Computes a structured, machine-readable cognitive representation of a character's internal state
 * from character profile, somatic load, active goal, threat level, and environmental stimuli.
 */

import { UniversalStateGraph, BaseEntity } from '../../core/state-model';
import { CharacterStateLedger } from './character-state';

export interface CharacterPsychologicalProfile {
  id: string;
  name: string;
  archetype: 'SOLDIER' | 'CHEMIST' | 'GRIEVING_SPOUSE' | 'SURVIVOR' | 'INVESTIGATOR' | 'PHYSICIAN';
  activeGoal: string;
  traumaLevel: number; // 0.0 to 10.0
  fatigueLevel: number; // 0.0 to 10.0
  trustInOthers: Record<string, number>; // 0.0 (total distrust) to 1.0 (complete trust)
  sensoryBiases: Array<'TACTILE' | 'ACOUSTIC' | 'VISUAL' | 'OLFACTORY' | 'PROPRIOCEPTIVE'>;
  coreMemories: string[];
}

export interface SceneStimuliContext {
  sceneId: string;
  locationName: string;
  illumination: 'DARK' | 'DIM' | 'BRIGHT' | 'FLICKERING';
  ambientSensoryCues: {
    visual?: string[];
    acoustic?: string[];
    olfactory?: string[];
    tactile?: string[];
  };
  immediateThreatLevel: number; // 0.0 to 10.0
  presentEntityIds: string[];
}

export interface ConsciousnessRepresentation {
  characterId: string;
  dominantFocus: string;
  sensoryPriority: Array<'TACTILE' | 'ACOUSTIC' | 'VISUAL' | 'OLFACTORY' | 'PROPRIOCEPTIVE'>;
  activeInterpretations: Record<string, string>;
  emotionalPressure: {
    dominantEmotion: string;
    intensity: number; // 0.0 to 10.0
    somaticManifestation: string;
  };
  immediateIntention: string;
  memoryActivation: string[];
  knowledgeBoundary: string[];
}

export class CharacterConsciousnessEngine {
  public static registerCharacter(
    stateGraph: UniversalStateGraph,
    character: { id: string; name: string; initialTrauma?: number; knownSecrets?: string[]; unknowns?: string[] }
  ): BaseEntity {
    return CharacterStateLedger.registerCharacter(stateGraph, character);
  }

  public static auditSomaticFriction(text: string, stateGraph: UniversalStateGraph, characterId: string): { passed: boolean; violation?: string } {
    return CharacterStateLedger.auditSomaticFriction(text, stateGraph, characterId);
  }

  public static computeConsciousness(
    character: CharacterPsychologicalProfile,
    scene: SceneStimuliContext,
    stateGraph: UniversalStateGraph
  ): ConsciousnessRepresentation {
    // 0. Defensive Consistency Check: Detect impossible somatic/cognitive combinations
    const entity = stateGraph.getEntity(character.id);
    const isBlind = entity?.properties.get('is_blind')?.value === true || entity?.properties.get('visual_impairment')?.value === 'TOTAL';
    if (isBlind && character.sensoryBiases[0] === 'VISUAL') {
      throw new Error(`Cognitive Inconsistency: Character "${character.id}" is marked as totally blind in State Graph but has VISUAL as primary sensory channel.`);
    }

    const memoryActivation: string[] = [];
    const activeInterpretations: Record<string, string> = {};
    const knowledgeBoundary = stateGraph.getUnknowns().filter(u => u.startsWith(`${character.id}.`));

    // 1. Determine Sensory Priority based on Archetype, Darkness, & Somatic Exhaustion
    let sensoryPriority: Array<'TACTILE' | 'ACOUSTIC' | 'VISUAL' | 'OLFACTORY' | 'PROPRIOCEPTIVE'> = [...character.sensoryBiases];

    if (scene.illumination === 'DARK' || scene.illumination === 'DIM') {
      sensoryPriority = ['ACOUSTIC', 'TACTILE', 'OLFACTORY', 'PROPRIOCEPTIVE', 'VISUAL'];
    }

    if (character.traumaLevel >= 7.0 || character.fatigueLevel >= 7.0) {
      // Severe somatic exhaustion commands priority channel
      sensoryPriority = ['PROPRIOCEPTIVE', ...sensoryPriority.filter(s => s !== 'PROPRIOCEPTIVE')];
    }

    // 2. Archetype-specific Focus & Stimulus Interpretation
    let dominantFocus = '';
    let dominantEmotion = 'NEUTRAL';
    let emotionalIntensity = 3.0;
    let somaticManifestation = 'steady pulse';
    let immediateIntention = character.activeGoal;

    switch (character.archetype) {
      case 'SOLDIER':
        dominantFocus = 'Exit vectors, tactical blind spots, and threat containment';
        dominantEmotion = scene.immediateThreatLevel > 5.0 ? 'HYPERVIGILANCE' : 'CONTROLLED_CALM';
        emotionalIntensity = Math.min(10.0, 5.0 + scene.immediateThreatLevel * 0.5);
        somaticManifestation = 'tightened jaw and finger curled near weapon holster';
        immediateIntention = 'Secure the perimeter and locate emergency egress';
        activeInterpretations['shadows'] = 'potential tactical concealment for hostile actors';
        activeInterpretations['door'] = 'primary breach and exit vector';
        activeInterpretations['hatch'] = 'primary breach and exit vector';
        break;

      case 'CHEMIST':
        dominantFocus = 'Air quality, chemical residue, and atmospheric ventilation';
        dominantEmotion = 'ANALYTICAL_CURIOSITY';
        emotionalIntensity = 4.5;
        somaticManifestation = 'shallow breathing to test ambient vapor toxicity';
        immediateIntention = 'Sample ambient air and inspect surface residue';
        activeInterpretations['smell'] = 'trace volatile organic compounds or ozone decay';
        activeInterpretations['ventilation'] = 'critical air exchange airflow rate';
        break;

      case 'GRIEVING_SPOUSE':
        dominantFocus = 'Absence, personal mementos, and resonant emotional echoes';
        dominantEmotion = 'GRIEF';
        emotionalIntensity = 8.5;
        somaticManifestation = 'hollow constriction in the chest and dry throat';
        immediateIntention = 'Search for remaining traces or physical mementos';
        activeInterpretations['silence'] = 'stark void left by lost presence';
        activeInterpretations['photograph'] = 'painful reminder of prior connection';
        if (character.coreMemories.length > 0) {
          memoryActivation.push(character.coreMemories[0]);
        }
        break;

      case 'SURVIVOR':
      default:
        dominantFocus = character.traumaLevel >= 6.0 ? 'Bodily pain and immediate physical safety' : 'Orienting to surroundings';
        dominantEmotion = character.traumaLevel >= 7.0 ? 'ANXIOUS_DREAD' : 'CAUTION';
        emotionalIntensity = character.traumaLevel;
        somaticManifestation = character.fatigueLevel >= 7.0 ? 'heavy limbs and labored breaths' : 'steady pulse';
        immediateIntention = character.activeGoal || 'Find a safe vantage point';
        break;
    }

    // 3. Social Trust Modifiers (Transforms emotion and interpretation)
    for (const presentId of scene.presentEntityIds) {
      const trust = character.trustInOthers[presentId] ?? 0.5;
      if (trust < 0.3) {
        activeInterpretations[presentId] = 'Potential adversary; motives are suspect and deceitful.';
        dominantEmotion = 'SUSPICION';
        emotionalIntensity = Math.max(emotionalIntensity, 7.5);
      } else if (trust > 0.8) {
        activeInterpretations[presentId] = 'Trusted ally; source of mutual safety.';
      }
    }

    return {
      characterId: character.id,
      dominantFocus,
      sensoryPriority,
      activeInterpretations,
      emotionalPressure: {
        dominantEmotion,
        intensity: Number(emotionalIntensity.toFixed(1)),
        somaticManifestation,
      },
      immediateIntention,
      memoryActivation,
      knowledgeBoundary,
    };
  }
}
