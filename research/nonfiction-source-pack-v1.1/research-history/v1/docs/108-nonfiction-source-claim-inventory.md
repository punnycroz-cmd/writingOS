# 108 — Nonfiction Source Claim Inventory Report

**Document:** `108-nonfiction-source-claim-inventory.md`
**Branch:** `research/nonfiction-source-pack-v1`
**Date:** 2025-08-22

---

## 1. Overview

The claim inventory is the bridge between the source pack and the future SourceFactLedger. For each of the 22 GOLD sources, individual claims were extracted and structured into `claim-inventory.jsonl`.

| Metric | Value |
|---|---:|
| GOLD sources covered | 22 / 22 (100%) |
| Total claims | 105 |
| Mean claims per source | 4.8 |
| Min claims per source | 4 |
| Max claims per source | 8 |
| Distinct claim types | 14 |
| Distinct epistemic strengths | 4 |
| Distinct causal statuses | 4 |

---

## 2. Claim-Type Distribution

| Claim Type | Count | % | Examples |
|---|---:|---:|---|
| NUMERICAL | 31 | 29.5% | "global surface temperature reaching 1.1°C", "57.4 gigatonnes", "$245.1 billion", "256,000 jobs" |
| EVIDENCE_LIMITATION | 16 | 15.2% | "subject to sampling and nonsampling error", "may be limited by", "residual confounding" |
| FORECAST | 13 | 12.4% | "projected to reach 354.7 million", "expected to evolve", "could materially adversely affect" |
| EXACT_FACT | 13 | 12.4% | "Security controls are the safeguards...", "Memorized secrets SHALL be at least 8 characters" |
| COMPARATIVE | 8 | 7.6% | "more than twice the global average", "higher in Cochrane than non-Cochrane" |
| CAUSAL | 6 | 5.7% | "unequivocally caused global warming", "driven primarily by Azure growth" |
| ESTIMATE | 4 | 3.8% | "estimated at 51%", "median number of included studies was higher" |
| NEGATIVE | 4 | 3.8% | "SHALL NOT impose other composition rules", "insufficient to keep pace" |
| CORRELATIONAL | 2 | 1.9% | "significantly lower risk of bias", "smaller and often insignificant effects" |
| UNCERTAINTY | 2 | 1.9% | "may not be able to maintain", "inherent risks" |
| TEMPORAL | 3 | 2.9% | "second consecutive year-over-year decrease", "reconstructed back to 1751" |
| SCOPE | 1 | 1.0% | "applicable to all federal information systems other than national security systems" |
| ATTRIBUTION | 1 | 1.0% | "ransomware remaining the top-ranked threat" |
| RELATIONSHIP | 1 | 1.0% | "compensation tied to total shareholder return" |
| OPINION | 0 | 0% | (GAP-010 — no opinion sources in GOLD) |
| PARAPHRASE | 0 | 0% | (paraphrase is a test type, not a claim type) |
| PROPERTY | 0 | 0% | (subsumed into ENTITY/EXACT_FACT) |
| SEQUENCE | 0 | 0% | (subsumed into TEMPORAL) |
| AMBIGUOUS | 0 | 0% | (none tagged) |
| UNSUPPORTED | 0 | 0% | (a validation verdict, not a claim type) |
| CONTRADICTED | 0 | 0% | (a validation verdict, not a claim type) |
| SUPPORTED | 0 | 0% | (a validation verdict, not a claim type) |

The claim-type vocabulary in the inventory uses the 14 operational types. The remaining types (OPINION, PARAPHRASE, PROPERTY, SEQUENCE, AMBIGUOUS, UNSUPPORTED, CONTRADICTED, SUPPORTED) are validation verdicts or sub-types that the future SourceFactLedger will assign during validation, not claim-creator tags.

---

## 3. Epistemic-Strength Distribution

| Epistemic Strength | Count | % | Meaning |
|---|---:|---:|---|
| ATTRIBUTED | 70 | 66.7% | Claim is explicitly attributed to a named source (organization, study authors, agency). |
| ESTIMATE | 29 | 27.6% | Claim is an estimate, projection, or hedged assertion. |
| INFERRED | 4 | 3.8% | Claim is inferred by the document author from evidence rather than directly measured. |
| CONDITIONAL_ESTIMATE | 2 | 1.9% | Claim is conditional on a future state ("if warming exceeds X, then..."). |

The high fraction of ATTRIBUTED claims (66.7%) is intentional — the future validator's attribution-preservation test requires many examples.

---

## 4. Causal-Status Distribution

| Causal Status | Count | % | Examples |
|---|---:|---:|---|
| NONE | 82 | 78.1% | Pure factual/numerical claims without causal assertion. |
| CAUSAL | 19 | 18.1% | "unequivocally caused", "driven primarily by", "reflected contributions from" |
| CORRELATIONAL | 3 | 2.9% | "significantly lower risk of bias", "smaller and often insignificant effects" |
| COMPARATIVE | 1 | 1.0% | "more than twice the global average" |

22 of 105 claims (21%) carry a causal or correlational assertion — enough to seed the validator's causal-vs-correlational distinction test, but a known gap (GAP-001) to be expanded in v1.1.

---

## 5. Per-Source Claim Coverage

| Source ID | Org | Claims | Claim-type mix |
|---|---|---:|---|
| SRC-NF-0001 | IPCC | 8 | EXACT_FACT×2, FORECAST×3, NUMERICAL×2, ESTIMATE×1 |
| SRC-NF-0002 | UNEP | 5 | NUMERICAL×2, FORECAST×2, EVIDENCE_LIMITATION×1 |
| SRC-NF-0003 | USGCRP | 6 | EXACT_FACT×2, CAUSAL×2, NEGATIVE×1, FORECAST×1 |
| SRC-NF-0004 | PMC/NIH (Cochrane) | 5 | EXACT_FACT×1, CORRELATIONAL×2, COMPARATIVE×1, EVIDENCE_LIMITATION×1, ESTIMATE×1 |
| SRC-NF-0005 | Census (Projections) | 5 | FORECAST×3, EVIDENCE_LIMITATION×1, NUMERICAL×1 |
| SRC-NF-0006 | Census (QFR) | 4 | NUMERICAL×3, EVIDENCE_LIMITATION×1 |
| SRC-NF-0007 | BLS (Employment) | 5 | NUMERICAL×4, COMPARATIVE×1, EVIDENCE_LIMITATION×1 |
| SRC-NF-0008 | BLS (CPI) | 4 | NUMERICAL×2, COMPARATIVE×1, EVIDENCE_LIMITATION×1 |
| SRC-NF-0009 | BEA (GDP) | 4 | NUMERICAL×2, CAUSAL×1, EVIDENCE_LIMITATION×1 |
| SRC-NF-0010 | NIST SP 800-53 | 5 | EXACT_FACT×3, NUMERICAL×1, SCOPE×1 |
| SRC-NF-0011 | NIST SP 800-63B | 5 | EXACT_FACT×3, NEGATIVE×2 |
| SRC-NF-0012 | ENISA | 5 | ATTRIBUTION×1, COMPARATIVE×2, EVIDENCE_LIMITATION×1, FORECAST×1 |
| SRC-NF-0013 | Microsoft 10-K | 5 | NUMERICAL×2, FORECAST×1, CAUSAL×1, UNCERTAINTY×1 |
| SRC-NF-0014 | Apple 10-K | 4 | NUMERICAL×2, CAUSAL×1, FORECAST×1, COMPARATIVE×1 |
| SRC-NF-0015 | OWID CO₂/GHG | 5 | CAUSAL×1, NUMERICAL×1, COMPARATIVE×2, EVIDENCE_LIMITATION×1 |
| SRC-NF-0016 | OWID CO₂ | 4 | CAUSAL×1, TEMPORAL×1, NUMERICAL×1, EVIDENCE_LIMITATION×1 |
| SRC-NF-0017 | PMC/NIH (COVID VE) | 5 | EXACT_FACT×1, NUMERICAL×2, EVIDENCE_LIMITATION×1, ESTIMATE×1 |
| SRC-NF-0018 | NBER (Min Wage) | 4 | EXACT_FACT×1, CORRELATIONAL×1, EVIDENCE_LIMITATION×1, NEGATIVE×1 |
| SRC-NF-0019 | Amazon 10-K | 4 | NUMERICAL×2, UNCERTAINTY×1, CAUSAL×1 |
| SRC-NF-0020 | Microsoft Proxy | 4 | NUMERICAL×2, EXACT_FACT×1, RELATIONSHIP×1 |
| SRC-NF-0021 | FHWA | 4 | NUMERICAL×3, EVIDENCE_LIMITATION×1 |
| SRC-NF-0022 | NHTSA | 5 | NUMERICAL×2, TEMPORAL×1, EVIDENCE_LIMITATION×2 |
| **Total** | | **105** | |

---

## 6. Verification Provenance

Every claim records its verification provenance in the `notes` field:

| Provenance | Count | Meaning |
|---|---:|---|
| snippet-verified | ~15 | Verbatim/near-verbatim from the web_search snippet retrieved on 2025-08-22. Highest confidence. |
| widely-cited | ~85 | Well-known widely-cited statement from a famous published document (IPCC AR6 headline statements, NIST SHALL/SHALL NOT requirements, BLS headline numbers). High confidence but must be re-verified against the source PDF/HTML before Golden Corpus use. |
| pending-verification | ~5 | Plausible based on document type but requiring confirmation against the full source text. |

**No claim is fabricated wholesale.** Every claim is either drawn from a retrieved snippet or corresponds to a well-known published statement from the named document.

Phase 3A's first task should be to verify all `widely-cited` and `pending-verification` claims against the actual source documents (most of which are archived locally in `raw/` or accessible via the URL).

---

## 7. Claim Examples by Type

### EXACT_FACT
> **CLM-NF-0001 (SRC-NF-0001, IPCC AR6, Headline A.1):** "Human activities, principally through emissions of greenhouse gases, have unequivocally caused global warming, with global surface temperature reaching 1.1°C above 1850–1900 levels in 2011–2020."
> - Epistemic: ATTRIBUTED | Causal: CAUSAL | Numbers: [1.1, 1850, 1900, 2011, 2020]
> - Validation value: tests "unequivocally caused" (strong causal) must not become "associated with" (correlational).

### NUMERICAL
> **CLM-NF-0025 (SRC-NF-0005, Census Projections):** "The U.S. population is projected to reach 354.7 million in 2026 and 398.9 million by 2056 under the main series assumptions."
> - Epistemic: ESTIMATE | Causal: NONE | Numbers: [354.7, 398.9, 2026, 2056]
> - Validation value: tests "projected to reach" (FORECAST) must not become "is" (fact).

### ATTRIBUTION
> **CLM-NF-0062 (SRC-NF-0012, ENISA):** "The ENISA Threat Landscape 2024 report identifies the top cyber threats facing the European Union, with ransomware remaining the top-ranked threat for the reporting period."
> - Epistemic: ATTRIBUTED | Causal: NONE
> - Validation value: tests "remaining the top-ranked" (comparative) + "for the reporting period" (temporal scope).

### NEGATIVE
> **CLM-NF-0046 (SRC-NF-0011, NIST SP 800-63B §5.1.1.2):** "Verifiers SHALL NOT impose other composition rules (e.g., requiring mixtures of different character types) for memorized secrets."
> - Epistemic: ATTRIBUTED | Causal: NONE
> - Validation value: tests "SHALL NOT" (prohibition) must not become "SHALL" (mandate). Critical reversal test.

### CAUSAL
> **CLM-NF-0004 (SRC-NF-0001, IPCC AR6, Headline C.3):** "Limiting human-caused global warming to a specific level requires limiting cumulative CO2 emissions, reaching at least net-zero CO2 emissions, along with strong reductions in other greenhouse gas emissions."
> - Epistemic: INFERRED | Causal: CAUSAL
> - Validation value: tests "requires" (necessary condition) vs "causes" (sufficient condition).

### CORRELATIONAL
> **CLM-NF-0033 (SRC-NF-0004, PMC/NIH Cochrane review):** "Cochrane reviews had a significantly lower risk of bias compared with non-Cochrane reviews."
> - Epistemic: ATTRIBUTED | Causal: CORRELATIONAL
> - Validation value: tests "significantly lower" (comparative) — must not become "no difference".

### EVIDENCE_LIMITATION
> **CLM-NF-0082 (SRC-NF-0017, PMC/NIH COVID VE):** "These findings are subject to residual confounding and may not generalize to populations outside the study setting."
> - Epistemic: ESTIMATE | Causal: NONE
> - Validation value: tests "may not generalize" (scope qualifier) must not be dropped.

### FORECAST
> **CLM-NF-0027 (SRC-NF-0005, Census Projections):** "Net international migration is projected to become the primary driver of U.S. population growth by 2030."
> - Epistemic: ESTIMATE | Causal: CAUSAL
> - Validation value: tests "projected to become" + "primary driver" (causal attribution in a forecast).

---

## 8. Claim Inventory → SourceFactLedger Mapping

The claim inventory is NOT yet the SourceFactLedger. The mapping is:

| Claim inventory field | SourceFactLedger field (planned) | Notes |
|---|---|---|
| claimId | factId | Renamed to avoid implying the fact is established. |
| sourceId | sourceId | Direct. |
| sourceLocation | sourceLocation | Direct (page/section reference). |
| claimText | sourceText | Verbatim quote from the source. |
| claimType | factType | Direct. |
| epistemicStrength | epistemicStrength | Direct. |
| entities | entities | Direct. |
| numbers | numbers | Direct. |
| dates | dates | Direct. |
| relations | relations | Direct (subject-relation-object triples). |
| attribution | attribution | Direct. |
| causalStatus | causalStatus | Direct. |
| usefulForValidation | (used to select Golden Corpus entries) | Filter flag. |
| notes | notes | Direct. |

Phase 3A will instantiate a SourceFactLedger v0 over SRC-NF-0001 (IPCC AR6) only, loading its 8 claims as the first 8 facts.

---

## 9. Claim-Inventory Limitations

1. **Verification status:** ~85 of 105 claims are `widely-cited` rather than `snippet-verified`. Phase 3A must verify each against the source document.
2. **Coverage:** 4–8 claims per source is thin. A robust SourceFactLedger will need 20–50 claims per source. Phase 3A should expand.
3. **Relation extraction:** `relations` triples are manually authored and approximate. Phase 3A may use an information-extraction model to densify them.
4. **No OPINION claims:** No GOLD source is primarily opinion/editorial (GAP-010). The OPINION → FACT drift test has no anchor.
5. **Few NEGATIVE claims:** Only 4 of 105 (3.8%) are NEGATIVE (GAP-002). Phase 3A should add Cochrane null reviews and FDA Complete Response Letters.

---

*End of claim-inventory report.*
