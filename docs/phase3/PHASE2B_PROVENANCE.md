# Phase 2B Provenance

## Canonical Phase 2B Branch
- **Branch:** `research/phase2b-golden-corpus-v1-reconciled`
- **SHA:** `d8f8840cb7b3df5a97848460ff3c9b91efc4b095`
- **Status:** FROZEN

## Corpus Version
- **Golden Corpus v1:** 59 active cases + 1 superseded (GC-0038 → GC-0038R1)
- **Canonical ledger:** `writing-engine/logs-golden-v1/canonical-case-ledger.json`
- **Consistency:** 20/20 checks PASS

## Relationship to Phase 3
- Phase 3 is **based on** this Phase 2B commit.
- Phase 3 inherits the Writing OS code, Golden Corpus, tests, and reconciliation infrastructure.
- Phase 2B remains frozen as a canonical reference — Phase 3 does NOT modify it.
- Phase 3 does NOT modify Fiction Golden Corpus ground truth.

## Frozen Status
Phase 2B is frozen. No modifications should be made to:
- `corpus/golden-v1/`
- `writing-engine/logs-golden-v1/`
- `src/corpus/` (reconciler, classifier, parser, validator)
- `tests/corpus/`
- `forensic/phase2b-5/`
