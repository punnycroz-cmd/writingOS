// tests/runtime/macro-structural-benchmark.test.ts
// Writing OS v3.1 — Macro Structural 10-Category Benchmark Suite

import { describe, test, expect } from "bun:test";
import { MacroStructuralEvaluator } from "../../src/runtime/macro-structural-evaluator";

describe("Writing OS v3.1 — Macro Structural Benchmark Suite", () => {
  // Category 1: Arithmetic & Count Contradiction
  test("Cat 1: Flags internal arithmetic mismatch when asserted count disagrees with listed items", () => {
    const text = `He counted four letters on the frosted glass: M-A-R-E-N.`;
    const report = MacroStructuralEvaluator.evaluateChapter(text);
    
    expect(report.violations.some(v => v.code === "STRUCT_01_ARITHMETIC_CONTRADICTION")).toBe(true);
    expect(report.status).toBe("NEEDS_REVISION");
  });

  // Category 2: Dialogue Exposition Disguised as Lecture
  test("Cat 2: Flags unmotivated domain lecture disguised as clinical dialogue", () => {
    const text = `Dr. Halloway adjusted his glasses. "As you know, the hippocampus manages episodic storage while retrograde disassociation severs synaptic pathways across the quantum lattice."`;
    const report = MacroStructuralEvaluator.evaluateChapter(text);

    expect(report.violations.some(v => v.code === "STRUCT_02_DIALOGUE_EXPOSITION_DISGUISED")).toBe(true);
  });

  // Category 3: Sensitive Prop in Open Public View
  test("Cat 3: Flags sensitive classified document left in open accessible location", () => {
    const text = `Resting casually on the open footboard was a red folder marked TOP SECRET — PROJECT MNEMOSYNE DO NOT INTERCEPT.`;
    const report = MacroStructuralEvaluator.evaluateChapter(text);

    expect(report.violations.some(v => v.code === "STRUCT_03_PROP_PLAUSIBILITY_CONSPIRACY_ON_BED")).toBe(true);
    expect(report.violations[0].authorIntentTriage?.isPotentialAuthorPlant).toBe(true);
  });

  // Category 4: Unearned Somatic Transformation
  test("Cat 4: Flags instant transition from severe physical trauma/atrophy to decisive sprint without somatic cost", () => {
    const text = `His legs suffered from severe atrophy and nerve paralysis. He stood and charged into battle with razor-sharp focus and unstoppable resolve.`;
    const report = MacroStructuralEvaluator.evaluateChapter(text);

    expect(report.violations.some(v => v.code === "STRUCT_04_UNEARNED_PHYSICAL_TRANSFORMATION")).toBe(true);
  });

  // Category 5: Impossible Knowledge / Psychic Leak
  test("Cat 5: Flags amnesiac character unprompted recalling confidential secret identities without sensory triggers", () => {
    const text = `He suffered from total amnesia and had forgot everything. Yet he instantly recognized the secret identity of Halloway without hesitation.`;
    const report = MacroStructuralEvaluator.evaluateChapter(text);

    expect(report.violations.some(v => v.code === "STRUCT_05_IMPOSSIBLE_KNOWLEDGE_LEAK")).toBe(true);
  });

  // Category 6: Location Teleportation Break
  test("Cat 6: Flags ungrounded location teleportation from dungeon confinement to open plaza", () => {
    const text = `He was locked inside the dungeon with iron chains. Two minutes later he was strolling casually across the plaza under the noon sun.`;
    const report = MacroStructuralEvaluator.evaluateChapter(text);

    expect(report.violations.some(v => v.code === "STRUCT_06_LOCATION_TELEPORTATION_BREAK")).toBe(true);
  });

  // Category 7: Injury Continuity Amnesia
  test("Cat 7: Flags character with broken kneecap sprinting effortlessly without pain", () => {
    const text = `His broken kneecap throbbed with white agony. He sprinted effortlessly across the rooftop, leaping over the chasm.`;
    const report = MacroStructuralEvaluator.evaluateChapter(text);

    expect(report.violations.some(v => v.code === "STRUCT_07_INJURY_CONTINUITY_AMNESIA")).toBe(true);
  });

  // Category 8: Unmotivated Emotional Jump
  test("Cat 8: Flags instant flip from paralyzing grief to cheerful joking without pivot beat", () => {
    const text = `She knelt in the mud, paralyzed with weeping despair over her lost companion. Then she grinned cheerily and cracked a joke about the lunch menu.`;
    const report = MacroStructuralEvaluator.evaluateChapter(text);

    expect(report.violations.some(v => v.code === "STRUCT_08_UNMOTIVATED_EMOTIONAL_JUMP")).toBe(true);
  });

  // Category 9: Fact Provenance Tracking
  test("Cat 9: Accurately catalogs CANON_PROPOSED and CANON_CONFIRMED entities", () => {
    const text = `Elias glanced at the datapad. [CANON_PROPOSAL: Elias had an estranged sister named Clara in Sector 4].`;
    const report = MacroStructuralEvaluator.evaluateChapter(text);

    expect(report.provenanceSummary.CANON_CONFIRMED).toBeGreaterThan(0);
    expect(report.provenanceSummary.CANON_PROPOSED).toBeGreaterThan(0);
  });

  // Category 10: Grounded, Plausible Chapter Clean Pass
  test("Cat 10: Passes cleanly with high plausibility when somatic cost, numerical agreement, and organic revelation are maintained", () => {
    const cleanText = `
Elias counted five letters traced upon the foggy window: M-A-R-E-N.
His limbs were stiff from atrophy. When he swung his legs over the bedframe, his vision pitched sideways, his knuckles whitening as he braced his weight against the iron rail to hold off the wave of nausea.
In the corridor outside, Dr. Halloway's voice drifted through the ventilation grille, speaking in hushed, guarded tones about patient telemetry.
`;
    const report = MacroStructuralEvaluator.evaluateChapter(cleanText);

    expect(report.status).toBe("ACCEPTED");
    expect(report.overallPlausibilityScore).toBeGreaterThanOrEqual(0.85);
    expect(report.violations.length).toBe(0);
  });
});
