# DELIVERABLE 71 — Writing OS v1.1 Final Summary

---

## The Question

> "Can the Writing OS preserve epistemic state and information ownership correctly when the story evolves across scenes and adversarial candidates attempt to exploit stale, reversed, cross-character, or indirectly implied knowledge?"

**YES — demonstrated across 16 adversarial cases with 15/16 correct (94%).**

---

## The 17 Final Questions

### 1. Does state persist correctly across all scenes?
**YES.** State snapshots are explicitly recorded and used per-case. Each case references a `snapshotId` and the state is loaded from the snapshot, not from a mutable global.

### 2. Are state transitions explicit and auditable?
**YES.** State transitions are logged in `state-snapshots.json` with beforeState and afterState. The v1 experiment demonstrated 2 transitions (UNKNOWN→SUSPECTS, SUSPECTS→KNOWS); v1.1 uses explicit snapshots for each.

### 3. Does UNKNOWN → SUSPECTS → KNOWS remain correct?
**YES.** All 4 temporal regression cases (A1) are correct. The same proposition ("knew Marcus had stolen") is REJECTED under UNKNOWN and SUSPECTS, ACCEPTED under KNOWS.

### 4. Can historical snapshots be evaluated without contamination from future state?
**YES.** Attack 8 (snapshot isolation) confirms: A8-2 uses the UNKNOWN snapshot and correctly rejects "knew $40,000" — the KNOWS state from S3 does not leak. Each case explicitly records its `snapshotId`.

### 5. Can knowledge remain owned by the correct character?
**YES.** Attack 3 (cross-character): "Maya knew what Marcus had learned" → REJECT (io=FAIL). "Marcus knew what he had learned" → ACCEPT (io=PASS). Knowledge is owned by character, not global.

### 6. Does future knowledge leak backward?
**NO.** Attack 1 (temporal regression) and Attack 9 (deferred knowledge) both correctly reject future knowledge applied to earlier states.

### 7. Does R6 remain an unresolved semantic gap?
**YES.** R6 (A4-1: "Maya saw Marcus hide the ledger under his coat") is still ACCEPTED. The semantic validator treats this as observable behavior. Classified as `INDIRECT_SEMANTIC_IO_LEAK`. Recorded honestly — not hidden.

### 8. Do paraphrased/indirect information leaks behave similarly?
**YES — they are caught.** All 3 semantic paraphrase cases (A5) are correctly REJECTED:
- "The meaning of Marcus's silence was suddenly obvious" → REJECT (io=UNCLEAR)
- "Maya understood exactly why Marcus had moved the money" → REJECT (io=FAIL, DETERMINISTIC_BLOCK)
- "The truth behind the missing records clicked into place" → REJECT (io=FAIL)

**The semantic layer catches paraphrased knowledge claims** — this is better than R6, which uses an observation framing ("saw Marcus hide") rather than a knowledge framing.

### 9. Does repair ever increase character knowledge incorrectly?
**NO.** Attack 6 (repair leak): "knew Marcus had stolen" → repaired to "suspected Marcus had taken money" → ACCEPT with io=PASS. The repair correctly downgraded knowledge to suspicion.

### 10. Does repair invent unsupported numbers?
**NO.** Attack 7 (repair numeric): "knew exactly $40,000" → repaired to "suspected Marcus had taken money" → ACCEPT with faith=PASS. The $40,000 was removed; no number was invented.

### 11. Does deterministic triage still catch hard structural violations?
**YES.** 7 DETERMINISTIC_BLOCK cases — including unsupported numbers, epistemic overreach, and conflicting state. The deterministic layer is functioning correctly.

### 12. Does the semantic layer receive correct handoff context?
**YES.** 7 HANDOFF_TO_LLM cases — each receives the deterministic triage's reasoning and handoff payload. The semantic validator's `stateConsulted=true` on all LLM cases.

### 13. How many candidates were ACCEPT / BLOCK / HANDOFF?
- DETERMINISTIC_ACCEPT: 2
- DETERMINISTIC_BLOCK: 7
- HANDOFF_TO_LLM: 7

### 14. Were there execution errors?
**0.** All 16 cases executed successfully (9 deterministic, 7 LLM, 0 execution errors).

### 15. What is now genuinely demonstrated?
- State persistence with snapshot isolation ✅
- Temporal knowledge regression prevention ✅
- Cross-character knowledge ownership ✅
- Semantic paraphrase leak detection ✅
- Repair integrity (no knowledge leak, no numeric fabrication) ✅
- Deferred knowledge prevention ✅
- Conflicting state safe handling ✅
- Deterministic triage routing ✅
- 0 execution errors ✅
- 15/16 correct (94%) ✅

### 16. What remains unproven?
- **R6 (indirect IO leak via observation framing)** — the one remaining failure. "Maya saw Marcus hide the ledger" is accepted because the model treats it as an observable action.
- **Paraphrase of non-knowledge verbs** — A5 tested knowledge paraphrases ("understood", "truth clicked"); observation-framed leaks (R6 style) are not caught.
- **Multi-scene state persistence beyond 10 scenes** — tested with snapshots; longer sequences untested.
- **Nonfiction registers** — all cases are fiction.
- **Production readiness** — this is an experiment, not a production system.

### 17. What is the smallest next experiment?
**Targeted R6 indirect-IO-leak experiment.** The R6 gap is specifically about observation-framed IO leaks: "Maya saw Marcus hide the ledger" is treated as observation rather than IO leak. A focused experiment with 5-10 indirect-IO-leak cases (varying the observable action, the hidden object, and the connection to the protected fact) would determine whether:
- A prompt rule can teach the semantic layer to connect observable actions to IO facts
- A deterministic check can flag observation + hidden-object patterns
- The gap is fundamental (requires world-knowledge reasoning the LLM doesn't have)

---

## Failure Classification Summary

| Case | Attack | Failure Class | Details |
|---|---|---|---|
| A4-1 | INDIRECT_IO_LEAK | INDIRECT_SEMANTIC_IO_LEAK | "saw Marcus hide ledger" accepted as observation, not IO leak |

**Only 1 failure. All other 15 cases correct.**

---

## R6 Status

**R6_PERSISTENT.** The indirect IO leak ("Maya saw Marcus hide the ledger under his coat") remains accepted by the semantic validator under UNKNOWN state. This is the same gap identified in Iteration 4.3B and confirmed in Writing OS v1. It persists in v1.1.

**However:** semantic paraphrases of knowledge (A5: "understood why", "truth clicked into place") ARE caught. The gap is specifically about the observation framing — the model treats "saw X do Y" as a literal observation rather than inferring that "X" and "Y" are connected to a protected fact.

**R6 is recorded as a known limitation, not hidden.**

---

## STOP

Per the task's stop condition:
- No new large benchmark
- No Writing Bible v5
- No Constitution changes
- No new deterministic keyword rules
- No UI
- No production deployment

The v1.1 evidence is ready for the next architectural decision.
