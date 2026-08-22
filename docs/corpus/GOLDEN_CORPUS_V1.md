# Golden Corpus v1 — Canonical Documentation

**Status:** DRAFT  
**Cases:** 59  
**Version:** golden-corpus-v1  
**Registers:** FICTION  
**Provider:** FIREWORKS (qwen3p8-max)

## Purpose

Permanent, versioned validation corpus for Writing OS v1. Provides:
- Regression detection for future code/prompt/model changes
- Calibration examples for threshold tuning
- Arbitration boundary validation
- Architecture evidence traceability

## Source Experiments

| Experiment | Cases |
|---|---|
| iteration-4-3b | 21 |
| iteration-4-3b-regression | 6 |
| r6-baseline | 15 |
| writing-os-v1 | 5 |
| writing-os-v1-1 | 12 |

## Case Classes

| Class | Count |
|---|---|
| SUPPORTED | 23 |
| CONTRADICTED | 18 |
| ADVERSARIAL | 12 |
| REGRESSION | 6 |

## R6 Cases

4 R6 cases are included with expected=REJECT, observed=ACCEPT, tags=[R6, INDIRECT_SEMANTIC_IO_LEAK, UNRESOLVED]. The corpus does NOT erase known defects.

## Calibration Registry

6 entries tracking all uncalibrated parameters. 2 DEMONSTRATED, 2 UNRESOLVED, 2 CALIBRATION_REQUIRED.

## Immutability

Ground truths are immutable once frozen. Supersede, don't edit.
