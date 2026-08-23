# Phase 3 — Nonfiction Foundation

## What This Branch Is

This is the canonical working foundation for Phase 3 Nonfiction research.
It is based on the frozen Phase 2B Golden Corpus branch and imports the
Nonfiction v1.1 discovery source pack.

## Canonical Source Branches

| Input | Branch | SHA |
|---|---|---|
| Writing OS runtime + Golden Corpus | `research/phase2b-golden-corpus-v1-reconciled` | `d8f8840cb7b3df5a97848460ff3c9b91efc4b095` |
| Nonfiction discovery corpus | `research/nonfiction-source-pack-v1.1` | `fd661f53ffe5cab5e93ca527ae3158ff37cb41f2` |

## What Is Frozen

- Phase 2B Golden Corpus (59 active cases, 1 superseded) — DO NOT MODIFY
- Fiction mode validation behavior — DO NOT MODIFY
- Nonfiction source pack v1.1 research conclusions — DO NOT MODIFY

## What Is Still Unverified

- 47 of 69 Nonfiction sources are UNVERIFIED
- 0 of 135 claims are SOURCE_VERIFIED
- No SourceFactLedger exists
- No Nonfiction Mode exists

## What Phase 3 Will Do Next

1. **Phase 3A:** Source verification — verify the 47 UNVERIFIED sources
2. **Phase 3B:** SourceFactLedger v0 — build from verified claims
3. **Phase 3C:** Nonfiction epistemic rules / validator prototype
4. **Phase 3D:** Nonfiction benchmark
5. **Phase 3E:** Integration with Writing OS architecture

## Key Files

- `PHASE3-SNAPSHOT-MANIFEST.json` — snapshot manifest with exact SHAs
- `docs/phase3/` — all Phase 3 documentation
- `nonfiction/source-pack/` — imported Nonfiction v1.1 source pack
- `corpus/golden-v1/` — frozen Fiction Golden Corpus (from Phase 2B)
- `src/corpus/` — Writing OS reconciler/validator code (from Phase 2B)

## Reproducibility

This branch is fully reproducible:
1. Clone the repository
2. Checkout `research/phase3-nonfiction-foundation-v1`
3. The branch contains exact provenance for both inputs
4. SHA256 hashes for all imported Nonfiction files are in `docs/phase3/nonfiction-source-provenance.json`
