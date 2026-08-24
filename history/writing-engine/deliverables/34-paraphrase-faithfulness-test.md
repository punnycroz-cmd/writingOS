# DELIVERABLE 34 — Paraphrase Faithfulness Test

**Question.** Is paraphrase overblocking a separate problem from the state-reading and epistemic-level issues?

---

## The Test

5 cases under SOURCE_CONSTRAINED policy, testing whether the validator recognizes semantic equivalence (hospitals ↔ medical centers) vs. semantic difference (hospitals ↔ universities).

| Case | Source | Revised | Expected | V4.1 Result | Correct? |
|---|---|---|---|---|---|
| P-1 | "three hospitals" | "three medical centers" | ACCEPT | REJECT ❌ | ❌ |
| P-2 | "three hospitals" | "three clinics" | ACCEPT | REJECT ❌ | ❌ |
| P-3 | "three hospitals" | "three universities" | REJECT | REJECT ✅ | ✅ |
| P-4 | "14 hospitals" (in longer sentence) | "14 medical centers" | ACCEPT | ACCEPT ✅ | ✅ |
| P-5 | "14 hospitals" | "50 hospitals" | REJECT | REJECT ✅ | ✅ |

**Result: 3/5 correct.**

---

## The Finding: Paraphrase Overblocking Persists

**P-1 and P-2 are false positives.** "Hospitals" → "medical centers" and "hospitals" → "clinics" are semantic paraphrases that should be accepted under SOURCE_CONSTRAINED (the meaning is preserved; no unsupported specifics introduced). The validator rejected both, treating the lexical difference as a faithfulness violation.

**P-4 is a true negative.** The same paraphrase (hospitals → medical centers) in a longer sentence was accepted. This suggests the validator's paraphrase recognition is context-dependent — it overblocks on short sentences where the changed word is salient, but accepts in longer sentences where context provides more semantic anchoring.

**P-3 and P-5 are true positives.** "Hospitals" → "universities" (non-equivalent) and "14" → "50" (different number) were correctly rejected. The validator can distinguish semantic difference from semantic equivalence — it just doesn't do so reliably for paraphrase.

---

## Is Paraphrase a Separate Problem?

**YES.** The paraphrase overblocking is distinct from:
- **State-reading errors** (fixed by V4.1's state-aware prompt) — paraphrase cases have no info-ownership dimension.
- **Epistemic-level confusion** (fixed by V4.1's Rule 2) — paraphrase cases have no epistemic claim.
- **[CC] HARD_BLOCK false positives** (the SM-3/SM-4 problem) — the [CC] said ADVISORY on P-1 and P-2 (no unsupported numbers); the [LJ] alone produced the REJECT.

**The paraphrase problem is purely [LJ]-level semantic judgment.** The [LJ] is too literal about lexical matching when determining faithfulness under SOURCE_CONSTRAINED. It treats "medical centers" ≠ "hospitals" as a faithfulness violation, not recognizing them as synonyms.

---

## Why This Matters

The Iteration 4 nonfiction smoke test flagged this same issue ("medical centers" rejected when source said "hospitals"). Iteration 4.1 confirms it is a persistent, separate problem — not fixed by state-aware prompting (which addresses info-ownership) or claim-state resolution (which addresses epistemic claims).

**Paraphrase recognition requires semantic equivalence checking**, which neither the [CC] provenance layer nor the claim-state resolver provides. The [LJ] must do it, and the current prompt does not explicitly instruct it to treat synonyms as equivalent.

---

## Proposed Fix (not yet implemented)

Add a rule to the V4.1 validator prompt under SOURCE_CONSTRAINED:
> "Lexical substitution with semantic equivalence (e.g., 'hospitals' → 'medical centers', 'physicians' → 'doctors') is PASS for faithfulness under SOURCE_CONSTRAINED, provided no unsupported specifics are introduced. Do not FAIL faithfulness merely because a word changed if the meaning is preserved."

This is a prompt-level fix, not an architectural one. It would need testing on a larger paraphrase matrix to verify it doesn't over-license (e.g., accepting "hospitals" → "universities" as paraphrase when they are not equivalent).

---

## Classification

**Paraphrase faithfulness: SEPARATE PROBLEM, NOT FIXED.**

- The [CC] layer cannot help (no semantic equivalence checking). ❌
- The claim-state resolver cannot help (no epistemic claim involved). ❌
- The V4.1 state-aware prompt does not address paraphrase (it addresses state-reading and epistemic levels). ❌
- The [LJ] overblocks on short-sentence paraphrase (P-1, P-2) but accepts long-sentence paraphrase (P-4). ⚠️
- The [LJ] correctly rejects non-equivalent substitution (P-3) and numeric changes (P-5). ✅

**Paraphrase is an independent [LJ]-level faithfulness problem that requires its own prompt rule or a future semantic-similarity check.** It is not solved by state-aware prompting, claim-state resolution, or [CC] provenance normalization.
