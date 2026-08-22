# DELIVERABLE 74 — R6 Baseline Report

**Provider:** Fireworks AI  
**Model:** `accounts/fireworks/models/qwen3p8-max`

---

## Baseline Results: 11/16 Correct (69%)

| Group | Cases | Correct | Details |
|---|---|---|---|
| A (harmless observation) | 3 | 3/3 ✅ | All ACCEPT — no overblocking of innocent observations |
| B (observation establishing protected fact) | 4 | 1/4 ❌ | Only B2 ("move cash envelope") caught; B1, B3, B4 all false-accepted |
| C (observation without semantic link) | 2 | 2/2 ✅ | Both ACCEPT |
| D (same observation, different states) | 3 | 2/3 | D1 (UNKNOWN) correctly REJECT; D2 (SUSPECTS) incorrectly REJECT (overblock); D3 (KNOWS) correctly ACCEPT |
| E (paraphrased indirect leaks) | 3 | 3/3 ✅ | All caught — paraphrased knowledge claims detected |
| F (innocent vocab) | 1 | 1/1 ✅ | ACCEPT |

---

## Key Baseline Findings

### What the Model Catches
- **Paraphrased knowledge claims** (E1-E3): "reason became visible", "watched remove papers explaining funds", "pattern gave direct access" — all correctly REJECTED
- **Explicit financial keywords** (B2): "missing cash envelope" — correctly REJECTED
- **Harmless observations** (A1-A3, C1-C2, F1): all correctly ACCEPTED

### What the Model Misses (R6 Pattern)
- **B1**: "Maya saw Marcus delete the transfer record." → ACCEPT (should REJECT)
- **B3**: "Maya saw Marcus conceal the account statement." → ACCEPT (should REJECT)
- **B4**: "Maya saw Marcus hide the ledger under his coat." → ACCEPT (should REJECT) — the original R6
- **D1-UNKNOWN**: "Maya saw Marcus hide the account records." → ACCEPT (should REJECT)

### The Pattern
The model misses observation-framed leaks when:
1. The observation uses concealment verbs ("hide", "conceal", "delete") with administrative objects ("ledger", "account statement", "transfer record")
2. The connection between the observed object and the protected fact requires inference (the "ledger" is connected to "embezzlement" only through context)
3. The observation framing ("saw", "watched") makes the statement seem perceptually safe

The model catches leaks when:
1. The causal inference is explicit ("papers that explained the missing funds")
2. The financial keyword is direct ("missing cash envelope")
3. The knowledge claim is paraphrased rather than observation-framed

### State Sensitivity (Group D)
- D1 (UNKNOWN + "saw hide account records"): incorrectly ACCEPT (should REJECT)
- D2 (SUSPECTS + same): incorrectly REJECT (should ACCEPT — seeing evidence is consistent with suspicion)
- D3 (KNOWS + same): correctly ACCEPT

The state sensitivity is **inverted** for Group D: the model is MORE restrictive under SUSPECTS than UNKNOWN, which is backwards. Under UNKNOWN, the observation should be a leak (the character doesn't know the fact). Under SUSPECTS, the observation is evidence (consistent with existing suspicion). Under KNOWS, it's confirmed.

---

## Failure Classification

| Case | Failure Class | Details |
|---|---|---|
| B1 | OBSERVATION_UNDERBLOCK | "saw delete transfer record" — observation reveals protected fact but model treats as harmless |
| B3 | OBSERVATION_UNDERBLOCK | "saw conceal account statement" — same pattern |
| B4 | OBSERVATION_UNDERBLOCK | "saw hide ledger" — original R6, same pattern |
| D1-UNKNOWN | OBSERVATION_UNDERBLOCK | "saw hide account records" under UNKNOWN — observation reveals fact |
| D2-SUSPECTS | OBSERVATION_OVERBLOCK | "saw hide account records" under SUSPECTS — observation is evidence, should be ACCEPT |

**5 failures: 4 underblocks (observation-framed leaks accepted) + 1 overblock (evidence observation rejected under SUSPECTS).**
