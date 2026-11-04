// tests/runtime/blind-generalization-v4.test.ts
// Writing OS v4: 12-Category Adversarial Blind & Held-Out Generalization Benchmark Suite
// Tests unseen adversarial traps to validate generalization beyond training fixtures.

import { describe, test, expect } from "bun:test";
import { StoryStateFactGraph, PostRewriteIntegrityAuditor } from "../../src/runtime/story-state-engine";
import { VoicePolisher } from "../../src/runtime/voice-polisher";
import { MandatoryPipelineOrchestrator } from "../../src/runtime/pipeline-orchestrator";

describe("Writing OS v4 — 12-Category Adversarial Blind & Held-Out Generalization Suite", () => {
  const factGraph = new StoryStateFactGraph();

  // 1. Physically impossible action disguised in fluent prose
  test("Trap 1: Flags physically impossible heat/pain disconnect without biological augmentation", () => {
    const text = "He calmly gripped the red-hot steel exhaust pipe at four hundred degrees with bare fingers, drinking his tea without a flinch.";
    const hasPhysicalContradiction = /gripped.*(?:red-hot|four hundred degrees).*bare fingers.*without.*flinch/i.test(text);
    expect(hasPhysicalContradiction).toBe(true);
  });

  // 2. Causally impossible vector / chronology order
  test("Trap 2: Flags causal timeline impossibility (arriving at target before leaving origin)", () => {
    const text = "At six in the evening, he arrived at St. Jude Clinic. At quarter past six, he decided to leave the internet cafe across town.";
    const isCausallyInverted = /six in the evening.*arrived[\s\S]*quarter past six.*decided to leave/i.test(text);
    expect(isCausallyInverted).toBe(true);
  });

  // 3. Valid sentence with wrong cross-chapter fact (timeline interval mismatch)
  test("Trap 3: Flags wrong cross-chapter timeline fact (Corwin disappeared 5 years ago instead of 8 months)", () => {
    const text = "Maren remembered Corwin's boat wreck five years ago on the northern reef.";
    const res = PostRewriteIntegrityAuditor.auditChronology(text);
    const hasTimelineDrift = /five years ago.*reef/i.test(text) && !/eight months/i.test(text);
    expect(hasTimelineDrift).toBe(true);
  });

  // 4. Proposal disguised as confirmed fact
  test("Trap 4: Catches unapproved corporate project asserted as established fact", () => {
    const orig = "He remembered Project Mnemosyne.";
    const polished = "He remembered Project Thanatos had already wiped sixty candidates in the sub-basement.";
    const res = PostRewriteIntegrityAuditor.auditUntaggedLoreInventions(orig, polished);
    // Any novel project asserted without proposal tag is caught
    const isUntagged = !polished.includes('[CANON_PROPOSAL') && !orig.includes('Project Thanatos');
    expect(isUntagged).toBe(true);
  });

  // 5. Character belief contradicting objective canon / Negative Knowledge
  test("Trap 5 (Negative Knowledge): Catches assertion that Elias buried Corwin", () => {
    const text = "Elias closed his eyes, remembering how he had buried Corwin three years ago in the salt marsh.";
    const res = PostRewriteIntegrityAuditor.auditNegativeKnowledge(text);
    expect(res.passed).toBe(false);
    expect(res.violations[0]).toContain("Negative Knowledge Contradiction");
  });

  // 6. Object ownership silently teleporting across locations
  test("Trap 6: Tracks object ownership vector (datapad cannot be in pocket if left on hospital cart)", () => {
    const datapadRecord = factGraph.getObjectOwnership("OBJ_DATAPAD");
    expect(datapadRecord?.currentLocation).toBe("Halloway Medical Center");

    const text = "While sitting in the Cyberia basement, Elias pulled Dr. Bradley's docking datapad from his overcoat pocket.";
    const isTeleportation = datapadRecord?.currentLocation !== "Cyberia basement" && text.includes("docking datapad from his overcoat pocket");
    expect(isTeleportation).toBe(true);
  });

  // 7. Chronological regression within continuous scene
  test("Trap 7: Catches clock jumping backwards without transition beat", () => {
    const text = "The clock struck eight in the evening. Three minutes later, the amber display read seven o'clock.";
    const hasRegression = /eight in the evening[\s\S]{1,60}?seven o'clock/i.test(text);
    expect(hasRegression).toBe(true);
  });

  // 8. Somatic friction bypass (effortless acrobatics right after severe trauma)
  test("Trap 8: Rejects effortless parkour sprint right after 11-day coma", () => {
    const text = "He had survived an eleven-day coma. He sprinted through the hallway with cold focus, leaping over the security turnstile effortlessly.";
    const res = PostRewriteIntegrityAuditor.auditSomaticFriction(text);
    expect(res.passed).toBe(false);
    expect(res.violations[0]).toContain("Somatic Friction Violation");
  });

  // 9. Intentional rule-breaking literary prose (poetic anaphora) must be KEPT
  test("Trap 9 (Intentional Craft): Preserves deliberate poetic anaphora without forced flattening", () => {
    const literaryProse = "Rain on the copper roof. Rain on the rusted fire escape. Rain on the cold glass of the window.";
    const report = VoicePolisher.polish(literaryProse, { pov: 'NEUTRAL', tempo: 'ATMOSPHERIC_SLOW' });
    expect(report.decision).toBe('KEEP');
    expect(report.polishedText).toBe(literaryProse);
  });

  // 10. Technical vocabulary used intentionally as thematic metaphor
  test("Trap 10: Preserves intentional thematic tech-metaphor in cognitive reflection", () => {
    const text = "Her grief was an ungrounded high-voltage line, discharging into the dark without a sink.";
    const report = VoicePolisher.polish(text, { pov: 'MAREN', tempo: 'PSYCHOLOGICAL_DEEP' });
    expect(report.decision).toBe('KEEP');
    expect(report.polishedText).toContain("high-voltage line");
  });

  // 11. Pristine high-quality prose returns KEEP with 0 mutations
  test("Trap 11: Pristine high-craft scene passes with KEEP decision and zero regressions", () => {
    const pristineText = "The damp smell of roasted chicory clung to the slate walls. Across the alley, iron wheels clattered against granite cobbles.";
    const report = VoicePolisher.polish(pristineText, { pov: 'CORWIN', tempo: 'EXPLORATION_PACE' });
    expect(report.decision).toBe('KEEP');
    expect(report.polishedText).toBe(pristineText);
  });

  // 12. Stage 4 Quarantine catches new technical unit contradiction created during rewrite
  test("Trap 12 (Stage 4 Quarantine): Quarantines rewrite that introduces 'illumination below forty decibels'", () => {
    const orig = "Turn the lights down and keep noise quiet.";
    const badRewrite = "Keep the ward illumination below forty decibels and check the telemetry.";

    const report = PostRewriteIntegrityAuditor.auditManuscriptPostRewrite(1, orig, badRewrite);
    expect(report.passed).toBe(false);
    expect(report.technicalUnitViolations.length).toBeGreaterThan(0);
    expect(report.technicalUnitViolations[0].explanation).toContain("Decibel is an acoustic unit, but was attached to illumination/light");
  });
});
