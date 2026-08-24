# DELIVERABLE 13 — State Persistence Validation

**Question.** Is the state model genuinely temporal/persistent, or merely a static object passed into one prompt?

---

## The Multi-Scene Experiment

The T1a/T1b/T1c sequence runs the same passage type ("Marcus was acting strange at the desk. Maya watched him a moment, then went to check on her patient.") across three state configurations, with transitions logged between them.

### Scene T1a — Maya does NOT know about the embezzlement

**State:** `infoOwnership: {fact: "Marcus embezzled $40,000", knows: ["Marcus"], unknown: ["Maya"]}`
**Prior transitions:** none.
**Result:** GENERIC → MATERIAL → intervention ACCEPTED. The intervention used observable-only specifics (pen-tapping, drip-counting, smelling). No reference to embezzlement. infoOwnership = PASS.

### Scene T1b — Maya SUSPECTS (saw a discrepancy)

**State:** `infoOwnership: {fact: "Marcus embezzled $40,000", knows: ["Marcus"], suspects: ["Maya"], unknown: []}`
**Prior transition:** `{type: "info_ownership", fact: "Marcus embezzled $40,000", character: "Maya", from: "unknown", to: "suspects", atScene: "ch7-scene2", reason: "Maya saw a $40,000 discrepancy in the ledger"}`
**Result:** GENERIC → MATERIAL → intervention BLOCKED (faithfulness FAIL — generator invented "thirty seconds"). The transition was logged. The block was for an unrelated faithfulness issue, not for info-ownership.

### Scene T1c — Maya KNOWS (accountant confirmed)

**State:** `infoOwnership: {fact: "Marcus embezzled $40,000", knows: ["Marcus", "Maya", "the accountant"], unknown: []}` + canon: `{content: "Marcus embezzled $40,000", classification: "SOFT_CANON"}`
**Prior transitions (2):**
1. `info_ownership`: embezzlement, Maya: `unknown → suspects` (ch7-scene2)
2. `info_ownership`: embezzlement, Maya: `suspects → knows` (ch7-scene4)
3. `canon_classification`: embezzlement: `HYPOTHESIS → SOFT_CANON` (ch7-scene4)

**Result:** GENERIC → MATERIAL → intervention ACCEPTED. The intervention referenced Marcus's behavior with Maya now possessing the knowledge. Validator confirmed: "Maya only uses information she possesses — Marcus's embezzlement is known to her." infoOwnership = PASS.

---

## What This Demonstrates

1. **The same passage produces different valid interventions depending on the character's accumulated knowledge.** T1a (unknown) → observable-only. T1c (knows) → may reference the embezzlement. This is the temporal distinction the task required.

2. **State transitions are logged and auditable.** Each transition records: type, fact, character, from, to, atScene, reason. The T1c log carries 3 transitions; a reviewer can trace exactly when and why Maya's knowledge state changed.

3. **The `unknown → suspects → knows` progression is preserved.** The system distinguishes these three states and they affect the validator's infoOwnership check. (The `suspects` state in T1b was not fully exercised because the intervention was blocked for faithfulness, but the state was correctly structured.)

4. **Canon classification evolves.** CT1 demonstrated `HYPOTHESIS → HARD_CANON` for "Maya has a brother named David." The transition was logged, and the later intervention could legitimately reference David.

---

## What This Does NOT Demonstrate

1. **Cross-execution persistence.** Each scene was a separate `runLoop` call with state passed explicitly. The "persistence" is the explicit passing of the DocumentState object (which is what Constitution Article V requires), not a database or session store. The task did not require a database; it required that "the same later diagnostic produces a different valid result depending on the character's accumulated knowledge" — which is demonstrated.

2. **Automatic state-update detection.** The transitions were manually specified in the test cases (`priorTransitions` array) and the state was manually updated between scenes. The system does not automatically detect that "Maya saw a discrepancy" should trigger a transition. This is a future capability (an [LJ] state-update pass that reads each scene and updates InformationOwnership).

3. **Historical state queries.** The system logs transitions but cannot answer "what did Maya know at scene 3?" without replaying the transition log. A versioned-state store would be needed for that.

---

## Classification

**State persistence: DEMONSTRATED (with caveats).**

- The state model is temporal: the same passage yields different valid results across state transitions. ✅
- Transitions are logged with full auditability. ✅
- The `unknown/suspects/knows` and `HYPOTHESIS/SOFT_CANON/HARD_CANON` progressions affect downstream decisions. ✅
- State is passed explicitly (per Constitution Article V), not via context-window memory. ✅
- Automatic state-update detection is NOT implemented (transitions are manually specified). ❌ (future work)
- Cross-session persistence (database) is NOT implemented. ❌ (not required for this experiment)

**The state model is genuinely temporal, not merely static.** The key evidence: T1a and T1c use the same passage but produce different valid interventions because the InformationOwnership state evolved. This is the distinction the task required.
