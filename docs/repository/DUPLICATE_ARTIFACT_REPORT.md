# Writing OS — Duplicate Artifact Audit & Comparison

This report details exact file and directory comparisons between related branches to establish duplication and preservation status.

---

## 1. Nonfiction Source Packs (v1.0 vs v1.1)

| Dimension | `research/nonfiction-source-pack-v1` | `research/nonfiction-source-pack-v1.1` | Status |
|---|---|---|---|
| **Namespace** | Root level (`sources/nonfiction-v1/`, `docs/`) | Isolated (`research/nonfiction-source-pack-v1.1/`) | Clean isolation in v1.1 |
| **Selected Sources** | 50 (22 GOLD, 18 SILVER, 10 BRONZE) | 69 (29 GOLD, 25 SILVER, 15 BRONZE) | v1.1 expands coverage by +19 sources |
| **Candidate Claims** | 105 claims (from 22 GOLD sources) | 135 claims (from 29 GOLD sources) | v1.1 expands claim coverage |
| **URL Verification** | Unaudited in index | 17 verified, 5 bot-blocked, 47 unverified | v1.1 introduces formal taxonomy |
| **Deliverables Included** | Deliverables 105–110 | Deliverables 114–120 + Manifests | v1.1 includes full audit & delivery reports |
| **Classification** | **SUPERSEDED_HISTORICAL** | **CANONICAL_DISCOVERY_CORPUS** | Both preserved on dedicated branches |

---

## 2. Phase 2B Golden Corpus Snapshots (`phase2b-5f-1` vs `phase2b-golden-corpus-v1-reconciled`)

| Dimension | `research/phase2b-5f-1` | `research/phase2b-golden-corpus-v1-reconciled` | Status |
|---|---|---|---|
| **HEAD Commit** | `15f28d1` | `4951da2` (+10 commits ahead) | Reconciled branch is strictly more recent |
| **Consistency Checks** | 16 checks passing | 20 checks passing | Reconciled branch adds 4 additional integrity checks |
| **Forensic History** | Absent | Complete (`forensic/phase2b-5/` 416 files) | All intermediate scripts preserved in reconciled branch |
| **GC-0038R1 Provenance** | Present | Present (non-zero latency, live Fireworks API run) | Verified intact |
| **Classification** | **SUPERSEDED_HISTORICAL** | **CANONICAL_RESEARCH_SNAPSHOT** | Reconciled branch contains complete superset |

---

## 3. Raw Benchmark Logs (`logs43b/` and `logs43fw/`)

- **Primary Home:** `original/semantic-validation-v4-2` (Full raw JSON logs for Iterations 4, 4.1, 4.2, 4.3b, 4.3fw).
- **Secondary Presence:** Tracked in `integration/writing-os-v1` and `research/phase2b-golden-corpus-v1-reconciled`.
- **Integrity Check:** SHA256 hashes of individual benchmark cases (e.g. `CT1.json`, `T1a.json`, `T15-A.json`) are identical across branches.
- **Classification:** **IDENTICAL_DUPLICATE** across branches; primary provenance anchored in `original/semantic-validation-v4-2`.
