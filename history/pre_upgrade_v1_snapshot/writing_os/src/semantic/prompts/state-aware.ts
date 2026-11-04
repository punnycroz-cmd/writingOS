// src/semantic/prompts/state-aware.ts
// The state-aware validator prompt, assembled from system + rules + policy.

import { SYSTEM_PROMPT, STATE_AWARE_PROMPT, INVENTION_POLICY_PROMPTS, INTEGRITY_CONSTRAINTS } from './system.js';
import type { InventionPolicy } from '../types.js';

export function buildStateAwareSystemPrompt(policy: InventionPolicy): string {
  return `${SYSTEM_PROMPT}

${INVENTION_POLICY_PROMPTS[policy] || ''}

${STATE_AWARE_PROMPT}

${INTEGRITY_CONSTRAINTS}

Return ONLY valid JSON.`;
}

export function buildValidationUserPrompt(input: {
  originalText?: string;
  candidateText: string;
  documentState: any;
  handoffPayload?: any;
  triageAction: string;
}): string {
  const { originalText, candidateText, documentState, handoffPayload, triageAction } = input;
  const handoffBlock = handoffPayload
    ? `\nDETERMINISTIC HANDOFF PAYLOAD (triage action: ${triageAction}):\n${JSON.stringify(handoffPayload, null, 2)}\n\nThe deterministic layer deferred these semantic questions:\n${handoffPayload.recommendedSemanticQuestions?.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n') || '(none)'}\n`
    : `\nDETERMINISTIC TRIAGE ACTION: ${triageAction}\n`;

  return `ORIGINAL TEXT:
"""
${originalText || '(not provided)'}
"""

CANDIDATE TEXT:
"""
${candidateText}
"""

DOCUMENT STATE:
${JSON.stringify(documentState, null, 2)}
${handoffBlock}
Validate the candidate text. Return JSON:
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
  "reasons": ["one reason per dimension, citing specifics"],
  "epistemicLevelAssessed": "OBSERVATION"|"INTERPRETATION"|"SUSPICION"|"BELIEF"|"KNOWLEDGE"|"CERTAINTY"|"MIXED"|"NONE",
  "stateConsulted": true|false
}`;
}
