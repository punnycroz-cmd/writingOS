# DELIVERABLE 75 — R6 Calibrated Report

**Calibration Applied:** ONE minimal instruction — the Observation-Epipstemic Rule:
> "An observation can itself grant a character knowledge. Do not assume that sensory or perceptual framing makes a statement epistemically safe..."

No benchmark nouns (ledger, Marcus, Maya, etc.) were used in the calibration.

---

## Calibrated Results: 11/16 Correct (69%) — No Improvement

| Metric | Baseline | Calibrated | Delta |
|---|---|---|---|
| Overall correct | 11/16 (69%) | 11/16 (69%) | 0 |
| Leak detection | 5/10 | **3/10** | **-2 (worse)** |
| Harmless acceptance | 6/6 | 6/6 | 0 |
| False acceptance (leak→ACCEPT) | 5 | **7** | **+2 (worse)** |
| False rejection (harmless→REJECT) | 0 | 0 | 0 |

---

## The Calibration Backfired

The R6 calibration instruction did NOT improve leak detection. It actually made it **worse**:

- **Leak detection dropped** from 5/10 to 3/10
- **False acceptance increased** from 5 to 7
- Two cases that were correctly REJECTED in baseline became ACCEPTED in calibrated:
  - **D1-UNKNOWN**: baseline REJECT → calibrated ACCEPT (was correct, now wrong)
  - **E2**: baseline REJECT → calibrated ACCEPT (was correct, now wrong)
- One case improved: D3-KNOWS (baseline REJECT → calibrated ACCEPT — correct)

### Why It Backfired

The calibration instruction told the model: "An observation can itself grant a character knowledge." This made the model MORE permissive on observation-framed statements, not less. The model interpreted the instruction as: "observations are generally safe because they grant knowledge through perception" — the opposite of the intended effect.

The instruction also said: "if the observed action would logically establish that fact for the observer, then infoOwnership = FAIL." But the model did not reliably perform the logical inference ("would seeing Marcus hide the ledger establish that Marcus embezzled $40,000?"). The inference requires connecting "ledger" → "financial records" → "embezzlement evidence" → "protected fact" — a multi-step chain the model does not perform.

---

## Per-Case Comparison

| Case | Baseline | Calibrated | Expected | Change |
|---|---|---|---|---|
| A1-A3 | ACCEPT | ACCEPT | ACCEPT | no change ✅ |
| B1 | ACCEPT | ACCEPT | REJECT | still wrong ❌ |
| B2 | REJECT | REJECT | REJECT | no change ✅ |
| B3 | ACCEPT | ACCEPT | REJECT | still wrong ❌ |
| B4 | ACCEPT | ACCEPT | REJECT | still wrong ❌ (R6 persists) |
| C1-C2 | ACCEPT | ACCEPT | ACCEPT | no change ✅ |
| D1-UNKNOWN | REJECT | **ACCEPT** | REJECT | **regressed** ❌ |
| D2-SUSPECTS | REJECT | ACCEPT | ACCEPT | **improved** ✅ |
| D3-KNOWS | REJECT | **ACCEPT** | ACCEPT | **improved** ✅ |
| E1 | REJECT | REJECT | REJECT | no change ✅ |
| E2 | REJECT | **ACCEPT** | REJECT | **regressed** ❌ |
| E3 | REJECT | REJECT | REJECT | no change ✅ |
| F1 | ACCEPT | ACCEPT | ACCEPT | no change ✅ |

---

## Conclusion

**The calibration did not solve R6. It made leak detection worse while preserving harmless-observation acceptance.** The R6 problem is NOT a prompt-calibration problem — the instruction backfired because the model interpreted "observations can grant knowledge" as "observations are safe."

The calibrated prompt should NOT be adopted. The baseline prompt is better.

**R6 remains an unresolved semantic gap.**
