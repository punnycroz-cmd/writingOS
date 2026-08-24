# DELIVERABLE 21 — Constitution Promotion Review v2

**Rule (Section 19, restated).** A provisional Constitution article may be promoted only if there is now concrete execution evidence that: (1) violating it causes an actual failure; (2) the rule prevents that failure; (3) it belongs at constitutional level rather than OS level; (4) it is not merely a local implementation detail.

Do not expand the Constitution just because new concepts appeared.

---

## The Provisional Constitution (5 articles, from Iterations 1–2)

| Article | Iteration 2 status | Iteration 3 evidence | Verdict |
|---|---|---|---|
| **I — Faithfulness** | DEMONSTRATED (v1 Case A, v2 DF2/T1b/CT1) | Iteration 3: 10/10 unsupported-specificity cases rejected (FAITH-1–10). The exact Iteration 2 failure (plausible vitals, CONF-2) is now caught. 1 residual false negative (CONF-3, semantic invention). | **RETAIN** — stronger evidence; the gate is substantially more robust |
| **II — Independent Validation** | DEMONSTRATED | Iteration 3: the [LJ] validator was the sole subject of testing (40 cases, no generator). It demonstrated the ability to catch leaks (14/14) and unsupported specifics (10/10). The [CC] layer is a backstop, not a replacement. | **RETAIN** — the core structural guarantee, now with direct evidence |
| **III — Canon/Info-Ownership Integrity** | PARTIALLY DEMONSTRATED (canon ✅, info-ownership untested) | Iteration 3: **info-ownership now DEMONSTRATED.** 14/14 leak forms caught. State-constraint tests (UNKNOWN/SUSPECTS/KNOWS) produce correct different outcomes. The gate works under adversarial leak pressure. | **RETAIN (both halves now demonstrated)** |
| **IV — No Fabricated Closure** | DEMONSTRATED by restraint | Not retested in Iteration 3 (no deferred cases in the adversarial matrix). v2 DF1 evidence stands. | **RETAIN** — unchanged |
| **V — State Persistence** | DEMONSTRATED | Not retested in Iteration 3 (state was passed explicitly per case). v2 T1a/T1b/T1c evidence stands. | **RETAIN** — unchanged |

---

## Does Information-Ownership Now Deserve Constitutional Promotion?

**The question.** Iteration 2 left info-ownership as PARTIALLY DEMONSTRATED — structurally present but untested under leak pressure. Iteration 3 closes that gap: 14/14 leak forms caught, state-constraint tests pass. Does this mean info-ownership should become a standalone constitutional article (separate from Article III)?

**Answer: NO.** The evidence supports info-ownership as DEMONSTRATED, but it does not support promoting it to a standalone article. Reasons:

1. **It is already covered by Article III** (Canon/Info-Ownership Integrity). Article III already says "no info leaks; CRITICAL routing." Promoting info-ownership to a standalone article would duplicate Article III without adding safety.

2. **The mechanism that enforces it is OS-level.** The enforcement is: (a) the InformationOwnership state object (OS), (b) the [LJ] validator's infoOwnership check (OS), (c) the [CC] provenance classifier's claim-pattern matching (OS). These are implementation mechanisms, not constitutional invariants. If a better mechanism is found, the OS changes; the Constitution stays.

3. **The constitutional invariant is already stated.** Article III says "no info leaks." How that is enforced (state schema, validator prompt, [CC] patterns) is OS. The Constitution does not need to specify the enforcement mechanism.

4. **Iteration 3 evidence supports the existing article, not a new one.** The evidence says "the info-ownership gate works." It does not say "info-ownership needs a higher authority than Article III." The article is sufficient.

**Verdict: RETAIN Article III as-is. Do not promote info-ownership to a standalone article.**

---

## New Candidates from Iteration 3

Iteration 3 introduced new concepts. Do any deserve constitutional promotion?

| Candidate | What it does | Execution evidence | Promote? |
|---|---|---|---|
| **[CC] Provenance classifier** | Labels specifics as SOURCE/STATE/CANON/UNKNOWN | Correctly classified 40 cases; caught 8/14 IO leaks + 8/10 faithfulness cases as HARD_BLOCK | **NO — OS.** An implementation mechanism for enforcing Article I. The Constitution says "no invented specifics"; the OS says "use provenance classification." |
| **[CC] HARD_BLOCK non-overridable policy** | Deterministic hard violations cannot be overridden by [LJ] | CONF-2 (the Iteration 2 failure) is now caught; 0 false negatives on numeric specifics | **NO — OS.** A decision policy, not an invariant. The Constitution (Article I + II) already requires faithfulness and independent validation. How they combine is OS. |
| **Provenance categories (SOURCE/STATE/CANON/USER/ENTAILED/INFERRED/UNKNOWN)** | The classification vocabulary | Used in 40 cases; the UNKNOWN category is load-bearing | **NO — OS.** A vocabulary, not a rule. The Constitution does not need to name the categories. |
| **UNCLEAR=REJECT on integrity dimensions** | Conservative handling of ambiguity | Resolves the "UNCLEAR=PASS is unsafe" finding (Section 11) | **NO — OS.** A validator-policy choice, not a constitutional invariant. It could be recalibrated. |
| **Hard vs Soft [CC] finding classification** | HARD_BLOCK / SOFT_SIGNAL / ADVISORY | Evidence-based classification (numbers/claims = hard; proper nouns = soft) | **NO — OS.** A classification scheme, not a rule. |

**No new constitutional articles.** All Iteration 3 concepts are OS-level mechanisms that enforce the existing 5 articles.

---

## Demotions

No article is demoted. All 5 retained their load-bearing status under Iteration 3 evidence. Article III (info-ownership half) moved from PARTIALLY DEMONSTRATED to DEMONSTRATED — this strengthens, not weakens, its constitutional status.

---

## Final Constitution Status (post-Iteration 3)

The Constitution remains **5 articles**, unchanged from Iterations 1–2:

1. **Faithfulness** — no invented specifics; enforced by independent validation
2. **Independent Validation** — generation does not validate itself
3. **Canon/Info-Ownership Integrity** — no canon contradictions; no info leaks; CRITICAL routing
4. **No Fabricated Closure** — don't auto-resolve deferred mechanisms
5. **State Persistence** — state outside the context window

**No promotions. No demotions. No new articles.** The Constitution is stable across three iterations. The OS grew (provenance classifier, HARD_BLOCK policy, refined validator prompt, UNCLEAR=REJECT); the Constitution did not. This is the correct outcome: Iteration 3 refined the OS substantially, but did not reveal new constitutional-level invariants — only better mechanisms for enforcing the existing ones.

---

## The Honest Assessment

The Constitution has been stable for three iterations. This suggests one of two things:
1. The 5 articles are genuinely the right constitutional invariants (the architecture is converging).
2. The experiments have not yet stressed an invariant that the 5 articles do not cover.

Iteration 3 stressed information-ownership and faithfulness heavily (40 adversarial cases). Both are covered by existing articles (III and I). No new invariant emerged. This is evidence for interpretation (1): the 5 articles may be sufficient for the fiction Character Specificity diagnostic.

**The limitation of this evidence:** all three iterations tested a single diagnostic (Character Specificity) in a single register (fiction). The Constitution's sufficiency is not tested for other diagnostics or registers. A nonfiction loop or a different fiction diagnostic (tension, voice) could reveal a gap. The Constitution's stability is conditional on the tested scope.
