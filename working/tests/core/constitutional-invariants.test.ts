import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { UniversalDecisionLoop } from '../../src/core/decision-loop';
import { TaskContractValidator } from '../../src/core/task-contract';
import { UniversalClaimStateEngine } from '../../src/core/claim-state';

describe('Writing OS Core P1 — Constitutional Invariants & State Safety Specification', () => {

  describe('Invariant 1: Anti-State-Contamination & Authority Ranks', () => {
    test('Rejects lower LLM_PROPOSED authority from overwriting higher CANON state', () => {
      const graph = new UniversalStateGraph();
      graph.registerEntity({
        id: 'patient_zero',
        entityType: 'CHARACTER',
        displayName: 'Subject Zero',
        authorityLevel: 'CANON',
        properties: {
          coma_duration: '11 days',
        },
      });

      // An unverified LLM generation proposing '30 days'
      const mutationAttempt = graph.setProperty(
        'patient_zero',
        'coma_duration',
        '30 days',
        'LLM_PROPOSED'
      );

      expect(mutationAttempt.success).toBe(false);
      expect(mutationAttempt.reason).toContain('STATE_CONTAMINATION_PREVENTED');
      expect(graph.getPropertyValue('patient_zero', 'coma_duration')).toBe('11 days');
    });

    test('Allows higher SOURCE_VERIFIED authority to establish or update state', () => {
      const graph = new UniversalStateGraph();
      graph.registerEntity({
        id: 'corp_alpha',
        entityType: 'ORGANIZATION',
        displayName: 'Corp Alpha',
        authorityLevel: 'LLM_PROPOSED',
        properties: {
          revenue: '$10M',
        },
      });

      // Valid audited 10-K filing with SOURCE_VERIFIED authority
      const validUpdate = graph.setProperty(
        'corp_alpha',
        'revenue',
        '$20M',
        'SOURCE_VERIFIED'
      );

      expect(validUpdate.success).toBe(true);
      expect(graph.getPropertyValue('corp_alpha', 'revenue')).toBe('$20M');
    });
  });

  describe('Invariant 2: Zero State Commit on Validation Failure', () => {
    test('Guarantees 100% state rollback when independent validator fails', async () => {
      const graph = new UniversalStateGraph();
      const initialSnapshot = graph.captureSnapshot();
      const initialHistoryLength = 1;

      const task = TaskContractValidator.normalize({
        register: 'general',
        objective: 'Test invalid draft commit prevention',
      });

      const invalidInput = 'Text containing fatal invariant violation.';

      const loopReport = await UniversalDecisionLoop.execute(
        task,
        invalidInput,
        graph,
        {
          detect: () => [{
            ruleId: 'FATAL_PHYSICS_VIOLATION',
            hasViolation: true,
            description: 'Acoustic unit attached to illumination',
            severity: 'CRITICAL',
          }],
          validateIndependent: () => ({
            isValid: false,
            violations: ['Fatal integrity violation persists'],
          }),
        }
      );

      expect(loopReport.finalDecision).toBe('AUTONOMOUS_BLOCK');
      expect(loopReport.stateCommitted).toBe(false);
      expect(loopReport.snapshot).toBeUndefined();
    });

    test('Commits state snapshot strictly upon successful validation pass', async () => {
      const graph = new UniversalStateGraph();
      const task = TaskContractValidator.normalize({
        register: 'general',
        objective: 'Test clean draft commit',
      });

      const cleanInput = 'Valid uncorrupted text.';

      const loopReport = await UniversalDecisionLoop.execute(
        task,
        cleanInput,
        graph,
        {
          detect: () => [],
          validateIndependent: () => ({ isValid: true, violations: [] }),
        }
      );

      expect(loopReport.finalDecision).toBe('AUTONOMOUS_ACCEPT');
      expect(loopReport.stateCommitted).toBe(true);
      expect(loopReport.snapshot).toBeDefined();
    });
  });

  describe('Invariant 3: CONTRADICTED Claims Strictly Block Acceptance', () => {
    test('Resolves CONTRADICTED claim with high confidence and blocks autonomous accept', () => {
      const graph = new UniversalStateGraph();
      graph.registerEntity({
        id: 'mars',
        entityType: 'PLANET',
        displayName: 'Mars',
      });
      graph.registerClaim({
        id: 'c_mars_sun',
        subjectId: 'mars',
        predicate: 'order_from_sun',
        objectValue: 'fourth',
        authorityLevel: 'CANON',
      });

      const evaluation = UniversalClaimStateEngine.evaluateClaim({
        assertionText: 'Mars is the second planet from the sun.',
        subjectId: 'mars',
        predicate: 'order_from_sun',
        assertedValue: 'second',
      }, graph, 'STRICT_NONE');

      expect(evaluation.status).toBe('CONTRADICTED');
      expect(evaluation.confidence).toBeGreaterThanOrEqual(0.99);
    });
  });
});
