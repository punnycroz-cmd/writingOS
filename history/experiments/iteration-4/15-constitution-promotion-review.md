# DELIVERABLE 15 — Constitution Promotion Review

**Rule (Section 19).** A provisional Constitution article may be promoted only if there is now concrete execution evidence that: (1) violating it causes an actual failure; (2) the rule prevents that failure; (3) it belongs at constitutional level rather than OS level; (4) it is not merely a local implementation detail.

Do not expand the Constitution just because new concepts appeared.

---

## The Provisional Constitution (from Iteration 1)

Five articles were promoted in Iteration 1:

| Article | Iteration 1 status | Iteration 2 evidence | Verdict |
|---|---|---|---|
| **I — Faithfulness** (no invented specifics; enforced by independent validation) | DEMONSTRATED (v1 Case A) | Further demonstrated: DF2, T1b, CT1 blocked for faithfulness. BUT: IO2 shows the validator is lenient on "reasonable" inventions (UNCLEAR=pass). The gate works for obvious inventions; it leaks for plausible ones. | **RETAIN** — still load-bearing; the leniency is a calibration issue, not a structural failure |
| **II — Independent Validation** (generation does not validate itself) | DEMONSTRATED (v1 Case A) | Further demonstrated: 3 cases (DF2, T1b, CT1) where generator produced interventions it believed valid and validator blocked. Also 1 case (IO2) where validator was lenient — showing validation is necessary but not sufficient. | **RETAIN** — the core structural guarantee |
| **III — Canon/Info-Ownership Integrity** (no canon contradictions; no info leaks; CRITICAL routing) | DEMONSTRATED for canon (v1 Case E, v2 CV1). NOT DEMONSTRATED for info-ownership under leak pressure. | Canon: CV1 ✅. Info-ownership: IO1/IO2 did not leak, but the gate was not exercised (generator chose safe paths). The `unknown` list is structurally sound and the validator checks it, but no leak was produced to catch. | **RETAIN (canon); PARTIALLY RETAIN (info-ownership)** — the info-ownership half is structurally present but empirically untested under adversarial leak pressure |
| **IV — No Fabricated Closure** (don't auto-resolve deferred mechanisms) | DEMONSTRATED by restraint (v1 Case F outcome was safe despite detection failure) | v2 DF1: the [CC] pre-pass now actively enforces this (forces DEFERRED_CONTEXT). Stronger evidence than v1. | **RETAIN** — now actively enforced, not just passively |
| **V — State Persistence** (state outside context window) | DEMONSTRATED (all v1 stages used explicit state) | v2 T1a/T1b/T1c: state transitions logged and affect later decisions. The temporal dimension is now demonstrated. | **RETAIN** — stronger evidence |

---

## New Candidates from Iteration 2

Iteration 2 introduced new concepts. Do any deserve constitutional promotion?

| Candidate | What it does | Execution evidence | Promote? |
|---|---|---|---|
| **[CC] Deferred-anchor pre-pass** | Deterministic substring cross-reference forces DEFERRED_CONTEXT | DF1 repaired (v1 failure fixed); DF3 paraphrase not caught | **NO — OS.** This is an implementation mechanism for enforcing Article IV. It belongs in the OS, not the Constitution. The Constitution says "don't fabricate closure"; the OS says "use a [CC] pre-pass to detect anchors." If a better mechanism is found later, the OS changes; the Constitution stays. |
| **[CC] Supported-specificity check** | Extracts numbers/proper-nouns; flags unsupported | Caught invented numbers in DF2, T1b, CT1, IO2. Has false positives ("Papas" artifact). | **NO — OS.** An implementation mechanism for enforcing Article I. The Constitution says "no invented specifics"; the OS says "extract numbers and check." |
| **[CC] Canon-keyword alert** | Flags HARD_CANON sensory contradictions | Reinforced CV1 detection | **NO — OS.** A recall booster, not a constitutional rule. |
| **Temporal state transitions** | Log unknown→suspects→knows and HYPOTHESIS→SOFT_CANON→HARD_CANON | T1a/T1b/T1c and CT1 demonstrated | **NO — OS.** The Constitution (Article V) already requires state persistence. How transitions are logged is an OS detail. |
| **Severity model (NONE/MINOR/MATERIAL/CRITICAL)** | Qualitative routing | Routed all 16 cases correctly | **NO — OS.** A decision mechanism, not an invariant. The Constitution doesn't need to specify the severity levels. |
| **Region-scoped intervention** (proposed, not implemented) | Accept/reject per-region instead of all-or-nothing | CT1 showed the need (false reject of a legitimate David reference blocked by unrelated "2:17 AM") | **NO — OS (proposed).** Not yet implemented; belongs in the OS when built. |

---

## Demotions

No article is demoted. All five provisional articles retained their load-bearing status under Iteration 2 evidence. The info-ownership half of Article III is the weakest (empirically untested under leak pressure), but the structural mechanism is sound and the canon half is strongly demonstrated. Demotion would require evidence that the rule does NOT prevent a failure it claims to prevent — no such evidence emerged.

---

## What the Constitution Does NOT Contain (confirmed)

- No priority-stack reordering (the settled v4 stack is preserved).
- No psychological-causality promotion (it remains an L1 fiction-generation principle, not a constitutional article).
- No information-ownership promotion (it remains a state/constraint mechanism under Article III, not a standalone article).
- No severity model (OS-level).
- No deterministic-check specifics (OS-level).
- No calibration thresholds (all remain `[CAL]`).

---

## Final Constitution Status (post-Iteration 2)

The Constitution remains **5 articles**, unchanged from Iteration 1:

1. **Faithfulness** — no invented specifics; enforced by independent validation
2. **Independent Validation** — generation does not validate itself
3. **Canon/Info-Ownership Integrity** — no canon contradictions; no info leaks; CRITICAL routing
4. **No Fabricated Closure** — don't auto-resolve deferred mechanisms
5. **State Persistence** — state outside the context window

**No promotions. No demotions. No new articles.** The Constitution is stable. The OS grew (deterministic layer, temporal state, richer logging); the Constitution did not. This is the correct outcome: execution evidence refined the OS, but did not reveal new constitutional-level invariants.
