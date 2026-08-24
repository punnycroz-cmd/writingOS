# DELIVERABLE 12 — Deferred-Check Validation

**Question.** Does the deterministic anchor-span cross-reference repair the v1 Case F failure (deferred mechanism missed)?

---

## The [CC] Pre-Pass Design

Implemented in `deterministic.ts` as `checkDeferredAnchor(passage, deferredChecks)`:

1. **Exact substring match** (normalized whitespace): if the passage contains the anchor span as a substring → `DEFERRED_ANCHOR_PRESENT`. This FORCES classification to `DEFERRED_CONTEXT` regardless of what the [LJ] detector says.
2. **High Jaccard overlap** (≥0.3 on tokens >2 chars): → `DEFERRED_ANCHOR_POSSIBLY_RELATED`. This is a HINT to the [LJ] detector, not an override.
3. **3-gram overlap**: → `DEFERRED_ANCHOR_POSSIBLY_RELATED` (hint).
4. **No overlap**: → `NO_DEFERRED_RELEVANCE`. Normal detection proceeds.

---

## Test Results

### DF1 — Known deferred anchor present (the v1 Case F rerun)

**Anchor:** "the gardener had left a trowel on the bench"
**Passage:** "...Maya noticed the gardener had left a trowel on the bench. Odd, but she was late..."

**[CC] result:** `DEFERRED_ANCHOR_PRESENT` (exact substring match).
**Forced classification:** `DEFERRED_CONTEXT`.
**Decision:** `DEFER`.
**Outcome:** ✅ The v1 failure is REPAIRED. The deterministic pre-pass correctly detected the anchor and forced deferral.

### DF2 — No deferred relevance (false-positive guard)

**Anchor:** "the gardener had left a trowel on the bench"
**Passage:** "Maya filled the coffee maker and watched it brew. She thought about calling Papa's nurse..."

**[CC] result:** `NO_DEFERRED_RELEVANCE`.
**Detection:** `GENERIC` (normal).
**Outcome:** ✅ The pre-pass did NOT over-defer. Normal detection proceeded. (The intervention was later blocked by the validator for faithfulness — a separate issue.)

### DF3 — Paraphrased anchor (the hard case)

**Anchor:** "the gardener had left a trowel on the bench"
**Passage:** "Maya paused at the garden bench where Tomás's small spade sat waiting, beside her own set of keys. She did not pick them up."

**[CC] result:** `NO_DEFERRED_RELEVANCE`. The paraphrase shares only the token "bench" with the anchor. Jaccard = low. No 3-gram overlap.
**Detection:** `CHARACTER_SPECIFIC` (the [LJ] did not recognize the deferred mechanism).
**Decision:** `ACCEPT_UNCHANGED`.
**Outcome:** ⚠️ PARTIAL FAILURE. The paraphrase was not caught. The outcome was safe (no intervention, no fabricated closure) but for the wrong reason (the detector thought it was character-specific, not deferred).

**Root cause.** Lexical matching has a ceiling. "Trowel" ≠ "small spade"; "the gardener had left" ≠ "Tomás's small spade sat waiting." The [CC] pre-pass catches exact and near-exact matches; paraphrases require semantic matching, which is an [LJ] capability — and the [LJ] detector did not make the connection.

**Why the outcome was still safe.** The detector classified the passage as CHARACTER_SPECIFIC (severity NONE), so no intervention was attempted, so no fabricated closure occurred. The architecture's restraint (no intervention at NONE severity) protected the deferred mechanism even though detection was wrong. But this is architectural luck, not correctness — a paraphrased deferred passage that the detector mis-classifies as GENERIC would trigger an intervention.

---

## The Three-Way Distinction (Section 5)

| Classification | Meaning | How detected |
|---|---|---|
| `NO_DEFERRED_RELEVANCE` | No overlap with any deferred anchor | [CC] pre-pass: no substring, no Jaccard ≥0.3, no n-gram overlap |
| `DEFERRED_ANCHOR_PRESENT` | Exact anchor found in passage | [CC] pre-pass: substring match → forces DEFERRED_CONTEXT |
| `DEFERRED_ANCHOR_POSSIBLY_RELATED` | Paraphrase or partial overlap | [CC] pre-pass: Jaccard ≥0.3 or n-gram overlap → hints to [LJ] |

In execution: DF1 = PRESENT (✅), DF2 = NO_RELEVANCE (✅), DF3 = NO_RELEVANCE (should have been POSSIBLY_RELATED — the Jaccard threshold was too high or the tokenization too aggressive for this paraphrase).

---

## Classification

**Deferred-check detection: PARTIALLY DEMONSTRATED.**

- Exact anchor detection: ✅ DEMONSTRATED (DF1 repaired).
- No-relevance correct rejection: ✅ DEMONSTRATED (DF2).
- Paraphrase detection: ❌ FAILED (DF3 — the [CC] returned NO_RELEVANCE for a genuine paraphrase; the [LJ] also missed it).
- The deterministic pre-pass is a strict improvement over v1 (where DF1 failed), but lexical matching has a ceiling that paraphrases expose.

**What would move this to DEMONSTRATED:** a semantic-similarity check (embeddings) for the POSSIBLY_RELATED path, or an [LJ] cross-reference step that explicitly asks "does this passage relate to any deferred check?" before the main detection. The [LJ] cross-reference was not implemented in v2.
