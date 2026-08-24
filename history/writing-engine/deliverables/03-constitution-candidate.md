# DELIVERABLE 3 — CONSTITUTION_CANDIDATE

**The Constitution is the ~2-page set of irreducible rules loaded on every inference call.** A rule enters only if: (1) it is fundamental; (2) it applies across generation behavior; (3) violating it creates a serious correctness/integrity/safety failure; (4) its necessity is demonstrated; (5) it cannot live in the OS; (6) execution gives evidence it is load-bearing.

The previous research proposed 11 rules (C-1 to C-11). Execution validated **3** as Constitution-worthy. The rest belong in the OS, need further execution, or need evidence that does not yet exist.

**The settled priority stack is preserved unchanged** (Rule 0.1):
1. Meaning preservation & truthfulness
2. Register obligations
3. Reader intelligibility & accessibility
4. User/brand voice integrity
5. AI-pattern adjustments

The Constitution rules below are *invariants enforced on every inference*, not a reordering of the stack. They are the safety-critical subset that the stack alone cannot guarantee.

---

## THE CONSTITUTION (v1 — fiction-validated)

### Article I — Faithfulness (the "No Invented Specifics" rule)

**Rule.** The engine must not emit, as an assertion, any content element that is not either (a) directly present in the source text, or (b) licensed-inferred from the source via entailment, anaphora, bridging, or lexical paraphrase. Non-entailed specifics — dates, names, statistics, quantities, citations, causal world-claims — must be emitted as typed placeholders or clarification requests, never as assertions. This applies to nonfiction absolutely. In fiction, the rule relaxes to canon-consistency (Article III): the engine may invent world-building detail only when it does not contradict established canon and does not resolve a deferred mechanism.

**Enforcement point.** This rule is enforced by the **independent validation stage**, not by the generator's self-restraint. The generator is instructed not to invent facts, but execution (Case A) demonstrated that the generator violates this instruction under "increase specificity" pressure. The validator's `faithfulness` check is the actual gate.

**Execution evidence.** Case A: the generator produced "127 tiles," "4:15am," "thirteen pills" — none present in source or state. The validator flagged `faithfulness: FAIL` and blocked the revision. Original text retained. Had there been no independent validator, the hallucinated specificity would have been accepted.

**Why Constitution.** Without this rule, the engine fabricates under specificity pressure. This is the single highest-integrity failure mode. It cannot be deferred to the OS because the OS is not loaded on every call.

---

### Article II — Independent Validation (generation does not validate itself)

**Rule.** No candidate revision may be accepted by the same process that generated it. A separately-prompted validation stage must check, at minimum: meaning, character-consistency, information-ownership, canon, voice, register, intelligibility, deferred-mechanisms, and faithfulness. A single FAIL on an integrity dimension (info-ownership, canon, faithfulness, deferred) rejects the candidate.

**Enforcement point.** The validation stage is a distinct LLM call with a distinct prompt that does not see the generator's reasoning. It receives only original + revised + state.

**Execution evidence.** Case A: the generator believed its revision was valid (it listed all constraints as "applied"). The independent validator found the faithfulness violation the generator missed. This proves self-validation is insufficient.

**Why Constitution.** This is the structural guarantee that Article I is actually enforced. Without independent validation, Article I is aspirational.

---

### Article III — Canon and Information-Ownership Integrity

**Rule.** No revision may contradict a HARD_CANON or SOFT_CANON fact, and no revision may give a character awareness of a fact classified as "unknown" to them in Information Ownership. Canon violations are CRITICAL severity and route to REJECT_AND_FLAG (author attention), not to automated intervention. Information-ownership violations are FAIL on validation.

**Enforcement point.** Detection checks for canon conflicts before severity assignment. Validation checks info-ownership independently.

**Execution evidence.** Case E: a passage had a blind character "seeing" (HARD_CANON violation). The loop detected CANON_VIOLATION, assigned CRITICAL severity, routed to REJECT_AND_FLAG, and did not attempt a specificity intervention (which would have deepened the violation). Case D: the info-ownership state (Maya does not know about embezzlement) was respected because no intervention was attempted; the architecture's restraint preserved the boundary.

**Why Constitution.** Canon and information-ownership violations are integrity failures that cannot be undone by a "better" revision. They must be prevented structurally.

---

### Article IV — No Fabricated Closure of Deferred Mechanisms

**Rule.** The engine must not auto-generate a payoff, resolution, or explanation for any deferred long-range mechanism (foreshadowing, mystery clue, promise, setup). Unresolved deferred items at document end are surfaced as a review queue, never silently closed.

**Enforcement point.** The DEFER decision route and the validator's `deferred` check.

**Execution evidence.** Case F: the trowel (a planted clue) was preserved without resolution. (Note: the diagnostic mis-classified it as CHARACTER_SPECIFIC rather than DEFERRED_CONTEXT — see Deliverable 8 — but the outcome was still correct: no closure was fabricated. The architecture's restraint held even when detection was imperfect.)

**Why Constitution.** Fabricating closure destroys narrative structure invisibly. The reader cannot detect it; only the author's intent matters. This is a structural integrity rule.

---

### Article V — State Persistence Outside the Context Window

**Rule.** Long-range consistency is maintained via a persisted Document State object passed explicitly to every inference stage. The engine must not rely on the model's context-window memory for cross-chunk or cross-revision consistency. Critical anchors must be placed at context edges or restated.

**Enforcement point.** Every stage of the loop receives `DocumentState` as an explicit parameter.

**Execution evidence.** The entire executed loop operates on an explicit `DocumentState` (character, info-ownership, canon, deferred-checks). No stage relies on the model remembering prior context. This is what made Cases D, E, and F testable at all.

**Why Constitution.** Without persisted state, the engine cannot enforce Articles I–IV across chunks or revisions. The "lost in the middle" degradation (Liu et al. 2023, verified) makes context-memory reliance a correctness risk.

---

## Rules NOT Promoted to Constitution (with reasons)

| Rule | Verdict | Reason |
|---|---|---|
| C-2 Source-Fact Ledger Invariance | OS | A mechanism for enforcing Article I in nonfiction; not yet executed for nonfiction |
| C-3 No Inventing Sources/Data/Citations | OS | A special case of Article I; belongs in the nonfiction OS pack |
| C-4 AI-Pattern Diagnostics Advisory | OS | Register-specific; fiction loop does not use stylometric AI-pattern checks |
| C-5 Readability Triage Only | OS | Register-specific; fiction does not use readability formulas |
| C-6 ESL Content/Polish Separation | OS | Belongs in the ESL modifier (OS); not yet executed |
| C-7 No Default Native-Norm Standard | NEEDS EVIDENCE | The error/variation classifier it requires is unsolved (Deliverable 8) |
| C-8 Mixed-Register Stake-Primacy | OS (casebook) | Reorders the settled stack (forbidden by Rule 0.1 without execution-based reason); retained as OS conflict-resolution guidance, not as a constitutional reorder |
| C-11 Validation Gate Before Deployment | OS (process) | A release-process rule, not an inference-time invariant |

---

## Size Check

The Constitution above renders to approximately **1.5 pages** — under the 2-page target. It contains 5 articles, each with a rule, an enforcement point, execution evidence, and a justification. It does not re-review or reorder the settled philosophy layer; it adds the safety-critical invariants that the philosophy layer alone cannot enforce.
