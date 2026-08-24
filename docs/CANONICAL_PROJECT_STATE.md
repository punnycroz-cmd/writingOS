# Canonical Project State

This document defines the single authoritative baseline for the active working project.

> **Git's canonical working branch is the authority. Agent sandboxes are not authoritative.**

## Active Working State

* **Canonical Working Branch**: `research/phase3b-sourcefactledger-v1`
* **Canonical Baseline Commit**: `2f290acf81e84296a80e59a43e0eb96f7c338056` (Phase 3A.5)
* **Current Phase**: Phase 3B

## Frozen Inputs

The following baselines represent immutable datasets and infrastructure imported into the working tree. They must not be modified:

* **Phase 2B Source**: `d8f8840cb7b3df5a97848460ff3c9b91efc4b095` (Golden Corpus Reconciled)
* **Nonfiction v1.1 Source**: `fd661f53ffe5cab5e93ca527ae3158ff37cb41f2` (Nonfiction Source Pack)
* **Phase 3A.5 Baseline**: `2f290acf81e84296a80e59a43e0eb96f7c338056`

## Active Infrastructure

* **Active Source Pack**: `nonfiction/source-pack/`
* **Active Verification Ledger**: `nonfiction/verification/source-verification-ledger.jsonl`
* **Active Test Suites**:
  * `tests/corpus/` (Phase 2B regression)
  * `tests/phase3/` (Phase 3A regression)
* **Active Reconciler**: `src/corpus/reconcile-v1.ts`

## Verification Boundary

The branch `audit/end-to-end-repro-v2` is a **verification-only** branch. It is explicitly separated from the development working chain and is not authoritative for current development. Do not merge audit infrastructure into the working tree unless it has a proven production role.

## Historical Provenance

The following branches represent historical research and experimentation. They are preserved for provenance but their contents are superseded by the active working tree.

* `integration/writing-os-v1`
* `gemini/deterministic-triage-v2`
* `original/semantic-validation-v4-2`
* `research/phase2b-golden-corpus-v1-reconciled`
* `research/nonfiction-source-pack-v1.1`
* `research/phase3-nonfiction-foundation-v1`

See `history/README.md` for detailed provenance records.

## Next Phase

The next project phase is **Phase 3B — SourceFactLedger**.
