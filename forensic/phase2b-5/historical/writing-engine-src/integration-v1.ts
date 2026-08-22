// integration-v1.ts — Writing OS v1: First End-to-End Multi-Scene Experiment
//
// Tests the full integrated pipeline:
//   Candidate → Deterministic Triage → Semantic Validation → Repair → Revalidation → State Transition
//
// Uses the deterministic triage from gemini/deterministic-triage-v2 and the
// semantic validator from original/semantic-validation-v4-2.

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// ── Deterministic triage (from Gemini's branch) ─────────────────────────────
import { runDeterministicTriage } from '../../src/deterministic/index.js';
import type { CanonicalTriageResult, UnifiedHandoffPayload } from '../../src/deterministic/types.js';

// ── Semantic validator (from original agent's branch) ───────────────────────
// We use the inline Fireworks validator from iteration43b for the semantic layer
import {
  buildStateAwareSystemPrompt,
  makeHandoff,
} from './iteration43-helpers.js';

const LOG_DIR = join(import.meta.dir, '..', 'logs-integration-v1');
mkdirSync(LOG_DIR, { recursive: true });

// ── Fireworks configuration ─────────────────────────────────────────────────
const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY || '';
const FIREWORKS_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';
const FIREWORKS_MODEL = 'accounts/fireworks/models/qwen3p8-max';

// ── Fireworks LLM helper ────────────────────────────────────────────────────
async function fireworksLLM(system: string, user: string): Promise<{ content: string; mode: 'LLM' | 'EXECUTION_ERROR'; error?: string; latencyMs?: number }> {
  const startTime = Date.now();
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      const response = await fetch(FIREWORKS_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${FIREWORKS_API_KEY}`,
        },
        body: JSON.stringify({
          model: FIREWORKS_MODEL,
          max_tokens: 6000,
          top_k: 40,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      });
      if (!response.ok) {
        const errorBody = await response.text();
        if ((response.status === 429 || response.status >= 500) && attempt < 3) {
          await new Promise(r => setTimeout(r, 10000 * Math.pow(2, attempt)));
          continue;
        }
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
  if (first >= 0) {
    let partial = text.slice(first);
    const opens = (partial.match(/{/g) || []).length;
    const closes = (partial.match(/}/g) || []).length;
    if (opens > closes) { partial += '}'.repeat(opens - closes); try { return JSON.parse(partial); } catch {} }
  }
  throw new Error('JSON parse: ' + text.slice(0, 200));
}

// ── Semantic validation (uses calibrated prompt from 4.3B) ──────────────────
const CALIBRATED_SUFFIX = `

=== EPISTEMIC CALIBRATION RULES (Iteration 4.3) ===

EPISTEMIC RULE A — VAGUE UNCERTAINTY IS NOT A LEAK.
Statements using "wondered", "seemed", "felt uneasy", "vague sense", "something about" express EXPLICIT UNCERTAINTY. Under LICENSED_FICTION, these are PASS for infoOwnership, regardless of state.

EPISTEMIC RULE B — "SOME" IS A VAGUE QUANTIFIER, NOT AN EXACT SPECIFIC.
"some money", "some amount", "a few" are vague quantifiers. Do NOT FAIL faithfulness for "some money" unless the character asserts a specific amount not in state.

EPISTEMIC RULE C — DOMAIN-LEVEL SUSPICION IS SPECIFIC, NOT VAGUE.
"Suspected something was wrong with the finances" is SPECIFIC. Under state=UNKNOWN, these are FAIL for infoOwnership.

EPISTEMIC RULE D — THE DISTINCTION:
- "wondered if something was wrong" = VAGUE (licensed under UNKNOWN)
- "suspected Marcus had taken money" = SPECIFIC FACT (FAIL under UNKNOWN; ACCEPT under SUSPECTS/KNOWS)
- "knew Marcus had taken the money" = KNOWLEDGE (FAIL under UNKNOWN/SUSPECTS; ACCEPT under KNOWS)

EPISTEMIC RULE E — STATE-SUPPORTED NUMBERS.
If state=KNOWS and the state contains a specific number (e.g., "$40,000"), and the candidate asserts "knew ... $40,000", this is STATE_SUPPORTED. Do NOT FAIL faithfulness.

=== BENCHMARK FRAMING ===
This benchmark evaluates EPISTEMIC AUTHORIZATION and INFORMATION OWNERSHIP. No original revision target is provided. Set meaning = PASS unless the candidate is internally contradictory.

Return ONLY valid JSON. Be concise.`;

async function semanticValidate(
  candidateText: string,
  documentState: any,
  inventionPolicy: string,
  triageResult: CanonicalTriageResult,
): Promise<any> {
  // Fast path: if deterministic accepted, skip LLM
  if (triageResult.action === 'DETERMINISTIC_ACCEPT') {
    return { _executionMode: 'DETERMINISTIC', overall: 'ACCEPT', infoOwnership: 'PASS', faithfulness: 'PASS', meaning: 'PASS', stateConsulted: false, reasons: ['Fast path: DETERMINISTIC_ACCEPT'] };
  }
  // Fast path: if deterministic blocked, respect it
  if (triageResult.action === 'DETERMINISTIC_BLOCK') {
    return { _executionMode: 'DETERMINISTIC', overall: 'REJECT', infoOwnership: 'FAIL', faithfulness: 'FAIL', meaning: 'PASS', stateConsulted: false, reasons: ['Hard block: ' + triageResult.reasoning] };
  }

  // Full semantic validation via Fireworks
  const systemPrompt = buildStateAwareSystemPrompt(inventionPolicy as any) + CALIBRATED_SUFFIX;
  const handoff = triageResult.handoffPayload || makeHandoff(candidateText, documentState, inventionPolicy as any);
  const userPrompt = `CANDIDATE TEXT:\n"""\n${candidateText}\n"""\n\nDOCUMENT STATE:\n${JSON.stringify(documentState, null, 2)}\n\nINVENTION POLICY: ${inventionPolicy}\n\nDETERMINISTIC TRIAGE ACTION: ${triageResult.action}\n\nDETERMINISTIC HANDOFF PAYLOAD:\n${JSON.stringify(handoff, null, 2)}\n\nValidate. Return JSON:\n{\n  "meaning": "PASS",\n  "character": "PASS"|"FAIL"|"UNCLEAR",\n  "infoOwnership": "PASS"|"FAIL"|"UNCLEAR",\n  "canon": "PASS"|"FAIL"|"UNCLEAR",\n  "voice": "PASS"|"FAIL"|"UNCLEAR",\n  "register": "PASS"|"FAIL"|"UNCLEAR",\n  "intelligibility": "PASS"|"FAIL"|"UNCLEAR",\n  "deferred": "PASS"|"FAIL"|"UNCLEAR",\n  "faithfulness": "PASS"|"FAIL"|"UNCLEAR",\n  "overall": "ACCEPT"|"REJECT",\n  "reasons": ["brief per dimension"],\n  "epistemicLevelAssessed": "OBSERVATION"|"INTERPRETATION"|"SUSPICION"|"BELIEF"|"KNOWLEDGE"|"CERTAINTY"|"MIXED"|"NONE",\n  "stateConsulted": true|false\n}`;

  const { content, mode, error, latencyMs } = await fireworksLLM(systemPrompt, userPrompt);
  if (mode === 'EXECUTION_ERROR') {
    return { _executionMode: 'EXECUTION_ERROR', _error: error, _latencyMs: latencyMs, overall: 'EXECUTION_ERROR' };
  }
  try {
    return { ...extractJSON(content), _executionMode: 'LLM', _latencyMs: latencyMs };
  } catch (e: any) {
    return { _executionMode: 'EXECUTION_ERROR', _error: 'JSON: ' + e.message, _latencyMs: latencyMs, overall: 'EXECUTION_ERROR' };
  }
}

// ── Final decision (v3 conservative policy) ────────────────────────────────
function finalDecision(lj: any): { final: 'ACCEPT' | 'REJECT'; reason: string } {
  if (lj._executionMode === 'EXECUTION_ERROR') return { final: 'REJECT', reason: 'EXECUTION_ERROR' };
  if (lj._executionMode === 'DETERMINISTIC') {
    if (lj.overall === 'ACCEPT') return { final: 'ACCEPT', reason: 'DETERMINISTIC_ACCEPT' };
    return { final: 'REJECT', reason: 'DETERMINISTIC_BLOCK' };
  }
  if (lj.overall === 'REJECT') return { final: 'REJECT', reason: '[LJ] REJECT' };
  if (lj.faithfulness === 'UNCLEAR' || lj.infoOwnership === 'UNCLEAR') {
    return { final: 'REJECT', reason: `Conservative: UNCLEAR (faith=${lj.faithfulness}, io=${lj.infoOwnership})` };
  }
  return { final: 'ACCEPT', reason: '[LJ] ACCEPT' };
}

// ── Repair generation ───────────────────────────────────────────────────────
async function generateRepair(candidateText: string, documentState: any, inventionPolicy: string, violations: string[]): Promise<{ repairedText: string; mode: 'LLM' | 'EXECUTION_ERROR'; error?: string }> {
  const systemPrompt = `You are a fiction reviser. Fix the identified violations while preserving meaning, voice, and register. Do NOT invent facts. Do NOT introduce information the character does not possess. Return ONLY the repaired text, no JSON.`;
  const userPrompt = `CANDIDATE TEXT:\n"""\n${candidateText}\n"""\n\nDOCUMENT STATE:\n${JSON.stringify(documentState, null, 2)}\n\nINVENTION POLICY: ${inventionPolicy}\n\nVIOLATIONS TO FIX:\n${violations.join('\n')}\n\nGenerate a repaired version that fixes the violations while preserving meaning. Return only the text.`;
  const { content, mode, error } = await fireworksLLM(systemPrompt, userPrompt);
  if (mode === 'EXECUTION_ERROR') return { repairedText: candidateText, mode: 'EXECUTION_ERROR', error };
  return { repairedText: content.trim(), mode: 'LLM' };
}

// ── State factory ───────────────────────────────────────────────────────────
interface StoryState {
  character: { identity: string; goals: string[]; fears: string[]; beliefs: string[]; memories: string[]; emotionalState: string; perceptualHabits: string[]; voice: string; currentKnowledge: string[]; };
  informationOwnership: { entries: { fact: string; knows: string[]; suspects: string[]; misunderstands: string[]; unknown: string[]; }[]; };
  canon: { facts: { content: string; classification: 'HARD_CANON' | 'SOFT_CANON' | 'BACKGROUND'; source?: string; }[]; };
  deferredChecks: any[];
  sceneId: string;
  revisionId: number;
}

function makeState(mayaKnows: 'unknown' | 'suspects' | 'knows', withAmount: boolean = false): StoryState {
  const fact = withAmount ? 'Marcus embezzled $40,000 from the clinic' : 'Marcus took money from the clinic';
  return {
    character: {
      identity: 'Maya Okafor — ICU nurse, 34, co-owns a clinic with Marcus',
      goals: ['Keep the clinic running', 'Find out what is happening with the finances'],
      fears: ['The clinic is in trouble', 'Marcus is hiding something'],
      beliefs: ['The clinic should be transparent'],
      memories: ['Papa teaching her to count by pill bottles'],
      emotionalState: 'Wary but focused',
      perceptualHabits: ['Counts objects', 'Notices discrepancies'],
      voice: 'Sparse, observational',
      currentKnowledge: mayaKnows === 'knows' ? [fact] : mayaKnows === 'suspects' ? ['She saw a $40,000 discrepancy in the ledger'] : [],
    },
    informationOwnership: {
      entries: [{
        fact,
        knows: mayaKnows === 'knows' ? ['Marcus', 'Maya'] : ['Marcus'],
        suspects: mayaKnows === 'suspects' ? ['Maya'] : [],
        misunderstands: [],
        unknown: mayaKnows === 'unknown' ? ['Maya'] : [],
      }],
    },
    canon: { facts: [{ content: 'Maya co-owns a clinic with Marcus', classification: 'HARD_CANON' as const, source: 'ch1' }] },
    deferredChecks: [],
    sceneId: '', revisionId: 1,
  };
}

// ── The 7-scene test plan ───────────────────────────────────────────────────
interface SceneTest {
  sceneId: string;
  sceneLabel: string;
  state: StoryState;
  candidates: { id: string; text: string; expected: 'ACCEPT' | 'REJECT'; reasoning: string; isRepair?: boolean }[];
  stateTransition?: { type: string; fact: string; from: string; to: string; reason: string };
}

const scenes: SceneTest[] = [
  // Scene 1 — UNKNOWN
  {
    sceneId: 'S1',
    sceneLabel: 'UNKNOWN — Maya does not know',
    state: { ...makeState('unknown'), sceneId: 'S1' },
    candidates: [
      { id: 'S1-C1', text: 'Maya wondered if something was wrong.', expected: 'ACCEPT', reasoning: 'vague uncertainty — licensed under UNKNOWN' },
    ],
  },
  // Scene 2 — OBSERVATION (state still UNKNOWN but evidence observed)
  {
    sceneId: 'S2',
    sceneLabel: 'OBSERVATION — Maya sees evidence but does not know yet',
    state: { ...makeState('unknown'), sceneId: 'S2' },
    candidates: [
      { id: 'S2-C1', text: 'Maya noticed a discrepancy in the clinic records.', expected: 'ACCEPT', reasoning: 'observation — licensed' },
      { id: 'S2-C2', text: 'Maya knew Marcus had taken the money.', expected: 'REJECT', reasoning: 'epistemic overreach — UNKNOWN + knowledge' },
    ],
    stateTransition: { type: 'info_ownership', fact: 'Marcus took money from the clinic', from: 'unknown', to: 'suspects', reason: 'Maya observed a $40,000 discrepancy in the ledger' },
  },
  // Scene 3 — SUSPECTS
  {
    sceneId: 'S3',
    sceneLabel: 'SUSPECTS — Maya suspects but does not know',
    state: { ...makeState('suspects'), sceneId: 'S3' },
    candidates: [
      { id: 'S3-C1', text: 'Maya suspected Marcus might have taken some money.', expected: 'ACCEPT', reasoning: 'suspicion matches state (SUSPECTS)' },
      { id: 'S3-C2', text: 'Maya knew Marcus had stolen the money.', expected: 'REJECT', reasoning: 'epistemic overreach — SUSPECTS + knowledge' },
    ],
  },
  // Scene 4 — STILL SUSPECTS (deliberate bad candidate for repair)
  {
    sceneId: 'S4',
    sceneLabel: 'STILL SUSPECTS — bad candidate triggers repair',
    state: { ...makeState('suspects'), sceneId: 'S4' },
    candidates: [
      { id: 'S4-C1', text: 'Maya knew what Marcus had done.', expected: 'REJECT', reasoning: 'epistemic overreach — triggers repair', isRepair: true },
    ],
  },
  // Scene 5 — KNOWS (state transition)
  {
    sceneId: 'S5',
    sceneLabel: 'KNOWS — Maya now knows (with amount in state)',
    state: { ...makeState('knows', true), sceneId: 'S5' },
    candidates: [
      { id: 'S5-C1', text: 'Maya knew Marcus had stolen the money.', expected: 'ACCEPT', reasoning: 'knowledge matches state (KNOWS)' },
      { id: 'S5-C2', text: 'Maya knew Marcus had stolen $40,000.', expected: 'ACCEPT', reasoning: 'state-supported number (Rule E)' },
    ],
    stateTransition: { type: 'info_ownership', fact: 'Marcus embezzled $40,000 from the clinic', from: 'suspects', to: 'knows', reason: 'Maya received direct confirmation from the accountant' },
  },
  // Scene 6 — REGRESSION A (unsupported number)
  {
    sceneId: 'S6',
    sceneLabel: 'REGRESSION A — unsupported number "127"',
    state: { ...makeState('knows'), sceneId: 'S6' },
    candidates: [
      { id: 'S6-C1', text: 'There were 127 missing files.', expected: 'REJECT', reasoning: 'unsupported specific number — should be DETERMINISTIC_BLOCK' },
    ],
  },
  // Scene 6b — REGRESSION B (indirect IO leak)
  {
    sceneId: 'S6b',
    sceneLabel: 'REGRESSION B — indirect IO leak (R6)',
    state: { ...makeState('unknown'), sceneId: 'S6b' },
    candidates: [
      { id: 'S6b-C1', text: 'Maya saw Marcus hide the ledger under his coat.', expected: 'REJECT', reasoning: 'indirect IO leak — semantic gap (R6)' },
    ],
  },
];

// ── Main runner ─────────────────────────────────────────────────────────────
async function main() {
  const allResults: any[] = [];
  const stateTransitions: any[] = [];
  const repairResults: any[] = [];
  let currentState = scenes[0].state;

  console.log('=== Writing OS v1 — First Integrated Multi-Scene Experiment ===');
  console.log(`Provider: FIREWORKS | Model: ${FIREWORKS_MODEL}`);
  console.log(`Scenes: ${scenes.length}\n`);

  for (const scene of scenes) {
    console.log(`\n--- ${scene.sceneId}: ${scene.sceneLabel} ---`);
    console.log(`State: knows=${scene.state.informationOwnership.entries[0].knows}, suspects=${scene.state.informationOwnership.entries[0].suspects}, unknown=${scene.state.informationOwnership.entries[0].unknown}`);

    // Log state transition
    if (scene.stateTransition) {
      stateTransitions.push({
        sceneId: scene.sceneId,
        beforeState: { knows: currentState.informationOwnership.entries[0].knows, suspects: currentState.informationOwnership.entries[0].suspects, unknown: currentState.informationOwnership.entries[0].unknown },
        transition: scene.stateTransition,
        afterState: { knows: scene.state.informationOwnership.entries[0].knows, suspects: scene.state.informationOwnership.entries[0].suspects, unknown: scene.state.informationOwnership.entries[0].unknown },
      });
      console.log(`State transition: ${scene.stateTransition.from} → ${scene.stateTransition.to} (${scene.stateTransition.reason})`);
    }

    currentState = scene.state;

    for (const candidate of scene.candidates) {
      console.log(`\n  Candidate ${candidate.id}: "${candidate.text.slice(0, 60)}..."`);
      console.log(`  Expected: ${candidate.expected} (${candidate.reasoning})`);

      // Step 1: Deterministic triage
      let triageResult: CanonicalTriageResult;
      try {
        triageResult = runDeterministicTriage(candidate.text, scene.state as any, 'LICENSED_FICTION' as any);
      } catch (e: any) {
        // If deterministic triage throws, create a HANDOFF
        triageResult = {
          action: 'HANDOFF_TO_LLM',
          proofStrength: 'UNRESOLVED',
          reasoning: `Deterministic triage error: ${e.message}`,
          signals: [],
          scopedOverridesApplied: [],
        };
      }
      console.log(`  Triage: ${triageResult.action} (${triageResult.reasoning.slice(0, 60)})`);

      // Step 2: Semantic validation (only if HANDOFF_TO_LLM or EXECUTION_ERROR)
      const semanticResult = await semanticValidate(candidate.text, scene.state, 'LICENSED_FICTION', triageResult);
      const fd = finalDecision(semanticResult);
      const correct = fd.final === candidate.expected;
      console.log(`  Semantic: ${semanticResult.overall} | io=${semanticResult.infoOwnership} faith=${semanticResult.faithfulness} | → ${fd.final} ${correct ? '✓' : '✗'}`);

      // Step 3: Repair loop (if rejected and isRepair)
      let repairResult: any = null;
      if (candidate.isRepair && fd.final === 'REJECT') {
        console.log(`  Repair: generating repair...`);
        const violations = (semanticResult.reasons || []).filter((r: string) => r.includes('FAIL'));
        const repair = await generateRepair(candidate.text, scene.state, 'LICENSED_FICTION', violations);
        if (repair.mode === 'LLM') {
          console.log(`  Repair: "${repair.repairedText.slice(0, 60)}..."`);
          // Re-run deterministic triage on repaired text
          let repairTriage: CanonicalTriageResult;
          try {
            repairTriage = runDeterministicTriage(repair.repairedText, scene.state as any, 'LICENSED_FICTION' as any);
          } catch {
            repairTriage = { action: 'HANDOFF_TO_LLM', proofStrength: 'UNRESOLVED', reasoning: 'triage error', signals: [], scopedOverridesApplied: [] };
          }
          // Re-validate repaired text
          const revalidation = await semanticValidate(repair.repairedText, scene.state, 'LICENSED_FICTION', repairTriage);
          const revalFd = finalDecision(revalidation);
          repairResult = {
            originalCandidate: candidate.text,
            validationDecision: fd.final,
            violations,
            repairedCandidate: repair.repairedText,
            repairTriageAction: repairTriage.action,
            revalidationDecision: revalFd.final,
            revalidationIo: revalidation.infoOwnership,
            revalidationFaith: revalidation.faithfulness,
            revalidationMode: revalidation._executionMode,
          };
          console.log(`  Revalidation: ${revalidation.overall} | io=${revalidation.infoOwnership} faith=${revalidation.faithfulness} | → ${revalFd.final}`);
          repairResults.push({ sceneId: scene.sceneId, candidateId: candidate.id, ...repairResult });
        } else {
          console.log(`  Repair: EXECUTION_ERROR`);
          repairResult = { error: repair.error };
        }
      }

      // Log the result
      const result = {
        sceneId: scene.sceneId,
        sceneLabel: scene.sceneLabel,
        candidateId: candidate.id,
        candidateText: candidate.text,
        expected: candidate.expected,
        reasoning: candidate.reasoning,
        isRepair: candidate.isRepair || false,
        beforeState: {
          knows: scene.state.informationOwnership.entries[0].knows,
          suspects: scene.state.informationOwnership.entries[0].suspects,
          unknown: scene.state.informationOwnership.entries[0].unknown,
        },
        deterministicTriage: {
          action: triageResult.action,
          proofStrength: triageResult.proofStrength,
          reasoning: triageResult.reasoning,
          signalsCount: triageResult.signals?.length || 0,
          hardViolations: triageResult.handoffPayload?.hardViolations || [],
          softSignals: triageResult.handoffPayload?.softSignals || [],
        },
        semanticValidation: {
          provider: semanticResult._executionMode === 'DETERMINISTIC' ? 'DETERMINISTIC' : 'FIREWORKS',
          model: FIREWORKS_MODEL,
          validatorMode: semanticResult._executionMode,
          overall: semanticResult.overall,
          infoOwnership: semanticResult.infoOwnership,
          faithfulness: semanticResult.faithfulness,
          canon: semanticResult.canon,
          meaning: semanticResult.meaning,
          stateConsulted: semanticResult.stateConsulted,
          reasons: semanticResult.reasons,
          latencyMs: semanticResult._latencyMs,
          error: semanticResult._error || null,
        },
        finalDecision: fd.final,
        finalReason: fd.reason,
        correct,
        repair: repairResult,
      };
      allResults.push(result);
      writeFileSync(join(LOG_DIR, `candidate-${candidate.id}.json`), JSON.stringify(result, null, 2));

      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Summary
  const llmCount = allResults.filter(r => r.semanticValidation.validatorMode === 'LLM').length;
  const detCount = allResults.filter(r => r.semanticValidation.validatorMode === 'DETERMINISTIC').length;
  const errCount = allResults.filter(r => r.semanticValidation.validatorMode === 'EXECUTION_ERROR').length;
  const correctCount = allResults.filter(r => r.correct).length;
  const triageAccept = allResults.filter(r => r.deterministicTriage.action === 'DETERMINISTIC_ACCEPT').length;
  const triageBlock = allResults.filter(r => r.deterministicTriage.action === 'DETERMINISTIC_BLOCK').length;
  const triageHandoff = allResults.filter(r => r.deterministicTriage.action === 'HANDOFF_TO_LLM').length;

  console.log(`\n\n=== Integration Summary ===`);
  console.log(`Total candidates: ${allResults.length}`);
  console.log(`Correct: ${correctCount}/${allResults.length}`);
  console.log(`Triage routing: ACCEPT=${triageAccept}, BLOCK=${triageBlock}, HANDOFF=${triageHandoff}`);
  console.log(`Validator modes: LLM=${llmCount}, DETERMINISTIC=${detCount}, EXECUTION_ERROR=${errCount}`);
  console.log(`State transitions: ${stateTransitions.length}`);
  console.log(`Repair loops: ${repairResults.length}`);

  const summary = {
    experiment: 'integration-writing-os-v1',
    provider: 'FIREWORKS',
    model: FIREWORKS_MODEL,
    totalCandidates: allResults.length,
    correct: correctCount,
    triageRouting: { ACCEPT: triageAccept, BLOCK: triageBlock, HANDOFF: triageHandoff },
    validatorModes: { LLM: llmCount, DETERMINISTIC: detCount, EXECUTION_ERROR: errCount },
    stateTransitions: stateTransitions.length,
    repairLoops: repairResults.length,
    scenes: scenes.length,
  };
  writeFileSync(join(LOG_DIR, 'scenes.json'), JSON.stringify(scenes.map(s => ({ sceneId: s.sceneId, label: s.sceneLabel, state: { knows: s.state.informationOwnership.entries[0].knows, suspects: s.state.informationOwnership.entries[0].suspects, unknown: s.state.informationOwnership.entries[0].unknown } })), null, 2));
  writeFileSync(join(LOG_DIR, 'state-transitions.json'), JSON.stringify(stateTransitions, null, 2));
  writeFileSync(join(LOG_DIR, 'candidate-results.json'), JSON.stringify(allResults, null, 2));
  writeFileSync(join(LOG_DIR, 'repair-results.json'), JSON.stringify(repairResults, null, 2));
  writeFileSync(join(LOG_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log(`\nLogs saved to ${LOG_DIR}`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
