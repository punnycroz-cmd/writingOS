# Mode / Register Architecture — Final Summary

---

## The 15 Final Questions

### 1. Why should Fiction and Nonfiction be the two top-level modes?

Because the fundamental epistemic authorization model differs:
- **FICTION** authorizes through *character knowledge* (who knows what, when)
- **NONFICTION** authorizes through *source-fact ownership* (what is supported, by what evidence)

These two models have different state semantics, different invention policies, and different epistemic levels. Splitting at this level keeps the Core clean while allowing each mode to define its own authorization rules.

### 2. What truly belongs in the Core?

State mechanism (snapshots, transitions), deterministic triage, entity/property authorization, provenance, repair/revalidation, audit logging, execution-integrity handling. The Core provides *machinery*; it does not define *what state means*.

### 3. What belongs in Mode?

Epistemic authorization model (character knowledge vs. source-fact ownership), default invention policy, epistemic levels (UNKNOWN/SUSPECTS/KNOWS vs. SUPPORTED/UNSUPPORTED/CONTRADICTED), semantic epistemic rules (Rules A-E for FICTION).

### 4. What belongs in Register Pack?

Stylistic conventions, structural expectations (IMRAD, scene-sequel), terminology, formatting, audience profile, register-specific semantic overrides. The Pack *specializes* the Mode; it does not replace it.

### 5. Can the same deterministic triage serve both modes?

**YES** — the deterministic triage operates on structural signals (numbers, dates, claim-state resolution, entity properties, canon) that are mode-independent. The *claim-state resolution* may need mode-specific configuration (character knowledge vs. source-fact ownership), but the triage *mechanism* is shared.

### 6. Which policies change between Fiction and Nonfiction?

- Invention policy: LICENSED_FICTION (FICTION) vs. SOURCE_CONSTRAINED (NONFICTION)
- State semantics: CHARACTER_KNOWLEDGE vs. SOURCE_FACT_OWNERSHIP
- Epistemic levels: UNKNOWN/SUSPECTS/KNOWS vs. SUPPORTED/UNSUPPORTED/CONTRADICTED
- Semantic rules: Rules A-E (FICTION) vs. TBD (NONFICTION)
- Canon: story-world canon (FICTION) vs. source-established facts (NONFICTION)

### 7. Which state concepts are shared?

State snapshots, state transitions (explicit, auditable), deferred checks, entity slots, provenance tracking. The *mechanism* is shared; the *semantics* differ.

### 8. Which state concepts will probably become mode-specific?

- Information ownership entries: character-knows (FICTION) vs. source-supports (NONFICTION)
- Canon facts: story-world constraints (FICTION) vs. source-established facts (NONFICTION)
- Character state: rich inner state (FICTION) vs. writer/author perspective (NONFICTION)

### 9. How should invention policy differ?

FICTION: LICENSED_FICTION (narrative invention allowed, respecting POV/knowledge/canon). NONFICTION: SOURCE_CONSTRAINED (only source-supported info; no unsupported specifics).

### 10. How should source constraint differ?

FICTION: no source constraint (invention is the point). NONFICTION: strict source constraint (every claim traceable to source span).

### 11. How should the corpus be separated?

`golden-v1/fiction/` (current 59 cases) and `golden-v1/nonfiction/` (future, not populated). The schema already has a `register` field.

### 12. What has actually been demonstrated for Fiction?

23/23 epistemic io accuracy (4.3B), 15/16 adversarial state integrity (v1.1), 9/10 integrated multi-scene (v1), 0 execution errors, state persistence, snapshot isolation, cross-character ownership, repair integrity, semantic paraphrase detection, deterministic hard-block routing.

### 13. What has actually been demonstrated for Nonfiction?

2 smoke-test cases (1 correct rejection of invented specifics, 1 false rejection of paraphrase). Insufficient for validation.

### 14. What remains purely proposed?

All NONFICTION capabilities, all Register Packs, SourceFactLedger, nonfiction semantic rules, nonfiction Golden Corpus, cross-register validation, mode switching.

### 15. What is the next concrete task for building Nonfiction?

**Phase 3 — Nonfiction Mode prototype:**
1. Define SourceFactLedger state schema
2. Define nonfiction epistemic levels (SUPPORTED/UNSUPPORTED/CONTRADICTED)
3. Build a small (10-15 case) nonfiction golden corpus
4. Test SOURCE_CONSTRAINED validation with the existing Core
5. Evaluate whether the Core's deterministic triage works for nonfiction without modification

This is future work — not started in this task.

---

## STOP

Per the task's stop condition:
- No SourceFactLedger built
- No nonfiction semantic prompts created
- No nonfiction benchmarks run
- No Writing OS v1 Core changes
- No Constitution changes
- No Writing Bible v5

The Mode/Register architecture is documented. The next phase is Phase 2B (Golden Corpus Evaluation), then Phase 3 (Nonfiction prototype).
