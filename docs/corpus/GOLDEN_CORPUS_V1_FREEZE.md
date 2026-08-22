# Golden Corpus v1 — FROZEN

**Status:** FROZEN  
**Frozen At:** 2026-08-22 (Phase 2B.5)  
**Active Cases:** 59 (60 including 1 superseded)  
**Register:** FICTION  
**Provider:** FIREWORKS (qwen3p8-max)

## Frozen Baseline

All metrics below are derived from `canonical-case-ledger.json` (the single source of truth).

| Metric | Value |
|---|---|
| Active cases | 59 |
| Scorable triage | 32 | correct: 31 (97%) |
| Scorable final | 59 | correct: 54 (92%) |
| Scorable semantic | 30 | io: 26/30 (87%), faith: 29/30 (97%) |
| False acceptance | 4 |
| False rejection | 1 |
| R6 cases | 3 (2 improved, 1 persistent) |
| Execution errors | 0 |
| LLM executed | 42 |
| Deterministic fast-pathed | 17 |

## Historical Comparison Distribution

| Class | Count |
|---|---|
| STABLE_SUCCESS | 50 |
| IMPROVEMENT | 4 |
| REGRESSION | 2 |
| PERSISTENT_DEFECT | 2 |
| KNOWN_DEFECT | 1 |

## 20 Consistency Checks — ALL PASS

1. active_count = 59
2. superseded_exclusion (0 superseded in active)
3. no_duplicate_active_ids (59 unique)
4. historical_classification_consistency (0 mismatches)
5. final_metric_sum (4+1+54==59)
6. active_results_complete (59==59)
7. active_result_provenance (0 missing)
8. r6_consistency (3==3)
9. source_paths (59/59)
10. no_execution_errors (0)
11. no_silent_inheritance (0 inherited)
12. active_result_identity (0 mismatches)
13. aggregate_classification_sum (59==59)
14. ledger_summary_consistency
15. classifier_usage_consistency (imports classifyHistoricalComparison)
16. gc0038r1_provenance (latency=8875, expectedIO=PASS)
17. persisted_provenance_validity (0 issues)
18. freeze_doc_summary_consistency
19. corpus_manifest_ledger_consistency
20. forensic_inventory_consistency

## Immutability

This corpus is frozen. Ground truths are immutable. New cases go in golden-corpus-v2. Supersede, don't edit.

## Superseded Cases

| Original | Superseded By | Reason |
|---|---|---|
| GC-0038 | GC-0038R1 | Incorrectly tagged as R6/UNRESOLVED (KNOWS-state case, correct=ACCEPT, expectedSemantic corrected to PASS/PASS) |

## Known Defects

| Case | Type | Expected | Current | Status |
|---|---|---|---|---|
| GC-0033 | R6 observation-framed leak | REJECT | ACCEPT | KNOWN_DEFECT |
| GC-0024 | False acceptance | REJECT | ACCEPT | REGRESSION |
| GC-0022 | False rejection | ACCEPT | REJECT | REGRESSION |
| GC-0025 | False acceptance | REJECT | ACCEPT | PERSISTENT_DEFECT |
| GC-0054 | False acceptance | REJECT | ACCEPT | PERSISTENT_DEFECT |

## GC-0038R1 Ground-Truth Correction

GC-0038R1's `expectedSemantic` was corrected from `{infoOwnership: FAIL, faithfulness: FAIL}` to `{infoOwnership: PASS, faithfulness: PASS}` because Maya is in the KNOWS state and the observation is consistent with her existing knowledge. This is a corpus maintenance correction, not a model-performance adjustment. GC-0038 (the original) remains SUPERSEDED and unchanged.
