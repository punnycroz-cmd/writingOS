/**
 * Writing OS Core — Quality Calibration Ledger
 * Bridges automated QualityScore (0.0 to 1.0) with external human editorial rubrics (1.0 to 5.0).
 * Measures correlation and tracks calibration drift.
 */

export interface CalibrationSample {
  sampleId: string;
  generationId: string;
  automatedQualityScore: number; // 0.0 to 1.0
  humanEditorialRating: number; // 1.0 to 5.0
  humanReviewerId: string;
  reviewerNotes?: string;
  dimensionRatings?: Record<string, number>;
  timestamp: number;
}

export interface CalibrationMetrics {
  totalSamples: number;
  meanAutomatedScore: number;
  meanHumanScore: number;
  pearsonCorrelation: number;
  meanAbsoluteError: number;
}

export class QualityCalibrationLedger {
  private static samples: Map<string, CalibrationSample> = new Map();

  public static recordSample(sample: CalibrationSample): void {
    this.samples.set(sample.sampleId, sample);
  }

  public static getSample(sampleId: string): CalibrationSample | undefined {
    return this.samples.get(sampleId);
  }

  public static getAllSamples(): CalibrationSample[] {
    return Array.from(this.samples.values());
  }

  public static clearSamples(): void {
    this.samples.clear();
  }

  /**
   * Calculates calibration metrics between automated QualityScores and human editorial scores.
   * Standardizes human ratings from [1.0, 5.0] to [0.0, 1.0] for direct MAE comparison.
   */
  public static computeMetrics(): CalibrationMetrics {
    const list = Array.from(this.samples.values());
    if (list.length === 0) {
      return {
        totalSamples: 0,
        meanAutomatedScore: 0,
        meanHumanScore: 0,
        pearsonCorrelation: 1.0,
        meanAbsoluteError: 0,
      };
    }

    const n = list.length;
    const autoScores = list.map(s => s.automatedQualityScore);
    const humanScores = list.map(s => (s.humanEditorialRating - 1.0) / 4.0); // Normalize 1-5 to 0-1

    const meanAuto = autoScores.reduce((a, b) => a + b, 0) / n;
    const meanHuman = humanScores.reduce((a, b) => a + b, 0) / n;

    // MAE
    const mae = list.reduce((acc, s, idx) => acc + Math.abs(autoScores[idx] - humanScores[idx]), 0) / n;

    // Pearson Correlation
    let num = 0;
    let denA = 0;
    let denH = 0;
    for (let i = 0; i < n; i++) {
      const diffA = autoScores[i] - meanAuto;
      const diffH = humanScores[i] - meanHuman;
      num += diffA * diffH;
      denA += diffA * diffA;
      denH += diffH * diffH;
    }

    const correlation = (denA > 0 && denH > 0) ? num / Math.sqrt(denA * denH) : 1.0;

    return {
      totalSamples: n,
      meanAutomatedScore: Number(meanAuto.toFixed(2)),
      meanHumanScore: Number((list.reduce((a, b) => a + b.humanEditorialRating, 0) / n).toFixed(2)),
      pearsonCorrelation: Number(correlation.toFixed(3)),
      meanAbsoluteError: Number(mae.toFixed(3)),
    };
  }
}
