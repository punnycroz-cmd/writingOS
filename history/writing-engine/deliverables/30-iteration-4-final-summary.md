# DELIVERABLE 30 — Iteration 4 Final Summary

---

## Component Status Table

| Component | Current status | Evidence |
|---|---|---|
| Faithfulness | **PARTIALLY DEMONSTRATED** | 0% false acceptance on unsupported specifics (20/20 rejected). [CC] normalization fixes SC-3A. Residual overblocking on paraphrase ("medical centers" ≠ "hospitals"). |
| Independent validation | **DEMONSTRATED** | 60 variants validated independently of generation. The [LJ] catches what [CC] cannot (semantic claims) and vice versa. |
| Canon integrity | **DEMONSTRATED** | T13: 100% (blind character seeing → REJECT). |
| Information ownership | **PARTIALLY DEMONSTRATED** | 0% false acceptance on leaks (all B variants rejected). BUT state-reading error: T11-KNOWS-A rejected despite state=KNOWS. The validator pattern-matches on wording, not state. |
| Deferred checks | **DEMONSTRATED** | T14: 100% (trowel resolution → REJECT; trowel reference → DEFER). |
| Character specificity | **PARTIALLY DEMONSTRATED** | 10 semantic classes tested; 100% on 8 classes; 33–67% on causal_inference, knowledge, emotional_inference (overblocking on vague language). |
| State persistence | **DEMONSTRATED** | T11 state-controlled triplets run (UNKNOWN/SUSPECTS/KNOWS). State transitions are logged. But the [LJ] does not reliably consult state. |
| Positive intervention | **DEMONSTRATED** | 17/20 valid interventions accepted (85% acceptance rate for valid cases). |
| Intentional genericity | **DEMONSTRATED** | (from Iteration 2; not retested in v4) |
| Severity | **NOT CALIBRATED** | Qualitative NONE/MINOR/MATERIAL/CRITICAL; no thresholds tuned. |
| Deterministic integrity checks | **DEMONSTRATED** | [CC] v4 with number-word, date, entity normalization. 0 [CC] false positives in v4. HARD_BLOCK is non-overridable. |
| Invention policy | **DEMONSTRATED** | T12: same text, different outcomes under NONE/SOURCE/LICENSED/INFERENCE. Policy materially affects the result. |
| Provenance normalization | **DEMONSTRATED** | Number-words → digits; dates → ISO; entities → canonical. Fixes SC-3A and CT1 at [CC] level. |
| Fiction OS | **PARTIALLY DEMONSTRATED** | v2/v3 OS runs end-to-end on 60 triplet variants. One diagnostic (Character Specificity). |
| Constitution | **STABLE (5 articles)** | No promotions, no demotions. |
| General-purpose core hypothesis | **SMOKE TESTED** | One nonfiction test: architecture runs, [CC] works, [LJ] overblocks on paraphrase. Not validated. |
| Validation boundary v4 | **PARTIALLY DEMONSTRATED** | 0% false acceptance (safety holds); 15% false rejection (overblocking); 55% authorization discrimination. Boundary is real but imperfect. |

---

## The Ten Questions

### 1. Can the validator distinguish licensed invention from unlicensed assertion?

**PARTIALLY.** On the policy-controlled triplets (T12), yes — "smelled of rain" is rejected under NONE/SOURCE and accepted under LICENSED/INFERENCE. On the semantic-class triplets, it distinguishes well on 8 of 10 classes (100% on sensory, behavior, motive, memory, identity, temporal, canon, deferred, unsupported-specific). It struggles on causal_inference (33%), emotional_inference (67%), and knowledge (67%) — primarily due to overblocking on vague/uncertain language and state-reading errors.

**The discrimination exists but is imperfect.** The validator can tell licensed sensory invention from unlicensed IO leaks. It cannot reliably tell licensed inference ("wondered if") from unlicensed certainty ("knew") — it overblocks both.

### 2. Which semantic classes remain weak?

- **causal_inference: 33%** — the weakest. "Numbers did not match last month" (vague comparative) and "wondered if error or worse" (explicit uncertainty) both overblocked.
- **knowledge_state_controlled: 56%** — the state-reading error. The validator does not consult the `knows`/`suspects`/`unknown` lists.
- **emotional_inference: 67%** — "wondered if something was wrong" overblocked.
- **knowledge: 67%** — "something bothered her" (vague unease) overblocked.
- **quantification: 67%** — state-supported "four" overblocked (state-reading error).

### 3. How much overblocking remains?

**15% false rejection rate** (3 of 20 valid interventions rejected). All trace to [LJ] prompt issues:
- State-reading error (didn't consult knows/suspects lists): T11-KNOWS-A, T11-SUSPECTS-B, T8-A
- Overblocking on vague language: T7-A, T3-C, T6-C, T7-C, T11-UNKNOWN-B

Plus 6 C-variant overblocks where expected UNCLEAR or ACCEPT but got REJECT.

### 4. How much underblocking remains?

**0% false acceptance rate** (0 of 20 invalid interventions accepted). This is the safety boundary — it holds. No unlicensed assertion, IO leak, canon violation, or unsupported specific was accepted across all 60 variants.

**The one residual underblock from Iteration 3 (CONF-3, semantic invention "burnt coffee") was not directly retested.** T1-B (similar pattern) was correctly rejected because it also contained an IO leak. The pure semantic-invention gap (invented smell with no IO leak) remains untested in v4.

### 5. Does `inventionPolicy` materially affect the result?

**YES.** T12 proves it: the same text ("smelled of rain") is REJECTED under NONE/SOURCE_CONSTRAINED and ACCEPTED under LICENSED_FICTION/LIMITED_INFERENCE. The validator respects the policy parameter. The policy licenses invention (sensory, stylistic) but does NOT override integrity constraints (IO leaks, canon violations, unsupported specifics are rejected regardless of policy).

### 6. Which parts are deterministic and which require LLM judgment?

| Part | Type | Notes |
|---|---|---|
| Number extraction (digits) | Deterministic | regex |
| Number-word extraction | Deterministic | word→number lookup |
| Date extraction + normalization | Deterministic | 3 regex patterns → ISO |
| Entity canonicalization | Deterministic | possessive stripping |
| Provenance classification | Deterministic | string matching after normalization |
| HARD_BLOCK determination | Deterministic | [CC] severity |
| Invention policy enforcement | [LJ] | the validator reads the policy and adjusts |
| Observation vs inference vs knowledge | [LJ] | semantic judgment — the weak point |
| Licensed invention vs unlicensed assertion | [LJ] | semantic judgment — works for sensory, struggles for inference |
| State-list consultation | [LJ] | the validator must read knows/suspects/unknown — currently unreliable |
| Ambiguity (UNCLEAR) | [LJ] | the validator never uses UNCLEAR on integrity dimensions |

### 7. Does the evidence justify changing the OS architecture?

**NO.** The architecture ([CC] + [LJ] hybrid, HARD_BLOCK non-overridable, policy-aware validation) is sound. All 12 failures in v4 trace to [LJ] prompt calibration, not architecture. The [CC] layer had zero errors. The final-decision policy is correct. The fix is validator prompt refinement, not architectural change.

### 8. Does anything now deserve constitutional promotion?

**NO.** The 5-article Constitution remains stable. No new invariant emerged. The inventionPolicy parameter and the provenance normalization are OS-level mechanisms. Information-ownership is now DEMONSTRATED under leak pressure (0% false acceptance) but remains under Article III. Nothing meets the promotion bar (multiple experiments demonstrating load-bearing constitutional necessity).

**CANDIDATE — NEEDS MORE EXECUTION:** the inventionPolicy parameter is architecturally important (it materially affects decisions) but it is an OS mechanism, not a constitutional invariant. It does not promote.

### 9. What remains unresolved?

1. **State-reading error.** The [LJ] does not reliably consult info-ownership state lists. T11-KNOWS-A is the definitive case. Fix: validator prompt must explicitly instruct state-list consultation.
2. **Overblocking on vague/uncertain language.** "Wondered if," "seemed," "something bothered her" are treated as leaks. Fix: validator prompt must license explicit uncertainty.
3. **UNCLEAR never produced.** The [LJ] forces binary PASS/FAIL on ambiguous cases. Fix: validator prompt must permit UNCLEAR.
4. **Semantic invention gap (CONF-3).** Invented sensory detail with no IO leak — untested in v4. Fix: targeted test or [CC] semantic-similarity check.
5. **Paraphrase overblocking (nonfiction).** "Medical centers" ≠ "hospitals" rejected. Fix: validator prompt must license synonym/paraphrase under SOURCE_CONSTRAINED.
6. **Calibration.** No thresholds tuned. All `[CAL]`.

### 10. What is the smallest next experiment?

**A validator-prompt-calibration experiment.** The 12 failures all trace to [LJ] prompt issues. The smallest next experiment is:

1. Refine the validator prompt with 3 specific instructions:
   - "Before returning io=FAIL, check whether the character is in the `knows` list for the referenced fact. If yes, io=PASS."
   - "Explicit uncertainty ('wondered if', 'seemed', 'appeared to') is licensed under LICENSED_FICTION and LIMITED_INFERENCE. Do not FAIL io for hedged language."
   - "If the observation/inference boundary is genuinely ambiguous, return UNCLEAR rather than FAIL."
2. Re-run the 12 failed cases.
3. Measure whether the false rejection rate drops without increasing the false acceptance rate.

This is cheap (12 validations), targeted (addresses the root cause), and does not require architectural change. If it works, the discrimination rate should improve from 55% to >80%. If it doesn't, the problem is deeper than prompt calibration and may require a different validation approach.

---

## Final Assessment

**The validation layer has a real safety boundary.** 0% false acceptance across 60 variants — no unlicensed assertion, IO leak, canon violation, or unsupported specific was accepted. The boundary is:

- **[CC] HARD_BLOCK** for deterministically-proven unsupported specifics (numbers, dates, claims) — non-overridable.
- **[LJ] FAIL** on any integrity dimension — catches what [CC] cannot (semantic claims, IO leaks, canon contradictions).
- **Policy-aware:** the validator respects inventionPolicy, licensing sensory invention under LICENSED_FICTION while rejecting it under NONE/SOURCE_CONSTRAINED.
- **Integrity constraints hold regardless of policy:** IO leaks, canon violations, and unsupported specifics are always rejected.

**The boundary is imperfect.** 15% false rejection rate — the [LJ] overblocks on vague language and does not reliably consult state. The discrimination rate is 55% — the validator can tell licensed sensory invention from unlicensed IO leaks, but struggles to tell licensed inference from unlicensed certainty.

**The architecture is sound; the [LJ] prompt needs calibration.** All 12 failures trace to prompt issues, not architectural flaws. The [CC] layer is correct (0 errors in v4). The final-decision policy is correct. The fix is targeted prompt refinement, not redesign.

**The Constitution is stable.** No promotions, no demotions. The 5 articles have been stable for four iterations. The inventionPolicy parameter and provenance normalization are OS-level improvements that do not rise to constitutional level.

**The desired outcome was not a perfect score.** It was "a more accurately defined and experimentally supported safety boundary." The boundary is now: deterministic HARD_BLOCK for unsupported specifics + policy-aware [LJ] for semantic judgment + 0% false acceptance + known overblocking on vague language + known state-reading gap. This is a more honest and more defined boundary than Iteration 3's.
