// src/semantic/repair.ts
// Repair + revalidation loop.
//
// When a candidate is REJECTED or UNCLEAR, the repair module generates a
// revised candidate and revalidates it. The revalidation uses the same
// semantic validator (never self-certifies).

import type {
  SemanticValidationInput,
  SemanticValidationResult,
  DocumentState,
  InventionPolicy,
  CanonicalTriageResult,
} from './types.js';
import { validate } from './validator.js';
import { generateRepair, type GenerationResult } from './generation.js';

export interface RepairResult {
  originalValidation: SemanticValidationResult;
  repairAttempted: boolean;
  repairResult: GenerationResult | null;
  revalidationResult: SemanticValidationResult | null;
  /** The final accepted text (either the repaired candidate or the original). */
  finalText: string;
  /** Whether the repair was accepted by revalidation. */
  repairAccepted: boolean;
}

/**
 * Attempt to repair a rejected/unclear candidate and revalidate.
 *
 * The revalidation is independent — the generator does not certify its
 * own output. If the repair is also rejected, the original text is retained.
 */
export async function revalidate(
  input: SemanticValidationInput,
  maxRetries: number = 1,
): Promise<RepairResult> {
  const originalValidation = await validate(input);

  // If the original was accepted, no repair needed.
  if (originalValidation.decision === 'ACCEPT') {
    return {
      originalValidation,
      repairAttempted: false,
      repairResult: null,
      revalidationResult: null,
      finalText: input.candidateText,
      repairAccepted: true,
    };
  }

  // If execution error, do not attempt repair.
  if (originalValidation.validatorMode === 'EXECUTION_ERROR') {
    return {
      originalValidation,
      repairAttempted: false,
      repairResult: null,
      revalidationResult: null,
      finalText: input.originalText || input.candidateText,
      repairAccepted: false,
    };
  }

  // Attempt repair.
  const repairResult = await generateRepair({
    originalText: input.originalText || input.candidateText,
    candidateText: input.candidateText,
    documentState: input.documentState,
    inventionPolicy: input.inventionPolicy,
    validationResult: originalValidation,
  });

  if (repairResult.executionMode === 'EXECUTION_ERROR') {
    return {
      originalValidation,
      repairAttempted: true,
      repairResult,
      revalidationResult: null,
      finalText: input.originalText || input.candidateText,
      repairAccepted: false,
    };
  }

  // Revalidate the repaired candidate.
  const revalidationInput: SemanticValidationInput = {
    ...input,
    candidateText: repairResult.revisedText,
  };
  const revalidationResult = await validate(revalidationInput);

  const repairAccepted = revalidationResult.decision === 'ACCEPT';

  return {
    originalValidation,
    repairAttempted: true,
    repairResult,
    revalidationResult,
    finalText: repairAccepted ? repairResult.revisedText : (input.originalText || input.candidateText),
    repairAccepted,
  };
}

// Re-export generateRepair for convenience.
export { generateRepair } from './generation.js';
