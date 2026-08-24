# DELIVERABLE 14 — Validation Layer v2

**Question.** Is the hybrid (deterministic checks + LLM judgment) more reliable than LLM judgment alone?

---

## The Hybrid Architecture (v2)

```
[CC] Deferred-anchor pre-pass ──→ can FORCE classification (DEFERRED_CONTEXT)
         │
         ▼
[LJ] Detection ──→ informed by [CC] hints (deferred, canon alerts)
         │
         ▼
[rule] Severity → Decision
         │
         ▼
[LJ] Intervention (if permitted)
         │
         ▼
[CC] Supported-specificity post-pass ──→ flags unsupported numbers/proper-nouns
         │
         ▼
[LJ] Independent Validation ──→ informed by [CC] unsupported-specificity list
         │
         ▼
ACCEPT or REJECT
```

---

## What Each Layer Caught

### The [CC] layer caught:

| Case | [CC] finding | Was it correct? | Did it change the outcome? |
|---|---|---|---|
| DF1 | DEFERRED_ANCHOR_PRESENT (exact substring) | ✅ correct | YES — forced DEFERRED_CONTEXT, overriding what [LJ] would likely have missed (v1 Case F proof) |
| DF2 | NO_DEFERRED_RELEVANCE + 2 unsupported specifics | ✅ correct on both | The unsupported-specificity list fed the validator, which REJECTed |
| CV1 | canon alert: "blind vs looked" | ✅ correct | Reinforced the [LJ] detection (which also caught it) |
| IO2 | 6 unsupported numbers (98, 6, 72, 120, 80, three) | ✅ correct (the vitals were invented) | Fed to validator, but validator marked UNCLEAR and ACCEPTED anyway |
| T1b | 2 unsupported (including "thirty") | ✅ correct | Fed to validator, which REJECTed |
| CT1 | 3 unsupported (2, 17, "Papas") | ⚠️ partial — "2" and "17" from "2:17 AM" are genuinely invented; "Papas" is a proper-noun extraction artifact (should be "Papa's") | Fed to validator, which REJECTed |

### The [LJ] validator caught:

| Case | Validator finding | Was [CC] also involved? | Would [LJ] alone have caught it? |
|---|---|---|---|
| DF2 | faithfulness FAIL (invented "burnt coffee" comparison) | Yes — [CC] flagged 2 unsupported | Probably yes (semantic judgment), but [CC] gave it a strong push |
| T1b | faithfulness FAIL ("thirty seconds") | Yes — [CC] flagged "thirty" | Probably yes |
| CT1 | faithfulness FAIL ("2:17 AM") | Yes — [CC] flagged "2", "17" | Probably yes |
| IO2 | faithfulness UNCLEAR (invented vitals) → ACCEPTED | Yes — [CC] flagged 6 unsupported | [LJ] alone would also have been UNCLEAR; the [CC] signal did not push it to FAIL |

### What [CC] caught that [LJ] would have missed:

**DF1 is the definitive case.** In v1, the [LJ] detector classified the trowel passage as CHARACTER_SPECIFIC — it missed the deferred mechanism entirely. In v2, the [CC] pre-pass found the exact anchor substring and FORCED DEFERRED_CONTEXT. This is a case where the deterministic layer caught what the [LJ] layer could not. **This is the strongest evidence for the hybrid.**

### What [LJ] caught that [CC] could not:

- **Semantic faithfulness:** "burnt coffee" (DF2) is not a number or proper noun — [CC] cannot catch it. The [LJ] validator caught it as an invented comparison.
- **Info-ownership leaks:** [CC] does not check info-ownership (it would need to understand which facts a character "knows" semantically). Only [LJ] can do this.
- **Canon contradictions (semantic):** [CC] catches only keyword-based patterns (blind/saw). Subtle canon contradictions require [LJ].

---

## Where the Hybrid Fails

### 1. [CC] false positives bias the validator toward rejection
The [CC] supported-specificity check flagged "Papas" (from "Papa's") as an unsupported proper noun in CT1. This is an extraction artifact (the apostrophe stripping produced "Papas" which doesn't match "Papa" in state). The validator, seeing the [CC] flag, may have been biased toward REJECT. This contributed to the CT1 false reject.

**Fix:** improve the proper-noun extractor (handle possessives) or have the [LJ] validator explicitly discount [CC] artifacts.

### 2. [LJ] treats UNCLEAR as pass → underblocking on "reasonable" inventions
In IO2, the [CC] correctly flagged 6 invented numbers. The [LJ] validator acknowledged them ("appear to be invented") but marked faithfulness as UNCLEAR and ACCEPTED, reasoning they are "reasonable medical details." The [CC] signal was not strong enough to push UNCLEAR → FAIL.

**Design choice:** the acceptance rule is "ACCEPT only if NO integrity dimension FAILED." UNCLEAR is not FAIL. A stricter rule ("ACCEPT only if NO integrity dimension is FAIL or UNCLEAR") would have blocked IO2 but would also block many legitimate interventions (T1a, T1c both had UNCLEAR faithfulness). This is a calibration question `[CAL]`.

### 3. [CC] cannot catch semantic inventions
"Burnt coffee" (DF2), "ledger" (T1a), "checking his watch every 47 seconds" (T1c) — these are invented specifics that are not numbers or proper nouns. [CC] catches "47" but not "ledger" or "burnt coffee." Only [LJ] can catch these, and it sometimes doesn't (T1a's "ledger" was accepted).

### 4. All-or-nothing acceptance causes overblocking
CT1: the intervention legitimately used David (HARD_CANON) but also invented "2:17 AM." The validator rejected the WHOLE intervention. A region-scoped model (accept the David sentence, reject the "2:17 AM" sentence) would reduce false rejects.

---

## Comparison: Hybrid vs LLM-Alone

| Dimension | LLM alone (v1) | Hybrid [CC]+[LJ] (v2) |
|---|---|---|
| Deferred-anchor detection | FAILED (Case F) | REPAIRED (DF1, exact match); still fails on paraphrase (DF3) |
| Invented-number detection | Caught by [LJ] validator (v1 Case A) | Caught by BOTH [CC] and [LJ]; [CC] gives earlier, cheaper signal |
| Invented-semantic detection | Caught by [LJ] (e.g., "burnt coffee") | Still requires [LJ]; [CC] cannot help |
| Canon-violation detection | Caught by [LJ] (v1 Case E) | Caught by BOTH; [CC] canon alert reinforces |
| Info-ownership enforcement | NOT TESTED in v1 | PARTIALLY TESTED (generator chose safe paths; gate not exercised under leak pressure) |
| False-positive rate | Not measured | [CC] has false positives ("Papas" artifact); may bias [LJ] toward reject |
| Overblocking | Not measured in v1 | Observed (CT1 — legitimate intervention blocked for unrelated invention) |
| Underblocking | Not measured in v1 | Observed (IO2 — "reasonable" invented vitals accepted) |

---

## Classification

**Deterministic integrity checks: DEMONSTRATED as a useful supplement, NOT a replacement for [LJ].**

- The [CC] deferred-anchor pre-pass is a strict improvement (DF1 repaired). ✅
- The [CC] supported-specificity check provides a useful early signal. ✅
- The [CC] canon-keyword alert reinforces [LJ] detection. ✅
- The [CC] has false positives (extraction artifacts) that can bias the validator. ⚠️
- The [CC] cannot catch semantic inventions. ❌ (inherent limitation)
- The hybrid is more reliable than [LJ] alone for the specific failures v1 exposed (deferred detection, number invention). ✅
- The hybrid does NOT eliminate the need for [LJ] validation. ✅ (confirmed — [LJ] still catches semantic issues [CC] cannot)

**The hybrid is the right architecture.** The [CC] layer handles what is deterministic (substring matching, number extraction, keyword alerts); the [LJ] layer handles what is semantic (faithfulness, info-ownership, voice, meaning). Neither alone is sufficient.
