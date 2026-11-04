/**
 * Writing OS Core — Operational Telemetry & Cost / Latency Observability (P8)
 * Measures token usage, stage latencies, financial costs, and structured failure categories.
 */

export type FailureCategory = 
  | 'NONE'
  | 'TASK_AMBIGUOUS' 
  | 'STATE_INSUFFICIENT' 
  | 'STATE_CONFLICT' 
  | 'GENERATION_FAILURE' 
  | 'VALIDATION_FAILURE' 
  | 'REPAIR_FAILURE' 
  | 'STALE_PLAN' 
  | 'STALE_CANDIDATE' 
  | 'CONCURRENCY_CONFLICT' 
  | 'REQUIREMENT_CONFLICT' 
  | 'HUMAN_HANDOFF';

export interface StageLatencies {
  interpretationMs: number;
  planningMs: number;
  generationMs: number;
  validationMs: number;
  repairMs: number;
  commitMs: number;
}

export interface AuthoringTelemetryRecord {
  recordId: string;
  turnId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUSD: number;
  latencies: StageLatencies;
  totalLatencyMs: number;
  retriesCount: number;
  failureCategory: FailureCategory;
  timestamp: number;
}

export class OperationalTelemetry {
  private records: AuthoringTelemetryRecord[] = [];

  public recordTurn(params: {
    turnId: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    latencies: StageLatencies;
    retriesCount: number;
    failureCategory?: FailureCategory;
  }): AuthoringTelemetryRecord {
    const { turnId, model, inputTokens, outputTokens, latencies, retriesCount, failureCategory = 'NONE' } = params;

    const totalTokens = inputTokens + outputTokens;
    // Standard blended pricing estimation (e.g. $3 / 1M in, $15 / 1M out)
    const costIn = (inputTokens / 1_000_000) * 3.0;
    const costOut = (outputTokens / 1_000_000) * 15.0;
    const estimatedCostUSD = Number((costIn + costOut).toFixed(5));

    const totalLatencyMs = 
      latencies.interpretationMs + 
      latencies.planningMs + 
      latencies.generationMs + 
      latencies.validationMs + 
      latencies.repairMs + 
      latencies.commitMs;

    const record: AuthoringTelemetryRecord = {
      recordId: `telemetry_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      turnId,
      model,
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCostUSD,
      latencies,
      totalLatencyMs,
      retriesCount,
      failureCategory,
      timestamp: Date.now(),
    };

    this.records.push(record);
    return record;
  }

  public getSessionCostSummary(): { totalTokens: number; totalCostUSD: number; averageLatencyMs: number; failureCounts: Record<string, number> } {
    const totalTokens = this.records.reduce((acc, r) => acc + r.totalTokens, 0);
    const totalCostUSD = Number(this.records.reduce((acc, r) => acc + r.estimatedCostUSD, 0).toFixed(5));
    const averageLatencyMs = this.records.length > 0 ? Number((this.records.reduce((acc, r) => acc + r.totalLatencyMs, 0) / this.records.length).toFixed(1)) : 0;

    const failureCounts: Record<string, number> = {};
    for (const r of this.records) {
      if (r.failureCategory !== 'NONE') {
        failureCounts[r.failureCategory] = (failureCounts[r.failureCategory] || 0) + 1;
      }
    }

    return {
      totalTokens,
      totalCostUSD,
      averageLatencyMs,
      failureCounts,
    };
  }
}
