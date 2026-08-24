# Iteration 3 — Adversarial Validation Summary

Executed: 2026-08-22T00:33:11.957Z
Cases: 3

## Results Table

| Case | Label | Category | Leak Form | [CC] | [LJ] io | [LJ] faith | [LJ] overall | Exp | v2 | v3 |
|------|-------|----------|-----------|------|---------|-----------|--------------|-----|----|----|
| CONF-1 | [CC] FAIL + [LJ] FAIL (both re | CONFLICT | both-fail | HARD BLOCK | FAIL | FAIL | REJECT | REJECT | REJECT ✓ | REJECT ✓ |
| CONF-2 | [CC] FAIL + [LJ] UNCLEAR (the  | CONFLICT | cc-fail-lj-unclear | HARD BLOCK | FAIL | FAIL | REJECT | REJECT | REJECT ✓ | REJECT ✓ |
| CONF-3 | [CC] PASS + [LJ] FAIL (semanti | CONFLICT | cc-pass-lj-fail | ADVISORY | PASS | PASS | ACCEPT | REJECT | ACCEPT ✗ | ACCEPT ✗ |

## Counts

- Total non-error cases: 3
- v2 (LJ-only) correct: 2/3 (67%)
- v3 (CC-hard-nonoverridable) correct: 2/3 (67%)
- FALSE NEGATIVES (bad accepted): v2=1, v3=1
- FALSE POSITIVES (good rejected): v2=0, v3=0

## False Negative Details (highest risk — bad intervention accepted)

### CONF-3 — [CC] PASS + [LJ] FAIL (semantic invention only)
- Leak form: cc-pass-lj-fail
- Revised: "Maya filled the coffee maker. The break room smelled of antiseptic and burnt coffee — not cardamom, never cardamom here...."
- [CC]: ADVISORY; [LJ]: io=PASS, faith=PASS, overall=ACCEPT
- v2: ACCEPT (none) — v2 policy: [LJ] said ACCEPT; [CC] ADVISORY.
- v3: ACCEPT — v3 policy: no [CC] hard block; deferring to [LJ] ACCEPT. [CC] ADVISORY.
