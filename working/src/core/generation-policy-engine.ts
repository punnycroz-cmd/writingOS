// developing/working/src/core/generation-policy-engine.ts
// Writing OS v4.2+ — Context Analyzer & Dynamic Generation Policy Engine

export type GroundingMode = 
  | 'PHYSICAL'
  | 'SOCIAL'
  | 'PSYCHOLOGICAL'
  | 'RELATIONAL'
  | 'SENSORY'
  | 'TEMPORAL'
  | 'EPISTEMIC'
  | 'CULTURAL'
  | 'MINIMAL'
  | 'MIXED';

export type CreativityMode = 
  | 'NOVELTY_SEARCH'
  | 'CANON_CONSTRAINED'
  | 'HIGH_INVENTION';

export type PsychologyMode = 
  | 'INTERNAL_STATE_DEEP'
  | 'BEHAVIORAL_RESTRAINED'
  | 'SOCIOLOGICAL'
  | 'OBSERVATIONAL_FLAT';

export type POVMode = 
  | 'ANALYTICAL_COGNITION'
  | 'TACTICAL_SPATIAL'
  | 'STREET_ASSOCIATIVE'
  | 'DOMESTIC_QUIET'
  | 'NEUTRAL_BALANCED';

export type ConsequenceMode = 
  | 'MULTI_HORIZON'
  | 'IMMEDIATE_ONLY'
  | 'SECOND_ORDER_AUDIT';

export interface DetailBudget {
  physical: number;      // 0 to 100 percentage
  social: number;        // 0 to 100 percentage
  psychological: number; // 0 to 100 percentage
  sensory: number;       // 0 to 100 percentage
  technical: number;     // 0 to 100 percentage
}

export interface PremiseContextAnalysis {
  genre: string;
  register: string;
  isFiction: boolean;
  narrativeMode: 'SCENE' | 'SUMMARY' | 'MEMO' | 'MONOLOGUE' | 'MULTI_POV';
  emotionalIntensity: 'HIGH' | 'MODERATE' | 'LOW' | 'NEUTRAL';
  physicalRelevance: 'CRUCIAL' | 'INCIDENTAL' | 'MINIMAL';
  knowledgeCertainty: 'ABSOLUTE' | 'AMBIGUOUS' | 'SPARSE';
  constraintProfile: string[];
}

export interface GenerationPolicy {
  detailBudget: DetailBudget;
  groundingMode: GroundingMode;
  creativityMode: CreativityMode;
  psychologyMode: PsychologyMode;
  povMode: POVMode;
  consequenceMode: ConsequenceMode;
  maxUnsupportedSpecificity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  forbiddenTropes: string[];
}

export class ContextAnalyzer {
  /**
   * Parse prompt/premise to identify fundamental register, mode, and physical relevance.
   */
  public static analyzePremise(premise: string): PremiseContextAnalysis {
    const lower = premise.toLowerCase();
    
    // Check if memo/business
    const isMemo = /\b(?:memorandum|memo|executive summary|schedule revision|business|corporate)\b/i.test(lower);
    const isBirthdayOrSocial = /\b(?:birthday party|gathering|family dinner|café|cafe|grandparents|neighbors?)\b/i.test(lower);
    const isTacticalOrAction = /\b(?:soldier|carbine|forced-open door|pursuit|escape|injury|somatic|broken bone)\b/i.test(lower);
    const isIntrospectionOrGrief = /\b(?:introspection|grief|alone|hospital|waiting|memory|regret|decision)\b/i.test(lower);
    const isMultiPOV = /\b(?:three people|three perspectives|alternate|multiple pov)\b/i.test(lower);

    let genre = 'GENERAL';
    let register = 'LITERARY_COMMERCIAL';
    let isFiction = true;
    let narrativeMode: 'SCENE' | 'SUMMARY' | 'MEMO' | 'MONOLOGUE' | 'MULTI_POV' = 'SCENE';
    let physicalRelevance: 'CRUCIAL' | 'INCIDENTAL' | 'MINIMAL' = 'INCIDENTAL';
    let emotionalIntensity: 'HIGH' | 'MODERATE' | 'LOW' | 'NEUTRAL' = 'MODERATE';

    if (isMemo) {
      genre = 'BUSINESS';
      register = 'EXECUTIVE_MEMO';
      isFiction = false;
      narrativeMode = 'MEMO';
      physicalRelevance = 'MINIMAL';
      emotionalIntensity = 'NEUTRAL';
    } else if (isBirthdayOrSocial) {
      genre = 'DOMESTIC_SOCIAL';
      register = 'DOMESTIC_CASUAL';
      physicalRelevance = 'MINIMAL';
      emotionalIntensity = 'MODERATE';
    } else if (isTacticalOrAction) {
      genre = 'TACTICAL_ADVENTURE';
      register = 'TACTICAL_PROCEDURAL';
      physicalRelevance = 'CRUCIAL';
      emotionalIntensity = 'HIGH';
    } else if (isIntrospectionOrGrief) {
      genre = 'LITERARY';
      register = 'PSYCHOLOGICAL_INTROSPECTION';
      physicalRelevance = 'MINIMAL';
      emotionalIntensity = 'HIGH';
    }

    if (isMultiPOV) {
      narrativeMode = 'MULTI_POV';
    }

    return {
      genre,
      register,
      isFiction,
      narrativeMode,
      emotionalIntensity,
      physicalRelevance,
      knowledgeCertainty: lower.includes('ambiguous') ? 'AMBIGUOUS' : 'SPARSE',
      constraintProfile: isMemo ? ['STRICT_PROVENANCE', 'ZERO_INVENTED_MODULES'] : [],
    };
  }
}

export class GenerationPolicyEngine {
  /**
   * Derive a tailored GenerationPolicy from context analysis, replacing global physical defaults with context-sensitive budgets.
   */
  public static derivePolicy(analysis: PremiseContextAnalysis): GenerationPolicy {
    if (analysis.register === 'EXECUTIVE_MEMO' || !analysis.isFiction) {
      return {
        detailBudget: { physical: 0, social: 10, psychological: 0, sensory: 0, technical: 90 },
        groundingMode: 'EPISTEMIC',
        creativityMode: 'CANON_CONSTRAINED',
        psychologyMode: 'OBSERVATIONAL_FLAT',
        povMode: 'NEUTRAL_BALANCED',
        consequenceMode: 'SECOND_ORDER_AUDIT',
        maxUnsupportedSpecificity: 'NONE',
        forbiddenTropes: ['invented software architecture', 'imaginary protocol standards', 'rustic workshop tools'],
      };
    }

    if (analysis.genre === 'DOMESTIC_SOCIAL') {
      return {
        detailBudget: { physical: 15, social: 45, psychological: 25, sensory: 15, technical: 0 },
        groundingMode: 'SOCIAL',
        creativityMode: 'NOVELTY_SEARCH',
        psychologyMode: 'SOCIOLOGICAL',
        povMode: 'DOMESTIC_QUIET',
        consequenceMode: 'IMMEDIATE_ONLY',
        maxUnsupportedSpecificity: 'HIGH',
        forbiddenTropes: ['tallow', 'linseed oil', 'procedural measurement catalogs', 'conspiracy tropes'],
      };
    }

    if (analysis.register === 'PSYCHOLOGICAL_INTROSPECTION') {
      return {
        detailBudget: { physical: 10, social: 15, psychological: 60, sensory: 15, technical: 0 },
        groundingMode: 'PSYCHOLOGICAL',
        creativityMode: 'NOVELTY_SEARCH',
        psychologyMode: 'INTERNAL_STATE_DEEP',
        povMode: 'DOMESTIC_QUIET',
        consequenceMode: 'MULTI_HORIZON',
        maxUnsupportedSpecificity: 'HIGH',
        forbiddenTropes: ['moral aphorisms at ending', 'physical micro-action substitution', 'convenient resolution'],
      };
    }

    if (analysis.narrativeMode === 'MULTI_POV') {
      return {
        detailBudget: { physical: 30, social: 25, psychological: 30, sensory: 15, technical: 0 },
        groundingMode: 'MIXED',
        creativityMode: 'NOVELTY_SEARCH',
        psychologyMode: 'INTERNAL_STATE_DEEP',
        povMode: 'ANALYTICAL_COGNITION',
        consequenceMode: 'MULTI_HORIZON',
        maxUnsupportedSpecificity: 'HIGH',
        forbiddenTropes: ['symmetrical observe-interpret-announce structure', 'uniform cognitive speed'],
      };
    }

    // Default Balanced Commercial Fiction
    return {
      detailBudget: { physical: 25, social: 25, psychological: 30, sensory: 15, technical: 5 },
      groundingMode: 'RELATIONAL',
      creativityMode: 'NOVELTY_SEARCH',
      psychologyMode: 'INTERNAL_STATE_DEEP',
      povMode: 'NEUTRAL_BALANCED',
      consequenceMode: 'MULTI_HORIZON',
      maxUnsupportedSpecificity: 'MEDIUM',
      forbiddenTropes: ['rural cellar cliché', 'tallow/linseed oil clustering'],
    };
  }
}
