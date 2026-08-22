# Writing OS v1 — Component Registry

| Component | Status | Evidence | Authority Layer |
|---|---|---|---|
| Claim-State Resolution | DEMONSTRATED | v0–v1.1 (deterministic triage, 4.3B io=23/23) | Deterministic |
| Observation Boundary | DEMONSTRATED (tested scope) | v0.2–v1.1 (observation classification, R6 boundary testing) | Deterministic |
| Entity Slots / Property Auth | DEMONSTRATED (tested scope) | v0–v1 (entity-slot matching, property support) | Deterministic |
| Provenance (numbers/dates) | DEMONSTRATED | iterations 4–v1 (number-word normalization, $/comma stripping, date ISO) | Deterministic |
| Canon (HARD/SOFT) | DEMONSTRATED | v1 S5, v1.1 A10 (canon contradiction → BLOCK) | Deterministic |
| Scoped CC/LJ Arbitration | DEMONSTRATED (tested conflicts) | 4.2 (C1-C4 mixed cases 4/4), v1 (3 BLOCK, 2 ACCEPT, 4 HANDOFF) | Hybrid |
| Semantic Epistemic Validation | DEMONSTRATED | 4.3B (23/23 io accuracy), v1.1 (15/16 adversarial) | LLM |
| State-Sensitive Validation | DEMONSTRATED | 4.3B (UNKNOWN/SUSPECTS/KNOWS × wondered/suspected/knew), v1 (same proposition different states) | LLM |
| Vague Uncertainty Licensing | DEMONSTRATED | 4.3B Rule A (8/8 io=PASS for wondered/vague affect) | LLM |
| Vague Quantifier Handling | DEMONSTRATED | 4.3B Rule B (3/3 faith=PASS for "some money") | LLM |
| State-Supported Numbers | DEMONSTRATED | 4.3B Rule E (C4: $40k with state=KNOWS → ACCEPT) | LLM |
| Semantic Paraphrase Detection | DEMONSTRATED | v1.1 A5 (3/3 paraphrased leaks caught) | LLM |
| Domain Suspicion Detection | DEMONSTRATED | 4.3B Rule C (E1-E3: 3/3 io=FAIL under UNKNOWN) | LLM |
| Repair (knowledge downgrade) | DEMONSTRATED (limited cases) | v1 S4, v1.1 A6 (knew→suspected, revalidated ACCEPT) | Hybrid |
| Repair (numeric removal) | DEMONSTRATED (limited cases) | v1.1 A7 ($40k removed, revalidated ACCEPT) | Hybrid |
| State Persistence | DEMONSTRATED (7-16 scenes) | v1 (7 scenes, 2 transitions), v1.1 (16 cases, snapshot isolation) | Core |
| Snapshot Isolation | DEMONSTRATED | v1.1 A8 (S1 candidate vs S3 state — correct) | Core |
| Cross-Character Ownership | DEMONSTRATED | v1.1 A3 ("Maya knew what Marcus learned" → REJECT) | LLM |
| Deferred Knowledge Prevention | DEMONSTRATED | v1.1 A9 ("understood significance" → REJECT) | LLM |
| Conflicting State Handling | DEMONSTRATED | v1.1 A10 (IO=UNKNOWN + CS=KNOWS → DETERMINISTIC_BLOCK) | Deterministic |
| Invention Policy | PARTIALLY VALIDATED | 4.3B (LICENSED_FICTION tested); T12 (NONE/SOURCE/LIMITED partially tested) | LLM |
| Temporal State Integrity | DEMONSTRATED (tested scope) | v1.1 A1 (4/4 temporal regression correct) | Core |
| R6 Observation-Framed Leak | UNRESOLVED | R6 experiment (B1/B3/B4 accepted, calibration backfired) | Semantic (gap) |
| Paraphrase Equivalence | UNRESOLVED | 4.1 P-1/P-2 (hospitals↔medical centers rejected) | LLM (gap) |
| Large-Scale Calibration | FUTURE | none | Future |
| Golden Corpus | FUTURE | none | Future |
| Nonfiction Validation | FUTURE | smoke test only (4.1 nonfiction — paraphrase overblocked) | Future |
| Automatic State Extraction | FUTURE | not implemented | Future |
| Multi-Document Ownership | FUTURE | not implemented | Future |
