# Historical Provenance

This directory contains records and references to historical research, experimentation, and early phase baselines.

**The contents of this directory (and the branches referenced here) are NOT authoritative for the active working project.** They are preserved for provenance, traceability, and research continuity.

## Authoritative Branch

The current canonical active development branch is `research/phase3b-sourcefactledger-v1`.

## Superseded Branches

The following branches were instrumental in the project's development but have been superseded by the current working tree. Their required active artifacts have been consolidated into the canonical branch.

### `research/phase2b-golden-corpus-v1-reconciled`
* **Purpose**: Produced the final frozen Phase 2B golden corpus, ensuring no hallucinated or false-positive assertions remained in the foundational dataset.
* **Canonical Destination**: Active corpus artifacts are preserved in `corpus/` and `forensic/phase2b-5/`.

### `research/nonfiction-source-pack-v1.1`
* **Purpose**: Developed the independent Nonfiction discovery corpus, identifying constraints, historical parameters, and physical boundaries for the narrative.
* **Canonical Destination**: Active artifacts are preserved in `nonfiction/source-pack/`.

### `research/phase3-nonfiction-foundation-v1`
* **Purpose**: Established Phase 3A, building the verification layer to independently map claims to source constraints without ground-truth contamination.
* **Canonical Destination**: Active artifacts are preserved in `nonfiction/verification/`, `src/phase3/`, and `tests/phase3/`.

### Other Notable Branches
* `integration/writing-os-v1`: Early OS integration.
* `gemini/deterministic-triage-v2`: Deterministic triage experiments.
* `original/semantic-validation-v4-2`: Legacy semantic validation.

## Traceability

* **Phase 2B Baseline Commit**: `d8f8840cb7b3df5a97848460ff3c9b91efc4b095`
* **Nonfiction v1.1 Baseline Commit**: `fd661f53ffe5cab5e93ca527ae3158ff37cb41f2`
* **Phase 3A.5 Baseline Commit**: `2f290acf81e84296a80e59a43e0eb96f7c338056`
