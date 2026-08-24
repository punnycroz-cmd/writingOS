# DELIVERABLE 8 — FAILURE_AND_RESEARCH_GAPS

**This deliverable records what the execution could not resolve.** It distinguishes: (a) diagnostic failures observed in execution, (b) architectural failures the loop revealed, (c) research gaps that remain (insufficient evidence), and (d) state/loop requirements discovered during execution.

---

## A. Diagnostic Failures (Observed)

### A-1. Deferred-mechanism detection fails (Case F)
**Failure:** The detector classified a planted-clue passage (the trowel) as CHARACTER_SPECIFIC instead of DEFERRED_CONTEXT, despite a DEFERRED_CHECK being present in state.
**Root cause:** The detection prompt includes DEFERRED_CONTEXT as a classification option and includes the deferredChecks in state, but does not explicitly instruct the detector to cross-reference passage elements against deferred-check anchor spans. The LLM treats it as a character-behavior question and misses the narrative-structure question.
**Why the outcome was still safe:** The detector assigned severity NONE, so no intervention was attempted, so no fabricated closure occurred. But this is architectural luck, not correctness.
**Risk:** A deferred-mechanism passage that the detector mis-classifies as GENERIC would trigger an intervention. The validator's `deferred` check might catch a resolution, but if the intervention merely "adds specificity" without explicitly resolving the clue, the validator may not flag it.
**Fix (proposed, not yet re-executed):** Add a [CC] pre-pass: for each DEFERRED_CHECK, check whether any passage substring overlaps the `anchorSpan`. If yes, force classification DEFERRED_CONTEXT regardless of the [LJ] detection. This moves deferred-mechanism detection from "hope the LLM notices" to "deterministic cross-reference."

### A-2. Tell-not-show false negative (Case D)
**Failure:** The detector classified a tell-not-show passage ("she didn't really understand the financial side") as CHARACTER_SPECIFIC, when a stricter diagnostic would flag it as GENERIC (character-consistent but not perception-specific).
**Root cause:** The detector conflates "consistent with character" (Maya is financially illiterate) with "causally tied to character's specific perception" (what does Maya specifically notice?). The former is a low bar; the latter is the actual diagnostic target.
**Risk:** The diagnostic under-flags. Passages that are technically character-consistent but generic in perception will pass without intervention. This is a precision/recall calibration issue.
**Fix (proposed):** Refine the detection prompt to distinguish "character-consistent statement" from "character-specific perception." Add a sub-question: "Does the passage show the character perceiving/noticing/thinking, or does it merely state character attributes?" This is a prompt-engineering refinement; it needs a larger case set to validate.

---

## B. Architectural Failures (Loop Revealed)

### B-1. The intervention generator cannot reliably self-constrain against invented facts
**Evidence:** Case A. The generator was explicitly told "Do NOT invent facts not in source or state" (constraint #3). It invented "127 tiles," "4:15am," "thirteen pills." Its self-reported constraints-applied list claimed compliance.
**Implication:** Prompt constraints on the generator are necessary but insufficient. The independent validator (Article II) is the actual enforcement point. This is not a failure of the architecture — it is a validation of the architecture's separation of generation from validation. But it means the generator alone cannot be trusted with specificity instructions.
**Open question:** Would a [CC] entity/number-extraction pre-pass on the generator's output (comparing invented numbers against source+state) catch what the [LJ] validator catches? This would be a cheaper check than a full LLM validation pass and could run before the validator. Not yet tested.

### B-2. The info-ownership gate was not exercised
**Evidence:** Case D. The diagnostic classified the passage as CHARACTER_SPECIFIC (no intervention), so the validator's `infoOwnership` check never ran on an attempted intervention.
**Implication:** The gate exists in the schema and in the validator prompt, but execution did not test it. A future test case must be BOTH generic AND info-ownership-constrained, forcing an intervention that the validator must block.
**Open question:** Is the validator's `infoOwnership` check reliable? It asks the LLM to detect whether the revised text shows the character perceiving a fact listed as "unknown" to them. Subtle leaks (the character "notices something is off" without naming the fact) may pass. Needs adversarial cases.

### B-3. The severity model is untested on edge cases
**Evidence:** The 6 cases covered NONE, MATERIAL, and CRITICAL. MINOR (OPTIONAL_POLISH) was never triggered. The boundary between MINOR and MATERIAL (narrativelyPurposeful GENERIC → MINOR; non-purposeful GENERIC → MATERIAL) is untested on ambiguous cases.
**Open question:** Is the `narrativelyPurposeful` flag reliable enough to route severity? Case C used it correctly, but a passage that is *partially* purposefully generic is a harder case.

---

## C. Research Gaps (Insufficient Evidence — Cannot Be Settled by Literature)

These gaps carry forward from the research deliverable (Part D) and are **confirmed by execution**, not resolved by it.

### C-1. Foreshadowing / long-range mechanism detection has no validated method
**Status:** Confirmed. Case F failed. The research flagged this as a gap (D-2); execution proved the gap is real. The proposed fix ([CC] anchor-span cross-reference) is unvalidated.

### C-2. Error-vs-variation classification (ESL) is unsolved
**Status:** Confirmed. Not tested in this loop (no ESL case). The research flagged this (D-3); it remains unsolved. The engine cannot reliably distinguish "ESL error" from "identity-bearing variation." Constitution candidate C-7 depends on this capability and remains NEEDS EVIDENCE.

### C-3. Inter-register conflict resolution is under-researched
**Status:** Confirmed. Not tested in this loop (single-register). The research's C-8 (stake-primacy) was rejected from the Constitution for reordering the settled stack. The OS casebook approach is proposed but unvalidated.

### C-4. Factuality metrics for rewriting (vs. summarization) are unproven
**Status:** Confirmed. The fiction loop does not use FactCC/QuestEval/DAE (those are nonfiction). The research's adaptation claim (HALL-2) is unvalidated for rewriting. The independent validator's `faithfulness` check is an [LJ] judgment, not a trained factuality model.

### C-5. LLM-as-judge for rewriting quality is under-studied
**Status:** Confirmed. The independent validator IS an LLM-as-judge. Its reliability is unknown beyond the 6 cases. The research flagged this (D-6); execution did not resolve it.

### C-6. Multi-label register detection on the engine's seven packs
**Status:** Confirmed. Not tested (single-register fiction). Research gap D-7 stands.

### C-7. Drift detection for writing diagnostics
**Status:** Confirmed. Not tested (single-pass). Research gap D-10 stands.

---

## D. State / Loop Requirements Discovered During Execution

These are requirements the loop revealed it needed, which were not fully specified in the research.

### D-1. A [CC] deferred-check cross-reference pre-pass
**Discovered:** Case F. The [LJ] detector does not reliably notice deferred mechanisms. A deterministic pre-pass that checks passage-anchor-span overlap is needed before [LJ] detection.
**Status:** Proposed in the OS spec; not yet implemented or re-executed.

### D-2. A [CC] entity/number-extraction check on intervention output
**Discovered:** Case A. The generator invents numbers/quantities. A deterministic check comparing the intervention's numbers/entities against source+state could catch invented specifics before the [LJ] validator runs.
**Status:** Proposed; not yet implemented. Would be a cheaper first-line defense than the full LLM validation.

### D-3. A show-vs-tell distinction in the detection prompt
**Discovered:** Case D. The detector conflates character-consistency with character-specificity. The prompt needs a sub-question distinguishing "states character attributes" from "shows character perceiving."
**Status:** Prompt refinement proposed; not yet re-executed.

### D-4. A combined generic + info-ownership-constrained test case
**Discovered:** Case D did not exercise the info-ownership gate because the diagnostic did not flag genericity. A case that is BOTH generic AND info-ownership-constrained is needed to test the gate under intervention pressure.
**Status:** Test-case design gap; to be added to the corpus.

### D-5. The `changedAt` field in Information Ownership
**Discovered:** Defined in the schema but not exercised. Long-range knowledge-state changes (a character learns a fact in scene 7) need this field. Not yet tested.
**Status:** Retained as proposed; needs multi-scene cases.

---

## E. What Execution Did NOT Prove

- **It did not prove the diagnostic is reliable.** 6 cases is a characterization, not a validation. Precision/recall are unknown.
- **It did not prove the validator is reliable.** The validator caught 1/1 obvious hallucinations. Subtle hallucinations, partial leaks, and voice-degradation are untested.
- **It did not prove the architecture generalizes beyond fiction.** Single-register fiction only.
- **It did not prove the severity model is complete.** MINOR was never triggered; edge cases untested.
- **It did not calibrate any threshold.** Every `[CAL]` remains `[CAL]`.

Execution proved only this: **the smallest version of the architecture (5 Constitution articles, 8-stage loop, 4 state objects, independent validation) survives its first contact with real text and makes one defensible decision (blocking a hallucinated specificity insertion) that a naive loop would not have made.** That is the minimum viable validation. Everything beyond it is future work.
