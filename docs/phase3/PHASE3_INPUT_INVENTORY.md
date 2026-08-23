# Phase 3 Input Inventory

## Phase 2B — Golden Corpus Research Foundation

- **Branch:** `research/phase2b-golden-corpus-v1-reconciled`
- **HEAD SHA:** `d8f8840cb7b3df5a97848460ff3c9b91efc4b095`
- **Status:** FROZEN
- **Corpus location:** `corpus/golden-v1/cases.jsonl` (60 cases: 59 active + 1 superseded)
- **Reconciliation location:** `writing-engine/logs-golden-v1/`
- **Tests:** `tests/corpus/` (4 files, 67 tests)
- **Canonical metrics:** activeCases=59, finalCorrect=54/59, llmExecuted=42, deterministicFastPathed=17
- **Consistency checks:** 20/20 PASS

## Nonfiction v1.1 — Discovery Corpus

- **Branch:** `research/nonfiction-source-pack-v1.1`
- **HEAD SHA:** `fd661f53ffe5cab5e93ca527ae3158ff37cb41f2`
- **Status:** DISCOVERY_CORPUS (ground truth = false)
- **Source branch path:** `research/nonfiction-source-pack-v1.1/source-pack/` (in the v1.1 branch)
- **Phase 3 canonical path:** `nonfiction/source-pack/` (imported copy)
- **Key files (in Phase 3 at `nonfiction/source-pack/`):**
  - `source-index.json` — 69 sources
  - `claim-inventory.jsonl` — 135 candidate claims
  - `PACK-MANIFEST.json` — version 1.1.0, DISCOVERY_CORPUS
  - `source-evaluation.csv`, `validation-opportunity-matrix.csv`
  - `licensing-report.md`, `diversity-report.md`, `source-gaps.md`
  - `metadata/`, `raw/` (with ARCHIVE-MANIFEST.json)
- **Source verification status:** 17 URL_VERIFIED, 5 URL_EXISTS_BOT_BLOCKED, 47 UNVERIFIED, 0 SOURCE_VERIFIED
- **Selection tiers:** 29 GOLD, 25 SILVER, 15 BRONZE
- **Claim statuses:** 135 candidate claims imported without SOURCE_VERIFIED status. Their original discovery-layer statuses are preserved (verificationLevel: SNIPPET_VERIFIED=17, WIDELY_CITED=118; epistemicLabelStatus: AGENT_ASSIGNED_NEEDS_HUMAN_REVIEW=135). None are SOURCE_VERIFIED.
