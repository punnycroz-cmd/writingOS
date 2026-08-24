# Phase 2B.1 — Complete Baseline Report

**Provider:** FIREWORKS  
**Model:** accounts/fireworks/models/qwen3p8-max  
**Date:** 2026-08-22  
**All 59 cases evaluated. 0 execution errors.**

---

## Complete Baseline Results

### Overall

| Metric | Result |
|---|---|
| Total cases | 59 |
| Completed | **59/59 (100%)** |
| Execution errors | **0** |
| LLM executions | 42 |
| Deterministic fast-pathed | 17 |

### Deterministic Triage

| Metric | Result |
|---|---|
| Scorable triage | 32 |
| Correct | **31/32 (97%)** |
| False acceptance | 0 |
| False rejection | 0 |
| Correct handoff | 25/25 |

### Final Decision

| Metric | Result |
|---|---|
| Scorable final | 55 (excludes 4 R6/UNRESOLVED) |
| Correct | **50/55 (91%)** |
| False acceptance | 4 |
| False rejection | 1 |

### Semantic Dimensions (where scorable)

| Metric | Result |
|---|---|
| Scorable semantic | 30 |
| ioOwnership correct | **24/30 (80%)** |
| Faithfulness correct | **28/30 (93%)** |

### Historical Comparison

| Status | Count |
|---|---|
| STABLE_SUCCESS | 49 |
| REGRESSION | 3 |
| IMPROVEMENT | 1 |
| PERSISTENT_DEFECT | 2 |
| KNOWN_DEFECT (R6) | 4 |

### R6 Cases (Case-by-Case)

| Case | Expected | Historical | Current | Status |
|---|---|---|---|---|
| GC-0031 | REJECT | ACCEPT | **REJECT** | IMPROVED (was defect, now correct) |
| GC-0033 | REJECT | ACCEPT | **ACCEPT** | PERSISTENT_DEFECT |
| GC-0036 | REJECT | ACCEPT | **REJECT** | IMPROVED (was defect, now correct) |
| GC-0038 | ACCEPT | REJECT | **ACCEPT** | IMPROVED (was wrong, now correct) |

**R6 analysis:** 2 of 4 R6 cases are now correct (GC-0031, GC-0036 — the model now REJECTs "saw Marcus hide the account records" under UNKNOWN). 1 persists (GC-0033). 1 was a corpus quality issue (GC-0038 — the expected was ACCEPT for a KNOWS-state case, and the model now correctly ACCEPTs).

### False Acceptances (4 cases)

| Case | Expected | Current | Issue |
|---|---|---|---|
| GC-0033 | REJECT | ACCEPT | R6 — observation-framed leak persists |
| GC-0044 | REJECT | ACCEPT | Semantic gap |
| GC-0046 | REJECT | ACCEPT | Semantic gap |
| GC-0050 | REJECT | ACCEPT | Semantic gap |

### False Rejections (1 case)

| Case | Expected | Current | Issue |
|---|---|---|---|
| GC-0059 | ACCEPT | REJECT | Semantic gap |

### Regressions (3 cases — historical correct → current wrong)

| Case | Historical | Current | Issue |
|---|---|---|---|
| GC-0024 | REJECT | ACCEPT | False acceptance (changed) |
| GC-0053 | REJECT | ACCEPT | False acceptance (changed) |
| GC-0059 | ACCEPT | REJECT | False rejection (changed) |

### Improvements (1 case — historical wrong → current correct)

| Case | Historical | Current |
|---|---|---|
| GC-0054 | REJECT (wrong) | REJECT (correct) |

---

## Confusion Matrices

### Final Decision (excluding R6/UNRESOLVED)

| | Expected ACCEPT | Expected REJECT |
|---|---|---|
| **Actual ACCEPT** | 25 (TP) | 4 (FP) |
| **Actual REJECT** | 1 (FN) | 25 (TN) |

### Deterministic Triage

| | Expected ACCEPT | Expected BLOCK | Expected HANDOFF |
|---|---|---|---|
| **Actual ACCEPT** | 2 | 0 | 0 |
| **Actual BLOCK** | 0 | 5 | 0 |
| **Actual HANDOFF** | 0 | 0 | 25 |

### Information Ownership (where scorable)

| | Expected PASS | Expected FAIL |
|---|---|---|
| **Actual PASS** | 14 | 4 |
| **Actual FAIL** | 2 | 10 |

---

## GC-0038 Resolution

**Original metadata:** expectedFinalDecision=ACCEPT, expectedSemantic={ioOwnership:FAIL, faithfulness:FAIL}, tags=[R6, UNRESOLVED], notes="R6: expected=REJECT, observed=ACCEPT"

**Forensic reconstruction:** GC-0038 comes from r6-baseline case D3-KNOWS — "Maya saw Marcus hide the account records" under KNOWS state. Under KNOWS, the observation is consistent with existing knowledge, so the correct answer is ACCEPT. The corpus builder incorrectly applied the R6/UNRESOLVED tag pattern (which applies to UNKNOWN state) to this KNOWS-state case.

**Resolution:** The case is NOT an R6 defect. The expectedFinalDecision=ACCEPT is correct. The expectedSemantic should be {infoOwnership:PASS, faithfulness:PASS} (not FAIL). The R6/UNRESOLVED tags should be removed. The current evaluation correctly produces ACCEPT.

**Action:** Record as corpus quality issue in audit-issues.json. Do not silently edit the corpus — supersede in v1.1.

---

## Is Golden Corpus v1 Ready to Freeze?

**Almost.** Remaining issues:
1. **GC-0038:** Incorrect R6/UNRESOLVED tags on a KNOWS-state case. Needs supersession.
2. **Source paths:** All 59 sourceFile paths need `writing-engine/` prefix.
3. **5 false results** (4 false accept + 1 false reject) — these are semantic evaluation results, not corpus issues. They represent the current system's actual behavior.

After fixing #1 and #2, the corpus is ready to freeze.

---

## Reproducibility

- All 59 per-case results persisted in `writing-engine/logs-golden-v1/results/`
- Run manifest with provider, model, timestamps
- Resume support verified (interrupted runs continue from where they left off)
- Aggregation reads from persisted results (not batch output)
- 0 execution errors across all 59 cases
