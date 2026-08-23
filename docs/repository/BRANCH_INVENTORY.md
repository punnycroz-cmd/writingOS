# Writing OS Repository — Final Consolidated Branch Inventory

**Consolidation Completed Date:** 2026-08-23T11:05:00+07:00  
**Repository URL:** `https://github.com/punnycroz-cmd/writingOS.git`  
**Total Active Branches:** 6

---

## 1. Executive Summary

All branches in `punnycroz-cmd/writingOS` were forensically audited, cross-referenced, and consolidated. All unique research artifacts were preserved in their canonical branch homes. Three redundant/intermediate branches (`research/nonfiction-source-pack-v1`, `research/phase2b-5f-1`, and `archive/phase2b-5f-1`) have been safely retired from remote tracking after their contents were fully preserved.

---

## 2. Active Remote Branches (Exact State)

| Branch | HEAD SHA | Role / Classification | Canonical Purpose |
|---|---|---|---|
| **`main`** | `ff04d50` | `CANONICAL` | Default branch; clean, stable shared baseline |
| **`integration/writing-os-v1`** | `287dad2` | `CANONICAL_INTEGRATION` | Active canonical integrated engine, multi-scene execution, and mode/register architecture |
| **`gemini/deterministic-triage-v2`** | `655dd26` | `CANONICAL_RESEARCH` | Canonical Deterministic Triage Gateway v2 (8 modules), 16-case regression test suite, Deliverables 23–76 |
| **`original/semantic-validation-v4-2`** | `f5060a4` | `CANONICAL_RESEARCH` | Canonical Semantic Validator v4.2 (Fireworks/Qwen integration), 4.3B clean benchmark, raw JSON logs |
| **`research/phase2b-golden-corpus-v1-reconciled`** | `18f8b2a` | `CANONICAL_RESEARCH_SNAPSHOT` | Frozen 59-case Golden Corpus v1, 20 consistency checks (100% pass), complete Phase 2B.5 forensic history |
| **`research/nonfiction-source-pack-v1.1`** | `fd661f5` | `CANONICAL_DISCOVERY_CORPUS` | Canonical Nonfiction Source Pack v1.1 discovery corpus (69 sources, 135 candidate claims, Deliverables 114–120, plus preserved v1 history) |

---

## 3. Retired Branches Summary

| Retired Branch | Last HEAD SHA | Reason for Retirement | Preserved Location | Deletion Date |
|---|---|---|---|---|
| `research/nonfiction-source-pack-v1` | `0ab6adb` | Superseded by v1.1 | `research/nonfiction-source-pack-v1.1/research-history/v1/` | 2026-08-23 |
| `research/phase2b-5f-1` | `15f28d1` | Intermediate snapshot; superset exists on reconciled branch | `research/phase2b-golden-corpus-v1-reconciled/` (`18f8b2a`) | 2026-08-23 |
| `archive/phase2b-5f-1` | `b6a3993` | Binary tar snapshot whose contents are fully represented in reconciled branch | `research/phase2b-golden-corpus-v1-reconciled/` | 2026-08-23 |
