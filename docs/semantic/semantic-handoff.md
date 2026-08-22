# Semantic Handoff

## The Integration Boundary

The semantic layer consumes the deterministic triage contract from `gemini/deterministic-triage-v2`. The integration is one-way: the deterministic layer produces a `CanonicalTriageResult`, and the semantic layer consumes it.

## The Contract

```
CanonicalTriageResult {
  action: 'DETERMINISTIC_ACCEPT' | 'DETERMINISTIC_BLOCK' | 'HANDOFF_TO_LLM' | 'EXECUTION_ERROR'
  proofStrength: string
  reasoning: string
  signals: EvidenceSignal[]
  scopedOverridesApplied: string[]
  handoffPayload?: UnifiedHandoffPayload  // present when action === 'HANDOFF_TO_LLM'
}
```

## How the Semantic Layer Consumes It

### DETERMINISTIC_ACCEPT → Fast Path

The semantic validator does NOT call the LLM. It returns `ACCEPT` directly with `validatorMode: 'DETERMINISTIC'`. No unnecessary semantic work.

### DETERMINISTIC_BLOCK → Respect

The semantic validator respects the hard deterministic rejection. It returns `REJECT` with `validatorMode: 'DETERMINISTIC'`. The deterministic layer's hard blocks are non-overridable.

### HANDOFF_TO_LLM → Full Semantic Validation

The semantic validator calls the LLM with:
1. The candidate text and document state
2. The handoff payload's structured signals (claimSignals, observationClass, entityResolution, hardViolations, softSignals)
3. The recommended semantic questions the deterministic layer deferred

The LLM answers the specific semantic questions rather than redoing the deterministic analysis.

### EXECUTION_ERROR → Attempt

The semantic validator attempts validation (the deterministic error may be recoverable semantically). If the LLM also fails, `EXECUTION_ERROR` is recorded.

## The Handoff Payload

```
UnifiedHandoffPayload {
  caseId, candidateText, activePolicy, proofStrength, primaryTriageReason,
  claimSignals: EvidenceSignal[],
  observationClass,
  entityResolution: { aliasMatchStrength, propertySupportStatus, ... },
  hardViolations: string[],
  softSignals: string[],
  stateReferences: { characterIdentity, matchedFacts, relatedCanonEntries },
  recommendedSemanticQuestions: string[]
}
```

The semantic validator uses:
- `hardViolations` — to know what the deterministic layer already proved
- `softSignals` — to know what the deterministic layer flagged as uncertain
- `claimSignals` — to know the claim-state resolution (STATE_SUPPORTED / STATE_CONTRADICTION / etc.)
- `recommendedSemanticQuestions` — to focus the LLM on the specific deferred questions

## The Handoff Adapter

`src/semantic/handoff-adapter.ts` provides:
- `createSemanticInput()` — assembles the SemanticValidationInput from the triage result
- `requiresSemanticValidation()` — determines if the LLM needs to run
- `getSemanticQuestions()` — extracts the deferred questions
- `summarizeHandoffSignals()` — prepares the signals for the LLM prompt

## No Duplication

The semantic layer does NOT reimplement:
- Number/date/entity extraction (deterministic layer's `provenance.ts`, `entities.ts`)
- Claim-state resolution (deterministic layer's `claim-state.ts`)
- Canon keyword detection (deterministic layer's `canon.ts`)
- Observation classification (deterministic layer's `observation.ts`)

It consumes these via the handoff payload's signals.
