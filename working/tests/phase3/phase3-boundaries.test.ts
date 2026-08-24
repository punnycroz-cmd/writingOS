// tests/phase3/phase3-boundaries.test.ts
// Boundary verification: Phase 2B immutability + ground-truth boundary.

import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';

function loadJson(path: string): any { return JSON.parse(readFileSync(path, 'utf-8')); }

describe('Phase 2B Immutability', () => {
  it('Phase 2B corpus is frozen at 59 active cases', () => {
    const cases = readFileSync('history/corpus/golden-v1/cases.jsonl', 'utf-8').trim().split('\n').map(l => JSON.parse(l));
    const active = cases.filter(c => c.status !== 'SUPERSEDED');
    const superseded = cases.filter(c => c.status === 'SUPERSEDED');
    expect(active.length).toBe(59);
    expect(superseded.length).toBe(1);
  });

  it('GC-0038 is properly superseded by GC-0038R1', () => {
    const cases = readFileSync('history/corpus/golden-v1/cases.jsonl', 'utf-8').trim().split('\n').map(l => JSON.parse(l));
    const gc = cases.find(c => c.id === 'GC-0038R1');
    expect(gc).toBeDefined();
    expect(gc.expectedSemantic.infoOwnership).toBe('PASS');
    expect(gc.expectedSemantic.faithfulness).toBe('PASS');
    expect(gc.expectedFinalDecision).toBe('ACCEPT');
  });

  it('summary.json has correct metrics', () => {
    const summary = loadJson('history/writing-engine/logs-golden-v1/summary.json');
    expect(summary.activeCases).toBe(59);
    expect(summary.scorableFinal).toBe(59);
    expect(summary.finalCorrect).toBe(54);
    expect(summary.llmExecuted).toBe(42);
  });

  it('reconciler is v5 with 20 checks', () => {
    const src = readFileSync('working/src/corpus/reconcile-v1.ts', 'utf-8');
    expect(src).toContain('v5');
    const checkCount = (src.match(/checks\.push/g) || []).length;
    expect(checkCount).toBe(20);
  });
});

describe('Ground-Truth Boundary', () => {
  it('containsGroundTruth is false in snapshot', () => {
    const snapshot = loadJson('PHASE3-SNAPSHOT-MANIFEST.json');
    expect(snapshot.containsGroundTruth).toBe(false);
  });

  it('sourceVerifiedClaims is 0 in snapshot', () => {
    const snapshot = loadJson('PHASE3-SNAPSHOT-MANIFEST.json');
    expect(snapshot.sourceVerifiedClaims).toBe(0);
  });

  it('no SOURCE_VERIFIED in source verification statuses', () => {
    const sourceIndex = loadJson('working/nonfiction/source-pack/source-index.json');
    const sources = sourceIndex.sources || sourceIndex;
    const sv = sources.filter(s => s.verificationStatus === 'SOURCE_VERIFIED');
    expect(sv.length).toBe(0);
  });

  it('PACK-MANIFEST groundTruth is not true', () => {
    const manifest = loadJson('working/nonfiction/source-pack/PACK-MANIFEST.json');
    expect(manifest.groundTruth).not.toBe(true);
  });
});
