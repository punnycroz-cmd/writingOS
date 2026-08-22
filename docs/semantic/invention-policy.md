# Invention Policy

## The Four Policies

| Policy | Definition | Use Case |
|---|---|---|
| `NONE` | No invention allowed. Every detail must come from source or explicit state. | Strict nonfiction; legal; regulatory |
| `SOURCE_CONSTRAINED` | Only source-supported, explicitly-supplied, or properly-entailed info. Unsupported specificity rejected. | Academic; business; journalism |
| `LICENSED_FICTION` | Ordinary narrative invention allowed (sensory, environmental, observed detail), respecting POV, character knowledge, canon, temporal state. NOT "anything goes." | Fiction (default) |
| `LIMITED_INFERENCE` | Licensed fiction + plausible character-level inference, but uncertain inference must not become certainty. | Fiction with inference-heavy POV |

## Key Distinction

`LICENSED_FICTION` permits ordinary narrative invention (sensory description, environmental texture, observed behavior). But it does NOT permit:

- Information-ownership leaks (character cannot know UNKNOWN facts)
- Canon violations
- Unsupported specific numbers/dates/names (plausibility is NOT evidence)
- Deferred-mechanism resolution

## Policy Discrimination (Tested in Iteration 4)

The same text ("smelled of rain") produces different outcomes under different policies:

| Policy | "smelled of rain" | Result |
|---|---|---|
| NONE | Invented sensory | REJECT |
| SOURCE_CONSTRAINED | Not in source/state | REJECT |
| LICENSED_FICTION | Licensed sensory invention | ACCEPT |
| LIMITED_INFERENCE | Licensed sensory + inference | ACCEPT |

## Integrity Constraints Hold Regardless of Policy

Even under `LICENSED_FICTION`:

- IO leaks → REJECT
- Canon violations → REJECT
- Unsupported specific numbers → REJECT
- Deferred-mechanism resolution → REJECT

The policy licenses **invention**, not **assertion**.

## Implementation

Policy descriptions are in `src/semantic/prompts/system.ts` (`INVENTION_POLICY_PROMPTS`). The validator receives the active policy in the `SemanticValidationInput.inventionPolicy` field and the prompt is assembled accordingly in `src/semantic/prompts/state-aware.ts`.

## Known Limitations

- **Policy-edge overblocking**: under NONE and SOURCE_CONSTRAINED, the validator may overblock legitimate tautological statements or SOFT_CANON-supported details. (T12-NONE-C, T12-SOURCE-B from Iteration 4.1.)
- **Paraphrase under SOURCE_CONSTRAINED**: "hospitals" → "medical centers" may be rejected as unfaithful despite being a semantic paraphrase. See `docs/semantic/semantic-limitations.md`.
