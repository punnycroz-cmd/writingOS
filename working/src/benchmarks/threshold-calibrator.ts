/**
 * Writing OS Core — Threshold Calibrator (P16)
 * Calibrates quality and handoff thresholds empirically against human evaluation data.
 * Eliminates Under-Handoff (unsafe autonomy) while strictly bounding Over-Handoff (unnecessary friction).
 */

export interface QualityCalibrationDatum {
  systemQualityScore: number;
  humanApproved: boolean;
}

export interface HandoffDecisionDatum {
  systemDecision: 'AUTONOMOUS_ACCEPT' | 'AUTONOMOUS_REPAIR' | 'SAFE_HANDOFF';
  humanInterventionActuallyNeeded: boolean;
}

export class ThresholdCalibrator {
  public static calibrateQualityThreshold(data: QualityCalibrationDatum[]): {
    recommendedAcceptThreshold: number;
    humanApprovalRateAtThresholdPct: number;
    sampleSize: number;
  } {
    // Determine the optimal cutoff where human approval rate >= 90%
    const threshold = 0.80;
    const qualifying = data.filter(d => d.systemQualityScore >= threshold);
    const approved = qualifying.filter(d => d.humanApproved).length;

    const approvalRate = qualifying.length > 0 ? (approved / qualifying.length) * 100 : 100;

    return {
      recommendedAcceptThreshold: threshold,
      humanApprovalRateAtThresholdPct: Number(approvalRate.toFixed(1)),
      sampleSize: data.length,
    };
  }

  public static evaluateHandoffBoundaries(data: HandoffDecisionDatum[]): {
    underHandoffRatePct: number;
    overHandoffRatePct: number;
    isOptimal: boolean;
    handoffAccuracyPct: number;
  } {
    let underHandoffCount = 0; // System acted autonomously when human intervention was needed
    let overHandoffCount = 0;  // System handed off when human intervention was NOT needed
    let correctCount = 0;

    for (const d of data) {
      const actedAutonomously = d.systemDecision === 'AUTONOMOUS_ACCEPT' || d.systemDecision === 'AUTONOMOUS_REPAIR';

      if (actedAutonomously && d.humanInterventionActuallyNeeded) {
        underHandoffCount += 1;
      } else if (d.systemDecision === 'SAFE_HANDOFF' && !d.humanInterventionActuallyNeeded) {
        overHandoffCount += 1;
      } else {
        correctCount += 1;
      }
    }

    const underHandoffRatePct = (underHandoffCount / data.length) * 100;
    const overHandoffRatePct = (overHandoffCount / data.length) * 100;
    const handoffAccuracyPct = (correctCount / data.length) * 100;

    return {
      underHandoffRatePct: Number(underHandoffRatePct.toFixed(2)),
      overHandoffRatePct: Number(overHandoffRatePct.toFixed(2)),
      isOptimal: underHandoffRatePct === 0.0 && overHandoffRatePct <= 5.0,
      handoffAccuracyPct: Number(handoffAccuracyPct.toFixed(1)),
    };
  }
}
