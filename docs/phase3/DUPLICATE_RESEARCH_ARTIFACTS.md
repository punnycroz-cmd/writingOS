# Duplicate Research Artifacts

## Detection

A scan was performed for all copies of the canonical Nonfiction source-pack
signature files across the Phase 3 branch:

- `source-index.json`
- `claim-inventory.jsonl`
- `PACK-MANIFEST.json`

## Duplicates Found

### Duplicate 1 — RESOLVED

| Property | Value |
|---|---|
| Path A (canonical) | `nonfiction/source-pack/` |
| Path B (duplicate) | `research/nonfiction-source-pack-v1.1/source-pack/` |
| Canonical path | `nonfiction/source-pack/` |
| Action | **DELETED** — `research/nonfiction-source-pack-v1.1/` removed from Phase 3 branch |

## Non-Duplicate Matches

The following files have similar names but are NOT Nonfiction source-pack files:

- `corpus/golden-v1/source-index.json` — Fiction Golden Corpus source index (Phase 2B, unrelated)
- `forensic/phase2b-5/current/source-index.json` — Forensic snapshot of the Fiction source index (Phase 2B, unrelated)

These are correctly part of the Phase 2B foundation and are NOT duplicates of the
Nonfiction source pack.

## Final State

The Phase 3 branch contains **exactly one** canonical Nonfiction source-pack directory:

```
nonfiction/source-pack/
```

No duplicate source-pack copies remain.
