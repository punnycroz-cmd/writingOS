# Monetization Plan — Writing OS

## The product: "verified rewriting" as an API + web app

Every AI writing tool (Grammarly, Jasper, Copilot) can produce fluent text.
None can *guarantee* the rewrite doesn't invent facts, dates, numbers, names,
or knowledge the narrator shouldn't have. Writing OS can — that's the moat.

## What we sell

**Core promise**: "Rewrite anything. If a number, date, name, quote, or claim
can't be traced to your source material — we block it, we don't ship it."

- `/api/validate` — provenance + epistemic check on a candidate text
- `/api/rewrite` — validate → repair → independently revalidate
- Fiction mode: character-knowledge leaks (a narrator who "knows" things the
  author established they don't) — no existing tool detects this
- Nonfiction mode: claims audited line-by-line against a source-fact ledger
  (ungrounded claim, causal overclaim, temporal anachronism, fabricated quote)

## Target customers

| Segment | Pain | Why us |
|---|---|---|
| Content/marketing teams | AI drafts invent stats, dates | deterministic fact-grounding vs. style-only tools |
| Legal/compliance docs | a wrong number = liability | audit trail per claim (ledger + violation report) |
| Publishers/editors | continuity errors in manuscripts | character-knowledge consistency checking |
| Regulated industries (health, finance) | hallucination = compliance breach | 0% false-acceptance design goal |

## Pricing model (freemium)

- **Free**: 20 validations/month via web UI — drives adoption + feedback
- **Pro $29/mo**: 2,000 validations, rewrite+repair, state-file management
- **API $99+/mo**: metered usage (per 1K requests), SLA, batch ledger audits
- **Enterprise**: self-hosted engine + custom rules (registers, ledgers,
  compliance packs) — deterministic layer runs fully offline, LLM layer is
  BYOK (customer's own OpenRouter/Fireworks/Groq key)

## Cost structure (now → production)

- LLM: any OpenAI-compatible provider; default = OpenRouter free tier,
  production = paid model (~$0.002/validation at 4K tokens). BYOK removes
  our inference cost entirely for enterprise.
- Deterministic layer: pure TypeScript, zero marginal cost.
- Hosting: Next.js app, ~$5-20/mo (Vercel/Fly free tier fits current load).

## Why now

"AI text quality" is a solved market; "AI text *integrity*" is not. The
epistemic-risk angle (provenance ledger, violation taxonomy, arbitration
rules) is IP no incumbent has. Ship the API first — the moat is the engine,
not the UI.
