# Semantic Limitations

This document records the **known unresolved** semantic problems. These are NOT solved. Do not claim they are.

## A. Vague Quantifier Overblocking

**Status:** UNRESOLVED

**Example:**
> "Maya suspected Marcus might have taken some money."

**Problem:** The validator may incorrectly treat "some money" as an unsupported exact specificity, even when `state=KNOWS` authorizes the underlying fact. The [CC] layer cannot provide deterministic evidence to override the [LJ]'s faithfulness FAIL because "some money" has no numbers.

**Root cause:** The [LJ] treats vague quantifiers ("some", "a few", "several") as unsupported specifics. The arbitration policy (Rule 0) only overrides for state-supported numbers, not for vague quantifiers.

**Affected cases:** SM-4 (A2), T11-KNOWS-B (A3) from Iteration 4.2.

**Not solved.** Requires [LJ] prompt refinement to recognize vague quantifiers as licensed under LICENSED_FICTION when the underlying fact is state-supported.

## B. Domain-Level Suspicion Underblocking

**Status:** UNRESOLVED

**Example:**
> "Maya suspected something was wrong with the finances."

**Problem:** When `state=UNKNOWN`, the validator may accept this too freely. "The finances" is a specific domain, and suspicion of a specific domain without evidence is closer to a leak than to vague unease. But the V4.1 prompt's Rule 3 (vague uncertainty is not a leak) over-applies here.

**Root cause:** The boundary between "vague unease" (licensed) and "suspicion of a specific domain without evidence" (leak) is not perfectly calibrated in the [LJ] prompt.

**Affected cases:** T11-UNKNOWN-C (A4) from Iteration 4.2 — a regression introduced in V4.1.

**Not solved.** Requires [LJ] prompt refinement to distinguish vague unease from specific-domain suspicion.

## C. Paraphrase Overblocking

**Status:** UNRESOLVED

**Example:**
- Source: "three hospitals"
- Revision: "three medical centers"
- Expected: ACCEPT (semantic paraphrase)
- Actual: REJECT (lexical difference treated as faithfulness violation)

**Problem:** The validator treats synonym substitution as unfaithful under SOURCE_CONSTRAINED, even when the meaning is preserved.

**Root cause:** The [LJ] does lexical matching for faithfulness. It does not recognize "hospitals" ≈ "medical centers" as semantic equivalence. The [CC] layer cannot help (no semantic-equivalence checking).

**Affected cases:** P-1, P-2 from Iteration 4.1 paraphrase test. Also the nonfiction smoke test from Iteration 4.

**Not solved.** Requires either [LJ] prompt refinement (explicit synonym-equivalence rule) or a future semantic-similarity check.

## D. Semantic Memory Equivalence

**Status:** UNRESOLVED

**Problem:** If the state contains a memory ("Papa taught her to count by pill bottles") and the candidate paraphrases it ("Papa showed her how to count using amber vials"), the validator may treat the paraphrase as an invented memory rather than a state-supported one.

**Not solved.** Related to the paraphrase problem (C). Requires semantic-equivalence checking for memory references.

## E. Complex Co-reference

**Status:** UNRESOLVED

**Problem:** If the candidate uses a pronoun or indirect reference that requires resolving a complex co-reference chain (e.g., "she remembered what he had said about the thing in the drawer"), the validator may not correctly trace the reference to the state.

**Not solved.** Requires co-reference resolution beyond the current [CC] and [LJ] capabilities.

## F. Broader Invention-Policy Calibration

**Status:** UNRESOLVED

**Problem:** The validator does not perfectly distinguish what each policy licenses in edge cases:
- Under NONE: tautological statements ("the kitchen was there") may be overblocked
- Under SOURCE_CONSTRAINED: SOFT_CANON-supported details may be rejected
- Under LICENSED_FICTION: the boundary between "licensed sensory invention" and "invented semantic detail" is unclear

**Affected cases:** T12-NONE-C, T12-SOURCE-B from Iteration 4.1.

**Not solved.** Requires policy-specific prompt calibration.

## G. Iteration 4.2 Live-LLM Completion

**Status:** INCOMPLETE

**Problem:** 6 of 16 matrix cases in Iteration 4.2 could not be completed with live [LJ] due to persistent API rate-limiting. These cases are analyzed via deterministic logic + V4.1 equivalent results, but do not have full live-[LJ] validation.

**Not solved.** The incomplete cases are recorded as execution errors, not silently substituted. A future run with available API would complete the matrix.

---

## Summary

| Problem | Status | Fix location |
|---|---|---|
| Vague quantifier overblocking | UNRESOLVED | [LJ] prompt |
| Domain-level suspicion underblocking | UNRESOLVED | [LJ] prompt |
| Paraphrase overblocking | UNRESOLVED | [LJ] prompt or future semantic check |
| Semantic memory equivalence | UNRESOLVED | Future semantic check |
| Complex co-reference | UNRESOLVED | Future work |
| Policy-edge calibration | UNRESOLVED | [LJ] prompt |
| 4.2 live-LLM completion | INCOMPLETE | Future run with available API |

**None of these are solved.** The arbitration architecture (scoped [CC]/[LJ] with authority proportional to evidence strength) is stable and demonstrated. The remaining failures are [LJ] prompt calibration issues and semantic-equivalence capabilities that the current architecture does not provide.
