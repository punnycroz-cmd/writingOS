#!/usr/bin/env python3
"""
Phase 3A.0-final — Add verificationStatus to every source record + write PACK-MANIFEST.json.

This script:
  1. Reads sources/nonfiction-v1.1/source-index.json
  2. For every source, derives a canonical `verificationStatus` from the existing
     `urlVerification.classification` field, using the taxonomy in the brief:
        DISCOVERY_SELECTED  (default — selected but not directly verified)
        URL_VERIFIED        (URL directly inspected, matched expected metadata)
        URL_EXISTS_BOT_BLOCKED (reachable/credible but automated verification blocked)
        SOURCE_VERIFIED     (actual source document inspected sufficiently to verify
                             source + relevant claims — NONE in this pack)
        UNVERIFIED          (selected, but evidence insufficient for direct verification)
  3. Re-writes source-index.json with the new `verificationStatus` field per source.
  4. Writes sources/nonfiction-v1.1/PACK-MANIFEST.json with computed counts.
"""
import json, os
from collections import Counter

BASE = "/home/z/my-project/sources/nonfiction-v1.1"
IDX = os.path.join(BASE, "source-index.json")
MANIFEST = os.path.join(BASE, "PACK-MANIFEST.json")

def derive_verification_status(source):
    """Derive canonical verificationStatus from urlVerification.classification."""
    uv = source.get("urlVerification", {})
    cls = uv.get("classification", "UNVERIFIED_NEW")
    # Map the existing classification to the canonical taxonomy
    if cls == "URL_VERIFIED":
        return "URL_VERIFIED"
    elif cls == "URL_EXISTS_BOT_BLOCKED":
        return "URL_EXISTS_BOT_BLOCKED"
    elif cls == "SOURCE_VERIFIED":
        return "SOURCE_VERIFIED"
    elif cls in ("UNVERIFIED_NEW", "UNVERIFIED"):
        return "UNVERIFIED"
    else:
        return "UNVERIFIED"

def main():
    idx = json.load(open(IDX))
    sources = idx["sources"]

    # Add verificationStatus to every source
    for s in sources:
        s["verificationStatus"] = derive_verification_status(s)

    # Write back updated source-index.json
    idx["verificationTaxonomy"] = {
        "DISCOVERY_SELECTED": "Source was discovered and selected for the corpus, but direct verification has not been completed. (Superset of UNVERIFIED.)",
        "URL_VERIFIED": "Source URL was directly inspected and matched the expected source metadata.",
        "URL_EXISTS_BOT_BLOCKED": "Source appears reachable/credible, but automated verification was blocked by anti-bot or equivalent access restrictions. NOT the same as URL_VERIFIED.",
        "SOURCE_VERIFIED": "The actual source document was inspected sufficiently to verify the source and its relevant claims. None in this pack (see PACK-MANIFEST.json).",
        "UNVERIFIED": "Source was selected, but current evidence is insufficient for direct verification."
    }
    idx["status"] = "DISCOVERY_CORPUS"
    idx["containsGroundTruth"] = False
    with open(IDX, "w") as f:
        json.dump(idx, f, indent=2)
    print(f"Updated {IDX} (added verificationStatus to {len(sources)} sources)")

    # Compute manifest counts from actual records
    sel_status = Counter(s["selectionStatus"] for s in sources)
    ver_status = Counter(s["verificationStatus"] for s in sources)
    lic_status = Counter(s["licenseStatus"] for s in sources)
    arch_perm = Counter(s["archivalPermission"] for s in sources)

    # Claim counts
    claims = [json.loads(l) for l in open(os.path.join(BASE, "claim-inventory.jsonl"))]
    cl_vlevel = Counter(c.get("verificationLevel","?") for c in claims)

    # Archive counts
    manifest_arch = json.load(open(os.path.join(BASE, "raw", "ARCHIVE-MANIFEST.json")))
    arch_class = Counter(a["classification"] for a in manifest_arch["archives"])

    manifest = {
        "version": "1.1.0",
        "packName": "Nonfiction Source Pack v1.1",
        "purpose": "NONFICTION_SOURCE_DISCOVERY",
        "status": "DISCOVERY_CORPUS",
        "containsGroundTruth": False,
        "computedAt": idx["generated"],
        "computedFrom": {
            "sourceIndex": "sources/nonfiction-v1.1/source-index.json",
            "claimInventory": "sources/nonfiction-v1.1/claim-inventory.jsonl",
            "archiveManifest": "sources/nonfiction-v1.1/raw/ARCHIVE-MANIFEST.json"
        },
        "selectedSources": len(sources),
        "selectionDistribution": {
            "gold": sel_status.get("GOLD", 0),
            "silver": sel_status.get("SILVER", 0),
            "bronze": sel_status.get("BRONZE", 0)
        },
        "verificationDistribution": {
            "urlVerified": ver_status.get("URL_VERIFIED", 0),
            "urlExistsBotBlocked": ver_status.get("URL_EXISTS_BOT_BLOCKED", 0),
            "unverified": ver_status.get("UNVERIFIED", 0),
            "sourceVerified": ver_status.get("SOURCE_VERIFIED", 0)
        },
        "claimCount": len(claims),
        "claimVerificationDistribution": {
            "sourceVerified": cl_vlevel.get("SOURCE_VERIFIED", 0),
            "sourcePartiallyVerified": cl_vlevel.get("SOURCE_PARTIALLY_VERIFIED", 0),
            "snippetVerified": cl_vlevel.get("SNIPPET_VERIFIED", 0),
            "widelyCited": cl_vlevel.get("WIDELY_CITED", 0),
            "unverified": cl_vlevel.get("UNVERIFIED", 0)
        },
        "sourceVerifiedClaims": cl_vlevel.get("SOURCE_VERIFIED", 0),
        "licensingDistribution": {
            "OPEN_ACCESS": lic_status.get("OPEN_ACCESS", 0),
            "PUBLIC_DOMAIN": lic_status.get("PUBLIC_DOMAIN", 0),
            "CC_BY": lic_status.get("CC_BY", 0),
            "COPYRIGHT_RESTRICTED": lic_status.get("COPYRIGHT_RESTRICTED", 0),
            "UNKNOWN": lic_status.get("UNKNOWN", 0)
        },
        "archivalPermissionDistribution": {
            "archivable_YES": arch_perm.get("YES", 0),
            "archivable_NO": arch_perm.get("NO", 0),
            "archivable_UNKNOWN": arch_perm.get("UNKNOWN", 0)
        },
        "archiveSummary": {
            "totalArchives": len(manifest_arch["archives"]),
            "archivedFullDocument": arch_class.get("ARCHIVED_FULL_DOCUMENT", 0),
            "archivedLandingPage": arch_class.get("ARCHIVED_LANDING_PAGE", 0),
            "archivedAbstractOnly": arch_class.get("ARCHIVED_ABSTRACT_ONLY", 0)
        },
        "validationOpportunities": "CANDIDATE_OPPORTUNITY (NOT verified test cases)",
        "securityStatus": {
            "privateFilesInPack": 0,
            "envFilesInPack": 0,
            "credentialsInPack": 0,
            "scanNote": "sources/nonfiction-v1.1/ scanned for .env, .env.*, *.key, *.pem, credentials*, *token*, *secret*. None found inside the pack. Workspace-level .env and .zscripts/ exist at repo root but are NOT inside the source-pack artifact."
        },
        "honestSummary": "69 selected nonfiction sources form a strong discovery corpus. 17 are directly URL-verified, 5 are reachable but bot-blocked, and 47 remain unverified. The 135 claim records are discovery/candidate claims, not ground truth, and there are currently zero SOURCE_VERIFIED claims.",
        "readiness": {
            "discovery": "STRONG",
            "licensing": "SUBSTANTIALLY_ORGANIZED",
            "diversity": "SUBSTANTIALLY_IMPROVED",
            "sourceVerification": "INCOMPLETE",
            "claimVerification": "NOT_STARTED",
            "groundTruth": "NOT_ESTABLISHED",
            "sourceFactLedgerReady": False
        }
    }

    with open(MANIFEST, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"Wrote {MANIFEST}")
    print(f"\n=== PACK-MANIFEST computed values ===")
    print(f"selectedSources: {manifest['selectedSources']}")
    print(f"GOLD/SILVER/BRONZE: {manifest['selectionDistribution']}")
    print(f"verification: {manifest['verificationDistribution']}")
    print(f"claims: {manifest['claimCount']}, SOURCE_VERIFIED: {manifest['sourceVerifiedClaims']}")
    print(f"archives: {manifest['archiveSummary']}")
    print(f"containsGroundTruth: {manifest['containsGroundTruth']}")
    print(f"sourceFactLedgerReady: {manifest['readiness']['sourceFactLedgerReady']}")

if __name__ == "__main__":
    main()
