import { describe, expect, test } from 'bun:test';
import { ReleaseRerunRunner } from '../../src/benchmarks/release-rerun-runner';
import { ReleaseHealthDashboard } from '../../src/benchmarks/release-health-dashboard';

describe('Writing OS P15 — Release Validation Gate Suite (1.0-RC)', () => {

  describe('1. Formal Audit of the 10-Point Release Invariant Checklist', () => {
    test('Verifies 100% compliance across all 10 release invariants for Writing OS 1.0-RC', () => {
      const audit = ReleaseRerunRunner.auditReleaseChecklist();

      expect(audit.totalInvariants).toBe(10);
      expect(audit.passedInvariants).toBe(10);
      expect(audit.releaseGateStatus).toBe('READY_FOR_RELEASE_1_0');

      // Verify key individual invariant items
      const untrustedAuth = audit.items.find(i => i.invariantName === 'UNTRUSTED_AUTHORITY_INVARIANCE');
      const validationGate = audit.items.find(i => i.invariantName === 'VALIDATION_COMMIT_GATE');
      const staleProtection = audit.items.find(i => i.invariantName === 'STALE_ARTIFACT_PROTECTION');
      const perspectiveFilter = audit.items.find(i => i.invariantName === 'PERSPECTIVE_PERMISSION_FILTERING');
      const safeHandoff = audit.items.find(i => i.invariantName === 'SAFE_HANDOFF_NON_FALLTHROUGH');

      expect(untrustedAuth?.passed).toBe(true);
      expect(validationGate?.passed).toBe(true);
      expect(staleProtection?.passed).toBe(true);
      expect(perspectiveFilter?.passed).toBe(true);
      expect(safeHandoff?.passed).toBe(true);
    });
  });

  describe('2. Multi-Dimensional Release Health Dashboard Telemetry', () => {
    test('Meets all 5 production-oriented health criteria (Safety, Quality, Operations, User, Reliability)', () => {
      const telemetry = ReleaseHealthDashboard.getReleaseTelemetry();

      // 1. SAFETY Pillar
      expect(telemetry.safety.integrityFailureRatePct).toBe(0.0);
      expect(telemetry.safety.unsafeAcceptanceRatePct).toBe(0.0);
      expect(telemetry.safety.handoffPrecisionPct).toBeGreaterThanOrEqual(95.0);

      // 2. QUALITY Pillar
      expect(telemetry.quality.taskSuccessRatePct).toBeGreaterThanOrEqual(90.0);
      expect(telemetry.quality.blindPreferenceWinSharePct).toBeGreaterThanOrEqual(45.0);
      expect(telemetry.quality.stylePurityAvg).toBeGreaterThanOrEqual(0.85);

      // 3. OPERATIONS Pillar
      expect(telemetry.operations.latencyP50Ms).toBeLessThan(250);
      expect(telemetry.operations.latencyP95Ms).toBeLessThan(400);
      expect(telemetry.operations.costUSDPerSuccessfulTask).toBeLessThan(0.0050);

      // 4. USER Pillar
      expect(telemetry.user.humanSupervisionMinutesAvg).toBeLessThanOrEqual(1.5);
      expect(telemetry.user.correctionBurdenAvg).toBeLessThanOrEqual(1.0);
      expect(telemetry.user.constraintRepetitionRateAvg).toBeLessThanOrEqual(0.5);
      expect(telemetry.user.abandonmentRatePct).toBeLessThanOrEqual(3.0);

      // 5. RELIABILITY Pillar
      expect(telemetry.reliability.stateCorruptionRatePct).toBe(0.0);
      expect(telemetry.reliability.staleArtifactCommitRatePct).toBe(0.0);
      expect(telemetry.reliability.duplicateSideEffectRatePct).toBe(0.0);
      expect(telemetry.reliability.crossTenantLeakageRatePct).toBe(0.0);
    });
  });
});
