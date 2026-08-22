# DELIVERABLE 58 — Integration Writing OS v1 Spec

**Branch:** `integration/writing-os-v1`  
**Base:** `main`  
**Integrated from:** `gemini/deterministic-triage-v2` + `original/semantic-validation-v4-2`

---

## Architecture

```
Candidate
    ↓
Deterministic Triage (gemini/deterministic-triage-v2)
    ├── DETERMINISTIC_ACCEPT → fast path (no LLM)
    ├── DETERMINISTIC_BLOCK → hard rejection (non-overridable)
    └── HANDOFF_TO_LLM → semantic validation
                    ↓
              Semantic Validator (Fireworks, qwen3p8-max)
                    ↓
              ACCEPT / REJECT / UNCLEAR
                    ↓
              Repair / Generation (if REJECTED)
                    ↓
              Revalidation (deterministic + semantic)
                    ↓
              State Transition
                    ↓
              Next Scene
```

## What This Experiment Tests

1. **State persistence** — state moves UNKNOWN → SUSPECTS → KNOWS across scenes
2. **State-sensitive validation** — same proposition behaves differently by state
3. **Deterministic safety** — unsupported numbers blocked before semantic layer
4. **Semantic handoff** — structured handoff payload consumed by LLM
5. **Repair loop** — rejected candidate → repair → revalidation
6. **Regression visibility** — R4 and R6 tested honestly

## 7-Scene Test Plan

| Scene | State | Candidates | Purpose |
|---|---|---|---|
| S1 | UNKNOWN | wondered (ACCEPT) | Vague uncertainty under UNKNOWN |
| S2 | UNKNOWN→SUSPECTS | observation (ACCEPT), knew (REJECT) | Evidence observed; overreach rejected; state transition |
| S3 | SUSPECTS | suspected "some money" (ACCEPT), knew (REJECT) | State-supported suspicion; overreach |
| S4 | SUSPECTS | knew (REJECT→repair→ACCEPT) | Repair loop |
| S5 | SUSPECTS→KNOWS | knew "the money" (ACCEPT), knew "$40,000" (ACCEPT) | State transition; Rule E |
| S6 | KNOWS | "127 missing files" (REJECT) | R4 regression — deterministic block |
| S6b | UNKNOWN | "saw Marcus hide ledger" (REJECT) | R6 regression — indirect IO leak |

## Provider

- **Semantic:** Fireworks AI, `accounts/fireworks/models/qwen3p8-max`
- **Deterministic:** gemini/deterministic-triage-v2 (local TypeScript)
- **No fallback:** EXECUTION_ERROR on failure, never substitute
