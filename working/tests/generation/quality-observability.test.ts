import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { TaskContractValidator } from '../../src/core/task-contract';
import { GenerationPipeline } from '../../src/core/generation-pipeline';
import { GenerationTraceLedger } from '../../src/core/generation-trace';
import { QualityEvaluator } from '../../src/core/quality-evaluator';
import { GenerationPlanner } from '../../src/core/generation-planner';
import { TargetedRepairEngine } from '../../src/core/targeted-repair';

describe('Writing OS P3.1 — Generation Observability & Quality Baseline Suite', () => {

  describe('1. Full Generation Trace Persistence in Ledger', () => {
    test('Persists complete lifecycle trace including state snapshots, plan, and dual-track scores', async () => {
      GenerationTraceLedger.clearTraces();

      const graph = new UniversalStateGraph();
      graph.registerEntity({
        id: 'dr_morris',
        entityType: 'CHARACTER',
        displayName: 'Dr. Morris',
        authorityLevel: 'CANON',
        properties: { specialty: 'neurotrauma' },
        initialAuthorizedProperties: ['specialty'],
      });

      const task = TaskContractValidator.normalize({
        register: 'fiction',
        objective: 'Draft clinical consultation scene',
      });

      const pipelineResult = await GenerationPipeline.execute({
        task,
        stateGraph: graph,
        generate: (plan) => {
          return 'Dr. Morris reviewed the neurotrauma scans in silence before speaking.';
        },
      });

      expect(pipelineResult.trace.generationId).toBeDefined();
      expect(pipelineResult.integrityScore).toBe(1.0);
      expect(pipelineResult.qualityReport.overallQualityScore).toBeGreaterThan(0.70);

      // Verify trace was stored in ledger
      const recorded = GenerationTraceLedger.getTrace(pipelineResult.trace.generationId);
      expect(recorded).toBeDefined();
      expect(recorded!.taskId).toBe(task.taskId);
      expect(recorded!.initialStateSnapshot.entityCount).toBe(1);
      expect(recorded!.integrityEvaluation.passed).toBe(true);
    });
  });

  describe('2. Decoupled Dual-Track Evaluation: Integrity vs Quality', () => {
    const graph = new UniversalStateGraph();
    graph.registerEntity({
      id: 'apex_systems',
      entityType: 'COMPANY',
      displayName: 'Apex Systems',
      authorityLevel: 'SOURCE_VERIFIED',
      properties: { revenue: '$20M' },
      initialAuthorizedProperties: ['revenue'],
    });

    const task = TaskContractValidator.normalize({
      register: 'business',
      objective: 'Draft quarterly financial update for board',
      audience: 'EXECUTIVE',
    });
    const plan = GenerationPlanner.createPlan({ task, stateGraph: graph });

    test('Case A: Factual text with poor writing quality (repetitive & voice mismatch)', () => {
      // Correct $20M revenue (Integrity = 1.0), but poor quality (I/we pronouns in executive brief, repetitive words)
      const poorQualityProse = 'I think we achieved revenue of $20M very very quickly. I feel that our team worked hard hard.';
      const report = QualityEvaluator.evaluateQuality(poorQualityProse, plan, task);

      expect(report.overallQualityScore).toBeLessThan(0.85);
      expect(report.diagnosticFeedback.some(f => f.includes('First-person pronouns') || f.includes('Duplicate'))).toBe(true);
    });

    test('Case B: High quality stylistic prose with fatal integrity contradiction', async () => {
      const contradictoryHighProse = 'Apex Systems recorded $95M in quarterly revenue following flawless market execution.';

      const pipelineResult = await GenerationPipeline.execute({
        task,
        stateGraph: graph,
        generate: () => contradictoryHighProse,
      });

      // Integrity strictly fails despite fluent prose
      expect(pipelineResult.finalStatus).toBe('REJECTED');
      expect(pipelineResult.integrityScore).toBe(0.0);
      expect(pipelineResult.trace.integrityEvaluation.violations.length).toBeGreaterThan(0);
    });
  });

  describe('3. Targeted Region-Scoped Repair Engine', () => {
    test('Surgically repairs identified paragraph while keeping surrounding paragraphs 100% untouched', () => {
      const fullManuscript = [
        'Scene 1: Elias opened his eyes to the harsh clinical fluorescents of Ward 4.',
        'Scene 2: Elias was in a coma for thirty days without brain activity.',
        'Scene 3: The attending nurse adjusted the infusion line and noted steady vital signs.',
      ].join('\n\n');

      const repairedParagraph2 = 'Scene 2: Elias had been in a coma for eleven days before regaining autonomic reflexes.';

      const patchResult = TargetedRepairEngine.applyTargetedRepair({
        fullText: fullManuscript,
        regionIdentifier: 1, // Index of Scene 2
        repairedRegionText: repairedParagraph2,
        violationAddressed: 'Coma duration contradiction (30 days -> 11 days)',
      });

      expect(patchResult.patchAppliedSuccessfully).toBe(true);
      expect(patchResult.unchangedRegionsCount).toBe(2);

      const splitPatched = patchResult.patchedFullText.split('\n\n');
      expect(splitPatched[0]).toBe('Scene 1: Elias opened his eyes to the harsh clinical fluorescents of Ward 4.');
      expect(splitPatched[1]).toBe(repairedParagraph2);
      expect(splitPatched[2]).toBe('Scene 3: The attending nurse adjusted the infusion line and noted steady vital signs.');
    });
  });
});
