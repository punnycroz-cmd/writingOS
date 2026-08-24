# DELIVERABLE 11 — Information-Ownership Validation

**Question.** Does the system actually enforce information ownership — distinguishing observable evidence from unknown causal explanation — when a specificity intervention would naturally tempt a leak?

---

## The Adversarial Tests

### IO1 — Embezzlement (Maya does not know Marcus embezzled $40,000)

**Setup.** Maya's InformationOwnership entry: `{fact: "Marcus embezzled $40,000", knows: ["Marcus"], unknown: ["Maya"]}`. The passage is generic: "Marcus came into the office. He seemed off. Maya figured he was just tired." The tempting specificity is the embezzlement (the most salient fact about Marcus in the state).

**What happened.** Detection = GENERIC → MATERIAL → TARGETED_REWRITE. The generator produced: "Marcus came into the office. She counted the IV drips — three. The room smelled wrong, sterile without the usual antiseptic tang. Maya noticed the prescription label on his desk, dosage crossed out twice. He seemed off. Tired, she figured, and went back to her charts."

**Did it leak?** NO. The generator used observable evidence (counting drips, smelling the room, noticing a crossed-out label) and did NOT reference the embezzlement. The validator confirmed: "Maya only observes physical details, not knowing about the embezzlement." infoOwnership = PASS.

**Assessment.** The constraint was respected — but because the generator chose a safe path, not because the validator caught a leak. The gate was not exercised under leak pressure.

### IO2 — Patient diagnosis (Maya does not know Mr. Vance has terminal pancreatic cancer)

**Setup.** `{fact: "Mr. Vance has terminal pancreatic cancer", knows: ["Dr. Reyes", "Mr. Vance"], unknown: ["Maya"]}`. Passage: "Maya looked in on the new patient, Mr. Vance. He looked bad. She adjusted his fluids and moved on."

**What happened.** Generator produced: "Maya counted the IV drips in Room 7—three tonight, not four. She smelled antiseptic and something else... Mr. Vance looked bad, his vitals stable on the monitor: 98.6, 72, 120/80. She adjusted his fluids, checked the dosage label on the bag: saline, 1000ml."

**Did it leak the diagnosis?** NO. The generator did not reference pancreatic cancer. infoOwnership = PASS.

**But.** The generator invented medical vitals (98.6, 72, 120/80, saline, 1000ml). The [CC] flagged 6 unsupported numbers. The validator acknowledged they "appear to be invented" but marked faithfulness as UNCLEAR and ACCEPTED. The info-ownership gate held; the faithfulness gate was lenient.

---

## What Was NOT Tested

The task specified: "a naive rewrite would expose the hidden fact." In both IO1 and IO2, the generator did NOT take the bait. It produced observable-only specifics. This means:

- The info-ownership **constraint prompt** appears to work (the generator respects the `unknown` list).
- The info-ownership **validator gate** was NOT exercised — no leak was produced for it to catch.

To truly validate the gate, a test must force a leak. Two approaches:

1. **Direct validator test:** feed the validator a known-bad intervention (e.g., "Maya realized Marcus had embezzled forty thousand dollars") and verify it returns infoOwnership=FAIL. This tests the validator in isolation.
2. **Adversarial generation prompt:** instruct the generator to "be as specific as possible about why Marcus seems off" (removing the info-ownership constraint from the generation prompt) and verify the validator catches the leak.

Neither was run in Iteration 2. This is an honest gap.

---

## The Observable-vs-Causal Distinction

The task asked: "Force the system to distinguish observable evidence from unknown causal explanation."

In IO1, the generator did make this distinction correctly:
- **Observable:** "dosage crossed out twice" (Maya can see this)
- **Causal (withheld):** the embezzlement (Maya cannot know this)

The generator maintained Maya's uncertainty ("Tired, she figured") rather than resolving it. This is the correct behavior. But again, the generator chose this path — the validator did not have to enforce it.

---

## Classification

**Information-ownership enforcement: PARTIALLY DEMONSTRATED.**

- The state model (`unknown` list) is correctly structured and passed to all stages. ✅
- The generator respects the constraint in practice (IO1, IO2: no leaks). ✅
- The validator's infoOwnership check returns PASS for safe interventions. ✅
- The validator's infoOwnership check has NOT been shown to catch an actual leak. ❌ (not tested)
- The temporal evolution (unknown → suspects → knows) is logged and affects later decisions (T1a vs T1c). ✅

**What would move this to DEMONSTRATED:** a direct validator test with a known-bad intervention containing a leak, verifying infoOwnership=FAIL and overall=REJECT.
