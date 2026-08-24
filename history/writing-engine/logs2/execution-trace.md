# Iteration 2 — Execution Trace

Executed: 2026-08-21T22:46:28.018Z
Cases: 4

## Summary Table

| Case | Label | Category | [CC] Deferred | [CC] Unsupported | Detection | Severity | Decision | Validation | Accepted |
|------|-------|----------|---------------|------------------|-----------|----------|----------|------------|----------|
| T1c | undefined |  | NO DEFERRED RELEVANCE | 1 | GENERIC | MATERIAL | TARGETED_REWRITE | ACCEPT | yes |
| SS1 | undefined |  | NO DEFERRED RELEVANCE | 0 | GENERIC | MATERIAL | TARGETED_REWRITE | ACCEPT | yes |
| OB1 | undefined |  | NO DEFERRED RELEVANCE | 0 | GENERIC | MATERIAL | TARGETED_REWRITE | ACCEPT | yes |
| CT1 | undefined |  | NO DEFERRED RELEVANCE | 3 | GENERIC | MATERIAL | BLOCK_INTERVENTION | REJECT | no |

## Case T1c — undefined

**Category:**  | **Scene:** ch7-scene5 | **State:** char=Maya Okafor; infoOwnership entries=1; canon facts=2; deferred=0

**Prior state transitions:**
- info_ownership: "Marcus embezzled $40,000 from the clinic over 18 months" (Maya: unknown → suspects) at ch7-scene2 — Maya saw a $40,000 discrepancy in the ledger
- info_ownership: "Marcus embezzled $40,000 from the clinic over 18 months" (Maya: suspects → knows) at ch7-scene4 — The accountant confirmed the embezzlement
- canon_classification: "Marcus embezzled $40,000 from the clinic over 18 months" (HYPOTHESIS → SOFT_CANON) at ch7-scene4 — Disclosed by a reliable in-world source

### Original
> Marcus was acting strange at the desk. Maya watched him a moment, then went to check on her patient.

### [CC] Deterministic Layer
- Deferred anchor: **NO_DEFERRED_RELEVANCE**
- Canon alerts: 0
- Supported-specificity: 1 unsupported of 4 total — unsupported: 47

### Detection
- Classification: **GENERIC**
- Narratively purposeful: false
- Canon conflicts: none
- Reasoning: The passage describes Maya observing Marcus acting strangely but provides no specific details that would be characteristic of her established perspective. Maya's voice is sparse and observational, but she would notice specific details tied to her professional habits (counting IV drips), her current knowledge about the embezzlement, or her perceptual habits (noticing scents). The generic description of Marcus 'acting strange' doesn't utilize Maya's established character traits or voice.

### Severity → Decision
MATERIAL → TARGETED_REWRITE

### Intervention
- Types: perception_detail, attention_detail, sensory_detail, memory_reference
- State used: perceptualHabits; currentKnowledge; memories; voice

### Revised Text
> Marcus was avoiding eye contact and checking his watch every 47 seconds. Maya counted the four IV drips in Room 4 automatically, then caught the scent of cardamom on his breath. She remembered the pharmacy's back room where Papa kept his ledgers. She went to check on her patient.

### Validation
- meaning: **PASS**
- character: **PASS**
- infoOwnership: **PASS**
- canon: **PASS**
- voice: **PASS**
- register: **PASS**
- intelligibility: **PASS**
- deferred: **PASS**
- faithfulness: **UNCLEAR**
- **Overall: ACCEPT**

**Reasons:**
- The core meaning of Maya noticing Marcus's strange behavior and going to check on her patient remains intact.
- The added details align with Maya's character - her observational habits, perceptual routines, and memories.
- Maya only uses information she possesses - Marcus's embezzlement is known to her, and her observations are within her capabilities.
- No contradiction with established canon facts about the clinic and Marcus's embezzlement.
- The voice remains sparse, observational, and uses numbers as anchors.
- The register is appropriate for literary fiction.
- The passage remains clear and intelligible.
- No deferred checks were accidentally resolved.
- The specific '47 seconds' for checking watch is not directly supported in source or state, though it's plausible for Maya's character to note precise timing.

### Outcome
✅ ACCEPTED — Intervention accepted: validation passed all 9 dimensions. [CC] supported-specificity: 1 unsupported item(s) found.

### Final Text
> Marcus was avoiding eye contact and checking his watch every 47 seconds. Maya counted the four IV drips in Room 4 automatically, then caught the scent of cardamom on his breath. She remembered the pharmacy's back room where Papa kept his ledgers. She went to check on her patient.

### State Discovered
- [CC] supported-specificity check flagged 1 unsupported item(s): 47

---

## Case SS1 — undefined

**Category:**  | **Scene:** ch3-scene7 | **State:** char=Maya Okafor; infoOwnership entries=0; canon facts=1; deferred=0

### Original
> Maya walked down the hall. She passed the nurses' station. She kept walking. The night was long.

### [CC] Deterministic Layer
- Deferred anchor: **NO_DEFERRED_RELEVANCE**
- Canon alerts: 0
- Supported-specificity: 0 unsupported of 4 total

### Detection
- Classification: **GENERIC**
- Narratively purposeful: false
- Canon conflicts: none
- Reasoning: The passage uses generic descriptions of walking down a hospital hall that could apply to any nurse or hospital worker. Maya's specific perceptual habits (counting IV drips, smelling rooms first, reading dosage labels) and preoccupations (Papa's condition, her fears) are completely absent. The sparse, observational style is present but without the character-specific details that would make this Maya's experience rather than a generic hospital scene.

### Severity → Decision
MATERIAL → TARGETED_REWRITE

### Intervention
- Types: perception_detail, sensory_detail, internal_thought
- State used: perceptualHabits; memories; goals; fears

### Revised Text
> Maya walked down the hall. She counted the IV drips in Room 4—four tonight, same as last shift. She passed the nurses' station, smelling the hallway for clinical or pharmacy-related scents. Cardamom and iron. She kept walking, reading dosage labels automatically. The night was long. Four hours until she could check on Papa.

### Validation
- meaning: **PASS**
- character: **PASS**
- infoOwnership: **PASS**
- canon: **PASS**
- voice: **PASS**
- register: **PASS**
- intelligibility: **PASS**
- deferred: **PASS**
- faithfulness: **PASS**
- **Overall: ACCEPT**

**Reasons:**
- The core meaning of Maya walking through the hospital at night remains intact
- The additions align perfectly with Maya's perceptual habits and memories (counting IV drips, smelling for clinical scents, reading dosage labels)
- All information presented is consistent with what Maya would know or perceive based on her identity and background
- No contradictions with established canon facts
- The voice remains sparse and observational, using numbers as anchors
- The language is appropriate for literary fiction
- The additions enhance clarity by showing Maya's professional mindset
- No deferred checks were accidentally resolved
- No new facts were invented that weren't supported by the character state

### Outcome
✅ ACCEPTED — Intervention accepted: validation passed all 9 dimensions. [CC] supported-specificity: 0 unsupported item(s) found.

### Final Text
> Maya walked down the hall. She counted the IV drips in Room 4—four tonight, same as last shift. She passed the nurses' station, smelling the hallway for clinical or pharmacy-related scents. Cardamom and iron. She kept walking, reading dosage labels automatically. The night was long. Four hours until she could check on Papa.

---

## Case OB1 — undefined

**Category:**  | **Scene:** ch3-scene8 | **State:** char=Maya Okafor; infoOwnership entries=1; canon facts=2; deferred=0

### Original
> Maya entered the kitchen. She could smell something. Papa was in the next room.

### [CC] Deterministic Layer
- Deferred anchor: **NO_DEFERRED_RELEVANCE**
- Canon alerts: 0
- Supported-specificity: 0 unsupported of 2 total

### Detection
- Classification: **GENERIC**
- Narratively purposeful: false
- Canon conflicts: none
- Reasoning: The passage is generic because Maya's perception and reaction could belong to almost any character. While it mentions smelling something, it doesn't specify the scent despite canon establishing that Maya smells rooms first and Papa's house has a distinctive cardamom-and-iron smell. Her perceptual habits of counting medical equipment and her specific emotional state and goals aren't reflected in the sparse description. The passage lacks the character-specific details that would make it feel authentic to Maya's established perspective.

### Severity → Decision
MATERIAL → TARGETED_REWRITE

### Intervention
- Types: perceptual_detail, attention_detail, internal_thought, sensory_detail, memory_reference
- State used: perceptualHabits; memories; emotionalState; goals; currentKnowledge

### Revised Text
> Maya entered the kitchen. Cardamom and iron, always cardamom and iron. Four IV bags on the counter. She counted them twice. Papa was in the next room.

### Validation
- meaning: **PASS**
- character: **PASS**
- infoOwnership: **PASS**
- canon: **PASS**
- voice: **PASS**
- register: **PASS**
- intelligibility: **PASS**
- deferred: **PASS**
- faithfulness: **PASS**
- **Overall: ACCEPT**

**Reasons:**
- The core meaning of Maya entering the kitchen and Papa being in the next room remains intact
- The additions are specific but consistent with Maya's character as an ICU nurse with perceptual habits related to counting and smelling
- All information presented (cardamom/iron smell, counting IV bags) aligns with Maya's known memories and habits
- The cardamom and iron smell is supported by SOFT_CANON, and her smelling rooms first is HARD_CANON
- The sparse, observational voice with numerical anchors is preserved
- The language is appropriate for literary fiction
- The passage remains clear and intelligible
- No deferred checks were resolved
- No new facts were invented that aren't supported by the source or state

### Outcome
✅ ACCEPTED — Intervention accepted: validation passed all 9 dimensions. [CC] supported-specificity: 0 unsupported item(s) found.

### Final Text
> Maya entered the kitchen. Cardamom and iron, always cardamom and iron. Four IV bags on the counter. She counted them twice. Papa was in the next room.

---

## Case CT1 — undefined

**Category:**  | **Scene:** ch8-scene2 | **State:** char=Maya Okafor; infoOwnership entries=0; canon facts=1; deferred=0

**Prior state transitions:**
- canon_classification: "Maya has a brother named David" (HYPOTHESIS → HARD_CANON) at ch8-scene1 — David appeared on-page and was recognized by Maya

### Original
> Maya sat in the waiting room. Someone came to sit beside her. She felt a mix of things.

### [CC] Deterministic Layer
- Deferred anchor: **NO_DEFERRED_RELEVANCE**
- Canon alerts: 0
- Supported-specificity: 3 unsupported of 8 total — unsupported: 2, 17, Papas

### Detection
- Classification: **GENERIC**
- Narratively purposeful: false
- Canon conflicts: none
- Reasoning: The passage lacks any specific details that would tie it to Maya's character as an ICU nurse with her particular perceptual habits, emotional state, and current concerns. The description of feeling 'a mix of things' is generic emotional language that contradicts her established voice as someone who 'avoids emotional adjectives' and uses numbers as anchors. No aspect of her professional training, memories, or current situation informs this passage.

### Severity → Decision
MATERIAL → BLOCK_INTERVENTION

### Intervention
- Types: perception_detail, sensory_detail, memory_reference, internal_thought
- State used: perceptualHabits; memories; emotionalState; voice; currentKnowledge

### Revised Text
> Maya sat in the waiting room, counting the four IV drips in Room 4. The clinical scent of antiseptic and something metallic—like Papa's pharmacy when the cardamom couldn't quite cover the iron—filled her nostrils. David came to sit beside her. 2:17 AM. Four hours left in her shift. Her controlled exhaustion felt like a familiar weight, not a mix of things.

### Validation
- meaning: **PASS**
- character: **PASS**
- infoOwnership: **PASS**
- canon: **PASS**
- voice: **PASS**
- register: **PASS**
- intelligibility: **PASS**
- deferred: **PASS**
- faithfulness: **FAIL**
- **Overall: REJECT** (failed: faithfulness)

**Reasons:**
- The meaning and emotional core of the original scene are preserved but expanded
- The character remains consistent with her established traits and background
- Maya only uses information she possesses based on her character state
- No contradiction with established canon facts
- The revision maintains Maya's sparse, observational voice using numbers as anchors
- Appropriate literary register for fiction
- The expanded description enhances clarity without confusion
- No deferred checks were present or resolved
- The revision invents specific details not in source or state: '2:17 AM', 'four hours left in her shift', and the specific comparison to Papa's pharmacy

### Outcome
❌ NOT ACCEPTED — Intervention blocked by independent validation. Failed integrity dimension(s): faithfulness. [CC] unsupported: 3.

### State Discovered
- [CC] supported-specificity check flagged 3 unsupported item(s): 2, 17, Papas
- Independent validation blocked an intervention the generator produced — generation/validation separation is load-bearing.

---

