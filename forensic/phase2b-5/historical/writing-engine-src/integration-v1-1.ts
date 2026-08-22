// integration-v1-1.ts — Writing OS v1.1: Adversarial Multi-Scene State Integrity Experiment
//
// Tests state integrity under adversarial conditions:
//   Attack 1: Temporal knowledge regression (future state leaking backward)
//   Attack 2: State rollback (KNOWS→UNKNOWN without legitimate event)
//   Attack 3: Cross-character knowledge leak (Marcus knows ≠ Maya knows)
//   Attack 4: Indirect IO leak (R6 — "saw Marcus hide the ledger")
//   Attack 5: Semantic paraphrase leak ("the truth clicked into place")
//   Attack 6: Repair-induced knowledge leak
//   Attack 7: Repair-induced numeric fabrication
//   Attack 8: State snapshot isolation (S1 candidate against S3 state)
//   Attack 9: Deferred knowledge (future interpretation not yet known)
//   Attack 10: Conflicting state (IO says UNKNOWN, CharacterState says KNOWS)

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { runDeterministicTriage } from '../../src/deterministic/index.js';
import type { CanonicalTriageResult } from '../../src/deterministic/types.js';
import { buildStateAwareSystemPrompt, makeHandoff } from './iteration43-helpers.js';

const LOG_DIR = join(import.meta.dir, '..', 'logs-integration-v1-1');
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

async function semanticValidate(candidateText: string, documentState: any, inventionPolicy: string, triageResult: CanonicalTriageResult): Promise<any> {
  if (triageResult.action === 'DETERMINISTIC_ACCEPT') return { _executionMode: 'DETERMINISTIC', overall: 'ACCEPT', infoOwnership: 'PASS', faithfulness: 'PASS', meaning: 'PASS', stateConsulted: false, reasons: ['Fast path'] };
  if (triageResult.action === 'DETERMINISTIC_BLOCK') return { _executionMode: 'DETERMINISTIC', overall: 'REJECT', infoOwnership: 'FAIL', faithfulness: 'FAIL', meaning: 'PASS', stateConsulted: false, reasons: ['Hard block: ' + triageResult.reasoning] };
  const systemPrompt = buildStateAwareSystemPrompt(inventionPolicy as any) + CALIBRATED_SUFFIX;
  const handoff = triageResult.handoffPayload || makeHandoff(candidateText, documentState, inventionPolicy as any);
  const userPrompt = `CANDIDATE TEXT:\n"""\n${candidateText}\n"""\n\nDOCUMENT STATE:\n${JSON.stringify(documentState, null, 2)}\n\nINVENTION POLICY: ${inventionPolicy}\n\nDETERMINISTIC TRIAGE: ${triageResult.action}\n\nValidate. Return JSON:\n{"meaning":"PASS","character":"PASS"|"FAIL"|"UNCLEAR","infoOwnership":"PASS"|"FAIL"|"UNCLEAR","canon":"PASS"|"FAIL"|"UNCLEAR","voice":"PASS"|"FAIL"|"UNCLEAR","register":"PASS"|"FAIL"|"UNCLEAR","intelligibility":"PASS"|"FAIL"|"UNCLEAR","deferred":"PASS"|"FAIL"|"UNCLEAR","faithfulness":"PASS"|"FAIL"|"UNCLEAR","overall":"ACCEPT"|"REJECT","reasons":["brief"],"epistemicLevelAssessed":"...","stateConsulted":true}`;
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

async function generateRepair(candidateText: string, documentState: any, violations: string[]): Promise<{ repairedText: string; mode: 'LLM' | 'EXECUTION_ERROR'; error?: string }> {
  const systemPrompt = `You are a fiction reviser. Fix violations while preserving meaning. Do NOT invent facts. Do NOT introduce unauthorized knowledge. Do NOT add specific numbers unless in state. Return ONLY the repaired text.`;
  const userPrompt = `CANDIDATE:\n"""\n${candidateText}\n"""\n\nSTATE:\n${JSON.stringify(documentState, null, 2)}\n\nVIOLATIONS:\n${violations.join('\n')}\n\nRepair. Return only text.`;
  const { content, mode, error } = await fireworksLLM(systemPrompt, userPrompt);
  if (mode === 'EXECUTION_ERROR') return { repairedText: candidateText, mode: 'EXECUTION_ERROR', error };
  return { repairedText: content.trim(), mode: 'LLM' };
}

// ── State factory ───────────────────────────────────────────────────────────
function makeState(mayaKnows: 'unknown' | 'suspects' | 'knows', withAmount: boolean = false, marcusKnows: boolean = true): any {
  const fact = withAmount ? 'Marcus embezzled $40,000 from the clinic' : 'Marcus took money from the clinic';
  return {
    character: { identity: 'Maya Okafor — ICU nurse, 34, co-owns a clinic with Marcus', goals: [], fears: [], beliefs: [], memories: [], emotionalState: '', perceptualHabits: [], voice: '', currentKnowledge: mayaKnows === 'knows' ? [fact] : mayaKnows === 'suspects' ? ['She saw a discrepancy'] : [] },
    informationOwnership: { entries: [{ fact, knows: mayaKnows === 'knows' ? ['Marcus', 'Maya'] : marcusKnows ? ['Marcus'] : [], suspects: mayaKnows === 'suspects' ? ['Maya'] : [], misunderstands: [], unknown: mayaKnows === 'unknown' ? ['Maya'] : [] }] },
    canon: { facts: [{ content: 'Maya co-owns a clinic with Marcus', classification: 'HARD_CANON' as const, source: 'ch1' }] },
    deferredChecks: [], sceneId: '', revisionId: 1,
  };
}

// ── State snapshots for isolation testing ───────────────────────────────────
const snapshots: Record<string, any> = {
  'SNAP-S1-UNKNOWN': makeState('unknown'),
  'SNAP-S2-SUSPECTS': makeState('suspects'),
  'SNAP-S3-KNOWS': makeState('knows'),
  'SNAP-S3-KNOWS-AMOUNT': makeState('knows', true),
  'SNAP-S4-MAYA-UNKNOWN-MARCUS-KNOWS': makeState('unknown', false, true),
  'SNAP-CONFLICT': {
    ...makeState('unknown'),
    character: { ...makeState('unknown').character, currentKnowledge: ['Marcus embezzled $40,000 from the clinic'] },
  },
};

// ── The adversarial test matrix ─────────────────────────────────────────────
interface AdversarialCase {
  id: string;
  attack: string;
  sceneId: string;
  snapshotId: string;
  candidate: string;
  expected: 'ACCEPT' | 'REJECT';
  reasoning: string;
  isRepair?: boolean;
  isTemporal?: boolean; // testing historical state against current
}

const testMatrix: AdversarialCase[] = [
  // Attack 1: Temporal knowledge regression
  { id: 'A1-S1', attack: 'TEMPORAL_REGRESSION', sceneId: 'S1', snapshotId: 'SNAP-S1-UNKNOWN', candidate: 'Maya knew Marcus had stolen the money.', expected: 'REJECT', reasoning: 'UNKNOWN + knew → leak', isTemporal: true },
  { id: 'A1-S2', attack: 'TEMPORAL_REGRESSION', sceneId: 'S2', snapshotId: 'SNAP-S2-SUSPECTS', candidate: 'Maya knew Marcus had stolen the money.', expected: 'REJECT', reasoning: 'SUSPECTS + knew → overreach', isTemporal: true },
  { id: 'A1-S2b', attack: 'TEMPORAL_REGRESSION', sceneId: 'S2', snapshotId: 'SNAP-S2-SUSPECTS', candidate: 'Maya suspected Marcus had taken some money.', expected: 'ACCEPT', reasoning: 'SUSPECTS + suspected → matches state', isTemporal: true },
  { id: 'A1-S3', attack: 'TEMPORAL_REGRESSION', sceneId: 'S3', snapshotId: 'SNAP-S3-KNOWS', candidate: 'Maya knew Marcus had stolen the money.', expected: 'ACCEPT', reasoning: 'KNOWS + knew → matches state', isTemporal: true },

  // Attack 3: Cross-character knowledge leak
  { id: 'A3-1', attack: 'CROSS_CHARACTER', sceneId: 'S3', snapshotId: 'SNAP-S4-MAYA-UNKNOWN-MARCUS-KNOWS', candidate: 'Maya knew what Marcus had learned.', expected: 'REJECT', reasoning: 'Marcus knows but Maya does NOT — cross-character leak' },
  { id: 'A3-2', attack: 'CROSS_CHARACTER', sceneId: 'S3', snapshotId: 'SNAP-S4-MAYA-UNKNOWN-MARCUS-KNOWS', candidate: 'Marcus knew what he had learned.', expected: 'ACCEPT', reasoning: 'Marcus knows — correct owner' },

  // Attack 4: Indirect IO leak (R6)
  { id: 'A4-1', attack: 'INDIRECT_IO_LEAK', sceneId: 'S1', snapshotId: 'SNAP-S1-UNKNOWN', candidate: 'Maya saw Marcus hide the ledger under his coat.', expected: 'REJECT', reasoning: 'R6 — indirect IO leak via observable action' },

  // Attack 5: Semantic paraphrase leak
  { id: 'A5-1', attack: 'PARAPHRASE_LEAK', sceneId: 'S1', snapshotId: 'SNAP-S1-UNKNOWN', candidate: 'The meaning of Marcus\'s silence was suddenly obvious to Maya.', expected: 'REJECT', reasoning: 'paraphrased knowledge — implied understanding' },
  { id: 'A5-2', attack: 'PARAPHRASE_LEAK', sceneId: 'S1', snapshotId: 'SNAP-S1-UNKNOWN', candidate: 'Maya understood exactly why Marcus had moved the money.', expected: 'REJECT', reasoning: 'paraphrased knowledge — "understood why"' },
  { id: 'A5-3', attack: 'PARAPHRASE_LEAK', sceneId: 'S1', snapshotId: 'SNAP-S1-UNKNOWN', candidate: 'The truth behind the missing records clicked into place for Maya.', expected: 'REJECT', reasoning: 'paraphrased knowledge — "truth clicked into place"' },

  // Attack 6: Repair-induced knowledge leak
  { id: 'A6-1', attack: 'REPAIR_LEAK', sceneId: 'S2', snapshotId: 'SNAP-S2-SUSPECTS', candidate: 'Maya knew Marcus had stolen the money.', expected: 'REJECT', reasoning: 'SUSPECTS + knew → triggers repair; repair must not invent knowledge', isRepair: true },

  // Attack 7: Repair-induced numeric fabrication
  { id: 'A7-1', attack: 'REPAIR_NUMERIC', sceneId: 'S2', snapshotId: 'SNAP-S2-SUSPECTS', candidate: 'Maya knew Marcus had stolen exactly $40,000.', expected: 'REJECT', reasoning: 'SUSPECTS + exact amount → triggers repair; repair must not invent $40k', isRepair: true },

  // Attack 8: State snapshot isolation — S1 candidate against S3 state
  { id: 'A8-1', attack: 'SNAPSHOT_ISOLATION', sceneId: 'S3', snapshotId: 'SNAP-S3-KNOWS', candidate: 'Maya wondered if something was wrong.', expected: 'ACCEPT', reasoning: 'KNOWS + wondered → downgrade, licensed' },
  { id: 'A8-2', attack: 'SNAPSHOT_ISOLATION', sceneId: 'S1', snapshotId: 'SNAP-S1-UNKNOWN', candidate: 'Maya knew Marcus had stolen $40,000.', expected: 'REJECT', reasoning: 'UNKNOWN + knew $40k → leak (using S1 snapshot, not S3)' },

  // Attack 9: Deferred knowledge
  { id: 'A9-1', attack: 'DEFERRED_KNOWLEDGE', sceneId: 'S2', snapshotId: 'SNAP-S1-UNKNOWN', candidate: 'Maya understood the significance of the trowel left on the bench.', expected: 'REJECT', reasoning: 'deferred clue — Maya cannot yet understand significance' },

  // Attack 10: Conflicting state
  { id: 'A10-1', attack: 'CONFLICTING_STATE', sceneId: 'SX', snapshotId: 'SNAP-CONFLICT', candidate: 'Maya knew Marcus had stolen the money.', expected: 'REJECT', reasoning: 'conflicting state — IO says UNKNOWN, CharacterState says KNOWS; should not silently accept' },
];

// ── Main runner ─────────────────────────────────────────────────────────────
async function main() {
  const allResults: any[] = [];
  const repairResults: any[] = [];

  console.log('=== Writing OS v1.1 — Adversarial State Integrity Experiment ===');
  console.log(`Provider: FIREWORKS | Model: ${FIREWORKS_MODEL}`);
  console.log(`Cases: ${testMatrix.length}\n`);

  for (const tc of testMatrix) {
    const state = snapshots[tc.snapshotId];
    if (!state) { console.error(`${tc.id}: SNAPSHOT NOT FOUND ${tc.snapshotId}`); continue; }

    console.log(`\n--- ${tc.id} [${tc.attack}] scene=${tc.sceneId} snapshot=${tc.snapshotId} ---`);
    console.log(`  Candidate: "${tc.candidate.slice(0, 60)}..."`);
    console.log(`  Expected: ${tc.expected} (${tc.reasoning})`);

    // Step 1: Deterministic triage
    let triageResult: CanonicalTriageResult;
    try {
      triageResult = runDeterministicTriage(tc.candidate, state, 'LICENSED_FICTION' as any);
    } catch (e: any) {
      triageResult = { action: 'HANDOFF_TO_LLM', proofStrength: 'UNRESOLVED', reasoning: `triage error: ${e.message}`, signals: [], scopedOverridesApplied: [] };
    }
    console.log(`  Triage: ${triageResult.action}`);

    // Step 2: Semantic validation
    const semanticResult = await semanticValidate(tc.candidate, state, 'LICENSED_FICTION', triageResult);
    const fd = finalDecision(semanticResult);
    const correct = fd.final === tc.expected;
    console.log(`  Semantic: ${semanticResult.overall} | io=${semanticResult.infoOwnership} faith=${semanticResult.faithfulness} | → ${fd.final} ${correct ? '✓' : '✗'}`);

    // Step 3: Repair (if applicable)
    let repairResult: any = null;
    if (tc.isRepair && fd.final === 'REJECT') {
      console.log(`  Repair: generating...`);
      const violations = (semanticResult.reasons || []).filter((r: string) => r.includes('FAIL'));
      const repair = await generateRepair(tc.candidate, state, violations);
      if (repair.mode === 'LLM') {
        console.log(`  Repair: "${repair.repairedText.slice(0, 60)}..."`);
        let repairTriage: CanonicalTriageResult;
        try { repairTriage = runDeterministicTriage(repair.repairedText, state, 'LICENSED_FICTION' as any); }
        catch { repairTriage = { action: 'HANDOFF_TO_LLM', proofStrength: 'UNRESOLVED', reasoning: 'triage error', signals: [], scopedOverridesApplied: [] }; }
        const revalidation = await semanticValidate(repair.repairedText, state, 'LICENSED_FICTION', repairTriage);
        const revalFd = finalDecision(revalidation);
        repairResult = { originalCandidate: tc.candidate, validationDecision: fd.final, violations, repairedCandidate: repair.repairedText, repairTriageAction: repairTriage.action, revalidationDecision: revalFd.final, revalidationIo: revalidation.infoOwnership, revalidationFaith: revalidation.faithfulness, revalidationMode: revalidation._executionMode };
        console.log(`  Revalidation: ${revalidation.overall} | io=${revalidation.infoOwnership} faith=${revalidation.faithfulness} | → ${revalFd.final}`);
        repairResults.push({ caseId: tc.id, ...repairResult });
      } else {
        console.log(`  Repair: EXECUTION_ERROR`);
        repairResult = { error: repair.error };
      }
    }

    // Determine failure classification
    let failureClass = 'NONE';
    if (!correct) {
      if (semanticResult._executionMode === 'EXECUTION_ERROR') failureClass = 'EXECUTION_ERROR';
      else if (tc.attack === 'TEMPORAL_REGRESSION') failureClass = 'TEMPORAL_KNOWLEDGE_LEAK';
      else if (tc.attack === 'CROSS_CHARACTER') failureClass = 'CROSS_CHARACTER_OWNERSHIP_LEAK';
      else if (tc.attack === 'INDIRECT_IO_LEAK') failureClass = 'INDIRECT_SEMANTIC_IO_LEAK';
      else if (tc.attack === 'PARAPHRASE_LEAK') failureClass = 'INDIRECT_SEMANTIC_IO_LEAK';
      else if (tc.attack === 'REPAIR_LEAK') failureClass = 'REPAIR_STATE_LEAK';
      else if (tc.attack === 'REPAIR_NUMERIC') failureClass = 'REPAIR_SPECIFICITY_HALLUCINATION';
      else if (tc.attack === 'SNAPSHOT_ISOLATION') failureClass = 'SNAPSHOT_LEAK';
      else if (tc.attack === 'DEFERRED_KNOWLEDGE') failureClass = 'TEMPORAL_KNOWLEDGE_LEAK';
      else if (tc.attack === 'CONFLICTING_STATE') failureClass = 'STATE_PERSISTENCE_FAILURE';
      else failureClass = 'SEMANTIC_VALIDATION_FAILURE';
    }

    const result = {
      caseId: tc.id, attack: tc.attack, sceneId: tc.sceneId, snapshotId: tc.snapshotId,
      candidateText: tc.candidate, expected: tc.expected, reasoning: tc.reasoning,
      isRepair: tc.isRepair || false, isTemporal: tc.isTemporal || false,
      stateSnapshot: { knows: state.informationOwnership.entries[0].knows, suspects: state.informationOwnership.entries[0].suspects, unknown: state.informationOwnership.entries[0].unknown },
      deterministicTriage: { action: triageResult.action, proofStrength: triageResult.proofStrength, reasoning: triageResult.reasoning.slice(0, 100) },
      semanticValidation: { provider: semanticResult._executionMode === 'DETERMINISTIC' ? 'DETERMINISTIC' : 'FIREWORKS', model: FIREWORKS_MODEL, validatorMode: semanticResult._executionMode, overall: semanticResult.overall, infoOwnership: semanticResult.infoOwnership, faithfulness: semanticResult.faithfulness, canon: semanticResult.canon, meaning: semanticResult.meaning, stateConsulted: semanticResult.stateConsulted, reasons: semanticResult.reasons, latencyMs: semanticResult._latencyMs, error: semanticResult._error || null },
      finalDecision: fd.final, finalReason: fd.reason, correct, failureClass, repair: repairResult,
    };
    allResults.push(result);
    writeFileSync(join(LOG_DIR, `case-${tc.id}.json`), JSON.stringify(result, null, 2));
    await new Promise(r => setTimeout(r, 1000));
  }

  // Summary
  const llmCount = allResults.filter(r => r.semanticValidation.validatorMode === 'LLM').length;
  const detCount = allResults.filter(r => r.semanticValidation.validatorMode === 'DETERMINISTIC').length;
  const errCount = allResults.filter(r => r.semanticValidation.validatorMode === 'EXECUTION_ERROR').length;
  const correctCount = allResults.filter(r => r.correct).length;
  const triageAccept = allResults.filter(r => r.deterministicTriage.action === 'DETERMINISTIC_ACCEPT').length;
  const triageBlock = allResults.filter(r => r.deterministicTriage.action === 'DETERMINISTIC_BLOCK').length;
  const triageHandoff = allResults.filter(r => r.deterministicTriage.action === 'HANDOFF_TO_LLM').length;

  console.log(`\n\n=== v1.1 Summary ===`);
  console.log(`Total: ${allResults.length} | Correct: ${correctCount} | Errors: ${errCount}`);
  console.log(`Triage: ACCEPT=${triageAccept}, BLOCK=${triageBlock}, HANDOFF=${triageHandoff}`);
  console.log(`Modes: LLM=${llmCount}, DET=${detCount}, ERR=${errCount}`);
  console.log(`Repairs: ${repairResults.length}`);
  console.log(`\nFailures by class:`);
  const failures = allResults.filter(r => !r.correct);
  for (const f of failures) console.log(`  ${f.caseId} [${f.attack}]: ${f.failureClass}`);

  console.log(`\nBy attack type:`);
  for (const attack of [...new Set(allResults.map(r => r.attack))]) {
    const ar = allResults.filter(r => r.attack === attack);
    const ac = ar.filter(r => r.correct).length;
    console.log(`  ${attack}: ${ac}/${ar.length} correct`);
  }

  const summary = { experiment: 'writing-os-v1-1', provider: 'FIREWORKS', model: FIREWORKS_MODEL, total: allResults.length, correct: correctCount, executionErrors: errCount, triageRouting: { ACCEPT: triageAccept, BLOCK: triageBlock, HANDOFF: triageHandoff }, repairs: repairResults.length, failures: failures.map(f => ({ caseId: f.caseId, attack: f.attack, failureClass: f.failureClass })) };
  writeFileSync(join(LOG_DIR, 'candidate-results.json'), JSON.stringify(allResults, null, 2));
  writeFileSync(join(LOG_DIR, 'repair-results.json'), JSON.stringify(repairResults, null, 2));
  writeFileSync(join(LOG_DIR, 'state-snapshots.json'), JSON.stringify(snapshots, null, 2));
  writeFileSync(join(LOG_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log(`\nLogs saved to ${LOG_DIR}`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
