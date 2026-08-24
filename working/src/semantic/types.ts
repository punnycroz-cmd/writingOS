// src/semantic/types.ts
// Canonical Semantic Validation Types & Result Contracts.
//
// This module defines the semantic layer's public interface. It CONSUMES the
// deterministic triage contract (from gemini/deterministic-triage-v2) and
// produces semantic validation decisions.
//
// The semantic layer does NOT duplicate deterministic logic. It receives the
// deterministic triage result and handoff payload, and performs the semantic
// adjudication that the deterministic layer intentionally defers.

// ── Consumed from the deterministic layer (contract, not copy) ──────────────
// These types mirror the deterministic branch's public contract. If the
// deterministic branch's types change, update these to match. Do NOT
// reimplement deterministic logic here.

export type InventionPolicy = 'NONE' | 'SOURCE_CONSTRAINED' | 'LICENSED_FICTION' | 'LIMITED_INFERENCE';

export type UnifiedTriageOutcome =
  | 'DETERMINISTIC_ACCEPT'
  | 'DETERMINISTIC_BLOCK'
  | 'HANDOFF_TO_LLM'
  | 'EXECUTION_ERROR';

export type EpistemicModality =
  | 'OBSERVATION'
  | 'INTERPRETATION'
  | 'SUSPICION'
  | 'BELIEF'
  | 'KNOWLEDGE'
  | 'CERTAINTY'
  | 'MEMORY'
  | 'UNCERTAIN_INFERENCE';

export interface InfoOwnershipEntry {
  fact: string;
  knows: string[];
  suspects: string[];
  misunderstands: string[];
  unknown: string[];
}

export interface CanonFact {
  content: string;
  classification: 'HARD_CANON' | 'SOFT_CANON' | 'BACKGROUND';
  source?: string;
}

export interface DocumentState {
  character: {
    identity: string;
    goals?: string[];
    fears?: string[];
    beliefs?: string[];
    memories?: string[];
    emotionalState?: string;
    perceptualHabits?: string[];
    voice?: string;
    currentKnowledge?: string[];
  };
  informationOwnership?: {
    entries: InfoOwnershipEntry[];
  };
  canon?: {
    facts: CanonFact[];
  };
  entitySlots?: any[];
  deferredChecks?: any[];
  sceneId?: string;
  revisionId?: number;
}

export interface EvidenceSignal {
  type: string;
  strength: string;
  sourceComponent: string;
  description: string;
}

export interface UnifiedHandoffPayload {
  caseId?: string;
  candidateText: string;
  activePolicy: InventionPolicy;
  proofStrength: string;
  primaryTriageReason: string;
  claimSignals: EvidenceSignal[];
  observationClass?: string;
  entityResolution?: {
    entityId?: string;
    canonicalType?: string;
    aliasMatchStrength: string;
    propertySupportStatus: string;
    matchedProperties: string[];
    contradictedProperties: string[];
  };
  hardViolations: string[];
  softSignals: string[];
  stateReferences: {
    characterIdentity: string;
    matchedFacts: string[];
    relatedCanonEntries: string[];
  };
  recommendedSemanticQuestions: string[];
}

export interface CanonicalTriageResult {
  action: UnifiedTriageOutcome;
  proofStrength: string;
  reasoning: string;
  signals: EvidenceSignal[];
  scopedOverridesApplied: string[];
  handoffPayload?: UnifiedHandoffPayload;
}

// ── Semantic layer's own types ──────────────────────────────────────────────

export type SemanticDecision = 'ACCEPT' | 'REJECT' | 'UNCLEAR' | 'DEFER';

export type SemanticDimension =
  | 'faithfulness'
  | 'informationOwnership'
  | 'canon'
  | 'deferred'
  | 'meaning'
  | 'character'
  | 'voice'
  | 'register'
  | 'intelligibility';

export type DimensionVerdict = 'PASS' | 'FAIL' | 'UNCLEAR';

/** The validator mode that produced this result. NEVER silently substitute. */
export type ValidatorMode = 'LLM' | 'HYBRID' | 'DETERMINISTIC' | 'EXECUTION_ERROR';

/**
 * Input to the semantic validator. Mirrors the deterministic contract's
 * triage result so the semantic layer can consume the handoff payload.
 */
export interface SemanticValidationInput {
  candidateText: string;
  originalText?: string;
  documentState: DocumentState;
  inventionPolicy: InventionPolicy;
  triageResult: CanonicalTriageResult;
  /** Present when triageResult.action === 'HANDOFF_TO_LLM'. */
  handoffPayload?: UnifiedHandoffPayload;
}

export interface SemanticDimensionResult {
  dimension: SemanticDimension;
  verdict: DimensionVerdict;
  reason: string;
}

/**
 * The canonical semantic validation result. Preserves full dimensional
 * evidence and execution provenance. Never collapses all failures into
 * a generic error.
 */
export interface SemanticValidationResult {
  decision: SemanticDecision;
  dimensions: SemanticDimensionResult[];
  /** The epistemic level the validator assessed (for state-aware validation). */
  epistemicLevelAssessed: EpistemicModality | 'MIXED' | 'NONE';
  /** Whether the validator consulted the structured DocumentState. */
  stateConsulted: boolean;
  /** What the validator consulted from the handoff payload. */
  handoffConsumed: boolean;
  /** Which mechanism produced this result. Never silently substitute. */
  validatorMode: ValidatorMode;
  /** Present only when validatorMode === 'EXECUTION_ERROR'. */
  executionError?: string;
  /** Human-readable reasoning chain. */
  reasoning: string;
  /** The scoped arbitration path taken (e.g. 'HARD_STRUCTURAL_BLOCK', 'CLAIM_PATTERN+STATE_SUPPORTED→DOWNGRADE'). */
  arbitrationPath?: string;
  /** Whether the arbitration overrode the [LJ] (e.g. Rule 0 faithfulness overblock override). */
  overrideApplied?: boolean;
}
