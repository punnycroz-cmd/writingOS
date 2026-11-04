// developing/working/src/core/adaptive-grounding-engine.ts
// Writing OS vNext — Layer 5: Adaptive Grounding Selector & House-Style Governor

import { ContextualProfile } from './context-parser';

export type GroundingChannel =
  | 'PHYSICAL'
  | 'SOMATIC'
  | 'PSYCHOLOGICAL'
  | 'RELATIONAL'
  | 'SOCIAL'
  | 'CULTURAL'
  | 'TEMPORAL'
  | 'EPISTEMIC'
  | 'ENVIRONMENTAL'
  | 'LINGUISTIC'
  | 'PROCEDURAL'
  | 'SYMBOLIC'
  | 'MINIMAL'
  | 'MIXED';

export interface GroundingDecision {
  primaryChannel: GroundingChannel;
  secondaryChannel: GroundingChannel;
  suppressedChannels: GroundingChannel[];
  tactileDensityBudget: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH';
  technicalVocabularyAllowed: boolean;
  preservesUncertainty: boolean;
}

export class AdaptiveGroundingEngine {
  /**
   * Determine the exact Grounding Decision based on Contextual Profile.
   */
  public static selectGrounding(profile: ContextualProfile): GroundingDecision {
    const rel = profile.relevanceVector;

    let primary: GroundingChannel = 'PSYCHOLOGICAL';
    let secondary: GroundingChannel = 'SOMATIC';
    const suppressed: GroundingChannel[] = [];

    // Rule: Suppress technical vocabulary unless technical relevance >= 0.7 and genre is technical/business
    const technicalAllowed = rel.technical >= 0.7 && (profile.genre === 'HARD_SCI_FI' || profile.genre === 'BUSINESS_MEMO');
    if (!technicalAllowed) {
      suppressed.push('PROCEDURAL');
    }

    if (rel.physical > 0.8) {
      primary = 'PHYSICAL';
      secondary = rel.somatic > 0.6 ? 'SOMATIC' : 'ENVIRONMENTAL';
    } else if (rel.relational > 0.8 && rel.psychological > 0.8) {
      primary = 'PSYCHOLOGICAL';
      secondary = 'RELATIONAL';
      suppressed.push('PHYSICAL');
    } else if (profile.genre === 'GOTHIC_HORROR' || profile.register === 'HISTORICAL') {
      primary = 'CULTURAL';
      secondary = 'EPISTEMIC';
      suppressed.push('PROCEDURAL');
    } else if (profile.register === 'BUSINESS') {
      primary = 'PROCEDURAL';
      secondary = 'SOCIAL';
      suppressed.push('SOMATIC', 'PSYCHOLOGICAL', 'SYMBOLIC');
    }

    let tactileBudget: GroundingDecision['tactileDensityBudget'] = 'MODERATE';
    if (rel.physical < 0.3) tactileBudget = 'LOW';
    if (profile.register === 'INTIMATE' || profile.register === 'BUSINESS') tactileBudget = 'NONE';
    if (rel.physical >= 0.8) tactileBudget = 'HIGH';

    return {
      primaryChannel: primary,
      secondaryChannel: secondary,
      suppressedChannels: suppressed,
      tactileDensityBudget: tactileBudget,
      technicalVocabularyAllowed: technicalAllowed,
      preservesUncertainty: profile.ambiguityTolerance === 'PRESERVED_UNCERTAINTY',
    };
  }
}
