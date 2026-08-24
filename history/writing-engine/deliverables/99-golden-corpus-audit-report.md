# Golden Corpus v1 — Audit Report

**Corpus:** golden-corpus-v1  
**Cases:** 59  
**Status:** DRAFT (not yet frozen)

---

## Corpus Audit Results

### Evaluability Classification

| Category | Count | Meaning |
|---|---|---|
| FULLY_EVALUABLE | 28 | Has triage GT + semantic GT + final GT |
| FINAL_DECISION_ONLY | 21 | Has only final decision GT (no triage/semantic) |
| SEMANTIC_ONLY | 6 | Has semantic GT but no triage GT |
| UNRESOLVED | 4 | R6 known defects |
| **Total** | **59** | |

### Ground-Truth Completeness

| Field | Present | Missing |
|---|---|---|
| expectedTriage (valid) | 32 | 27 (="?") |
| expectedSemantic (non-null) | 38 | 21 (null) |
| expectedFinalDecision | 59 | 0 |

### Source Provenance

- 59 cases have sourceExperiment, sourceCase, sourceFile
- 0 source files exist at the recorded paths (paths are relative to `writing-engine/` but the runner is at project root — path prefix mismatch)
- **Issue:** Source provenance paths need `writing-engine/` prefix to resolve
- **Severity:** LOW (provenance metadata is present, just path resolution needs fixing)

### Duplication Audit

- **Exact duplicates:** 0 (same candidateText + state)
- **Near-duplicates:** 0
- All 59 cases represent distinct (candidateText, state) combinations

### R6 / Known Defects

| Case | Expected | Historical Observed | Status |
|---|---|---|---|
| GC-0031 | REJECT | ACCEPT | UNRESOLVED (R6) |
| GC-0033 | REJECT | ACCEPT | UNRESOLVED (R6) |
| GC-0036 | REJECT | ACCEPT | UNRESOLVED (R6) |
| GC-0038 | ACCEPT | REJECT | UNRESOLVED (R6 — inverted, case where correct behavior was REJECT but corpus expected ACCEPT — this is a corpus quality issue) |

### Ground Truth Types

| Type | Count |
|---|---|
| PROJECT_POLICY | 49 |
| STRUCTURAL | 7 |
| STATE_DERIVED | 3 |

### Corpus Health Dimensions

| Dimension | Value |
|---|---|
| Total cases | 59 |
| Fully evaluable | 28 |
| Scorable deterministic | 28 |
| Scorable semantic | 34 |
| Scorable final | 55 |
| Unresolved | 4 |
| Duplicates | 0 |
| Source provenance complete (metadata) | 59/59 |
| Source files accessible | 0/59 (path prefix issue) |

### Corpus Quality Issues

1. **GC-0038:** Expected=ACCEPT but this is an R6 case where the safe behavior is REJECT. The corpus entry has `expectedFinalDecision: ACCEPT` but `observedFinalDecision: REJECT` and `observedCorrect: false`. This appears to be an inverted R6 case — the expected should be REJECT. **Severity: MEDIUM. Recommended: review and correct in corpus v1.1.**

2. **Source path prefix:** All sourceFile paths lack the `writing-engine/` prefix needed to resolve from project root. **Severity: LOW. Recommended: add prefix in corpus v1.1.**

3. **27 cases have expectedTriage="?":** These are from experiments where deterministic triage was not the focus (4.3B epistemic tests, v1.1 adversarial). The triage routing was not recorded as ground truth. **Severity: LOW. These cases are still scorable on final decision.**

### Is Golden Corpus v1 Ready to Freeze?

**Almost.** Before freezing:
1. Fix GC-0038 (inverted R6 expected value)
2. Fix source path prefixes
3. Optionally: run the full semantic evaluation to confirm baseline

The corpus is structurally sound (0 duplicates, 59 distinct cases, full metadata). The quality issues are minor and fixable without changing the corpus schema.
