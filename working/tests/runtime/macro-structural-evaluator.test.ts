// tests/runtime/macro-structural-evaluator.test.ts
import { describe, test, expect } from "bun:test";
import { MacroStructuralEvaluator } from "../../src/runtime/macro-structural-evaluator";

describe("Writing OS v2.2 — Tier 1 Macro Structural & Scene Integrity Layer", () => {
  const uncorrectedChapter1 = `
    He only knew four letters.
    M—A—R—E—N.
    
    Dr. Bradley stepped into view. "Your hippocampus is attempting to index corrupted episodic storage. You are experiencing severe retrograde disassociation."
    
    Hanging from the stainless-steel footboard was a physical clipboard, stamped in crimson ink:
    SUBJECT ZERO — COGNITIVE LAYER 4 CANDIDATE
    PROJECT: MNEMOSYNE / RESTRICTED ACCESS LEVEL 0
    HANDLING DIRECTIVE: DO NOT INTERCEPT. Allow subject to initiate unprompted behavioral search vectors.
    
    His calf muscles trembled with atrophy, but as he stood, he walked out into the corridor with the cold, razor-sharp focus of a man who refused to disappear.
    "Mr. Vane, you are not cleared for unassisted ambulation!"
  `;

  test("Identifies all 4 Macro Structural Failures on uncorrected draft", () => {
    const report = MacroStructuralEvaluator.evaluateChapter(uncorrectedChapter1);
    
    expect(report.status).toBe("NEEDS_REVISION");
    expect(report.overallPlausibilityScore).toBeLessThanOrEqual(0.5);

    // 1. Arithmetic error
    const mathViolation = report.violations.find(v => v.code === "STRUCT_01_ARITHMETIC_CONTRADICTION");
    expect(mathViolation).toBeDefined();
    expect(mathViolation?.description).toContain("found 5");

    // 2. Doctor dialogue exposition
    const expViolation = report.violations.find(v => v.code === "STRUCT_02_DIALOGUE_EXPOSITION_DISGUISED");
    expect(expViolation).toBeDefined();

    // 3. Footboard classified conspiracy
    const propViolation = report.violations.find(v => v.code === "STRUCT_03_PROP_PLAUSIBILITY_CONSPIRACY_ON_BED");
    expect(propViolation).toBeDefined();

    // 4. Unearned physical transformation
    const costViolation = report.violations.find(v => v.code === "STRUCT_04_UNEARNED_PHYSICAL_TRANSFORMATION");
    expect(costViolation).toBeDefined();
  });

  const correctedChapter1 = `
    He only knew five letters.
    M—A—R—E—N.
    
    Dr. Bradley adjusted the IV regulator without looking at Elias. "Keep the ward illumination low. Halloway requested his preliminary telemetry before noon."
    
    On the medication cart beside the door, Bradley had left his docking datapad active. On the screen, a red surveillance tag glowed:
    PROJECT: MNEMOSYNE / RESTRICTED ACCESS
    DISCHARGE PROTOCOL ALPHA-7: Active Release Authorized.
    
    Elias swung his legs over the mattress. When his bare feet struck the linoleum, the room spun. His knees buckled under dead weight; he braced his shoulder against the tiled wall, his knuckles white against the metal doorframe as nausea spiked through his throat. He gritted his teeth, forced his trembling calves to bear his weight, and pushed into the corridor.
  `;

  test("Passes with high plausibility score on corrected draft with somatic cost and organic revelation", () => {
    const report = MacroStructuralEvaluator.evaluateChapter(correctedChapter1);
    
    expect(report.status).toBe("ACCEPTED");
    expect(report.overallPlausibilityScore).toBeGreaterThanOrEqual(0.9);
    expect(report.violations.length).toBe(0);
    expect(report.provenanceSummary.CANON_CONFIRMED).toBeGreaterThanOrEqual(2);
  });
});
