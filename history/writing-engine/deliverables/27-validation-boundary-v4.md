# DELIVERABLE 27 — Validation Boundary v4

**The boundary after Iteration 4.** Not final. The experiment revealed both strengths and specific gaps.

---

## What the Boundary Now Is

```
CANDIDATE REVISION
        │
        ▼
[CC] PROVENANCE CLASSIFICATION (v4, with normalization)
  - extract: digits, number-words (→ numeric), dates (→ ISO), proper nouns (→ canonical), explicit claims
  - normalize: strip $ and commas from state; strip possessives from entities
  - classify each: SOURCE_TEXT / CHARACTER_STATE / CANON / UNKNOWN
  - severity: HARD_BLOCK (numbers/dates/claims with UNKNOWN provenance)
              SOFT_SIGNAL (proper nouns with UNKNOWN provenance)
              ADVISORY (no unsupported specifics)
        │
        ▼
[LJ] POLICY-AWARE INDEPENDENT VALIDATION
  - receives inventionPolicy (NONE / SOURCE_CONSTRAINED / LICENSED_FICTION / LIMITED_INFERENCE)
  - receives [CC] unsupported-specificity list
  - 9 dimensions: meaning, character, infoOwnership, canon, voice, register, intelligibility, deferred, faithfulness
  - policy-aware: under NONE/SOURCE, sensory invention is FAIL; under LICENSED/INFERENCE, it is PASS
  - integrity constraints hold regardless of policy: IO leaks, canon violations, unsupported numbers always FAIL
        │
        ▼
FINAL DECISION (v3 policy, unchanged)
  IF [CC] = HARD_BLOCK: REJECT (non-overridable)
  ELIF [LJ] FAIL on integrity dimension: REJECT
  ELIF [LJ] UNCLEAR on faithfulness/infoOwnership: REJECT (conservative)
  ELSE: ACCEPT
```

---

## What the Boundary Catches (DEMONSTRATED)

| Threat | Caught? | Evidence |
|---|---|---|
| Unsupported specific numbers (digits) | ✅ | FAITH-1–5, T8-B, T10-B, T15-B: all rejected |
| Unsupported specific numbers (spelled out) | ✅ | T8-B "one hundred and twenty-seven": [CC] HARD_BLOCK |
| Unsupported dates | ✅ | T5-B "1998", T10-B "4:15 AM": rejected |
| Information-ownership leaks (explicit) | ✅ | All 14 IO-A–IO-S4 from Iteration 3; T2-B, T3-B, T4-B, T5-B, T9-B in Iteration 4 |
| Information-ownership leaks (subtle framings) | ✅ | "made sense," "understood why," "guilt obvious," "could tell" — all rejected |
| Canon violations | ✅ | T13-B (blind character seeing): rejected |
| Deferred mechanism resolution | ✅ | T14-B (trowel explained): rejected |
| Future-event leaks | ✅ | T10-B, IO-E: rejected |
| Invented identity assertions | ✅ | T9-B "David Chen, accomplice": rejected |
| Causal assertions as fact | ✅ | T7-B "because Marcus diverted $40k": rejected |
| Invented memories | ✅ | T5-B "summer of 1998 when Papa discovered": rejected |
| Motive assertions as fact | ✅ | T4-B "wanted to cover embezzlement": rejected |

**0% false acceptance rate across 20 invalid interventions.** The safety boundary holds.

---

## What the Boundary Misses or Overblocks (the honest gaps)

### 1. State-reading error (OVERBLOCK + STATE-READING)
**The validator does not reliably consult the info-ownership state.** T11-KNOWS-A (state=KNOWS, "Maya knew Marcus had embezzled...") is rejected with io=FAIL despite Maya being in the `knows` list. The validator pattern-matches on "knew...embezzled" rather than reading the state.

**Fix location:** validator prompt. The prompt must explicitly instruct the validator to check the `knows`/`suspects`/`unknown` lists before returning io=FAIL. This is an [LJ] calibration issue.

### 2. Overblocking on vague/uncertain language (OVERBLOCK)
"Wondered if," "seemed," "something bothered her," "as if expecting someone" are treated as IO leaks when they should be licensed inference. T3-C, T6-C, T7-A, T7-C, T11-UNKNOWN-B, T11-SUSPECTS-B.

**Fix location:** validator prompt. The prompt must distinguish "vague unease/wondering" (licensed) from "suspicion of a specific fact" (needs state=SUSPECTS). This is an [LJ] calibration issue.

### 3. UNCLEAR never produced (AMBIGUITY ERROR)
The validator forces binary PASS/FAIL on genuinely ambiguous cases. It never returns UNCLEAR on integrity dimensions.

**Fix location:** validator prompt. The prompt must explicitly permit UNCLEAR when the observation/inference boundary is genuinely unclear. This is an [LJ] calibration issue.

### 4. Semantic invention disguised as observation (UNDERBLOCK — from Iteration 3)
CONF-3 ("burnt coffee" smell) was accepted in Iteration 3. Not directly retested in Iteration 4, but T1-B (similar pattern: "burnt coffee and bleach" + IO leak) was correctly rejected because the IO leak dominated. The pure semantic-invention gap (no IO leak, just invented smell) remains untested in Iteration 4.

**Fix location:** [LJ] prompt or future [CC] semantic-similarity check.

---

## The Boundary's Discrimination Ability

| Discrimination | Tested | Success |
|---|---|---|
| Licensed sensory invention vs unlicensed assertion | T1, T12 | ✅ (100%) |
| Observable behavior vs unobservable hidden action | T2 | ✅ (100%) |
| Hedged inference vs certainty | T3, T7 | ⚠️ (33–67%) |
| State-supported vs state-unsupported knowledge | T11 | ❌ (56% — state-reading error) |
| Policy-licensed vs policy-unlicensed invention | T12 | ✅ (100%) |
| Canon-consistent vs canon-violating | T13 | ✅ (100%) |
| Deferred-reference vs deferred-resolution | T14 | ✅ (100%) |
| Vague reference vs specific invention | T8, T10, T15 | ✅ (100%) |

**The boundary discriminates well on most axes.** The weak axis is the observation/inference/knowledge distinction — specifically, the validator does not consult state when judging knowledge claims, and it overblocks on vague/uncertain language.

---

## What v4 Does NOT Claim

- Not "calibrated" — no thresholds have been empirically tuned on a golden corpus.
- Not "final" — the state-reading error and overblocking are unresolved.
- Not "generalized" — tested only on fiction Character Specificity (plus the small nonfiction smoke test in Deliverable 29).
- Not "complete" — the semantic-invention gap (CONF-3) is untested in v4.

---

## Classification

**Validation boundary v4: PARTIALLY DEMONSTRATED.**

- The safety boundary (0% false acceptance) holds across 60 cases. ✅
- The policy discrimination works (T12). ✅
- The [CC] provenance normalization fixes prior false positives. ✅
- The boundary discriminates licensed invention from unlicensed assertion on most semantic classes. ✅
- The state-reading error (T11-KNOWS-A) is a real gap. ❌
- The overblocking on vague language (15% false rejection rate) is a real gap. ❌
- The UNCLEAR state is not used. ❌

**The boundary is real but imperfect.** It prevents every unsafe acceptance in the tested set, but it rejects some legitimate interventions. The next step is [LJ] prompt calibration to fix the state-reading and overblocking, not architectural change.
