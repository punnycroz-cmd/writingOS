// src/corpus/evaluate-v2.ts — Golden Corpus Evaluation Runner v2
// Fixed: per-case persistence (no overwrite), resume support, retry history.
// Supports: --resume, --case-id=GC-XXXX, --mode deterministic|full

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { runDeterministicTriage } from '../deterministic/index';
import type { CanonicalTriageResult } from '../deterministic/types';
import { buildStateAwareSystemPrompt, makeHandoff } from '../../writing-engine/src/iteration43-helpers';

const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY || '';
const FIREWORKS_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';
const FIREWORKS_MODEL = 'accounts/fireworks/models/qwen3p8-max';
const LOG_DIR = 'writing-engine/logs-golden-v1';
const RESULTS_DIR = join(LOG_DIR, 'results');
mkdirSync(RESULTS_DIR, { recursive: true });

interface GoldenCase {
  id: string; sourceExperiment: string; sourceCase: string; sourceFile: string;
  register: string; candidateText: string; stateSnapshot: any; inventionPolicy: string;
  expectedTriage: string; expectedSemantic: any; expectedFinalDecision: string;
  observedFinalDecision: string; observedCorrect: boolean; caseClass: string;
  evidenceStatus: string; groundTruthType: string; confidence: string;
  provider: string; model: string; tags: string[]; notes: string;
}

async function fireworksLLM(system: string, user: string): Promise<{ content: string; mode: 'LLM' | 'EXECUTION_ERROR'; error?: string; latencyMs?: number }> {
  const startTime = Date.now();
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      const response = await fetch(FIREWORKS_URL, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${FIREWORKS_API_KEY}` },
        body: JSON.stringify({ model: FIREWORKS_MODEL, max_tokens: 6000, top_k: 40, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
      });
      if (!response.ok) {
        const errorBody = await response.text();
        if ((response.status === 429 || response.status >= 500) && attempt < 3) { await new Promise(r => setTimeout(r, 10000 * Math.pow(2, attempt))); continue; }
        return { content: '', mode: 'EXECUTION_ERROR', error: `HTTP ${response.status}: ${errorBody.slice(0, 200)}`, latencyMs: Date.now() - startTime };
      }
      const data: any = await response.json();
      const content = data.choices?.[0]?.message?.content ?? '';
      if (!content) return { content: '', mode: 'EXECUTION_ERROR', error: 'Empty response', latencyMs: Date.now() - startTime };
      return { content, mode: 'LLM', latencyMs: Date.now() - startTime };
    } catch (e: any) {
      if (attempt < 3) { await new Promise(r => setTimeout(r, 10000 * Math.pow(2, attempt))); continue; }
      return { content: '', mode: 'EXECUTION_ERROR', error: String(e?.message || e), latencyMs: Date.now() - startTime };
    }
  }
  return { content: '', mode: 'EXECUTION_ERROR', error: 'max retries', latencyMs: Date.now() - startTime };
}

function extractJSON(text: string): any {
  try { return JSON.parse(text); } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  const first = text.indexOf('{'), last = text.lastIndexOf('}');
  if (first >= 0 && last > first) { try { return JSON.parse(text.slice(first, last + 1)); } catch {} }
  if (first >= 0) { let p = text.slice(first); const o = (p.match(/{/g) || []).length, c = (p.match(/}/g) || []).length; if (o > c) { p += '}'.repeat(o - c); try { return JSON.parse(p); } catch {} } }
  throw new Error('JSON: ' + text.slice(0, 200));
}

const CALIBRATED_SUFFIX = `\n=== EPISTEMIC CALIBRATION RULES ===\nA: Vague uncertainty is not a leak.\nB: "Some" is a vague quantifier.\nC: Domain-level suspicion is specific.\nD: WONDERED vs SUSPECTED vs KNEW are distinct.\nE: State-supported numbers are protected.\n\n=== BENCHMARK FRAMING ===\nEpistemic authorization test. No original text. Set meaning = PASS.\nReturn ONLY valid JSON. Be concise.`;

async function semanticValidate(candidateText: string, documentState: any, triageResult: CanonicalTriageResult): Promise<any> {
  if (triageResult.action === 'DETERMINISTIC_ACCEPT') return { _executionMode: 'DETERMINISTIC', overall: 'ACCEPT', infoOwnership: 'PASS', faithfulness: 'PASS', meaning: 'PASS', stateConsulted: false, reasons: ['Fast path'] };
  if (triageResult.action === 'DETERMINISTIC_BLOCK') return { _executionMode: 'DETERMINISTIC', overall: 'REJECT', infoOwnership: 'FAIL', faithfulness: 'FAIL', meaning: 'PASS', stateConsulted: false, reasons: ['Hard block: ' + triageResult.reasoning] };
  const systemPrompt = buildStateAwareSystemPrompt('LICENSED_FICTION' as any) + CALIBRATED_SUFFIX;
  const handoff = triageResult.handoffPayload || makeHandoff(candidateText, documentState, 'LICENSED_FICTION' as any);
  const userPrompt = `CANDIDATE TEXT:\n"""\n${candidateText}\n"""\n\nDOCUMENT STATE:\n${JSON.stringify(documentState, null, 2)}\n\nINVENTION POLICY: LICENSED_FICTION\n\nDETERMINISTIC TRIAGE: ${triageResult.action}\n\nValidate. Return JSON:\n{"meaning":"PASS","character":"PASS"|"FAIL"|"UNCLEAR","infoOwnership":"PASS"|"FAIL"|"UNCLEAR","canon":"PASS"|"FAIL"|"UNCLEAR","voice":"PASS"|"FAIL"|"UNCLEAR","register":"PASS"|"FAIL"|"UNCLEAR","intelligibility":"PASS"|"FAIL"|"UNCLEAR","deferred":"PASS"|"FAIL"|"UNCLEAR","faithfulness":"PASS"|"FAIL"|"UNCLEAR","overall":"ACCEPT"|"REJECT","reasons":["brief"],"epistemicLevelAssessed":"...","stateConsulted":true}`;
  const { content, mode, error, latencyMs } = await fireworksLLM(systemPrompt, userPrompt);
  if (mode === 'EXECUTION_ERROR') return { _executionMode: 'EXECUTION_ERROR', _error: error, _latencyMs: latencyMs, overall: 'EXECUTION_ERROR' };
  try { return { ...extractJSON(content), _executionMode: 'LLM', _latencyMs: latencyMs }; }
  catch (e: any) { return { _executionMode: 'EXECUTION_ERROR', _error: 'JSON: ' + e.message, _latencyMs: latencyMs, overall: 'EXECUTION_ERROR' }; }
}

function finalDecision(lj: any): { final: 'ACCEPT' | 'REJECT'; reason: string } {
  if (lj._executionMode === 'EXECUTION_ERROR') return { final: 'REJECT', reason: 'EXECUTION_ERROR' };
  if (lj._executionMode === 'DETERMINISTIC') return { final: lj.overall === 'ACCEPT' ? 'ACCEPT' : 'REJECT', reason: lj.overall === 'ACCEPT' ? 'DETERMINISTIC_ACCEPT' : 'DETERMINISTIC_BLOCK' };
  if (lj.overall === 'REJECT') return { final: 'REJECT', reason: '[LJ] REJECT' };
  if (lj.faithfulness === 'UNCLEAR' || lj.infoOwnership === 'UNCLEAR') return { final: 'REJECT', reason: `Conservative: UNCLEAR` };
  return { final: 'ACCEPT', reason: '[LJ] ACCEPT' };
}

function loadCorpus(): GoldenCase[] {
  return readFileSync('corpus/golden-v1/cases.jsonl', 'utf-8').trim().split('\n').map(l => JSON.parse(l));
}

function buildDocumentState(gc: GoldenCase): any {
  const ss = gc.stateSnapshot || {};
  return {
    character: { identity: 'Maya Okafor — ICU nurse, 34, co-owns a clinic with Marcus', goals: [], fears: [], beliefs: [], memories: [], emotionalState: '', perceptualHabits: [], voice: '', currentKnowledge: [] },
    informationOwnership: { entries: [{ fact: 'Marcus embezzled $40,000 from the clinic', knows: ss.knows || [], suspects: ss.suspects || [], misunderstands: [], unknown: ss.unknown || [] }] },
    canon: { facts: [{ content: 'Maya co-owns a clinic with Marcus', classification: 'HARD_CANON' as const, source: 'ch1' }] },
    deferredChecks: [], sceneId: gc.id, revisionId: 1,
  };
}

function persistResult(caseId: string, result: any): void {
  writeFileSync(join(RESULTS_DIR, `${caseId}.json`), JSON.stringify(result, null, 2));
}

function loadPersistedResult(caseId: string): any | null {
  const fp = join(RESULTS_DIR, `${caseId}.json`);
  if (!existsSync(fp)) return null;
  try { return JSON.parse(readFileSync(fp, 'utf-8')); } catch { return null; }
}

function loadAllPersistedResults(): any[] {
  if (!existsSync(RESULTS_DIR)) return [];
  return readdirSync(RESULTS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => { try { return JSON.parse(readFileSync(join(RESULTS_DIR, f), 'utf-8')); } catch { return null; } })
    .filter(r => r !== null);
}

async function evaluateCase(gc: GoldenCase, mode: string): Promise<any> {
  const state = buildDocumentState(gc);
  const isR6 = gc.tags.includes('R6');
  const isUnresolved = gc.tags.includes('UNRESOLVED');

  let triageResult: CanonicalTriageResult;
  try { triageResult = runDeterministicTriage(gc.candidateText, state, 'LICENSED_FICTION' as any); }
  catch (e: any) { triageResult = { action: 'HANDOFF_TO_LLM', proofStrength: 'UNRESOLVED', reasoning: `triage error: ${e.message}`, signals: [], scopedOverridesApplied: [] }; }

  let semanticResult: any = null;
  let fd: { final: 'ACCEPT' | 'REJECT'; reason: string } = { final: 'REJECT', reason: 'not evaluated' };

  if (mode === 'deterministic') {
    if (triageResult.action === 'DETERMINISTIC_ACCEPT') { fd = { final: 'ACCEPT', reason: 'DETERMINISTIC_ACCEPT' }; }
    else if (triageResult.action === 'DETERMINISTIC_BLOCK') { fd = { final: 'REJECT', reason: 'DETERMINISTIC_BLOCK' }; }
    else { fd = { final: 'REJECT', reason: 'HANDOFF (not evaluated in deterministic-only mode)' }; }
  } else {
    semanticResult = await semanticValidate(gc.candidateText, state, triageResult);
    fd = finalDecision(semanticResult);
  }

  const triageScorable = gc.expectedTriage && gc.expectedTriage !== '?' && ['DETERMINISTIC_ACCEPT', 'DETERMINISTIC_BLOCK', 'HANDOFF_TO_LLM'].includes(gc.expectedTriage);
  const semanticScorable = gc.expectedSemantic !== null && gc.expectedSemantic !== undefined;
  const finalScorable = gc.expectedFinalDecision && !isUnresolved;

  const triageCorrect = triageScorable ? triageResult.action === gc.expectedTriage : null;
  const finalCorrect = finalScorable ? fd.final === gc.expectedFinalDecision : null;

  let historicalComparison = 'CHANGED_UNSCORABLE';
  if (isR6 || isUnresolved) { historicalComparison = 'KNOWN_DEFECT'; }
  else if (finalScorable) {
    if (gc.observedCorrect && finalCorrect) historicalComparison = 'STABLE_SUCCESS';
    else if (gc.observedCorrect && !finalCorrect) historicalComparison = 'REGRESSION';
    else if (!gc.observedCorrect && finalCorrect) historicalComparison = 'IMPROVEMENT';
    else if (!gc.observedCorrect && !finalCorrect) historicalComparison = 'PERSISTENT_DEFECT';
  }

  let ioCorrect = null, faithCorrect = null;
  if (semanticScorable && semanticResult && semanticResult._executionMode === 'LLM') {
    if (gc.expectedSemantic?.infoOwnership) ioCorrect = semanticResult.infoOwnership === gc.expectedSemantic.infoOwnership;
    if (gc.expectedSemantic?.faithfulness) faithCorrect = semanticResult.faithfulness === gc.expectedSemantic.faithfulness;
  }

  return {
    caseId: gc.id, sourceExperiment: gc.sourceExperiment, candidateText: gc.candidateText,
    expectedTriage: gc.expectedTriage, expectedSemantic: gc.expectedSemantic, expectedFinalDecision: gc.expectedFinalDecision,
    historicalObserved: gc.observedFinalDecision, historicalCorrect: gc.observedCorrect,
    currentTriage: triageResult.action, currentTriageCorrect: triageCorrect,
    currentSemantic: semanticResult ? {
      overall: semanticResult.overall, infoOwnership: semanticResult.infoOwnership, faithfulness: semanticResult.faithfulness,
      canon: semanticResult.canon, meaning: semanticResult.meaning, stateConsulted: semanticResult.stateConsulted,
      validatorMode: semanticResult._executionMode, latencyMs: semanticResult._latencyMs, error: semanticResult._error || null,
    } : null,
    currentFinalDecision: fd.final, currentFinalCorrect: finalCorrect, ioCorrect, faithCorrect,
    isR6, isUnresolved, groundTruthType: gc.groundTruthType,
    triageScorable, semanticScorable, finalScorable, historicalComparison,
    provider: 'FIREWORKS', model: FIREWORKS_MODEL, evaluatedAt: new Date().toISOString(),
  };
}

function aggregate(results: any[]): any {
  const total = results.length;
  const scorableTriage = results.filter(r => r.triageScorable);
  const scorableSemantic = results.filter(r => r.semanticScorable && r.currentSemantic?.validatorMode === 'LLM');
  const scorableFinal = results.filter(r => r.finalScorable);
  const r6Cases = results.filter(r => r.isR6);
  const llmCases = results.filter(r => r.currentSemantic?.validatorMode === 'LLM');
  const execErrors = results.filter(r => r.currentSemantic?.validatorMode === 'EXECUTION_ERROR');
  const detCases = results.filter(r => r.currentSemantic?.validatorMode === 'DETERMINISTIC');

  const triageCorrect = scorableTriage.filter(r => r.currentTriageCorrect).length;
  const finalCorrect = scorableFinal.filter(r => r.currentFinalCorrect).length;
  const ioCorrect = scorableSemantic.filter(r => r.ioCorrect === true).length;
  const faithCorrect = scorableSemantic.filter(r => r.faithCorrect === true).length;
  const falseAccept = scorableFinal.filter(r => r.expectedFinalDecision === 'REJECT' && r.currentFinalDecision === 'ACCEPT').length;
  const falseReject = scorableFinal.filter(r => r.expectedFinalDecision === 'ACCEPT' && r.currentFinalDecision === 'REJECT').length;
  const hc: Record<string, number> = {};
  for (const r of results) { hc[r.historicalComparison] = (hc[r.historicalComparison] || 0) + 1; }
  const latencies = llmCases.map(r => r.currentSemantic?.latencyMs).filter(l => l) as number[];

  return {
    totalCases: total, completedCases: results.length, executionErrors: execErrors.length,
    llmExecuted: llmCases.length, deterministicFastPathed: detCases.length,
    scorable: { triage: scorableTriage.length, semantic: scorableSemantic.length, final: scorableFinal.length },
    correct: { triage: triageCorrect, final: finalCorrect, ioCorrect, faithCorrect },
    falseAcceptance: falseAccept, falseRejection: falseReject,
    historicalComparisons: hc,
    r6Cases: r6Cases.length,
    r6Details: r6Cases.map(r => ({ caseId: r.caseId, expected: r.expectedFinalDecision, historical: r.historicalObserved, current: r.currentFinalDecision, status: r.historicalComparison })),
    averageLatencyMs: latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0,
    provider: 'FIREWORKS', model: FIREWORKS_MODEL,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args.find(a => !a.startsWith('--')) || 'deterministic';
  const resume = args.includes('--resume');
  const caseIdFilter = args.find(a => a.startsWith('--case-id='))?.split('=')[1];
  const corpus = loadCorpus();
  const cases = caseIdFilter ? corpus.filter(c => c.id === caseIdFilter) : corpus;

  console.log(`=== Golden Corpus v1 Evaluation v2 — ${mode} (${cases.length} cases${resume ? ', resume' : ''}) ===\n`);

  for (const gc of cases) {
    if (resume) {
      const existing = loadPersistedResult(gc.id);
      // Only skip if we're in full mode AND the case already has an LLM or DETERMINISTIC result
      // (not a deterministic-mode placeholder that needs semantic re-evaluation)
      if (existing && mode === 'full') {
        // In full mode, skip if: (a) triage was ACCEPT/BLOCK (deterministic fast-path, no LLM needed)
        // or (b) already has an LLM result
        if (existing.currentTriage === 'DETERMINISTIC_ACCEPT' || existing.currentTriage === 'DETERMINISTIC_BLOCK') {
          console.log(`${gc.id}: SKIP (deterministic fast-path)`);
          continue;
        }
        if (existing.currentSemantic?.validatorMode === 'LLM') {
          console.log(`${gc.id}: SKIP (already LLM-evaluated)`);
          continue;
        }
        // Otherwise (HANDOFF with no LLM result yet) → re-evaluate
      } else if (existing && mode === 'deterministic') {
        console.log(`${gc.id}: SKIP (already evaluated)`);
        continue;
      }
    }
    const result = await evaluateCase(gc, mode);
    persistResult(gc.id, result);
    const isR6 = result.isR6 ? '[R6]' : '';
    const triageStr = result.triageScorable ? `${result.currentTriageCorrect ? '✓' : '✗'}` : '—';
    const finalStr = result.finalScorable ? `${result.currentFinalCorrect ? '✓' : '✗'}` : '—';
    console.log(`${gc.id} ${isR6} triage=${result.currentTriage} ${triageStr} | final=${result.currentFinalDecision} ${finalStr} | ${result.historicalComparison}`);
    if (mode === 'full') await new Promise(r => setTimeout(r, 1000));
  }

  const allResults = loadAllPersistedResults();
  const summary = aggregate(allResults);
  writeFileSync(join(LOG_DIR, 'summary.json'), JSON.stringify(summary, null, 2));

  console.log(`\n=== Complete Summary (from ${allResults.length} persisted results) ===`);
  console.log(`Total: ${summary.totalCases} | Errors: ${summary.executionErrors}`);
  console.log(`Scorable triage: ${summary.scorable.triage} | correct: ${summary.correct.triage}`);
  console.log(`Scorable final: ${summary.scorable.final} | correct: ${summary.correct.final}`);
  console.log(`Scorable semantic: ${summary.scorable.semantic} | io: ${summary.correct.ioCorrect} | faith: ${summary.correct.faithCorrect}`);
  console.log(`False accept: ${summary.falseAcceptance} | False reject: ${summary.falseRejection}`);
  console.log(`R6: ${summary.r6Cases}`);
  for (const r of summary.r6Details) console.log(`  ${r.caseId}: exp=${r.expected}, hist=${r.historical}, cur=${r.current}, ${r.status}`);
  console.log(`Historical: ${JSON.stringify(summary.historicalComparisons)}`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
