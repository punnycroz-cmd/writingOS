# Reconciliation History

Versioned reconciliation states preserved for forensic auditability.

## Versions

### v1 (initial — Phase 2B.1)
- 8 consistency checks
- Reconciler had local `if (isR6 || isUnresolved) return 'KNOWN_DEFECT'` logic
- No persisted provenance model
- **Not preserved as a separate snapshot** (superseded before forensic snapshotting began). The v1 reconciler source is recoverable from git history (commit `0bb236d`).

### v2 (Phase 2B.2)
- 8 consistency checks
- Same duplicate-classification issue as v1
- **Not preserved as a separate snapshot.** Recoverable from git history (commit `c168eeb`).

### v3 / v2b4r (Phase 2B.4R)
- 16 consistency checks
- Reconciler imports `classifyHistoricalComparison` from `classify-comparison.ts` (no duplicate logic)
- GC-0038R1 executed with real Fireworks call (latency 8875ms)
- Still DERIVES provenance at reconcile time (not persisted in result files)
- **Preserved in `v3-v2b4r/`** (consistency-check, reconciliation-report, summary, canonical-case-ledger, reconcile-v1.ts, classify-comparison.ts).
- Also preserved in `forensic/phase2b-5/historical/` (results-v2b4r/, cases-v2b4r.jsonl, etc.).

### v4 / phase2b5 (Phase 2B.5 — CURRENT)
- **20 consistency checks** (added #17 persisted_provenance_validity, #18 freeze_doc_summary_consistency, #19 corpus_manifest_ledger_consistency, #20 forensic_inventory_consistency)
- Reconciler READS persisted `executionProvenance` (does NOT derive)
- All 60 result files have explicit persisted provenance
- GC-0038R1 ground truth corrected to `{infoOwnership: PASS, faithfulness: PASS}`
- `corpus-manifest.json` has `activeCases` field
- Full test suite (36 tests)
- Full forensic snapshot
- **Preserved in `v4-phase2b5/`** (consistency-check, reconciliation-report, summary, canonical-case-ledger, reconcile-v1.ts, classify-comparison.ts).
- Also preserved in `forensic/phase2b-5/current/`.

## Summary of Evolution

| Version | Checks | Provenance | GC-0038R1 GT | Tests | Status |
|---|---|---|---|---|---|
| v1 | 8 | derived | FAIL/FAIL | none | superseded |
| v2 | 8 | derived | FAIL/FAIL | none | superseded |
| v3 (v2b4r) | 16 | derived | FAIL/FAIL | none | superseded |
| v4 (phase2b5) | 20 | persisted (READ) | PASS/PASS | 36 | FROZEN |
