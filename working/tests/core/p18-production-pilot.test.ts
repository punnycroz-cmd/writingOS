import { describe, expect, test } from 'bun:test';
import { OperationContext } from '../../src/core/operation-context';
import { ProductionServiceBoundary } from '../../src/core/production-service-boundary';
import { ProductionCostLedger } from '../../src/benchmarks/production-cost-ledger';

describe('Writing OS P18 — Real Production Pilot & Operational Evidence Suite', () => {

  describe('1. OperationContext & End-to-End Distributed Tracing', () => {
    test('Propagates unified correlation IDs and version vectors across turns', () => {
      const ctxTurn1 = OperationContext.createInitial('tenant_corp_a', 'user_alice', 'sess_101', 'standard_v1');

      expect(ctxTurn1.requestId).toContain('req_');
      expect(ctxTurn1.tenantId).toBe('tenant_corp_a');
      expect(ctxTurn1.userId).toBe('user_alice');
      expect(ctxTurn1.taskVersion).toBe(1);
      expect(ctxTurn1.stateVersion).toBe(1);
      expect(ctxTurn1.policyVersion).toBe('p16.0');

      // Progress to Turn 2
      const ctxTurn2 = ctxTurn1.nextTurn();
      expect(ctxTurn2.taskVersion).toBe(2);
      expect(ctxTurn2.stateVersion).toBe(2);
      expect(ctxTurn2.correlationTraceId).toBe(ctxTurn1.correlationTraceId); // Provenance preserved
    });
  });

  describe('2. Production Service Boundary & Clean Cancellation', () => {
    test('Executes service request with live provider telemetry logging', () => {
      const boundary = new ProductionServiceBoundary();
      const ctx = OperationContext.createInitial('tenant_1', 'user_1', 'sess_1');

      const result = boundary.executeServiceRequest(ctx, () => {
        return 'Cleanly generated executive summary with strict numbers preservation.';
      });

      expect(result.status).toBe('COMPLETED');
      expect(result.committed).toBe(true);
      expect(result.telemetry.providerName).toBe('anthropic');
      expect(result.telemetry.costUSD).toBe(0.0048);
      expect(boundary.getTelemetryLog().length).toBe(1);
    });

    test('Clean Cancellation: Cancelling prior to commit discards candidate with zero state mutation', () => {
      const boundary = new ProductionServiceBoundary();
      const ctx = OperationContext.createInitial('tenant_1', 'user_1', 'sess_cancel_01');

      // Start operation and immediately cancel
      boundary.startOperation(ctx);
      const cancelRes = boundary.cancelOperation(ctx.requestId);
      expect(cancelRes.success).toBe(true);

      // Attempt execution
      const result = boundary.executeServiceRequest(ctx, () => {
        return 'Draft that should be discarded upon cancellation.';
      });

      expect(result.status).toBe('CANCELLED');
      expect(result.committed).toBe(false);
      expect(result.errorReason).toContain('cancelled');
    });
  });

  describe('3. Latency & Cost Distribution Percentiles (p50 / p90 / p95 / p99)', () => {
    test('Computes operational percentiles for latency and cost', () => {
      const latencies = [150, 160, 175, 180, 190, 210, 250, 280, 320, 450];
      const costs = [0.0010, 0.0020, 0.0030, 0.0032, 0.0040, 0.0050, 0.0068, 0.0084, 0.0120, 0.0150];

      const latPercentiles = ProductionCostLedger.computeLatencyPercentiles(latencies);
      const costPercentiles = ProductionCostLedger.computeCostPercentiles(costs);

      expect(latPercentiles.p50).toBe(210);
      expect(latPercentiles.p90).toBe(450);

      expect(costPercentiles.p50).toBe(0.0050);
      expect(costPercentiles.p90).toBe(0.0150);
    });
  });

  describe('4. Cost Anomaly Detection', () => {
    test('Flags context explosion, repair loop explosion, and routing regression', () => {
      // Normal run: No anomalies
      const normalRun = ProductionCostLedger.detectCostAnomalies({
        contextTokens: 2500,
        repairAttempts: 1,
        assignedModelTier: 'STANDARD_MODEL',
        taskComplexity: 3,
      });
      expect(normalRun.anomaliesDetectedCount).toBe(0);
      expect(normalRun.requiresOperationalIntervention).toBe(false);

      // Anomaly run: Trigger all 3
      const anomalousRun = ProductionCostLedger.detectCostAnomalies({
        contextTokens: 12500, // Trigger Context Explosion (>10,000)
        repairAttempts: 4,     // Trigger Repair Loop Explosion (>3)
        assignedModelTier: 'HIGH_REASONING_MODEL',
        taskComplexity: 1,    // Trigger Routing Regression (Trivial complexity on High Reasoning tier)
      });

      expect(anomalousRun.anomaliesDetectedCount).toBe(3);
      expect(anomalousRun.requiresOperationalIntervention).toBe(true);
      expect(anomalousRun.anomalyTypes.some(t => t.includes('CONTEXT_EXPLOSION'))).toBe(true);
      expect(anomalousRun.anomalyTypes.some(t => t.includes('REPAIR_LOOP_EXPLOSION'))).toBe(true);
      expect(anomalousRun.anomalyTypes.some(t => t.includes('ROUTING_REGRESSION'))).toBe(true);
    });
  });
});
