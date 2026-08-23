---

> ## CORRECTION NOTICE — Final Freeze (Phase 3A.0-final)
>
> **Pack status:** `DISCOVERY_CORPUS` (not ground truth)
> **Contains ground truth:** `false`
>
> The counts below are **computed directly from `source-index.json`** on 2026-08-22, not copied from earlier prose.
>
> | Metric | Computed value |
> |---|---:|
> | Total selected sources | 69 |
> | GOLD / SILVER / BRONZE | 29 / 25 / 15 |
> | URL_VERIFIED sources | 17 |
> | URL_EXISTS_BOT_BLOCKED sources | 5 |
> | UNVERIFIED sources | 47 |
> | SOURCE_VERIFIED sources | 0 |
> | Claims total | 135 |
> | SOURCE_VERIFIED claims | 0 |
> | SNIPPET_VERIFIED claims | 17 |
> | WIDELY_CITED claims | 118 |
>
> **Critical:** GOLD ≠ VERIFIED. 7 of 29 GOLD sources are UNVERIFIED. See `PACK-MANIFEST.json` for the authoritative computed counts.
>
> A source can be `licenseStatus: OPEN_ACCESS` (discovered license based on publisher reputation) without the license being independently verified. Where license evidence is uncertain, the source carries `licenseStatus: UNKNOWN`.

---

# 118 — Nonfiction Source Pack v1.1 — Validation-Opportunity Report

**Document:** `118-nonfiction-source-pack-v1-1-validation-opportunity-report.md`
**Branch:** `research/nonfiction-source-pack-v1`
**Date:** 2026-08-22

---

## 1. Overview

This report quantifies, per v1.1 GOLD source, the number of validation opportunities across 15 categories. The full matrix is in `sources/nonfiction-v1.1/validation-opportunity-matrix.csv`.

**Total validation opportunities across the 29 v1.1 GOLD sources: 1120** (up from v1's 818, +37%).

---

## 2. Category Totals (all v1.1 GOLD sources)

| Category | v1 Total | v1.1 Total | Delta | Notes |
|---|---:|---:|---:|---|
| supported | 105 | 135 | +30 | Every claim is a "supported" anchor. |
| contradiction | 105 | 135 | +30 | Every supported claim is a contradiction candidate. |
| paraphrase | 105 | 135 | +30 | Every claim is a paraphrase candidate. |
| entities | 105 | 135 | +30 | Every claim has ≥1 named entity. |
| attribution | 70 | 135 | +65 | Every v1.1 claim has explicit attribution. |
| numbers | 59 | 79 | +20 | Claims with explicit numbers. |
| temporal | 60 | 76 | +16 | Claims with dates or temporal language. |
| uncertainty | 46 | 58 | +12 | Claims with hedge/estimate language. |
| comparative | 41 | 63 | +22 | Claims with comparative language. |
| forecast | 13 | 17 | +4 | Forecasts and projections. |
| causal | 22 | 29 | +7 | Causal or correlational claims. |
| unsupported | 24 | 36 | +12 | Claims with hedge words. |
| negative | 7 | 13 | +6 | Negative findings / prohibitions. |
| dates | 53 | 68 | +15 | Claims with explicit date references. |
| scope | 3 | 6 | +3 | Claims with explicit scope qualifiers. |
| **Total** | **818** | **1120** | **+302** | |

---

## 3. Best Sources by Validation Category (v1.1)

### Best for NUMERICAL drift tests
**SRC-NF-0007 (BLS Employment)** — 5 claims, all 5 with numbers. Retained from v1.

Runner-up: **SRC-NF-V11-0004 (Statistics Canada Labour Force)** — 4 claims, all 4 with numbers (NEW).

### Best for TEMPORAL tests
**SRC-NF-0001 (IPCC AR6)** — 8 temporal claims. Retained.

Runner-up: **SRC-NF-V11-0007 (OECD Japan)** — 5 temporal claims including 2024/2025 forecasts (NEW).

### Best for ATTRIBUTION preservation
**SRC-NF-0001 (IPCC AR6)** — 6 attributed claims. Retained.

Runner-up: **SRC-NF-V11-0007 (OECD Japan)** — 5 attributed claims with explicit causal framing (NEW).

### Best for CAUSAL vs CORRELATIONAL tests (GAP-001 improved)
**SRC-NF-V11-0002 (PMC/NIH RCT causal)** — 4 causal/correlational claims (NEW). Gold for testing "causal language despite assumptions" — the core CAUSAL vs CORRELATIONAL distinction.

Runner-up: **SRC-NF-0001 (IPCC AR6)** — 5 causal claims.

### Best for NEGATIVE findings (GAP-002 improved)
**SRC-NF-V11-0001 (PMC/NIH Cochrane null)** — 3 negative claims (NEW). Gold for "no difference" / "absence of evidence vs evidence of absence" distinction.

Runner-up: **SRC-NF-0011 (NIST SP 800-63B)** — 3 negative claims (SHALL NOT).

### Best for COMPARATIVE claims
**SRC-NF-V11-0003 (Eurostat)** — 4 comparative claims (NEW). Gold for regional disparity comparisons.

Runner-up: **SRC-NF-0014 (Apple 10-K)** — 4 comparative claims (retained).

### Best for UNCERTAINTY / ESTIMATE
**SRC-NF-0001 (IPCC AR6)** — 7 uncertainty claims. Retained.

Runner-up: **SRC-NF-V11-0005 (ONS UK)** — 4 uncertainty claims with "estimated at" + "subject to greater uncertainty" (NEW).

### Best for FORECAST
**SRC-NF-V11-0007 (OECD Japan)** — 4 forecast claims (NEW). Gold for "projected to grow" / "projected to moderate".

Runner-up: **SRC-NF-0001 (IPCC AR6)** — 5 forecast claims.

### Best for SCOPE qualifiers (GAP-003 improved)
**SRC-NF-0010 (NIST SP 800-53)** — 2 scope claims (the "other than national security systems" exclusion).

**SRC-NF-V11-0001 (Cochrane null)** — 2 scope claims ("may not generalize") (NEW).

---

## 4. Recommended Validator Test-Set Composition (v1.1)

| Test family | v1 # cases | v1.1 # cases | Primary sources |
|---|---:|---:|---|
| Estimate → Fact | 10 | 14 | IPCC AR6, Census Projections, NBER, OECD Japan (NEW), ONS UK (NEW) |
| Attributed → Unattributed | 10 | 14 | IPCC AR6, ENISA, PMC/NIH, OECD Japan (NEW) |
| Forecast → Historical | 8 | 12 | Census Projections, IPCC AR6, Microsoft 10-K, OECD Japan (NEW) |
| Causal → Correlational | 8 | 12 | IPCC AR6, USGCRP NCA5, NBER, PMC/NIH RCT (NEW) |
| Negative → Positive reversal | 6 | 9 | NIST SP 800-63B, USGCRP, NBER, PMC/NIH Cochrane null (NEW) |
| Magnitude drift | 12 | 16 | BLS Employment, BLS CPI, Census QFR, Microsoft/Apple/Amazon 10-Ks, Stats Canada (NEW) |
| Direction drift | 8 | 11 | Apple 10-K, BLS Employment, FHWA, NHTSA, Eurostat (NEW) |
| Scope qualifier drop | 4 | 6 | NIST SP 800-53, IPCC AR6, PMC/NIH Cochrane (NEW) |
| Temporal sequence reversal | 6 | 8 | NHTSA, IPCC AR6, Census Projections, OECD Japan (NEW) |
| Paraphrase fidelity | 14 | 18 | all 29 GOLD sources, sampled |
| **Total** | **86** | **120** | |

The v1.1 Golden Corpus can be drawn entirely from the 135-claim inventory. Phase 3B will instantiate it.

---

## 5. CANDIDATE_OPPORTUNITY vs VERIFIED_GOLDEN_CASE (PART 33)

The 1120 opportunities are **CANDIDATE_OPPORTUNITY** counts — heuristic estimates derived from the claim inventory by pattern-matching. They are NOT `VERIFIED_GOLDEN_CASE` counts.

| Classification | Count | Meaning |
|---|---:|---|
| CANDIDATE_OPPORTUNITY | 1120 | Heuristic estimate from claim-inventory pattern-matching. |
| VERIFIED_GOLDEN_CASE | 0 | A test case that has been human-verified against the source document. (Target for Phase 3B.) |

Phase 3B must:
1. Select ~120 candidate opportunities from the matrix;
2. For each, generate a Golden Case (correct claim + drifted claim + expected verdict);
3. Human-verify each Golden Case against the source document;
4. Only then use them as ground truth for the Nonfiction semantic benchmark.

---

## 6. Confidence Assessment

The validation-opportunity counts are **heuristic estimates**. Confidence varies by category:

| Category | Confidence | Reason |
|---|---|---|
| supported / paraphrase / entities / contradiction / attribution | HIGH | Deterministic from claim count. |
| numbers / dates / causal / forecast | HIGH | Deterministic from structured fields. |
| unsupported / comparative / temporal / uncertainty / negative / scope | MEDIUM | Pattern-matched from claim text; may under/over-count by ~15%. |

Phase 3A.1 should re-derive these counts from the verified SourceFactLedger.

---

*End of validation-opportunity report. See `docs/119` for the final summary.*
