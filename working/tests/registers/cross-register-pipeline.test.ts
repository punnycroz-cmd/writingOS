import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { WritingArtifactGraph } from '../../src/core/artifact-graph';
import { MultiTurnSessionManager } from '../../src/core/session-manager';
import { SessionPersistence } from '../../src/core/session-persistence';
import { CostAwareRouter } from '../../src/core/cost-aware-router';
import { AcademicIntelligence } from '../../src/registers/academic-pack/academic-intelligence';
import { BusinessIntelligence } from '../../src/registers/business-pack/business-intelligence';
import { TechnicalIntelligence } from '../../src/registers/technical-pack/technical-intelligence';
import { LegalIntelligence } from '../../src/registers/legal-pack/legal-intelligence';

describe('Writing OS P8.1 & P9 — Cross-Register Deep Generation & Lifecycle Suite', () => {

  describe('1. Writing Artifact Graph & Lifecycle State Machine (P8.1)', () => {
    test('Manages artifact statuses and cascades staleness on parent mutation', () => {
      const graph = new WritingArtifactGraph();

      // Register Plan v1
      graph.registerArtifact({
        artifactId: 'plan_01',
        artifactType: 'PLAN',
        version: 1,
        status: 'COMMITTED',
        dependencies: [],
        payload: { objective: 'Write Chapter 1' },
      });

      // Register Candidate v1 dependent on Plan v1
      graph.registerArtifact({
        artifactId: 'cand_01',
        artifactType: 'CANDIDATE',
        version: 1,
        status: 'PENDING_VALIDATION',
        dependencies: [{ artifactId: 'plan_01', version: 1 }],
        payload: { text: 'Prose draft' },
      });

      // Plan mutates -> Cascade stale status
      const invalidated = graph.cascadeStaleStatus('plan_01');
      expect(invalidated).toContain('plan_01');
      expect(invalidated).toContain('cand_01');
      expect(graph.getArtifact('cand_01')?.status).toBe('STALE');
    });
  });

  describe('2. Session Persistence & Restart Recovery (P8.1)', () => {
    test('Serializes session and cleanly restores in fresh memory without state loss', () => {
      const stateGraph = new UniversalStateGraph();
      const originalSession = new MultiTurnSessionManager('session_persisted_01', stateGraph);

      originalSession.processTurn('Initial research summary request');
      originalSession.processTurn('Keep all financial figures');
      originalSession.processTurn('Make it shorter and concise');

      expect(originalSession.taskVersion).toBe(4);

      // Serialize session
      const serializedJson = SessionPersistence.serializeSession(originalSession);
      expect(typeof serializedJson).toBe('string');

      // Restore session in a fresh state graph
      const restoredStateGraph = new UniversalStateGraph();
      const restoredSession = SessionPersistence.restoreSession(serializedJson, restoredStateGraph);

      expect(restoredSession.sessionId).toBe('session_persisted_01');
      expect(restoredSession.taskVersion).toBe(4);

      // Continue session in restored environment
      const turn4 = restoredSession.processTurn('Final revision request');
      expect(turn4.turnIndex).toBe(4);
      expect(turn4.taskVersion).toBe(5);
    });
  });

  describe('3. Cost-Aware Routing & Escalation Policy (P8.1)', () => {
    test('Routes deterministic checks to Fast Path, semantic tasks to LLM, and budget breaches to Human', () => {
      // Fast path
      const r1 = CostAwareRouter.routeTask({
        isProvableDeterministically: true,
        hasAmbiguity: false,
        hasConstitutionalViolation: false,
        repairAttemptsCount: 0,
      });
      expect(r1.selectedTier).toBe('DETERMINISTIC_FAST_PATH');
      expect(r1.estimatedCostUSD).toBeLessThan(0.0001);

      // Semantic LLM path
      const r2 = CostAwareRouter.routeTask({
        isProvableDeterministically: false,
        hasAmbiguity: false,
        hasConstitutionalViolation: false,
        repairAttemptsCount: 1,
      });
      expect(r2.selectedTier).toBe('SEMANTIC_LLM_PATH');
      expect(r2.estimatedCostUSD).toBeGreaterThan(0.001);

      // Human Escalation path
      const r3 = CostAwareRouter.routeTask({
        isProvableDeterministically: false,
        hasAmbiguity: false,
        hasConstitutionalViolation: true,
        repairAttemptsCount: 3,
      });
      expect(r3.selectedTier).toBe('HUMAN_ESCALATION_PATH');
      expect(r3.isHighRisk).toBe(true);
    });
  });

  describe('4. Academic Pack — Epistemic Claim Grounding (P9)', () => {
    test('Enforces ClaimStrength <= EvidenceStrength to prevent ungrounded causal claims', () => {
      // Case A: Valid cautious claim matching correlational evidence
      const validAudit = AcademicIntelligence.evaluateClaimVsEvidence(
        'The study suggests an association between sleep quality and cognitive latency.',
        'TENTATIVE'
      );
      expect(validAudit.isEpistemicallyValid).toBe(true);
      expect(validAudit.claimStrength).toBe('TENTATIVE');

      // Case B: Exaggerated causal claim exceeding observational evidence
      const invalidAudit = AcademicIntelligence.evaluateClaimVsEvidence(
        'The study proves conclusively that poor sleep causes severe latency degradation.',
        'TENTATIVE'
      );
      expect(invalidAudit.isEpistemicallyValid).toBe(false);
      expect(invalidAudit.violations.length).toBeGreaterThan(0);
      expect(invalidAudit.violations[0]).toContain('Epistemic Exaggeration');
    });
  });

  describe('5. Business Pack — Metric Authorization & Executive Voice (P9)', () => {
    test('Validates authorized financial metrics and strictly blocks unauthorized forecasts', () => {
      const authorizedMetrics = { q3_revenue: '$14.2M', yoy_growth: '24%' };

      // Case A: Authorized metrics
      const validAudit = BusinessIntelligence.evaluateMetricAuthorization(
        'Executive Memo: Q3 revenue reached $14.2M representing a 24% YoY surge.',
        authorizedMetrics
      );
      expect(validAudit.isAuthorized).toBe(true);
      expect(validAudit.authorizedMetrics).toContain('$14.2M');

      // Case B: Unauthorized hallucinated forecast
      const invalidAudit = BusinessIntelligence.evaluateMetricAuthorization(
        'Executive Memo: Q3 revenue reached $14.2M and we project $28M for Q4.',
        authorizedMetrics
      );
      expect(invalidAudit.isAuthorized).toBe(false);
      expect(invalidAudit.unauthorizedMetrics).toContain('$28M');
    });
  });

  describe('6. Technical Pack — Specification Precision & Semantic Invariance (P9)', () => {
    test('Enforces numerical rate limit precision under substantial surface rewriting', () => {
      const canonicalSpecs = { max_rate_rps: 100 };

      // Case A: Surface variation preserving exact technical limit
      const validAudit = TechnicalIntelligence.evaluateSpecificationPrecision(
        'The ingress proxy throughput accommodates a maximum sustained load of 100 requests/sec across all nodes.',
        canonicalSpecs
      );
      expect(validAudit.isPrecise).toBe(true);

      // Case B: Technical distortion
      const invalidAudit = TechnicalIntelligence.evaluateSpecificationPrecision(
        'The ingress proxy handles up to 1000 requests/sec with ease.',
        canonicalSpecs
      );
      expect(invalidAudit.isPrecise).toBe(false);
      expect(invalidAudit.violatedConstraints[0]).toContain('Rate limit mismatch');
    });
  });

  describe('7. Legal Pack — Statutory Authority & Deontic Modality (P9)', () => {
    test('Distinguishes mandatory obligation ("shall") from discretionary permission ("may")', () => {
      // Case A: Mandatory requirement matching "shall"
      const mandatoryAudit = LegalIntelligence.evaluateDeonticModality(
        'The licensee shall submit quarterly compliance reports within thirty days.',
        'MANDATORY'
      );
      expect(mandatoryAudit.isCompliant).toBe(true);
      expect(mandatoryAudit.statedModality).toBe('MANDATORY_OBLIGATION');

      // Case B: Mandatory obligation diluted to discretionary "may" -> Violation
      const dilutedAudit = LegalIntelligence.evaluateDeonticModality(
        'The licensee may submit quarterly compliance reports at its discretion.',
        'MANDATORY'
      );
      expect(dilutedAudit.isCompliant).toBe(false);
      expect(dilutedAudit.violations[0]).toContain('states discretionary permission ("may")');
    });
  });
});
