// tests/runtime/universal-writing-os.test.ts
// Verification of Universal, Project-Agnostic Writing OS across Fantasy, Historical, Gothic, Mystery, and Nonfiction.

import { describe, test, expect } from "bun:test";
import { VoicePolisher } from "../../src/runtime/voice-polisher";
import { MacroStructuralEvaluator } from "../../src/runtime/macro-structural-evaluator";
import { WritingOSRuntime } from "../../src/runtime/writing-os-runtime";

describe("Universal Writing OS — Multi-Genre & Multi-Document Architecture", () => {
  // 1. Fantasy Project Support with Custom POV Profile
  test("Fantasy: Supports custom Mage POV profile without injecting sci-fi jargon", () => {
    VoicePolisher.registerPOVProfile("ELDRIN_MAGE", {
      preferred: ["aether", "resonance", "rune", "sigil", "manuscript", "invocation", "ley line"],
      discouraged: ["transponder", "carbine", "megawatts", "neural buffer", "PSI"],
      maxAvgSentenceLength: 26,
      description: "Scholarly, mystical cadence attuned to arcane resonance and ancient manuscripts."
    });

    const fantasyDraft = "Eldrin felt the arcane aether surge through the silver sigil.";
    const report = VoicePolisher.polish(fantasyDraft, {
      pov: "ELDRIN_MAGE",
      genre: "FANTASY",
      tempo: "TACTICAL_PROCEDURAL"
    });

    expect(report.decision).toBe("REWRITE");
    expect(report.polishedText).not.toContain("Eldrin felt");
    expect(report.polishedText).toContain("arcane aether");
    expect(report.gateResults.find(g => g.gate === "GATE_1_POV_VOICE")?.passed).toBe(true);
    expect(report.suggestions.some(s => s.ruleCode === "GENRE_CLASH_FANTASY")).toBe(false); // Fantasy is allowed in Fantasy!
  });

  // 2. Gothic Horror Atmospheric Preservation
  test("Gothic Horror: Preserves intentional eerie metaphors and slow contemplative tempo", () => {
    const gothicText = "The silence between the crypt walls was an old agreement, signed in rot.";
    const report = VoicePolisher.polish(gothicText, {
      genre: "GOTHIC_HORROR",
      tempo: "CONTEMPLATIVE_DREAM",
      threatLevel: "PEACE_REFLECTIVE"
    });

    expect(report.decision).toBe("KEEP");
    expect(report.polishedText).toBe(gothicText);
    expect(report.gateResults.find(g => g.gate === "SPEC_CLUTTER_GUARD")?.passed).toBe(true);
  });

  // 3. Detective / Mystery Thriller Macro Structural Audit
  test("Mystery / Thriller: Detects arithmetic contradiction and suspicious prop placement in detective novel", () => {
    const mysteryDraft = `
      Detective Miller named three suspects: Lord Arthur, Lady Beatrice, Inspector Vance, and the Butler.
      On the coffee table in the middle of the crowded ballroom lay the FORBIDDEN WILL stamped TOP SECRET.
      Miller suffered from a fractured kneecap, but he charged into the garden with unstoppable resolve.
    `;

    const report = MacroStructuralEvaluator.evaluateChapter(mysteryDraft);
    expect(report.status).toBe("NEEDS_REVISION");

    // 1. Math check: Claimed 3 suspects, listed 4 names
    const mathIssue = report.violations.find(v => v.category === "ARITHMETIC_CHRONOLOGY_CONSISTENCY");
    expect(mathIssue).toBeDefined();

    // 2. Prop check: Secret document in crowded ballroom
    const propIssue = report.violations.find(v => v.category === "PROP_SETTING_PLAUSIBILITY");
    expect(propIssue).toBeDefined();

    // 3. Somatic cost check: Fractured kneecap charging with no limp/pain
    const somaticIssue = report.violations.find(v => v.category === "EARNED_TRANSFORMATION_COST");
    expect(somaticIssue).toBeDefined();
  });

  // 4. Historical Fiction with Terse Soldier Cadence
  test("Historical Fiction: Evaluates Napoleonic officer with custom procedural vocabulary", () => {
    VoicePolisher.registerPOVProfile("COLONEL_DUPONT", {
      preferred: ["flintlock", "regiment", "cavalry", "sabers", "parapet", "bugle", "grape-shot"],
      discouraged: ["telemetry", "laser", "transponder", "silicon", "magic"],
      maxAvgSentenceLength: 20,
      description: "Disciplined 19th-century military tactical officer."
    });

    const historicalDraft = "Colonel Dupont saw the enemy cavalry deploy across the eastern ridge.";
    const report = VoicePolisher.polish(historicalDraft, {
      pov: "COLONEL_DUPONT",
      genre: "HISTORICAL",
      tempo: "ACTION_SPRINT",
      threatLevel: "LETHAL_COMBAT"
    });

    expect(report.decision).toBe("REWRITE");
    expect(report.polishedText).not.toContain("Colonel Dupont saw");
    expect(report.gateResults.find(g => g.gate === "GATE_1_POV_VOICE")?.passed).toBe(true);
  });

  // 5. Nonfiction / Epistemic Processing Integration
  test("Nonfiction: Master orchestrator processes epistemic assertion document cleanly", () => {
    const runtime = new WritingOSRuntime();
    const nonfictionRequest = {
      documentId: "research_whitepaper_01",
      mode: "NONFICTION" as const,
      register: "ACADEMIC",
      text: "The study demonstrates a 24% reduction in neural latency across seventy participants.",
      assertions: [
        {
          text: "The study demonstrates a 24% reduction in neural latency across seventy participants.",
          assertionType: "INTERPRETIVE" as const,
        }
      ]
    };

    const response = runtime.processDocument(nonfictionRequest);
    expect(response.mode).toBe("NONFICTION");
    expect(response.status).toBe("ACCEPTED");
    expect(response.overallScore).toBeGreaterThanOrEqual(0.5);
  });
});
