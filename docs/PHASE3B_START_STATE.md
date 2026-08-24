# Phase 3B Start State Boundary

**Phase 3B has NOT started yet.**

This document establishes the precise boundary conditions and expected inputs for Phase 3B.

## Current Input

The active working tree is currently synchronized with the canonical Phase 3A.5 baseline commit.

## Stable Inputs

The following components are fully validated, frozen, and must serve as stable inputs to Phase 3B.

1. **Phase 2B Corpus**: Frozen golden corpus and forensic artifacts.
2. **Nonfiction v1.1**: The finalized Nonfiction discovery corpus (source pack).
3. **Phase 3A Verification Layer**: The established 69 source records, 135 claims, and corresponding validation infrastructure.

## Expected Next Work

The immediate next objective is **Phase 3B — SourceFactLedger**.

## Forbidden Actions

To maintain the integrity of the project baseline, the following actions are strictly forbidden during Phase 3B:

* **Modifying the frozen Phase 2B corpus.**
* **Modifying the frozen Nonfiction discovery corpus.**
* **Promoting claims to `SOURCE_VERIFIED` without new explicit evidence.**
* **Rewriting or modifying the historical provenance documented in `history/`.**
* **Mixing sandbox-only artifacts or temporary agent infrastructure into the active working tree.**
