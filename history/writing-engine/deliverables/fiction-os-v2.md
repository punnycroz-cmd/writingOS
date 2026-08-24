# Fiction OS v2 — Operational Architecture (updated from v1)

**What changed from v1.** Iteration 2 provided execution evidence for three additions:
1. A **deterministic [CC] layer** (deferred-anchor pre-pass, supported-specificity check, canon-keyword alert) — added before and after the [LJ] stages.
2. **Temporal state transitions** (InformationOwnership and CanonClassification evolve across scenes; transitions are logged).
3. **Richer logging** (deterministic-check results, state transitions, input-state summary, human-readable reason).

Everything else from v1 is retained. The loop is still 8 conceptual stages; the [CC] additions are pre-passes and post-passes around the existing [LJ] stages, not new stages in the decision sequence.

---

## The v2 Loop

```
0.  PRINCIPLE (loaded)
1.  [CC] PRE-PASS: deferred-anchor cross-reference + canon-keyword alert
2.  [LJ] DETECTION (informed by [CC] hints; overridden if exact anchor found)
3.  STATE LOOKUP (implicit — state passed to all stages)
4.  [rule] SEVERITY → DECISION
5.  [LJ] INTERVENTION (if permitted)
5a. [CC] POST-PASS: supported-specificity check on the intervention
6.  [LJ] INDEPENDENT VALIDATION (informed by [CC] unsupported-specificity list)
7.  LOG (full audit record including [CC] results and state transitions)
```

---

## State Model v2 (adds transitions)

```
DocumentState {
  character: CharacterState { ...same as v1... }
  informationOwnership: { entries: [{ fact, knows, suspects, misunderstands, unknown, changedAt? }] }
  canon: { facts: [{ content, classification: HARD_CANON|SOFT_CANON|HYPOTHESIS|UNKNOWN, source }] }
  deferredChecks: [{ id, type, anchorSpan, setupSummary, status, resolutionAnchor? }]
  sceneId, revisionId
}

// NEW in v2: transitions are logged alongside state, not inside it
StateTransition[] = [{
  type: 'info_ownership' | 'canon_classification',
  fact: string,
  character?: string,
  from: string,
  to: string,
  atScene: string,
  reason: string,
}]
```

**Temporal semantics (demonstrated):** the same passage produces different valid interventions depending on the character's current knowledge state (T1a unknown vs T1c knows). Transitions are manually specified in v2; automatic detection is future work.

---

## The [CC] Deterministic Layer (NEW in v2)

### Deferred-anchor cross-reference (pre-detection)
- **Exact substring match** → `DEFERRED_ANCHOR_PRESENT` → forces `DEFERRED_CONTEXT` classification (overrides [LJ]).
- **Jaccard ≥ 0.3 or 3-gram overlap** → `DEFERRED_ANCHOR_POSSIBLY_RELATED` → hints to [LJ] detector.
- **No overlap** → `NO_DEFERRED_RELEVANCE` → normal detection.
- **Limitation (demonstrated):** paraphrases with low lexical overlap are NOT caught (DF3). Semantic matching (embeddings) or an [LJ] cross-reference step is future work.

### Supported-specificity check (post-intervention, pre-validation)
- Extracts numbers (digits + spelled-out) and proper nouns (capitalized non-sentence-start words) from the revised text.
- Checks each against source passage + serialized state text.
- Flags unsupported items as candidate hallucinations.
- **Feeds** the [LJ] validator's attention; does NOT directly block (the validator makes the final call).
- **Limitation (demonstrated):** false positives from extraction artifacts (e.g., "Papas" from "Papa's"). The [LJ] can override, but the signal may bias toward rejection.

### Canon-keyword alert (pre-detection)
- For each HARD_CANON fact containing a sensory keyword (blind, deaf, paralyz...), checks if the character name appears near a contradiction verb (saw, looked, heard, walked...).
- **Feeds** the [LJ] detector as a hint. Does NOT force classification.
- A recall booster; the [LJ] detector already catches most canon violations (CV1).

---

## What v2 Execution Changed in the OS

| OS element | v1 | v2 | Evidence |
|---|---|---|---|
| Deferred detection | [LJ] only (failed Case F) | [CC] pre-pass + [LJ] (repaired DF1; paraphrase still fails DF3) | DF1, DF2, DF3 |
| Invented-specificity detection | [LJ] validator only | [CC] supported-specificity + [LJ] validator | DF2, T1b, CT1, IO2 |
| State model | Static (single scene) | Temporal (transitions logged; T1a/T1b/T1c) | T1a/T1b/T1c, CT1 |
| Logging | Detection + severity + decision + intervention + validation | + [CC] results + state transitions + reason + input-state summary | All 16 cases |
| Acceptance model | All-or-nothing | All-or-nothing (CT1 shows this is too coarse) | CT1 false reject |
| Validator UNCLEAR handling | Not specified | UNCLEAR = pass (IO2 shows leniency; calibration issue) | IO2 |

---

## What v2 Did NOT Change

- The Constitution (5 articles) — unchanged. See Deliverable 15.
- The severity model (NONE/MINOR/MATERIAL/CRITICAL, qualitative, `[CAL]`).
- The priority stack (settled v4 stack preserved).
- The 7 hard constraints on the intervention generator.
- The 9 validation dimensions.
- The independent-validation principle (generation ≠ validation).

---

## Known Limitations (from v2 execution)

1. **Paraphrased deferred anchors are not caught** (DF3). Lexical matching has a ceiling.
2. **The validator accepts "reasonable" invented specifics** (IO2 medical vitals, UNCLEAR=pass). This is a calibration choice, not a bug, but it means the faithfulness gate is lenient.
3. **All-or-nothing acceptance causes false rejects** (CT1). A region-scoped model is proposed but not implemented.
4. **The info-ownership gate was not exercised under actual leak pressure** (IO1/IO2 — generator chose safe paths). The gate exists but its catch-rate is unknown.
5. **[CC] supported-specificity has false positives** (extraction artifacts like "Papas"). These may bias the validator.
6. **No automatic state-update detection** (transitions are manually specified). An [LJ] state-update pass is future work.
7. **The diagnostic has false negatives on tell-not-show** (v1 Case D finding; not retested in v2).

---

## What Belongs in the OS vs the Constitution (confirmed by v2)

- **Constitution:** the 5 invariants (what must never happen — fabricated specifics, self-validation, canon leaks, fabricated closure, context-memory reliance).
- **OS:** the mechanisms that enforce those invariants ([CC] pre-passes, [LJ] stages, severity routing, state schema, transition logging, validation dimensions, acceptance rules).

The Constitution says "what"; the OS says "how." Iteration 2 added "how" (the [CC] layer, temporal state) without changing "what."
