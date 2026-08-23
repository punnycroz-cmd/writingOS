#!/usr/bin/env python3
"""
v1.1 — Build validation-opportunity-matrix.csv from v1.1 claim-inventory.jsonl.
Same logic as v1 _build_matrix.py but for v1.1 GOLD sources (29).
"""
import json, os, csv, re
from collections import defaultdict

BASE = "/home/z/my-project/sources/nonfiction-v1.1"
CLAIMS = os.path.join(BASE, "claim-inventory.jsonl")
IDX = os.path.join(BASE, "source-index.json")
OUT = os.path.join(BASE, "validation-opportunity-matrix.csv")

HEDGE = re.compile(r"\b(may|might|could|estimated|projected|appears|tends|tended|likely|possibly|probably|expected|anticipated|approximat|moderate)\b", re.I)
NEG_PAT = re.compile(r"\bno\b|\bnot\b|\bnever\b|did not|has not|have not|cannot|shall not|no evidence|no association|no increase|no difference|did not establish|did not observe|absence of evidence|no effect", re.I)
COMP_PAT = re.compile(r"more than|higher|lower|increase|decrease|compared|than|twice|approximately|majority|minority|record|ranged|varied|above|below|moderate|stabilize", re.I)
SCOPE_PAT = re.compile(r"\bscope\b|excluding|except|limited to|only|other than|restricted|among participants|in the studied|under specified|generalize", re.I)

def main():
    claims = [json.loads(l) for l in open(CLAIMS)]
    idx = json.load(open(IDX))
    gold_ids = [s["sourceId"] for s in idx["sources"] if s["selectionStatus"]=="GOLD"]
    gold_meta = {s["sourceId"]: s for s in idx["sources"] if s["selectionStatus"]=="GOLD"}

    by_src = defaultdict(list)
    for c in claims:
        by_src[c["sourceId"]].append(c)

    rows = []
    for sid in gold_ids:
        cs = by_src.get(sid, [])
        meta = gold_meta[sid]
        supported = len(cs)
        unsupported = sum(1 for c in cs if HEDGE.search(c["claimText"]))
        contradiction = supported
        numbers = sum(1 for c in cs if c.get("numbers"))
        dates = sum(1 for c in cs if c.get("dates"))
        entities = sum(1 for c in cs if c.get("entities"))
        attribution = sum(1 for c in cs if c.get("attribution") and c["attribution"] != "N/A")
        causal = sum(1 for c in cs if c.get("causalStatus") in ("CAUSAL","CORRELATIONAL"))
        paraphrase = supported
        negative = sum(1 for c in cs if c.get("claimType")=="NEGATIVE" or NEG_PAT.search(c["claimText"]))
        comparative = sum(1 for c in cs if c.get("claimType")=="COMPARATIVE" or COMP_PAT.search(c["claimText"]))
        temporal = sum(1 for c in cs if c.get("claimType") in ("TEMPORAL","FORECAST") or c.get("dates"))
        uncertainty = sum(1 for c in cs if c.get("claimType") in ("ESTIMATE","UNCERTAINTY","FORECAST","EVIDENCE_LIMITATION") or c.get("epistemicStrength") in ("ESTIMATE","CONDITIONAL_ESTIMATE","INFERRED"))
        scope = sum(1 for c in cs if c.get("claimType")=="SCOPE" or SCOPE_PAT.search(c["claimText"]))
        forecast = sum(1 for c in cs if c.get("claimType")=="FORECAST")
        total = supported+unsupported+contradiction+numbers+dates+entities+attribution+causal+paraphrase+negative+comparative+temporal+uncertainty+scope+forecast

        rows.append({
            "sourceId": sid,
            "title": meta["title"][:55],
            "organization": meta["organization"][:25],
            "register": meta["candidateRegister"],
            "countryOrRegion": meta.get("countryOrRegion",""),
            "claimCount": len(cs),
            "supported": supported,
            "unsupported": unsupported,
            "contradiction": contradiction,
            "numbers": numbers,
            "dates": dates,
            "entities": entities,
            "attribution": attribution,
            "causal": causal,
            "paraphrase": paraphrase,
            "negative": negative,
            "comparative": comparative,
            "temporal": temporal,
            "uncertainty": uncertainty,
            "scope": scope,
            "forecast": forecast,
            "totalOpportunities": total,
        })

    fields = ["sourceId","title","organization","register","countryOrRegion","claimCount",
              "supported","unsupported","contradiction","numbers","dates","entities",
              "attribution","causal","paraphrase","negative","comparative","temporal",
              "uncertainty","scope","forecast","totalOpportunities"]
    with open(OUT, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    print(f"Wrote {OUT} ({len(rows)} rows)")
    totals = {k: sum(r[k] for r in rows) for k in fields[6:]}
    print("Category totals:", totals)
    print(f"Total opportunities: {totals['totalOpportunities']}")

if __name__ == "__main__":
    main()
