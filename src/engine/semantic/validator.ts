// src/semantic/validator.ts
// The canonical semantic validator.
//
// Consumes a SemanticValidationInput (which includes the deterministic
// triage result and handoff payload) and produces a SemanticValidationResult.
//
// Execution provenance is ALWAYS recorded. If the LLM cannot execute,
// EXECUTION_ERROR is returned — never silently substitute a heuristic.

import { llmChat, extractJSON } from '../llm';
import type {
  SemanticValidationInput,
  SemanticValidationResult,
  SemanticDecision,
  SemanticDimension,
  DimensionVerdict,
  ValidatorMode,
  EpistemicModality,
} from './types';
import { buildStateAwareSystemPrompt, buildValidationUserPrompt } from './prompts/state-aware';
import { arbitrate, type ArbitrationInput } from './policy';
import { requiresSemanticValidation, summarizeHandoffSignals } from './handoff-adapter';

const DIMENSIONS: SemanticDimension[] = [
  'meaning', 'character', 'informationOwnership', 'canon',
  'voice', 'register', 'intelligibility', 'deferred', 'faithfulness',
];

const INTEGRITY_DIMENSIONS: SemanticDimension[] = [
  'informationOwnership', 'canon', 'faithfulness', 'deferred',
];

// ── LLM helper with retry + execution-mode logging ──────────────────────────

async function llm(
  system: string,
  user: string,
): Promise<{ content: string; mode: ValidatorMode; error?: string }> {
  const r = await llmChat(system, user);
  if (r.mode === 'EXECUTION_ERROR') return { content: '', mode: 'EXECUTION_ERROR', error: r.error };
  return { content: r.content, mode: 'LLM' };
}

// ── Main validation function ────────────────────────────────────────────────

export async function validate(input: SemanticValidationInput): Promise<SemanticValidationResult> {
  const { candidateText, originalText, documentState, inventionPolicy, triageResult, handoffPayload } = input;

  // Fast path: if the deterministic layer already decided, respect it.
  if (!requiresSemanticValidation(triageResult.action)) {
    const decision: SemanticDecision = triageResult.action === 'DETERMINISTIC_ACCEPT' ? 'ACCEPT' : 'REJECT';
    return {
      decision,
      dimensions: [],
      epistemicLevelAssessed: 'NONE',
      stateConsulted: false,
      handoffConsumed: false,
      validatorMode: 'DETERMINISTIC',
      reasoning: `Fast path: deterministic triage returned ${triageResult.action}. ${triageResult.reasoning}`,
      arbitrationPath: triageResult.action === 'DETERMINISTIC_ACCEPT' ? 'DETERMINISTIC_ACCEPT → fast path' : 'DETERMINISTIC_BLOCK → respect',
    };
  }

  // Full semantic validation: call the LLM with the state-aware prompt.
  const systemPrompt = buildStateAwareSystemPrompt(inventionPolicy);
  const handoffSummary = summarizeHandoffSignals(handoffPayload);
  const userPrompt = buildValidationUserPrompt({
    originalText,
    candidateText,
    documentState,
    handoffPayload: handoffSummary,
    triageAction: triageResult.action,
  });

  const { content, mode, error } = await llm(systemPrompt, userPrompt);

  // EXECUTION_ERROR: never silently substitute.
  if (mode === 'EXECUTION_ERROR') {
    return {
      decision: 'UNCLEAR',
      dimensions: [],
      epistemicLevelAssessed: 'NONE',
      stateConsulted: false,
      handoffConsumed: false,
      validatorMode: 'EXECUTION_ERROR',
      executionError: error,
      reasoning: `LLM execution failed: ${error}. No fallback substituted.`,
      arbitrationPath: 'EXECUTION_ERROR → UNCLEAR',
    };
  }

  // Parse the LLM response.
  let lj: any;
  try {
    lj = extractJSON(content);
  } catch (e: any) {
    return {
      decision: 'UNCLEAR',
      dimensions: [],
      epistemicLevelAssessed: 'NONE',
      stateConsulted: false,
      handoffConsumed: false,
      validatorMode: 'EXECUTION_ERROR',
      executionError: `JSON parse: ${e.message}`,
      reasoning: `LLM returned unparseable output: ${content.slice(0, 200)}`,
      arbitrationPath: 'EXECUTION_ERROR (JSON parse) → UNCLEAR',
    };
  }

  // Build dimension results.
  // `reasons` should be string[], but small models sometimes return an
  // object or string — normalize so dimension matching never crashes.
  const reasonsArr: string[] = Array.isArray(lj.reasons)
    ? lj.reasons.filter((r: any) => typeof r === 'string')
    : typeof lj.reasons === 'string' ? [lj.reasons]
    : lj.reasons && typeof lj.reasons === 'object'
      ? Object.entries(lj.reasons).map(([k, v]) => `${k}: ${v}`)
      : [];
  const normVerdict = (v: any): DimensionVerdict =>
    v === 'PASS' || v === 'FAIL' || v === 'UNCLEAR' ? v
    : typeof v === 'string' && ['PASS','FAIL','UNCLEAR'].includes(v.toUpperCase()) ? v.toUpperCase() as DimensionVerdict
    : 'UNCLEAR';
  const dimensions: { dimension: SemanticDimension; verdict: DimensionVerdict; reason: string }[] = [];
  for (const dim of DIMENSIONS) {
    dimensions.push({
      dimension: dim,
      verdict: normVerdict(lj[dim]),
      reason: reasonsArr.find((r: string) => r.toLowerCase().startsWith(dim.toLowerCase())) || '',
    });
  }

  const overallStr = String(lj.overall || '').toUpperCase();
  const ljOverall = overallStr === 'ACCEPT' ? 'ACCEPT' : overallStr === 'REJECT' ? 'REJECT' : 'EXECUTION_ERROR';
  const ljFaithfulness = normVerdict(lj.faithfulness);
  const ljInfoOwnership = normVerdict(lj.infoOwnership);

  // Extract claim-state resolutions from the handoff payload's signals.
  const claimResolutions = (handoffPayload?.claimSignals || [])
    .map((s: any) => {
      if (s.type.includes('KNOWLEDGE_MATCH') || s.type.includes('SUPPORTED')) return 'STATE_SUPPORTED';
      if (s.type.includes('OVERREACH') || s.type.includes('LEAK') || s.type.includes('CONTRADICTED')) return 'STATE_CONTRADICTION';
      return 'NO_CLAIM_DETECTED';
    });

  const hasSupportedNumberSignals = (handoffPayload?.claimSignals || []).some((s: any) => s.type === 'PROVENANCE_NUMBER_SUPPORTED');
  const hasHardStructuralBlocks = (handoffPayload?.hardViolations || []).length > 0;

  // Apply scoped arbitration.
  const arbInput: ArbitrationInput = {
    triageResult,
    ljOverall,
    ljFaithfulness,
    ljInfoOwnership,
    claimResolutions,
    hasSupportedNumberSignals,
    hasHardStructuralBlocks,
  };
  const arb = arbitrate(arbInput);

  return {
    decision: arb.decision,
    dimensions,
    epistemicLevelAssessed: (lj.epistemicLevelAssessed as EpistemicModality) || 'NONE',
    stateConsulted: lj.stateConsulted === true || lj.stateConsulted === 'true',
    handoffConsumed: !!handoffPayload,
    validatorMode: 'HYBRID',
    reasoning: `${arb.overrideReason}. LJ dimensions: ${dimensions.filter(d => d.verdict === 'FAIL').map(d => d.dimension).join(', ') || 'none failed'}.`,
    arbitrationPath: arb.arbitrationPath,
    overrideApplied: arb.overrideApplied,
  };
}
