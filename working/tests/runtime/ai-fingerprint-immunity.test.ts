// tests/runtime/ai-fingerprint-immunity.test.ts
// Tests Writing OS v4 Anti-AI Fingerprint Immunity, Participle Stacking Guards, and Burstiness Metrics

import { describe, test, expect } from "bun:test";
import { VoicePolisher } from "../../src/runtime/voice-polisher";
import { PostRewriteIntegrityAuditor } from "../../src/runtime/story-state-engine";

describe("Writing OS v4 — Anti-AI Fingerprint Immunity & Burstiness Engine", () => {

  test("Flag 1: Catches Participle Stacking (-ing chain speech tags)", () => {
    const aiText = 'Turning to Nia, her voice reverting to the authoritative tone of a physician securing a perimeter, she instructed, "Lock the doors, Nia."';
    const report = VoicePolisher.polish(aiText, { pov: 'MAREN', strictGates: true });
    
    expect(report.aiFingerprintsDetected).toBeGreaterThan(0);
    const aiGate = report.gateResults.find(g => g.gate === 'AI_FINGERPRINT_GUARD');
    expect(aiGate?.passed).toBe(false);
    expect(aiGate?.notes[0]).toContain("AI_PARTICIPLE_STACKING");
  });

  test("Flag 2: Catches Expository Summary Filler that bypasses dramatization", () => {
    const aiFiller = "The presence of a nurse and medical procedures highlighted the seriousness of his condition and the urgency of the situation.";
    const report = VoicePolisher.polish(aiFiller, { pov: 'NEUTRAL', strictGates: true });
    
    expect(report.aiFingerprintsDetected).toBeGreaterThan(0);
    const aiGate = report.gateResults.find(g => g.gate === 'AI_FINGERPRINT_GUARD');
    expect(aiGate?.passed).toBe(false);
    expect(aiGate?.notes[0]).toContain("AI_EXPOSITORY_FILLER");
  });

  test("Flag 3: Catches Clunky Adverbial Dialogue Tag Bloat", () => {
    const aiTag = '"Observe the third spike," Maren explained clinically, tapping the glass with her stylus.';
    const res = PostRewriteIntegrityAuditor.auditAIFingerprintImmunity(aiTag);
    expect(res.passed).toBe(false);
    expect(res.violations[0]).toContain("AI Speech Tag Bloat");
  });

  test("Metric 4: Calculates High Natural Burstiness on Human-Crafted Prose", () => {
    const humanText = `
The fluorescent tubes in the ceiling had an old ballast, the cheap kind that hummed at sixty cycles and vibrated straight down into the molars before a man could even get his eyes open.
That was sixty hertz. Alternating current.
No name for his mother.
He stared at the crack above the bed, counting branches until the room stopped spinning.
`.trim();

    const burstiness = VoicePolisher.calculateBurstiness(humanText);
    // Standard deviation of sentence lengths should be high (> 5.0) reflecting rich rhythm variety
    expect(burstiness).toBeGreaterThan(5.0);
  });

  test("Master 14-D Auditor passes 100% on Organic Human Prose from final.txt", () => {
    const humanChapter1 = `
The fluorescent tubes in the ceiling had an old ballast, the cheap kind that hummed at sixty cycles and vibrated straight down into the molars before a man could even get his eyes open.
He had five letters in his head. *M—A—R—E—N.*
Dr. Bradley glanced up. "Keep the room dark and auditory stimulation below forty decibels."
On the active datapad screen, amber telemetry graphed a surge across the primary quantum lattice.
When Elias swung his legs over the rail, his knees buckled instantly, his knuckles turning white as he caught the cold steel to stay upright.
Dr. Bradley left his docking datapad lying flat on the stainless medication cart beside the frame.
`.trim();

    const report = PostRewriteIntegrityAuditor.auditManuscriptPostRewrite(1, humanChapter1, humanChapter1);
    expect(report.passed).toBe(true);
    expect(report.overallIntegrityScore).toBe(1.0);
    expect(report.dimensionReports.every(d => d.passed)).toBe(true);
  });
});
