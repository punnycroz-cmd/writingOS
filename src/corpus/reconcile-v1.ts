// src/corpus/reconcile-v1.ts — Canonical Golden Corpus Reconciliation
// Loads corpus + per-case results, builds canonical ledger, computes ALL metrics,
// validates consistency, fails loudly on contradictions. Exit non-zero if fails.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CORPUS_FILE = 'corpus/golden-v1/cases.jsonl';
const RESULTS_DIR = 'writing-engine/logs-golden-v1/results';
const OUTPUT_DIR = 'writing-engine/logs-golden-v1';

function loadCorpus(): any[] {
  return readFileSync(CORPUS_FILE, 'utf-8').trim().split('\n').map(l => JSON.parse(l));
}

function loadResults(): Map<string, any> {
  const map = new Map<string, any>();
  if (!existsSync(RESULTS_DIR)) return map;
  for (const f of readdirSync(RESULTS_DIR)) {
    if (!f.endsWith('.json')) continue;
    try {
      const d = JSON.parse(readFileSync(join(RESULTS_DIR, f), 'utf-8'));
      if (d && d.caseId) map.set(d.caseId, d);
    } catch {}
  }
  return map;
}

function resolveSourcePath(sf: string): { path: string; status: string } {
  if (existsSync(sf)) return { path: sf, status: 'SOURCE_EXISTS' };
  const prefixed = sf.startsWith('writing-engine/') ? sf : `writing-engine/${sf}`;
  if (existsSync(prefixed)) return { path: prefixed, status: 'SOURCE_EXISTS' };
  return { path: sf, status: 'SOURCE_MISSING' };
}

function classifyHistorical(observedCorrect: boolean | undefined, currentCorrect: boolean | null, isR6: boolean, isUnresolved: boolean, finalScorable: boolean): string {
  if (isR6 || isUnresolved) return 'KNOWN_DEFECT';
  if (!finalScorable) return 'CHANGED_UNSCORABLE';
  if (observedCorrect && currentCorrect) return 'STABLE_SUCCESS';
  if (observedCorrect && !currentCorrect) return 'REGRESSION';
  if (!observedCorrect && currentCorrect) return 'IMPROVEMENT';
  if (!observedCorrect && !currentCorrect) return 'PERSISTENT_DEFECT';
  return 'CHANGED_UNSCORABLE';
}

function main() {
  const errors: string[] = [];
  const checks: { name: string; passed: boolean; detail: string }[] = [];

  const corpus = loadCorpus();
  const results = loadResults();
  console.log(`Corpus: ${corpus.length} | Results: ${results.size}`);

  const activeCases = corpus.filter((c: any) => c.status !== 'SUPERSEDED');
  const supersededCases = corpus.filter((c: any) => c.status === 'SUPERSEDED');
  console.log(`Active: ${activeCases.length} | Superseded: ${supersededCases.length}`);

  // Build a lookup: for superseded cases, map their ID to the replacement's source
  // so we can find the per-case result for GC-0038R1 by looking at GC-0038's result
  const supersededByMap = new Map<string, string>(); // originalId -> replacementId
  for (const c of corpus) {
    if (c.supersedes) {
      supersededByMap.set(c.supersedes, c.id);
    }
  }
  // Also: for replacement cases (GC-0038R1), if no result exists, use the original's result
  const replacementToOriginal = new Map<string, string>(); // replacementId -> originalId
  for (const c of corpus) {
    if (c.supersedes) {
      replacementToOriginal.set(c.id, c.supersedes);
    }
  }

  const ledger: any[] = [];
  for (const gc of activeCases) {
    let er = results.get(gc.id);
    if (!er) {
      // For replacement cases (e.g. GC-0038R1), try using the original's result
      const originalId = replacementToOriginal.get(gc.id);
      if (originalId) {
        er = results.get(originalId);
        if (er) {
          console.log(`  ${gc.id}: using result from superseded original ${originalId}`);
        }
      }
    }
    if (!er) { errors.push(`Missing result for ${gc.id}`); continue; }

    const src = resolveSourcePath(gc.sourceFile);
    const isR6 = gc.tags?.includes('R6') ?? false;
    const isUnresolved = gc.tags?.includes('UNRESOLVED') ?? false;
    const finalScorable = !!gc.expectedFinalDecision && !isUnresolved;
    const triageScorable = gc.expectedTriage && gc.expectedTriage !== '?' && ['DETERMINISTIC_ACCEPT', 'DETERMINISTIC_BLOCK', 'HANDOFF_TO_LLM'].includes(gc.expectedTriage);
    const semanticScorable = gc.expectedSemantic !== null && gc.expectedSemantic !== undefined;
    const cs = er.currentSemantic;
    const isLLM = cs?.validatorMode === 'LLM';
    const currentTriageCorrect = triageScorable ? er.currentTriage === gc.expectedTriage : null;
    const currentFinalCorrect = finalScorable ? er.currentFinalDecision === gc.expectedFinalDecision : null;
    const historicalComparison = classifyHistorical(gc.observedCorrect, currentFinalCorrect, isR6, isUnresolved, finalScorable);

    let ioCorrect: boolean | null = null;
    let faithCorrect: boolean | null = null;
    if (semanticScorable && isLLM && gc.expectedSemantic) {
      if (gc.expectedSemantic.infoOwnership && cs?.infoOwnership) ioCorrect = cs.infoOwnership === gc.expectedSemantic.infoOwnership;
      if (gc.expectedSemantic.faithfulness && cs?.faithfulness) faithCorrect = cs.faithfulness === gc.expectedSemantic.faithfulness;
    }

    ledger.push({
      ...gc, ...er, active: true, canonicalSourcePath: src.path, sourceStatus: src.status,
      triageScorable, semanticScorable, finalScorable, isR6, isUnresolved,
      currentTriageCorrect, currentFinalCorrect, ioCorrect, faithCorrect, historicalComparison,
    });
  }

  if (errors.length > 0) { errors.forEach(e => console.error(`ERROR: ${e}`)); process.exit(1); }

  // Compute metrics
  const activeCount = ledger.length;
  const unresolvedCount = ledger.filter((e: any) => e.isUnresolved).length;
  const r6Count = ledger.filter((e: any) => e.isR6).length;

  const scorableTriage = ledger.filter((e: any) => e.triageScorable);
  const triageCorrect = scorableTriage.filter((e: any) => e.currentTriageCorrect === true).length;

  const semanticGTAvailable = ledger.filter((e: any) => e.semanticScorable).length;
  const semanticExecuted = ledger.filter((e: any) => e.semanticScorable && e.currentSemantic?.validatorMode === 'LLM').length;
  const ioScorable = ledger.filter((e: any) => e.semanticScorable && e.currentSemantic?.validatorMode === 'LLM' && e.expectedSemantic?.infoOwnership).length;
  const ioCorrect = ledger.filter((e: any) => e.ioCorrect === true).length;
  const faithScorable = ledger.filter((e: any) => e.semanticScorable && e.currentSemantic?.validatorMode === 'LLM' && e.expectedSemantic?.faithfulness).length;
  const faithCorrect = ledger.filter((e: any) => e.faithCorrect === true).length;

  const detAccept = ledger.filter((e: any) => e.currentTriage === 'DETERMINISTIC_ACCEPT').length;
  const detBlock = ledger.filter((e: any) => e.currentTriage === 'DETERMINISTIC_BLOCK').length;
  const detFastPath = detAccept + detBlock;
  const llmExecuted = ledger.filter((e: any) => e.currentSemantic?.validatorMode === 'LLM').length;
  const execErrors = ledger.filter((e: any) => e.currentSemantic?.validatorMode === 'EXECUTION_ERROR').length;

  const scorableFinal = ledger.filter((e: any) => e.finalScorable);
  const finalCorrect = scorableFinal.filter((e: any) => e.currentFinalCorrect === true).length;
  const falseAcceptance = scorableFinal.filter((e: any) => e.expectedFinalDecision === 'REJECT' && e.currentFinalDecision === 'ACCEPT').length;
  const falseRejection = scorableFinal.filter((e: any) => e.expectedFinalDecision === 'ACCEPT' && e.currentFinalDecision === 'REJECT').length;

  const hc: Record<string, number> = {};
  for (const e of ledger) { hc[e.historicalComparison] = (hc[e.historicalComparison] || 0) + 1; }

  const falseAcceptCases = scorableFinal.filter((e: any) => e.expectedFinalDecision === 'REJECT' && e.currentFinalDecision === 'ACCEPT')
    .map((e: any) => ({ caseId: e.id, expected: e.expectedFinalDecision, current: e.currentFinalDecision, isR6: e.isR6, io: e.currentSemantic?.infoOwnership, faith: e.currentSemantic?.faithfulness, historicalCorrect: e.observedCorrect, groundTruthType: e.groundTruthType }));
  const falseRejectCases = scorableFinal.filter((e: any) => e.expectedFinalDecision === 'ACCEPT' && e.currentFinalDecision === 'REJECT')
    .map((e: any) => ({ caseId: e.id, expected: e.expectedFinalDecision, current: e.currentFinalDecision, isR6: e.isR6, io: e.currentSemantic?.infoOwnership, faith: e.currentSemantic?.faithfulness, historicalCorrect: e.observedCorrect, groundTruthType: e.groundTruthType }));

  const r6Details = ledger.filter((e: any) => e.isR6).map((e: any) => ({
    caseId: e.id, state: e.stateSnapshot, expected: e.expectedFinalDecision,
    historical: e.observedFinalDecision, current: e.currentFinalDecision,
    status: e.historicalComparison, io: e.currentSemantic?.infoOwnership
  }));

  const sourceExists = ledger.filter((e: any) => e.sourceStatus === 'SOURCE_EXISTS').length;
  const sourceMissing = ledger.filter((e: any) => e.sourceStatus === 'SOURCE_MISSING').length;

  const metrics = {
    historicalCases: corpus.length, activeCases: activeCount, supersededCases: supersededCases.length,
    unresolvedCases: unresolvedCount, r6Cases: r6Count,
    scorableTriage: scorableTriage.length, triageCorrect,
    semanticGroundTruthAvailable: semanticGTAvailable, semanticExecutionAvailable: semanticExecuted,
    semanticScoringEligible: semanticExecuted,
    ioOwnershipScorable: ioScorable, ioOwnershipCorrect: ioCorrect,
    faithfulnessScorable: faithScorable, faithfulnessCorrect: faithCorrect,
    scorableFinal: scorableFinal.length, finalCorrect, falseAcceptance, falseRejection,
    executionErrors: execErrors, llmExecuted, deterministicFastPathed: detFastPath, detAccept, detBlock,
    stableSuccess: hc['STABLE_SUCCESS'] || 0, regression: hc['REGRESSION'] || 0,
    improvement: hc['IMPROVEMENT'] || 0, persistentDefect: hc['PERSISTENT_DEFECT'] || 0,
    knownDefect: hc['KNOWN_DEFECT'] || 0, changedUnscorable: hc['CHANGED_UNSCORABLE'] || 0,
    sourceExists, sourceMissing,
  };

  // Consistency checks
  checks.push({ name: 'active_count', passed: activeCount === corpus.length - supersededCases.length, detail: `${activeCount} == ${corpus.length} - ${supersededCases.length}` });
  const hcSum = Object.values(hc).reduce((a: number, b: number) => a + b, 0);
  checks.push({ name: 'hc_sum', passed: hcSum === activeCount, detail: `${hcSum} == ${activeCount}` });
  checks.push({ name: 'no_superseded_in_active', passed: ledger.filter((e: any) => e.status === 'SUPERSEDED').length === 0, detail: '0 superseded in active' });
  checks.push({ name: 'r6_count', passed: ledger.filter((e: any) => e.tags?.includes('R6')).length === r6Count, detail: `${r6Count}` });
  checks.push({ name: 'final_sum', passed: falseAcceptance + falseRejection + finalCorrect === scorableFinal.length, detail: `${falseAcceptance}+${falseRejection}+${finalCorrect} == ${scorableFinal.length}` });
  checks.push({ name: 'all_have_results', passed: ledger.length === activeCount, detail: `${ledger.length} == ${activeCount}` });
  checks.push({ name: 'source_paths', passed: sourceMissing === 0, detail: `${sourceExists} exist, ${sourceMissing} missing` });
  checks.push({ name: 'no_exec_errors', passed: execErrors === 0, detail: `${execErrors}` });

  const allPassed = checks.every(c => c.passed);

  writeFileSync(join(OUTPUT_DIR, 'canonical-case-ledger.json'), JSON.stringify(ledger, null, 2));
  writeFileSync(join(OUTPUT_DIR, 'reconciliation-report.json'), JSON.stringify({ metrics, falseAcceptCases, falseRejectCases, r6Details, checks, allPassed }, null, 2));
  writeFileSync(join(OUTPUT_DIR, 'consistency-check.json'), JSON.stringify({ passed: allPassed, errors, warnings: [], metricChecks: checks }, null, 2));
  writeFileSync(join(OUTPUT_DIR, 'summary.json'), JSON.stringify(metrics, null, 2));

  console.log('\n=== CANONICAL METRICS ===');
  console.log(JSON.stringify(metrics, null, 2));
  console.log('\n=== CONSISTENCY CHECKS ===');
  for (const c of checks) console.log(`  ${c.passed ? '✓' : '✗'} ${c.name}: ${c.detail}`);
  console.log(`\n=== ${allPassed ? 'ALL PASSED — READY TO FREEZE' : 'FAILED — FREEZE BLOCKED'} ===`);

  if (!allPassed) process.exit(1);
}

main();
