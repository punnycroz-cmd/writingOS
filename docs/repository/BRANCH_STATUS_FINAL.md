# Writing OS — Final Branch Status Table

| Branch | Final Status | Canonical Purpose | Action | Rationale |
|---|---|---|---|---|
| **`main`** | `CANONICAL` | Stable baseline | **KEEP** | Default branch; clean, shared baseline. |
| **`integration/writing-os-v1`** | `CANONICAL` | Integrated Writing OS | **KEEP** | Active canonical integrated engine and experiments. |
| **`gemini/deterministic-triage-v2`** | `CANONICAL_RESEARCH` | Deterministic Triage Gateway v2 | **KEEP** | Canonical deterministic gateway & 16 regression scenarios. |
| **`original/semantic-validation-v4-2`** | `CANONICAL_RESEARCH` | Semantic Validation & calibration | **KEEP** | Canonical semantic judge v4.2 & raw benchmark logs. |
| **`research/phase2b-golden-corpus-v1-reconciled`** | `CANONICAL_RESEARCH_SNAPSHOT` | Frozen Golden Corpus v1 | **KEEP** | Frozen Golden Corpus calibration & 20 consistency checks. |
| **`research/nonfiction-source-pack-v1.1`** | `CANONICAL_DISCOVERY_CORPUS` | Nonfiction Discovery Corpus | **KEEP** | Canonical 69-source discovery pack & audit deliverables. |
| **`research/nonfiction-source-pack-v1`** | `SUPERSEDED_HISTORICAL` | Nonfiction v1.0 milestone | **KEEP (HISTORICAL)** | Preserves original 50-source discovery history. |
| **`research/phase2b-5f-1`** | `SUPERSEDED_HISTORICAL` | Phase 2B.5 intermediate commit | **KEEP (HISTORICAL)** | Fully encompassed by reconciled branch; preserved for commit lineage. |
| **`archive/phase2b-5f-1`** | `HISTORICAL_ARCHIVE` | Binary archive snapshot | **KEEP (ARCHIVE)** | Byte-for-byte binary archive of Phase 2B.5F.1 tar. |
