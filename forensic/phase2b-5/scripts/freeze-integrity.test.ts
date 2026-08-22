// tests/corpus/freeze-integrity.test.ts
// End-to-end freeze integrity test. Loads the actual corpus, results, ledger,
// and summary, then verifies the freeze invariants. No mocking.

import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { classifyHistoricalComparison } from '../../src/corpus/classify-comparison';

const CORPUS_FILE = 'corpus/golden-v1/cases.jsonl';
const RESULTS_DIR = 'writing-engine/logs-golden-v1/results';
const LEDGER_FILE = 'writing-engine/logs-golden-v1/canonical-case-ledger.json';
const SUMMARY_FILE = 'writing-engine/logs-golden-v1/summary.json';
const CONSISTENCY_FILE = 'writing-engine/logs-golden-v1/consistency-check.json';
const MANIFEST_FILE = 'corpus/golden-v1/corpus-manifest.json';
const FREEZE_DOC = 'docs/corpus/GOLDEN_CORPUS_V1_FREEZE.md';

function loadCorpus(): any[] {
  return readFileSync(CORPUS_FILE, 'utf-8').trim().split('\n').map(l => JSON.parse(l));
}

function loadResults(): Map<string, any> {
  const m = new Map<string, any>();
  for (const f of readdirSync(RESULTS_DIR)) {
    if (!f.endsWith('.json')) continue;
    const d = JSON.parse(readFileSync(`${RESULTS_DIR}/${f}`, 'utf-8'));
    if (d?.caseId) m.set(d.caseId, d);
  }
  return m;
}

describe('freeze integrity', () => {
  const corpus = loadCorpus();
  const results = loadResults();
  const ledger = JSON.parse(readFileSync(LEDGER_FILE, 'utf-8'));
  const summary = JSON.parse(readFileSync(SUMMARY_FILE, 'utf-8'));
  const consistency = JSON.parse(readFileSync(CONSISTENCY_FILE, 'utf-8'));
  const activeCases = corpus.filter(c => c.status !== 'SUPERSEDED');
  const superseded = corpus.filter(c => c.status === 'SUPERSEDED');

  it('active count is 59', () => {
    expect(activeCases.length).toBe(59);
  });

  it('superseded count is 1 (GC-0038)', () => {
    expect(superseded.length).toBe(1);
    expect(superseded[0].id).toBe('GC-0038');
    expect(superseded[0].supersededBy).toBe('GC-0038R1');
  });

  it('no duplicate active IDs', () => {
    const ids = activeCases.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every active case has a result file', () => {
    for (const c of activeCases) {
      expect(results.has(c.id)).toBe(true);
    }
  });

  it('every result has executionProvenance with a valid status', () => {
    for (const c of activeCases) {
      const r = results.get(c.id);
      expect(r.executionProvenance).toBeDefined();
      expect(['EXECUTED', 'INHERITED', 'EXECUTION_ERROR']).toContain(r.executionProvenance.status);
    }
  });

  it('no silent inheritance (no INHERITED provenance)', () => {
    for (const c of activeCases) {
      const r = results.get(c.id);
      expect(r.executionProvenance.status).not.toBe('INHERITED');
    }
  });

  it('result caseId matches corpus id', () => {
    for (const c of activeCases) {
      const r = results.get(c.id);
      expect(r.caseId).toBe(c.id);
    }
  });

  it('GC-0038R1 has its own EXECUTED provenance with non-zero latency', () => {
    const r = results.get('GC-0038R1');
    expect(r).toBeDefined();
    expect(r.executionProvenance.status).toBe('EXECUTED');
    expect(r.currentSemantic.validatorMode).toBe('LLM');
    expect(r.currentSemantic.latencyMs).toBeGreaterThan(0);
    expect(r.provider).toBe('FIREWORKS');
    expect(r.model).toContain('qwen3p8-max');
    expect(r.evaluatedAt).toBeTruthy();
  });

  it('GC-0038R1 ground truth is PASS/PASS (Phase 2B.5 correction)', () => {
    const c = corpus.find(c => c.id === 'GC-0038R1');
    expect(c.expectedSemantic.infoOwnership).toBe('PASS');
    expect(c.expectedSemantic.faithfulness).toBe('PASS');
    expect(c.expectedFinalDecision).toBe('ACCEPT');
  });

  it('GC-0038R1 has no R6 or UNRESOLVED tags', () => {
    const c = corpus.find(c => c.id === 'GC-0038R1');
    expect(c.tags).not.toContain('R6');
    expect(c.tags).not.toContain('UNRESOLVED');
  });

  it('GC-0038 remains SUPERSEDED with supersededBy=GC-0038R1', () => {
    const c = corpus.find(c => c.id === 'GC-0038');
    expect(c.status).toBe('SUPERSEDED');
    expect(c.supersededBy).toBe('GC-0038R1');
  });

  it('R6 tag count is 3 (GC-0031, GC-0033, GC-0036)', () => {
    const r6 = activeCases.filter(c => c.tags?.includes('R6'));
    expect(r6.length).toBe(3);
    const ids = r6.map(c => c.id).sort();
    expect(ids).toEqual(['GC-0031', 'GC-0033', 'GC-0036']);
  });

  it('R6 classifications use canonical algorithm (R6 is a tag, not a forced category)', () => {
    for (const c of activeCases.filter(c => c.tags?.includes('R6'))) {
      const r = results.get(c.id);
      const derived = classifyHistoricalComparison({
        expectedFinalDecision: c.expectedFinalDecision,
        historicalObservedDecision: c.observedFinalDecision,
        historicalCorrect: c.observedCorrect,
        currentFinalDecision: r.currentFinalDecision,
        currentFinalCorrect: r.currentFinalDecision === c.expectedFinalDecision,
        isR6: true,
        isUnresolved: c.tags?.includes('UNRESOLVED') ?? false,
        finalScorable: !!c.expectedFinalDecision,
      });
      // The persisted historicalComparison in the ledger must match the derived one.
      const ledgerEntry = ledger.find((e: any) => e.id === c.id);
      expect(ledgerEntry.historicalComparison).toBe(derived);
    }
  });

  it('summary metrics match ledger-derived counts', () => {
    expect(summary.activeCases).toBe(ledger.length);
    expect(summary.scorableFinal).toBe(ledger.filter((e: any) => e.finalScorable).length);
    expect(summary.finalCorrect).toBe(ledger.filter((e: any) => e.finalScorable && e.currentFinalCorrect).length);
    expect(summary.falseAcceptance).toBe(ledger.filter((e: any) => e.finalScorable && e.expectedFinalDecision === 'REJECT' && e.currentFinalDecision === 'ACCEPT').length);
    expect(summary.falseRejection).toBe(ledger.filter((e: any) => e.finalScorable && e.expectedFinalDecision === 'ACCEPT' && e.currentFinalDecision === 'REJECT').length);
  });

  it('historical comparison distribution sums to active count', () => {
    const sum = summary.stableSuccess + summary.regression + summary.improvement +
                summary.persistentDefect + summary.knownDefect + summary.changedUnscorable;
    expect(sum).toBe(summary.activeCases);
  });

  it('consistency check reports all passed', () => {
    expect(consistency.passed).toBe(true);
    expect(consistency.metricChecks.length).toBeGreaterThanOrEqual(20);
    for (const c of consistency.metricChecks) {
      expect(c.passed).toBe(true);
    }
  });

  it('manifest activeCases matches ledger', () => {
    const manifest = JSON.parse(readFileSync(MANIFEST_FILE, 'utf-8'));
    expect(manifest.activeCases).toBe(ledger.length);
  });

  it('freeze document references 59 active cases and is not blocked', () => {
    const fd = readFileSync(FREEZE_DOC, 'utf-8');
    expect(fd).toContain('59');
    expect(fd).not.toContain('FREEZE_BLOCKED');
  });

  it('reconciler imports the canonical classifier (no duplicate logic)', () => {
    const reconcilerSrc = readFileSync('src/corpus/reconcile-v1.ts', 'utf-8');
    expect(reconcilerSrc).toContain("from './classify-comparison'");
    // The old duplicate logic must be gone
    expect(reconcilerSrc).not.toMatch(/if\s*\(\s*isR6\s*\|\|\s*isUnresolved\s*\)\s*return\s*['"]KNOWN_DEFECT['"]/);
  });

  it('every LLM-executed result has non-zero latency', () => {
    for (const c of activeCases) {
      const r = results.get(c.id);
      if (r.currentSemantic?.validatorMode === 'LLM') {
        expect(r.currentSemantic.latencyMs).toBeGreaterThan(0);
      }
    }
  });

  it('no execution errors in any result', () => {
    for (const c of activeCases) {
      const r = results.get(c.id);
      if (r.currentSemantic) {
        expect(r.currentSemantic.validatorMode).not.toBe('EXECUTION_ERROR');
      }
    }
  });
});
