# DELIVERABLE 9 — ARCHITECTURE_DECISION

**The decision: fiction-first, or general-purpose with a deep fiction module?** Per Section 18, this decision is made *after* the first loop, based on execution evidence — not speculation.

---

## The Evidence Base

One loop (Character Specificity, fiction) was implemented and executed on 6 cases. The execution produced:
- 3 clear successes (B, C, E)
- 1 architectural-success-despite-generator-failure (A — validator blocked hallucinated specificity)
- 1 mixed result (D — no leak, but diagnostic lenient)
- 1 clear failure (F — deferred mechanism not detected)

Plus: 5 Constitution articles validated, 4 state objects validated, 8-stage loop validated, independent validation proven load-bearing.

---

## What Generalizes (Universal Components)

These components proved their value in the fiction loop AND are clearly register-independent:

| Component | Evidence | Generalizes because |
|---|---|---|
| **Independent validation (Article II)** | Blocked Case A's hallucinated specificity | Every register that rewrites text needs generation/validation separation. The 9 validation dimensions are fiction-flavored but the *structure* (separate validator, integrity-dimensions-gate) is universal. |
| **State persistence outside context (Article V)** | All stages consulted explicit state | Universal — every register with long-range dependencies needs this. |
| **Canon/Information-Ownership integrity (Article III)** | Case E (canon), Case D (info-ownership) | Universal in principle — every register has "established facts that cannot be contradicted" (legal: defined terms; academic: cited claims; marketing: brand facts). The *content* of canon differs by register; the *mechanism* (classification + CRITICAL routing) is universal. |
| **No fabricated closure of deferred mechanisms (Article IV)** | Case F (preserved by restraint) | Universal — every register has long-range mechanisms (legal: case-law chains; academic: argument arcs; marketing: campaign promises). |
| **The severity model (NONE/MINOR/MATERIAL/CRITICAL → decision)** | Routed all 6 cases correctly | Universal in structure. The *mapping* from detection-class to severity is register-specific, but the 4-level qualitative model and the "CRITICAL = escalate, not auto-fix" principle generalize. |
| **The [CC] + [LJ] split** | Detection [LJ], severity [CC]-rule, intervention [LJ], validation [LJ] | Universal — the principle of deterministic stages (severity, decision, [CC] pre-passes) gating [LJ] stages generalizes to every register. |

**Conclusion:** The *skeleton* of the architecture (Constitution + loop structure + state-outside-context + independent validation) is general-purpose. It should be built as a shared core.

---

## What Is Fiction-Specific

These components are meaningful only for fiction (or narrative-like registers):

| Component | Why fiction-specific |
|---|---|
| **CharacterState** (goals, fears, beliefs, memories, perceptualHabits, voice) | Nonfiction has no character consciousness. Business writing has a "writer" but not a character with inner life. |
| **Information Ownership (who knows what)** | Fiction-specific in its *character-knowledge* form. Nonfiction has an analogous concept (source-attribution: which claims are sourced vs. inferred), but the structure differs. |
| **Psychological Causality chain** (State → Attention → Interpretation → Emotion → Intention → Language) | Fiction-specific. Nonfiction causality is logical (premise → evidence → conclusion), not psychological. |
| **Canon classification (HARD/SOFT/HYPOTHESIS/UNKNOWN)** | Fiction-specific in its *story-world* form. Nonfiction has an analogous concept (established facts vs. hypotheses), but the content differs. |
| **DeferredChecks (foreshadowing, mystery clues)** | Fiction/narrative-specific. Nonfiction has long-range mechanisms (argument arcs, case-law chains) but they are structurally different. |
| **INTENTIONALLY_GENERIC detection** | Primarily fiction (depersonalization, shock, stream-of-consciousness). Rare in nonfiction. |

**Conclusion:** The *state content* and the *diagnostic content* are fiction-specific. They should be built as a Fiction Pack that plugs into the shared core.

---

## What Is Nonfiction-Specific (Proposed, Not Yet Executed)

These components were proposed in the research but were NOT validated by this loop. They belong to a future Nonfiction Pack:

| Component | Status |
|---|---|
| **SourceFactLedger** (entity/number/citation extraction, invariance) | Proposed (C-2); needs a nonfiction loop |
| **Faithfulness Gate for assertions** (Article I in its strict nonfiction form: non-entailed = placeholder) | The fiction loop validated the *validator-caught-hallucination* principle; the strict nonfiction form (placeholders for missing specifics) is proposed but not executed |
| **Readability triage** | Proposed (OS); not in fiction loop |
| **Citation integrity** | Proposed; not executed |
| **ESL content/polish separation** | Proposed (C-6); not executed |

---

## The Decision

**The architecture is general-purpose at its core, with register-specific packs.**

```
┌─────────────────────────────────────────────────┐
│  CONSTITUTION (5 articles, always loaded)        │
│  Faithfulness · Independent Validation ·         │
│  Canon/Info-Ownership Integrity ·                │
│  No Fabricated Closure · State Persistence       │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────┐
│  OS CORE (loop skeleton, severity model,         │
│  [CC]/[LJ] staging, logging)                     │
│  Register-agnostic                                │
└──────┬───────────────┬───────────────┬──────────┘
       │               │               │
┌──────▼─────┐  ┌──────▼─────┐  ┌──────▼─────┐
│ FICTION    │  │ NONFICTION │  │ (future    │
│ PACK       │  │ PACK       │  │  packs)    │
│            │  │            │  │            │
│ Character- │  │ SourceFact │  │ Marketing  │
│  State     │  │  Ledger    │  │ Business   │
│ Info Owner │  │ Citation   │  │ Legal      │
│  (who-     │  │  integrity │  │ Academic   │
│   knows)   │  │ Readability│  │ ESL mod.   │
│ Canon      │  │  triage    │  │            │
│  (story)   │  │ Placeholder│  │            │
│ Deferred   │  │  convention│  │            │
│  Checks    │  │            │  │            │
│ Psych.     │  │            │  │            │
│  Causality │  │            │  │            │
└────────────┘  └────────────┘  └────────────┘
```

### Why this decision (not "fiction-first")

A fiction-first architecture would embed CharacterState, Information Ownership, and Canon classification into the core. But execution showed these are *pack content*, not *core mechanics*. The core mechanics that made the fiction loop work — independent validation, state persistence, severity routing, the [CC]/[LJ] split — are register-agnostic. Building them into a fiction-specific core would force every other register to inherit fiction concepts it does not need.

### Why this decision (not "general-purpose with everything built first")

A general-purpose architecture that tried to build all seven packs' state and diagnostics before executing any of them would repeat the previous research's error: producing a large plausible document with no execution validation. Execution proved that even one loop trims the proposal substantially (11 Constitution candidates → 5; 7 state objects → 4; 11-stage loop → 8). Building packs incrementally, each validated by its own loop, is the disciplined path.

### The disciplined path forward

1. **Core (validated):** Constitution v1 (5 articles), OS core (loop skeleton, severity, [CC]/[LJ], logging), Fiction Pack (Character Specificity diagnostic).
2. **Next loop (proposed):** Nonfiction Pack — SourceFactLedger + Faithfulness Gate (strict form) + a nonfiction diagnostic (e.g., citation integrity or specificity-without-hallucination). This would validate C-2 and the strict form of C-1.
3. **Then:** one register at a time, each with its own executed loop. Each loop trims its pack's proposal to what survives execution.
4. **Cross-register concerns (last):** mixed-register detection, stake-primacy casebook, ESL modifier — only after at least two packs are validated, because cross-register logic requires multiple validated registers to reason about.

---

## What This Decision Does NOT Do

- It does not validate the nonfiction pack (proposed only).
- It does not validate cross-register behavior (single-register only).
- It does not commit to the 7-pack structure from the research. Packs are added as their loops validate them; a pack that cannot survive execution is not built.
- It does not reorder the settled priority stack. The Constitution's 5 articles are invariants enforced *on top of* the stack, not a replacement for it.

---

## Final Assessment

The task asked: *"When the system actually has to make one decision, what state, rules, diagnostics, interventions, validations, and logs are genuinely necessary — and which proposed ideas fail when forced to operate?"*

**Necessary (validated):** 5 Constitution articles, 4 state objects, 8 loop stages, independent validation, qualitative severity, [CC]/[LJ] staging, full logging.

**Failed when forced to operate:**
- The intervention generator's self-constraint against invented facts (compensated by independent validation).
- Deferred-mechanism detection via [LJ] alone (needs a [CC] pre-pass).
- The tell-vs-show distinction in the detector (needs prompt refinement).
- 6 of 11 proposed Constitution rules (did not earn their place).
- 3 of 7 proposed state objects (not needed by this loop).

**The smallest real system that survives execution** is: a 5-article Constitution, an 8-stage loop with separated generation and validation, 4 state objects passed explicitly, and a qualitative severity model with no numeric thresholds. Everything else is future work, proposed but not presumed.
