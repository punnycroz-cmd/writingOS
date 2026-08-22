# Golden Corpus v1 — FROZEN

**Status:** FROZEN  
**Frozen At:** 2026-08-22  
**Active Cases:** 59 (60 including 1 superseded)  
**Register:** FICTION  
**Provider:** FIREWORKS (qwen3p8-max)

## Frozen Baseline

| Metric | Value |
|---|---|
| Scorable triage | 32 | correct: 31 (97%) |
| Scorable final | 55 | correct: 51 (93%) |
| Scorable semantic | 30 | io: 24/30 (80%), faith: 28/30 (93%) |
| False acceptance | 3 |
| False rejection | 1 |
| R6 cases | 3 (2 improved, 1 persistent) |
| Execution errors | 0 |

## Immutability

This corpus is frozen. Ground truths are immutable. New cases go in golden-corpus-v2. Supersede, don't edit.

## Superseded Cases

| Original | Superseded By | Reason |
|---|---|---|
| GC-0038 | GC-0038R1 | Incorrectly tagged as R6/UNRESOLVED (KNOWS-state case, correct=ACCEPT) |

## Known Defects

| Case | Type | Expected | Current | Status |
|---|---|---|---|---|
| GC-0033 | R6 observation-framed leak | REJECT | ACCEPT | PERSISTENT_DEFECT |
| GC-0024 | False acceptance | REJECT | ACCEPT | REGRESSION |
| GC-0025 | False acceptance | REJECT | ACCEPT | REGRESSION |
| GC-0054 | False acceptance | REJECT | ACCEPT | REGRESSION |
| GC-0022 | False rejection | ACCEPT | REJECT | REGRESSION |
