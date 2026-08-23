# Phase 3 Bootstrap Final Report

## 1. What exact Phase 2B SHA was used?

`d8f8840cb7b3df5a97848460ff3c9b91efc4b095` (branch `research/phase2b-golden-corpus-v1-reconciled`)

## 2. What exact Nonfiction v1.1 SHA was used?

`fd661f53ffe5cab5e93ca527ae3158ff37cb41f2` (branch `research/nonfiction-source-pack-v1.1`)

## 3. What exact Writing OS base was used?

`d8f8840cb7b3df5a97848460ff3c9b91efc4b095` — the Phase 2B branch was chosen as the base because it contains the latest
Writing OS code (v5 reconciler with 20 checks, forensic-validator, freeze-document-parser,
67 tests). The `integration/writing-os-v1` branch was rejected because it has an older
v3 reconciler (16 checks) and no corpus tests. See `PHASE3_BASELINE_DECISION.md`.

## 4. Was the Nonfiction pack copied or referenced?

**Copied.** The source pack was imported from the v1.1 branch into `nonfiction/source-pack/`
using `git checkout` + file copy. This ensures the Phase 3 branch is self-contained and
does not depend on the v1.1 branch for runtime access.

## 5. How many source files were imported?

30 files (source-index.json, claim-inventory.jsonl, source-evaluation.csv,
validation-opportunity-matrix.csv, licensing-report.md, diversity-report.md,
source-gaps.md, README.md, PACK-MANIFEST.json, metadata/*, raw/*).

69 sources are recorded in source-index.json.

## 6. How many claim records were imported?

135 claims (in claim-inventory.jsonl).

## 7. Were any conflicts found?

**No.** The `nonfiction/` directory did not exist on the Phase 2B base branch.
See `IMPORT_CONFLICTS.md`.

## 8. Were any files dropped?

**No.** All 30 files from the v1.1 source-pack directory were imported.
See `PHASE3_IMPORT_INVENTORY.json` for the complete file-level inventory.

## 9. Were any files promoted to ground truth?

**NO.** No claims were promoted to SOURCE_VERIFIED. The source pack remains
a DISCOVERY_CORPUS with ground truth = false. The 47 UNVERIFIED sources
must undergo source verification (Phase 3A) before any promotion.

## 10. What remains unverified?

- 47 of 69 Nonfiction sources are UNVERIFIED
- 17 are URL_VERIFIED (URL accessible but source content not verified)
- 5 are URL_EXISTS_BOT_BLOCKED (URL exists but content inaccessible)
- 0 are SOURCE_VERIFIED
- 135 claims are all UNKNOWN verification status
- No SourceFactLedger exists
- No Nonfiction Mode exists

## 11. What is the next task?

**Phase 3A: Source Verification.** Verify the 47 UNVERIFIED sources against
their original URLs/documents. Promote eligible sources to SOURCE_VERIFIED.
Then build SourceFactLedger v0 (Phase 3B).

## 12. Is the Phase 3 foundation reproducible?

**Yes.** The branch contains:
- Exact SHA of the Phase 2B base (`d8f8840cb7b3df5a97848460ff3c9b91efc4b095`)
- Exact SHA of the Nonfiction v1.1 source (`fd661f53ffe5cab5e93ca527ae3158ff37cb41f2`)
- SHA256 hashes for all 30 imported files (`nonfiction-source-provenance.json`)
- Git blob SHAs for all source files (`PHASE3_IMPORT_INVENTORY.json`)
- Complete provenance documentation

Any agent can reproduce this foundation by:
1. Cloning the repository
2. Checking out `research/phase3-nonfiction-foundation-v1`
3. Verifying SHAs against the recorded provenance
