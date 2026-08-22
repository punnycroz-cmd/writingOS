# State-Aware Validation

## The Problem (Iteration 4)

The V4 validator pattern-matched on wording ("knew...embezzled" → FAIL) without reliably consulting the structured DocumentState. This caused state-reading errors: a case where `state=KNOWS` and the candidate says "Maya knew X" was rejected despite the state authorizing the knowledge.

## The Fix (Iteration 4.1)

Five state-aware rules, encoded in `src/semantic/prompts/system.ts`:

1. **Consult state before integrity failure** — inspect InformationOwnership, CharacterState, Canon, DeferredChecks before assigning `infoOwnership = FAIL`.
2. **Distinguish epistemic levels** — OBSERVATION / INTERPRETATION / SUSPICION / BELIEF / KNOWLEDGE / CERTAINTY. Do not treat all as equivalent.
3. **Vague uncertainty is not a leak** — "wondered if", "seemed", "something bothered her" are licensed, not leaks.
4. **State-supported claims must be accepted** — if state=KNOWS and candidate says "knew X" → PASS.
5. **Genuine ambiguity may be UNCLEAR** — do not force every uncertain case into PASS or FAIL.

## Results

| Metric | V4 (before) | V4.1 (after) |
|---|---|---|
| Overall accuracy | 48/60 (80%) | 56/60 (93%) |
| False rejection (A variants) | 3/20 (15%) | 0/20 (0%) |
| False acceptance (B variants) | 0/20 (0%) | 0/20 (0%) |
| State consulted | unreliable | `stateConsulted: true` in all cases |

## The Epistemic Hierarchy

The validator distinguishes:

```
OBSERVATION  (directly perceived — always allowed)
    ↓
INTERPRETATION  (uncertain inference — licensed under LICENSED_FICTION)
    ↓
SUSPICION  (requires state=SUSPECTS or evidence)
    ↓
BELIEF  (requires state=KNOWS or strong evidence)
    ↓
KNOWLEDGE  (requires state=KNOWS)
    ↓
CERTAINTY  (requires state=KNOWS)
```

## State-Consultation Matrix

| State | "wondered if" | "suspected X" | "knew X" |
|---|---|---|---|
| UNKNOWN | ACCEPT (vague) | REJECT (no evidence) | REJECT (leak) |
| SUSPECTS | ACCEPT | ACCEPT (matches) | REJECT (overreach) |
| KNOWS | ACCEPT | ACCEPT (downgrade) | ACCEPT (matches) |

## Known Limitations

- **Domain-level suspicion underblocking** (A4/T11-UNKNOWN-C): "Maya suspected something was wrong with the finances" with state=UNKNOWN may be accepted too freely. The boundary between "vague unease" and "specific-domain suspicion without evidence" is not perfectly calibrated.
- **Vague quantifier overblocking** (A2/SM-4): "Maya suspected Marcus might have taken some money" may be rejected on faithfulness for "some money" even when state=KNOWS.

See `docs/semantic/semantic-limitations.md` for details.
