# Deliverable 120: Nonfiction Source Pack v1.1 Delivery & Verification Report

**Branch:** `research/nonfiction-source-pack-v1.1`  
**Date:** 2026-08-22  
**Status:** `NONFICTION_SOURCE_PACK_V1_1_DELIVERED`  
**Corpus Nature:** `DISCOVERY_CORPUS` (Contains Ground Truth: `false`)

---

## 1. Executive Summary

The **Nonfiction Source Pack v1.1** has been delivered to GitHub as a dedicated research artifact on branch `research/nonfiction-source-pack-v1.1`.

This pack represents a curated, domain-diverse **discovery corpus** of 69 sources and 135 candidate claims across government, academic, technical, business, and journalism registers. It provides the structured foundation for upcoming SourceFactLedger and Nonfiction Mode development, while maintaining strict transparency that line-by-line source verification is a future phase.

---

## 2. Core Metrics & Verification Breakdown

| Dimension | Category / Metric | Count | Notes |
|---|---|---|---|
| **Sources** | Total Selected Sources | **69** | 29 GOLD, 25 SILVER, 15 BRONZE |
| | `URL_VERIFIED` | **17** | Directly confirmed reachable (200 OK + matching title) |
| | `URL_EXISTS_BOT_BLOCKED` | **5** | Resolvable domain, automated crawler blocked |
| | `UNVERIFIED` | **47** | Discovered via search snippet, full text pending retrieval |
| | `SOURCE_VERIFIED` | **0** | No source has complete verified primary alignment |
| **Claims** | Total Candidate Claims | **135** | Extracted from selected sources |
| | `SOURCE_VERIFIED` | **0** | No claims are marked ground truth |
| | `SNIPPET_VERIFIED` | **17** | Verified from primary fetch snippet |
| | `WIDELY_CITED` | **118** | High-authority candidate facts |
| **Licensing** | `OPEN_ACCESS` | **28** | Permitted for local research archive |
| | `PUBLIC_DOMAIN` | **26** | US Federal / Intergovernmental publications |
| | `CC_BY` | **11** | Open license with attribution |
| | `COPYRIGHT_RESTRICTED` | **4** | Metadata & lawful short excerpts only (no raw PDFs) |

---

## 3. Delivery Directory Structure (`research/nonfiction-source-pack-v1.1/`)

```text
research/nonfiction-source-pack-v1.1/
├── DELIVERY-MANIFEST.json          # High-level delivery summary & verification counts
├── DELIVERY-INVENTORY.json         # SHA256 checksums and file sizes for every delivered artifact
├── DELIVERY-README.md             # Public overview and negative scope specification
├── PACK-MANIFEST.json             # Canonical pack manifest
├── docs/                          # Phase 3 source pack reports (105-110, 114-119)
│   └── nonfiction/                # Final audit reports
└── source-pack/                   # Curated metadata, reports, and raw open sources
    ├── source-index.json          # 69 selected sources with full metadata
    ├── claim-inventory.jsonl      # 135 candidate claims
    ├── source-evaluation.csv      # Source quality scoring matrix
    ├── validation-opportunity-matrix.csv
    ├── diversity-report.md
    ├── licensing-report.md
    ├── source-gaps.md
    ├── README.md
    ├── metadata/                  # Builder scripts and raw candidate pools
    └── raw/                       # 8 permitted open-access source documents
```

---

## 4. Security & Isolation Audit

- **Excluded Private Files:** Zero `.env` files, `.zscripts/`, credentials, or private workspace artifacts were packaged.
- **Credential Scan:** 0 tokens, API keys, or PATs present in the delivered artifacts.
- **License Integrity:** Copyright-restricted sources contain only URLs and lawful metadata; no full copyrighted PDFs are redistributed.

---

## 5. Next Intended Phase

1. Ingest full-text content for the 47 unverified sources.
2. Complete claim verification across all 135 claims against primary source text.
3. Construct the canonical `SourceFactLedger` for Nonfiction Mode validation.
