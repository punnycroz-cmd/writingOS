# Writing OS Master Memory Export

**Version:** v4.2 (semantic branch)
**Date:** 2026-08-22
**Branch:** `original/semantic-validation-v4-2`

## Current Architecture

```
Writing Bible v4 (governing philosophy — settled, do not modify)
        ↓
Constitution (5 provisional invariants — stable across 4 iterations)
        ↓
Document State (character, info-ownership, canon, deferred checks)
        ↓
Deterministic Triage (gemini/deterministic-triage-v2)
        ↓
Semantic LLM Validation (original/semantic-validation-v4-2)
        ↓
Decision (ACCEPT / REJECT / UNCLEAR)
        ↓
Generation / Repair → Revalidation
```

## Repository / Branch Structure

| Branch | Owner | Purpose |
|---|---|---|
| `main` | shared | Base project |
| `gemini/deterministic-triage-v2` | Gemini agent | Deterministic triage: number/date/entity extraction, claim-state resolution, canon keyword detection, observation classification |
| `original/semantic-validation-v4-2` | original agent | Semantic validation: state-aware LLM validation, invention policy, scoped [CC]/[LJ] arbitration, generation/repair |

The two branches share contracts but do not duplicate implementations.

## Constitution (Provisional, 5 Articles — Stable)

1. **Faithfulness** — no invented specifics; enforced by independent validation
2. **Independent Validation** — generation does not validate itself
3. **Canon/Info-Ownership Integrity** — no canon contradictions; no info leaks
4. **No Fabricated Closure** — don't auto-resolve deferred mechanisms
5. **State Persistence** — state outside the context window

No promotions or demotions across 4 iterations. Writing Bible v5 does not exist.

## Experiments Completed

### Iteration 4 (Triplet Benchmark)
- 20 triplets / 60 variants
- V4 validator: 48/60 (80%)
- 0% false acceptance (safety boundary held)
- 15% false rejection (state-reading errors, vague-uncertainty overblocking)

### Iteration 4.1 (State-Aware A/B Test)
- V4.1 state-aware validator: 56/60 (93%)
- 0% false rejection on A variants
- 0% false acceptance on B variants
- Fixed 8/12 V4 failures via 5 state-aware rules
- New problem: [CC] HARD_BLOCK overrode correct [LJ]

### Iteration 4.2 (Scoped [CC]/[LJ] Arbitration)
- Scoped arbitration: HARD_STRUCTURAL / CLAIM_PATTERN / SOFT_SIGNAL
- Authority proportional to evidence strength
- Mixed-case safety: 4/4 correct (supported claim does not override independent hard violation)
- SM-3 FIXED (Rule 0 override); SM-4 NOT FIXED ([LJ] prompt issue)
- 6/16 live-LLM cases incomplete due to API rate-limiting (recorded as execution errors)

## Unresolved Issues

1. Vague quantifier overblocking ("some money" treated as unsupported)
2. Domain-level suspicion underblocking ("suspected finances" accepted with state=UNKNOWN)
3. Paraphrase overblocking ("hospitals" ≠ "medical centers")
4. Semantic memory equivalence
5. Complex co-reference
6. Broader invention-policy calibration
7. Iteration 4.2 live-LLM completion (API rate-limiting)

See `docs/semantic/semantic-limitations.md` for details.

## Current Roadmap

1. **Near-term:** [LJ] prompt refinement to address vague-quantifier overblocking and domain-suspicion underblocking
2. **Near-term:** Complete Iteration 4.2 live-LLM matrix when API is available
3. **Medium-term:** Paraphrase recognition (semantic-equivalence check or prompt rule)
4. **Medium-term:** Multi-scene testing (state persistence across scenes)
5. **Long-term:** Nonfiction register validation (academic, business, legal)
6. **Not started:** Writing Bible v5

## Integration Boundary

The semantic branch expects from Gemini's deterministic branch:
- `CanonicalTriageResult` with `action` and optional `handoffPayload`
- `UnifiedHandoffPayload` with structured signals, hard violations, soft signals, recommended semantic questions

The semantic branch provides to the integrated system:
- `SemanticValidationResult` with `decision`, `dimensions`, `validatorMode`, `arbitrationPath`
- Generation / repair / revalidation loop

## Important Notes

- **No silent fallback:** if the LLM cannot execute, `EXECUTION_ERROR` is recorded. Never substitute deterministic output for LLM output.
- **Execution provenance:** every result records `validatorMode` (LLM / HYBRID / DETERMINISTIC / EXECUTION_ERROR).
- **Historical experiments are immutable:** do not modify `experiments/` artifacts.
- **The Constitution is provisional:** do not promote new rules without execution evidence from multiple experiments.
