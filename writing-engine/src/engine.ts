// engine.ts — The Character Specificity decision loop, Iteration 2.
// [CC] pre-pass → [LJ] Detection → State Lookup → Severity → Decision → [LJ] Intervention → [CC] supported-specificity → [LJ] Validation → Logging
// Every LLM call is a separate, independently-prompted stage (no self-validation).
// Deterministic checks gate and inform LLM stages but do not replace semantic judgment
// (except where the signal is conclusive, e.g. exact deferred-anchor match).

import ZAI from 'z-ai-web-dev-sdk';
import type {
  DocumentState, DetectionResult, Severity, Decision,
  InterventionCandidate, ValidationResult, LogEntry, InterventionType,
  DeterministicChecks, StateTransition,
} from './types.js';
import {
  checkDeferredAnchor, checkSupportedSpecificity, canonKeywordAlert,
  type DeferredAnchorResult,
} from './deterministic.js';

// ---------- LLM helper (with retry + rate-limit backoff) ----------
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
        const wait = 15000 * Math.pow(2, attempt); // 15s, 30s, 60s, 120s
        console.error(`  [rate-limit] 429 on attempt ${attempt + 1}; waiting ${wait / 1000}s...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      throw e;
    }
  }
  throw new Error('unreachable');
}

// Robust JSON extraction (models sometimes wrap in ```json or add prose)
function extractJSON(text: string): any {
  // Try direct parse
  try { return JSON.parse(text); } catch {}
  // Try fenced block
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  // Try first { ... last }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last > first) {
    try { return JSON.parse(text.slice(first, last + 1)); } catch {}
  }
  throw new Error('Could not parse JSON from LLM output:\n' + text.slice(0, 500));
}

// ============================================================
// STAGE 1 — DETECTION (the diagnostic, [LJ])
// ============================================================
const DETECT_SYSTEM = `You are a fiction editor evaluating CHARACTER SPECIFICITY.
The governing principle: naturalness arises from the felt texture of a PARTICULAR character's mind in a specific situation — not from generic "realistic" prose.

A passage is GENERIC if its perception/reaction could belong to almost any protagonist.
A passage is CHARACTER_SPECIFIC if what is noticed and how it is interpreted is causally tied to THIS character's established state (goals, fears, memories, habits, knowledge).
A passage is INTENTIONALLY_GENERIC if the flatness IS the narrative point (e.g., depersonalization, shock, drone-like routine).
A passage is a CANON_VIOLATION if it contradicts established canon (e.g., a blind character seeing).
A passage is DEFERRED_CONTEXT if its meaning depends on an unresolved future payoff (e.g., a planted clue).

You MUST ground every judgment in the provided character state, canon, and information ownership. Do not invent character traits. Return ONLY valid JSON.`;

export async function detect(
  passage: string,
  state: DocumentState,
  deferredHint?: DeferredAnchorResult,
  canonAlerts?: { canonFact: string; alertKeyword: string; passageSnippet: string }[],
): Promise<DetectionResult> {
  let hintBlock = '';
  if (deferredHint && deferredHint.relevance !== 'NO_DEFERRED_RELEVANCE') {
    hintBlock += `\nDETERMINISTIC PRE-PASS SIGNAL: A deferred-check anchor was detected in or near this passage (${deferredHint.relevance}, overlap: ${deferredHint.overlapType ?? 'n/a'}, matched: "${deferredHint.matchedAnchor ?? ''}"). You MUST classify this passage as DEFERRED_CONTEXT if the anchor is genuinely present.\n`;
  }
  if (canonAlerts && canonAlerts.length > 0) {
    hintBlock += `\nCANON KEYWORD ALERT: Potential HARD_CANON conflict detected — ${canonAlerts.map(a => a.alertKeyword + ' ("' + a.canonFact + '")').join('; ')}. Investigate carefully.\n`;
  }
  const user = `CHARACTER STATE:
${JSON.stringify(state.character, null, 2)}

INFORMATION OWNERSHIP (who knows what):
${JSON.stringify(state.informationOwnership, null, 2)}

CANON STATE:
${JSON.stringify(state.canon, null, 2)}

DEFERRED CHECKS (unresolved long-range setups):
${JSON.stringify(state.deferredChecks, null, 2)}
${hintBlock}
PASSAGE TO EVALUATE:
"""
${passage}
"""

Evaluate this passage's character specificity. Return JSON exactly:
{
  "classification": "GENERIC" | "CHARACTER_SPECIFIC" | "INTENTIONALLY_GENERIC" | "CANON_VIOLATION" | "DEFERRED_CONTEXT",
  "evidence": ["specific detail present that ties to THIS character", ...],
  "absentDetails": ["specific detail this character would plausibly notice but is missing", ...],
  "narrativelyPurposeful": true | false,
  "canonConflicts": ["any contradiction with canon", ...],
  "reasoning": "one paragraph"
}`;
  const raw = await llm(DETECT_SYSTEM, user);
  const result = extractJSON(raw) as DetectionResult;
  // Deterministic override: if the pre-pass found an EXACT anchor match, force DEFERRED_CONTEXT
  // regardless of what the LLM said. (POSSIBLY_RELATED is only a hint, not an override.)
  if (deferredHint && deferredHint.relevance === 'DEFERRED_ANCHOR_PRESENT' && result.classification !== 'CANON_VIOLATION') {
    result.classification = 'DEFERRED_CONTEXT';
    result.reasoning = `[CC] Forced DEFERRED_CONTEXT: deterministic anchor cross-reference found exact match for deferred check ${deferredHint.matchedCheckId}. ` + result.reasoning;
  }
  return result;
}

// ============================================================
// STAGE 2 — SEVERITY (rule-based, NOT LLM — no [CAL] thresholds)
// ============================================================
// Qualitative mapping derived from detection class + canon conflicts.
// Deliberately NOT numeric. Thresholds are [CAL] until locally calibrated.
export function assignSeverity(detection: DetectionResult): Severity {
  // Canon violations are always CRITICAL — integrity risk outweighs genericity.
  if (detection.canonConflicts.length > 0) return 'CRITICAL';
  switch (detection.classification) {
    case 'CANON_VIOLATION': return 'CRITICAL';
    case 'CHARACTER_SPECIFIC': return 'NONE';
    case 'INTENTIONALLY_GENERIC': return 'NONE';
    case 'DEFERRED_CONTEXT': return 'NONE';  // deferred = do not judge yet
    case 'GENERIC': return detection.narrativelyPurposeful ? 'MINOR' : 'MATERIAL';
    default: return 'NONE';
  }
}

// ============================================================
// STAGE 3 — DECISION (what intervention is permitted)
// ============================================================
export function decide(severity: Severity, detection: DetectionResult): Decision {
  switch (severity) {
    case 'NONE':
      if (detection.classification === 'DEFERRED_CONTEXT') return 'DEFER';
      return 'ACCEPT_UNCHANGED';
    case 'MINOR': return 'OPTIONAL_POLISH';
    case 'MATERIAL': return 'TARGETED_REWRITE';
    case 'CRITICAL':
      // Canon violation cannot be fixed by a specificity intervention — escalate.
      return 'REJECT_AND_FLAG';
  }
}

// ============================================================
// STAGE 4 — INTERVENTION (constrained generation, [LJ])
// ============================================================
const ALLOWED_TYPES_BY_DECISION: Record<string, InterventionType[]> = {
  OPTIONAL_POLISH: ['lexical_substitution', 'rhythm'],
  TARGETED_REWRITE: ['perception_detail', 'attention_detail', 'internal_thought', 'sensory_detail', 'memory_reference', 'metaphor', 'rhythm'],
};

const INTERVENE_SYSTEM = `You are a fiction reviser. You increase CHARACTER SPECIFICITY through a causal chain:
Character State → Attention → Interpretation → Emotion → Intention → Language/Action

You are NOT maximizing statistical variation (sentence-length variance, lexical diversity, metaphor density). You are adding details that THIS character would plausibly notice or think BECAUSE of their established state.

HARD CONSTRAINTS (violating any means the revision is invalid):
1. Use ONLY information the character possesses (per Information Ownership). Characters CANNOT perceive, notice, or think about facts listed as "unknown" to them.
2. Do NOT contradict Canon State (HARD_CANON and SOFT_CANON).
3. Do NOT invent facts (dates, names, statistics, places) not in the source passage or state.
4. Do NOT resolve or explain any DEFERRED check — leave its ambiguity intact.
5. Preserve the scene's function and intended meaning.
6. Preserve the character's established voice.
7. Do NOT add visual perception for a blind character (or analogous sensory canon).

Return ONLY valid JSON.`;

export async function intervene(
  passage: string,
  detection: DetectionResult,
  state: DocumentState,
  decision: Decision,
): Promise<InterventionCandidate | null> {
  if (decision !== 'OPTIONAL_POLISH' && decision !== 'TARGETED_REWRITE') return null;
  const allowed = ALLOWED_TYPES_BY_DECISION[decision];
  const user = `ORIGINAL PASSAGE:
"""
${passage}
"""

DETECTION (what the diagnostic found):
${JSON.stringify(detection, null, 2)}

CHARACTER STATE:
${JSON.stringify(state.character, null, 2)}

INFORMATION OWNERSHIP (CRITICAL — characters cannot perceive facts listed as "unknown" to them):
${JSON.stringify(state.informationOwnership, null, 2)}

CANON STATE (do not contradict HARD_CANON or SOFT_CANON):
${JSON.stringify(state.canon, null, 2)}

DEFERRED CHECKS (do NOT resolve these — preserve ambiguity):
${JSON.stringify(state.deferredChecks, null, 2)}

ALLOWED INTERVENTION TYPES: ${allowed.join(', ')}

Generate a revised passage that increases character specificity using ONLY the allowed intervention types and respecting ALL hard constraints. The revision should add details this specific character would notice given their goals, fears, memories, perceptual habits, and current knowledge.

Return JSON:
{
  "revisedText": "the full revised passage",
  "interventionTypes": ["which types you actually used"],
  "stateUsed": ["which state fields informed specific additions"],
  "constraintsApplied": ["which constraints you checked"]
}`;
  const raw = await llm(INTERVENE_SYSTEM, user);
  return extractJSON(raw) as InterventionCandidate;
}

// ============================================================
// STAGE 5 — INDEPENDENT VALIDATION ([LJ], separately prompted)
// ============================================================
// The generator does not validate itself. This stage receives original + revised
// and checks nine dimensions independently.
const VALIDATE_SYSTEM = `You are an independent validator for a fiction revision. You did NOT generate the revision. Your job is to check whether it is safe to accept.

You may receive a DETERMINISTIC SUPPORTED-SPECIFICITY CHECK result listing items in the revised text not found in source or state. Treat these as strong signals of potential hallucination, but verify each: some may be supported by an aspect of state the string-match missed (e.g., a memory describing the same item in different words). Make your own judgment, but do not ignore the signal.

Check each dimension. A single FAIL on an integrity dimension (infoOwnership, canon, faithfulness, deferred) means the revision MUST be rejected, regardless of other passes.

Return ONLY valid JSON.`;

export async function validate(
  original: string,
  revised: string,
  state: DocumentState,
  ccUnsupported?: { type: string; value: string }[],
): Promise<ValidationResult> {
  let ccBlock = '';
  if (ccUnsupported && ccUnsupported.length > 0) {
    ccBlock = `\nDETERMINISTIC SUPPORTED-SPECIFICITY CHECK found ${ccUnsupported.length} item(s) in the revised text NOT present in source or state: ${ccUnsupported.map(i => i.value).join(', ')}. Treat these as candidate hallucinations and verify whether they are genuinely invented or supported by an aspect of state you can identify.\n`;
  } else if (ccUnsupported && ccUnsupported.length === 0) {
    ccBlock = `\nDETERMINISTIC SUPPORTED-SPECIFICITY CHECK: no unsupported numbers/proper-nouns detected. This is favorable but not conclusive — continue to check faithfulness semantically.\n`;
  }
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
Validate the revised passage on each dimension:
- meaning: Did the intended meaning survive?
- character: Is it more specific without becoming inconsistent with the character?
- infoOwnership: Did the character use ONLY information they possess? (FAIL if the revised text shows the character perceiving/knowing a fact listed as "unknown" to them)
- canon: Does it contradict any HARD_CANON or SOFT_CANON fact?
- voice: Does it preserve the character's established voice?
- register: Is it appropriate for literary fiction?
- intelligibility: Did the change harm clarity?
- deferred: Did it accidentally resolve or explain a DEFERRED check? (FAIL if yes)
- faithfulness: Did it invent facts (dates, names, statistics, places) not in source or state?

Each dimension: "PASS", "FAIL", or "UNCLEAR", plus a reason.
overall: "ACCEPT" only if NO integrity dimension (infoOwnership, canon, faithfulness, deferred) FAILED. Otherwise "REJECT".

Return JSON:
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
  "reasons": ["one reason per checked dimension, citing specifics"]
}`;
  const raw = await llm(VALIDATE_SYSTEM, user);
  return extractJSON(raw) as ValidationResult;
}

// ============================================================
// STAGE — THE LOOP (Iteration 2: [CC] pre-pass + [LJ] stages + [CC] post-pass)
// ============================================================
export async function runLoop(
  caseId: string,
  passage: string,
  state: DocumentState,
  priorTransitions: StateTransition[] = [],
): Promise<LogEntry> {
  const stateDiscovered: string[] = [];
  let reason = '';

  // 0. [CC] PRE-PASS: deferred-anchor cross-reference + canon keyword alert
  const deferredAnchor = checkDeferredAnchor(passage, state.deferredChecks);
  const canonAlerts = canonKeywordAlert(passage, state);
  let supportedSpecificity: DeterministicChecks['supportedSpecificity'] = null;

  // 1. [LJ] Detection (informed by [CC] hints; overridden if exact anchor found)
  const detection = await detect(passage, state, deferredAnchor, canonAlerts);

  // 2. Severity (rule-based)
  const severity = assignSeverity(detection);

  // 3. Decision
  let decision = decide(severity, detection);

  // 4. [LJ] Intervention (if permitted)
  let intervention: InterventionCandidate | null = null;
  if (decision === 'OPTIONAL_POLISH' || decision === 'TARGETED_REWRITE') {
    intervention = await intervene(passage, detection, state, decision);
  }

  // 4a. [CC] POST-PASS: supported-specificity check on the intervention
  if (intervention) {
    const ss = checkSupportedSpecificity(intervention.revisedText, passage, state);
    supportedSpecificity = { unsupported: ss.unsupported, total: ss.total, unsupportedCount: ss.unsupportedCount };
    if (ss.unsupportedCount > 0) {
      stateDiscovered.push(`[CC] supported-specificity check flagged ${ss.unsupportedCount} unsupported item(s): ${ss.unsupported.map(i => i.value).join(', ')}`);
    }
  }

  // 5. [LJ] Independent Validation (informed by [CC] supported-specificity)
  let validation: ValidationResult | null = null;
  let accepted = false;
  let finalText = passage;
  let effectiveDecision = decision;

  if (intervention) {
    validation = await validate(passage, intervention.revisedText, state, supportedSpecificity?.unsupported);
    if (validation.overall === 'ACCEPT') {
      accepted = true;
      finalText = intervention.revisedText;
      reason = `Intervention accepted: validation passed all 9 dimensions. [CC] supported-specificity: ${supportedSpecificity?.unsupportedCount ?? 0} unsupported item(s) found.`;
    } else {
      accepted = false;
      finalText = passage;
      effectiveDecision = 'BLOCK_INTERVENTION';
      const failedDims = ['infoOwnership','canon','faithfulness','deferred'].filter(d => (validation as any)[d] === 'FAIL');
      reason = `Intervention blocked by independent validation. Failed integrity dimension(s): ${failedDims.join(', ') || 'none (non-integrity fail)'}. [CC] unsupported: ${supportedSpecificity?.unsupportedCount ?? 0}.`;
      stateDiscovered.push('Independent validation blocked an intervention the generator produced — generation/validation separation is load-bearing.');
    }
  } else if (decision === 'ACCEPT_UNCHANGED') {
    accepted = true;
    reason = `No intervention needed. Detection: ${detection.classification}; severity ${severity}.`;
  } else if (decision === 'DEFER') {
    accepted = false;
    reason = `Deferred — cannot judge until later context. Deferred checks: ${state.deferredChecks.filter(d => d.status === 'DEFERRED').map(d => d.id).join(', ') || 'none'}. [CC] anchor relevance: ${deferredAnchor.relevance}.`;
  } else if (decision === 'REJECT_AND_FLAG') {
    accepted = false;
    reason = `Canon violation flagged for author attention. [CC] canon alerts: ${canonAlerts.length}.`;
  }

  // 6. Log
  const log: LogEntry = {
    timestamp: new Date().toISOString(),
    caseId,
    sceneId: state.sceneId,
    revisionId: state.revisionId,
    originalPassage: passage,
    diagnostic: 'character_specificity',
    deterministicChecks: {
      deferredAnchor: {
        relevance: deferredAnchor.relevance,
        matchedCheckId: deferredAnchor.matchedCheckId,
        overlapType: deferredAnchor.overlapType,
        jaccardScore: deferredAnchor.jaccardScore,
      },
      canonAlerts,
      supportedSpecificity,
    },
    detection,
    severity,
    decision: effectiveDecision,
    intervention,
    validation,
    accepted,
    finalText,
    reason,
    remainingDeferred: state.deferredChecks.filter(d => d.status === 'DEFERRED').map(d => d.id),
    stateDiscovered,
    stateTransitions: priorTransitions,
    inputStateSummary: `char=${state.character.identity.split('—')[0].trim()}; infoOwnership entries=${state.informationOwnership.entries.length}; canon facts=${state.canon.facts.length}; deferred=${state.deferredChecks.length}`,
  };
  return log;
}
