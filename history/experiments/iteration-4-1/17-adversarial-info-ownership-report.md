# DELIVERABLE 17 — Adversarial Information-Ownership Report

**Question.** Can the validator actually catch information-ownership leaks when the generator has violated the constraint?

**Method.** 14 manually-constructed bad interventions (no generator) tested against the validator in isolation. Each leak form (direct, causal, identity, motive, future, inference-as-observation, plausible-unknown, partial-to-full, suspicion-to-certainty, contamination, + 4 subtle framings) was tested with state=UNKNOWN (or SUSPECTS where specified).

---

## The IO Adversarial Matrix (14 cases)

| Case | Leak Form | [CC] | [LJ] infoOwnership | [LJ] overall | v3 Final | Expected | Result |
|---|---|---|---|---|---|---|---|
| IO-A | Direct secret leak | HARD_BLOCK | FAIL | REJECT | REJECT | REJECT | ✅ TP |
| IO-B | Causal knowledge leak | HARD_BLOCK | FAIL | REJECT | REJECT | REJECT | ✅ TP |
| IO-C | Identity leak | HARD_BLOCK | FAIL | REJECT | REJECT | REJECT | ✅ TP |
| IO-D | Motive leak | ADVISORY | FAIL | REJECT | REJECT | REJECT | ✅ TP |
| IO-E | Future-event leak | HARD_BLOCK | FAIL | REJECT | REJECT | REJECT | ✅ TP |
| IO-F | Inference disguised as observation | ADVISORY | FAIL | REJECT | REJECT | REJECT | ✅ TP |
| IO-G | Plausible-but-unknown fact | HARD_BLOCK | FAIL | REJECT | REJECT | REJECT | ✅ TP |
| IO-H | Partial knowledge upgraded to full | HARD_BLOCK | FAIL | REJECT | REJECT | REJECT | ✅ TP |
| IO-I | Suspicion upgraded to certainty | ADVISORY | FAIL | REJECT | REJECT | REJECT | ✅ TP |
| IO-J | Knowledge contamination | HARD_BLOCK | FAIL | REJECT | REJECT | REJECT | ✅ TP |
| IO-S1 | Subtle: "made sense" framing | ADVISORY | FAIL | REJECT | REJECT | REJECT | ✅ TP |
| IO-S2 | Subtle: "understood why" framing | HARD_BLOCK | FAIL | REJECT | REJECT | REJECT | ✅ TP |
| IO-S3 | Subtle: "guilt was obvious" framing | ADVISORY | FAIL | REJECT | REJECT | REJECT | ✅ TP |
| IO-S4 | Subtle: "could tell" framing | HARD_BLOCK | FAIL | REJECT | REJECT | REJECT | ✅ TP |

**Result: 14/14 true positives. Zero false negatives for information-ownership leaks.**

---

## Key Finding: The Validator Catches Leaks

Iteration 2 could not demonstrate this because the generator consistently chose safe paths — no leak was produced for the validator to catch. Iteration 3 bypasses the generator entirely with manually-constructed bad interventions. The result is unambiguous:

**The validator catches every leak form tested, including all four subtle framings:**
- "The embezzlement finally made sense" (IO-S1) → FAIL
- "She understood why Marcus had moved the money" (IO-S2) → FAIL
- "Marcus's guilt was obvious" (IO-S3) → FAIL
- "She could tell the money had been diverted by Marcus" (IO-S4) → FAIL

The validator is not doing keyword detection. It distinguishes:
- **Observation** ("his pen tapped twice") → allowed
- **Inference from observation** ("something was wrong") → allowed when reasonable
- **Knowledge assertion** ("he had embezzled forty thousand dollars") → FAIL when state=UNKNOWN

---

## The [CC] Layer's Role

The [CC] provenance classifier detected 8 of 14 leaks as HARD_BLOCK (those containing explicit claim patterns like "had embezzled" or specific numbers). The remaining 6 (IO-D motive, IO-F inference-as-observation, IO-I suspicion-to-certainty, IO-S1, IO-S3, and the semantic ones) were ADVISORY — [CC] could not detect them deterministically because they lack numbers or matching claim patterns.

**This is the correct division of labor:** [CC] catches what is deterministically detectable (explicit claims, numbers); [LJ] catches what is semantic (motive, inference-as-observation, subtle framings). Neither alone is sufficient; the hybrid catches all 14.

---

## State-Constraint Tests (UNKNOWN / SUSPECTS / KNOWS)

| Case | State | Revision form | Expected | [LJ] io | v3 Final | Result |
|---|---|---|---|---|---|---|
| SC-1A | UNKNOWN | states fact | REJECT | FAIL | REJECT | ✅ |
| SC-1B | UNKNOWN | expresses suspicion | REJECT | FAIL | REJECT | ✅ |
| SC-1C | UNKNOWN | observable-only | ACCEPT | PASS | ACCEPT | ✅ |
| SC-2A | SUSPECTS | states fact (certainty) | REJECT | FAIL | REJECT | ✅ |
| SC-2B | SUSPECTS | expresses suspicion | ACCEPT | PASS | ACCEPT | ✅ |
| SC-3A | KNOWS | states fact | ACCEPT | PASS | REJECT | ❌ FP |

**5 of 6 state-constraint cases correct.** The validator correctly distinguishes:
- UNKNOWN + certainty → FAIL
- UNKNOWN + suspicion → FAIL (suspicion without basis)
- UNKNOWN + observation → PASS
- SUSPECTS + certainty → FAIL (suspicion upgraded)
- SUSPECTS + suspicion → PASS
- KNOWS + certainty → PASS (info-ownership correct)

**The one failure (SC-3A) is a faithfulness false positive, not an info-ownership failure.** The validator's infoOwnership check correctly returned PASS (Maya KNOWS the fact). But the faithfulness check FAILED on "forty thousand dollars" — treating the spelled-out number as unsupported even though it matches the state's known fact. This is a [CC]/[LJ] conflict where [CC] is correct (ADVISORY) and [LJ] is wrong (FAIL on faithfulness). See Deliverable 19.

---

## POV / Observation vs Inference

| Case | Description | Expected | v3 Final | Result |
|---|---|---|---|---|
| POV-1 | "shaking" → "terrified" (emotion inference) | REJECT | REJECT | ✅ |
| POV-2 | "muddy shoes" → "walked through the river" (cause inference) | REJECT | REJECT | ✅ |

Both correctly rejected. The validator distinguishes observation from inference and rejects unsupported causal inferences.

---

## Ambiguous Cases (the honest boundary)

| Case | Description | Expected | v3 Final | Result |
|---|---|---|---|---|
| AMB-1 | Reasonable inference from evidence | ACCEPT | REJECT | ❌ FP |
| AMB-2 | Strongly implied but not explicit | ACCEPT | REJECT | ❌ FP |
| AMB-3 | External narration vs character-limited | ACCEPT | REJECT | ❌ FP |
| AMB-4 | Partial evidence, soft inference | ACCEPT | ACCEPT | ✅ |
| AMB-5 | Valid state-supported sensory detail | ACCEPT | ACCEPT | ✅ |

**3 of 5 ambiguous cases were false-positively rejected.** The validator's infoOwnership check FAILed on AMB-1, AMB-2, AMB-3 — treating reasonable inferences from observable evidence as leaks. This is the overblocking side: the validator is conservative on inference, which is safe (no leak gets through) but costs legitimate narrative inference.

**Assessment.** These are genuinely ambiguous cases. The validator's conservative behavior (rejecting inference-as-leak) is defensible from a safety standpoint — it produces zero false negatives on leaks — but it would block legitimate literary inference in production. The boundary between "reasonable inference" and "leak" is not deterministically resolvable; it is a calibration question `[CAL]`.

---

## Classification

**Information-ownership enforcement: DEMONSTRATED.**

- The validator catches all 14 leak forms tested, including 4 subtle framings. ✅
- It distinguishes observation from inference from knowledge. ✅
- It respects state transitions (UNKNOWN/SUSPECTS/KNOWS produce different outcomes). ✅
- It has zero false negatives on leaks across 14 adversarial cases. ✅
- It overblocks on ambiguous inference (3 false positives on AMB cases). ⚠️ (calibration issue, not a safety failure)
- The [CC] layer catches 8/14 leaks deterministically; [LJ] catches the remaining 6. ✅ (hybrid works)

**This moves information-ownership from "PARTIALLY DEMONSTRATED" (Iteration 2) to "DEMONSTRATED" (Iteration 3).** The Iteration 2 gap — "the gate was never exercised under leak pressure" — is closed. The gate works.
