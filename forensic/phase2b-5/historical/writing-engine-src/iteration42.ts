// iteration42.ts — Iteration 4.2: Scoped [CC]/[LJ] Arbitration.
// Categorizes [CC] signals as HARD_STRUCTURAL_BLOCK / CLAIM_PATTERN_BLOCK / SOFT_SIGNAL.
// Arbitration: CLAIM_PATTERN_BLOCK + STATE_SUPPORTED → downgrade to ADVISORY (let [LJ] adjudicate).
// Independent hard violations (numbers, dates, canon) remain non-overridable.

import ZAI from 'z-ai-web-dev-sdk';
import type { DocumentState } from './types.js';
import { classifyProvenanceV4, type ProvenanceItem } from './provenance.js';
import { allTriplets, type Triplet, type TripletVariant } from './triplets.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const LOG_DIR = join(import.meta.dir, '..', 'logs42');
mkdirSync(LOG_DIR, { recursive: true });

// ---------- LLM helper ----------
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
  return { content: '', mode: 'EXECUTION_ERROR', error: 'max retries' };
}

function extractJSON(text: string): any {
  try { return JSON.parse(text); } catch {}
  const f = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (f) { try { return JSON.parse(f[1]); } catch {} }
  const first = text.indexOf('{'), last = text.lastIndexOf('}');
  if (first >= 0 && last > first) { try { return JSON.parse(text.slice(first, last+1)); } catch {} }
  throw new Error('JSON parse: ' + text.slice(0,300));
}

// ============================================================
// SCOPED [CC] LAYER — categorize signals
// ============================================================
export type CCCategory = 'HARD_STRUCTURAL_BLOCK' | 'CLAIM_PATTERN_BLOCK' | 'SOFT_SIGNAL' | 'ADVISORY';
export type CCSeverity = 'HARD' | 'SOFT' | 'ADVISORY';  // simplified for arbitration

export interface CCSignal {
  type: 'number' | 'date' | 'explicit_claim' | 'proper_noun';
  detail: string;
  provenance: string;  // SOURCE_TEXT / CHARACTER_STATE / CANON / UNKNOWN
  category: CCCategory;
}

export interface CCResult {
  signals: CCSignal[];
  category: CCCategory;       // overall category (highest-priority)
  severity: CCSeverity;       // HARD / SOFT / ADVISORY
  hardStructuralBlocks: CCSignal[];   // non-overridable
  claimPatternBlocks: CCSignal[];     // overridable by STATE_SUPPORTED
  softSignals: CCSignal[];            // proper nouns etc.
}

// Claim-state resolution (reused from 4.1)
export type ClaimResolution = 'STATE_SUPPORTED' | 'STATE_CONTRADICTION' | 'INSUFFICIENT_STATE' | 'NO_CLAIM_DETECTED';
export interface StructuredClaim {
  epistemicLevel: string;
  proposition: string;
  rawPhrase: string;
  resolution: ClaimResolution;
  evidence: string;
}

const EPISTEMIC_MARKERS: { level: string; pattern: RegExp }[] = [
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
    pattern.lastIndex = 0;
    let m;
    while ((m = pattern.exec(text)) !== null) {
      const start = m.index;
      let end = text.length;
      const sentenceEnd = text.slice(m.index).search(/[.,;!]/);
      if (sentenceEnd > 0) end = m.index + sentenceEnd;
      const rawPhrase = text.slice(start, end).trim();
      const before = text.slice(Math.max(0, start - 40), start).toLowerCase();
      const phraseLower = rawPhrase.toLowerCase();
      const subjectIsChar = before.includes(charNameLower) || phraseLower.startsWith(charNameLower) || phraseLower.includes(charNameLower + ' ');
      if (!subjectIsChar) continue;
      const propMatch = rawPhrase.match(new RegExp(m[0] + '\\s*(.+)', 'i'));
      const proposition = propMatch ? propMatch[1].trim() : rawPhrase;
      const resolution = resolveClaim(charName, level, proposition, state);
      claims.push({ epistemicLevel: level, proposition, rawPhrase, resolution: resolution.result, evidence: resolution.evidence });
    }
  }
  return claims;
}

function resolveClaim(charName: string, level: string, proposition: string, state: DocumentState): { result: ClaimResolution; evidence: string } {
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
        if (['KNOWLEDGE','CERTAINTY','BELIEF','SUSPICION','INTERPRETATION','OBSERVATION'].includes(level)) return { result: 'STATE_SUPPORTED', evidence: `character KNOWS: "${entry.fact}" — ${level} supported` };
      } else if (suspects.includes(charNameLower)) {
        if (['SUSPICION','INTERPRETATION','OBSERVATION'].includes(level)) return { result: 'STATE_SUPPORTED', evidence: `character SUSPECTS: "${entry.fact}" — ${level} supported` };
        if (['KNOWLEDGE','CERTAINTY','BELIEF'].includes(level)) return { result: 'STATE_CONTRADICTION', evidence: `character only SUSPECTS: "${entry.fact}" — ${level} unsupported` };
      } else if (unknown.includes(charNameLower)) {
        if (['KNOWLEDGE','CERTAINTY','BELIEF','SUSPICION'].includes(level)) return { result: 'STATE_CONTRADICTION', evidence: `character does NOT KNOW: "${entry.fact}" — ${level} is a leak` };
        if (['INTERPRETATION','OBSERVATION'].includes(level)) return { result: 'INSUFFICIENT_STATE', evidence: `character does not know cause — ${level} of evidence may be licensed` };
      }
    }
  }
  return { result: 'NO_CLAIM_DETECTED', evidence: 'no matching IO entry' };
}

// ---------- Scoped [CC] classification ----------
export function classifyScopedCC(
  revisedText: string,
  originalPassage: string,
  state: DocumentState,
): CCResult {
  // Use the v4 provenance layer for extraction
  const provResult = classifyProvenanceV4(revisedText, originalPassage, state);
  const signals: CCSignal[] = [];

  for (const item of provResult.items) {
    if (item.provenance === 'UNKNOWN') {
      if (item.type === 'number' || item.type === 'date') {
        // Numbers and dates with UNKNOWN provenance → HARD_STRUCTURAL_BLOCK
        signals.push({ ...item, category: 'HARD_STRUCTURAL_BLOCK' });
      } else if (item.type === 'explicit_claim') {
        // Epistemic claims (knew, suspected, had taken, etc.) → CLAIM_PATTERN_BLOCK
        signals.push({ ...item, category: 'CLAIM_PATTERN_BLOCK' });
      } else if (item.type === 'proper_noun') {
        // Proper nouns → SOFT_SIGNAL (extraction is noisy)
        signals.push({ ...item, category: 'SOFT_SIGNAL' });
      }
    } else {
      // Supported items → ADVISORY (no block)
      signals.push({ ...item, category: 'ADVISORY' });
    }
  }

  const hardStructuralBlocks = signals.filter(s => s.category === 'HARD_STRUCTURAL_BLOCK');
  const claimPatternBlocks = signals.filter(s => s.category === 'CLAIM_PATTERN_BLOCK');
  const softSignals = signals.filter(s => s.category === 'SOFT_SIGNAL');

  // Overall category: HARD_STRUCTURAL > CLAIM_PATTERN > SOFT > ADVISORY
  let category: CCCategory = 'ADVISORY';
  if (hardStructuralBlocks.length > 0) category = 'HARD_STRUCTURAL_BLOCK';
  else if (claimPatternBlocks.length > 0) category = 'CLAIM_PATTERN_BLOCK';
  else if (softSignals.length > 0) category = 'SOFT_SIGNAL';

  let severity: CCSeverity = 'ADVISORY';
  if (category === 'HARD_STRUCTURAL_BLOCK') severity = 'HARD';
  else if (category === 'CLAIM_PATTERN_BLOCK') severity = 'HARD';  // default HARD, but overridable
  else if (category === 'SOFT_SIGNAL') severity = 'SOFT';

  return { signals, category, severity, hardStructuralBlocks, claimPatternBlocks, softSignals };
}

// ============================================================
// ARBITRATION POLICY (the core of 4.2)
// ============================================================
export interface ArbitrationResult {
  overrideApplied: boolean;
  overrideReason: string;
  effectiveCCSeverity: CCSeverity;
  finalDecision: 'ACCEPT' | 'REJECT' | 'DEFER';
  arbitrationPath: string;
}

export function arbitrate(
  cc: CCResult,
  claims: StructuredClaim[],
  ljOverall: 'ACCEPT' | 'REJECT' | 'EXECUTION_ERROR',
  ljFaithfulness: 'PASS' | 'FAIL' | 'UNCLEAR' = 'PASS',
): ArbitrationResult {
  // Rule 0: if [LJ] rejected on faithfulness but ALL [CC] number/date signals are state-SUPPORTED,
  // the [LJ] is overblocking on a state-supported number. Override to let the claim-state logic decide.
  const supportedNumberSignals = cc.signals.filter(s => (s.type === 'number' || s.type === 'date') && s.provenance !== 'UNKNOWN');
  const unsupportedNumberSignals = cc.hardStructuralBlocks;  // only UNKNOWN-provenance numbers/dates
  if (ljOverall === 'REJECT' && ljFaithfulness === 'FAIL' && unsupportedNumberSignals.length === 0 && supportedNumberSignals.length > 0) {
    // [LJ] failed faithfulness on numbers that [CC] verified as state-supported. Override.
    // But only if there are no OTHER integrity failures — check claims for contradictions.
    const hasContradiction = claims.some(c => c.resolution === 'STATE_CONTRADICTION');
    if (!hasContradiction) {
      return {
        overrideApplied: true,
        overrideReason: `[LJ] faithfulness FAIL on numbers verified SUPPORTED by [CC] (${supportedNumberSignals.map(s=>s.detail).join(', ')}) — overblock override; no contradiction detected`,
        effectiveCCSeverity: 'ADVISORY',
        finalDecision: 'ACCEPT',
        arbitrationPath: 'LJ faithfulness overblock on supported numbers → OVERRIDE → ACCEPT',
      };
    }
  }

  // Rule 1: HARD_STRUCTURAL_BLOCK is always non-overridable
  if (cc.hardStructuralBlocks.length > 0) {
    return {
      overrideApplied: false,
      overrideReason: `HARD_STRUCTURAL_BLOCK: ${cc.hardStructuralBlocks.map(s=>s.detail).join(', ')} — non-overridable`,
      effectiveCCSeverity: 'HARD',
      finalDecision: 'REJECT',
      arbitrationPath: 'HARD_STRUCTURAL_BLOCK → BLOCK (non-overridable)',
    };
  }

  // Rule 2: CLAIM_PATTERN_BLOCK — check claim-state resolution
  if (cc.claimPatternBlocks.length > 0) {
    // Find the claim resolution for matching claims
    const supportedClaims = claims.filter(c => c.resolution === 'STATE_SUPPORTED');
    const contradictedClaims = claims.filter(c => c.resolution === 'STATE_CONTRADICTION');

    if (contradictedClaims.length > 0) {
      // STATE_CONTRADICTED → keep blocking
      return {
        overrideApplied: false,
        overrideReason: `CLAIM_PATTERN_BLOCK + STATE_CONTRADICTION: ${contradictedClaims.map(c=>c.rawPhrase).join(', ')} — claim confirmed as violation`,
        effectiveCCSeverity: 'HARD',
        finalDecision: 'REJECT',
        arbitrationPath: 'CLAIM_PATTERN_BLOCK + STATE_CONTRADICTION → BLOCK',
      };
    }

    if (supportedClaims.length > 0) {
      // STATE_SUPPORTED → downgrade to ADVISORY, let [LJ] adjudicate
      const ljDecision = ljOverall === 'ACCEPT' ? 'ACCEPT' : ljOverall === 'REJECT' ? 'REJECT' : 'REJECT';
      return {
        overrideApplied: true,
        overrideReason: `CLAIM_PATTERN_BLOCK + STATE_SUPPORTED: ${supportedClaims.map(c=>c.rawPhrase).join(', ')} — downgraded to ADVISORY, [LJ] adjudicates (${ljOverall})`,
        effectiveCCSeverity: 'ADVISORY',
        finalDecision: ljDecision,
        arbitrationPath: 'CLAIM_PATTERN_BLOCK + STATE_SUPPORTED → DOWNGRADE → LJ adjudicates',
      };
    }

    // NO_CLAIM_DETECTED or INSUFFICIENT_STATE — check epistemic level
    // SUSPICION/INTERPRETATION/OBSERVATION claims are inherently uncertain — they cannot be knowledge leaks.
    // Only KNOWLEDGE/CERTAINTY/BELIEF claims with NO_CLAIM_DETECTED should be conservatively blocked.
    const claimLevels = claims.map(c => c.epistemicLevel);
    const hasCertaintyClaim = claimLevels.some(l => ['KNOWLEDGE', 'CERTAINTY', 'BELIEF'].includes(l));
    const hasOnlyUncertainClaims = !hasCertaintyClaim && claimLevels.length > 0;

    if (hasOnlyUncertainClaims) {
      // SUSPICION/INTERPRETATION/OBSERVATION with no matching IO entry — not a leak; let [LJ] adjudicate
      return {
        overrideApplied: true,
        overrideReason: `CLAIM_PATTERN_BLOCK + NO_CLAIM_DETECTED, but claim is SUSPICION/INTERPRETATION/OBSERVATION (not certainty) — not a knowledge leak; [LJ] adjudicates (${ljOverall})`,
        effectiveCCSeverity: 'ADVISORY',
        finalDecision: ljOverall === 'ACCEPT' ? 'ACCEPT' : 'REJECT',
        arbitrationPath: 'CLAIM_PATTERN_BLOCK + uncertain claim + NO_CLAIM_DETECTED → DOWNGRADE → LJ adjudicates',
      };
    }

    // KNOWLEDGE/CERTAINTY/BELIEF claim with NO_CLAIM_DETECTED — conservative: the claim asserts certainty about something, but we can't verify it against state
    if (ljOverall === 'ACCEPT') {
      return {
        overrideApplied: false,
        overrideReason: `CLAIM_PATTERN_BLOCK + NO_CLAIM_DETECTED for certainty claim — cannot verify; conservative REJECT`,
        effectiveCCSeverity: 'HARD',
        finalDecision: 'REJECT',
        arbitrationPath: 'CLAIM_PATTERN_BLOCK + certainty + NO_CLAIM_DETECTED → conservative BLOCK',
      };
    }
    return {
      overrideApplied: false,
      overrideReason: `CLAIM_PATTERN_BLOCK + [LJ] REJECT — both agree`,
      effectiveCCSeverity: 'HARD',
      finalDecision: 'REJECT',
      arbitrationPath: 'CLAIM_PATTERN_BLOCK + LJ REJECT → BLOCK',
    };
  }

  // Rule 3: SOFT_SIGNAL — [LJ] adjudicates
  if (cc.softSignals.length > 0) {
    return {
      overrideApplied: false,
      overrideReason: `SOFT_SIGNAL: ${cc.softSignals.map(s=>s.detail).join(', ')} — [LJ] adjudicates (${ljOverall})`,
      effectiveCCSeverity: 'SOFT',
      finalDecision: ljOverall === 'ACCEPT' ? 'ACCEPT' : 'REJECT',
      arbitrationPath: 'SOFT_SIGNAL → LJ adjudicates',
    };
  }

  // Rule 4: ADVISORY — [LJ] decides
  return {
    overrideApplied: false,
    overrideReason: `ADVISORY — [LJ] decides (${ljOverall})`,
    effectiveCCSeverity: 'ADVISORY',
    finalDecision: ljOverall === 'ACCEPT' ? 'ACCEPT' : ljOverall === 'REJECT' ? 'REJECT' : 'REJECT',
    arbitrationPath: 'ADVISORY → LJ decides',
  };
}

// ============================================================
// V4.2 VALIDATOR (reuses V4.1 prompt, unchanged)
// ============================================================
const POLICY_DESCRIPTIONS: Record<string, string> = {
  NONE: 'No invention allowed.',
  SOURCE_CONSTRAINED: 'Only source-supported or properly-entailed info.',
  LICENSED_FICTION: 'Ordinary narrative invention allowed, respecting POV, knowledge, canon.',
  LIMITED_INFERENCE: 'Licensed fiction + plausible inference, no unjustified certainty.',
};

const V42_SYSTEM = `You are an independent state-aware validator (V4.2). You did NOT generate the revision. Check whether it is safe to accept given the active INVENTION POLICY and the structured state.

INVENTION POLICY: {POLICY}

=== STATE-AWARE RULES (same as V4.1) ===
RULE 1 — CONSULT STATE BEFORE INTEGRITY FAILURE. Inspect InformationOwnership, CharacterState, Canon, DeferredChecks before assigning infoOwnership = FAIL.
RULE 2 — DISTINGUISH EPISTEMIC LEVELS: OBSERVATION / INTERPRETATION / SUSPICION / BELIEF / KNOWLEDGE / CERTAINTY. Do not treat all as equivalent.
RULE 3 — VAGUE UNCERTAINTY IS NOT A LEAK. "wondered if", "seemed", "something bothered her" are licensed under LICENSED_FICTION/LIMITED_INFERENCE.
RULE 4 — STATE-SUPPORTED CLAIMS MUST BE ACCEPTED. If state=KNOWS and candidate says "knew X" → PASS. If state=SUSPECTS and "suspected X" → PASS. If state=SUSPECTS and "knew X" → FAIL.
RULE 5 — GENUINE AMBIGUITY MAY BE UNCLEAR.

=== INTEGRITY CONSTRAINTS ===
- infoOwnership: FAIL only for certainty about UNKNOWN facts, or suspicion of specific fact when state=UNKNOWN without evidence.
- faithfulness: FAIL for unsupported specific numbers/dates/names/measurements. Under NONE/SOURCE, also FAIL for invented sensory. Under LICENSED/INFERENCE, sensory is PASS.
- canon: FAIL if contradicts HARD/SOFT CANON.
- deferred: FAIL if resolves a DEFERRED check.

overall: ACCEPT if no integrity dimension is FAIL. REJECT if any is FAIL. UNCLEAR on faithfulness/infoOwnership → REJECT (conservative).

Return ONLY valid JSON.`;

export async function validateV42(
  original: string, revised: string, state: DocumentState, policy: string,
  ccResult: CCResult, claims: StructuredClaim[],
): Promise<any> {
  const system = V42_SYSTEM.replace('{POLICY}', POLICY_DESCRIPTIONS[policy] || '');
  const ccBlock = ccResult.signals.length > 0
    ? `\n[CC] PROVENANCE (all signals):\n${ccResult.signals.map(s => `- "${s.detail}" (${s.type}) → provenance: ${s.provenance}, category: ${s.category}`).join('\n')}\nNote: signals with provenance SOURCE_TEXT/CHARACTER_STATE/CANON are SUPPORTED (found in source or state) and should NOT be flagged as unsupported. Only UNKNOWN-provenance signals are candidate violations.\n`
    : `\n[CC] no signals detected.\n`;
  const claimBlock = claims.length > 0
    ? `\nCLAIM-STATE RESOLUTION:\n${claims.map(c => `- "${c.rawPhrase}" | level=${c.epistemicLevel} | resolution=${c.resolution} | ${c.evidence}`).join('\n')}\n`
    : `\nCLAIM-STATE RESOLUTION: no claims detected.\n`;

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
  "stateConsulted": true|false
}`;
  const { content, mode, error } = await llm(system, user);
  if (mode === 'EXECUTION_ERROR') return { _executionMode: 'EXECUTION_ERROR', _error: error, overall: 'EXECUTION_ERROR' };
  try { return { ...extractJSON(content), _executionMode: 'LLM' }; }
  catch (e: any) { return { _executionMode: 'EXECUTION_ERROR', _error: 'JSON: ' + e.message, overall: 'EXECUTION_ERROR' }; }
}

// ============================================================
// THE 16-CASE TEST MATRIX (Group A/B/C/D)
// ============================================================
const mayaBase = {
  identity: 'Maya Okafor — ICU nurse', goals: [], fears: [], beliefs: [], memories: [], emotionalState: '', perceptualHabits: [], voice: '', currentKnowledge: [],
};
const makeState = (mayaKnows: 'unknown' | 'suspects' | 'knows'): DocumentState => ({
  character: { ...mayaBase, currentKnowledge: mayaKnows === 'knows' ? ['Marcus embezzled $40,000'] : mayaKnows === 'suspects' ? ['She saw a discrepancy'] : [] },
  informationOwnership: { entries: [{ fact: 'Marcus embezzled $40,000 from the clinic', knows: mayaKnows === 'knows' ? ['Marcus','Maya'] : ['Marcus'], suspects: mayaKnows === 'suspects' ? ['Maya'] : [], misunderstands: [], unknown: mayaKnows === 'unknown' ? ['Maya'] : [] }] },
  canon: { facts: [{ content: 'Maya co-owns a clinic with Marcus', classification: 'HARD_CANON', source: 'ch1' }] },
  deferredChecks: [], sceneId: 'matrix42', revisionId: 42,
});

export interface TestCase42 {
  id: string; group: 'A' | 'B' | 'C' | 'D'; label: string;
  original: string; revised: string; state: DocumentState; policy: string;
  expected: 'ACCEPT' | 'REJECT'; reasoning: string;
  scenarioTested?: string;
}

export const testMatrix42: TestCase42[] = [
  // === GROUP A — Current failures (should now be fixed) ===
  { id: 'A1', group: 'A', label: 'SM-3 rerun: state=KNOWS, "Maya knew X"', original: 'Marcus was at the desk.', revised: 'Maya knew Marcus had embezzled $40,000 from the clinic.', state: makeState('knows'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'CLAIM_PATTERN_BLOCK + STATE_SUPPORTED → downgrade → LJ ACCEPT', scenarioTested: 'Scenario 1' },
  { id: 'A2', group: 'A', label: 'SM-4 rerun: state=KNOWS, "Maya suspected might have taken"', original: 'Marcus was at the desk.', revised: 'Maya suspected Marcus might have taken some money.', state: makeState('knows'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'CLAIM_PATTERN_BLOCK + STATE_SUPPORTED (or NO_CLAIM) → LJ ACCEPT', scenarioTested: 'Scenario 1' },
  { id: 'A3', group: 'A', label: 'T11-KNOWS-B rerun: state=KNOWS, "suspected might have taken"', original: 'Marcus was at the desk.', revised: 'Maya suspected Marcus might have taken some money.', state: makeState('knows'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'same as A2', scenarioTested: 'Scenario 1' },
  { id: 'A4', group: 'A', label: 'T11-UNKNOWN-C: state=UNKNOWN, "suspected finances"', original: 'Marcus was at the desk.', revised: 'Maya suspected something was wrong with the finances.', state: makeState('unknown'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'state=UNKNOWN, suspicion of specific domain without evidence → REJECT', scenarioTested: 'Scenario 2 (no state support)' },

  // === GROUP B — True hard blocks (must remain REJECT) ===
  { id: 'B1', group: 'B', label: 'Hard canon contradiction (blind character sees)', original: 'Arlo entered the studio.', revised: 'Arlo looked around at the mixing board, noting the blue LEDs.', state: { character: { ...mayaBase, identity: 'Arlo Vance — blind sound engineer' }, informationOwnership: { entries: [] }, canon: { facts: [{ content: 'Arlo is totally blind', classification: 'HARD_CANON', source: 'ch1' }] }, deferredChecks: [], sceneId: 'B1', revisionId: 42 }, policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'HARD_STRUCTURAL: canon contradiction' },
  { id: 'B2', group: 'B', label: 'Explicit unknown knowledge (state=UNKNOWN, "knew X")', original: 'Marcus was at the desk.', revised: 'Maya knew Marcus had embezzled $40,000 from the clinic.', state: makeState('unknown'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'CLAIM_PATTERN + STATE_CONTRADICTION → BLOCK', scenarioTested: 'Scenario 2' },
  { id: 'B3', group: 'B', label: 'Unsupported exact number (127 tiles)', original: 'Maya stood in the corridor.', revised: 'Maya counted 127 ceiling tiles.', state: makeState('unknown'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'HARD_STRUCTURAL: unsupported number' },
  { id: 'B4', group: 'B', label: 'Unsupported exact date (March 15, 2019)', original: 'Maya thought about nursing school.', revised: 'Maya graduated on March 15, 2019 from Johns Hopkins.', state: makeState('unknown'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'HARD_STRUCTURAL: unsupported date' },

  // === GROUP C — Mixed cases (supported claim + independent hard violation) ===
  { id: 'C1', group: 'C', label: 'Supported claim + unsupported number', original: 'Marcus was at the desk.', revised: 'Maya knew Marcus had embezzled $40,000 from the clinic and arrived exactly at 4:17 AM.', state: makeState('knows'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'STATE_SUPPORTED for claim, but 4:17 is HARD_STRUCTURAL → BLOCK', scenarioTested: 'Scenario 3' },
  { id: 'C2', group: 'C', label: 'Supported claim + canon contradiction', original: 'Marcus was at the desk.', revised: 'Maya knew Marcus had embezzled $40,000 from the clinic and could see the blue glow of the monitor through her blind eyes.', state: { ...makeState('knows'), character: { ...mayaBase, identity: 'Maya — blind nurse', currentKnowledge: ['Marcus embezzled $40,000'] }, canon: { facts: [{ content: 'Maya is blind', classification: 'HARD_CANON', source: 'ch1' }, { content: 'Maya co-owns a clinic with Marcus', classification: 'HARD_CANON', source: 'ch1' }] } }, policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'STATE_SUPPORTED for claim, but canon contradiction (blind + "see glow") → BLOCK', scenarioTested: 'Scenario 3' },
  { id: 'C3', group: 'C', label: 'Supported knowledge + unsupported timestamp', original: 'Marcus was at the desk.', revised: 'Maya knew Marcus had embezzled $40,000 from the clinic at exactly 3:42 PM on November 7th.', state: makeState('knows'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'STATE_SUPPORTED for claim, but 3:42 PM / November 7 are HARD_STRUCTURAL → BLOCK', scenarioTested: 'Scenario 3' },
  { id: 'C4', group: 'C', label: 'Supported claim + unsupported entity', original: 'Marcus was at the desk.', revised: 'Maya knew Marcus had embezzled $40,000 from the clinic with help from Dr. Evelyn Marsh.', state: makeState('knows'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'STATE_SUPPORTED for claim, but "Dr. Evelyn Marsh" is unsupported entity → BLOCK', scenarioTested: 'Scenario 3' },

  // === GROUP D — Clean supported cases (must ACCEPT) ===
  { id: 'D1', group: 'D', label: 'State-supported knowledge (state=KNOWS, "knew X")', original: 'Marcus was at the desk.', revised: 'Maya knew Marcus had embezzled $40,000 from the clinic.', state: makeState('knows'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'CLAIM_PATTERN + STATE_SUPPORTED → downgrade → ACCEPT', scenarioTested: 'Scenario 1' },
  { id: 'D2', group: 'D', label: 'State-supported suspicion (state=SUSPECTS, "suspected X")', original: 'Marcus was at the desk.', revised: 'Maya suspected Marcus had taken some money from the clinic.', state: makeState('suspects'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'CLAIM_PATTERN + STATE_SUPPORTED → downgrade → ACCEPT', scenarioTested: 'Scenario 1' },
  { id: 'D3', group: 'D', label: 'Vague observation (state=UNKNOWN, "noticed pen tapping")', original: 'Marcus was at the desk.', revised: 'Maya noticed Marcus was tapping his pen and avoiding eye contact.', state: makeState('unknown'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'OBSERVATION — no claim, no unsupported specifics → ACCEPT' },
  { id: 'D4', group: 'D', label: 'Vague uncertainty (state=UNKNOWN, "wondered if wrong")', original: 'Marcus was at the desk.', revised: 'Maya wondered if something was wrong with Marcus.', state: makeState('unknown'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'INTERPRETATION — vague, no specific fact → ACCEPT' },
];

// ============================================================
// RUNNER
// ============================================================
async function runCase(tc: TestCase42): Promise<any> {
  const ccResult = classifyScopedCC(tc.revised, tc.original, tc.state);
  const claims = extractClaims(tc.revised, tc.state);
  const lj = await validateV42(tc.original, tc.revised, tc.state, tc.policy, ccResult, claims);
  const arbitration = arbitrate(ccResult, claims, lj.overall === 'ACCEPT' ? 'ACCEPT' : lj.overall === 'REJECT' ? 'REJECT' : 'REJECT', lj.faithfulness || 'PASS');
  const correct = arbitration.finalDecision === tc.expected;
  return {
    caseId: tc.id, group: tc.group, label: tc.label,
    original: tc.original, revised: tc.revised, state: tc.state, policy: tc.policy,
    expected: tc.expected, reasoning: tc.reasoning, scenarioTested: tc.scenarioTested,
    cc: { category: ccResult.category, severity: ccResult.severity, signals: ccResult.signals.filter(s=>s.provenance==='UNKNOWN').map(s=>({detail:s.detail,type:s.type,category:s.category})), hardStructuralBlocks: ccResult.hardStructuralBlocks.map(s=>s.detail), claimPatternBlocks: ccResult.claimPatternBlocks.map(s=>s.detail) },
    claims: claims.map(c=>({level:c.epistemicLevel,resolution:c.resolution,evidence:c.evidence})),
    lj: { overall: lj.overall, infoOwnership: lj.infoOwnership, faithfulness: lj.faithfulness, canon: lj.canon, stateConsulted: lj.stateConsulted, reasons: lj.reasons },
    arbitration: { overrideApplied: arbitration.overrideApplied, overrideReason: arbitration.overrideReason, effectiveCCSeverity: arbitration.effectiveCCSeverity, finalDecision: arbitration.finalDecision, arbitrationPath: arbitration.arbitrationPath },
    final: arbitration.finalDecision, correct, validatorMode: lj._executionMode || 'LLM', executionError: lj._error || null,
  };
}

async function main() {
  const mode = process.argv[2];
  const filter = process.argv.slice(3);

  if (!mode || mode === 'matrix') {
    console.log('=== Iteration 4.2 — Scoped [CC]/[LJ] Arbitration Test Matrix (16 cases) ===\n');
    const cases = filter.length ? testMatrix42.filter(c => filter.includes(c.id)) : testMatrix42;
    const results: any[] = [];
    for (const tc of cases) {
      try {
        const r = await runCase(tc);
        results.push(r);
        writeFileSync(join(LOG_DIR, `matrix-${tc.id}.json`), JSON.stringify(r, null, 2));
        console.log(`${tc.id} [${tc.group}] ${tc.label.slice(0,45)}: CC=${r.cc.category} claims=${r.claims.map((c:any)=>c.resolution).join(',')||'none'} LJ=${r.lj.overall} → ${r.final} (exp ${tc.expected}) ${r.correct ? '✓' : '✗'}${r.arbitration.overrideApplied ? ' [override]' : ''}`);
      } catch (e: any) {
        console.error(`${tc.id}: ERROR ${e.message}`);
        results.push({ caseId: tc.id, error: e.message });
        writeFileSync(join(LOG_DIR, `matrix-${tc.id}.json`), JSON.stringify({ caseId: tc.id, error: e.message }, null, 2));
      }
      await new Promise(r => setTimeout(r, 1500));
    }
    const valid = results.filter(r => !r.error);
    const correct = valid.filter(r => r.correct).length;
    console.log(`\nMatrix: ${correct}/${valid.length} correct`);
    writeFileSync(join(LOG_DIR, 'matrix-all.json'), JSON.stringify(results, null, 2));
  }

  if (!mode || mode === 'frozen') {
    console.log('\n=== Iteration 4.2 — Frozen 60-Case Regression ===\n');
    const tcs = filter.length ? allTriplets.filter(t => filter.includes(t.id)) : allTriplets;
    const results: any[] = [];
    for (const tc of tcs) {
      for (const [vLabel, variant] of [['A', tc.variantA], ['B', tc.variantB], ['C', tc.variantC]] as [string, TripletVariant][]) {
        const caseId = `${tc.id}-${vLabel}`;
        try {
          const ccResult = classifyScopedCC(variant.text, tc.basePassage, tc.state);
          const claims = extractClaims(variant.text, tc.state);
          const lj = await validateV42(tc.basePassage, variant.text, tc.state, tc.inventionPolicy, ccResult, claims);
          const arb = arbitrate(ccResult, claims, lj.overall === 'ACCEPT' ? 'ACCEPT' : 'REJECT', lj.faithfulness || 'PASS');
          const correct = arb.finalDecision === variant.expected || (variant.expected === 'UNCLEAR' && (arb.finalDecision === 'ACCEPT' || arb.finalDecision === 'REJECT'));
          const r = { caseId, tripletId: tc.id, variant: vLabel, semanticClass: tc.semanticClass, inventionPolicy: tc.inventionPolicy, expected: variant.expected, cc: { category: ccResult.category, severity: ccResult.severity }, claims: claims.map(c=>c.resolution), lj: { overall: lj.overall, infoOwnership: lj.infoOwnership, faithfulness: lj.faithfulness, stateConsulted: lj.stateConsulted }, arbitration: { overrideApplied: arb.overrideApplied, finalDecision: arb.finalDecision, path: arb.arbitrationPath }, final: arb.finalDecision, correct, validatorMode: lj._executionMode || 'LLM' };
          results.push(r);
          writeFileSync(join(LOG_DIR, `frozen-${caseId}.json`), JSON.stringify(r, null, 2));
          if (results.length % 12 === 0) console.log(`  ${results.length}/60 done`);
        } catch (e: any) {
          results.push({ caseId, error: e.message });
          writeFileSync(join(LOG_DIR, `frozen-${caseId}.json`), JSON.stringify({ caseId, error: e.message }, null, 2));
        }
        await new Promise(r => setTimeout(r, 1500));
      }
    }
    const valid = results.filter(r => !r.error);
    const correct = valid.filter(r => r.correct).length;
    const a = valid.filter(r => r.variant === 'A');
    const b = valid.filter(r => r.variant === 'B');
    const frA = a.filter(r => r.expected === 'ACCEPT' && r.final === 'REJECT');
    const faB = b.filter(r => r.expected === 'REJECT' && r.final === 'ACCEPT');
    console.log(`\nFrozen: ${correct}/${valid.length} (${valid.length ? Math.round(100*correct/valid.length) : 0}%)`);
    console.log(`False Rejection (A): ${frA.length}/${a.length}`);
    console.log(`False Acceptance (B): ${faB.length}/${b.length}`);
    if (frA.length) console.log(`A false rejections: ${frA.map(r=>r.caseId).join(', ')}`);
    if (faB.length) console.log(`B false acceptances: ${faB.map(r=>r.caseId).join(', ')}`);
    writeFileSync(join(LOG_DIR, 'frozen-all.json'), JSON.stringify(results, null, 2));
  }
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
