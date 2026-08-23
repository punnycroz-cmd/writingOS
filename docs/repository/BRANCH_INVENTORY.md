# Writing OS Repository — Complete Branch Inventory

**Generated Date:** 2026-08-23T11:00:00+07:00  
**Repository URL:** `https://github.com/punnycroz-cmd/writingOS.git`  
**Total Branches Audited:** 9

---

## 1. Executive Summary

A comprehensive forensic audit of all 9 branches across `punnycroz-cmd/writingOS` was conducted. Every branch's commit lineage, file tree, diff versus baseline, and historical artifacts were indexed.

---

## 2. Full Remote Branch Inventory

| Branch | HEAD SHA | Committer Date | Latest Commit Subject | Merge-Base (with `main`) | Commits Ahead | File Count | Purpose / Role |
|---|---|---|---|---|---|---|---|
| `main` | `00b1b939` | 2026-08-22 11:06:16 +0700 | chore(repo): establish clean shared main baseline | `00b1b939` | 0 | 475 | Stable, neutral repository baseline |
| `gemini/deterministic-triage-v2` | `655dd26b` | 2026-08-22 10:03:12 +0700 | chore(experiments): preserve historical deliverables 23-76 and benchmark logs | `3719d248` | 3 | 379 | Canonical Deterministic Triage Gateway v2 & 16-case regression suite |
| `original/semantic-validation-v4-2` | `f5060a46` | 2026-08-22 07:14:44 +0000 | feat(semantic): iteration 4.3B clean epistemic benchmark + full calibrated run | `28205c46` | 9 | 645 | Canonical Semantic Validation v4.2 & Iteration 4.3B benchmark suite |
| `integration/writing-os-v1` | `287dad27` | 2026-08-22 21:29:48 +0000 | fix(corpus): reconcile-v1 imports canonical classifier, 16 checks, no duplicate logic | `28205c46` | 25 | 829 | Canonical Integrated Writing OS v1 & v1.1 system |
| `research/phase2b-golden-corpus-v1-reconciled` | `4951da2d` | 2026-08-22 23:36:27 +0000 | docs(forensic): final SHA sync — all docs reference f8089e7f... | `28205c46` | 39 | 1175 | Complete, reconciled Golden Corpus v1 research state (20 consistency checks passing) |
| `research/nonfiction-source-pack-v1.1` | `98979450` | 2026-08-23 10:45:29 +0700 | feat(research): freeze nonfiction source pack v1.1 discovery corpus | `00b1b939` | 1 | 517 | Canonical Nonfiction Source Pack v1.1 discovery corpus (69 sources, 135 claims) |
| `research/nonfiction-source-pack-v1` | `0ab6adb6` | 2026-08-23 04:30:56 +0700 | feat(nonfiction): add Nonfiction Source Pack v1 (Phase 3 deliverables 105-110...) | `00b1b939` | 1 | 533 | Historical v1 discovery corpus (superseded by v1.1) |
| `research/phase2b-5f-1` | `15f28d16` | 2026-08-22 22:26:52 +0000 | 099c0c25-5c73-49a8-8f99-7bd7a7decb96 | `28205c46` | 29 | 831 | Historical Phase 2B.5 intermediate commit snapshot (superseded by reconciled branch) |
| `archive/phase2b-5f-1` | `b6a3993d` | 2026-08-23 07:28:58 +0700 | chore(archive): add Phase 2B.5F.1.tar snapshot as-is | `00b1b939` | 1 | 476 | Immutable binary archive containing unextracted `Phase 2B.5F.1.tar` |

---

## 3. Branch Lineage & Tree Analysis

1. **Baseline Lineage (`main`)**:
   - Initial commit: `0b6c5ea`
   - Shared parent commit: `28205c4`
   - Clean main HEAD: `00b1b93` (security cleanup applied, untracked credentials/zscripts removed).

2. **Parallel Research Branches**:
   - `gemini/deterministic-triage-v2`: Developed the 6-module deterministic gate (`claim-state`, `observation`, `entities`, `provenance`, `canon`, `arbitrator`) and 16 regression tests.
   - `original/semantic-validation-v4-2`: Developed the LLM semantic judge, calibration sets, and 4.3B benchmarks.
   - `integration/writing-os-v1`: Unified architecture merging semantic and deterministic logic.
   - `research/phase2b-golden-corpus-v1-reconciled`: Culmination of Golden Corpus v1 calibration with 16+ consistency checks and forensic validator.
   - `research/nonfiction-source-pack-v1.1`: Audited, expanded 69-source discovery pack with complete licensing classification.
