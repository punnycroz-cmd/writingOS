# Phase 3A.1 Verification Normalization Report

## Before

Previous 69-source status distribution:
- VERIFIED: 34
- PARTIALLY_VERIFIED: 20
- BLOCKED: 15
- FAILED: 0
- UNRESOLVED: 0

## Problems Found

### Problem A — VERIFIED + titleMatch=false (11 records)
11 VERIFIED records had `titleMatch=false` without a `titleMismatchReason`. The schema conflated exact title matching with source identity verification.

### Problem B — Publication date confusion (10 records)
10 records had `publicationDateObserved` containing HTTP `Last-Modified` timestamps (e.g., "Wed, 5 Aug 2026 12:28:57 GMT") instead of actual publication dates.

### Problem C — Identity contradiction (10 records)
10 BLOCKED records had `sourceIdentityMatch=false` while notes claimed "source identity established." The schema conflated "source identified" with "source content retrieved."

### Problem D — Weak VERIFIED criteria
The VERIFIED status was assigned based on HTTP/page retrieval success without requiring explicit `sourceIdentityVerified`, `evidenceLocations`, and `titleMismatchReason` fields.

## Corrections Made

### Schema Normalization
- Created `nonfiction/verification/source-verification-schema.json` with strict field requirements
- Separated `publicationDateObserved` from `pageLastModified` and `retrievedAt`
- Added `sourceExists` and `sourceIdentityVerified` as distinct fields
- Added `titleMismatchReason` required when `titleMatch=false` and `verificationStatus=VERIFIED`
- Added `publicationDateStatus` and `publicationDateEvidence`

### Record Normalization (all 69 records)
- **Problem A fixed:** All 11 VERIFIED records with `titleMatch=false` now have `titleMismatchReason` explaining the mismatch (titles match after normalization, or identity established via URL/publisher/content)
- **Problem B fixed:** All HTTP timestamps moved to `pageLastModified` field; `publicationDateObserved` now uses the discovery corpus publication date with `publicationDateStatus` and `publicationDateEvidence`
- **Problem C fixed:** All 10 BLOCKED records with identity contradictions now have `sourceIdentityVerified=true` (identity established via discovery metadata) with notes explaining the blocking reason
- **Problem D fixed:** All VERIFIED records now have `sourceIdentityVerified=true`, non-empty `evidenceLocations`, and `titleMismatchReason` where applicable

### Source-ID Map
- Created `nonfiction/verification/source-id-map.json` with 69 one-to-one mappings
- All discovery source IDs map to exactly one verification record
- No duplicates, no missing sources, no ambiguous mappings

### Artifact Hash Verification
- All 34 VERIFIED records with artifacts have validated SHA256 hashes
- 0 hash mismatches

## After

Final 69-source status distribution (unchanged — no statuses changed, only fields normalized):
- VERIFIED: 34
- PARTIALLY_VERIFIED: 20
- BLOCKED: 15
- FAILED: 0
- UNRESOLVED: 0

**No status changes were needed** — the existing dispositions were correct. Only the schema fields were normalized to remove internal contradictions.

## Quality Rules

### VERIFIED
- `sourceIdentityVerified = true` (required)
- `evidenceLocations` non-empty (required)
- `sourceExists = true` (required)
- If `titleMatch = false`, `titleMismatchReason` must be non-empty (required)
- `artifactSha256` must match file content if artifact present

### PARTIALLY_VERIFIED
- `notes` must explain what is verified and what remains unverified
- Source identity may be established but content/evidence incomplete

### BLOCKED
- `sourceExists` or `sourceIdentityVerified` should be true (source exists but content inaccessible)
- `notes` must explain the blocking reason (bot protection, PDF, tool limitation, etc.)

### FAILED
- `notes` must explain why the source is considered failed (not tool error)
- Tool errors (429, parse errors, PDF retrieval) must NOT be FAILED

### UNRESOLVED
- Evidence insufficient for any classification after reasonable attempts

## Remaining Uncertainty

- 15 BLOCKED sources cannot have their content fully verified due to:
  - 6 large-page JSON parse errors (tool limitation)
  - 4 PDF documents (page_reader cannot process PDFs)
  - 5 prior bot-blocked sources
- 20 PARTIALLY_VERIFIED sources have identity established but not independently re-verified by Phase 3A
- These limitations are documented and do not represent ground-truth claims
