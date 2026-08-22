# Writing OS v1 — Evidence Map

Every major architectural claim mapped to the experiment(s) that demonstrate it.

## State and Persistence

| Claim | Evidence | Result |
|---|---|---|
| State persists across scenes | v1 (7 scenes, 2 transitions), v1.1 (16 cases) | ✅ Demonstrated |
| Historical snapshot isolation | v1.1 A8 (S1 candidate vs S3 state — correct REJECT) | ✅ Demonstrated |
| Explicit state transitions (UNKNOWN→SUSPECTS→KNOWS) | v1 S2/S5, v1.1 D1-D3 | ✅ Demonstrated |
| Temporal knowledge regression prevention | v1.1 A1 (4/4 temporal cases correct) | ✅ Demonstrated |
| Cross-character ownership | v1.1 A3 ("Maya knew what Marcus learned" → REJECT) | ✅ Demonstrated |
| Conflicting state safe handling | v1.1 A10 (IO=UNKNOWN+CS=KNOWS → BLOCK) | ✅ Demonstrated |
| Deferred knowledge prevention | v1.1 A9 ("understood significance" → REJECT) | ✅ Demonstrated |
| Unauthorized rollback prevention | Not directly tested (no rollback attack executed) | ⚠️ Inferred from snapshot isolation |

## Deterministic Triage

| Claim | Evidence | Result |
|---|---|---|
| DETERMINISTIC_ACCEPT fast path | v1 S3-C1, S5-C1, S5-C2; v1.1 A1-S2b, A1-S3 | ✅ Demonstrated |
| DETERMINISTIC_BLOCK for unsupported numbers | v1 S6-C1 ("127 files" → BLOCK); v1.1 A8-2 | ✅ Demonstrated |
| DETERMINISTIC_BLOCK for epistemic overreach | v1 S2-C2, S3-C2; v1.1 A1-S1, A1-S2, A6-1, A7-1 | ✅ Demonstrated |
| DETERMINISTIC_BLOCK for canon contradiction | v1.1 A10 (conflicting state); 4.2 B1 (blind character sees) | ✅ Demonstrated |
| HANDOFF_TO_LLM for semantic questions | v1 (4 HANDOFF), v1.1 (7 HANDOFF), R6 (all 16 HANDOFF) | ✅ Demonstrated |
| Structured handoff payload consumed by LLM | v1 (4 cases with handoff), v1.1 (7 cases) | ✅ Demonstrated |
| Number-word normalization (forty thousand → 40000) | 4.2 provenance test, 4.3B C4 | ✅ Demonstrated |
| Date normalization | 4.2 provenance test | ✅ Demonstrated |

## Semantic Validation

| Claim | Evidence | Result |
|---|---|---|
| State-sensitive epistemic distinction | 4.3B (23/23 io accuracy across UNKNOWN/SUSPECTS/KNOWS) | ✅ Demonstrated |
| Wondered vs suspected vs knew discrimination | 4.3B (6/6 wondered, 5/5 suspected, 7/7 knew correct) | ✅ Demonstrated |
| Vague uncertainty licensing (Rule A) | 4.3B (8/8 wondered/vague affect → io=PASS) | ✅ Demonstrated |
| Vague quantifier handling (Rule B) | 4.3B (3/3 "some money" → faith=PASS) | ✅ Demonstrated |
| Domain suspicion detection (Rule C) | 4.3B (3/3 E1-E3 → io=FAIL under UNKNOWN) | ✅ Demonstrated |
| State-supported numbers (Rule E) | 4.3B C4 ($40k with state=KNOWS → faith=PASS) | ✅ Demonstrated |
| Semantic paraphrase detection | v1.1 A5 (3/3: "truth clicked", "understood why", "meaning obvious" → REJECT) | ✅ Demonstrated |
| State consultation | 4.3B (23/23 stateConsulted=true), v1.1 (all LLM cases) | ✅ Demonstrated |
| R6 observation-framed leak detection | R6 experiment (1/4 baseline, 1/4 calibrated) | ❌ UNRESOLVED |
| Paraphrase equivalence (hospitals↔medical centers) | 4.1 P-1/P-2 (2/5 rejected) | ❌ UNRESOLVED |

## Scoped CC/LJ Arbitration

| Claim | Evidence | Result |
|---|---|---|
| HARD_STRUCTURAL_BLOCK non-overridable | 4.2 B3/B4/C1/C3 (all BLOCK despite state support) | ✅ Demonstrated |
| CLAIM_PATTERN + STATE_SUPPORTED → downgrade | 4.2 D1/D2 (ACCEPT after downgrade) | ✅ Demonstrated |
| CLAIM_PATTERN + STATE_CONTRADICTION → block | 4.2 B2 (BLOCK) | ✅ Demonstrated |
| Mixed case safety (supported claim + hard violation) | 4.2 C1-C4 (4/4 correct REJECT) | ✅ Demonstrated |
| Rule 0 LJ faithfulness overblock override | 4.2 A1 (override → ACCEPT) | ✅ Demonstrated |

## Repair / Generation

| Claim | Evidence | Result |
|---|---|---|
| Repair downgrades knowledge to suspicion | v1 S4 (knew→suspected), v1.1 A6 (knew→suspected) | ✅ Demonstrated |
| Repair removes unsupported numbers | v1.1 A7 ($40k removed) | ✅ Demonstrated |
| Repaired candidate is revalidated | v1 S4, v1.1 A6/A7 (full pipeline re-run) | ✅ Demonstrated |
| Repair preserves epistemic state | v1.1 A6 (SUSPECTS preserved, no KNOWS leak) | ✅ Demonstrated |
| Repair does not invent numbers | v1.1 A7 (no $40k invented) | ✅ Demonstrated |

## Execution Integrity

| Claim | Evidence | Result |
|---|---|---|
| 0 execution errors in full benchmark | 4.3B (23/23 LLM), v1 (10/10), v1.1 (16/16) | ✅ Demonstrated |
| EXECUTION_ERROR recorded honestly | 4.3-FW (2/23 JSON parse errors), R6 (0/16) | ✅ Demonstrated |
| No silent fallback | All experiments (0 fallbacks) | ✅ Demonstrated |
| Provider/model logged on every case | All experiments (FIREWORKS, qwen3p8-max) | ✅ Demonstrated |

## Invention Policy

| Claim | Evidence | Result |
|---|---|---|
| LICENSED_FICTION policy works | 4.3B (23/23), v1, v1.1 (all under LICENSED_FICTION) | ✅ Demonstrated |
| Policy discrimination (same text, different policy) | 4.1 T12 (4 policies tested, correct discrimination) | ✅ Demonstrated |
| NONE policy | 4.1 T12-NONE (3/3 correct) | ✅ Demonstrated |
| SOURCE_CONSTRAINED policy | 4.1 T12-SOURCE (2/3 correct — C overblocked) | ⚠️ Partially |
| LIMITED_INFERENCE policy | 4.1 T12-INFERENCE (3/3 correct) | ✅ Demonstrated |
