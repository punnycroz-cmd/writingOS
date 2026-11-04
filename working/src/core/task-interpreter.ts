/**
 * Writing OS Core — Natural Language Task Interpreter Engine (P7)
 * Translates arbitrary, unstructured natural language prompts into typed WritingTaskContract objects.
 * Detects ambiguities, implicit assumptions, and unknown registers without guessing.
 */

import { WritingTaskContract, TaskContractValidator } from './task-contract';

export type InferredRegister = 'fiction' | 'academic' | 'business' | 'technical' | 'legal' | 'general';
export type InferredTaskType = 'generation' | 'rewrite' | 'continuation' | 'transformation' | 'synthesis' | 'revision';

export interface TaskInterpretationResult {
  status: 'CONTRACT_COMPILED' | 'REQUIRES_CLARIFICATION_HANDOFF' | 'REQUIREMENT_CONFLICT_DETECTED';
  contract?: WritingTaskContract;
  inferredRegister: InferredRegister;
  inferredTaskType: InferredTaskType;
  confidenceScore: number; // 0.0 to 1.0
  detectedAmbiguities: string[];
  assumptionsMade: string[];
  rawPrompt: string;
}

export class TaskInterpreter {
  public static interpret(rawPrompt: string): TaskInterpretationResult {
    const promptLower = rawPrompt.trim().toLowerCase();
    const detectedAmbiguities: string[] = [];
    const assumptionsMade: string[] = [];

    // 1. Detect Vague Prompts
    if (/^(make this better|make it better|improve this|fix this|rewrite this please)$/i.test(promptLower)) {
      return {
        status: 'REQUIRES_CLARIFICATION_HANDOFF',
        inferredRegister: 'general',
        inferredTaskType: 'rewrite',
        confidenceScore: 0.25,
        detectedAmbiguities: ['Unspecified goal criteria: Prompt asks to "make better" without specifying clarity, conciseness, tone, or audience.'],
        assumptionsMade: [],
        rawPrompt,
      };
    }

    // 2. Infer Register
    let inferredRegister: InferredRegister = 'general';
    let registerConfidence = 0.6;

    if (/\b(?:chapter|scene|protagonist|dialogue|character|novel|fiction|story)\b/i.test(promptLower)) {
      inferredRegister = 'fiction';
      registerConfidence = 0.95;
    } else if (/\b(?:peer review|citation|hypothesis|methodology|doi|literature review|academic|journal)\b/i.test(promptLower)) {
      inferredRegister = 'academic';
      registerConfidence = 0.95;
    } else if (/\b(?:investor|pitch deck|executive memo|quarterly revenue|roi|business|cover letter|b2b)\b/i.test(promptLower)) {
      inferredRegister = 'business';
      registerConfidence = 0.90;
    } else if (/\b(?:api|endpoint|sdk|typescript|database schema|json|payload|technical)\b/i.test(promptLower)) {
      inferredRegister = 'technical';
      registerConfidence = 0.95;
    } else if (/\b(?:indemnify|jurisdiction|arbitration|liability|clause|statute|contract agreement|legal)\b/i.test(promptLower)) {
      inferredRegister = 'legal';
      registerConfidence = 0.95;
    } else {
      assumptionsMade.push('Defaulted to GENERAL register due to lack of distinct domain-specific terms.');
    }

    // 3. Infer Task Type
    let inferredTaskType: InferredTaskType = 'generation';
    if (/\b(?:continue|next chapter|pick up from)\b/i.test(promptLower)) {
      inferredTaskType = 'continuation';
    } else if (/\b(?:rewrite|paraphrase|rephrase|refactor)\b/i.test(promptLower)) {
      inferredTaskType = 'rewrite';
    } else if (/\b(?:synthesize|summarize|distill|notes into|meeting notes)\b/i.test(promptLower) || promptLower.includes('notes into')) {
      inferredTaskType = 'synthesis';
    } else if (/\b(?:transform|convert to)\b/i.test(promptLower)) {
      inferredTaskType = 'transformation';
    } else if (/\b(?:revise|audit and fix|polish)\b/i.test(promptLower)) {
      inferredTaskType = 'revision';
    }

    // 4. Check for ambiguous tone instructions
    if (/\b(?:make it more professional|sound professional)\b/i.test(promptLower) && !promptLower.includes('formal') && !promptLower.includes('concise')) {
      detectedAmbiguities.push('Ambiguous tone: "professional" interpreted as domain-appropriate clarity without unnecessary verbosity.');
      assumptionsMade.push('Constrained "professional" to direct objective tone.');
    }

    const confidenceScore = Number((registerConfidence * (detectedAmbiguities.length === 0 ? 1.0 : 0.75)).toFixed(2));

    const contract = TaskContractValidator.normalize({
      register: inferredRegister,
      objective: rawPrompt,
      stylePurityThreshold: 0.75,
      voice: {
        dominantRegister: inferredRegister,
        targetAudience: inferredRegister === 'business' ? 'Executive/Stakeholder' : 'General',
        formality: inferredRegister === 'academic' || inferredRegister === 'legal' ? 'FORMAL' : 'NEUTRAL',
      },
    });

    return {
      status: 'CONTRACT_COMPILED',
      contract,
      inferredRegister,
      inferredTaskType,
      confidenceScore,
      detectedAmbiguities,
      assumptionsMade,
      rawPrompt,
    };
  }
}
