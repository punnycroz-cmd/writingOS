# Phase 3 Integration Map

## Writing OS Runtime Foundation

- **Source branch:** `research/phase2b-golden-corpus-v1-reconciled`
- **Contents:** Reconciler v5 (20 checks), classifier, freeze-document-parser, forensic-validator, Golden Corpus v1, 67 tests, forensic snapshot
- **Phase 3 inherits:** All Writing OS source code, tests, corpus, reconciliation infrastructure

## Fiction / Golden Corpus Reference

- **Source branch:** `research/phase2b-golden-corpus-v1-reconciled` (same as runtime foundation)
- **Status:** FROZEN — do not modify
- **Location in Phase 3:** `corpus/golden-v1/`, `writing-engine/logs-golden-v1/`, `src/corpus/`, `tests/corpus/`

## Nonfiction Discovery Corpus

- **Source branch:** `research/nonfiction-source-pack-v1.1`
- **Status:** DISCOVERY_CORPUS (ground truth = false)
- **Location in Phase 3:** `nonfiction/source-pack/`
- **Imported:** 69 sources, 135 claims, 0 SOURCE_VERIFIED

## Phase 3 Working Branch

- **Branch:** `research/phase3-nonfiction-foundation-v1`
- **Base:** `research/phase2b-golden-corpus-v1-reconciled` (Phase 2B frozen state)
- **Added:** Nonfiction source pack import + Phase 3 documentation

## Architectural Boundary

```
NONFICTION SOURCE PACK v1.1 (DISCOVERY_CORPUS)
    ↓
SOURCE VERIFICATION (Phase 3A — NOT STARTED)
    ↓
SOURCE-VERIFIED FACTS
    ↓
SourceFactLedger (Phase 3B — NOT STARTED)
    ↓
Nonfiction Mode (Phase 3C-E — NOT STARTED)
```

**Current Phase 3 foundation stops at DISCOVERY_CORPUS.**
No claims have been promoted to SOURCE_VERIFIED.
