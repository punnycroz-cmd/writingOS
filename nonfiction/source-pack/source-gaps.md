# Source Gaps Report — Nonfiction Source Pack v1.1 (CORRECTED + FROZEN)

**Generated:** 2026-08-22 (computed from `source-index.json`, `claim-inventory.jsonl`, `validation-opportunity-matrix.csv`)
**Pack status:** `DISCOVERY_CORPUS` (not ground truth)

---

## 1. Reclassified gap framework (PART 24)

Per the brief, gaps are now split into three distinct concepts to prevent the "discovery gap closed = verification complete" confusion:

- **DISCOVERY STATUS** — Did we find enough candidate sources?
- **VERIFICATION STATUS** — Did we independently verify those sources?
- **FUTURE RESEARCH** — What should be addressed later?

This is the critical correction from v1.0's gap report, which conflated discovery with verification (e.g. it claimed GAP-004 "Non-Western sources — CLOSED" merely because candidates were discovered, even though none were directly verified).

---

## 2. Gap table (reclassified)

| Gap ID | Title | Discovery Status | Verification Status | Future Research |
|---|---|---|---|---|
| GAP-001 | Causal/correlational claims thin | **IMPROVED** (+7 causal claims; 2 new academic-gap GOLD candidates discovered) | **VERIFICATION GAP REMAINS** (the 2 new academic-gap GOLD sources are UNVERIFIED; their 10 claims are SNIPPET_VERIFIED, not SOURCE_VERIFIED) | Phase 3A.1: verify the 2 PMC/NIH gap-fill sources against actual documents |
| GAP-002 | Few NEGATIVE findings | **IMPROVED** (+6 negative claims; 1 new Cochrane-null GOLD candidate discovered) | **VERIFICATION GAP REMAINS** (Cochrane-null source UNVERIFIED; 3 negative claims SNIPPET_VERIFIED) | Phase 3A.1: verify + add more Cochrane null reviews + FDA Complete Response Letters |
| GAP-003 | Thin SCOPE-qualifier coverage | **IMPROVED** (+3 scope claims) | **VERIFICATION GAP REMAINS** (new claims SNIPPET_VERIFIED/WIDELY_CITED) | Phase 3A.1: verify scope qualifiers against actual methodology sections |
| GAP-004 | Non-Western sources absent | **DISCOVERY COVERED** (5 new non-US GOLD candidates: Eurostat, Statistics Canada, ONS UK, ISTAT, OECD Japan) | **VERIFICATION GAP REMAINS** (all 5 new non-US GOLD sources are UNVERIFIED — URLs not directly fetched due to API rate limits) | Phase 3A.1: directly fetch + verify each non-US URL |
| GAP-005 | Maritime/aerospace incident reports thin | **UNCHANGED** (discovery incomplete — API rate limit prevented technical subagent from completing) | **VERIFICATION GAP REMAINS** | Phase 3A.1: retry discovery with throttled API calls |
| GAP-006 | Multi-paragraph long-form thin | **IMPROVED** (+1 long-form GOLD: OECD Japan Economic Survey) | **VERIFICATION GAP REMAINS** (OECD Japan source UNVERIFIED) | Phase 3A.1: verify |
| GAP-007 | Business too SEC-heavy | **UNCHANGED** (discovery incomplete — API rate limit) | **VERIFICATION GAP REMAINS** | Phase 3A.1: add Berkshire letter + WEF Risks + Fed MPR |
| GAP-008 | Too few datasets/CSVs | **UNCHANGED** (discovery incomplete — API rate limit) | **VERIFICATION GAP REMAINS** | Phase 3A.1: add World Bank CSV + Census CSV |
| GAP-009 | Education/labor/demographics thin | **IMPROVED** (labour: +4 international GOLD; education: still thin) | **VERIFICATION GAP REMAINS** (new labour sources UNVERIFIED) | Phase 3A.1: verify; add NCES for education |
| GAP-010 | No opinion/editorial sources | **UNCHANGED** | **VERIFICATION GAP REMAINS** | Phase 3A.1: add 1 labeled opinion source |

### New gaps identified in v1.1 (verification-layer gaps)

| Gap ID | Title | Discovery Status | Verification Status | Future Research |
|---|---|---|---|---|
| **GAP-011** | 0 SOURCE_VERIFIED claims | N/A (claims exist) | **VERIFICATION GAP (HIGH)** — 0 of 135 claims are SOURCE_VERIFIED; 118 are WIDELY_CITED, 17 are SNIPPET_VERIFIED | Phase 3A.1: verify each claim against actual source document; record exact page/section |
| **GAP-012** | 0 HUMAN_VERIFIED epistemic labels | N/A | **VERIFICATION GAP (HIGH)** — all 135 claims carry `epistemicLabelStatus: AGENT_ASSIGNED_NEEDS_HUMAN_REVIEW` | Phase 3A.1: human-review every epistemic label before using as ground truth |
| **GAP-013** | 47 selected sources UNVERIFIED | N/A (sources discovered) | **VERIFICATION GAP (HIGH)** — 47 of 69 selected sources (68%) have no direct URL verification; 7 of 29 GOLD sources are UNVERIFIED | Phase 3A.1: directly fetch + verify each unverified source URL |
| **GAP-014** | Technical/business/journalism discovery incomplete | **DISCOVERY INCOMPLETE** (3 of 6 Wave-2 subagents failed due to API HTTP 429 rate limits) | N/A (cannot verify what was not discovered) | Phase 3A.1: retry with throttled/staggered API calls |
| **GAP-015** | License evidence is discovered, not independently verified | N/A | **VERIFICATION GAP (MEDIUM)** — `licenseStatus` reflects publisher reputation + document type, not an independently verified license | Phase 3A.1: verify each license against the source document; mark UNKNOWN where uncertain |

---

## 3. Summary counts

### Discovery gaps
- **Improved/Covered:** GAP-001, GAP-002, GAP-003, GAP-004, GAP-006, GAP-009 (6 gaps)
- **Unchanged:** GAP-005, GAP-007, GAP-008, GAP-010 (4 gaps)
- **Incomplete:** GAP-014 (API rate limit)

### Verification gaps
- **0 SOURCE_VERIFIED sources** (GAP-013 — 47 unverified, 22 v1-promoted are URL_VERIFIED or BOT_BLOCKED but not SOURCE_VERIFIED)
- **0 SOURCE_VERIFIED claims** (GAP-011)
- **0 HUMAN_VERIFIED epistemic labels** (GAP-012)
- **0 independently verified licenses** (GAP-015)

### Future research (Phase 3A.1 priorities)
1. Verify each of the 47 UNVERIFIED source URLs (direct fetch + title match + content spot-check).
2. Verify each of the 135 claims against the actual source document; record exact page/section; upgrade verificationLevel to SOURCE_VERIFIED.
3. Human-review every epistemic label; upgrade epistemicLabelStatus to HUMAN_VERIFIED.
4. Independently verify each license; mark UNKNOWN where uncertain.
5. Retry GAP-014 discovery (technical incident reports, non-SEC business, journalism expansion) with throttled API calls.

---

## 4. Critical correction from v1.0

**v1.0's gap report** claimed:
> `GAP-004 Non-Western sources — CLOSED`

**This was misleading.** v1.0 marked the gap "CLOSED" merely because non-US candidates were discovered, even though none were directly verified. v1.1 corrects this:

> `GAP-004 Non-Western source discovery — IMPROVED / DISCOVERY COVERED`
> `Verification status — VERIFICATION GAP REMAINS`

The 5 new non-US GOLD sources (Eurostat, Statistics Canada, ONS UK, ISTAT, OECD Japan) are **discovered and selected** but **UNVERIFIED** — their URLs were not directly fetched due to API rate limits during Wave 2 discovery. They are strong discovery candidates, not verified sources.

This correction applies to all gaps: **discovery ≠ verification**.
