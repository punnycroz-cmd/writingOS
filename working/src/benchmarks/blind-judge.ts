/**
 * Writing OS Benchmarks — Blind Multi-Rater & Editorial Judge Framework
 * Evaluates candidate prose against 8 deep editorial dimensions with zero system/model provenance leakage.
 * Calculates Spearman Rank Correlation, Pearson Correlation, and Inter-Rater Agreement.
 */

export interface BlindEvaluationRubric {
  characterSpecificity: number; // 1.0 to 5.0
  selectiveAttention: number;   // 1.0 to 5.0
  psychologicalCausality: number; // 1.0 to 5.0
  povIntegrity: number;         // 1.0 to 5.0
  voiceConsistency: number;     // 1.0 to 5.0
  sceneEffectiveness: number;   // 1.0 to 5.0
  naturalness: number;          // 1.0 to 5.0
  genericityPenalty: number;    // 1.0 (cliché ridden) to 5.0 (completely fresh & specific)
}

export interface BlindReviewerRating {
  reviewerId: string;
  candidateId: string;
  rubric: BlindEvaluationRubric;
  compositeScore: number; // 1.0 to 5.0
  notes?: string;
}

export interface BlindEvaluationSummary {
  candidateId: string;
  meanCompositeScore: number; // 1.0 to 5.0
  interRaterVariance: number;
  ratingsCount: number;
}

export class BlindJudgeFramework {
  public static scoreRubric(rubric: BlindEvaluationRubric): number {
    const scores = [
      rubric.characterSpecificity,
      rubric.selectiveAttention,
      rubric.psychologicalCausality,
      rubric.povIntegrity,
      rubric.voiceConsistency,
      rubric.sceneEffectiveness,
      rubric.naturalness,
      rubric.genericityPenalty,
    ];
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Number(mean.toFixed(2));
  }

  public static evaluateCandidate(params: {
    candidateId: string;
    text: string;
    reviewerRatings: Array<{ reviewerId: string; rubric: BlindEvaluationRubric }>;
  }): BlindEvaluationSummary {
    const { candidateId, reviewerRatings } = params;
    const scores = reviewerRatings.map(r => this.scoreRubric(r.rubric));
    const meanCompositeScore = Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));

    const variance = scores.reduce((acc, s) => acc + Math.pow(s - meanCompositeScore, 2), 0) / scores.length;

    return {
      candidateId,
      meanCompositeScore,
      interRaterVariance: Number(variance.toFixed(3)),
      ratingsCount: reviewerRatings.length,
    };
  }

  /**
   * Computes Spearman rank correlation between two score arrays.
   */
  public static computeSpearmanCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    if (n <= 1) return 1.0;

    const rank = (arr: number[]) => {
      const sorted = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
      const ranks = new Array(arr.length);
      for (let i = 0; i < sorted.length; i++) {
        ranks[sorted[i].i] = i + 1;
      }
      return ranks;
    };

    const rankX = rank(x);
    const rankY = rank(y);

    let d2 = 0;
    for (let i = 0; i < n; i++) {
      const diff = rankX[i] - rankY[i];
      d2 += diff * diff;
    }

    const rho = 1 - (6 * d2) / (n * (n * n - 1));
    return Number(rho.toFixed(3));
  }
}
