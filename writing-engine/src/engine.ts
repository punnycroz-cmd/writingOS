// engine.ts — The Character Specificity decision loop, executable.
// Principle → Diagnostic → Detection → State Lookup → Severity → Decision → Intervention → Validation → Logging
// Every LLM call is a separate, independently-prompted stage (no self-validation).

import ZAI from 'z-ai-web-dev-sdk';
import type {
  DocumentState, DetectionResult, Severity, Decision,
  InterventionCandidate, ValidationResult, LogEntry, InterventionType,
} from './types.js';

// ---------- LLM helper ----------
async function llm(system: string, user: string): Promise<string> {
  const zai = await ZAI.create();
  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    thinking: { type: 'disabled' },
  });
  return completion.choices[0]?.message?.content ?? '';
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

export async function detect(passage: string, state: DocumentState): Promise<DetectionResult> {
  const user = `CHARACTER STATE:
${JSON.stringify(state.character, null, 2)}

INFORMATION OWNERSHIP (who knows what):
${JSON.stringify(state.informationOwnership, null, 2)}

CANON STATE:
${JSON.stringify(state.canon, null, 2)}

DEFERRED CHECKS (unresolved long-range setups):
${JSON.stringify(state.deferredChecks, null, 2)}

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
  return extractJSON(raw) as DetectionResult;
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

Check each dimension. A single FAIL on an integrity dimension (infoOwnership, canon, faithfulness, deferred) means the revision MUST be rejected, regardless of other passes.

Return ONLY valid JSON.`;

export async function validate(
  original: string,
  revised: string,
  state: DocumentState,
): Promise<ValidationResult> {
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
// STAGE 6 — THE LOOP (orchestrates all stages, produces LogEntry)
// ============================================================
export async function runLoop(
  caseId: string,
  passage: string,
  state: DocumentState,
): Promise<LogEntry> {
  const stateDiscovered: string[] = [];

  // 1. Detection
  const detection = await detect(passage, state);

  // 2. Severity (rule-based)
  const severity = assignSeverity(detection);

  // 3. Decision
  let decision = decide(severity, detection);

  // 4. Intervention (if permitted)
  let intervention: InterventionCandidate | null = null;
  if (decision === 'OPTIONAL_POLISH' || decision === 'TARGETED_REWRITE') {
    intervention = await intervene(passage, detection, state, decision);
  }

  // 5. Validation (independent, only if intervention generated)
  let validation: ValidationResult | null = null;
  let accepted = false;
  let finalText = passage;
  let effectiveDecision = decision;

  if (intervention) {
    validation = await validate(passage, intervention.revisedText, state);
    if (validation.overall === 'ACCEPT') {
      accepted = true;
      finalText = intervention.revisedText;
    } else {
      // Intervention blocked — fall back to original, record the block
      accepted = false;
      finalText = passage;
      effectiveDecision = 'BLOCK_INTERVENTION';
      stateDiscovered.push('Validation can override an accepted generation — independent validation is load-bearing, not decorative.');
    }
  } else if (decision === 'ACCEPT_UNCHANGED' || decision === 'DEFER' || decision === 'REJECT_AND_FLAG') {
    accepted = decision === 'ACCEPT_UNCHANGED';
  }

  // 6. Log
  const log: LogEntry = {
    timestamp: new Date().toISOString(),
    caseId,
    sceneId: state.sceneId,
    revisionId: state.revisionId,
    originalPassage: passage,
    diagnostic: 'character_specificity',
    detection,
    severity,
    decision: effectiveDecision,
    intervention,
    validation,
    accepted,
    finalText,
    remainingDeferred: state.deferredChecks.filter(d => d.status === 'DEFERRED').map(d => d.id),
    stateDiscovered,
  };
  return log;
}
