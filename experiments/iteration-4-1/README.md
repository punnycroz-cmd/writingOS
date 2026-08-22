# Iteration 4.1 — State-Aware Validator A/B Test (Historical)

**Status:** COMPLETE (frozen).

**Results:**
- V4 baseline: 48/60 (80%)
- V4.1 state-aware: 56/60 (93%)
- False rejection (A): 0/20 (was 3/20)
- False acceptance (B): 0/20 (unchanged)

**Key findings:**
- V4.1's 5 state-aware rules fixed 8/12 V4 failures
- [LJ] now reliably consults state (stateConsulted=true)
- NEW problem: [CC] HARD_BLOCK overrode correct [LJ] (SM-3, SM-4)
- 1 regression: T11-UNKNOWN-C (too lenient on domain suspicion)

**Artifacts:**
- Deliverables 17-22, 31-36
- Source: iteration41.ts
- Logs: writing-engine/logs41/ (not committed)

**Immutability:** These results are frozen. Do not modify.
