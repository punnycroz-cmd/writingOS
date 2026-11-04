// developing/working/src/core/context-parser.ts
// Writing OS vNext — Layer 1: Multi-Dimensional Context Parser & Relevance Vector Engine

export interface ContextualProfile {
  genre: 'LITERARY' | 'GOTHIC_HORROR' | 'HARD_SCI_FI' | 'FANTASY' | 'HISTORICAL' | 'THRILLER' | 'NONFICTION_REPORT' | 'BUSINESS_MEMO' | 'LEGAL_BRIEF';
  register: 'INTIMATE' | 'PLAIN' | 'LITERARY' | 'ACADEMIC' | 'BUSINESS' | 'HISTORICAL' | 'COMEDIC' | 'DOCUMENTARY' | 'CHILD';
  narrativeMode: 'FIRST_PERSON_EPISTOLARY' | 'FIRST_PERSON_IMMEDIATE' | 'CLOSE_THIRD' | 'OMNISCIENT_THIRD' | 'OBJECTIVE_REPORT';
  narrativeDistance: 'PSYCHIC_IMMEDIATE' | 'MODERATE' | 'RETROSPECTIVE_DISTANT';
  relevanceVector: {
    physical: number;       // 0.0 (Irrelevant) to 1.0 (Critical)
    somatic: number;        // 0.0 to 1.0
    psychological: number;  // 0.0 to 1.0
    social: number;         // 0.0 to 1.0
    relational: number;     // 0.0 to 1.0
    technical: number;      // 0.0 to 1.0
    epistemic: number;      // 0.0 to 1.0
  };
  ambiguityTolerance: 'STRICT_DETERMINISTIC' | 'PRESERVED_UNCERTAINTY' | 'OPEN_CREATIVE';
  factualDiscipline: 'STRICT_PROVENANCE_ONLY' | 'FICTION_PLAUSIBLE' | 'MYTHIC_UNBOUNDED';
  creativeFreedom: 'ZERO_RECONSTRUCTION_ONLY' | 'MODERATE_FICTION' | 'HIGH_DIVERGENT';
  targetWordBudget: { min: number; target: number; max: number };
}

export class ContextParser {
  /**
   * Parse user prompt and scene blueprint into a multi-dimensional ContextualProfile.
   */
  public static parsePromptContext(
    prompt: string,
    genreHint?: string,
    registerHint?: string
  ): ContextualProfile {
    const lower = prompt.toLowerCase();

    let genre: ContextualProfile['genre'] = 'LITERARY';
    let register: ContextualProfile['register'] = 'LITERARY';
    let narrativeMode: ContextualProfile['narrativeMode'] = 'CLOSE_THIRD';
    let distance: ContextualProfile['narrativeDistance'] = 'PSYCHIC_IMMEDIATE';
    let creativeFreedom: ContextualProfile['creativeFreedom'] = 'MODERATE_FICTION';
    let factualDiscipline: ContextualProfile['factualDiscipline'] = 'FICTION_PLAUSIBLE';

    // Relevance Vector defaults
    let physical = 0.5;
    let somatic = 0.5;
    let psychological = 0.7;
    let social = 0.5;
    let relational = 0.5;
    let technical = 0.2;
    let epistemic = 0.5;

    // Detect Genre & Register
    if (lower.includes('dracula') || lower.includes('gothic') || lower.includes('borgo pass') || genreHint === 'GOTHIC_HORROR') {
      genre = 'GOTHIC_HORROR';
      register = 'HISTORICAL';
      narrativeMode = 'FIRST_PERSON_EPISTOLARY';
      physical = 0.6;
      somatic = 0.7;
      psychological = 0.8;
      social = 0.7;
      relational = 0.6;
      technical = 0.0; // Strictly 0 technical/modern
      epistemic = 0.9; // High preserved uncertainty
      factualDiscipline = 'FICTION_PLAUSIBLE';
      creativeFreedom = 'ZERO_RECONSTRUCTION_ONLY';
    } else if (lower.includes('memo') || lower.includes('executive') || lower.includes('board meeting') || registerHint === 'BUSINESS') {
      genre = 'BUSINESS_MEMO';
      register = 'BUSINESS';
      narrativeMode = 'OBJECTIVE_REPORT';
      distance = 'RETROSPECTIVE_DISTANT';
      physical = 0.1;
      somatic = 0.0;
      psychological = 0.3;
      social = 0.6;
      relational = 0.4;
      technical = 0.8;
      epistemic = 0.2;
      factualDiscipline = 'STRICT_PROVENANCE_ONLY';
      creativeFreedom = 'ZERO_RECONSTRUCTION_ONLY';
    } else if (lower.includes('grief') || lower.includes('bereavement') || lower.includes('memorial') || registerHint === 'INTIMATE') {
      genre = 'LITERARY';
      register = 'INTIMATE';
      narrativeMode = 'CLOSE_THIRD';
      physical = 0.2;
      somatic = 0.6;
      psychological = 0.95;
      social = 0.6;
      relational = 0.95;
      technical = 0.0;
      epistemic = 0.6;
    } else if (lower.includes('chase') || lower.includes('combat') || lower.includes('escape') || lower.includes('kinetic')) {
      genre = 'THRILLER';
      register = 'PLAIN';
      physical = 0.95;
      somatic = 0.9;
      psychological = 0.6;
      social = 0.2;
      relational = 0.3;
      technical = 0.3;
      epistemic = 0.4;
    }

    return {
      genre,
      register,
      narrativeMode,
      narrativeDistance: distance,
      relevanceVector: {
        physical,
        somatic,
        psychological,
        social,
        relational,
        technical,
        epistemic,
      },
      ambiguityTolerance: epistemic > 0.7 ? 'PRESERVED_UNCERTAINTY' : 'STRICT_DETERMINISTIC',
      factualDiscipline,
      creativeFreedom,
      targetWordBudget: { min: 2500, target: 3500, max: 5000 }
    };
  }
}
