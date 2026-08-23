# Phase 3 Source Pack v1.1 — Final Audit Report

**Document:** `docs/nonfiction/phase-3-source-pack-v1.1-final-audit.md`
**Branch:** `research/nonfiction-source-pack-v1`
**Audit date:** 2026-08-22
**Auditor:** orchestrator (Phase 3A.0-final)
**Method:** All counts computed directly from `source-index.json`, `claim-inventory.jsonl`, `raw/ARCHIVE-MANIFEST.json` — not copied from prose reports.

---

## Audit Questions (17)

### Q1. How many selected sources actually exist?

**69** selected sources in `sources/nonfiction-v1.1/source-index.json`.

Computed: `len(sources)` = 69.

### Q2. How many are GOLD / SILVER / BRONZE?

| Selection | Count |
|---|---:|
| GOLD | 29 |
| SILVER | 25 |
| BRONZE | 15 |
| **Total** | **69** |

### Q3. How many are URL_VERIFIED?

**17** sources are URL_VERIFIED (URL directly inspected, matched expected metadata).

These are the 22 v1-promoted GOLD sources minus the 5 that were bot-blocked: 17 verified by direct curl fetch with HTTP 200 + matching `<title>`.

### Q4. How many are bot-blocked?

**5** sources are URL_EXISTS_BOT_BLOCKED (UNEP, Census ×2, BLS ×2 — canonical official-agency URLs blocked by Cloudflare/Akamai anti-bot). These are **not** the same as URL_VERIFIED.

### Q5. How many are unverified?

**47** sources are UNVERIFIED.

**This is the critical correction.** Previous documentation understated this count. The 47 UNVERIFIED sources are the new v1.1-discovered candidates (Wave 2: 55 international + 45 academic-gap = 100 new candidates, of which 47 were selected). Their URLs were not directly fetched due to `z-ai web_search` API HTTP 429 rate limits during Wave 2.

### Q6. How many are SOURCE_VERIFIED?

**0** sources are SOURCE_VERIFIED (actual source document inspected sufficiently to verify the source and its relevant claims).

**Zero.** No source has had its actual document content verified. URL_VERIFIED only confirms the URL resolves to a page whose title matches — it does not verify the document's claims.

### Q7. How many claims exist?

**135** claims in `sources/nonfiction-v1.1/claim-inventory.jsonl`.

### Q8. How many claims are SOURCE_VERIFIED?

**0** claims are SOURCE_VERIFIED.

**Zero.** The claim verification-level distribution is:

| verificationLevel | Count |
|---|---:|
| SOURCE_VERIFIED | 0 |
| SOURCE_PARTIALLY_VERIFIED | 0 |
| SNIPPET_VERIFIED | 17 |
| WIDELY_CITED | 118 |
| UNVERIFIED | 0 |

17 are SNIPPET_VERIFIED (verbatim from a web_search snippet). 118 are WIDELY_CITED (well-known published statements needing source-text verification). **None are SOURCE_VERIFIED.**

### Q9. Are the claims ground truth?

**No.** Every claim carries `epistemicLabelStatus: AGENT_ASSIGNED_NEEDS_HUMAN_REVIEW`. None are `HUMAN_VERIFIED`. The claims are **candidate claims**, not ground truth. Using them as ground truth would create circular validation (an agent extracts a claim, assigns it an epistemic label, and that label is later used to evaluate a future LLM — this is forbidden per PART 13 of the brief).

### Q10. Are validation opportunities ground truth?

**No.** The 1120 validation opportunities in `validation-opportunity-matrix.csv` are `CANDIDATE_OPPORTUNITY` counts — heuristic estimates derived from the claim inventory by pattern-matching. They are **not** `VERIFIED_TEST_CASE`. Zero Golden Cases have been generated or human-verified.

### Q11. How many full documents are archived?

**6** ARCHIVED_FULL_DOCUMENT:

| File | sourceId | Size | Verification |
|---|---|---:|---|
| nist-sp-800-53r5.pdf | SRC-NF-0010 | 6,073,678 | SHA256 verified, 492 pages |
| nist-sp-800-63b.pdf | SRC-NF-0011 | 1,480,377 | SHA256 verified, 80 pages |
| owid-co2-emissions.html | SRC-NF-0016 | 167,838 | SHA256 verified, 12,212 words |
| owid-co2-ghg.html | SRC-NF-0015 | 355,705 | SHA256 verified, 16,758 words |
| rfc9114-http3.txt | (reference) | 155,206 | SHA256 verified, 21,470 words |
| rfc1918-private-address.txt | (reference) | 22,271 | SHA256 verified, 3,067 words |

All 8 of 8 archived files verified present + SHA256-matched.

### Q12. How many landing pages are archived?

**2** ARCHIVED_LANDING_PAGE:

| File | sourceId | Size | Note |
|---|---|---:|---|
| arxiv-1706.03762-attention-is-all-you-need.html | (reference) | 43,644 | arXiv abstract/landing page — full PDF NOT archived |
| arxiv-2303.18223-gpt4-technical-report.html | (reference) | 50,593 | arXiv abstract/landing page — full PDF NOT archived |

These are **not** the full documents. v1.1 makes this explicit with the `ARCHIVED_LANDING_PAGE` classification (v1 used prose only).

### Q13. How many sources are copyright restricted?

**4** sources are COPYRIGHT_RESTRICTED (the 4 SEC EDGAR filings: Microsoft 10-K, Apple 10-K, Amazon 10-K, Microsoft proxy). These are publicly accessible at sec.gov but the filer retains copyright — they may be quoted/analyzed but not redistributed wholesale.

Full licensing distribution:

| licenseStatus | Count | archivalPermission |
|---|---:|---|
| PUBLIC_DOMAIN | 26 | YES |
| OPEN_ACCESS | 28 | YES |
| CC_BY | 11 | YES |
| COPYRIGHT_RESTRICTED | 4 | NO |
| UNKNOWN | 0 | UNKNOWN |

**65 archivable, 4 research-only (copyright-restricted).**

**Caveat (PART 21):** `licenseStatus` reflects the **discovered** license based on publisher reputation and document type, not an independently verified license. Where license evidence is uncertain, the source carries `licenseStatus: UNKNOWN` rather than a guess. Phase 3A.1 should independently verify each license.

### Q14. What private/unrelated files were removed from the clean pack?

**None needed removal** — the source-pack artifact at `sources/nonfiction-v1.1/` was scanned and contains **no** private/sensitive files:

- `.env`, `.env.*` — 0 found inside the pack
- `*.key`, `*.pem` — 0 found
- `credentials*`, `*token*`, `*secret*` — 0 found
- API keys, GitHub PATs, OAuth tokens — 0 found (grepped archive HTML/TXT for `API_KEY|SECRET|TOKEN|PAT|password` — 0 matches)

The workspace-level `.env` (50 bytes, at repo root) and `.zscripts/` (build infrastructure) exist at the repo root but are **outside** the source-pack artifact (`sources/nonfiction-v1.1/`) and are **not** represented as part of the Nonfiction Source Pack. The clean deliverable is centered on `sources/nonfiction-v1.1/` + the `docs/11*.md` + `docs/nonfiction/` documentation only.

Unrelated workspace infrastructure explicitly **excluded** from the clean source-pack artifact:
- `src/app/`, `components/`, `prisma/`, `node_modules/`, `db/`, `mini-services/`, `examples/`, `tests/`, `skills/`, `upload/`, `download/`, `public/`
- `.next/`, `bun.lock`, `package.json` (Next.js application files)

### Q15. What discovery gaps are covered?

**Discovery-status improvements (6 gaps improved/covered):**

| Gap | Discovery Status |
|---|---|
| GAP-001 Causal/correlational claims thin | IMPROVED (+7 causal claims; 2 new academic-gap GOLD candidates discovered) |
| GAP-002 Few NEGATIVE findings | IMPROVED (+6 negative claims; Cochrane-null GOLD candidate discovered) |
| GAP-003 Thin SCOPE-qualifier coverage | IMPROVED (+3 scope claims) |
| GAP-004 Non-Western sources absent | **DISCOVERY COVERED** (5 new non-US GOLD candidates: Eurostat, Statistics Canada, ONS UK, ISTAT, OECD Japan) |
| GAP-006 Multi-paragraph long-form thin | IMPROVED (+1 long-form GOLD: OECD Japan Economic Survey) |
| GAP-009 Education/labor/demographics thin | IMPROVED (labour: +4 international GOLD) |

**Discovery gaps still incomplete:**

| Gap | Discovery Status |
|---|---|
| GAP-005 Maritime/aerospace incident reports thin | UNCHANGED (API rate limit prevented technical subagent) |
| GAP-007 Business too SEC-heavy | UNCHANGED (API rate limit) |
| GAP-008 Too few datasets/CSVs | UNCHANGED (API rate limit) |
| GAP-010 No opinion/editorial sources | UNCHANGED |
| GAP-014 Technical/business/journalism discovery incomplete | INCOMPLETE (3 of 6 Wave-2 subagents failed: HTTP 429) |

### Q16. What verification gaps remain?

**ALL verification gaps remain** — this is a discovery corpus, not a verified corpus:

| Verification Gap | Status |
|---|---|
| GAP-011: 0 SOURCE_VERIFIED claims | REMAINS (all 135 claims are SNIPPET_VERIFIED or WIDELY_CITED) |
| GAP-012: 0 HUMAN_VERIFIED epistemic labels | REMAINS (all 135 are AGENT_ASSIGNED_NEEDS_HUMAN_REVIEW) |
| GAP-013: 47 selected sources UNVERIFIED | REMAINS (68% of selected sources have no direct URL verification; 7 of 29 GOLD are UNVERIFIED) |
| GAP-015: License evidence is discovered, not independently verified | REMAINS |

### Q17. Is the pack ready for SourceFactLedger construction?

**NOT YET.**

The pack is a `DISCOVERY_CORPUS`, not a verified corpus. SourceFactLedger construction requires:

1. ✅ A curated set of discovered sources — **DONE** (69 selected, 29 GOLD)
2. ❌ Direct URL verification of all sources — **47 of 69 unverified**
3. ❌ Source-document inspection (PDF/HTML) to verify claims — **0 sources SOURCE_VERIFIED**
4. ❌ Claim verification against actual source text — **0 claims SOURCE_VERIFIED**
5. ❌ Human review of epistemic labels — **0 claims HUMAN_VERIFIED**
6. ❌ Exact source locations (page/section) — **none recorded**

Until items 2–6 are completed (Phase 3A.1), the pack cannot be used to construct a SourceFactLedger. Using the current claims as ground truth would create circular validation.

---

## Final Status

```
DISCOVERY              ✅ strong (69 selected, 29 GOLD, 7 country-regions)
LICENSING              ✅ substantially organized (5-field model, 65 archivable, 4 copyright-restricted)
DIVERSITY              ✅ substantially improved (6 registers, 7 country-regions)
SOURCE VERIFICATION    ⚠️ incomplete (47 of 69 unverified; 0 SOURCE_VERIFIED)
CLAIM VERIFICATION     ❌ not yet started (0 SOURCE_VERIFIED claims; 0 HUMAN_VERIFIED labels)
GROUND TRUTH           ❌ not yet established (containsGroundTruth = false)
SOURCEFACTLEDGER       ⏸ future phase (NOT built; pack not yet ready)
```

**Final pack status:** `NONFICTION_SOURCE_PACK_V1_1_CORRECTED_AND_FROZEN`

The pack is a clean, honest, frozen discovery corpus. It is strong as a discovery layer but is **not** source-verified, **not** claim-verified, and **not** ground truth. Phase 3A.1 (future) will verify sources and claims against actual documents; Phase 3B will build the Golden Corpus; Phase 3C will build the validator. None of those are this pack.

---

## Honest one-paragraph summary

> **69 selected nonfiction sources form a strong discovery corpus. 17 are directly URL-verified, 5 are reachable but bot-blocked, and 47 remain unverified. The 135 claim records are discovery/candidate claims, not ground truth, and there are currently zero SOURCE_VERIFIED claims.** 7 of 29 GOLD sources are UNVERIFIED — GOLD ≠ VERIFIED. The pack is frozen as `DISCOVERY_CORPUS` and is not yet ready for SourceFactLedger construction.
