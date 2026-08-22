# Writing OS — Mode Policy Contract

**Status:** FICTION = DEMONSTRATED; NONFICTION = PROPOSED

---

## Mode Definition

A Mode defines the epistemic authorization model — what kind of knowledge state the system tracks and what invention is licensed.

```typescript
type WritingMode = "FICTION" | "NONFICTION";

interface WritingModePolicy {
  mode: WritingMode;
  defaultInventionPolicy: InventionPolicy;
  stateSemantics: "CHARACTER_KNOWLEDGE" | "SOURCE_FACT_OWNERSHIP";
  epistemicLevels: string[];  // e.g. ["UNKNOWN","SUSPECTS","KNOWS"] or ["SUPPORTED","UNSUPPORTED","CONTRADICTED"]
  semanticRules: string[];    // epistemic calibration rules (e.g. Rules A-E for FICTION)
  sourceConstraintLevel: "NONE" | "SOURCE_CONSTRAINED" | "STRICT";
}
```

## FICTION Mode

**Status:** DEMONSTRATED

```typescript
{
  mode: "FICTION",
  defaultInventionPolicy: "LICENSED_FICTION",
  stateSemantics: "CHARACTER_KNOWLEDGE",
  epistemicLevels: ["UNKNOWN", "SUSPECTS", "KNOWS"],
  semanticRules: ["RULE_A_VAGUE_UNCERTAINTY", "RULE_B_VAGUE_QUANTIFIER", "RULE_C_DOMAIN_SUSPICION", "RULE_D_EPISTEMIC_DISTINCTION", "RULE_E_STATE_SUPPORTED_NUMBERS"],
  sourceConstraintLevel: "NONE"
}
```

### Demonstrated Capabilities
- Character knowledge state (UNKNOWN/SUSPECTS/KNOWS): 23/23 io accuracy (4.3B)
- Information ownership by character: v1.1 A3 (cross-character)
- Narrative invention licensing: 4.3B Rule A (8/8 vague uncertainty → PASS)
- Canon constraints: v1.1 A10
- Deferred mechanisms: v1.1 A9
- Scene-level state persistence: v1 (7 scenes), v1.1 (16 cases)
- Repair preserving epistemic state: v1.1 A6/A7

### Known Limitation
- R6: observation-framed indirect IO leak (UNRESOLVED)

## NONFICTION Mode

**Status:** PROPOSED — NOT YET VALIDATED

```typescript
{
  mode: "NONFICTION",
  defaultInventionPolicy: "SOURCE_CONSTRAINED",
  stateSemantics: "SOURCE_FACT_OWNERSHIP",
  epistemicLevels: ["SUPPORTED", "UNSUPPORTED", "CONTRADICTED"],  // PROPOSED
  semanticRules: [],  // PROPOSED — not yet defined
  sourceConstraintLevel: "SOURCE_CONSTRAINED"
}
```

### Proposed Responsibilities (NOT VALIDATED)
- Source-fact ownership (who said what, when, with what evidence)
- Source provenance tracking (every claim traceable to a source span)
- Strict factual faithfulness (no unsupported specifics)
- Citation/evidence support
- Numerical fidelity (no invented numbers)
- Date fidelity (no invented dates)
- Paraphrase without factual drift
- No unsupported factual invention

### Evidence Status
- Iteration 4 nonfiction smoke test: paraphrase overblocked ("medical centers" rejected)
- No nonfiction Golden Corpus cases
- No nonfiction semantic epistemic rules defined
- No SourceFactLedger implemented

**All NONFICTION capabilities are PROPOSED. Do not claim validation.**

## Policy Inheritance

```
CORE (integrity barriers — non-overridable)
  ↓
MODE (epistemic authorization — FICTION or NONFICTION)
  ↓
REGISTER PACK (stylistic specialization)
```

A Mode cannot override Core integrity barriers. A Register Pack cannot override Mode epistemic policies.

## Mode Switching

The system does not currently support mid-document mode switching. A document is associated with one Mode for its entire length. Mixed-register texts (e.g., a law-firm blog = legal × marketing) would require future architecture work (stake-primacy resolution, documented in Writing Bible v4 research but not implemented).
