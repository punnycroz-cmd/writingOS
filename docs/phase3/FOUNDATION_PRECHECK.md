# Foundation Precheck

## Branch SHAs (from GitHub)
- **Phase 2B:** `d8f8840cb7b3df5a97848460ff3c9b91efc4b095`
- **Nonfiction v1.1:** `fd661f53ffe5cab5e93ca527ae3158ff37cb41f2`
- **Phase 3 (current):** `bc7a97262674d9ffd45f76f1e024fa14a0fe347f`
- **main:** `d011acd6c8880f6ac0ccb5daeb4417b5180e33d2`

## Branch Existence
- ✅ `origin/research/phase2b-golden-corpus-v1-reconciled` exists
- ✅ `origin/research/nonfiction-source-pack-v1.1` exists
- ✅ `origin/research/phase3-nonfiction-foundation-v1` exists

## Known Issues Found
1. **Duplicate source pack:** `research/nonfiction-source-pack-v1.1/source-pack/` was a duplicate of `nonfiction/source-pack/`. **FIXED** — duplicate removed.
2. **Claim-status wording:** Documentation said "135 claims are all UNKNOWN" but claims actually have discovery-layer statuses (verificationLevel: SNIPPET_VERIFIED=17, WIDELY_CITED=118; epistemicLabelStatus: AGENT_ASSIGNED_NEEDS_HUMAN_REVIEW=135). None are SOURCE_VERIFIED. **FIXED** — wording corrected.
3. **Import inventory:** Referenced duplicate path. **FIXED** — rebuilt to reference only `nonfiction/source-pack/`.

## Clean State
- Working tree: clean after fixes
- No modifications to Phase 2B or Nonfiction v1.1 branches
