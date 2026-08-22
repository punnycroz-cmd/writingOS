# Golden Corpus v1 — Canonical Documentation

**Status:** FROZEN  
**Cases:** 59 active (60 historical including 1 superseded)  
**Version:** golden-corpus-v1  
**Registers:** FICTION  
**Provider:** FIREWORKS (qwen3p8-max)  
**Frozen At:** 2026-08-22 (Phase 2B.5R)

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

## Canonical Metrics (from `canonical-case-ledger.json`)

| Metric | Value |
|---|---|
| Active cases | 59 |
| Scorable triage | 32 (correct: 31, 97%) |
| Scorable final | 59 (correct: 54, 92%) |
| ioOwnership | 26/30 (87%) |
| Faithfulness | 29/30 (97%) |
| False acceptance | 4 |
| False rejection | 1 |
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
| CHANGED_UNSCORABLE | 0 |

## R6 Cases

3 R6 cases are included. R6 is a **TAG**, not an automatic classification. R6 cases are scored like any other case using the canonical `classifyHistoricalComparison` algorithm.

| Case | Expected | Historical | Current | Status |
|---|---|---|---|---|
| GC-0031 | REJECT | ACCEPT | REJECT | IMPROVEMENT |
| GC-0033 | REJECT | ACCEPT | ACCEPT | KNOWN_DEFECT |
| GC-0036 | REJECT | ACCEPT | REJECT | IMPROVEMENT |

## GC-0038R1 Ground-Truth Correction (Phase 2B.5)

GC-0038 was originally tagged R6/UNRESOLVED with `expectedSemantic = {infoOwnership: FAIL, faithfulness: FAIL}`. This was incorrect:

- **State:** Maya is in the KNOWS state (`stateSnapshot.knows = ["Marcus", "Maya"]`).
- **Observation:** "Maya saw Marcus hide the account records."
- **Policy:** When a character is in KNOWS state, sensory observations consistent with that knowledge are licensed narrative invention, not information-ownership leaks.
- **Corrected ground truth:** `expectedFinalDecision = ACCEPT`, `expectedSemantic = {infoOwnership: PASS, faithfulness: PASS}`.

GC-0038 remains SUPERSEDED (preserved unchanged). GC-0038R1 is CURRENT with its own genuine Fireworks execution (latency 8875ms, EXECUTED provenance).

## Calibration Registry

6 entries tracking all uncalibrated parameters. All thresholds are `[CAL]` (calibration required) — no golden-corpus calibration has been performed.

## Immutability

Ground truths are immutable once frozen. Supersede, don't edit.

## Provenance Model (Phase 2B.5)

Every persisted result file contains an explicit `executionProvenance` field:

```json
{
  "executionProvenance": {
    "status": "EXECUTED" | "INHERITED" | "EXECUTION_ERROR",
    "sourceCaseId": null | "GC-XXXX"
  }
}
```

- `EXECUTED` + LLM requires: provider, model, evaluatedAt, latencyMs > 0.
- `EXECUTED` + DETERMINISTIC: latencyMs may be absent or zero.
- `INHERITED` requires: sourceCaseId.
- `EXECUTION_ERROR` requires: error.

The reconciler READS this persisted field. It does NOT invent provenance at reconciliation time.

## Consistency Checks (Phase 2B.5R)

20 consistency checks run on every reconciliation. All must pass for FROZEN status.
Checks #18 and #20 were hardened in Phase 2B.5R to perform real content validation:

- **Check #18:** Parses the freeze document's canonical metrics section and compares ALL 16 required metrics against `summary.json`. Uses `src/corpus/freeze-document-parser.ts`.
- **Check #20:** Validates `MANIFEST.json` fields, `file-inventory.json` structure, preserved file existence, SHA256 hash verification, and `EXCLUDED_FILES.md` policy. Uses `src/corpus/forensic-validator.ts`.

See `consistency-check.json` for the full list.
