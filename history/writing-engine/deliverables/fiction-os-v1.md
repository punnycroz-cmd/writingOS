# FICTION_OS_V1 — The Operational Architecture (Fiction Pack)

**This is the operational specification of the Fiction Pack, as validated by the Character Specificity loop.** It contains the decision loops, state model, diagnostics, severity, intervention policies, validation, logging, and calibration — everything the Constitution authorizes but does not itself contain.

The Constitution (5 articles) is loaded every inference call. The Fiction OS is loaded when the active register is fiction. The Compendium (research evidence) is never loaded by default.

---

## 1. Scope

The Fiction OS V1 covers **one diagnostic**: Character Specificity (Bible Part III, L4). Other fiction diagnostics (tension-change, voice-consistency, POV-consistency, scene-sequel structure) are proposed for future loops but are NOT part of V1. V1 is the smallest fiction OS that survives execution.

---

## 2. State Model (validated — see Deliverable 6)

```
DocumentState {
  character: CharacterState {
    identity, goals, fears, beliefs, memories,
    emotionalState, perceptualHabits, voice, currentKnowledge
  }
  informationOwnership: { entries: [{ fact, knows, suspects, misunderstands, unknown, changedAt? }] }
  canon: { facts: [{ content, classification: HARD_CANON|SOFT_CANON|HYPOTHESIS|UNKNOWN, source }] }
  deferredChecks: [{ id, type, anchorSpan, setupSummary, status: DEFERRED|PASS|FAIL, resolutionAnchor? }]
  sceneId, revisionId
}
```

**All four objects are required.** Execution proved each is read by at least one loop stage.

---

## 3. The Decision Loop (8 stages — see Deliverable 4)

```
0. PRINCIPLE (loaded)     — Character-consciousness principle (Bible Part III L1)
1. DETECTION [LJ]         — classify: GENERIC | CHARACTER_SPECIFIC | INTENTIONALLY_GENERIC | CANON_VIOLATION | DEFERRED_CONTEXT
   1a. [CC] DEFERRED PRE-PASS (PROPOSED — not in V1; discovered fix for Case F)
2. STATE LOOKUP           — implicit (state passed to all stages)
3. SEVERITY [rule-based]  — NONE | MINOR | MATERIAL | CRITICAL
4. DECISION [rule-based]  — ACCEPT_UNCHANGED | DEFER | OPTIONAL_POLISH | TARGETED_REWRITE | REJECT_AND_FLAG
5. INTERVENTION [LJ]      — constrained generation (only if decision permits)
   5a. [CC] ENTITY/NUMBER CHECK (PROPOSED — not in V1; discovered defense for Case A)
6. VALIDATION [LJ]        — independent, 9 dimensions, integrity-gate
7. LOG                    — full audit record
```

### Stage 1a — [CC] Deferred Pre-Pass (PROPOSED, discovered during execution)
**Trigger:** Case F failure (deferred mechanism not detected by [LJ] alone).
**Mechanism:** Before [LJ] detection, for each DEFERRED_CHECK, check whether any substring of the passage overlaps the check's `anchorSpan`. If yes, force classification DEFERRED_CONTEXT.
**Status:** Not yet implemented or re-executed. Recorded as a discovered requirement.

### Stage 5a — [CC] Entity/Number Check (PROPOSED, discovered during execution)
**Trigger:** Case A failure (generator invented "127 tiles, 4:15am, 13 pills").
**Mechanism:** After intervention generation, extract all numeric expressions and named entities from the revised text. Compare against source passage + state. Flag any number/entity not present in either as a candidate faithfulness violation. If flagged, either block before [LJ] validation or append to the validator's attention.
**Status:** Not yet implemented. Would be a cheaper first-line defense than the full [LJ] validator. Recorded as a discovered requirement.

---

## 4. Severity Model (qualitative, no thresholds)

| Detection | Canon conflicts? | Narratively purposeful? | Severity | Permitted intervention |
|---|---|---|---|---|
| CANON_VIOLATION | (any) | — | CRITICAL | none → REJECT_AND_FLAG |
| (any) | yes | — | CRITICAL | none → REJECT_AND_FLAG |
| CHARACTER_SPECIFIC | no | — | NONE | none → ACCEPT_UNCHANGED |
| INTENTIONALLY_GENERIC | no | yes | NONE | none → ACCEPT_UNCHANGED |
| DEFERRED_CONTEXT | no | — | NONE | none → DEFER |
| GENERIC | no | yes | MINOR | OPTIONAL_POLISH (lexical_substitution, rhythm) |
| GENERIC | no | no | MATERIAL | TARGETED_REWRITE (perception, attention, thought, sensory, memory, metaphor, rhythm) |

**No numeric thresholds.** The model is qualitative and rule-based. This is deliberate: execution showed qualitative routing is sufficient, and numeric thresholds would require calibration data that does not yet exist.

---

## 5. Intervention Constraints (the 7 hard constraints)

1. Use ONLY information the character possesses (per Information Ownership `unknown` list).
2. Do NOT contradict Canon State (HARD_CANON, SOFT_CANON).
3. Do NOT invent facts (dates, names, statistics, quantities) not in source or state.
4. Do NOT resolve or explain any DEFERRED check.
5. Preserve scene function and intended meaning.
6. Preserve the character's established voice.
7. Do NOT add perception via a sense the character lacks (canon-dependent).

**Execution finding:** Constraint #3 is violated by the generator under specificity pressure (Case A). Constraints are necessary but not sufficient. **Independent validation (Stage 6) is the actual enforcement.**

---

## 6. Independent Validation (9 dimensions)

| Dimension | Check | Integrity dimension? (FAIL → reject) |
|---|---|---|
| meaning | Did intended meaning survive? | no |
| character | More specific without inconsistency? | no |
| infoOwnership | Character used only info they possess? | **yes** |
| canon | Contradicts HARD/SOFT CANON? | **yes** |
| voice | Preserves established voice? | no |
| register | Appropriate for literary fiction? | no |
| intelligibility | Harmed clarity? | no |
| deferred | Resolved a DEFERRED check? | **yes** |
| faithfulness | Invented facts not in source/state? | **yes** |

**Acceptance rule:** ACCEPT only if NO integrity dimension FAILED.

---

## 7. Logging (the auditable record)

Every run produces a `LogEntry`:
```
{ timestamp, caseId, sceneId, revisionId, originalPassage,
  diagnostic, detection, severity, decision,
  intervention (or null), validation (or null),
  accepted, finalText, remainingDeferred, stateDiscovered }
```

The log answers: What changed? Why? What state was relied on? What rules allowed it? What checks ran? Why accepted/rejected?

**Execution evidence:** All 6 case logs are in `/home/z/my-project/writing-engine/logs/`.

---

## 8. Psychological Causality (operationalized)

The intervention generator is prompted with the causal chain:
`Character State → Attention → Interpretation → Emotion → Intention → Language/Action`

And explicitly told: "You are NOT maximizing statistical variation (sentence-length variance, lexical diversity, metaphor density). You are adding details that THIS character would plausibly notice BECAUSE of their established state."

**Execution finding:** This framing worked — Case A's intervention used perception_detail (counting IV drips), attention_detail (scanning dosage labels), sensory_detail (antiseptic smell), internal_thought (three hours until shift ended). The *types* were correct; the *content* violated faithfulness (invented numbers). The psychological-causality framing successfully steered the generator away from statistical-noise variation toward character-grounded perception. The faithfulness problem is orthogonal to the causality problem.

---

## 9. Diagnostic Conflicts (how the loop handles them)

The loop does not invent a new priority order. It uses the existing Constitution stack:
1. Meaning preservation & truthfulness
2. Register obligations
3. Reader intelligibility
4. User/brand voice
5. AI-pattern adjustments

Plus the 5 Constitution articles (faithfulness, independent validation, canon/info-ownership integrity, no fabricated closure, state persistence) as invariants enforced on top.

**Conflict cases observed:**
- **Specificity vs. Canon (Case E):** Canon wins. CANON_VIOLATION → CRITICAL → REJECT_AND_FLAG. No specificity intervention.
- **Specificity vs. Information Ownership (Case D):** Info-ownership wins (by restraint — no intervention attempted). If an intervention HAD been attempted, the validator's `infoOwnership` check would gate it.
- **Specificity vs. Voice (Case A original):** The detector flagged that "she felt sad" contradicts Maya's voice (sparse, avoids emotional adjectives). Voice is checked at validation.
- **Specificity vs. Deferred (Case F):** Deferred wins (by restraint — no intervention). The proposed [CC] pre-pass (Stage 1a) would make this deterministic rather than reliant on [LJ] recognition.
- **Specificity vs. Faithfulness (Case A intervention):** Faithfulness wins. The validator blocked the hallucinated specifics. **This is the core conflict the architecture was built to resolve.**

---

## 10. What V1 Does NOT Include (deliberate scope)

- No tension-change diagnostic (Bible Part III L4) — future loop.
- No voice-consistency diagnostic — future loop.
- No POV-consistency check — future loop.
- No scene-sequel structure check — future loop.
- No readability, no AI-pattern stylometrics, no ESL path — these are nonfiction or cross-register.
- No calibration — all thresholds remain `[CAL]` (see Deliverable 7).

---

## 11. How V1 Connects to the Constitution and Compendium

- **Constitution (5 articles):** loaded every call; V1's loop enforces all 5.
- **Fiction OS (this document):** loaded when register = fiction; contains the loop, state, diagnostics, severity, validation, logging.
- **Compendium (research deliverable):** never loaded by default; contains the evidence for *why* MTLD over TTR, *why* independent validation, *why* Krippendorff's α, etc. The OS references the Compendium for justification but does not depend on it at inference time.
