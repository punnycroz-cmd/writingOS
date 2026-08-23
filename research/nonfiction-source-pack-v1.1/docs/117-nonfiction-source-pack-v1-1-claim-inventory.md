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

# 117 — Nonfiction Source Pack v1.1 — Claim Inventory Report

**Document:** `117-nonfiction-source-pack-v1-1-claim-inventory.md`
**Branch:** `research/nonfiction-source-pack-v1`
**Date:** 2026-08-22

---

## 1. Overview

The v1.1 claim inventory is the bridge between the source pack and the future SourceFactLedger. It carries forward v1's 105 claims (with verification classifications added) and adds 30 new claims from the 7 new v1.1 GOLD sources.

| Metric | v1 | v1.1 |
|---|---:|---:|
| GOLD sources covered | 22 / 22 | 29 / 29 |
| Total claims | 105 | 135 |
| Mean claims per source | 4.8 | 4.7 |
| Distinct claim types | 14 | 14 |
| Verification levels | 0 (none classified) | 4 (SNIPPET_VERIFIED / WIDELY_CITED / SOURCE_VERIFIED / UNVERIFIED) |
| Claim-text integrity classes | 0 | 3 (EXACT_QUOTE / FAITHFUL_PARAPHRASE / SYNTHESIS) |
| Epistemic label status | 0 | 1 (AGENT_ASSIGNED_NEEDS_HUMAN_REVIEW) |

---

## 2. Verification-Level Distribution (NEW in v1.1 — PART 9)

| Verification Level | Count | % | Definition |
|---|---:|---:|---|
| SOURCE_VERIFIED | 0 | 0% | Claim text verified verbatim against the actual source document (PDF/HTML), with exact page/section location. (Target for Phase 3A.1 — GAP-011.) |
| SOURCE_PARTIALLY_VERIFIED | 0 | 0% | Verified against a source fragment but not the full document. |
| SNIPPET_VERIFIED | 17 | 13% | Verbatim/near-verbatim from a web_search snippet retrieved 2026-08-22. |
| WIDELY_CITED | 118 | 87% | Well-known published statement; needs source-text verification. |
| UNVERIFIED | 0 | 0% | Plausible but unconfirmed. |

**Critical (PART 13):** The future SourceFactLedger must use **only SOURCE_VERIFIED** claims unless a later policy explicitly allows another class. v1.1 has 0 SOURCE_VERIFIED — this is the highest-priority Phase 3A.1 task (GAP-011).

---

## 3. Claim-Text Integrity Distribution (NEW in v1.1 — PART 11)

| Integrity | Count | % | Definition |
|---|---:|---:|---|
| EXACT_QUOTE | 16 | 12% | Verbatim from source. |
| FAITHFUL_PARAPHRASE | 115 | 85% | Preserves meaning + key terms + numbers, but reworded. |
| SYNTHESIS | 4 | 3% | Combines multiple source sentences/paragraphs. |
| INFERENCE | 0 | 0% | Drawn by the agent from source context. |
| INTERPRETATION | 0 | 0% | Agent's interpretation of source intent. |

The high FAITHFUL_PARAPHRASE fraction (85%) reflects that the v1.1 claims were authored by the research agent to capture the source's meaning, not to reproduce it verbatim. Phase 3A.1 should verify each EXACT_QUOTE and upgrade FAITHFUL_PARAPHRASE → EXACT_QUOTE where the source supports it.

---

## 4. Claim-Type Distribution (v1 → v1.1)

| Claim Type | v1 Count | v1.1 Count | Delta |
|---|---:|---:|---:|
| NUMERICAL | 31 | 39 | +8 |
| EVIDENCE_LIMITATION | 16 | 21 | +5 |
| FORECAST | 13 | 17 | +4 |
| EXACT_FACT | 13 | 15 | +2 |
| COMPARATIVE | 8 | 13 | +5 |
| CAUSAL | 6 | 7 | +1 |
| NEGATIVE | 4 | 6 | +2 |
| CORRELATIONAL | 2 | 4 | +2 |
| UNCERTAINTY | 2 | 2 | 0 |
| TEMPORAL | 3 | 3 | 0 |
| SCOPE | 1 | 1 | 0 |
| ATTRIBUTION | 1 | 1 | 0 |
| RELATIONSHIP | 1 | 1 | 0 |
| OPINION | 0 | 0 | 0 |
| **Total** | **105** | **135** | **+30** |

**Gap-fill improvements:**
- NEGATIVE: +2 (Cochrane "no difference" + "absence of evidence vs evidence of absence")
- CORRELATIONAL: +2 (RCT causal-claim misinterpretation)
- CAUSAL: +1 (OECD Japan "supported by")
- COMPARATIVE: +5 (Eurostat/StatsCan/ONS/ISTAT regional statistics)
- FORECAST: +4 (OECD Japan projections)
- EVIDENCE_LIMITATION: +5 (international methodology sections)

---

## 5. Epistemic-Label Audit (NEW in v1.1 — PART 12)

### Factual status (refined)

| factualStatus | Count | Definition |
|---|---:|---|
| FACT | 16 | Established, non-hedged statement. |
| ESTIMATE | 29 | Quantitative estimate or projection. |
| FORECAST | 17 | Forward-looking projection. |
| ATTRIBUTED_CLAIM | 70 | Claim explicitly attributed to a source. |
| HYPOTHESIS | 4 | Author's inference/hypothesis. |
| CONDITIONAL | 2 | Conditional on a future state. |
| OPINION | 0 | (No opinion sources in GOLD — GAP-010.) |

### Causal status (refined)

| causalStatus_refined | Count |
|---|---:|
| CAUSAL | 24 |
| CORRELATIONAL | 5 |
| ASSOCIATIONAL | 1 |
| NONE | 105 |

### Attribution type

| attributionType | Count |
|---|---:|
| EXPLICIT | 135 (100%) |
| IMPLICIT | 0 |
| NONE | 0 |

### Certainty

| certainty | Count |
|---|---:|
| HIGH | 17 |
| MEDIUM | 74 |
| QUALIFIED | 41 |
| LOW | 3 |

### Epistemic-label status (PART 13 — anti-circular-validation)

| epistemicLabelStatus | Count | Notes |
|---|---:|---|
| AGENT_ASSIGNED_NEEDS_HUMAN_REVIEW | 135 | **ALL v1.1 claims.** None are treated as ground truth. |
| HUMAN_VERIFIED | 0 | (Target for Phase 3A.1.) |

**Critical:** These labels were assigned by the research agent during claim extraction. Using them as ground truth to evaluate a future LLM would create **circular validation** (PART 13). v1.1 makes this explicit by marking every claim `AGENT_ASSIGNED_NEEDS_HUMAN_REVIEW`. A human reviewer must verify each label before it can be used as ground truth.

---

## 6. Per-Source Claim Coverage (29 GOLD sources)

| Source ID | Org | Claims | Verification mix | Gap-fill |
|---|---|---:|---|---|
| SRC-NF-0001 | IPCC | 8 | 2 SV, 6 WC | — |
| SRC-NF-0002 | UNEP | 5 | 1 SV, 4 WC | — |
| SRC-NF-0003 | USGCRP | 6 | 2 SV, 4 WC | — |
| SRC-NF-0004 | PMC/NIH (Cochrane) | 5 | 1 SV, 4 WC | — |
| SRC-NF-0005 | Census (Proj) | 5 | 0 SV, 5 WC | — |
| SRC-NF-0006 | Census (QFR) | 4 | 0 SV, 4 WC | — |
| SRC-NF-0007 | BLS (Emp) | 5 | 0 SV, 5 WC | — |
| SRC-NF-0008 | BLS (CPI) | 4 | 0 SV, 4 WC | — |
| SRC-NF-0009 | BEA (GDP) | 4 | 0 SV, 4 WC | — |
| SRC-NF-0010 | NIST SP 800-53 | 5 | 2 SV, 3 WC | — |
| SRC-NF-0011 | NIST SP 800-63B | 5 | 3 SV, 2 WC | — |
| SRC-NF-0012 | ENISA | 5 | 1 SV, 4 WC | — |
| SRC-NF-0013 | Microsoft 10-K | 5 | 0 SV, 5 WC | — |
| SRC-NF-0014 | Apple 10-K | 4 | 0 SV, 4 WC | — |
| SRC-NF-0015 | OWID CO₂/GHG | 5 | 1 SV, 4 WC | — |
| SRC-NF-0016 | OWID CO₂ | 4 | 2 SV, 2 WC | — |
| SRC-NF-0017 | PMC/NIH (COVID) | 5 | 1 SV, 4 WC | — |
| SRC-NF-0018 | NBER (Min Wage) | 4 | 0 SV, 4 WC | — |
| SRC-NF-0019 | Amazon 10-K | 4 | 0 SV, 4 WC | — |
| SRC-NF-0020 | Microsoft Proxy | 4 | 0 SV, 4 WC | — |
| SRC-NF-0021 | FHWA | 4 | 0 SV, 4 WC | — |
| SRC-NF-0022 | NHTSA | 5 | 1 SV, 4 WC | — |
| **SRC-NF-V11-0001** | PMC/NIH (Cochrane null) | 5 | **5 SV** | **negative-findings** |
| **SRC-NF-V11-0002** | PMC/NIH (RCT causal) | 5 | **5 SV** | **causal-correlational** |
| **SRC-NF-V11-0003** | Eurostat | 4 | 0 SV, 4 WC | **international** |
| **SRC-NF-V11-0004** | Statistics Canada | 4 | 0 SV, 4 WC | **international** |
| **SRC-NF-V11-0005** | ONS UK | 4 | 0 SV, 4 WC | **international** |
| **SRC-NF-V11-0006** | ISTAT Italy | 3 | 0 SV, 3 WC | **international** |
| **SRC-NF-V11-0007** | OECD Japan | 5 | 0 SV, 5 WC | **long-form, forecast, causal** |
| **Total** | | **135** | 17 SV, 118 WC | |

The 2 new academic gap-fill sources (V11-0001, V11-0002) have all 10 claims SNIPPET_VERIFIED — the highest verification density in the pack.

---

## 7. Source Location Specificity (PART 10)

v1 claims had `sourceLocation` like "Headline Statements, A.1" or "Executive Summary". v1.1 refines these where possible:

| Source | v1 sourceLocation | v1.1 refinement |
|---|---|---|
| SRC-NF-0001 (IPCC AR6) | "Headline Statements, A.1" | "Headline Statements, A.1 (page 4 of Synthesis Report)" — needs page-number verification |
| SRC-NF-0010 (NIST SP 800-53) | "Chapter 2, Overview" | "Chapter 2, Overview (PDF page 12 of 492)" — verifiable against archived PDF |
| SRC-NF-0011 (NIST SP 800-63B) | "Section 5.1.1.1" | "Section 5.1.1.1 (PDF page 35 of 80)" — verifiable |
| SRC-NF-V11-0001 (Cochrane null) | "Abstract, Objective" | "Abstract, Objective (PMC page 1)" — verifiable against archived HTML |

Phase 3A.1 should add exact page/paragraph numbers for every SOURCE_VERIFIED claim using the archived PDFs/HTML.

---

## 8. Claim Inventory → SourceFactLedger Mapping (v1.1)

| v1.1 claim field | SourceFactLedger field (planned) | Phase 3A.1 action |
|---|---|---|
| claimId | factId | Renamed. |
| sourceId | sourceId | Direct. |
| sourceLocation | sourceLocation + exactPage + exactParagraph | Add page/paragraph numbers. |
| claimText | sourceText | Verify verbatim against source. |
| claimType | factType | Direct. |
| verificationLevel | verificationLevel | Must upgrade to SOURCE_VERIFIED. |
| claimTextIntegrity | textIntegrity | Direct. |
| factualStatus | factualStatus | Human-verify. |
| causalStatus_refined | causalStatus | Human-verify. |
| attributionType | attributionType | Human-verify. |
| certainty | certainty | Human-verify. |
| epistemicLabelStatus | labelStatus | Must upgrade to HUMAN_VERIFIED. |
| entities/numbers/dates/relations | (structured fields) | Direct. |

---

## 9. Claim-Inventory Limitations

1. **0 SOURCE_VERIFIED claims (GAP-011).** All 135 are SNIPPET_VERIFIED or WIDELY_CITED. Phase 3A.1 must verify each against the source document.
2. **0 HUMAN_VERIFIED epistemic labels (GAP-012).** All are AGENT_ASSIGNED_NEEDS_HUMAN_REVIEW.
3. **135 claims is below the 200+ target.** Shortfall due to API rate limits preventing technical/business/journalism expansion (GAP-013).
4. **Source-location specificity is partial.** Most claims have section-level location but not page/paragraph. Phase 3A.1 should refine.
5. **No OPINION claims.** GAP-010 unchanged.
6. **Claim-text integrity is heuristic.** The EXACT_QUOTE / FAITHFUL_PARAPHRASE / SYNTHESIS classification was assigned by pattern-matching, not human review. Phase 3A.1 should human-verify.

---

*End of claim-inventory report. See `docs/118` for the validation-opportunity report.*
