# Writing OS — Final Branch Status Table

| Branch | Final Status | Canonical Purpose | Action Taken | Rationale & Preserved State |
|---|---|---|---|---|
| **`main`** | `CANONICAL` | Stable baseline | **RETAINED** | Clean default branch; shared project baseline. |
| **`integration/writing-os-v1`** | `CANONICAL_INTEGRATION` | Integrated Writing OS | **RETAINED** | Canonical integrated engine and multi-scene architecture. |
| **`gemini/deterministic-triage-v2`** | `CANONICAL_RESEARCH` | Deterministic Triage Gateway v2 | **RETAINED** | Canonical deterministic gateway & 16 regression scenarios. |
| **`original/semantic-validation-v4-2`** | `CANONICAL_RESEARCH` | Semantic Validation & calibration | **RETAINED** | Canonical semantic judge v4.2 & raw benchmark logs. |
| **`research/phase2b-golden-corpus-v1-reconciled`** | `CANONICAL_RESEARCH_SNAPSHOT` | Frozen Golden Corpus v1 | **RETAINED & ENRICHED** | Frozen Golden Corpus (20 checks passing); preserved tool-results from 5f-1. |
| **`research/nonfiction-source-pack-v1.1`** | `CANONICAL_DISCOVERY_CORPUS` | Nonfiction Discovery Corpus | **RETAINED & ENRICHED** | Canonical 69-source discovery pack; preserved v1.0 milestone in `research-history/v1/`. |
| **`research/nonfiction-source-pack-v1`** | `SUPERSEDED_HISTORICAL` | Nonfiction v1.0 milestone | **RETIRED & DELETED** | Fully preserved into `research/nonfiction-source-pack-v1.1/research-history/v1/`. |
| **`research/phase2b-5f-1`** | `SUPERSEDED_HISTORICAL` | Phase 2B.5 intermediate commit | **RETIRED & DELETED** | Fully encompassed by `research/phase2b-golden-corpus-v1-reconciled` (`18f8b2a`). |
| **`archive/phase2b-5f-1`** | `HISTORICAL_ARCHIVE` | Binary archive snapshot | **RETIRED & DELETED** | Provenance fully represented in reconciled Golden Corpus branch. |
