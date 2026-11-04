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

# Licensing Report — Nonfiction Source Pack v1.1

Generated: 2026-08-22
Scope: All 69 selected sources.

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
| PUBLIC_DOMAIN | 26 | YES | YES |
| OPEN_ACCESS | 28 | YES | YES |
| CC_BY | 11 | YES | YES |
| COPYRIGHT_RESTRICTED | 4 | NO | NO |
| CC_BY_ND | 0 | YES | NO |
| UNKNOWN | 0 | UNKNOWN | UNKNOWN |


---

## 3. Archivable Sources (open license — YES archival)

65 of 69 selected sources have licenses permitting local archival.

- **SRC-NF-0001** (GOLD) — Climate Change 2023: AR6 Synthesis Report — Summary for — IPCC — *OPEN_ACCESS* — https://digitallibrary.un.org/record/4008082?ln=en
- **SRC-NF-0002** (GOLD) — Emissions Gap Report 2023: Broken Record — UNEP — *OPEN_ACCESS* — https://www.unep.org/resources/emissions-gap-report-2023
- **SRC-NF-0003** (GOLD) — Fifth National Climate Assessment (NCA5) — USGCRP — *PUBLIC_DOMAIN* — https://toolkit.climate.gov/NCA5
- **SRC-NF-0004** (GOLD) — Comparative analysis of Cochrane and non-Cochrane syste — PMC / NIH — *OPEN_ACCESS* — https://pmc.ncbi.nlm.nih.gov/articles/PMC11064235
- **SRC-NF-0005** (GOLD) — 2023 National Population Projections Tables: Main Serie — U.S. Census Bureau — *PUBLIC_DOMAIN* — https://www.census.gov/data/tables/2023/demo/popproj/2023-summary-tables.html
- **SRC-NF-0006** (GOLD) — QUARTERLY FINANCIAL REPORT: U.S. MANUFACTURING, MINING, — U.S. Census Bureau — *PUBLIC_DOMAIN* — https://www2.census.gov/econ/qfr/press/qfr244mg.pdf
- **SRC-NF-0007** (GOLD) — Employment Situation News Release - 2024 M13 Results (D — U.S. Bureau of Labor Statistics — *PUBLIC_DOMAIN* — https://www.bls.gov/news.release/archives/empsit_01102025.htm
- **SRC-NF-0008** (GOLD) — Consumer Price Index News Release - 2026 M05 Results (M — U.S. Bureau of Labor Statistics — *PUBLIC_DOMAIN* — https://www.bls.gov/news.release/archives/cpi_06102026.htm
- **SRC-NF-0009** (GOLD) — GDP (Advance Estimate), 4th Quarter and Year 2025 — U.S. Bureau of Economic Analysis — *PUBLIC_DOMAIN* — https://www.bea.gov/news/2026/gdp-advance-estimate-4th-quarter-and-year-2025
- **SRC-NF-0010** (GOLD) — SP 800-53 Rev. 5, Security and Privacy Controls for Inf — NIST — *PUBLIC_DOMAIN* — https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final
- **SRC-NF-0011** (GOLD) — SP 800-63B, Digital Identity Guidelines: Authentication — NIST — *PUBLIC_DOMAIN* — https://csrc.nist.gov/pubs/sp/800/63/b/upd2/final
- **SRC-NF-0012** (GOLD) — ENISA Threat Landscape 2024 — ENISA — *CC_BY* — https://www.enisa.europa.eu/publications/enisa-threat-landscape-2024
- **SRC-NF-0015** (GOLD) — CO₂ and Greenhouse Gas Emissions — Our World in Data — *CC_BY* — https://ourworldindata.org/co2-and-greenhouse-gas-emissions
- **SRC-NF-0016** (GOLD) — CO₂ emissions — Our World in Data — *CC_BY* — https://ourworldindata.org/co2-emissions
- **SRC-NF-0017** (GOLD) — Estimated 2023–2024 COVID-19 Vaccine Effectiveness in A — PMC / NIH — *OPEN_ACCESS* — https://pmc.ncbi.nlm.nih.gov/articles/PMC12199055
- **SRC-NF-0018** (GOLD) — Revisiting the Minimum Wage–Employment Debate (NBER Wor — NBER — *OPEN_ACCESS* — https://www.nber.org/system/files/working_papers/w18681/w18681.pdf
- **SRC-NF-0021** (GOLD) — Highway Statistics 2023 — Federal Highway Administration (FHWA), U.S. DOT — *PUBLIC_DOMAIN* — https://www.fhwa.dot.gov/policyinformation/statistics/2023
- **SRC-NF-0022** (GOLD) — Overview of Motor Vehicle Traffic Crashes in 2023 (DOT  — National Highway Traffic Safety Administration (NHTSA), U.S. DOT — *PUBLIC_DOMAIN* — https://crashstats.nhtsa.dot.gov/Api/Public/ViewPublication/813705
- **SRC-NF-V11-0001** (GOLD) — Claims of 'no difference' or 'no effect' in Cochrane an — PMC / NIH National Library of Medicine — *OPEN_ACCESS* — https://pmc.ncbi.nlm.nih.gov/articles/PMC8165142
- **SRC-NF-V11-0002** (GOLD) — Understanding and misunderstanding randomized controlle — PMC / NIH National Library of Medicine — *OPEN_ACCESS* — https://pmc.ncbi.nlm.nih.gov/articles/PMC6019115
- **SRC-NF-V11-0003** (GOLD) — Eurostat regional yearbook - 2024 edition — Eurostat (European Union) — *CC_BY* — https://ec.europa.eu/eurostat/web/products-flagship-publications/w/ks-ha-24-001
- **SRC-NF-V11-0004** (GOLD) — The Daily - Labour Force Survey, December 2024 — Statistics Canada — *OPEN_ACCESS* — https://www150.statcan.gc.ca/n1/daily-quotidien/250110/dq250110a-eng.htm
- **SRC-NF-V11-0005** (GOLD) — Labour market overview, UK Statistical bulletins — Office for National Statistics (UK) — *OPEN_ACCESS* — https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/bulletins/uklabourmarket/previousreleases
- **SRC-NF-V11-0006** (GOLD) — Italian Statistical Yearbook 2025 - Executive Summary — ISTAT (Italy) — *OPEN_ACCESS* — https://www.istat.it/en/publication/italian-statistical-yearbook-2025-executive-summary
- **SRC-NF-V11-0007** (GOLD) — OECD Economic Surveys: Japan 2024 — OECD — *OPEN_ACCESS* — https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/01/oecd-economic-surveys-japan-2024_9289b572/41e807f9-en.pdf
- **SRC-NF-V11-0008** (SILVER) — THE OREGON HEALTH INSURANCE EXPERIMENT - PMC — PMC / NIH (NBER/QJE) — *OPEN_ACCESS* — https://pmc.ncbi.nlm.nih.gov/articles/PMC3535298
- **SRC-NF-V11-0009** (SILVER) — Moving to Opportunity: an Experimental Study of  - PMC — PMC / NIH (American Journal of Public Health) — *OPEN_ACCESS* — https://pmc.ncbi.nlm.nih.gov/articles/PMC1448013
- **SRC-NF-V11-0010** (SILVER) — Estimating the reproducibility of psychological science — AAAS / Science — *OPEN_ACCESS* — https://www.science.org/doi/10.1126/science.aac4716
- **SRC-NF-V11-0011** (SILVER) — Evaluating the replicability of social science experime — Nature Human Behaviour — *OPEN_ACCESS* — https://www.nature.com/articles/s41562-018-0399-z
- **SRC-NF-V11-0012** (SILVER) — PRISMA 2020 checklist — PRISMA Statement Group — *OPEN_ACCESS* — https://www.prisma-statement.org/prisma-2020-checklist
- **SRC-NF-V11-0013** (SILVER) — World Population Prospects 2024 — UN DESA Population Division — *CC_BY* — https://population.un.org/wpp
- **SRC-NF-V11-0014** (SILVER) — REPORT 2023/2024 | Human Development Reports (PDF) — United Nations Development Programme (UNDP) — *CC_BY* — https://hdr.undp.org/system/files/documents/global-report-document/hdr2023-24reporten.pdf
- **SRC-NF-V11-0015** (SILVER) — World health statistics 2024 — World Health Organization — *OPEN_ACCESS* — https://www.who.int/publications/b/74273
- **SRC-NF-V11-0016** (SILVER) — World malaria report 2024 — World Health Organization — *OPEN_ACCESS* — https://www.who.int/teams/global-malaria-programme/reports/world-malaria-report-2024
- **SRC-NF-V11-0017** (SILVER) — Food Outlook - Biannual report on global food markets ( — Food and Agriculture Organization (FAO) — *CC_BY* — https://www.fao.org/markets-and-trade/news-and-events/events-detail/food-outlook-november-2024/en
- **SRC-NF-0036** (SILVER) — NIST SP 800-171 Rev. 3, Protecting Controlled Unclassif — NIST — *PUBLIC_DOMAIN* — https://csrc.nist.gov/pubs/sp/800/171/r3/final
- **SRC-NF-0037** (SILVER) — [PDF] ENISA THREAT LANDSCAPE 2025 — ENISA — *CC_BY* — https://www.enisa.europa.eu/sites/default/files/2026-01/ENISA%20Threat%20Landscape%202025_v1.2.pdf
- **SRC-NF-0038** (SILVER) — Web Content Accessibility Guidelines (WCAG) 2.2 — W3C — *CC_BY* — https://www.w3.org/TR/WCAG22
- **SRC-NF-0039** (SILVER) — NASA Systems Engineering Handbook — NASA — *PUBLIC_DOMAIN* — https://ntrs.nasa.gov/citations/20170001761
- **SRC-NF-0048** (SILVER) — UAM Airspace Research Roadmap - Rev. 2.0 — NASA — *PUBLIC_DOMAIN* — https://ntrs.nasa.gov/citations/20230002647
- **SRC-NF-V11-0018** (SILVER) — BIS Annual Economic Report 2024 — Bank for International Settlements — *OPEN_ACCESS* — https://www.bis.org/publ/arpdf/ar2024e.htm
- **SRC-NF-V11-0019** (SILVER) — Bank of England Financial Stability Report, November 20 — Bank of England — *OPEN_ACCESS* — https://www.bankofengland.co.uk/financial-stability-report/2024/november-2024
- **SRC-NF-V11-0020** (SILVER) — The Global Risks Report 2024, 19th Edition — World Economic Forum — *OPEN_ACCESS* — https://www.weforum.org/publications/global-risks-report-2024
- **SRC-NF-V11-0021** (SILVER) — The Future of Jobs Report 2025 — World Economic Forum — *OPEN_ACCESS* — https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf
- **SRC-NF-0031** (SILVER) — Employee Benefits in the United States, March 2024 — U.S. Bureau of Labor Statistics — *PUBLIC_DOMAIN* — https://www.bls.gov/ebs/publications/employee-benefits-in-the-united-states-march-2024.htm
- **SRC-NF-V11-0022** (SILVER) — Annual Energy Outlook 2026 — U.S. Energy Information Administration — *PUBLIC_DOMAIN* — https://www.eia.gov/outlooks/aeo
- **SRC-NF-0032** (SILVER) — The Condition of Education 2024 (NCES 2024-144) — National Center for Education Statistics (NCES), IES, U.S. Department of Education — *PUBLIC_DOMAIN* — https://nces.ed.gov/use-work/resource-library/report/compendium/condition-education-2024
- **SRC-NF-0033** (SILVER) — Digest of Education Statistics — National Center for Education Statistics (NCES), IES, U.S. Department of Education — *PUBLIC_DOMAIN* — https://nces.ed.gov/programs/digest
- **SRC-NF-0034** (SILVER) — The State of U.S. Science and Engineering 2024 — National Center for Science and Engineering Statistics (NCSES), National Science Foundation — *PUBLIC_DOMAIN* — https://ncses.nsf.gov/pubs/nsb20243
- **SRC-NF-0040** (SILVER) — NOAA predicts above-normal 2024 Atlantic hurricane seas — NOAA — *PUBLIC_DOMAIN* — https://www.noaa.gov/news-release/noaa-predicts-above-normal-2024-atlantic-hurricane-season
- **SRC-NF-V11-0023** (BRONZE) — Assessing risk of bias due to missing evidence in a met — Cochrane — *OPEN_ACCESS* — https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-13
- **SRC-NF-V11-0024** (BRONZE) — Including non-randomized studies on intervention effect — Cochrane — *OPEN_ACCESS* — https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-24
- **SRC-NF-V11-0025** (BRONZE) — GRADE — Cochrane / GRADE Working Group — *OPEN_ACCESS* — https://www.cochrane.org/learn/courses-and-resources/cochrane-methodology/grade
- **SRC-NF-V11-0026** (BRONZE) — The State of Food Security and Nutrition in the World 2 — FAO (on behalf of UN agencies) — *OPEN_ACCESS* — https://openknowledge.fao.org/handle/20.500.14283/cd1254en
- **SRC-NF-V11-0027** (BRONZE) — World Employment and Social Outlook: Trends 2024 — International Labour Organization (ILO) — *CC_BY* — https://www.ilo.org/publications/flagship-reports/world-employment-and-social-outlook-trends-2024
- **SRC-NF-V11-0028** (BRONZE) — World Education Statistics, 2024 | UNESCO — UNESCO — *CC_BY* — https://www.unesco.org/en/articles/world-education-statistics-2024
- **SRC-NF-V11-0029** (BRONZE) — The economic potential of generative AI: The next produ — McKinsey & Company / McKinsey Global Institute — *OPEN_ACCESS* — https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier
- **SRC-NF-V11-0030** (BRONZE) — McKinsey Technology Trends Outlook 2025 — McKinsey & Company — *OPEN_ACCESS* — https://www.mckinsey.com/~/media/mckinsey/business%20functions/mckinsey%20digital/our%20insights/the%20top%20trends%20in%20tech%202025/mckinsey-technology-trends-outlook-2025.pdf
- **SRC-NF-0035** (BRONZE) — National Vital Statistics Reports (NVSR) - Homepage — National Center for Health Statistics (NCHS), CDC, U.S. Department of Health and Human Services — *PUBLIC_DOMAIN* — https://www.cdc.gov/nchs/products/nvsr.htm
- **SRC-NF-0045** (BRONZE) — Monthly Climate Reports: Global Climate Report — Annual — NOAA National Centers for Environmental Information (NCEI) — *PUBLIC_DOMAIN* — https://www.ncei.noaa.gov/access/monitoring/monthly-report/global/202413
- **SRC-NF-0046** (BRONZE) — Fifth National Climate Assessment (NCA5) — U.S. Global Change Research Program (USGCRP) — NOAA Institutional Repository — *PUBLIC_DOMAIN* — https://repository.library.noaa.gov/view/noaa/61592
- **SRC-NF-0049** (BRONZE) — [PDF] NIST.SP.800-53r5.pdf — NIST — *PUBLIC_DOMAIN* — https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-53r5.pdf
- **SRC-NF-V11-0031** (BRONZE) — [PDF] The NIST Cybersecurity Framework (CSF) 2.0 — NIST — *PUBLIC_DOMAIN* — https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf
- **SRC-NF-V11-0032** (BRONZE) — SP 800-207, Zero Trust Architecture — NIST — *PUBLIC_DOMAIN* — https://csrc.nist.gov/pubs/sp/800/207/final
- **SRC-NF-0050** (BRONZE) — Highly active hurricane season likely to continue in At — NOAA — *PUBLIC_DOMAIN* — https://www.noaa.gov/news-release/highly-active-hurricane-season-likely-to-continue-in-atlantic


---

## 4. Copyright-Restricted Sources (NO archival, NO redistribution)

4 of 69 selected sources are copyright-restricted. They are **publicly accessible** (anyone can read at the URL) but **NOT public domain** — the filer/publisher retains copyright.

- **SRC-NF-0013** (GOLD) — Microsoft Corporation Form 10-K For the Fiscal Year End — Microsoft Corporation / SEC EDGAR — *COPYRIGHT_RESTRICTED* — https://www.sec.gov/Archives/edgar/data/789019/000095017023035122/msft-20230630.htm
- **SRC-NF-0014** (GOLD) — Apple Inc. Form 10-K For the Fiscal Year Ended Septembe — Apple Inc. / SEC EDGAR — *COPYRIGHT_RESTRICTED* — https://www.sec.gov/Archives/edgar/data/320193/000032019323000106/aapl-20230930.htm
- **SRC-NF-0019** (GOLD) — Amazon.com, Inc. Form 10-K for the year ended December  — Amazon.com, Inc. / SEC EDGAR — *COPYRIGHT_RESTRICTED* — https://www.sec.gov/Archives/edgar/data/1018724/000101872424000008/amzn-20231231.htm
- **SRC-NF-0020** (GOLD) — Microsoft Corporation Definitive Proxy Statement (DEF 1 — Microsoft Corporation / SEC EDGAR — *COPYRIGHT_RESTRICTED* — https://www.sec.gov/Archives/edgar/data/789019/000119312525245150/d908201ddef14a.htm


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

- All sources retrieved on **2026-08-22** (real date, dynamically computed from `date.today()`).
- v1's hardcoded `2025-08-22` was a template bug; the actual discovery was 2026-08-22 (confirmed by file mtimes + git reflog). v1.1 uses the real date.
- Every source carries `retrievedAtStatus: VERIFIED` (established from filesystem + git evidence).
- Every source carries `dateProvenance` recording how the date was established (FILE_MTIME + GIT_REFLOG for v1-carried; SYSTEM_CLOCK for v1.1-new).
- `raw/ARCHIVE-MANIFEST.json` records the SHA256 hash, size, and lawful basis for each archived file.
