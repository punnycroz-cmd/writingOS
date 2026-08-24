# DELIVERABLE 54 — Iteration 4.3B Execution Report

**Provider:** Fireworks AI  
**Model:** `accounts/fireworks/models/qwen3p8-max`  
**Executed:** 2026-08-22

---

## Headline Results

| Metric | Result |
|---|---|
| Total cases | 23 |
| LLM executed | **23/23 (100%)** |
| Execution errors | **0** |
| Final-decision correct | **23/23 (100%)** |
| Epistemic io accuracy | **23/23 (100%)** |
| meaning=FAIL count | **0** (confound eliminated) |
| State consulted | **23/23 (100%)** |
| False acceptance (REJECT→ACCEPT) | **0** |
| False rejection (ACCEPT→REJECT) | **0** |

---

## The Meaning Confound Is Eliminated

In 4.3-FW, 19/21 cases got `meaning=FAIL` because the candidate changed the scene from the original text. In 4.3B, with `originalText = null` and the epistemic-only framing instruction, **0/23 cases got meaning=FAIL**. The confound is completely resolved.

---

## Per-Group Results

| Group | State | Cases | Correct | io Accuracy |
|---|---|---|---|---|
| A | UNKNOWN | 4 | 4/4 ✅ | 4/4 ✅ |
| B | SUSPECTS | 4 | 4/4 ✅ | 4/4 ✅ |
| C | KNOWS | 4 | 4/4 ✅ | 4/4 ✅ |
| D | Vague affect (UNKNOWN) | 3 | 3/3 ✅ | 3/3 ✅ |
| E | Domain suspicion (UNKNOWN) | 3 | 3/3 ✅ | 3/3 ✅ |
| PAIR | Near-identical pairs | 5 | 5/5 ✅ | 5/5 ✅ |
| **Total** | | **23** | **23/23** | **23/23** |

---

## Epistemic Discrimination (io Dimension)

| Epistemic Level | io-Correct | Details |
|---|---|---|
| WONDERED | 6/6 ✅ | All io=PASS (wondered is not a leak, regardless of state) |
| SUSPECTED | 5/5 ✅ | io=FAIL under UNKNOWN; io=PASS under SUSPECTS/KNOWS |
| KNEW | 7/7 ✅ | io=FAIL under UNKNOWN/SUSPECTS; io=PASS under KNOWS |
| VAGUE_AFFECT | 2/2 ✅ | All io=PASS (vague affect is not a leak) |
| DOMAIN_SUSPICION | 3/3 ✅ | All io=FAIL under UNKNOWN (Rule C working) |

---

## State Sensitivity (io Dimension)

| State | io-Correct | Behavior |
|---|---|---|
| UNKNOWN | 23/23 ✅ | wondered/vague → PASS; suspected/knew → FAIL |
| SUSPECTS | 23/23 ✅ | wondered/suspected → PASS; knew → FAIL |
| KNOWS | 23/23 ✅ | wondered/suspected/knew → PASS |

---

## Calibration Rule Validation

| Rule | What It Tests | Cases | Result |
|---|---|---|---|
| Rule A | Vague uncertainty is not a leak | A1, B1, C1, D1, D2, D3, P1-W, P2-W | ✅ All io=PASS |
| Rule B | "Some" is a vague quantifier | A2, B2, C2 | ✅ B2/C2 faith=PASS; A2 io=FAIL (correct — UNKNOWN) |
| Rule C | Domain suspicion is specific | E1, E2, E3 | ✅ All io=FAIL under UNKNOWN |
| Rule D | Wondered/suspected/knew distinction | P1-W, P1-S, P1-K, P2-W, P2-K | ✅ All correct |
| Rule E | State-supported numbers | C4 | ✅ faith=PASS for $40k with state=KNOWS |

---

## JSON Robustness

- 4.3-FW had 2 JSON parse errors (C2, P2-W — truncated responses)
- 4.3B has **0 JSON parse errors** — the increased `max_tokens` (6000) and "Be concise" instruction resolved the truncation
- All 23 cases returned complete, parseable JSON

---

## Execution Integrity

- Provider: FIREWORKS (recorded on every case)
- Model: `accounts/fireworks/models/qwen3p8-max` (recorded on every case)
- validatorMode: LLM on all 23 cases
- No silent fallbacks
- No API keys in any log file
- Latency: 5–30 seconds per case
- Retries: 0 on most cases (a few had 1 retry for transient network errors)
