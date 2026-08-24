# Canonical Project State

This document defines the single authoritative baseline for the active working project.

> **Git's canonical working branch is the authority. Agent sandboxes are not authoritative.**

## Active Working State

* **Current canonical branch**: `research/phase3b-sourcefactledger-v1`
* **Current canonical baseline SHA**: `2f290acf81e84296a80e59a43e0eb96f7c338056`
* **Current phase**: Phase 3A.5

## Frozen Inputs

The following baselines represent immutable datasets and infrastructure imported into the working tree. They must not be modified:

* **Phase 2B source SHA**: `d8f8840cb7b3df5a97848460ff3c9b91efc4b095`
* **Nonfiction v1.1 source SHA**: `fd661f53ffe5cab5e93ca527ae3158ff37cb41f2`
* **Phase 3A.5 baseline SHA**: `2f290acf81e84296a80e59a43e0eb96f7c338056`

## Active Infrastructure

* **Active source-pack location**: `nonfiction/source-pack/`
* **Active verification ledger location**: `nonfiction/verification/source-verification-ledger.jsonl`
* **Authoritative test suites**:
  * `tests/corpus/`
  * `tests/phase3/`
* **Authoritative Phase 2B reconciler**: `bun run src/corpus/reconcile-v1.ts`

## Verification Boundary

The branch `audit/end-to-end-repro-v2` is **verification-only**. It is explicitly separated from the development working chain and is not authoritative for current development. Do not merge audit infrastructure into the working tree unless it has a proven production role.

**Audit branch = verification-only**

## Next Phase

**Next phase = Phase 3B**
