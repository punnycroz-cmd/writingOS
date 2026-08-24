# PROJECT_MEMORY_MASTER

## 1. The project we have been working on

The project is the **Writing OS / writingOS** repository:

```text
GitHub:
punnycroz-cmd/writingOS
```

The overall system is intended to become a writing/research operating system with a strong distinction between:

```text
research/discovery
      ↓
source verification
      ↓
fact/evidence representation
      ↓
nonfiction reasoning/writing
      ↓
benchmark/evaluation
      ↓
eventual model integration
```

The important principle repeatedly established is:

> **Do not allow unverified discovery material to silently become ground truth.**

That epistemic boundary became one of the central architectural requirements.

---

## 2. How the project originally became complicated

The work came from **multiple environments/agents**, not one clean repository history.

The important sources were approximately:

```text
Original agent sandbox
    └── Phase 2B / Writing OS infrastructure

Another agent sandbox
    └── Nonfiction research/source pack

Gemini / Google Antigravity
    └── downloaded/reconstructed sandbox work
    └── pushed material into GitHub

GitHub
    └── eventually became the shared source of truth
```

This caused the central problem:

> "Do I actually have one complete project, or am I accidentally combining fragments from several sandboxes?"

That concern drove a large portion of the work.

---

## 3. Phase 2B was the original technical foundation

The key Phase 2B branch became:

```text
research/phase2b-golden-corpus-v1-reconciled
```

The canonical remote HEAD we repeatedly established was:

```text
d8f8840cb7b3df5a97848460ff3c9b91efc4b095
```

An important earlier commit was:

```text
35d1a2f49218b02bda1ce5b18253e7df9419ef83
```

We discovered that:

```text
35d1a2f
    ↓
d8f8840
```

So `35d1a2f` was the **parent / older commit**, while `d8f8840` was the actual newer Phase 2B HEAD.
Rebasing Phase 3 to `35d1a2f` would have downgraded the project.

---

## 4. What Phase 2B actually contains

The Phase 2B system includes the **Golden Corpus** and forensic/reconciliation infrastructure.

The major components worked with include:

```text
corpus/
writing-engine/
src/corpus/
forensic/phase2b-5/
tests/corpus/
```

Important components include:

```text
src/corpus/reconcile-v1.ts
src/corpus/classify-comparison.ts
src/corpus/freeze-document-parser.ts
src/corpus/forensic-validator.ts
```

The Phase 2B reconciliation system ultimately became a critical invariant. We repeatedly used:

```text
20 / 20 consistency checks PASS
```

The corpus test suite consists of four major test files:

```text
tests/corpus/forensic-validator.test.ts
tests/corpus/freeze-integrity.test.ts
tests/corpus/freeze-document-parser.test.ts
tests/corpus/classify-comparison.test.ts
```

The intended official test command became:

```bash
bun test tests/corpus/
```

---

## 5. There was a major problem with custom Phase 2B test runners

During the investigation, an agent repeatedly created custom test runners such as:

```text
forensic/phase2b-5/scripts/run-all-tests.ts
```

These runners manually recreated `describe()`, `it()`, `expect()` using Node assertions. We eventually decided that was dangerous because it could produce a false sense of correctness.

> **The authoritative regression system should use the real test runner.**

So the authoritative commands became:

```bash
bun test tests/corpus/
bun test tests/phase3/
```

---

## 6. Phase 2B had forensic integrity infrastructure

Important forensic artifacts include things like:

```text
forensic/phase2b-5/MANIFEST.json
forensic/phase2b-5/file-inventory.json
forensic/phase2b-5/EXCLUDED_FILES.md
```

The forensic validator checks things like manifest fields, inventory counts, SHA-256 integrity, security flags, excluded-file policy.
These are important because Phase 2B isn't simply "some code." It is a frozen, audited corpus foundation.

---

## 7. Then came the Nonfiction source pack

The canonical Nonfiction source branch became:

```text
research/nonfiction-source-pack-v1.1
```

Canonical SHA:

```text
fd661f53ffe5cab5e93ca527ae3158ff37cb41f2
```

The canonical active path became:

```text
nonfiction/source-pack/
```

---

## 8. Nonfiction source counts

The frozen discovery corpus contains:

```text
69 sources (29 GOLD, 25 SILVER, 15 BRONZE)
135 candidate claims
```

Important: Those 135 claims were **discovery-layer claims**. They were NOT automatically ground truth.

---

## 9. Phase 3 foundation was created

The canonical integrated Phase 3 foundation branch became:

```text
research/phase3-nonfiction-foundation-v1
```

---

## 10. Phase 3A began as source verification

The next phase was Phase 3A — Source Verification. The task was to verify all 69 sources.

Final Phase 3A source status distribution became:

```text
34 VERIFIED
20 PARTIALLY_VERIFIED
15 BLOCKED
0 FAILED
0 UNRESOLVED
```

---

## 11. Tool failures during source verification

The verification process encountered actual external-tool limitations (HTTP 429 rate limiting, JSON parse/tool-buffer failures, PDF retrieval/parser limitations, bot protection / Cloudflare).

> **A technical inability to retrieve a source is not the same thing as the source being false or broken.**

So we eventually represented them as technical blockers (BLOCKED).

---

## 12. The Phase 3A verification ledger

The main ledger became:

```text
nonfiction/verification/source-verification-ledger.jsonl
```

Other major files include:
```text
nonfiction/verification/source-verification-schema.json
nonfiction/verification/source-id-map.json
nonfiction/verification/verification-integrity-report.json
```

---

## 13. Phase 3A.1 - 3A.5 — Verification Normalization and Hardening

We separated publication-date semantics from HTTP Last-Modified, system clock, filesystem modification time, and Git reflog.

We introduced `compareSourceIdentity()` to compare title, URL, publisher, and author rather than assuming identity.

We removed dangerous substring heuristics and made redirect evidence explicit.

We explicitly removed zero-fallback verification models (e.g. copying discovery metadata when verification metadata is missing) because that was epistemically unsafe.

---

## 14. What the audit actually was

The audit branches (`audit/end-to-end-repro-v1` and `v2`) were **not supposed to become the project**. They were intended as a verification mechanism to ensure the project could be reconstructed from Git alone. 

> We explicitly decided `audit/end-to-end-repro-v2` should remain verification-only.

---

## 15. The authoritative branch structure we were moving toward

```text
CANONICAL DEVELOPMENT
research/phase3b-sourcefactledger-v1
        │
        └── based on Phase 3A.5
             2f290acf...

FROZEN INPUT
Phase 2B
d8f8840...

FROZEN INPUT
Nonfiction v1.1
fd661f5...

VERIFICATION ONLY
audit/end-to-end-repro-v2
```

---

## 16. The SourceFactLedger was the next real feature

Phase 3B — SourceFactLedger's purpose is to bridge:
`candidate claim -> source -> verification status -> evidence -> fact-level representation`.

The ledger models the actual relationships found in the frozen data.
A claim may have 0, 1, or multiple sources. A source may support multiple claims.

---

## 17. The Phase 3B epistemic rules

- **Discovery ≠ ground truth:** A candidate claim is not automatically authoritative.
- **Verified source ≠ verified claim:** Even if a source is verified, that does not mean every claim associated with it is verified.
- **Blocked source ≠ direct evidence:** A technically blocked source cannot produce `DIRECT` evidence.
- **Evidence must be real:** Do not fabricate `evidenceExcerpt`, `evidenceLocation`, or source support.
- **Ground truth remains zero initially:** `sourceVerifiedClaims = 0`, `containsGroundTruth = false`.

---

## 18. The larger goal you're actually building

```text
             ┌────────────────────┐
             │  Research Discovery │
             └─────────┬──────────┘
                       │
                       ▼
             ┌────────────────────┐
             │ Source Verification│
             └─────────┬──────────┘
                       │
                       ▼
             ┌────────────────────┐
             │  SourceFactLedger  │
             └─────────┬──────────┘
                       │
                       ▼
             ┌────────────────────┐
             │ Nonfiction Rules   │
             └─────────┬──────────┘
                       │
                       ▼
             ┌────────────────────┐
             │ Benchmark/Evaluate │
             └─────────┬──────────┘
                       │
                       ▼
             ┌────────────────────┐
             │ Writing/Integration│
             └────────────────────┘
```

The key property is **traceability**: `sentence/fact -> claim -> source -> evidence -> verification state -> original discovery record`.

---

## 19. Core Principles / Project Memory 

1. Phase 2B is frozen infrastructure.
2. Nonfiction v1.1 is frozen discovery input.
3. Phase 3A.5 is the last verified source layer.
4. Phase 3B is the current working development layer.
5. Audit branches are verification-only.
6. Never silently copy discovery metadata into verification metadata.
7. Never promote candidate claims to ground truth without evidence.
8. Never modify frozen inputs to make tests pass.
9. Use real Bun tests as authoritative tests.
10. Preserve Git history instead of copying entire old branches into active directories.
11. Maintain one canonical active copy of every production artifact.
12. Historical provenance should be documented, but not confused with active code.
13. Source verification and claim verification are different concepts.
14. BLOCKED means technically unverifiable, not false.
15. Every important claim/fact should ultimately be traceable to source evidence.
