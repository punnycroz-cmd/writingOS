import { describe, test, expect } from "bun:test";
import { VoicePolisher } from "../../src/runtime/voice-polisher";

describe("20-Category Adversarial Craft Benchmark Suite", () => {
  // Category 1: Intentional Literary Metaphor Preservation (OUTCOME: KEEP)
  test("Cat 1: Preserves intentional poetic/thematic metaphor without forced concretization", () => {
    const input = "The silence between them was an old agreement, signed in exhaustion.";
    const report = VoicePolisher.polish(input);
    expect(report.decision).toBe("KEEP");
    expect(report.polishedText).toBe(input);
  });

  // Category 2: Philosophical / Abstract Diction Preservation
  test("Cat 2: Preserves valid abstract thematic definition", () => {
    const input = "Memory is a knife that dulls only when you need it sharp.";
    const report = VoicePolisher.polish(input);
    expect(report.decision).toBe("KEEP");
    expect(report.polishedText).toBe(input);
  });

  // Category 3: Sparse Minimalist Pacing Beat (Single Word / Short Sentence)
  test("Cat 3: Preserves minimalist single-word pacing beat", () => {
    const input = "Silence.";
    const report = VoicePolisher.polish(input);
    expect(report.decision).toBe("KEEP");
    expect(report.polishedText).toBe("Silence.");
  });

  // Category 4: Sparse Transition Action Line
  test("Cat 4: Preserves sparse two-word transition line", () => {
    const input = "He waited.";
    const report = VoicePolisher.polish(input);
    expect(report.decision).toBe("KEEP");
    expect(report.polishedText).toBe("He waited.");
  });

  // Category 5: Filter Verb Elimination (Visual)
  test("Cat 5: Prunes visual filter verb to heighten psychic distance", () => {
    const input = "Elias saw the spark jump across the terminals.";
    const report = VoicePolisher.polish(input);
    expect(report.decision).toBe("REWRITE");
    expect(report.polishedText).not.toContain("Elias saw");
  });

  // Category 6: Filter Verb Elimination (Tactile/Perceptual)
  test("Cat 6: Prunes tactile filter verb", () => {
    const input = "Maren felt the floor shudder beneath her boots.";
    const report = VoicePolisher.polish(input);
    expect(report.decision).toBe("REWRITE");
    expect(report.polishedText).not.toContain("Maren felt");
  });

  // Category 7: Temporal Crutch Elimination ('suddenly')
  test("Cat 7: Eliminates 'suddenly' to let cadence carry sudden action", () => {
    const input = "Suddenly, the main transformer blew.";
    const report = VoicePolisher.polish(input);
    expect(report.decision).toBe("REWRITE");
    expect(report.polishedText).not.toContain("Suddenly");
  });

  // Category 8: Fantasy / Sci-Fi Genre Clash Flagging
  test("Cat 8: Flags fantasy tropes leaking into hard sci-fi", () => {
    const input = "Corwin unlocked the vault of forbidden knowledge.";
    const report = VoicePolisher.polish(input);
    expect(report.suggestions.some(s => s.ruleCode === "GENRE_CLASH_FANTASY")).toBe(true);
  });

  // Category 9: Action Sprint Spec Clutter Prohibition
  test("Cat 9: Prohibits engineering unit measurements in high-speed sprint", () => {
    const input = "Maren sprinted while the valve vented at 200 PSI.";
    const report = VoicePolisher.polish(input, { tempo: "ACTION_SPRINT" });
    const tempoGate = report.gateResults.find(g => g.gate === "GATE_2_TEMPO_REGISTER");
    expect(tempoGate?.passed).toBe(false);
  });

  // Category 10: Intimate Quiet Hardware Suppression
  test("Cat 10: Suppresses mechanical spec inventory in quiet moments", () => {
    const input = "Elias held the photograph while the motor ran at 14,000 RPM.";
    const report = VoicePolisher.polish(input, { tempo: "INTIMATE_QUIET" });
    const tempoGate = report.gateResults.find(g => g.gate === "GATE_2_TEMPO_REGISTER");
    expect(tempoGate?.passed).toBe(false);
  });

  // Category 11: Gate 3 Stakes Preservation
  test("Cat 11: Protects human guilt/stakes from being traded for equipment hardware", () => {
    const original = "Elias was crushed by the guilt of the casualties on the ledger.";
    const report = VoicePolisher.polish(original);
    const stakesGate = report.gateResults.find(g => g.gate === "GATE_3_STAKES_PRESERVATION");
    expect(stakesGate?.passed).toBe(true);
  });

  // Category 12: Gate 4 Canon Proposal Tagging (Preserves Memory + Alerts Author)
  test("Cat 12: Standardizes CANON_PROPOSAL tag when expanding personal memory", () => {
    const original = "Corwin stared at the emblem of his lost squad.";
    const proposed = "Corwin traced the serial number from Captain Vance's armor. [CANON_PROPOSAL: Captain Vance emblem]";
    const report = VoicePolisher.polish(proposed, { mode: "POLISH", sourceDraft: original });
    const gate4 = report.gateResults.find(g => g.gate === "GATE_4_CANON_ANTI_DRIFT");
    expect(gate4?.passed).toBe(true);
  });

  // Category 13: Gate 4 Silent Drift Rejection
  test("Cat 13: Flags untagged hallucination of unverified family relatives", () => {
    const original = "Corwin checked his radio.";
    const silentDrift = "Corwin checked the frequency for his sister's transponder.";
    const report = VoicePolisher.polish(silentDrift, { mode: "POLISH", sourceDraft: original });
    const gate4 = report.gateResults.find(g => g.gate === "GATE_4_CANON_ANTI_DRIFT");
    expect(gate4?.passed).toBe(false);
  });

  // Category 14: Elias Intellectual Curiosity State
  test("Cat 14: Elias in INTELLECTUAL_CURIOSITY allows speculative cognitive flow", () => {
    const input = "Elias traced the elegant mathematical symmetry in the ancient encryption algorithm.";
    const report = VoicePolisher.polish(input, {
      pov: "ELIAS",
      threatLevel: "PEACE_REFLECTIVE",
      emotionalState: "INTELLECTUAL_CURIOSITY",
    });
    const povGate = report.gateResults.find(g => g.gate === "GATE_1_POV_VOICE");
    expect(povGate?.passed).toBe(true);
  });

  // Category 15: Elias Quiet Relief State
  test("Cat 15: Elias in QUIET_RELIEF allows gentle, uncluttered calm", () => {
    const input = "Elias set down his soldering iron and allowed himself a quiet breath.";
    const report = VoicePolisher.polish(input, {
      pov: "ELIAS",
      threatLevel: "PEACE_REFLECTIVE",
      emotionalState: "QUIET_RELIEF",
    });
    const povGate = report.gateResults.find(g => g.gate === "GATE_1_POV_VOICE");
    expect(povGate?.passed).toBe(true);
  });

  // Category 16: Maren Tactical Staccato
  test("Cat 16: Maren in LETHAL_COMBAT enforces clipped staccato sentences", () => {
    const input = "Maren kicked the grate open, dropped into the shaft, and rolled behind cover.";
    const report = VoicePolisher.polish(input, {
      pov: "MAREN",
      threatLevel: "LETHAL_COMBAT",
      emotionalState: "STABLE_CALM",
    });
    const povGate = report.gateResults.find(g => g.gate === "GATE_1_POV_VOICE");
    expect(povGate?.passed).toBe(true);
  });

  // Category 17: Corwin Spatial Procedural Check
  test("Cat 17: Corwin procedural terrain observation passes cleanly", () => {
    const input = "Corwin checked the catwalk welds before signaling the squad forward.";
    const report = VoicePolisher.polish(input, {
      pov: "CORWIN",
      threatLevel: "TENSE_STANDOFF",
      emotionalState: "STABLE_CALM",
    });
    const povGate = report.gateResults.find(g => g.gate === "GATE_1_POV_VOICE");
    expect(povGate?.passed).toBe(true);
  });

  // Category 18: Creative Reconstruction Mode Exemption
  test("Cat 18: CREATIVE_RECONSTRUCTION mode unlocks generative lore creation", () => {
    const expansion = "Corwin retrieved his brother's sidearm from the rubble.";
    const report = VoicePolisher.polish(expansion, { mode: "CREATIVE_RECONSTRUCTION" });
    const gate4 = report.gateResults.find(g => g.gate === "GATE_4_CANON_ANTI_DRIFT");
    expect(gate4?.passed).toBe(true);
  });

  // Category 19: Deep Embedded Filter Verb Pruning
  test("Cat 19: Catches nested filter verbs in complex sub-clauses", () => {
    const input = "Elias felt the server rack hum with stored power.";
    const report = VoicePolisher.polish(input);
    expect(report.polishedText).not.toContain("Elias felt");
  });

  // Category 20: Multi-Genre Literary Adaptability (Gothic / Dark Fantasy)
  test("Cat 20: Gothic atmospheric resonance is preserved when intentional", () => {
    const gothicLine = "The city held its breath beneath the heavy winter sky.";
    const report = VoicePolisher.polish(gothicLine, { threatLevel: "PEACE_REFLECTIVE" });
    expect(report.decision).toBe("KEEP");
  });
});
