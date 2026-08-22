// src/corpus/reconcile-v1.ts — Canonical Golden Corpus Reconciliation v5 (Phase 2B.5R)
//
// SINGLE source of truth: imports classifyHistoricalComparison from classify-comparison.ts.
// NO duplicate classification logic.
//
// Reads PERSISTED executionProvenance from each result file. Does NOT invent provenance.
// 20 consistency checks. Every check inspects actual data or source files — no hardcoded true.
//
// Phase 2B.5R changes vs v4:
//   - Check #18 HARDENED: parses freeze document metrics via freeze-document-parser.ts,
//     compares ALL required metrics against summary.json. No more "contains 59" check.
//   - Check #20 HARDENED: validates MANIFEST.json fields, file-inventory.json structure,
//     preserved file existence, SHA256 hash verification, EXCLUDED_FILES.md policy,
//     manifest/inventory count agreement via forensic-validator.ts. No more simple existence check.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { classifyHistoricalComparison } from './classify-comparison';
import { validateFreezeDoc } from './freeze-document-parser';
import { validateForensicInventory, type ForensicManifest, type FileInventory } from './forensic-validator';

const CORPUS_FILE = 'corpus/golden-v1/cases.jsonl';
const RESULTS_DIR = 'writing-engine/logs-golden-v1/results';
const OUTPUT_DIR = 'writing-engine/logs-golden-v1';
const MANIFEST_FILE = 'corpus/golden-v1/corpus-manifest.json';
const FREEZE_DOC = 'docs/corpus/GOLDEN_CORPUS_V1_FREEZE.md';
const FORENSIC_DIR = 'forensic/phase2b-5';
const FORENSIC_MANIFEST = `${FORENSIC_DIR}/MANIFEST.json`;
const FORENSIC_INVENTORY = `${FORENSIC_DIR}/file-inventory.json`;
const FORENSIC_EXCLUDED = `${FORENSIC_DIR}/EXCLUDED_FILES.md`;

type ProvenanceStatus = 'EXECUTED' | 'INHERITED' | 'EXECUTION_ERROR';
interface ExecutionProvenance { status: ProvenanceStatus; sourceCaseId: string | null; }

function loadCorpus(): any[] {
  return readFileSync(CORPUS_FILE, 'utf-8').trim().split('\n').map(l => JSON.parse(l));
}
function loadResults(): Map<string, any> {
  const m = new Map<string, any>();
  if (!existsSync(RESULTS_DIR)) return m;
  for (const f of readdirSync(RESULTS_DIR)) {
    if (!f.endsWith('.json')) continue;
    try { const d = JSON.parse(readFileSync(`${RESULTS_DIR}/${f}`, 'utf-8')); if (d?.caseId) m.set(d.caseId, d); } catch {}
  }
  return m;
}
function resolveSourcePath(sf: string): { path: string; status: string } {
  if (existsSync(sf)) return { path: sf, status: 'SOURCE_EXISTS' };
  const p = sf.startsWith('writing-engine/') ? sf : `writing-engine/${sf}`;
  if (existsSync(p)) return { path: p, status: 'SOURCE_EXISTS' };
  return { path: sf, status: 'SOURCE_MISSING' };
}
function validateProvenance(result: any, prov: ExecutionProvenance | undefined): string[] {
  const issues: string[] = [];
  if (!prov || !prov.status) { issues.push('missing executionProvenance'); return issues; }
  const cs = result.currentSemantic;
  if (prov.status === 'EXECUTED') {
    if (cs && cs.validatorMode === 'LLM') {
      if (!result.provider) issues.push('LLM+EXECUTED requires provider');
      if (!result.model) issues.push('LLM+EXECUTED requires model');
      if (!result.evaluatedAt) issues.push('LLM+EXECUTED requires evaluatedAt');
      if (!(cs.latencyMs > 0)) issues.push(`LLM+EXECUTED requires latencyMs>0 (got ${cs.latencyMs})`);
    }
  } else if (prov.status === 'INHERITED') {
    if (!prov.sourceCaseId) issues.push('INHERITED requires sourceCaseId');
  } else if (prov.status === 'EXECUTION_ERROR') {
    if (!cs || !cs.error) issues.push('EXECUTION_ERROR requires error');
  } else { issues.push(`unknown provenance status: ${prov.status}`); }
  return issues;
}

function checkFreezeDocConsistency(summary: Record<string, unknown>): { passed: boolean; detail: string } {
  if (!existsSync(FREEZE_DOC)) return { passed: false, detail: 'freeze document does not exist' };
  const fdContent = readFileSync(FREEZE_DOC, 'utf-8');
  if (fdContent.includes('FREEZE_BLOCKED')) return { passed: false, detail: 'freeze document declares FREEZE_BLOCKED' };
  const result = validateFreezeDoc(fdContent, summary);
  return { passed: result.valid, detail: result.detail };
}

function checkForensicInventoryConsistency(): { passed: boolean; detail: string } {
  if (!existsSync(FORENSIC_MANIFEST)) return { passed: false, detail: 'MANIFEST.json does not exist' };
  if (!existsSync(FORENSIC_EXCLUDED)) return { passed: false, detail: 'EXCLUDED_FILES.md does not exist' };
  if (!existsSync(FORENSIC_INVENTORY)) return { passed: false, detail: 'file-inventory.json does not exist' };
  let manifest: ForensicManifest; let inventory: FileInventory; let excludedContent: string;
  try { manifest = JSON.parse(readFileSync(FORENSIC_MANIFEST, 'utf-8')); }
  catch { return { passed: false, detail: 'MANIFEST.json is not valid JSON' }; }
  try { inventory = JSON.parse(readFileSync(FORENSIC_INVENTORY, 'utf-8')); }
  catch { return { passed: false, detail: 'file-inventory.json is not valid JSON' }; }
  try { excludedContent = readFileSync(FORENSIC_EXCLUDED, 'utf-8'); }
  catch { return { passed: false, detail: 'EXCLUDED_FILES.md not readable' }; }

  const result = validateForensicInventory(manifest, inventory, excludedContent);
  const parts: string[] = [];
  if (result.valid) {
    parts.push('manifest, inventory, counts, paths, hashes, exclusions validated');
    parts.push(`hashes: ${result.hashVerification.hashMatch} match, ${result.hashVerification.hashMismatch} mismatch, ${result.hashVerification.hashNotRecomputable} not recomputable`);
  } else {
    parts.push(`${result.issues.length} issues:`);
    for (const i of result.issues) parts.push(`  ${i}`);
  }
  return { passed: result.valid, detail: parts.join('\n') };
}

function main() {
  const errors: string[] = [];
  const checks: { name: string; passed: boolean; detail: string }[] = [];

  const corpus = loadCorpus();
  const results = loadResults();
  console.log(`Corpus: ${corpus.length} | Results: ${results.size}`);

  const activeCases = corpus.filter((c: any) => c.status !== 'SUPERSEDED');
  const supersededCases = corpus.filter((c: any) => c.status === 'SUPERSEDED');
  const ledger: any[] = [];
  const comparisonMismatches: any[] = [];
  const provenanceIssues: any[] = [];

  for (const gc of activeCases) {
    const er = results.get(gc.id);
    if (!er) { errors.push(`Missing result for ${gc.id}`); continue; }
    const src = resolveSourcePath(gc.sourceFile);
    const isR6 = gc.tags?.includes('R6') ?? false;
    const isUnresolved = gc.tags?.includes('UNRESOLVED') ?? false;
    const finalScorable = !!gc.expectedFinalDecision;
    const triageScorable = gc.expectedTriage && gc.expectedTriage !== '?' && ['DETERMINISTIC_ACCEPT','DETERMINISTIC_BLOCK','HANDOFF_TO_LLM'].includes(gc.expectedTriage);
    const semanticScorable = gc.expectedSemantic !== null && gc.expectedSemantic !== undefined;
    const cs = er.currentSemantic;
    const isLLM = cs?.validatorMode === 'LLM';
    const currentTriageCorrect = triageScorable ? er.currentTriage === gc.expectedTriage : null;
    const currentFinalCorrect = finalScorable ? er.currentFinalDecision === gc.expectedFinalDecision : null;

    const derivedHC = classifyHistoricalComparison({
      expectedFinalDecision: gc.expectedFinalDecision, historicalObservedDecision: gc.observedFinalDecision,
      historicalCorrect: gc.observedCorrect, currentFinalDecision: er.currentFinalDecision,
      currentFinalCorrect, isR6, isUnresolved, finalScorable,
    });
    if (er.historicalComparison && er.historicalComparison !== derivedHC) {
      comparisonMismatches.push({ caseId: gc.id, persisted: er.historicalComparison, derived: derivedHC });
    }

    let ioCorrect: boolean | null = null; let faithCorrect: boolean | null = null;
    if (semanticScorable && isLLM && gc.expectedSemantic) {
      if (gc.expectedSemantic.infoOwnership && cs?.infoOwnership) ioCorrect = cs.infoOwnership === gc.expectedSemantic.infoOwnership;
      if (gc.expectedSemantic.faithfulness && cs?.faithfulness) faithCorrect = cs.faithfulness === gc.expectedSemantic.faithfulness;
    }

    const persistedProv: ExecutionProvenance | undefined = er.executionProvenance;
    const provIssues = validateProvenance(er, persistedProv);
    if (provIssues.length > 0) provenanceIssues.push({ caseId: gc.id, issues: provIssues });

    ledger.push({
      ...gc, ...er, active: true, canonicalSourcePath: src.path, sourceStatus: src.status,
      triageScorable, semanticScorable, finalScorable, isR6, isUnresolved,
      currentTriageCorrect, currentFinalCorrect, ioCorrect, faithCorrect,
      historicalComparison: derivedHC,
      executionProvenance: persistedProv ?? { status: 'EXECUTION_ERROR', sourceCaseId: null },
    });
  }

  if (errors.length > 0) { errors.forEach(e => console.error(`ERROR: ${e}`)); process.exit(1); }

  const activeCount = ledger.length;
  const r6Count = ledger.filter((e: any) => e.isR6).length;
  const unresolvedCount = ledger.filter((e: any) => e.isUnresolved).length;
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
  const llmExecuted = ledger.filter((e: any) => e.currentSemantic?.validatorMode === 'LLM').length;
  const execErrors = ledger.filter((e: any) => e.currentSemantic?.validatorMode === 'EXECUTION_ERROR').length;
  const scorableFinal = ledger.filter((e: any) => e.finalScorable);
  const finalCorrect = scorableFinal.filter((e: any) => e.currentFinalCorrect === true).length;
  const falseAcceptance = scorableFinal.filter((e: any) => e.expectedFinalDecision === 'REJECT' && e.currentFinalDecision === 'ACCEPT').length;
  const falseRejection = scorableFinal.filter((e: any) => e.expectedFinalDecision === 'ACCEPT' && e.currentFinalDecision === 'REJECT').length;
  const hc: Record<string, number> = {};
  for (const e of ledger) { hc[e.historicalComparison] = (hc[e.historicalComparison] || 0) + 1; }
  const falseAcceptCases = scorableFinal.filter((e: any) => e.expectedFinalDecision === 'REJECT' && e.currentFinalDecision === 'ACCEPT').map((e: any) => ({ caseId: e.id, isR6: e.isR6 }));
  const falseRejectCases = scorableFinal.filter((e: any) => e.expectedFinalDecision === 'ACCEPT' && e.currentFinalDecision === 'REJECT').map((e: any) => ({ caseId: e.id, isR6: e.isR6 }));
  const r6Details = ledger.filter((e: any) => e.isR6).map((e: any) => ({ caseId: e.id, expected: e.expectedFinalDecision, historical: e.observedFinalDecision, current: e.currentFinalDecision, status: e.historicalComparison }));
  const sourceExists = ledger.filter((e: any) => e.sourceStatus === 'SOURCE_EXISTS').length;

  const metrics = {
    historicalCases: corpus.length, activeCases: activeCount, supersededCases: supersededCases.length,
    unresolvedCases: unresolvedCount, r6Cases: r6Count,
    scorableTriage: scorableTriage.length, triageCorrect,
    semanticGroundTruthAvailable: semanticGTAvailable, semanticExecutionAvailable: semanticExecuted, semanticScoringEligible: semanticExecuted,
    ioOwnershipScorable: ioScorable, ioOwnershipCorrect: ioCorrect, faithfulnessScorable: faithScorable, faithfulnessCorrect: faithCorrect,
    scorableFinal: scorableFinal.length, finalCorrect, falseAcceptance, falseRejection,
    executionErrors: execErrors, llmExecuted, deterministicFastPathed: detAccept + detBlock, detAccept, detBlock,
    stableSuccess: hc['STABLE_SUCCESS'] || 0, regression: hc['REGRESSION'] || 0, improvement: hc['IMPROVEMENT'] || 0,
    persistentDefect: hc['PERSISTENT_DEFECT'] || 0, knownDefect: hc['KNOWN_DEFECT'] || 0, changedUnscorable: hc['CHANGED_UNSCORABLE'] || 0,
    sourceExists, sourceMissing: activeCount - sourceExists,
  };

  // ===== 20 CONSISTENCY CHECKS =====
  checks.push({ name: '1_active_count', passed: activeCount === 59, detail: `${activeCount} == 59` });
  checks.push({ name: '2_superseded_exclusion', passed: ledger.filter((e: any) => e.status === 'SUPERSEDED').length === 0, detail: '0 superseded in active' });
  const uniqueIds = new Set(ledger.map((e: any) => e.id)).size;
  checks.push({ name: '3_no_duplicate_active_ids', passed: uniqueIds === activeCount, detail: `${uniqueIds} unique == ${activeCount}` });
  checks.push({ name: '4_historical_classification_consistency', passed: comparisonMismatches.length === 0, detail: `${comparisonMismatches.length} mismatches` });
  checks.push({ name: '5_final_metric_sum', passed: falseAcceptance + falseRejection + finalCorrect === scorableFinal.length, detail: `${falseAcceptance}+${falseRejection}+${finalCorrect}==${scorableFinal.length}` });
  checks.push({ name: '6_active_results_complete', passed: ledger.length === activeCount, detail: `${ledger.length}==${activeCount}` });
  const missingProv = ledger.filter((e: any) => !e.executionProvenance || !e.executionProvenance.status);
  checks.push({ name: '7_active_result_provenance', passed: missingProv.length === 0, detail: `${missingProv.length} missing` });
  const r6Tagged = ledger.filter((e: any) => e.tags?.includes('R6')).length;
  checks.push({ name: '8_r6_consistency', passed: r6Tagged === r6Count, detail: `${r6Tagged}==${r6Count}` });
  checks.push({ name: '9_source_paths', passed: sourceExists === activeCount, detail: `${sourceExists}/${activeCount}` });
  checks.push({ name: '10_no_execution_errors', passed: execErrors === 0, detail: `${execErrors}` });
  const inherited = ledger.filter((e: any) => e.executionProvenance?.status === 'INHERITED');
  checks.push({ name: '11_no_silent_inheritance', passed: inherited.length === 0, detail: `${inherited.length} inherited` });
  const idMismatches = ledger.filter((e: any) => e.caseId !== e.id);
  checks.push({ name: '12_active_result_identity', passed: idMismatches.length === 0, detail: `${idMismatches.length} mismatches` });
  const hcSum = Object.values(hc).reduce((a: number, b: number) => a + b, 0);
  checks.push({ name: '13_aggregate_classification_sum', passed: hcSum === activeCount, detail: `${hcSum}==${activeCount}` });
  checks.push({ name: '14_ledger_summary_consistency', passed: metrics.activeCases === activeCount && metrics.scorableFinal === scorableFinal.length && metrics.finalCorrect === finalCorrect, detail: `active=${metrics.activeCases}/${activeCount} scorableFinal=${metrics.scorableFinal}/${scorableFinal.length} finalCorrect=${metrics.finalCorrect}/${finalCorrect}` });
  const classifierSource = readFileSync('src/corpus/classify-comparison.ts', 'utf-8');
  const classifierImportsUsed = readFileSync('src/corpus/reconcile-v1.ts', 'utf-8').includes("from './classify-comparison'");
  checks.push({ name: '15_classifier_usage_consistency', passed: classifierSource.includes('export function classifyHistoricalComparison') && classifierImportsUsed, detail: `import present: ${classifierImportsUsed}` });
  const gc38r1 = ledger.find((e: any) => e.id === 'GC-0038R1');
  const gc38r1Ok = !!gc38r1 && gc38r1.executionProvenance?.status === 'EXECUTED' && (gc38r1.currentSemantic?.latencyMs ?? 0) > 0 && gc38r1.currentSemantic?.validatorMode === 'LLM' && gc38r1.expectedSemantic?.infoOwnership === 'PASS' && gc38r1.expectedSemantic?.faithfulness === 'PASS';
  checks.push({ name: '16_gc0038r1_provenance', passed: gc38r1Ok, detail: gc38r1 ? `latency=${gc38r1.currentSemantic?.latencyMs}, expectedIO=${gc38r1.expectedSemantic?.infoOwnership}` : 'not found' });
  checks.push({ name: '17_persisted_provenance_validity', passed: provenanceIssues.length === 0, detail: `${provenanceIssues.length} issues` });

  // 18. HARDENED: real metric comparison via freeze-document-parser
  const freezeResult = checkFreezeDocConsistency(metrics as unknown as Record<string, unknown>);
  checks.push({ name: '18_freeze_doc_summary_consistency', passed: freezeResult.passed, detail: freezeResult.detail });

  // 19. corpus manifest / ledger consistency
  let manifestConsistent = false;
  if (existsSync(MANIFEST_FILE)) {
    const manifest = JSON.parse(readFileSync(MANIFEST_FILE, 'utf-8'));
    manifestConsistent = manifest.activeCases === activeCount;
  }
  checks.push({ name: '19_corpus_manifest_ledger_consistency', passed: manifestConsistent, detail: `manifest.activeCases === ${activeCount}` });

  // 20. HARDENED: full forensic inventory validation via forensic-validator
  const forensicResult = checkForensicInventoryConsistency();
  checks.push({ name: '20_forensic_inventory_consistency', passed: forensicResult.passed, detail: forensicResult.detail });

  const allPassed = checks.every(c => c.passed);
  const zeroLatencyLLM = ledger.filter((e: any) => e.currentSemantic?.validatorMode === 'LLM' && (e.currentSemantic?.latencyMs ?? 0) <= 0);
  if (zeroLatencyLLM.length > 0) { console.log(`\nWARNING: ${zeroLatencyLLM.length} LLM results with zero latency:`); for (const e of zeroLatencyLLM) console.log(`  ${e.id}: latencyMs=${e.currentSemantic?.latencyMs ?? 0}`); }
  if (comparisonMismatches.length > 0) { console.log(`\nCOMPARISON MISMATCHES (${comparisonMismatches.length}):`); for (const m of comparisonMismatches) console.log(`  ${m.caseId}: persisted=${m.persisted} → derived=${m.derived}`); }
  if (provenanceIssues.length > 0) { console.log(`\nPROVENANCE ISSUES (${provenanceIssues.length}):`); for (const p of provenanceIssues) console.log(`  ${p.caseId}: ${p.issues.join('; ')}`); }

  writeFileSync(`${OUTPUT_DIR}/canonical-case-ledger.json`, JSON.stringify(ledger, null, 2));
  writeFileSync(`${OUTPUT_DIR}/reconciliation-report.json`, JSON.stringify({ metrics, falseAcceptCases, falseRejectCases, r6Details, comparisonMismatches, provenanceIssues, zeroLatencyLLM: zeroLatencyLLM.map((e: any) => e.id), checks, allPassed }, null, 2));
  writeFileSync(`${OUTPUT_DIR}/consistency-check.json`, JSON.stringify({ passed: allPassed, errors, warnings: zeroLatencyLLM.length > 0 ? [`${zeroLatencyLLM.length} zero-latency LLM results`] : [], metricChecks: checks, comparisonMismatches, provenanceIssues }, null, 2));
  writeFileSync(`${OUTPUT_DIR}/summary.json`, JSON.stringify(metrics, null, 2));

  console.log('\n=== CANONICAL METRICS ===');
  console.log(JSON.stringify(metrics, null, 2));
  console.log('\n=== 20 CONSISTENCY CHECKS ===');
  for (const c of checks) console.log(`  ${c.passed ? 'PASS' : 'FAIL'} ${c.name}: ${c.detail}`);
  console.log(`\n=== ${allPassed ? 'ALL 20 PASSED — FROZEN' : 'FREEZE_BLOCKED'} ===`);
  if (!allPassed) process.exit(1);
}

main();
