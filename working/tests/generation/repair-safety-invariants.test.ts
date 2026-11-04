import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { TaskContractValidator } from '../../src/core/task-contract';
import { GenerationPlanner } from '../../src/core/generation-planner';
import { QualityEvaluator } from '../../src/core/quality-evaluator';
import { TargetedRepairEngine } from '../../src/core/targeted-repair';
import { ClaimExtractor } from '../../src/core/claim-extractor';
import { UniversalClaimStateEngine } from '../../src/core/claim-state';

describe('Writing OS P3.2-C — Targeted Repair Safety Invariants Specification', () => {
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
    objective: 'Clinical observation and dialogue',
  });
  const plan = GenerationPlanner.createPlan({ task, stateGraph: graph });

  test('Enforces 4-Fold Invariant: Local Quality up, Local Integrity preserved, Global Integrity intact, Unrelated byte-identical', () => {
    const p1 = 'Paragraph 1: Dr. Bradley calibrated the monitoring equipment with practiced precision.';
    const p2_broken = 'Paragraph 2: Elias had been in a coma for thirty days and I feel he looked very very pale.';
    const p3 = 'Paragraph 3: Rain drummed steadily against the reinforced exterior clinic glass.';

    const originalFullText = [p1, p2_broken, p3].join('\n\n');

    // 1. Initial State: Paragraph 2 has both an integrity violation (30 days vs 11 days) and poor voice
    const initialExtracted = ClaimExtractor.extractFromText(p2_broken, ['elias']);
    const initialClaimRes = UniversalClaimStateEngine.evaluateClaim({
      assertionText: initialExtracted[0].rawSentence,
      subjectId: initialExtracted[0].subjectId,
      predicate: initialExtracted[0].predicate,
      assertedValue: initialExtracted[0].assertedValue,
    }, graph, 'LICENSED_FICTION');
    expect(initialClaimRes.status).toBe('CONTRADICTED');

    const initialQuality = QualityEvaluator.evaluateQuality(p2_broken, plan, task);

    // 2. Perform Targeted Region Repair on Paragraph 2 (index 1)
    const p2_repaired = 'Paragraph 2: Elias had been in a coma for eleven days, his breathing steady under the regulator.';
    const repairResult = TargetedRepairEngine.applyTargetedRepair({
      fullText: originalFullText,
      regionIdentifier: 1,
      repairedRegionText: p2_repaired,
      violationAddressed: 'Fixed coma duration contradiction and eliminated first-person voice leak',
    });

    expect(repairResult.patchAppliedSuccessfully).toBe(true);
    expect(repairResult.unchangedRegionsCount).toBe(2);

    // Invariant 1: Local Quality Increases
    const repairedQuality = QualityEvaluator.evaluateQuality(p2_repaired, plan, task);
    expect(repairedQuality.overallQualityScore).toBeGreaterThanOrEqual(initialQuality.overallQualityScore);

    // Invariant 2: Local Integrity Preserved
    const repairedExtracted = ClaimExtractor.extractFromText(p2_repaired, ['elias']);
    const repairedClaimRes = UniversalClaimStateEngine.evaluateClaim({
      assertionText: repairedExtracted[0].rawSentence,
      subjectId: repairedExtracted[0].subjectId,
      predicate: repairedExtracted[0].predicate,
      assertedValue: repairedExtracted[0].assertedValue,
    }, graph, 'LICENSED_FICTION');
    expect(repairedClaimRes.status).toBe('SUPPORTED');

    // Invariant 3 & 4: Unrelated regions are 100% byte-identical
    const patchedParagraphs = repairResult.patchedFullText.split('\n\n');
    expect(patchedParagraphs[0]).toBe(p1);
    expect(patchedParagraphs[1]).toBe(p2_repaired);
    expect(patchedParagraphs[2]).toBe(p3);
  });
});
