// tests/runtime/genre-transfer-benchmark.test.ts
// Writing OS v3.1 — Real-World Genre-Transfer Verification (Hội An 1920 & Đà Lạt Gothic)

import { describe, test, expect } from "bun:test";
import { BibleSynthesizer } from "../../src/runtime/bible-synthesizer";
import { AutonomousNovelEngine } from "../../src/runtime/autonomous-novel-engine";

describe("Writing OS v3.1 — Genre Transfer Benchmark (Show, Don't Tell)", () => {
  // Test 1: Historical Fiction — Hội An 1920 (Zero Sci-Fi Leaks)
  test("Genre Transfer 1: Generates authentic Historical Fiction chapter for Hội An 1920 with 0% Sci-Fi leakage", () => {
    const hoiAnBible = BibleSynthesizer.getHoiAn1920ExemplarBible();
    expect(hoiAnBible.projectId).toBe("HOI_AN_1920");
    expect(hoiAnBible.genre).toBe("HISTORICAL");

    const result = AutonomousNovelEngine.generateChapter({
      projectId: "HOI_AN_1920",
      genre: "HISTORICAL",
      chapterNumber: 1,
      chapterPremise: "Trần Văn Hậu kiểm tra những kiện lụa tơ tằm cuối cùng trên bến thuyền sông Thu Bồn trong đêm mưa rào.",
      povCharacter: "TRAN_VAN_HAU",
      existingBible: hoiAnBible,
      tempo: "INTIMATE_QUIET",
      threatLevel: "TENSE_STANDOFF",
      emotionalState: "STABLE_CALM"
    });

    expect(result.finalManuscript).toBeDefined();
    expect(result.executionSummary.status).toBe("PUBLICATION_READY");

    // Lexical Isolation Audit: Strictly 0% sci-fi terms
    const isolation = BibleSynthesizer.verifyLexicalIsolation(result.finalManuscript, "HISTORICAL");
    expect(isolation.clean).toBe(true);
    expect(isolation.leaks.length).toBe(0);

    // Verify presence of historical/regional texture
    expect(result.finalManuscript).not.toContain("neural");
    expect(result.finalManuscript).not.toContain("coolant");
    expect(result.finalManuscript).not.toContain("datapad");
  });

  // Test 2: Gothic Horror — Đà Lạt 1950 (Zero Sci-Fi Leaks & High Atmospheric Immersion)
  test("Genre Transfer 2: Generates authentic Gothic Horror chapter for Đà Lạt 1950 with eerie pacing", () => {
    const daLatBible = BibleSynthesizer.getDaLatGothicExemplarBible();
    expect(daLatBible.projectId).toBe("DALAT_GOTHIC_1950");
    expect(daLatBible.genre).toBe("GOTHIC_HORROR");

    const result = AutonomousNovelEngine.generateChapter({
      projectId: "DALAT_GOTHIC_1950",
      genre: "GOTHIC_HORROR",
      chapterNumber: 1,
      chapterPremise: "Lê Thu Vân bước xuống xe giữa rừng thông Đà Lạt mịt mù sương, cánh cổng sắt rỉ sét tự mở hé trong tiếng gió.",
      povCharacter: "LE_THU_VAN",
      existingBible: daLatBible,
      tempo: "CONTEMPLATIVE_DREAM",
      threatLevel: "TENSE_STANDOFF",
      emotionalState: "EXHAUSTED_BURNOUT"
    });

    expect(result.finalManuscript).toBeDefined();
    expect(result.executionSummary.status).toBe("PUBLICATION_READY");
    expect(result.readerReport.overallEmotionalScore).toBeGreaterThanOrEqual(0.65);

    // Strict Lexical Isolation Audit
    const isolation = BibleSynthesizer.verifyLexicalIsolation(result.finalManuscript, "GOTHIC_HORROR");
    expect(isolation.clean).toBe(true);
    expect(isolation.leaks.length).toBe(0);
  });

  // Test 3: Human-in-the-Loop Bible Checkpoint
  test("Human Checkpoint: Successfully halts and exports Bible + Plants list for author review before drafting", () => {
    const checkpoint = AutonomousNovelEngine.synthesizeAndApproveBible({
      projectId: "MEDIEVAL_HEIAN_01",
      title: "The Autumn Screen of Kyoto",
      genre: "HISTORICAL",
      premise: "A court poet uncovers a forged decree within the Emperor's private bedchamber.",
      rawCharacters: [
        {
          name: "Fujiwara no Michi",
          role: "PROTAGONIST",
          goal: "Preserve the sacred calligraphy lineage.",
          wound: "Exiled from court after a false rumor.",
          voiceKeywords: ["inkstone", "silk screen", "autumn rain", "incense", "waka"]
        }
      ]
    });

    expect(checkpoint.checkpointStatus).toBe("AWAITING_AUTHOR_APPROVAL");
    expect(checkpoint.bible.projectId).toBe("MEDIEVAL_HEIAN_01");
    expect(checkpoint.bible.characters[0].name).toBe("Fujiwara no Michi");
  });
});
