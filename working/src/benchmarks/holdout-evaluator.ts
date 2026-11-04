/**
 * Writing OS Benchmarks — Independent Holdout Rubric & Blind Pairwise Preference Framework
 * Evaluates candidate prose against independent criteria never used in P4/P5 design.
 * Computes blind pairwise head-to-head win rates.
 */

export interface HoldoutRubric {
  specificityOfDetail: number;   // 1.0 to 5.0
  narrativeEconomy: number;      // 1.0 to 5.0
  emotionalCredibility: number;  // 1.0 to 5.0
  dialogueNaturalness: number;   // 1.0 to 5.0
  sceneMemorability: number;     // 1.0 to 5.0
  informationTiming: number;     // 1.0 to 5.0
}

export interface PairwiseComparisonResult {
  winnerCandidateId: string;
  loserCandidateId: string;
  isTie: boolean;
  scoreDifference: number;
  raterRationale: string;
}

export class HoldoutEvaluator {
  public static scoreHoldout(rubric: HoldoutRubric): number {
    const scores = [
      rubric.specificityOfDetail,
      rubric.narrativeEconomy,
      rubric.emotionalCredibility,
      rubric.dialogueNaturalness,
      rubric.sceneMemorability,
      rubric.informationTiming,
    ];
    return Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
  }

  public static comparePairwise(
    candA: { id: string; rubric: HoldoutRubric },
    candB: { id: string; rubric: HoldoutRubric },
    raterRationale = 'Blind editorial comparative judgment'
  ): PairwiseComparisonResult {
    const scoreA = this.scoreHoldout(candA.rubric);
    const scoreB = this.scoreHoldout(candB.rubric);

    if (Math.abs(scoreA - scoreB) < 0.1) {
      return {
        winnerCandidateId: 'TIE',
        loserCandidateId: 'TIE',
        isTie: true,
        scoreDifference: 0,
        raterRationale,
      };
    }

    const winnerId = scoreA > scoreB ? candA.id : candB.id;
    const loserId = scoreA > scoreB ? candB.id : candA.id;

    return {
      winnerCandidateId: winnerId,
      loserCandidateId: loserId,
      isTie: false,
      scoreDifference: Number(Math.abs(scoreA - scoreB).toFixed(2)),
      raterRationale,
    };
  }

  public static computeWinRate(comparisons: PairwiseComparisonResult[], candidateId: string): number {
    if (comparisons.length === 0) return 0.0;
    const wins = comparisons.filter(c => c.winnerCandidateId === candidateId).length;
    return Number((wins / comparisons.length).toFixed(2));
  }
}
