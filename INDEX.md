# Documentation Index

The repo accumulated docs across many research phases. This is the map.

## Start here
- `README.md` — what the system is, how to run it
- `MONETIZATION.md` — product + pricing plan
- `worklog.md` — chronological research log (failures kept, methodology)
- `docs/PROJECT_MEMORY_MASTER.md` — consolidated project memory

## Canonical specs
- `docs/CANONICAL_PROJECT_STATE.{md,json}` — authoritative state snapshot
- `docs/PHASE3B_START_STATE.md` — latest-phase baseline
- `docs/architecture/` — engine architecture docs
- `docs/semantic/` — [LJ] semantic validation design
- `docs/corpus/` — golden corpus methodology
- `docs/phase3/` — nonfiction phase artifacts

## Code (canonical)
- `src/engine/deterministic/` — [CC] triage (rebuilt from history lineage)
- `src/engine/semantic/` — [LJ] validator + arbitration + repair
- `src/engine/nonfiction/` — ledger validators + epistemic rules
- `src/engine/runtime/` — orchestrator
- `src/engine/llm.ts` — LLM provider abstraction

## Data
- `corpus/golden-v1/` — frozen 60-case evaluation benchmark
- `nonfiction/` — source-fact ledger, source pack, benchmark
- `history/` — archived iterations + forensic manifest (read-only research)
- `tests/` — 201 tests (188 deterministic, 13 LLM-gated)

## Historical branch docs (context only)
- `docs/repository/` — old branch inventory (note: 2 branches were deleted
  and are unrecoverable; their code was rebuilt in src/engine/deterministic/)
