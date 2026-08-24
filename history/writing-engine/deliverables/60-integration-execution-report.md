# DELIVERABLE 60 — Integration Execution Report

**Branch:** `integration/writing-os-v1`  
**Provider:** Fireworks AI  
**Model:** `accounts/fireworks/models/qwen3p8-max`

---

## Results: 9/10 Correct, 0 Execution Errors

| Metric | Result |
|---|---|
| Total candidates | 10 |
| Correct | **9/10 (90%)** |
| Execution errors | **0** |
| LLM executions | 4 |
| Deterministic fast-paths | 6 |
| State transitions | 2 |
| Repair loops | 1 |

---

## Triage Routing

| Action | Count | Cases |
|---|---|---|
| DETERMINISTIC_ACCEPT | 3 | S3-C1, S5-C1, S5-C2 (state-supported claims) |
| DETERMINISTIC_BLOCK | 3 | S2-C2, S3-C2, S6-C1 (overreach, unsupported number) |
| HANDOFF_TO_LLM | 4 | S1-C1, S2-C1, S4-C1, S6b-C1 |

**The deterministic triage correctly routes cases.** State-supported claims are fast-pathed (ACCEPT). Epistemic overreach and unsupported numbers are hard-blocked. Ambiguous cases are handed to the semantic LLM.

---

## Per-Scene Results

| Scene | Candidate | Expected | Triage | Semantic | Final | Correct? |
|---|---|---|---|---|---|---|
| S1 | wondered if something was wrong | ACCEPT | HANDOFF | ACCEPT (io=PASS) | ACCEPT | ✅ |
| S2 | noticed discrepancy | ACCEPT | HANDOFF | ACCEPT (io=PASS) | ACCEPT | ✅ |
| S2 | knew Marcus had taken | REJECT | **BLOCK** | REJECT (deterministic) | REJECT | ✅ |
| S3 | suspected "some money" | ACCEPT | **ACCEPT** | ACCEPT (deterministic) | ACCEPT | ✅ |
| S3 | knew Marcus had stolen | REJECT | **BLOCK** | REJECT (deterministic) | REJECT | ✅ |
| S4 | knew what Marcus had done | REJECT | HANDOFF | REJECT (io=FAIL) | REJECT | ✅ |
| S5 | knew Marcus had stolen | ACCEPT | **ACCEPT** | ACCEPT (deterministic) | ACCEPT | ✅ |
| S5 | knew Marcus had stolen $40,000 | ACCEPT | **ACCEPT** | ACCEPT (deterministic) | ACCEPT | ✅ |
| S6 | 127 missing files | REJECT | **BLOCK** | REJECT (deterministic) | REJECT | ✅ |
| S6b | saw Marcus hide ledger | REJECT | HANDOFF | **ACCEPT** (io=PASS) | **ACCEPT** | ❌ |

---

## The One Failure: R6 (S6b)

**Candidate:** "Maya saw Marcus hide the ledger under his coat."  
**State:** UNKNOWN (Maya does not know about the embezzlement)  
**Expected:** REJECT (indirect IO leak)  
**Got:** ACCEPT (io=PASS, faith=PASS)

**Root cause:** The semantic validator treated "Maya saw Marcus hide the ledger" as an observable action rather than an indirect IO leak. It did not connect "ledger" to the embezzlement fact in the InformationOwnership state. The deterministic triage handed off to the LLM (it could not structurally prove the connection), and the LLM accepted it.

**This is the known R6 semantic gap from Iteration 4.3B.** It persists in the integrated pipeline. The failure is recorded honestly — not hidden or repaired.

---

## Repair Loop (S4)

| Step | Result |
|---|---|
| Original candidate | "Maya knew what Marcus had done." |
| Deterministic triage | HANDOFF_TO_LLM |
| Semantic validation | REJECT (io=FAIL, faith=FAIL) |
| Repair generation | "Maya suspected what Marcus might have done." |
| Repair revalidation (deterministic) | HANDOFF_TO_LLM |
| Repair revalidation (semantic) | ACCEPT (io=PASS, faith=PASS) |
| **Repair accepted** | ✅ |

**The repair loop works end-to-end.** The invalid candidate ("knew") was repaired to a valid candidate ("suspected might have") and successfully revalidated.

---

## State Transitions

| Scene | From | To | Reason | Recorded? |
|---|---|---|---|---|
| S2 | UNKNOWN | SUSPECTS | Maya observed a $40,000 discrepancy | ✅ |
| S5 | SUSPECTS | KNOWS | Maya received direct confirmation from the accountant | ✅ |

**State persistence is demonstrated.** The state at S1 (UNKNOWN) is different from S3 (SUSPECTS) and S5 (KNOWS), and the validation outcomes change accordingly.

---

## State-Sensitive Validation

| Proposition | UNKNOWN | SUSPECTS | KNOWS |
|---|---|---|---|
| "Maya knew Marcus had taken the money." | REJECT ✅ (S2) | REJECT ✅ (S3) | ACCEPT ✅ (S5) |
| "Maya wondered if something was wrong." | ACCEPT ✅ (S1) | — | — |
| "Maya suspected Marcus might have taken some money." | — | ACCEPT ✅ (S3) | — |

**The same proposition produces different outcomes under different states.** The system is genuinely state-sensitive.
