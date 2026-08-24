# Writing OS v1 — Final Architecture Decision

---

## What Is Writing OS v1?

Writing OS v1 is a specification-driven AI rewriting engine that:
- Maintains persistent, auditable story state across scenes
- Routes candidate text through deterministic triage (ACCEPT/BLOCK/HANDOFF)
- Performs state-aware semantic validation for HANDOFF cases
- Supports repair + revalidation of rejected candidates
- Records explicit state transitions with full audit logging
- Uses a hybrid deterministic + LLM architecture with scoped authority

## What Is Its Minimum Required Architecture?

1. Persistent state with explicit snapshots (UNKNOWN/SUSPECTS/KNOWS)
2. Deterministic triage gateway (gemini/deterministic-triage-v2)
3. Semantic validator with state-aware epistemic calibration (Fireworks/qwen3p8-max)
4. Scoped CC/LJ arbitration (HARD_STRUCTURAL / CLAIM_PATTERN / SOFT_SIGNAL)
5. Repair + revalidation loop
6. Explicit state transitions (auditable events)
7. Audit logging (candidate, triage, semantic, repair, state)
8. Execution-integrity handling (SUCCESS / EXECUTION_ERROR, no silent fallback)
9. Constitution (5 articles)

## What Is Deterministic Authority?

The deterministic layer has non-overridable authority for:
- Unsupported specific numbers/dates (HARD_STRUCTURAL_BLOCK)
- Explicit epistemic overreach (STATE_CONTRADICTION via claim-state resolution)
- Hard canon contradictions
- Structurally proven state support (DETERMINISTIC_ACCEPT fast path)

It delegates to the semantic layer for:
- Vague vs specific epistemic language
- Semantic paraphrase detection
- Observation-framed implications
- Nuanced faithfulness and meaning questions

## What Belongs to Semantic LLM?

The semantic layer owns:
- Epistemic force assessment (wondered/suspected/knew)
- State-sensitive information ownership judgment
- Faithfulness for vague quantifiers ("some money")
- State-supported number acceptance (Rule E)
- Semantic paraphrase leak detection
- Domain-level suspicion classification (Rule C)
- Vague uncertainty licensing (Rule A)
- Voice, register, intelligibility assessment

## What Belongs to Repair?

The repair system:
- Receives rejected candidates and validation violations
- Generates repaired text that preserves epistemic state
- Must not invent facts, numbers, or unauthorized knowledge
- Is revalidated through the full pipeline (deterministic + semantic)
- Has demonstrated: knowledge downgrade (knew→suspected), numeric removal ($40k removed)

## What Is the State Contract?

State is machine-readable, snapshot-based, and explicitly transitioned:
- `UNKNOWN` / `SUSPECTS` / `KNOWS` per fact per character
- Snapshots are immutable — historical evaluations use historical state
- Transitions are auditable events with beforeState, evidence, reason, afterState
- Unauthorized rollback (KNOWS→UNKNOWN without legitimate event) is a failure
- Conflicting state (IO vs CharacterState) triggers DETERMINISTIC_BLOCK

## What Is the Handoff Contract?

When deterministic triage returns HANDOFF_TO_LLM, the semantic validator receives:
- Candidate text + state snapshot
- Hard violations, soft signals, claim signals
- Entity signals, observation class, canon signals, provenance signals
- Recommended semantic questions
- Primary triage reason

The semantic validator does NOT redo the deterministic analysis — it answers the specific deferred questions.

## What Has Actually Been Demonstrated?

- 23/23 epistemic io accuracy (4.3B calibrated)
- 15/16 adversarial state integrity (v1.1)
- 9/10 integrated multi-scene (v1)
- 0 execution errors across all final experiments
- 0 false acceptance on epistemic cases
- State persistence, snapshot isolation, cross-character ownership
- Repair integrity (no knowledge leak, no numeric fabrication)
- Semantic paraphrase detection (3/3)
- Deterministic hard-block routing for unsupported numbers

## What Remains Unproven?

- R6 (observation-framed indirect IO leak) — 1/4 detected, calibration backfired
- Paraphrase equivalence (hospitals↔medical centers)
- Nonfiction register validation
- Complex co-reference
- Production-scale performance
- Long-range state (>16 scenes)
- Golden corpus calibration
- Automatic state extraction

## What Is Explicitly Out of Scope?

- R6 dedicated inference stage (FUTURE)
- Deterministic keyword dictionaries
- Broad synonym engines
- Generic world-knowledge inference
- New Constitution articles
- Writing Bible v5
- Production UI
- Fine-tuning

## What Should NOT Be Added Yet?

Nothing. The architecture is frozen at v1. The experiments have demonstrated what works and what doesn't. The next phase is calibration and broader validation, not architectural expansion.

## What Is the Next Major Phase?

**Phase 2 — Calibration / Golden Corpus / Broader Register Validation:**
- Build golden corpus
- Calibrate thresholds on representative data
- Test nonfiction registers (academic, business, legal)
- Broader paraphrase testing
- Cross-register behavior
- Production-scale measurements
- R6 may remain a known limitation unless a future experiment provides evidence for a solution

---

## Final Statement

Writing OS v1 is **small enough to understand, explicit enough to implement, evidence-backed enough to trust, and honest enough to show its limits.**

The architecture is frozen. The evidence is mapped. The limitations are documented. The next phase is calibration, not redesign.
