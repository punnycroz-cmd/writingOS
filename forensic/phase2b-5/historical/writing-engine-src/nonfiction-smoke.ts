// nonfiction-smoke.ts — One small nonfiction smoke test under SOURCE_CONSTRAINED.
// Purpose: determine whether the core validation architecture can operate outside fiction.
// NOT a validation of the general-purpose Writing OS.

import ZAI from 'z-ai-web-dev-sdk';
import { classifyProvenanceV4 } from './provenance.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

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
        await new Promise(r => setTimeout(r, 15000 * Math.pow(2, attempt)));
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

// ---- A small academic passage with a SourceFactLedger ----
const SOURCE = `A 2023 study by researchers at Johns Hopkins found that ICU nurses who worked 12-hour shifts had a 23% higher rate of medication errors compared to those working 8-hour shifts. The study, published in the Journal of Patient Safety, surveyed 1,847 nurses across 14 hospitals.`;

const sourceFactLedger = {
  namedEntities: ['Johns Hopkins', 'Journal of Patient Safety', 'ICU'],
  numbers: ['2023', '12', '23', '8', '1,847', '14'],
  dates: ['2023'],
  citations: ['Journal of Patient Safety'],
};

const nonfictionState = {
  character: { identity: 'Academic writer', goals: ['Report study findings accurately'], fears: ['Misrepresenting data'], beliefs: ['Citation integrity is paramount'], memories: [], emotionalState: '', perceptualHabits: [], voice: 'Formal, precise, hedged', currentKnowledge: ['The 2023 Johns Hopkins study found 23% higher error rate', '1,847 nurses surveyed', '14 hospitals'] },
  informationOwnership: { entries: [] },
  canon: { facts: [
    { content: 'The study was published in 2023', classification: 'HARD_CANON', source: 'source text' },
    { content: 'The study surveyed 1,847 nurses', classification: 'HARD_CANON', source: 'source text' },
    { content: 'The error rate was 23% higher for 12-hour shifts', classification: 'HARD_CANON', source: 'source text' },
  ]},
  deferredChecks: [],
  sceneId: 'nonfiction-1',
  revisionId: 1,
};

// Valid revision: rephrases using only source-supported facts
const validRevision = `Research conducted at Johns Hopkins in 2023 demonstrated that intensive care unit nurses working 12-hour shifts experienced a 23% greater likelihood of medication errors than their counterparts on 8-hour schedules. The investigation, which appeared in the Journal of Patient Safety, drew on responses from 1,847 nurses at 14 medical centers.`;

// Invalid revision: introduces unsupported specifics
const invalidRevision = `A landmark 2023 Johns Hopkins study revealed that ICU nurses working 12-hour shifts had a 23% higher rate of medication errors. The study, led by Dr. Evelyn Marsh and published in the Journal of Patient Safety on March 15, 2023, surveyed 1,847 nurses across 14 hospitals and concluded that shift length was the primary cause of burnout, costing an estimated $2.3 billion annually in adverse events.`;

const VALIDATOR_SYSTEM = `You are an independent validator for an academic/nonfiction revision. The invention policy is SOURCE_CONSTRAINED: only source-supported, explicitly-supplied, or properly-entailed information may be asserted. Unsupported specificity must not be introduced.

Check:
- faithfulness: FAIL for any number, date, name, or claim NOT in the source passage or state. Plausibility is NOT evidence.
- infoOwnership: PASS (no character knowledge constraints in this register).
- canon: FAIL if it contradicts source-established facts.
- meaning: PASS if the core findings are preserved.

overall: ACCEPT only if no integrity dimension is FAIL. Return ONLY valid JSON.`;

async function validate(original: string, revised: string, ccResult: any) {
  const ccBlock = ccResult.unsupported.length > 0
    ? `\n[CC] items with UNKNOWN provenance:\n${ccResult.unsupported.map((i:any)=>`- "${i.detail}" (${i.type}) — ${i.evidence}`).join('\n')}\n`
    : `\n[CC] no items with UNKNOWN provenance.\n`;
  const user = `SOURCE TEXT:\n"""\n${original}\n"""\n\nREVISED:\n"""\n${revised}\n"""\n\nSOURCE FACT LEDGER:\n${JSON.stringify(sourceFactLedger, null, 2)}\n\nSTATE:\n${JSON.stringify(nonfictionState, null, 2)}\n${ccBlock}\nValidate. Return JSON with meaning, character, infoOwnership, canon, voice, register, intelligibility, deferred, faithfulness, overall, reasons.`;
  const raw = await llm(VALIDATOR_SYSTEM, user);
  return extractJSON(raw);
}

async function main() {
  console.log('=== Nonfiction Smoke Test (SOURCE_CONSTRAINED) ===\n');

  // Valid revision
  console.log('--- Valid revision (should ACCEPT) ---');
  const ccValid = classifyProvenanceV4(validRevision, SOURCE, nonfictionState);
  console.log(`[CC] ${ccValid.severity}, unsupported: ${ccValid.unsupported.length}`);
  const ljValid = await validate(SOURCE, validRevision, ccValid);
  console.log(`[LJ] overall=${ljValid.overall}, faith=${ljValid.faithfulness}`);
  console.log(`Expected: ACCEPT | Got: ${ljValid.overall} ${ljValid.overall === 'ACCEPT' ? '✓' : '✗'}`);

  // Invalid revision
  console.log('\n--- Invalid revision (should REJECT) ---');
  const ccInvalid = classifyProvenanceV4(invalidRevision, SOURCE, nonfictionState);
  console.log(`[CC] ${ccInvalid.severity}, unsupported: ${ccInvalid.unsupported.length} — ${ccInvalid.unsupported.map((i:any)=>i.detail).join(', ')}`);
  const ljInvalid = await validate(SOURCE, invalidRevision, ccInvalid);
  console.log(`[LJ] overall=${ljInvalid.overall}, faith=${ljInvalid.faithfulness}`);
  console.log(`Expected: REJECT | Got: ${ljInvalid.overall} ${ljInvalid.overall === 'REJECT' ? '✓' : '✗'}`);

  const result = {
    source: SOURCE,
    sourceFactLedger,
    validRevision, invalidRevision,
    valid: { cc: { severity: ccValid.severity, unsupported: ccValid.unsupported.map((i:any)=>({detail:i.detail,type:i.type})) }, lj: { overall: ljValid.overall, faithfulness: ljValid.faithfulness, reasons: ljValid.reasons }, expected: 'ACCEPT', got: ljValid.overall, correct: ljValid.overall === 'ACCEPT' },
    invalid: { cc: { severity: ccInvalid.severity, unsupported: ccInvalid.unsupported.map((i:any)=>({detail:i.detail,type:i.type})) }, lj: { overall: ljInvalid.overall, faithfulness: ljInvalid.faithfulness, reasons: ljInvalid.reasons }, expected: 'REJECT', got: ljInvalid.overall, correct: ljInvalid.overall === 'REJECT' },
  };
  writeFileSync(join(LOG_DIR, 'nonfiction-smoke.json'), JSON.stringify(result, null, 2));
  console.log('\nLog: logs4/nonfiction-smoke.json');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
