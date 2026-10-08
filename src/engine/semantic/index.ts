// src/semantic/index.ts
// Public entry point for the semantic validation layer.
//
// The semantic layer consumes the deterministic triage contract and performs
// LLM-based semantic adjudication for cases the deterministic layer defers.

export { validate } from './validator';
export { arbitrate, type ArbitrationInput, type ArbitrationResult } from './policy';
export { generateRepair, revalidate } from './repair';
export type {
  SemanticValidationInput,
  SemanticValidationResult,
  SemanticDecision,
  SemanticDimension,
  DimensionVerdict,
  ValidatorMode,
  EpistemicModality,
  InventionPolicy,
  DocumentState,
  CanonicalTriageResult,
  UnifiedHandoffPayload,
  UnifiedTriageOutcome,
} from './types';
export { SYSTEM_PROMPT, STATE_AWARE_PROMPT, INVENTION_POLICY_PROMPTS } from './prompts/system';
