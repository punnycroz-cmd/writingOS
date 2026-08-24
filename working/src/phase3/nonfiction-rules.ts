// working/src/phase3/nonfiction-rules.ts
// Formal epistemic rule definitions and violation categories for Nonfiction Writing OS.

export type EpistemicAssertionType =
  | 'DIRECT_ASSERTION'     // Unequivocal factual claim ("X is Y")
  | 'HEDGED_ASSERTION'     // Qualified/modal assertion ("Studies suggest X may be Y")
  | 'ATTRIBUTED_ASSERTION' // Cited attribution ("According to Author (2020), X is Y")
  | 'SPECULATIVE';         // Hypothesis / conjectural framing

export type EpistemicViolationType =
  | 'NF_RULE_01_UNHEDGED_BLOCKED_SOURCE' // Asserting unhedged facts backed by a BLOCKED/FAILED source
  | 'NF_RULE_02_UNGROUNDED_CLAIM'        // Asserting facts with zero representation in the ledger (hallucination)
  | 'NF_RULE_03_CAUSAL_OVERCLAIM'        // Asserting deterministic causality when ledger specifies correlation/observational
  | 'NF_RULE_04_TEMPORAL_ANACHRONISM'    // Claiming facts with contradicting or post-dated temporal bounds
  | 'NF_RULE_05_EVIDENTIAL_FABRICATION'; // Fabricating direct quote or evidence excerpt not in ledger

export interface EpistemicViolation {
  rule: EpistemicViolationType;
  severity: 'FATAL' | 'HIGH' | 'WARNING';
  claimId?: string;
  sourceId?: string;
  message: string;
  offendingText?: string;
}

export interface EpistemicRuleConfig {
  strictGrounding: boolean;      // If true, any ungrounded claim is FATAL
  allowAttributedBlocked: boolean;// If true, citing a blocked source with explicit caveat is allowed as WARNING
  requireCausalAlignment: boolean;// If true, correlation cannot be stated as causation
}

export const DEFAULT_EPISTEMIC_CONFIG: EpistemicRuleConfig = {
  strictGrounding: true,
  allowAttributedBlocked: true,
  requireCausalAlignment: true,
};
