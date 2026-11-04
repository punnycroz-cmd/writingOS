import { describe, expect, test } from 'bun:test';
import { WritingOSRuntime } from '../../src/runtime/writing-os-runtime';

describe('Writing OS Runtime — Unified Master Decision Policy Specification', () => {
  test('Strictly rejects manuscript with 14-D integrity violation and assigns overallScore 0.0 / Grade F', () => {
    const runtime = new WritingOSRuntime();
    // Decimal unit attached to lighting: 'illumination below forty decibels'
    const contradictoryDraft = 'Dr. Bradley adjusted the monitor. Keep the ward illumination below forty decibels.';

    const res = runtime.processDocument({
      documentId: 'chapter_01',
      mode: 'FICTION',
      text: contradictoryDraft,
    });

    expect(res.status).toBe('REJECTED');
    expect(res.overallScore).toBe(0.0);
    expect(res.grade).toBe('F');
  });

  test('Downgrades status to WARNING and score when plot keywords are missing', () => {
    const runtime = new WritingOSRuntime();
    const shortSnippet = 'Elias was in coma for 30 days';

    const res = runtime.processDocument({
      documentId: 'chapter_01',
      mode: 'FICTION',
      text: shortSnippet,
    });

    expect(res.status).toBe('WARNING');
    expect(res.overallScore).toBeLessThan(0.5);
    expect(res.grade).toBe('D');
  });
});
