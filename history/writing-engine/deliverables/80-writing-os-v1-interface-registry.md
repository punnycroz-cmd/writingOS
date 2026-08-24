# Writing OS v1 — Interface Registry

## Deterministic Gateway

```typescript
// src/deterministic/index.ts
runDeterministicTriage(
  candidateText: string,
  documentState: DocumentState,
  inventionPolicy: InventionPolicy
): CanonicalTriageResult
```

**Returns:** `{ action, proofStrength, reasoning, signals, scopedOverridesApplied, handoffPayload? }`

**Actions:** `DETERMINISTIC_ACCEPT` | `DETERMINISTIC_BLOCK` | `HANDOFF_TO_LLM` | `EXECUTION_ERROR`

## Semantic Validator

```typescript
// src/semantic/validator.ts
validate(input: SemanticValidationInput): Promise<SemanticValidationResult>
```

**Input:** `{ candidateText, originalText?, documentState, inventionPolicy, triageResult, handoffPayload? }`

**Returns:** `{ decision, dimensions[], epistemicLevelAssessed, stateConsulted, handoffConsumed, validatorMode, reasoning, arbitrationPath?, overrideApplied? }`

**Decisions:** `ACCEPT` | `REJECT` | `UNCLEAR` | `DEFER`

## Repair / Generation

```typescript
// src/semantic/generation.ts
generateRepair(input: GenerationInput): Promise<GenerationResult>

// src/semantic/repair.ts
revalidate(input: SemanticValidationInput, maxRetries?: number): Promise<RepairResult>
```

**RepairResult:** `{ originalValidation, repairAttempted, repairResult, revalidationResult, finalText, repairAccepted }`

## State Transition

```typescript
// Implicit in the integration runner — state transitions are recorded as:
{
  sceneId: string,
  beforeState: { knows, suspects, unknown },
  transition: string,  // e.g. "UNKNOWN_TO_SUSPECTS"
  reason: string,
  afterState: { knows, suspects, unknown },
  provenance: string
}
```

## Arbitration Policy

```typescript
// src/semantic/policy.ts
arbitrate(input: ArbitrationInput): ArbitrationResult
```

**Input:** `{ triageResult, ljOverall, ljFaithfulness, ljInfoOwnership, claimResolutions, hasSupportedNumberSignals, hasHardStructuralBlocks }`

**Returns:** `{ decision, overrideApplied, overrideReason, arbitrationPath, effectiveCCSeverity }`

## Handoff Adapter

```typescript
// src/semantic/handoff-adapter.ts
createSemanticInput(candidateText, documentState, inventionPolicy, triageResult, originalText?): SemanticValidationInput
requiresSemanticValidation(triageAction): boolean
getSemanticQuestions(handoffPayload): string[]
summarizeHandoffSignals(handoffPayload): { hardViolations, softSignals, claimSignals, observationClass, entityResolution }
```

## Audit Log

Every candidate produces a machine-readable JSON log with:
- `caseId`, `sceneId`, `snapshotId`
- `deterministicTriage` (action, proofStrength, reasoning, signals)
- `semanticValidation` (provider, model, validatorMode, dimensions, stateConsulted, latencyMs)
- `finalDecision`, `finalReason`, `correct`
- `repair` (if applicable: original, repaired, revalidation)
- `executionStatus` (SUCCESS | EXECUTION_ERROR)

## Provider Configuration

| Component | Provider | Model |
|---|---|---|
| Deterministic triage | Local TypeScript | N/A (deterministic) |
| Semantic validation | Fireworks AI | `accounts/fireworks/models/qwen3p8-max` |
| Repair generation | Fireworks AI | `accounts/fireworks/models/qwen3p8-max` |

No silent provider switching. `EXECUTION_ERROR` on failure.
