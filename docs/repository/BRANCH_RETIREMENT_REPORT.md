# Writing OS — Branch Retirement & Superseding Report

This report documents the retirement of intermediate and redundant remote branches following the cross-branch preservation audit.

---

## 1. Retired Branches Overview

| Retired Branch | Retired HEAD SHA | Canonical Replacement | Confidence Level | Missing Unique Artifacts |
|---|---|---|---|---|
| **`research/nonfiction-source-pack-v1`** | `0ab6adb` | `research/nonfiction-source-pack-v1.1` | **HIGH** | **0** (All v1.0 milestone reports & claims preserved in `research-history/v1/`) |
| **`research/phase2b-5f-1`** | `15f28d1` | `research/phase2b-golden-corpus-v1-reconciled` | **HIGH** | **0** (Reconciled branch is 10 commits ahead with full forensic history) |
| **`archive/phase2b-5f-1`** | `b6a3993` | `research/phase2b-golden-corpus-v1-reconciled` | **HIGH** | **0** (Binary tar snapshot whose git history is fully represented) |

---

## 2. Individual Branch Retirement Records

### A. `research/nonfiction-source-pack-v1`
- **Old HEAD SHA:** `0ab6adb6285adae6eb74861c85df3d5d0e3c61c7`
- **Reason:** Initial 50-source discovery milestone; superseded by Nonfiction Source Pack v1.1 (69 sources, 135 candidate claims, formal URL verification taxonomy).
- **Preserved Artifacts Location:** `research/nonfiction-source-pack-v1.1/research-history/v1/`
- **Preserved Files:**
  - `docs/105-nonfiction-source-pack-v1-spec.md` through `docs/110-phase-3-source-pack-final-summary.md`
  - `sources/source-index-v1.0.json` (50 sources)
  - `sources/claim-inventory-v1.0.jsonl` (105 claims)
  - `sources/source-evaluation-v1.0.csv` & `sources/validation-opportunity-matrix-v1.0.csv`
- **Exclusion Note:** 473 inherited application scaffold files were excluded to maintain clean research isolation on the Nonfiction branch.

### B. `research/phase2b-5f-1`
- **Old HEAD SHA:** `15f28d16fedbb2a71650682d106fb8cee8b1fadf`
- **Reason:** Intermediate development commit during Phase 2B.5 reconciliation.
- **Preserved Artifacts Location:** `research/phase2b-golden-corpus-v1-reconciled`
- **Preserved Files:**
  - Missing intermediate tool results (`grep_1787436691374_0602aeb66af0.txt`, `read_1787436097781_7443224f7ee5.txt`) committed in `18f8b2a`.
  - Reconciled branch contains full `forensic/phase2b-5/` directory (416 files) and hardened 20-check reconciler.

### C. `archive/phase2b-5f-1`
- **Old HEAD SHA:** `b6a3993d75a21c363ec9b57caba87488d95926b6`
- **Reason:** Unextracted binary tar archive of commit `15f28d1`, which is completely encompassed by the commit history of `research/phase2b-golden-corpus-v1-reconciled`.
- **Preserved Artifacts Location:** `research/phase2b-golden-corpus-v1-reconciled`
