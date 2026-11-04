/**
 * Writing OS Core — Requirement Conflict Engine (P7)
 * Detects mutually exclusive constraint pairs in natural language requests or task contracts.
 * e.g., "Make it shorter" vs "Do not remove any information"
 */

export interface ConflictingRequirementPair {
  requirementA: string;
  requirementB: string;
  conflictType: 'BREVITY_VS_COMPLETENESS' | 'EXACT_VERBATIM_VS_HEAVY_REWRITE' | 'FORMAL_VS_SLANG';
  explanation: string;
  resolutionStrategy: 'PRIORITIZE_CONSTITUTIONAL_INTEGRITY' | 'HANDOFF_REQUIREMENT_CONFLICT';
}

export interface RequirementConflictReport {
  hasConflict: boolean;
  conflictingPairs: ConflictingRequirementPair[];
  recommendedAction: 'PROCEED_WITH_PRECEDENCE' | 'HALT_AND_HANDOFF';
}

export class RequirementConflictEngine {
  public static auditPromptConflicts(prompt: string): RequirementConflictReport {
    const pLower = prompt.toLowerCase();
    const conflictingPairs: ConflictingRequirementPair[] = [];

    // 1. Check Brevity vs Completeness conflict
    const asksShorter = /\b(?:make this shorter|reduce length|cut down|brief|concise)\b/i.test(pLower);
    const asksPreserveAll = /\b(?:do not remove any (?:information|facts|details)|keep all details|preserve every detail|no cuts)\b/i.test(pLower);

    if (asksShorter && asksPreserveAll) {
      conflictingPairs.push({
        requirementA: 'Make text shorter',
        requirementB: 'Do not remove any information/details',
        conflictType: 'BREVITY_VS_COMPLETENESS',
        explanation: 'The request demands significant condensation while simultaneously prohibiting any deletion of detail.',
        resolutionStrategy: 'HANDOFF_REQUIREMENT_CONFLICT',
      });
    }

    // 2. Check Verbatim vs Heavy Rewrite conflict
    const asksVerbatim = /\b(?:use exact source wording|preserve exact phrasing|verbatim)\b/i.test(pLower);
    const asksHeavyRewrite = /\b(?:rewrite substantially|completely rewrite|overhaul voice)\b/i.test(pLower);

    if (asksVerbatim && asksHeavyRewrite) {
      conflictingPairs.push({
        requirementA: 'Preserve exact wording verbatim',
        requirementB: 'Substantially rewrite text',
        conflictType: 'EXACT_VERBATIM_VS_HEAVY_REWRITE',
        explanation: 'The request demands keeping exact original phrasing while simultaneously overhauling the text.',
        resolutionStrategy: 'HANDOFF_REQUIREMENT_CONFLICT',
      });
    }

    const hasConflict = conflictingPairs.length > 0;
    const recommendedAction = hasConflict ? 'HALT_AND_HANDOFF' : 'PROCEED_WITH_PRECEDENCE';

    return {
      hasConflict,
      conflictingPairs,
      recommendedAction,
    };
  }
}
