# DELIVERABLE 36 — Iteration 4.1 Final Summary

---

## Component Status Table (updated for 4.1)

| Component | Status (V4) | Status (V4.1) | Evidence |
|---|---|---|---|
| Faithfulness | PARTIALLY DEMONSTRATED | **PARTIALLY DEMONSTRATED** (improved) | 0% false acceptance maintained; paraphrase overblocking persists |
| Independent validation | DEMONSTRATED | **DEMONSTRATED** | 60 variants validated independently; stateConsulted logged |
| Canon integrity | DEMONSTRATED | **DEMONSTRATED** | T13: 100% |
| Information ownership | PARTIALLY DEMONSTRATED | **DEMONSTRATED** (at [LJ] level) | [LJ] reads state correctly in 9/9 state-matrix cases; 2 failures are [CC] override |
| Deferred checks | DEMONSTRATED | **DEMONSTRATED** | T14: 100% |
| Character specificity | PARTIALLY DEMONSTRATED | **DEMONSTRATED** (improved) | 93% overall (up from 80%); 0% false rejection on A |
| State persistence | DEMONSTRATED | **DEMONSTRATED** | State-matrix confirms temporal state-reading |
| Positive intervention | DEMONSTRATED | **DEMONSTRATED** | 0% false rejection on A variants (was 15% in V4) |
| Intentional genericity | DEMONSTRATED | **DEMONSTRATED** | (not retested; V4 evidence stands) |
| Severity | NOT CALIBRATED | **NOT CALIBRATED** | Still qualitative; no thresholds tuned |
| Deterministic integrity checks | DEMONSTRATED | **PARTIALLY DEMONSTRATED** (regressed) | [CC] HARD_BLOCK now overrides correct [LJ] on claim-pattern false positives (SM-3, SM-4) |
| Invention policy | DEMONSTRATED | **DEMONSTRATED** | T12: policy discrimination holds; 2 policy-edge overblocks remain |
| Claim-state resolution | (not tested) | **PARTIALLY DEMONSTRATED** | 8/8 STATE_CONTRADICTION; 3/3 STATE_SUPPORTED at [LJ] level; misses paraphrased propositions |
| Paraphrase faithfulness | (not tested separately) | **FAILED** | 2/5 paraphrases false-positively rejected |
| Fiction OS | PARTIALLY DEMONSTRATED | **PARTIALLY DEMONSTRATED** (improved) | V4.1 prompt + claim resolver; [CC] policy needs revision |
| Constitution | STABLE (5 articles) | **STABLE (5 articles)** | No promotions, no demotions |
| General-purpose core | SMOKE TESTED | **SMOKE TESTED** | (not retested in 4.1) |

---

## The Ten Questions

### 1. Did V4.1 reduce false rejection?

**YES.** False rejection rate on A variants dropped from 15% (3/20 in V4) to 0% (0/20 in V4.1). 8 of 12 V4 failures were fixed. The state-aware prompt (Rules 1 and 3 especially) eliminated the overblocking on state-supported claims and vague uncertainty.

### 2. Did it improve state reading?

**YES, at the [LJ] level.** The `stateConsulted: true` field is logged in every case. The state-matrix confirms the [LJ] produces different outcomes for the same wording under different states (SM-1 vs SM-3, SM-5 vs SM-7). The V4 pattern-matching failure ("knew...embezzled" → FAIL regardless of state) is fixed.

**NO, at the [CC] level.** The [CC] provenance layer does not consult info-ownership state for claim patterns. It still flags "had embezzled" / "had taken" as HARD_BLOCK regardless of whether the character knows the fact. This caused SM-3 and SM-4 failures.

### 3. Did false acceptance remain at zero?

**YES.** 0/20 invalid interventions (B variants) accepted. The safety boundary holds. V4.1's leniency on vague uncertainty (Rule 3) did not open the gate to any leaks — it only stopped overblocking on legitimate vague language.

**One regression to note:** T11-UNKNOWN-C (state=UNKNOWN, "suspected finances") was accepted by V4.1 but should have been rejected. This is a false acceptance on a *specific-domain suspicion* without evidence. It did not appear in the B-variant count because T11-UNKNOWN-C is a C variant (expected REJECT), but it is a safety-adjacent regression that needs attention.

### 4. Does the validator distinguish observation → suspicion → knowledge?

**YES, substantially better than V4.** The V4.1 prompt's Rule 2 (distinguish epistemic levels) + the claim-state resolver's epistemic-level classification together produce reliable discrimination:
- OBSERVATION ("noticed his pen tapping") → ACCEPT ✅
- INTERPRETATION ("wondered if something was wrong") → ACCEPT ✅ (was REJECT in V4)
- SUSPICION ("suspected something was wrong with finances", state=SUSPECTS) → ACCEPT ✅ (was REJECT in V4)
- KNOWLEDGE ("knew he had embezzled", state=KNOWS) → ACCEPT ✅ (was REJECT in V4)
- KNOWLEDGE ("knew he had embezzled", state=UNKNOWN) → REJECT ✅

**Residual weakness:** the boundary between "vague unease" (licensed) and "suspicion of a specific domain" (needs evidence) is not perfectly calibrated. T11-UNKNOWN-C ("suspected finances" with state=UNKNOWN) was accepted when it should reject — the validator treated "suspected finances" as vague unease rather than a specific-domain suspicion.

### 5. Does structured claim-state resolution outperform prompting?

**It COMPLEMENTS prompting, not replaces it.**
- On explicit claims (STATE_SUPPORTED / STATE_CONTRADICTION): the resolver is 100% reliable and anchors the [LJ]. It adds value beyond the prompt alone by providing a deterministic signal.
- On implicit/vague claims (NO_CLAIM_DETECTED): the resolver adds no value; the [LJ] prompt handles these.
- On paraphrased propositions: the resolver misses them (lexical matching); the [LJ] prompt catches them via state-awareness.

**The resolver should be promoted into the OS as a [CC]-level signal**, but it does not replace the [LJ]. The two are complementary: the resolver handles explicit claims deterministically; the [LJ] handles implicit/vague claims semantically.

### 6. Is paraphrase a separate problem?

**YES.** Paraphrase overblocking (P-1: "hospitals" → "medical centers" rejected) is independent of state-reading, epistemic-level discrimination, and claim-state resolution. It is a pure [LJ]-level semantic-equivalence judgment that the current prompt does not address. It needs its own prompt rule (or a future semantic-similarity check). See Deliverable 34.

### 7. What should change in Fiction OS?

1. **Adopt the V4.1 state-aware validator prompt** (5 rules). This is the single highest-value change: 8/12 failures fixed, 0% false rejection on A variants.
2. **Promote the claim-state resolver to the OS [CC] layer** as a deterministic signal fed to the [LJ]. It reliably detects STATE_CONTRADICTION and STATE_SUPPORTED for explicit claims.
3. **Revise the [CC] HARD_BLOCK policy for claim patterns**: when the claim resolver returns STATE_SUPPORTED, downgrade [CC] severity to ADVISORY (let [LJ] adjudicate). When STATE_CONTRADICTION, keep HARD_BLOCK. This fixes SM-3, SM-4, and T11-KNOWS-B.
4. **Add a paraphrase-equivalence rule to the [LJ] prompt** (future work — not yet implemented).
5. **Calibrate policy-edge behavior** for NONE and SOURCE_CONSTRAINED (future work).

### 8. What should NOT change in the Constitution?

**Nothing.** The 5-article Constitution remains stable across 4.1 iterations. The state-aware prompt, claim-state resolver, and [CC] policy revision are all OS-level mechanisms enforcing existing articles. No new invariant emerged. Information-ownership is now DEMONSTRATED at the [LJ] level (stateConsulted: true, correct outcomes in 9/9 state-matrix cases) but remains under Article III, not promoted to a standalone article.

### 9. What remains unproven?

1. **[CC] HARD_BLOCK policy revision.** The proposed change (downgrade to SOFT when STATE_SUPPORTED) is principled but not yet implemented or tested. It would fix SM-3/SM-4 but might introduce new false acceptances if the claim resolver has false STATE_SUPPORTED results.
2. **Paraphrase recognition.** 2/5 paraphrases false-positively rejected. No fix implemented.
3. **Policy-edge calibration.** T12-NONE-C and T12-SOURCE-B still overblock. No fix implemented.
4. **T11-UNKNOWN-C regression.** The boundary between "vague unease" (licensed) and "specific-domain suspicion without evidence" (leak) is not perfectly calibrated.
5. **Generalization beyond fiction.** The nonfiction smoke test (Iteration 4) showed the same paraphrase overblocking. Not retested in 4.1.
6. **Calibration.** No thresholds tuned. All `[CAL]`.

### 10. What is the smallest next experiment?

**Implement and test the [CC] HARD_BLOCK policy revision.** This is the single change that would fix the 2 state-matrix failures (SM-3, SM-4) and the T11-KNOWS-B frozen-benchmark failure. The change is narrow:
- In the `finalDecision` function, when [CC] severity is HARD_BLOCK, check whether the hard blocks are claim-pattern matches that the claim resolver returned STATE_SUPPORTED for. If yes, downgrade to SOFT_SIGNAL and let the [LJ] adjudicate.
- Re-run the 3 affected cases (SM-3, SM-4, T11-KNOWS-B) and the full state matrix.
- Measure whether false acceptance increases (it should not — the [LJ] is now state-aware and reliable).

This is cheap (3-8 validations), targeted, and addresses the one architectural issue the evidence revealed: the [CC] HARD_BLOCK non-overridable policy is too coarse now that the [LJ] is state-aware.

---

## Final Assessment

**The correct result was achieved: a clearer architectural answer.**

The experiment answered the primary question: **the current validation failures can be fixed by state-aware semantic prompting alone for the [LJ]-level failures (8/12 fixed), but the [CC] HARD_BLOCK non-overridable policy now needs a narrow architectural adjustment (downgrade when STATE_SUPPORTED) because it was designed for a context where the [LJ] was unreliable, and that context has changed.**

This is **Outcome A + Outcome C** from Section 15:
- Outcome A: state-aware prompting is a viable near-term solution for [LJ]-level state-reading. ✅
- Outcome C: a narrow structured mechanism (claim-state resolver) fixes state-related errors that prompting alone handles less reliably, and should be promoted into the OS. ✅ (but not the Constitution)

The architecture is not declared complete. The state-aware prompt + claim-state resolver + [CC] policy revision together address the majority of failures, but paraphrase recognition and policy-edge calibration remain as future prompt work.
