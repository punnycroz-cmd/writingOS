# DELIVERABLE 24 — Iteration 4 Execution Report

**Executed:** 2026-08-21. **Variants:** 60 (20 triplets × 3 variants). **All completed.**

---

## Overall Results

| Metric | Result |
|---|---|
| Total variants run | 60 |
| Overall correct | 48/60 (80%) |
| False Rejection Rate (A, valid rejected) | 3/20 (15%) |
| False Acceptance Rate (B, invalid accepted) | **0/20 (0%)** |
| Uncertainty recognition (C, UNCLEAR recognized by validator) | 0/20 (0%) |
| Authorization discrimination (A≠B within triplet) | 11/20 (55%) |

---

## The Safety Boundary Holds

**0% false acceptance rate.** All 20 invalid interventions (variant B) were correctly rejected. This is the most important safety metric: no unlicensed assertion, IO leak, canon violation, or unsupported specific was accepted. The validation layer's safety boundary holds across all 10 semantic classes and all 4 invention policies.

---

## The Discrimination Problem

**55% authorization discrimination.** In only 11 of 20 triplets did the validator produce different decisions for A (valid) and B (invalid). In the other 9, the validator rejected BOTH — which is safe (no false acceptance) but fails the discrimination test (it cannot distinguish licensed from unlicensed).

**The 15% false rejection rate is the symptom.** 3 of 20 valid interventions were rejected:
1. **T11-KNOWS-A:** "Maya knew Marcus had embezzled forty thousand dollars" with state=KNOWS. The validator rejected with io=FAIL despite Maya being in the `knows` list. **State-reading error.**
2. **T7-A:** "the numbers did not match what she had seen last month" — a vague comparative reference. The validator treated this as asserting knowledge of a specific bank balance. **Overblocking on vague reference.**
3. **T8-A:** "Maya counted the IV drips in Room 4 — four, as always." The state explicitly supports "four" (in perceptualHabits and currentKnowledge), but the validator said "four" is UNKNOWN. **State-reading error.**

---

## Per-Class Breakdown

| Semantic Class | Correct | Weakness |
|---|---|---|
| sensory_observation | 3/3 (100%) | — |
| visible_behavior | 3/3 (100%) | — |
| emotional_inference | 2/3 (67%) | T3-C: "wondered if something was wrong" rejected (overblocking on explicit uncertainty) |
| motive_inference | 3/3 (100%) | — |
| memory | 3/3 (100%) | — |
| knowledge | 2/3 (67%) | T6-C: vague unease rejected (overblocking) |
| causal_inference | 1/3 (33%) | T7-A: vague comparative rejected; T7-C: "wondered if error" rejected |
| quantification | 2/3 (67%) | T8-A: state-supported "four" rejected (state-reading error) |
| identity | 3/3 (100%) | — |
| temporal_knowledge | 3/3 (100%) | — |
| canon_contradiction | 3/3 (100%) | — |
| deferred_mechanism | 3/3 (100%) | — |
| unsupported_specific | 3/3 (100%) | — |
| knowledge_state_controlled | 5/9 (56%) | **The core problem — see below** |
| policy_controlled | 9/12 (75%) | T12-NONE-C, T12-SOURCE-C, T12-INFERENCE-C ambiguous |

---

## The State-Controlled Triplets (T11) — The Core Finding

| Case | State | Wording | Expected | Got | [LJ] io | Failure type |
|---|---|---|---|---|---|---|
| T11-UNKNOWN-A | UNKNOWN | "Maya knew..." | REJECT | REJECT ✅ | FAIL | (correct) |
| T11-UNKNOWN-B | UNKNOWN | "something bothered her" | ACCEPT | REJECT ❌ | FAIL | OVERBLOCK (vague unease treated as leak) |
| T11-UNKNOWN-C | UNKNOWN | "suspected finances" | REJECT | REJECT ✅ | FAIL | (correct) |
| T11-SUSPECTS-A | SUSPECTS | "Maya knew..." | REJECT | REJECT ✅ | FAIL | (correct — certainty still leaks) |
| T11-SUSPECTS-B | SUSPECTS | "suspected finances — discrepancy nagged" | ACCEPT | REJECT ❌ | FAIL | STATE-READING ERROR (didn't see suspects) |
| T11-SUSPECTS-C | SUSPECTS | "wondering if discrepancy meant worse" | ACCEPT | ACCEPT ✅ | PASS | (correct) |
| T11-KNOWS-A | KNOWS | "Maya knew..." | ACCEPT | REJECT ❌ | FAIL | **STATE-READING ERROR** (didn't see knows) |
| T11-KNOWS-B | KNOWS | "suspected might have taken some" | ACCEPT | REJECT ❌ | FAIL | STATE-READING ERROR |
| T11-KNOWS-C | KNOWS | "forty thousand a weight between them" | ACCEPT | ACCEPT ✅ | PASS | (correct) |

**The core finding: the validator does NOT reliably consult the info-ownership state.** It pattern-matches on surface wording ("knew...embezzled" → FAIL) rather than reading whether the character is in the `knows` list. T11-KNOWS-A is the definitive case: state explicitly says Maya KNOWS the embezzlement fact, but the validator still returns io=FAIL.

This is the same SC-3A failure from Iteration 3 — and it persists despite the [CC] provenance layer now correctly classifying it as ADVISORY (the claim matches a known fact). The [CC] layer got it right; the [LJ] layer overrode it incorrectly.

---

## The Policy-Controlled Triplets (T12) — Policy Discrimination

| Policy | "smelled of rain" (A) | "cardamom" (B) | IO leak / causal (C) |
|---|---|---|---|
| NONE | REJECT ✅ | — | — |
| SOURCE_CONSTRAINED | REJECT ✅ | ACCEPT ✅ | — |
| LICENSED_FICTION | ACCEPT ✅ | ACCEPT ✅ | REJECT ✅ |
| LIMITED_INFERENCE | ACCEPT ✅ | ACCEPT ✅ | REJECT ✅ |

**The validator respects invention policy.** "Smelled of rain" is rejected under NONE/SOURCE_CONSTRAINED and accepted under LICENSED_FICTION/LIMITED_INFERENCE — the same text producing different outcomes based on policy. This is the policy-discrimination success.

---

## Uncertainty Recognition (Variant C)

**0/20 UNCLEAR recognized.** The validator never returned UNCLEAR on an integrity dimension for any variant C case. It always made a binary PASS/FAIL judgment. This means the validator does not use the UNCLEAR state for genuinely ambiguous cases — it forces a decision.

**Assessment:** this is both a strength (decisive) and a weakness (no gradated uncertainty). The conservative policy (UNCLEAR → REJECT on integrity) is not being exercised because the validator never produces UNCLEAR. The overblocking on T3-C, T6-C, T7-C is the cost: ambiguous cases that should be UNCLEAR are forced to FAIL.

---

## Summary of What Works and What Doesn't

### Works (DEMONSTRATED)
- **Safety boundary:** 0% false acceptance. All 20 invalid interventions rejected.
- **Policy discrimination:** the validator respects inventionPolicy (T12: "smelled of rain" rejected under NONE/SOURCE, accepted under LICENSED/INFERENCE).
- **Sensory observation vs invention:** 100% on sensory_observation, visible_behavior classes.
- **Canon contradiction:** 100%.
- **Deferred mechanism:** 100%.
- **Unsupported specific numbers:** 100% (the [CC] HARD_BLOCK + [LJ] agreement).
- **Memory, identity, temporal, motive:** 100%.

### Fails (the honest gaps)
- **State-reading:** the validator does not reliably consult info-ownership state (T11-KNOWS-A, T11-SUSPECTS-B, T8-A). It pattern-matches on wording.
- **Overblocking on vague/uncertain language:** "wondered if," "seemed," "something bothered her" are treated as leaks when they should be licensed (T3-C, T6-C, T7-A, T7-C, T11-UNKNOWN-B, T11-SUSPECTS-B).
- **UNCLEAR never produced:** the validator forces binary PASS/FAIL on genuinely ambiguous cases.
- **Causal inference:** 33% — the weakest semantic class.
