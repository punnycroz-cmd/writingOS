# DELIVERABLE 2 — Operational Proposal Audit

**Question.** For every major proposal in the previous research, does the cited evidence actually justify this specific engine behavior — and does the proposal cause a real, observable change in what the engine does?

A "Feeds decision:" label is not sufficient. A real decision answers: *What does the engine do differently because of this diagnostic?* Real decisions include: accept unchanged, rewrite, rewrite a specific region, request missing information, preserve wording, defer, escalate, reject, log a contradiction, prohibit a specificity increase.

---

## Audit of the 11 Constitution Candidates (C-1 to C-11)

| Proposal | Evidence | Evidence strength | Proposed behavior | Actual decision fed | Real decision? | Verdict |
|---|---|---|---|---|---|---|
| **C-1 Faithfulness Gate** | Maynez 2020 (intrinsic/extrinsic); COPE; SEC substantiation | High | Block non-entailed assertions in nonfiction; emit placeholders | In the executed loop, the independent validator's `faithfulness` check blocked an intervention that invented "127 tiles, 4:15am, 13 pills" (Case A). This is a real decision: the engine retained the original text instead of accepting a hallucinated revision. | **YES — demonstrated** | **Constitution** (validated by execution) |
| **C-2 Source-Fact Ledger Invariance** | Entity-aware generation literature | Medium | Extract entities/numbers/citations pre-rewrite; forbid alteration | The engine would refuse to alter a numeric value during rewriting. Real decision: block numeric drift. | YES — but not yet executed for nonfiction | **NEEDS EXECUTION** (nonfiction loop not yet built) |
| **C-3 No Inventing Sources/Data/Citations** | COPE; ICMJE | High | Absolute prohibition on fabricated citations/data | Real decision: reject any candidate containing an invented citation. | YES — but is a special case of C-1 | **OS** (redundant with C-1 for nonfiction; belongs in OS as the nonfiction-specific enforcement) |
| **C-4 AI-Pattern Diagnostics Advisory** | Liang 2023 | High | Stylometric flags never auto-trigger rewrites overriding obligations | Real decision: suppress auto-rewrite on low burstiness in structured registers. | YES — but not yet executed (no AI-pattern diagnostic in the fiction loop) | **NEEDS EXECUTION** (cross-register) |
| **C-5 Readability Triage Only** | AHRQ; Redish; Wang 2013 | High | Readability = triage signal, never a target or verdict | Real decision: forward to clarity check, never optimize to a score. | YES — but not yet executed (readability not in fiction loop) | **OS** (register-specific; fiction doesn't use readability) |
| **C-6 ESL Content/Polish Separation** | Messick; Politzer-Ahles 2020 | Medium | Two independent scores; polish must not depress rigor | Real decision: report dual scores; do not auto-downgrade content for language. | YES — but not yet executed (ESL path not in fiction loop) | **NEEDS EXECUTION** (ESL path) |
| **C-7 No Default Native-Norm Standard** | Kachru; translingual theory | Medium (theory strong, computation weak) | Correctness defined per register/variety, not per native-norm | Real decision: preserve identity-bearing variation unless Full polish. | YES — but not yet executed | **NEEDS EVIDENCE** (the error/variation classifier is unsolved — see Deliverable 8) |
| **C-8 Mixed-Register Stake-Primacy** | Genre theory (Biber, Bhatia) | Medium (descriptive, not prescriptive) | Regulated-comm > meaning > dominant-register > secondary > intelligibility > voice > AI-pattern | Real decision: resolve inter-register conflicts by stake-primacy. | **UNCLEAR** — the existing priority stack (meaning > register > intelligibility > voice > AI-pattern) already handles most cases; C-8 extends it with "regulated-comm" and "dominant-vs-secondary" layers. The extension is principled but **unvalidated** and **reorders the stack**, which Rule 0.1 forbids without execution-based reason. | **REJECT as Constitution** (it reorders the settled stack); **OS** as a conflict-resolution casebook entry |
| **C-9 No Fabricated Closure** | Bible Part I.III | Medium | Don't auto-generate payoffs for deferred checks | In the executed loop, the DEFER decision preserved the trowel's ambiguity (Case F, though for the wrong reason — see failure analysis). Real decision: surface unresolved DEFERRED items as a review queue. | YES | **Constitution** (load-bearing for long-range integrity) |
| **C-10 State Persistence Outside Context** | Liu 2023 (Lost in Middle); MemGPT | High | Long-range state in a persisted object, not context memory | The executed loop's `DocumentState` object (character, info-ownership, canon, deferred-checks) is passed explicitly to every stage. Real decision: the engine does not rely on the model remembering prior context. | **YES — demonstrated** | **Constitution** (validated by execution) |
| **C-11 Validation Gate Before Deployment** | van der Lee 2019; LLM-as-judge surveys | High | No model change ships without passing regression holdout | Real decision: gate releases. | YES — but is a *process* rule, not an *inference* rule. It does not belong in the always-loaded Constitution. | **OS** (validation subsystem) |

---

## Audit of Key OS Proposals (OS-1 to OS-5)

| Proposal | Real decision? | Verdict |
|---|---|---|
| **OS-1 Document State schema** | YES — the executed loop uses a concrete subset (character, info-ownership, canon, deferred-checks). The full schema (StyleSheet, EntityLedger, etc.) is proposed but only the fiction subset is validated. | **Partially validated** — keep the fiction subset; mark the rest as proposed |
| **OS-2 Inference Decision Loop** | YES — the Character Specificity loop IS a concrete instance of OS-2. The 11-stage loop in the research is more complex than what the fiction loop needed (it had 6 stages). | **Simplified by execution** — see Deliverable 4 |
| **OS-3 Diagnostic Implementation Map** | Partially — the fiction pack row is validated; the other 6 packs are proposed but not executed. | **NEEDS EXECUTION** (per-register) |
| **OS-4 Validation Subsystem** | The independent validation stage IS validated (it blocked Case A). The full subsystem (golden corpus, regression holdout) is not yet built. | **Core validated; full system proposed** |
| **OS-5 Calibration Registry** | The `[CAL]` discipline is maintained. No threshold has been calibrated yet (all remain `[CAL]`). | **Honest — see Deliverable 7** |

---

## Summary Classification

| Verdict | Count | Rules |
|---|---|---|
| **Constitution** (validated by execution) | 3 | C-1, C-9, C-10 |
| **OS** (operational, not constitutional) | 4 | C-3, C-5, C-8 (as casebook), C-11 |
| **NEEDS EXECUTION** (promising, not yet demonstrated) | 3 | C-2, C-4, C-6 |
| **NEEDS EVIDENCE** (the underlying capability is unsolved) | 1 | C-7 |
| **REJECT** (as Constitution; may survive as OS) | 0 | (C-8 rejected from Constitution, retained in OS) |

**Key finding.** Only 3 of 11 proposed Constitution rules are validated by execution as load-bearing inference-time invariants: **C-1 (Faithfulness Gate), C-9 (No Fabricated Closure), C-10 (State Persistence)**. The rest are either OS-level mechanisms, process rules, or unvalidated proposals. The previous research's instinct to promote 11 rules to the Constitution was overgenerous; execution trimmed it to 3.
