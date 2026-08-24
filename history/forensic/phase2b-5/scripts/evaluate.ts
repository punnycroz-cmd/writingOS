// src/corpus/evaluate.ts — Golden Corpus Evaluation Runner
// Loads the frozen corpus, runs deterministic triage + semantic validation,
// compares against scorable expectations, produces disaggregated metrics.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { runDeterministicTriage } from '../deterministic/index.js';
import type { CanonicalTriageResult } from '../deterministic/types.js';
import { buildStateAwareSystemPrompt, makeHandoff } from '../../writing-engine/src/iteration43-helpers.js';

const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY || '';
const FIREWORKS_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';
const FIREWORKS_MODEL = 'accounts/fireworks/models/qwen3p8-max';

interface GoldenCase {
  id: string;
  sourceExperiment: string;
  sourceCase: string;
  sourceFile: string;
  register: string;
  candidateText: string;
  stateSnapshot: any;
  inventionPolicy: string;
  expectedTriage: string;
  expectedSemantic: any;
  expectedFinalDecision: string;
  observedFinalDecision: string;
  observedCorrect: boolean;
  caseClass: string;
  evidenceStatus: string;
  groundTruthType: string;
  confidence: string;
  provider: string;
  model: string;
  tags: string[];
  notes: string;
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
  const lines = readFileSync('corpus/golden-v1/cases.jsonl', 'utf-8').trim().split('\n');
  return lines.map(l => JSON.parse(l));
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

async function main() {
  const mode = process.argv[2] || 'deterministic';
  const filter = process.argv.slice(3);
  const corpus = loadCorpus();
  const cases = filter.length ? corpus.filter(c => filter.includes(c.id)) : corpus;
  const logDir = 'writing-engine/logs-golden-v1';
  mkdirSync(logDir, { recursive: true });

  console.log(`=== Golden Corpus v1 Evaluation — ${mode} (${cases.length} cases) ===\n`);

  const results: any[] = [];
  for (const gc of cases) {
    const state = buildDocumentState(gc);
    const isR6 = gc.tags.includes('R6');
    const isUnresolved = gc.tags.includes('UNRESOLVED');

    // Step 1: Deterministic triage
    let triageResult: CanonicalTriageResult;
    try { triageResult = runDeterministicTriage(gc.candidateText, state, 'LICENSED_FICTION' as any); }
    catch (e: any) { triageResult = { action: 'HANDOFF_TO_LLM', proofStrength: 'UNRESOLVED', reasoning: `triage error: ${e.message}`, signals: [], scopedOverridesApplied: [] }; }

    // Step 2: Semantic validation (only if mode != 'deterministic')
    let semanticResult: any = null;
    let fd: { final: 'ACCEPT' | 'REJECT'; reason: string } = { final: 'REJECT', reason: 'not evaluated' };
    
    if (mode === 'deterministic') {
      // Only run deterministic — no API
      if (triageResult.action === 'DETERMINISTIC_ACCEPT') { fd = { final: 'ACCEPT', reason: 'DETERMINISTIC_ACCEPT' }; }
      else if (triageResult.action === 'DETERMINISTIC_BLOCK') { fd = { final: 'REJECT', reason: 'DETERMINISTIC_BLOCK' }; }
      else { fd = { final: 'REJECT', reason: 'HANDOFF (not evaluated in deterministic-only mode)' }; }
    } else {
      // Full evaluation
      semanticResult = await semanticValidate(gc.candidateText, state, triageResult);
      fd = finalDecision(semanticResult);
    }

    // Scoring
    const triageScorable = gc.expectedTriage && gc.expectedTriage !== '?' && ['DETERMINISTIC_ACCEPT', 'DETERMINISTIC_BLOCK', 'HANDOFF_TO_LLM'].includes(gc.expectedTriage);
    const semanticScorable = gc.expectedSemantic !== null && gc.expectedSemantic !== undefined;
    const finalScorable = gc.expectedFinalDecision && !isUnresolved;

    const triageCorrect = triageScorable ? triageResult.action === gc.expectedTriage : null;
    const finalCorrect = finalScorable ? fd.final === gc.expectedFinalDecision : null;
    
    // Historical comparison
    const historicalObserved = gc.observedFinalDecision;
    const goldenExpected = gc.expectedFinalDecision;
    const currentObserved = fd.final;
    
    let historicalComparison = 'CHANGED_UNSCORABLE';
    if (finalScorable) {
      if (gc.observedCorrect && finalCorrect) historicalComparison = 'STABLE_SUCCESS';
      else if (gc.observedCorrect && !finalCorrect) historicalComparison = 'REGRESSION';
      else if (!gc.observedCorrect && finalCorrect) historicalComparison = 'IMPROVEMENT';
      else if (!gc.observedCorrect && !finalCorrect) historicalComparison = 'PERSISTENT_DEFECT';
    }

    const result = {
      caseId: gc.id,
      sourceExperiment: gc.sourceExperiment,
      candidateText: gc.candidateText,
      expectedTriage: gc.expectedTriage,
      expectedSemantic: gc.expectedSemantic,
      expectedFinalDecision: gc.expectedFinalDecision,
      historicalObserved: historicalObserved,
      historicalCorrect: gc.observedCorrect,
      currentTriage: triageResult.action,
      currentTriageCorrect: triageCorrect,
      currentSemantic: semanticResult ? {
        overall: semanticResult.overall,
        infoOwnership: semanticResult.infoOwnership,
        faithfulness: semanticResult.faithfulness,
        stateConsulted: semanticResult.stateConsulted,
        validatorMode: semanticResult._executionMode,
      } : null,
      currentFinalDecision: currentObserved,
      currentFinalCorrect: finalCorrect,
      isR6: isR6,
      isUnresolved: isUnresolved,
      groundTruthType: gc.groundTruthType,
      triageScorable: triageScorable,
      semanticScorable: semanticScorable,
      finalScorable: finalScorable,
      historicalComparison: historicalComparison,
      provider: 'FIREWORKS',
      model: FIREWORKS_MODEL,
    };
    results.push(result);
    
    const status = isR6 ? '[R6]' : isUnresolved ? '[UNRESOLVED]' : '';
    const triageStr = triageScorable ? `${triageResult.action === gc.expectedTriage ? '✓' : '✗'}` : '—';
    const finalStr = finalScorable ? `${fd.final === gc.expectedFinalDecision ? '✓' : '✗'}` : '—';
    console.log(`${gc.id} ${status} triage=${triageResult.action} ${triageStr} | final=${fd.final} ${finalStr} | ${historicalComparison}`);
    
    if (mode !== 'deterministic') await new Promise(r => setTimeout(r, 1000));
  }

  // Metrics
  const scorableTriage = results.filter(r => r.triageScorable);
  const scorableFinal = results.filter(r => r.finalScorable);
  const r6Cases = results.filter(r => r.isR6);
  const llmCases = results.filter(r => r.currentSemantic?.validatorMode === 'LLM');
  const execErrors = results.filter(r => r.currentSemantic?.validatorMode === 'EXECUTION_ERROR');

  console.log(`\n=== Metrics ===`);
  console.log(`Total: ${results.length}`);
  console.log(`Scorable triage: ${scorableTriage.length} | correct: ${scorableTriage.filter(r => r.currentTriageCorrect).length}`);
  console.log(`Scorable final: ${scorableFinal.length} | correct: ${scorableFinal.filter(r => r.currentFinalCorrect).length}`);
  console.log(`R6/Unresolved: ${r6Cases.length}`);
  console.log(`LLM executed: ${llmCases.length} | Execution errors: ${execErrors.length}`);
  
  console.log(`\nHistorical comparison:`);
  for (const hc of ['STABLE_SUCCESS', 'REGRESSION', 'IMPROVEMENT', 'PERSISTENT_DEFECT', 'CHANGED_UNSCORABLE']) {
    const n = results.filter(r => r.historicalComparison === hc).length;
    if (n) console.log(`  ${hc}: ${n}`);
  }

  console.log(`\nR6 status:`);
  for (const r of r6Cases) {
    console.log(`  ${r.caseId}: expected=${r.expectedFinalDecision}, historical=${r.historicalObserved}, current=${r.currentFinalDecision}, status=${r.historicalComparison}`);
  }

  const summary = {
    totalCases: results.length,
    scorableTriage: scorableTriage.length,
    triageCorrect: scorableTriage.filter(r => r.currentTriageCorrect).length,
    scorableFinal: scorableFinal.length,
    finalCorrect: scorableFinal.filter(r => r.currentFinalCorrect).length,
    r6Cases: r6Cases.length,
    llmExecuted: llmCases.length,
    executionErrors: execErrors.length,
    historicalComparisons: {
      STABLE_SUCCESS: results.filter(r => r.historicalComparison === 'STABLE_SUCCESS').length,
      REGRESSION: results.filter(r => r.historicalComparison === 'REGRESSION').length,
      IMPROVEMENT: results.filter(r => r.historicalComparison === 'IMPROVEMENT').length,
      PERSISTENT_DEFECT: results.filter(r => r.historicalComparison === 'PERSISTENT_DEFECT').length,
      CHANGED_UNSCORABLE: results.filter(r => r.historicalComparison === 'CHANGED_UNSCORABLE').length,
    },
    provider: 'FIREWORKS',
    model: FIREWORKS_MODEL,
    mode: mode,
  };

  writeFileSync(join(logDir, `${mode}-results.json`), JSON.stringify(results, null, 2));
  writeFileSync(join(logDir, `${mode}-summary.json`), JSON.stringify(summary, null, 2));
  console.log(`\nResults saved to ${logDir}/${mode}-results.json`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
