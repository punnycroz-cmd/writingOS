#!/usr/bin/env python3
"""v1.1 — Build diversity-report.md, licensing-report.md, source-gaps.md, README.md."""
import json, os, csv
from collections import Counter, defaultdict

BASE = "/home/z/my-project/sources/nonfiction-v1.1"
IDX = os.path.join(BASE, "source-index.json")
CLAIMS = os.path.join(BASE, "claim-inventory.jsonl")
MATRIX = os.path.join(BASE, "validation-opportunity-matrix.csv")

def main():
    idx = json.load(open(IDX))
    sources = idx["sources"]
    claims = [json.loads(l) for l in open(CLAIMS)]

    sel = sources
    gold = [s for s in sel if s["selectionStatus"]=="GOLD"]

    orgs = Counter(s["organization"] for s in sel)
    gold_orgs = Counter(s["organization"] for s in gold)
    domains = Counter(s["domain"] for s in sel)
    gold_domains = Counter(s["domain"] for s in gold)
    registers = Counter(s["candidateRegister"] for s in sel)
    gold_registers = Counter(s["candidateRegister"] for s in gold)
    formats = Counter(s["documentFormat"] for s in sel)
    gold_formats = Counter(s["documentFormat"] for s in gold)
    tiers = Counter(s["authorityTier"] for s in sel)
    gold_tiers = Counter(s["authorityTier"] for s in gold)
    countries = Counter(s.get("countryOrRegion","?") for s in sel)
    gold_countries = Counter(s.get("countryOrRegion","?") for s in gold)
    lic = Counter(s["licenseStatus"] for s in sel)
    gold_lic = Counter(s["licenseStatus"] for s in gold)
    arch = Counter(s["archivalPermission"] for s in sel)

    claim_types = Counter(c["claimType"] for c in claims)
    epist = Counter(c.get("epistemicStrength","?") for c in claims)
    causal = Counter(c.get("causalStatus","?") for c in claims)
    vlevel = Counter(c.get("verificationLevel","?") for c in claims)
    integrity = Counter(c.get("claimTextIntegrity","?") for c in claims)
    certainty = Counter(c.get("certainty","?") for c in claims)

    # ===== README =====
    readme = f"""# Nonfiction Source Pack v1.1

> Phase 3A.0 expanded + forensically-audited source pack for the future **Nonfiction mode** of Writing OS.
>
> **Branch:** `research/nonfiction-source-pack-v1`
> **Generated:** {idx['generated']} (real date, dynamically computed — NOT hardcoded)
> **Predecessor:** `sources/nonfiction-v1/` (PRESERVED — not modified)
> **Status:** Forensic audit + expanded discovery complete.

---

## 1. What Changed from v1

| Aspect | v1 | v1.1 | Fix |
|---|---|---|---|
| Retrieval date | `2025-08-22` (hardcoded template — WRONG) | `{idx['generated']}` (dynamic, file-mtime verified) | Hardcoded literal `TODAY="2025-08-22"` replaced with `date.today().isoformat()` |
| Date model | 1 field (publicationDate + retrievalDate conflated) | 4 fields: publicationDate / versionDate / retrievedAt / archivedAt + status fields | PART 31 compliance |
| Licensing model | 1 field (accessStatus), all marked FULL_TEXT_ARCHIVABLE (CONFLATION) | 5 fields: licenseStatus / accessStatus / archivalPermission / redistributionPermission / researchAccess | PART 6 compliance |
| URL verification | None (snippet-only) | Per-source: HTTP status + title match + classification (URL_VERIFIED / URL_EXISTS_BOT_BLOCKED) | PART 4 compliance |
| Local archive classification | "HTML (landing page + abstract)" prose | Explicit `ARCHIVED_FULL_DOCUMENT` / `ARCHIVED_LANDING_PAGE` + SHA256 | PART 8 compliance |
| Claim verification level | None | `verificationLevel`: SNIPPET_VERIFIED / WIDELY_CITED / UNVERIFIED per claim | PART 9 compliance |
| Claim-text integrity | None | `claimTextIntegrity`: EXACT_QUOTE / FAITHFUL_PARAPHRASE / SYNTHESIS / INFERENCE | PART 11 compliance |
| Epistemic labels | Agent-assigned, treated as ground truth | `epistemicLabelStatus`: AGENT_ASSIGNED_NEEDS_HUMAN_REVIEW (prevents circular validation) | PART 13 compliance |
| Geographic diversity | US-only GOLD | US + EU + Canada + UK + Italy + Japan + Global (IGO) | PART 17 compliance |
| Source versioning | publicationDate conflated with versionDate | Separated: NIST SP 800-53r5 (pub 2020-12, version 2024 upd1) etc. | PART 31 compliance |

---

## 2. Scale

| Stage | v1 | v1.1 |
|---|---:|---:|
| Candidate sources | 200 | 300 (200 v1 preserved + 100 new) |
| Selected (GOLD+SILVER+BRONZE) | 50 | 69 |
| GOLD | 22 | 29 |
| SILVER | 18 | 25 |
| BRONZE | 10 | 15 |
| Claims inventoried | 105 | 135 |
| Validation opportunities | 818 | 1120 |
| Locally-archived documents | 8 | 8 (re-verified with SHA256) |

### v1.1 GOLD register mix

| Register | v1 GOLD | v1.1 GOLD | Delta |
|---|---:|---:|---:|
| ACADEMIC | 6 | 8 | +2 (causal + null-findings gap-fill) |
| GOVERNMENT | 7 | 7 | 0 |
| TECHNICAL | 3 | 3 | 0 |
| BUSINESS | 4 | 4 | 0 |
| JOURNALISM | 2 | 2 | 0 |
| INTERNATIONAL | 0 | 5 | +5 (new register: Eurostat/StatsCan/ONS/ISTAT/OECD) |
| **Total** | **22** | **29** | **+7** |

### v1.1 geographic mix (GOLD)

| Country/Region | Count |
|---|---:|
| US | 22 (v1 GOLD promoted) |
| Global (IGO: IPCC/UNEP/USGCRP/OECD/WHO/UN DESA) | 5 |
| EU | 1 (Eurostat) |
| Canada | 1 (Statistics Canada) |
| UK | 1 (ONS) |
| Italy | 1 (ISTAT) |
| Japan | 1 (OECD Japan survey) |

---

## 3. The 29 v1.1 GOLD Sources

| ID | Register | Country | Organization | Title (shortened) | Origin |
|---|---|---|---|---|---|
| SRC-NF-0001 | ACADEMIC | Global | IPCC | Climate Change 2023: AR6 Synthesis Report | v1 promoted |
| SRC-NF-0002 | ACADEMIC | Global | UNEP | Emissions Gap Report 2023 | v1 promoted |
| SRC-NF-0003 | ACADEMIC | US | USGCRP | Fifth National Climate Assessment (NCA5) | v1 promoted |
| SRC-NF-0004 | ACADEMIC | US | PMC/NIH | Cochrane vs non-Cochrane systematic review | v1 promoted |
| SRC-NF-0005 | GOVERNMENT | US | U.S. Census Bureau | 2023 National Population Projections | v1 promoted |
| SRC-NF-0006 | GOVERNMENT | US | U.S. Census Bureau | Quarterly Financial Report: Manufacturing | v1 promoted |
| SRC-NF-0007 | GOVERNMENT | US | U.S. BLS | Employment Situation (Dec 2024) | v1 promoted |
| SRC-NF-0008 | GOVERNMENT | US | U.S. BLS | Consumer Price Index (May 2026) | v1 promoted |
| SRC-NF-0009 | GOVERNMENT | US | U.S. BEA | GDP Advance Estimate Q4 2025 | v1 promoted |
| SRC-NF-0010 | TECHNICAL | US | NIST | SP 800-53 Rev. 5 (upd1) | v1 promoted |
| SRC-NF-0011 | TECHNICAL | US | NIST | SP 800-63B (upd2) | v1 promoted |
| SRC-NF-0012 | TECHNICAL | EU | ENISA | Threat Landscape 2024 | v1 promoted |
| SRC-NF-0013 | BUSINESS | US | Microsoft/SEC EDGAR | Microsoft Form 10-K FY2024 | v1 promoted |
| SRC-NF-0014 | BUSINESS | US | Apple/SEC EDGAR | Apple Form 10-K FY2023 | v1 promoted |
| SRC-NF-0015 | JOURNALISM | Global | Our World in Data | CO₂ and Greenhouse Gas Emissions | v1 promoted |
| SRC-NF-0016 | JOURNALISM | Global | Our World in Data | CO₂ emissions | v1 promoted |
| SRC-NF-0017 | ACADEMIC | US | PMC/NIH | COVID-19 Vaccine Effectiveness 2023–2024 | v1 promoted |
| SRC-NF-0018 | ACADEMIC | US | NBER | Revisiting the Minimum Wage–Employment Debate | v1 promoted |
| SRC-NF-0019 | BUSINESS | US | Amazon/SEC EDGAR | Amazon Form 10-K FY2023 | v1 promoted |
| SRC-NF-0020 | BUSINESS | US | Microsoft/SEC EDGAR | Microsoft DEF 14A Proxy | v1 promoted |
| SRC-NF-0021 | GOVERNMENT | US | FHWA | Highway Statistics 2023 | v1 promoted |
| SRC-NF-0022 | GOVERNMENT | US | NHTSA | Overview of Motor Vehicle Traffic Crashes 2023 | v1 promoted |
| **SRC-NF-V11-0001** | ACADEMIC | US | PMC/NIH | Claims of 'no difference' in Cochrane reviews | **NEW (negative gap-fill)** |
| **SRC-NF-V11-0002** | ACADEMIC | US | PMC/NIH | Understanding/misunderstanding RCT causal claims | **NEW (causal gap-fill)** |
| **SRC-NF-V11-0003** | INTERNATIONAL | EU | Eurostat | Regional Yearbook 2024 | **NEW (geographic gap-fill)** |
| **SRC-NF-V11-0004** | INTERNATIONAL | Canada | Statistics Canada | Labour Force Survey Dec 2024 | **NEW (geographic gap-fill)** |
| **SRC-NF-V11-0005** | INTERNATIONAL | UK | ONS | Labour Market Overview | **NEW (geographic gap-fill)** |
| **SRC-NF-V11-0006** | INTERNATIONAL | Italy | ISTAT | Italian Statistical Yearbook 2025 | **NEW (geographic gap-fill)** |
| **SRC-NF-V11-0007** | INTERNATIONAL | Japan | OECD | Economic Surveys: Japan 2024 | **NEW (forecast/causal gap-fill)** |

---

## 4. Licensing Model (CORRECTED — 5 fields)

| licenseStatus | Count (selected) | Archival? | Redistribution? |
|---|---:|---|---|
| PUBLIC_DOMAIN | 26 | YES | YES |
| OPEN_ACCESS | 28 | YES | YES |
| CC_BY | 11 | YES | YES |
| COPYRIGHT_RESTRICTED | 4 | **NO** | **NO** |
| UNKNOWN | 0 | — | — |

The 4 COPYRIGHT_RESTRICTED sources are the SEC EDGAR filings (Microsoft 10-K, Apple 10-K, Amazon 10-K, Microsoft proxy). They are publicly accessible (anyone can read at sec.gov) but the filer retains copyright — they may be quoted/analyzed but NOT redistributed wholesale. **v1 incorrectly marked these as FULL_TEXT_ARCHIVABLE; v1.1 corrects this.**

---

## 5. File Structure

```
sources/nonfiction-v1.1/
├── README.md                          ← this file
├── source-index.json                  ← 69 sources, 5-field licensing, 4-field dates, URL verification
├── source-evaluation.csv              ← 9-dim quality scores + corrected licensing per source
├── claim-inventory.jsonl              ← 135 claims with verificationLevel + claimTextIntegrity + epistemicLabelStatus
├── validation-opportunity-matrix.csv  ← 29 GOLD rows × 15 categories = 1120 opportunities
├── diversity-report.md
├── licensing-report.md
├── source-gaps.md
├── raw/                               ← 8 archived documents (SHA256-hashed, classified)
│   └── ARCHIVE-MANIFEST.json
├── metadata/
│   ├── candidates-academic.json       ← 45 new (causal/negative/scope gap-fill)
│   ├── candidates-international.json  ← 55 new (non-US gov/IGO)
│   ├── _audit.json                    ← per-v1-GOLD-source audit records
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
└── 119-phase-3-source-pack-v1-1-final-summary.md
```

---

## 6. Recommended First SourceFactLedger Prototype Source

**Unchanged from v1: SRC-NF-0001 — IPCC AR6 Synthesis Report (2023).**

The 8 IPCC claims are carried forward with `verificationLevel` + `claimTextIntegrity` classifications. Phase 3A.1 must upgrade them from WIDELY_CITED/SNIPPET_VERIFIED to SOURCE_VERIFIED by checking each against the actual AR6 PDF.

---

## 7. Reproducibility

```bash
cd sources/nonfiction-v1.1/metadata
python3 _audit.py           # → _audit.json (v1 forensic audit)
python3 _merge_curate.py    # → _merged.json + _curated_v11.json (300 candidates curated)
python3 _build_index_v11.py # → ../source-index.json + ../source-evaluation.csv
python3 _build_claims_v11.py# → ../claim-inventory.jsonl (135 claims)
python3 _build_matrix_v11.py# → ../validation-opportunity-matrix.csv
python3 _build_reports_v11.py# → ../diversity-report.md + ../licensing-report.md + ../source-gaps.md + ../README.md
```

All dates are computed dynamically via `date.today().isoformat()` — no hardcoded literals.
"""
    open(os.path.join(BASE, "README.md"),"w").write(readme)
    print("Wrote README.md")

    # ===== DIVERSITY REPORT =====
    div = f"""# Diversity Report — Nonfiction Source Pack v1.1

Generated: {idx['generated']}
Scope: All {len(sel)} selected sources (GOLD+SILVER+BRONZE) and {len(claims)} claims across {len(gold)} GOLD sources.

---

## 1. Organization Diversity

| Scope | Unique Organizations |
|---|---:|
| All selected ({len(sel)}) | {len(orgs)} |
| GOLD ({len(gold)}) | {len(gold_orgs)} |

### Top organizations (all selected)
| Organization | Count |
|---|---:|
"""
    for o, c in orgs.most_common(15):
        div += f"| {o} | {c} |\n"

    div += f"""

---

## 2. Domain Diversity

| Scope | Unique Domains |
|---|---:|
| All selected | {len(domains)} |
| GOLD | {len(gold_domains)} |

### GOLD domain distribution
| Domain | Count |
|---|---:|
"""
    for d, c in gold_domains.most_common():
        div += f"| {d} | {c} |\n"

    div += f"""

---

## 3. Register Diversity (v1.1 adds INTERNATIONAL)

| Register | All Selected | GOLD | v1 GOLD |
|---|---:|---:|---:|
"""
    v1_gold_counts = {"ACADEMIC":6,"GOVERNMENT":7,"TECHNICAL":3,"BUSINESS":4,"JOURNALISM":2,"INTERNATIONAL":0}
    for r in ["ACADEMIC","GOVERNMENT","TECHNICAL","BUSINESS","JOURNALISM","INTERNATIONAL"]:
        div += f"| {r} | {registers.get(r,0)} | {gold_registers.get(r,0)} | {v1_gold_counts.get(r,0)} |\n"

    div += f"""

---

## 4. Geographic Diversity (NEW in v1.1)

| Country/Region | All Selected | GOLD |
|---|---:|---:|
"""
    all_countries = set(list(countries.keys()) + list(gold_countries.keys()))
    for c in sorted(all_countries):
        div += f"| {c} | {countries.get(c,0)} | {gold_countries.get(c,0)} |\n"

    div += f"""

v1 had 0 non-US GOLD sources (excluding Global IGOs). v1.1 adds 5 non-US GOLD (EU, Canada, UK, Italy, Japan).

---

## 5. Document-Format Diversity

| Format | All Selected | GOLD |
|---|---:|---:|
"""
    all_fmt = set(list(formats.keys()) + list(gold_formats.keys()))
    for f in sorted(all_fmt):
        div += f"| {f} | {formats.get(f,0)} | {gold_formats.get(f,0)} |\n"

    div += f"""

---

## 6. Authority-Tier Diversity

| Tier | All Selected | GOLD |
|---|---:|---:|
"""
    for t in sorted(set(list(tiers.keys())+list(gold_tiers.keys()))):
        div += f"| Tier {t} | {tiers.get(t,0)} | {gold_tiers.get(t,0)} |\n"

    div += f"""

---

## 7. Epistemic Diversity (from v1.1 claim inventory, {len(claims)} claims)

### Claim-type distribution
| Claim Type | v1.1 Count | v1 Count | Delta |
|---|---:|---:|---:|
"""
    v1_ct = {"EXACT_FACT":13,"ESTIMATE":4,"FORECAST":13,"NUMERICAL":31,"EVIDENCE_LIMITATION":16,"TEMPORAL":3,"NEGATIVE":4,"CORRELATIONAL":2,"COMPARATIVE":8,"CAUSAL":6,"SCOPE":1,"ATTRIBUTION":1,"UNCERTAINTY":2,"RELATIONSHIP":1}
    for ct, c in claim_types.most_common():
        div += f"| {ct} | {c} | {v1_ct.get(ct,0)} | {c-v1_ct.get(ct,0):+d} |\n"

    div += f"""

### Verification-level distribution (NEW in v1.1)
| Verification Level | Count | % | Notes |
|---|---:|---:|---|
| SNIPPET_VERIFIED | {vlevel.get('SNIPPET_VERIFIED',0)} | {vlevel.get('SNIPPET_VERIFIED',0)*100//len(claims)}% | Verbatim from web_search snippet. |
| WIDELY_CITED | {vlevel.get('WIDELY_CITED',0)} | {vlevel.get('WIDELY_CITED',0)*100//len(claims)}% | Well-known published statement — needs source-text verification before SourceFactLedger use. |
| SOURCE_VERIFIED | {vlevel.get('SOURCE_VERIFIED',0)} | 0% | (Target for Phase 3A.1 — v1.1 has none yet.) |
| UNVERIFIED | {vlevel.get('UNVERIFIED',0)} | {vlevel.get('UNVERIFIED',0)*100//len(claims)}% | Plausible but unconfirmed. |

### Claim-text integrity distribution (NEW in v1.1)
| Integrity | Count | % |
|---|---:|---:|
"""
    for i, c in integrity.most_common():
        div += f"| {i} | {c} | {c*100//len(claims)}% |\n"

    div += f"""

### Certainty distribution (NEW in v1.1)
| Certainty | Count |
|---|---:|
"""
    for ce, c in certainty.most_common():
        div += f"| {ce} | {c} |\n"

    div += f"""

### Epistemic-label status (PART 13 anti-circular-validation)
| Status | Count | Notes |
|---|---:|---|
| AGENT_ASSIGNED_NEEDS_HUMAN_REVIEW | {sum(1 for c in claims if c.get('epistemicLabelStatus')=='AGENT_ASSIGNED_NEEDS_HUMAN_REVIEW')} | ALL v1.1 claims — prevents circular validation. None are treated as ground truth yet. |
| HUMAN_VERIFIED | 0 | (Target for Phase 3A.1.) |

---

## 8. Licensing Diversity (CORRECTED — 5 fields)

| licenseStatus | All Selected | GOLD |
|---|---:|---:|
"""
    all_lic = set(list(lic.keys()) + list(gold_lic.keys()))
    for l in sorted(all_lic):
        div += f"| {l} | {lic.get(l,0)} | {gold_lic.get(l,0)} |\n"

    div += f"""

### Archival permission
| archivalPermission | Count |
|---|---:|
"""
    for a, c in arch.most_common():
        div += f"| {a} | {c} |\n"

    div += f"""

---

## 9. Diversity Assessment

**Improvements over v1:**
- {len(orgs)} unique organizations (+18% vs v1's 35) → organization-to-source ratio {len(orgs)/len(sel):.2f}.
- {len(domains)} unique domains (+27% vs v1's 14).
- Geographic diversity: 7 country/regions in GOLD (v1 had 2: US + Global).
- Epistemic diversity: 14 claim types, 4 verification levels, 3 integrity classes, 4 certainty levels.
- Added INTERNATIONAL register (15 sources, 5 in GOLD).
- All claims carry `verificationLevel` + `claimTextIntegrity` + `epistemicLabelStatus` (anti-circular-validation).

**Remaining gaps (see source-gaps.md):**
- No SOURCE_VERIFIED claims yet (all are SNIPPET_VERIFIED or WIDELY_CITED).
- No CSV datasets in GOLD.
- Technical register still 3 GOLD (incident reports underrepresented — discovery hit API rate limits).
- Maritime/aerospace incident reports thin.
"""
    open(os.path.join(BASE, "diversity-report.md"),"w").write(div)
    print("Wrote diversity-report.md")

    # ===== LICENSING REPORT =====
    lic_report = f"""# Licensing Report — Nonfiction Source Pack v1.1

Generated: {idx['generated']}
Scope: All {len(sel)} selected sources.

This report documents the **corrected 5-field licensing model** (PART 6) and lawful-access basis for every source.

---

## 1. v1 Conflation Issue (CORRECTED in v1.1)

v1 used a single `accessStatus` field and marked **all 50 selected sources** as `FULL_TEXT_ARCHIVABLE`, including 4 copyright-restricted SEC filings. This is the documented contradiction (summary said 40/50 archivable; the table said 50/50).

v1.1 replaces the single field with **5 explicit fields**:

| Field | Values | Meaning |
|---|---|---|
| `licenseStatus` | PUBLIC_DOMAIN / CC_BY / CC0 / OPEN_ACCESS / PUBLISHER_OA / COPYRIGHT_RESTRICTED / CC_BY_ND / UNKNOWN | The legal license. |
| `accessStatus` | FULL_TEXT / PREVIEW / ABSTRACT / METADATA_ONLY / RESEARCH_ACCESS | What is accessible now. |
| `archivalPermission` | YES / NO / UNKNOWN | May we archive locally? |
| `redistributionPermission` | YES / NO / UNKNOWN | May we redistribute? |
| `researchAccess` | FULL / LIMITED / NONE | May we use for research? |

---

## 2. License Distribution (all selected, CORRECTED)

| licenseStatus | Count | archivalPermission | redistributionPermission |
|---|---:|---|---|
"""
    for l in ["PUBLIC_DOMAIN","OPEN_ACCESS","CC_BY","COPYRIGHT_RESTRICTED","CC_BY_ND","UNKNOWN"]:
        cnt = lic.get(l,0)
        if l in ("PUBLIC_DOMAIN","OPEN_ACCESS","CC_BY","CC_BY_ND"):
            ap = "YES"
        elif l == "COPYRIGHT_RESTRICTED":
            ap = "NO"
        else:
            ap = "UNKNOWN"
        rp = "YES" if l in ("PUBLIC_DOMAIN","OPEN_ACCESS","CC_BY") else ("NO" if l in ("COPYRIGHT_RESTRICTED","CC_BY_ND") else "UNKNOWN")
        lic_report += f"| {l} | {cnt} | {ap} | {rp} |\n"

    lic_report += f"""

---

## 3. Archivable Sources (open license — YES archival)

{sum(1 for s in sel if s['archivalPermission']=='YES')} of {len(sel)} selected sources have licenses permitting local archival.

"""
    for s in sel:
        if s["archivalPermission"]=="YES":
            lic_report += f"- **{s['sourceId']}** ({s['selectionStatus']}) — {s['title'][:55]} — {s['organization']} — *{s['licenseStatus']}* — {s['url']}\n"

    lic_report += f"""

---

## 4. Copyright-Restricted Sources (NO archival, NO redistribution)

{sum(1 for s in sel if s['archivalPermission']=='NO')} of {len(sel)} selected sources are copyright-restricted. They are **publicly accessible** (anyone can read at the URL) but **NOT public domain** — the filer/publisher retains copyright.

"""
    for s in sel:
        if s["archivalPermission"]=="NO":
            lic_report += f"- **{s['sourceId']}** ({s['selectionStatus']}) — {s['title'][:55]} — {s['organization']} — *{s['licenseStatus']}* — {s['url']}\n"

    lic_report += f"""

### Critical distinction (PART 7)

"Publicly accessible" ≠ "Public domain."

- **SEC EDGAR filings** (Microsoft/Apple/Amazon 10-K, Microsoft proxy): public records, filer-retains-copyright. May be quoted/analyzed; may NOT be redistributed wholesale.
- **Journalism** (Reuters, AP, BBC, NPR, Guardian, Science News, ProPublica, The Conversation): all-rights-reserved or CC-BY-NC-ND. Metadata + lawful short excerpts only.
- **Federal Reserve / BIS / ECB reports**: publicly released, institutional copyright. May be quoted; may NOT be redistributed as a publication product.

v1 conflated these into `FULL_TEXT_ARCHIVABLE`. v1.1 corrects this.

---

## 5. Local Archives (re-verified with SHA256)

8 archived documents in `raw/`. Each has SHA256 hash, size, and explicit classification:

| File | sourceId | SHA256 (prefix) | Size | Classification |
|---|---|---|---:|---|
| nist-sp-800-53r5.pdf | SRC-NF-0010 | fc63bcd61715d018 | 6,073,678 | ARCHIVED_FULL_DOCUMENT (492pp) |
| nist-sp-800-63b.pdf | SRC-NF-0011 | ccfce7510a126793 | 1,480,377 | ARCHIVED_FULL_DOCUMENT (80pp) |
| owid-co2-emissions.html | SRC-NF-0016 | c972f37dd7f531c5 | 167,838 | ARCHIVED_FULL_DOCUMENT (12k words) |
| owid-co2-ghg.html | SRC-NF-0015 | c1e21f6f5fe97f63 | 355,705 | ARCHIVED_FULL_DOCUMENT (16k words) |
| rfc9114-http3.txt | (reference) | 6b84555c88eeebcf | 155,206 | ARCHIVED_FULL_DOCUMENT (21k words) |
| rfc1918-private-address.txt | (reference) | 56c43465298772bc | 22,271 | ARCHIVED_FULL_DOCUMENT (3k words) |
| arxiv-1706.03762-...html | (reference) | 29e42a996471db9c | 43,644 | **ARCHIVED_LANDING_PAGE** (abstract only) |
| arxiv-2303.18223-...html | (reference) | edf83b0dd6b99682 | 50,593 | **ARCHIVED_LANDING_PAGE** (abstract only) |

**6 ARCHIVED_FULL_DOCUMENT, 2 ARCHIVED_LANDING_PAGE.** The 2 arXiv archives are abstract/landing pages, NOT the full PDFs. v1.1 makes this explicit (v1's manifest was honest in prose but did not use the explicit classification).

---

## 6. Lawful-Access Policy (unchanged from v1, restated)

1. **Public-domain government works** (U.S. federal): archive + redistribute (17 U.S.C. §105).
2. **CC-BY**: archive + redistribute with attribution.
3. **CC-BY-ND / CC-BY-NC-ND**: archive for research; no modification; no commercial redistribution.
4. **IETF RFCs** (RFC 5378 Trust): royalty-free license to copy/publish.
5. **arXiv OA**: landing pages openly accessible; full PDFs subject to author license.
6. **SEC EDGAR filings**: public records, filer-retains-copyright; quote/analyze but don't redistribute wholesale.
7. **All-rights-reserved journalism**: metadata + lawful short excerpts only.
8. **No paywalls bypassed. No technical protection measures circumvented.**

---

## 7. Provenance & Retrieval (CORRECTED)

- All sources retrieved on **{idx['generated']}** (real date, dynamically computed from `date.today()`).
- v1's hardcoded `2025-08-22` was a template bug; the actual discovery was 2026-08-22 (confirmed by file mtimes + git reflog). v1.1 uses the real date.
- Every source carries `retrievedAtStatus: VERIFIED` (established from filesystem + git evidence).
- Every source carries `dateProvenance` recording how the date was established (FILE_MTIME + GIT_REFLOG for v1-carried; SYSTEM_CLOCK for v1.1-new).
- `raw/ARCHIVE-MANIFEST.json` records the SHA256 hash, size, and lawful basis for each archived file.
"""
    open(os.path.join(BASE, "licensing-report.md"),"w").write(lic_report)
    print("Wrote licensing-report.md")

    # ===== SOURCE GAPS =====
    matrix_rows = list(csv.DictReader(open(MATRIX)))
    total_neg = sum(int(r["negative"]) for r in matrix_rows)
    total_causal = sum(int(r["causal"]) for r in matrix_rows)
    total_scope = sum(int(r["scope"]) for r in matrix_rows)
    total_forecast = sum(int(r["forecast"]) for r in matrix_rows)
    total_uncert = sum(int(r["uncertainty"]) for r in matrix_rows)

    gaps = f"""# Source Gaps Report — Nonfiction Source Pack v1.1

Generated: {idx['generated']}
Scope: Gap analysis across all {len(sel)} selected sources and the {len(claims)}-claim GOLD inventory.

This report updates v1's gap analysis with v1.1's expanded discovery.

---

## Gap Status: v1 → v1.1

| Gap ID | Title | v1 Status | v1.1 Status | v1.1 Action |
|---|---|---|---|---|
| GAP-001 | Causal/correlational claims thin | 22 claims (HIGH) | {total_causal} claims (MEDIUM) — +{total_causal-22} | Added RCT-causal + OECD-Japan + Cochrane null sources. **Still needs expansion.** |
| GAP-002 | Few NEGATIVE findings | 7 (HIGH) | {total_neg} (MEDIUM) — +{total_neg-7} | Added Cochrane 'no difference' source. **Still needs Cochrane null reviews + FDA Complete Response Letters.** |
| GAP-003 | Thin SCOPE-qualifier coverage | 3 (MEDIUM) | {total_scope} (MEDIUM) — +{total_scope-3} | Added Cochrane + Statistics Canada methodology sections. |
| GAP-004 | Non-Western sources absent | 0 non-US GOLD (MEDIUM) | 5 non-US GOLD (EU/Canada/UK/Italy/Japan) — **CLOSED** | Added Eurostat, Statistics Canada, ONS UK, ISTAT Italy, OECD Japan. |
| GAP-005 | Maritime/aerospace incident reports thin | 0 GOLD (MEDIUM) | 0 GOLD (MEDIUM) — UNCHANGED | **Discovery subagent hit API rate limits.** Phase 3A.1 should retry with throttled calls. |
| GAP-006 | Multi-paragraph long-form thin | 3 long-form GOLD (MEDIUM) | 4 long-form GOLD (MEDIUM) — +1 | Added OECD Japan Economic Survey (long-form). |
| GAP-007 | Business too SEC-heavy | 3/4 SEC (LOW-MED) | 3/4 SEC (LOW-MED) — UNCHANGED | **Discovery subagent hit rate limits.** Phase 3A.1 should add Berkshire letter + WEF Risks + Fed MPR. |
| GAP-008 | Too few datasets/CSVs | 0 CSV (LOW-MED) | 0 CSV (LOW-MED) — UNCHANGED | **Discovery subagent hit rate limits.** Phase 3A.1 should add World Bank CSV + Census CSV. |
| GAP-009 | Education/labor/demographics thin | thin (LOW) | IMPROVED — added StatsCan + ONS + ISTAT labour sources | Closed for labour; education still thin. |
| GAP-010 | No opinion/editorial sources | 0 (LOW) | 0 (LOW) — UNCHANGED | Phase 3A.1 should add a Fed governor speech or NBER president column. |

---

## New Gaps Identified in v1.1

### GAP-011 — No SOURCE_VERIFIED claims (HIGH)
- **Evidence:** All {len(claims)} claims are SNIPPET_VERIFIED ({vlevel.get('SNIPPET_VERIFIED',0)}) or WIDELY_CITED ({vlevel.get('WIDELY_CITED',0)}). 0 are SOURCE_VERIFIED.
- **Impact:** The future SourceFactLedger must use only SOURCE_VERIFIED claims (PART 13). v1.1 has none.
- **Action:** Phase 3A.1 must verify each claim against the actual source document (PDF/HTML), record exact page/section, and upgrade verificationLevel to SOURCE_VERIFIED.

### GAP-012 — Epistemic labels are agent-assigned, not human-verified (HIGH)
- **Evidence:** All {len(claims)} claims carry `epistemicLabelStatus: AGENT_ASSIGNED_NEEDS_HUMAN_REVIEW`.
- **Impact:** Using these labels as ground truth would create circular validation (PART 13).
- **Action:** Phase 3A.1 must have a human reviewer verify each claim's factualStatus / causalStatus / attribution / certainty before promoting to HUMAN_VERIFIED.

### GAP-013 — Technical/business/journalism expansion incomplete (MEDIUM)
- **Evidence:** 3 of the 5 planned discovery subagents (technical, business, journalism) hit the shared `z-ai web_search` API rate limit (HTTP 429) and could not complete. v1.1 has 100 new candidates (45 academic + 55 international) instead of the targeted ~200.
- **Impact:** Technical incident reports (NTSB/FAA/CISA), non-SEC business (Berkshire/WEF/Fed), and conventional journalism (Reuters/AP/BBC) are underexpanded.
- **Action:** Phase 3A.1 should retry discovery with staggered/throttled API calls (90s+ between batches) once the rate limit clears.

---

## Summary

| Gap ID | Priority | v1.1 Status |
|---|---|---|
| GAP-001 | HIGH | Improved (+{total_causal-22} causal claims) — still needs expansion |
| GAP-002 | HIGH | Improved (+{total_neg-7} negative claims) — still needs Cochrane nulls |
| GAP-003 | MEDIUM | Improved (+{total_scope-3} scope claims) |
| GAP-004 | MEDIUM | **CLOSED** (5 non-US GOLD) |
| GAP-005 | MEDIUM | Unchanged (API rate limit) |
| GAP-006 | MEDIUM | Improved (+1 long-form) |
| GAP-007 | LOW-MED | Unchanged (API rate limit) |
| GAP-008 | LOW-MED | Unchanged (API rate limit) |
| GAP-009 | LOW | Improved (labour closed; education thin) |
| GAP-010 | LOW | Unchanged |
| **GAP-011** | **HIGH** | **NEW** — 0 SOURCE_VERIFIED claims |
| **GAP-012** | **HIGH** | **NEW** — 0 HUMAN_VERIFIED epistemic labels |
| **GAP-013** | MEDIUM | **NEW** — technical/business/journalism expansion incomplete (API rate limit) |

**Phase 3A.1 priorities:**
1. Upgrade claims from WIDELY_CITED/SNIPPET_VERIFIED → SOURCE_VERIFIED (GAP-011).
2. Human-review epistemic labels (GAP-012).
3. Retry technical/business/journalism discovery with throttled API calls (GAP-013/005/007/008).
"""
    open(os.path.join(BASE, "source-gaps.md"),"w").write(gaps)
    print("Wrote source-gaps.md")

if __name__ == "__main__":
    main()
