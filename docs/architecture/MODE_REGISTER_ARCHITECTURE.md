# Writing OS — Mode / Register Architecture

**Status:** ARCHITECTURAL FORMALIZATION  
**Date:** 2026-08-22  
**Branch:** `integration/writing-os-v1`

---

## 1. Architecture Overview

```
                         WRITING OS
                              │
                         CORE ENGINE
                    (deterministic triage,
                     semantic validation,
                     state, repair, logging)
                              │
                 ┌────────────┴────────────┐
                 │                         │
             FICTION                   NONFICTION
          (epistemic authorization    (source-constraint
           via character knowledge)    via fact ownership)
                 │                         │
          REGISTER PACKS              REGISTER PACKS
       ┌─────────┼─────────┐      ┌───────┼────────┐
       │         │         │      │       │        │
     NOVEL   SCREENPLAY  SHORT  ACADEMIC TECHNICAL BUSINESS
                         STORY             JOURNALISM
```

## 2. Three Layers

### Layer 1 — CORE (Register-Independent)

**Status:** DEMONSTRATED (Writing OS v1)

The Core provides machinery that does not depend on whether the text is fiction or nonfiction:

| Capability | Evidence |
|---|---|
| Persistent state with snapshots | v1, v1.1 |
| Deterministic triage (ACCEPT/BLOCK/HANDOFF) | v1, v1.1, R6 |
| Claim-state resolution | 4.3B, v1.1 |
| Entity-slot / property authorization | deterministic branch |
| Provenance (numbers, dates, entities) | 4.2, 4.3B |
| Canon / constraint handling | v1.1 A10 |
| Structured handoff to semantic layer | v1, v1.1 |
| Semantic validation interface | 4.3B (23/23) |
| Repair / revalidation loop | v1 S4, v1.1 A6/A7 |
| Audit logging | all experiments |
| Execution-integrity handling | all experiments (0 silent fallbacks) |
| Scoped CC/LJ arbitration | 4.2, v1 |

**The Core does NOT contain fiction-specific assumptions.** Character knowledge state (UNKNOWN/SUSPECTS/KNOWS) is a Mode-level concept, not a Core concept. The Core provides the *mechanism* for state persistence; the Mode defines *what the state means*.

### Layer 2 — MODE (Epistemic Authorization)

**Status:** FICTION = DEMONSTRATED; NONFICTION = PROPOSED

A Mode defines the epistemic authorization model — what kind of knowledge state the system tracks and what invention is licensed.

| Mode | Status | Epistemic Model | Default Invention Policy |
|---|---|---|---|
| FICTION | DEMONSTRATED | Character knowledge (UNKNOWN/SUSPECTS/KNOWS) | LICENSED_FICTION |
| NONFICTION | PROPOSED | Source-fact ownership (SUPPORTED/UNSUPPORTED/CONTRADICTED) | SOURCE_CONSTRAINED |

**Mode governs:**
- What "state" means (character knowledge vs. source facts)
- What invention is authorized (narrative invention vs. source-constrained)
- What epistemic levels exist (wondered/suspected/knew vs. asserted/cited/inferred)
- What the semantic validator's epistemic rules are

**Mode does NOT govern:**
- Deterministic triage mechanics (Core)
- Audit logging (Core)
- Repair loop mechanics (Core)
- Stylistic conventions (Register Pack)

### Layer 3 — REGISTER PACK (Stylistic / Structural)

**Status:** ALL PROPOSED (no register pack has been independently validated)

A Register Pack contains register-specific policies and conventions that specialize the Mode:

| Pack | Mode | Status | What It Would Contain |
|---|---|---|---|
| NOVEL | FICTION | PROPOSED | Narrative voice, POV conventions, scene-sequel structure, chapter formatting |
| SHORT_STORY | FICTION | PROPOSED | Compressed narrative, single-arc structure |
| SCREENPLAY | FICTION | PROPOSED | Scene headings, action format, dialogue format |
| ACADEMIC | NONFICTION | PROPOSED | IMRAD structure, citation style, hedging conventions, ESL-fair assessment |
| TECHNICAL | NONFICTION | PROPOSED | Specification format, terminology, procedural clarity |
| BUSINESS_PROFESSIONAL | NONFICTION | PROPOSED | BLUF, memo format, tone calibration, inclusive language |
| JOURNALISTIC_INFORMATIONAL | NONFICTION | PROPOSED | Inverted pyramid, attribution standards, fact-checking |

**A Register Pack MUST NOT:**
- Duplicate the Core (no separate triage engine)
- Override non-overridable integrity barriers (HARD_STRUCTURAL_BLOCK)
- Grant knowledge that state does not authorize
- Authorize unsupported factual claims

## 3. Policy Inheritance

```
CORE (integrity barriers, triage, state mechanism)
  ↓ inherits
MODE (epistemic authorization, invention policy)
  ↓ inherits
REGISTER PACK (stylistic, structural, audience)
  ↓ inherits
TASK / DOCUMENT (specific candidate + state)
```

A lower layer may specialize a higher layer but must not silently violate a higher-priority integrity rule.

## 4. Decision Table: What Belongs Where

| Concern | Core | Mode | Register Pack |
|---|---|---|---|
| State snapshots | YES | | |
| Deterministic triage | YES | | |
| Entity/property authorization | YES | | |
| Provenance (numbers, dates) | YES | | |
| Audit logging | YES | | |
| Repair/revalidation loop | YES | | |
| Execution-integrity handling | YES | | |
| Invention authorization | | YES | maybe (tighten) |
| Source constraint level | | YES | maybe (tighten) |
| Character knowledge state (UNKNOWN/SUSPECTS/KNOWS) | YES (mechanism) | FICTION (semantics) | |
| Source-fact ownership | YES (mechanism) | NONFICTION (semantics) | |
| Canon / constraints | YES (mechanism) | maybe (FICTION canon vs. NONFICTION source facts) | |
| Narrative voice | | | YES |
| Academic citation style | | | YES |
| Screenplay formatting | | | YES |
| Business tone | | | YES |
| Scene-sequel structure | | | YES |
| IMRAD structure | | | YES |
| Semantic epistemic rules (Rules A-E) | | YES (FICTION) | maybe (register-specific overrides) |

## 5. Authority Hierarchy (Unchanged from v1)

The Mode/Register system does NOT weaken the existing authority:

| Level | Authority | Overridable by Mode/Pack? |
|---|---|---|
| HARD_STRUCTURAL_BLOCK | Non-overridable | NO |
| STATE_CONTRADICTION | Non-overridable | NO |
| PROVEN_STRUCTURAL_SUPPORT | Can override weak heuristics | NO (Mode/Pack cannot remove) |
| Mode/Pack policies | Configure behavior within Core | N/A |
| Register Pack style rules | Specialize Mode | Mode can override Pack |

## 6. Provider / Model Independence

The Mode/Register architecture is NOT bound to a specific LLM provider:

- The Core's deterministic triage is provider-independent (local TypeScript)
- The semantic validator's interface is provider-neutral
- The current provider (FIREWORKS / qwen3p8-max) is an execution choice
- Future model changes can be evaluated against the Golden Corpus without architecture changes

## 7. Corpus Architecture

The Golden Corpus supports future register separation:

```
corpus/
├── golden-v1/
│   ├── cases.jsonl          (current: 59 fiction cases)
│   ├── fiction/              (future: fiction-specific subset)
│   └── nonfiction/           (future: nonfiction cases, not yet populated)
```

Current state: `golden-v1` contains FICTION evidence only. The schema does not need to change for future nonfiction cases — the `register` field already exists.

## 8. Configuration Examples

### Fiction / Novel
```json
{
  "mode": "FICTION",
  "register": "NOVEL",
  "inventionPolicy": "LICENSED_FICTION",
  "stateSemantics": "CHARACTER_KNOWLEDGE"
}
```

### Nonfiction / Academic
```json
{
  "mode": "NONFICTION",
  "register": "ACADEMIC",
  "inventionPolicy": "SOURCE_CONSTRAINED",
  "stateSemantics": "SOURCE_FACT_OWNERSHIP"
}
```

### Nonfiction / Business
```json
{
  "mode": "NONFICTION",
  "register": "BUSINESS_PROFESSIONAL",
  "inventionPolicy": "SOURCE_CONSTRAINED",
  "stateSemantics": "SOURCE_FACT_OWNERSHIP"
}
```

These are architectural examples, NOT evidence claims.

## 9. What Has Been Demonstrated

| Capability | FICTION | NONFICTION |
|---|---|---|
| State persistence | ✅ DEMONSTRATED | ❌ NOT VALIDATED |
| Epistemic authorization | ✅ DEMONSTRATED (23/23) | ❌ NOT VALIDATED |
| Deterministic triage | ✅ DEMONSTRATED | ⚠️ SMOKE TEST ONLY |
| Semantic validation | ✅ DEMONSTRATED | ⚠️ SMOKE TEST ONLY |
| Repair | ✅ DEMONSTRATED | ❌ NOT VALIDATED |
| Golden Corpus | ✅ 59 cases | ❌ 0 cases |
| Register Pack | ❌ NOT SPECIALIZED | ❌ NOT SPECIALIZED |

## 10. What Remains Proposed

- NONFICTION mode (source-fact ownership semantics)
- SourceFactLedger (nonfiction state)
- All Register Packs (NOVEL, SCREENPLAY, ACADEMIC, etc.)
- Nonfiction semantic epistemic rules
- Nonfiction Golden Corpus
- Cross-register validation

**None of these are validated. They are architectural proposals.**
