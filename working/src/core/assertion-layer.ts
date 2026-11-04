/**
 * Writing OS Core — General Assertion & Observation Authorization Layer
 * Abstract classification and validation of assertion types across all writing tasks.
 */

export type AssertionCategory = 
  | 'OBSERVATION'       // Immediate sensory or direct empirical input
  | 'FACT'              // Established ground-truth premise
  | 'INFERENCE'         // Logical deduction from known premises
  | 'INTERPRETATION'    // Subjective appraisal of state
  | 'MEMORY'            // Historical autobiographical recall
  | 'KNOWLEDGE'         // Abstract domain facts
  | 'CAUSATION'         // Claim of cause-and-effect linkage
  | 'PREDICTION'        // Forward-looking projection
  | 'OPINION'           // Value judgment
  | 'UNKNOWN';          // Epistemically opaque / unrevealed

export interface AssertionValidationRecord {
  assertionText: string;
  category: AssertionCategory;
  requiredEvidenceLevel: 'EMPIRICAL' | 'LOGICAL_DEDUCTION' | 'CANONICAL' | 'AUTHORIAL_DECREE' | 'NONE';
  providedEvidence?: string;
  isAuthorized: boolean;
  notes: string;
}

export class AssertionLayer {
  public static classifyAssertion(text: string): AssertionCategory {
    const lower = text.toLowerCase();

    // Memory indicators
    if (/\b(?:remembered|recalled|flashed back|forgot|memory of)\b/.test(lower)) {
      return 'MEMORY';
    }
    // Causation indicators
    if (/\b(?:because|caused by|resulted in|led to|due to)\b/.test(lower)) {
      return 'CAUSATION';
    }
    // Prediction indicators
    if (/\b(?:will|would happen|projected to|expected to|shall)\b/.test(lower)) {
      return 'PREDICTION';
    }
    // Direct observation indicators
    if (/\b(?:saw|heard|smelled|tasted|felt|noticed|watched|observed)\b/.test(lower)) {
      return 'OBSERVATION';
    }
    // Inference indicators
    if (/\b(?:therefore|implies|means that|suggests|deduced)\b/.test(lower)) {
      return 'INFERENCE';
    }
    // Opinion indicators
    if (/\b(?:best|worst|terrible|wonderful|magnificent|inferior)\b/.test(lower)) {
      return 'OPINION';
    }

    return 'FACT';
  }

  public static validateAssertion(
    assertionText: string,
    category: AssertionCategory,
    hasDirectEvidence: boolean,
    isExplicitlyKnown: boolean
  ): AssertionValidationRecord {
    switch (category) {
      case 'MEMORY':
      case 'KNOWLEDGE':
        if (!isExplicitlyKnown) {
          return {
            assertionText,
            category,
            requiredEvidenceLevel: 'CANONICAL',
            isAuthorized: false,
            notes: `Unauthorized ${category} assertion: Subject does not possess grounded access to this knowledge in current state.`,
          };
        }
        break;

      case 'OBSERVATION':
        if (!hasDirectEvidence) {
          return {
            assertionText,
            category,
            requiredEvidenceLevel: 'EMPIRICAL',
            isAuthorized: false,
            notes: `Unauthorized OBSERVATION: Sensory input claimed without grounded presence/vector in current scene.`,
          };
        }
        break;

      case 'CAUSATION':
      case 'INFERENCE':
        if (!hasDirectEvidence) {
          return {
            assertionText,
            category,
            requiredEvidenceLevel: 'LOGICAL_DEDUCTION',
            isAuthorized: false,
            notes: `Ungrounded ${category}: Deductive linkage asserted without supporting antecedent state.`,
          };
        }
        break;

      default:
        break;
    }

    return {
      assertionText,
      category,
      requiredEvidenceLevel: 'NONE',
      isAuthorized: true,
      notes: `Assertion authorized under current state.`,
    };
  }
}
