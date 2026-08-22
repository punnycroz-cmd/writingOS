# DELIVERABLE 22 — Iteration 3 Final Summary

**Executed:** 2026-08-21. **Cases:** 40 (14 IO adversarial + 10 faithfulness + 6 state-constraint + 2 POV + 5 ambiguous + 3 conflict). **Method:** validator-only (no generator); manually-constructed bad interventions; two policies compared (v2 LJ-only, v3 CC-hard-nonoverridable).

---

## Results Summary

| Metric | v2 (LJ-only) | v3 (CC-hard + refined LJ) |
|---|---|---|
| True positives (bad rejected) | 31 | 31 |
| True negatives (good accepted) | 4 | 4 |
| False negatives (bad accepted) | 1 | 1 |
| False positives (good rejected) | 4 | 4 |
| Overall accuracy | 35/40 (87%) | 35/40 (87%) |

**The Iteration 2 failure (CONF-2 / IO2: plausible medical vitals accepted) is RESOLVED.** The exact case is now correctly rejected by both the refined [LJ] prompt and the v3 [CC] HARD_BLOCK policy.

---

## The Six Questions

### 1. Can the validator actually catch information-ownership leaks?

**YES.** 14/14 leak forms caught, including all 4 subtle framings ("made sense," "understood why," "guilt was obvious," "could tell"). The validator is not doing keyword detection — it distinguishes observation from inference from knowledge, and respects the UNKNOWN/SUSPECTS/KNOWS state progression.

**The Iteration 2 gap is closed.** Iteration 2 could not demonstrate this because the generator chose safe paths. Iteration 3 bypassed the generator with manually-constructed leaks and confirmed the validator catches them.

**Caveat:** the validator overblocks on reasonable inference (3 false positives on AMB-1, AMB-2, AMB-3 — ambiguous cases where inference from observable evidence was treated as a leak). This is a calibration issue, not a safety failure. The validator is conservative, which is safe (zero leak false negatives) but costs legitimate narrative inference.

### 2. Can it reliably reject unsupported specificity?

**YES for numeric/date/measurement specifics. NO for semantic invention.**

- 10/10 unsupported numeric/date/measurement cases rejected (FAITH-1–10).
- The specific Iteration 2 failure (plausible medical vitals 98.6, 120/80) is now rejected.
- The [CC] provenance classifier catches 8/10 as HARD_BLOCK; [LJ] catches the remaining 2 (spelled-out quantities, locations).
- Plausibility is no longer treated as evidence (refined prompt).

**Residual gap:** semantic invention disguised as observation (CONF-3: "the break room smelled of burnt coffee — not cardamom") was accepted. The [CC] cannot detect it (no numbers); the [LJ] treats it as licensed sensory observation. This is the one false negative. The boundary between "licensed observation" and "invented semantic detail" is not deterministically resolvable.

### 3. Is UNCLEAR → ACCEPT safe?

**NO for integrity dimensions (faithfulness, infoOwnership). YES for non-integrity dimensions.**

The Iteration 2 finding (CONF-2: [LJ] UNCLEAR → ACCEPT was unsafe) is confirmed. The v3 policy changes this: UNCLEAR on faithfulness or infoOwnership → REJECT (conservative). UNCLEAR on non-integrity dimensions (meaning, voice, register, intelligibility) → ACCEPT.

**Evidence:** CONF-2 is the case where [LJ] said UNCLEAR on plausible medical vitals. In v2 (UNCLEAR=ACCEPT), this was accepted (unsafe). In v3 (UNCLEAR=REJECT on faithfulness), this is rejected (safe). The [CC] HARD_BLOCK policy is a backstop that would also catch it.

**Trade-off:** conservative UNCLEAR handling will reject some legitimate interventions where faithfulness is genuinely ambiguous. This is the cost of safety. Given that false negatives on faithfulness are the highest-risk error, the trade is justified.

### 4. Which [CC] signals are hard constraints?

| [CC] signal | Hard/Soft | Overridable? | Evidence |
|---|---|---|---|
| Unsupported **number** (digit) with UNKNOWN provenance | **HARD** | NO | FAITH-1–5, CONF-2: all correctly rejected. Deterministic proof. |
| Unsupported **date** (contains digits) with UNKNOWN provenance | **HARD** | NO | FAITH-2, FAITH-7: rejected. |
| Unsupported **measurement** (contains digits) with UNKNOWN provenance | **HARD** | NO | FAITH-4, FAITH-5: rejected. |
| Explicit **knowledge claim** matching an UNKNOWN fact | **HARD** | NO | IO-A, IO-H, IO-J, SC-1A, SC-2A: rejected. Deterministic match against IO state. |
| Unsupported **proper noun** with UNKNOWN provenance | **SOFT** | YES | FAITH-7, FAITH-8: [CC] flagged, [LJ] agreed. But "Papas" (v2 CT1) was a false positive. Proper-noun extraction is too noisy for hard blocking. |
| No unsupported specifics detected | **ADVISORY** | YES ([LJ] decides) | The normal case. |

**The rule:** numbers (digits), dates, measurements, and explicit knowledge claims are HARD (deterministically provable). Proper nouns are SOFT (extraction is noisy). Everything else is ADVISORY ([LJ] judges).

### 5. What remains unproven?

1. **Semantic invention detection (CONF-3).** The [CC] cannot detect invented smells, comparisons, or metaphorical details. The [LJ] is lenient on these under the licensed-observation rule. This is a residual false negative. **Not solved.**

2. **The observation/inference boundary (AMB-1, AMB-2, AMB-3).** The [LJ] is inconsistent: too strict on reasonable inference (false positives), too lenient on semantic invention (false negative). This is a calibration issue `[CAL]` requiring a larger case set. **Not calibrated.**

3. **Spelled-out number handling (SC-3A).** The [CC] digit-regex misses spelled-out numbers ("forty thousand dollars"). The [LJ] faithfulness check fails on them even when state-supported. **Not solved.**

4. **Region-scoped intervention.** Not tested. The all-or-nothing model (v2 CT1 false reject) is still in place. **Not implemented.**

5. **Generalization beyond fiction Character Specificity.** The validation layer is tested only on this one diagnostic in this one register. Nonfiction, other fiction diagnostics, and cross-register behavior are untested. **Not tested.**

6. **The v3 policy's independent value.** On this case set, v2 and v3 have identical accuracy (the refined [LJ] prompt independently catches the cases the v3 policy was designed to catch). The v3 policy is a backstop for future cases where [LJ] is lenient, but its independent value is not demonstrated in this experiment. **Hypothesized, not demonstrated.**

### 6. What is the smallest next experiment?

**A targeted semantic-invention test.** Construct 10 cases of semantic inventions disguised as observation (like CONF-3: invented smells, comparisons, metaphorical details that are not numbers but are unsupported specifics). Test whether the [LJ] can distinguish:
- Licensed observation (sensory detail grounded in state) → ACCEPT
- Invented semantic detail (unsupported comparison/smell/metaphor) → REJECT

This is the one residual false-negative class. It is cheap (validator-only, no generator). It would determine whether the faithfulness gate is "solved" for fiction or has a permanent semantic gap.

**Secondary:** a spelled-out-number test (construct cases with "forty," "twelve," "one hundred" and verify [CC] catches them). This would fix SC-3A and harden the [CC] layer.

**Tertiary:** a nonfiction loop (SourceFactLedger + strict faithfulness) to begin testing the general-purpose core hypothesis. But this is larger and should follow the two above.

---

## Final Assessment

**Does the validation layer have a real safety boundary?**

**YES, for the tested scope.** The boundary is:
- [CC] HARD_BLOCK for unsupported numbers/dates/measurements/explicit-claims → non-overridable.
- [LJ] FAIL on any integrity dimension → REJECT.
- [LJ] UNCLEAR on faithfulness/infoOwnership → REJECT (conservative).
- The [LJ] catches all 14 IO leak forms and all 10 numeric-specificity cases.

**The boundary has one known gap:** semantic invention disguised as observation (CONF-3). This is not solved. It is the honest residual failure.

**The boundary has known calibration issues:** 4 false positives on ambiguous inference and spelled-out numbers. These are `[CAL]` — they do not compromise safety (no bad intervention is accepted) but they cost legitimate interventions.

**The Constitution is stable at 5 articles.** No promotions, no demotions. Information-ownership is now DEMONSTRATED (closing the Iteration 2 gap) but remains under Article III, not promoted to a standalone article.

**The Faithfulness Gate is not "solved."** It is substantially stronger than in Iteration 2 (the specific unsafe case is resolved), but CONF-3 shows a permanent semantic gap. The honest statement is: "the faithfulness gate catches unsupported numeric/date/measurement specifics and information-ownership leaks; it does not reliably catch semantic invention disguised as observation."

**The hybrid architecture is robust within the tested scope.** The [CC] layer catches what is deterministically provable; the [LJ] catches what is semantic. Neither alone is sufficient. The combination produces 31/32 true positives on bad interventions. The one miss (CONF-3) is a semantic judgment that the [LJ] got wrong under the licensed-observation rule — a calibration issue, not an architectural failure.

---

## What Iteration 3 Discovered That Iteration 2 Could Not

1. **The validator CAN catch information-ownership leaks.** Iteration 2's "untested under leak pressure" gap is closed. 14/14 leak forms caught.
2. **Plausibility is no longer treated as evidence.** The Iteration 2 IO2 failure (plausible medical vitals accepted) is resolved.
3. **The [CC]/[LJ] conflict has an evidence-based policy.** HARD_BLOCK is non-overridable; SOFT and ADVISORY defer to [LJ]; UNCLEAR on integrity dimensions is conservative REJECT.
4. **UNCLEAR=ACCEPT is unsafe for integrity dimensions.** Confirmed by CONF-2.
5. **The validator overblocks on reasonable inference.** 3 false positives on AMB cases — the observation/inference boundary is a calibration issue.
6. **Semantic invention is the residual gap.** CONF-3 — the one false negative. The faithfulness gate is not fully solved.
7. **The Constitution is stable.** Three iterations, no promotions, no demotions. The 5 articles appear sufficient for the tested scope.

The validation layer has a real safety boundary. It is not perfect. The boundary is strong enough to rely on for the tested scope (fiction Character Specificity), with one known gap (semantic invention) that requires targeted future work.
