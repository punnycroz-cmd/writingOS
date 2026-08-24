// src/semantic/handoff-adapter.ts
// Adapts the deterministic triage result into the semantic validation input.
//
// This module is the integration boundary between Gemini's deterministic
// branch and this semantic branch. It does NOT reimplement deterministic
// logic — it consumes the CanonicalTriageResult contract and prepares the
// SemanticValidationInput for the semantic validator.

import type {
  CanonicalTriageResult,
  SemanticValidationInput,
  DocumentState,
  InventionPolicy,
  UnifiedTriageOutcome,
} from './types.js';

/**
 * Creates the semantic validation input from a deterministic triage result.
 *
 * If the triage action is DETERMINISTIC_ACCEPT, the semantic layer can
 * fast-path (no LLM call needed). If DETERMINISTIC_BLOCK, the semantic
 * layer respects the hard block. If HANDOFF_TO_LLM, the semantic layer
 * performs full validation using the handoff payload.
 */
export function createSemanticInput(
  candidateText: string,
  documentState: DocumentState,
  inventionPolicy: InventionPolicy,
  triageResult: CanonicalTriageResult,
  originalText?: string,
): SemanticValidationInput {
  return {
    candidateText,
    originalText,
    documentState,
    inventionPolicy,
    triageResult,
    handoffPayload: triageResult.handoffPayload,
  };
}

/**
 * Determines whether the semantic validator needs to run at all.
 *
 * - DETERMINISTIC_ACCEPT → false (fast path; no semantic work needed)
 * - DETERMINISTIC_BLOCK → false (hard deterministic rejection; semantic layer respects)
 * - HANDOFF_TO_LLM → true (semantic adjudication required)
 * - EXECUTION_ERROR → true (semantic layer should attempt, but may also error)
 */
export function requiresSemanticValidation(triageAction: UnifiedTriageOutcome): boolean {
  return triageAction === 'HANDOFF_TO_LLM' || triageAction === 'EXECUTION_ERROR';
}

/**
 * Extracts the semantic questions the LLM should answer from the handoff payload.
 * These are the questions the deterministic layer explicitly deferred.
 */
export function getSemanticQuestions(handoffPayload?: any): string[] {
  if (!handoffPayload?.recommendedSemanticQuestions) return [];
  return handoffPayload.recommendedSemanticQuestions;
}

/**
 * Summarizes the deterministic signals for the LLM prompt, so the LLM
 * can focus on the deferred semantic questions without redoing the
 * deterministic analysis.
 */
export function summarizeHandoffSignals(handoffPayload?: any): {
  hardViolations: string[];
  softSignals: string[];
  claimSignals: string[];
  observationClass: string | null;
  entityResolution: string | null;
} {
  if (!handoffPayload) {
    return { hardViolations: [], softSignals: [], claimSignals: [], observationClass: null, entityResolution: null };
  }
  return {
    hardViolations: handoffPayload.hardViolations || [],
    softSignals: handoffPayload.softSignals || [],
    claimSignals: (handoffPayload.claimSignals || []).map((s: any) => `${s.type} (${s.strength}): ${s.description}`),
    observationClass: handoffPayload.observationClass || null,
    entityResolution: handoffPayload.entityResolution
      ? `${handoffPayload.entityResolution.aliasMatchStrength} / ${handoffPayload.entityResolution.propertySupportStatus}`
      : null,
  };
}
