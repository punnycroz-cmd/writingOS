# DELIVERABLE 67 — Writing OS v1.1 Execution Report

**Provider:** Fireworks AI  
**Model:** `accounts/fireworks/models/qwen3p8-max`  
**Branch:** `integration/writing-os-v1`

---

## Results: 15/16 Correct (94%), 0 Execution Errors

| Metric | Result |
|---|---|
| Total candidates | 16 |
| Correct | **15/16 (94%)** |
| Execution errors | **0** |
| LLM executions | 7 |
| Deterministic fast-paths | 9 |
| Repair loops | 2 (both successful) |

---

## Triage Routing

| Action | Count | Cases |
|---|---|---|
| DETERMINISTIC_ACCEPT | 2 | A1-S2b (SUSPECTS+suspected), A1-S3 (KNOWS+knew) |
| DETERMINISTIC_BLOCK | 7 | A1-S1, A1-S2, A5-2, A6-1, A7-1, A8-2, A10-1 |
| HANDOFF_TO_LLM | 7 | A3-1, A3-2, A4-1, A5-1, A5-3, A8-1, A9-1 |

---

## Attack-by-Attack Results

### Attack 1 — Temporal Knowledge Regression (4/4 correct ✅)
| Case | Snapshot | Candidate | Expected | Final | Correct? |
|---|---|---|---|---|---|
| A1-S1 | UNKNOWN | "knew Marcus had stolen" | REJECT | REJECT (BLOCK) | ✅ |
| A1-S2 | SUSPECTS | "knew Marcus had stolen" | REJECT | REJECT (BLOCK) | ✅ |
| A1-S2b | SUSPECTS | "suspected had taken some" | ACCEPT | ACCEPT (ACCEPT) | ✅ |
| A1-S3 | KNOWS | "knew Marcus had stolen" | ACCEPT | ACCEPT (ACCEPT) | ✅ |

**State snapshots isolate correctly.** Each case uses its own snapshot; the KNOWS state from S3 does not leak into S1.

### Attack 3 — Cross-Character Knowledge Leak (2/2 correct ✅)
| Case | Candidate | Expected | Final | io | Correct? |
|---|---|---|---|---|---|
| A3-1 | "Maya knew what Marcus had learned." | REJECT | REJECT | FAIL | ✅ |
| A3-2 | "Marcus knew what he had learned." | ACCEPT | ACCEPT | PASS | ✅ |

**Knowledge remains owned by the correct character.** Maya cannot access Marcus's knowledge.

### Attack 4 — Indirect IO Leak / R6 (0/1 correct ❌)
| Case | Candidate | Expected | Final | io | Correct? |
|---|---|---|---|---|---|
| A4-1 | "Maya saw Marcus hide the ledger under his coat." | REJECT | **ACCEPT** | PASS | ❌ |

**R6 persists.** The semantic validator treats "saw Marcus hide the ledger" as observable behavior, not an IO leak. Classified as `INDIRECT_SEMANTIC_IO_LEAK`.

### Attack 5 — Semantic Paraphrase Leak (3/3 correct ✅)
| Case | Candidate | Expected | Final | io | Correct? |
|---|---|---|---|---|---|
| A5-1 | "The meaning of Marcus's silence was suddenly obvious to Maya." | REJECT | REJECT | UNCLEAR | ✅ |
| A5-2 | "Maya understood exactly why Marcus had moved the money." | REJECT | REJECT (BLOCK) | FAIL | ✅ |
| A5-3 | "The truth behind the missing records clicked into place for Maya." | REJECT | REJECT | FAIL | ✅ |

**Semantic paraphrases of knowledge are caught.** The system detects "understood why", "truth clicked into place", and "meaning was obvious" as unauthorized knowledge claims, even without the word "knew".

### Attack 6 — Repair-Induced Knowledge Leak (1/1 correct ✅)
- Original: "Maya knew Marcus had stolen the money." (SUSPECTS) → REJECT
- Repair: "Maya suspected Marcus had taken money from the clinic." → ACCEPT (io=PASS, faith=PASS)
- **Repair correctly downgraded knowledge to suspicion. No knowledge leak.**

### Attack 7 — Repair-Induced Numeric Fabrication (1/1 correct ✅)
- Original: "Maya knew Marcus had stolen exactly $40,000." (SUSPECTS) → REJECT
- Repair: "Maya suspected Marcus had taken money from the clinic." → ACCEPT (io=PASS, faith=PASS)
- **Repair correctly removed the unsupported $40,000. No numeric fabrication.**

### Attack 8 — State Snapshot Isolation (2/2 correct ✅)
| Case | Snapshot | Candidate | Expected | Final | Correct? |
|---|---|---|---|---|---|
| A8-1 | KNOWS | "wondered if something was wrong" | ACCEPT | ACCEPT | ✅ |
| A8-2 | UNKNOWN | "knew Marcus had stolen $40,000" | REJECT | REJECT (BLOCK) | ✅ |

**Snapshots are properly isolated.** A8-2 uses the UNKNOWN snapshot (not the KNOWS snapshot) and correctly rejects.

### Attack 9 — Deferred Knowledge (1/1 correct ✅)
| Case | Candidate | Expected | Final | io | Correct? |
|---|---|---|---|---|---|
| A9-1 | "Maya understood the significance of the trowel left on the bench." | REJECT | REJECT | FAIL | ✅ |

**Future interpretation is not treated as current knowledge.** Maya cannot "understand the significance" of a clue she hasn't yet interpreted.

### Attack 10 — Conflicting State (1/1 correct ✅)
| Case | Candidate | Expected | Final | Correct? |
|---|---|---|---|---|
| A10-1 | "Maya knew Marcus had stolen the money." (IO=UNKNOWN, CS=KNOWS) | REJECT | REJECT (BLOCK) | ✅ |

**Conflicting state is safely handled.** The deterministic triage blocks based on the IO entry (UNKNOWN), not the CharacterState (KNOWS). The conflict did not cause a silent acceptance.

---

## Repair Integrity

| Case | Original | Repaired | Revalidation | io | faith | State Preserved? |
|---|---|---|---|---|---|---|
| A6-1 | "knew Marcus had stolen" | "suspected Marcus had taken money" | ACCEPT | PASS | PASS | ✅ SUSPECTS preserved |
| A7-1 | "knew exactly $40,000" | "suspected Marcus had taken money" | ACCEPT | PASS | PASS | ✅ No $40k invented |

**Both repairs preserved state integrity.** No knowledge leak, no numeric fabrication.
