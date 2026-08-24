# DELIVERABLE 37 — Iteration 4.2 Scoped [CC]/[LJ] Arbitration Specification

**Purpose.** Fix the [CC] HARD_BLOCK false-positive problem (revealed in Iteration 4.1) without weakening genuine hard safety barriers. The fix is *scoped arbitration* — not a global downgrade, but evidence-class-based authority.

---

## The Problem (from Iteration 4.1)

V4.1 fixed the [LJ]'s state-reading failure (8/12 V4 failures fixed). But it revealed an inversion: the [LJ] is now correct, and the [CC] is wrong. In SM-3 and SM-4, the [LJ] returned io=PASS, stateConsulted=True, overall=ACCEPT — but the [CC] HARD_BLOCK (claim-pattern false positive on "had taken" / "$40,000") overrode the correct [LJ] judgment.

The root cause: **the [CC] does not distinguish between evidence classes.** A number provably absent from state (HARD_STRUCTURAL) and a claim-pattern match that might be state-supported (CLAIM_PATTERN) are both treated as HARD_BLOCK. The non-overridable policy then blocks correct [LJ] judgments.

---

## The Solution: Three Evidence Classes

### 1. HARD_STRUCTURAL_BLOCK (non-overridable)
- Unsupported numbers (digits) with UNKNOWN provenance
- Unsupported dates with UNKNOWN provenance
- These are deterministically provable: the number is not in source or state.

### 2. CLAIM_PATTERN_BLOCK (overridable by state evidence)
- Epistemic claim patterns ("knew X", "had embezzled", "had taken") with UNKNOWN provenance
- These are *suspected* violations — the claim might be state-supported.
- Override condition: if the claim-state resolver returns STATE_SUPPORTED → downgrade to ADVISORY, let [LJ] adjudicate.
- If STATE_CONTRADICTION → keep as BLOCK (the claim is confirmed as a violation).

### 3. SOFT_SIGNAL (always [LJ]-adjudicated)
- Proper nouns with UNKNOWN provenance (extraction is noisy — "Papas" from "Papa's")
- [LJ] adjudicates; [CC] does not block.

---

## The Arbitration Policy

```
1. HARD_STRUCTURAL_BLOCK → REJECT (non-overridable, regardless of [LJ])
2. CLAIM_PATTERN_BLOCK:
   a. STATE_CONTRADICTION → REJECT (confirmed violation)
   b. STATE_SUPPORTED → DOWNGRADE to ADVISORY → [LJ] adjudicates
   c. NO_CLAIM_DETECTED + certainty claim (KNOWLEDGE/CERTAINTY/BELIEF) → conservative REJECT
   d. NO_CLAIM_DETECTED + uncertain claim (SUSPICION/INTERPRETATION/OBSERVATION) → DOWNGRADE → [LJ] adjudicates
3. SOFT_SIGNAL → [LJ] adjudicates
4. ADVISORY → [LJ] decides
```

### Rule 0 (LJ overblock override)
If [LJ] returns REJECT with faithfulness=FAIL, but ALL [CC] number/date signals are state-SUPPORTED (no HARD_STRUCTURAL), and no claim has STATE_CONTRADICTION → override to ACCEPT. The [LJ] is overblocking on numbers the [CC] verified as state-supported.

---

## The 16-Case Test Matrix

### Group A — Current failures (should be fixed)
| ID | Label | Expected | Scenario |
|---|---|---|---|
| A1 | SM-3 rerun: state=KNOWS, "Maya knew X" | ACCEPT | Scenario 1 (CC claim-pattern + STATE_SUPPORTED) |
| A2 | SM-4 rerun: state=KNOWS, "suspected might have taken" | ACCEPT | Scenario 1 |
| A3 | T11-KNOWS-B rerun | ACCEPT | Scenario 1 |
| A4 | T11-UNKNOWN-C: state=UNKNOWN, "suspected finances" | REJECT | No state support |

### Group B — True hard blocks (must remain REJECT)
| ID | Label | Expected |
|---|---|---|
| B1 | Hard canon contradiction (blind character sees) | REJECT |
| B2 | Explicit unknown knowledge (state=UNKNOWN, "knew X") | REJECT |
| B3 | Unsupported exact number (127 tiles) | REJECT |
| B4 | Unsupported exact date (March 15, 2019) | REJECT |

### Group C — Mixed cases (supported claim + independent hard violation)
| ID | Label | Expected | Scenario |
|---|---|---|---|
| C1 | Supported claim + unsupported number (4:17 AM) | REJECT | Scenario 3 |
| C2 | Supported claim + canon contradiction | REJECT | Scenario 3 |
| C3 | Supported knowledge + unsupported timestamp | REJECT | Scenario 3 |
| C4 | Supported claim + unsupported entity (Dr. Marsh) | REJECT | Scenario 3 |

### Group D — Clean supported cases (must ACCEPT)
| ID | Label | Expected |
|---|---|---|
| D1 | State-supported knowledge (state=KNOWS, "knew X") | ACCEPT |
| D2 | State-supported suspicion (state=SUSPECTS, "suspected X") | ACCEPT |
| D3 | Vague observation (state=UNKNOWN, "noticed pen tapping") | ACCEPT |
| D4 | Vague uncertainty (state=UNKNOWN, "wondered if wrong") | ACCEPT |

---

## The Four Required Scenarios (Section 11)

| Scenario | [CC] | ClaimState | [LJ] | Expected | Tested by |
|---|---|---|---|---|---|
| 1 | CLAIM_PATTERN_BLOCK | STATE_SUPPORTED | ACCEPT | ACCEPT | A1, D1, D2 |
| 2 | CLAIM_PATTERN_BLOCK | STATE_CONTRADICTED | REJECT | BLOCK | B2 |
| 3 | CLAIM_PATTERN_BLOCK | STATE_SUPPORTED + independent hard violation | ACCEPT | BLOCK | C1, C2, C3, C4 |
| 4 | SOFT_SIGNAL | UNKNOWN | UNCLEAR | conservative, logged | (implicit in proper-noun cases) |

---

## Implementation

- `classifyScopedCC()`: categorizes each [CC] signal as HARD_STRUCTURAL_BLOCK / CLAIM_PATTERN_BLOCK / SOFT_SIGNAL / ADVISORY based on signal type and provenance.
- `arbitrate()`: applies the 5-rule policy above, including Rule 0 (LJ overblock override for state-supported numbers).
- `validateV42()`: reuses the V4.1 state-aware prompt, now feeding ALL [CC] provenance signals (not just unsupported) so the [LJ] can see which numbers are state-supported.
- Full logging: `cc.category`, `cc.severity`, `claims.resolution`, `lj.stateConsulted`, `arbitration.overrideApplied`, `arbitration.arbitrationPath`, `arbitration.finalDecision`, `validatorMode`.

Implementation: `/home/z/my-project/writing-engine/src/iteration42.ts`.
