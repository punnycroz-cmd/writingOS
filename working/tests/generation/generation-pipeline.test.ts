import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { TaskContractValidator } from '../../src/core/task-contract';
import { GenerationPipeline } from '../../src/core/generation-pipeline';
import { GenerationPlanner } from '../../src/core/generation-planner';
import { AcademicSourceGraph } from '../../src/registers/academic-pack';
import { BusinessBrandEngine } from '../../src/registers/business-pack';

describe('Writing OS P3 — Real Generation Architecture & Pipeline Benchmark v1', () => {

  describe('Deliverable 1 & 2: GenerationPlan & GenerationPlanner', () => {
    test('Compiles a structured GenerationPlan with explicit provenance and state preserve rules', () => {
      const graph = new UniversalStateGraph();
      graph.registerEntity({
        id: 'elias',
        entityType: 'CHARACTER',
        displayName: 'Elias Thorne',
        authorityLevel: 'CANON',
        properties: {
          coma_duration: '11 days',
          known_letters_count: '5',
        },
        initialAuthorizedProperties: ['coma_duration', 'known_letters_count'],
      });
      graph.addUnknown('elias.father_identity');

      const task = TaskContractValidator.normalize({
        register: 'fiction',
        objective: 'Draft recovery scene in recovery ward',
      });

      const plan = GenerationPlanner.createPlan({
        task,
        stateGraph: graph,
        additionalRequirements: [
          { description: 'Focus on cold sensory details of bedframe', priority: 'HIGH', provenanceSource: 'USER_TASK' },
        ],
      });

      expect(plan.planId).toBeDefined();
      expect(plan.mustPreserve.length).toBe(2);
      expect(plan.mustPreserve[0].authorityLevel).toBe('CANON');
      expect(plan.mustNotChange).toContain('elias.coma_duration');
      expect(plan.evidenceConstraints.forbiddenInventions.some(f => f.includes('elias.father_identity'))).toBe(true);
      expect(plan.contentRequirements.length).toBe(2);
    });
  });

  describe('Deliverables 3 & 4: GenerationPipeline & Candidate Isolation across Registers', () => {
    test('Row 1 [FICTION]: Generates and accepts clean candidate matching state preserves', async () => {
      const graph = new UniversalStateGraph();
      graph.registerEntity({
        id: 'elias',
        entityType: 'CHARACTER',
        displayName: 'Elias Thorne',
        authorityLevel: 'CANON',
        properties: { coma_duration: '11 days' },
        initialAuthorizedProperties: ['coma_duration'],
      });

      const task = TaskContractValidator.normalize({
        register: 'fiction',
        objective: 'Awakening scene',
      });

      const result = await GenerationPipeline.execute({
        task,
        stateGraph: graph,
        generate: (plan) => {
          // Model obeys GenerationPlan
          return 'Elias had been in a coma for eleven days before the monitor chimed.';
        },
      });

      expect(result.finalStatus).toBe('ACCEPTED');
      expect(result.candidate.isCommittedToState).toBe(true);
      expect(result.decisionReport.stateCommitted).toBe(true);
    });

    test('Row 1b [FICTION]: Strictly rejects candidate violating canonical state preserve', async () => {
      const graph = new UniversalStateGraph();
      graph.registerEntity({
        id: 'elias',
        entityType: 'CHARACTER',
        displayName: 'Elias Thorne',
        authorityLevel: 'CANON',
        properties: { coma_duration: '11 days' },
        initialAuthorizedProperties: ['coma_duration'],
      });

      const task = TaskContractValidator.normalize({
        register: 'fiction',
        objective: 'Awakening scene',
      });

      const result = await GenerationPipeline.execute({
        task,
        stateGraph: graph,
        generate: (plan) => {
          // Model hallucinates contradictory coma duration
          return 'Elias had been in a coma for thirty days before the monitor chimed.';
        },
      });

      expect(result.finalStatus).toBe('REJECTED');
      expect(result.candidate.isCommittedToState).toBe(false);
      expect(result.decisionReport.stateCommitted).toBe(false);
    });

    test('Row 2 [ACADEMIC]: Generates and validates research synthesis under STRICT_NONE policy', async () => {
      const graph = new UniversalStateGraph();
      AcademicSourceGraph.registerSource(graph, {
        id: 'Vaswani et al., 2017',
        title: 'Attention Is All You Need',
        authors: ['Vaswani'],
        year: 2017,
        keyFindings: ['multi-head attention'],
      });

      const task = TaskContractValidator.normalize({
        register: 'academic',
        objective: 'Synthesize architecture foundations',
      });

      const result = await GenerationPipeline.execute({
        task,
        stateGraph: graph,
        generate: (plan) => {
          return 'Modern sequence transduction relies on multi-head attention [Vaswani et al., 2017].';
        },
        registerAudit: (text, state) => AcademicSourceGraph.auditCitationGrounding(text, state),
      });

      expect(result.finalStatus).toBe('ACCEPTED');
      expect(result.candidate.isCommittedToState).toBe(true);
    });

    test('Row 3 [BUSINESS]: Strictly rejects executive memo with unverified metric hallucination', async () => {
      const graph = new UniversalStateGraph();
      BusinessBrandEngine.registerBusinessProfile(graph, {
        companyName: 'Nova Systems',
        quarterlyRevenue: '$10M',
      });

      const task = TaskContractValidator.normalize({
        register: 'business',
        objective: 'Draft Q2 earnings release',
        audience: 'EXECUTIVE',
      });

      const result = await GenerationPipeline.execute({
        task,
        stateGraph: graph,
        generate: (plan) => {
          // Model hallucinates $85M
          return 'Nova Systems delivered $85M in quarterly revenue across enterprise contracts.';
        },
        registerAudit: (text, state) => BusinessBrandEngine.auditBusinessClaims(text, state),
      });

      expect(result.finalStatus).toBe('REJECTED');
      expect(result.candidate.isCommittedToState).toBe(false);
      expect(result.decisionReport.stateCommitted).toBe(false);
    });
  });
});
