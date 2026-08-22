# Golden Corpus v1 — Freeze Decision

**Date:** 2026-08-22  
**Decision:** **FROZEN**

---

## Freeze Conditions Check

| # | Condition | Status | Evidence |
|---|---|---|---|
| 1 | All cases have stable IDs | ✅ | 60 cases (59 original + GC-0038R1), all with GC-NNNN IDs |
| 2 | No unresolved metadata contradictions | ✅ | GC-0038 superseded; all other cases internally consistent |
| 3 | Every source path is valid | ✅ | 59/59 source files exist with `writing-engine/` prefix |
| 4 | All superseded cases documented | ✅ | GC-0038 → GC-0038R1, documented in audit-issues.json |
| 5 | R6 cases correctly classified | ✅ | 3 true R6 cases (GC-0031, GC-0033, GC-0036); GC-0038 was corpus quality issue |
| 6 | Evaluation persistence is reproducible | ✅ | 59 per-case files in results/; --resume verified |
| 7 | Aggregate metrics match per-case results | ✅ | All metrics reconciled (see reconciliation report) |
| 8 | Audit and summary agree | ✅ | Discrepancies resolved (stale audit, null currentSemantic bug) |
| 9 | No unexplained duplicate cases | ✅ | 0 exact duplicates, 0 near-duplicates |
| 10 | Known defects explicitly represented | ✅ | 3 R6 cases tagged; 3 false acceptances; 1 false rejection; all recorded |

## Frozen Baseline

| Metric | Value |
|---|---|
| Total cases | 59 (60 including superseded GC-0038) |
| Execution errors | 0 |
| Scorable triage | 32 | correct: 31 (97%) |
| Scorable final | 55 | correct: 51 (93%) |
| Scorable semantic (LLM) | 30 | io: 24 (80%), faith: 28 (93%) |
| False acceptance | 3 |
| False rejection | 1 |
| R6 cases | 3 (2 improved, 1 persistent) |
| Known defects | 3 R6 + 3 false accept + 1 false reject = 7 |

## Corpus Version

```
golden-corpus-v1-FROZEN
```

## Immutability

From this point forward:
- Ground truths are immutable
- If a ground truth is found wrong: SUPERSEDE, don't edit
- New cases go in `golden-corpus-v2`
- No silent modifications to frozen cases
