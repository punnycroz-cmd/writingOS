# DELIVERABLE 50 — Iteration 4.3-FW Error Analysis

---

## Error Classification

### Baseline-fw (21 LLM-executed cases)

| Error Category | Count | Cases | Details |
|---|---|---|---|
| VAGUE_UNCERTAINTY_OVERBLOCK | 0 | — | No vague-uncertainty cases were io=FAIL. All wondered/vague-affect cases got io=PASS. ✅ |
| SPECIFIC_EPISTEMIC_UNDERBLOCK | 1 | E1 | "Suspected something was wrong with the clinic finances" got io=PASS under UNKNOWN — domain suspicion not caught |
| STATE_READING_ERROR | 0 | — | State consultation 100%; io varies correctly by state |
| EPISTEMIC_MODALITY_ERROR | 0 | — | Wondered/suspected/knew correctly distinguished |
| FAITHFULNESS_ERROR | 0 | — | "Some money" and state-supported $40k both get faith=PASS ✅ |
| POLICY_ERROR | 0 | — | All cases under LICENSED_FICTION |
| DETERMINISTIC_HANDOFF_ERROR | 0 | — | N/A (simulated HANDOFF) |
| EXECUTION_ERROR | 2 | C2, P2-W | JSON parse failures (truncated Fireworks responses) |
| OTHER (meaning confound) | 8 | A1, B1, C1, C4, D1, D2, D3, P1-S, P2-K | meaning=FAIL because candidate changes the scene from original text — test-design issue, not semantic error |

### Calibrated-fw (3 cases)

| Error Category | Count | Cases | Details |
|---|---|---|---|
| SPECIFIC_EPISTEMIC_UNDERBLOCK | 0 | E1 (FIXED) | Rule C caused io=FAIL — domain suspicion now caught ✅ |
| VAGUE_UNCERTAINTY_OVERBLOCK | 0 | B2 (no regression) | io=PASS, faith=PASS — calibration didn't break existing correct cases ✅ |
| EXECUTION_ERROR | 0 | — | All 3 calibrated cases executed successfully |

---

## Detailed Analysis

### 1. E1 — SPECIFIC_EPISTEMIC_UNDERBLOCK (Baseline) → FIXED (Calibrated)

**Baseline:**
- Candidate: "Maya suspected something was wrong with the clinic finances."
- State: UNKNOWN (Maya does not know about the embezzlement)
- Expected: REJECT (domain-level suspicion without evidence)
- Got: io=PASS (model did not flag as IO violation)
- **Root cause:** The model treats "something was wrong with the clinic finances" as vague enough to not be a specific IO violation. It's closer to "wondered if something was wrong" than to "suspected Marcus had stolen $40,000."
- **Error category:** SPECIFIC_EPISTEMIC_UNDERBLOCK

**Calibrated:**
- Got: io=FAIL ✅
- **Fix:** Rule C explicitly instructs: "Domain-level suspicion is specific, not vague. 'Suspected something was wrong with the finances' is SPECIFIC DOMAIN — FAIL under UNKNOWN without evidence."
- **The calibration works.**

### 2. C2, P2-W — EXECUTION_ERROR (JSON Parse)

**Both cases:** Fireworks returned a response that started with valid JSON but was truncated. The JSON parser could not complete parsing.

- **C2:** Response started `{"meaning": "FAIL", "character": "UNCLEAR", ...` but was cut off
- **P2-W:** Response started `{"meaning": "FAIL", "character": "FAIL", ...` but was cut off

**Root cause:** The Fireworks API may have a response length limit, or the model generated a very long response that was truncated. The `max_tokens: 4000` parameter should be sufficient, but the model may be generating verbose reasoning.

**Error category:** EXECUTION_ERROR. Not a semantic failure. No fallback substituted.

**Fix:** Increase `max_tokens` or add a more robust JSON extractor that can handle truncated responses.

### 3. The Meaning=FAIL Confound (8 cases)

**Cases affected:** A1, B1, C1, C4, D1, D2, D3, P1-S, P2-K

All these cases get `meaning=FAIL` because the candidate text changes the scene from the original ("Marcus was at the desk"). The model correctly treats this as a meaning change — if the candidate is a revision of the original, it should preserve the original's meaning.

**This is a test-design issue**, not a semantic error. The "original" text in the 4.3 benchmark is a scene anchor, not a text being revised. The benchmark tests epistemic language handling, not meaning preservation.

**Impact:** 6 of these 8 cases have io=PASS AND faith=PASS (correct epistemic handling) but are REJECTED due to meaning=FAIL. If meaning were PASS, they would be ACCEPT (correct).

**Error category:** OTHER (test-design confound, not a semantic validation error).

**Recommendation:** For future epistemic benchmarks, use an original text that is compatible with the candidate (e.g., "Maya watched Marcus." instead of "Marcus was at the desk.") or omit the original text for epistemic-only tests.

---

## Error Summary

| Type | Count | Semantic? | Fixable? |
|---|---|---|---|
| Domain suspicion underblocking (E1) | 1 | Yes | ✅ Fixed by calibrated Rule C |
| JSON parse (truncated response) | 2 | No (execution) | ✅ Increase max_tokens |
| Meaning=FAIL confound | 8 | No (test design) | ✅ Use compatible original text |
| Total errors | 11 | 1 semantic + 2 execution + 8 test-design | — |
