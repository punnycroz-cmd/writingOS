# Iteration 2 — Final Deliverable Summary

---

## Component Status Table

| Component | Current status | Evidence |
|---|---|---|
| Faithfulness | **PARTIALLY DEMONSTRATED** | v1 Case A + v2 DF2/T1b/CT1: obvious invented specifics blocked. v2 IO2: "reasonable" invented vitals accepted (validator UNCLEAR=pass). The gate works for obvious inventions; leaks for plausible ones. |
| Independent validation | **DEMONSTRATED** | 3 cases (DF2, T1b, CT1) where generator believed its output valid and validator blocked. 1 case (IO2) where validator was lenient — showing validation is necessary but calibration matters. |
| Canon integrity | **DEMONSTRATED** | v1 Case E + v2 CV1: CANON_VIOLATION → CRITICAL → REJECT_AND_FLAG. [CC] canon alert reinforces. |
| Information ownership | **PARTIALLY DEMONSTRATED** | State model correct (unknown/suspects/knows); generator respected it in IO1/IO2 (no leaks); temporal evolution logged (T1a/T1b/T1c). BUT: the validator gate was never exercised under actual leak pressure — generator chose safe paths. Catch-rate unknown. |
| Deferred checks | **PARTIALLY DEMONSTRATED** | DF1: exact anchor detection REPAIRED (v1 failure fixed). DF2: no-relevance correct. DF3: paraphrase NOT caught (lexical matching ceiling). |
| Character specificity | **PARTIALLY DEMONSTRATED** | 16 cases run. Detection correct on 14, lenient on 1 (v1 Case D — not retested), wrong on 1 (DF3 paraphrase). Positive-path interventions accepted (P1, P2, SS1, OB1, T1a, T1c). Not calibrated. |
| State persistence | **DEMONSTRATED** | T1a/T1b/T1c: same passage, different valid outcomes across state transitions. Transitions logged with full auditability. CT1: canon transition (HYPOTHESIS→HARD_CANON) logged. |
| Positive intervention | **DEMONSTRATED** | 6 accepted interventions (P1, P2, SS1, OB1, T1a, T1c) with state-supported specifics. SS1 and OB1 had 0 unsupported items. |
| Intentional genericity | **DEMONSTRATED** | IG1: INTENTIONALLY_GENERIC → ACCEPT_UNCHANGED. No false positive. |
| Severity | **NOT CALIBRATED** | Qualitative NONE/MINOR/MATERIAL/CRITICAL routing worked on 16 cases. No numeric thresholds. All `[CAL]`. MINOR was never triggered. |
| Deterministic integrity checks | **DEMONSTRATED as supplement** | [CC] deferred pre-pass repaired DF1. [CC] supported-specificity caught invented numbers. [CC] canon alert reinforced. False positives exist (extraction artifacts). Cannot catch semantic inventions. Hybrid > LLM-alone for v1's specific failures. |
| Fiction OS | **PARTIALLY DEMONSTRATED** | The v2 OS (loop + [CC] layer + temporal state + logging) ran end-to-end on 16 cases. 1 diagnostic (Character Specificity) validated. Other fiction diagnostics (tension, voice, POV) not built. |
| Constitution | **STABLE (5 articles)** | No promotions, no demotions from v1. All 5 articles retained load-bearing status. Article III (info-ownership half) is the weakest — empirically untested under leak pressure. |
| General-purpose core hypothesis | **NOT TESTED** | Single-register (fiction) only. The hypothesis that the core generalizes to other registers remains untested. No nonfiction loop executed. |

---

## The Five Questions

### 1. What now definitely works?

- **The positive path.** The system can generate and accept character-specific interventions that improve specificity without inventing facts, when the state supplies concrete usable specifics. (P1, P2, SS1, OB1, T1a, T1c — 6 accepted.)
- **The negative path (blocking).** The independent validator blocks interventions containing invented specifics (numbers, times) that the generator believed were valid. (DF2, T1b, CT1 — 3 blocked.)
- **Canon-violation routing.** A blind character "seeing" is detected, routed to CRITICAL, and flagged — not "fixed" by adding more visual detail. (CV1.)
- **Deferred-anchor detection (exact match).** The [CC] pre-pass finds exact anchor substrings and forces deferral, repairing the v1 Case F failure. (DF1.)
- **Intentional-genericity preservation.** Purposeful genericity (depersonalization) is recognized and not rewritten. (IG1.)
- **Temporal state.** The same passage produces different valid interventions depending on the character's accumulated knowledge. Transitions are logged and auditable. (T1a vs T1c.)
- **The hybrid [CC]+[LJ] architecture.** Deterministic checks catch what LLMs miss (exact deferred anchors, invented numbers); LLMs catch what deterministic checks cannot (semantic faithfulness, info-ownership). Neither alone is sufficient.
- **Rich state as hallucination defense.** When state provides concrete specifics (four IV drips, cardamom smell), the generator uses them instead of inventing. v1's Case A failed because state was abstract; v2's rich state succeeded.

### 2. What still fails?

- **Paraphrased deferred anchors are not caught.** The [CC] lexical matching has a ceiling; "trowel" ≠ "small spade." (DF3.)
- **The validator accepts "reasonable" invented specifics.** Medical vitals (98.6, 120/80) are flagged by [CC] but accepted by [LJ] as UNCLEAR=pass. The faithfulness gate is lenient on plausible inventions. (IO2.)
- **All-or-nothing acceptance causes false rejects.** One invented detail ("2:17 AM") dooms an otherwise-legitimate intervention (David is HARD_CANON). (CT1.)
- **The info-ownership gate is untested under leak pressure.** The generator consistently chose observable-only paths. No leak was produced for the validator to catch. The gate's catch-rate is unknown.
- **[CC] false positives bias the validator.** Extraction artifacts ("Papas" from "Papa's") are flagged as unsupported and may push the validator toward reject. (CT1.)
- **Tell-not-show false negatives.** The detector is lenient on character-consistent telling that isn't perception-specific. (v1 Case D; not retested.)

### 3. What did Iteration 2 discover that Iteration 1 could not?

- **The positive path works.** Iteration 1 never accepted an intervention. Iteration 2 accepted 6, proving the system is not merely a safety filter.
- **Rich state reduces hallucination.** Iteration 1's Case A failed because state was abstract. Iteration 2's rich state (concrete countable objects, named smells) let the generator be specific without inventing.
- **The [CC] deferred pre-pass repairs the v1 Case F failure.** Deterministic anchor cross-reference forces deferral where [LJ] alone missed it.
- **The validator's UNCLEAR=pass rule causes underblocking.** Iteration 1 only showed overblocking protection. Iteration 2 revealed the other side: the validator is lenient on "reasonable" inventions.
- **All-or-nothing acceptance is too coarse.** CT1 showed that a legitimate intervention can be blocked for one unrelated invented detail. Region-scoped intervention is needed.
- **Temporal state works end-to-end.** Iteration 1 used static state. Iteration 2 demonstrated that state transitions (unknown→suspects→knows) produce different valid outcomes on the same passage.
- **The [CC] supported-specificity check has false positives.** Extraction artifacts can bias the validator. This is a cost of the hybrid that Iteration 1 could not reveal.

### 4. Which components are still only hypotheses?

- **Info-ownership enforcement under leak pressure.** The gate exists and is structurally sound, but no execution has produced a leak for it to catch. Its catch-rate is a hypothesis, not a demonstrated fact.
- **General-purpose core.** The hypothesis that the Constitution + loop skeleton + [CC]/[LJ] staging generalizes beyond fiction to nonfiction registers. Not tested — no nonfiction loop executed.
- **The severity model's MINOR level.** Never triggered in 16 cases. Its operational consequence (OPTIONAL_POLISH) is unvalidated.
- **Automatic state-update detection.** The system logs manually-specified transitions but cannot detect them from scene text. An [LJ] state-update pass is hypothesized but not built.
- **Paraphrase detection via semantic similarity.** The [CC] lexical matching fails on paraphrases. An embedding-based or [LJ] cross-reference approach is hypothesized but not built.
- **Region-scoped intervention.** Proposed to solve the all-or-nothing overblocking (CT1). Not implemented.
- **Calibration of any threshold.** All numeric and qualitative boundaries remain `[CAL]`. None have been empirically calibrated on a golden corpus.

### 5. What is the smallest next experiment required?

**A direct info-ownership validator test.** Feed the validator a set of known-bad interventions (revisions that explicitly leak a fact the character does not know) and verify it returns `infoOwnership: FAIL` and `overall: REJECT`. This is the single highest-value next experiment because:

- It tests the only component that is structurally present but empirically untested under adversarial pressure.
- It is cheap (no generation step — just the validator on pre-built bad interventions).
- It would move info-ownership from PARTIALLY DEMONSTRATED to DEMONSTRATED (if the validator catches the leaks) or expose a structural gap (if it doesn't).
- It directly addresses the task's core safety requirement: "the engine must distinguish observable evidence from unknown causal explanation."

**Secondary next experiment:** a region-scoped intervention prototype, where the validator evaluates per-sentence rather than per-passage, to address the CT1 false-reject. This would test whether the all-or-nothing model can be refined without losing safety.

**Tertiary:** a nonfiction loop (SourceFactLedger + strict faithfulness gate) to begin testing the general-purpose core hypothesis. But this is larger and should follow the two above.

---

## Closing

Iteration 2 turned the first promising prototype into a more discriminating experiment. The system now demonstrates a positive path (it can produce good interventions, not just reject bad ones), a repaired deferred-check mechanism, temporal state persistence, and a hybrid [CC]+[LJ] validation layer. The failures it revealed (paraphrase detection ceiling, validator leniency on "reasonable" inventions, all-or-nothing overblocking, untested info-ownership gate) are specific, actionable, and honest. The Constitution is stable at 5 articles. The OS grew where execution justified it and did not grow where execution did not.

The smallest real system that survives execution is now: **5 Constitution articles + an 8-stage loop with [CC] pre/post-passes + 4 state objects with logged transitions + independent validation + qualitative severity.** Everything beyond that is proposed, hypothesized, or awaiting the next experiment.
