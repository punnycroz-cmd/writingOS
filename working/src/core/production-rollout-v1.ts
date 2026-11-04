/**
 * Writing OS Core — Controlled Production Rollout & Live Observability Engine (P31)
 * Implements progressive canary promotion (5% -> 100%), production SLO validation,
 * live telemetry metrics (safe autonomy rate, first-pass acceptance),
 * failure taxonomy analytics, and production drift detection.
 */

import { OperationalFailureMode } from './writing-os-distribution';

export type CanaryStage =
  | 'STAGE_1_5_PCT'
  | 'STAGE_2_10_PCT'
  | 'STAGE_3_25_PCT'
  | 'STAGE_4_50_PCT'
  | 'STAGE_5_100_PCT';

export interface ProductionSLOReport {
  integrityBreachesCount: number; // Must be 0
  staleCommitsCount: number;      // Must be 0
  crossTenantLeaksCount: number;  // Must be 0
  ghostCommitsCount: number;      // Must be 0
  unknownOutcomeMishandled: number; // Must be 0
  crashRecoverySuccessRate: number; // Must be 1.0 (100%)
  allSLOsMet: boolean;
}

export interface ProductionTelemetrySnapshot {
  totalTasksProcessed: number;
  safeAutonomyRate: number; // Tasks completed autonomously, accepted, and integrity-safe
  userAcceptedWithoutManualRepairRate: number; // First-pass clean acceptance
  controlledHandoffRate: number; // Proactive safe handoffs (Article IV success)
  latencyP50Ms: number;
  latencyP90Ms: number;
  latencyP95Ms: number;
  latencyP99Ms: number;
  avgCostPerTaskUsd: number;
  failureModeDistribution: Partial<Record<OperationalFailureMode, number>>;
}

export interface DriftAlert {
  driftDetected: boolean;
  metricName: string;
  observedValue: number;
  thresholdValue: number;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  generatedEvidenceCard: {
    cardId: string;
    description: string;
    recommendedAction: string;
  };
}

export class ProductionRolloutManager {
  private currentStage: CanaryStage = 'STAGE_1_5_PCT';

  public getCurrentStage(): CanaryStage {
    return this.currentStage;
  }

  /**
   * Evaluates production SLO compliance.
   */
  public static evaluateSLOs(metrics: {
    integrityBreaches: number;
    staleCommits: number;
    crossTenantLeaks: number;
    ghostCommits: number;
    unknownOutcomeMishandled: number;
    crashRecoverySuccessRate: number;
  }): ProductionSLOReport {
    const allMet =
      metrics.integrityBreaches === 0 &&
      metrics.staleCommits === 0 &&
      metrics.crossTenantLeaks === 0 &&
      metrics.ghostCommits === 0 &&
      metrics.unknownOutcomeMishandled === 0 &&
      metrics.crashRecoverySuccessRate >= 1.0;

    return {
      integrityBreachesCount: metrics.integrityBreaches,
      staleCommitsCount: metrics.staleCommits,
      crossTenantLeaksCount: metrics.crossTenantLeaks,
      ghostCommitsCount: metrics.ghostCommits,
      unknownOutcomeMishandled: metrics.unknownOutcomeMishandled,
      crashRecoverySuccessRate: metrics.crashRecoverySuccessRate,
      allSLOsMet: allMet,
    };
  }

  /**
   * Attempts progressive canary stage promotion.
   */
  public promoteCanaryStage(sloReport: ProductionSLOReport): {
    promoted: boolean;
    newStage: CanaryStage;
    reason: string;
  } {
    if (!sloReport.allSLOsMet) {
      return {
        promoted: false,
        newStage: this.currentStage,
        reason: 'Promotion blocked: One or more safety SLOs not satisfied.',
      };
    }

    const progression: Record<CanaryStage, CanaryStage> = {
      STAGE_1_5_PCT: 'STAGE_2_10_PCT',
      STAGE_2_10_PCT: 'STAGE_3_25_PCT',
      STAGE_3_25_PCT: 'STAGE_4_50_PCT',
      STAGE_4_50_PCT: 'STAGE_5_100_PCT',
      STAGE_5_100_PCT: 'STAGE_5_100_PCT',
    };

    const next = progression[this.currentStage];
    const promoted = next !== this.currentStage;
    this.currentStage = next;

    return {
      promoted,
      newStage: this.currentStage,
      reason: promoted
        ? `Successfully promoted to ${this.currentStage} with 100% SLO compliance.`
        : 'Already at maximum 100% production rollout.',
    };
  }

  /**
   * Aggregates live production telemetry across tasks.
   */
  public static calculateTelemetryMetrics(taskLogs: {
    isAutonomous: boolean;
    isAccepted: boolean;
    hasIntegrityViolation: boolean;
    requiredRepair: boolean;
    isControlledHandoff: boolean;
    latencyMs: number;
    costUsd: number;
    failureMode?: OperationalFailureMode;
  }[]): ProductionTelemetrySnapshot {
    if (taskLogs.length === 0) {
      return {
        totalTasksProcessed: 0,
        safeAutonomyRate: 1.0,
        userAcceptedWithoutManualRepairRate: 1.0,
        controlledHandoffRate: 0.0,
        latencyP50Ms: 0,
        latencyP90Ms: 0,
        latencyP95Ms: 0,
        latencyP99Ms: 0,
        avgCostPerTaskUsd: 0,
        failureModeDistribution: {},
      };
    }

    const total = taskLogs.length;
    const safeAutonomousCount = taskLogs.filter(
      t => t.isAutonomous && t.isAccepted && !t.hasIntegrityViolation
    ).length;
    const cleanFirstPassCount = taskLogs.filter(
      t => t.isAccepted && !t.requiredRepair
    ).length;
    const controlledHandoffCount = taskLogs.filter(
      t => t.isControlledHandoff
    ).length;

    // Latency sorting for percentiles
    const latencies = taskLogs.map(t => t.latencyMs).sort((a, b) => a - b);
    const getPercentile = (p: number) =>
      latencies[Math.min(Math.floor(latencies.length * p), latencies.length - 1)];

    const totalCost = taskLogs.reduce((sum, t) => sum + t.costUsd, 0);

    const failureDist: Partial<Record<OperationalFailureMode, number>> = {};
    for (const log of taskLogs) {
      if (log.failureMode) {
        failureDist[log.failureMode] = (failureDist[log.failureMode] || 0) + 1;
      }
    }

    return {
      totalTasksProcessed: total,
      safeAutonomyRate: safeAutonomousCount / total,
      userAcceptedWithoutManualRepairRate: cleanFirstPassCount / total,
      controlledHandoffRate: controlledHandoffCount / total,
      latencyP50Ms: getPercentile(0.50),
      latencyP90Ms: getPercentile(0.90),
      latencyP95Ms: getPercentile(0.95),
      latencyP99Ms: getPercentile(0.99),
      avgCostPerTaskUsd: totalCost / total,
      failureModeDistribution: failureDist,
    };
  }

  /**
   * Evaluates production drift against baseline thresholds.
   */
  public static checkProductionDrift(
    currentMetrics: ProductionTelemetrySnapshot,
    baseline: { maxAllowedControlledHandoffRate: number; maxAllowedAvgCostUsd: number }
  ): DriftAlert[] {
    const alerts: DriftAlert[] = [];

    if (currentMetrics.controlledHandoffRate > baseline.maxAllowedControlledHandoffRate) {
      alerts.push({
        driftDetected: true,
        metricName: 'CONTROLLED_HANDOFF_RATE',
        observedValue: currentMetrics.controlledHandoffRate,
        thresholdValue: baseline.maxAllowedControlledHandoffRate,
        severity: 'WARN',
        generatedEvidenceCard: {
          cardId: `EVID_DRIFT_HANDOFF_${Date.now()}`,
          description: `Handoff rate observed at ${(currentMetrics.controlledHandoffRate * 100).toFixed(1)}% exceeding baseline threshold of ${(baseline.maxAllowedControlledHandoffRate * 100).toFixed(1)}%.`,
          recommendedAction: 'Inspect task contract ambiguity distribution and consider calibrating register pack threshold.',
        },
      });
    }

    if (currentMetrics.avgCostPerTaskUsd > baseline.maxAllowedAvgCostUsd) {
      alerts.push({
        driftDetected: true,
        metricName: 'AVG_COST_PER_TASK_USD',
        observedValue: currentMetrics.avgCostPerTaskUsd,
        thresholdValue: baseline.maxAllowedAvgCostUsd,
        severity: 'WARN',
        generatedEvidenceCard: {
          cardId: `EVID_DRIFT_COST_${Date.now()}`,
          description: `Average cost per task of $${currentMetrics.avgCostPerTaskUsd.toFixed(4)} exceeded ceiling of $${baseline.maxAllowedAvgCostUsd.toFixed(4)}.`,
          recommendedAction: 'Adjust Policy Registry routing to direct repair candidates to tier-2 model adapters.',
        },
      });
    }

    return alerts;
  }
}
