# Iteration 4.2 — Scoped [CC]/[LJ] Arbitration (Historical)

**Status:** PARTIALLY COMPLETE (API rate-limiting prevented full live execution).

**Results:**
- Deterministic logic test: 13/16 correct (3 misses are LJ-dependent)
- Live LJ results: 6/10 correct (4 failures are LJ prompt issues + API errors)
- Mixed-case safety (Group C): 4/4 correct — the critical safety test
- True hard blocks (Group B): 4/4 correct
- 0% false acceptance on hard-integrity cases

**Key findings:**
- Scoped arbitration DEMONSTRATED: authority proportional to evidence strength
- HARD_STRUCTURAL_BLOCK is non-overridable
- CLAIM_PATTERN_BLOCK + STATE_SUPPORTED → downgrade to ADVISORY
- Rule 0: LJ faithfulness overblock override for state-supported numbers
- SM-3 FIXED (Rule 0); SM-4 NOT FIXED (LJ prompt issue)

**Honest limitation:**
- 6 of 16 matrix cases could not be completed with live LJ due to persistent
  API rate-limiting. These are analyzed via deterministic logic + V4.1
  equivalent results. See deliverable 38 for full details.

**Artifacts:**
- Deliverables 37-41
- Source: iteration42.ts
- Logs: writing-engine/logs42/ (not committed)

**Immutability:** These results are frozen. Do not modify. The incomplete
live-LJ cases are recorded as execution errors, not silently substituted.
