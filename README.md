# Writing OS

A verified-rewriting engine: it rewrites and validates text across registers
(fiction, nonfiction, academic, legal, commercial) with a hard guarantee —
numbers, dates, names, quotes, and epistemic claims that can't be traced to
source material or declared state are **blocked, not shipped**.

## Why it's different

Grammarly and AI writers optimize for fluency. Writing OS optimizes for
*faithfulness*: a deterministic provenance layer checks every concrete detail
against the source text + document state before any LLM is consulted; a
semantic judge then evaluates what determinism can't prove; a scoped
arbitration layer resolves conflicts with authority proportional to evidence
strength. Evaluated at **0% false-acceptance** on the frozen 60-variant
golden benchmark (see `corpus/golden-v1/`).

## Architecture

```
Document State (character / information-ownership / canon / ledger)
        ↓
[CC] Deterministic triage   →  DETERMINISTIC_ACCEPT | DETERMINISTIC_BLOCK
   (provenance v4, epistemic |  HANDOFF_TO_LLM
    claim resolver, scoped    ↓
    severity)              [LJ] Semantic validator (9 dimensions, state-aware)
        ↓                   ↓
   Scoped arbitration (authority ∝ evidence strength)
        ↓
   ACCEPT / REJECT / UNCLEAR  →  repair → independent revalidation
```

- `src/engine/deterministic/` — provenance classifier (numbers, dates,
  number-words, proper nouns, possessives) + epistemic-claim resolver
  (knows/suspects/misunderstands/unknown vs. character state)
- `src/engine/semantic/` — 9-dimension LLM validator, scoped arbitration
  policy, repair generation + independent revalidation
- `src/engine/nonfiction/` — Source Fact Ledger validators, epistemic rules
  (ungrounded claim, blocked-source reliance, causal overclaim, temporal
  anachronism, evidential fabrication), assertion extractor
- `src/engine/llm.ts` — provider-agnostic LLM client (OpenAI-compatible:
  OpenRouter / Fireworks / Groq / any base URL)
- `src/engine/runtime/` — `WritingOSRuntime.processCandidate()` orchestrator
- `src/app/api/` — `/api/validate`, `/api/rewrite`
- `history/` — archived research iterations (immutable record)
- `corpus/golden-v1/` — frozen evaluation benchmark
- `nonfiction/` — ledger + source pack + benchmark data

## Quick start

```bash
bun install

# Option A — local model, no API key (recommended for dev):
#   curl -fsSL https://ollama.com/install.sh | sh
#   ollama pull qwen2.5:7b-instruct        # or llama3.2:3b (Meta, faster)
#   .env.local already points at http://localhost:11434/v1
# Option B — hosted OpenAI-compatible API:
#   export LLM_API_KEY=...                 # OpenRouter / Fireworks / Groq
#   export LLM_BASE_URL=https://openrouter.ai/api/v1
#   export LLM_MODEL=<model-id>
# Without either, the deterministic layer still runs; EXECUTION_ERROR is
# reported honestly, never faked.

bun run dev      # http://localhost:3000 — validation UI
bun test tests/  # 198 deterministic + 13 LLM-gated tests
```

## API

```bash
# Fiction: knowledge-leak / provenance check
curl -X POST localhost:3000/api/validate -H 'Content-Type: application/json' -d '{
  "mode": "FICTION",
  "text": "Maya knew Marcus had embezzled $40,000 from the clinic.",
  "inventionPolicy": "LICENSED_FICTION",
  "stateContext": {
    "character": {"identity": "Maya Okafor — ICU nurse"},
    "informationOwnership": {"entries": [{
      "fact": "Marcus embezzled $40,000 from the clinic",
      "knows": ["Marcus"], "suspects": [], "misunderstands": [], "unknown": ["Maya"]
    }]}
  }
}'
# → REJECTED: CLAIM_STATE_CONTRADICTED (Maya is in `unknown` for this fact)

# Validate → repair → revalidate
curl -X POST localhost:3000/api/rewrite ...same body...
```

Nonfiction mode audits each extracted assertion against the Source Fact
Ledger (`nonfiction/ledger/source-fact-ledger.jsonl`) for grounding, hedging,
causality, temporal consistency, and quote authenticity.

## Project layout history

Research history lives in `history/` + `docs/` + worklog.md — kept as
provenance. The canonical codebase is under `src/engine/`. See INDEX.md for
a map of the (large) documentation tree.

## Monetization

See MONETIZATION.md — freemium web app + metered API for content teams,
legal/compliance, publishers, and regulated industries.
