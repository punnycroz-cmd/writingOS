// iteration41.ts — Iteration 4.1: V4.1 state-aware validator + claim-state resolver + state matrix + paraphrase test.
// The frozen Iteration 4 benchmark is reused unchanged. Only the validator changes.

import ZAI from 'z-ai-web-dev-sdk';
import type { DocumentState } from './types.js';
import { classifyProvenanceV4, type ProvenanceResult } from './provenance.js';
import { allTriplets, type Triplet, type TripletVariant } from './triplets.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const LOG_DIR = join(import.meta.dir, '..', 'logs41');
mkdirSync(LOG_DIR, { recursive: true });

// ---------- LLM helper (with retry + execution-mode logging) ----------
async function llm(system: string, user: string): Promise<{ content: string; mode: 'LLM' | 'EXECUTION_ERROR'; error?: string }> {
  const zai = await ZAI.create();
  for (let attempt = 0; attempt <= 4; attempt++) {
    try {
      const c = await zai.chat.completions.create({
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        thinking: { type: 'disabled' },
      });
      return { content: c.choices[0]?.message?.content ?? '', mode: 'LLM' };
    } catch (e: any) {
      const msg = String(e?.message || e);
      if ((msg.includes('429') || msg.includes('Too many requests')) && attempt < 4) {
        await new Promise(r => setTimeout(r, 15000 * Math.pow(2, attempt)));
        continue;
      }
      return { content: '', mode: 'EXECUTION_ERROR', error: msg };
    }
  }
  return { content: '', mode: 'EXECUTION_ERROR', error: 'max retries exceeded' };
}

function extractJSON(text: string): any {
  try { return JSON.parse(text); } catch {}
  const f = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (f) { try { return JSON.parse(f[1]); } catch {} }
  const first = text.indexOf('{'), last = text.lastIndexOf('}');
  if (first >= 0 && last > first) { try { return JSON.parse(text.slice(first, last+1)); } catch {} }
  throw new Error('JSON parse failed: ' + text.slice(0,300));
}

// ============================================================
// CLAIM-STATE RESOLUTION PROTOTYPE (minimal, deterministic)
// ============================================================
// Extracts a structured epistemic claim from the candidate text and resolves
// it against InformationOwnership. Returns STATE_SUPPORTED / STATE_CONTRADICTION /
// INSUFFICIENT_STATE / NO_CLAIM_DETECTED.

export type EpistemicLevel = 'OBSERVATION' | 'INTERPRETATION' | 'SUSPICION' | 'BELIEF' | 'KNOWLEDGE' | 'CERTAINTY' | 'NONE';
export type ClaimResolution = 'STATE_SUPPORTED' | 'STATE_CONTRADICTION' | 'INSUFFICIENT_STATE' | 'NO_CLAIM_DETECTED';

export interface StructuredClaim {
  subject: string;            // "Maya"
  epistemicLevel: EpistemicLevel;
  proposition: string;        // "Marcus had embezzled $40,000"
  rawPhrase: string;          // "Maya knew Marcus had embezzled $40,000"
  resolution: ClaimResolution;
  resolutionEvidence: string;
}

const EPISTEMIC_MARKERS: { level: EpistemicLevel; pattern: RegExp }[] = [
  { level: 'CERTAINTY', pattern: /\b(absolutely certain|certain that|definitely|without a doubt)\b/gi },
  { level: 'KNOWLEDGE', pattern: /\b(knew|knows|know that|known that|remembered that|realized that|understood that|could tell that|figured out that|deduced that)\b/gi },
  { level: 'BELIEF', pattern: /\b(believed|believes|convinced that|sure that)\b/gi },
  { level: 'SUSPICION', pattern: /\b(suspected|suspects|suspected that|had a feeling|sensed that)\b/gi },
  { level: 'INTERPRETATION', pattern: /\b(seemed|appeared to|wondered if|wondered whether|thought maybe|perhaps|looked as if)\b/gi },
  { level: 'OBSERVATION', pattern: /\b(noticed|saw|observed|watched|heard|could see|could hear|could smell)\b/gi },
];

export function extractClaims(text: string, state: DocumentState): StructuredClaim[] {
  const claims: StructuredClaim[] = [];
  const charName = state.character.identity.split('—')[0].trim().split(' ')[0];
  const charNameLower = charName.toLowerCase();

  for (const { level, pattern } of EPISTEMIC_MARKERS) {
    let m;
    pattern.lastIndex = 0;
    while ((m = pattern.exec(text)) !== null) {
      // Capture the phrase: from the marker to the next sentence boundary
      const start = m.index;
      let end = text.length;
      const sentenceEnd = text.slice(m.index).search(/[.,;!]/);
      if (sentenceEnd > 0) end = m.index + sentenceEnd;
      const rawPhrase = text.slice(start, end).trim();
      // Check the subject is the character (heuristic: charName within 30 chars before marker, or marker follows charName)
      const before = text.slice(Math.max(0, start - 40), start).toLowerCase();
      const phraseLower = rawPhrase.toLowerCase();
      const subjectIsChar = before.includes(charNameLower) || phraseLower.startsWith(charNameLower) || phraseLower.includes(charNameLower + ' ');
      if (!subjectIsChar) continue;

      // Extract the proposition (everything after the marker)
      const propMatch = rawPhrase.match(new RegExp(m[0] + '\\s*(.+)', 'i'));
      const proposition = propMatch ? propMatch[1].trim() : rawPhrase;

      // Resolve against InformationOwnership
      const resolution = resolveClaim(charName, level, proposition, state);
      claims.push({
        subject: charName,
        epistemicLevel: level,
        proposition,
        rawPhrase,
        resolution: resolution.result,
        resolutionEvidence: resolution.evidence,
      });
    }
  }
  return claims;
}

function resolveClaim(charName: string, level: EpistemicLevel, proposition: string, state: DocumentState): { result: ClaimResolution; evidence: string } {
  const charNameLower = charName.toLowerCase();
  const propLower = proposition.toLowerCase();
  const propWords = propLower.split(/\s+/).filter(w => w.length > 3);

  for (const entry of state.informationOwnership.entries) {
    const factLower = entry.fact.toLowerCase();
    const factWords = factLower.split(/\s+/).filter(w => w.length > 3);
    const overlap = propWords.filter(w => factWords.includes(w)).length;
    if (overlap >= 2) {
      const knows = entry.knows.map(k => k.toLowerCase());
      const suspects = entry.suspects.map(k => k.toLowerCase());
      const unknown = entry.unknown.map(k => k.toLowerCase());
      if (knows.includes(charNameLower)) {
        // Character KNOWS the fact. Knowledge/certainty is supported; suspicion/interpretation also fine.
        if (level === 'KNOWLEDGE' || level === 'CERTAINTY' || level === 'BELIEF' || level === 'SUSPICION' || level === 'INTERPRETATION' || level === 'OBSERVATION') {
          return { result: 'STATE_SUPPORTED', evidence: `character KNOWS: "${entry.fact}" — ${level} is supported` };
        }
      } else if (suspects.includes(charNameLower)) {
        // Character SUSPECTS. Suspicion/interpretation/observation supported; knowledge/certainty is a contradiction.
        if (level === 'SUSPICION' || level === 'INTERPRETATION' || level === 'OBSERVATION') {
          return { result: 'STATE_SUPPORTED', evidence: `character SUSPECTS: "${entry.fact}" — ${level} is supported` };
        } else if (level === 'KNOWLEDGE' || level === 'CERTAINTY' || level === 'BELIEF') {
          return { result: 'STATE_CONTRADICTION', evidence: `character only SUSPECTS: "${entry.fact}" — ${level} is unsupported (suspicion upgraded)` };
        }
      } else if (unknown.includes(charNameLower)) {
        // Character does NOT know. Any knowledge/certainty/belief/suspicion about this fact is a contradiction.
        if (level === 'KNOWLEDGE' || level === 'CERTAINTY' || level === 'BELIEF' || level === 'SUSPICION') {
          return { result: 'STATE_CONTRADICTION', evidence: `character does NOT KNOW: "${entry.fact}" — ${level} is a leak` };
        } else if (level === 'INTERPRETATION' || level === 'OBSERVATION') {
          // Observation/interpretation of evidence is allowed even if the cause is unknown
          return { result: 'INSUFFICIENT_STATE', evidence: `character does not know: "${entry.fact}" — but ${level} of evidence may be licensed` };
        }
      }
    }
  }
  return { result: 'NO_CLAIM_DETECTED', evidence: 'no matching info-ownership entry for this proposition' };
}

// ============================================================
// V4.1 STATE-AWARE VALIDATOR
// ============================================================
const POLICY_DESCRIPTIONS: Record<string, string> = {
  NONE: 'No invention allowed. Every detail must come from source or explicit state.',
  SOURCE_CONSTRAINED: 'Only source-supported, explicitly-supplied, or properly-entailed info. Unsupported specificity rejected.',
  LICENSED_FICTION: 'Ordinary narrative invention allowed (sensory, environmental, observed detail), respecting POV, character knowledge, canon, temporal state.',
  LIMITED_INFERENCE: 'Licensed fiction + plausible character-level inference, but uncertain inference must not become certainty.',
};

const V41_SYSTEM = `You are an independent state-aware validator (V4.1). You did NOT generate the revision. Check whether it is safe to accept given the active INVENTION POLICY and the structured state.

INVENTION POLICY:
{POLICY}

=== FIVE STATE-AWARE RULES ===

RULE 1 — CONSULT STATE BEFORE INTEGRITY FAILURE.
Before assigning infoOwnership = FAIL, you MUST inspect:
- InformationOwnership (knows / suspects / misunderstands / unknown lists)
- CharacterState (currentKnowledge, perceptualHabits, memories)
- Canon
- DeferredChecks
Do NOT reject a knowledge claim merely because words like "knew", "understood", "realized", "remembered" appear. Determine whether the structured state actually authorizes that knowledge.

RULE 2 — DISTINGUISH EPISTEMIC LEVELS.
Explicitly distinguish:
- OBSERVATION: "She noticed his hands shaking." (directly perceived — always allowed if character can perceive)
- INTERPRETATION: "She wondered whether he was nervous." (uncertain inference — allowed under LICENSED_FICTION/LIMITED_INFERENCE)
- SUSPICION: "She suspected he was hiding something." (requires state=SUSPECTS or evidence)
- BELIEF: "She believed he was guilty." (requires state=KNOWS or strong evidence)
- KNOWLEDGE: "She knew he had stolen the money." (requires state=KNOWS)
- CERTAINTY: "She was certain he had stolen the money." (requires state=KNOWS)
Do NOT treat all six as equivalent.

RULE 3 — VAGUE UNCERTAINTY IS NOT AUTOMATICALLY A LEAK.
Statements like:
- "something felt wrong"
- "she wondered if something was wrong"
- "he seemed uneasy"
- "something about him bothered her"
- "the numbers did not match what she had seen last month"
should NOT automatically become infoOwnership = FAIL. They only fail if they assert a specific unauthorized fact. Vague unease and wondering are licensed under LICENSED_FICTION and LIMITED_INFERENCE.

RULE 4 — STATE-SUPPORTED CLAIMS MUST BE ACCEPTED.
If InformationOwnership says the character KNOWS fact X, and the candidate asserts "character knew X", this is STATE_SUPPORTED — infoOwnership = PASS.
If state = SUSPECTS and candidate says "character suspected X" — PASS.
If state = SUSPECTS and candidate says "character knew X" — FAIL (suspicion upgraded to certainty).
If state = UNKNOWN and candidate says "character knew X" — FAIL (leak).
If state = UNKNOWN and candidate says "character wondered if something was wrong" — PASS (vague uncertainty, not a specific claim).

RULE 5 — GENUINE AMBIGUITY MAY BE UNCLEAR.
If the observation/inference boundary is genuinely ambiguous (two reasonable readings), return UNCLEAR for that dimension. Do not force every uncertain case into PASS or FAIL.
Note: under the current integrity policy, UNCLEAR on faithfulness or infoOwnership maps to REJECT (conservative). But the underlying semantic assessment must remain UNCLEAR, not forced to FAIL.

=== INTEGRITY CONSTRAINTS (unchanged) ===
- infoOwnership: FAIL only if the character asserts KNOWS-level certainty about an UNKNOWN fact, or SUSPICION about a specific fact when state=UNKNOWN (with no evidence). Observable evidence and vague uncertainty are ALLOWED.
- faithfulness: FAIL for unsupported specific numbers/dates/names/measurements. Under NONE/SOURCE_CONSTRAINED, also FAIL for invented sensory detail not in source/state. Under LICENSED_FICTION/LIMITED_INFERENCE, sensory observation and paraphrase are PASS.
- canon: FAIL if contradicts HARD/SOFT CANON.
- deferred: FAIL if resolves a DEFERRED check.

=== CLAIM-STATE RESOLUTION SIGNAL ===
You will receive a deterministic claim-state resolution for each epistemic claim in the candidate. Treat STATE_SUPPORTED as strong evidence for PASS; STATE_CONTRADICTION as strong evidence for FAIL; INSUFFICIENT_STATE as a signal to check whether the policy licenses the epistemic level; NO_CLAIM_DETECTED as neutral.

overall: ACCEPT if no integrity dimension is FAIL. REJECT if any is FAIL. UNCLEAR on faithfulness/infoOwnership → REJECT (conservative) but record the UNCLEAR.

Return ONLY valid JSON.`;

export async function validateV41(
  original: string,
  revised: string,
  state: DocumentState,
  policy: string,
  ccResult: ProvenanceResult,
  claims: StructuredClaim[],
): Promise<any> {
  const system = V41_SYSTEM.replace('{POLICY}', POLICY_DESCRIPTIONS[policy] || '');
  const ccBlock = ccResult.unsupported.length > 0
    ? `\n[CC] items with UNKNOWN provenance:\n${ccResult.unsupported.map(i => `- "${i.detail}" (${i.type}) — ${i.evidence}`).join('\n')}\n`
    : `\n[CC] no items with UNKNOWN provenance.\n`;
  const claimBlock = claims.length > 0
    ? `\nCLAIM-STATE RESOLUTION:\n${claims.map(c => `- "${c.rawPhrase}" | level=${c.epistemicLevel} | prop="${c.proposition}" | resolution=${c.resolution} | ${c.resolutionEvidence}`).join('\n')}\n`
    : `\nCLAIM-STATE RESOLUTION: no epistemic claims detected.\n`;

  const user = `INVENTION POLICY: ${policy}

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
${ccBlock}${claimBlock}
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
  "reasons": ["per dimension"],
  "epistemicLevelAssessed": "OBSERVATION"|"INTERPRETATION"|"SUSPICION"|"BELIEF"|"KNOWLEDGE"|"CERTAINTY"|"MIXED"|"NONE",
  "stateConsulted": true|false
}`;
  const { content, mode, error } = await llm(system, user);
  if (mode === 'EXECUTION_ERROR') {
    return { _executionMode: 'EXECUTION_ERROR', _error: error, overall: 'EXECUTION_ERROR' };
  }
  try {
    const result = extractJSON(content);
    return { ...result, _executionMode: 'LLM' };
  } catch (e: any) {
    return { _executionMode: 'EXECUTION_ERROR', _error: 'JSON parse: ' + e.message, _raw: content.slice(0, 300), overall: 'EXECUTION_ERROR' };
  }
}

// ============================================================
// FINAL DECISION (v3 policy, unchanged)
// ============================================================
function finalDecision(lj: any, ccResult: ProvenanceResult): { final: 'ACCEPT' | 'REJECT'; reason: string } {
  if (lj._executionMode === 'EXECUTION_ERROR') return { final: 'REJECT', reason: 'EXECUTION_ERROR' };
  if (ccResult.severity === 'HARD_BLOCK') {
    return { final: 'REJECT', reason: `[CC] HARD_BLOCK: ${ccResult.hardBlocks.map(b=>b.detail).join(', ')}` };
  }
  if (lj.overall === 'REJECT') return { final: 'REJECT', reason: `[LJ] REJECT` };
  if (lj.faithfulness === 'UNCLEAR' || lj.infoOwnership === 'UNCLEAR') {
    return { final: 'REJECT', reason: `Conservative: UNCLEAR on integrity (faith=${lj.faithfulness}, io=${lj.infoOwnership})` };
  }
  return { final: 'ACCEPT', reason: `[LJ] ACCEPT` };
}

// ============================================================
// RUNNER: frozen benchmark through V4.1
// ============================================================
async function runFrozenBenchmark() {
  console.log('=== V4.1 on Frozen Iteration 4 Benchmark (60 variants) ===\n');
  const results: any[] = [];
  const filter = process.argv.slice(2);
  const tcs = filter.length ? allTriplets.filter(t => filter.includes(t.id)) : allTriplets;

  for (const tc of tcs) {
    for (const [vLabel, variant] of [['A', tc.variantA], ['B', tc.variantB], ['C', tc.variantC]] as [string, TripletVariant][]) {
      const caseId = `${tc.id}-${vLabel}`;
      try {
        const ccResult = classifyProvenanceV4(variant.text, tc.basePassage, tc.state);
        const claims = extractClaims(variant.text, tc.state);
        const lj = await validateV41(tc.basePassage, variant.text, tc.state, tc.inventionPolicy, ccResult, claims);
        const fd = finalDecision(lj, ccResult);
        const correct = (fd.final === variant.expected) || (variant.expected === 'UNCLEAR' && (fd.final === 'ACCEPT' || fd.final === 'REJECT'));
        console.log(`${caseId}: [CC]${ccResult.severity} claims=${claims.length}(${claims.map(c=>c.resolution).join(',')||'none'}) [LJ]${lj.overall} → ${fd.final} (exp ${variant.expected}) ${correct ? '✓' : '✗'}`);
        const result = {
          caseId, tripletId: tc.id, variant: vLabel, semanticClass: tc.semanticClass,
          inventionPolicy: tc.inventionPolicy, validatorVersion: 'V4.1',
          validatorMode: lj._executionMode || 'LLM', fallbackUsed: false, executionError: lj._error || null,
          original: tc.basePassage, revised: variant.text, expected: variant.expected,
          ccResult: { severity: ccResult.severity, unsupported: ccResult.unsupported.map(i=>({detail:i.detail,type:i.type})) },
          claims: claims.map(c => ({ level: c.epistemicLevel, prop: c.proposition, resolution: c.resolution, evidence: c.resolutionEvidence })),
          lj: { overall: lj.overall, infoOwnership: lj.infoOwnership, faithfulness: lj.faithfulness, canon: lj.canon, deferred: lj.deferred, reasons: lj.reasons, epistemicLevelAssessed: lj.epistemicLevelAssessed, stateConsulted: lj.stateConsulted },
          final: fd.final, finalReason: fd.reason, correct,
        };
        results.push(result);
        writeFileSync(join(LOG_DIR, `frozen-${caseId}.json`), JSON.stringify(result, null, 2));
      } catch (e: any) {
        console.error(`${caseId}: ERROR ${e.message}`);
        results.push({ caseId, validatorVersion: 'V4.1', validatorMode: 'EXECUTION_ERROR', error: e.message });
        writeFileSync(join(LOG_DIR, `frozen-${caseId}.json`), JSON.stringify({ caseId, error: e.message }, null, 2));
      }
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  return results;
}

// ============================================================
// CONTROLLED STATE MATRIX
// ============================================================
const stateMatrixCases = [
  { id: 'SM-1', state: 'unknown' as const, candidate: 'Maya knew Marcus had embezzled $40,000 from the clinic.', expected: 'REJECT' as const, reasoning: 'state=UNKNOWN, certainty → leak' },
  { id: 'SM-2', state: 'suspects' as const, candidate: 'Maya knew Marcus had embezzled $40,000 from the clinic.', expected: 'REJECT' as const, reasoning: 'state=SUSPECTS, certainty → suspicion upgraded (still leak)' },
  { id: 'SM-3', state: 'knows' as const, candidate: 'Maya knew Marcus had embezzled $40,000 from the clinic.', expected: 'ACCEPT' as const, reasoning: 'state=KNOWS, certainty → supported' },
  { id: 'SM-4', state: 'knows' as const, candidate: 'Maya suspected Marcus might have taken some money.', expected: 'ACCEPT' as const, reasoning: 'state=KNOWS, downgrading to suspicion is safe' },
  { id: 'SM-5', state: 'unknown' as const, candidate: 'Maya suspected Marcus might have taken some money.', expected: 'REJECT' as const, reasoning: 'state=UNKNOWN, suspicion of specific fact without evidence → leak' },
  { id: 'SM-6', state: 'unknown' as const, candidate: 'Maya wondered if something was wrong.', expected: 'ACCEPT' as const, reasoning: 'state=UNKNOWN, vague wondering (no specific fact) → licensed' },
  { id: 'SM-7', state: 'suspects' as const, candidate: 'Maya suspected something was wrong with the finances.', expected: 'ACCEPT' as const, reasoning: 'state=SUSPECTS, suspicion matches state' },
  { id: 'SM-8', state: 'unknown' as const, candidate: 'Maya noticed Marcus was tapping his pen.', expected: 'ACCEPT' as const, reasoning: 'observation — always allowed' },
];

function makeStateMatrixState(mayaKnows: 'unknown' | 'suspects' | 'knows'): DocumentState {
  return {
    character: { identity: 'Maya Okafor — ICU nurse', goals: [], fears: [], beliefs: [], memories: [], emotionalState: '', perceptualHabits: [], voice: '', currentKnowledge: mayaKnows === 'knows' ? ['Marcus embezzled $40,000'] : mayaKnows === 'suspects' ? ['She saw a discrepancy'] : [] },
    informationOwnership: { entries: [{ fact: 'Marcus embezzled $40,000 from the clinic', knows: mayaKnows === 'knows' ? ['Marcus', 'Maya'] : ['Marcus'], suspects: mayaKnows === 'suspects' ? ['Maya'] : [], misunderstands: [], unknown: mayaKnows === 'unknown' ? ['Maya'] : [] }] },
    canon: { facts: [{ content: 'Maya co-owns a clinic with Marcus', classification: 'HARD_CANON', source: 'ch1' }] },
    deferredChecks: [],
    sceneId: 'state-matrix', revisionId: 41,
  };
}

async function runStateMatrix(): Promise<any[]> {
  console.log('\n=== Controlled State Matrix ===\n');
  const results: any[] = [];
  const original = 'Marcus was at the desk.';
  for (const tc of stateMatrixCases) {
    const state = makeStateMatrixState(tc.state);
    const ccResult = classifyProvenanceV4(tc.candidate, original, state);
    const claims = extractClaims(tc.candidate, state);
    const lj = await validateV41(original, tc.candidate, state, 'LICENSED_FICTION', ccResult, claims);
    const fd = finalDecision(lj, ccResult);
    const correct = fd.final === tc.expected;
    console.log(`${tc.id}: state=${tc.state} | candidate="${tc.candidate.slice(0,50)}..." | claims=${claims.map(c=>c.resolution).join(',')||'none'} | → ${fd.final} (exp ${tc.expected}) ${correct ? '✓' : '✗'}`);
    const result = { caseId: tc.id, state: tc.state, candidate: tc.candidate, expected: tc.expected, reasoning: tc.reasoning, ccResult: { severity: ccResult.severity }, claims: claims.map(c => ({ level: c.epistemicLevel, resolution: c.resolution, evidence: c.resolutionEvidence })), lj: { overall: lj.overall, infoOwnership: lj.infoOwnership, stateConsulted: lj.stateConsulted }, final: fd.final, correct, validatorMode: lj._executionMode || 'LLM' };
    results.push(result);
    writeFileSync(join(LOG_DIR, `state-matrix-${tc.id}.json`), JSON.stringify(result, null, 2));
    await new Promise(r => setTimeout(r, 1500));
  }
  return results;
}

// ============================================================
// PARAPHRASE FAITHFULNESS TEST
// ============================================================
const paraphraseCases = [
  { id: 'P-1', source: 'The report identified three hospitals.', revised: 'The report identified three medical centers.', expected: 'ACCEPT' as const, reasoning: 'paraphrase — semantically equivalent' },
  { id: 'P-2', source: 'The report identified three hospitals.', revised: 'The report identified three clinics.', expected: 'ACCEPT' as const, reasoning: 'paraphrase — close enough in context' },
  { id: 'P-3', source: 'The report identified three hospitals.', revised: 'The report identified three universities.', expected: 'REJECT' as const, reasoning: 'non-equivalent — different institutions' },
  { id: 'P-4', source: 'The study surveyed 1,847 nurses across 14 hospitals.', revised: 'The study surveyed 1,847 nurses at 14 medical centers.', expected: 'ACCEPT' as const, reasoning: 'paraphrase of location term' },
  { id: 'P-5', source: 'The study surveyed 1,847 nurses across 14 hospitals.', revised: 'The study surveyed 1,847 nurses across 50 hospitals.', expected: 'REJECT' as const, reasoning: 'different number (14→50) — not paraphrase' },
];

async function runParaphraseTest(): Promise<any[]> {
  console.log('\n=== Paraphrase Faithfulness Test ===\n');
  const results: any[] = [];
  const state: DocumentState = {
    character: { identity: 'Academic writer', goals: [], fears: [], beliefs: [], memories: [], emotionalState: '', perceptualHabits: [], voice: 'formal', currentKnowledge: [] },
    informationOwnership: { entries: [] },
    canon: { facts: [] },
    deferredChecks: [],
    sceneId: 'paraphrase', revisionId: 41,
  };
  for (const tc of paraphraseCases) {
    const ccResult = classifyProvenanceV4(tc.revised, tc.source, state);
    const claims = extractClaims(tc.revised, state);
    const lj = await validateV41(tc.source, tc.revised, state, 'SOURCE_CONSTRAINED', ccResult, claims);
    const fd = finalDecision(lj, ccResult);
    const correct = fd.final === tc.expected;
    console.log(`${tc.id}: "${tc.source.slice(0,30)}..." → "${tc.revised.slice(0,30)}..." | → ${fd.final} (exp ${tc.expected}) ${correct ? '✓' : '✗'}`);
    const result = { caseId: tc.id, source: tc.source, revised: tc.revised, expected: tc.expected, reasoning: tc.reasoning, ccResult: { severity: ccResult.severity, unsupported: ccResult.unsupported.map(i=>i.detail) }, lj: { overall: lj.overall, faithfulness: lj.faithfulness, reasons: lj.reasons }, final: fd.final, correct, validatorMode: lj._executionMode || 'LLM' };
    results.push(result);
    writeFileSync(join(LOG_DIR, `paraphrase-${tc.id}.json`), JSON.stringify(result, null, 2));
    await new Promise(r => setTimeout(r, 1500));
  }
  return results;
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  const mode = process.argv[2];
  let frozenResults: any[] = [];
  let stateMatrixResults: any[] = [];
  let paraphraseResults: any[] = [];

  if (!mode || mode === 'frozen') {
    frozenResults = await runFrozenBenchmark();
  }
  if (!mode || mode === 'matrix') {
    stateMatrixResults = await runStateMatrix();
  }
  if (!mode || mode === 'paraphrase') {
    paraphraseResults = await runParaphraseTest();
  }

  // Combined summary
  const all = [...frozenResults, ...stateMatrixResults, ...paraphraseResults];
  writeFileSync(join(LOG_DIR, 'all-logs.json'), JSON.stringify(all, null, 2));

  // Metrics for frozen benchmark
  if (frozenResults.length) {
    const valid = frozenResults.filter(r => !r.error && r.validatorMode !== 'EXECUTION_ERROR');
    const correct = valid.filter(r => r.correct).length;
    const aResults = valid.filter(r => r.variant === 'A');
    const bResults = valid.filter(r => r.variant === 'B');
    const falseRejectA = aResults.filter(r => r.expected === 'ACCEPT' && r.final === 'REJECT');
    const falseAcceptB = bResults.filter(r => r.expected === 'REJECT' && r.final === 'ACCEPT');
    console.log(`\n=== V4.1 Frozen Benchmark Metrics ===`);
    console.log(`Total: ${valid.length} | Correct: ${correct}/${valid.length} (${valid.length ? Math.round(100*correct/valid.length) : 0}%)`);
    console.log(`False Rejection (A): ${falseRejectA.length}/${aResults.length}`);
    console.log(`False Acceptance (B): ${falseAcceptB.length}/${bResults.length}`);
    if (falseRejectA.length) console.log(`A false rejections: ${falseRejectA.map(r=>r.caseId).join(', ')}`);
    if (falseAcceptB.length) console.log(`B false acceptances: ${falseAcceptB.map(r=>r.caseId).join(', ')}`);
  }
  if (stateMatrixResults.length) {
    const smCorrect = stateMatrixResults.filter(r => r.correct).length;
    console.log(`\nState Matrix: ${smCorrect}/${stateMatrixResults.length} correct`);
  }
  if (paraphraseResults.length) {
    const pCorrect = paraphraseResults.filter(r => r.correct).length;
    console.log(`Paraphrase: ${pCorrect}/${paraphraseResults.length} correct`);
  }
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
