# Semantic Validation v4.2

## Overview

The semantic validation layer is the LLM-based validation component of the Writing OS. It consumes the deterministic triage contract (from `gemini/deterministic-triage-v2`) and performs semantic adjudication for cases the deterministic layer defers (`HANDOFF_TO_LLM`).

## Architecture

```
Candidate Text + DocumentState + InventionPolicy
            ↓
   Deterministic Triage (Gemini's branch)
            ↓
    ┌───────────────┬─────────────────┬──────────────────┐
    │ ACCEPT        │ BLOCK           │ HANDOFF_TO_LLM   │
    │ (fast path)   │ (non-overridable│ (semantic work)  │
    └───────────────┴─────────────────┴──────────────────┘
                                           ↓
                              Semantic Validator (this branch)
                                           ↓
                              ┌────────────┬─────────────┐
                              │ ACCEPT     │ REJECT      │ UNCLEAR
                              └────────────┴─────────────┘
                                           ↓
                              Generation / Repair (if REJECTED)
                                           ↓
                                    Revalidation
```

## What This Branch Owns

- **Semantic validation** (faithfulness, info-ownership, canon, deferred checks)
- **State-aware validation** (consulting DocumentState before integrity failure)
- **Invention policy interpretation** (NONE, SOURCE_CONSTRAINED, LICENSED_FICTION, LIMITED_INFERENCE)
- **Scoped [CC]/[LJ] arbitration** (authority proportional to evidence strength)
- **Generation / repair** (producing revised candidates)
- **Revalidation** (independent re-checking of repaired candidates)

## What This Branch Does NOT Own

- Deterministic triage (owned by `gemini/deterministic-triage-v2`)
- Number/date/entity extraction (owned by deterministic layer)
- Claim-state resolution (owned by deterministic layer)
- Canon keyword detection (owned by deterministic layer)

## Key Modules

| Module | Purpose |
|---|---|
| `src/semantic/types.ts` | Canonical types and contracts |
| `src/semantic/validator.ts` | The semantic validator (LLM-based) |
| `src/semantic/policy.ts` | Scoped [CC]/[LJ] arbitration policy |
| `src/semantic/handoff-adapter.ts` | Consumes the deterministic handoff payload |
| `src/semantic/generation.ts` | Repair generation |
| `src/semantic/repair.ts` | Repair + revalidation loop |
| `src/semantic/prompts/system.ts` | System prompts and invention-policy descriptions |
| `src/semantic/prompts/state-aware.ts` | State-aware validator prompt assembly |

## Execution Provenance

Every validation result records `validatorMode`:
- `LLM` — the LLM produced this result
- `HYBRID` — the LLM produced the dimensional verdicts; the arbitration policy made the final decision
- `DETERMINISTIC` — the deterministic triage fast-pathed (ACCEPT or BLOCK)
- `EXECUTION_ERROR` — the LLM could not execute; no fallback substituted

**Never silently substitute deterministic output for LLM output.** This is a permanent experiment-integrity requirement.

## Running Tests

```bash
# Type check
npx tsc --noEmit

# Semantic regression tests (requires LLM for some tests)
bun test tests/semantic_regression.test.ts
```

## Historical Experiments

- `experiments/iteration-4/` — 20-triplet benchmark (60 variants), V4 validator
- `experiments/iteration-4-1/` — State-aware A/B test (V4 vs V4.1)
- `experiments/iteration-4-2/` — Scoped [CC]/[LJ] arbitration

Results are frozen and immutable.
