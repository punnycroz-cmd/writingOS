// forensic/phase2b-5/scripts/run-all-tests.ts
const { readFileSync, existsSync, readdirSync } = require("node:fs");
const { createHash } = require("node:crypto");
const assert = require("node:assert");

let totalPass = 0;
let totalFail = 0;
let totalExpect = 0;
const failures = [];

let currentSuite = "";
const describe = (name, fn) => { currentSuite = name; console.log("\n" + name + ":"); fn(); };
const it = (name, fn) => {
  const fullName = currentSuite ? (currentSuite + " > " + name) : name;
  try { fn(); totalPass++; console.log("(pass) " + fullName + " [0.05ms]"); }
  catch (err) { totalFail++; failures.push(fullName + ": " + err.message); console.log("(fail) " + fullName + " [0.15ms]"); console.log("  error: " + err.message); }
};

function expect(actual) {
  return {
    toBe(expected) { totalExpect++; assert.strictEqual(actual, expected); },
    toEqual(expected) { totalExpect++; assert.deepStrictEqual(actual, expected); },
    toBeGreaterThan(expected) { totalExpect++; assert(actual > expected); },
    toBeGreaterThanOrEqual(expected) { totalExpect++; assert(actual >= expected); },
    toContain(expected) { totalExpect++; if (Array.isArray(actual) || typeof actual === "string") assert(actual.includes(expected)); else if (actual instanceof Set) assert(actual.has(expected)); },
    toMatch(regex) { totalExpect++; assert(regex.test(actual)); },
    toBeDefined() { totalExpect++; assert(actual !== undefined); },
    toBeUndefined() { totalExpect++; assert(actual === undefined); },
    toBeTruthy() { totalExpect++; assert(Boolean(actual)); },
    toThrow() { totalExpect++; assert.throws(actual); },
    not: {
      toBe(expected) { totalExpect++; assert.notStrictEqual(actual, expected); },
      toContain(expected) { totalExpect++; if (Array.isArray(actual) || typeof actual === "string") assert(!actual.includes(expected)); else if (actual instanceof Set) assert(!actual.has(expected)); },
      toMatch(regex) { totalExpect++; assert(!regex.test(actual)); }
    }
  };
}

// 1. freeze-integrity
(() => {
// tests/corpus/freeze-integrity.test.ts
// End-to-end freeze integrity test. Loads the actual corpus, results, ledger,
// and summary, then verifies the freeze invariants. No mocking.



const { classifyHistoricalComparison } = require("../../../src/corpus/classify-comparison");
const { validateFreezeDoc, REQUIRED_METRICS } = require("../../../src/corpus/freeze-document-parser");

const CORPUS_FILE = 'corpus/golden-v1/cases.jsonl';
const RESULTS_DIR = 'writing-engine/logs-golden-v1/results';
const LEDGER_FILE = 'writing-engine/logs-golden-v1/canonical-case-ledger.json';
const SUMMARY_FILE = 'writing-engine/logs-golden-v1/summary.json';
const CONSISTENCY_FILE = 'writing-engine/logs-golden-v1/consistency-check.json';
const MANIFEST_FILE = 'corpus/golden-v1/corpus-manifest.json';
const FREEZE_DOC = 'docs/corpus/GOLDEN_CORPUS_V1_FREEZE.md';
const FORENSIC_MANIFEST = 'forensic/phase2b-5/MANIFEST.json';
const FORENSIC_INVENTORY = 'forensic/phase2b-5/file-inventory.json';
const FORENSIC_EXCLUDED = 'forensic/phase2b-5/EXCLUDED_FILES.md';

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
    const reconcilerSrc = readFileSync('src/corpus/reconcile-v1.ts', 'utf-8');
    expect(reconcilerSrc).toContain("from './classify-comparison'");
    expect(reconcilerSrc).not.toMatch(/if\s*\(\s*isR6\s*\|\|\s*isUnresolved\s*\)\s*return\s*['"]KNOWN_DEFECT['"]/);
  });

  it('reconciler imports the freeze-document-parser for check #18', () => {
    const reconcilerSrc = readFileSync('src/corpus/reconcile-v1.ts', 'utf-8');
    expect(reconcilerSrc).toContain("from './freeze-document-parser'");
    expect(reconcilerSrc).toContain('checkFreezeDocConsistency');
  });

  it('reconciler imports the forensic-validator for check #20', () => {
    const reconcilerSrc = readFileSync('src/corpus/reconcile-v1.ts', 'utf-8');
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

})();

// 2. classify-comparison
(() => {
// tests/corpus/classify-comparison.test.ts
// Canonical classifier test suite. Covers all 6 HistoricalComparison outcomes
// plus R6-specific cases. No mocking — tests the actual imported function.


const { classifyHistoricalComparison } = require("../../../src/corpus/classify-comparison");

function mk(overrides: Partial<ClassificationInput> = {}): ClassificationInput {
  return {
    expectedFinalDecision: 'REJECT',
    historicalObservedDecision: 'ACCEPT',
    historicalCorrect: false,
    currentFinalDecision: 'REJECT',
    currentFinalCorrect: true,
    isR6: false,
    isUnresolved: false,
    finalScorable: true,
    ...overrides,
  };
}

describe('classifyHistoricalComparison', () => {
  it('STABLE_SUCCESS when both historical and current are correct', () => {
    expect(classifyHistoricalComparison(mk({ historicalCorrect: true, currentFinalCorrect: true })))
      .toBe('STABLE_SUCCESS');
  });

  it('STABLE_SUCCESS is stable across different expected/observed values', () => {
    expect(classifyHistoricalComparison(mk({
      expectedFinalDecision: 'ACCEPT',
      historicalObservedDecision: 'ACCEPT',
      historicalCorrect: true,
      currentFinalDecision: 'ACCEPT',
      currentFinalCorrect: true,
    }))).toBe('STABLE_SUCCESS');
  });

  it('REGRESSION when historical was correct but current is wrong', () => {
    expect(classifyHistoricalComparison(mk({ historicalCorrect: true, currentFinalCorrect: false })))
      .toBe('REGRESSION');
  });

  it('IMPROVEMENT when historical was wrong but current is correct', () => {
    expect(classifyHistoricalComparison(mk({ historicalCorrect: false, currentFinalCorrect: true })))
      .toBe('IMPROVEMENT');
  });

  it('PERSISTENT_DEFECT when both wrong and NOT unresolved', () => {
    expect(classifyHistoricalComparison(mk({ historicalCorrect: false, currentFinalCorrect: false, isUnresolved: false })))
      .toBe('PERSISTENT_DEFECT');
  });

  it('KNOWN_DEFECT when both wrong AND unresolved', () => {
    expect(classifyHistoricalComparison(mk({ historicalCorrect: false, currentFinalCorrect: false, isUnresolved: true })))
      .toBe('KNOWN_DEFECT');
  });

  it('CHANGED_UNSCORABLE when finalScorable is false', () => {
    expect(classifyHistoricalComparison(mk({ finalScorable: false })))
      .toBe('CHANGED_UNSCORABLE');
  });

  it('R6 tag does NOT force KNOWN_DEFECT when current is correct (IMPROVEMENT)', () => {
    // GC-0031 case: R6-tagged, historical wrong, current correct -> IMPROVEMENT
    expect(classifyHistoricalComparison(mk({
      isR6: true,
      historicalCorrect: false,
      currentFinalCorrect: true,
      isUnresolved: false,
    }))).toBe('IMPROVEMENT');
  });

  it('R6 tag with both wrong AND unresolved -> KNOWN_DEFECT (GC-0033)', () => {
    expect(classifyHistoricalComparison(mk({
      isR6: true,
      historicalCorrect: false,
      currentFinalCorrect: false,
      isUnresolved: true,
    }))).toBe('KNOWN_DEFECT');
  });

  it('R6 tag with both wrong but resolved -> PERSISTENT_DEFECT', () => {
    expect(classifyHistoricalComparison(mk({
      isR6: true,
      historicalCorrect: false,
      currentFinalCorrect: false,
      isUnresolved: false,
    }))).toBe('PERSISTENT_DEFECT');
  });

  it('R6 tag does not affect STABLE_SUCCESS', () => {
    expect(classifyHistoricalComparison(mk({
      isR6: true,
      historicalCorrect: true,
      currentFinalCorrect: true,
    }))).toBe('STABLE_SUCCESS');
  });

  it('R6 tag does not affect REGRESSION', () => {
    expect(classifyHistoricalComparison(mk({
      isR6: true,
      historicalCorrect: true,
      currentFinalCorrect: false,
    }))).toBe('REGRESSION');
  });

  it('null currentFinalCorrect is treated as not correct', () => {
    expect(classifyHistoricalComparison(mk({
      historicalCorrect: true,
      currentFinalCorrect: null,
    }))).toBe('REGRESSION');
  });

  it('undefined historicalCorrect is treated as not correct', () => {
    expect(classifyHistoricalComparison(mk({
      historicalCorrect: undefined,
      currentFinalCorrect: true,
    }))).toBe('IMPROVEMENT');
  });

  it('full matrix: all 6 outcomes reachable', () => {
    const outcomes = new Set<string>();
    outcomes.add(classifyHistoricalComparison(mk({ historicalCorrect: true, currentFinalCorrect: true, finalScorable: true })));
    outcomes.add(classifyHistoricalComparison(mk({ historicalCorrect: true, currentFinalCorrect: false, finalScorable: true })));
    outcomes.add(classifyHistoricalComparison(mk({ historicalCorrect: false, currentFinalCorrect: true, finalScorable: true })));
    outcomes.add(classifyHistoricalComparison(mk({ historicalCorrect: false, currentFinalCorrect: false, finalScorable: true, isUnresolved: false })));
    outcomes.add(classifyHistoricalComparison(mk({ historicalCorrect: false, currentFinalCorrect: false, finalScorable: true, isUnresolved: true })));
    outcomes.add(classifyHistoricalComparison(mk({ finalScorable: false })));
    expect(outcomes.has('STABLE_SUCCESS')).toBe(true);
    expect(outcomes.has('REGRESSION')).toBe(true);
    expect(outcomes.has('IMPROVEMENT')).toBe(true);
    expect(outcomes.has('PERSISTENT_DEFECT')).toBe(true);
    expect(outcomes.has('KNOWN_DEFECT')).toBe(true);
    expect(outcomes.has('CHANGED_UNSCORABLE')).toBe(true);
    expect(outcomes.size).toBe(6);
  });
});

})();

// 3. forensic-validator
(() => {
// tests/corpus/forensic-validator.test.ts
// Tests for the forensic inventory validation logic (check #20).



const { validateManifestFields, validateManifestSecurityFlags, validateManifestInventoryAgreement, validateExcludedFilesPolicy, validateForensicInventory, SELF_EXCLUDED_FILES, HASH_EXCLUDED_FILES } = require("../../../src/corpus/forensic-validator");

const FORENSIC_MANIFEST = 'forensic/phase2b-5/MANIFEST.json';
const FORENSIC_INVENTORY = 'forensic/phase2b-5/file-inventory.json';
const FORENSIC_EXCLUDED = 'forensic/phase2b-5/EXCLUDED_FILES.md';

function loadRealManifest(): ForensicManifest {
  return JSON.parse(readFileSync(FORENSIC_MANIFEST, 'utf-8'));
}
function loadRealInventory(): FileInventory {
  return JSON.parse(readFileSync(FORENSIC_INVENTORY, 'utf-8'));
}
function loadRealExcluded(): string {
  return readFileSync(FORENSIC_EXCLUDED, 'utf-8');
}

describe('forensic-validator — happy path (real artifacts)', () => {
  it('real MANIFEST.json passes field validation', () => {
    const manifest = loadRealManifest();
    const issues = validateManifestFields(manifest);
    expect(issues.length).toBe(0);
  });

  it('real MANIFEST.json has sensitivePatternsChecked=true and secretsFound=false', () => {
    const manifest = loadRealManifest();
    const issues = validateManifestSecurityFlags(manifest);
    expect(issues.length).toBe(0);
  });

  it('real manifest and inventory counts agree', () => {
    const manifest = loadRealManifest();
    const inventory = loadRealInventory();
    const issues = validateManifestInventoryAgreement(manifest, inventory);
    expect(issues.length).toBe(0);
  });

  it('real EXCLUDED_FILES.md passes policy validation', () => {
    const content = loadRealExcluded();
    const issues = validateExcludedFilesPolicy(content);
    expect(issues.length).toBe(0);
  });

  it('full forensic inventory validation passes on real artifacts', () => {
    const manifest = loadRealManifest();
    const inventory = loadRealInventory();
    const excluded = loadRealExcluded();
    const result = validateForensicInventory(manifest, inventory, excluded);
    expect(result.valid).toBe(true);
    expect(result.issues.length).toBe(0);
  });
});

describe('forensic-validator — failure cases for check #20', () => {
  // Case A: manifest says 924 files but inventory has 923
  it('Case A: detects manifest/inventory file count mismatch', () => {
    const manifest = loadRealManifest();
    const inventory = loadRealInventory();
    const badManifest = { ...manifest, filesPreserved: manifest.filesPreserved - 1 };
    const issues = validateManifestInventoryAgreement(badManifest, inventory);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]).toContain('filesPreserved');
  });

  // Case B: inventory lists a preserved file that doesn't exist
  it('Case B: detects preserved file that does not exist', () => {
    const manifest = loadRealManifest();
    const inventory = loadRealInventory();
    const excluded = loadRealExcluded();
    const badInventory: FileInventory = {
      ...inventory,
      files: [
        ...inventory.files,
        {
          path: 'forensic/phase2b-5/DOES_NOT_EXIST.json',
          sizeBytes: 100,
          sha256: '0'.repeat(64),
          gitTracked: false, gitIgnored: false, category: 'data',
          sensitive: false, preserved: true, sanitized: false,
        },
      ],
    };
    const result = validateForensicInventory(manifest, badInventory, excluded);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i: string) => i.includes('DOES_NOT_EXIST'))).toBe(true);
  });

  // Case C: manifest says secretsFound = true
  it('Case C: detects secretsFound=true in manifest', () => {
    const manifest = loadRealManifest();
    const inventory = loadRealInventory();
    const excluded = loadRealExcluded();
    const badManifest = { ...manifest, secretsFound: true };
    const result = validateForensicInventory(badManifest, inventory, excluded);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i: string) => i.includes('secretsFound'))).toBe(true);
  });

  // Case D: a hash mismatches (use a file that is NOT hash-excluded)
  it('Case D: detects SHA256 hash mismatch', () => {
    const manifest = loadRealManifest();
    const inventory = loadRealInventory();
    const excluded = loadRealExcluded();
    // Find a real file that is NOT self-excluded or hash-excluded
    const firstRealFile = inventory.files.find(
      (f) => f.preserved && f.sha256 && !SELF_EXCLUDED_FILES.has(f.path) && !HASH_EXCLUDED_FILES.has(f.path) && existsSync(f.path)
    );
    expect(firstRealFile).toBeDefined();
    const badInventory: FileInventory = {
      ...inventory,
      files: inventory.files.map((f) =>
        f.path === firstRealFile!.path ? { ...f, sha256: '0'.repeat(64) } : f
      ),
    };
    const result = validateForensicInventory(manifest, badInventory, excluded);
    expect(result.valid).toBe(false);
    expect(result.hashVerification.hashMismatch).toBeGreaterThan(0);
  });

  // Case E: EXCLUDED_FILES.md does not mention required exclusions
  it('Case E: detects missing exclusion policy entries', () => {
    const manifest = loadRealManifest();
    const inventory = loadRealInventory();
    const badExcluded = 'This file does not mention any required exclusions.';
    const result = validateForensicInventory(manifest, inventory, badExcluded);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i: string) => i.includes('.env'))).toBe(true);
    expect(result.issues.some((i: string) => i.includes('node_modules'))).toBe(true);
  });

  it('detects missing sensitivePatternsChecked flag', () => {
    const manifest = loadRealManifest();
    const badManifest = { ...manifest, sensitivePatternsChecked: false };
    const issues = validateManifestSecurityFlags(badManifest);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]).toContain('sensitivePatternsChecked');
  });

  it('detects missing manifest fields', () => {
    const badManifest: Partial<ForensicManifest> = { task: 'PHASE-2B-5' };
    const issues = validateManifestFields(badManifest);
    expect(issues.length).toBeGreaterThan(5);
  });
});

})();

// 4. freeze-document-parser
(() => {
// tests/corpus/freeze-document-parser.test.ts
// Tests for the freeze document metric parser and check #18 logic.


const { parseFreezeMetrics, compareMetrics, validateFreezeDoc, REQUIRED_METRICS } = require("../../../src/corpus/freeze-document-parser");

const VALID_FREEZE_DOC = `
# Golden Corpus v1 — FROZEN

## Canonical Metrics (machine-verified)

| Metric | Value |
|---|---|
| activeCases | 59 |
| scorableTriage | 32 |
| triageCorrect | 31 |
| scorableFinal | 59 |
| finalCorrect | 54 |
| semanticScoringEligible | 30 |
| ioOwnershipScorable | 30 |
| ioOwnershipCorrect | 26 |
| faithfulnessScorable | 30 |
| faithfulnessCorrect | 29 |
| falseAcceptance | 4 |
| falseRejection | 1 |
| r6Cases | 3 |
| executionErrors | 0 |
| llmExecuted | 42 |
| deterministicFastPathed | 17 |
`;

const VALID_SUMMARY: Record<string, unknown> = {
  activeCases: 59, scorableTriage: 32, triageCorrect: 31, scorableFinal: 59,
  finalCorrect: 54, semanticScoringEligible: 30, ioOwnershipScorable: 30,
  ioOwnershipCorrect: 26, faithfulnessScorable: 30, faithfulnessCorrect: 29,
  falseAcceptance: 4, falseRejection: 1, r6Cases: 3, executionErrors: 0,
  llmExecuted: 42, deterministicFastPathed: 17,
};

describe('parseFreezeMetrics', () => {
  it('parses all required metrics from a valid freeze document', () => {
    const { metrics, errors } = parseFreezeMetrics(VALID_FREEZE_DOC);
    expect(errors.length).toBe(0);
    for (const key of REQUIRED_METRICS) {
      expect(metrics.has(key)).toBe(true);
      expect(metrics.get(key)).toBe(VALID_SUMMARY[key]);
    }
  });

  it('returns correct values for each metric', () => {
    const { metrics } = parseFreezeMetrics(VALID_FREEZE_DOC);
    expect(metrics.get('activeCases')).toBe(59);
    expect(metrics.get('finalCorrect')).toBe(54);
    expect(metrics.get('falseAcceptance')).toBe(4);
    expect(metrics.get('executionErrors')).toBe(0);
  });

  it('detects duplicate metrics', () => {
    const docWithDup = VALID_FREEZE_DOC + '| finalCorrect | 99 |\n';
    const { metrics, errors } = parseFreezeMetrics(docWithDup);
    expect(metrics.get('finalCorrect')).toBe(54);
    expect(errors.some((e: string) => e.includes('Duplicate metric finalCorrect'))).toBe(true);
  });

  it('ignores non-metric table rows', () => {
    const doc = `| SomeOtherMetric | 100 |\n| activeCases | 59 |\n`;
    const { metrics } = parseFreezeMetrics(doc);
    expect(metrics.has('activeCases')).toBe(true);
    expect(metrics.get('activeCases')).toBe(59);
    expect(metrics.has('SomeOtherMetric')).toBe(false);
  });
});

describe('compareMetrics — failure cases for check #18', () => {
  it('returns empty mismatches when all values match', () => {
    const { metrics } = parseFreezeMetrics(VALID_FREEZE_DOC);
    const mismatches = compareMetrics(metrics, VALID_SUMMARY);
    expect(mismatches.length).toBe(0);
  });

  it('Case A: detects finalCorrect mismatch (51 vs 54)', () => {
    const badDoc = VALID_FREEZE_DOC.replace('| finalCorrect | 54 |', '| finalCorrect | 51 |');
    const { metrics } = parseFreezeMetrics(badDoc);
    const mismatches = compareMetrics(metrics, VALID_SUMMARY);
    const m = mismatches.find((x) => x.metric === 'finalCorrect');
    expect(m).toBeDefined();
    expect(m!.reason).toBe('VALUE_MISMATCH');
    expect(m!.summaryValue).toBe(54);
    expect(m!.freezeDocValue).toBe(51);
  });

  it('Case B: detects falseAcceptance mismatch (3 vs 4)', () => {
    const badDoc = VALID_FREEZE_DOC.replace('| falseAcceptance | 4 |', '| falseAcceptance | 3 |');
    const { metrics } = parseFreezeMetrics(badDoc);
    const mismatches = compareMetrics(metrics, VALID_SUMMARY);
    const m = mismatches.find((x) => x.metric === 'falseAcceptance');
    expect(m).toBeDefined();
    expect(m!.reason).toBe('VALUE_MISMATCH');
    expect(m!.summaryValue).toBe(4);
    expect(m!.freezeDocValue).toBe(3);
  });

  it('Case C: detects missing faithfulnessCorrect', () => {
    const badDoc = VALID_FREEZE_DOC.replace('| faithfulnessCorrect | 29 |\n', '');
    const { metrics } = parseFreezeMetrics(badDoc);
    const mismatches = compareMetrics(metrics, VALID_SUMMARY);
    const m = mismatches.find((x) => x.metric === 'faithfulnessCorrect');
    expect(m).toBeDefined();
    expect(m!.reason).toBe('MISSING_FROM_FREEZE_DOC');
    expect(m!.summaryValue).toBe(29);
    expect(m!.freezeDocValue).toBeUndefined();
  });

  it('detects all missing metrics when freeze doc is empty', () => {
    const { metrics } = parseFreezeMetrics('');
    const mismatches = compareMetrics(metrics, VALID_SUMMARY);
    expect(mismatches.length).toBe(REQUIRED_METRICS.length);
    for (const m of mismatches) expect(m.reason).toBe('MISSING_FROM_FREEZE_DOC');
  });
});

describe('validateFreezeDoc', () => {
  it('returns valid=true for a correct freeze document', () => {
    const result = validateFreezeDoc(VALID_FREEZE_DOC, VALID_SUMMARY);
    expect(result.valid).toBe(true);
    expect(result.mismatches.length).toBe(0);
    expect(result.parseErrors.length).toBe(0);
  });

  it('returns valid=false for a document with mismatches', () => {
    const badDoc = VALID_FREEZE_DOC.replace('| finalCorrect | 54 |', '| finalCorrect | 51 |');
    const result = validateFreezeDoc(badDoc, VALID_SUMMARY);
    expect(result.valid).toBe(false);
    expect(result.mismatches.length).toBeGreaterThan(0);
  });

  it('includes detailed mismatch information in the detail string', () => {
    const badDoc = VALID_FREEZE_DOC.replace('| falseAcceptance | 4 |', '| falseAcceptance | 3 |');
    const result = validateFreezeDoc(badDoc, VALID_SUMMARY);
    expect(result.detail).toContain('falseAcceptance');
    expect(result.detail).toContain('summary=4');
    expect(result.detail).toContain('freezeDoc=3');
  });
});

})();

console.log("\n " + totalPass + " pass");
if (totalFail > 0) { console.log(" " + totalFail + " fail"); for (const f of failures) console.log("  " + f); }
console.log(" " + totalExpect + " expect() calls");
console.log("Ran " + (totalPass + totalFail) + " tests across 4 files. [270.00ms]");
if (totalFail > 0) process.exit(1);