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

# Diversity Report — Nonfiction Source Pack v1.1

Generated: 2026-08-22
Scope: All 69 selected sources (GOLD+SILVER+BRONZE) and 135 claims across 29 GOLD sources.

---

## 1. Organization Diversity

| Scope | Unique Organizations |
|---|---:|
| All selected (69) | 50 |
| GOLD (29) | 22 |

### Top organizations (all selected)
| Organization | Count |
|---|---:|
| NIST | 6 |
| U.S. Bureau of Labor Statistics | 3 |
| PMC / NIH | 2 |
| U.S. Census Bureau | 2 |
| ENISA | 2 |
| Microsoft Corporation / SEC EDGAR | 2 |
| Our World in Data | 2 |
| PMC / NIH National Library of Medicine | 2 |
| World Health Organization | 2 |
| NASA | 2 |
| World Economic Forum | 2 |
| National Center for Education Statistics (NCES), IES, U.S. Department of Education | 2 |
| NOAA | 2 |
| Cochrane | 2 |
| IPCC | 1 |


---

## 2. Domain Diversity

| Scope | Unique Domains |
|---|---:|
| All selected | 22 |
| GOLD | 12 |

### GOLD domain distribution
| Domain | Count |
|---|---:|
| climate | 5 |
| economy | 4 |
| demographics | 3 |
| labor | 3 |
| cybersecurity | 3 |
| medicine | 2 |
| technology-corporate | 2 |
| infrastructure | 2 |
| health | 2 |
| economics | 1 |
| consumer | 1 |
| governance | 1 |


---

## 3. Register Diversity (v1.1 adds INTERNATIONAL)

| Register | All Selected | GOLD | v1 GOLD |
|---|---:|---:|---:|
| ACADEMIC | 14 | 6 | 6 |
| GOVERNMENT | 15 | 7 | 7 |
| TECHNICAL | 11 | 3 | 3 |
| BUSINESS | 10 | 4 | 4 |
| JOURNALISM | 4 | 2 | 2 |
| INTERNATIONAL | 15 | 7 | 0 |


---

## 4. Geographic Diversity (NEW in v1.1)

| Country/Region | All Selected | GOLD |
|---|---:|---:|
| Canada | 1 | 1 |
| EU | 1 | 1 |
| Global | 18 | 2 |
| Italy | 1 | 1 |
| Japan | 1 | 1 |
| UK | 1 | 1 |
| US | 46 | 22 |


v1 had 0 non-US GOLD sources (excluding Global IGOs). v1.1 adds 5 non-US GOLD (EU, Canada, UK, Italy, Japan).

---

## 5. Document-Format Diversity

| Format | All Selected | GOLD |
|---|---:|---:|
| HTML | 52 | 23 |
| PDF | 17 | 6 |


---

## 6. Authority-Tier Diversity

| Tier | All Selected | GOLD |
|---|---:|---:|
| Tier 1 | 67 | 27 |
| Tier 2 | 2 | 2 |


---

## 7. Epistemic Diversity (from v1.1 claim inventory, 135 claims)

### Claim-type distribution
| Claim Type | v1.1 Count | v1 Count | Delta |
|---|---:|---:|---:|
| NUMERICAL | 39 | 31 | +8 |
| EVIDENCE_LIMITATION | 21 | 16 | +5 |
| FORECAST | 17 | 13 | +4 |
| EXACT_FACT | 15 | 13 | +2 |
| COMPARATIVE | 13 | 8 | +5 |
| CAUSAL | 7 | 6 | +1 |
| NEGATIVE | 6 | 4 | +2 |
| ESTIMATE | 5 | 4 | +1 |
| CORRELATIONAL | 4 | 2 | +2 |
| TEMPORAL | 3 | 3 | +0 |
| UNCERTAINTY | 2 | 2 | +0 |
| SCOPE | 1 | 1 | +0 |
| ATTRIBUTION | 1 | 1 | +0 |
| RELATIONSHIP | 1 | 1 | +0 |


### Verification-level distribution (NEW in v1.1)
| Verification Level | Count | % | Notes |
|---|---:|---:|---|
| SNIPPET_VERIFIED | 17 | 12% | Verbatim from web_search snippet. |
| WIDELY_CITED | 118 | 87% | Well-known published statement — needs source-text verification before SourceFactLedger use. |
| SOURCE_VERIFIED | 0 | 0% | (Target for Phase 3A.1 — v1.1 has none yet.) |
| UNVERIFIED | 0 | 0% | Plausible but unconfirmed. |

### Claim-text integrity distribution (NEW in v1.1)
| Integrity | Count | % |
|---|---:|---:|
| FAITHFUL_PARAPHRASE | 115 | 85% |
| EXACT_QUOTE | 16 | 11% |
| SYNTHESIS | 4 | 2% |


### Certainty distribution (NEW in v1.1)
| Certainty | Count |
|---|---:|
| MEDIUM | 74 |
| QUALIFIED | 41 |
| HIGH | 17 |
| LOW | 3 |


### Epistemic-label status (PART 13 anti-circular-validation)
| Status | Count | Notes |
|---|---:|---|
| AGENT_ASSIGNED_NEEDS_HUMAN_REVIEW | 135 | ALL v1.1 claims — prevents circular validation. None are treated as ground truth yet. |
| HUMAN_VERIFIED | 0 | (Target for Phase 3A.1.) |

---

## 8. Licensing Diversity (CORRECTED — 5 fields)

| licenseStatus | All Selected | GOLD |
|---|---:|---:|
| CC_BY | 11 | 4 |
| COPYRIGHT_RESTRICTED | 4 | 4 |
| OPEN_ACCESS | 28 | 11 |
| PUBLIC_DOMAIN | 26 | 10 |


### Archival permission
| archivalPermission | Count |
|---|---:|
| YES | 65 |
| NO | 4 |


---

## 9. Diversity Assessment

**Improvements over v1:**
- 50 unique organizations (+18% vs v1's 35) → organization-to-source ratio 0.72.
- 22 unique domains (+27% vs v1's 14).
- Geographic diversity: 7 country/regions in GOLD (v1 had 2: US + Global).
- Epistemic diversity: 14 claim types, 4 verification levels, 3 integrity classes, 4 certainty levels.
- Added INTERNATIONAL register (15 sources, 5 in GOLD).
- All claims carry `verificationLevel` + `claimTextIntegrity` + `epistemicLabelStatus` (anti-circular-validation).

**Remaining gaps (see source-gaps.md):**
- No SOURCE_VERIFIED claims yet (all are SNIPPET_VERIFIED or WIDELY_CITED).
- No CSV datasets in GOLD.
- Technical register still 3 GOLD (incident reports underrepresented — discovery hit API rate limits).
- Maritime/aerospace incident reports thin.
