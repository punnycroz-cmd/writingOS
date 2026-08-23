# Phase 3 Input Inventory

## Phase 2B — Golden Corpus Research Foundation

- **Branch:** `research/phase2b-golden-corpus-v1-reconciled`
- **HEAD SHA:** `d8f8840cb7b3df5a97848460ff3c9b91efc4b095`
- **Status:** FROZEN
- **Major directories:**
  - `corpus/golden-v1/` — 60 cases (59 active + 1 superseded)
  - `src/corpus/` — reconciler v5, classifier, freeze-document-parser, forensic-validator
  - `tests/corpus/` — 4 test files (67 tests total)
  - `writing-engine/logs-golden-v1/` — canonical ledger, summary, consistency-check, per-case results
  - `docs/corpus/` — GOLDEN_CORPUS_V1.md, GOLDEN_CORPUS_V1_FREEZE.md
  - `forensic/phase2b-5/` — forensic snapshot
  - `writing-engine/deliverables/` — architecture decision documents
  - `docs/architecture/` — Writing OS architecture spec
- **Corpus location:** `corpus/golden-v1/cases.jsonl`
- **Reconciliation location:** `writing-engine/logs-golden-v1/`
- **Tests:** `tests/corpus/{classify-comparison,freeze-integrity,freeze-document-parser,forensic-validator}.test.ts`
- **Canonical metrics:** activeCases=59, finalCorrect=54/59, llmExecuted=42, deterministicFastPathed=17
- **Consistency checks:** 20/20 PASS

## Nonfiction v1.1 — Discovery Corpus

- **Branch:** `research/nonfiction-source-pack-v1.1`
- **HEAD SHA:** `fd661f53ffe5cab5e93ca527ae3158ff37cb41f2`
- **Status:** DISCOVERY_CORPUS (ground truth = false)
- **Source-pack root:** `research/nonfiction-source-pack-v1.1/source-pack/`
- **Key files:**
  - `source-index.json` — 69 sources
  - `claim-inventory.jsonl` — 135 candidate claims
  - `source-evaluation.csv` — source quality scores
  - `validation-opportunity-matrix.csv` — verification opportunities
  - `licensing-report.md` — licensing metadata
  - `diversity-report.md` — domain diversity
  - `source-gaps.md` — identified gaps
  - `PACK-MANIFEST.json` — pack manifest (version 1.1.0)
  - `metadata/` — build scripts, curated data, audit data
  - `raw/` — archived source files (HTML, PDF, TXT)
  - `raw/ARCHIVE-MANIFEST.json` — archive manifest
- **Verification status:**
  - URL_VERIFIED: 17
  - URL_EXISTS_BOT_BLOCKED: 5
  - UNVERIFIED: 47
  - SOURCE_VERIFIED: 0
- **Selection tiers:** 29 GOLD, 25 SILVER, 15 BRONZE
- **Claim verification status:** 135 UNKNOWN (0 SOURCE_VERIFIED)
