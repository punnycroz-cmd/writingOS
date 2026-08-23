# 105 — Nonfiction Source Pack v1 — Specification

**Document:** `105-nonfiction-source-pack-v1-spec.md`
**Branch:** `research/nonfiction-source-pack-v1`
**Status:** SPECIFICATION (frozen for v1)
**Date:** 2025-08-22

---

## 1. Purpose of This Specification

This document specifies the **Nonfiction Source Pack v1** — a research and learning corpus for the future Nonfiction mode of Writing OS. It defines:

- what the pack IS and IS NOT;
- the structure, file formats, and metadata schema;
- the quality-scoring methodology;
- the selection (GOLD / SILVER / BRONZE) rules;
- the claim-inventory schema;
- the validation-opportunity matrix;
- the downstream consumption contract.

This is a specification, not an implementation. The pack itself lives in `sources/nonfiction-v1/`.

---

## 2. What the Pack IS

A curated, documented, provenance-rich set of **nonfiction source documents** plus a **claim inventory** drawn from the strongest of those sources. Its sole purpose is to expose the future Writing OS to the way high-quality nonfiction actually communicates:

- facts and exact figures;
- uncertainty and estimates;
- attribution and provenance;
- causal and correlational language;
- comparisons and magnitudes;
- temporal sequence and forecasts;
- scope and limitations;
- professional structure;
- careful paraphrase.

## 3. What the Pack IS NOT

- NOT a redistribution of copyrighted books, articles, or papers.
- NOT an implementation of SourceFactLedger, Nonfiction Mode, or the Nonfiction semantic validator.
- NOT a modification of Writing OS v1, the Fiction system, the Constitution, or the Writing Bible.
- NOT a benchmark result. (The Nonfiction semantic benchmark is NOT run.)
- NOT a merged feature branch. It lives on `research/nonfiction-source-pack-v1` and is independently reviewable.

---

## 4. Funnel Targets vs Actuals

| Stage | Target | Actual |
|---|---:|---:|
| Discovery (candidates) | 100–200 | 200 |
| Curation (selected, strong) | 30–50 | 50 |
| Gold set (exceptional) | 15–25 | 22 |

---

## 5. Source Categories (5 registers)

| Register | Candidate Pool | Selected | GOLD |
|---|---:|---:|---:|
| Academic / Research | 45 | 12 | 6 |
| Technical / Engineering | 45 | 9 | 3 |
| Business / Professional | 40 | 10 | 4 |
| Government / Policy | 45 | 15 | 7 |
| Journalistic / Informational | 25 | 4 | 2 |
| **Total** | **200** | **50** | **22** |

The preferred GOLD composition (Part 30 of the brief) was 5–7 government, 4–6 academic, 3–5 technical, 2–4 business, 1–3 journalism. The actual GOLD composition is **7 / 6 / 3 / 4 / 2**, which falls within every preferred range.

---

## 6. Source Authority Hierarchy

| Tier | Selected | GOLD | Definition |
|---|---:|---:|---|
| Tier 1 (primary / official) | 48 | 20 | Government agencies, official statistical agencies, official research institutions, original research, regulatory filings, official datasets, public technical organizations. |
| Tier 2 (high-quality institutional) | 2 | 2 | Universities, research centers, professional associations, recognized nonprofits. |
| Tier 3 (reputable secondary) | 0 | 0 | Reuters, AP, BBC, established publications, respected professional journals. (Present in the journalism candidate pool but not selected because Tier-1 press releases out-scored them.) |
| Tier 4 (general web) | 0 | 0 | Used only when compelling; content farms and unverifiable claims excluded. |

The 2 Tier-2 GOLD sources are both **Our World in Data** articles (CC-BY, academically authored, openly licensed) — included explicitly for register diversity and archivability.

---

## 7. Source Metadata Schema

Every selected source is recorded in `source-index.json` with the following schema:

```json
{
  "sourceId": "SRC-NF-0001",
  "title": "...",
  "author": "...",
  "organization": "...",
  "publicationDate": "YYYY or YYYY-MM[-DD]",
  "retrievalDate": "2025-08-22",
  "sourceType": "...",
  "domain": "...",
  "candidateRegister": "ACADEMIC | GOVERNMENT | TECHNICAL | BUSINESS | JOURNALISM",
  "authorityTier": 1,
  "license": "...",
  "accessStatus": "FULL_TEXT_ARCHIVABLE | FULL_TEXT_ACCESSIBLE | PREVIEW | ABSTRACT | METADATA_ONLY",
  "url": "...",
  "stableUrl": "...",
  "documentFormat": "PDF | HTML | CSV | TXT | OTHER",
  "language": "en",
  "qualityScores": {
    "authority": 0, "stability": 0, "provenance": 0, "factualDensity": 0,
    "structuralRichness": 0, "rewriteUtility": 0, "accessibility": 0,
    "reproducibility": 0, "learningValue": 0
  },
  "totalScore": 0,
  "selectionStatus": "GOLD | SILVER | BRONZE | EXCLUDED",
  "goldRank": null or integer,
  "selectionReason": "...",
  "validationValue": "...",
  "claimTypeTags": [...],
  "redFlags": [...],
  "notes": "..."
}
```

**Total score** is computed as the sum of the 9 quality dimensions (0–5 each = 0–45), plus:
- +2 if `accessStatus == FULL_TEXT_ARCHIVABLE`,
- +1 if `authorityTier == 1`.

Maximum possible total score: 48.

---

## 8. Quality-Scoring Methodology (9 dimensions, 0–5 each)

| Dimension | Definition |
|---|---|
| **authority** | Reputation and statutory standing of the issuing organization. |
| **stability** | Likelihood the URL and content remain stable over years. |
| **provenance** | Clarity of authorship, version, and publication chain. |
| **factualDensity** | Density of verifiable facts, numbers, dates, entities per unit text. |
| **structuralRichness** | Presence of tables, sections, methodology, limitations, multi-paragraph structure. |
| **rewriteUtility** | Usefulness for testing paraphrase fidelity (hedged vs unhedged, attributed vs unattributed). |
| **accessibility** | Ease of lawful full-text access. |
| **reproducibility** | Extent to which the document's claims can be independently re-derived. |
| **learningValue** | Composite: factual + epistemic + structural richness for training a Nonfiction validator. |

Scores were assigned by the discovery subagents based on snippet content + publisher reputation, then validated by the orchestrator during curation.

---

## 9. Selection Rules (GOLD / SILVER / BRONZE)

### GOLD (target 15–25; actual 22)

Three-phase register-aware selection:

1. **Phase A — Minimum register quotas** (forces register balance):
   - ACADEMIC ≥ 4, GOVERNMENT ≥ 5, TECHNICAL ≥ 3, BUSINESS ≥ 2, JOURNALISM ≥ 2.
   - For BUSINESS: SEC 10-K filings capped at 2 during Phase A (reserve remaining for Phase B).
   - For JOURNALISM: prefer `FULL_TEXT_ARCHIVABLE` + openly-licensed + non-press-release sources (to ensure genuine journalistic open-data representation).
   - Per-organization cap of 2 within each register (except journalism).

2. **Phase B — Fill by score**:
   - Fill remaining GOLD slots by descending total score.
   - Register caps (max): ACADEMIC 6, GOVERNMENT 7, TECHNICAL 5, BUSINESS 4, JOURNALISM 3.
   - Per-organization cap of 2 across the full GOLD set.
   - SEC 10-K cap of 3 across the full GOLD set.

3. **Phase C — Diversity validation**:
   - Confirm GOLD covers ≥ 5 distinct domains, ≥ 15 distinct organizations, ≥ 4 of 5 registers.

### SILVER (target ~15–20; actual 18)

Filled by descending total score among non-GOLD candidates, with register caps:
- ACADEMIC ≤ 4, GOVERNMENT ≤ 5, TECHNICAL ≤ 4, BUSINESS ≤ 4, JOURNALISM ≤ 2.

### BRONZE (target ~8–15; actual 10)

Filled by descending total score among non-GOLD/non-SILVER candidates, with register caps:
- ACADEMIC ≤ 2, GOVERNMENT ≤ 3, TECHNICAL ≤ 2, BUSINESS ≤ 2, JOURNALISM ≤ 1.

### EXCLUDED

All 150 candidates not selected for GOLD/SILVER/BRONZE remain in `metadata/_curated.json` with `selectionStatus: "EXCLUDED"` for future re-evaluation.

---

## 10. Claim-Inventory Schema

For the 22 GOLD sources, individual claims are recorded in `claim-inventory.jsonl` (one JSON object per line):

```json
{
  "claimId": "CLM-NF-0001",
  "sourceId": "SRC-NF-0001",
  "sourceLocation": "Headline Statements, A.1",
  "claimText": "...",
  "claimType": "EXACT_FACT | NUMERICAL | TEMPORAL | ENTITY | PROPERTY | RELATIONSHIP | ATTRIBUTION | ESTIMATE | UNCERTAINTY | CAUSAL | CORRELATIONAL | NEGATIVE | COMPARATIVE | SEQUENCE | SCOPE | PARAPHRASE | FORECAST | OPINION | EVIDENCE_LIMITATION",
  "epistemicStrength": "ESTIMATE | ATTRIBUTED | INFERRED | CONDITIONAL_ESTIMATE | FACT",
  "entities": [...],
  "numbers": [...],
  "dates": [...],
  "relations": ["subject -> relation -> object", ...],
  "attribution": "...",
  "causalStatus": "CAUSAL | CORRELATIONAL | COMPARATIVE | NONE",
  "usefulForValidation": true,
  "notes": "..."
}
```

Every claim is grounded in either:
- **snippet-verified** — verbatim/near-verbatim from the web_search snippet retrieved on 2025-08-22;
- **widely-cited** — a well-known widely-cited statement from a famous published document;
- **pending-verification** — plausible based on document type but requiring confirmation against the full source text before being used in a Golden Corpus.

The verification status is recorded in the `notes` field. **No claim is fabricated wholesale.**

---

## 11. Validation-Opportunity Matrix Schema

`validation-opportunity-matrix.csv` has one row per GOLD source, with columns:

`sourceId, title, organization, register, claimCount, supported, unsupported, contradiction, numbers, dates, entities, attribution, causal, paraphrase, negative, comparative, temporal, uncertainty, scope, forecast, totalOpportunities`

Opportunity counts are derived from the claim inventory by:
- **supported** = total claims for that source;
- **unsupported** = claims whose text contains hedge words (may, might, could, estimated, projected, appears, tends, likely, possibly, etc.);
- **contradiction** = supported (every supported claim is a candidate for a contradiction test);
- **numbers / dates / entities** = claims whose corresponding list is non-empty;
- **attribution** = claims with `epistemicStrength == ATTRIBUTED`;
- **causal** = claims with `causalStatus in (CAUSAL, CORRELATIONAL)`;
- **paraphrase** = supported;
- **negative** = claims of type NEGATIVE or containing "no/not/never/did not/shall not/no evidence";
- **comparative** = claims of type COMPARATIVE or containing comparative language;
- **temporal** = claims of type TEMPORAL/FORECAST or with non-empty dates;
- **uncertainty** = claims of type ESTIMATE/UNCERTAINTY/FORECAST/EVIDENCE_LIMITATION or with epistemic-strength ESTIMATE/CONDITIONAL_ESTIMATE/INFERRED;
- **scope** = claims of type SCOPE or containing scope language;
- **forecast** = claims of type FORECAST.

---

## 12. Archival Policy

| Source license | Archival action |
|---|---|
| Public Domain (U.S. federal works: NIST, NOAA, NASA, Census, BLS, BEA, FHWA, NHTSA, SEC EDGAR metadata) | Full document archived locally in `raw/` where retrieval succeeded. |
| CC-BY 4.0 (Our World in Data, some UN/WHO/World Bank) | Full document archived with attribution. |
| CC-BY-ND / CC-BY-NC-ND (ProPublica, The Conversation) | May be archived for research; not modified; not redistributed commercially. |
| IETF RFCs (RFC 5378 Trust provisions) | Full text archived (royalty-free license). |
| arXiv OA submissions | Landing page + abstract archived. Full PDF subject to author license. |
| All-rights-reserved journalism (Reuters, AP, BBC, NPR, Guardian, Science News, Stat News) | **NOT archived.** Metadata + lawful short excerpts only. |
| Publisher OA (Nature Communications, NEJM OA, Science OA) | May be archived under publisher OA terms. |

No paywalls, logins, or technical protection measures were bypassed.

---

## 13. Reproducibility

The pack is fully reproducible from:

1. The 5 candidate JSON files in `metadata/candidates-*.json` (produced by 5 parallel discovery subagents using `z-ai web_search` on 2025-08-22).
2. The build scripts in `metadata/`:
   - `_curate.py` → produces `_curated.json` (selectionStatus for all 200 candidates).
   - `_build_index.py` → produces `source-index.json` + `source-evaluation.csv`.
   - `_build_claims.py` → produces `claim-inventory.jsonl`.
   - `_build_matrix.py` → produces `validation-opportunity-matrix.csv`.
   - `_build_reports.py` → produces `diversity-report.md`, `licensing-report.md`, `source-gaps.md`.

To rebuild from scratch:

```bash
cd sources/nonfiction-v1/metadata
python3 _curate.py
python3 _build_index.py
python3 _build_claims.py
python3 _build_matrix.py
python3 _build_reports.py
```

---

## 14. Downstream Consumption Contract

```
SOURCE PACK (sources/nonfiction-v1/)
    ↓ consumed by
CLAIM INVENTORY (claim-inventory.jsonl)
    ↓ consumed by
SOURCE FACT LEDGER (Phase 3A — NOT this pack)
    ↓ consumed by
NONFICTION GOLDEN CORPUS (Phase 3B — NOT this pack)
    ↓ consumed by
SOURCE-CONSTRAINED VALIDATOR (Phase 3C — NOT this pack)
    ↓ consumed by
REGISTER PACKS (Phase 3D — NOT this pack)
```

This pack stops at the **Claim Inventory + Validation Opportunity Matrix + Diversity/Licensing/Gap reports** stage. It does NOT implement any downstream stage.

---

## 15. Integrity Guarantees

- Every URL traces back to a real `z-ai web_search` result. **No URLs were fabricated.**
- Every title is the search-result `name` (possibly refined by a follow-up search to a specific document). **No titles were fabricated.**
- Every quality score was assigned by a discovery subagent based on snippet content + publisher reputation.
- The curation logic is deterministic and open in `_curate.py`.
- The claim inventory distinguishes `snippet-verified` / `widely-cited` / `pending-verification` provenance for every claim.

---

## 16. Out-of-Scope (frozen for v1)

The following are explicitly out-of-scope for v1:

- implementing SourceFactLedger;
- implementing Nonfiction Mode;
- running the Nonfiction semantic benchmark;
- modifying Writing OS v1, the Fiction system, the Constitution, or the Writing Bible;
- merging this branch into `main` or `integration/writing-os-v1`;
- archiving copyrighted material in full;
- bypassing any paywall or technical protection measure.

---

## 17. Versioning

- **v1** (this pack): frozen on `research/nonfiction-source-pack-v1`.
- **v1.1** (future): address GAP-001 through GAP-010 (see `source-gaps.md`); add non-Western sources, more causal-inference sources, and CSV datasets.
- **v2** (future): expand to 100+ selected sources and a 500+ claim inventory once Phase 3A has validated the first SourceFactLedger prototype.

---

*End of specification.*
