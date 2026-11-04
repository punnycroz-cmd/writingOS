// src/semantic/generation.ts
// Repair generation for candidates that were REJECTED or UNCLEAR.
//
// The generation step produces a revised candidate that attempts to fix
// the identified semantic violations while preserving meaning, voice,
// and register. The revised candidate is then revalidated.

import ZAI from 'z-ai-web-dev-sdk';
import type { DocumentState, InventionPolicy, SemanticValidationResult } from './types.js';
import { INVENTION_POLICY_PROMPTS } from './prompts/system.js';

const GENERATION_SYSTEM = `You are a fiction (or nonfiction) reviser. You increase CHARACTER SPECIFICITY and repair semantic violations through a causal chain:
Character State → Attention → Interpretation → Emotion → Intention → Language/Action

You are NOT maximizing statistical variation. You are adding details that THIS character would plausibly notice BECAUSE of their established state.

HARD CONSTRAINTS (violating any means the revision is invalid):
1. Use ONLY information the character possesses (per Information Ownership). Characters CANNOT perceive, notice, or think about facts listed as "unknown" to them.
2. Do NOT contradict Canon State (HARD_CANON and SOFT_CANON).
3. Do NOT invent facts (dates, names, statistics, places) not in the source passage or state.
4. Do NOT resolve or explain any DEFERRED check — leave its ambiguity intact.
5. Preserve the scene's function and intended meaning.
6. Preserve the character's established voice.
7. Do NOT add perception via a sense the character lacks (canon-dependent).

Return ONLY valid JSON.`;

export interface GenerationInput {
  originalText: string;
  candidateText: string;
  documentState: DocumentState;
  inventionPolicy: InventionPolicy;
  validationResult: SemanticValidationResult;
}

export interface GenerationResult {
  revisedText: string;
  interventionTypes: string[];
  stateUsed: string[];
  constraintsApplied: string[];
  executionMode: 'LLM' | 'EXECUTION_ERROR';
  error?: string;
}

export async function generateRepair(input: GenerationInput): Promise<GenerationResult> {
  const { originalText, candidateText, documentState, inventionPolicy, validationResult } = input;

  const failedDimensions = validationResult.dimensions
    .filter(d => d.verdict === 'FAIL')
    .map(d => `${d.dimension}: ${d.reason}`);

  const userPrompt = `INVENTION POLICY: ${inventionPolicy}
${INVENTION_POLICY_PROMPTS[inventionPolicy] || ''}

ORIGINAL TEXT:
"""
${originalText}
"""

CANDIDATE TEXT (to be repaired):
"""
${candidateText}
"""

DOCUMENT STATE:
${JSON.stringify(documentState, null, 2)}

VALIDATION FAILURES TO FIX:
${failedDimensions.length > 0 ? failedDimensions.join('\n') : 'None (repair for specificity improvement)'}

ARBITRATION PATH: ${validationResult.arbitrationPath || 'n/a'}

Generate a repaired candidate that fixes the identified violations while preserving meaning, voice, and register. If the candidate cannot be safely repaired (e.g., it requires inventing facts), return the original text unchanged and explain why.

Return JSON:
{
  "revisedText": "the full repaired passage",
  "interventionTypes": ["which types you used"],
  "stateUsed": ["which state fields informed the repair"],
  "constraintsApplied": ["which constraints you checked"]
}`;

  try {
    const zai = await ZAI.create();
    for (let attempt = 0; attempt <= 3; attempt++) {
      try {
        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: GENERATION_SYSTEM },
            { role: 'user', content: userPrompt },
          ],
          thinking: { type: 'disabled' },
        });
        const content = completion.choices[0]?.message?.content ?? '';
        // Parse JSON
        try { return { ...JSON.parse(content), executionMode: 'LLM' as const }; }
        catch {
          const fence = content.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (fence) { return { ...JSON.parse(fence[1]), executionMode: 'LLM' as const }; }
          throw new Error('JSON parse failed');
        }
      } catch (e: any) {
        const msg = String(e?.message || e);
        if ((msg.includes('429') || msg.includes('Too many requests')) && attempt < 3) {
          await new Promise(r => setTimeout(r, 15000 * Math.pow(2, attempt)));
          continue;
        }
        throw e;
      }
    }
    return { revisedText: candidateText, interventionTypes: [], stateUsed: [], constraintsApplied: [], executionMode: 'EXECUTION_ERROR', error: 'max retries' };
  } catch (e: any) {
    return { revisedText: candidateText, interventionTypes: [], stateUsed: [], constraintsApplied: [], executionMode: 'EXECUTION_ERROR', error: String(e?.message || e) };
  }
}
