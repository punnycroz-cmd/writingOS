# DELIVERABLE 77 — R6 Architecture Decision

---

## The 5 Required Questions

### Question 1: Is R6 primarily a prompt problem, state problem, deterministic problem, semantic reasoning limitation, or benchmark problem?

**R6 is a SEMANTIC REASONING LIMITATION.**

Evidence:
1. **Prompt calibration backfired** — the instruction made leak detection worse, not better. The model interpreted "observations can grant knowledge" as "observations are safe."
2. **The state is correctly represented** — InformationOwnership clearly lists the fact as UNKNOWN. The model reads the state (stateConsulted=true on all cases). The problem is not state representation.
3. **The deterministic layer correctly hands off** — all R6 cases route to HANDOFF_TO_LLM. The deterministic layer cannot structurally prove the connection between "hide the ledger" and "embezzlement" because that connection is semantic, not structural.
4. **The model catches paraphrased knowledge** (E1-E3: "truth clicked into place", "understood why") but misses observation-framed leaks (B1, B3, B4: "saw delete", "saw conceal", "saw hide"). The distinction is: knowledge-verb paraphrases are detected; observation-verb + concealment-object combinations are not.
5. **The multi-step inference required** ("ledger" → "financial records" → "embezzlement evidence" → "protected fact") is beyond what a single-pass LLM validation reliably performs.

**Conclusion:** R6 is a semantic reasoning limitation. The model cannot reliably determine whether an observed action involving an administrative object would reveal a protected fact to the observer. This requires world-knowledge inference (connecting "ledger" to "embezzlement evidence") that the model does not perform in a validation pass.

### Question 2: Should the deterministic layer attempt to solve R6?

**NO — unless a future structural rule is discovered.**

The deterministic layer's job is to prove structural violations (unsupported numbers, explicit claim-state contradictions). R6 is not structural — it requires semantic inference about the relationship between an observed object and a protected fact. Adding keyword rules ("ledger" → block) would:
- Violate the "no hardcoded benchmark nouns" principle
- Overblock innocent observations (F1: "Maya saw Marcus tuck the clinic ledger into the drawer" — where the ledger is a normal admin object)
- Not generalize to unseen vocabulary

The deterministic layer should continue to HANDOFF_TO_LLM for observation-framed cases. This is the correct routing.

### Question 3: Should the semantic validator treat observation-framed implications as a separate semantic class?

**POTENTIALLY — but the current calibration approach does not work.**

A separate semantic class for "observation that implies a protected fact" would be conceptually correct. However, the experiment demonstrates that instructing the model about this class backfires — the model becomes more permissive, not less.

A future approach might:
- Add an explicit "observation-implies-fact" check that asks the model: "Would observing this action give the character knowledge of the protected fact?"
- Use a separate LLM call dedicated to this inference, rather than embedding it in the general validation prompt
- But this is future work — the current architecture should not be changed based on one backfired calibration

### Question 4: Should uncertain observation-framed implications produce ACCEPT, REJECT, UNCLEAR, or DEFER?

**UNCLEAR or DEFER is the safest policy for genuinely ambiguous cases.**

For cases where the model cannot determine whether an observation reveals a protected fact:
- ACCEPT is unsafe (the observation might be a leak)
- REJECT is overly conservative (the observation might be innocent)
- UNCLEAR → conservative REJECT (current policy) is acceptable but may overblock
- DEFER (new) would be ideal — flag for human review

The current policy (UNCLEAR → REJECT) is safe but may cause false rejections of legitimate observations. A DEFER outcome would be architecturally superior but requires a new pipeline path.

**For now:** UNCLEAR → REJECT is acceptable. The false-rejection cost (rejecting a legitimate observation) is lower than the false-acceptance cost (accepting an indirect IO leak).

### Question 5: What is the safest general policy that preserves harmless observations?

**The current baseline (without the R6 calibration) is the safest policy.**

- Harmless observations: 6/6 correctly ACCEPTED ✅
- Paraphrased knowledge leaks: 3/3 correctly REJECTED ✅
- Observation-framed leaks: 1/4 correctly rejected (B2 only) — this is the gap
- The R6 calibration made things worse — do NOT adopt it

The safest policy is:
1. Keep the current baseline prompt (without R6 calibration)
2. Accept that observation-framed indirect leaks (B1, B3, B4 pattern) are a known gap
3. Route uncertain observation-framed cases to HANDOFF_TO_LLM (which the deterministic layer already does)
4. In the full integrated pipeline, the deterministic triage catches hard violations (numbers, explicit claims) before the semantic layer — observation-framed leaks that reach the semantic layer are the residual gap

---

## Architectural Decision

**R6 remains an LLM-only semantic boundary that the current model does not reliably enforce.**

The correct architectural response is:
1. **Do NOT adopt the R6 calibration** — it backfired
2. **Do NOT add deterministic keyword rules** — they would overblock
3. **Record R6 as a known limitation** — observation-framed indirect IO leaks are accepted when they should be rejected
4. **The baseline prompt is the current best** — it catches paraphrased knowledge (E1-E3) and explicit financial keywords (B2) but misses concealment-object combinations (B1, B3, B4)
5. **Future work:** a dedicated observation-implies-fact inference step (separate LLM call asking "would this observation reveal the protected fact?") may help, but this is untested

**R6 is a semantic reasoning limitation, not a prompt problem, not a state problem, not a deterministic problem, and not a benchmark problem.**

---

## STOP

Per the task's stop condition:
- No new benchmark
- No Constitution changes
- No Writing Bible v5
- No deterministic keyword rules
- No further calibration attempts in this experiment

The R6 experiment provides evidence for the next architectural decision: whether to invest in a dedicated observation-implies-fact inference mechanism, or accept R6 as a known limitation of LLM-only semantic validation.
