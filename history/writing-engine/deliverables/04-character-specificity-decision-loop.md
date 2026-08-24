# DELIVERABLE 4 — CHARACTER_SPECIFICITY_DECISION_LOOP

**This is the precise specification of the loop that was implemented and executed.** The implementation lives in `/home/z/my-project/writing-engine/src/engine.ts`; the test cases in `cases.ts`; the execution trace in `logs/execution-trace.md`.

The loop is **8 stages**, not the 11 stages proposed in the research's OS-2. Execution simplified the design: some proposed stages (register detection, stake-primacy resolution, Source-Fact Ledger extraction) are irrelevant to a single-register fiction diagnostic and were omitted. This is a deliberate scope reduction — the smallest loop that survives execution.

---

## The Loop

```
PRINCIPLE → DIAGNOSTIC → DETECTION → STATE LOOKUP → SEVERITY → DECISION → INTERVENTION → VALIDATION → LOG
                                              ↑                              ↑
                                         (implicit)                    (independent)
```

### Stage 0 — Principle (loaded, not computed)

**Source:** Writing Bible v4, Part III L1 — "Naturalness arises from the felt texture of a particular character's/narrator's mind in a specific situation, not from general 'realistic' style rules."

**Operationalization:** The principle is encoded in the detection prompt as the classification criterion. A passage is GENERIC if its perception/reaction could belong to almost any protagonist; CHARACTER_SPECIFIC if causally tied to this character's established state.

**Psychological Causality chain (operationalized in the intervention prompt):**
`Character State → Attention → Interpretation → Emotion → Intention → Language/Action`

The intervention generator is explicitly told: "You are NOT maximizing statistical variation. You are adding details that THIS character would plausibly notice BECAUSE of their established state." This prevents the failure mode of solving genericity with sentence-length variance or metaphor density.

### Stage 1 — Detection (the diagnostic, [LJ])

**Input:** passage + DocumentState (character, info-ownership, canon, deferred-checks)
**Output:** `DetectionResult { classification, evidence, absentDetails, narrativelyPurposeful, canonConflicts, reasoning }`
**Classification values:** GENERIC | CHARACTER_SPECIFIC | INTENTIONALLY_GENERIC | CANON_VIOLATION | DEFERRED_CONTEXT

The detector is prompted to ground every judgment in the provided state. It must list (a) specific details present that tie to THIS character, (b) specific details this character would notice but are missing, (c) whether the genericity is narratively purposeful, (d) any canon conflicts.

**Known failure (discovered):** The detector does not reliably cross-reference the passage against the `deferredChecks` list. Case F was mis-classified as CHARACTER_SPECIFIC when it should have been DEFERRED_CONTEXT. **Fix (proposed, not yet re-executed):** add an explicit instruction to the detection prompt: "If any passage element corresponds to a DEFERRED_CHECK anchor span, classify as DEFERRED_CONTEXT." This is recorded as a state-discovery in the OS spec.

### Stage 2 — State Lookup (implicit, via parameter passing)

The DocumentState is passed to every stage. There is no separate "lookup" step because the state is already in scope. This stage exists conceptually to make explicit that detection, intervention, and validation all consult the SAME state object — they do not each maintain private state.

### Stage 3 — Severity (rule-based, NOT LLM)

**This stage is deliberately not an LLM call.** Severity is a deterministic mapping from detection class + canon conflicts. No numeric thresholds; no [CAL] values. Qualitative only.

| Detection | Canon conflicts? | Narratively purposeful? | Severity |
|---|---|---|---|
| CANON_VIOLATION | (any) | — | CRITICAL |
| (any with canonConflicts) | yes | — | CRITICAL |
| CHARACTER_SPECIFIC | no | — | NONE |
| INTENTIONALLY_GENERIC | no | yes | NONE |
| DEFERRED_CONTEXT | no | — | NONE |
| GENERIC | no | yes | MINOR |
| GENERIC | no | no | MATERIAL |

**Intervention permissions by severity:**
- NONE → no intervention (ACCEPT_UNCHANGED or DEFER)
- MINOR → OPTIONAL_POLISH (lexical_substitution, rhythm only)
- MATERIAL → TARGETED_REWRITE (perception, attention, thought, sensory, memory, metaphor, rhythm)
- CRITICAL → REJECT_AND_FLAG (no automated intervention; author attention)

### Stage 4 — Decision

| Severity | Detection class | Decision |
|---|---|---|
| NONE | CHARACTER_SPECIFIC / INTENTIONALLY_GENERIC | ACCEPT_UNCHANGED |
| NONE | DEFERRED_CONTEXT | DEFER |
| MINOR | GENERIC | OPTIONAL_POLISH |
| MATERIAL | GENERIC | TARGETED_REWRITE |
| CRITICAL | (any) | REJECT_AND_FLAG |

### Stage 5 — Intervention (constrained generation, [LJ])

**Only runs if decision is OPTIONAL_POLISH or TARGETED_REWRITE.** Returns `null` otherwise.

**Allowed intervention types** (by decision):
- OPTIONAL_POLISH: `lexical_substitution`, `rhythm`
- TARGETED_REWRITE: `perception_detail`, `attention_detail`, `internal_thought`, `sensory_detail`, `memory_reference`, `metaphor`, `rhythm`

**Hard constraints (in the intervention prompt):**
1. Use ONLY information the character possesses (per Information Ownership).
2. Do NOT contradict Canon State (HARD_CANON, SOFT_CANON).
3. Do NOT invent facts (dates, names, statistics, quantities) not in source or state.
4. Do NOT resolve or explain any DEFERRED check.
5. Preserve scene function and intended meaning.
6. Preserve the character's established voice.
7. Do NOT add perception via a sense the character lacks (e.g., visual for a blind character).

**Execution finding:** The generator violates constraint #3 under specificity pressure (Case A: invented "127 tiles, 4:15am, 13 pills"). The constraints are necessary but not sufficient. **Article II (independent validation) is what actually enforces constraint #3.**

### Stage 6 — Independent Validation ([LJ], separately prompted)

**Only runs if an intervention was generated.** The validator does NOT see the generator's reasoning, constraints-applied list, or state-used list. It receives only: original, revised, state.

**Nine dimensions checked:**
1. `meaning` — did intended meaning survive?
2. `character` — more specific without inconsistency?
3. `infoOwnership` — did character use only info they possess? (FAIL if revised text shows character perceiving a fact listed as "unknown" to them)
4. `canon` — contradicts HARD_CANON or SOFT_CANON?
5. `voice` — preserves established voice?
6. `register` — appropriate for literary fiction?
7. `intelligibility` — harmed clarity?
8. `deferred` — accidentally resolved a DEFERRED check? (FAIL if yes)
9. `faithfulness` — invented facts not in source or state? (FAIL if yes)

**Acceptance rule:** ACCEPT only if NO integrity dimension (infoOwnership, canon, faithfulness, deferred) FAILED. Otherwise REJECT.

**Execution finding:** This stage is load-bearing. Case A was blocked here. Without it, the hallucinated specificity would have been accepted.

### Stage 7 — Logging

Every run produces a `LogEntry` with: timestamp, caseId, sceneId, revisionId, originalPassage, diagnostic name, detection result, severity, decision, intervention (or null), validation (or null), accepted (bool), finalText, remainingDeferred, stateDiscovered.

The log answers: What changed? Why? What state was relied on? What rules allowed it? What checks ran? Why was the candidate accepted or rejected?

---

## What This Loop Does NOT Do (deliberate scope)

- **No register detection** (fiction-only; register is given).
- **No stake-primacy resolution** (single register).
- **No Source-Fact Ledger** (fiction; Article I relaxes to canon-consistency).
- **No readability formulas** (inapplicable to fiction).
- **No AI-pattern stylometric checks** (advisory and not needed for this diagnostic).
- **No ESL path** (not triggered for these cases).

These omissions are findings, not gaps. The loop is the smallest system that survives execution for the Character Specificity diagnostic. Cross-register concerns belong in future loops.
