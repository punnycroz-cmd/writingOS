# DELIVERABLE 39 — Iteration 4.2 Arbitration Policy

**Formal rules for scoped [CC]/[LJ] arbitration.** Evidence-based, derived from the Iteration 4.1 failures and the Iteration 4.2 test matrix.

---

## Evidence Classes

Every [CC] signal is classified into one of three evidence classes based on signal type and provenance:

### HARD_STRUCTURAL_BLOCK
**Definition:** A deterministic, provable integrity violation that does not depend on semantic interpretation.

**Members:**
- Numbers (digits) with UNKNOWN provenance — the number is not in source or state, verified by string matching after normalization ($/comma stripping, number-word conversion).
- Dates with UNKNOWN provenance — the date is not in source or state, verified by ISO normalization.
- (Canon contradictions are detected by the [LJ], not [CC], because they require semantic judgment. The [CC] canon-keyword alert from Iteration 2 is a SOFT_SIGNAL, not HARD_STRUCTURAL.)

**Authority:** Non-overridable. No [LJ] judgment can override. No claim-state resolution can override. If a HARD_STRUCTURAL_BLOCK exists, the final decision is REJECT.

**Evidence:** B3 (127 tiles), B4 (March 15, 2019), C1 (4:17 AM), C3 (3:42 PM, November 7) — all correctly rejected.

### CLAIM_PATTERN_BLOCK
**Definition:** An epistemic claim pattern ("knew X", "had embezzled", "had taken", "suspected") matched by regex, where the claim's proposition has UNKNOWN provenance (not found in source or state by string matching).

**Authority:** Overridable by claim-state resolution.

**Override conditions:**
1. If claim-state resolver returns **STATE_SUPPORTED** → downgrade to ADVISORY. The [LJ] adjudicates. (The character's state authorizes this epistemic level.)
2. If claim-state resolver returns **STATE_CONTRADICTION** → keep as BLOCK. The claim is confirmed as a violation. (The character's state contradicts this epistemic level.)
3. If **NO_CLAIM_DETECTED** (proposition doesn't match any IO entry):
   - If the claim is **certainty-level** (KNOWLEDGE/CERTAINTY/BELIEF) → conservative REJECT. (We can't verify the claim, and it asserts certainty.)
   - If the claim is **uncertain-level** (SUSPICION/INTERPRETATION/OBSERVATION) → downgrade to ADVISORY. (Uncertain claims cannot be knowledge leaks; they don't assert certainty.)

**Evidence:**
- STATE_SUPPORTED → ACCEPT: D1, D2 (deterministic), A1 (Rule 0 override). ✅
- STATE_CONTRADICTION → BLOCK: B2. ✅
- NO_CLAIM_DETECTED + certainty → conservative BLOCK: (not directly tested, but logically sound)
- NO_CLAIM_DETECTED + uncertain → downgrade: A2, A3 (arbitration downgrades, but [LJ] independently rejects on faithfulness). ⚠️

### SOFT_SIGNAL
**Definition:** A proper-noun extraction with UNKNOWN provenance. Proper-noun extraction is noisy (e.g., "Papas" from "Papa's"), so these are not hard-blocked.

**Authority:** [LJ] adjudicates. [CC] does not block.

**Evidence:** Proper-noun cases (FAITH-7, FAITH-8 from Iteration 3) — [LJ] correctly adjudicates.

---

## Rule 0 — [LJ] Faithfulness Overblock Override

**Condition:** [LJ] returns overall=REJECT with faithfulness=FAIL, AND all [CC] number/date signals are state-SUPPORTED (no HARD_STRUCTURAL_BLOCK), AND no claim has STATE_CONTRADICTION.

**Action:** Override to ACCEPT.

**Rationale:** The [LJ] is overblocking on numbers that the [CC] has deterministically verified as state-supported. The [CC] provenance check is more reliable than the [LJ]'s string-matching for numbers. If the [CC] says "$40,000" is in the state (found "40000" after normalization), the [LJ] should not reject it as "invented."

**Evidence:** A1 (SM-3 rerun) — deterministic logic test confirms Rule 0 produces ACCEPT. The [LJ] rejected on faithfulness for "$40,000" despite state=KNOWS; Rule 0 overrides because [CC] verified "40" and "000" as CHARACTER_STATE.

**Safety:** Rule 0 only fires when there are NO hard-structural blocks and NO state-contradictions. If there is any independent hard violation (number, date, canon), Rule 0 does not fire. The mixed-case test (C1-C4) confirms this.

---

## The Full Arbitration Decision Tree

```
INPUT: cc (scoped [CC] result), claims (claim-state resolutions), ljOverall, ljFaithfulness

RULE 0: LJ overblock override
  IF ljOverall = REJECT AND ljFaithfulness = FAIL
     AND cc.hardStructuralBlocks = ∅
     AND cc has supported number/date signals
     AND no claim has STATE_CONTRADICTION
  THEN → ACCEPT (override)

RULE 1: HARD_STRUCTURAL_BLOCK
  IF cc.hardStructuralBlocks ≠ ∅
  THEN → REJECT (non-overridable)

RULE 2: CLAIM_PATTERN_BLOCK
  IF cc.claimPatternBlocks ≠ ∅:
    2a. IF any claim = STATE_CONTRADICTION → REJECT
    2b. IF any claim = STATE_SUPPORTED → DOWNGRADE to ADVISORY → LJ decides
    2c. IF NO_CLAIM_DETECTED:
        - IF certainty claim (KNOWLEDGE/CERTAINTY/BELIEF) → REJECT (conservative)
        - IF uncertain claim (SUSPICION/INTERPRETATION/OBSERVATION) → DOWNGRADE → LJ decides

RULE 3: SOFT_SIGNAL
  IF cc.softSignals ≠ ∅ → LJ decides

RULE 4: ADVISORY
  → LJ decides
```

---

## What This Policy Does NOT Do

1. **Does not override [LJ] on semantic judgments.** Rule 0 only overrides [LJ] faithfulness FAIL when the [CC] has deterministic proof that the numbers are state-supported. It does not override [LJ] on info-ownership, canon, or deferred checks.

2. **Does not let claim-state support override independent hard violations.** The mixed-case test (C1-C4) confirms: if there is a HARD_STRUCTURAL_BLOCK (unsupported number/date) alongside a STATE_SUPPORTED claim, the hard block fires. The claim-state support does not "cancel" the independent violation.

3. **Does not solve paraphrase.** "Hospitals" → "medical centers" is still an [LJ]-level semantic-equivalence judgment. The arbitration policy does not address it.

4. **Does not solve the [LJ]'s overblocking on "some money" (A2, A3).** When the [LJ] rejects "Maya suspected Marcus might have taken some money" on faithfulness, the arbitration cannot override because there are no [CC] number signals to point to. This is an [LJ] prompt issue.

5. **Does not solve the [LJ]'s leniency on "suspected finances" (A4).** When the [LJ] accepts "Maya suspected something was wrong with the finances" with state=UNKNOWN, the arbitration defers to [LJ] (ADVISORY category). This is the V4.1 regression persisting.

---

## Classification

**The arbitration policy is DEMONSTRATED for:**
- HARD_STRUCTURAL_BLOCK non-overridability (B3, B4, C1, C3). ✅
- CLAIM_PATTERN + STATE_CONTRADICTION → BLOCK (B2). ✅
- CLAIM_PATTERN + STATE_SUPPORTED → DOWNGRADE (D1, D2, A1 via Rule 0). ✅
- Mixed-case safety (C1-C4: supported claim does not override independent hard violation). ✅

**The arbitration policy is NOT YET DEMONSTRATED for:**
- Full live-[LJ] validation of A2, A3, A4, D1-D4 (API rate-limiting prevented completion). ⚠️
- The [LJ] prompt issues that cause A2/A3 (faithfulness overblock on "some money") and A4 (leniency on "suspected finances"). ❌ (separate problem)

**The policy is stable enough to move to multi-scene testing**, with the caveat that the [LJ] prompt issues (A2/A3/A4) are unresolved and will need separate attention.
