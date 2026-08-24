# Nonfiction Source Pack v1.1

> A **discovery corpus** of nonfiction sources for the future Nonfiction mode of Writing OS.
>
> **Branch:** `research/nonfiction-source-pack-v1`
> **Status:** `DISCOVERY_CORPUS` — frozen, honest, NOT ground truth.
> **Contains ground truth:** `false`
> **SourceFactLedger-ready:** `false`
> **Predecessor:** `sources/nonfiction-v1/` (PRESERVED — not modified)

---

## 1. What this pack IS

A curated **discovery corpus** of 69 nonfiction sources, plus a 135-claim inventory drawn from the 29 GOLD sources, plus 8 locally-archived open-license documents. Its purpose is to expose the future Writing OS to how high-quality nonfiction communicates facts, uncertainty, attribution, evidence, causality, chronology, comparison, and paraphrase.

## 2. What this pack is NOT

- ❌ NOT a SourceFactLedger.
- ❌ NOT ground truth.
- ❌ NOT a benchmark.
- ❌ NOT a verified factual corpus.
- ❌ NOT a production nonfiction validator.
- ❌ NOT ready for direct use in training or evaluating a Nonfiction validator.

The pack is a **discovery layer**: sources have been found, selected, and metadata-organized. The actual source documents have **not** been independently inspected to verify their claims. The claims are **candidates**, not ground truth.

---

## 3. Current verification status (computed from source-index.json)

| Metric | Count |
|---|---:|
| **Total selected sources** | **69** |
| GOLD | 29 |
| SILVER | 25 |
| BRONZE | 15 |
| **URL_VERIFIED** (directly inspected, matched metadata) | **17** |
| **URL_EXISTS_BOT_BLOCKED** (reachable/credible but automated verification blocked) | **5** |
| **UNVERIFIED** (selected, evidence insufficient for direct verification) | **47** |
| SOURCE_VERIFIED (actual document inspected + claims verified) | **0** |

### Critical distinction: GOLD ≠ VERIFIED

A source can be **GOLD + UNVERIFIED** — and 7 of the 29 GOLD sources are exactly that. GOLD means "high-quality candidate / high selection score." It does **not** mean "directly verified source." The 7 GOLD-but-UNVERIFIED sources are the new v1.1 international/academic-gap candidates (Eurostat, Statistics Canada, ONS UK, ISTAT, OECD Japan, PMC/NIH Cochrane-null, PMC/NIH RCT-causal) that were discovered via web search but whose URLs were not directly fetched (API rate limits prevented verification).

### Honest one-paragraph summary

> The v1.1 pack contains **69 selected nonfiction sources** forming a strong discovery corpus. **17 are directly URL-verified, 5 are reachable but bot-blocked, and 47 remain unverified.** The 135 claim records are discovery/candidate claims, not ground truth, and there are currently **zero SOURCE_VERIFIED claims**.

---

## 4. Claim inventory status (computed from claim-inventory.jsonl)

| Verification Level | Count |
|---|---:|
| Total claims | **135** |
| SOURCE_VERIFIED | **0** |
| SOURCE_PARTIALLY_VERIFIED | 0 |
| SNIPPET_VERIFIED (verbatim from web_search snippet) | 17 |
| WIDELY_CITED (well-known published statement; needs source-text verification) | 118 |
| UNVERIFIED | 0 |

**Every claim** carries `epistemicLabelStatus: AGENT_ASSIGNED_NEEDS_HUMAN_REVIEW` to prevent circular validation (an agent extracts a claim, assigns it an epistemic label, and that label is later used as ground truth to evaluate a future LLM — this is forbidden).

The future SourceFactLedger must use **only SOURCE_VERIFIED** claims. v1.1 has **0**. Promoting claims from SNIPPET_VERIFIED/WIDELY_CITED → SOURCE_VERIFIED requires independently inspecting the actual source document (PDF/HTML) and recording exact page/section locations. That is Phase 3A.1 work, not this pack.

---

## 5. Validation opportunities (CANDIDATE, not verified)

| Metric | Count |
|---|---:|
| Total candidate validation opportunities | **1120** |
| VERIFIED_TEST_CASE | **0** |

The 1120 opportunities are **CANDIDATE_OPPORTUNITY** counts — heuristic estimates derived from the claim inventory by pattern-matching. They are NOT verified test cases. Phase 3B will select ~120 candidates, generate Golden Cases, and human-verify each against the source document before using them as ground truth.

---

## 6. Licensing model (5 fields, computed from source-index.json)

| licenseStatus | Count | Archival? | Redistribution? |
|---|---:|---|---|
| PUBLIC_DOMAIN | 26 | YES | YES |
| OPEN_ACCESS | 28 | YES | YES |
| CC_BY | 11 | YES | YES |
| COPYRIGHT_RESTRICTED | 4 | **NO** | **NO** |
| UNKNOWN | 0 | — | — |

**65 archivable, 4 research-only (copyright-restricted SEC filings).** "Publicly accessible" ≠ "Public domain" — the 4 SEC filings are readable at sec.gov but the filer retains copyright; they may be quoted/analyzed but not redistributed wholesale.

**Caveat (PART 21):** `licenseStatus` reflects the **discovered** license based on publisher reputation and document type, not an independently verified license. Where license evidence is uncertain, the source carries `licenseStatus: UNKNOWN` rather than a guess. Phase 3A.1 should independently verify each license against the source document.

---

## 7. Local archives (verified with SHA256)

| Classification | Count |
|---|---:|
| ARCHIVED_FULL_DOCUMENT | 6 |
| ARCHIVED_LANDING_PAGE | 2 |
| ARCHIVED_ABSTRACT_ONLY | 0 |
| **Total** | **8** |

Each archived file has a SHA256 hash, size, page/word count, and explicit classification. The 2 ARCHIVED_LANDING_PAGE entries are arXiv abstract pages (NOT the full PDFs) — v1.1 makes this explicit. See `raw/ARCHIVE-MANIFEST.json`.

---

## 8. Geographic + register diversity (improved over v1)

| Country/Region | Count | Register | Count |
|---|---:|---|---:|
| US | 46 | ACADEMIC | 14 |
| Global (IGO) | 18 | GOVERNMENT | 15 |
| EU | 1 | TECHNICAL | 11 |
| Canada | 1 | BUSINESS | 10 |
| UK | 1 | JOURNALISM | 4 |
| Italy | 1 | INTERNATIONAL | 15 |
| Japan | 1 | | |

---

## 9. What changed from v1

| Aspect | v1 (preserved) | v1.1 (this pack) |
|---|---|---|
| Retrieval date | `2025-08-22` (hardcoded template — WRONG) | `2026-08-22` (dynamic, file-mtime verified) |
| Date model | 1 field (conflated) | 4 fields: publicationDate / versionDate / retrievedAt / archivedAt + status |
| Licensing model | 1 field (all marked archivable — CONFLATION) | 5 fields: licenseStatus / accessStatus / archivalPermission / redistributionPermission / researchAccess |
| URL verification | None (snippet-only) | Per-source: 17 URL_VERIFIED + 5 BOT_BLOCKED + 47 UNVERIFIED + 0 SOURCE_VERIFIED |
| Archive classification | Prose only | Explicit ARCHIVED_FULL_DOCUMENT vs ARCHIVED_LANDING_PAGE + SHA256 |
| Claim verification levels | None | verificationLevel (SNIPPET_VERIFIED/WIDELY_CITED) + claimTextIntegrity + epistemicLabelStatus |
| Geographic diversity | US-only GOLD | US + EU + Canada + UK + Italy + Japan + Global (7 country/regions) |
| **Pack status** | (implicit "complete") | **`DISCOVERY_CORPUS`** — explicit, not ground truth |
| **containsGroundTruth** | (implicit true) | **`false`** — explicit |
| **PACK-MANIFEST.json** | (none) | Present — computed counts, honest summary |

---

## 10. File structure

```
sources/nonfiction-v1.1/
├── README.md                          ← this file (honest about verification status)
├── PACK-MANIFEST.json                 ← computed counts + status=DISCOVERY_CORPUS + containsGroundTruth=false
├── source-index.json                  ← 69 sources + verificationStatus field per source
├── source-evaluation.csv              ← 9-dim quality scores + licensing per source
├── claim-inventory.jsonl              ← 135 claims, all AGENT_ASSIGNED_NEEDS_HUMAN_REVIEW
├── validation-opportunity-matrix.csv  ← 1120 CANDIDATE_OPPORTUNITY (NOT verified test cases)
├── diversity-report.md
├── licensing-report.md
├── source-gaps.md                     ← split DISCOVERY_STATUS vs VERIFICATION_STATUS
├── raw/
│   ├── ARCHIVE-MANIFEST.json          ← 8 archives, SHA256, FULL_DOCUMENT vs LANDING_PAGE
│   └── (8 archived files)
├── metadata/
│   ├── candidates-academic.json       ← 45 new gap-fill candidates
│   ├── candidates-international.json  ← 55 new non-US candidates
│   ├── _audit.json                    ← v1 forensic audit records
│   ├── _merged.json                   ← 300 candidates merged + deduped
│   ├── _curated_v11.json              ← GOLD/SILVER/BRONZE assignments
│   └── _*.py                          ← reproducible build scripts
└── notes/
```

Prose reports in `docs/`:
```
docs/
├── 114-nonfiction-source-pack-v1-1-audit.md           ← forensic audit of v1
├── 115-nonfiction-source-pack-v1-1-discovery-report.md
├── 116-nonfiction-source-pack-v1-1-quality-report.md
├── 117-nonfiction-source-pack-v1-1-claim-inventory.md
├── 118-nonfiction-source-pack-v1-1-validation-opportunity-report.md
├── 119-phase-3-source-pack-v1-1-final-summary.md
└── nonfiction/
    └── phase-3-source-pack-v1.1-final-audit.md        ← final audit (17 questions)
```

---

## 11. Reproducibility

```bash
cd sources/nonfiction-v1.1/metadata
python3 _audit.py                    # → _audit.json (v1 forensic audit)
python3 _merge_curate.py             # → _merged.json + _curated_v11.json
python3 _build_index_v11.py          # → ../source-index.json + ../source-evaluation.csv
python3 _build_claims_v11.py         # → ../claim-inventory.jsonl
python3 _build_matrix_v11.py         # → ../validation-opportunity-matrix.csv
python3 _build_reports_v11.py        # → ../diversity-report.md + ../licensing-report.md + ../source-gaps.md + ../README.md
python3 _add_verification_status.py  # → ../PACK-MANIFEST.json + adds verificationStatus to source-index.json
```

All counts in `PACK-MANIFEST.json` are computed directly from `source-index.json`, `claim-inventory.jsonl`, and `raw/ARCHIVE-MANIFEST.json` — not copied from prose reports.

---

## 12. Security / clean export

The source-pack artifact at `sources/nonfiction-v1.1/` has been scanned for:
- `.env`, `.env.*` — **none inside the pack** (workspace-level `.env` exists at repo root but is excluded from the source-pack artifact).
- `*.key`, `*.pem`, `credentials*`, `*token*`, `*secret*` — **none found inside the pack**.
- API keys, GitHub PATs, OAuth tokens — **none found inside the pack**.
- Unrelated workspace infrastructure (`src/app/`, `components/`, `prisma/`, `node_modules/`, `.zscripts/`, `db/`) — **not part of the source-pack artifact**; they remain at workspace root but are not represented as part of the Nonfiction Source Pack.

The clean deliverable is centered on `sources/nonfiction-v1.1/` plus the `docs/11*.md` and `docs/nonfiction/` documentation. It does **not** include the Writing OS application workspace.

---

## 13. Stop condition

This pack is **frozen** as a `DISCOVERY_CORPUS`. No further source search, no claim verification, no SourceFactLedger construction, no Nonfiction Mode, no benchmark. Phase 3A.1 (future) will verify sources and claims against actual documents; Phase 3B will build the Golden Corpus; Phase 3C will build the validator. None of those are this pack.

---

## 14. Final status

```
DISCOVERY              ✅ strong
LICENSING              ✅ substantially organized
DIVERSITY              ✅ substantially improved
SOURCE VERIFICATION    ⚠️ incomplete (47 unverified)
CLAIM VERIFICATION     ❌ not yet started (0 SOURCE_VERIFIED)
GROUND TRUTH           ❌ not yet established
SOURCEFACTLEDGER       ⏸ future phase (NOT built)
```

**Final status:** `NONFICTION_SOURCE_PACK_V1_1_CORRECTED_AND_FROZEN`
