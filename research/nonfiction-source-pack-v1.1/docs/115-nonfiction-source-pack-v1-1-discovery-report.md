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

# 115 — Nonfiction Source Pack v1.1 — Discovery Report

**Document:** `115-nonfiction-source-pack-v1-1-discovery-report.md`
**Branch:** `research/nonfiction-source-pack-v1`
**Date:** 2026-08-22 (real; v1 incorrectly recorded 2025-08-22)

---

## 1. Discovery Methodology (v1.1)

v1.1 repeated v1's discovery strategy (5 parallel source categories + web-search + candidate pools + deterministic curation + scoring + Gold/Silver/Bronze) and **added a stricter verification/provenance layer** (PART 14 of the brief).

### Two-wave discovery

**Wave 1 — v1 (preserved, 2026-08-22):** 5 parallel subagents (academic, technical, business, government, journalism) produced 200 candidates. (See v1's `106-nonfiction-source-discovery-report.md`.)

**Wave 2 — v1.1 expanded (2026-08-22):** 6 parallel subagents targeted the documented gaps:
- **2-A (International + gap-fill):** succeeded with 55 candidates across 11 countries.
- **2-B (Academic gap-fill: causal/negative/scope):** succeeded with 45 candidates.
- **2-C (Technical incident reports):** FAILED — subagent hit persistent `z-ai web_search` HTTP 429 rate limits; produced 0 candidates. (See §6 below.)
- **2-D (Business non-SEC):** FAILED — subagent exceeded max turns (200) due to rate-limit retries.
- **2-E (Government non-US):** not dispatched separately — covered by 2-A (international).
- **2-F (Journalism expansion):** not dispatched separately — v1's 25 journalism candidates retained; API rate limit prevented expansion.

**Total v1.1 new candidates: 100** (45 academic gap-fill + 55 international). Combined with v1's 200 → **300 candidates after dedup** (target was 400; shortfall due to API rate limits — see GAP-013).

---

## 2. Discovery Funnel

| Stage | v1 | v1.1 |
|---|---:|---:|
| Raw search results returned | ~1,400+ | ~1,000+ (Wave 2 only) |
| Candidate sources written | 200 | +100 = **300 total** |
| Selected (GOLD+SILVER+BRONZE) | 50 | 69 |
| GOLD | 22 | 29 |

### v1.1 candidate pool by register

| Register | v1 candidates | v1.1 new candidates | Total v1.1 candidates | Selected | GOLD |
|---|---:|---:|---:|---:|---:|
| ACADEMIC | 45 | +45 (gap-fill) | 90 | 14 | 8 |
| TECHNICAL | 45 | 0 (API limit) | 45 | 11 | 3 |
| BUSINESS | 40 | 0 (API limit) | 40 | 10 | 4 |
| GOVERNMENT | 45 | 0 (covered by international) | 45 | 15 | 7 |
| JOURNALISM | 25 | 0 (API limit) | 25 | 4 | 2 |
| INTERNATIONAL | 0 | +55 (NEW register) | 55 | 15 | 5 |
| **Total** | **200** | **+100** | **300** | **69** | **29** |

---

## 3. Wave 2 Subagent Outcomes

| Task ID | Subagent | Target | Outcome | Candidates |
|---|---|---|---:|---:|
| 2-A | international-gap-discovery | 40-55 INTERNATIONAL + gap-fill | SUCCESS | 55 |
| 2-B | academic-gap-discovery | 35-45 ACADEMIC (causal/negative/scope) | SUCCESS | 45 |
| 2-C | technical-incident-discovery | 30-40 TECHNICAL (incident reports) | **FAILED (API 429)** | 0 |
| 2-D | business-nonsec-discovery | 25-35 BUSINESS (non-SEC) | **FAILED (max turns)** | 0 |
| (2-E/2-F) | (not dispatched — covered by 2-A / v1) | — | — | 0 |

**Successes:** International (11 countries, 37 organizations) + Academic gap-fill (causal/negative/scope/uncertainty/long-form).

**Failures:** Technical, Business-non-SEC, and Journalism expansion all hit the shared `z-ai web_search` API rate limit (HTTP 429 "Too many requests"). The API key appears to have a shared hourly quota that was exhausted by the parallel subagent waves.

---

## 4. New Ecosystems Represented in v1.1

| Ecosystem | v1 | v1.1 new | Made GOLD |
|---|:-:|:-:|:-:|
| Eurostat | — | ✓ | ✓ (SRC-NF-V11-0003) |
| Statistics Canada | — | ✓ | ✓ (SRC-NF-V11-0004) |
| ONS UK | — | ✓ | ✓ (SRC-NF-V11-0005) |
| ISTAT Italy | — | ✓ | ✓ (SRC-NF-V11-0006) |
| OECD Economic Surveys | — | ✓ | ✓ (SRC-NF-V11-0007, Japan) |
| UN DESA Population | — | ✓ | — (candidate) |
| WHO World Health Statistics | — | ✓ | — (candidate) |
| ILO | — | ✓ | — (candidate) |
| FAO | — | ✓ | — (candidate) |
| UNESCO/UIS | — | ✓ | — (candidate) |
| IEA / IRENA | — | ✓ | — (candidate) |
| EASA / MAIB (incident reports) | — | ✓ | — (candidate) |
| Cochrane Handbook | — | ✓ | — (candidate) |
| Campbell Collaboration | — | ✓ | — (candidate) |
| PMC methodology papers (causal inference) | — | ✓ | ✓ (SRC-NF-V11-0001, -0002) |

---

## 5. Gap-Fill Distribution (Wave 2)

| Gap category | New candidates | Made GOLD |
|---|---:|---:|
| international | 24 | 5 |
| long-form | 11 | 1 (OECD Japan) |
| datasets | 9 | 0 (candidates only) |
| negative-findings | 6 | 1 (Cochrane "no difference") |
| causal-correlational | 4 | 1 (RCT causal misunderstanding) |
| scope-qualifiers | 1 | 0 |

---

## 6. API Rate-Limit Issue (GAP-013)

### What happened

The `z-ai web_search` function (Bing-backed) returned HTTP 429 "Too many requests, please try again later" for sustained periods during Wave 2. The issue manifested as:

1. **Subagent 2-C (technical):** All batched parallel queries returned 429. Even after 90s and 120s waits, single test queries still returned 429. The subagent's persistent shell session became wedged. 0 candidates produced.
2. **Subagent 2-D (business):** Retried with backoff but exceeded the 200-turn subagent limit. 0 candidates produced.
3. **Orchestrator direct retries:** Multiple single-query tests at 30s, 60s, 90s, 120s intervals all returned 429 for ~2 hours.

### Likely cause

The shared `z-ai web_search` API key has an hourly quota that was exhausted by:
- Wave 1 (v1) on 2026-08-22 morning (~100 queries);
- Wave 2 subagents 2-A and 2-B (~120 queries combined);
- The orchestrator's own journalism-discovery fallback (~20 queries).

### Workaround for Phase 3A.1

- Stagger subagent starts by 60+ seconds;
- Use sequential (not parallel) batches within each subagent;
- Wait 90+ seconds between batches;
- Consider using the `z-ai` SDK directly with built-in rate-limit handling rather than the CLI;
- Or split discovery across multiple sessions (different hours).

### Impact

- v1.1 has 300 candidates instead of the targeted 400 (shortfall of ~100).
- Technical incident reports (NTSB/FAA/CISA), non-SEC business (Berkshire/WEF/Fed), and journalism expansion (Reuters/AP/BBC) are underexpanded.
- The 5 v1 GOLD sources in those registers are retained and re-verified, so GOLD coverage is not reduced — only the expansion is incomplete.

---

## 7. Discovery Quality Controls (v1.1 improvements)

v1.1 added the following controls on top of v1's:

1. **URL actuality verification (PART 4):** Every v1 GOLD URL was fetched via curl with a realistic browser User-Agent. HTTP status + title match recorded. 17 of 22 verified by direct fetch; 5 bot-blocked (Cloudflare/Akamai) but confirmed canonical official-agency URLs. 0 broken.
2. **Source version verification (PART 5):** NIST SP 800-53r5 and 800-63B now record both `publicationDate` (original) and `versionDate` (the specific update at the URL).
3. **Licensing verification (PART 6, 7):** 5-field licensing model. SEC filings corrected from `FULL_TEXT_ARCHIVABLE` to `COPYRIGHT_RESTRICTED` with `archivalPermission: NO`.
4. **Local archive verification (PART 8):** SHA256 hashes + page/word counts + explicit `ARCHIVED_FULL_DOCUMENT` vs `ARCHIVED_LANDING_PAGE` classification.
5. **Claim verification levels (PART 9):** Every claim now carries `verificationLevel` (SNIPPET_VERIFIED / WIDELY_CITED / UNVERIFIED). 0 are SOURCE_VERIFIED yet (GAP-011).
6. **Claim-text integrity (PART 11):** Every claim carries `claimTextIntegrity` (EXACT_QUOTE / FAITHFUL_PARAPHRASE / SYNTHESIS / INFERENCE).
7. **Epistemic label anti-circular-validation (PART 12, 13):** Every claim carries `epistemicLabelStatus: AGENT_ASSIGNED_NEEDS_HUMAN_REVIEW`. None are treated as ground truth.

---

## 8. Discovery Lessons Learned (v1.1)

1. **Rate limits are the binding constraint.** The shared `z-ai web_search` API key cannot sustain 5+ parallel subagents. Future discovery waves must throttle.
2. **Subagent turn limits (200) are tight.** A subagent doing 15+ search rounds with retries can exceed 200 turns. Future subagents should be given smaller, more focused tasks.
3. **International discovery was the highest-ROI expansion.** 55 candidates across 11 countries with 0 fabrications — directly closed GAP-004.
4. **Academic gap-fill was the second-highest ROI.** 45 candidates targeting causal/negative/scope directly improved the claim inventory's epistemic diversity.
5. **URL verification is essential.** v1's snippet-only approach missed the 5 bot-blocked URLs (which are valid but need alternate verification) and the 4 licensing conflation errors. v1.1's curl-based verification caught all of these.

---

*End of discovery report. See `docs/116` for the quality report.*
