import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { DependencyGraphManager } from '../../src/core/dependency-graph';
import { MultiTurnSessionManager } from '../../src/core/session-manager';
import { OperationalTelemetry } from '../../src/core/operational-telemetry';
import { NaturalTaskCorpusRunner, RealisticTaskScenario } from '../../src/benchmarks/natural-task-corpus';

describe('Writing OS P8 — Real-World Authoring Validation Suite', () => {

  describe('1. Multi-Turn Constraint Evolution & User Correction Loops', () => {
    test('Correctly manages active vs superseded constraints across 4 interactive conversational turns', () => {
      const graph = new UniversalStateGraph();
      const session = new MultiTurnSessionManager('session_ceo_001', graph);

      // Turn 1: Initial creation request
      const turn1 = session.processTurn('Write an executive summary of our Q3 revenue growth');
      expect(turn1.turnIndex).toBe(1);
      expect(turn1.taskVersion).toBe(2);

      // Turn 2: User refines constraint (make it shorter)
      const turn2 = session.processTurn('Make it shorter and reduce length');
      expect(turn2.activeConstraints['length_constraint']).toBe('CONCISE_CONDENSED');

      // Turn 3: User corrects assumption ("No, that's not what I meant, keep all numbers")
      const turn3 = session.processTurn("No, that's not what I meant, don't touch the numbers");
      expect(turn3.userCorrectionApplied).toBe(true);
      expect(turn3.activeConstraints['preserve_numbers']).toBe('STRICT_PRESERVE');

      // Turn 4: User supersedes tone constraint ("instead of formal, make it casual")
      session.processTurn('Set tone to formal');
      const turn5 = session.processTurn('Actually, replace formal instead of formal with casual tone');
      expect(turn5.supersededConstraints.some(c => c.key === 'tone')).toBe(true);
    });

    test('Canon Precedence: Prevents user session prompt from silently overwriting CANON property', () => {
      const graph = new UniversalStateGraph();
      graph.registerEntity({
        id: 'company_q3_revenue',
        entityType: 'GENERAL',
        displayName: 'Q3 Revenue',
        authorityLevel: 'CANON',
        properties: { revenue_usd: '$14.2M' },
      });

      const session = new MultiTurnSessionManager('session_002', graph);
      const attempt = session.attemptCanonOverride('company_q3_revenue', 'revenue_usd', '$25.0M');

      expect(attempt.allowed).toBe(false);
      expect(attempt.reason).toContain('Canon Precedence Violation');
    });
  });

  describe('2. Dependency Graph & Stale Candidate Protection', () => {
    test('Rejects candidate commit when underlying state graph mutates (v12 -> v13)', () => {
      const depManager = new DependencyGraphManager();

      // Register Task v2, State v12, Plan v1
      depManager.registerNode({ nodeId: 'task_v2', nodeType: 'TASK', version: 2, parentDependencies: [], createdAt: Date.now() });
      depManager.registerNode({ nodeId: 'state_v12', nodeType: 'STATE', version: 12, parentDependencies: [], createdAt: Date.now() });
      depManager.registerNode({ nodeId: 'plan_v1', nodeType: 'PLAN', version: 1, parentDependencies: [{ nodeType: 'TASK', version: 2 }, { nodeType: 'STATE', version: 12 }], createdAt: Date.now() });

      // Register Candidate generated against Task v2, State v12, Plan v1
      depManager.registerNode({
        nodeId: 'cand_101',
        nodeType: 'CANDIDATE',
        version: 1,
        parentDependencies: [
          { nodeType: 'TASK', version: 2 },
          { nodeType: 'STATE', version: 12 },
          { nodeType: 'PLAN', version: 1 },
        ],
        createdAt: Date.now(),
      });

      // Audit 1: Clean when state is at v12
      const auditFresh = depManager.auditCandidateFreshness({
        candidateId: 'cand_101',
        currentTaskVersion: 2,
        currentStateVersion: 12,
        currentPlanVersion: 1,
      });
      expect(auditFresh.isFresh).toBe(true);
      expect(auditFresh.status).toBe('FRESH_FOR_COMMIT');

      // Audit 2: State mutates to v13 before commit -> Candidate rejected as STALE
      const auditStale = depManager.auditCandidateFreshness({
        candidateId: 'cand_101',
        currentTaskVersion: 2,
        currentStateVersion: 13, // State mutated!
        currentPlanVersion: 1,
      });
      expect(auditStale.isFresh).toBe(false);
      expect(auditStale.status).toBe('STALE_CANDIDATE_REJECTED');
      expect(auditStale.reason).toContain('StateVersion mismatch');
    });
  });

  describe('3. Operational Telemetry & Cost / Latency Observability', () => {
    test('Tracks multi-turn tokens, financial cost, stage latencies, and failure taxonomy', () => {
      const telemetry = new OperationalTelemetry();

      telemetry.recordTurn({
        turnId: 'turn_1',
        model: 'gemini-1.5-pro',
        inputTokens: 1200,
        outputTokens: 450,
        latencies: { interpretationMs: 12, planningMs: 8, generationMs: 140, validationMs: 25, repairMs: 0, commitMs: 5 },
        retriesCount: 0,
      });

      telemetry.recordTurn({
        turnId: 'turn_2',
        model: 'gemini-1.5-pro',
        inputTokens: 1600,
        outputTokens: 520,
        latencies: { interpretationMs: 15, planningMs: 10, generationMs: 180, validationMs: 30, repairMs: 45, commitMs: 5 },
        retriesCount: 1,
        failureCategory: 'REPAIR_FAILURE',
      });

      const summary = telemetry.getSessionCostSummary();

      expect(summary.totalTokens).toBe(1200 + 450 + 1600 + 520);
      expect(summary.totalCostUSD).toBeGreaterThan(0.01);
      expect(summary.averageLatencyMs).toBeGreaterThan(150);
      expect(summary.failureCounts['REPAIR_FAILURE']).toBe(1);
    });
  });

  describe('4. Natural User Task Corpus & Hidden Constraints', () => {
    test('Executes realistic multi-register scenarios with hidden constraints and missing attachment interception', () => {
      const graph = new UniversalStateGraph();

      // Scenario 1: CEO Financial Memo with hidden constraint
      const scenarioCEO: RealisticTaskScenario = {
        scenarioId: 'scen_ceo_01',
        userRole: 'CEO',
        rawPrompt: 'Turn these meeting notes into an executive memo for investors explaining our quarterly revenue growth',
        hiddenContextConstraints: ['MUST_RETAIN_FINANCIAL_NUMBERS'],
        attachedDocumentContent: 'Quarterly growth reached $14.2M representing a 24% YoY surge.',
        expectedOutcome: 'SUCCESS',
      };
      const resultCEO = NaturalTaskCorpusRunner.executeScenario(scenarioCEO, graph);
      expect(resultCEO.passed).toBe(true);

      // Scenario 2: Partial user context without attachment -> STATE_INSUFFICIENT
      const scenarioMissing: RealisticTaskScenario = {
        scenarioId: 'scen_missing_02',
        userRole: 'RESEARCHER',
        rawPrompt: 'Continue the report from last month with the new findings',
        hiddenContextConstraints: [],
        expectedOutcome: 'STATE_INSUFFICIENT',
      };
      const resultMissing = NaturalTaskCorpusRunner.executeScenario(scenarioMissing, graph);
      expect(resultMissing.passed).toBe(true);
      expect(resultMissing.status).toBe('STATE_INSUFFICIENT');
    });
  });

  describe('5. Long-Running Multi-Turn Session Stability (25 Sequential Turns)', () => {
    test('Demonstrates zero state drift and strictly monotonic versioning over 25 sequential turns', () => {
      const graph = new UniversalStateGraph();
      const session = new MultiTurnSessionManager('session_long_run_25', graph);

      for (let i = 1; i <= 25; i++) {
        const turn = session.processTurn(`User turn command sequence index ${i}`);
        expect(turn.turnIndex).toBe(i);
        expect(turn.taskVersion).toBe(i + 1);
      }

      expect(session.taskVersion).toBe(26);
    });
  });
});
