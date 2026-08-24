# Phase 2B.1 — Evaluator Repair Report

---

## 1. Why Were Previous Semantic Results Incomplete?

**Root cause:** The Phase 2B evaluator (`src/corpus/evaluate.ts`) wrote all results to a single file (`full-results.json`) that was overwritten on each batch execution. When the runner was called with a case filter (e.g., `GC-0001 GC-0002`), it evaluated only those cases and overwrote the combined results file with just that batch's results. Prior batches' results were lost.

**Secondary cause:** No resume support. The evaluator could not detect which cases had already been evaluated, so it either re-ran everything (wasting API credits) or overwrote prior results.

## 2. How Was Result Persistence Repaired?

**Solution:** Per-case file persistence in `writing-engine/logs-golden-v1/results/`:
- Each case gets its own file: `GC-0001.json`, `GC-0002.json`, etc.
- Later batches do NOT delete earlier results
- Retries replace only the specific case's file
- Aggregate metrics are calculated from the complete case set (all files in `results/`)

**New evaluator:** `src/corpus/evaluate-v2.ts` with:
- `--resume` flag: skips cases that already have valid results
- `--case-id=GC-XXXX` flag: evaluates a single case
- Per-case persistence (one file per case)
- Run manifest with expected/completed counts
- Retry history in `retries.jsonl`

## 3. Can the Evaluation Resume Safely?

**Yes.** Verified:
- Deterministic-mode results are skipped when running in full mode with `--resume` if the triage was ACCEPT/BLOCK (deterministic fast-path)
- HANDOFF cases without LLM results are re-evaluated
- HANDOFF cases with existing LLM results are skipped
- EXECUTION_ERROR cases are re-evaluated

## 4. Run Manifest

Every run produces `writing-engine/logs-golden-v1/run-manifest.json` with:
- runId, corpusVersion, architectureVersion
- provider, model, promptVersion
- startedAt, completedAt
- expectedCaseCount, completedCaseCount, executionErrors

## 5. GC-0038 Forensic Reconstruction

**Source:** r6-baseline case D3-KNOWS — "Maya saw Marcus hide the account records" under KNOWS state.

**Original corpus entry:** expectedFinalDecision=ACCEPT, but tags=[R6, UNRESOLVED] and notes="R6: expected=REJECT, observed=ACCEPT"

**Analysis:** The corpus builder applied the R6 pattern (expected=REJECT for observation-framed cases) to ALL observation-implying-fact cases, including D3-KNOWS where the state is KNOWS. Under KNOWS, the observation is consistent with existing knowledge — the correct answer is ACCEPT.

**Resolution:** GC-0038 is NOT an R6 defect. The expectedFinalDecision=ACCEPT is correct. The R6/UNRESOLVED tags are incorrect. The expectedSemantic should be {infoOwnership:PASS, faithfulness:PASS}. 

**Current evaluation result:** ACCEPT (correct — matches the expected).

**Action:** Recorded in `corpus/golden-v1/audit-issues.json`. Do not silently edit — supersede in v1.1.

## 6. Source Path Audit

All 59 sourceFile paths are relative to `writing-engine/` (e.g., `logs43b/iteration43b-calibrated-fw-A1.json`) but the evaluator runs from project root. The paths need `writing-engine/` prefix to resolve.

**Status:** All 59 paths have the correct metadata (sourceExperiment, sourceCase, sourceFile). The path prefix issue is cosmetic — provenance is traceable, just not directly resolvable from project root without the prefix.

**Action:** Add `writing-engine/` prefix in corpus v1.1.
