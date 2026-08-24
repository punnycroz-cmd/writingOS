# Writing OS v1 — Limitations

## 1. R6: Observation-Framed Indirect Information-Ownership Leak

**Status:** UNRESOLVED SEMANTIC LIMITATION

**Description:** When a candidate uses observation framing ("Maya saw Marcus hide the ledger under his coat") and the observed object is connected to a protected fact only through inference, the semantic validator accepts the candidate even when the character's state is UNKNOWN.

**Evidence:** R6 experiment — baseline 1/4 leak cases detected (B2 only). Calibration attempt backfired (leak detection dropped from 5/10 to 3/10). The model treats observation framing as perceptually safe.

**What does NOT work:**
- Prompt calibration (the instruction made things worse)
- Deterministic keyword rules (would overblock innocent observations like F1)
- Hardcoding benchmark nouns

**What might work (FUTURE, unvalidated):**
- A dedicated observation-implies-fact inference stage (separate LLM call asking "would this observation reveal the protected fact?")
- Enhanced state representation linking objects to protected facts
- World-knowledge connection between administrative objects and financial concepts

## 2. Paraphrase Overblocking

**Status:** UNRESOLVED

**Description:** Under SOURCE_CONSTRAINED policy, the validator rejects synonym substitutions ("hospitals" → "medical centers") as faithfulness violations, even when the meaning is preserved.

**Evidence:** 4.1 P-1, P-2 (2/5 paraphrases false-positively rejected).

**What does NOT work:** The current prompt does not have a semantic-equivalence rule. The [CC] layer cannot check semantic equivalence.

## 3. Nonfiction Register Validation

**Status:** UNTESTED

**Description:** All experiments used fiction under LICENSED_FICTION. Nonfiction registers (academic, business, legal, marketing) have only been smoke-tested (Iteration 4 nonfiction smoke test — paraphrase overblocked).

## 4. Complex Co-Reference

**Status:** UNTESTED

**Description:** Pronouns and indirect references that require resolving complex co-reference chains have not been tested.

## 5. Broader Invention-Policy Calibration

**Status:** PARTIALLY TESTED

**Description:** LICENSED_FICTION is well-validated (23/23 in 4.3B). NONE, SOURCE_CONSTRAINED, and LIMITED_INFERENCE have been partially tested (T12 policy-controlled triplets) but edge cases remain (T12-NONE-C, T12-SOURCE-B).

## 6. Production-Scale Performance

**Status:** UNTESTED

**Description:** All experiments used 7-23 cases. Latency is 5-30 seconds per LLM call. No load testing, no concurrent execution, no large-corpus evaluation.

## 7. Long-Range State Complexity

**Status:** UNTESTED BEYOND 16 SCENES

**Description:** State persistence demonstrated across 7-16 cases. Longer sequences (novel-length, 50+ scenes) untested. Context window limitations may affect state retrieval.

## 8. Conflicting State Edge Cases

**Status:** PARTIALLY TESTED

**Description:** v1.1 A10 demonstrated safe handling of IO=UNKNOWN + CS=KNOWS (DETERMINISTIC_BLOCK). But other conflict patterns (e.g., canon vs. info-ownership, entity property vs. canon) are untested.

## 9. Calibration Requiring Corpus-Based Testing

**Status:** UNCALIBRATED

**Description:** All numeric thresholds remain `[CAL]`. No golden corpus has been built. No thresholds have been empirically calibrated on a representative dataset. The severity model (NONE/MINOR/MATERIAL/CRITICAL) is qualitative, not calibrated.

## 10. Automatic State Extraction

**Status:** NOT IMPLEMENTED

**Description:** State is manually specified in test cases. The system does not automatically extract character knowledge, information ownership, or canon from prose. An [LJ] state-update pass that reads each scene and updates InformationOwnership is proposed but not built.
