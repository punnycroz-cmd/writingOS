/**
 * Fiction Pack — Cognitive Attention Engine (v5.1 Deep Intelligence)
 * Dynamically filters environmental stimuli into prioritized cognitive bandwidth tiers
 * and enforces Selective Omission: IGNORED stimuli are blocked from generation directives.
 */

import { ConsciousnessRepresentation, SceneStimuliContext } from './character-consciousness';

export type AttentionTier = 'HIGH' | 'MEDIUM' | 'LOW' | 'IGNORED';

export interface AttentionItem {
  stimulusName: string;
  sensoryModality: 'TACTILE' | 'ACOUSTIC' | 'VISUAL' | 'OLFACTORY' | 'PROPRIOCEPTIVE';
  tier: AttentionTier;
  cognitiveWeight: number; // 0.0 to 1.0
  perceptualReason: string;
}

export interface AttentionMap {
  characterId: string;
  sceneId: string;
  primaryFocusItems: AttentionItem[]; // HIGH tier (mandatory foreground)
  secondaryItems: AttentionItem[];    // MEDIUM tier (contextual)
  peripheralItems: AttentionItem[];   // LOW tier (background texture)
  filteredOutItems: AttentionItem[];  // IGNORED tier (strictly omitted from prose directives)
  totalCognitiveLoad: number;
}

export class AttentionEngine {
  public static computeAttentionMap(
    consciousness: ConsciousnessRepresentation,
    scene: SceneStimuliContext
  ): AttentionMap {
    const allItems: AttentionItem[] = [];

    const visualCues = scene.ambientSensoryCues.visual || [];
    const acousticCues = scene.ambientSensoryCues.acoustic || [];
    const olfactoryCues = scene.ambientSensoryCues.olfactory || [];
    const tactileCues = scene.ambientSensoryCues.tactile || [];

    const evaluateCue = (name: string, modality: 'TACTILE' | 'ACOUSTIC' | 'VISUAL' | 'OLFACTORY' | 'PROPRIOCEPTIVE') => {
      const lower = name.toLowerCase();
      const focusLower = consciousness.dominantFocus.toLowerCase();
      const intentionLower = consciousness.immediateIntention.toLowerCase();

      let cognitiveWeight = 0.3;
      let tier: AttentionTier = 'LOW';
      let reason = 'Ambient background stimulus.';

      // Check if directly tied to dominant focus, intention, or active schema interpretations
      const isDirectFocus = focusLower.split(/[\s,]+/).some(w => w.length > 3 && lower.includes(w)) ||
                            intentionLower.split(/[\s,]+/).some(w => w.length > 3 && lower.includes(w)) ||
                            Object.keys(consciousness.activeInterpretations).some(k => lower.includes(k.toLowerCase()));

      const modalityRank = consciousness.sensoryPriority.indexOf(modality); // 0 = highest priority

      if (isDirectFocus) {
        tier = 'HIGH';
        cognitiveWeight = 0.95;
        reason = `Directly aligns with active focus: "${consciousness.dominantFocus}".`;
      } else if (modalityRank >= 0 && modalityRank <= 1) {
        tier = 'MEDIUM';
        cognitiveWeight = 0.65;
        reason = `Stimulus matches high-priority sensory channel (${modality}).`;
      } else if (modalityRank >= 3 || (scene.illumination === 'DARK' && modality === 'VISUAL')) {
        tier = 'IGNORED';
        cognitiveWeight = 0.05;
        reason = `Filtered out due to low sensory channel priority or environmental occlusion.`;
      }

      return {
        stimulusName: name,
        sensoryModality: modality,
        tier,
        cognitiveWeight,
        perceptualReason: reason,
      };
    };

    visualCues.forEach(c => allItems.push(evaluateCue(c, 'VISUAL')));
    acousticCues.forEach(c => allItems.push(evaluateCue(c, 'ACOUSTIC')));
    olfactoryCues.forEach(c => allItems.push(evaluateCue(c, 'OLFACTORY')));
    tactileCues.forEach(c => allItems.push(evaluateCue(c, 'TACTILE')));

    if (consciousness.emotionalPressure.intensity >= 7.0 || consciousness.sensoryPriority[0] === 'PROPRIOCEPTIVE') {
      allItems.push({
        stimulusName: consciousness.emotionalPressure.somaticManifestation,
        sensoryModality: 'PROPRIOCEPTIVE',
        tier: 'HIGH',
        cognitiveWeight: 0.90,
        perceptualReason: 'High somatic pressure demands active internal cognitive bandwidth.',
      });
    }

    const primaryFocusItems = allItems.filter(i => i.tier === 'HIGH');
    const secondaryItems = allItems.filter(i => i.tier === 'MEDIUM');
    const peripheralItems = allItems.filter(i => i.tier === 'LOW');
    const filteredOutItems = allItems.filter(i => i.tier === 'IGNORED');

    const totalCognitiveLoad = Number(
      allItems.reduce((acc, i) => acc + (i.tier !== 'IGNORED' ? i.cognitiveWeight : 0), 0).toFixed(2)
    );

    return {
      characterId: consciousness.characterId,
      sceneId: scene.sceneId,
      primaryFocusItems,
      secondaryItems,
      peripheralItems,
      filteredOutItems,
      totalCognitiveLoad,
    };
  }

  /**
   * Enforces Selective Omission: returns exclusively the stimuli that survived cognitive filtering (HIGH & top MEDIUM),
   * guaranteeing zero IGNORED stimuli leak into narrative directives.
   */
  public static getSelectedProseStimuli(attentionMap: AttentionMap): string[] {
    const selected = attentionMap.primaryFocusItems.map(i => i.stimulusName);
    attentionMap.secondaryItems.slice(0, 2).forEach(i => {
      if (!selected.includes(i.stimulusName)) {
        selected.push(i.stimulusName);
      }
    });
    return selected;
  }
}
