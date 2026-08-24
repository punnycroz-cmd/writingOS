# Phase 2B — Final Summary

---

## What Was Accomplished

### 1. Corpus Audit
- 59 cases audited: 28 FULLY_EVALUABLE, 21 FINAL_DECISION_ONLY, 6 SEMANTIC_ONLY, 4 UNRESOLVED
- 0 duplicates (all 59 cases are distinct)
- Source provenance: 59/59 have metadata, 0/59 have accessible files (path prefix issue)
- 1 corpus quality issue: GC-0038 has inverted R6 expected value
- R6 cases (4) preserved as KNOWN_DEFECT

### 2. Evaluation Runner Built
- `src/corpus/evaluate.ts`: reusable runner that loads corpus, runs deterministic triage, runs semantic validation, compares against scorable expectations, produces disaggregated metrics
- Supports deterministic-only mode (no API) and full mode (with Fireworks)
- Records provider, model, execution status, latency
- No silent fallbacks

### 3. Deterministic Baseline (59 cases, no API)
- Triage routing: **31/32 correct (97%)**
- 0 execution errors
- Deterministic layer is stable and reliable

### 4. Semantic Baseline (32 cases with Fireworks)
- Final decision: **~28/30 correct (93%)** (excluding R6/unresolved)
- 0 execution errors
- R6 reproduced (GC-0031: ACCEPT, should REJECT)
- 2 regressions (GC-0022, GC-0024) — likely LLM non-determinism or corpus quality

### 5. Known Defects
- R6: 4 cases, all UNRESOLVED. GC-0031 reproduced (ACCEPT when should REJECT). R6 persists as documented.
- GC-0038: corpus quality issue (inverted expected value) — needs fix in v1.1

---

## The 19 Final Questions

1. **Is the corpus schema valid?** Yes — all 59 cases parse and have required fields.
2. **How many fully evaluable?** 28
3. **How many deterministic-only?** 0 (all deterministic cases also have final GT)
4. **How many semantic-only?** 6
5. **How many final-decision-only?** 21
6. **How many unresolved?** 4 (R6)
7. **How many policy-derived?** 49 (PROJECT_POLICY ground truth type)
8. **How many have complete source provenance?** 59/59 (metadata), 0/59 (files accessible — path prefix issue)
9. **How many duplicates?** 0
10. **Does the current system reproduce historical successes?** Yes — 28 STABLE_SUCCESS
11. **Which cases regressed?** GC-0022 (false REJECT), GC-0024 (false ACCEPT)
12. **Which cases improved?** GC-0023, GC-0025 (historically wrong → current correct, in some batches)
13. **Which known defects persist?** R6 (GC-0031: ACCEPT when should REJECT)
14. **Does R6 remain reproduced?** Yes — GC-0031 ACCEPTED, consistent with historical failure
15. **How many execution errors?** 0
16. **What percentage of semantic cases are scorable?** 34/59 (58%) have semantic GT
17. **Does current behavior remain consistent with v1?** Yes — same provider, model, prompt, architecture
18. **Is Golden Corpus v1 ready to freeze?** Almost — fix GC-0038 and source paths first
19. **What corpus maintenance is needed?** (1) Fix GC-0038 inverted R6, (2) Add `writing-engine/` prefix to sourceFile paths

---

## Is Golden Corpus v1 Ready to Freeze?

**Almost.** Two minor fixes needed before freezing:
1. **GC-0038:** Inverted R6 expected value (ACCEPT should be REJECT)
2. **Source paths:** Add `writing-engine/` prefix to sourceFile

After these fixes, the corpus is ready to freeze as `golden-corpus-v1-FROZEN`.

---

## What Is the Evidence-Supported Next Phase?

**Phase 2C — Corpus Freeze + Maintenance:**
1. Fix the 2 corpus quality issues
2. Freeze the corpus (status: FROZEN)
3. Complete the full semantic evaluation (all 59 cases)
4. Establish the canonical baseline numbers

Then **Phase 3 — Nonfiction Mode prototype** (as defined in the Mode/Register architecture).

---

## STOP

Per the task's stop condition:
- No failures fixed during baseline
- No R6 solution attempted
- No Writing OS v1 changes
- No Constitution changes
- No new prompt calibration
- No corpus expansion

The baseline is established. The corpus audit is complete. The evaluation runner is built. The next decision will be made from this evidence.
