# Iteration 4 — Triplet Benchmark (Historical)

**Status:** COMPLETE (frozen).

**Results:**
- V4 validator: 48/60 (80%) correct
- False rejection rate (A variants): 3/20 (15%)
- False acceptance rate (B variants): 0/20 (0%)

**Key findings:**
- State-reading errors (LJ didn't consult IO state)
- Vague uncertainty overblocking ("wondered if" treated as leak)
- Paraphrase overblocking ("hospitals" ≠ "medical centers")
- 0% false acceptance — safety boundary held

**Artifacts:**
- Deliverables 01-16, 23-26 (research + iteration 4 reports)
- Source: types-v1.ts, provenance-v4.ts
- Logs: writing-engine/logs4/ (not committed — see .gitignore)

**Immutability:** These results are frozen. Do not modify.
