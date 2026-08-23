# 106 — Nonfiction Source Discovery Report

**Document:** `106-nonfiction-source-discovery-report.md`
**Branch:** `research/nonfiction-source-pack-v1`
**Date:** 2025-08-22

---

## 1. Discovery Methodology

Discovery was carried out by **5 parallel discovery subagents** (one per source category), each using the `z-ai web_search` CLI function (Bing-backed) to find candidate sources. The orchestrator dispatched the subagents in two waves:

- **Wave 1 (parallel):** academic (1-a), technical (1-b), business (1-c), government (1-d), journalism (1-e).
- Government and journalism subagents initially hit the `z-ai web_search` shared rate-limit (HTTP 429) and were retried with batched-parallel query patterns; the journalism subagent ultimately timed out and was completed directly by the orchestrator.

Each subagent ran 15–30 distinct web searches per category, deduplicated results by URL, filtered out aggregators (Wikipedia, Reddit, ResearchGate, content farms), and followed up with targeted searches to drill down from section homepages to specific documents (e.g. a specific EDGAR filing accession, a specific IPCC report PDF, a specific arXiv abstract).

---

## 2. Discovery Funnel

| Stage | Count |
|---|---:|
| Raw search results returned | ~1,400+ |
| Unique URLs after dedup | ~700 |
| Aggregator / Tier-4 filtered out | ~300 |
| Candidate sources written to `metadata/candidates-*.json` | **200** |
| Selected (GOLD + SILVER + BRONZE) | 50 |
| GOLD | 22 |

### Candidate pool by register

| Register | Candidates | Selected | GOLD |
|---|---:|---:|---:|
| Academic / Research | 45 | 12 | 6 |
| Technical / Engineering | 45 | 9 | 3 |
| Business / Professional | 40 | 10 | 4 |
| Government / Policy | 45 | 15 | 7 |
| Journalistic / Informational | 25 | 4 | 2 |
| **Total** | **200** | **50** | **22** |

---

## 3. Discovery Coverage by Ecosystem

### Tier-1 ecosystems actually represented in the candidate pool

| Ecosystem | Present in candidates | Made GOLD |
|---|:-:|:-:|
| IPCC / UNEP / USGCRP (climate) | ✓ | ✓ (3) |
| U.S. Census Bureau | ✓ | ✓ (2) |
| U.S. Bureau of Labor Statistics | ✓ | ✓ (2) |
| U.S. Bureau of Economic Analysis | ✓ | ✓ (1) |
| U.S. Federal Highway Administration | ✓ | ✓ (1) |
| U.S. National Highway Traffic Safety Administration | ✓ | ✓ (1) |
| NIST (CSRC) | ✓ | ✓ (2) |
| ENISA | ✓ | ✓ (1) |
| IETF RFC archive | ✓ | — (archived, technical silver) |
| W3C | ✓ | — (candidate, technical) |
| NASA NTRS | ✓ | — (candidate, technical) |
| NOAA (climate/weather) | ✓ | — (journalism pool) |
| USGS | ✓ | — (candidate, technical) |
| NTSB | ✓ | — (candidate, technical) |
| CISA | ✓ | — (candidate, technical) |
| SEC EDGAR | ✓ | ✓ (3 10-K + 1 proxy) |
| Federal Reserve | ✓ | — (candidate, business) |
| BIS / ECB | ✓ | — (candidate, business) |
| World Bank Open Knowledge | ✓ | — (candidate, academic) |
| IMF | ✓ | — (candidate, academic) |
| OECD | ✓ | — (candidate, academic) |
| WHO | ✓ | — (candidate, government) |
| FAO | ✓ | — (candidate, government) |
| UN DESA / UNDP | ✓ | — (candidate, government) |
| PMC / NIH (PubMed Central OA) | ✓ | ✓ (2) |
| Cochrane Library | ✓ | — (candidate, academic) |
| NBER | ✓ | ✓ (1) |
| National Academies | ✓ | — (candidate, academic) |
| Stanford HAI | ✓ | — (candidate, academic) |
| arXiv | ✓ | — (archived, reference) |
| Pew Research Center | ✓ | — (candidate, journalism) |
| ProPublica | ✓ | — (candidate, journalism) |
| Our World in Data | ✓ | ✓ (2) |
| Reuters / AP / BBC / NPR / Guardian | ✓ | — (candidates, journalism) |
| FactCheck.org / PolitiFact | ✓ | — (candidates, journalism) |

### Ecosystems explicitly sought but NOT found in candidates

- **Japan Statistics Bureau** (GAP-004)
- **Statistics Canada** (GAP-004)
- **Reserve Bank of India** (GAP-004)
- **IBGE (Brazil)** (GAP-004)
- **African Development Bank** (GAP-004)
- **ICAO** (maritime/aerospace international)

These gaps are documented in `source-gaps.md`.

---

## 4. Discovery Quality Controls

### Filters applied during discovery

1. **Aggregator exclusion:** Wikipedia, Reddit, ResearchGate, Medium (non-verified), LinkedIn, content farms, AI-generated article sites removed.
2. **Homepage-vs-document filter:** When a search result pointed to a section homepage (e.g. `/news`, `/investigations`, `/research`), a follow-up search drilled down to a specific dated document.
3. **Stability preference:** Prefer URLs with stable paths (e.g. `/article/...`, `/news-release/...`, `/report/...`) over query-string URLs.
4. **Date preference:** Prefer documents with a visible publication date.
5. **Author/byline preference (journalism):** Prefer articles with named bylines and datelines.
6. **Open-license preference:** When two equally authoritative sources existed, the openly-licensed one was preferred.

### Red-flag filters applied

- Unverifiable statistics → flag `unverifiable_statistics`.
- AI-generated content → exclude.
- Orphan press releases without underlying data → downgrade.
- Changing dashboards without stable snapshots → exclude or downgrade.
- Missing publication date → flag `missing_publication_date`.

### URL provenance

Every URL in every candidate JSON file traces back to a `url` field returned by the `z-ai web_search` function. **No URL was fabricated.** The subagents recorded this explicitly in their worklog entries.

---

## 5. Discovery Tools

| Tool | Purpose |
|---|---|
| `z-ai function -n web_search -a '{"query": "...", "num": 10}' -o /tmp/....json` | Web search via Bing. |
| Python (`json`, `glob`, `urllib.parse`, `collections`) | Aggregation, dedup, filtering. |
| `curl` | Archival of public-domain / open-license documents. |

The `z-ai web_search` function was used in batched-parallel mode (5 queries per `wait`) to maximize throughput while respecting rate limits.

---

## 6. Subagent Work Records

Each of the 5 discovery subagents appended a structured work record to `/home/z/my-project/worklog.md`:

| Task ID | Subagent | Candidates found | Outcome |
|---|---|---:|---|
| 1-a | academic-research-discovery | 45 | Success — 9 domains, 29 organizations |
| 1-b | technical-engineering-discovery | 45 | Success — 8 sub-domains, 18 organizations |
| 1-c | business-professional-discovery | 40 | Success — 9 business domains, 35 organizations |
| 1-d | government-policy-discovery | 45 | Success (after rate-limit recovery) — 11 domains, 32 organizations |
| 1-e | journalistic-informational-discovery | (timed out) | Completed directly by orchestrator — 25 candidates written |

Total worklog entries: 5 subagent records + 1 orchestrator initialization = 6 entries as of discovery-phase completion.

---

## 7. Discovery Output Files

| File | Size | Candidates |
|---|---:|---:|
| `metadata/candidates-academic.json` | 63 KB | 45 |
| `metadata/candidates-technical.json` | 63 KB | 45 |
| `metadata/candidates-business.json` | 63 KB | 40 |
| `metadata/candidates-government.json` | 70 KB | 45 |
| `metadata/candidates-journalism.json` | 32 KB | 25 |
| **Total** | **291 KB** | **200** |

Each candidate object has 18 fields including: candidateId, title, author, organization, publicationDate, sourceType, domain, authorityTier, license, accessStatus, url, stableUrl, documentFormat, language, snippet, claimTypeTags, qualityScores, redFlags, notes.

---

## 8. Discovery Lessons Learned

1. **Rate-limit pressure:** Running 5 parallel subagents simultaneously saturated the shared `z-ai web_search` API key, causing HTTP 429s. Future discovery waves should either (a) stagger subagent starts by 30–60 seconds, or (b) use sequential category waves with parallelism within each category.

2. **Homepage dominance:** Search results for journalism and institutional sites tend to return section homepages rather than specific articles. Each homepage result required a follow-up targeted search (e.g. `site:propublica.org 2024 investigation`) to drill down to a specific dated article. Future discovery should include explicit "drill-down" passes.

3. **Near-future dates:** Several search results (e.g. NOAA 2026 hurricane outlook, ProPublica May 2026 article) returned dates in the near future relative to the corpus freeze. These were retained but flagged in `redFlags` with "verify currency before gold selection."

4. **Dedup across categories:** Some sources straddle categories (e.g. NOAA appears in both government and journalism pools; IMF/World Bank appear in both academic and government). The curation dedupes by normalized URL host+path, and merges `claimTypeTags` across duplicates.

5. **Journalism Tier-2/3 disadvantage:** Journalism sources are almost never Tier-1 (except government press releases), so they systematically score lower than government/academic sources and require explicit register-quota forcing to enter GOLD. This was handled by Phase A of the curation with an archivable+open-license+non-press-release preference.

---

*End of discovery report.*
