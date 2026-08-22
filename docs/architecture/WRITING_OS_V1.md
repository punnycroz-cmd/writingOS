# Writing OS v1 — Canonical Operational Specification

**Document Status:** FROZEN — this is the formal specification of the experimentally demonstrated architecture.  
**Branch:** `integration/writing-os-v1`  
**Date:** 2026-08-22

---

## 1. What the System Is

The Writing OS is a specification-driven AI rewriting engine that validates writing across registers using a hybrid deterministic + semantic validation architecture. It maintains evolving story state across scenes and uses that state to authorize or reject candidate text through a multi-layer pipeline.

## 2. What It Is Responsible For

- Maintaining persistent, auditable story state (character knowledge, information ownership, canon, entity properties, deferred checks)
- Deterministic triage of candidate text (structural proof, hard blocks, handoff)
- Semantic validation of epistemic authorization, faithfulness, and information ownership
- Repair of rejected candidates with state-preserving constraints
- Revalidation of repaired candidates through the full pipeline
- Explicit, auditable state transitions between scenes
- Complete execution provenance logging

## 3. What It Is NOT Responsible For

- General world-knowledge reasoning beyond the provided state
- Universal hallucination prevention (only structurally provable and epistemically authorized cases)
- Production-scale performance (tested with 7-16 case experiments)
- Nonfiction register validation (only fiction under LICENSED_FICTION has been demonstrated)
- Automatic state extraction from prose (state is manually specified)
- Complex multi-document knowledge ownership
- Paraphrase semantic equivalence (hospitals ↔ medical centers — unresolved)

## 4. Architecture

```
                   WRITING OS v1

                 Constitution (5 articles)
                         │
                         ▼
                  Persistent State
                  (snapshots per scene)
                         │
                         ▼
                 Candidate / Task
                         │
                         ▼
              Deterministic Triage
              (gemini/deterministic-triage-v2)
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
          ACCEPT       BLOCK      HANDOFF
          (fast path)  (non-       (semantic
                       overridable) work needed)
                                     │
                                     ▼
                            Semantic Validator
                            (Fireworks / qwen3p8-max)
                                     │
                              ACCEPT / REJECT /
                              UNCLEAR
                                     │
                                     ▼
                              Repair / Generation
                              (if REJECTED)
                                     │
                                     ▼
                               Revalidation
                               (full pipeline)
                                     │
                                     ▼
                              State Transition
                              (explicit event)
                                     │
                                     ▼
                                Next Scene
```

## 5. Constitution (Provisional, 5 Articles — Unchanged)

1. **Faithfulness** — no invented specifics; enforced by independent validation
2. **Independent Validation** — generation does not validate itself
3. **Canon/Info-Ownership Integrity** — no canon contradictions; no info leaks
4. **No Fabricated Closure** — don't auto-resolve deferred mechanisms
5. **State Persistence** — state outside the context window

## 6. State Model

### Character Knowledge State
- `UNKNOWN` — character does not possess the fact
- `SUSPECTS` — character suspects but does not know
- `KNOWS` — character possesses the fact

### Information Ownership
Per-fact ownership with `knows`, `suspects`, `misunderstands`, `unknown` lists per character.

### Entity Slots
Entity identity separated from property authorization. Alias matching and property support tracked structurally.

### Canon State
- `HARD_CANON` — cannot be contradicted
- `SOFT_CANON` — established but revisable
- `BACKGROUND` — contextual

### Provenance
Numbers, timestamps, quantities tracked with SOURCE_TEXT / CHARACTER_STATE / CANON / UNKNOWN provenance.

### Deferred Checks
Facts whose validity depends on future state, tracked with anchor spans and DEFERRED/PASS/FAIL status.

### State Snapshots
Every scene references an explicit state snapshot. Historical snapshots remain distinct from current state.

## 7. State Transition Contract

```json
{
  "sceneId": "S3",
  "beforeState": { "knows": [...], "suspects": [...], "unknown": [...] },
  "evidence": ["observed $40,000 discrepancy"],
  "transition": "UNKNOWN_TO_SUSPECTS",
  "reason": "Maya observed a discrepancy in the ledger",
  "afterState": { "knows": [...], "suspects": ["Maya"], "unknown": [] },
  "provenance": "scene observation"
}
```

State changes are explicit events, not implicit mutations. Demonstrated transitions: UNKNOWN→SUSPECTS, SUSPECTS→KNOWS.

## 8. Deterministic Triage

### Authority Hierarchy
| Level | Authority | Overridable? |
|---|---|---|
| HARD_STRUCTURAL | Non-overridable | NO |
| STATE_CONTRADICTION | Non-overridable | NO |
| PROVEN_STRUCTURAL_SUPPORT | Can override weak heuristics | Within scope |
| WEAK/HEURISTIC | Must not independently decide | YES |
| UNRESOLVED | HANDOFF_TO_LLM | N/A |

### Demonstrated Mechanisms
- Claim-state resolution (epistemic level vs. state authorization)
- Hard canon contradiction detection
- Provenance checks (number/date normalization, $/comma stripping)
- Observation boundary classification
- Entity/property authorization
- Explicit epistemic overreach detection (SUSPECTS→KNOWS)
- Scoped CC/LJ arbitration (HARD_STRUCTURAL vs CLAIM_PATTERN)
- Structured semantic handoff payload

## 9. Semantic Validation

### Responsibilities
Epistemic force assessment, meaning, faithfulness, information ownership, character, voice, register, intelligibility, deferred context, semantic paraphrase, narrative invention policy.

### Demonstrated Capabilities (4.3B, 23/23)
- State-sensitive epistemic distinction (UNKNOWN/SUSPECTS/KNOWS)
- Wondered/suspected/knew discrimination
- Vague quantifier handling ("some money" = vague, not exact)
- State-supported number acceptance (Rule E)
- Semantic paraphrase leak detection ("truth clicked into place")
- Domain-level suspicion detection (Rule C)
- Vague uncertainty licensing (Rule A)

### Known Limitation: R6
Observation-framed indirect information leakage. The model accepts "Maya saw Marcus hide the ledger" under UNKNOWN because it treats the observation as perceptually safe without inferring the connection to the protected fact. Calibration attempts backfired.

## 10. Arbitration Boundary

| Signal | Authority | Overridable by |
|---|---|---|
| HARD_STRUCTURAL_BLOCK (unsupported number/date) | Non-overridable | Nothing |
| CLAIM_PATTERN + STATE_CONTRADICTION | Non-overridable | Nothing |
| CLAIM_PATTERN + STATE_SUPPORTED | Downgrade to ADVISORY | [LJ] adjudicates |
| SOFT_SIGNAL (proper nouns) | [LJ] adjudicates | [LJ] |
| [LJ] faithfulness FAIL on state-supported numbers | Overridable | Rule 0 override |
| UNCLEAR on integrity dimensions | Conservative REJECT | N/A |

## 11. Repair / Generation Loop

```
Candidate → Validation → REJECT → Repair → Revalidation → Accept/Reject
```

Repair must preserve: epistemic state, information ownership, canon, unsupported-specificity restrictions.

**Demonstrated:** "knew Marcus had stolen" → repaired to "suspected Marcus had taken money" (knowledge downgraded). "knew exactly $40,000" → repaired to "suspected Marcus had taken money" (number removed).

## 12. Handoff Contract

When deterministic triage returns HANDOFF_TO_LLM, the semantic validator receives:
- candidate text
- state snapshot
- hard violations
- soft signals
- claim signals (STATE_SUPPORTED / STATE_CONTRADICTION / NO_CLAIM_DETECTED)
- entity signals
- observation class
- canon signals
- provenance signals
- recommended semantic questions
- primary triage reason

## 13. Logging / Audit Model

Every action produces a machine-readable log:
- Candidate log (candidateId, stateSnapshotId, expected, result)
- Deterministic decision log (action, proofStrength, signals, reasoning)
- Semantic decision log (provider, model, validatorMode, dimensions, stateConsulted)
- Repair log (originalCandidate, repairedCandidate, revalidationDecision)
- State transition log (beforeState, transition, afterState, reason)
- Execution status (SUCCESS / EXECUTION_ERROR — never silent fallback)

## 14. Experimentally Demonstrated Guarantees

| Guarantee | Evidence |
|---|---|
| State persistence across scenes | v1 (7 scenes, 2 transitions), v1.1 (snapshots) |
| Historical snapshot isolation | v1.1 A8 (S1 candidate vs S3 state — correct) |
| Cross-character ownership | v1.1 A3 ("Maya knew what Marcus learned" → REJECT) |
| Explicit epistemic transitions | v1 (UNKNOWN→SUSPECTS→KNOWS) |
| Deterministic hard-block routing | v1 S6 ("127 files" → DETERMINISTIC_BLOCK) |
| Semantic handoff with structured context | v1 (4 HANDOFF cases), v1.1 (7 HANDOFF) |
| Repair + revalidation | v1 S4, v1.1 A6/A7 |
| State-supported numerical specificity | 4.3B C4 ($40k with state=KNOWS → ACCEPT) |
| Scoped CC/LJ arbitration | 4.2 (mixed cases C1-C4 all correct) |
| Vague uncertainty licensing | 4.3B A1/D1-D3 (wondered → ACCEPT under UNKNOWN) |
| Semantic paraphrase detection | v1.1 A5 (3/3 paraphrased leaks caught) |
| Repair preserves epistemic state | v1.1 A6 (knew→suspected, no leak) |
| Repair removes unsupported numbers | v1.1 A7 ($40k removed, no fabrication) |
| Conflicting state safe handling | v1.1 A10 (DETERMINISTIC_BLOCK) |
| Deferred knowledge prevention | v1.1 A9 ("understood significance" → REJECT) |

## 15. Known Limitations

| Limitation | Evidence | Status |
|---|---|---|
| R6 observation-framed indirect IO leak | R6 experiment (B1/B3/B4 accepted) | UNRESOLVED |
| Paraphrase overblocking (hospitals↔medical centers) | 4.1 P-1/P-2 | UNRESOLVED |
| Nonfiction register validation | not tested | UNTESTED |
| Complex co-reference | not tested | UNTESTED |
| Broader invention-policy calibration | T12-NONE-C, T12-SOURCE-B | PARTIALLY TESTED |
| Production-scale performance | not tested | UNTESTED |
| Long-range state complexity (>10 scenes) | not tested | UNTESTED |
| Calibration requiring corpus-based testing | all thresholds [CAL] | UNCALIBRATED |
| Automatic state extraction from prose | not implemented | FUTURE |

## 16. Architectural Safety Principles

1. PROVE → DECIDE; CANNOT PROVE → HANDOFF; NEVER GUESS
2. Unsupported ≠ Contradicted
3. Entity match ≠ property support
4. Observation ≠ causal explanation
5. Suspicion ≠ knowledge
6. Authority is proportional to evidence strength
7. Generation does not validate itself
8. Repair must be revalidated
9. State changes must be explicit and auditable
10. Execution errors are not semantic results

## 17. Minimum Writing OS v1 Contract

A system qualifies as Writing OS v1 if it has:
1. Persistent state with explicit snapshots
2. Deterministic triage (ACCEPT / BLOCK / HANDOFF)
3. Semantic validation (LLM-based, state-aware)
4. Repair + revalidation loop
5. Explicit state transitions (auditable events)
6. Audit logging (candidate, triage, semantic, repair, state)
7. Execution-integrity handling (SUCCESS / EXECUTION_ERROR, no silent fallback)
8. Constitution (5 articles, loaded consistently)

## 18. Out of Scope for v1

- R6 dedicated inference stage (FUTURE)
- Deterministic keyword dictionaries for semantic patterns
- Broad synonym engines
- Generic world-knowledge inference
- New Constitution articles
- Writing Bible v5
- Production UI
- Fine-tuning architecture
- Multi-document knowledge ownership
- Automatic state extraction

## 19. Next Phase (NOT Started)

Phase 2 — Calibration / Golden Corpus / Broader Register Validation:
- Build golden corpus
- Calibration registry with locally-derived thresholds
- Larger state-transition corpus
- Nonfiction/business/academic validation
- Broader paraphrase testing
- Cross-register behavior
- Production-scale measurements
