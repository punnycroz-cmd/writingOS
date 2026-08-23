# 109 — Nonfiction Source Validation-Opportunity Report

**Document:** `109-nonfiction-source-validation-opportunity-report.md`
**Branch:** `research/nonfiction-source-pack-v1`
**Date:** 2025-08-22

---

## 1. Overview

This report quantifies, per GOLD source, the number of validation opportunities across 15 categories. The full matrix is in `sources/nonfiction-v1/validation-opportunity-matrix.csv`. This report summarizes it and identifies which sources are best for which validation tests.

**Total validation opportunities across the 22 GOLD sources: 818.**

---

## 2. Category Totals (all GOLD sources)

| Category | Total Opportunities | % of Total | Notes |
|---|---:|---:|---|
| supported | 105 | 12.8% | Every claim is a "supported" anchor. |
| contradiction | 105 | 12.8% | Every supported claim is a contradiction candidate. |
| paraphrase | 105 | 12.8% | Every claim is a paraphrase candidate. |
| entities | 105 | 12.8% | Every claim has at least one named entity. |
| numbers | 59 | 7.2% | Claims with explicit numbers. |
| temporal | 60 | 7.3% | Claims with dates or temporal language. |
| attribution | 70 | 8.6% | Claims with explicit attribution. |
| uncertainty | 46 | 5.6% | Claims with hedge/estimate language. |
| comparative | 41 | 5.0% | Claims with comparative language. |
| forecast | 13 | 1.6% | Forecasts and projections. |
| causal | 22 | 2.7% | Causal or correlational claims. |
| unsupported | 24 | 2.9% | Claims with hedge words (subset of uncertainty). |
| negative | 7 | 0.9% | Negative findings / prohibitions. |
| dates | 53 | 6.5% | Claims with explicit date references. |
| scope | 3 | 0.4% | Claims with explicit scope qualifiers. |
| **Total** | **818** | **100%** | |

---

## 3. Per-Source Validation-Opportunity Matrix

The full matrix is in `validation-opportunity-matrix.csv`. Below is a condensed view, sorted by total opportunities.

| Source ID | Org | Claims | Supp | Unsupp | Contr | Num | Date | Ent | Attr | Causal | Paraph | Neg | Comp | Temp | Uncert | Scope | Forec | **Total** |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| SRC-NF-0001 | IPCC | 8 | 8 | 4 | 8 | 6 | 6 | 8 | 6 | 5 | 8 | 0 | 4 | 8 | 7 | 0 | 5 | 79 |
| SRC-NF-0002 | UNEP | 5 | 5 | 3 | 5 | 3 | 4 | 5 | 5 | 3 | 5 | 0 | 3 | 5 | 4 | 0 | 3 | 50 |
| SRC-NF-0003 | USGCRP | 6 | 6 | 3 | 6 | 3 | 4 | 6 | 6 | 4 | 6 | 1 | 3 | 5 | 5 | 0 | 2 | 54 |
| SRC-NF-0004 | PMC/NIH (Cochrane) | 5 | 5 | 3 | 5 | 0 | 0 | 5 | 5 | 2 | 5 | 0 | 3 | 0 | 4 | 0 | 0 | 37 |
| SRC-NF-0005 | Census (Proj) | 5 | 5 | 4 | 5 | 3 | 5 | 5 | 5 | 2 | 5 | 0 | 2 | 5 | 5 | 0 | 4 | 50 |
| SRC-NF-0006 | Census (QFR) | 4 | 4 | 1 | 4 | 4 | 4 | 4 | 4 | 0 | 4 | 0 | 3 | 4 | 2 | 0 | 0 | 38 |
| SRC-NF-0007 | BLS (Emp) | 5 | 5 | 1 | 5 | 5 | 3 | 5 | 5 | 0 | 5 | 0 | 2 | 4 | 1 | 0 | 0 | 41 |
| SRC-NF-0008 | BLS (CPI) | 4 | 4 | 0 | 4 | 4 | 3 | 4 | 4 | 0 | 4 | 0 | 3 | 4 | 1 | 0 | 0 | 35 |
| SRC-NF-0009 | BEA (GDP) | 4 | 4 | 2 | 4 | 4 | 3 | 4 | 4 | 2 | 4 | 0 | 2 | 4 | 4 | 0 | 0 | 39 |
| SRC-NF-0010 | NIST SP 800-53 | 5 | 5 | 0 | 5 | 2 | 0 | 5 | 5 | 1 | 5 | 1 | 0 | 0 | 0 | 2 | 0 | 31 |
| SRC-NF-0011 | NIST SP 800-63B | 5 | 5 | 0 | 5 | 2 | 0 | 5 | 5 | 0 | 5 | 3 | 0 | 0 | 0 | 0 | 0 | 30 |
| SRC-NF-0012 | ENISA | 5 | 5 | 3 | 5 | 0 | 3 | 5 | 5 | 0 | 5 | 0 | 3 | 3 | 4 | 0 | 1 | 39 |
| SRC-NF-0013 | Microsoft 10-K | 5 | 5 | 2 | 5 | 4 | 2 | 5 | 5 | 2 | 5 | 0 | 3 | 3 | 3 | 0 | 1 | 44 |
| SRC-NF-0014 | Apple 10-K | 4 | 4 | 1 | 4 | 4 | 3 | 4 | 4 | 2 | 4 | 0 | 4 | 3 | 3 | 0 | 1 | 41 |
| SRC-NF-0015 | OWID CO₂/GHG | 5 | 5 | 1 | 5 | 3 | 2 | 5 | 5 | 3 | 5 | 0 | 4 | 3 | 2 | 0 | 0 | 43 |
| SRC-NF-0016 | OWID CO₂ | 4 | 4 | 0 | 4 | 3 | 2 | 4 | 4 | 2 | 4 | 0 | 2 | 2 | 1 | 0 | 0 | 32 |
| SRC-NF-0017 | PMC/NIH (COVID) | 5 | 5 | 3 | 5 | 4 | 1 | 5 | 5 | 0 | 5 | 0 | 0 | 1 | 4 | 0 | 0 | 42 |
| SRC-NF-0018 | NBER (Min Wage) | 4 | 4 | 2 | 4 | 0 | 0 | 4 | 4 | 1 | 4 | 1 | 1 | 0 | 2 | 0 | 0 | 27 |
| SRC-NF-0019 | Amazon 10-K | 4 | 4 | 1 | 4 | 4 | 2 | 4 | 4 | 1 | 4 | 0 | 3 | 2 | 1 | 0 | 0 | 34 |
| SRC-NF-0020 | Microsoft Proxy | 4 | 4 | 1 | 4 | 4 | 1 | 4 | 4 | 0 | 4 | 0 | 1 | 1 | 1 | 0 | 0 | 29 |
| SRC-NF-0021 | FHWA | 4 | 4 | 1 | 4 | 4 | 2 | 4 | 4 | 0 | 4 | 0 | 2 | 3 | 1 | 0 | 0 | 33 |
| SRC-NF-0022 | NHTSA | 5 | 5 | 1 | 5 | 4 | 2 | 5 | 5 | 0 | 5 | 0 | 3 | 3 | 1 | 0 | 0 | 39 |

---

## 4. Best Sources by Validation Category

### Best for NUMERICAL drift tests
**SRC-NF-0007 (BLS Employment)** — 5 claims, all 5 with numbers. Headline "+256,000 jobs", "4.1% unemployment", "6.9 million unemployed". Tests "rose by 256,000" must not become "fell by 256,000" or "rose by 26,000".

Runner-up: **SRC-NF-0001 (IPCC AR6)** — 6 numerical claims including 1.1°C, 1.07°C, 79%/21% split.

### Best for TEMPORAL tests
**SRC-NF-0001 (IPCC AR6)** — 8 temporal claims: "1850–1900", "2011–2020", "by 2030", "by 2040", "by 2100". Tests forecast-vs-historical drift.

Runner-up: **SRC-NF-0005 (Census Projections)** — 5 temporal claims including "by 2026", "by 2056", "by 2030", "by 2045".

### Best for ATTRIBUTION preservation
**SRC-NF-0001 (IPCC AR6)** — 6 attributed claims. Tests "IPCC estimated" must not become "is".

Runner-up: **SRC-NF-0012 (ENISA)** — 5 attributed claims.

### Best for CAUSAL vs CORRELATIONAL tests
**SRC-NF-0001 (IPCC AR6)** — 5 causal claims including "unequivocally caused", "driven primarily by".

Runner-up: **SRC-NF-0003 (USGCRP NCA5)** — 4 causal claims.

### Best for NEGATIVE findings
**SRC-NF-0011 (NIST SP 800-63B)** — 3 negative claims (SHALL NOT ×2, SHALL NOT require). Tests prohibition reversal.

Runner-up: **SRC-NF-0003 (USGCRP NCA5)** — 1 negative ("insufficient to keep pace").

### Best for COMPARATIVE claims
**SRC-NF-0014 (Apple 10-K)** — 4 comparative claims (geographic segment breakdown).

Runner-up: **SRC-NF-0015 (OWID CO₂/GHG)** — 4 comparative claims (more than twice, ordinal rankings).

### Best for UNCERTAINTY / ESTIMATE
**SRC-NF-0001 (IPCC AR6)** — 7 uncertainty claims (likely range, best estimate, projected, closing window).

Runner-up: **SRC-NF-0005 (Census Projections)** — 5 uncertainty claims (projected, sensitivity to assumptions).

### Best for FORECAST
**SRC-NF-0001 (IPCC AR6)** — 5 forecast claims (C.3, C.5, B.5, A.2.4).

Runner-up: **SRC-NF-0005 (Census Projections)** — 4 forecast claims.

### Best for SCOPE qualifiers
**SRC-NF-0010 (NIST SP 800-53)** — 2 scope claims (the "other than national security systems" exclusion).

(Thin coverage — see GAP-003.)

---

## 5. Best First-Source Candidates by Test Family

| Test family | Best single source | Why |
|---|---|---|
| Estimate → Fact drift | SRC-NF-0001 (IPCC AR6) | 7 uncertainty claims; "likely range", "best estimate", "projected". |
| Attributed → Unattributed drift | SRC-NF-0001 (IPCC AR6) | 6 attributed claims to "IPCC". |
| Forecast → Historical drift | SRC-NF-0005 (Census Projections) | 4 forecast claims with explicit "projected to reach". |
| Causal → Correlational drift | SRC-NF-0001 (IPCC AR6) | "unequivocally caused" + "driven primarily by". |
| Negative → Positive reversal | SRC-NF-0011 (NIST SP 800-63B) | SHALL NOT ×2 + SHALL NOT require. |
| Magnitude drift (numbers) | SRC-NF-0007 (BLS Employment) | 5 numerical claims, headline magnitude-sensitive. |
| Direction drift (comparative) | SRC-NF-0014 (Apple 10-K) | "decreased 2.8%" / "decreased 1%" / "decreased 2%". |
| Scope qualifier drop | SRC-NF-0010 (NIST SP 800-53) | "other than national security systems" exclusion. |
| Temporal sequence reversal | SRC-NF-0022 (NHTSA Crashes) | "second consecutive year-over-year decrease, following a peak of 43,230 in 2021". |
| Paraphrase fidelity | SRC-NF-0004 (PMC/NIH Cochrane) | Academic prose with subtle hedging ("tend to be", "significantly lower"). |

---

## 6. Validation-Opportunity Gaps

The matrix reveals three thin categories that the future Nonfiction validator will struggle to test adequately:

1. **SCOPE qualifiers (3 total):** Only 3 of 105 claims carry explicit scope qualifiers. The validator's scope-preservation test will be under-trained. → GAP-003.
2. **NEGATIVE findings (7 total):** Only 7 of 105 claims are negative. The reversal test ("no evidence" → "evidence") is thin. → GAP-002.
3. **FORECAST (13 total):** Adequate but concentrated in 2 sources (IPCC, Census). Forecast-vs-historical drift is well-covered for climate/demographics but thin for other domains. → partially GAP-006.

---

## 7. Recommended Validator Test-Set Composition

For the first Nonfiction Golden Corpus (Phase 3B), the recommended test-set composition is:

| Test family | # test cases | Primary sources |
|---|---:|---|
| Estimate → Fact | 10 | IPCC AR6, Census Projections, NBER Min Wage |
| Attributed → Unattributed | 10 | IPCC AR6, ENISA, PMC/NIH Cochrane |
| Forecast → Historical | 8 | Census Projections, IPCC AR6, Microsoft 10-K risk factors |
| Causal → Correlational | 8 | IPCC AR6, USGCRP NCA5, NBER Min Wage |
| Negative → Positive reversal | 6 | NIST SP 800-63B, USGCRP NCA5, NBER Min Wage |
| Magnitude drift | 12 | BLS Employment, BLS CPI, Census QFR, Microsoft/Apple/Amazon 10-Ks |
| Direction drift | 8 | Apple 10-K, BLS Employment, FHWA, NHTSA |
| Scope qualifier drop | 4 | NIST SP 800-53, IPCC AR6 |
| Temporal sequence reversal | 6 | NHTSA, IPCC AR6, Census Projections |
| Paraphrase fidelity | 14 | all 22 GOLD sources, 1 claim each |
| **Total** | **86** | |

This 86-case Golden Corpus can be drawn entirely from the 105-claim inventory. Phase 3B will instantiate it.

---

## 8. Confidence Assessment

The validation-opportunity counts are **heuristic estimates** derived from the claim inventory by pattern-matching (hedge words, comparative words, etc.). They are NOT a substitute for the actual SourceFactLedger, which will assign verdicts (SUPPORTED / UNSUPPORTED / CONTRADICTED) per claim-source pair.

Confidence in the counts:
- **supported / paraphrase / entities / contradiction:** high (deterministic from claim count).
- **numbers / dates / attribution / causal / forecast:** high (deterministic from structured fields).
- **unsupported / comparative / temporal / uncertainty / negative / scope:** medium (pattern-matched from claim text; may under- or over-count by ~10–20%).

Phase 3A should re-derive these counts from the verified SourceFactLedger.

---

*End of validation-opportunity report.*
