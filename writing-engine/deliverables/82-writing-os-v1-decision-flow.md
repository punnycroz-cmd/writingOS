# Writing OS v1 — Decision Flow

## Full Pipeline Decision Tree

```
INPUT: candidateText + documentState + inventionPolicy

STEP 1: DETERMINISTIC TRIAGE
  │
  ├── action = DETERMINISTIC_ACCEPT
  │     → FINAL = ACCEPT (fast path, no LLM)
  │     → Reason: structurally proven state support
  │
  ├── action = DETERMINISTIC_BLOCK
  │     → FINAL = REJECT (non-overridable)
  │     → Reason: hard structural violation (unsupported number, epistemic overreach, canon contradiction)
  │
  ├── action = HANDOFF_TO_LLM
  │     → Continue to Step 2
  │
  └── action = EXECUTION_ERROR
        → FINAL = UNCLEAR (do not silently substitute)
        → Reason: deterministic triage failed

STEP 2: SEMANTIC VALIDATION (LLM)
  │
  │  Receives: candidateText, documentState, handoffPayload (signals, questions)
  │  Returns: 9 dimensions (meaning, character, infoOwnership, canon, voice, register,
  │            intelligibility, deferred, faithfulness) + overall + stateConsulted
  │
  ├── overall = ACCEPT
  │     AND no integrity dimension is UNCLEAR
  │       → FINAL = ACCEPT
  │
  ├── overall = ACCEPT
  │     AND faithfulness OR infoOwnership = UNCLEAR
  │       → FINAL = REJECT (conservative)
  │
  ├── overall = REJECT
  │     → FINAL = REJECT
  │
  └── validatorMode = EXECUTION_ERROR
        → FINAL = UNCLEAR (do not silently substitute)

STEP 3: ARBITRATION (applied to HANDOFF cases)
  │
  │  Rule 0: [LJ] faithfulness FAIL on state-supported numbers → OVERRIDE → ACCEPT
  │  Rule 1: HARD_STRUCTURAL_BLOCK → REJECT (non-overridable)
  │  Rule 2: CLAIM_PATTERN + STATE_CONTRADICTION → REJECT
  │  Rule 2: CLAIM_PATTERN + STATE_SUPPORTED → DOWNGRADE → [LJ] decides
  │  Rule 2: CLAIM_PATTERN + NO_CLAIM + certainty → conservative REJECT
  │  Rule 2: CLAIM_PATTERN + NO_CLAIM + uncertain → DOWNGRADE → [LJ] decides
  │  Rule 3: SOFT_SIGNAL → [LJ] decides
  │  Rule 4: ADVISORY → [LJ] decides

STEP 4: REPAIR (if REJECTED and repair is enabled)
  │
  │  Generate repaired candidate (preserve state, remove violations)
  │  Re-run Steps 1-3 on repaired text
  │
  ├── revalidation = ACCEPT → FINAL = ACCEPT (repaired)
  └── revalidation = REJECT → FINAL = REJECT (repair failed, retain original)

STEP 5: STATE TRANSITION (if accepted)
  │
  │  Record: beforeState, evidence, transition, reason, afterState
  │  Transition to next scene with updated state
```

## Routing Statistics (from v1 + v1.1 + R6 experiments)

| Route | Count | Cases |
|---|---|---|
| DETERMINISTIC_ACCEPT | 5 | v1 S3-C1, S5-C1, S5-C2; v1.1 A1-S2b, A1-S3 |
| DETERMINISTIC_BLOCK | 10 | v1 S2-C2, S3-C2, S6-C1; v1.1 A1-S1, A1-S2, A5-2, A6-1, A7-1, A8-2, A10-1 |
| HANDOFF_TO_LLM | 11 | v1 S1-C1, S2-C1, S4-C1, S6b-C1; v1.1 A3-1, A3-2, A4-1, A5-1, A5-3, A8-1, A9-1 |
| EXECUTION_ERROR | 0 | None across all experiments |

## Epistemic Decision Matrix

| State \ Epistemic | WONDERED | SUSPECTED (vague) | SUSPECTED (domain) | KNEW |
|---|---|---|---|---|
| UNKNOWN | ACCEPT (Rule A) | REJECT | REJECT (Rule C) | REJECT |
| SUSPECTS | ACCEPT | ACCEPT | — | REJECT (overreach) |
| KNOWS | ACCEPT | ACCEPT | — | ACCEPT (Rule E for numbers) |
