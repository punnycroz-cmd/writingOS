# Worklog: Writing Bible v4 Research & Decomposition

## Task Context
The user maintains a hierarchical writing specification ("Writing Bible v4") that drives an AI rewriting engine across seven registers. The document needs decomposition into three artifacts:
1. **Constitution**: ~2 pages of irreducible rules loaded every inference call
2. **Operating System**: decision loops, state model, per-pack diagnostics
3. **Compendium**: evidence, sources, research log — never loaded by default

**Philosophy layer is SETTLED** — do NOT re-review or critique Part I (Governing Principle, Naturalness, Outcome-Based Diagnostics, Hierarchy L1-L5, Evidence Strength Tags, ESL Fairness Principle, Purpose).

## Current State of Writing Bible v4 (from uploaded docx)
- Part I: Core Philosophy & Hierarchy (SETTLED)
- Part II: Register Framework (dimensions: formality, purpose, technicality, emotionality, medium)
- Part III: Fiction Pack (L1-L4)
- Part IV: Marketing & Brand Pack (L1-L4)
- Part V: Business & Professional Pack (L1-L4)
- Part VI: Academic & Research Pack (L1-L4)
- Part VII: Legal & Compliance Pack (L1-L4)
- Part VIII: AI-Pattern Module (Uniformity, Genericness, Template Flow, Stylometric Signature + Fairness Clause + Register-Specific Adjustments)
- Part IX: SEO & Conversational Packs (optional)
- Part X: ESL Support Modifier
- Part XI: Engine Architecture (spec summary)

## Known Gaps (from user)
- Non-operational diagnostics (L4 checks are descriptive, not implementable)
- No worked examples
- No state architecture
- No validation protocol
- Hallucination risk from "increase specificity" instructions in nonfiction registers

## Research Objectives (7 topics)
1. Computed Diagnostic Metrics (MTLD, MATTR, HD-D, PATTR, sentence-length burstiness, passive voice, n-gram, readability, function-word) — NO numeric thresholds, flag calibration points
2. Authoritative Standards per Register (business, legal, academic, marketing)
3. Hallucination Guardrails in Rewriting Systems
4. State Architecture for Long-Range Diagnostics
5. Mixed-Register Texts (genre/register theory, priority resolution, primary/secondary detection)
6. Validation Methodology (golden datasets, human eval, adversarial cases, LLM-as-judge, monitoring)
7. ESL Writing Assessment (content vs. polish, fairness frameworks, graded intervention)

## Constraints (ALL agents must follow)
- Cite all sources with durable identifiers (DOIs, stable URLs)
- Do NOT re-review or critique the philosophy layer
- Do NOT propose numeric thresholds without calibration data
- Every proposal must name the decision it feeds (what the engine does differently)
- Separate computed diagnostics (numeric metrics) from LLM-judged diagnostics (model evaluation) explicitly
- If a topic has insufficient research, say so rather than speculating
- Confidence levels: high / medium / low per claim

## Agent Assignments
- Task ID 1: Computed Diagnostic Metrics
- Task ID 2: Authoritative Standards per Register
- Task ID 3: Hallucination Guardrails in Rewriting Systems
- Task ID 4: State Architecture for Long-Range Diagnostics
- Task ID 5: Mixed-Register Texts
- Task ID 6: Validation Methodology
- Task ID 7: ESL Writing Assessment

All agents run in parallel. Final synthesis (Constitution Additions, OS Components, Research Gaps) done by orchestrator after all agents return.

---
Task ID: ORCHESTRATOR (all topics)
Agent: Main orchestrator (Z.ai Code)
Task: Synthesize Writing Bible v4 research deliverable across 7 topics, producing Constitution Additions, OS Components, and Research Gaps.

Work Log:
- Read uploaded `Untitled document (2).docx` (Master Writing Bible v4) via Python zipfile/XML extraction to understand current state; confirmed Part I philosophy is settled and must not be re-reviewed.
- Attempted to delegate 7 topics to parallel general-purpose subagents; all 7 exceeded max-turns/context-deadline limits (the deep multi-search task is too heavy for the parallel-agent approach in this environment).
- Pivoted to direct research: loaded web-search skill, ran ~30 targeted web_search CLI queries across all 7 topics, verifying durable identifiers (DOIs, arXiv IDs, ACL Anthology IDs, statute citations, government URLs).
- Key sources verified: McCarthy & Jarvis 2010 (MTLD/HD-D, DOI 10.3758/BRM.42.2.381); Bestgen 2023 (arXiv:2307.04626); Maynez et al. 2020 ACL (aclanthology.org/2020.acl-main.173); Krysciński et al. FactCC (aclanthology.org/2020.emnlp-main.750); Scialom et al. QuestEval (aclanthology.org/2021.emnlp-main.529); Goyal & Durrett DAE (arXiv:2104.04302); Liu et al. Lost-in-the-Middle (arXiv:2307.03172); Packer et al. MemGPT (arXiv:2310.08560); Liang et al. 2023 Patterns (doi 10.1016/j.pattre.2023.100779); van der Lee et al. 2019 INLG (aclanthology.org/W19-8643); Krippendorff α (k-alpha.org); SEC Plain English Rule 17 CFR 230.421; EU Joint Practical Guide; SARAL Manual (Vidhi); COPE retraction guidelines; FTC Endorsement Guides 2023; Politzer-Ahles 2020 (JEAP); Soler 2021 (ERPP); Kachru/Pakir 2019 (doi 10.1111/weng.12399); Kunnan TFF (via Isbell 2023, Banerjee 2016); Biber 1988/1995 (Cambridge); Horner/Lu/Matsuda translingual.
- Synthesized all findings into `/home/z/my-project/writing-bible-v4-research.md` (946 lines, ~115KB).

Stage Summary:
- Deliverable structure: Part A (7 topics, each with summary, key sources with durable IDs, confidence-tagged claims, research-settled-vs-calibration split, spec proposals, open questions) + Part B (11 Constitution additions C-1..C-11) + Part C (5 OS components OS-1..OS-5) + Part D (10 research gaps D-1..D-10) + confidence summary table.
- Constraint compliance verified: 61 unique cited URLs, 11 DOIs (+ arXiv/ACL/statute IDs), 62 [CAL] flags (no numeric threshold proposed without calibration), [CC]/[LJ] computed-vs-LLM-judged separation throughout, confidence tags 59[H]/31[M]/3[L], every spec proposal names its "Feeds decision", philosophy layer untouched.
- Highest-value output: C-1 Faithfulness Gate — directly resolves the known "increase specificity" hallucination gap in nonfiction, grounded in Maynez 2020 intrinsic/extrinsic taxonomy + COPE fabrication definitions + SEC substantiation principle.
- Honest research gaps: foreshadowing/long-range mechanism detection (no prior art); error-vs-variation ESL classification (unsolved); inter-register conflict resolution (under-researched); rewriting-specific factuality metrics (unproven adaptation from summarization).
- Note: This was a research/writing task, NOT a website-development task, so no cron webDevReview task was created (per the conditional instruction).
