import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { TaskContractValidator } from '../../src/core/task-contract';
import { UniversalDecisionLoop } from '../../src/core/decision-loop';
import { FictionPack } from '../../src/registers/fiction-pack';
import { AcademicPack, AcademicSourceGraph } from '../../src/registers/academic-pack';
import { BusinessPack, BusinessBrandEngine } from '../../src/registers/business-pack';

describe('Writing OS — Universal Multi-Register Benchmark Matrix', () => {
  test('Matrix Row 1 [FICTION]: Core executes decision loop with FictionPack constraints', async () => {
    const graph = new UniversalStateGraph();
    const task = TaskContractValidator.normalize({
      register: 'fiction',
      objective: 'Render opening recovery scene',
    });
    const pack = new FictionPack();
    pack.initializeState(graph, {
      characters: [{ id: 'protagonist', name: 'Elias', initialTrauma: 9.0 }],
    });

    const candidateText = 'He swung his legs over the rail. The floor pitched under his soles, and he held fast to the cold steel.';
    const loopResult = await UniversalDecisionLoop.execute(
      task,
      candidateText,
      graph,
      {
        detect: (txt, st) => {
          const audit = pack.auditText(txt, st, task);
          return audit.violations.map(v => ({
            ruleId: 'FICTION_VIOLATION',
            hasViolation: true,
            description: v,
            severity: 'CRITICAL',
          }));
        },
      }
    );

    expect(loopResult.finalDecision).toBe('AUTONOMOUS_ACCEPT');
    expect(loopResult.stepRecords.length).toBe(8);
    expect(loopResult.stateCommitted).toBe(true);
  });

  test('Matrix Row 2 [ACADEMIC]: Core executes decision loop with AcademicPack strict citation constraints', async () => {
    const graph = new UniversalStateGraph();
    const task = TaskContractValidator.normalize({
      register: 'academic',
      objective: 'Synthesize research literature',
    });
    const pack = new AcademicPack();
    AcademicSourceGraph.registerSource(graph, {
      id: 'Smith, 2024',
      title: 'Neural Architecture Analysis',
      authors: ['Smith'],
      year: 2024,
      keyFindings: ['Empirical loss bounds'],
    });

    const candidateText = 'As demonstrated in recent empirical loss bounds [Smith, 2024], cross-entropy correlates with generalization.';
    const loopResult = await UniversalDecisionLoop.execute(
      task,
      candidateText,
      graph,
      {
        detect: (txt, st) => {
          const audit = pack.auditText(txt, st, task);
          return audit.violations.map(v => ({
            ruleId: 'ACADEMIC_VIOLATION',
            hasViolation: true,
            description: v,
            severity: 'CRITICAL',
          }));
        },
      }
    );

    expect(loopResult.finalDecision).toBe('AUTONOMOUS_ACCEPT');
    expect(loopResult.stateCommitted).toBe(true);
  });

  test('Matrix Row 3 [BUSINESS]: Core blocks metric hallucination in Business register', async () => {
    const graph = new UniversalStateGraph();
    const task = TaskContractValidator.normalize({
      register: 'business',
      objective: 'Draft executive update',
      audience: 'EXECUTIVE',
    });
    const pack = new BusinessPack();
    BusinessBrandEngine.registerBusinessProfile(graph, {
      companyName: 'Nova Systems',
      quarterlyRevenue: '$10M',
    });

    // Unverified $90M claim should be BLOCKED
    const candidateText = 'Nova Systems achieved $90M in Q2 bookings.';
    const loopResult = await UniversalDecisionLoop.execute(
      task,
      candidateText,
      graph,
      {
        detect: (txt, st) => {
          const audit = pack.auditText(txt, st, task);
          return audit.violations.map(v => ({
            ruleId: 'BUSINESS_METRIC_VIOLATION',
            hasViolation: true,
            description: v,
            severity: 'CRITICAL',
          }));
        },
      }
    );

    expect(loopResult.finalDecision).toBe('AUTONOMOUS_BLOCK');
    expect(loopResult.stateCommitted).toBe(false);
  });
});
