// iteration43b.ts — Iteration 4.3B: Clean Epistemic Benchmark + Full Calibrated Run
//
// Key changes from 4.3-FW:
// 1. originalText = undefined (removes meaning=FAIL confound)
// 2. Prompt explicitly tells validator: epistemic-only evaluation, do not infer meaning failure
// 3. Full calibrated prompt with 5 epistemic rules (Rules A-E from 4.3)
// 4. JSON robustness: max_tokens=6000, concise JSON instruction, schema validation
// 5. All 23 cases must execute — no stopping early
// 6. Separate epistemic metric (infoOwnership) from full semantic metric (overall)

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildStateAwareSystemPrompt,
  makeState, makeHandoff,
  testMatrix43, type TestCase43,
  type InventionPolicy, type DocumentState,
} from './iteration43-helpers';

const LOG_DIR = join(import.meta.dir, '..', 'logs43b');
mkdirSync(LOG_DIR, { recursive: true });

// ── Fireworks configuration ─────────────────────────────────────────────────
const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY || '';
const FIREWORKS_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';
const FIREWORKS_MODEL = 'accounts/fireworks/models/qwen3p8-max';

// ── Fireworks LLM helper with improved JSON robustness ──────────────────────
interface LLMResult {
  content: string;
  mode: 'LLM' | 'EXECUTION_ERROR';
  error?: string;
  latencyMs?: number;
  retryCount?: number;
}

async function fireworksLLM(system: string, user: string): Promise<LLMResult> {
  const maxRetries = 3;
  const startTime = Date.now();
  let lastError = '';

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
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
          max_tokens: 6000,  // increased from 4000 to reduce truncation
          top_k: 40,
          presence_penalty: 0,
          frequency_penalty: 0,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        lastError = `HTTP ${response.status}: ${errorBody.slice(0, 200)}`;
        if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
          const wait = 10000 * Math.pow(2, attempt);
          console.error(`  [Fireworks ${response.status}] attempt ${attempt + 1}/${maxRetries + 1}; waiting ${wait / 1000}s...`);
          await new Promise(r => setTimeout(r, wait));
          continue;
        }
        return { content: '', mode: 'EXECUTION_ERROR', error: lastError, latencyMs: Date.now() - startTime, retryCount: attempt };
      }

      const data: any = await response.json();
      const content = data.choices?.[0]?.message?.content ?? '';
      if (!content) {
        lastError = 'Empty response from Fireworks';
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 5000));
          continue;
        }
        return { content: '', mode: 'EXECUTION_ERROR', error: lastError, latencyMs: Date.now() - startTime, retryCount: attempt };
      }

      return { content, mode: 'LLM', latencyMs: Date.now() - startTime, retryCount: attempt };
    } catch (e: any) {
      lastError = String(e?.message || e);
      if (attempt < maxRetries) {
        const wait = 10000 * Math.pow(2, attempt);
        console.error(`  [Fireworks network error] attempt ${attempt + 1}/${maxRetries + 1}; waiting ${wait / 1000}s...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      return { content: '', mode: 'EXECUTION_ERROR', error: lastError, latencyMs: Date.now() - startTime, retryCount: attempt };
    }
  }

  return { content: '', mode: 'EXECUTION_ERROR', error: lastError, latencyMs: Date.now() - startTime, retryCount: maxRetries };
}

// ── Improved JSON extraction with schema validation ─────────────────────────
function extractJSON(text: string): any {
  // Try direct parse
  try { return JSON.parse(text); } catch {}
  // Try fenced block
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  // Try first { ... last }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) { try { return JSON.parse(text.slice(first, last + 1)); } catch {} }
  // Try to repair truncated JSON by closing open braces/brackets
  if (first >= 0) {
    let partial = text.slice(first);
    // Count open vs close braces
    const opens = (partial.match(/{/g) || []).length;
    const closes = (partial.match(/}/g) || []).length;
    if (opens > closes) {
      partial += '}'.repeat(opens - closes);
      try { return JSON.parse(partial); } catch {}
    }
  }
  throw new Error('Could not parse JSON: ' + text.slice(0, 200));
}

// ── The 4.3B system prompt (calibrated + epistemic-only framing) ────────────
function build43BSystemPrompt(policy: InventionPolicy): string {
  const base = buildStateAwareSystemPrompt(policy);
  return base + `

=== EPISTEMIC CALIBRATION RULES (Iteration 4.3) ===

EPISTEMIC RULE A — VAGUE UNCERTAINTY IS NOT A LEAK.
Statements using "wondered", "seemed", "felt uneasy", "vague sense", "something about", "might be missing something" express EXPLICIT UNCERTAINTY. They do not assert a specific fact. Under LICENSED_FICTION and LIMITED_INFERENCE, these are PASS for infoOwnership, regardless of state (even UNKNOWN). They only FAIL if they name a specific unauthorized fact.

EPISTEMIC RULE B — "SOME" IS A VAGUE QUANTIFIER, NOT AN EXACT SPECIFIC.
"some money", "some amount", "a few" are vague quantifiers. They do NOT assert an exact number. Do NOT FAIL faithfulness for "some money" unless the character asserts a specific amount (e.g., "$40,000") that is not in state. If state=KNOWS or SUSPECTS the underlying fact, "some money" is state-supported.

EPISTEMIC RULE C — DOMAIN-LEVEL SUSPICION IS SPECIFIC, NOT VAGUE.
"Suspected something was wrong with the finances" or "suspected the accounting records had been altered" are SPECIFIC domain-level suspicions. They name a specific domain (finances, accounting) and a specific concern. Under state=UNKNOWN (no evidence seen), these are FAIL for infoOwnership — they assert suspicion of a specific unauthorized fact without evidence. This is NOT the same as "wondered if something was wrong" (which is vague).

EPISTEMIC RULE D — THE DISTINCTION:
- "wondered if something was wrong" = VAGUE (licensed under UNKNOWN)
- "suspected something was wrong with the finances" = SPECIFIC DOMAIN (FAIL under UNKNOWN without evidence)
- "suspected Marcus had taken money" = SPECIFIC FACT (FAIL under UNKNOWN; ACCEPT under SUSPECTS/KNOWS)
- "knew Marcus had taken the money" = KNOWLEDGE (FAIL under UNKNOWN/SUSPECTS; ACCEPT under KNOWS)

EPISTEMIC RULE E — STATE-SUPPORTED NUMBERS.
If state=KNOWS and the state contains a specific number (e.g., "$40,000"), and the candidate asserts "knew ... $40,000", this is STATE_SUPPORTED. Do NOT FAIL faithfulness for the number — the [CC] provenance layer verifies it is in state. The number is not "invented" if it appears in the character's knowledge.

=== BENCHMARK FRAMING (Iteration 4.3B) ===
This benchmark evaluates EPISTEMIC AUTHORIZATION and INFORMATION OWNERSHIP only. No original revision target is provided. Do NOT infer a meaning-preservation failure from the absence of an original text. Set meaning = PASS unless the candidate is internally contradictory.

Return ONLY valid JSON. Be concise.`;
}

// ── The 4.3B user prompt (no originalText — removes meaning confound) ───────
function build43BUserPrompt(candidate: string, state: DocumentState, policy: InventionPolicy): string {
  const handoff = makeHandoff(candidate, state, policy);
  return `CANDIDATE TEXT:
"""
${candidate}
"""

DOCUMENT STATE:
${JSON.stringify(state, null, 2)}

INVENTION POLICY: ${policy}

DETERMINISTIC TRIAGE ACTION: HANDOFF_TO_LLM

Note: No original text is provided. This is an epistemic authorization test, not a revision test. Set meaning = PASS.

Validate. Return JSON:
{
  "meaning": "PASS",
  "character": "PASS"|"FAIL"|"UNCLEAR",
  "infoOwnership": "PASS"|"FAIL"|"UNCLEAR",
  "canon": "PASS"|"FAIL"|"UNCLEAR",
  "voice": "PASS"|"FAIL"|"UNCLEAR",
  "register": "PASS"|"FAIL"|"UNCLEAR",
  "intelligibility": "PASS"|"FAIL"|"UNCLEAR",
  "deferred": "PASS"|"FAIL"|"UNCLEAR",
  "faithfulness": "PASS"|"FAIL"|"UNCLEAR",
  "overall": "ACCEPT"|"REJECT",
  "reasons": ["brief per dimension"],
  "epistemicLevelAssessed": "OBSERVATION"|"INTERPRETATION"|"SUSPICION"|"BELIEF"|"KNOWLEDGE"|"CERTAINTY"|"MIXED"|"NONE",
  "stateConsulted": true|false
}`;
}

// ── Final decision (v3 conservative policy) ────────────────────────────────
function finalDecision(lj: any): { final: 'ACCEPT' | 'REJECT'; reason: string } {
  if (lj._executionMode === 'EXECUTION_ERROR') return { final: 'REJECT', reason: 'EXECUTION_ERROR' };
  if (lj.overall === 'REJECT') return { final: 'REJECT', reason: '[LJ] REJECT' };
  if (lj.faithfulness === 'UNCLEAR' || lj.infoOwnership === 'UNCLEAR') {
    return { final: 'REJECT', reason: `Conservative: UNCLEAR on integrity (faith=${lj.faithfulness}, io=${lj.infoOwnership})` };
  }
  return { final: 'ACCEPT', reason: '[LJ] ACCEPT' };
}

// ── Runner ──────────────────────────────────────────────────────────────────
async function runMatrix(label: string, caseFilter?: string[]): Promise<any[]> {
  const results: any[] = [];
  const cases = caseFilter ? testMatrix43.filter(c => caseFilter.includes(c.id)) : testMatrix43;

  console.log(`\n=== Iteration 4.3B — ${label} (${cases.length} cases, provider=FIREWORKS, model=${FIREWORKS_MODEL}) ===\n`);

  for (const tc of cases) {
    const startTime = Date.now();
    try {
      const systemPrompt = build43BSystemPrompt(tc.policy);
      const userPrompt = build43BUserPrompt(tc.candidate, tc.state, tc.policy);
      const { content, mode, error, latencyMs, retryCount } = await fireworksLLM(systemPrompt, userPrompt);

      let lj: any;
      if (mode === 'EXECUTION_ERROR') {
        lj = { _executionMode: 'EXECUTION_ERROR', _error: error, _latencyMs: latencyMs, _retryCount: retryCount, overall: 'EXECUTION_ERROR' };
      } else {
        try {
          lj = { ...extractJSON(content), _executionMode: 'LLM', _latencyMs: latencyMs, _retryCount: retryCount };
        } catch (e: any) {
          lj = { _executionMode: 'EXECUTION_ERROR', _error: 'JSON parse: ' + e.message, _latencyMs: latencyMs, _retryCount: retryCount, _raw: content.slice(0, 300), overall: 'EXECUTION_ERROR' };
        }
      }

      const fd = finalDecision(lj);
      const correct = fd.final === tc.expected || (tc.expected === 'UNCLEAR' && (fd.final === 'ACCEPT' || fd.final === 'REJECT'));
      const latency = lj._latencyMs ?? (Date.now() - startTime);
      console.log(`${tc.id} [${tc.group}] ${tc.label.slice(0, 40)}: ${tc.epistemicLevel}/${tc.propositionSpecificity} | FW=${lj.overall} io=${lj.infoOwnership ?? '?'} faith=${lj.faithfulness ?? '?'} meaning=${lj.meaning ?? '?'} → ${fd.final} (exp ${tc.expected}) ${correct ? '✓' : '✗'} [${latency}ms, ${lj._retryCount ?? 0} retries]`);

      const result = {
        caseId: tc.id,
        group: tc.group,
        label: tc.label,
        provider: 'FIREWORKS',
        model: FIREWORKS_MODEL,
        validatorMode: lj._executionMode === 'LLM' ? 'LLM' : 'EXECUTION_ERROR',
        executionStatus: lj._executionMode === 'LLM' ? 'SUCCESS' : 'EXECUTION_ERROR',
        candidateText: tc.candidate,
        originalText: null,  // explicitly null — no meaning confound
        state: {
          knows: tc.state.informationOwnership?.entries[0]?.knows,
          suspects: tc.state.informationOwnership?.entries[0]?.suspects,
          unknown: tc.state.informationOwnership?.entries[0]?.unknown,
        },
        policy: tc.policy,
        triageResult: { action: 'HANDOFF_TO_LLM' },
        semanticResult: {
          overall: lj.overall,
          infoOwnership: lj.infoOwnership,
          faithfulness: lj.faithfulness,
          canon: lj.canon,
          deferred: lj.deferred,
          meaning: lj.meaning,
          character: lj.character,
          voice: lj.voice,
          register: lj.register,
          intelligibility: lj.intelligibility,
          stateConsulted: lj.stateConsulted,
          epistemicLevelAssessed: lj.epistemicLevelAssessed,
          reasons: lj.reasons,
        },
        stateConsulted: lj.stateConsulted === true,
        finalDecision: fd.final,
        finalReason: fd.reason,
        expected: tc.expected,
        correct,
        epistemicLevel: tc.epistemicLevel,
        propositionSpecificity: tc.propositionSpecificity,
        reasoning: tc.reasoning,
        latencyMs: latency,
        retryCount: lj._retryCount ?? 0,
        error: lj._error || null,
        runLabel: label,
      };
      results.push(result);
      writeFileSync(join(LOG_DIR, `${label}-${tc.id}.json`), JSON.stringify(result, null, 2));
    } catch (e: any) {
      console.error(`${tc.id}: FATAL ERROR ${e.message}`);
      const result = {
        caseId: tc.id, provider: 'FIREWORKS', model: FIREWORKS_MODEL,
        validatorMode: 'EXECUTION_ERROR', executionStatus: 'EXECUTION_ERROR',
        error: e.message, runLabel: label, expected: tc.expected, correct: false,
      };
      results.push(result);
      writeFileSync(join(LOG_DIR, `${label}-${tc.id}.json`), JSON.stringify(result, null, 2));
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  // Metrics
  const llmResults = results.filter(r => r.validatorMode === 'LLM');
  const execErrors = results.filter(r => r.validatorMode === 'EXECUTION_ERROR');
  const correct = llmResults.filter(r => r.correct).length;

  console.log(`\n=== ${label} Metrics (Fireworks) ===`);
  console.log(`Provider: FIREWORKS | Model: ${FIREWORKS_MODEL}`);
  console.log(`Total: ${results.length} | LLM executed: ${llmResults.length} | Exec errors: ${execErrors.length}`);
  console.log(`Final-decision correct: ${correct}/${llmResults.length} (${llmResults.length ? Math.round(100 * correct / llmResults.length) : 0}%)`);

  // Epistemic io accuracy (primary metric — NOT finalDecision)
  const ioExpected = (tc: any) => tc.expected === 'ACCEPT' ? 'PASS' : 'FAIL';
  let ioCorrect = 0, ioTotal = 0;
  for (const r of llmResults) {
    const tc = testMatrix43.find(t => t.id === r.caseId);
    if (!tc) continue;
    const expIO = ioExpected(tc);
    const gotIO = r.semanticResult?.infoOwnership;
    if (gotIO === expIO) ioCorrect++;
    ioTotal++;
  }
  console.log(`Epistemic io accuracy: ${ioCorrect}/${ioTotal} (${ioTotal ? Math.round(100 * ioCorrect / ioTotal) : 0}%)`);

  // meaning=FAIL count (should be 0 or near-0 now)
  const meaningFail = llmResults.filter(r => r.semanticResult?.meaning === 'FAIL').length;
  console.log(`meaning=FAIL: ${meaningFail}/${llmResults.length} (should be ~0)`);

  // stateConsulted
  const stateConsulted = llmResults.filter(r => r.stateConsulted === true).length;
  console.log(`State consulted: ${stateConsulted}/${llmResults.length}`);

  // Epistemic discrimination
  console.log(`\nEpistemic discrimination (io dimension):`);
  for (const level of ['WONDERED', 'SUSPECTED', 'KNEW', 'VAGUE_AFFECT', 'DOMAIN_SUSPICION']) {
    const levelResults = llmResults.filter(r => r.epistemicLevel === level);
    const levelIOCorrect = levelResults.filter(r => {
      const tc = testMatrix43.find(t => t.id === r.caseId);
      return tc && r.semanticResult?.infoOwnership === ioExpected(tc);
    }).length;
    console.log(`  ${level}: io-correct ${levelIOCorrect}/${levelResults.length}`);
  }

  // State sensitivity
  console.log(`\nState sensitivity (io dimension):`);
  for (const stateLabel of ['unknown', 'suspects', 'knows']) {
    const stateResults = llmResults.filter(r => {
      const tc = testMatrix43.find(t => t.id === r.caseId);
      if (!tc) return false;
      const entry = tc.state.informationOwnership?.entries[0];
      if (stateLabel === 'unknown') return entry?.unknown?.includes('Maya');
      if (stateLabel === 'suspects') return entry?.suspects?.includes('Maya');
      if (stateLabel === 'knows') return entry?.knows?.includes('Maya');
      return false;
    });
    const stateIOCorrect = stateResults.filter(r => {
      const tc = testMatrix43.find(t => t.id === r.caseId);
      return tc && r.semanticResult?.infoOwnership === ioExpected(tc);
    }).length;
    console.log(`  ${stateLabel}: io-correct ${stateIOCorrect}/${stateResults.length}`);
  }

  // False acceptance (REJECT-expected but ACCEPT)
  const falseAccept = llmResults.filter(r => r.expected === 'REJECT' && r.finalDecision === 'ACCEPT');
  console.log(`\nFalse acceptance (REJECT→ACCEPT): ${falseAccept.length}`);
  if (falseAccept.length) console.log(`  Cases: ${falseAccept.map(r => r.caseId).join(', ')}`);

  writeFileSync(join(LOG_DIR, `${label}-all.json`), JSON.stringify(results, null, 2));
  return results;
}

// ── Regression cases ────────────────────────────────────────────────────────
const regressionCases: TestCase43[] = [
  { id: 'R1', group: 'PAIR' as any, label: 'REG: KNOWS + supported knowledge', candidate: 'Maya knew Marcus had taken the money.', state: makeState('knows'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'state=KNOWS, knowledge supported', epistemicLevel: 'KNEW' as any, propositionSpecificity: 'SPECIFIC_FACT' as any },
  { id: 'R2', group: 'PAIR' as any, label: 'REG: SUSPECTS + knowledge overreach', candidate: 'Maya knew Marcus had taken the money.', state: makeState('suspects'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'SUSPECTS → KNOWS overreach', epistemicLevel: 'KNEW' as any, propositionSpecificity: 'SPECIFIC_FACT' as any },
  { id: 'R3', group: 'PAIR' as any, label: 'REG: UNKNOWN + knowledge claim', candidate: 'Maya knew Marcus had taken the money.', state: makeState('unknown'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'UNKNOWN → KNOWS leak', epistemicLevel: 'KNEW' as any, propositionSpecificity: 'SPECIFIC_FACT' as any },
  { id: 'R4', group: 'PAIR' as any, label: 'REG: hard unsupported number', candidate: 'Maya counted 127 ceiling tiles.', state: makeState('unknown'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'unsupported exact number', epistemicLevel: 'OBSERVATION' as any, propositionSpecificity: 'SPECIFIC_AMOUNT' as any },
  { id: 'R5', group: 'PAIR' as any, label: 'REG: hard canon contradiction', candidate: 'Arlo looked at the blue LEDs on the mixing board.', state: { character: { identity: 'Arlo Vance — blind sound engineer', goals: [], fears: [], beliefs: [], memories: [], emotionalState: '', perceptualHabits: [], voice: '', currentKnowledge: [] }, informationOwnership: { entries: [] }, canon: { facts: [{ content: 'Arlo is totally blind', classification: 'HARD_CANON' as const, source: 'ch1' }] }, deferredChecks: [], sceneId: 'reg', revisionId: 43 }, policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'canon contradiction — blind character using visual perception', epistemicLevel: 'OBSERVATION' as any, propositionSpecificity: 'SPECIFIC_FACT' as any },
  { id: 'R6', group: 'PAIR' as any, label: 'REG: entity property contradiction', candidate: 'Maya saw Marcus hide the ledger under his coat.', state: makeState('unknown'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'IO leak — Maya cannot know about the ledger/embezzlement', epistemicLevel: 'OBSERVATION' as any, propositionSpecificity: 'SPECIFIC_FACT' as any },
  { id: 'R7', group: 'PAIR' as any, label: 'REG: novel observation', candidate: 'Maya noticed Marcus was tapping his pen and avoiding eye contact.', state: makeState('unknown'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'observable behavior — no IO leak', epistemicLevel: 'OBSERVATION' as any, propositionSpecificity: 'VAGUE' as any },
  { id: 'R8', group: 'PAIR' as any, label: 'REG: supported claim + unsupported number (mixed)', candidate: 'Maya knew Marcus had taken the money and arrived at exactly 4:17 AM.', state: makeState('knows'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'mixed: supported claim + unsupported number (4:17)', epistemicLevel: 'KNEW' as any, propositionSpecificity: 'SPECIFIC_AMOUNT' as any },
];

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const mode = process.argv[2] || 'calibrated';
  const filter = process.argv.slice(3);

  if (mode === 'calibrated') {
    // Run all 23 calibrated cases
    await runMatrix('iteration43b-calibrated-fw', filter.length ? filter : undefined);
  } else if (mode === 'regression') {
    // Run regression cases
    const results: any[] = [];
    console.log(`\n=== Iteration 4.3B — Regression (${regressionCases.length} cases) ===\n`);
    for (const tc of regressionCases) {
      const startTime = Date.now();
      try {
        const systemPrompt = build43BSystemPrompt(tc.policy);
        const userPrompt = build43BUserPrompt(tc.candidate, tc.state, tc.policy);
        const { content, mode: llmMode, error, latencyMs, retryCount } = await fireworksLLM(systemPrompt, userPrompt);
        let lj: any;
        if (llmMode === 'EXECUTION_ERROR') {
          lj = { _executionMode: 'EXECUTION_ERROR', _error: error, overall: 'EXECUTION_ERROR' };
        } else {
          try { lj = { ...extractJSON(content), _executionMode: 'LLM' }; }
          catch (e: any) { lj = { _executionMode: 'EXECUTION_ERROR', _error: 'JSON: ' + e.message, overall: 'EXECUTION_ERROR' }; }
        }
        const fd = finalDecision(lj);
        const correct = fd.final === tc.expected;
        const latency = latencyMs ?? (Date.now() - startTime);
        console.log(`${tc.id} ${tc.label.slice(0,45)}: io=${lj.infoOwnership ?? '?'} faith=${lj.faithfulness ?? '?'} → ${fd.final} (exp ${tc.expected}) ${correct ? '✓' : '✗'} [${latency}ms]`);
        const result = {
          caseId: tc.id, provider: 'FIREWORKS', model: FIREWORKS_MODEL,
          validatorMode: lj._executionMode === 'LLM' ? 'LLM' : 'EXECUTION_ERROR',
          candidateText: tc.candidate, expected: tc.expected, correct,
          semanticResult: { overall: lj.overall, infoOwnership: lj.infoOwnership, faithfulness: lj.faithfulness, canon: lj.canon, meaning: lj.meaning, stateConsulted: lj.stateConsulted },
          finalDecision: fd.final, latencyMs: latency, error: lj._error || null,
          runLabel: 'iteration43b-regression-fw',
        };
        results.push(result);
        writeFileSync(join(LOG_DIR, `regression-${tc.id}.json`), JSON.stringify(result, null, 2));
      } catch (e: any) {
        console.error(`${tc.id}: ERROR ${e.message}`);
        results.push({ caseId: tc.id, error: e.message, runLabel: 'iteration43b-regression-fw' });
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    const llm = results.filter(r => r.validatorMode === 'LLM');
    const correct = llm.filter(r => r.correct).length;
    console.log(`\nRegression: ${correct}/${llm.length} correct`);
    writeFileSync(join(LOG_DIR, 'regression-all.json'), JSON.stringify(results, null, 2));
  }
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
