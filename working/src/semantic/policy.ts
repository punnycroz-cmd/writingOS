// src/semantic/policy.ts
// Scoped [CC]/[LJ] Arbitration Policy (from Iteration 4.2).
//
// Authority is proportional to evidence strength:
//   HARD_STRUCTURAL_BLOCK → non-overridable
//   CLAIM_PATTERN_BLOCK + STATE_SUPPORTED → downgrade to ADVISORY
//   CLAIM_PATTERN_BLOCK + STATE_CONTRADICTION → keep blocking
//   SOFT_SIGNAL → [LJ] adjudicates
//   ADVISORY → [LJ] decides
//
// Rule 0: if [LJ] rejects on faithfulness but all [CC] number/date signals
// are state-SUPPORTED, override to ACCEPT (the [LJ] is overblocking).

import type {
  CanonicalTriageResult,
  SemanticValidationResult,
  SemanticDecision,
  DimensionVerdict,
} from './types.js';

export type CCCategory =
  | 'HARD_STRUCTURAL_BLOCK'
  | 'CLAIM_PATTERN_BLOCK'
  | 'SOFT_SIGNAL'
  | 'ADVISORY';

export interface ArbitrationInput {
  /** The deterministic triage result (provides hardViolations, signals). */
  triageResult: CanonicalTriageResult;
  /** The [LJ] validator's overall decision. */
  ljOverall: 'ACCEPT' | 'REJECT' | 'EXECUTION_ERROR';
  /** The [LJ] validator's faithfulness verdict. */
  ljFaithfulness: DimensionVerdict;
  /** The [LJ] validator's infoOwnership verdict. */
  ljInfoOwnership: DimensionVerdict;
  /**
   * Claim-state resolutions from the deterministic layer's claim-state
   * component. Each is STATE_SUPPORTED / STATE_CONTRADICTION /
   * INSUFFICIENT_STATE / NO_CLAIM_DETECTED.
   */
  claimResolutions: string[];
  /** Whether any [CC] number/date signal is state-SUPPORTED. */
  hasSupportedNumberSignals: boolean;
  /** Whether any [CC] number/date signal is UNKNOWN (hard structural). */
  hasHardStructuralBlocks: boolean;
}

export interface ArbitrationResult {
  decision: SemanticDecision;
  overrideApplied: boolean;
  overrideReason: string;
  arbitrationPath: string;
  effectiveCCSeverity: 'HARD' | 'SOFT' | 'ADVISORY';
}

/**
 * Apply the scoped arbitration policy.
 *
 * This is the canonical decision function for the semantic layer. It
 * consumes the deterministic triage result and the [LJ] validator's
 * verdicts, and produces the final semantic decision.
 */
export function arbitrate(input: ArbitrationInput): ArbitrationResult {
  const {
    triageResult,
    ljOverall,
    ljFaithfulness,
    ljInfoOwnership,
    claimResolutions,
    hasSupportedNumberSignals,
    hasHardStructuralBlocks,
  } = input;

  // If the deterministic layer hard-blocked, respect it.
  if (triageResult.action === 'DETERMINISTIC_BLOCK') {
    return {
      decision: 'REJECT',
      overrideApplied: false,
      overrideReason: `DETERMINISTIC_BLOCK: ${triageResult.reasoning}`,
      arbitrationPath: 'DETERMINISTIC_BLOCK → REJECT (non-overridable)',
      effectiveCCSeverity: 'HARD',
    };
  }

  // If the deterministic layer accepted, fast-path.
  if (triageResult.action === 'DETERMINISTIC_ACCEPT') {
    return {
      decision: 'ACCEPT',
      overrideApplied: false,
      overrideReason: `DETERMINISTIC_ACCEPT: ${triageResult.reasoning}`,
      arbitrationPath: 'DETERMINISTIC_ACCEPT → ACCEPT (fast path)',
      effectiveCCSeverity: 'ADVISORY',
    };
  }

  // If [LJ] had an execution error, propagate it.
  if (ljOverall === 'EXECUTION_ERROR') {
    return {
      decision: 'UNCLEAR',
      overrideApplied: false,
      overrideReason: 'EXECUTION_ERROR: [LJ] could not execute',
      arbitrationPath: 'EXECUTION_ERROR → UNCLEAR (do not silently substitute)',
      effectiveCCSeverity: 'ADVISORY',
    };
  }

  // Rule 0: [LJ] faithfulness overblock override.
  // If [LJ] rejected on faithfulness but all [CC] numbers are state-supported,
  // and there are no hard-structural blocks or contradictions, override to ACCEPT.
  if (
    ljOverall === 'REJECT' &&
    ljFaithfulness === 'FAIL' &&
    !hasHardStructuralBlocks &&
    hasSupportedNumberSignals &&
    !claimResolutions.includes('STATE_CONTRADICTION')
  ) {
    return {
      decision: 'ACCEPT',
      overrideApplied: true,
      overrideReason: `[LJ] faithfulness FAIL on numbers verified SUPPORTED by [CC] — overblock override; no contradiction detected`,
      arbitrationPath: 'LJ faithfulness overblock on supported numbers → OVERRIDE → ACCEPT',
      effectiveCCSeverity: 'ADVISORY',
    };
  }

  // Rule 1: HARD_STRUCTURAL_BLOCK is non-overridable.
  if (hasHardStructuralBlocks) {
    return {
      decision: 'REJECT',
      overrideApplied: false,
      overrideReason: `HARD_STRUCTURAL_BLOCK — non-overridable`,
      arbitrationPath: 'HARD_STRUCTURAL_BLOCK → REJECT (non-overridable)',
      effectiveCCSeverity: 'HARD',
    };
  }

  // Rule 2: CLAIM_PATTERN_BLOCK — check claim-state resolution.
  const hasContradiction = claimResolutions.includes('STATE_CONTRADICTION');
  const hasSupported = claimResolutions.includes('STATE_SUPPORTED');

  if (hasContradiction) {
    return {
      decision: 'REJECT',
      overrideApplied: false,
      overrideReason: `CLAIM_PATTERN_BLOCK + STATE_CONTRADICTION — claim confirmed as violation`,
      arbitrationPath: 'CLAIM_PATTERN_BLOCK + STATE_CONTRADICTION → REJECT',
      effectiveCCSeverity: 'HARD',
    };
  }

  if (hasSupported) {
    // Downgrade to ADVISORY; [LJ] adjudicates.
    return {
      decision: ljOverall === 'ACCEPT' ? 'ACCEPT' : 'REJECT',
      overrideApplied: true,
      overrideReason: `CLAIM_PATTERN_BLOCK + STATE_SUPPORTED — downgraded to ADVISORY; [LJ] adjudicates (${ljOverall})`,
      arbitrationPath: 'CLAIM_PATTERN_BLOCK + STATE_SUPPORTED → DOWNGRADE → LJ adjudicates',
      effectiveCCSeverity: 'ADVISORY',
    };
  }

  // NO_CLAIM_DETECTED or INSUFFICIENT_STATE — defer to [LJ], but be conservative
  // on integrity dimensions (UNCLEAR → REJECT).
  if (ljOverall === 'REJECT') {
    return {
      decision: 'REJECT',
      overrideApplied: false,
      overrideReason: `[LJ] REJECT — deferred to semantic judgment`,
      arbitrationPath: 'NO_CLAIM_DETECTED + LJ REJECT → REJECT',
      effectiveCCSeverity: 'ADVISORY',
    };
  }

  // [LJ] ACCEPT — but check for UNCLEAR on integrity dimensions.
  if (ljFaithfulness === 'UNCLEAR' || ljInfoOwnership === 'UNCLEAR') {
    return {
      decision: 'REJECT',
      overrideApplied: false,
      overrideReason: `Conservative: UNCLEAR on integrity dimension (faith=${ljFaithfulness}, io=${ljInfoOwnership})`,
      arbitrationPath: 'UNCLEAR on integrity → conservative REJECT',
      effectiveCCSeverity: 'ADVISORY',
    };
  }

  return {
    decision: 'ACCEPT',
    overrideApplied: false,
    overrideReason: `[LJ] ACCEPT — no integrity violations`,
    arbitrationPath: 'ADVISORY → LJ ACCEPT → ACCEPT',
    effectiveCCSeverity: 'ADVISORY',
  };
}
