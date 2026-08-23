# Writing OS — Cross-Branch Preservation Audit Report

**Audit Completed:** 2026-08-23T11:30:00+07:00  
**Repository:** `https://github.com/punnycroz-cmd/writingOS.git`  
**Evaluation Scope:** Forensic mapping and content verification between 3 retired branches and their canonical preservation destinations.

---

## 1. Preservation Taxonomy

To maintain scientific transparency, artifacts are evaluated using explicit categorization:

- **`PRESERVED_EXACT`**: Byte-for-byte SHA256 / git blob match in designated canonical destination.
- **`PRESERVED_CONTENT_EQUIVALENT`**: Data migrated into upgraded schemas, updated verification taxonomies, or designated sub-namespaces (e.g. `research-history/v1/`).
- **`PRESERVED_RECONSTRUCTED`**: Derived ledgers and reports regenerated deterministically from validated primary sources.
- **`INTENTIONALLY_EXCLUDED`**: Policy-based exclusions (e.g. generic application scaffold inherited from baseline, build caches, gitignored files).
- **`NOT_VERIFIED`**: Binary archives where container-level byte-matching cannot be fully proven without original container filesystem export.
- **`MISSING`**: Unique research artifacts that were lost (Target: **0**).

---

## 2. Detailed Retired Branch Preservation Audits

### A. `research/nonfiction-source-pack-v1` (Retired HEAD: `0ab6adb`)
- **Canonical Destination:** `research/nonfiction-source-pack-v1.1`
- **Total Files in Retired Tree:** 533
- **Audit Breakdown:**
  - `PRESERVED_EXACT`: **10** (Deliverables 105–110, raw evaluation matrices)
  - `PRESERVED_CONTENT_EQUIVALENT`: **50** (v1.0 source index & 105 claims preserved in `research-history/v1/` alongside upgraded 69-source v1.1 discovery corpus)
  - `INTENTIONALLY_EXCLUDED`: **473** (Generic Next.js boilerplate and UI components stripped to keep research branch isolated)
  - `NOT_VERIFIED`: **0**
  - `MISSING`: **0**
- **Confidence Level:** **HIGH**

### B. `research/phase2b-5f-1` (Retired HEAD: `15f28d1`)
- **Canonical Destination:** `research/phase2b-golden-corpus-v1-reconciled`
- **Total Files in Retired Tree:** 831
- **Audit Breakdown:**
  - `PRESERVED_EXACT`: **763** (Matching code, test suites, and historical logs)
  - `PRESERVED_CONTENT_EQUIVALENT`: **68** (60 result files and ledger summaries upgraded to final Phase 2B.5F.2 verified state with explicit provenance)
  - `INTENTIONALLY_EXCLUDED`: **0**
  - `NOT_VERIFIED`: **0**
  - `MISSING`: **0**
- **Preservation Action:** Intermediate tool results (`grep_1787436691374_0602aeb66af0.txt`, `read_1787436097781_7443224f7ee5.txt`) committed in `18f8b2a`.
- **Confidence Level:** **HIGH**

### C. `archive/phase2b-5f-1` (Retired HEAD: `b6a3993`)
- **Canonical Destination:** `research/phase2b-golden-corpus-v1-reconciled`
- **Total Files in Retired Tree:** 1 (`Phase 2B.5F.1.tar` binary archive)
- **Audit Breakdown:**
  - `PRESERVED_EXACT`: **0**
  - `PRESERVED_CONTENT_EQUIVALENT`: **0**
  - `INTENTIONALLY_EXCLUDED`: **0**
  - `NOT_VERIFIED`: **1** (The tar archive contained an unextracted repository snapshot of commit `15f28d1`. While git commit `15f28d1` is encompassed by the commit history of `research/phase2b-golden-corpus-v1-reconciled`, container-level binary byte equivalence was not directly extracted/tested, so it is strictly classified as `NOT_VERIFIED`)
  - `MISSING`: **0**
- **Confidence Level:** **QUALIFIED**

---

## 3. Summary Preservation Table

| Retired Branch | Retired HEAD SHA | Canonical Destination | PRESERVED_EXACT | PRESERVED_CONTENT_EQUIVALENT | INTENTIONALLY_EXCLUDED | NOT_VERIFIED | MISSING | Confidence |
|---|---|---|---|---|---|---|---|---|
| `research/nonfiction-source-pack-v1` | `0ab6adb` | `research/nonfiction-source-pack-v1.1` | 10 | 50 | 473 | 0 | **0** | **HIGH** |
| `research/phase2b-5f-1` | `15f28d1` | `research/phase2b-golden-corpus-v1-reconciled` | 763 | 68 | 0 | 0 | **0** | **HIGH** |
| `archive/phase2b-5f-1` | `b6a3993` | `research/phase2b-golden-corpus-v1-reconciled` | 0 | 0 | 0 | 1 | **0** | **QUALIFIED** |
