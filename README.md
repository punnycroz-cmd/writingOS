# Writing OS

A specification-driven AI rewriting engine that validates writing across multiple registers (fiction, business, academic, legal, marketing, SEO, conversational) using a hybrid deterministic + semantic validation architecture.

## Architecture

```
Writing Bible v4 (governing philosophy)
        ↓
Constitution (5 provisional invariants)
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

## Branch Structure

| Branch | Owner | Purpose |
|---|---|---|
| `main` | shared | Base project (Next.js sandbox) |
| `gemini/deterministic-triage-v2` | Gemini agent | Deterministic triage infrastructure |
| `original/semantic-validation-v4-2` | original agent | Semantic / LLM validation (this branch) |

The two agent branches are **independently reviewable**. They share contracts (deterministic triage result → semantic validation input) but do not duplicate implementations.

## What This Branch Provides

- **Canonical semantic validation interface** (`src/semantic/`)
- **State-aware validator** (consults DocumentState before integrity failure)
- **Invention policy support** (NONE, SOURCE_CONSTRAINED, LICENSED_FICTION, LIMITED_INFERENCE)
- **Scoped [CC]/[LJ] arbitration** (authority proportional to evidence strength)
- **Generation / repair / revalidation** loop
- **Historical experiment artifacts** (`experiments/iteration-4/`, `4-1/`, `4-2/`)
- **Documentation** (`docs/semantic/`)

## What This Branch Expects from Gemini's Deterministic Layer

A `CanonicalTriageResult` with:
- `action`: `DETERMINISTIC_ACCEPT` | `DETERMINISTIC_BLOCK` | `HANDOFF_TO_LLM` | `EXECUTION_ERROR`
- `handoffPayload` (when `HANDOFF_TO_LLM`): structured signals, hard violations, soft signals, recommended semantic questions

## Running Tests

```bash
# Type check
npx tsc --noEmit

# Semantic regression tests (requires LLM for some tests)
bun test tests/semantic_regression.test.ts
```

## Documentation

- `docs/semantic/semantic-validation-v4-2.md` — overview
- `docs/semantic/state-aware-validation.md` — the 5 state-aware rules
- `docs/semantic/invention-policy.md` — the 4 invention policies
- `docs/semantic/semantic-handoff.md` — the deterministic→semantic contract
- `docs/semantic/semantic-limitations.md` — known unresolved problems

## Historical Experiments

- `experiments/iteration-4/` — 20-triplet benchmark (60 variants), V4 validator (80% accuracy)
- `experiments/iteration-4-1/` — State-aware A/B test (V4 vs V4.1, 93% accuracy)
- `experiments/iteration-4-2/` — Scoped [CC]/[LJ] arbitration

Results are frozen and immutable.

## Constitution (Provisional, 5 Articles)

1. **Faithfulness** — no invented specifics; enforced by independent validation
2. **Independent Validation** — generation does not validate itself
3. **Canon/Info-Ownership Integrity** — no canon contradictions; no info leaks
4. **No Fabricated Closure** — don't auto-resolve deferred mechanisms
5. **State Persistence** — state outside the context window

The Constitution is provisional and has been stable across 4 iterations. Writing Bible v4 remains the governing baseline. Writing Bible v5 does not exist.
