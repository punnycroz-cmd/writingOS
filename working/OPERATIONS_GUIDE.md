# WRITING OS — OPERATIONS & RUNBOOK GUIDE (v1.0.0)

**Scope:** Production Deployment, Multi-Tier Configuration, and Incident Maintenance  

---

## 1. THE 4-TIER CONFIGURATION MODEL

Writing OS enforces strict separation between immutable laws, versioned policies, register packs, and runtime infrastructure:

1. **Immutable Layer (Constitution v1.0.0):**
   * Absolute laws (Articles I–VIII). Never modified by runtime config.
2. **Versioned Policy Layer (PolicyRegistry):**
   * Calibrated thresholds (`qualityThreshold = 0.80`, `maxRepairAttempts = 3`, token budgets).
3. **Register Specialization Layer (Register Packs):**
   * Domain rules (`FICTION`, `ACADEMIC`, `BUSINESS`, `TECHNICAL`, `LEGAL`, `GENERAL`).
4. **Runtime Infrastructure Layer (Adapters):**
   * Model provider endpoints (Anthropic, OpenAI, Local Llama), database backends (SQLite, PostgreSQL, Raft).

---

## 2. STANDARDIZED OPERATIONAL FAILURE MODES

When an authoring or state operation cannot proceed, Writing OS emits one of 13 standardized failure modes:

| Failure Mode | Trigger Condition | System Behavior |
|---|---|---|
| `TASK_AMBIGUOUS` | Missing critical context in task prompt | Triggers user clarification dialog |
| `STATE_INSUFFICIENT` | Required entity missing from state graph | Enforces safe abstention (Article IV) |
| `STATE_CONFLICT` | Contradiction detected in ground truth graph | Halts commit and requests human reconciliation |
| `GENERATION_FAILURE` | Model provider error / rate limit | Retries on backup provider adapter |
| `VALIDATION_FAILURE` | Candidate violates Canon or quality rubric | Routes to Targeted Local Repair engine |
| `REPAIR_FAILURE` | 3 repair attempts exhausted without pass | Triggers structured Safe Handoff |
| `STALE_PLAN` | Dependent state modified mid-generation | Recompiles plan against new state version |
| `STALE_CANDIDATE` | Concurrent edit occurred before commit | Rejects commit via OCC and revalidates |
| `CONCURRENCY_CONFLICT` | Concurrent conflicting transactions on entity | Rollback to last valid checkpoint |
| `REQUIREMENT_CONFLICT` | Contract rules contradict Canon constraints | Tier 1 (Truth) overrides contract constraint |
| `HUMAN_HANDOFF` | Automated loop terminated cleanly | Hands off structured diff to author |
| `BUDGET_EXCEEDED` | Token or latency budget ceiling reached | Terminates loop without token burning |
| `UNKNOWN_EXTERNAL_OUTCOME` | External system response indeterminate | Marks operation DEFERRED; does not guess |

---

## 3. INCIDENT-DRIVEN MAINTENANCE RUNBOOK

Future system maintenance follows the strict **Hierarchy of Change**:

$$\text{Production Incident} \longrightarrow \text{Evidence Card} \longrightarrow \text{Minimal Code/Policy Change} \longrightarrow \text{Conformance Regression} \longrightarrow \text{Release}$$

1. **Log Failure Trace:** Extract full state snapshot and `OperationContext` from Audit Ledger.
2. **Register Evidence Card:** Record the failure in `EVIDENCE_REGISTRY.md`.
3. **Apply Minimal Fix:** Adjust Policy threshold or repair prompt in the specific Register Pack.
4. **Execute Conformance Suite:** Run `bun test tests/core/p29-release-conformance.test.ts`.
5. **Tag Point Release:** Update `RELEASE_MANIFEST_v1.0.0.json` with new content hash.
