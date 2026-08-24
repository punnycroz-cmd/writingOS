# Canonical Golden Corpus Baseline — Reconciliation Report

**Source of Truth:** `writing-engine/logs-golden-v1/canonical-case-ledger.json`  
**Consistency Check:** ALL 8 CHECKS PASSED  
**Date:** 2026-08-22

---

## Authoritative Metrics (from canonical per-case ledger)

### Corpus

| Metric | Value |
|---|---|
| historicalCases | 60 |
| activeCases | 59 |
| supersededCases | 1 (GC-0038 → GC-0038R1) |
| unresolvedCases | 3 |
| r6Cases | 3 |
| sourceExists | 59/59 |

### Deterministic

| Metric | Value |
|---|---|
| scorableTriage | 32 |
| triageCorrect | 31 (97%) |
| triageFalseAccept | 0 |
| triageFalseReject | 0 |
| deterministicFastPathed | 17 (4 ACCEPT + 13 BLOCK) |

### Semantic

| Metric | Value |
|---|---|
| semanticGroundTruthAvailable | 38 |
| semanticExecutionAvailable (LLM) | 30 |
| semanticScoringEligible | 30 |
| ioOwnershipScorable | 30 |
| ioOwnershipCorrect | 25 (83%) |
| faithfulnessScorable | 30 |
| faithfulnessCorrect | 28 (93%) |

### Final Decision

| Metric | Value |
|---|---|
| scorableFinal | 56 |
| finalCorrect | 52 (93%) |
| falseAcceptance | 3 |
| falseRejection | 1 |

### Execution

| Metric | Value |
|---|---|
| executionErrors | 0 |
| llmExecuted | 42 |

### Historical Comparison

| Status | Count |
|---|---|
| STABLE_SUCCESS | 50 |
| REGRESSION | 2 |
| IMPROVEMENT | 2 |
| PERSISTENT_DEFECT | 2 |
| KNOWN_DEFECT | 3 |
| CHANGED_UNSCORABLE | 0 |

---

## Discrepancy Resolution

### 1. Triage Count (audit=28 vs summary=32)
**Resolution:** 32 is authoritative. The audit was stale (run before full evaluation). 32 cases have valid expectedTriage ≠ '?'.

### 2. Semantic Count (audit=34 vs summary=30)
**Resolution:** Both correct, different definitions:
- 38 = semanticGroundTruthAvailable (cases with non-null expectedSemantic)
- 30 = semanticExecutionAvailable (cases actually LLM-evaluated)
- 8 cases have semantic GT but were deterministic fast-paths (not LLM-evaluated)

### 3. Deterministic Fast-Path (summary=0 vs actual=17)
**Resolution:** 17 is authoritative. The summary had a null-currentSemantic bug. 17 cases (4 ACCEPT + 13 BLOCK) were fast-pathed by deterministic triage.

### 4. False Accept/Reject
**Resolution:** 3 false acceptances (GC-0024, GC-0025, GC-0054), 1 false rejection (GC-0022). These are the exact cases from the canonical ledger.

### 5. GC-0038
**Resolution:** Superseded by GC-0038R1. GC-0038R1 uses GC-0038's per-case result (same candidate, same state, corrected tags). GC-0038R1 is NOT R6/UNRESOLVED. Active R6 count = 3.

---

## R6 Cases (from canonical ledger)

| Case | State | Expected | Historical | Current | Status |
|---|---|---|---|---|---|
| GC-0031 | UNKNOWN | REJECT | ACCEPT | REJECT | IMPROVEMENT ✅ |
| GC-0033 | UNKNOWN | REJECT | ACCEPT | ACCEPT | PERSISTENT_DEFECT ❌ |
| GC-0036 | UNKNOWN | REJECT | ACCEPT | REJECT | IMPROVEMENT ✅ |

GC-0038R1 is NOT R6 (KNOWS state, expected ACCEPT, current ACCEPT = correct).

---

## Consistency Checks (ALL PASSED)

| Check | Result |
|---|---|
| active_count | ✓ 59 == 60 - 1 |
| hc_sum | ✓ 59 == 59 |
| no_superseded_in_active | ✓ 0 |
| r6_count | ✓ 3 |
| final_sum | ✓ 3+1+52 == 56 |
| all_have_results | ✓ 59 == 59 |
| source_paths | ✓ 59 exist, 0 missing |
| no_exec_errors | ✓ 0 |

---

## Freeze Decision

**ALL CONSISTENCY CHECKS PASSED.**

Golden Corpus v1 is **READY TO FREEZE**.

The canonical per-case ledger is the single source of truth. All metrics are derived from it. All reports must be regenerated from it.
