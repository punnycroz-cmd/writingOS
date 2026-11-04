/**
 * Writing OS Academic Pack — Epistemic Claim-Evidence Intelligence (P9)
 * Enforces the formal invariant: ClaimStrength <= EvidenceStrength
 * Prevents observational/correlational findings from being exaggerated into definitive causation.
 */

export type EpistemicStrength = 'OBSERVED' | 'SUPPORTED' | 'INFERRED' | 'TENTATIVE' | 'SPECULATIVE';

export const EPISTEMIC_RANK: Record<EpistemicStrength, number> = {
  OBSERVED: 5,
  SUPPORTED: 4,
  INFERRED: 3,
  TENTATIVE: 2,
  SPECULATIVE: 1,
};

export interface AcademicClaimAudit {
  isEpistemicallyValid: boolean;
  claimStrength: EpistemicStrength;
  evidenceStrength: EpistemicStrength;
  explanation: string;
  violations: string[];
}

export class AcademicIntelligence {
  public static evaluateClaimVsEvidence(
    claimText: string,
    evidenceStrength: EpistemicStrength
  ): AcademicClaimAudit {
    const cLower = claimText.toLowerCase();
    let claimStrength: EpistemicStrength = 'SUPPORTED';

    if (/\b(?:proves conclusively|demonstrates indisputably|establishes causal link|causes)\b/i.test(cLower)) {
      claimStrength = 'OBSERVED';
    } else if (/\b(?:suggests|indicates|correlates with|is associated with)\b/i.test(cLower)) {
      claimStrength = 'TENTATIVE';
    } else if (/\b(?:might indicate|hypothetically|speculatively)\b/i.test(cLower)) {
      claimStrength = 'SPECULATIVE';
    }

    const claimRank = EPISTEMIC_RANK[claimStrength];
    const evidenceRank = EPISTEMIC_RANK[evidenceStrength];
    const violations: string[] = [];

    if (claimRank > evidenceRank) {
      violations.push(
        `Epistemic Exaggeration: Claim asserts strength "${claimStrength}" (Rank ${claimRank}) exceeding source evidence strength "${evidenceStrength}" (Rank ${evidenceRank}).`
      );
    }

    return {
      isEpistemicallyValid: violations.length === 0,
      claimStrength,
      evidenceStrength,
      explanation: violations.length === 0 
        ? 'Claim strength is fully grounded within evidence limits.' 
        : violations[0],
      violations,
    };
  }
}
