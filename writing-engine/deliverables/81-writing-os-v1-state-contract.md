# Writing OS v1 — State Contract

## State Schema

```typescript
interface DocumentState {
  character: {
    identity: string;
    goals?: string[];
    fears?: string[];
    beliefs?: string[];
    memories?: string[];
    emotionalState?: string;
    perceptualHabits?: string[];
    voice?: string;
    currentKnowledge?: string[];  // facts the character currently possesses
  };
  informationOwnership?: {
    entries: Array<{
      fact: string;
      knows: string[];       // characters who possess this fact
      suspects: string[];     // characters who suspect but don't know
      misunderstands: string[];
      unknown: string[];      // characters who do NOT possess this fact
    }>;
  };
  canon?: {
    facts: Array<{
      content: string;
      classification: 'HARD_CANON' | 'SOFT_CANON' | 'BACKGROUND';
      source?: string;
    }>;
  };
  entitySlots?: EntitySlot[];
  deferredChecks?: Array<{
    id: string;
    type: string;
    anchorSpan: string;
    setupSummary: string;
    status: 'DEFERRED' | 'PASS' | 'FAIL';
    resolutionAnchor?: string;
  }>;
  sceneId?: string;
  revisionId?: number;
}
```

## Epistemic States

| State | Meaning | Authorization |
|---|---|---|
| UNKNOWN | Character does not possess the fact | Cannot assert knowledge or specific suspicion; vague uncertainty is licensed |
| SUSPECTS | Character suspects but does not know | Can express suspicion; cannot assert knowledge/certainty |
| KNOWS | Character possesses the fact | Can assert knowledge, suspicion (downgrade), or uncertainty (downgrade) |

## State Transition Contract

```json
{
  "sceneId": "S3",
  "beforeState": {
    "knows": ["Marcus"],
    "suspects": [],
    "unknown": ["Maya"]
  },
  "evidence": ["Maya observed a $40,000 discrepancy in the ledger"],
  "transition": "UNKNOWN_TO_SUSPECTS",
  "reason": "Maya observed a discrepancy in the ledger",
  "afterState": {
    "knows": ["Marcus"],
    "suspects": ["Maya"],
    "unknown": []
  },
  "provenance": "scene observation"
}
```

## Demonstrated Transitions

| Transition | Evidence | Scenes |
|---|---|---|
| UNKNOWN → SUSPECTS | v1 S2 (Maya sees discrepancy), v1.1 D1-D3 | State changes io verdict from FAIL to PASS for suspicion |
| SUSPECTS → KNOWS | v1 S5 (accountant confirms), v1.1 A1-S3 | State changes io verdict from FAIL to PASS for knowledge |

## Snapshot Isolation

Every candidate evaluation references an explicit `snapshotId`. The state used for evaluation is loaded from the snapshot, not from a mutable global. This prevents future state from contaminating historical evaluations.

**Demonstrated:** v1.1 A8 — S1 candidate ("knew $40,000") evaluated against S1 snapshot (UNKNOWN) → correctly REJECT, even though S3 snapshot (KNOWS) exists in the same experiment.

## State Integrity Rules

1. State changes are explicit events — not implicit mutations inside prompts
2. Every transition is auditable with beforeState, evidence, reason, afterState
3. Historical snapshots are immutable — evaluating against S1 uses S1's state
4. Unauthorized rollback (KNOWS→UNKNOWN without a legitimate event) is a state-integrity failure
5. Conflicting state (IO says UNKNOWN, CharacterState says KNOWS) must not silently resolve — the deterministic layer blocks based on IO

## Provenance Tracking

Numbers, dates, and quantities in candidate text are checked against:
- Source text (if provided)
- Character state (currentKnowledge, memories, perceptualHabits)
- Canon state (HARD_CANON, SOFT_CANON facts)
- Information ownership entries

Items not found in any of these are classified `UNKNOWN` provenance → HARD_STRUCTURAL_BLOCK.
