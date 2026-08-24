# DELIVERABLE 10 — Iteration 2 Execution Report

**Executed:** 2026-08-21. **Cases:** 16. **Implementation:** `/home/z/my-project/writing-engine/src/` (engine.ts v2, deterministic.ts, cases2.ts, run2.ts). **Logs:** `/home/z/my-project/writing-engine/logs2/`.

---

## Test Matrix and Results

| Case | Label | Category | [CC] Deferred | [CC] Unsupported | Detection | Sev | Decision | Validation | Accepted | Expected |
|---|---|---|---|---|---|---|---|---|---|---|
| P1 | Safe positive #1 | positive_path | NO_DEFERRED | 1 | GENERIC | MATERIAL | REWRITE→ACCEPT | ACCEPT | ✅ yes | ACCEPT |
| P2 | Safe positive #2 | positive_path | NO_DEFERRED | 1 | GENERIC | MATERIAL | REWRITE→ACCEPT | ACCEPT | ✅ yes | ACCEPT |
| N1 | Unsafe invented | negative_path | NO_DEFERRED | 1 | GENERIC | MATERIAL | REWRITE→ACCEPT | ACCEPT | ✅ yes | REJECT (but generator used state, not invented) |
| IO1 | IO leak (embezzlement) | info_ownership | NO_DEFERRED | 1 | GENERIC | MATERIAL | REWRITE→ACCEPT | ACCEPT | ✅ yes | no leak |
| IO2 | IO leak (diagnosis) | info_ownership | NO_DEFERRED | 6 | GENERIC | MATERIAL | REWRITE→ACCEPT | ACCEPT | ✅ yes | no leak (but vitals invented) |
| CV1 | Canon violation | canon | NO_DEFERRED | n/a | CANON_VIOLATION | CRITICAL | REJECT_AND_FLAG | n/a | ❌ no | REJECT |
| IG1 | Intentionally generic | intentional_generic | NO_DEFERRED | n/a | INTENTIONALLY_GENERIC | NONE | ACCEPT_UNCHANGED | n/a | ✅ yes | PRESERVE |
| DF1 | Deferred anchor present | deferred | **PRESENT** | n/a | DEFERRED_CONTEXT | NONE | DEFER | n/a | ❌ no | DEFER |
| DF2 | No deferred relevance | deferred | NO_DEFERRED | 2 | GENERIC | MATERIAL | BLOCK_INTERVENTION | REJECT | ❌ no | NORMAL |
| DF3 | Paraphrased anchor | deferred | NO_DEFERRED | n/a | CHARACTER_SPECIFIC | NONE | ACCEPT_UNCHANGED | n/a | ✅ yes | DEFER (partial failure) |
| T1a | Temporal: before knowledge | temporal_state | NO_DEFERRED | 3 | GENERIC | MATERIAL | REWRITE→ACCEPT | ACCEPT | ✅ yes | RESTRICT (no leak) |
| T1b | Temporal: suspects | temporal_state | NO_DEFERRED | 2 | GENERIC | MATERIAL | BLOCK_INTERVENTION | REJECT | ❌ no | partial (blocked for faithfulness, not IO) |
| T1c | Temporal: knows | temporal_state | NO_DEFERRED | 1 | GENERIC | MATERIAL | REWRITE→ACCEPT | ACCEPT | ✅ yes | ALLOW |
| SS1 | Safe stylistic | stylistic | NO_DEFERRED | 0 | GENERIC | MATERIAL | REWRITE→ACCEPT | ACCEPT | ✅ yes | ACCEPT |
| OB1 | Overblocking challenge | overblocking | NO_DEFERRED | 0 | GENERIC | MATERIAL | REWRITE→ACCEPT | ACCEPT | ✅ yes | ACCEPT |
| CT1 | Canon transition | canon_transition | NO_DEFERRED | 3 | GENERIC | MATERIAL | BLOCK_INTERVENTION | REJECT | ❌ no | ACCEPT (false reject) |

**Outcome totals:** 11 accepted, 3 blocked (DF2, T1b, CT1), 1 deferred (DF1), 1 rejected-and-flagged (CV1), 2 unchanged (IG1, DF3).

---

## Success Criteria (Section 16)

| Criterion | Result | Evidence |
|---|---|---|
| Positive path (≥1 safe intervention accepted) | **DEMONSTRATED** | P1, P2, SS1, OB1, T1a, T1c — 6 accepted interventions with state-supported specifics, 0 unsupported in SS1/OB1 |
| Negative path (≥1 unsafe intervention rejected) | **DEMONSTRATED** | DF2, T1b, CT1 — blocked by validator for faithfulness (invented numbers/times). Also v1 Case A (prior execution). |
| Information ownership (≥1 leak rejected) | **PARTIALLY DEMONSTRATED** | IO1 and IO2 did NOT leak — but because the generator chose safe paths, not because the validator caught a leak. The gate was not exercised under actual leak pressure. The validator's infoOwnership check passed both. No case produced a leak for the validator to catch. |
| Canon (≥1 violation rejected) | **DEMONSTRATED** | CV1 — CANON_VIOLATION → CRITICAL → REJECT_AND_FLAG. [CC] canon alert fired. |
| Deferred (≥1 mechanism detected and deferred) | **DEMONSTRATED** | DF1 — [CC] DEFERRED_ANCHOR_PRESENT → forced DEFERRED_CONTEXT → DEFER. The v1 failure is repaired. |
| Intentional genericity (≥1 preserved) | **DEMONSTRATED** | IG1 — INTENTIONALLY_GENERIC → NONE → ACCEPT_UNCHANGED. No false positive. |
| Temporal state (≥1 decision changes after knowledge gained) | **DEMONSTRATED** | T1a/T1b/T1c — same passage type across 3 state transitions (unknown → suspects → knows). T1a accepted with observable-only; T1c accepted with embezzlement-as-known. 3 transitions logged and auditable. |
| Independent validation (≥1 case where generator judgment insufficient) | **DEMONSTRATED** | DF2, T1b, CT1 — generator produced interventions it believed valid; validator blocked them. |
| Auditability (every decision has a trace) | **DEMONSTRATED** | All 16 cases have full logs (detection, [CC] checks, intervention, validation, reason, state transitions). |

---

## Accepted Interventions (the positive path)

### P1 — Safe positive #1
- **Original:** "Maya went into Room 4. She did her check. Everything was fine, she thought. She would come back later."
- **Accepted revision:** "Maya went into Room 4. She counted the IV drips automatically—four, as always. She smelled the room..." *(state-supported: "four" from perceptualHabits, "Room 4" from currentKnowledge)*
- **[CC]:** 1 unsupported (minor). **Validation:** ACCEPT, all 9 dimensions PASS.
- **Why accepted:** The intervention drew on state-supplied specifics (four IV drips, the counting habit) without inventing facts.

### P2 — Safe positive #2
- **Original:** "Maya put her key in the door of Papa's house. She stepped inside. It was quiet..."
- **Accepted revision:** "...The scent of cardamom and iron hit her first—Papa's ph..." *(state-supported: cardamom-and-iron from SOFT_CANON memory)*
- **[CC]:** 1 unsupported. **Validation:** ACCEPT.

### SS1 — Safe stylistic
- **[CC]:** 0 unsupported. **Validation:** ACCEPT. Clean stylistic improvement, no new factual content.

### OB1 — Overblocking challenge
- **[CC]:** 0 unsupported. **Validation:** ACCEPT. The validator did NOT overblock a vivid intervention drawing on established state.

### T1a — Temporal: before knowledge
- **Accepted revision used observable-only specifics** (pen-tapping, IV-drip counting, smelling). No reference to embezzlement. infoOwnership PASS.

### T1c — Temporal: knows
- **Accepted revision** references Marcus's behavior with Maya now knowing the embezzlement. Validator confirmed: "Maya only uses information she possesses — Marcus's embezzlement is known to her." 3 state transitions logged.

---

## Rejected Interventions (the negative path)

### DF2 — No deferred relevance (intervention blocked)
- **[CC]:** correctly NO_DEFERRED_RELEVANCE (no false-deferred). Detection GENERIC.
- **Generator produced:** "Maya filled the coffee maker and counted the four drips into the carafe. The break room smelled of antiseptic and burnt coffee — not cardamom."
- **[CC]:** 2 unsupported. **Validator:** REJECT, faithfulness FAIL.
- **Why rejected:** The generator invented specifics ("burnt coffee", a specific smell comparison) not in source or state. The [CC] flagged them; the validator caught them.

### T1b — Temporal: suspects (intervention blocked)
- **Generator produced:** "Marcus was fidgeting with the desk drawer—four times in thirty seconds."
- **[CC]:** 2 unsupported (including "thirty"). **Validator:** REJECT, faithfulness FAIL.
- **Why rejected:** "Thirty seconds" is an invented specific. The state transition (unknown→suspects) was logged, but the intervention was blocked for an unrelated faithfulness violation.

### CT1 — Canon transition (FALSE REJECT — overblocking)
- **State:** David transitioned from HYPOTHESIS to HARD_CANON (transition logged).
- **Generator produced:** "...David came to sit beside her. 2:17 AM. Four hours left in her shift..."
- **[CC]:** 3 unsupported (2, 17, "Papas" — a proper-noun extraction artifact). **Validator:** REJECT, faithfulness FAIL.
- **Why rejected:** The intervention legitimately used David (now HARD_CANON) but ALSO invented "2:17 AM" and "four hours left." The validator rejected the WHOLE intervention for the invented specifics, even though the David reference was legitimate.
- **Finding:** This is a **false reject** caused by the all-or-nothing acceptance model. One invented detail dooms an otherwise-legitimate intervention. The canon transition itself worked (David was allowed); faithfulness was the blocker.

---

## False Positives and False Negatives

### False positives (diagnostic flags genericity when it shouldn't)
- **None observed.** IG1 (intentionally generic) was correctly preserved. DF3 (paraphrased deferred) was mis-classified as CHARACTER_SPECIFIC, but this is a deferred-detection miss, not a genericity false positive.

### False negatives (diagnostic says specific-enough when it isn't)
- **DF3:** paraphrased deferred anchor not detected. [CC] returned NO_DEFERRED_RELEVANCE (the paraphrase shared too few tokens with the anchor). Detection classified CHARACTER_SPECIFIC. Outcome was safe (no intervention) but for the wrong reason.

### Validator false rejects (overblocking)
- **CT1:** legitimate David reference blocked because of unrelated invented specifics in the same intervention. The all-or-nothing model is too coarse.

### Validator false accepts (underblocking)
- **IO2:** the generator invented medical vitals (98.6, 72, 120/80, saline, 1000ml). The [CC] correctly flagged 6 unsupported numbers. The validator acknowledged they "appear to be invented" but marked faithfulness as UNCLEAR (not FAIL) and ACCEPTED. **The validator treats UNCLEAR as pass**, allowing "reasonable" invented specifics. This is an underblocking finding.

---

## State Transitions (temporal persistence)

The T1a/T1b/T1c sequence demonstrated 3 logged state transitions on the same fact (embezzlement):

1. **ch7-scene2:** `info_ownership`: embezzlement, Maya: `unknown → suspects` (reason: "Maya saw a $40,000 discrepancy")
2. **ch7-scene4:** `info_ownership`: embezzlement, Maya: `suspects → knows` (reason: "The accountant confirmed")
3. **ch7-scene4:** `canon_classification`: embezzlement: `HYPOTHESIS → SOFT_CANON` (reason: "Disclosed by a reliable in-world source")

CT1 added a 4th transition: `canon_classification`: "Maya has a brother named David": `HYPOTHESIS → HARD_CANON` (reason: "David appeared on-page").

**Finding:** State transitions are logged, auditable, and later decisions use the current state. T1a (unknown) and T1c (knows) produced different valid interventions on the same passage. The state model is temporal, not static.

---

## Key Discoveries (what Iteration 2 found that Iteration 1 could not)

1. **Rich state reduces hallucination.** When state provides concrete usable specifics (four IV drips, cardamom smell), the generator uses them instead of inventing (N1, P1, P2). v1's Case A failed because the state was abstract ("counts objects" without specifying what). v2's rich state made the generator succeed.

2. **The [CC] deferred-anchor pre-pass repairs the v1 Case F failure.** DF1 (exact match) is now correctly deferred. DF3 (paraphrase) is NOT caught — lexical matching has a known ceiling.

3. **The [CC] supported-specificity check catches invented numbers** but has false positives (e.g., "Papas" from "Papa's", "three" when state says "four"). The [LJ] validator can override these, but the signal biases toward rejection.

4. **The validator's UNCLEAR=pass rule causes underblocking** on "reasonable" invented specifics (IO2 medical vitals). This is a design choice: strict (UNCLEAR=FAIL) would overblock; lenient (UNCLEAR=PASS) underblocks. The current calibration is lenient.

5. **The all-or-nothing acceptance model causes overblocking** (CT1). One invented detail in an otherwise-legitimate intervention dooms the whole revision. A region-scoped intervention model (accept the good parts, reject only the bad) would reduce false rejects.

6. **The info-ownership gate was never exercised under actual leak pressure.** The generator consistently chose observable-only paths. This is either a success (the constraint prompt works) or a gap (the test wasn't adversarial enough to force a leak). A targeted adversarial test (feeding a known-bad intervention to the validator directly) is needed.

7. **Canon transitions work.** David (HYPOTHESIS → HARD_CANON) was correctly allowed in the intervention. The transition was logged. The blocker was faithfulness, not canon.
