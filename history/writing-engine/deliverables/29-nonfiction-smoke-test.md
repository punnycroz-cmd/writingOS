# DELIVERABLE 29 — Nonfiction Smoke Test

**Purpose.** Determine whether the core validation architecture can operate outside fiction. **Generalization smoke test only.** Does NOT validate the general-purpose Writing OS.

---

## The Test

**Register:** academic / professional. **Policy:** SOURCE_CONSTRAINED. **Source:** a short academic passage about a 2023 Johns Hopkins ICU study.

**SourceFactLedger:**
- Named entities: Johns Hopkins, Journal of Patient Safety, ICU
- Numbers: 2023, 12, 23, 8, 1,847, 14
- Dates: 2023
- Citations: Journal of Patient Safety

### Valid revision (should ACCEPT)
Rephrases the source using only source-supported facts: "intensive care unit nurses working 12-hour shifts experienced a 23% greater likelihood of medication errors than their counterparts on 8-hour schedules. The investigation... drew on responses from 1,847 nurses at 14 medical centers."

### Invalid revision (should REJECT)
Introduces unsupported specifics: "Dr. Evelyn Marsh" (invented author), "March 15, 2023" (invented date), "$2.3 billion annually" (invented cost), "primary cause of burnout" (invented causal claim).

---

## Results

| Revision | [CC] | [LJ] faithfulness | [LJ] overall | Expected | Got | Correct? |
|---|---|---|---|---|---|---|
| Valid | ADVISORY (0 unsupported) | FAIL | FAIL | ACCEPT | FAIL | ❌ (overblock) |
| Invalid | HARD_BLOCK (6 unsupported: 15, 2.3, billion, March 15, 2023, Marsh, March) | FAIL | FAIL | REJECT | FAIL | ✅ |

**The invalid revision was correctly rejected.** The [CC] flagged 6 unsupported items (Dr. Marsh, March 15, $2.3 billion, etc.); the [LJ] agreed on FAIL. The unsupported-specificity detection works in nonfiction.

**The valid revision was incorrectly rejected.** The [CC] correctly said ADVISORY (all numbers — 2023, 12, 23, 8, 1,847, 14 — match the source). The [LJ] rejected because "medical centers" ≠ "hospitals" — the validator treated a legitimate paraphrase as unfaithful.

---

## What This Demonstrates

### The core architecture operates outside fiction. ✅
The [CC] provenance classifier, the [LJ] validator, and the final-decision policy all run on nonfiction text without modification. The SourceFactLedger is used the same way CharacterState is used in fiction. The architecture generalizes at the structural level.

### Unsupported-specificity detection works in nonfiction. ✅
The invalid revision's invented author, date, and cost were all caught by [CC] HARD_BLOCK and [LJ] FAIL. This is the same mechanism that catches invented numbers in fiction.

### The overblocking problem generalizes. ❌
The [LJ] rejected "medical centers" as a paraphrase of "hospitals" — the same overblocking pattern seen in fiction (T3-C "wondered if," T6-C "something bothered her," T7-A "last month"). The [LJ] is too strict on wording variation, treating paraphrase as unfaithfulness.

---

## Classification

**Nonfiction generalization: SMOKE TEST ONLY.**

- The architecture runs on nonfiction. ✅
- The [CC] layer works correctly (all source-supported numbers classified as SOURCE_TEXT). ✅
- The [LJ] catches unsupported specifics. ✅
- The [LJ] overblocks on paraphrase. ❌ (same as fiction)
- **This does NOT validate the general-purpose Writing OS.** One smoke test is not validation. It is evidence that the architecture is not fiction-specific at the structural level, and that the [LJ] overblocking problem is not fiction-specific either.

**What would be needed for nonfiction validation:** a larger nonfiction benchmark (10+ cases per nonfiction register: academic, business, legal, marketing), with register-specific SourceFactLedgers and integrity constraints. This is future work.
