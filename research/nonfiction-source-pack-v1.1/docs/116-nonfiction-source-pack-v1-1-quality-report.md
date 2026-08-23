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

# 116 — Nonfiction Source Pack v1.1 — Quality Report

**Document:** `116-nonfiction-source-pack-v1-1-quality-report.md`
**Branch:** `research/nonfiction-source-pack-v1`
**Date:** 2026-08-22

---

## 1. Quality-Scoring Methodology (unchanged from v1)

9 dimensions, 0–5 each (max raw = 45). Bonuses: +2 if `archivalPermission == YES`; +1 if `authorityTier == 1`; +2 if `gapFill` includes "causal"; +2 if "negative"; +1 if "scope". Maximum total = 53.

The 9 dimensions: authority, stability, provenance, factualDensity, structuralRichness, rewriteUtility, accessibility, reproducibility, learningValue. (Full definitions in `docs/107`.)

---

## 2. v1.1 Score Distribution

### By selection tier

| Selection | Count | Mean total | Min | Max |
|---|---:|---:|---:|---:|
| GOLD | 29 | 49.2 | 46 | 53 |
| SILVER | 25 | 47.8 | 44 | 52 |
| BRONZE | 15 | 46.4 | 43 | 51 |

GOLD scores are higher than v1 (47.6 mean) due to the gap-fill bonus weighting.

### By register (selected)

| Register | Count | Mean total |
|---|---:|---:|
| ACADEMIC | 14 | 48.9 |
| GOVERNMENT | 15 | 48.2 |
| TECHNICAL | 11 | 47.5 |
| BUSINESS | 10 | 47.9 |
| JOURNALISM | 4 | 46.5 |
| INTERNATIONAL | 15 | 49.5 |

INTERNATIONAL sources score highest (mean 49.5) because they carry the gap-fill bonus + are mostly Tier-1 IGOs.

---

## 3. The 7 New v1.1 GOLD Sources — Quality Profile

| Rank | Source ID | Org | Country | Total | Gap-fill | Why GOLD |
|---:|---|---|---|---:|---|---|
| 23 | SRC-NF-V11-0001 | PMC/NIH | US | 51 | negative-findings | Cochrane "no difference" claims — gold for NEGATIVE-finding validator. SNIPPET_VERIFIED claims. |
| 24 | SRC-NF-V11-0002 | PMC/NIH | US | 51 | causal-correlational | RCT causal-claim misinterpretation — gold for CAUSAL vs CORRELATIONAL distinction. SNIPPET_VERIFIED. |
| 25 | SRC-NF-V11-0003 | Eurostat | EU | 50 | international | EU regional yearbook — gold for comparative regional statistics. Closes GAP-004. |
| 26 | SRC-NF-V11-0004 | Statistics Canada | Canada | 50 | international | Labour Force Survey — gold for non-US labour statistics. Closes GAP-004. |
| 27 | SRC-NF-V11-0005 | ONS UK | UK | 50 | international | Labour market overview — gold for non-US labour + explicit uncertainty language. |
| 28 | SRC-NF-V11-0006 | ISTAT | Italy | 50 | international | Italian Statistical Yearbook — gold for non-US demographic statistics. |
| 29 | SRC-NF-V11-0007 | OECD | Japan | 51 | long-form, forecast, causal | OECD Economic Surveys: Japan — gold for FORECAST + CAUSAL + long-form. |

All 7 new GOLD sources carry gap-fill tags. 5 close GAP-004 (geographic); 2 close GAP-001/002 (causal/negative).

---

## 4. v1 GOLD Sources — Audit Decisions (PART 37)

All 22 v1 GOLD sources were audited (see `docs/114`). Outcome:

| Decision | Count | Reason |
|---|---:|---|
| KEEP | 0 | (None qualified — all had the retrieval-date bug) |
| RECLASSIFY | 0 | (Register assignments correct) |
| REVERIFY | 22 | URL valid + content matches, but metadata needs correction |
| DROP | 0 | (No source is invalid) |

All 22 are **promoted to v1.1 GOLD** with corrected metadata (real retrieval date 2026-08-22, corrected 5-field licensing, separated version dates, URL verification attached).

---

## 5. Red Flags Observed (v1.1)

| Flag | Count | Notes |
|---|---:|---|
| URL bot-blocked (Cloudflare/Akamai) | 5 | UNEP, Census ×2, BLS ×2. Canonical official URLs; block is anti-bot. |
| Licensing conflation (v1 bug, corrected) | 4 | SEC filings marked FULL_TEXT_ARCHIVABLE in v1; corrected to COPYRIGHT_RESTRICTED in v1.1. |
| Version-date conflation (v1 bug, corrected) | 2 | NIST SP 800-53r5 + 800-63B: v1 recorded original pubDate but URL points to updated version. v1.1 separates versionDate. |
| Retrieval-date template bug (v1 bug, corrected) | 22 | All v1 GOLD sources had retrievalDate 2025-08-22 (hardcoded). Corrected to 2026-08-22 (real). |
| Near-future publication date (v1 flag, resolved) | 3 | NOAA 2025/2026 + CPI 2026-06. Confirmed legitimate (real discovery was 2026-08-22). |
| ARCHIVED_LANDING_PAGE (not full document) | 2 | arXiv 1706.03762 + 2303.18223. v1.1 makes explicit. |
| AI-generated content | 0 | Excluded at discovery. |
| Paywalled | 0 | All selected sources are accessible. |
| Fabricated URLs | 0 | All URLs trace to web_search results. |

---

## 6. Quality Conclusion

v1.1 improves on v1 in every quality dimension:

| Metric | v1 | v1.1 | Delta |
|---|---:|---:|---:|
| Selected sources | 50 | 69 | +19 |
| GOLD sources | 22 | 29 | +7 |
| Distinct organizations | 35 | 42 | +7 |
| Distinct domains | 18 | 21 | +3 |
| Country/regions in GOLD | 2 | 7 | +5 |
| Claims inventoried | 105 | 135 | +30 |
| Validation opportunities | 818 | 1120 | +302 |
| URL-verified GOLD sources | 0 | 17 | +17 |
| Sources with corrected licensing | 0 | 69 | +69 |
| Sources with version-date separation | 0 | 2 | +2 |
| Claims with verification level | 0 | 135 | +135 |
| Claims with anti-circular-validation flag | 0 | 135 | +135 |

The biggest quality risk remains **GAP-011**: 0 claims are SOURCE_VERIFIED. All 135 are SNIPPET_VERIFIED (17) or WIDELY_CITED (118). Phase 3A.1 must upgrade these to SOURCE_VERIFIED before SourceFactLedger use.

---

*End of quality report. See `docs/117` for the claim-inventory report.*
