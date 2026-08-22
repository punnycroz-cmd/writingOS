# DELIVERABLE 23 — Iteration 4 Triplet Benchmark

**20 triplets × 3 variants = 60 validations.** Each triplet tests a controlled A (valid) / B (invalid) / C (ambiguous) distinction across 10 semantic classes, plus state-controlled and policy-controlled triplets.

---

## The Triplet Dataset

### Core 10 triplets (one per semantic class)

| ID | Class | Policy | A (valid) | B (invalid) | C (ambiguous) |
|---|---|---|---|---|---|
| T1 | sensory_observation | LICENSED_FICTION | cardamom smell (state-supported) | burnt coffee + IO leak | vague "something spicy" |
| T2 | visible_behavior | LICENSED_FICTION | pen tapping (observable) | hidden ledger + IO leak | angling away (implies concealment) |
| T3 | emotional_inference | LIMITED_INFERENCE | "seemed uneasy" (hedged) | "knew he was terrified" + IO leak | "wondered if something was wrong" |
| T4 | motive_inference | LICENSED_FICTION | "as if expecting someone" (hedged) | "wanted to cover embezzlement" (motive-as-fact) | poetic "something behind his eyes" |
| T5 | memory | LICENSED_FICTION | pill-bottle memory (state-supported) | 1998 + Papa discovered embezzlement (invented) | vague "summer she could barely remember" |
| T6 | knowledge | LICENSED_FICTION | suspecting finances (state=UNKNOWN → REJECT) | certainty (REJECT) | vague unease (ACCEPT) |
| T7 | causal_inference | LIMITED_INFERENCE | "numbers did not match last month" | "because Marcus diverted $40k" (causal-as-fact) | "wondered if error or worse" |
| T8 | quantification | LICENSED_FICTION | "four, as always" (state-supported) | "127 drips" + IO leak | "a few more than usual" |
| T9 | identity | LICENSED_FICTION | tall, gray hair, non-recognition | "David Chen, accomplice" (IO leak) | "something familiar about his gait" |
| T10 | temporal_knowledge | LICENSED_FICTION | "shift was almost over" (vague) | "4:15 AM" + future leak | "late — later than she thought" |

### State-controlled triplets (same wording, different state) — T11

| ID | State | A (certainty wording) | B (suspicion/vague) | C (wondering) |
|---|---|---|---|---|
| T11-UNKNOWN | UNKNOWN | "Maya knew Marcus had embezzled..." → REJECT | "something bothered her" → ACCEPT | "suspected finances" → REJECT |
| T11-SUSPECTS | SUSPECTS | "Maya knew..." → REJECT (still) | "suspected finances — discrepancy nagged" → ACCEPT | "wondering if discrepancy meant worse" → ACCEPT |
| T11-KNOWS | KNOWS | "Maya knew..." → ACCEPT (the SC-3A case) | "suspected might have taken some" → ACCEPT | "forty thousand a weight between them" → ACCEPT |

### Policy-controlled triplets (same text, different policy) — T12

| ID | Policy | "smelled of rain" | "cardamom" (state) | IO leak |
|---|---|---|---|---|
| T12-NONE | NONE | REJECT (no invention) | — | — |
| T12-SOURCE | SOURCE_CONSTRAINED | REJECT (not in source) | ACCEPT (SOFT_CANON) | — |
| T12-LICENSED | LICENSED_FICTION | ACCEPT (licensed sensory) | ACCEPT | REJECT (IO still rejected) |
| T12-INFERENCE | LIMITED_INFERENCE | ACCEPT | ACCEPT | REJECT (causal chain rejected) |

### Additional triplets (T13-T15)

| ID | Class | A | B | C |
|---|---|---|---|---|
| T13 | canon_contradiction | tactile/auditory (blind character) | visual perception (canon violation) | synesthetic "blue" |
| T14 | deferred_mechanism | trowel referenced (DEFER) | trowel explained (RESOLVE + IO leak) | vague unease about trowel (ACCEPT) |
| T15 | unsupported_specific | vague "noted readings" | 98.6/72/120/80/1000ml (invented) | "within normal range" (vague) |

---

## Expected Outcomes (design)

- **Variant A** (valid): 17 ACCEPT, 3 REJECT (T6-A, T11-UNKNOWN-A, T11-SUSPECTS-A — where state makes the "valid" framing actually invalid)
- **Variant B** (invalid): 20 REJECT
- **Variant C** (ambiguous): 8 UNCLEAR, 7 ACCEPT, 5 REJECT (the expected varies by case semantics — C is not always UNCLEAR)

The triplet structure is documented in `/home/z/my-project/writing-engine/src/triplets.ts`. Each triplet records: triplet_id, semantic_class, base_passage, character_state, information_ownership, canon_state, deferred_checks, register, inventionPolicy, variant_A/B/C, expected_A/B/C, reasoning_basis.

---

## Why This Benchmark Is Better Than Iteration 3

1. **Controlled triplets.** A and B differ primarily in authorization/provenance, not in unrelated content. This isolates the variable being tested.
2. **Invention policy.** The validator is now policy-aware — the same text ("smelled of rain") should produce different outcomes under NONE vs LICENSED_FICTION.
3. **State-controlled triplets.** The same wording ("Maya knew Marcus had embezzled...") is tested under UNKNOWN/SUSPECTS/KNOWS, isolating whether the validator consults state.
4. **Policy-controlled triplets.** The same text is tested under 4 policies, isolating whether the validator respects task authorization.
5. **10 semantic classes.** No single class dominates; epistemic boundaries (emotion, motive, causality, identity) are stressed, not just sensory observation.
