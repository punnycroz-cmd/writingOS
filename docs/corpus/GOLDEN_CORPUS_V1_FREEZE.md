# Golden Corpus v1 — FROZEN

**Status:** FROZEN  
**Frozen At:** 2026-08-22 (Phase 2B.5R)  
**Active Cases:** 59 (60 including 1 superseded)  
**Register:** FICTION  
**Provider:** FIREWORKS (qwen3p8-max)

## Canonical Metrics (machine-verified)

These metrics are parsed by `src/corpus/freeze-document-parser.ts` and compared
against `writing-engine/logs-golden-v1/summary.json` by consistency check #18.
Every value below MUST match the corresponding key in summary.json.

| Metric | Value |
|---|---|
| activeCases | 59 |
| scorableTriage | 32 |
| triageCorrect | 31 |
| scorableFinal | 59 |
| finalCorrect | 54 |
| semanticScoringEligible | 30 |
| ioOwnershipScorable | 30 |
| ioOwnershipCorrect | 26 |
| faithfulnessScorable | 30 |
| faithfulnessCorrect | 29 |
| falseAcceptance | 4 |
| falseRejection | 1 |
| r6Cases | 3 |
| executionErrors | 0 |
| llmExecuted | 42 |
| deterministicFastPathed | 17 |

## Frozen Baseline (human-readable)

| Metric | Value |
|---|---|
| Scorable triage | 32 | correct: 31 (97%) |
| Scorable final | 59 | correct: 54 (92%) |
| Scorable semantic | 30 | io: 26/30 (87%), faith: 29/30 (97%) |
| False acceptance | 4 |
| False rejection | 1 |
| R6 cases | 3 (2 improved, 1 persistent) |
| Execution errors | 0 |
| LLM executed | 42 |
| Deterministic fast-pathed | 17 |

## Immutability

This corpus is frozen. Ground truths are immutable. New cases go in golden-corpus-v2. Supersede, don't edit.

## Superseded Cases

| Original | Superseded By | Reason |
|---|---|---|
| GC-0038 | GC-0038R1 | Incorrectly tagged as R6/UNRESOLVED (KNOWS-state case, correct=ACCEPT) |

## Known Defects

| Case | Type | Expected | Current | Status |
|---|---|---|---|---|
| GC-0022 | False rejection | ACCEPT | REJECT | REGRESSION |
| GC-0024 | False acceptance | REJECT | ACCEPT | REGRESSION |
| GC-0025 | False acceptance | REJECT | ACCEPT | PERSISTENT_DEFECT |
| GC-0033 | R6 observation-framed leak | REJECT | ACCEPT | KNOWN_DEFECT |
| GC-0054 | False acceptance | REJECT | ACCEPT | PERSISTENT_DEFECT |

## GC-0038R1 Ground-Truth Correction

GC-0038R1's `expectedSemantic` was corrected from `{infoOwnership: FAIL, faithfulness: FAIL}` to `{infoOwnership: PASS, faithfulness: PASS}` because Maya is in the KNOWS state and the observation is consistent with her existing knowledge. This is a corpus maintenance correction, not a model-performance adjustment. GC-0038 (the original) remains SUPERSEDED and unchanged.
