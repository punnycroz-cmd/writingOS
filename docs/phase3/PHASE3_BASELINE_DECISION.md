# Phase 3 Baseline Decision

## Chosen Base

- **Branch:** `research/phase2b-golden-corpus-v1-reconciled`
- **SHA:** `d8f8840cb7b3df5a97848460ff3c9b91efc4b095`

## Why This Is the Correct Foundation

The Phase 2B branch was chosen over `integration/writing-os-v1` because it contains the latest, most complete Writing OS codebase:

| Feature | Phase 2B | integration/writing-os-v1 |
|---|---|---|
| Reconciler version | v5 (20 checks) | v3 (16 checks) |
| Check #18 (freeze doc) | Hardened (real metric comparison) | Weak (presence check) |
| Check #20 (forensic inventory) | Hardened (full validation) | Not present |
| Corpus tests | 4 files (67 tests) | 0 corpus test files |
| forensic-validator.ts | Present | Not present |
| freeze-document-parser.ts | Present | Not present |
| Golden Corpus | FROZEN (59 active, 1 superseded) | FROZEN (same) |
| Forensic snapshot | Present (forensic/phase2b-5/) | Not present |
| GC-0038R1 ground truth | PASS/PASS (corrected) | FAIL/FAIL (stale) |

The integration branch is an older intermediate state that lacks the hardened verification
infrastructure (checks #18/#20, forensic-validator, freeze-document-parser) and the complete
test suite. Phase 3 needs the most robust Writing OS foundation available.

## Relationship to Phase 2B

Phase 3 is **based on** Phase 2B but does not modify it:
- Phase 2B remains frozen as a canonical reference branch.
- Phase 3 inherits the Writing OS code, Golden Corpus, tests, and reconciliation infrastructure.
- Phase 3 adds the Nonfiction source pack and Phase 3-specific documentation.
- Phase 3 does NOT modify Fiction Golden Corpus ground truth.

## Relationship to Nonfiction v1.1

Phase 3 **imports** the Nonfiction v1.1 source pack:
- The source pack is copied into `nonfiction/source-pack/`.
- The original v1.1 branch remains frozen as a canonical reference.
- Phase 3 does NOT modify the source pack's research conclusions.
- No claims are promoted to SOURCE_VERIFIED.
