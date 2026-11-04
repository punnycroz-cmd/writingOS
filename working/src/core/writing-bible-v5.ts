/**
 * Writing OS Core — Writing Bible v5 Publication & Schema Engine (P27)
 * Implements the 10-part canonical schema, v4->v5 Translation Matrix,
 * Information Ownership Model, and PASS/FAIL/DEFERRED claim triage.
 */

export interface BibleSection {
  partNumber: number;
  partTitle: string;
  summary: string;
  governingConstitutionalArticles: string[];
  primaryEvidencePhases: string[];
}

export interface V4TranslationEntry {
  v4Concept: string;
  v5LocationPart: number;
  constitutionalRelation: string;
  status: 'RETAINED' | 'PROMOTED' | 'REFINED' | 'OPERATIONALIZED';
}

export type EpistemicStance =
  | 'KNOWS'
  | 'SUSPECTS'
  | 'BELIEVES'
  | 'MISREMEMBERS'
  | 'DOES_NOT_KNOW';

export type EpistemicLayer =
  | 'WORLD_FACT'
  | 'CHARACTER_PERCEPTION'
  | 'CHARACTER_INTERPRETATION'
  | 'NARRATIVE_ASSERTION';

export type ClaimTriageStatus = 'PASS' | 'FAIL' | 'DEFERRED';

export class WritingBibleV5 {
  public static readonly VERSION = '5.0.0';
  public static readonly TITLE = 'WRITING BIBLE v5: The Operating System of Literary & Professional Authoring';

  public static readonly PARTS: readonly BibleSection[] = [
    {
      partNumber: 1,
      partTitle: 'PART I — THE CONSTITUTION',
      summary: 'The 8 immutable constitutional invariants, 6 typed priority tiers, and 2 governance charters.',
      governingConstitutionalArticles: ['ARTICLE_I', 'ARTICLE_II', 'ARTICLE_III', 'ARTICLE_IV', 'ARTICLE_V', 'ARTICLE_VI', 'ARTICLE_VII', 'ARTICLE_VIII'],
      primaryEvidencePhases: ['P23', 'P24', 'P25', 'P26'],
    },
    {
      partNumber: 2,
      partTitle: 'PART II — GOVERNING WRITING PRINCIPLES',
      summary: 'Universal writing craft: Authorial intent, psychic distance, voice integrity, and resonant texture.',
      governingConstitutionalArticles: ['ARTICLE_I', 'ARTICLE_VIII'],
      primaryEvidencePhases: ['P4', 'P5', 'P9'],
    },
    {
      partNumber: 3,
      partTitle: 'PART III — STATE, KNOWLEDGE & PROVENANCE',
      summary: 'Information ownership, 4 epistemic layers, and the PASS / FAIL / DEFERRED triage architecture.',
      governingConstitutionalArticles: ['ARTICLE_II', 'ARTICLE_V'],
      primaryEvidencePhases: ['P1', 'P2', 'P8', 'P13'],
    },
    {
      partNumber: 4,
      partTitle: 'PART IV — CHARACTER, CONSCIOUSNESS & ATTENTION',
      summary: 'Cognitive state modeling, sensory attention filtering, and subjective perspective preservation.',
      governingConstitutionalArticles: ['ARTICLE_I'],
      primaryEvidencePhases: ['P4', 'P4.1', 'P5.1'],
    },
    {
      partNumber: 5,
      partTitle: 'PART V — PSYCHOLOGICAL CAUSALITY & CAUSAL GENERATION',
      summary: 'The causal pipeline: Somatic State -> Attention -> Emotion -> Intention -> Action cadence.',
      governingConstitutionalArticles: ['ARTICLE_I', 'ARTICLE_VIII'],
      primaryEvidencePhases: ['P4', 'P5', 'P5.2'],
    },
    {
      partNumber: 6,
      partTitle: 'PART VI — REVISION, LOCAL REPAIR & VALIDATION',
      summary: 'Targeted paragraph-scoped repair, collateral damage prevention, oscillation halts, and dual-track evaluation.',
      governingConstitutionalArticles: ['ARTICLE_III', 'ARTICLE_VI', 'ARTICLE_VII'],
      primaryEvidencePhases: ['P3.1', 'P3.2', 'P6', 'P10.2', 'P16'],
    },
    {
      partNumber: 7,
      partTitle: 'PART VII — REGISTER-SPECIFIC INTELLIGENCE',
      summary: 'Domain-specific packs: Fiction, Academic, Business, Technical, Legal, and General.',
      governingConstitutionalArticles: ['ARTICLE_I', 'ARTICLE_VIII'],
      primaryEvidencePhases: ['P3', 'P8.1', 'P9', 'P10'],
    },
    {
      partNumber: 8,
      partTitle: 'PART VIII — USER INTERACTION, AGENCY & SAFE HANDOFF',
      summary: 'Autonomy without abandonment, cooperative steering, fast mind-change recovery, and safe abstention.',
      governingConstitutionalArticles: ['ARTICLE_IV'],
      primaryEvidencePhases: ['P7', 'P11', 'P17', 'P19'],
    },
    {
      partNumber: 9,
      partTitle: 'PART IX — CALIBRATION, ECONOMIC ROUTING & GOVERNANCE',
      summary: 'Cost/latency optimization, tiered model routing, and decoupled policy versioning.',
      governingConstitutionalArticles: ['ARTICLE_V'],
      primaryEvidencePhases: ['P16', 'P17', 'P18'],
    },
    {
      partNumber: 10,
      partTitle: 'PART X — EVIDENCE COMPENDIUM, LIMITATIONS & FAILED APPROACHES',
      summary: 'L0-L7 evidence hierarchy, the Negative Evidence Ledger (NEG-001 & NEG-002), and final.txt fixture governance.',
      governingConstitutionalArticles: ['ARTICLE_II'],
      primaryEvidencePhases: ['P21', 'P22', 'P26'],
    },
  ];

  public static readonly V4_TRANSLATION_MATRIX: readonly V4TranslationEntry[] = [
    {
      v4Concept: 'Naturalness & Anti-AI Humanization',
      v5LocationPart: 4,
      constitutionalRelation: 'Achieved through Character Consciousness & Attention Filtering rather than superficial token penalties.',
      status: 'PROMOTED',
    },
    {
      v4Concept: 'Rule Hierarchy & Deontic Priority',
      v5LocationPart: 1,
      constitutionalRelation: 'Formalized as Constitution v1.0 Typed Priority Tiers (Tiers 1 through 6).',
      status: 'PROMOTED',
    },
    {
      v4Concept: 'Sensory Specificity & Concrete Detail',
      v5LocationPart: 5,
      constitutionalRelation: 'Derived causally from character professional background and somatic state.',
      status: 'REFINED',
    },
    {
      v4Concept: 'PASS / FAIL / DEFERRED Claim Triaging',
      v5LocationPart: 3,
      constitutionalRelation: 'Enforces Article IV (Safe Abstention) by distinguishing known, contradicted, and unrevealed story elements.',
      status: 'OPERATIONALIZED',
    },
    {
      v4Concept: 'Psychological Causality in Fiction',
      v5LocationPart: 5,
      constitutionalRelation: 'Operationalized as the 6-stage Cognitive Pipeline in the Fiction Pack.',
      status: 'RETAINED',
    },
    {
      v4Concept: 'Surface Banned Word Lists & Simile Quotas',
      v5LocationPart: 10,
      constitutionalRelation: 'Demoted to Negative Evidence Ledger (NEG-001) as counter-productive heuristic clutter.',
      status: 'REFINED',
    },
  ];

  /**
   * Evaluates claim triage according to Bible v5 Part III specifications.
   */
  public static evaluateClaimTriage(
    claim: string,
    stateContext: {
      knownCanon: string[];
      contradictedCanon: string[];
    }
  ): ClaimTriageStatus {
    const claimLower = claim.toLowerCase();

    // Check for contradiction first
    for (const contradicted of stateContext.contradictedCanon) {
      if (claimLower.includes(contradicted.toLowerCase())) {
        return 'FAIL';
      }
    }

    // Check for verified canon match
    for (const known of stateContext.knownCanon) {
      if (claimLower.includes(known.toLowerCase())) {
        return 'PASS';
      }
    }

    return 'DEFERRED';
  }

  /**
   * Validates schema consistency across Writing Bible v5.
   */
  public static validateBibleSchemaConsistency(): {
    isConsistent: boolean;
    totalParts: number;
    unmappedArticles: string[];
    retainedV4ConceptsCount: number;
  } {
    const requiredArticles = [
      'ARTICLE_I', 'ARTICLE_II', 'ARTICLE_III', 'ARTICLE_IV',
      'ARTICLE_V', 'ARTICLE_VI', 'ARTICLE_VII', 'ARTICLE_VIII',
    ];

    const mappedArticles = new Set<string>();
    for (const part of this.PARTS) {
      for (const art of part.governingConstitutionalArticles) {
        mappedArticles.add(art);
      }
    }

    const unmapped = requiredArticles.filter(art => !mappedArticles.has(art));

    return {
      isConsistent: this.PARTS.length === 10 && unmapped.length === 0,
      totalParts: this.PARTS.length,
      unmappedArticles: unmapped,
      retainedV4ConceptsCount: this.V4_TRANSLATION_MATRIX.length,
    };
  }
}
