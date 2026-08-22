// adversarial.ts — Iteration 3 validator-only adversarial test harness.
// NO generation step. Bad interventions are manually constructed.
// The validator receives original + bad-revision + state and must judge.
// We also compute provenance for each specific detail and classify [CC] findings as HARD/SOFT.

import ZAI from 'z-ai-web-dev-sdk';
import type { DocumentState, ValidationResult } from './types.js';
import { checkSupportedSpecificity } from './deterministic.js';

// ---------- LLM helper (with retry) ----------
async function llm(system: string, user: string): Promise<string> {
  const zai = await ZAI.create();
  const maxRetries = 4;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        thinking: { type: 'disabled' },
      });
      return completion.choices[0]?.message?.content ?? '';
    } catch (e: any) {
      const msg = String(e?.message || e);
      const is429 = msg.includes('429') || msg.includes('Too many requests');
      if (is429 && attempt < maxRetries) {
        const wait = 15000 * Math.pow(2, attempt);
        console.error(`  [rate-limit] 429 on attempt ${attempt + 1}; waiting ${wait / 1000}s...`);
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
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) {
    try { return JSON.parse(text.slice(first, last + 1)); } catch {}
  }
  throw new Error('Could not parse JSON:\n' + text.slice(0, 400));
}

// ============================================================
// PROVENANCE CLASSIFICATION (deterministic, per specific detail)
// ============================================================
export type Provenance =
  | 'SOURCE_TEXT'
  | 'CHARACTER_STATE'
  | 'CANON'
  | 'USER_PROVIDED'
  | 'ENTAILED'
  | 'INFERRED'
  | 'UNKNOWN';

export interface ProvenanceItem {
  detail: string;            // the specific detail (number, name, etc.)
  type: 'number' | 'proper_noun' | 'explicit_claim';
  provenance: Provenance;
  evidence: string;          // where in source/state it was found, or 'not found'
}

// Classify provenance of each specific detail in the revised text.
// A detail is SOURCE_TEXT if it appears verbatim in the original passage.
// CHARACTER_STATE / CANON if it appears in those state objects.
// Otherwise UNKNOWN (we do not guess ENTAILED/INFERRED deterministically — that's [LJ]).
export function classifyProvenance(
  revisedText: string,
  originalPassage: string,
  state: DocumentState,
): ProvenanceItem[] {
  const items: ProvenanceItem[] = [];
  const sourceLower = originalPassage.toLowerCase();
  const charLower = JSON.stringify(state.character).toLowerCase();
  const canonLower = JSON.stringify(state.canon).toLowerCase();
  const ioLower = JSON.stringify(state.informationOwnership).toLowerCase();

  // Extract numbers (digits)
  const digitMatches = revisedText.match(/\b\d+(?:\.\d+)?\b/g) || [];
  for (const n of digitMatches) {
    const v = n.toLowerCase();
    let prov: Provenance = 'UNKNOWN';
    let evidence = 'not found in source or state';
    if (sourceLower.includes(v)) { prov = 'SOURCE_TEXT'; evidence = `found in source passage`; }
    else if (charLower.includes(v)) { prov = 'CHARACTER_STATE'; evidence = `found in character state`; }
    else if (canonLower.includes(v)) { prov = 'CANON'; evidence = `found in canon state`; }
    items.push({ detail: n, type: 'number', provenance: prov, evidence });
  }
  // Extract explicit claims about knowledge/suspicion (heuristic: "knew", "realized", "understood", "could tell")
  const claimPatterns = [
    /\b(knew|realized|understood|could tell|recognized|figured out|deduced)\s+that\s+([^.,;]+)/gi,
    /\b(Marcus|she|he|Maya)\s+(had\s+)?(stole|embezzled|taken|diverted|moved)\s+([^.,;]+)/gi,
    /\b(had\s+)?(stole|embezzled|taken|diverted|moved)\s+([^.,;]+)/gi,
  ];
  for (const pat of claimPatterns) {
    let m;
    while ((m = pat.exec(revisedText)) !== null) {
      const claim = m[0].toLowerCase();
      if (sourceLower.includes(claim)) continue; // present in source — not a new claim
      let prov: Provenance = 'UNKNOWN';
      let evidence = 'claim not present in source';
      // Check if the claim matches an info-ownership fact the character KNOWS
      for (const entry of state.informationOwnership.entries) {
        const factLower = entry.fact.toLowerCase();
        // Extract the POV character's first name from identity
        const charName = state.character.identity.toLowerCase().split('—')[0].trim().split(' ')[0];
        const knows = entry.knows.map(k => k.toLowerCase());
        const suspects = entry.suspects.map(k => k.toLowerCase());
        // Does the claim text overlap the fact text? (heuristic: shared content words)
        const claimWords = claim.split(/\s+/).filter(w => w.length > 3);
        const factWords = factLower.split(/\s+/).filter(w => w.length > 3);
        const overlap = claimWords.filter(w => factWords.includes(w)).length;
        if (overlap >= 2) {  // at least 2 shared content words
          if (knows.includes(charName)) {
            prov = 'CHARACTER_STATE';
            evidence = `character KNOWS: "${entry.fact}"`;
            break;
          } else if (suspects.includes(charName)) {
            // Character suspects — a claim of certainty is still UNKNOWN provenance (suspicion upgraded)
            prov = 'UNKNOWN';
            evidence = `character only SUSPECTS: "${entry.fact}" — certainty claim is unsupported`;
            break;
          } else if (entry.unknown.map(k=>k.toLowerCase()).includes(charName)) {
            prov = 'UNKNOWN';
            evidence = `character does NOT KNOW: "${entry.fact}"`;
            break;
          }
        }
      }
      items.push({ detail: m[0], type: 'explicit_claim', provenance: prov, evidence });
    }
  }
  return items;
}

// ============================================================
// HARD vs SOFT [CC] FINDING CLASSIFICATION
// ============================================================
export type CCSeverity = 'HARD_BLOCK' | 'SOFT_SIGNAL' | 'ADVISORY';

export interface CCVerdict {
  unsupportedCount: number;
  unsupportedItems: ProvenanceItem[];   // with provenance
  hardBlocks: ProvenanceItem[];         // items that are deterministically UNKNOWN
  severity: CCSeverity;
}

// A [CC] finding is HARD_BLOCK when a specific detail has provenance UNKNOWN
// AND the detail is a number OR an explicit knowledge-claim.
// (Proper nouns are SOFT because extraction has false positives like "Papas" from "Papa's".)
export function classifyCCVerdict(items: ProvenanceItem[]): CCVerdict {
  const unsupported = items.filter(i => i.provenance === 'UNKNOWN');
  const hardBlocks = unsupported.filter(i => i.type === 'number' || i.type === 'explicit_claim');
  let severity: CCSeverity = 'ADVISORY';
  if (hardBlocks.length > 0) severity = 'HARD_BLOCK';
  else if (unsupported.length > 0) severity = 'SOFT_SIGNAL';
  return { unsupportedCount: unsupported.length, unsupportedItems: unsupported, hardBlocks, severity };
}

// ============================================================
// THE ADVERSARIAL VALIDATOR ([LJ], separately prompted)
// ============================================================
const ADV_VALIDATOR_SYSTEM = `You are an independent validator for a fiction revision. You did NOT generate the revision. Your job is to check whether it is safe to accept.

You will receive:
- the original passage
- the revised passage
- the character state (including what the character KNOWS, SUSPECTS, and does NOT know)
- information ownership (who knows what)
- canon state
- deferred checks
- a deterministic supported-specificity check listing items in the revised text with UNKNOWN provenance

CRITICAL DISTINCTION — fiction rewriting licenses some invention:
- OBSERVATION (sensory detail the character can perceive: "his pen tapped twice", "the room smelled of antiseptic") is LICENSED fictional invention. It is NOT a faithfulness violation. Do not FAIL faithfulness merely because a sensory/observable detail was added.
- STATE-SUPPORTED KNOWLEDGE/SUSPICION: if the character's state says they KNOW or SUSPECT a fact, the revision may reference it at the corresponding level (KNOWS → certainty; SUSPECTS → suspicion, NOT certainty). This is NOT an info-ownership violation.
- UNSUPPORTED FACTUAL SPECIFICITY: specific numbers (98.6, 120/80, 127, 4:15 AM), dates (March 14, 2019), named entities (Dr. Evelyn Marsh), measurements (1000ml), or quantities (fourteen pill bottles) that are NOT in the source passage or state. These ARE faithfulness violations. Plausibility is NOT evidence — a plausible-but-unsupported medical vital is still a FAIL.
- INFORMATION-OWNERSHIP LEAK: the revision has the POV character perceiving, knowing, stating, or confidently inferring a fact listed as UNKNOWN to them. Observable evidence is always allowed. Suspicion is allowed only if state = SUSPECTS. Certainty requires state = KNOWS.

For each dimension, return PASS, FAIL, or UNCLEAR:
- infoOwnership: FAIL only if the character asserts/perceives KNOWS-level certainty about a fact they do NOT know, or expresses suspicion when state = UNKNOWN. Observable evidence and inference from observable evidence are ALLOWED (PASS), not FAIL.
- faithfulness: FAIL only for unsupported NUMERIC/DATE/NAME/MEASUREMENT specifics (the categories above), NOT for added sensory observation, behavioral detail, or emotional inference that a character could reasonably perceive. Added observation is LICENSED invention, not a violation.
- canon: FAIL if it contradicts HARD_CANON or SOFT_CANON.
- deferred: FAIL if it resolves or explains a DEFERRED check.

Distinguish observation from inference:
- "He was shaking" = observation (PASS).
- "He was terrified" = inference (PASS unless the character cannot reasonably infer it).
- "He had stolen the money" = knowledge (PASS only if state = KNOWS; FAIL if UNKNOWN).

If a dimension is genuinely ambiguous (two reasonable readings), return UNCLEAR with a reason.

overall: "ACCEPT" if NO integrity dimension is FAIL. "REJECT" if any integrity dimension is FAIL. UNCLEAR alone does not force REJECT.

Return ONLY valid JSON.`;

export async function validateAdversarial(
  original: string,
  revised: string,
  state: DocumentState,
  ccVerdict: CCVerdict,
): Promise<ValidationResult & { _ccVerdict: CCVerdict; _provenance: ProvenanceItem[] }> {
  const ccBlock = ccVerdict.unsupportedCount > 0
    ? `\nDETERMINISTIC SUPPORTED-SPECIFICITY CHECK: ${ccVerdict.unsupportedCount} item(s) with UNKNOWN provenance:\n${ccVerdict.unsupportedItems.map(i => `- "${i.detail}" (${i.type}) — ${i.evidence}`).join('\n')}\nThese are candidate hallucinations. Verify each; do not dismiss without checking.\n`
    : `\nDETERMINISTIC SUPPORTED-SPECIFICITY CHECK: no items with UNKNOWN provenance detected.\n`;

  const user = `ORIGINAL:
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

CANON STATE:
${JSON.stringify(state.canon, null, 2)}

DEFERRED CHECKS:
${JSON.stringify(state.deferredChecks, null, 2)}
${ccBlock}
Validate the revised passage on each dimension. Return JSON:
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
  "reasons": ["one reason per dimension, citing specifics"]
}`;
  const raw = await llm(ADV_VALIDATOR_SYSTEM, user);
  const result = extractJSON(raw) as ValidationResult;
  return { ...result, _ccVerdict: ccVerdict, _provenance: ccVerdict.unsupportedItems };
}

// ============================================================
// FINAL DECISION POLICY (the thing being tested)
// ============================================================
// The current v2 policy is: ACCEPT iff validation.overall === 'ACCEPT'.
// Iteration 2 showed this is unsafe when [CC]=HARD and [LJ]=UNCLEAR/PASS.
// Iteration 3 tests a stricter policy: [CC] HARD_BLOCK is non-overridable.
export type FinalPolicy = 'v2_lj_only' | 'v3_cc_hard_nonoverridable';

export interface FinalDecision {
  policy: FinalPolicy;
  ljOverall: 'ACCEPT' | 'REJECT';
  ccSeverity: CCSeverity;
  finalDecision: 'ACCEPT' | 'REJECT';
  reason: string;
  conflictType: 'none' | 'cc_fail_lj_unclear' | 'cc_fail_lj_pass' | 'cc_pass_lj_fail' | 'cc_pass_lj_unclear' | 'both_fail';
}

export function applyFinalPolicy(ljResult: ValidationResult, ccVerdict: CCVerdict, policy: FinalPolicy): FinalDecision {
  const ljO = ljResult.overall;
  const ccS = ccVerdict.severity;
  let conflictType: FinalDecision['conflictType'] = 'none';
  const ccFail = ccS === 'HARD_BLOCK';
  const ljFail = ljO === 'REJECT';
  const ljUnclear = ljResult.faithfulness === 'UNCLEAR' || ljResult.infoOwnership === 'UNCLEAR';

  if (ccFail && ljFail) conflictType = 'both_fail';
  else if (ccFail && ljUnclear && !ljFail) conflictType = 'cc_fail_lj_unclear';
  else if (ccFail && !ljUnclear && !ljFail) conflictType = 'cc_fail_lj_pass';
  else if (!ccFail && ljFail) conflictType = 'cc_pass_lj_fail';
  else if (!ccFail && ljUnclear && !ljFail) conflictType = 'cc_pass_lj_unclear';

  let finalDecision: 'ACCEPT' | 'REJECT';
  let reason: string;

  if (policy === 'v2_lj_only') {
    finalDecision = ljO;
    reason = conflictType === 'cc_fail_lj_pass' || conflictType === 'cc_fail_lj_unclear'
      ? `v2 policy: [LJ] said ${ljO}; [CC] ${ccS} was ignored. THIS IS THE UNSAFE CASE BEING TESTED.`
      : `v2 policy: [LJ] said ${ljO}; [CC] ${ccS}.`;
  } else {
    // v3: [CC] HARD_BLOCK is non-overridable
    if (ccFail) {
      finalDecision = 'REJECT';
      reason = conflictType === 'cc_fail_lj_pass'
        ? `v3 policy: REJECTED because [CC] HARD_BLOCK is non-overridable, even though [LJ] said ACCEPT. ${ccVerdict.hardBlocks.length} hard block(s): ${ccVerdict.hardBlocks.map(b => b.detail).join(', ')}.`
        : conflictType === 'cc_fail_lj_unclear'
        ? `v3 policy: REJECTED because [CC] HARD_BLOCK is non-overridable; [LJ] UNCLEAR does not override. Hard blocks: ${ccVerdict.hardBlocks.map(b => b.detail).join(', ')}.`
        : `v3 policy: REJECTED ([CC] HARD_BLOCK + [LJ] REJECT agree).`;
    } else {
      finalDecision = ljO;
      reason = `v3 policy: no [CC] hard block; deferring to [LJ] ${ljO}. [CC] ${ccS}.`;
    }
  }

  return { policy, ljOverall: ljO, ccSeverity: ccS, finalDecision, reason, conflictType };
}
