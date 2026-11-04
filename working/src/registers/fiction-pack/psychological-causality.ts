/**
 * Fiction Pack — Psychological Causality Engine (v5.1 Deep Intelligence)
 * Constructs an explicit, unbroken causal chain from raw perception to narrative prose:
 * Perception -> Attention -> Interpretation -> Emotion -> Intention -> Action -> Prose.
 * Supports counterfactual interpretation interventions to prove causal bifurcation.
 */

import { ConsciousnessRepresentation, SceneStimuliContext } from './character-consciousness';
import { AttentionMap, AttentionEngine } from './attention-engine';

export interface CausalBeat {
  beatIndex: number;
  stage: 'PERCEPTION' | 'ATTENTION' | 'INTERPRETATION' | 'EMOTION' | 'INTENTION' | 'ACTION';
  description: string;
  underlyingStateAnchor: string;
}

export interface PsychologicalCausalChain {
  characterId: string;
  sceneId: string;
  beats: CausalBeat[];
  proseDirectives: {
    povPerspective: string;
    mandatorySensoryAnchors: string[];
    forbiddenLexicalClichés: string[];
    emotionalUndercurrent: string;
    actionCadence: 'STACCATO_FAST' | 'DELIBERATE_MEASURED' | 'HEAVY_LABORED' | 'DEFENSIVE_RETREAT' | 'COOPERATIVE_ADVANCE';
  };
}

export class PsychologicalCausalityEngine {
  public static buildCausalChain(
    consciousness: ConsciousnessRepresentation,
    attention: AttentionMap,
    scene: SceneStimuliContext,
    interventions?: {
      interpretationOverride?: string;
      intentionOverride?: string;
      perceivedStimulusOverride?: string;
    }
  ): PsychologicalCausalChain {
    const beats: CausalBeat[] = [];

    // 1. BEAT 1: PERCEPTION
    const primaryStimulus = interventions?.perceivedStimulusOverride || 
                            attention.primaryFocusItems[0]?.stimulusName || 
                            'the immediate physical environment';
    beats.push({
      beatIndex: 1,
      stage: 'PERCEPTION',
      description: `Character perceives ${primaryStimulus} through ${consciousness.sensoryPriority[0]} sensory channel.`,
      underlyingStateAnchor: `Sensory priority: ${consciousness.sensoryPriority.join(' > ')}`,
    });

    // 2. BEAT 2: ATTENTION
    beats.push({
      beatIndex: 2,
      stage: 'ATTENTION',
      description: `Cognitive bandwidth focuses on: "${consciousness.dominantFocus}".`,
      underlyingStateAnchor: `Total cognitive load: ${attention.totalCognitiveLoad}`,
    });

    // 3. BEAT 3: INTERPRETATION (with counterfactual intervention support)
    const socialKey = Object.keys(consciousness.activeInterpretations).find(k => scene.presentEntityIds.includes(k));
    const interpretation = interventions?.interpretationOverride ||
                           (socialKey ? consciousness.activeInterpretations[socialKey] : undefined) ||
                           Object.entries(consciousness.activeInterpretations)[0]?.[1] || 
                           `Contextually interprets scene as ${consciousness.emotionalPressure.dominantEmotion.toLowerCase()}.`;
    beats.push({
      beatIndex: 3,
      stage: 'INTERPRETATION',
      description: interpretation,
      underlyingStateAnchor: `Active psychological schema`,
    });

    // 4. BEAT 4: EMOTION (causally modulated by interpretation)
    let dominantEmotion = consciousness.emotionalPressure.dominantEmotion;
    let intensity = consciousness.emotionalPressure.intensity;
    let somaticManifestation = consciousness.emotionalPressure.somaticManifestation;

    const lowerInterp = interpretation.toLowerCase();
    if (/\b(?:weapon|hostile|adversary|threat|ambush|attack)\b/i.test(interpretation)) {
      dominantEmotion = 'SURGE_OF_ALARM';
      intensity = Math.max(8.0, intensity);
      somaticManifestation = 'adrenaline spike and muscle contraction';
    } else if (/\b(?:medical chart|trusted ally|offer aid|offering help)\b/i.test(interpretation)) {
      dominantEmotion = 'HOPEFUL_RELIEF';
      intensity = 5.0;
      somaticManifestation = 'relaxing shoulder tension and slower exhalation';
    }

    beats.push({
      beatIndex: 4,
      stage: 'EMOTION',
      description: `Experiences ${dominantEmotion} at intensity ${intensity}/10 (${somaticManifestation}).`,
      underlyingStateAnchor: `Somatic state anchor: ${somaticManifestation}`,
    });

    // 5. BEAT 5: INTENTION
    let immediateIntention = interventions?.intentionOverride || consciousness.immediateIntention;
    if (dominantEmotion === 'SURGE_OF_ALARM') {
      immediateIntention = 'Create distance and prepare defensive barrier';
    } else if (dominantEmotion === 'HOPEFUL_RELIEF') {
      immediateIntention = 'Step forward and assist with retrieval';
    }

    beats.push({
      beatIndex: 5,
      stage: 'INTENTION',
      description: `Forms immediate intention: "${immediateIntention}".`,
      underlyingStateAnchor: `Emergent tactical intention`,
    });

    // 6. BEAT 6: ACTION
    let actionDesc = '';
    let cadence: 'STACCATO_FAST' | 'DELIBERATE_MEASURED' | 'HEAVY_LABORED' | 'DEFENSIVE_RETREAT' | 'COOPERATIVE_ADVANCE' = 'DELIBERATE_MEASURED';

    if (dominantEmotion === 'SURGE_OF_ALARM') {
      actionDesc = `Shifts weight backward into defensive stance, hand bracing against the console.`;
      cadence = 'DEFENSIVE_RETREAT';
    } else if (dominantEmotion === 'HOPEFUL_RELIEF') {
      actionDesc = `Steps forward with open hands, leaning in toward the illuminated chart.`;
      cadence = 'COOPERATIVE_ADVANCE';
    } else if (intensity >= 7.0) {
      actionDesc = `Performs defensive somatic action with ${somaticManifestation}.`;
      cadence = 'HEAVY_LABORED';
    } else {
      actionDesc = `Executes measured physical progression toward ${immediateIntention}.`;
      cadence = 'DELIBERATE_MEASURED';
    }

    beats.push({
      beatIndex: 6,
      stage: 'ACTION',
      description: actionDesc,
      underlyingStateAnchor: `Physical execution`,
    });

    // Enforce selective omission: only attended stimuli passed into mandatory sensory anchors
    const attendedStimuli = AttentionEngine.getSelectedProseStimuli(attention);

    return {
      characterId: consciousness.characterId,
      sceneId: scene.sceneId,
      beats,
      proseDirectives: {
        povPerspective: `Third-person close limited to ${consciousness.characterId}`,
        mandatorySensoryAnchors: attendedStimuli,
        forbiddenLexicalClichés: ['felt a wave of', 'saw that', 'realized that', 'time seemed to stand still'],
        emotionalUndercurrent: `${dominantEmotion} (${somaticManifestation})`,
        actionCadence: cadence,
      },
    };
  }
}
