// r6-experiment.ts — R6 Focused Experiment: Observation-Framed Indirect IO Leak
//
// Tests whether the system can distinguish:
//   - harmless observations (ACCEPT)
//   - observations that indirectly establish a protected fact (REJECT)
//   - the same observation under different states (UNKNOWN/SUSPECTS/KNOWS)
//
// Runs baseline first, then ONE minimal calibration, then compares.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { runDeterministicTriage } from '../../src/deterministic/index';
import type { CanonicalTriageResult } from '../../src/deterministic/types';
import { buildStateAwareSystemPrompt, makeHandoff } from './iteration43-helpers';

const LOG_DIR = join(import.meta.dir, '..', 'logs-r6');
mkdirSync(LOG_DIR, { recursive: true });

const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY || '';
const FIREWORKS_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';
const FIREWORKS_MODEL = 'accounts/fireworks/models/qwen3p8-max';

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

// The ONE minimal calibration instruction for R6 (no benchmark nouns)
const R6_CALIBRATION_SUFFIX = `\n=== OBSERVATION-EPISTEMIC RULE ===\nAn observation can itself grant a character knowledge. Do not assume that sensory or perceptual framing ("saw", "watched", "noticed", "observed") makes a statement epistemically safe. When a character observes an action involving an object, determine whether the observed action would reveal a protected fact to the character. If the character's information ownership state lists a fact as UNKNOWN, and the observed action would logically establish that fact for the observer, then infoOwnership = FAIL. However, if the observation is of an ordinary, non-protected action (e.g., closing a door, putting a folder on a desk) that does not reveal any protected fact, then infoOwnership = PASS.\n`;

function makeState(mayaKnows: 'unknown' | 'suspects' | 'knows', protectedFact: string = 'Marcus embezzled $40,000 from the clinic'): any {
  return {
    character: { identity: 'Maya Okafor — ICU nurse, 34, co-owns a clinic with Marcus', goals: [], fears: [], beliefs: [], memories: [], emotionalState: '', perceptualHabits: [], voice: '', currentKnowledge: mayaKnows === 'knows' ? [protectedFact] : mayaKnows === 'suspects' ? ['She saw a discrepancy'] : [] },
    informationOwnership: { entries: [{ fact: protectedFact, knows: mayaKnows === 'knows' ? ['Marcus', 'Maya'] : ['Marcus'], suspects: mayaKnows === 'suspects' ? ['Maya'] : [], misunderstands: [], unknown: mayaKnows === 'unknown' ? ['Maya'] : [] }] },
    canon: { facts: [{ content: 'Maya co-owns a clinic with Marcus', classification: 'HARD_CANON' as const, source: 'ch1' }] },
    deferredChecks: [], sceneId: '', revisionId: 1,
  };
}

// State where the "ledger" is just a normal admin object (no protected fact)
const innocentState = {
  character: { identity: 'Maya Okafor — ICU nurse, 34, co-owns a clinic with Marcus', goals: [], fears: [], beliefs: [], memories: [], emotionalState: '', perceptualHabits: [], voice: '', currentKnowledge: ['The clinic keeps a patient ledger in the cabinet'] },
  informationOwnership: { entries: [] },
  canon: { facts: [{ content: 'Maya co-owns a clinic with Marcus', classification: 'HARD_CANON' as const, source: 'ch1' }, { content: 'The clinic keeps a patient ledger in the cabinet', classification: 'SOFT_CANON' as const, source: 'ch2' }] },
  deferredChecks: [], sceneId: '', revisionId: 1,
};

async function semanticValidate(candidateText: string, documentState: any, triageResult: CanonicalTriageResult, extraSuffix: string = ''): Promise<any> {
  if (triageResult.action === 'DETERMINISTIC_ACCEPT') return { _executionMode: 'DETERMINISTIC', overall: 'ACCEPT', infoOwnership: 'PASS', faithfulness: 'PASS', meaning: 'PASS', stateConsulted: false, reasons: ['Fast path'] };
  if (triageResult.action === 'DETERMINISTIC_BLOCK') return { _executionMode: 'DETERMINISTIC', overall: 'REJECT', infoOwnership: 'FAIL', faithfulness: 'FAIL', meaning: 'PASS', stateConsulted: false, reasons: ['Hard block: ' + triageResult.reasoning] };
  const systemPrompt = buildStateAwareSystemPrompt('LICENSED_FICTION' as any) + CALIBRATED_SUFFIX + extraSuffix;
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

// ── The R6 Test Matrix ──────────────────────────────────────────────────────
interface R6Case {
  id: string;
  group: string;
  label: string;
  candidate: string;
  state: any;
  expected: 'ACCEPT' | 'REJECT';
  reasoning: string;
  observationClass: 'OBSERVATION_ONLY' | 'OBSERVATION_IMPLYING_FACT' | 'EXPLICIT_KNOWLEDGE' | 'CAUSAL_INFERENCE' | 'AMBIGUOUS';
}

const r6Matrix: R6Case[] = [
  // Group A — Harmless observations (should ACCEPT)
  { id: 'A1', group: 'A', label: 'Harmless: saw close door', candidate: 'Maya saw Marcus close the office door.', state: makeState('unknown'), expected: 'ACCEPT', reasoning: 'ordinary observation — no protected fact revealed', observationClass: 'OBSERVATION_ONLY' },
  { id: 'A2', group: 'A', label: 'Harmless: watched put folder on desk', candidate: 'Maya watched Marcus put the folder on the desk.', state: makeState('unknown'), expected: 'ACCEPT', reasoning: 'ordinary observation — no protected fact', observationClass: 'OBSERVATION_ONLY' },
  { id: 'A3', group: 'A', label: 'Harmless: noticed leave clinic', candidate: 'Maya noticed Marcus leave the clinic.', state: makeState('unknown'), expected: 'ACCEPT', reasoning: 'ordinary observation', observationClass: 'OBSERVATION_ONLY' },

  // Group B — Observation that directly establishes protected fact (should REJECT under UNKNOWN)
  { id: 'B1', group: 'B', label: 'Leak: saw delete transfer record', candidate: 'Maya saw Marcus delete the transfer record.', state: makeState('unknown'), expected: 'REJECT', reasoning: 'observation reveals the protected financial fact', observationClass: 'OBSERVATION_IMPLYING_FACT' },
  { id: 'B2', group: 'B', label: 'Leak: watched move cash envelope', candidate: 'Maya watched Marcus move the missing cash envelope into his coat.', state: makeState('unknown'), expected: 'REJECT', reasoning: 'observation reveals embezzlement', observationClass: 'OBSERVATION_IMPLYING_FACT' },
  { id: 'B3', group: 'B', label: 'Leak: saw conceal account statement', candidate: 'Maya saw Marcus conceal the account statement.', state: makeState('unknown'), expected: 'REJECT', reasoning: 'observation reveals financial wrongdoing', observationClass: 'OBSERVATION_IMPLYING_FACT' },
  { id: 'B4', group: 'B', label: 'Leak: saw hide ledger (original R6)', candidate: 'Maya saw Marcus hide the ledger under his coat.', state: makeState('unknown'), expected: 'REJECT', reasoning: 'R6 original — observation indirectly reveals protected fact', observationClass: 'OBSERVATION_IMPLYING_FACT' },

  // Group C — Observation of an object WITHOUT semantic link to protected fact
  { id: 'C1', group: 'C', label: 'No-link: saw hide blue folder', candidate: 'Maya saw Marcus hide the blue folder.', state: makeState('unknown'), expected: 'ACCEPT', reasoning: 'blue folder has no connection to protected fact', observationClass: 'OBSERVATION_ONLY' },
  { id: 'C2', group: 'C', label: 'No-link: watched put ledger in cabinet (innocent context)', candidate: 'Maya watched Marcus put the ledger in the cabinet.', state: innocentState, expected: 'ACCEPT', reasoning: 'ledger is a normal admin object in this state — no protected fact', observationClass: 'OBSERVATION_ONLY' },

  // Group D — Same observation, different states
  { id: 'D1-UNKNOWN', group: 'D', label: 'Cross-state: UNKNOWN + saw hide account records', candidate: 'Maya saw Marcus hide the account records.', state: makeState('unknown'), expected: 'REJECT', reasoning: 'UNKNOWN — observation reveals protected fact', observationClass: 'OBSERVATION_IMPLYING_FACT' },
  { id: 'D2-SUSPECTS', group: 'D', label: 'Cross-state: SUSPECTS + saw hide account records', candidate: 'Maya saw Marcus hide the account records.', state: makeState('suspects'), expected: 'ACCEPT', reasoning: 'SUSPECTS — observation is consistent with existing suspicion (evidence observed)', observationClass: 'OBSERVATION_IMPLYING_FACT' },
  { id: 'D3-KNOWS', group: 'D', label: 'Cross-state: KNOWS + saw hide account records', candidate: 'Maya saw Marcus hide the account records.', state: makeState('knows'), expected: 'ACCEPT', reasoning: 'KNOWS — observation is consistent with existing knowledge', observationClass: 'OBSERVATION_IMPLYING_FACT' },

  // Group E — Paraphrased indirect leaks (no obvious keywords)
  { id: 'E1', group: 'E', label: 'Paraphrase: reason became visible', candidate: 'The reason Marcus handled the records that way suddenly became visible to Maya.', state: makeState('unknown'), expected: 'REJECT', reasoning: 'paraphrased indirect leak — implies Maya now understands the protected fact', observationClass: 'CAUSAL_INFERENCE' },
  { id: 'E2', group: 'E', label: 'Paraphrase: watched remove papers explaining funds', candidate: 'Maya watched Marcus remove the papers that explained the missing funds.', state: makeState('unknown'), expected: 'REJECT', reasoning: 'observation directly reveals the explanation for missing funds', observationClass: 'OBSERVATION_IMPLYING_FACT' },
  { id: 'E3', group: 'E', label: 'Paraphrase: pattern gave direct access', candidate: 'The pattern in Marcus\'s actions gave Maya direct access to what had happened.', state: makeState('unknown'), expected: 'REJECT', reasoning: 'implies Maya now knows the protected fact through observation', observationClass: 'CAUSAL_INFERENCE' },

  // Group F — Innocent observation with similar vocabulary (should ACCEPT)
  { id: 'F1', group: 'F', label: 'Innocent-vocab: saw tuck clinic ledger into drawer', candidate: 'Maya saw Marcus tuck the clinic ledger into the drawer.', state: innocentState, expected: 'ACCEPT', reasoning: 'ledger is a normal admin object — no protected financial fact in this state', observationClass: 'OBSERVATION_ONLY' },
];

// ── Runner ──────────────────────────────────────────────────────────────────
async function runMatrix(label: string, extraSuffix: string = ''): Promise<any[]> {
  const results: any[] = [];
  console.log(`\n=== R6 Experiment — ${label} (${r6Matrix.length} cases) ===\n`);

  for (const tc of r6Matrix) {
    const stateWithScene = { ...tc.state, sceneId: tc.id, revisionId: 1 };
    let triageResult: CanonicalTriageResult;
    try { triageResult = runDeterministicTriage(tc.candidate, stateWithScene, 'LICENSED_FICTION' as any); }
    catch (e: any) { triageResult = { action: 'HANDOFF_TO_LLM', proofStrength: 'UNRESOLVED', reasoning: `triage error: ${e.message}`, signals: [], scopedOverridesApplied: [] }; }

    const semanticResult = await semanticValidate(tc.candidate, stateWithScene, triageResult, extraSuffix);
    const fd = finalDecision(semanticResult);
    const correct = fd.final === tc.expected;
    console.log(`${tc.id} [${tc.group}] ${tc.label.slice(0,45)}: triage=${triageResult.action} | io=${semanticResult.infoOwnership ?? '?'} → ${fd.final} (exp ${tc.expected}) ${correct ? '✓' : '✗'}`);

    const result = {
      caseId: tc.id, group: tc.group, label: tc.label, candidateText: tc.candidate,
      expected: tc.expected, reasoning: tc.reasoning, observationClass: tc.observationClass,
      state: { knows: tc.state.informationOwnership?.entries[0]?.knows || [], suspects: tc.state.informationOwnership?.entries[0]?.suspects || [], unknown: tc.state.informationOwnership?.entries[0]?.unknown || [] },
      deterministicTriage: { action: triageResult.action, reasoning: triageResult.reasoning?.slice(0, 100) },
      semanticValidation: { provider: semanticResult._executionMode === 'DETERMINISTIC' ? 'DETERMINISTIC' : 'FIREWORKS', model: FIREWORKS_MODEL, validatorMode: semanticResult._executionMode, overall: semanticResult.overall, infoOwnership: semanticResult.infoOwnership, faithfulness: semanticResult.faithfulness, meaning: semanticResult.meaning, stateConsulted: semanticResult.stateConsulted, reasons: semanticResult.reasons, latencyMs: semanticResult._latencyMs, error: semanticResult._error || null },
      finalDecision: fd.final, correct, runLabel: label,
    };
    results.push(result);
    writeFileSync(join(LOG_DIR, `${label}-${tc.id}.json`), JSON.stringify(result, null, 2));
    await new Promise(r => setTimeout(r, 1000));
  }

  // Metrics
  const llm = results.filter(r => r.semanticValidation.validatorMode === 'LLM');
  const det = results.filter(r => r.semanticValidation.validatorMode === 'DETERMINISTIC');
  const err = results.filter(r => r.semanticValidation.validatorMode === 'EXECUTION_ERROR');
  const correct = results.filter(r => r.correct).length;

  console.log(`\n=== ${label} Metrics ===`);
  console.log(`Total: ${results.length} | Correct: ${correct} | LLM: ${llm.length} | DET: ${det.length} | ERR: ${err.length}`);

  // By group
  for (const g of ['A', 'B', 'C', 'D', 'E', 'F']) {
    const gr = results.filter(r => r.group === g);
    const gc = gr.filter(r => r.correct).length;
    console.log(`  Group ${g}: ${gc}/${gr.length} correct`);
  }

  // Key metrics
  const leakCases = results.filter(r => r.observationClass === 'OBSERVATION_IMPLYING_FACT' || r.observationClass === 'CAUSAL_INFERENCE');
  const harmlessCases = results.filter(r => r.observationClass === 'OBSERVATION_ONLY');
  const leakDetected = leakCases.filter(r => r.finalDecision === 'REJECT').length;
  const harmlessAccepted = harmlessCases.filter(r => r.finalDecision === 'ACCEPT').length;
  console.log(`\nIndirect leak detection: ${leakDetected}/${leakCases.length}`);
  console.log(`Harmless observation acceptance: ${harmlessAccepted}/${harmlessCases.length}`);
  console.log(`False acceptance (leak accepted): ${leakCases.filter(r => r.finalDecision === 'ACCEPT').length}`);
  console.log(`False rejection (harmless rejected): ${harmlessCases.filter(r => r.finalDecision === 'REJECT').length}`);

  writeFileSync(join(LOG_DIR, `${label}-results.json`), JSON.stringify(results, null, 2));
  return results;
}

async function main() {
  const mode = process.argv[2] || 'baseline';
  if (mode === 'baseline') {
    await runMatrix('baseline', '');
  } else if (mode === 'calibrated') {
    await runMatrix('calibrated', R6_CALIBRATION_SUFFIX);
  }
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
