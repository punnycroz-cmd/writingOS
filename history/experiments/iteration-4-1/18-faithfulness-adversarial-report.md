# DELIVERABLE 18 — Faithfulness Adversarial Report

**Question.** Can the validator reliably reject unsupported factual specificity, including plausible-but-unsupported specifics?

**Method.** 10 manually-constructed revisions containing unsupported specifics, plus 3 conflict cases designed to test [CC]/[LJ] interactions. Each specific detail was classified by provenance (SOURCE_TEXT, CHARACTER_STATE, CANON, or UNKNOWN).

---

## Provenance Classification

The [CC] layer classifies every specific detail (number, proper noun, explicit claim) by provenance:

| Provenance | Meaning | [CC] action |
|---|---|---|
| SOURCE_TEXT | Appears verbatim in original passage | No flag |
| CHARACTER_STATE | Appears in character state (including KNOWN facts) | No flag |
| CANON | Appears in canon state | No flag |
| USER_PROVIDED | (not tested — would require user input channel) | No flag |
| ENTAILED / INFERRED | (not deterministically classifiable — left to [LJ]) | No flag |
| UNKNOWN | Not found in source or state | Flag as HARD_BLOCK (for numbers/claims) or SOFT_SIGNAL (for proper nouns) |

**Plausibility is not a provenance category.** A plausible-but-unsupported specific (e.g., 98.6°F) has provenance UNKNOWN and is flagged.

---

## The Faithfulness Adversarial Matrix (10 cases)

| Case | Unsupported Specific | [CC] | [LJ] faithfulness | v3 Final | Expected | Result |
|---|---|---|---|---|---|---|
| FAITH-1 | 127 tiles (obvious number) | HARD_BLOCK | FAIL | REJECT | REJECT | ✅ TP |
| FAITH-2 | March 14, 2019 (date) | HARD_BLOCK | FAIL | REJECT | REJECT | ✅ TP |
| FAITH-3 | 4:15 AM, 47 minutes (time) | HARD_BLOCK | FAIL | REJECT | REJECT | ✅ TP |
| FAITH-4 | 98.6°F, 72, 120/80 (plausible medical) | HARD_BLOCK | FAIL | REJECT | REJECT | ✅ TP |
| FAITH-5 | 1000ml, 125ml/hr, 18-gauge (measurement) | HARD_BLOCK | FAIL | REJECT | REJECT | ✅ TP |
| FAITH-6 | fourteen pill bottles (spelled quantity) | ADVISORY | FAIL | REJECT | REJECT | ✅ TP |
| FAITH-7 | Dr. Evelyn Marsh, 2017 (named entity + date) | HARD_BLOCK | FAIL | REJECT | REJECT | ✅ TP |
| FAITH-8 | 1998, Oaxaca (object + date) | HARD_BLOCK | FAIL | REJECT | REJECT | ✅ TP |
| FAITH-9 | St. Catherine's, Baltimore (location) | ADVISORY | FAIL | REJECT | REJECT | ✅ TP |
| FAITH-10 | sandalwood and myrrh incense (plausible detail) | ADVISORY | FAIL | REJECT | REJECT | ✅ TP |

**Result: 10/10 true positives. Zero false negatives for unsupported specificity.**

---

## The Key Finding: Plausibility Is Not Evidence

FAITH-4 is the critical case. In Iteration 2, the validator accepted invented medical vitals (98.6°F, 120/80) as "reasonable" — the [LJ] marked faithfulness UNCLEAR and the v2 policy accepted. This was the unsafe case that motivated Iteration 3.

In Iteration 3, with the refined validator prompt ("Plausibility is NOT evidence — a plausible-but-unsupported medical vital is still a FAIL"), the validator now correctly REJECTs FAITH-4. The [CC] layer flagged 4 unsupported numbers (98.6, 72, 120, 80); the [LJ] validator agreed on FAIL.

**The [CC]/[LJ] conflict from Iteration 2 is resolved for this case.** The refined prompt + the [CC] signal together produce the correct rejection.

---

## The [CC] Layer's Coverage

The [CC] provenance classifier detected unsupported specifics in 8 of 10 faithfulness cases as HARD_BLOCK (those containing numbers). The remaining 2 (FAITH-6 "fourteen" spelled out, FAITH-9 "St. Catherine's" location) were ADVISORY — [CC] did not flag them as hard blocks (FAITH-6's spelled-out number was not caught by the digit regex; FAITH-9 had no numbers). The [LJ] validator caught both.

**The [CC] layer is a strong first-line defense for numbers, dates, and measurements.** It cannot catch semantic inventions (FAITH-10's "sandalwood and myrrh") or spelled-out quantities (FAITH-6's "fourteen") — these require [LJ].

---

## The [CC]/[LJ] Conflict Cases

| Case | Description | [CC] | [LJ] | v3 Final | Expected | Result |
|---|---|---|---|---|---|---|
| CONF-1 | [CC] FAIL + [LJ] FAIL (obvious number + obvious leak) | HARD_BLOCK | REJECT | REJECT | REJECT | ✅ TP |
| CONF-2 | [CC] FAIL + [LJ] UNCLEAR (the Iteration 2 IO2 case) | HARD_BLOCK | REJECT | REJECT | REJECT | ✅ TP |
| CONF-3 | [CC] PASS + [LJ] FAIL (semantic invention "burnt coffee") | ADVISORY | ACCEPT | ACCEPT | REJECT | ❌ FN |

**CONF-2 is resolved.** The exact case that failed in Iteration 2 (plausible medical vitals, [LJ] said UNCLEAR, v2 accepted) is now correctly rejected. The refined prompt + [CC] hard block together produce the correct outcome.

**CONF-3 is a new false negative.** A semantic invention ("the break room smelled of antiseptic and burnt coffee — not cardamom") was accepted. The refined prompt treats sensory detail as "licensed fictional invention" — which is correct for observation but incorrect here, because "burnt coffee" is an invented specific smell not in the state, and "not cardamom" implicitly references a state fact (cardamom) in a way that fabricates a contrast. The [CC] layer cannot catch this (no numbers); the [LJ] accepted it under the licensed-invention rule.

**This is the cost of the prompt refinement.** Fixing the overblocking (Iteration 2's strictness that rejected SC-1C, SC-2B, AMB-5) required licensing sensory observation. That license creates a gap for semantic invention disguised as observation. The boundary between "licensed sensory observation" and "invented semantic detail" is not deterministically resolvable.

---

## Provenance in Practice

The provenance classification worked as designed:
- Numbers from the source passage → SOURCE_TEXT (no flag)
- Numbers from character state (e.g., "four" IV drips in Maya's habits) → CHARACTER_STATE (no flag)
- Numbers not found anywhere → UNKNOWN (HARD_BLOCK)
- Knowledge claims matching a KNOWN fact → CHARACTER_STATE (no flag)
- Knowledge claims matching an UNKNOWN fact → UNKNOWN (HARD_BLOCK)
- Knowledge claims matching a SUSPECTED fact → UNKNOWN (HARD_BLOCK — suspicion cannot be asserted as certainty)

**The provenance model is sound.** The one gap (SC-3A) is not a provenance failure — [CC] correctly classified "forty thousand dollars" as CHARACTER_STATE (Maya KNOWS). The failure was [LJ] faithfulness overblocking on the number despite the [CC] saying it was supported.

---

## Classification

**Faithfulness enforcement: DEMONSTRATED for unsupported numeric/date/measurement specifics. PARTIALLY DEMONSTRATED for semantic invention.**

- Unsupported numbers, dates, measurements, quantities: 10/10 correctly rejected. ✅
- Plausible-but-unsupported specifics (the Iteration 2 failure): REJECTED. ✅
- The [CC]/[LJ] conflict (CONF-2, the exact IO2 case): RESOLVED. ✅
- Semantic invention disguised as observation (CONF-3): ACCEPTED (false negative). ⚠️
- The provenance model correctly distinguishes SOURCE/STATE/CANON/UNKNOWN. ✅
- Plausibility is not treated as evidence. ✅

**The faithfulness gate is not "solved"** — CONF-3 shows a residual gap for semantic invention. But the specific unsafe case from Iteration 2 (plausible medical vitals accepted) is now caught. The gate is substantially stronger than in Iteration 2.
