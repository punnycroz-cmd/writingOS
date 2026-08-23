# Nonfiction Source Pack v1.1 — Delivery Readme

## 1. What This Is
**Nonfiction Source Pack v1.1** is a curated, diverse discovery corpus of real-world nonfiction sources and candidate claims across government, academic, technical, business, and journalism domains.

## 2. Status & Nature
- **Status:** `FROZEN_DISCOVERY_CORPUS` (Version 1.1.0)
- **Contains Ground Truth:** `false`
- **Purpose:** Source discovery, register calibration, and validation opportunity mapping.

---

## 3. Core Metrics & Verification Breakdown

### Selected Sources (Total: 69)
- **Quality Distribution:** 29 GOLD, 25 SILVER, 15 BRONZE
- **Verification Distribution:**
  - `URL_VERIFIED`: **17** (directly confirmed reachable with matching document title)
  - `URL_EXISTS_BOT_BLOCKED`: **5** (reachable/resolvable domain, but blocked by automated fetch / CDN)
  - `UNVERIFIED`: **47** (discovered via search results; full-text retrieval not yet performed)
  - `SOURCE_VERIFIED`: **0**

### Candidate Claims (Total: 135)
- **Claim Verification Breakdown:**
  - `SOURCE_VERIFIED`: **0** (no claims have been cross-checked line-by-line against primary source PDF/HTML)
  - `SNIPPET_VERIFIED`: **17** (matched against verified discovery snippets)
  - `WIDELY_CITED`: **118** (candidate claims extracted from high-authority reports/papers)
  - `UNVERIFIED`: **0**

### Licensing Distribution
- `OPEN_ACCESS`: 28
- `PUBLIC_DOMAIN`: 26
- `CC_BY`: 11
- `COPYRIGHT_RESTRICTED`: 4 (metadata and short lawful excerpts only; no full copyrighted text included)

---

## 4. Explicit Negative Scope — What This Is NOT
- This is **NOT** a factual ground-truth benchmark.
- This is **NOT** a `SourceFactLedger`.
- This is **NOT** `Nonfiction Mode` implementation.
- This is **NOT** a production validation system.

---

## 5. Next Future Phase
The next intended phase for this research is:
1. Primary full-text retrieval and source verification of the 47 unverified sources.
2. Direct line-by-line fact verification of the 135 candidate claims.
3. Formal construction of the canonical `SourceFactLedger`.
