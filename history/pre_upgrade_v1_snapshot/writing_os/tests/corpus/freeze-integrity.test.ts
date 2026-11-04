// tests/corpus/freeze-integrity.test.ts
// End-to-end freeze integrity test. Loads the actual corpus, results, ledger,
// and summary, then verifies the freeze invariants. No mocking.

import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { classifyHistoricalComparison } from '../../src/corpus/classify-comparison';
import { validateFreezeDoc, REQUIRED_METRICS } from '../../src/corpus/freeze-document-parser';

const CORPUS_FILE = 'history/corpus/golden-v1/cases.jsonl';
const RESULTS_DIR = 'history/writing-engine/logs-golden-v1/results';
const LEDGER_FILE = 'history/writing-engine/logs-golden-v1/canonical-case-ledger.json';
const SUMMARY_FILE = 'history/writing-engine/logs-golden-v1/summary.json';
const CONSISTENCY_FILE = 'history/writing-engine/logs-golden-v1/consistency-check.json';
const MANIFEST_FILE = 'history/corpus/golden-v1/corpus-manifest.json';
const FREEZE_DOC = 'docs/corpus/GOLDEN_CORPUS_V1_FREEZE.md';
const FORENSIC_MANIFEST = 'history/forensic/phase2b-5/MANIFEST.json';
const FORENSIC_INVENTORY = 'history/forensic/phase2b-5/file-inventory.json';
const FORENSIC_EXCLUDED = 'history/forensic/phase2b-5/EXCLUDED_FILES.md';

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
    for (const c of activeCases) expect(results.has(c.id)).toBe(true);
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
    expect(r6.map(c => c.id).sort()).toEqual(['GC-0031', 'GC-0033', 'GC-0036']);
  });

  it('R6 classifications use canonical algorithm', () => {
    for (const c of activeCases.filter(c => c.tags?.includes('R6'))) {
      const r = results.get(c.id);
      const derived = classifyHistoricalComparison({
        expectedFinalDecision: c.expectedFinalDecision, historicalObservedDecision: c.observedFinalDecision,
        historicalCorrect: c.observedCorrect, currentFinalDecision: r.currentFinalDecision,
        currentFinalCorrect: r.currentFinalDecision === c.expectedFinalDecision,
        isR6: true, isUnresolved: c.tags?.includes('UNRESOLVED') ?? false, finalScorable: !!c.expectedFinalDecision,
      });
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
    for (const c of consistency.metricChecks) expect(c.passed).toBe(true);
  });

  it('manifest activeCases matches ledger', () => {
    const manifest = JSON.parse(readFileSync(MANIFEST_FILE, 'utf-8'));
    expect(manifest.activeCases).toBe(ledger.length);
  });

  // ===== CHECK #18 INTEGRATION TEST =====
  // Parses the actual freeze document and compares to the actual summary.
  // This would FAIL if the freeze doc had stale metrics (exactly the bug we're catching).
  it('check #18: freeze document metrics match summary.json', () => {
    const fdContent = readFileSync(FREEZE_DOC, 'utf-8');
    expect(fdContent).not.toContain('FREEZE_BLOCKED');
    const result = validateFreezeDoc(fdContent, summary);
    expect(result.valid).toBe(true);
    expect(result.mismatches.length).toBe(0);
    expect(result.parseErrors.length).toBe(0);
    // Verify ALL required metrics are present and match
    for (const key of REQUIRED_METRICS) {
      expect(result.parsed.has(key)).toBe(true);
      expect(result.parsed.get(key)).toBe(summary[key]);
    }
  });

  it('check #18: freeze document contains all 16 required metric rows', () => {
    const fdContent = readFileSync(FREEZE_DOC, 'utf-8');
    const { metrics } = validateFreezeDoc(fdContent, summary).parsed ? { metrics: validateFreezeDoc(fdContent, summary).parsed } : { metrics: new Map() };
    // All 16 required metrics must be parseable from the freeze doc
    for (const key of REQUIRED_METRICS) {
      expect(metrics.has(key)).toBe(true);
    }
  });

  // ===== CHECK #20 INTEGRATION TEST =====
  it('check #20: forensic MANIFEST.json exists and has required fields', () => {
    expect(existsSync(FORENSIC_MANIFEST)).toBe(true);
    const manifest = JSON.parse(readFileSync(FORENSIC_MANIFEST, 'utf-8'));
    expect(manifest.task).toBeDefined();
    expect(manifest.repository).toBeDefined();
    expect(manifest.branch).toBeDefined();
    expect(manifest.head).toBeDefined();
    expect(manifest.filesPreserved).toBeDefined();
    expect(manifest.sensitivePatternsChecked).toBe(true);
    expect(manifest.secretsFound).toBe(false);
  });

  it('check #20: file-inventory.json exists with valid structure', () => {
    expect(existsSync(FORENSIC_INVENTORY)).toBe(true);
    const inventory = JSON.parse(readFileSync(FORENSIC_INVENTORY, 'utf-8'));
    expect(inventory.files).toBeDefined();
    expect(Array.isArray(inventory.files)).toBe(true);
    expect(inventory.totalFiles).toBe(inventory.files.length);
  });

  it('check #20: manifest filesPreserved matches inventory totalFiles', () => {
    const manifest = JSON.parse(readFileSync(FORENSIC_MANIFEST, 'utf-8'));
    const inventory = JSON.parse(readFileSync(FORENSIC_INVENTORY, 'utf-8'));
    expect(manifest.filesPreserved).toBe(inventory.totalFiles);
  });

  it('check #20: EXCLUDED_FILES.md exists and mentions required policies', () => {
    expect(existsSync(FORENSIC_EXCLUDED)).toBe(true);
    const content = readFileSync(FORENSIC_EXCLUDED, 'utf-8').toLowerCase();
    expect(content).toContain('.env');
    expect(content).toContain('node_modules');
    expect(content).toContain('credentials');
    expect(content).toContain('api keys');
    expect(content).toContain('github pat');
    expect(content).toContain('private key');
  });

  it('reconciler imports the canonical classifier (no duplicate logic)', () => {
    const reconcilerSrc = readFileSync('working/src/corpus/reconcile-v1.ts', 'utf-8');
    expect(reconcilerSrc).toContain("from './classify-comparison'");
    expect(reconcilerSrc).not.toMatch(/if\s*\(\s*isR6\s*\|\|\s*isUnresolved\s*\)\s*return\s*['"]KNOWN_DEFECT['"]/);
  });

  it('reconciler imports the freeze-document-parser for check #18', () => {
    const reconcilerSrc = readFileSync('working/src/corpus/reconcile-v1.ts', 'utf-8');
    expect(reconcilerSrc).toContain("from './freeze-document-parser'");
    expect(reconcilerSrc).toContain('checkFreezeDocConsistency');
  });

  it('reconciler imports the forensic-validator for check #20', () => {
    const reconcilerSrc = readFileSync('working/src/corpus/reconcile-v1.ts', 'utf-8');
    expect(reconcilerSrc).toContain("from './forensic-validator'");
    expect(reconcilerSrc).toContain('checkForensicInventoryConsistency');
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
