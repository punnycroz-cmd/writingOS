# DELIVERABLE 7 — CALIBRATION_REGISTRY_V0

**This registry records candidate metrics and thresholds.** Every entry is marked with its calibration status. **No entry has been calibrated.** No `[CAL]` value has been converted to a production threshold. This is a registry of candidates only, per Rule 0.2 (do not confuse "proposed" with "calibrated") and Rule 0.3 (no invented facts — including no invented thresholds).

---

## Calibration Status Labels

| Label | Meaning |
|---|---|
| **research-supported** | The metric/threshold has peer-reviewed or authoritative backing for *what it measures*, but not for a specific numeric value in this engine's registers |
| **candidate** | A plausible metric/threshold proposed for this engine; not yet empirically tested |
| **local-calibration-required** | The value must be derived from this engine's golden corpus; no default is proposed |
| **validated** | The value has been empirically confirmed on this engine's corpus (NONE YET) |
| **rejected** | The metric/threshold was tested and failed (NONE YET) |

---

## Registry

### Character Specificity Diagnostic (the executed loop)

| Metric | Type | Status | Value | Notes |
|---|---|---|---|---|
| Detection classification accuracy | [LJ] | candidate | — | 6 cases run; 4 correct, 1 lenient (Case D), 1 failed (Case F). No threshold; qualitative. Needs a larger corpus to characterize precision/recall. |
| Severity mapping (NONE/MINOR/MATERIAL/CRITICAL) | rule-based | candidate | (see Deliverable 4 table) | Qualitative, no numeric threshold. Validated on 6 cases. Not yet stress-tested on edge cases. |
| `narrativelyPurposeful` flag accuracy | [LJ] | candidate | — | Correctly true for Case C; not exercised as false elsewhere. Needs adversarial cases. |
| Canon-conflict detection recall | [LJ] | candidate | — | Correctly detected Case E. Unknown recall on subtle/indirect conflicts. |

### Intervention Generation

| Metric | Type | Status | Value | Notes |
|---|---|---|---|---|
| Faithfulness violation rate (invented specifics) | [LJ] | candidate | — | Observed: 1/1 attempted interventions invented specifics (Case A). Sample too small to characterize. **This is the key risk.** |
| Constraint-compliance self-report accuracy | [LJ] | candidate | — | Case A: generator claimed all 7 constraints "applied" but violated #3. Self-report is unreliable. |
| Intervention-type selection appropriateness | [LJ] | candidate | — | Case A used perception_detail, attention_detail, sensory_detail, internal_thought — appropriate types, but the content violated faithfulness. Type selection is not the problem; content generation is. |

### Independent Validation

| Metric | Type | Status | Value | Notes |
|---|---|---|---|---|
| Validator faithfulness-catch rate | [LJ] | candidate | — | Observed: 1/1 caught (Case A). Needs stress-testing with subtler hallucinations (e.g., a plausible-but-invented name vs. an obvious one). |
| Validator false-reject rate | [LJ] | candidate | — | Not observed in 6 cases (only 1 intervention generated). Needs cases where a valid intervention is generated. |
| Dimension agreement (9 dimensions) | [LJ] | candidate | — | Case A: 8 PASS, 1 FAIL (faithfulness). Overall REJECT (correct). Needs cases where non-integrity dimensions FAIL to test the "integrity-only rejection" rule. |

### Computed Diagnostics (from the research — NOT yet implemented in this loop)

These are carried forward from the research deliverable as candidates. **None are implemented in the fiction loop.** They remain `[CAL]` per the research's discipline. Listed here for continuity; not part of V0 validation.

| Metric | Type | Status | Proposed for | Notes |
|---|---|---|---|---|
| MTLD (lexical diversity) | [CC] | research-supported, candidate | AI-pattern (advisory) | Length-robust per McCarthy 2010 (verified); factor .720 is convention **[CAL]**; per-register baseline **[CAL]**; flag threshold **[CAL]** |
| HD-D (lexical diversity) | [CC] | research-supported, candidate | AI-pattern (advisory) | Less length-robust than MTLD per source (verification found research slightly overstated HD-D's length-independence); draw size 42 is convention **[CAL]** |
| Sentence-length SD / CV (burstiness) | [CC] | candidate | AI-pattern (advisory) | Not a validated AI-detector; advisory only (Constitution C-4/OS); per-register baseline **[CAL]** |
| Passive-voice frequency | [CC] | research-supported (detection method), candidate (threshold) | Business/Academic/Legal packs | Detection via dependency parse (PassivePy, DOI 10.1002/jcpy.1377 — verified); per-register baseline **[CAL]** |
| N-gram repetition (content + opener) | [CC] | candidate | AI-pattern (advisory) | n value **[CAL]**; flag threshold **[CAL]**; defined-term allowlist per document |
| Readability (Flesch-Kincaid + SMOG, ≥2 formulas) | [CC] | research-supported (as triage), candidate (threshold) | Business/Legal (not fiction) | Triage only (Constitution OS); never a target; concern band **[CAL]**; academic/technical suppressed |
| Function-word frequency vector | [CC] | research-supported (for register/voice), candidate | Register detection, voice profiling | Feature inventory **[CAL]**; voice-profile baseline per user/brand **[CAL]** |

### Validation Subsystem (from the research — NOT yet built)

| Metric | Type | Status | Notes |
|---|---|---|---|
| Krippendorff's α target | [CC] | research-supported (method), candidate (target) | Method is settled; the α target for this engine's rubric **[CAL]** (research notes .80 convention; local validation required) |
| Golden corpus size (texts × raters) | — | candidate | Power analysis required; not yet performed **[CAL]** |
| LLM-as-judge human-agreement threshold | [LJ] | candidate | Per-dimension; **[CAL]**; voice/ESL/creative dimensions disallowed as primary signal |
| Regression holdout pass criterion | [CC] | candidate | "No statistically significant decline" — significance threshold **[CAL]** |
| Drift-alert bound | [CC] | candidate | **[CAL]** |

---

## What This Registry Does NOT Contain

- **No production thresholds.** Every numeric value is either a documented convention (flagged as such) or absent.
- **No calibrated values.** No entry is marked `validated`. The `validated` status exists in the schema but is unused.
- **No golden corpus.** The corpus has not been built. Per the task instruction (Section 15), the corpus schema will be designed around the distinctions the loop actually needs (discovered in execution: show-vs-tell, deferred-mechanism, info-ownership-leak, canon-violation), not guessed in advance.

---

## Calibration Plan (next steps, not yet executed)

1. **Characterize the diagnostic's precision/recall** on a larger case set (~20–30 cases) covering: generic, specific, intentionally-generic, canon-violation, deferred, info-ownership-constrained, tell-not-show.
2. **Characterize the generator's faithfulness-violation rate** on ~20 generic passages with state. If the rate is high (Case A suggests it may be), the intervention generator needs a hard [CC] entity/number-extraction pre-pass that blocks invention, not just a prompt constraint.
3. **Characterize the validator's catch-rate** on subtle vs. obvious hallucinations.
4. **Build the smallest useful golden corpus** around the discovered distinctions (Section 15 compliance).
5. **Only after steps 1–4:** set local thresholds, mark them `validated`, and move them out of `[CAL]`.
