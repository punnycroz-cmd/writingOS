# Writing OS — Branch Retirement & Superseding Report

This report evaluates each historical and intermediate branch to assess redundancy and determine retirement/preservation status under the strict policy: **Preserve all unique research; retire only proven redundancies.**

---

## 1. Branch Assessments

### 1. `research/phase2b-5f-1` (HEAD: `15f28d1`)
- **Assessment:** Intermediate development snapshot created during Phase 2B.5 reconciliation.
- **Comparison:** Compared against `research/phase2b-golden-corpus-v1-reconciled` (`4951da2`), which is 10 commits ahead and contains the full superset of files, all 20 consistency checks, full forensic scripts, and finalized documentation.
- **Unique Content Check:** 0 unique research assets. Every file in `research/phase2b-5f-1` exists in `research/phase2b-golden-corpus-v1-reconciled`.
- **Classification:** `SUPERSEDED_HISTORICAL`.
- **Action:** Can be safely retired from active remote tracking or retained as a historical tag/reference.

### 2. `archive/phase2b-5f-1` (HEAD: `b6a3993`)
- **Assessment:** Contains single unextracted binary file `Phase 2B.5F.1.tar` (15.9 MB).
- **Comparison:** Its unpacked contents are identical to commit `15f28d1`, which is superseded by `4951da2`.
- **Unique Content Check:** Provides binary byte-level provenance of the original container export.
- **Classification:** `HISTORICAL_ARCHIVE`.
- **Action:** Retained as forensic archive or retired if repository storage optimization is desired.

### 3. `research/nonfiction-source-pack-v1` (HEAD: `0ab6adb`)
- **Assessment:** Initial 50-source discovery pack (Phase 3 deliverables 105–110).
- **Comparison:** Nonfiction v1.1 (`9897945`) expanded the corpus to 69 sources, audited all 135 claims, structured verification taxonomies, and isolated all assets in a clean subdirectory.
- **Unique Content Check:** Deliverables 105–110 represent the milestone v1.0 state.
- **Classification:** `SUPERSEDED_HISTORICAL`.
- **Action:** Retained as historical milestone.
