// src/semantic/validator.ts
// The canonical semantic validator.
//
// Consumes a SemanticValidationInput (which includes the deterministic
// triage result and handoff payload) and produces a SemanticValidationResult.
//
// Execution provenance is ALWAYS recorded. If the LLM cannot execute,
// EXECUTION_ERROR is returned — never silently substitute a heuristic.

import ZAI from 'z-ai-web-dev-sdk';
import type {
  SemanticValidationInput,
  SemanticValidationResult,
  SemanticDecision,
  SemanticDimension,
  DimensionVerdict,
  ValidatorMode,
  EpistemicModality,
} from './types.js';
import { buildStateAwareSystemPrompt, buildValidationUserPrompt } from './prompts/state-aware.js';
import { arbitrate, type ArbitrationInput } from './policy.js';
import { requiresSemanticValidation, summarizeHandoffSignals } from './handoff-adapter.js';

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
  try {
    const zai = await ZAI.create();
    for (let attempt = 0; attempt <= 4; attempt++) {
      try {
        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          thinking: { type: 'disabled' },
        });
        return {
          content: completion.choices[0]?.message?.content ?? '',
          mode: 'LLM',
        };
      } catch (e: any) {
        const msg = String(e?.message || e);
        if ((msg.includes('429') || msg.includes('Too many requests')) && attempt < 4) {
          await new Promise((r) => setTimeout(r, 15000 * Math.pow(2, attempt)));
          continue;
        }
        throw e;
      }
    }
    return { content: '', mode: 'EXECUTION_ERROR', error: 'max retries exceeded' };
  } catch (e: any) {
    return { content: '', mode: 'EXECUTION_ERROR', error: String(e?.message || e) };
  }
}

function extractJSON(text: string): any {
  // Try direct parse
  try { return JSON.parse(text); } catch {}
  // Try fenced block
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  // Try first { ... last }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) {
    try { return JSON.parse(text.slice(first, last + 1)); } catch {}
  }
  throw new Error('Could not parse JSON from LLM output');
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
  const dimensions: { dimension: SemanticDimension; verdict: DimensionVerdict; reason: string }[] = [];
  for (const dim of DIMENSIONS) {
    dimensions.push({
      dimension: dim,
      verdict: lj[dim] || 'UNCLEAR',
      reason: lj.reasons?.find((r: string) => r.toLowerCase().startsWith(dim.toLowerCase())) || '',
    });
  }

  const ljOverall = lj.overall === 'ACCEPT' ? 'ACCEPT' : lj.overall === 'REJECT' ? 'REJECT' : 'EXECUTION_ERROR';
  const ljFaithfulness = lj.faithfulness || 'UNCLEAR';
  const ljInfoOwnership = lj.infoOwnership || 'UNCLEAR';

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
    stateConsulted: lj.stateConsulted === true,
    handoffConsumed: !!handoffPayload,
    validatorMode: 'HYBRID',
    reasoning: `${arb.overrideReason}. LJ dimensions: ${dimensions.filter(d => d.verdict === 'FAIL').map(d => d.dimension).join(', ') || 'none failed'}.`,
    arbitrationPath: arb.arbitrationPath,
    overrideApplied: arb.overrideApplied,
  };
}
