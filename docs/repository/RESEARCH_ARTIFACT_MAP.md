# Writing OS Research Artifact Map

This document maps all major experimental datasets, logs, benchmarks, and deliverables across branches to establish their canonical home and verify duplication/preservation.

---

## 1. Major Research Artifact Inventory

| Research Artifact Group | Contents / Description | Canonical Branch Location | Secondary / Duplicate Locations | Status |
|---|---|---|---|---|
| **Deterministic Triage v2 Gateway** | `src/deterministic/` (8 TypeScript modules), `tests/deterministic_regression.test.ts` (16 scenarios), Deliverables 23–76 | `gemini/deterministic-triage-v2` | `writing-engine/deliverables/` | **CANONICAL** |
| **Semantic Validator & 4.3B Benchmark** | `writing-engine/logs43b/`, `writing-engine/logs43fw/`, `writing-engine/src/iteration43b.ts`, Iteration 4–4.3 deliverables | `original/semantic-validation-v4-2` | `integration/writing-os-v1` (code), `research/phase2b-golden-corpus-v1-reconciled` (code) | **CANONICAL** |
| **Golden Corpus v1 Dataset** | `corpus/golden-v1/` (59 cases, registry, manifest, schema) | `research/phase2b-golden-corpus-v1-reconciled` | `integration/writing-os-v1`, `research/phase2b-5f-1` | **CANONICAL** |
| **Golden Corpus Reconciliation & Provenance** | `writing-engine/logs-golden-v1/` (results for 59 cases, GC-0038R1 live execution record, 20 consistency checks) | `research/phase2b-golden-corpus-v1-reconciled` | `research/phase2b-5f-1` (partial) | **CANONICAL** |
| **Phase 2B.5 Forensic History** | `forensic/phase2b-5/` (scripts, timeline, test results, reconciliation history v3/v4) | `research/phase2b-golden-corpus-v1-reconciled` | N/A | **CANONICAL** |
| **Nonfiction Source Pack v1.1** | `research/nonfiction-source-pack-v1.1/` (69 sources, 135 claims, Deliverables 114–120, DELIVERY manifests) | `research/nonfiction-source-pack-v1.1` | N/A | **CANONICAL** |
| **Nonfiction Source Pack v1.0** | `sources/nonfiction-v1/` (50 sources, 105 claims, Deliverables 105–110) | `research/nonfiction-source-pack-v1` | N/A | **SUPERSEDED** (Preserved as historical milestone) |
| **Integrated System & Mode Architecture** | `docs/architecture/MODE_REGISTER_ARCHITECTURE.md`, `REGISTER_PACK_CONTRACT.md`, `WRITING_OS_V1.md` | `integration/writing-os-v1` | `research/phase2b-golden-corpus-v1-reconciled` | **CANONICAL** |
| **Phase 2B.5F.1 Raw Binary Tar** | `Phase 2B.5F.1.tar` (15.9 MB unextracted tar archive) | `archive/phase2b-5f-1` | Local workspace | **HISTORICAL_ARCHIVE** |
