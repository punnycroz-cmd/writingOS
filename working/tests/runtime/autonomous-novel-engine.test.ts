// tests/runtime/autonomous-novel-engine.test.ts
// Verification of End-to-End Autonomous Novel Engine, Bible Synthesizer & Tier 3 Reader Persona.

import { describe, test, expect } from "bun:test";
import { BibleSynthesizer, BibleEntropyGovernor } from "../../src/runtime/bible-synthesizer";
import { ReaderPersonaEvaluator } from "../../src/runtime/reader-persona-evaluator";
import { AutonomousNovelEngine } from "../../src/runtime/autonomous-novel-engine";
import { WritingOSRuntime } from "../../src/runtime/writing-os-runtime";

describe("Writing OS v3.0 — Autonomous Novel Engine & Dynamic Story Bible", () => {
  // 1. Reference Story Bible
  test("BibleSynthesizer: Retrieves Layer 4 Story Bible as exemplar reference", () => {
    const layer4Bible = BibleSynthesizer.getLayer4ReferenceBible();
    expect(layer4Bible.projectId).toBe("LAYER_4_PROJECT");
    expect(layer4Bible.genre).toBe("HARD_SCI_FI");
    expect(layer4Bible.characters.some(c => c.name.includes("Elias"))).toBe(true);
    expect(layer4Bible.activePlants.length).toBeGreaterThanOrEqual(1);
  });

  // 2. Dynamic Multi-Genre Bible Synthesis
  test("BibleSynthesizer: Synthesizes structured Fantasy Bible from author's concept", () => {
    const fantasyBible = BibleSynthesizer.synthesizeFromPremise({
      projectId: "CHRONICLES_OF_AETHERIA",
      title: "The Lost Sigil of Eldoria",
      genre: "FANTASY",
      premise: "An apprentice mage uncovers a forbidden silver sigil in the royal catacombs.",
      rawCharacters: [
        {
          name: "Eldrin",
          role: "PROTAGONIST",
          goal: "Master the ancient aether resonance.",
          wound: "Burned out magical reserves during the siege.",
          voiceKeywords: ["sigil", "aether", "resonance", "parchment", "incantation"]
        }
      ],
      chapterOutlines: [
        {
          chapterNumber: 1,
          title: "The Crypt of Whispers",
          location: "Royal Catacombs",
          keyCharacters: ["Eldrin"],
          beats: ["Eldrin searches for the archive", "Finds the locked vault", "Feels aether resonance"],
          keywords: ["catacombs", "sigil", "vault", "whisper"]
        }
      ]
    });

    expect(fantasyBible.genre).toBe("FANTASY");
    expect(fantasyBible.characters[0].name).toBe("Eldrin");
    expect(fantasyBible.chapterMilestones.length).toBe(1);

    // Verify dynamic registration of plant
    BibleSynthesizer.recordPlant("CHRONICLES_OF_AETHERIA", {
      id: "PLANT_FANTASY_01",
      introducedChapter: 1,
      propOrFact: "A shattered silver sigil glowing with purple resonance",
      intentDescription: "Setup for the archmage traitor reveal in Chapter 6",
      status: "ACTIVE_PLANT"
    });

    const updatedBible = BibleSynthesizer.getBible("CHRONICLES_OF_AETHERIA");
    expect(updatedBible.activePlants.some(p => p.id === "PLANT_FANTASY_01")).toBe(true);
  });

  // 3. Tier 3 AI Reader Persona Evaluator
  test("ReaderPersonaEvaluator: Evaluates immersion, tension, and flags targeted enhancements", () => {
    const testScene = `
      Elias lowered his bare feet onto the frosted tiles. 
      The room spun violently. His knuckles turned white against the stainless-steel medication cart as nausea surged up his throat.
      M—A—R—E—N.
      He remembered five letters, and he was afraid.
    `;

    const report = ReaderPersonaEvaluator.evaluate(testScene, {
      persona: "NAIVE_FIRST_TIME_READER",
      genre: "HARD_SCI_FI"
    });

    expect(report.persona).toBe("NAIVE_FIRST_TIME_READER");
    expect(report.overallEmotionalScore).toBeGreaterThanOrEqual(0.65);
    expect(report.standoutMoments.length).toBeGreaterThan(0);
    expect(report.targetedRecommendations.some(r => r.suggestedUpgrade.includes("carotid"))).toBe(true);
  });

  // 4. End-to-End Autonomous Generation Pipeline
  test("AutonomousNovelEngine: Generates publication-ready chapter end-to-end from premise", () => {
    const result = AutonomousNovelEngine.generateChapter({
      projectId: "LAYER_4_PROJECT",
      genre: "HARD_SCI_FI",
      chapterNumber: 1,
      chapterPremise: "Elias awakens with retrograde amnesia, recognizes M-A-R-E-N, overcomes post-coma muscle atrophy, and discovers the Subject Zero dossier.",
      povCharacter: "ELIAS",
      tempo: "TACTICAL_PROCEDURAL",
      threatLevel: "TENSE_STANDOFF",
      emotionalState: "STABLE_CALM"
    });

    expect(result.chapterNumber).toBe(1);
    expect(result.bible).toBeDefined();
    expect(result.finalManuscript).toBeDefined();
    expect(result.executionSummary.wordsGenerated).toBeGreaterThan(100);
    expect(result.executionSummary.status).toBe("PUBLICATION_READY");
    expect(result.readerReport.overallEmotionalScore).toBeGreaterThanOrEqual(0.65);
    expect(result.polishReport.filterWordsEliminated).toBeGreaterThanOrEqual(0);
  });

  // 5. Runtime Integration
  test("WritingOSRuntime: Master orchestrator exposes generateChapterFromPremise cleanly", () => {
    const runtime = new WritingOSRuntime();
    const result = runtime.generateChapterFromPremise({
      projectId: "DETECTIVE_NOIR_01",
      genre: "THRILLER",
      chapterNumber: 1,
      chapterPremise: "Detective Miller arrives at the rain-drenched docks where a locked shipping container holds a cryptic cipher.",
      povCharacter: "NEUTRAL",
      tempo: "ACTION_SPRINT",
      threatLevel: "TENSE_STANDOFF"
    });

    expect(result.executionSummary.status).toBe("PUBLICATION_READY");
    expect(result.readerReport).toBeDefined();
    expect(result.finalManuscript.length).toBeGreaterThan(50);
  });

  // 6. Stylistic Entropy & Multi-Project Isolation
  test("Stylistic Entropy: Generates distinct sensory textures and enforces complete project isolation", () => {
    const gothicResult = AutonomousNovelEngine.generateChapter({
      projectId: "GOTHIC_MANOR_HORROR",
      genre: "GOTHIC_HORROR",
      chapterNumber: 1,
      chapterPremise: "Lady Genevieve arrives at Blackwood Manor as twilight descends over the weeping willows.",
      entropy: {
        randomSeed: 42,
        cadenceVariance: "LYRICAL_EXPANSIVE",
        sensoryPalette: ["damp moss", "rotting cedar", "black velvet"]
      }
    });

    const cyberpunkResult = AutonomousNovelEngine.generateChapter({
      projectId: "NEON_DRIFT_CYBERPUNK",
      genre: "HARD_SCI_FI",
      chapterNumber: 1,
      chapterPremise: "Kael jacks into the subterranean grid terminal beneath the rain-soaked megatower.",
      entropy: {
        randomSeed: 99,
        cadenceVariance: "TIGHT_MINIMALIST",
        sensoryPalette: ["burnt circuitry", "ionized rain", "flickering neon"]
      }
    });

    // Zero cross-project leakage
    expect(gothicResult.bible.projectId).toBe("GOTHIC_MANOR_HORROR");
    expect(cyberpunkResult.bible.projectId).toBe("NEON_DRIFT_CYBERPUNK");
    expect(gothicResult.bible.characters.some(c => c.name.includes("Elias"))).toBe(false);
    expect(cyberpunkResult.bible.characters.some(c => c.name.includes("Elias"))).toBe(false);

    // Completely distinct sensory palettes and titles
    expect(gothicResult.bible.title).not.toBe(cyberpunkResult.bible.title);
    expect(gothicResult.finalManuscript).not.toBe(cyberpunkResult.finalManuscript);
  });

  // 7. Bible-Bounded Entropy Governor
  test("BibleEntropyGovernor: Clamps anachronistic/forbidden inventions when randomness exceeds world rules", () => {
    const fantasyBible = BibleSynthesizer.getBible("CHRONICLES_OF_AETHERIA");
    const rogueSciFiPalette = ["neon lasers", "sub-spatial telemetry datapad", "ancient stone"];

    const { governedPalette, clampedViolations } = BibleEntropyGovernor.governSensoryPalette(
      rogueSciFiPalette,
      fantasyBible,
      {
        governor: {
          strictWorldRulePhysics: true,
          forbiddenInventions: ["gunpowder"]
        }
      }
    );

    // Clamps neon lasers and datapad back to ancient stone
    expect(clampedViolations.length).toBe(2);
    expect(governedPalette.some(p => p.includes("neon"))).toBe(false);
    expect(governedPalette.some(p => p.includes("datapad"))).toBe(false);
    expect(governedPalette.includes("ancient stone")).toBe(true);
  });
});
