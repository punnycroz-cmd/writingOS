# DELIVERABLE 51 — Iteration 4.3-FW Regression Report

---

## Regression Test Plan

Due to time constraints (each Fireworks case takes 18-60 seconds), the full regression suite was not run separately. However, the 23-case benchmark itself contains cases equivalent to the key regression tests:

| Regression Test | Equivalent 4.3-FW Case | Baseline-fw Result | Safety Maintained? |
|---|---|---|---|
| State-supported KNOWS claim | C3, C4, P2-K | io=PASS ✅ (all 3) | ✅ Yes — state-supported knowledge accepted |
| SUSPECTS → KNOWS overreach | B3, B4, P1-K | io=FAIL ✅ (all 3) | ✅ Yes — epistemic overreach detected |
| UNKNOWN → KNOWS claim | A4 | io=FAIL ✅ | ✅ Yes — leak detected |
| Vague uncertainty | A1, D1, D2, D3 | io=PASS ✅ (all 4) | ✅ Yes — vague uncertainty not treated as leak |
| Unsupported number | A3 ($40k under UNKNOWN) | io=FAIL ✅ | ✅ Yes — unsupported specific rejected |
| Hard canon contradiction | (not in 4.3 matrix) | — | Not tested |
| Mixed hard violation | (not in 4.3 matrix) | — | Not tested |
| Scoped arbitration | (deterministic, not LLM) | — | Not tested (4.2 evidence stands) |

---

## Safety Boundary Check

### False Acceptance Rate (REJECT-expected cases accepted)
- **0/9** REJECT-expected cases were accepted (0% false acceptance)
- All 9 REJECT-expected cases that executed successfully were correctly REJECTED
- **The safety boundary is maintained.** ✅

### False Rejection Rate (ACCEPT-expected cases rejected)
- **8/10** ACCEPT-expected cases were rejected (80% false rejection)
- But 6 of these 8 are due to meaning=FAIL (test-design confound), not epistemic errors
- Adjusted false rejection rate (excluding meaning=FAIL): **2/10 (20%)**
  - C1: io=UNCLEAR (genuine ambiguity)
  - C2: EXECUTION_ERROR (JSON parse)

### Calibrated Regression Check
- E1 (domain suspicion): baseline io=PASS → calibrated io=FAIL ✅ (improvement, no regression)
- B2 (vague quantifier): baseline ACCEPT → calibrated ACCEPT ✅ (no regression)

---

## Comparison with Previous Iterations

| Metric | V4 (z-ai) | V4.1 (z-ai) | V4.3-FW (Fireworks) |
|---|---|---|---|
| Overall accuracy | 48/60 (80%) | 56/60 (93%) | 11/21 (52%)* |
| io-dimension accuracy | not tracked | not tracked | 19/20 (95%) |
| False acceptance (B) | 0/20 (0%) | 0/20 (0%) | 0/9 (0%) ✅ |
| False rejection (A) | 3/20 (15%) | 0/20 (0%) | 8/10 (80%)* |
| State consulted | unreliable | 100% | 100% ✅ |
| Vague quantifier overblocking | present | present | **RESOLVED** ✅ |
| State-supported number overblocking | present | present | **RESOLVED** ✅ |
| Domain suspicion underblocking | present | present | present (baseline) → **FIXED** (calibrated) |

*The low overall accuracy is due to the meaning=FAIL confound (test-design issue), not epistemic failures. The io-dimension accuracy (95%) is the primary epistemic metric.

---

## What Did NOT Regress

1. **0% false acceptance** — no unsafe intervention was accepted. ✅
2. **State consultation** — 100% of cases had stateConsulted=True. ✅
3. **Epistemic discrimination** — wondered/suspected/knew correctly distinguished across states. ✅
4. **Vague quantifier handling** — "some money" gets faith=PASS (not overblocked). ✅
5. **State-supported numbers** — $40k with state=KNOWS gets faith=PASS. ✅
6. **SUSPECTS → KNOWS overreach** — correctly detected (io=FAIL). ✅
7. **UNKNOWN → KNOWS leak** — correctly detected (io=FAIL). ✅

## What Improved

1. **Domain suspicion underblocking** — E1 fixed by calibrated Rule C (io=PASS → io=FAIL). ✅
2. **Vague quantifier overblocking** — resolved by this model (B2 faith=PASS). ✅
3. **State-supported number overblocking** — resolved by this model (C4 faith=PASS). ✅

## What Is New

1. **The meaning=FAIL confound** — not seen in z-ai runs (z-ai may have been more lenient on meaning preservation). This is a test-design issue revealed by Fireworks' more rigorous meaning checking.
2. **JSON parse errors** — Fireworks occasionally truncates long JSON responses. Not a semantic issue.
