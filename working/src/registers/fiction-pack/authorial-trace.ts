/**
 * Fiction Pack — Dynamic Authorial Trace Engine (v5.1 Deep Intelligence)
 * Computes character-specific viewpoint habits, sensory vocabularies, and metaphor domains dynamically
 * from active psychological pressure, somatic load, emotional intensity, and situational context.
 * 
 * Formal Invariant: AuthorialTrace = f(Character, History, CurrentEmotion, SomaticState, Context, Goal)
 */

import { ConsciousnessRepresentation } from './character-consciousness';
import { PsychologicalCausalChain } from './psychological-causality';

export type MetaphorDomain = 
  | 'BALLISTIC_TACTICAL' 
  | 'CHEMICAL_ORGANIC' 
  | 'ELEGIAC_SPATIAL' 
  | 'CLINICAL_ANATOMICAL'
  | 'CLAUSTROPHOBIC_PRESSURE'
  | 'INTIMATE_DOMESTIC';

export type SentenceRhythm = 
  | 'SPARTAN_TERSE' 
  | 'ANALYTICAL_DENSE' 
  | 'LYRICAL_CADENCED'
  | 'FRAGMENTED_BREATHLESS'
  | 'MEASURED_DELIBERATE';

export interface AuthorialVoiceProfile {
  characterId: string;
  perceptualMetaphorDomain: MetaphorDomain;
  sentenceRhythmPreference: SentenceRhythm;
  favoredSensoryDescriptors: string[];
  avoidedSensoryDescriptors: string[];
  narrativePsychicDistance: 'IMMEDIATE_VISCERAL' | 'CLOSE_REFLECTIVE' | 'DETACHED_ANALYTICAL';
}

export class AuthorialTraceEngine {
  /**
   * Dynamically computes the authorial voice profile based on active character state and context,
   * avoiding static archetype mapping.
   */
  public static computeDynamicVoiceProfile(
    characterId: string,
    consciousness: ConsciousnessRepresentation,
    context?: { isCombatOrImminentDanger?: boolean; isIntimateDialogue?: boolean }
  ): AuthorialVoiceProfile {
    const { dominantEmotion, intensity } = consciousness.emotionalPressure;
    const isSevereFatigue = consciousness.emotionalPressure.somaticManifestation.includes('heavy') || consciousness.emotionalPressure.somaticManifestation.includes('labored');

    let perceptualMetaphorDomain: MetaphorDomain = 'CLINICAL_ANATOMICAL';
    let sentenceRhythmPreference: SentenceRhythm = 'MEASURED_DELIBERATE';
    let narrativePsychicDistance: 'IMMEDIATE_VISCERAL' | 'CLOSE_REFLECTIVE' | 'DETACHED_ANALYTICAL' = 'CLOSE_REFLECTIVE';
    const favoredDescriptors: string[] = [];
    const avoidedDescriptors: string[] = ['whimsical', 'flowery ornament', 'generic filler'];

    // 1. Context & Emotional State Modulation
    if (context?.isCombatOrImminentDanger || dominantEmotion === 'HYPERVIGILANCE' || dominantEmotion === 'SUSPICION') {
      perceptualMetaphorDomain = 'BALLISTIC_TACTICAL';
      sentenceRhythmPreference = intensity >= 7.0 ? 'FRAGMENTED_BREATHLESS' : 'SPARTAN_TERSE';
      narrativePsychicDistance = 'IMMEDIATE_VISCERAL';
      favoredDescriptors.push('angle', 'vector', 'recoil', 'flinch', 'perimeter', 'trigger', 'blind spot');
      avoidedDescriptors.push('leisurely', 'lyrical sunset', 'gossamer');
    } else if (dominantEmotion === 'GRIEF' || dominantEmotion === 'ANXIOUS_DREAD') {
      perceptualMetaphorDomain = 'ELEGIAC_SPATIAL';
      sentenceRhythmPreference = isSevereFatigue ? 'FRAGMENTED_BREATHLESS' : 'LYRICAL_CADENCED';
      narrativePsychicDistance = 'CLOSE_REFLECTIVE';
      favoredDescriptors.push('hollow', 'void', 'echo', 'outline', 'faded', 'unanswered');
      avoidedDescriptors.push('brisk efficiency', 'ballistic muzzle');
    } else if (dominantEmotion === 'ANALYTICAL_CURIOSITY') {
      perceptualMetaphorDomain = 'CHEMICAL_ORGANIC';
      sentenceRhythmPreference = 'ANALYTICAL_DENSE';
      narrativePsychicDistance = 'DETACHED_ANALYTICAL';
      favoredDescriptors.push('viscous', 'residue', 'thermal gradient', 'ozone', 'alkaline');
    } else if (isSevereFatigue) {
      perceptualMetaphorDomain = 'CLAUSTROPHOBIC_PRESSURE';
      sentenceRhythmPreference = 'FRAGMENTED_BREATHLESS';
      narrativePsychicDistance = 'IMMEDIATE_VISCERAL';
      favoredDescriptors.push('weight', 'numb', 'pulse in temples', 'lead', 'shallow breath');
    } else {
      perceptualMetaphorDomain = 'CLINICAL_ANATOMICAL';
      sentenceRhythmPreference = 'MEASURED_DELIBERATE';
      narrativePsychicDistance = 'CLOSE_REFLECTIVE';
      favoredDescriptors.push('steady', 'gauge', 'cadence', 'contour', 'clarity');
    }

    return {
      characterId,
      perceptualMetaphorDomain,
      sentenceRhythmPreference,
      favoredSensoryDescriptors: favoredDescriptors,
      avoidedSensoryDescriptors: avoidedDescriptors,
      narrativePsychicDistance,
    };
  }

  public static getVoiceProfile(archetype: string, characterId: string): AuthorialVoiceProfile {
    const dummyConsciousness: ConsciousnessRepresentation = {
      characterId,
      dominantFocus: archetype,
      sensoryPriority: ['VISUAL', 'ACOUSTIC'],
      activeInterpretations: {},
      emotionalPressure: {
        dominantEmotion: archetype === 'GRIEVING_SPOUSE' ? 'GRIEF' : archetype === 'CHEMIST' ? 'ANALYTICAL_CURIOSITY' : 'HYPERVIGILANCE',
        intensity: 5.0,
        somaticManifestation: 'steady pulse',
      },
      immediateIntention: '',
      memoryActivation: [],
      knowledgeBoundary: [],
    };
    return this.computeDynamicVoiceProfile(characterId, dummyConsciousness);
  }

  public static composeGenerationPrompt(
    causalChain: PsychologicalCausalChain,
    consciousness: ConsciousnessRepresentation,
    voiceProfile: AuthorialVoiceProfile
  ): string {
    return [
      `PERSPECTIVE: ${causalChain.proseDirectives.povPerspective}`,
      `PSYCHIC DISTANCE: ${voiceProfile.narrativePsychicDistance}`,
      `COGNITIVE FOCUS: ${consciousness.dominantFocus}`,
      `EMOTIONAL PRESSURE: ${consciousness.emotionalPressure.dominantEmotion} (${consciousness.emotionalPressure.intensity}/10 intensity)`,
      `SOMATIC STATE: ${consciousness.emotionalPressure.somaticManifestation}`,
      `METAPHOR DOMAIN: ${voiceProfile.perceptualMetaphorDomain}`,
      `RHYTHM: ${voiceProfile.sentenceRhythmPreference}`,
      `PRIMARY SENSORY ANCHORS (ATTENDED ONLY): ${causalChain.proseDirectives.mandatorySensoryAnchors.join(', ')}`,
      `CAUSAL PROGRESSION BEATS:`,
      ...causalChain.beats.map(b => `  - [${b.stage}] ${b.description}`),
    ].join('\n');
  }
}
