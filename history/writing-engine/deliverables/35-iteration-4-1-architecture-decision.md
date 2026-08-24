# DELIVERABLE 35 — Iteration 4.1 Architecture Decision

**Question.** Are the current failures primarily prompt-level, deterministic-state-resolution, or architectural?

---

## The Evidence

| Failure type | V4 count | V4.1 count | Root cause |
|---|---|---|---|
| [LJ] didn't consult state | 4 (T11-KNOWS-A, T11-SUSPECTS-B, T11-UNKNOWN-B, T8-A) | 0 | **FIXED by V4.1 prompt** (Rule 1: consult state before io=FAIL) |
| [LJ] overblocked vague uncertainty | 5 (T3-C, T6-C, T7-A, T7-C, T11-UNKNOWN-B) | 0 | **FIXED by V4.1 prompt** (Rule 3: vague uncertainty is not a leak) |
| [LJ] overblocked paraphrase | 1 (T7-A, partly) | 2 (P-1, P-2) | **NOT FIXED** — separate problem, needs prompt rule for semantic equivalence |
| [CC] HARD_BLOCK overriding correct [LJ] | 0 | 2 (SM-3, SM-4) | **NEW PROBLEM** — [CC] claim-pattern false positives + non-overridable policy |
| [LJ] policy-edge overblocking | 2 (T12-NONE-C, T12-SOURCE-B) | 2 (same) | **NOT FIXED** — validator doesn't perfectly distinguish what each policy licenses |
| [LJ] too lenient on specific suspicion | 0 | 1 (T11-UNKNOWN-C regression) | **NEW REGRESSION** — Rule 3 over-applied to suspicion of a specific domain |

---

## The Decision

### 1. The V4 state-reading failure was PRIMARILY PROMPT-LEVEL.
V4.1's state-aware prompt (5 rules) fixed 8 of 12 V4 failures, including all 4 state-reading errors and all 5 vague-uncertainty overblocks. The [LJ] now reliably consults state (`stateConsulted: true` in every case) and distinguishes epistemic levels.

**No architectural change was needed for the core state-reading problem.** Prompting alone was sufficient.

### 2. The claim-state resolver ADDS VALUE but is NOT REQUIRED for state-reading.
The resolver reliably detects STATE_CONTRADICTION (8/8) and STATE_SUPPORTED (3/3 at [LJ] level). It is a useful [CC]-level signal that anchors the [LJ]'s state-reading. But the V4.1 prompt alone (without the resolver) would likely have fixed most cases too — the resolver makes the fix more reliable, not possible.

**The resolver should be promoted into the OS as a [CC]-level signal** (it is deterministic, auditable, and reliable for explicit claims), but it should NOT replace the [LJ] on implicit/vague claims.

### 3. The [CC] HARD_BLOCK non-overridable policy is NOW TOO STRONG and needs architectural adjustment.
This is the one architectural change the evidence supports. In V4, the [LJ] was unreliable on state, so [CC] HARD_BLOCK was a necessary backstop. In V4.1, the [LJ] is state-aware, so [CC] HARD_BLOCK on claim patterns now blocks correct [LJ] judgments (SM-3, SM-4, T11-KNOWS-B).

**Proposed change:** downgrade [CC] claim-pattern HARD_BLOCK to SOFT_SIGNAL when the claim-state resolver returns STATE_SUPPORTED. Specifically:
- If the claim resolver says STATE_SUPPORTED → [CC] severity for that claim is ADVISORY (not HARD_BLOCK), and the [LJ] adjudicates.
- If the claim resolver says STATE_CONTRADICTION → [CC] severity remains HARD_BLOCK (non-overridable).
- If the claim resolver says NO_CLAIM_DETECTED → [CC] severity remains as-is (number-based HARD_BLOCK still applies; claim-pattern HARD_BLOCK becomes SOFT_SIGNAL).

This is a **narrow architectural adjustment to the [CC]/[LJ] policy**, not a redesign. It makes the [CC] state-aware for claim patterns, which it currently is not.

### 4. Paraphrase overblocking is a SEPARATE [LJ] PROMPT problem.
It is not architectural. The [LJ] needs a prompt rule for semantic equivalence under SOURCE_CONSTRAINED. This is future work (a prompt refinement, not an architecture change).

### 5. Policy-edge overblocking (T12-NONE-C, T12-SOURCE-B) is an [LJ] PROMPT problem.
The validator doesn't perfectly distinguish what NONE vs SOURCE_CONSTRAINED licenses. This is prompt calibration, not architecture.

---

## What Should Change in Fiction OS

| Change | Type | Evidence |
|---|---|---|
| **Adopt V4.1 state-aware validator prompt** | OS (prompt) | 8/12 V4 failures fixed; 0% false rejection on A variants |
| **Promote claim-state resolver to OS [CC] layer** | OS (deterministic) | 8/8 STATE_CONTRADICTION correct; 3/3 STATE_SUPPORTED correct at [LJ] level |
| **Revise [CC] HARD_BLOCK policy for claim patterns** | OS (policy) | SM-3, SM-4, T11-KNOWS-B — [CC] HARD_BLOCK overrode correct [LJ] when claim resolver says STATE_SUPPORTED |
| **Add paraphrase-equivalence rule to [LJ] prompt** | OS (prompt) | P-1, P-2 — paraphrase overblocking (future work, not yet implemented) |
| **Calibrate policy-edge behavior** | OS (prompt) | T12-NONE-C, T12-SOURCE-B (future work) |

---

## What Should NOT Change in the Constitution

**Nothing.** The 5-article Constitution remains stable. No new invariant emerged. The state-aware prompt, the claim-state resolver, and the [CC] policy revision are all OS-level mechanisms that enforce existing articles (I Faithfulness, II Independent Validation, III Canon/Info-Ownership Integrity). They do not rise to constitutional level.

**CANDIDATE — NEEDS MORE EXECUTION:** the revised [CC] policy (HARD_BLOCK only when claim resolver says STATE_CONTRADICTION, not when STATE_SUPPORTED) is architecturally important but is an implementation detail of how Article I is enforced. It does not promote.

---

## The Outcome (per Section 15 interpretation rules)

This is **Outcome A with a caveat**:
- V4.1 substantially improved the failures (8/12 fixed) without increasing false acceptance (0% maintained). → State-aware prompting is a viable near-term solution. ✅
- BUT: the [CC] HARD_BLOCK policy needs a narrow architectural adjustment (downgrade to SOFT when STATE_SUPPORTED) because the [CC] now overrides correct [LJ] judgments. → This is a small architecture change, not a prompt change.
- AND: paraphrase overblocking is a separate unresolved [LJ] prompt problem.

**The architecture is not declared complete.** The state-aware prompt + claim-state resolver + [CC] policy revision together would address the majority of failures, but paraphrase and policy-edge calibration remain as future prompt work.
