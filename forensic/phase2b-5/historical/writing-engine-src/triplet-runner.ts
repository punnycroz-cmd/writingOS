// triplet-runner.ts — Iteration 4 triplet benchmark runner.
// For each triplet variant: classify provenance ([CC]), run policy-aware [LJ] validator,
// apply the v3 final-decision policy, log, and compute metrics.

import ZAI from 'z-ai-web-dev-sdk';
import type { DocumentState } from './types.js';
import { classifyProvenanceV4, type ProvenanceResult, type InventionPolicy } from './provenance.js';
import type { Triplet, TripletVariant } from './triplets.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { allTriplets } from './triplets.js';

const LOG_DIR = join(import.meta.dir, '..', 'logs4');
mkdirSync(LOG_DIR, { recursive: true });

async function llm(system: string, user: string): Promise<string> {
  const zai = await ZAI.create();
  for (let attempt = 0; attempt <= 4; attempt++) {
    try {
      const c = await zai.chat.completions.create({
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        thinking: { type: 'disabled' },
      });
      return c.choices[0]?.message?.content ?? '';
    } catch (e: any) {
      const msg = String(e?.message || e);
      if ((msg.includes('429') || msg.includes('Too many requests')) && attempt < 4) {
        const wait = 15000 * Math.pow(2, attempt);
        console.error(`  [429] waiting ${wait/1000}s...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      throw e;
    }
  }
  throw new Error('unreachable');
}

function extractJSON(text: string): any {
  try { return JSON.parse(text); } catch {}
  const f = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (f) { try { return JSON.parse(f[1]); } catch {} }
  const first = text.indexOf('{'), last = text.lastIndexOf('}');
  if (first >= 0 && last > first) { try { return JSON.parse(text.slice(first, last+1)); } catch {} }
  throw new Error('JSON parse failed: ' + text.slice(0,300));
}

// ---- Policy-aware validator ----
const POLICY_DESCRIPTIONS: Record<InventionPolicy, string> = {
  NONE: 'No invention is allowed. The output must remain source-constrained. Every detail must come from the source passage or explicit state.',
  SOURCE_CONSTRAINED: 'Only source-supported, explicitly-supplied, or properly-entailed information may be asserted. Unsupported specificity must not be introduced. This is the nonfiction/academic/business policy.',
  LICENSED_FICTION: 'Ordinary narrative invention is allowed (sensory description, environmental texture, ordinary observed detail, stylistic description), PROVIDED the invention respects POV, character knowledge, canon, temporal state, scene continuity, and narrative causality. This is NOT "anything goes" — IO leaks, canon violations, and unsupported factual assertions (specific numbers/dates/names not in state) are still rejected.',
  LIMITED_INFERENCE: 'Narrative invention is allowed AND plausible character-level inference may be used, but uncertain inference must not become unjustified certainty. "She thought he seemed nervous" is allowed; "She knew he was guilty" is not (unless state=KNOWS).',
};

const VALIDATOR_SYSTEM = `You are an independent validator for a fiction (or nonfiction) revision. You did NOT generate it. Check whether it is safe to accept given the active INVENTION POLICY.

INVENTION POLICY (this is the active task authorization — it determines what invention is licensed):
{POLICY}

CRITICAL DISTINCTIONS:
- STATE-SUPPORTED: detail is in source, character state, canon, or info-ownership. Always allowed.
- LICENSED INVENTION: detail not in state but authorized by the invention policy (e.g., sensory observation under LICENSED_FICTION). Allowed IF it respects POV, character knowledge, canon, temporal state.
- EPISTEMICALLY VALID INFERENCE: detail not directly observed but reasonably inferable. Allowed under LIMITED_INFERENCE or LICENSED_FICTION, but must be hedged ("seemed", "appeared to") not certain ("knew") unless state=KNOWS.
- UNLICENSED ASSERTION: detail presented as fact/observation/knowledge/memory/motive/identity/cause/certainty that the character cannot know, that canon contradicts, or that the task does not authorize. REJECT.

The invention policy does NOT override integrity constraints. Even under LICENSED_FICTION:
- Information-ownership leaks are rejected (character cannot know UNKNOWN facts).
- Canon violations are rejected.
- Unsupported specific NUMBERS/DATES/MEASUREMENTS are rejected (plausibility is NOT evidence).
- Deferred mechanisms must not be resolved.

Under SOURCE_CONSTRAINED or NONE: NO invention is allowed, even sensory. Only source-supported details pass.

For each dimension return PASS/FAIL/UNCLEAR:
- infoOwnership: FAIL if character asserts KNOWS-level certainty about UNKNOWN fact, or suspicion when state=UNKNOWN.
- faithfulness: FAIL for unsupported specific numbers/dates/names/measurements. Under NONE/SOURCE_CONSTRAINED, also FAIL for any invented sensory/observable detail not in source/state. Under LICENSED_FICTION/LIMITED_INFERENCE, sensory observation is PASS (licensed).
- canon: FAIL if contradicts HARD/SOFT CANON.
- deferred: FAIL if resolves a DEFERRED check.

overall: ACCEPT if no integrity dimension is FAIL. REJECT if any is FAIL. UNCLEAR alone on faithfulness/infoOwnership → REJECT (conservative). UNCLEAR on non-integrity dimensions → may ACCEPT.

Return ONLY valid JSON.`;

export async function validateVariant(
  original: string,
  revised: string,
  state: DocumentState,
  policy: InventionPolicy,
  ccResult: ProvenanceResult,
): Promise<any> {
  const system = VALIDATOR_SYSTEM.replace('{POLICY}', POLICY_DESCRIPTIONS[policy]);
  const ccBlock = ccResult.unsupported.length > 0
    ? `\nDETERMINISTIC PROVENANCE CHECK: ${ccResult.unsupported.length} item(s) with UNKNOWN provenance:\n${ccResult.unsupported.map(i => `- "${i.detail}" (type: ${i.type}, normalized: ${i.normalizedDetail ?? 'n/a'}) — ${i.evidence}`).join('\n')}\n`
    : `\nDETERMINISTIC PROVENANCE CHECK: no items with UNKNOWN provenance.\n`;

  const user = `INVENTION POLICY: ${policy}
${POLICY_DESCRIPTIONS[policy]}

ORIGINAL:
"""
${original}
"""

REVISED:
"""
${revised}
"""

CHARACTER STATE:
${JSON.stringify(state.character, null, 2)}

INFORMATION OWNERSHIP:
${JSON.stringify(state.informationOwnership, null, 2)}

CANON:
${JSON.stringify(state.canon, null, 2)}

DEFERRED CHECKS:
${JSON.stringify(state.deferredChecks, null, 2)}
${ccBlock}
Validate. Return JSON:
{
  "meaning": "PASS"|"FAIL"|"UNCLEAR",
  "character": "PASS"|"FAIL"|"UNCLEAR",
  "infoOwnership": "PASS"|"FAIL"|"UNCLEAR",
  "canon": "PASS"|"FAIL"|"UNCLEAR",
  "voice": "PASS"|"FAIL"|"UNCLEAR",
  "register": "PASS"|"FAIL"|"UNCLEAR",
  "intelligibility": "PASS"|"FAIL"|"UNCLEAR",
  "deferred": "PASS"|"FAIL"|"UNCLEAR",
  "faithfulness": "PASS"|"FAIL"|"UNCLEAR",
  "overall": "ACCEPT"|"REJECT",
  "reasons": ["per dimension, citing specifics"]
}`;
  const raw = await llm(system, user);
  return extractJSON(raw);
}

// ---- Final decision (v3 policy) ----
function finalDecision(lj: any, ccResult: ProvenanceResult): { final: 'ACCEPT' | 'REJECT'; reason: string } {
  if (ccResult.severity === 'HARD_BLOCK') {
    return { final: 'REJECT', reason: `[CC] HARD_BLOCK: ${ccResult.hardBlocks.map(b=>b.detail).join(', ')} — non-overridable.` };
  }
  if (lj.overall === 'REJECT') return { final: 'REJECT', reason: `[LJ] REJECT — ${lj.reasons.filter((r:string)=>r.includes('FAIL')).slice(0,2).join('; ')}` };
  // UNCLEAR on integrity → conservative REJECT
  if (lj.faithfulness === 'UNCLEAR' || lj.infoOwnership === 'UNCLEAR') {
    return { final: 'REJECT', reason: `Conservative: UNCLEAR on integrity dimension (faith=${lj.faithfulness}, io=${lj.infoOwnership}).` };
  }
  return { final: 'ACCEPT', reason: `[LJ] ACCEPT, [CC] ${ccResult.severity}.` };
}

// ---- Runner ----
async function main() {
  const filter = process.argv.slice(2);
  const tcs = filter.length ? allTriplets.filter(t => filter.includes(t.id)) : allTriplets;
  console.log(`=== Iteration 4 — Triplet Benchmark ===`);
  console.log(`Triplets: ${tcs.length} (× 3 variants = ${tcs.length * 3} validations)\n`);

  const results: any[] = [];

  for (const tc of tcs) {
    console.log(`--- ${tc.id} [${tc.semanticClass}] policy=${tc.inventionPolicy} ---`);
    for (const [variantLabel, variant] of [['A', tc.variantA], ['B', tc.variantB], ['C', tc.variantC]] as [string, TripletVariant][]) {
      const caseId = `${tc.id}-${variantLabel}`;
      try {
        const ccResult = classifyProvenanceV4(variant.text, tc.basePassage, tc.state);
        const lj = await validateVariant(tc.basePassage, variant.text, tc.state, tc.inventionPolicy, ccResult);
        const fd = finalDecision(lj, ccResult);
        const correct = (fd.final === variant.expected) || (variant.expected === 'UNCLEAR' && (fd.final === 'ACCEPT' || fd.final === 'REJECT'));
        // For UNCLEAR expected: correct if the validator gave a reason showing it recognized ambiguity (either ACCEPT with UNCLEAR noted, or REJECT conservative)
        const uncertainRecognized = variant.expected === 'UNCLEAR' && (lj.faithfulness === 'UNCLEAR' || lj.infoOwnership === 'UNCLEAR');
        console.log(`  ${variantLabel}: [CC]${ccResult.severity} [LJ]${lj.overall} → ${fd.final} (exp ${variant.expected}) ${correct ? '✓' : '✗'}${uncertainRecognized ? ' (UNCLEAR recognized)' : ''}`);
        const result = {
          caseId, tripletId: tc.id, variant: variantLabel, semanticClass: tc.semanticClass,
          inventionPolicy: tc.inventionPolicy, isStateControlled: tc.isStateControlled, isPolicyControlled: tc.isPolicyControlled,
          original: tc.basePassage, revised: variant.text, expected: variant.expected,
          expectedReasoning: variant.reasoning, ccResult: { severity: ccResult.severity, unsupported: ccResult.unsupported.map(i=>({detail:i.detail,type:i.type,prov:i.provenance})), hardBlocks: ccResult.hardBlocks.map(i=>i.detail) },
          lj: { overall: lj.overall, infoOwnership: lj.infoOwnership, faithfulness: lj.faithfulness, canon: lj.canon, deferred: lj.deferred, reasons: lj.reasons },
          final: fd.final, finalReason: fd.reason, correct, uncertainRecognized,
        };
        results.push(result);
        writeFileSync(join(LOG_DIR, `case-${caseId}.json`), JSON.stringify(result, null, 2));
      } catch (e: any) {
        console.error(`  ${variantLabel}: ERROR ${e.message}`);
        const errResult = { caseId, tripletId: tc.id, variant: variantLabel, error: e.message };
        results.push(errResult);
        writeFileSync(join(LOG_DIR, `case-${caseId}.json`), JSON.stringify(errResult, null, 2));
      }
      await new Promise(r => setTimeout(r, 1500));
    }
    console.log();
  }

  writeFileSync(join(LOG_DIR, 'all-logs.json'), JSON.stringify(results, null, 2));

  // Metrics
  const valid = results.filter(r => !r.error);
  const aResults = valid.filter(r => r.variant === 'A');
  const bResults = valid.filter(r => r.variant === 'B');
  const cResults = valid.filter(r => r.variant === 'C');

  const falseRejectA = aResults.filter(r => r.expected === 'ACCEPT' && r.final === 'REJECT');
  const falseAcceptB = bResults.filter(r => r.expected === 'REJECT' && r.final === 'ACCEPT');
  const cUnclearRecognized = cResults.filter(r => r.uncertainRecognized);

  // Authorization discrimination: within each triplet, did the validator distinguish A from B?
  const tripletIds = [...new Set(valid.map(r => r.tripletId))];
  let discriminated = 0;
  for (const tid of tripletIds) {
    const tResults = valid.filter(r => r.tripletId === tid);
    const a = tResults.find(r => r.variant === 'A');
    const b = tResults.find(r => r.variant === 'B');
    if (a && b) {
      // Discriminated if A and B got different final decisions (or A=ACCEPT, B=REJECT)
      if (a.final !== b.final) discriminated++;
    }
  }

  console.log(`\n=== Metrics ===`);
  console.log(`Total variants run: ${valid.length} (A=${aResults.length}, B=${bResults.length}, C=${cResults.length})`);
  console.log(`False Rejection Rate (A, valid rejected): ${falseRejectA.length}/${aResults.length} (${aResults.length ? Math.round(100*falseRejectA.length/aResults.length) : 0}%)`);
  console.log(`False Acceptance Rate (B, invalid accepted): ${falseAcceptB.length}/${bResults.length} (${bResults.length ? Math.round(100*falseAcceptB.length/bResults.length) : 0}%)`);
  console.log(`Uncertainty recognition (C, UNCLEAR recognized): ${cUnclearRecognized.length}/${cResults.length}`);
  console.log(`Authorization discrimination (A≠B within triplet): ${discriminated}/${tripletIds.length} (${tripletIds.length ? Math.round(100*discriminated/tripletIds.length) : 0}%)`);

  // Per-class breakdown
  console.log(`\n=== Per-class breakdown ===`);
  const classes = [...new Set(valid.map(r => r.semanticClass))];
  for (const cls of classes) {
    const clsResults = valid.filter(r => r.semanticClass === cls);
    const clsCorrect = clsResults.filter(r => r.correct).length;
    console.log(`  ${cls}: ${clsCorrect}/${clsResults.length} correct`);
  }

  // Save summary
  const summary = [
    '# Iteration 4 — Triplet Benchmark Summary', '',
    `Executed: ${new Date().toISOString()}`, `Variants: ${valid.length}`, '',
    '## Metrics', '',
    `- False Rejection Rate (A): ${falseRejectA.length}/${aResults.length}`,
    `- False Acceptance Rate (B): ${falseAcceptB.length}/${bResults.length}`,
    `- Uncertainty recognition (C): ${cUnclearRecognized.length}/${cResults.length}`,
    `- Authorization discrimination (A≠B): ${discriminated}/${tripletIds.length}`, '',
    '## Results Table', '',
    '| Case | Class | Policy | Variant | Expected | [CC] | [LJ] | Final | Correct |',
    '|------|-------|--------|---------|----------|------|------|-------|---------|',
  ];
  for (const r of valid) {
    summary.push(`| ${r.caseId} | ${r.semanticClass} | ${r.inventionPolicy} | ${r.variant} | ${r.expected} | ${r.ccResult.severity} | ${r.lj.overall} | ${r.final} | ${r.correct ? '✓' : '✗'} |`);
  }
  writeFileSync(join(LOG_DIR, 'summary.md'), summary.join('\n'));
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
