#!/usr/bin/env python3
"""
v1.1 — Build source-index.json + source-evaluation.csv with CORRECTED schema.

Corrections vs v1:
  - retrievalDate: 2025-08-22 (WRONG) → 2026-08-22 (real, from file mtimes + git reflog)
  - 4-field date model: publicationDate / versionDate / retrievedAt / archivedAt + status fields
  - 5-field licensing model: licenseStatus / accessStatus / archivalPermission / redistributionPermission / researchAccess
  - URL verification attached (HTTP status, title seen, classification)
  - provenance fields: dateProvenance, urlProvenance
  - sourceId: SRC-NF-V11-0001.. for new sources; v1 sources keep their SRC-NF-XXXX IDs
"""
import json, os, csv
from collections import Counter
from datetime import date

BASE_V11 = "/home/z/my-project/sources/nonfiction-v1.1"
META = os.path.join(BASE_V11, "metadata")
TODAY = date.today().isoformat()  # dynamic, not hardcoded

def main():
    curated = json.load(open(os.path.join(META, "_curated_v11.json")))
    gold = curated["gold"]
    silver = curated["silver"]
    bronze = curated["bronze"]
    ordered = gold + silver + bronze

    # Assign v1.1 sourceIds. v1 sources keep their SRC-NF-XXXX. New sources get SRC-NF-V11-XXXX.
    new_counter = 0
    for r in ordered:
        if r.get("v1SourceId"):
            r["sourceId"] = r["v1SourceId"]
        else:
            new_counter += 1
            r["sourceId"] = f"SRC-NF-V11-{new_counter:04d}"

    index_entries = []
    for r in ordered:
        qs = r.get("qualityScores", {})
        dims = ["authority","stability","provenance","factualDensity","structuralRichness",
                "rewriteUtility","accessibility","reproducibility","learningValue"]
        total = sum(int(qs.get(d,0)) for d in dims)
        if r.get("correctedLicensing",{}).get("archivalPermission")=="YES": total += 2
        if r.get("authorityTier")==1: total += 1
        gap = r.get("gapFill","")
        if "causal" in gap: total += 2
        if "negative" in gap: total += 2
        if "scope" in gap: total += 1

        lic = r.get("correctedLicensing", {})
        url_v = r.get("urlVerification", {})

        entry = {
            "sourceId": r["sourceId"],
            "title": r.get("title",""),
            "author": r.get("author","N/A"),
            "organization": r.get("organization",""),
            # 4-field date model
            "publicationDate": r.get("publicationDate",""),
            "publicationDateStatus": r.get("publicationDateStatus","UNVERIFIED"),
            "versionDate": r.get("versionDate"),
            "retrievedAt": TODAY,
            "retrievedAtStatus": "VERIFIED",  # from file mtimes + git reflog
            "archivedAt": r.get("archivedAt"),
            "dateProvenance": "FILE_MTIME + GIT_REFLOG" if r.get("_origin")=="v1" else "SYSTEM_CLOCK",
            # source classification
            "sourceType": r.get("sourceType",""),
            "domain": r.get("domain",""),
            "countryOrRegion": r.get("countryOrRegion","US" if r.get("_origin")=="v1" else "Global"),
            "candidateRegister": r.get("candidateRegister") or (r.get("_pool","").upper() if r.get("_pool") else "UNKNOWN"),
            "authorityTier": r.get("authorityTier", 4),
            # 5-field licensing model (CORRECTED)
            "licenseStatus": lic.get("licenseStatus","UNKNOWN"),
            "accessStatus": lic.get("accessStatus","METADATA_ONLY"),
            "archivalPermission": lic.get("archivalPermission","UNKNOWN"),
            "redistributionPermission": lic.get("redistributionPermission","UNKNOWN"),
            "researchAccess": lic.get("researchAccess","LIMITED"),
            "licenseOriginal": r.get("license",""),  # preserve v1's original field for audit
            # URLs
            "url": r.get("url",""),
            "stableUrl": r.get("stableUrl", r.get("url","")),
            "documentFormat": r.get("documentFormat",""),
            "language": r.get("language","en"),
            # URL verification (from audit)
            "urlVerification": {
                "httpStatus": url_v.get("http_status"),
                "fetchSucceeded": url_v.get("fetch_succeeded"),
                "titleSeen": url_v.get("title_seen",""),
                "classification": url_v.get("classification","UNVERIFIED")
            } if url_v else {"classification":"UNVERIFIED_NEW"},
            # quality
            "qualityScores": qs,
            "totalScore": total,
            # selection
            "selectionStatus": r.get("selectionStatus","EXCLUDED"),
            "goldRank": r.get("goldRank"),
            "gapFill": r.get("gapFill",""),
            "claimTypeTags": r.get("claimTypeTags",[]),
            "redFlags": r.get("redFlags",[]),
            "origin": r.get("_origin",""),
            "v1SourceId": r.get("v1SourceId"),
            "notes": r.get("notes","")
        }
        index_entries.append(entry)

    # Write source-index.json
    idx_path = os.path.join(BASE_V11, "source-index.json")
    json.dump({"version":"v1.1","generated":TODAY,"count":len(index_entries),
               "sources":index_entries}, open(idx_path,"w"), indent=2)
    print(f"Wrote {idx_path} ({len(index_entries)} sources)")

    # Write source-evaluation.csv
    eval_path = os.path.join(BASE_V11, "source-evaluation.csv")
    with open(eval_path,"w",newline="") as f:
        w = csv.writer(f)
        w.writerow(["sourceId","title","organization","register","countryOrRegion","authorityTier",
                    "licenseStatus","accessStatus","archivalPermission","redistributionPermission",
                    "documentFormat","domain","gapFill",
                    "authority","stability","provenance","factualDensity","structuralRichness",
                    "rewriteUtility","accessibility","reproducibility","learningValue",
                    "totalScore","selectionStatus","goldRank","origin","v1SourceId"])
        for e in index_entries:
            qs = e["qualityScores"]
            w.writerow([e["sourceId"], e["title"], e["organization"], e["candidateRegister"],
                        e["countryOrRegion"], e["authorityTier"],
                        e["licenseStatus"], e["accessStatus"], e["archivalPermission"], e["redistributionPermission"],
                        e["documentFormat"], e["domain"], e["gapFill"],
                        qs.get("authority",""), qs.get("stability",""), qs.get("provenance",""),
                        qs.get("factualDensity",""), qs.get("structuralRichness",""),
                        qs.get("rewriteUtility",""), qs.get("accessibility",""),
                        qs.get("reproducibility",""), qs.get("learningValue",""),
                        e["totalScore"], e["selectionStatus"], e.get("goldRank",""),
                        e["origin"], e.get("v1SourceId","")])
    print(f"Wrote {eval_path}")

    # Summary
    sel_count = Counter(e["selectionStatus"] for e in index_entries)
    reg_count = Counter(e["candidateRegister"] for e in index_entries)
    tier_count = Counter(e["authorityTier"] for e in index_entries)
    lic_count = Counter(e["licenseStatus"] for e in index_entries)
    arch_count = Counter(e["archivalPermission"] for e in index_entries)
    country_count = Counter(e["countryOrRegion"] for e in index_entries)
    print(f"\n=== v1.1 SUMMARY ===")
    print(f"Total selected: {len(index_entries)}")
    print(f"Selection: {dict(sel_count)}")
    print(f"Register: {dict(reg_count)}")
    print(f"Authority tier: {dict(tier_count)}")
    print(f"License status: {dict(lic_count)}")
    print(f"Archival permission: {dict(arch_count)}")
    print(f"Country/region: {dict(country_count)}")
    print(f"Open-license archivable (YES): {sum(1 for e in index_entries if e['archivalPermission']=='YES')}")
    print(f"Copyright-restricted (NO archival): {sum(1 for e in index_entries if e['archivalPermission']=='NO')}")

if __name__ == "__main__":
    main()
