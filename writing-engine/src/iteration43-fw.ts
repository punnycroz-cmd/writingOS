// iteration43-fw.ts — Iteration 4.3-FW: Fireworks Provider Replication.
//
// Runs the EXACT SAME frozen 23-case Iteration 4.3 benchmark, but using
// the Fireworks AI API instead of the z-ai provider.
//
// Provider provenance is recorded on every case. Fireworks results are
// NEVER mixed with z-ai results. If Fireworks fails, EXECUTION_ERROR is
// recorded — no fallback to z-ai or any other provider.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// ── Reuse the same types, prompt builders, and test matrix from iteration43.ts ──
// We import them from the sibling file to avoid duplication.
import {
  buildStateAwareSystemPrompt, buildValidationUserPrompt,
  makeState, makeHandoff,
  testMatrix43, type TestCase43,
} from './iteration43-helpers.js';

const LOG_DIR = join(import.meta.dir, '..', 'logs43fw');
mkdirSync(LOG_DIR, { recursive: true });

// ── Fireworks configuration ─────────────────────────────────────────────────
const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY || '';
const FIREWORKS_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';
const FIREWORKS_MODEL = 'accounts/fireworks/models/qwen3p8-max';

// ── Fireworks LLM helper with bounded retry ─────────────────────────────────
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
          max_tokens: 4000,
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
        // Retry on 429, 500, 502, 503
        if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
          const wait = 10000 * Math.pow(2, attempt); // 10s, 20s, 40s
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

// ── JSON extraction ─────────────────────────────────────────────────────────
function extractJSON(text: string): any {
  try { return JSON.parse(text); } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) { try { return JSON.parse(text.slice(first, last + 1)); } catch {} }
  throw new Error('Could not parse JSON from LLM output: ' + text.slice(0, 200));
}

// ── The validator (uses Fireworks, same prompt as 4.3) ──────────────────────
const ORIGINAL = 'Marcus was at the desk.';

async function validateFireworks(
  candidate: string,
  state: any,
  policy: string,
  promptSuffix: string = '',
): Promise<any> {
  const systemPrompt = buildStateAwareSystemPrompt(policy as any) + promptSuffix;
  const handoff = makeHandoff(candidate, state, policy as any);
  const userPrompt = buildValidationUserPrompt({
    originalText: ORIGINAL,
    candidateText: candidate,
    documentState: state,
    handoffPayload: handoff,
    triageAction: 'HANDOFF_TO_LLM',
  });

  const { content, mode, error, latencyMs, retryCount } = await fireworksLLM(systemPrompt, userPrompt);

  if (mode === 'EXECUTION_ERROR') {
    return { _executionMode: 'EXECUTION_ERROR', _error: error, _latencyMs: latencyMs, _retryCount: retryCount, overall: 'EXECUTION_ERROR' };
  }

  try {
    const parsed = extractJSON(content);
    return { ...parsed, _executionMode: 'LLM', _latencyMs: latencyMs, _retryCount: retryCount };
  } catch (e: any) {
    return { _executionMode: 'EXECUTION_ERROR', _error: 'JSON parse: ' + e.message, _latencyMs: latencyMs, _retryCount: retryCount, _raw: content.slice(0, 300), overall: 'EXECUTION_ERROR' };
  }
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

// ── The calibrated prompt suffix (same 5 epistemic rules from 4.3) ─────────
const CALIBRATED_SUFFIX = `

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
If state=KNOWS and the state contains a specific number (e.g., "$40,000"), and the candidate asserts "knew ... $40,000", this is STATE_SUPPORTED. Do NOT FAIL faithfulness for the number — the [CC] provenance layer verifies it is in state. The number is not "invented" if it appears in the character's knowledge.`;

// ── Runner ──────────────────────────────────────────────────────────────────
async function runMatrix(promptSuffix: string, label: string, caseFilter?: string[]): Promise<any[]> {
  const results: any[] = [];
  const cases = caseFilter
    ? testMatrix43.filter(c => caseFilter.includes(c.id))
    : testMatrix43;

  console.log(`\n=== Iteration 4.3-FW — ${label} (${cases.length} cases, provider=FIREWORKS, model=${FIREWORKS_MODEL}) ===\n`);

  for (const tc of cases) {
    const startTime = Date.now();
    try {
      const lj = await validateFireworks(tc.candidate, tc.state, tc.policy, promptSuffix);
      const fd = finalDecision(lj);
      const correct = fd.final === tc.expected || (tc.expected === 'UNCLEAR' && (fd.final === 'ACCEPT' || fd.final === 'REJECT'));
      const latency = lj._latencyMs ?? (Date.now() - startTime);
      console.log(`${tc.id} [${tc.group}] ${tc.label.slice(0, 40)}: ${tc.epistemicLevel}/${tc.propositionSpecificity} | FW=${lj.overall} io=${lj.infoOwnership ?? '?'} → ${fd.final} (exp ${tc.expected}) ${correct ? '✓' : '✗'} [${latency}ms, ${lj._retryCount ?? 0} retries]`);
      const result = {
        caseId: tc.id,
        group: tc.group,
        label: tc.label,
        provider: 'FIREWORKS',
        model: FIREWORKS_MODEL,
        validatorMode: lj._executionMode === 'LLM' ? 'LLM' : 'EXECUTION_ERROR',
        executionStatus: lj._executionMode === 'LLM' ? 'SUCCESS' : 'EXECUTION_ERROR',
        candidateText: tc.candidate,
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
    // Small delay between cases to avoid rate limits
    await new Promise(r => setTimeout(r, 1000));
  }

  // Metrics
  const valid = results.filter(r => !r.error || r.validatorMode === 'LLM');
  const llmResults = results.filter(r => r.validatorMode === 'LLM');
  const execErrors = results.filter(r => r.validatorMode === 'EXECUTION_ERROR');
  const correct = llmResults.filter(r => r.correct).length;
  const aResults = llmResults.filter(r => r.expected === 'ACCEPT');
  const rResults = llmResults.filter(r => r.expected === 'REJECT');
  const falseReject = aResults.filter(r => r.finalDecision === 'REJECT');
  const falseAccept = rResults.filter(r => r.finalDecision === 'ACCEPT');
  const stateConsulted = llmResults.filter(r => r.stateConsulted === true).length;

  console.log(`\n=== ${label} Metrics (Fireworks) ===`);
  console.log(`Provider: FIREWORKS | Model: ${FIREWORKS_MODEL}`);
  console.log(`Total: ${results.length} | LLM executed: ${llmResults.length} | Exec errors: ${execErrors.length}`);
  console.log(`Correct (of LLM): ${correct}/${llmResults.length} (${llmResults.length ? Math.round(100 * correct / llmResults.length) : 0}%)`);
  console.log(`False rejection (ACCEPT→REJECT): ${falseReject.length}/${aResults.length}`);
  console.log(`False acceptance (REJECT→ACCEPT): ${falseAccept.length}/${rResults.length}`);
  console.log(`State consulted: ${stateConsulted}/${llmResults.length}`);

  // Epistemic discrimination
  console.log(`\nEpistemic discrimination:`);
  for (const level of ['WONDERED', 'SUSPECTED', 'KNEW', 'VAGUE_AFFECT', 'DOMAIN_SUSPICION']) {
    const levelResults = llmResults.filter(r => r.epistemicLevel === level);
    const levelCorrect = levelResults.filter(r => r.correct).length;
    console.log(`  ${level}: ${levelCorrect}/${levelResults.length} correct`);
  }

  writeFileSync(join(LOG_DIR, `${label}-all.json`), JSON.stringify(results, null, 2));
  return results;
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const mode = process.argv[2] || 'smoke';
  const filter = process.argv.slice(3);

  if (mode === 'smoke') {
    // Run 5 representative smoke test cases
    const smokeCases = ['A1', 'A4', 'B2', 'C4', 'E1'];
    console.log('=== SMOKE TEST: 5 representative cases ===');
    console.log('Provider: FIREWORKS');
    console.log(`Model: ${FIREWORKS_MODEL}`);
    console.log(`Cases: ${smokeCases.join(', ')}`);
    await runMatrix('', 'smoke', smokeCases);
  } else if (mode === 'baseline') {
    // Run all 23 cases with baseline (V4.2) prompt
    await runMatrix('', 'baseline-fw', filter.length ? filter : undefined);
  } else if (mode === 'calibrated') {
    // Run all 23 cases with calibrated (V4.2 + epistemic rules) prompt
    await runMatrix(CALIBRATED_SUFFIX, 'calibrated-fw', filter.length ? filter : undefined);
  } else if (mode === 'regression') {
    // Run regression cases from 4.1/4.2
    // These are additional cases not in the 23-case matrix
    console.log('=== Regression tests (Fireworks) ===');
    // We'll handle regression separately
  }
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
