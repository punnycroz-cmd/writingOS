# DELIVERABLE 26 — Provenance Normalization Report

**Question.** Did the number-word normalization, date normalization, and entity canonicalization fix the Iteration 3 false positives?

---

## The Three Normalization Improvements

### 1. Number-Word Normalization
**Implementation:** `extractNumberWords()` in `provenance.ts`. Converts sequences of number-words to numeric values using ONES (one–nineteen), TENS (twenty–ninety), and SCALES (hundred, thousand, million, billion) tables.

| Input | Output |
|---|---|
| "forty thousand" | 40000 |
| "twelve" | 12 |
| "one hundred twenty" | 120 |
| "one hundred and twenty-seven" | 127 (via "one hundred twenty" + "seven") |

**Effect on Iteration 3 SC-3A:** In Iteration 3, "forty thousand dollars" (state=KNOWS) was classified as UNKNOWN by [CC] because the digit-regex only caught digits, not spelled-out numbers. The [LJ] then overblocked on faithfulness. In Iteration 4, `extractNumberWords("forty thousand")` → 40000, which matches "$40,000" in state (after $ and comma stripping). The [CC] now correctly classifies it as CHARACTER_STATE → ADVISORY. **The SC-3A [CC] false positive is fixed.**

### 2. Date Normalization
**Implementation:** `extractDates()` in `provenance.ts`. Three patterns:
- "August 21, 2026" / "Aug 21 2026" → ISO 2026-08-21
- "21 August 2026" → ISO 2026-08-21
- "2026-08-21" → ISO 2026-08-21 (already ISO)

**Effect:** dates in different formats are now comparable. A revised text saying "March 14, 2019" and a state saying "2019-03-14" will match. This was not tested heavily in Iteration 4 (only T5-B and T10-B contain dates), but the mechanism is in place.

### 3. Entity Canonicalization
**Implementation:** `canonicalizeEntity()` in `provenance.ts`. Strips possessives: "Papa's" → "Papa".

**Effect on Iteration 2 CT1:** In Iteration 2, "Papa's" was extracted as proper noun "Papas" (apostrophe stripped), which didn't match "Papa" in state → false positive SOFT_SIGNAL. In Iteration 4, `canonicalizeEntity("Papas")` → "Papa", which matches state. **The CT1 [CC] false positive is fixed.**

### 4. Number Normalization in State Matching
**Implementation:** `normalizeNums()` strips `$` and commas from source/state text before matching, so "$40,000" matches "40000".

**Effect:** this is what makes the number-word normalization actually work — "forty thousand" → 40000 matches "$40,000" → 40000 after both are normalized.

---

## Effect on Previous False Positives

| Iteration 3 false positive | Cause | Iteration 4 fix | Fixed? |
|---|---|---|---|
| SC-3A (state=KNOWS, "forty thousand") | [CC] digit-regex missed spelled-out numbers | Number-word normalization + state-number normalization | ✅ [CC] now ADVISORY (correct) |
| CT1 ("Papas" from "Papa's") | Proper-noun extraction didn't handle possessives | Entity canonicalization strips possessives | ✅ [CC] now matches state |
| T15-A ("moved on" caught as claim) | Claim pattern "moved" matched "moved on" | Pattern refined to "moved the \w+" | ✅ No false claim |

**However:** the [LJ] validator still overblocks on T11-KNOWS-A (state=KNOWS, "Maya knew...embezzled forty thousand dollars"). The [CC] correctly says ADVISORY (the claim matches a known fact, the number is state-supported), but the [LJ] returns io=FAIL. **The [CC] fix does not propagate to the [LJ].** This is the state-reading error documented in Deliverable 24.

---

## What Is Deterministic, Heuristic, and [LJ]

| Check | Type | Notes |
|---|---|---|
| Digit extraction | Deterministic | `/\b\d+(?:\.\d+)?\b/g` |
| Number-word extraction | Deterministic | word-to-number conversion via lookup tables |
| Date extraction | Deterministic | 3 regex patterns → ISO normalization |
| Possessive stripping | Deterministic | `/'s$/i` |
| $ and comma stripping | Deterministic | `/\$\|,/g` |
| Proper-noun extraction | Heuristic | Capitalized non-sentence-start words; has false positives (common words list filters some) |
| Claim-pattern matching | Heuristic | Regex patterns for "knew that...", "had embezzled..."; misses semantic claims |
| Provenance classification (SOURCE/STATE/CANON/UNKNOWN) | Deterministic | String matching after normalization |
| Info-ownership state consultation | [LJ] | The validator must read the `knows`/`suspects`/`unknown` lists — this is where the state-reading error occurs |
| Observation vs inference vs knowledge | [LJ] | Semantic judgment; overblocks on vague language |
| Licensed invention vs unlicensed assertion | [LJ] | Semantic judgment; respects inventionPolicy but overblocks on "wondered"/"seemed" |

---

## Classification

**Provenance normalization: DEMONSTRATED as a deterministic improvement.**

- Number-word normalization fixes SC-3A at the [CC] level. ✅
- Entity canonicalization fixes CT1 at the [CC] level. ✅
- Date normalization is in place but lightly tested. ⚠️
- Number normalization ($ and comma stripping) makes the above work. ✅
- The [CC] fixes do NOT propagate to the [LJ] — the [LJ] still overblocks on state-supported claims. ❌ (the state-reading error is an [LJ] problem, not a [CC] problem)

**The deterministic layer is stronger.** The [CC] provenance classifier now correctly handles spelled-out numbers, dates, and possessive entities. The residual failures are in the [LJ] layer's state-reading and overblocking on vague language — these cannot be fixed by [CC] normalization.
