# DELIVERABLE 6 — STATE_SCHEMA_V1

**This is the minimum persistent state the loop actually required, discovered through execution — not assumed from the research's OS-1 schema.** The research proposed a larger schema (StyleSheet, EntityLedger, CanonLedger, SourceFactLedger, DeferredChecks, DiagnosticHistory, RegisterVector). Execution validated a **subset** for fiction; the rest remains proposed and unvalidated.

The implementation is in `/home/z/my-project/writing-engine/src/types.ts`.

---

## Validated State (fiction, Character Specificity loop)

### CharacterState
```typescript
{
  identity: string;              // canonical name + role
  goals: string[];               // active desires driving attention
  fears: string[];               // what the character dreads (drives what they notice)
  beliefs: string[];             // things they hold true (may be false)
  memories: string[];            // salient prior experiences shaping perception
  emotionalState: string;        // current affect (drives interpretation)
  perceptualHabits: string[];    // what this character specifically attends to
  voice: string;                 // established speech/thought patterns
  currentKnowledge: string[];    // facts they currently possess
}
```
**Why each field is required (execution evidence):**
- `perceptualHabits` — the intervention generator drew on "counts objects compulsively," "notices smells first," "reads dosages" to construct character-specific perception. Without this field, interventions default to generic sensory detail.
- `voice` — Case A's detection explicitly flagged that the original passage's "sad and determined" emotional labeling "contradicts Maya's established voice of being sparse, observational." Without `voice`, the detector cannot flag voice-violations.
- `currentKnowledge` — mirrors Information Ownership's "knows" list; required for the info-ownership gate (Case D).
- `goals`, `fears`, `memories`, `emotionalState`, `beliefs` — all referenced by the intervention generator's causal chain (State → Attention → Interpretation → Emotion → Intention). Execution showed the generator uses these to select *which* details to add.

### InformationOwnership
```typescript
{
  entries: Array<{
    fact: string;
    knows: string[];           // characters who possess this fact
    suspects: string[];
    misunderstands: string[];
    unknown: string[];         // characters who do NOT possess this fact
    changedAt?: number;        // scene index when knowledge state changed
  }>;
}
```
**Why required:** Case D tested whether the engine would leak the embezzlement (unknown to Maya) into her perception. The `unknown` field is the gate. The validator's `infoOwnership` check tests against it. Without this field, there is no structural defense against information leakage.

**Discovered during execution:** The `changedAt` field was defined but not exercised by these cases. It is retained for future long-range tests (knowledge-state changes across scenes). Marked **proposed, not yet validated**.

### CanonState
```typescript
{
  facts: Array<{
    content: string;
    classification: 'HARD_CANON' | 'SOFT_CANON' | 'HYPOTHESIS' | 'UNKNOWN';
    source: string;            // where established
  }>;
}
```
**Why required:** Case E (blind character "seeing") tested canon-violation detection. The `HARD_CANON` classification triggered CRITICAL severity and REJECT_AND_FLAG. Without the classification, all facts would be equal and the engine could not distinguish "fixed" from "negotiable."

**Classification semantics (validated):**
- **HARD_CANON** — cannot be contradicted (Arlo is blind). Violation = CRITICAL.
- **SOFT_CANON** — established but revisable (Maya experiences depersonalization). Used to recognize INTENTIONALLY_GENERIC (Case C).
- **HYPOTHESIS** — author outline / planned but not yet revealed (the trowel is a signal). Used for deferred mechanisms.
- **UNKNOWN** — not yet established. Engine must not treat as fact.

### DeferredChecks
```typescript
{
  id: string;
  type: string;                // 'foreshadowing', 'mystery_clue', 'promise', etc.
  anchorSpan: string;          // the setup text
  setupSummary: string;
  status: 'DEFERRED' | 'PASS' | 'FAIL';
  resolutionAnchor?: string;
}
```
**Why required:** Case F tested whether the engine would fabricate closure for the trowel clue. The DeferredChecks list is the record of what must not be resolved prematurely.

**Discovered failure:** The detection stage did not cross-reference the passage against `anchorSpan`. The state field exists but the loop does not use it correctly in detection. **Fix (proposed):** add a [CC] pre-pass that flags any passage overlapping a deferred-check anchor span before [LJ] detection runs. This is a loop fix, not a state-schema fix — the state is correct; the consumer is broken.

---

## Proposed State (NOT yet validated by execution)

These fields were in the research's OS-1 schema but were NOT required by the Character Specificity loop. They are retained as candidates for future loops (nonfiction, cross-register) but are **not part of State Schema V1**.

| Field | Proposed for | Status | Why not yet validated |
|---|---|---|---|
| StyleSheet (voice attributes, function-word profile, banned phrases) | Marketing / Business / cross-register voice profiling | Proposed | Fiction loop used `CharacterState.voice` (a string), not a voice matrix |
| EntityLedger (named entities with attributes) | Nonfiction (Source-Fact Ledger adjacent) | Proposed | Fiction loop did not need entity extraction |
| SourceFactLedger (entities, numbers, citations pre-extraction) | Nonfiction faithfulness | Proposed | Not yet executed for nonfiction |
| DiagnosticHistory (prior scores for regression) | Validation subsystem | Proposed | Only one revision per case executed; no regression test yet |
| RegisterVector (multi-label register confidence) | Cross-register | Proposed | Single-register fiction loop |

---

## State Discovery Log

During execution, the following state requirements were discovered (not assumed):

1. **`perceptualHabits` must be specific, not generic.** A habit like "notices things" is useless; "counts objects compulsively (childhood habit from helping in Papa's pharmacy)" is what the generator needs. State quality determines intervention quality.

2. **`voice` must be descriptive enough to detect violations.** "Sparse, observational, avoids emotional adjectives, uses numbers as anchors" allowed the detector to flag "she felt sad" as voice-inconsistent. A one-word voice label would not.

3. **Information Ownership needs the `unknown` list, not just the `knows` list.** The gate is "characters cannot perceive facts listed as unknown to them." Without `unknown`, there is no negative constraint.

4. **Canon classification must distinguish HARD from SOFT.** Case C (depersonalization) relied on SOFT_CANON to recognize intentional genericity. Case E (blindness) relied on HARD_CANON to trigger CRITICAL. A single "canon" bucket would conflate them.

5. **DeferredChecks need `anchorSpan` (the literal text), not just a summary.** The planned fix (cross-reference) requires string-level overlap, not semantic similarity. A summary alone is insufficient for a [CC] pre-pass.

6. **The loop does NOT need DiagnosticHistory for a single-pass diagnostic.** This field is for regression monitoring, not inference. It belongs in the validation subsystem, not the per-inference state.

---

## Schema Size Check

The validated V1 schema has **4 state objects** (CharacterState, InformationOwnership, CanonState, DeferredChecks) with ~15 fields total. This is smaller than the research's OS-1 (7 objects, ~25 fields). The reduction is execution-driven: fields that no stage of the loop read were removed. They can be added back when a loop stage requires them.
