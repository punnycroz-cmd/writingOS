# DELIVERABLE 5 — WORKED_EXECUTION_TRACE

**This deliverable summarizes the actual execution.** The full machine-readable logs are in `/home/z/my-project/writing-engine/logs/` (per-case JSON + `execution-trace.md` + `all-logs.json`). The implementation is in `/home/z/my-project/writing-engine/src/`.

**Execution date:** 2026-08-21. **Cases run:** 6 (A–F). **All completed without runtime error.**

---

## Summary Table

| Case | Label | Detection | Severity | Decision | Intervention? | Validation | Accepted? | Outcome vs. Expected |
|---|---|---|---|---|---|---|---|---|
| A | Clearly generic | GENERIC | MATERIAL | BLOCK_INTERVENTION | yes | REJECT (faithfulness FAIL) | no | Partial — detection correct; intervention blocked by validator (this is the architecture working) |
| B | Genuinely specific | CHARACTER_SPECIFIC | NONE | ACCEPT_UNCHANGED | no | n/a | yes | ✅ Match |
| C | Intentionally generic | INTENTIONALLY_GENERIC | NONE | ACCEPT_UNCHANGED | no | n/a | yes | ✅ Match (false-positive guard held) |
| D | Info-ownership constraint | CHARACTER_SPECIFIC | NONE | ACCEPT_UNCHANGED | no | n/a | yes | ⚠️ Mixed — no leak, but diagnostic was lenient (false-negative risk) |
| E | Canon violation | CANON_VIOLATION | CRITICAL | REJECT_AND_FLAG | no | n/a | no | ✅ Match (canon routing worked) |
| F | Deferred mechanism | CHARACTER_SPECIFIC | NONE | ACCEPT_UNCHANGED | no | n/a | yes | ❌ Failure — deferred mechanism not detected |

---

## The Successful Intervention That Was Rejected (Case A — the key evidence)

**Original passage:**
> Maya walked into the room. She looked around. There were many things to notice. She felt sad about her situation and determined to keep going. The room was familiar to her.

**Detection:** GENERIC (correct). The detector noted: "no counting of objects, no focus on smells, no automatic reading of dosages... the description of feeling 'sad' and 'determined' is generic emotional labeling that contradicts Maya's established voice."

**Severity:** MATERIAL. **Decision:** TARGETED_REWRITE.

**Generated intervention:**
> Maya walked into the room. She counted the IV drips first—three steady, one fluctuating. The antiseptic smell mixed with something sweet she couldn't place. Her eyes automatically scanned the dosage labels on the cabinets: 5mg, 10mg, 20mg. The room was familiar; she'd counted these same tiles—127 of them—since Papa's diagnosis. She noted the 4:15am time on the clock. Three hours until her shift ended. She kept counting the pills in the dispenser, thirteen left, and determined to make it through without checking her phone.

**Intervention types used:** perception_detail, attention_detail, sensory_detail, internal_thought. **State used:** perceptualHabits, voice, currentKnowledge, goals. **Constraints "applied" (per generator):** all 7.

**Independent validation result:**
- meaning: PASS, character: PASS, infoOwnership: PASS, canon: PASS, voice: PASS, register: PASS, intelligibility: PASS, deferred: PASS
- **faithfulness: FAIL** — "The revision invents specific details like '127 tiles', '4:15am time', and 'thirteen pills' that weren't in the original text or character state."
- **Overall: REJECT**

**Outcome:** Intervention BLOCKED. Original text retained.

**Why this is the most important result of the experiment.** The generator was explicitly told "Do NOT invent facts not in source passage or state" (constraint #3). It violated this instruction under specificity pressure — it invented a tile count (127), a time (4:15am), and a pill count (thirteen) to satisfy the "be more specific" demand. The generator's own constraint-checklist claimed compliance. Only the **independent validator**, which did not see the generator's reasoning, caught the faithfulness violation. This is the Faithfulness Gate (Constitution Article I) actually preventing a hallucinated specificity insertion. **The architecture works because generation and validation are separated.**

---

## The Successful Non-Intervention (Case B — false-positive guard)

**Passage:** the cardamom/tile/pill-bottle passage (already character-specific).

**Detection:** CHARACTER_SPECIFIC. The detector correctly identified that the passage leverages Maya's counting habit, her scent-memory of Papa's pharmacy, and her clinical sensitivity to the "metallic tang." Severity NONE. No intervention. **The diagnostic did not false-positive on genuinely specific text.**

---

## The Intentional-Genericity Success (Case C — the hardest false-positive case)

**Passage:** the depersonalization passage ("The morning moved the way mornings do...").

**Detection:** INTENTIONALLY_GENERIC. The detector recognized that the flat, detached narration is the narrative point (Maya's depersonalization under grief load, established as SOFT_CANON). Severity NONE. No intervention. **A naive "always make specific" loop would have ruined this passage. The architecture correctly recognized purposeful genericity.**

---

## The Canon-Violation Success (Case E — correct routing)

**Passage:** Arlo (blind, HARD_CANON) "looked around... noting the deep crimson of the curtains."

**Detection:** CANON_VIOLATION. The detector found the conflict: "Arlo is described as looking around and noting visual details... which contradicts the hard canon that he is totally blind." Severity CRITICAL. Decision REJECT_AND_FLAG. No intervention attempted.

**Why this matters:** A specificity-focused loop without canon detection might have tried to "add more specific visual detail" — deepening the violation. The architecture routed this to author-attention, not to automated rewriting. **Canon integrity outranks genericity correction.**

---

## The Rejected "Tempting Improvement" (Case D — partial success)

**Passage:** Maya glances at quarterly numbers, doesn't understand finances, trusts Marcus.

**Expected:** the diagnostic might flag genericity; an intervention would be attempted; the validator would block any revision leaking the embezzlement (which Maya does not know about).

**Actual:** The diagnostic classified the passage as CHARACTER_SPECIFIC (not GENERIC), so no intervention was attempted. The info-ownership gate was therefore never exercised.

**Assessment:** The outcome was correct (no leak), but for an incomplete reason. The diagnostic was lenient — it accepted "she didn't really understand the financial side" as character-specific (reflecting Maya's financial illiteracy) when a stricter diagnostic would have flagged it as tell-not-show. This is a **false-negative risk**: character-consistent telling is not the same as character-specific perception. The diagnostic needs a show-vs-tell distinction (recorded as a calibration gap).

**What would have tested the gate:** if the diagnostic had flagged GENERIC and an intervention had been attempted, the validator's `infoOwnership` check would have been the test. To properly validate the info-ownership gate, a future test case should be a passage that is BOTH generic AND information-ownership-constrained, forcing an intervention that the validator must block.

---

## The Failure (Case F — deferred mechanism not detected)

**Passage:** Maya notices the gardener's trowel on the bench, sets her keys beside it, leaves both.

**Expected:** DEFERRED_CONTEXT → DEFER (the trowel is a planted clue; payoff in ch9).

**Actual:** CHARACTER_SPECIFIC → NONE → ACCEPT_UNCHANGED. The detector reasoned: "Maya's controlled, observational nature in noticing the trowel but not investigating further... consistent with her emotional state." It did NOT recognize the trowel as a deferred mechanism, despite a DEFERRED_CHECK (DC-1) being present in the state.

**Root cause:** The detection prompt mentions DEFERRED_CONTEXT as a classification and includes the deferredChecks in the state, but does not explicitly instruct the detector to cross-reference passage elements against deferred-check anchor spans. The detector treated the passage as a character-behavior question and missed the narrative-structure question.

**Why the outcome was still safe:** Because the diagnostic classified it as CHARACTER_SPECIFIC (severity NONE), no intervention was attempted, so no fabricated closure occurred. The architecture's restraint (no intervention at NONE severity) protected the deferred mechanism even though detection was wrong. **But this is luck, not correctness** — a different passage where the detector mis-classified a deferred mechanism as GENERIC would have triggered an intervention that the validator might not catch (the validator checks "did you resolve a deferred check?" but if the detector didn't flag it, the validator may not know to look).

**Fix discovered (not yet re-executed):** The detection stage needs an explicit cross-reference step: "For each DEFERRED_CHECK, check whether any passage element overlaps its anchor span. If yes, classify as DEFERRED_CONTEXT." This should be a [CC] pre-pass before the [LJ] detection, not a hope that the LLM notices. Recorded in the OS spec as a discovered requirement.

---

## False-Positive and False-Negative Analysis

### False positives (diagnostic says GENERIC when it shouldn't)
- **Case C** could have been a false positive (generic prose) but was correctly identified as INTENTIONALLY_GENERIC. **No false positive.**
- **No false positives observed** in this run. The `narrativelyPurposeful` flag and the INTENTIONALLY_GENERIC classification prevented them.

### False negatives (diagnostic says specific-enough when it isn't)
- **Case D:** CHARACTER_SPECIFIC assigned to a tell-not-show passage. **Likely false negative** — the passage is character-consistent but not perception-specific. Severity of this error: low (no harm done; no intervention attempted), but it means the diagnostic under-flags.
- **Case F:** CHARACTER_SPECIFIC assigned to a deferred-mechanism passage. **Definite false negative** — the deferred mechanism was missed. Severity of this error: medium (the architecture's restraint prevented harm, but a different passage could be harmed).

### Architectural failure (independent of the diagnostic)
- **Case A:** the generator violated its own constraints. This is not a diagnostic failure — it is a **generator reliability failure** that the independent validator caught. The architecture compensates for generator unreliability via separated validation. This is a design-validation success, not a failure.

---

## What Execution Proved

1. **The Faithfulness Gate (Article I) works** — it prevented a hallucinated specificity insertion (Case A).
2. **Independent validation (Article II) is load-bearing** — the generator cannot self-validate.
3. **Canon-integrity routing (Article III) works** — Case E correctly escalated instead of deepening the violation.
4. **Intentional-genericity recognition works** — Case C was not false-positive'd.
5. **State persistence (Article V) works** — all stages consulted explicit state.
6. **Deferred-mechanism detection is broken** — Case F failed; the fix requires an explicit [CC] cross-reference step, not an [LJ] hope.
7. **The diagnostic has false-negative risk on tell-not-show passages** — Case D was lenient.
8. **The severity model (qualitative, no thresholds) produces correct routing** — no [CAL] value was needed.
