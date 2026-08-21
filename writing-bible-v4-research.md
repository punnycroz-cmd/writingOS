# Writing Bible v4 — Research Deliverable & Decomposition Proposal

**Scope.** This document surveys current best practice across seven research topics to support the decomposition of *Writing Bible v4* into three artifacts: a **Constitution** (loaded every inference call), an **Operating System** (decision loops, state model, per-pack diagnostics), and a **Compendium** (evidence, sources, research log — never loaded by default).

**Settled, not re-reviewed.** Part I of the existing Bible (Governing Principle, Naturalness, Outcome-Based Diagnostics, Hierarchy L1–L5, Evidence Strength Tags, ESL Fairness Principle, Purpose) is the philosophy layer and is **accepted as settled**. This document does not critique it; it operationalizes around it.

**Method note.** Findings are grounded in web-retrievable sources with durable identifiers (DOIs, ACL Anthology IDs, arXiv IDs, official government URLs, statute citations). Where the literature is thin, the document says so rather than speculating.

**Conventions used throughout.**
- **[CC]** = *Computed diagnostic* — a numeric metric produced by deterministic code (parser, n-gram counter, readability formula).
- **[LJ]** = *LLM-judged diagnostic* — an evaluation requiring a model to render a semantic judgment.
- **[CAL]** = *Calibration-required* — the concept is research-settled, but any numeric threshold must be derived from a local golden corpus; no default number is proposed.
- Confidence tags: **[H]** high, **[M]** medium, **[L]** low.
- "Feeds decision:" = the engine action that changes because of this information.

---

# PART A — PER-TOPIC FINDINGS

---

## TOPIC 1 — Computed Diagnostic Metrics

### 1.1 Lexical Diversity (MTLD, MATTR, HD-D, PATTR, vocd-D)

**Best-practice summary.** Raw Type-Token Ratio (TTR) is strongly confounded by text length (TTR falls as tokens accumulate), which makes it indefensible as a stable writing-quality signal except on length-matched samples. The field has produced several "length-robust" alternatives. **MTLD** (McCarthy, 2005) computes the mean length of consecutive token runs that maintain a TTR above a factor (conventionally .720), averaging forward and backward passes. **HD-D** (McCarthy & Jarvis, 2010) estimates lexical diversity via the hypergeometric distribution: the probability of encountering any given type in a random draw of 42 tokens. **MATTR** (Covadonga/McCarthy & Jarvis) is a moving-window TTR averaged across the text. **vocd-D** (Malvern et al.) is a curve-fitting approach that has been criticized for instability. Meta-analytic and validation studies (Fergadiotis et al., 2013, 2015; Koizumi, 2012; Bestgen, 2023) converge on three findings: (a) no LD measure is *fully* length-independent; (b) MTLD and HD-D are the *least* length-dependent and best behaved for texts in roughly the 100–2,000-token range; (c) all measures degrade or behave unpredictably on very short (<~50 token) or very long texts, and none is validated as a register-quality arbiter — they are vocabulary-richness descriptors, not quality scores.

**Key sources.**
- McCarthy, P. M., & Jarvis, S. (2010). *MTLD, vocd-D, and HD-D: A validation study of sophisticated approaches to lexical diversity assessment.* Behavior Research Methods, 42(2), 381–392. https://doi.org/10.3758/BRM.42.2.381 — foundational validation comparing MTLD, vocd-D, HD-D.
- McCarthy, P. M. (2005). *An assessment of the range and usefulness of lexical diversity measures and the potential of the measure of textual, lexical diversity (MTLD).* [ProQuest]. https://www.proquest.com/docview/305349212 — original MTLD definition.
- Koizumi, R. (2012). *Effects of text length on lexical diversity measures.* System, 40(4), 554–565. https://www.sciencedirect.com/science/article/abs/pii/S0346251X12000887 — systematic length-effect study.
- Bestgen, Y. (2023). *Measuring Lexical Diversity in Texts: The Twofold Length Problem.* arXiv:2307.04626. https://arxiv.org/pdf/2307.04626 — re-opens the length-dependence question; argues MTLD/HD-D still carry residual length effects.
- Fergadiotis, G., Wright, H. H., & Capilouto, G. J. (2015). *Psychometric Evaluation of Lexical Diversity Indices.* https://pdxscholar.library.pdx.edu/cgi/viewcontent.cgi?article=1008&context=sphr_fac — MTLD "minimally related to length" above ~100 tokens.
- Fergadiotis, G. et al. (2013). *Measuring Lexical Diversity in Narrative Discourse.* PMC3813439. https://pmc.ncbi.nlm.nih.gov/articles/PMC3813439 — applied validation in clinical discourse.

**Confidence-tagged claims.**
- TTR is length-confounded and indefensible as a stable signal except on length-matched samples. **[H]** — repeatedly replicated (Koizumi 2012; Bestgen 2023).
- MTLD and HD-D are the least length-dependent of available measures for the 100–2,000-token range. **[H]** — McCarthy & Jarvis 2010; Fergadiotis 2015.
- No LD measure is fully length-independent; residual length effects persist even in MTLD/HD-D. **[M]** — Bestgen 2023 complicates the older "length-robust" framing.
- LD measures describe vocabulary richness; they are **not** validated as writing-quality scores or as AI-text discriminators in their own right. **[H]** — these measures were developed for vocabulary assessment, not detection.
- MATTR is preferable to TTR when a windowed running estimate is needed, but its window size is a free parameter that affects results. **[M]**.

**Research-settled vs. calibration-required.**
- *Settled:* MTLD and HD-D are the defensible primary measures; TTR alone is not.
- *Calibration-required:* (a) the MTLD factor and HD-D sample-draw size (defaults .720 / 42 are conventions, not validated optima for each register) **[CAL]**; (b) any "low diversity" flag threshold **[CAL]**; (c) which measure performs best on *this* engine's register-specific corpora (legal/academic prose will have lower LD by nature; fiction/marketing higher) **[CAL]**; (d) behavior on texts outside 100–2,000 tokens must be locally validated **[CAL]**.

**Spec proposals (computed diagnostics).**
- **LD-1.** The engine MUST compute lexical diversity using MTLD as the primary measure and HD-D as a corroborating measure. TTR MUST NOT be used as a standalone signal. *Feeds decision: whether to flag a passage as lexically monotonous.*
- **LD-2.** The engine MUST NOT emit a lexical-diversity "score" on passages shorter than [CAL: locally validated minimum, expected ~50–100 tokens] or longer than [CAL: locally validated maximum], because measure validity degrades outside that band.
- **LD-3.** LD diagnostics MUST be register-stratified: the same MTLD value means different things in a methods section (low is normal) vs. a marketing hook (low is a problem). Baselines per register **[CAL]**.
- **LD-4.** LD diagnostics are **advisory** ([CC]) and MUST NOT be the sole trigger for an automatic rewrite; they feed the LLM-judged diagnostic layer that decides whether monotony is purposeful.

**Open questions / conflicts.**
- Bestgen (2023) re-opens whether MTLD is as length-robust as claimed; engine should treat LD measures as approximate, not authoritative.
- There is **no** peer-reviewed threshold for "AI-like" lexical diversity; any such claim is convention, not evidence. **[L]**

---

### 1.2 Sentence-Length Distribution and Burstiness

**Best-practice summary.** "Burstiness" — variability in sentence length and structure across a passage — entered the public AI-detection vocabulary around 2022–2023 as a heuristic claimed to distinguish human from AI prose (humans vary more; AI is more uniform). The concept originates in network traffic analysis (lengths of inter-arrival times) and was analogized to prose without rigorous psychometric validation. The defensible, well-established part is narrow: sentence-length standard deviation and coefficient of variation are computable [CC] descriptors of rhythm. The indefensible part is the strong claim that "low burstiness ⇒ AI-generated" — this is not supported by peer-reviewed evidence and is confounded by register (legal/academic/technical prose is *legitimately* uniform; see Topic 6 adversarial cases). Feature-importance studies in AI-text detection do identify sentence-length and function-word-bigram features as discriminative *in aggregate*, but as one feature among many, with high false-positive rates on structured human text.

**Key sources.**
- Tarım, İ., & Onan, A. (2025). *Feature-Based Detection of AI-Generated Text: An Analysis of Stylometric and Perplexity Markers in Contemporary Large Language Models.* arXiv:2507.10475. https://arxiv.org/html/2507.10475v1 — feature-importance analysis; average sentence length and function-word-bigram frequency are discriminative features, but in ensemble, not as standalone signals.
- Liang, W. et al. (2023). *GPT detectors are biased against non-native English writers.* Patterns, 4(7), 100779. https://doi.org/10.1016/j.pattre.2023.100779 (arXiv:2304.02819). https://arxiv.org/abs/2304.02819 — demonstrates the false-positive catastrophe of stylometric detectors, especially on ESL prose.

**Confidence-tagged claims.**
- Sentence-length SD and CV are computable, stable descriptors. **[H]**.
- "Low burstiness ⇒ AI" is **not** a validated diagnostic; it is a popular heuristic. **[H]** — absence of validating evidence; counter-evidence from false-positive studies.
- Burstiness is register-confounded: structured registers are legitimately uniform. **[H]** — see Topic 6 / Liang 2023.
- Meaningful "variation" must be distinguished from noise (a single very short sentence among long ones may be a deliberate beat, not a signal to "smooth"). This distinction is not computable; it requires judgment. **[M]**.

**Research-settled vs. calibration-required.**
- *Settled:* burstiness is at most an *advisory* feature; it must not be a punitive AI-detection trigger.
- *Calibration-required:* per-register baseline sentence-length distributions **[CAL]**; the minimum passage length over which SD is meaningful **[CAL]**.

**Spec proposals.**
- **SL-1.** The engine MAY compute sentence-length mean, SD, and CV as [CC] descriptors. It MUST NOT label a passage "AI-like" on this basis alone. *Feeds decision: whether to surface a rhythm-variance note to the LLM-judged layer.*
- **SL-2.** The engine MUST apply an ESL/structured-register override: if the text is flagged ESL or belongs to a structured register (legal, academic methods, technical spec), low burstiness MUST NOT trigger a genericity revision. *Feeds decision: whether to suppress the AI-pattern "uniformity" flag.*
- **SL-3.** The distinction "purposeful rhythmic variation vs. noise" MUST be deferred to an [LJ] pass, not computed.

**Open questions.** No validated measure of "meaningful" (as opposed to statistical) burstiness exists; this is an open methodological gap.

---

### 1.3 Passive-Voice Detection and Per-Register Baselines

**Best-practice summary.** Reliable automated passive-voice detection requires syntactic parsing (dependency or constituency parse identifying a `be`/`get` auxiliary + past-participle main verb, optionally with a `by`-agent); surface heuristics ("was X-ed") miss passives and false-positive on adjectives. PassivePy (Samadi et al., 2023) is a validated Python tool built on spaCy dependency parses. Crucially, passive-voice frequency is **register-dependent and legitimately variable**: corpus studies of scientific writing find median passive-sentence frequencies around 20–26%, with some articles reaching 46–47% (Baratta, cited via JCOM 2014). Methods sections use passive heavily (procedure-focused, agent-omitted); introductions and discussions use it less. Legal drafting guidelines (Topic 2) recommend active voice *as a default* but do not prohibit passive where it serves focus or hides an irrelevant agent. Therefore: detection is a solved [CC] problem; **interpretation requires a per-register baseline**, and a single global threshold is indefensible.

**Key sources.**
- Samadi, A. et al. (2023). *PassivePy: A tool to automatically identify passive voice in big text data.* Journal of Computer-Mediated Communication, 28(3). https://doi.org/10.1002/jcpy.1377 — validated dependency-parse passive detector.
- Baratta, A. M. (2009/2014). *The passive voice in scientific writing. The current norm in science.* JCOM 13(1). https://jcom.sissa.it/article/494 — corpus baseline for scientific passive frequency.

**Confidence-tagged claims.**
- Dependency-parse detection of passive voice is reliable. **[H]** — PassivePy validated.
- Passive frequency is register-dependent; scientific methods sections legitimately run 20–46%. **[H]**.
- A single global "too much passive" threshold is indefensible. **[H]**.

**Research-settled vs. calibration-required.**
- *Settled:* use dependency parsing; do not use surface regex.
- *Calibration-required:* per-register passive baselines (business, legal, academic-methods, academic-discussion, marketing) **[CAL]**; the threshold at which passive frequency becomes a clarity problem in *each* register **[CAL]**.

**Spec proposals.**
- **PV-1.** The engine MUST detect passive voice via dependency parse (PassivePy-compatible), not surface heuristics. *Feeds decision: computing the passive-voice [CC] descriptor per passage.*
- **PV-2.** Passive-frequency diagnostics MUST be compared against the *register-specific* baseline, not a global threshold. If no calibrated baseline exists for the detected register, the engine MUST emit the raw proportion with a "no baseline" note rather than a flag. *Feeds decision: whether to flag excessive passive use.*
- **PV-3.** In legal and academic-methods registers, passive MUST NOT be treated as a defect by default; it is flagged only when it obscures agency that the reader needs (an [LJ] judgment). *Feeds decision: suppressing default passive-voice flags in agent-irrelevant contexts.*

**Open questions.** No peer-reviewed per-register passive baselines exist for business or marketing prose specifically; these must be locally derived.

---

### 1.4 Repetition and N-gram Measures

**Best-practice summary.** Two repetition signals are defensible: (a) **content-word repetition** within a passage (a proxy for lexical monotony distinct from LD — LD is about *types*, repetition is about *recurrence*); (b) **function-word / sentence-opener n-grams** (e.g., repeated "First,… Second,… Finally,…" skeletons = "Template Flow" in the existing Bible). Both are [CC]. The signal/noise distinction is register-dependent: legal documents legitimately repeat defined terms verbatim; marketing copy legitimately repeats brand names; academic prose repeats methodology terms. Repeated *rhetorical* skeletons (transition templates, paragraph openers) are the more reliable AI-pattern signal, but even these are conventional in some registers (executive summaries, methods sections). N-gram overlap with external training corpora is a separate concern (plagiarism/derivation) and not a writing-quality diagnostic.

**Confidence-tagged claims.**
- Content-word repetition and sentence-opener n-gram repetition are computable and informative as [CC] descriptors. **[M]** — convention-supported, limited independent validation.
- Repeated rhetorical skeletons ("Template Flow") are a more reliable AI-pattern cue than content-word repetition. **[M]**.
- Definitional/term repetition is legitimate and must not be flagged. **[H]** — drafting convention.

**Research-settled vs. calibration-required.**
- *Settled:* compute both content-word and opener n-gram repetition; exempt defined terms and brand names.
- *Calibration-required:* n-gram order (bigram vs. trigram of openers) **[CAL]**; the frequency threshold for flagging **[CAL]**; the defined-term allowlist per document (must be derived from the document's own Definitions section) **[CAL]**.

**Spec proposals.**
- **NG-1.** The engine MUST compute (a) content-word repetition rate, (b) sentence-opener n-gram repetition, with `n` = **[CAL]**, and MUST maintain a per-document Defined-Terms allowlist (extracted from any Definitions section) that is exempt from repetition flagging. *Feeds decision: distinguishing genericity from legitimate term repetition.*
- **NG-2.** "Template Flow" detection MUST target *rhetorical* skeletons (transition + paragraph-opener patterns), not content n-grams, and MUST be advisory. *Feeds decision: flagging templated structure.*

**Open questions.** No validated taxonomy of "AI-template" rhetorical skeletons exists across registers.

---

### 1.5 Readability Formulas (Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau, Dale-Chall, LIX)

**Best-practice summary.** Readability formulas compute a grade-level or ease score from surface features (sentence length, word length / syllable count, sometimes a familiarity wordlist). They are widely used in business, health, and legal contexts to set *targets*, but the research consensus is emphatic that they **do not measure comprehension**. The US Agency for Healthcare Research and Quality (AHRQ) explicitly warns that "readability formulas completely ignore most factors that contribute to ease of reading"; Redish and other plain-language authorities document that different formulas applied to the *same text* can vary by up to 5 grade levels. Valid uses: (a) as a *triage* signal ("this passage is syntactically dense — examine it"); (b) as a *monitoring* metric over a corpus (drift detection), not as a quality verdict. Invalid uses: (a) treating a formula score as proof of comprehensibility; (b) optimizing prose *to* a formula (produces short-choppy text that may be *less* comprehensible). For per-register defensibility: business/health → Flesch-Kincaid or Flesch Reading Ease as a triage signal only; legal → SMOG (designed for health/legibility and validated on a 100% sample, more stable on short texts); academic → readability formulas are largely inappropriate (technical vocabulary inflates scores misleadingly).

**Key sources.**
- AHRQ. *Tip 6. Use Caution With Readability Formulas for Quality Reports.* https://www.ahrq.gov/talkingquality/resources/writing/tip6.html — official caution that formulas do not measure comprehension.
- Redish, J. (2019). *Readability Formulas: Seven Reasons to Avoid Them and What to Do Instead.* https://www.effortmark.co.uk/readability-formulas-seven-reasons-to-avoid-them-and-what-to-do-instead — practitioner synthesis of the limitations.
- Wang, L. et al. (2013). *Assessing readability formula differences with written health information.* Patient Education and Counseling. https://www.sciencedirect.com/science/article/abs/pii/S1551741112000770 — up-to-5-grade-level divergence across formulas on the same text.

**Confidence-tagged claims.**
- Readability formulas do not measure comprehension; they measure surface features. **[H]** — AHRQ, Redish, multiple studies.
- Different formulas diverge by up to ~5 grade levels on the same text. **[H]** — Wang et al. 2013.
- Formulas are defensible as *triage* and *monitoring* signals, indefensible as quality verdicts or optimization targets. **[H]**.
- In academic/technical registers, readability formulas are misleading (technical vocabulary inflates scores). **[M]** — strong practitioner consensus.

**Research-settled vs. calibration-required.**
- *Settled:* use as triage/monitoring only; never as a target or a verdict; report multiple formulas to surface divergence.
- *Calibration-required:* any per-register "concerning" band **[CAL]**; which formula(s) to prioritize per register **[CAL]** (with the academic caveat above).

**Spec proposals.**
- **RF-1.** The engine MAY compute readability as a [CC] *triage* signal but MUST report at least two formulas (to surface divergence) and MUST label the result "surface-density estimate, not a comprehension measure." *Feeds decision: whether to forward a passage to the [LJ] clarity check.*
- **RF-2.** The engine MUST NOT optimize prose toward a readability target number. *Feeds decision: forbidding score-maximizing rewrites that produce choppy, less-comprehensible text.*
- **RF-3.** In academic and technical registers, readability formulas MUST be suppressed or heavily caveated. *Feeds decision: avoiding false clarity flags on legitimate technical prose.*
- **RF-4.** For legal registers, the engine MAY use SMOG (sample-stable) as a monitoring metric over a corpus, never as a per-clause verdict. *Feeds decision: corpus-level drift monitoring.*

**Open questions.** No formula is validated for ESL audiences specifically; ESL readers' comprehension is affected by factors formulas ignore (idiom load, cultural reference density).

---

### 1.6 Function-Word Frequency Analysis

**Best-practice summary.** Function-word (closed-class: articles, prepositions, pronouns, auxiliaries, conjunctions, determiners) frequency vectors are the foundation of stylometry and authorship attribution (Mosteller & Wallace, 1963; Burrows' Delta, 2002) precisely because they are largely *topic-independent* and *unconsciously* produced. Biber's multidimensional register analysis (see Topic 5) is built largely on function-word and function-word-like feature counts. For a writing engine, function-word analysis is defensible for two purposes: (a) **register classification** (Biber-style dimensions); (b) **author/voice profiling** (a style sheet derived from user samples). It is **not** defensible as a standalone AI-detection signal — function-word distributions vary by register more than by authorship-vs-AI, producing false positives on structured text.

**Confidence-tagged claims.**
- Function-word frequencies are relatively topic-stable, making them useful for register and voice profiling. **[H]** — foundational stylometry.
- Function-word distributions vary by register more than by human-vs-AI origin. **[H]** — Biber's framework.
- Function-word analysis alone is not a defensible AI-detection signal. **[M]** — inferred from false-positive evidence (Liang 2023).

**Research-settled vs. calibration-required.**
- *Settled:* use for register classification and voice profiling, not standalone AI detection.
- *Calibration-required:* the specific feature inventory per register **[CAL]**; voice-profile baselines per user/brand **[CAL]**.

**Spec proposals.**
- **FW-1.** The engine MAY compute function-word frequency vectors for (a) Biber-style register classification and (b) per-user voice profiling. It MUST NOT use function-word vectors as a standalone AI-text signal. *Feeds decision: register detection and voice-sheet construction.*
- **FW-2.** Voice profiling from function words MUST be derived from user-supplied samples and treated as a *style target*, not a correctness standard. *Feeds decision: building the StyleSheet state object (see Topic 4).*

**Open questions.** How function-word profiles shift under ESL influence is under-researched; ESL voice profiling risks misclassifying legitimate variation as deviation.

---

## TOPIC 2 — Authoritative Standards per Register

### 2.1 Business Writing

**Best-practice summary.** The authoritative anchor for US business/government writing is the **Plain Writing Act of 2010** (Pub.L. 111-274), which requires federal agencies to use plain language in documents covered by the Act, and which created the Plain Language Action and Information Network (PLAIN) and the Federal Plain Language Guidelines at plainlanguage.gov. The Act does not prescribe numeric readability scores; it prescribes *practices* (audience-centered organization, short sentences, common words, "you" and "we," active voice, no hidden conditions). Major business frameworks (BLUF — Bottom Line Up Front; Minto Pyramid) are *convention*, not statute, and their evidence base is practitioner experience rather than controlled trials. The defensible posture: the engine's business pack should align to the Federal Plain Language Guidelines (authoritative, citable) and treat BLUF/Pyramid as L2 heuristics (helpful, not mandatory).

**Key sources.**
- Plain Writing Act of 2010, Pub.L. 111-274. https://www.digital.gov/guides/plain-language/ and https://www.govinfo.gov/ — statutory anchor.
- PLAIN / Federal Plain Language Guidelines. https://www.plainlanguage.gov/guidelines/ — operational practice standard.

**Confidence-tagged claims.**
- The Plain Writing Act of 2010 requires plain language in covered federal documents. **[H]** — statute.
- The Act prescribes practices, not numeric readability scores. **[H]** — statutory text.
- BLUF and Minto Pyramid are convention, not evidence-validated standards. **[M]**.

**Research-settled vs. calibration-required.**
- *Settled:* align business pack to Federal Plain Language Guidelines; treat BLUF as L2.
- *Calibration-required:* any per-document-type targets (e.g., sentence length for an exec summary vs. a procedure manual) **[CAL]**.

**Spec proposals.**
- **BIZ-1.** The Business pack's L2 heuristics MUST be traceable to the Federal Plain Language Guidelines (audience-first organization, active voice default, short sentences, common words, no hidden conditions). *Feeds decision: which plain-language checks are operationalized as L4 [CC]/[LJ] diagnostics.*
- **BIZ-2.** Readability *practices* (short sentences, common words) are L1-adjacent; readability *numbers* are [CC] triage only (RF-1). *Feeds decision: separating practice checks from numeric checks.*

**Open questions.** No controlled trial validates BLUF over alternatives for comprehension; it is convention.

---

### 2.2 Legal Drafting

**Best-practice summary.** The plain-language movement in law is now institutionalized across multiple jurisdictions. **US:** the **SEC Plain English Rule** (17 CFR § 230.421(b)–(d)) requires the front and back cover, summary, and risk factors of prospectuses to be drafted in plain English per specified principles (short sentences, active voice, everyday words, tabular presentation, no legal jargon). The **Plain Writing Act of 2010** extends to federal regulatory drafting. **UK:** the Office of the Parliamentary Counsel maintains drafting guidance; **Clarity International** is the global plain-legal-language association. **EU:** the *Joint Practical Guide of the European Parliament, the Council and the Commission* sets drafting principles for EU legislation, with special constraints from multilingualism (every act exists in 24 official languages and drafting must be translatable). **India:** the **SARAL** framework (Vidhi Centre for Legal Policy) — *Simple, Accessible, Rational, Actionable Laws* — is a principle-based plain-language drafting manual. Academic foundations (Bryan Garner; Joseph Kimble; Peter Tiersma; the *Scribes* and *Clarity* communities) establish that plain language *reduces* ambiguity rather than sacrificing precision — a finding often disputed by traditionalists but supported by readability-and-comprehension studies of rewritten legal texts. Drafting conventions across these frameworks converge on: one main idea per clause/section; definitions placed early and non-circularly; active voice as default; short sentences; headings and lists over provisos; avoidance of double negatives and nested exceptions.

**Key sources.**
- SEC Plain English Rule, 17 CFR § 230.421. https://www.law.cornell.edu/cfr/text/17/230.421 ; final rule release: https://www.sec.gov/files/rules/final/33-7497.txt — statutory/regulatory anchor for US securities drafting.
- Plain Writing Act of 2010, Pub.L. 111-274. https://www.digital.gov/guides/plain-language/ — federal drafting.
- Joint Practical Guide of the European Parliament, the Council and the Commission (2016). Publications Office of the EU. https://op.europa.eu/en/publication-detail/-/publication/3879747d-7a3c-411b-a3a0-55c14e2ba732 — EU legislative drafting principles, incl. multilingual constraints.
- Vidhi Centre for Legal Policy. *The SARAL Manual: A principle-based approach to plain language drafting in India.* https://vidhilegalpolicy.in/research/the-saral-manual — India plain-language framework (Simple, Accessible, Rational, Actionable).
- Clarity International. *Plain Legal Language.* https://www.clarity-international.org/plain-legal-language — global plain-legal-language association and 4-step drafting method.

**Confidence-tagged claims.**
- Plain language in legal drafting reduces (not increases) ambiguity, per comprehension studies. **[M]** — supported by Garner/Kimble tradition and studies; disputed by some traditionalists.
- The SEC Plain English Rule is the clearest codified US legal plain-language mandate with enforceable principles. **[H]** — regulation.
- EU drafting is constrained by mandatory multilingualism; drafting choices must translate across 24 languages. **[H]** — institutional fact.
- One-idea-per-clause, early definitions, active-voice default, headings/lists over provisos are near-universal across these frameworks. **[H]**.

**Research-settled vs. calibration-required.**
- *Settled:* the drafting *principles* above are authoritative and citable; the engine's Legal pack L2/L4 should trace to them.
- *Calibration-required:* jurisdiction detection (which framework applies) from input text **[CAL]**; per-document-type thresholds (e.g., sentence length in a statute vs. a contract) **[CAL]**.

**Spec proposals.**
- **LAW-1.** The Legal pack MUST cite the applicable jurisdictional framework (US SEC/Plain Writing Act; UK OPC; EU Joint Practical Guide; SARAL) and apply that framework's principles. Where jurisdiction is ambiguous, the engine MUST apply the most restrictive (typically US SEC principles) and flag the assumption. *Feeds decision: which drafting principles are active.*
- **LAW-2.** The Legal pack's L4 diagnostics MUST include: one-idea-per-clause check [LJ], early-and-non-circular-definitions check [LJ], nested-exception depth [CC], double-negative detection [CC], cross-reference density [CC], and sentence-length distribution vs. jurisdictional baseline [CC][CAL]. *Feeds decision: which structural defects are flagged for restructuring.*
- **LAW-3.** Precision must never be sacrificed to "plainness"; where a term of art has established legal meaning, the engine MUST preserve it and may add a plain-language gloss, not replace it. *Feeds decision: protecting terms of art.*

**Open questions.** Whether plain-language rewriting *measurably* improves comprehension for non-lawyer readers in litigation contexts has mixed evidence (some studies show gains, some show no effect on outcomes); the precision-vs-plainness empirical frontier is not fully settled.

---

### 2.3 Academic Writing

**Best-practice summary.** **IMRAD** (Introduction, Methods, Results, Discussion) is the dominant structure for empirical research articles in the natural, social, and health sciences; it is *not* universal (humanities, qualitative social science, theory papers, and registered reports deviate legitimately). The structural norm is convention enforced by journals, not a quality absolute. **Citation integrity** is governed by: the **ICMJE Recommendations** (defining authorship, manuscript preparation, peer review) for biomedical journals; **COPE** (Committee on Publication Ethics) guidelines on retraction, fabrication, falsification, plagiarism, and image manipulation for all disciplines; and discipline-specific style manuals (APA, MLA, Chicago, IEEE, Vancouver). COPE's retraction guidelines define fabrication and falsification as misconduct warranting retraction — directly relevant to the engine's hallucination guardrails (Topic 3). **ESL fairness** in academic reviewing has a growing evidence base: Politzer-Ahles et al. (2020) found preliminary evidence that reviewers give lower scientific-quality ratings to abstracts with non-native-like writing, even when content is held constant — i.e., *construct-irrelevant variance* (Messick) in evaluation. Soler (2021) and the ERPP (English for Research and Publication Purposes) literature (Curry & Lillis; Hanauer & Englander) document the added burden on EAL (English-as-an-additional-language) researchers.

**Key sources.**
- International Committee of Medical Journal Editors (ICMJE). *Recommendations for the Conduct, Reporting, Editing, and Publication of Scholarly Work in Medical Journals.* https://www.icmje.org/recommendations/ — biomedical authorship/manuscript standard.
- Committee on Publication Ethics (COPE). *Guidelines; Retraction guidelines.* https://publicationethics.org/guidance/guideline/retraction-guidelines — fabrication/falsification definitions.
- Politzer-Ahles, S. et al. (2020). *Preliminary evidence of linguistic bias in academic reviewing.* Journal of English for Academic Purposes, 46, 100092. https://www.sciencedirect.com/science/article/pii/S1475158520301685 — empirical evidence of reviewer linguistic bias.
- Soler, J. (2021). *Linguistic injustice in academic publishing in English.* Journal of English-Medium Instruction / ERPP. https://www.jbe-platform.com/content/journals/10.1075/jerpp.21002.sol — theoretical framing of EAL disadvantage.

**Confidence-tagged claims.**
- IMRAD is the dominant empirical-article structure but is not universal across disciplines. **[H]**.
- COPE defines fabrication and falsification as misconduct warranting retraction. **[H]** — guideline.
- There is empirical evidence of linguistic bias against EAL writing in peer review (lower ratings for identical content with non-native-like language). **[M]** — Politzer-Ahles 2020 is "preliminary evidence"; effect replicated in related work.
- ESL/EAL writers face a documented added publication burden. **[H]** — multiple ERPP studies.

**Research-settled vs. calibration-required.**
- *Settled:* the Academic pack must respect IMRAD where the discipline uses it and not impose it where it does not; the engine must treat fabrication/falsification as absolute prohibitions (ties to Topic 3).
- *Calibration-required:* discipline detection (which structure is appropriate) **[CAL]**; the boundary of "non-critical" ESL deviations is register- and discipline-specific **[CAL]**.

**Spec proposals.**
- **ACA-1.** The Academic pack MUST apply IMRAD structural checks only when the detected discipline uses IMRAD; for humanities/qualitative/theory work it MUST switch to argument-structure checks instead. *Feeds decision: which structural diagnostics are active.*
- **ACA-2.** The engine MUST enforce a hard prohibition on inventing sources, data, dates, statistics, or quotations (per COPE fabrication/falsification definitions). This is a Constitution-level rule (see Topic 3). *Feeds decision: hallucination guardrail.*
- **ACA-3.** ESL-flagged academic text MUST be evaluated for *content rigor* separately from *linguistic polish*, and the engine MUST report these as two distinct scores. *Feeds decision: separating rigor from polish in output (ties to Topic 7).*

**Open questions.** The magnitude of reviewer linguistic bias varies by discipline and is not fully characterized; the engine should not assume uniform bias.

---

### 2.4 Marketing / Brand

**Best-practice summary.** Brand voice documentation has matured into a recognized practice: modern brand voice guides specify voice *attributes* (e.g., "confident, pragmatic, warm") with do/don't examples per channel, and voice-attribute matrices are the operational form. **Ethical persuasion** is bounded by advertising law: in the US, the **FTC** requires substantiation for objective claims (the "competent and reliable evidence" standard) and updated its **Endorsement Guides** in June 2023 to address influencer marketing, fake reviews, and material-connection disclosure; the UK has the ASA/CAP codes; the EU has the UCPD (Unfair Commercial Practices Directive) and the DSA. The persuasion/manipulation distinction is ethical, not legal: persuasion = truthful claims enabling informed choice; manipulation = hidden conditions, false scarcity, emotional exploitation that overrides rational evaluation. For a rewriting engine, the operational boundary is: claims that assert facts (performance, superiority, health effects) MUST be marked as requiring substantiation the engine cannot itself provide; the engine may improve *clarity* of a claim but must not *strengthen* its factual assertion.

**Key sources.**
- US Federal Trade Commission. *Endorsement Guides: What People Are Asking* (updated June 29, 2023). https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking ; press release: https://www.ftc.gov/news-events/news/press-releases/2023/06/federal-trade-commission-announces-updated-advertising-guides-combat-deceptive-reviews-endorsements — substantiation and disclosure standard.
- US Federal Trade Commission. *Disclosures 101 for Social Media Influencers.* https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers — operational disclosure rules.

**Confidence-tagged claims.**
- Brand voice documentation via attribute matrices with per-channel do/don't examples is the dominant practice. **[M]** — industry convention, not studied empirically.
- FTC requires substantiation for objective advertising claims; failure to substantiate is deceptive. **[H]** — regulation/case law.
- The 2023 FTC Endorsement Guides update extends disclosure duties to influencer marketing and prohibits fake reviews. **[H]** — regulation.
- The engine must not strengthen a factual claim's assertion (only its clarity). **[M]** — derived from substantiation principle.

**Research-settled vs. calibration-required.**
- *Settled:* factual claims require external substantiation the engine cannot provide; the engine marks them, not strengthens them; disclosure obligations apply.
- *Calibration-required:* brand voice attribute matrices per client **[CAL]**; banned-phrase lists per brand **[CAL]**.

**Spec proposals.**
- **MKT-1.** The Marketing pack MUST treat any objective factual claim (performance, comparison, superiority, health, price, scarcity) as a *substantiation-required* marker: the engine MAY clarify its wording but MUST NOT increase its assertive force, add specifics, or invent comparative data. *Feeds decision: hallucination guardrail for marketing (ties to Topic 3).*
- **MKT-2.** The engine MUST flag any text that creates implied endorsements, undisclosed material connections, false scarcity, or undisclosed sponsored content, per FTC 2023 Guides. *Feeds decision: compliance flag.*
- **MKT-3.** Brand voice is governed by a per-brand StyleSheet (voice attributes, do/don't phrases, banned terms) maintained as state (Topic 4). *Feeds decision: voice-consistency scoring.*

**Open questions.** The empirical effect of voice-attribute consistency on brand outcomes is not robustly established; voice practice is convention-led.

---

## TOPIC 3 — Hallucination Guardrails in Rewriting Systems

### 3.1 Prior Art on Faithfulness Preservation

**Best-practice summary.** The relevant prior art is concentrated in **abstractive summarization** and **text style transfer**, both of which face the same core problem as rewriting: change something about the text (length, style, register) without inventing or contradicting content. The dominant conceptual framework is the **intrinsic vs. extrinsic hallucination** taxonomy of Maynez et al. (2020): *intrinsic* hallucinations contradict the source; *extrinsic* hallucinations introduce information not present in (and not entailed by) the source, even if factually true in the world. This distinction is *the* foundational contribution for a rewriting engine: extrinsic hallucination is the failure mode that "increase specificity" instructions create in nonfiction. Factuality-checking metrics — **FactCC** (Kryściński et al., 2020, a BERT-based model trained on perturbed summaries), **QuestEval** (Scialom et al., 2021, question-generation/answering without reference summaries), **DAE / Dependency-Arc Entailment** (Goyal & Durrett, 2020, decomposing factuality into per-arc entailment judgments) — provide operational [LJ]-class checks adaptable to rewriting. In style transfer, the parallel literature on **content preservation** (Pang et al. 2025 meta-evaluation; Kolkin et al. "Less is More, Faithful Style Transfer without Content Loss") establishes that content preservation and style change are in tension and must be measured separately.

**Key sources.**
- Maynez, J., Narayan, F., Bohnet, B., & McDonald, R. (2020). *On Faithfulness and Factuality in Abstractive Summarization.* ACL 2020, 173–182. https://aclanthology.org/2020.acl-main.173 (arXiv:2005.00661: https://arxiv.org/pdf/2005.00661) — the intrinsic/extrinsic hallucination taxonomy.
- Kryściński, W., McCann, B., Xiong, C., & Socher, R. (2020). *Evaluating the Factual Consistency of Abstractive Text Summarization* (FactCC). EMNLP 2020. https://aclanthology.org/2020.emnlp-main.750 (arXiv:1910.12840: https://arxiv.org/abs/1910.12840) — model-based factuality check.
- Scialom, T. et al. (2021). *QuestEval: Summarization Asks for Fact-based Evaluation.* EMNLP 2021. https://aclanthology.org/2021.emnlp-main.529 (arXiv:2103.12693: https://arxiv.org/abs/2103.12693) — reference-free QG/QA factuality metric.
- Goyal, T., & Durrett, G. (2020). *Evaluating Factuality in Generation with Dependency-level Entailment* (DAE). EMNLP 2020. https://github.com/tagoyal/dae-factuality (arXiv:2104.04302: https://arxiv.org/pdf/2104.04302) — fine-grained arc-level entailment.
- Pang, R. Y. et al. (2025). *Mind the Style Gap: Meta-Evaluation of Style and Attribute Transfer Metrics.* arXiv:2502.15022. https://arxiv.org/html/2502.15022v3 — content-preservation vs. style-change tradeoff in style transfer.
- Kolkin, N. et al. *Less is More, Faithful Style Transfer without Content Loss.* https://home.ttic.edu/~nickkolkin/Paper/NNST_Preprint.pdf — content-preservation-first style transfer.

**Confidence-tagged claims.**
- The intrinsic/extrinsic hallucination distinction is established and directly maps to rewriting. **[H]** — Maynez 2020, widely adopted.
- Factuality-checking methods (FactCC, QuestEval, DAE) are validated for summarization and adaptable to rewriting as [LJ] post-generation checks. **[M]** — validated in summarization; adaptation to rewriting is reasonable but not directly tested.
- Content preservation and style/register change are in measurable tension; both must be measured. **[H]** — style-transfer meta-evaluation.

**Research-settled vs. calibration-required.**
- *Settled:* the engine must distinguish intrinsic from extrinsic hallucination; must run a post-generation factuality check; must measure content preservation separately from register/voice change.
- *Calibration-required:* the factuality-check threshold for flagging (QuestEval/FactCC/DAE scores are continuous) **[CAL]**; which check(s) to run per register (nonfiction: all; fiction: only intrinsic-consistency) **[CAL]**.

**Spec proposals.**
- **HALL-1.** The engine MUST classify every content element in a rewritten nonfiction passage as: (a) *present in source* (licensed), (b) *entailed by source* (licensed — e.g., resolving anaphora, paraphrase), (c) *world-knowledge* (prohibited as assertion — must become a clarification request or placeholder). *Feeds decision: whether a candidate sentence may be emitted as an assertion.*
- **HALL-2.** The engine MUST run a post-generation factuality check (DAE-style arc entailment or QuestEval-style QG/QA) on all nonfiction rewrites and MUST block emission of any passage flagged as containing extrinsic hallucination. *Feeds decision: gate on output emission.*
- **HALL-3.** Content preservation and register/voice adherence MUST be reported as separate scores, not collapsed. *Feeds decision: ranking candidate rewrites.*

**Open questions.** No factuality metric is validated specifically for *rewriting* (vs. summarization); adaptation is principled but unproven. Factuality metrics have known weaknesses on numbers and negation.

---

### 3.2 Preventing Invented Specifics (Dates, Names, Statistics, Citations)

**Best-practice summary.** The operational techniques, drawn from summarization and grounded generation, are: (a) **entity-aware generation** — extract named entities (dates, proper nouns, quantities, citations) from the source and constrain the output to reuse them verbatim or mark them as absent; (b) **number/unit preservation** — detect numeric expressions and units and forbid altering their values; (c) **citation preservation** — detect citation markers and their referents and preserve both; (d) **grounded rewriting** — every asserted fact must be alignable to a source span (the "coverage" property in summarization); (e) **retrieval-augmented rewriting** — where specificity is genuinely needed and absent from source, retrieve from an external corpus and *attribute* the retrieved content explicitly rather than asserting it as if from the source. None of these eliminates hallucination; they reduce it and make residual hallucination detectable.

**Confidence-tagged claims.**
- Entity-aware constrained generation reduces (not eliminates) hallucination of specifics. **[M]** — supported by grounded-generation literature, less studied for rewriting specifically.
- Numeric preservation is a solvable [CC] problem (regex + NER). **[H]**.
- "Grounded rewriting" (every claim alignable to a source span) is the strongest available guarantee and makes residual hallucination auditable. **[M]**.

**Research-settled vs. calibration-required.**
- *Settled:* extract and preserve entities, numbers, citations; require source-span alignment for assertions.
- *Calibration-required:* the alignment strictness (exact-span vs. semantic-span) **[CAL]**.

**Spec proposals.**
- **SPEC-1.** Before rewriting nonfiction, the engine MUST extract a Source-Fact Ledger: {named entities, numeric expressions with units, citation markers + referents, direct quotations}. During rewriting, the engine MUST preserve these verbatim or flag deviation. *Feeds decision: what must not drift during rewriting.*
- **SPEC-2.** The engine MUST NOT introduce a date, name, statistic, or citation not present in the Source-Fact Ledger. If the specificity instruction requires one and none is present, the engine MUST emit a placeholder `[SPECIFIC-{TYPE}?: brief description]` rather than inventing. *Feeds decision: resolving the specificity-vs-faithfulness conflict — this is the direct fix for the known hallucination gap.*
- **SPEC-3.** The engine MUST NOT alter a numeric value or unit during rewriting. *Feeds decision: protecting quantitative integrity.*

**Open questions.** No validated placeholder syntax exists across rewriting systems; the `[SPECIFIC-{TYPE}?]` convention is a proposal.

---

### 3.3 Placeholder Conventions for Missing Information

**Best-practice summary.** Prior art on placeholders comes from machine translation (untranslatable markers), data-to-text generation (missing-slot handling), and templated content systems. The design tension is **fluency vs. transparency**: silent omission produces fluent but lossy text; loud placeholders produce transparent but disfluent text. The defensible compromise for a rewriting engine is *typed, scoped placeholders* that signal (a) what kind of information is missing, (b) whether the engine is asking the user or flagging for review, and (c) a traceable anchor to the location. The engine should never silently drop a source-asserted fact, and should never silently invent a missing one.

**Confidence-tagged claims.**
- Typed placeholders are superior to silent omission for nonfiction. **[M]** — convention, supported by data-to-text slot-handling literature.
- Placeholders must be distinguishable from content (so they are not emitted into final text by accident). **[H]**.

**Spec proposals.**
- **PH-1.** Placeholder syntax: `[MISSING:{TYPE}|reason|anchor-id]` (e.g., `[MISSING:DATE|source lacks date|R3]`). The engine MUST use this exact format and MUST strip/replace all placeholders before final emission in "polished" output modes, surfacing them instead as a review queue. *Feeds decision: how missing information is represented and surfaced.*
- **PH-2.** The engine MUST offer three emission modes: (a) *Strict* — placeholders in-place, no silent invention; (b) *Polished* — placeholders resolved via user clarification or removed with a note; (c) *Fluent* — placeholders removed only when the missing information is non-load-bearing. Default for nonfiction = Strict. *Feeds decision: output-mode selection.*

**Open questions.** No empirical study compares placeholder conventions for user trust or comprehension; this is a design choice grounded in principle, not evidence.

---

### 3.4 Licensed Inference (Text Logic) vs. Prohibited Inference (World Knowledge)

**Best-practice summary.** This is the *core conceptual distinction* the Bible needs, and it is well-articulated in the NLP literature even if not always named this way. **Licensed inference** operates over the text itself: anaphora resolution (a pronoun's referent), bridging (definite descriptions licensed by prior mention), lexical entailment (a paraphrase that preserves truth conditions), discourse-coherence inference (the implicit relation between two sentences). These are *intratextual* and do not introduce new world content. **Prohibited inference (in nonfiction)** introduces content not derivable from the text: a statistic, a historical date, a causal claim about the world, an attribution. The Maynez et al. (2020) extrinsic-hallucination category *is* the operationalization of prohibited inference. Entailment (NLI) models are the available [LJ] tool to test whether an output sentence is entailed by the source; non-entailed assertive content in nonfiction = extrinsic hallucination = prohibited. This maps cleanly to the engine's needs.

**Confidence-tagged claims.**
- The licensed/prohibited distinction maps onto intrinsic-vs-extrinsic and entailment-vs-world-knowledge. **[H]** — conceptually grounded in Maynez 2020 and NLI literature.
- NLI models can operationalize the test ("is this output sentence entailed by the source?") with known error rates. **[M]** — NLI is imperfect (negation, numerals, presupposition) but usable as an [LJ] check.
- In fiction, the distinction partially inverts: world-building inference within the story's established facts is licensed; contradicting established canon is prohibited. **[M]** — derived from narrative-consistency literature (thin).

**Research-settled vs. calibration-required.**
- *Settled:* the engine must apply the licensed/prohibited distinction in nonfiction; non-entailed assertions are blocked.
- *Calibration-required:* the NLI confidence threshold for blocking **[CAL]**; the fiction variant (canon-consistency vs. world-knowledge) **[CAL]**.

**Spec proposals.**
- **INF-1 (Constitution-level).** In nonfiction registers, the engine MUST NOT emit as an assertion any sentence not entailed by (or directly present in) the source. Non-entailed specifics MUST be emitted as placeholders or clarification requests. *Feeds decision: the core faithfulness gate — this is the single most important addition.*
- **INF-2.** Licensed inferences (anaphora resolution, bridging, lexical entailment, discourse-coherence) are permitted and need not be flagged, but the engine SHOULD mark them in a trace for expert review. *Feeds decision: trace construction.*
- **INF-3.** In fiction, the rule relaxes to canon-consistency: inferences must not contradict the established story world (tracked in the Canon Ledger, Topic 4); new world-building is permitted only when marked as the author's invention, not as established fact. *Feeds decision: fiction-specific faithfulness.*

**Open questions.** NLI models struggle with presupposition and numerals; the engine needs a complementary [CC] numeric/entity check (SPEC-1) alongside the [LJ] NLI check.

---

## TOPIC 4 — State Architecture for Long-Range Diagnostics

### 4.1 Document-Aware vs. Chunked Rewriting

**Best-practice summary.** The fundamental tension: rewriting operates on text that may exceed the model's effective context window, and even within a large context window, models exhibit the **"lost in the middle"** degradation (Liu et al., 2023/2024) — recall and reasoning over the middle of a long context is materially worse than over the beginning and end, producing a U-shaped performance curve. Implications for a writing engine: (a) chunked rewriting breaks long-range dependencies (anaphora across chunk boundaries, consistency of voice/entities across the document, foreshadowing/payoff chains); (b) naive full-document rewriting into a single context does not reliably use the middle content well; (c) the defensible architecture combines *retrieval over a document index* (pull relevant prior spans into the working context for the chunk being rewritten) with *explicit external state* (a structured ledger that does not depend on the model remembering). MemGPT (Packer et al., 2023) operationalizes the OS-inspired tiered-memory approach (main context ≈ RAM; external memory ≈ disk, with the model managing page-in/out). For a writing engine, the practical takeaway is: **state must live outside the context window** — in a persisted Document State object — and be selectively retrieved per chunk.

**Key sources.**
- Liu, N. F. et al. (2023/2024). *Lost in the Middle: How Language Models Use Long Contexts.* TACL 2024. https://aclanthology.org (arXiv:2307.03172). https://arxiv.org/abs/2307.03172 — the U-shaped long-context degradation.
- Packer, C., Wooders, S., Lin, K., Fang, V., & Gonzalez, J. (2023). *MemGPT: Towards LLMs as Operating Systems.* arXiv:2310.08560. https://arxiv.org/abs/2310.08560 — tiered-memory architecture for unbounded context.

**Confidence-tagged claims.**
- Long-context models degrade on information in the middle of the context (U-shaped recall). **[H]** — Liu et al., widely replicated.
- Chunked rewriting breaks cross-chunk dependencies unless external state is maintained. **[H]** — architectural implication.
- Tiered/external memory (MemGPT-style) is a defensible pattern; OS-inspired memory management is an active research direction. **[M]** — proposed and demonstrated, not yet production-validated at scale for writing.

**Research-settled vs. calibration-required.**
- *Settled:* long-range state must live outside the context window; the engine must retrieve relevant spans per chunk.
- *Implementation-choice:* the specific retrieval mechanism (vector index, structured query, hierarchical summary) and chunk size **[CAL]**.

**Spec proposals.**
- **STATE-1.** The engine MUST maintain a persisted **Document State** object outside the context window and MUST NOT rely on the model's context memory for long-range consistency. *Feeds decision: where state lives.*
- **STATE-2.** When rewriting a chunk, the engine MUST retrieve into the working context: (a) the chunk itself, (b) relevant prior spans via the document index, (c) the relevant slice of Document State (entities, voice sheet, deferred checks anchored near this chunk). *Feeds decision: working-context construction per chunk.*
- **STATE-3.** The engine MUST NOT assume the model will "remember" content placed in the middle of a long context; critical anchors (the entity being discussed, the active obligation) MUST be placed at context edges or restated. *Feeds decision: context-prompt construction.*

**Open questions.** Optimal chunk size and retrieval depth for writing tasks are not established; must be tuned.

---

### 4.2 Style Sheets, Brand Voice Profiles, Character/Canon Ledgers

**Best-practice summary.** Three distinct state objects are needed, with different update semantics. **StyleSheet** (voice attributes, typical syntax, ESL markers, banned phrases) is derived from user/brand samples (Topic 1.6 function-word profiling applies) and updates slowly — it is a *style target*. **BrandVoiceProfile** is the marketing-specific instance of a StyleSheet, with channel-specific variations. **Character/Canon Ledger** (fiction) tracks characters, their attributes, relationships, knowledge state, and the established facts of the story world; it updates on every narrative event and must be versioned. Long-term-memory architectures for conversational agents (MemoryBank; MemGPT) demonstrate the pattern: a vector-indexed episodic store plus a structured semantic store (entity-relation graph) plus hierarchical summaries. For character knowledge specifically ("who knows what"), the narrative-theory and dialogue-systems literature on **common ground** (Stalnaker) and theory-of-mind tracking is relevant but operationally thin — most systems approximate it with an explicit per-character knowledge set updated by an [LJ] pass over events.

**Confidence-tagged claims.**
- Vector-indexed episodic memory + structured entity-relation graph + hierarchical summaries is a defensible composite memory architecture. **[M]** — proposed and demonstrated in conversational agents; not writing-specifically validated.
- Character knowledge tracking is operationally under-specified; explicit per-character knowledge sets updated by [LJ] event-reading is a pragmatic approximation. **[M]** — limited prior art.
- Style sheets update slowly and must not be re-derived from a single sample. **[H]** — stylometric convention.

**Research-settled vs. calibration-required.**
- *Settled:* three distinct state objects with distinct update semantics; composite memory (vector + structured + summary).
- *Calibration-required:* StyleSheet derivation sample size **[CAL]**; character-knowledge-update granularity **[CAL]**; vector index parameters **[CAL]**.

**Spec proposals.**
- **STATE-4.** Document State MUST contain: (1) **StyleSheet** (voice attributes, function-word profile, ESL markers, banned-phrase list, do/don't examples); (2) **EntityLedger** (all named entities with attributes and canonical forms); (3) **CanonLedger** (fiction: characters, relationships, per-character knowledge sets, world facts; nonfiction: defined terms, claims-with-sources); (4) **DeferredChecks** queue (long-range diagnostics with anchor spans and PASS/FAIL/DEFERRED status); (5) **DiagnosticHistory** (prior scores for regression detection). *Feeds decision: the state schema.*
- **STATE-5.** Update semantics: StyleSheet = slow (multi-sample); EntityLedger = on every entity mention; CanonLedger = on every narrative/claim event; DeferredChecks = on every revision pass; DiagnosticHistory = append-only. *Feeds decision: when each state component updates.*
- **STATE-6.** Character knowledge (CanonLedger) MUST be updated by an [LJ] pass that reads each event and updates the per-character knowledge set; the engine MUST flag any assertion by a character of information not in their knowledge set. *Feeds decision: consistency-of-knowledge check (mystery/foreshadowing support).*

**Open questions.** No validated method for tracking reader-knowledge vs. character-knowledge distinctively (essential for mystery/foreshadowing); this is a research gap.

---

### 4.3 Long-Range Mechanism Tracking (Foreshadowing, Campaign Arcs, Case-Law Chains)

**Best-practice summary.** This is the *thinnest* area of prior art and the engine must be explicit about that. Foreshadowing/payoff tracking has no established computational method; the Bible's existing PASS/FAIL/DEFERRED scheme is a reasonable design but unvalidated. The closest precedents: (a) legal **citator** systems (Shepard's, KeyCite) track case-law chains by citation graph — a [CC] citation-graph approach is defensible for legal; (b) marketing **multi-touchpoint attribution** tracks campaign arcs but measures conversion, not narrative coherence; (c) narrative-generation systems (story planners, drama managers) track plot state but typically generate rather than evaluate. The defensible approach is a **deferred-check ledger**: when a long-range mechanism is *set up* (a foreshadowing element planted, a campaign promise made, a legal principle asserted), the engine records a DEFERRED check with an anchor span; on later passes, an [LJ] check resolves it to PASS (paid off) or FAIL (broken/unresolved). The engine must not invent hypothetical payoffs to "complete" a checklist (the Bible already states this).

**Confidence-tagged claims.**
- No validated computational method for foreshadowing/payoff tracking exists. **[H]** — absence of literature.
- Citation-graph approaches are defensible for legal case-law chains. **[M]** — citators are an established tool, adapting to rewriting is reasonable.
- The deferred-check ledger pattern is a principled design, not an evidence-based one. **[L]** — design proposal.

**Research-settled vs. calibration-required.**
- *Settled:* the deferred-check ledger pattern; the prohibition on inventing payoffs.
- *Calibration-required:* what counts as a "setup" worth a DEFERRED check **[CAL]**; the [LJ] prompt for resolving checks **[CAL]**.

**Spec proposals.**
- **LR-1.** The DeferredChecks queue MUST record, for each detected long-range setup: {type, anchor-span, setup-summary, status: DEFERRED|PASS|FAIL, resolution-anchor}. On each revision pass, the engine MUST attempt resolution of all DEFERRED items whose setup precedes the current edit point. *Feeds decision: long-range mechanism evaluation.*
- **LR-2.** For legal, the engine MUST build a citation graph (defined-term and case-citation references) and flag broken cross-references as FAIL. *Feeds decision: legal cross-reference integrity.*
- **LR-3.** The engine MUST NOT auto-generate a payoff to resolve a DEFERRED check; unresolved DEFERRED items at document end MUST be surfaced as a review queue, not silently closed. *Feeds decision: preventing fabricated closure.*

**Open questions.** Setup detection itself is an unsolved [LJ] problem; the engine will rely on prompted detection, which has unknown recall.

---

## TOPIC 5 — Mixed-Register Texts

### 5.1 Genre/Register Theory on Blended Registers

**Best-practice summary.** The dominant theoretical framework for register variation is **Biber's multidimensional (MD) analysis** (Biber, 1988; *Variation Across Speech and Writing*; *Dimensions of Register Variation*, 1995), which uses factor analysis of ~67 linguistic features to derive dimensions of variation (Dimension 1: Involved vs. Informational Production; Dimension 2: Narrative vs. Non-Narrative; Dimension 3: Elaborated Reference; Dimension 4: Overt Persuasion; Dimension 5: Abstract vs. Non-Abstract Information; etc.). A text occupies a position in this multi-dimensional space; registers are clusters. This is empirically grounded (corpus-derived) and is the defensible [CC]-class foundation for register detection. Genre theory (Swales, 1990; Bhatia, 1993/2004) adds that genres are *socially-recognized* text types with conventional structures, and that **mixed/interdiscursive genres** are common: Bhatia's work on professional discourse explicitly analyzes "mixed genres" and "genre colonies" — e.g., a corporate annual report mixes financial disclosure (business/legal) with promotional discourse (marketing). The key theoretical point: blending is the *norm* in professional writing, not an anomaly; a register engine that assumes single-register inputs will mis-handle most real professional text.

**Key sources.**
- Biber, D. (1988/1995). *Variation Across Speech and Writing* / *Dimensions of Register Variation: A Sociolinguistic Investigation.* Cambridge University Press. https://www.cambridge.org/core/books/dimensions-of-register-variation/FF817F2C32378B398C8019090381352E — foundational MD-analysis framework.
- Zhang, Y. (2023). *A Multidimensional Analysis of Language Use in English.* SAGE Open. https://doi.org/10.1177/21582440231197088 — modern application/overview of MD analysis.
- Sheng, D. et al. (2024). *A multi-dimensional analysis of interpreted and non-interpreted...* Humanities and Social Sciences Communications (Nature Portfolio). https://www.nature.com/articles/s41599-024-02968-9 — contemporary MD-analysis application.
- Bhatia, V. K. (1993/2004). *Analysing Genre: Language Use in Professional Settings* / *Worlds of Written Discourse.* (Mixed genres, interdiscursivity, genre colonies.) — foundational genre-theory work on blended professional discourse.

**Confidence-tagged claims.**
- Biber's MD analysis is the empirically-grounded framework for register variation; texts occupy positions in a multi-dimensional feature space. **[H]**.
- Mixed/interdiscursive genres are normal in professional writing (annual reports, law-firm blogs, white papers). **[H]** — genre theory.
- A single-register assumption mis-handles most real professional text. **[H]** — implication.

**Research-settled vs. calibration-required.**
- *Settled:* use MD-style feature vectors for register detection; expect and handle blending.
- *Calibration-required:* the specific feature inventory and dimension weights for *this* engine's register set **[CAL]**; the boundary thresholds for "primary" vs. "secondary" register **[CAL]**.

**Spec proposals.**
- **MR-1.** Register detection MUST produce a multi-label vector over the seven registers with confidence scores, not a single label. *Feeds decision: which packs' diagnostics are active and at what weight.*
- **MR-2.** Register detection MUST be computed [CC] from a Biber-style linguistic feature vector, corroborated by an [LJ] judgment of dominant purpose. Where the two disagree, both are reported. *Feeds decision: robustness of register detection.*

**Open questions.** MD analysis was developed on general English registers; its behavior on the engine's seven specific packs is unvalidated and must be locally calibrated.

---

### 5.2 Priority Resolution When Register Obligations Conflict

**Best-practice summary.** This is **under-researched**: genre theory *describes* blending and identifies dominant genres, but does not provide a decision procedure for "when legal precision and marketing persuasion conflict, which wins?" The defensible principled approach, synthesized from the partial precedents, is a **stake-primacy hierarchy**: the register whose *failure mode is most harmful* governs. Concretely: (a) **regulated-communication obligations** (legal compliance, securities disclosure, advertising substantiation) outrank everything because their failure is legally actionable; (b) **truth/meaning preservation** outranks persuasion (you may not lie to persuade); (c) the **dominant register's** structural obligations outrank the secondary's, *within* the truth/compliance envelope; (d) reader intelligibility; (e) user voice; (f) AI-pattern adjustments. This extends (does not replace) the Bible's existing priority stack. A practical operationalization: at the *section* level, detect the section's primary register (a law-firm blog's "practice area" page is marketing-dominant; its "case summary" is legal-dominant) and apply that pack's obligations as primary within the section.

**Confidence-tagged claims.**
- No established decision procedure exists for inter-register obligation conflicts. **[H]** — absence in the literature.
- Stake-primacy (most-harmful-failure governs) is a principled synthesis from the partial precedents, not an evidence-validated rule. **[M]**.
- Section-level register detection is more accurate than document-level for mixed texts. **[M]** — implied by MD analysis (registers cluster at the section level).

**Research-settled vs. calibration-required.**
- *Settled:* mixed-register conflict exists and must be handled; document-level single-register assumption fails.
- *Calibration-required:* the stake-primacy ordering for *specific* register pairs (e.g., academic × marketing for a thought-leadership piece) **[CAL]**; section-boundary detection **[CAL]**.

**Spec proposals.**
- **MR-3.** The engine MUST extend the existing priority stack with a stake-primacy layer for multi-register text: regulated-communication obligations > meaning/truth preservation > dominant-register obligations > secondary-register obligations > reader intelligibility > user voice > AI-pattern adjustments. *Feeds decision: conflict resolution when packs disagree.*
- **MR-4.** The engine MUST detect register at the section level, not only document level, and MUST apply the stake-primacy layer per section. *Feeds decision: which pack leads per section.*
- **MR-5.** Where two registers are near-equal in confidence and their obligations conflict, the engine MUST surface the conflict to the user with the trade-off stated, rather than silently resolving. *Feeds decision: when to escalate vs. auto-resolve.*

**Open questions.** Empirical validation of the stake-primacy ordering is absent; it is a principled proposal requiring local validation.

---

### 5.3 Detecting Primary vs. Secondary Register

**Best-practice summary.** Methods: (a) [CC] Biber-style feature-vector classification (Dimension scores → nearest register cluster); (b) [LJ] transformer-based multi-label genre classifiers (modern NLP, higher accuracy on short text but opaque); (c) structural cues (presence of IMRAD sections ⇒ academic-dominant; presence of CTAs and benefit ladders ⇒ marketing-dominant; definitions + obligations ⇒ legal-dominant). The reliable signal for *primary* register is the text's **dominant purpose** (what is this text trying to *do*), which is best captured by combining [CC] feature classification with [LJ] purpose judgment. Short texts and highly mixed texts are genuinely hard; confidence should be reported and low-confidence cases escalated.

**Confidence-tagged claims.**
- Combined [CC] + [LJ] register detection is more robust than either alone. **[M]** — reasonable synthesis, limited direct comparison.
- Short and highly mixed texts are low-confidence for register detection. **[H]** — established difficulty.

**Spec proposals.**
- **MR-6.** Primary-register determination MUST combine [CC] feature classification and [LJ] purpose judgment; low-confidence determinations MUST be escalated (MR-5). *Feeds decision: confidence-gated register handling.*

**Open questions.** No published benchmark for multi-label register detection on the engine's specific seven-register set.

---

## TOPIC 6 — Validation Methodology

### 6.1 Golden Dataset Construction

**Best-practice summary.** Golden/evaluation datasets for text generation (SummEval, CNN/DM, XSum for summarization; analogous sets for style transfer, simplification) are constructed by: defining the evaluation dimensions; sampling stratified by length/register/quality; annotating with expert or trained-crowd raters using a fixed rubric; measuring inter-annotator agreement (IRR); and releasing the guidelines with the data. For writing *quality* (vs. factuality or fluency), the unresolved problem is **who is the gold-standard authority** — "good writing" is partly subjective and register-contingent. The defensible approach: use multiple expert raters per register, report IRR transparently, and treat the golden set as a *calibration instrument* (for tuning thresholds and LLM-as-judge) rather than an absolute ground truth. Stratification must cover: register, length, quality tier, and ESL-flagged status (to test fairness).

**Key sources.**
- Fabbri, A. R. et al. (2021). *SummEval: Re-evaluating Summarization Evaluation.* TACL. (Reference standard for golden-dataset construction in NLG.) — multi-dimension, multi-rater design.
- Belz, A. et al. *The TUNA-LS / NLG evaluation best-practices lineage.* (Referenced via van der Lee et al. below.)

**Confidence-tagged claims.**
- Stratified, multi-rater, rubric-anchored golden sets with reported IRR are the defensible standard. **[H]** — NLG evaluation consensus.
- "Good writing" has no single ground truth; the golden set calibrates rather than adjudicates. **[H]** — implication.

**Research-settled vs. calibration-required.**
- *Settled:* the construction method (dimensions, stratification, multi-rater, IRR reporting).
- *Calibration-required:* the number of texts per register/stratum **[CAL]**; the rater pool (expert vs. trained crowd) per register **[CAL]**; the quality-tier distribution **[CAL]**.

**Spec proposals.**
- **VAL-1.** The engine MUST be validated against a stratified golden corpus covering all seven registers, ESL-flagged and native, multiple length bands, and multiple quality tiers. Construction method, rubric, and IRR MUST be published. *Feeds decision: what the engine is validated against.*
- **VAL-2.** The golden corpus MUST include a per-register **adversarial subset** of genuinely human structured text (legal contracts, academic methods sections, technical specs, form letters) to verify the engine does not false-positive AI-pattern flags on it. *Feeds decision: fairness/non-regression on structured human text.*

**Open questions.** No writing-quality golden dataset exists across seven registers; it must be built.

---

### 6.2 Human Evaluation Design: Rubrics, IRR, Sample Size

**Best-practice summary.** The NLG human-evaluation best-practices literature (van der Lee et al., 2019; Belz et al.; the 2021 follow-up) documents that human evaluation in NLG has been plagued by under-reporting, inadequate IRR computation, and under-powered sample sizes. The consensus recommendations: use **analytic** (multi-dimensional) rubrics over holistic scores; report **Krippendorff's α** (the recommended IRR statistic because it handles multiple raters, missing data, and multiple data types — Krippendorff; Marzi et al. 2024; Zapf et al. 2016 confirm α and Fleiss' κ are comparable for complete nominal data, but α is more general); conduct **power analysis** to determine sample size rather than using convenience samples; pre-register the evaluation protocol. Krippendorff's own guidance: α ≥ .80 is "acceptable for drawing conclusions"; .667–.80 = "tentative conclusions"; < .667 = unreliable. These are conventions, and the engine's rubric may need a different target — but the *practice* of reporting α is settled.

**Key sources.**
- van der Lee, C. et al. (2019). *Best Practices for the Human Evaluation of Automatically Generated Text.* INLG 2019. https://aclanthology.org/W19-8643 — the best-practices reference.
- van der Lee, C. et al. (2021). *Human evaluation of automatically generated text: Current trends and re-evaluation proposals.* (ScienceDirect.) https://www.sciencedirect.com/science/article/pii/S088523082030084X — follow-up on reproducibility.
- Krippendorff, K. *Methodological notes on α.* https://www.k-alpha.org/methodological-notes — the α ≥ .80 convention.
- Marzi, G. et al. (2024). *A user-friendly tool for computing Krippendorff's Alpha inter-rater reliability.* https://www.sciencedirect.com/science/article/pii/S2215016123005411 — practical α computation.
- Zapf, A. et al. (2016). *Measuring inter-rater reliability for nominal data.* PMC4974794. https://pmc.ncbi.nlm.nih.gov/articles/PMC4974794 — α vs. Fleiss' κ comparison.

**Confidence-tagged claims.**
- Analytic rubrics outperform holistic for diagnosing quality dimensions. **[M]** — best-practice consensus, not all studies confirm.
- Krippendorff's α is the recommended IRR statistic for multi-rater, multi-dimension data. **[H]**.
- α ≥ .80 = acceptable; .667–.80 = tentative; < .667 = unreliable (Krippendorff's convention). **[M]** — convention; the engine's target is calibration-required.
- NLG human evaluations have historically been under-powered and under-reported. **[H]** — van der Lee et al.

**Research-settled vs. calibration-required.**
- *Settled:* use analytic rubrics; report Krippendorff's α; power-analyze sample size; pre-register.
- *Calibration-required:* the α target for *this* engine's rubric **[CAL]**; the specific dimensions and anchors **[CAL]**; the sample size (power analysis required) **[CAL]**.

**Spec proposals.**
- **VAL-3.** The engine's human-evaluation rubric MUST be analytic, covering at minimum: {fluency, coherence, register-fit, voice-alignment, factuality (nonfiction), specificity-without-hallucination (nonfiction), ESL-fairness}. IRR MUST be reported as Krippendorff's α per dimension. *Feeds decision: how human evaluation is conducted.*
- **VAL-4.** Sample size MUST be determined by power analysis for the minimum detectable effect of interest, not by convenience. The analysis and its assumptions MUST be published. *Feeds decision: how many texts × raters.*

**Open questions.** The α target for writing-quality rubrics specifically (vs. generic text annotation) is not established; .80 may be aspirational for subjective dimensions like "voice-alignment."

---

### 6.3 Adversarial Cases: Structured Human Text

**Best-practice summary.** The clearest evidence here is the **AI-detector false-positive catastrophe on ESL and structured text**: Liang et al. (2023) found GPT detectors misclassify non-native English writing as AI-generated at very high rates (in their TOEFL-essay study, detectors flagged up to ~61% of non-native essays as AI-generated, while flagging near-zero of native essays), and that "AI-improving" the ESL essays (making them more native-like) *reduced* false positives — i.e., the detectors were penalizing legitimate linguistic features. This generalizes: any stylometric AI-pattern check will false-positive on *legitimately regular* human text — academic methods sections, legal contracts, technical specifications, form letters, executive summaries. The Bible's existing Fairness Clause (Part VIII.II) is therefore research-supported, not merely principled. The operational requirement: an adversarial test set of genuinely human structured text per register, run through the engine's AI-pattern diagnostics, with a requirement that false-positive rates stay within a locally-set bound.

**Key sources.**
- Liang, W. et al. (2023). *GPT detectors are biased against non-native English writers.* Patterns, 4(7), 100779. https://doi.org/10.1016/j.pattre.2023.100779 (arXiv:2304.02819: https://arxiv.org/abs/2304.02819) — the false-positive evidence.

**Confidence-tagged claims.**
- Stylometric AI-pattern checks false-positive on legitimate structured human text and on ESL writing. **[H]** — Liang 2023.
- The Bible's Fairness Clause (AI-pattern diagnostics are advisory, never override correctness/clarity/obligations) is research-supported. **[H]**.
- An adversarial test set is required per register. **[H]** — implication.

**Spec proposals.**
- **VAL-5.** The validation suite MUST include a per-register adversarial set of genuinely human structured text. The engine's AI-pattern diagnostics MUST be run on this set, and the false-positive rate MUST be reported and bounded. *Feeds decision: regression bound on AI-pattern false positives.*
- **VAL-6.** AI-pattern diagnostics MUST remain advisory per the Fairness Clause; they MUST NOT trigger automatic rewrites that override register obligations, correctness, or clarity. (Reaffirms existing Bible rule with research backing.) *Feeds decision: the weight of AI-pattern flags in the rewrite decision.*

**Open questions.** The acceptable false-positive bound is a policy choice, not a research finding.

---

### 6.4 LLM-as-Judge Calibration

**Best-practice summary.** The LLM-as-judge literature (Zheng et al. MT-Bench; the surveys by Gu et al. and Wang et al.; Shi et al. on position bias) documents that LLM judges exhibit known biases: **position bias** (favoring the first or last option in pairwise comparison), **length/verbosity bias** (favoring longer responses), **self-enhancement bias** (favoring outputs from the same model family), and **authority bias**. Calibration methods: pairwise with position-swapping and tie-breaking; pointwise rubric-based scoring; reference-based vs. reference-free; multi-judge ensembling. Agreement with human judges varies widely by task (high on factual/extraction tasks, lower on creative/voice tasks). Known weak spots directly relevant to a writing engine: **creative writing, voice/authenticity, ESL fairness** — exactly the dimensions where LLM-as-judge is least trustworthy and must be calibrated against human ratings or not used as the primary signal. Meta-evaluation (evaluating the evaluator against a human-validated golden set) is required before deploying any LLM-as-judge.

**Key sources.**
- Gu, J. et al. (2025). *A survey on LLM-as-a-judge.* https://www.sciencedirect.com/science/article/pii/S2666675825004564 — comprehensive survey of biases and methods.
- Shi, L. et al. (2025). *A Systematic Study of Position Bias in LLM-as-a-Judge.* IJCNLP 2025. https://aclanthology.org/2025.ijcnlp-long.18.pdf — position-bias characterization.
- Wang et al. *LLMs-as-Judges: A Comprehensive Survey.* (Curated list: https://github.com/CSHaitao/Awesome-LLMs-as-Judges) — survey + bias catalog.

**Confidence-tagged claims.**
- LLM-as-judge exhibits position, length, self-enhancement, and authority biases. **[H]** — documented across multiple studies.
- Agreement with humans is task-dependent; weaker on creative/voice/ESL-fairness dimensions. **[H]**.
- LLM-as-judge must be meta-evaluated against human-validated data before deployment. **[H]** — best practice.

**Research-settled vs. calibration-required.**
- *Settled:* mitigate position bias (swap + tie-break); use multi-judge ensembling for high-stakes; meta-evaluate before deployment; do not use LLM-as-judge as the primary signal for voice/authenticity/ESL-fairness.
- *Calibration-required:* the human-agreement threshold for deployment **[CAL]**; the judge-model selection per dimension **[CAL]**.

**Spec proposals.**
- **VAL-7.** Any LLM-as-judge used by the engine MUST be meta-evaluated against the human-validated golden corpus per dimension, with reported agreement. Dimensions with agreement below **[CAL]** MUST fall back to human evaluation or be excluded from automated scoring. *Feeds decision: which dimensions may be auto-scored.*
- **VAL-8.** For voice-alignment, ESL-fairness, and creative-quality dimensions, the engine MUST NOT use LLM-as-judge as the primary signal; it must use human evaluation or an explicit advisory-only LLM judgment. *Feeds decision: where LLM-as-judge is disallowed.*
- **VAL-9.** Pairwise LLM-as-judge MUST use position-swapping with tie-breaking; pointwise MUST use rubric-anchored scoring. *Feeds decision: judge-prompt construction.*

**Open questions.** LLM-as-judge agreement with humans on *rewriting quality* (vs. generation) is under-studied.

---

### 6.5 Continuous Monitoring and Regression Detection

**Best-practice summary.** Production NLG systems require: (a) a **regression holdout** (a fixed set re-evaluated on every model/prompt change) to detect quality drift; (b) **online monitoring** of output distributions (drift in input register mix, drift in diagnostic scores over time); (c) **A/B testing** for changes; (d) **canary** detection of anomalous outputs. The defensible protocol: every model or prompt change must pass the regression holdout with no statistically significant quality decline on any dimension, and must pass the adversarial set (VAL-5) with no false-positive-rate increase.

**Spec proposals.**
- **VAL-10.** The engine MUST maintain a regression holdout set (subset of the golden corpus) re-evaluated on every model/prompt change. A change MUST NOT ship if it produces a statistically significant decline on any rubric dimension or an increase in AI-pattern false-positive rate on the adversarial set. *Feeds decision: change-release gating.*
- **VAL-11.** The engine MUST log diagnostic-score distributions over time and alert on drift beyond **[CAL]** bounds. *Feeds decision: production monitoring.*

**Open questions.** Drift-detection thresholds for writing diagnostics are not established.

---

## TOPIC 7 — ESL Writing Assessment

### 7.1 Separating Content Rigor from Linguistic Polish

**Best-practice summary.** The "content vs. language" separation is a recognized principle in writing-assessment rubrics (TOEFL, IELTS analytic rubrics score content, organization, language, and mechanics separately). The theoretical foundation is **construct-irrelevant variance** (Messick, 1989): when assessing *content rigor*, the writer's language proficiency is construct-irrelevant — penalizing content for language errors conflates two constructs. The empirical evidence supports the concern: Politzer-Ahles et al. (2020) found reviewers gave lower scientific-quality ratings to abstracts with non-native-like writing even when content was held constant — direct evidence of construct-irrelevant variance in academic reviewing. The ERPP literature (Curry & Lillis; Hanauer & Englander; Soler 2021) documents the systemic added burden on EAL researchers. The operational implication for a rewriting engine: ESL-flagged text MUST be evaluated on two independent axes — *content rigor* (claims, evidence, logic, structure) and *linguistic polish* (grammar, idiom, fluency) — and the two scores MUST be reported separately, never collapsed.

**Key sources.**
- Politzer-Ahles, S. et al. (2020). *Preliminary evidence of linguistic bias in academic reviewing.* Journal of English for Academic Purposes, 46, 100092. https://www.sciencedirect.com/science/article/pii/S1475158520301685 — empirical evidence of reviewer linguistic bias.
- Soler, J. (2021). *Linguistic injustice in academic publishing in English.* https://www.jbe-platform.com/content/journals/10.1075/jerpp.21002.sol — EAL publication-burden framing.
- Messick, S. (1989). *Validity.* (Construct-irrelevant variance concept.) — foundational educational-measurement source; referenced via Banerjee 2016: https://academiccommons.columbia.edu/doi/10.7916/D8HQ59VR/download.

**Confidence-tagged claims.**
- Content rigor and linguistic polish are distinct constructs; collapsing them introduces construct-irrelevant variance. **[H]** — Messick; rubric-design consensus.
- There is empirical evidence of linguistic bias against EAL writing in peer review. **[M]** — Politzer-Ahles 2020 is "preliminary"; consistent with ERPP literature.
- EAL researchers face a systemic added publication burden. **[H]** — multiple ERPP studies.

**Research-settled vs. calibration-required.**
- *Settled:* separate content-rigor and linguistic-polish scores; do not collapse.
- *Calibration-required:* the ESL-detection threshold for triggering dual scoring **[CAL]**; the specific rubric anchors per register **[CAL]**.

**Spec proposals.**
- **ESL-1.** ESL-flagged text MUST receive two independent diagnostic scores: Content Rigor and Linguistic Polish. The engine MUST report them separately and MUST NOT let a low Polish score depress a Rigor score. *Feeds decision: ESL-aware scoring structure.*
- **ESL-2.** ESL detection MUST be conservative (high-precision, accept lower recall) to avoid mis-flagging native writers; a false ESL flag has fairness costs. Threshold **[CAL]**. *Feeds decision: when dual scoring activates.*

**Open questions.** Reliable ESL detection that does not itself encode native-speaker bias is an open problem (see Topic 6.3 / Liang 2023).

---

### 7.2 Fairness Frameworks for Non-Native Speaker Evaluation

**Best-practice summary.** The educational-measurement fairness tradition provides the framework: **Kunnan's Test Fairness Framework** (Kunnan 2004, expanded 2018) comprises fairness and justice principles, integrating validity, access, and justice; it explicitly invokes Messick's construct-irrelevant variance. The **Standards for Educational and Psychological Testing** (AERA/APA/NCME) is the authoritative source. **Differential Item Functioning (DIF)** is a fairness diagnostic for test items; its analog for writing evaluation is checking whether a given diagnostic flag fires differentially on ESL vs. native text *for equivalent underlying quality* — if it does, it is unfair. The "native-speakerism" critique (Holliday) and the World Englishes tradition (Kachru's three circles: Inner, Outer, Expanding) argue that "native" is not a coherent quality standard and that Outer-Circle varieties are legitimate, not defective. For the engine, the operational requirements: (a) every [CC] diagnostic must be checked for differential firing on ESL vs. native equivalent-quality text; (b) "native-norm" must not be the default correctness standard.

**Key sources.**
- Kunnan, A. (2004/2018). *Test Fairness Framework.* (Referenced via Isbell 2023: https://www.tandfonline.com/doi/full/10.1080/15434303.2023.2288251 and Banerjee 2016: https://academiccommons.columbia.edu/doi/10.7916/D8HQ59VR/download) — the fairness-framework standard in language assessment.
- Kachru, B. (1985). *Standards, codification and sociolinguistic realism: the English language in the outer circle.* (Three Circles; referenced via Pakir 2019, World Englishes, https://doi.org/10.1111/weng.12399: https://onlinelibrary.wiley.com/doi/10.1111/weng.12399) — World Englishes legitimacy of non-native varieties.
- AERA/APA/NCME. *Standards for Educational and Psychological Testing.* — the authoritative fairness standards.

**Confidence-tagged claims.**
- Kunnan's TFF (validity, access, justice) is a recognized fairness framework in language assessment. **[H]**.
- Construct-irrelevant variance from language proficiency is a fairness violation when assessing content. **[H]** — Messick; Kunnan.
- World Englishes theory holds that Outer-Circle varieties are legitimate, not defective. **[H]** — Kachru; established.
- Every diagnostic should be checked for differential firing on ESL vs. native equivalent-quality text (DIF analog). **[M]** — methodologically principled, not standard practice in writing engines.

**Research-settled vs. calibration-required.**
- *Settled:* apply a fairness framework; check diagnostics for differential firing; do not default to native-norm.
- *Calibration-required:* the DIF-like threshold for declaring a diagnostic unfair **[CAL]**; the reference ESL corpus for the check **[CAL]**.

**Spec proposals.**
- **ESL-3.** Every [CC] and [LJ] diagnostic MUST be evaluated for differential firing on ESL vs. native equivalent-quality text from the golden corpus. Any diagnostic firing differentially beyond **[CAL]** MUST be suppressed, re-calibrated, or labeled ESL-advisory-only. *Feeds decision: diagnostic fairness auditing.*
- **ESL-4.** "Native-norm conformity" MUST NOT be a default correctness standard. Correctness is defined per register and per World-Englishes variety where applicable. *Feeds decision: the correctness target.*

**Open questions.** DIF methods were developed for test items, not continuous diagnostics; adaptation is principled but unvalidated for writing-engine use.

---

### 7.3 Graded Intervention Models (Minimal / Moderate / Full Polish)

**Best-practice summary.** Prior art on *graded* editing tiers comes from: professional editing standards (CIEP — Chartered Institute of Editing and Proofreading; EFA — Editorial Freelancers Association), which define developmental editing, line editing, copyediting, and proofreading as distinct tiers; and machine-translation post-editing, which defines full and light post-editing levels. The tier boundaries are convention, not evidence-validated, but they are recognizable and useful. The ethics concern: "full polish" of academic writing can cross into **ghostwriting/misrepresentation** of the author's language proficiency — most journals permit language editing but draw a line at content/argumentation changes; the engine must respect this line. The operational tier definitions for a rewriting engine: **Minimal** = fix meaning-obstructing errors only, preserve voice and non-critical variation; **Moderate** = minimal + improve fluency and register-appropriateness, preserve content and stance; **Full** = moderate + native-norm alignment, still preserve content/argument and identity markers. Each tier MUST be user-selectable and the engine MUST state what each tier changes and preserves.

**Key sources.**
- CIEP (Chartered Institute of Editing and Proofreading). *Editorial tiers.* https://www.ciep.co.uk/ — professional editing-tier definitions.
- (MT post-editing tiers: TAUS / ISO 18587 full vs. light post-editing — established convention.)
- (Academic editing ethics: ICMJE; COPE — language editing permitted, content/authorship changes prohibited.)

**Confidence-tagged claims.**
- Graded editing tiers (developmental/line/copy/proofread; full/light post-editing) are established professional convention. **[H]**.
- Tier boundaries are convention, not evidence-validated. **[M]**.
- Full polish of academic writing risks ghostwriting if it alters content/argumentation; journals permit language editing only. **[H]** — ICMJE/COPE.

**Research-settled vs. calibration-required.**
- *Settled:* offer graded tiers; preserve content/argument and identity markers across all tiers; in academic, prohibit content/argumentation changes regardless of tier.
- *Calibration-required:* the exact operation boundary of each tier per register **[CAL]**.

**Spec proposals.**
- **ESL-5.** The engine MUST offer three user-selectable polish tiers (Minimal / Moderate / Full) with explicit statements of what each changes and preserves, defaulting to Minimal for ESL-flagged text. *Feeds decision: rewrite-intensity selection.*
- **ESL-6.** In academic register, Full polish MUST NOT alter claims, evidence, argumentation, or citations — only language. The engine MUST refuse content-altering requests in academic Full-polish mode. *Feeds decision: ghostwriting guardrail.*
- **ESL-7.** Across all tiers, the engine MUST preserve culturally specific references and identity markers unless the user explicitly requests their removal. *Feeds decision: identity preservation.*

**Open questions.** Empirical evidence on the user-trust and outcome effects of tiered polishing is absent.

---

### 7.4 Detecting and Respecting ESL Voice Markers

**Best-practice summary.** The hardest sub-problem: distinguishing **error** (meaning-obstructing) from **variation** (identity-bearing non-standard usage). Theoretical support comes from **World Englishes** (Kachru — Outer-Circle varieties are legitimate) and **translingual writing** theory (Horner, Lu, Matsuda — writing that moves between language varieties; "language difference" as resource, not deficit). Operationally, the distinction is not reliably computable; it requires [LJ] judgment informed by register and by the author's likely variety. A practical decision procedure: classify each non-standard construction into {meaning-obstructing error, register-inappropriate usage, identity-bearing variation, stable non-native variety}. The first two MAY be flagged for correction by default; the latter two MUST be preserved unless the user explicitly requests Full polish. The risk: the engine's own ESL detector may encode native-speaker bias (Topic 6.3 / Liang 2023), so ESL detection and voice-marker classification must be audited for fairness.

**Key sources.**
- Horner, B., Lu, M., Matsuda, P. K., et al. *Language Difference in Writing: Toward a Translingual Approach.* https://ir.library.louisville.edu/cgi/viewcontent.cgi?article=1065&context=faculty — translingual writing theory.
- Kachru, B. (1985) (via Pakir 2019, https://doi.org/10.1111/weng.12399) — World Englishes legitimacy.

**Confidence-tagged claims.**
- The error/variation distinction is theoretically grounded (World Englishes, translingual writing) but not reliably computable. **[H]** — theory settled, computation open.
- ESL detection and voice-marker classification risk encoding native-speaker bias and must be fairness-audited. **[H]** — Liang 2023 generalizes.

**Spec proposals.**
- **ESL-8.** The engine MUST classify every non-standard construction in ESL-flagged text into {meaning-obstructing error, register-inappropriate usage, identity-bearing variation, stable non-native variety}. Only the first two MAY be flagged for correction by default; the latter two MUST be preserved unless Full polish is selected. *Feeds decision: what gets corrected vs. preserved in ESL rewriting.*
- **ESL-9.** The classification MUST be an [LJ] pass; it MUST be audited for differential treatment of equivalent-quality text across varieties (ESL-3). *Feeds decision: fairness of voice-marker handling.*

**Open questions.** Reliable error/variation classification is an open research problem; the engine will operate at imperfect accuracy and must surface uncertainty.

---

# PART B — PROPOSED CONSTITUTION ADDITIONS

The **Constitution** is the ~2-page set of irreducible rules loaded on *every* inference call. The selection criterion: a rule belongs here if violating it produces a **safety-critical** failure (hallucination, fabrication, unfairness, faithfulness breach) that cannot be caught downstream cheaply. The following are proposed additions (the existing Part I philosophy is retained as-is and not re-listed).

Each rule is written as an operational invariant the engine can check, and names the decision it feeds.

---

### C-1. Faithfulness Gate (Nonfiction) — *highest priority*
**Rule.** In nonfiction registers (business, academic, legal, marketing/SEO, conversational-factual), the engine MUST NOT emit as an assertion any content element that is not either (a) directly present in the source, or (b) licensed-inferred from the source via entailment, anaphora, bridging, or lexical paraphrase. Non-entailed specifics (dates, names, statistics, citations, causal world-claims) MUST be emitted as typed placeholders (`[MISSING:{TYPE}|reason|anchor]`) or as clarification requests — never as assertions.
**Feeds decision:** the core output-emission gate; resolves the known "increase specificity" hallucination gap.
**Basis:** Maynez et al. 2020 (intrinsic/extrinsic hallucination); COPE fabrication/falsification definitions; SEC substantiation principle.
**Confidence:** [H].

### C-2. Source-Fact Ledger Invariance
**Rule.** Before rewriting nonfiction, the engine MUST extract a Source-Fact Ledger (named entities, numeric values with units, citation markers + referents, direct quotations) and MUST NOT alter any ledger entry's value, unit, or referent during rewriting. Any deviation MUST be flagged and blocked.
**Feeds decision:** protecting quantitative and citation integrity.
**Basis:** entity-aware and grounded-generation literature; SPEC-1/SPEC-3.
**Confidence:** [H].

### C-3. Prohibition on Inventing Sources, Data, and Citations
**Rule.** The engine MUST NEVER generate a citation, datum, statistic, quotation, or date not present in the Source-Fact Ledger. This is absolute (no register, no polish tier, no "improve specificity" instruction overrides it).
**Feeds decision:** fabrication guardrail; ties to COPE/ICMJE misconduct definitions.
**Basis:** COPE retraction guidelines; ICMJE recommendations.
**Confidence:** [H].

### C-4. AI-Pattern Diagnostics Are Advisory, Never Authoritative
**Rule.** Stylometric and AI-pattern diagnostics ([CC]: lexical diversity, burstiness, passive frequency, n-gram repetition, readability, function-word vectors; and any [LJ] AI-pattern judgment) are ADVISORY. They MUST NOT trigger automatic rewrites that override meaning preservation, register obligations, correctness, clarity, or legal/academic integrity. They MUST NOT penalize legitimate regularity (IMRAD, statute format, branding consistency, ESL writing).
**Feeds decision:** the weight of AI-pattern flags in the rewrite decision (reaffirms existing Bible Part VIII.II with research backing).
**Basis:** Liang et al. 2023 (false-positive catastrophe on ESL/structured text).
**Confidence:** [H].

### C-5. Readability Formulas Are Triage Only
**Rule.** Readability formula scores MUST NOT be used as quality verdicts or optimization targets. They MAY be used as triage signals (forwarding a passage to an [LJ] clarity check) and as corpus-level monitoring metrics. The engine MUST report at least two formulas to surface divergence and MUST label results "surface-density estimate, not a comprehension measure." In academic/technical registers, readability MUST be suppressed or heavily caveated.
**Feeds decision:** permissible uses of readability; forbids score-maximizing rewrites.
**Basis:** AHRQ; Redish 2019; Wang et al. 2013 (up-to-5-grade divergence).
**Confidence:** [H].

### C-6. ESL Content/Polish Separation
**Rule.** ESL-flagged text MUST be evaluated on two independent axes — Content Rigor and Linguistic Polish — reported as separate scores. A low Polish score MUST NOT depress a Rigor score. Default polish tier for ESL-flagged text = Minimal.
**Feeds decision:** ESL-aware scoring structure and default tier.
**Basis:** Messick (construct-irrelevant variance); Politzer-Ahles et al. 2020 (linguistic bias evidence).
**Confidence:** [H].

### C-7. No Default Native-Norm Correctness Standard
**Rule.** "Native-speaker conformity" MUST NOT be the default correctness standard. Correctness is defined per register and per World-Englishes variety. Identity-bearing variation and stable non-native varieties MUST be preserved across all polish tiers except user-selected Full polish, and in academic Full polish, content/argumentation MUST NOT change regardless of tier.
**Feeds decision:** the correctness target and ghostwriting guardrail.
**Basis:** Kachru (World Englishes); translingual writing theory; ICMJE/COPE language-editing limits.
**Confidence:** [H].

### C-8. Mixed-Register Stake-Primacy
**Rule.** When multiple registers are active and their obligations conflict, the engine MUST resolve by stake-primacy: regulated-communication obligations > meaning/truth preservation > dominant-register obligations > secondary-register obligations > reader intelligibility > user voice > AI-pattern adjustments. Where two registers are near-equal in confidence and their obligations conflict, the engine MUST surface the conflict to the user rather than silently resolving.
**Feeds decision:** inter-register conflict resolution (extends, does not replace, the existing priority stack).
**Basis:** synthesis from genre theory (Biber; Bhatia) and regulatory-primacy precedents; principled, not evidence-validated.
**Confidence:** [M].

### C-9. Long-Range Diagnostics: No Fabricated Closure
**Rule.** The engine MUST NOT auto-generate a payoff, resolution, or closure to satisfy a deferred long-range check (foreshadowing, campaign promise, case-law chain). Unresolved DEFERRED items at document end MUST be surfaced as a review queue, not silently closed.
**Feeds decision:** preventing fabricated narrative/logical closure.
**Basis:** Bible Part I.III (Outcome-Based Diagnostics); principled extension.
**Confidence:** [M].

### C-10. State Persistence Outside the Context Window
**Rule.** Long-range consistency MUST be maintained via a persisted Document State object outside the model's context window; the engine MUST NOT rely on context-window memory for cross-chunk consistency. Critical anchors MUST be placed at context edges or restated, not assumed remembered.
**Feeds decision:** where state lives and how working contexts are constructed.
**Basis:** Liu et al. 2023/2024 ("lost in the middle"); MemGPT (Packer et al. 2023).
**Confidence:** [H].

### C-11. Validation Gate Before Deployment
**Rule.** No model or prompt change MAY ship unless it passes the regression holdout with no statistically significant quality decline on any rubric dimension AND no increase in AI-pattern false-positive rate on the adversarial set. LLM-as-judge MAY NOT be the primary signal for voice-alignment, ESL-fairness, or creative-quality dimensions.
**Feeds decision:** change-release gating and permissible auto-scoring.
**Basis:** van der Lee et al. 2019/2021; Liang et al. 2023; LLM-as-judge bias surveys.
**Confidence:** [H].

---

# PART C — PROPOSED OS COMPONENTS

The **Operating System** holds the decision loops, state model, and per-pack diagnostic implementations that the Constitution authorizes. These are NOT loaded every call (only the Constitution is); they are loaded when their decision is needed.

## OS-1. Document State Object (Schema)

```
DocumentState {
  StyleSheet: {
    voiceAttributes: AttributeMatrix,
    functionWordProfile: Vector,
    eslMarkers: MarkerSet,
    bannedPhrases: List[string],
    doDontExamples: List[Example],
    sourceSamples: List[TextRef]
  },
  EntityLedger: {
    entities: Map[CanonicalName, {aliases, attributes, firstMentionSpan, type}],
    definedTerms: Map[Term, Definition]   // legal/academic; exempt from repetition flagging
  },
  CanonLedger: {
    // fiction
    characters: Map[Name, {attributes, relationships, knowledgeSet}],
    worldFacts: List[Fact],
    // nonfiction
    claimsWithSources: Map[Claim, SourceSpan]
  },
  SourceFactLedger: {   // nonfiction; extracted pre-rewrite
    namedEntities, numericValues (with units), citationMarkers (+referents), quotations
  },
  DeferredChecks: List[{
    type, anchorSpan, setupSummary,
    status: DEFERRED | PASS | FAIL,
    resolutionAnchor
  }],
  DiagnosticHistory: AppendOnlyList[{revisionId, scores, flags}],
  RegisterVector: MultiLabel[register -> confidence]   // per-section
}
```
*Update semantics per STATE-5. The schema is the contract between the Constitution's invariants and the per-pack diagnostics.*

## OS-2. Inference Decision Loop (per revision pass)

1. **Register Detection** [CC + LJ] → multi-label RegisterVector (per section). Low-confidence → escalate (C-8).
2. **Stake-Primacy Resolution** (C-8) → determine lead pack + secondary packs per section.
3. **Source-Fact Ledger Extraction** (nonfiction) → populate SourceFactLedger (C-2).
4. **State Retrieval** (STATE-2) → construct working context: chunk + retrieved spans + relevant DocumentState slice, anchors at edges.
5. **Local Diagnostics** [CC] → lexical diversity (MTLD/HD-D), sentence-length, passive (dependency-parse), n-gram repetition, readability (≥2 formulas), function-word vector. All advisory (C-4, C-5).
6. **Local Diagnostics** [LJ] → clarity, register-fit, voice-alignment, specificity-without-hallucination, ESL error/variation classification.
7. **Rewrite Generation** under priority stack (existing) + stake-primacy (C-8) + faithfulness gate (C-1).
8. **Post-Generation Factuality Check** [LJ] (DAE/QuestEval-style) → block extrinsic hallucination (HALL-2).
9. **State Update** → EntityLedger, CanonLedger, DeferredChecks, DiagnosticHistory (atomic, per STATE-5).
10. **Long-Range Resolution** → attempt DEFERRED items preceding the edit point; never fabricate closure (C-9).
11. **Output Emission** → strip/resolve placeholders per emission mode (PH-2); default nonfiction = Strict.

## OS-3. Diagnostic Implementation Map (per pack)

Each pack declares which [CC] and [LJ] diagnostics apply, with the Constitution constraints:
- **Fiction:** [CC] lexical diversity (advisory), sentence-length variance (advisory, ESL/structured override SL-2), function-word voice profiling; [LJ] character-specificity, tension-change, canon-consistency (INF-3). No Source-Fact Ledger; no readability.
- **Marketing:** [CC] function-word voice vector vs. StyleSheet, banned-phrase detection, opener n-gram repetition; [LJ] voice-consistency, benefit/CTA clarity, factual-claim substantiation-marker (MKT-1), disclosure-obligation check (MKT-2). Source-Fact Ledger = brand facts only.
- **Business:** [CC] BLUF-position check, readability (triage, C-5), passive (vs. business baseline [CAL]); [LJ] purpose/task clarity, tone-appropriateness. Aligned to Federal Plain Language Guidelines (BIZ-1).
- **Academic:** [CC] structural-completeness (IMRAD presence, discipline-conditional ACA-1), n-gram repetition (template-flow), stylometric uniformity (advisory only); [LJ] citation-integrity, ESL error/variation (ESL-8), content-rigor vs. polish separation (ESL-1). Hard prohibition on source/data/citation invention (C-3).
- **Legal:** [CC] nested-exception depth, double-negative detection, cross-reference density, sentence-length vs. jurisdictional baseline [CAL], citation-graph integrity (LR-2); [LJ] one-idea-per-clause, definitions clarity, ambiguity detection. Jurisdiction detection (LAW-1). Passive NOT a defect by default (PV-3).
- **SEO/Content:** [CC] heading-structure, keyword-density (anti-stuffing), meta/title/intro alignment; [LJ] intent-alignment, user-centricity. Substantiation markers for any factual claim (MKT-1).
- **Conversational/Chat:** [CC] turn-length, formulaic-reply detection; [LJ] tone-match, next-step clarity. Factuality gate applies to factual claims (C-1).

## OS-4. Validation Subsystem

- **Golden Corpus** (VAL-1): stratified across 7 registers × ESL/native × length × quality; per-register adversarial subset (VAL-2).
- **Human Evaluation** (VAL-3/4): analytic rubric, Krippendorff's α per dimension, power-analyzed sample size.
- **LLM-as-Judge** (VAL-7/8/9): meta-evaluated per dimension; disallowed as primary signal for voice/ESL/creative.
- **Regression Holdout** (VAL-10): re-run on every change; ship gate.
- **Drift Monitoring** (VAL-11): diagnostic-score distribution alerts.

## OS-5. Per-Pack Calibration Registry (the [CAL] resolver)

A registry mapping each [CAL]-flagged threshold to: the calibration method (golden-corpus percentile, DIF analysis, power analysis), the calibration corpus, the current value, and the re-calibration cadence. This makes explicit *what is locally determined* vs. *what is research-settled*, and prevents thresholds from being treated as universal constants. Every numeric threshold in the engine MUST have a registry entry; thresholds without a registry entry MUST default to "advisory, no flag."

---

# PART D — RESEARCH GAPS

**What research CANNOT settle and must be determined empirically through system execution.** Stating these explicitly is required by the constraints; they are not failures but the boundary between generalizable research and local calibration.

### D-1. Per-Register Numeric Thresholds
Every numeric threshold in this document — MTLD/HD-D flag points, passive-voice baselines, n-gram repetition cutoffs, readability concern bands, sentence-length variance bounds, ESL-detection confidence, Krippendorff's α targets, LLM-as-judge agreement thresholds, drift-alert bounds — is **not research-settled** and MUST be calibrated on the engine's own golden corpus per register. Research settles *which measures to use* and *that thresholds must be calibrated*; it does not settle the numbers.

### D-2. Foreshadowing / Long-Range Narrative Mechanism Detection
No validated computational method exists for detecting narrative setups, tracking their payoff, or evaluating foreshadowing quality. The deferred-check ledger (LR-1) is a principled design; its recall (does it detect real setups?) and precision (does it flag non-setups?) are unknown and must be measured empirically. Reader-knowledge vs. character-knowledge tracking (essential for mystery) is especially under-researched.

### D-3. Reliable Error vs. Variation Classification (ESL)
The translingual/World-Englishes theory is settled, but the operational classification of a given non-standard construction as error vs. identity-bearing variation is not reliably computable. The engine's [LJ] classifier (ESL-8) will operate at imperfect accuracy; the accuracy itself must be measured and the classifier fairness-audited (ESL-9). No benchmark exists.

### D-4. Inter-Register Conflict Resolution (Stake-Primacy)
The stake-primacy ordering (C-8) is a principled synthesis, not an evidence-validated rule. The correct resolution for specific register pairs (academic × marketing thought-leadership; legal × marketing law-firm blog; SEO × legal compliance pages) must be observed empirically and the ordering refined. Genre theory *describes* blending; it does not *prescribe* resolution.

### D-5. Factuality Metrics for Rewriting (vs. Summarization)
FactCC, QuestEval, DAE are validated for summarization. Their adaptation to rewriting is principled but unproven; their error rates on numbers, negation, and presupposition in rewritten prose must be measured. No rewriting-specific factuality benchmark exists.

### D-6. LLM-as-Judge for Rewriting Quality
LLM-as-judge agreement with humans is studied for generation, less so for rewriting. Agreement on the engine's specific dimensions (voice-alignment, ESL-fairness, specificity-without-hallucination) must be measured; the VAL-7/8 fallbacks are necessary precisely because research is insufficient here.

### D-7. Multi-Label Register Detection on the Engine's Seven Packs
Biber's MD analysis was developed on general English registers. Its behavior on the engine's specific seven-pack set, and the optimal feature inventory and dimension weights, must be locally calibrated. No published benchmark covers this exact register set.

### D-8. Section-Boundary Detection for Mixed-Register Texts
Section-level register detection (MR-4) requires reliable section segmentation, which is non-trivial for unstructured documents. No validated method covers the engine's input variety.

### D-9. Effect of Tiered Polish on User Outcomes
The graded intervention model (ESL-5) is convention-grounded; its effects on user trust, comprehension, and publication outcomes are unevidenced and would require user studies to establish.

### D-10. Drift Detection for Writing Diagnostics
Distributional drift thresholds for writing-engine diagnostic scores over time (VAL-11) are not established; they must be set from operating data and refined.

---

### Summary of Confidence Across the Deliverable

| Topic | Coverage | Avg. Confidence | Key Limitation |
|---|---|---|---|
| 1. Computed metrics | Strong | [H] on measures, [L] on thresholds | Thresholds uncalibrated |
| 2. Per-register standards | Strong | [H] | Some frameworks (BLUF) convention-only |
| 3. Hallucination guardrails | Strong | [H] on taxonomy, [M] on rewriting adaptation | No rewriting-specific factuality benchmark |
| 4. State architecture | Moderate | [M] | Foreshadowing tracking has no prior art |
| 5. Mixed-register | Moderate | [M] | Conflict resolution under-researched |
| 6. Validation | Strong | [H] on method, [M] on thresholds | Writing-quality golden set must be built |
| 7. ESL assessment | Strong | [H] on theory, [M] on computation | Error/variation classification unsolved |

**Bottom line.** The research base is sufficient to write a defensible Constitution (safety-critical invariants with [H] confidence), a defensible OS (decision loops and state schema with [M] confidence and explicit calibration points), and an honest Research Gaps section (the boundary where research ends and empirical system execution must begin). The single highest-value addition is **C-1 (the Faithfulness Gate)**: it directly resolves the known hallucination risk from "increase specificity" instructions in nonfiction, and it is grounded in the strongest available prior art (Maynez et al. 2020; COPE; SEC substantiation).
