import { expect, test, describe } from 'bun:test';
import { VoicePolisher } from '../../src/runtime/voice-polisher';
import { ProseExpander } from '../../src/runtime/prose-expander';
import { WritingOSRuntime } from '../../src/runtime/writing-os-runtime';

describe('Writing OS v2.0 — Voice Polisher & Prose Expander', () => {
  const sampleMicroDraft = `
Chapter 22: Real World Breach
Elias could feel the cold concrete floor vibrating. He saw the black tactical vans pull up through the cracked glass.
Suddenly, a drone flew overhead. Dr. Halloway wanted to destroy the backup drive before the data leaked.
Maren watched the heart rate monitor spike.
  `.trim();

  test('VoicePolisher identifies and prunes filter words to improve psychic immediacy', () => {
    const report = VoicePolisher.polish(sampleMicroDraft);
    expect(report.filterWordsEliminated).toBeGreaterThan(0);
    expect(report.polishedText).not.toContain('could feel');
    expect(report.polishedText).not.toContain('could see');
    expect(report.polishedText).not.toContain('Suddenly,');
    expect(report.immediacyScore).toBeGreaterThanOrEqual(0.70);
  });

  test('ProseExpander generates structured multi-scene expansion blocks for under-length chapters', () => {
    const result = ProseExpander.expandChapter(22, sampleMicroDraft, 1600);
    expect(result.chapterNumber).toBe(22);
    expect(result.originalWordCount).toBeLessThan(100);
    expect(result.expandedWordCount).toBeGreaterThan(result.originalWordCount);
    expect(result.expansionBlocks.length).toBe(3);
    expect(result.expansionBlocks[0].blockType).toBe('ATMOSPHERIC_GROUNDING');
    expect(result.expansionBlocks[1].blockType).toBe('DIALOGUE_SPARRING');
    expect(result.expansionBlocks[2].blockType).toBe('NEURAL_INTERIORITY');
  });

  test('WritingOSRuntime integrates expandAndPolishChapter API seamlessly', () => {
    const runtime = new WritingOSRuntime();
    const result = runtime.expandAndPolishChapter(22, sampleMicroDraft, 1800);
    expect(result.expandedProse).toContain('telemetry');
    expect(result.expandedProse).toContain('Maren');
    expect(result.expandedProse).toContain('Elias');
    expect(result.deficitFilled).toBeGreaterThan(200);
  });
});
