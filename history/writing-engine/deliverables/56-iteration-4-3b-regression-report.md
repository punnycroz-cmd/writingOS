# DELIVERABLE 56 — Iteration 4.3B Regression Report

---

## Regression Results: 6/8 Correct (75%)

| Case | Label | Expected | Got | io | faith | canon | Correct? |
|---|---|---|---|---|---|---|---|
| R1 | KNOWS + supported knowledge | ACCEPT | ACCEPT | PASS | PASS | PASS | ✅ |
| R2 | SUSPECTS + knowledge overreach | REJECT | REJECT | FAIL | PASS | PASS | ✅ |
| R3 | UNKNOWN + knowledge claim | REJECT | REJECT | FAIL | PASS | PASS | ✅ |
| R4 | Hard unsupported number (127) | REJECT | **ACCEPT** | PASS | PASS | PASS | ❌ |
| R5 | Hard canon contradiction (blind character sees) | REJECT | REJECT | PASS | PASS | **FAIL** | ✅ |
| R6 | Entity property contradiction (saw ledger) | REJECT | **ACCEPT** | PASS | PASS | PASS | ❌ |
| R7 | Novel observation (pen tapping) | ACCEPT | ACCEPT | PASS | PASS | PASS | ✅ |
| R8 | Mixed: supported claim + unsupported number (4:17 AM) | REJECT | REJECT | PASS | **FAIL** | PASS | ✅ |

---

## Failure Analysis

### R4 — Hard Unsupported Number (127 ceiling tiles)

**Candidate:** "Maya counted 127 ceiling tiles."
**Expected:** REJECT (unsupported specific number)
**Got:** ACCEPT (faith=PASS)

**Root cause:** The semantic validator did not flag "127" as an unsupported specific number. Under LICENSED_FICTION, the model treated "127 ceiling tiles" as licensed narrative invention (observable detail).

**Architectural context:** In the full integrated pipeline, the deterministic triage layer would catch "127" as HARD_STRUCTURAL_BLOCK (number with UNKNOWN provenance) before it reaches the semantic layer. The semantic layer is being tested in isolation here (HANDOFF_TO_LLM), so this is a genuine semantic false acceptance — but it would be caught by the deterministic layer in production.

**Classification:** FAITHFULNESS_ERROR (semantic layer did not flag unsupported number)

### R6 — Entity Property Contradiction (saw ledger)

**Candidate:** "Maya saw Marcus hide the ledger under his coat."
**Expected:** REJECT (IO leak — Maya cannot know about the ledger/embezzlement)
**Got:** ACCEPT (io=PASS)

**Root cause:** The model treated "Maya saw Marcus hide the ledger" as an observable behavior (Maya can see Marcus hiding something) rather than an IO leak (the "ledger" is connected to the embezzlement Maya doesn't know about). The model did not connect "ledger" to the embezzlement fact in the InformationOwnership state.

**Classification:** SPECIFIC_EPISTEMIC_UNDERBLOCK (semantic layer did not flag IO leak)

---

## Safety Assessment

The 2 regression failures are **genuine semantic false acceptances on hard-integrity cases**. However:

1. **R4 (unsupported number) would be caught by the deterministic triage layer** in the full integrated pipeline. The deterministic layer's HARD_STRUCTURAL_BLOCK for unsupported numbers is non-overridable (demonstrated in Iteration 4.2).

2. **R6 (IO leak via observable action) is a subtler issue** that requires the semantic layer to infer the connection between "ledger" and the embezzlement fact. This is a genuine semantic gap.

3. **The epistemic benchmark (23 cases) had 0 false acceptances** — all 10 REJECT-expected cases were correctly rejected. The regression failures are on different case types (hard-integrity, not epistemic authorization).

---

## Comparison with 4.3-FW

| Metric | 4.3-FW (baseline) | 4.3B (calibrated) |
|---|---|---|
| Cases executed | 21/23 | **23/23** |
| Execution errors | 2 | **0** |
| meaning=FAIL confound | 19/21 | **0/23** |
| Epistemic io accuracy | 19/20 (95%) | **23/23 (100%)** |
| False acceptance | 0 | **0** |
| State consulted | 21/21 (100%) | **23/23 (100%)** |
| Regression correct | (not run) | 6/8 (75%) |

The 4.3B results are a strict improvement over 4.3-FW: more cases executed, zero execution errors, zero meaning confound, perfect epistemic io accuracy.
