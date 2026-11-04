/**
 * Writing OS Core — Production Cost & Latency Distribution Ledger (P18)
 * Computes p50, p90, p95, p99 percentiles for latency and cost, and detects cost anomalies.
 */

export interface CostDistributionPercentiles {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  mean: number;
}

export interface OperationalCostBreakdown {
  successfulWorkflowsAvgCostUSD: number;
  failedWorkflowsAvgCostUSD: number;
  abandonedWorkflowsAvgCostUSD: number;
}

export interface CostAnomalyReport {
  anomaliesDetectedCount: number;
  anomalyTypes: string[];
  requiresOperationalIntervention: boolean;
}

export class ProductionCostLedger {
  public static computeLatencyPercentiles(samplesMs: number[]): CostDistributionPercentiles {
    const sorted = [...samplesMs].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.50)] || 0;
    const p90 = sorted[Math.floor(sorted.length * 0.90)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
    const mean = sorted.reduce((sum, v) => sum + v, 0) / sorted.length;

    return {
      p50,
      p90,
      p95,
      p99,
      mean: Number(mean.toFixed(1)),
    };
  }

  public static computeCostPercentiles(samplesUSD: number[]): CostDistributionPercentiles {
    const sorted = [...samplesUSD].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.50)] || 0;
    const p90 = sorted[Math.floor(sorted.length * 0.90)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
    const mean = sorted.reduce((sum, v) => sum + v, 0) / sorted.length;

    return {
      p50: Number(p50.toFixed(4)),
      p90: Number(p90.toFixed(4)),
      p95: Number(p95.toFixed(4)),
      p99: Number(p99.toFixed(4)),
      mean: Number(mean.toFixed(4)),
    };
  }

  public static detectCostAnomalies(taskRun: {
    contextTokens: number;
    repairAttempts: number;
    assignedModelTier: string;
    taskComplexity: number;
  }): CostAnomalyReport {
    const anomalies: string[] = [];

    // 1. Check Context Explosion
    if (taskRun.contextTokens > 10000) {
      anomalies.push('CONTEXT_EXPLOSION: Context tokens exceeded 10,000 threshold.');
    }

    // 2. Check Repair Loop Explosion
    if (taskRun.repairAttempts > 3) {
      anomalies.push('REPAIR_LOOP_EXPLOSION: Repair attempts exceeded maximum safety ceiling of 3.');
    }

    // 3. Check Routing Regression
    if (taskRun.taskComplexity === 1 && taskRun.assignedModelTier === 'HIGH_REASONING_MODEL') {
      anomalies.push('ROUTING_REGRESSION: Trivial complexity task inappropriately routed to High Reasoning tier.');
    }

    return {
      anomaliesDetectedCount: anomalies.length,
      anomalyTypes: anomalies,
      requiresOperationalIntervention: anomalies.length > 0,
    };
  }
}
