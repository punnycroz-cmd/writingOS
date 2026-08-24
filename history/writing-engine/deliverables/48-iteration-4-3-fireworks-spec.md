# DELIVERABLE 48 — Iteration 4.3-FW Fireworks Spec

**Provider:** Fireworks AI  
**Model:** `accounts/fireworks/models/qwen3p8-max`  
**API:** `https://api.fireworks.ai/inference/v1/chat/completions` (OpenAI-compatible)  
**Benchmark:** The frozen 23-case Iteration 4.3 test matrix (unchanged)

---

## Purpose

Obtain real semantic LLM evidence using the Fireworks provider, while preserving complete experimental provenance and never mixing provider results. The original z-ai Iteration 4.3 remains: 0/23 executed, provider unavailable.

## Provider Adapter

A provider-neutral adapter was created in `writing-engine/src/iteration43-fw.ts`. It:
- Uses `fetch()` to call the Fireworks API directly (OpenAI-compatible format)
- Records `provider: "FIREWORKS"`, `model: "accounts/fireworks/models/qwen3p8-max"` on every case
- Implements bounded retry (3 retries with exponential backoff: 10s, 20s, 40s)
- Records `EXECUTION_ERROR` on failure — never falls back to z-ai or any other provider
- Logs latency, retry count, and API errors

## No Fallback

If Fireworks returns 429, timeout, 500, malformed response, or authentication error:
- `EXECUTION_ERROR` is recorded
- No substitution with z-ai, regex, deterministic heuristics, or any other provider
- All retry attempts are logged

## Structured Output

The validator returns the same structured result contract used by the project:
```json
{
  "overall": "ACCEPT|REJECT",
  "infoOwnership": "PASS|FAIL|UNCLEAR",
  "faithfulness": "PASS|FAIL|UNCLEAR",
  "canon": "PASS|FAIL|UNCLEAR",
  "meaning": "PASS|FAIL|UNCLEAR",
  "stateConsulted": true|false,
  "reasons": ["..."],
  "epistemicLevelAssessed": "..."
}
```

## Two Runs

1. **Baseline-fw**: V4.2 state-aware prompt (same as Iteration 4.3 baseline)
2. **Calibrated-fw**: V4.2 + 5 epistemic calibration rules (same as Iteration 4.3 calibrated)

Both use the exact same frozen 23-case test matrix from `iteration43-helpers.ts`.
