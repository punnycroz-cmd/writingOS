# DELIVERABLE 28 — Error Analysis v4

**Every failure classified by type.** No retries to make the benchmark pass. First failures preserved.

---

## Failure Classification Scheme

| Type | Meaning |
|---|---|
| OVERBLOCK | Valid intervention rejected |
| UNDERBLOCK | Invalid intervention accepted |
| STATE-READING ERROR | Validator did not consult state correctly |
| POLICY-READING ERROR | Validator did not respect inventionPolicy |
| PROVENANCE ERROR | [CC] misclassified a detail's provenance |
| POV ERROR | Validator misjudged POV/observation |
| CANON ERROR | Validator misjudged canon |
| TEMPORAL ERROR | Validator misjudged temporal knowledge |
| AMBIGUITY ERROR | Validator forced binary judgment on ambiguous case |
| PROMPT ERROR | Validator prompt caused the failure |
| DETERMINISTIC CHECK ERROR | [CC] produced a false positive/negative |

---

## All Failures (12 of 60 variants incorrect)

### False Rejections (3 — variant A, valid rejected)

| Case | Revised (excerpt) | Expected | Got | Failure Type | Root Cause | Fix Location |
|---|---|---|---|---|---|---|
| **T11-KNOWS-A** | "Maya knew Marcus had embezzled forty thousand dollars from the clinic." (state=KNOWS) | ACCEPT | REJECT | STATE-READING ERROR + OVERBLOCK | Validator returned io=FAIL despite Maya being in the `knows` list. Pattern-matched on "knew...embezzled" without consulting state. | Validator prompt — must explicitly instruct state consultation |
| **T7-A** | "the numbers did not match what she had seen last month" | ACCEPT | REJECT | OVERBLOCK + AMBIGUITY ERROR | Validator treated vague comparative ("last month") as asserting knowledge of a specific bank balance. | Validator prompt — must distinguish vague comparative from specific assertion |
| **T8-A** | "Maya counted the IV drips in Room 4 — four, as always." | ACCEPT | REJECT | STATE-READING ERROR + OVERBLOCK | State explicitly supports "four" (perceptualHabits + currentKnowledge), but validator said "four" is UNKNOWN. Did not read character state fields. | Validator prompt — must check character.currentKnowledge and perceptualHabits, not just informationOwnership |

### Incorrect C-variant Outcomes (6 — variant C, expected ≠ got)

| Case | Revised (excerpt) | Expected | Got | Failure Type | Root Cause | Fix Location |
|---|---|---|---|---|---|---|
| **T3-C** | "Maya wondered if something was wrong." | ACCEPT | REJECT | OVERBLOCK + AMBIGUITY ERROR | "Wondered if" is explicit uncertainty — licensed. Validator treated it as IO leak. | Validator prompt — "wondered if" is licensed uncertainty, not a leak |
| **T6-C** | "Something about him bothered her, though she could not say what." | ACCEPT | REJECT | OVERBLOCK | Vague unease — licensed. Validator treated it as suspicion of the embezzlement. | Validator prompt — vague unease without specific target is licensed |
| **T7-C** | "Maya wondered if someone had made an error — or something worse." | ACCEPT | REJECT | OVERBLOCK | "Wondered if" — licensed uncertainty. Validator overblocked. | Same as T3-C |
| **T9-C** | "There was something familiar about his gait, though she could not place it." | UNCLEAR | REJECT | AMBIGUITY ERROR | Genuinely ambiguous (could be licensed impression or setup for unsupported recognition). Validator forced REJECT instead of UNCLEAR. | Validator prompt — permit UNCLEAR for genuinely ambiguous observation/inference |
| **T11-UNKNOWN-B** | "Something about him bothered her." (state=UNKNOWN) | ACCEPT | REJECT | OVERBLOCK | Same as T6-C — vague unease overblocked. | Same as T6-C |
| **T11-SUSPECTS-B** | "suspecting something was wrong with the finances — the discrepancy she had found still nagged at her." (state=SUSPECTS) | ACCEPT | REJECT | STATE-READING ERROR + OVERBLOCK | State=SUSPECTS, suspicion matches state. Validator didn't consult `suspects` list. | Validator prompt — must check suspects list |

### Incorrect A-variant Outcomes (3 — variant A, expected ≠ got, state-controlled)

| Case | Revised (excerpt) | Expected | Got | Failure Type | Root Cause | Fix Location |
|---|---|---|---|---|---|---|
| **T11-KNOWS-B** | "Maya suspected Marcus might have taken some money." (state=KNOWS) | ACCEPT | REJECT | STATE-READING ERROR + OVERBLOCK | State=KNOWS. Downgrading to suspicion is safe. Validator said io=FAIL. Didn't consult `knows` list. | Validator prompt — state consultation |
| **T12-NONE-C** | "The kitchen was there." (policy=NONE) | ACCEPT | REJECT | OVERBLOCK | Tautological, no invention. Validator overblocked. | Validator prompt — tautology is not invention |
| **T12-SOURCE-C** | "The air was still." (policy=SOURCE_CONSTRAINED) | UNCLEAR | REJECT | AMBIGUITY ERROR | "Air was still" is borderline — could be licensed or could be invention. Validator forced REJECT. | Validator prompt — permit UNCLEAR |

---

## Failure Type Summary

| Failure Type | Count | Fix Location |
|---|---|---|
| OVERBLOCK | 8 | Validator prompt |
| STATE-READING ERROR | 4 | Validator prompt (must consult state lists) |
| AMBIGUITY ERROR | 4 | Validator prompt (must use UNCLEAR) |
| UNDERBLOCK | 0 | — |
| POLICY-READING ERROR | 0 | — |
| PROVENANCE ERROR | 0 | — (the [CC] layer is correct) |
| POV ERROR | 0 | — |
| CANON ERROR | 0 | — |
| TEMPORAL ERROR | 0 | — |
| PROMPT ERROR | (all of the above are ultimately prompt errors) | — |
| DETERMINISTIC CHECK ERROR | 0 | — (the [CC] layer had no false positives in v4) |

---

## Key Finding: All Failures Are [LJ] Prompt Errors, Not Architectural

**Every one of the 12 failures traces to the [LJ] validator prompt.** The [CC] layer had zero errors in v4 (the normalization fixes worked). The final-decision policy is correct (it would produce the right answer if the [LJ] returned the right judgments). The failures are:

1. **The [LJ] does not consult the info-ownership state lists** (knows/suspects/unknown) before returning io=FAIL. It pattern-matches on wording.
2. **The [LJ] overblocks on vague/uncertain language** ("wondered if," "seemed," "something bothered her") — treating licensed inference as leaks.
3. **The [LJ] never returns UNCLEAR** on integrity dimensions — it forces binary PASS/FAIL.

**This is fixable without architectural change.** The fix is validator prompt refinement: explicitly instruct the validator to (a) check the state lists before io=FAIL, (b) treat "wondered if"/"seemed"/"something bothered her" as licensed uncertainty, (c) return UNCLEAR when the observation/inference boundary is genuinely ambiguous.

---

## Decisions on Fix Location

| Fix | Location | Rationale |
|---|---|---|
| State-list consultation | Validator prompt | The [CC] already classifies claims against state correctly; the [LJ] must be instructed to do the same |
| Vague-language licensing | Validator prompt | This is a semantic judgment — the [CC] cannot determine "wondered if" is licensed |
| UNCLEAR usage | Validator prompt | The [LJ] must be told to use UNCLEAR for genuinely ambiguous cases |
| Semantic invention (CONF-3) | Future [CC] semantic check or [LJ] prompt | Not addressed in v4; requires a different mechanism |

**No architectural change is needed.** The [CC]+[LJ] hybrid is sound. The [CC] is correct. The [LJ] prompt needs calibration. This is the honest conclusion: the architecture is right; the [LJ] prompt is wrong in specific, fixable ways.

---

## What Was NOT Changed (to avoid overfitting)

- The [CC] provenance layer was improved (normalization) but NOT tuned to specific test cases.
- The final-decision policy (v3) was NOT changed.
- The inventionPolicy parameter was added but NOT tuned to pass specific triplets.
- The validator prompt was refined once (after Iteration 3, to license sensory observation) but NOT further refined during Iteration 4. The failures observed are the first-failure record; no mid-experiment prompt changes were made.
