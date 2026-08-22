# DELIVERABLE 19 — [CC]/[LJ] Conflict Policy

**Question.** When the deterministic [CC] layer and the [LJ] validator disagree, what should the final decision be? Is a [CC] HARD_BLOCK non-overridable by the [LJ]?

---

## The Conflict Matrix (tested)

The task specified testing all combinations. Here is what the experiment produced:

| [CC] | [LJ] | Cases tested | Required result | v3 policy result | Evidence |
|---|---|---|---|---|---|
| FAIL (HARD) | FAIL | CONF-1, IO-A–J, FAITH-1–5, SC-1A, SC-2A | REJECT | REJECT ✅ | Both agree on rejection; trivial case |
| FAIL (HARD) | UNCLEAR | CONF-2 (the Iteration 2 IO2 case) | REJECT | REJECT ✅ | v3 policy: [CC] HARD_BLOCK non-overridable → REJECT. This is the case that was UNSAFE in v2. |
| FAIL (HARD) | PASS | SC-3A (state=KNOWS, [LJ] faith FAIL but io PASS) | (determine) | REJECT | [LJ] actually FAILed faithfulness here, so this combination was not cleanly produced. The closest case: [CC] said ADVISORY (correct), [LJ] said FAIL (wrong). v3 deferred to [LJ] → REJECT (false positive). |
| PASS (ADVISORY) | FAIL | SC-1C, SC-2B (initial run), AMB-1–3, CONF-3 (semantic) | varies | REJECT (varies) | See below |
| PASS (ADVISORY) | UNCLEAR | (not cleanly produced) | conservative | — | Not tested |
| PASS (ADVISORY) | PASS | SC-1C, SC-2B, AMB-4, AMB-5 (refined run) | ACCEPT | ACCEPT ✅ | Both agree on acceptance |

---

## The Key Finding: [CC] HARD_BLOCK Should Be Non-Overridable

**CONF-2 is the evidence.** This is the exact Iteration 2 failure: [CC] flagged 4 unsupported numbers (98.6, 72, 120, 80); [LJ] in Iteration 2 said UNCLEAR ("reasonable medical details"); v2 policy accepted. This was unsafe.

In Iteration 3, the v3 policy (CC-hard-nonoverridable) rejects regardless of [LJ] judgment when [CC] is HARD_BLOCK. CONF-2 is now correctly rejected.

**The policy is evidence-based:** a deterministic proof that a number is not in source or state should not be overridable by an LLM saying "it's plausible." Plausibility is not provenance.

**However**, the v3 policy alone was not sufficient. The refined [LJ] prompt (which now also treats plausibility as non-evidence) independently rejects CONF-2. So in this case, both layers agree. The v3 policy is a backstop for cases where the [LJ] might still be lenient.

---

## The [CC] FAIL + [LJ] PASS Case (SC-3A) — The Hard Problem

SC-3A is the case where [CC] is correct (ADVISORY — the fact is in state, Maya KNOWS) and [LJ] is wrong (FAIL on faithfulness for "forty thousand dollars"). The v3 policy defers to [LJ] when [CC] is not HARD_BLOCK, so it REJECTs — a false positive.

**This is NOT a case where [CC] should override [LJ].** [CC] said ADVISORY (no hard block). The problem is that [LJ] overblocked on faithfulness for a spelled-out number that is actually state-supported. The fix is not a policy change — it's a [LJ] prompt refinement (treat spelled-out numbers matching state as supported) or a [CC] enhancement (flag spelled-out numbers, not just digits).

**The policy conclusion:** [CC] HARD_BLOCK is non-overridable (v3 policy, demonstrated safe). [CC] ADVISORY should NOT override [LJ] — [LJ] makes the semantic judgment. The SC-3A false positive is a [LJ] calibration issue, not a policy issue.

---

## The [CC] PASS + [LJ] FAIL Case (CONF-3, AMB-1–3) — The Other Hard Problem

These are cases where [CC] is ADVISORY (no hard block) and [LJ] rejects. The expected outcome varies:

- **CONF-3** (semantic invention "burnt coffee"): expected REJECT, got ACCEPT (false negative). [LJ] was too lenient — it treated the invented smell as licensed observation.
- **AMB-1, AMB-2, AMB-3** (reasonable inference, strongly implied, narrator voice): expected ACCEPT, got REJECT (false positives). [LJ] was too strict — it treated inference as leak.

**These are not policy failures — they are [LJ] calibration failures.** The [CC] layer cannot help here (no numbers to detect). The [LJ] must make the semantic judgment, and it is inconsistent: too lenient on semantic invention (CONF-3), too strict on reasonable inference (AMB-1–3).

**The policy conclusion:** when [CC] is ADVISORY, [LJ] is the final authority. The [LJ] has known calibration issues on the observation/inference boundary. These are `[CAL]` — they require a larger case set and possibly prompt engineering, not a policy change.

---

## Proposed Policy (evidence-based, scope-limited)

```
IF [CC] = HARD_BLOCK:
    FINAL = REJECT   (non-overridable by [LJ])
    REASON: deterministically proven unsupported specific
ELIF [LJ] = FAIL on any integrity dimension:
    FINAL = REJECT
    REASON: [LJ] detected semantic violation
ELIF [LJ] = UNCLEAR on an integrity dimension:
    FINAL = REJECT if the dimension is faithfulness or infoOwnership
           (UNCLEAR on these is not safe to accept — conservative)
    FINAL = ACCEPT otherwise (meaning, voice, register, intelligibility)
    REASON: UNCLEAR on non-integrity dimensions is acceptable
ELSE:
    FINAL = ACCEPT
```

**Key changes from v2:**
1. [CC] HARD_BLOCK is non-overridable. (Resolves CONF-2.)
2. [LJ] UNCLEAR on faithfulness or infoOwnership → REJECT (conservative). (Resolves the "UNCLEAR=PASS is unsafe" finding.)

**Key unchanged from v2:**
1. [CC] ADVISORY does not override [LJ]. ([LJ] makes semantic judgment.)
2. [LJ] FAIL on any integrity dimension → REJECT.

---

## What This Policy Does NOT Do

- It does not catch semantic invention when [CC] is ADVISORY and [LJ] is lenient (CONF-3). This is a residual false negative.
- It does not accept reasonable inference when [LJ] is strict (AMB-1–3). This is a residual false positive.
- Both are [LJ] calibration issues, not policy issues. They require a larger case set and prompt refinement, not a policy change.

---

## Classification of [CC] Signals

| [CC] signal | Classification | Overrideable? | Evidence |
|---|---|---|---|
| HARD_BLOCK (unsupported number/date/measurement) | **HARD constraint** | NO | CONF-2: the case that was unsafe in v2 is now safe in v3. Deterministic proof of unsupported specificity is non-overridable. |
| HARD_BLOCK (explicit knowledge claim matching an UNKNOWN fact) | **HARD constraint** | NO | IO-A, IO-H, IO-J, SC-1A, SC-2A: all correctly rejected. The claim is deterministically proven to reference a fact the character does not know. |
| SOFT_SIGNAL (unsupported proper noun, extraction artifact) | **SOFT signal** | YES ([LJ] decides) | FAITH-7, FAITH-8: [CC] flagged, [LJ] agreed on FAIL. But "Papas" (Iteration 2 CT1) was a false positive. Proper-noun extraction is too noisy for hard blocking. |
| ADVISORY (no unsupported specifics detected) | **ADVISORY** | YES ([LJ] decides) | The normal case. [LJ] makes the semantic judgment. |

---

## Scope Limitation

This policy is tested only on:
- Information-ownership leaks (14 cases)
- Unsupported numeric/date/measurement specifics (10 cases)
- State-constraint combinations (6 cases)
- POV/inference cases (2 cases)
- Ambiguous cases (5 cases)
- Conflict cases (3 cases)

It is NOT tested on:
- Canon violations (the [CC] canon-keyword alert is a separate mechanism)
- Deferred-check resolutions
- Multi-region interventions
- Nonfiction registers

The policy is evidence-based within this scope. Beyond it, the policy is a hypothesis.
