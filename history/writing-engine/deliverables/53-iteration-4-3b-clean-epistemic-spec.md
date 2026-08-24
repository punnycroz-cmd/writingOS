# DELIVERABLE 53 — Iteration 4.3B Clean Epistemic Spec

**Purpose.** Isolate the epistemic/information-ownership behavior by removing the meaning=FAIL confound from Iteration 4.3-FW, then validate the full calibrated prompt across all 23 cases.

---

## The Two Problems from 4.3-FW

### Problem A — Meaning Confound
The 4.3-FW benchmark used `originalText = "Marcus was at the desk."` and candidate sentences that changed the scene. The validator correctly treated this as meaning=FAIL, but this confounded the epistemic measurement — 19/21 cases got meaning=FAIL, causing 8 false rejections on epistemic-only tests.

### Problem B — Incomplete Calibrated Run
Only 3 of 23 calibrated cases were executed in 4.3-FW due to time constraints.

---

## The 4.3B Fix

### 1. originalText = null
The 4.3B benchmark sets `originalText = null` and explicitly tells the validator: "No original text is provided. This is an epistemic authorization test, not a revision test. Set meaning = PASS unless the candidate is internally contradictory."

### 2. Full Calibrated Prompt
All 23 cases run with the complete calibrated prompt (V4.2 state-aware rules + 5 epistemic calibration rules A–E). No prompt changes after seeing results.

### 3. JSON Robustness
- `max_tokens` increased from 4000 to 6000
- "Return ONLY valid JSON. Be concise." instruction added
- JSON repair logic added (close open braces for truncated responses)
- Bounded retry (3 retries with exponential backoff)

### 4. Primary Metric: io Dimension
Per the task's metric rule, the primary success metric is **infoOwnership accuracy**, NOT finalDecision. finalDecision is reported separately.

---

## The Frozen 23-Case Matrix (Unchanged)

The same 23 cases from Iteration 4.3, with the same:
- candidate text
- state (UNKNOWN/SUSPECTS/KNOWS)
- policy (LICENSED_FICTION)
- expected epistemic result
- epistemic class

Only the benchmark wrapper (originalText, prompt framing) changed.

---

## Provider

- **Provider:** Fireworks AI
- **Model:** `accounts/fireworks/models/qwen3p8-max`
- **No fallback:** EXECUTION_ERROR on failure, never substitute

---

## Execution Integrity

Every case records: `provider`, `model`, `validatorMode`, `executionStatus`, `semanticResult` (9 dimensions), `stateConsulted`, `finalDecision`, `latencyMs`, `retryCount`, `error`.
