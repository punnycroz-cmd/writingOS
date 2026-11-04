/**
 * Writing OS Core — Structured Repair Planner (P6)
 * Compiles localized failures into a formal RepairPlan with explicit provenance,
 * preservation constraints, and strictly forbidden side-effects.
 */

import { LocalizedDefect } from './failure-localizer';
import { WritingTaskContract } from './task-contract';
import { UniversalStateGraph } from './state-model';

export interface RepairPlan {
  planId: string;
  targetParagraphIndex: number;
  defectType: string;
  repairObjective: string;
  preserveConstraints: string[];
  forbiddenChanges: string[];
  provenance: string;
  suggestedPatch: string;
  timestamp: number;
}

export class RepairPlanner {
  public static compilePlan(params: {
    defect: LocalizedDefect;
    task: WritingTaskContract;
    stateGraph: UniversalStateGraph;
    cleanPatchText: string;
  }): RepairPlan {
    const { defect, task, stateGraph, cleanPatchText } = params;

    return {
      planId: `repair_plan_${defect.defectId}`,
      targetParagraphIndex: defect.paragraphIndex,
      defectType: defect.defectType,
      repairObjective: `Surgically eliminate ${defect.defectType} in paragraph ${defect.paragraphIndex}: ${defect.suggestedCorrection}`,
      preserveConstraints: [
        'ALL_NEIGHBORING_PARAGRAPHS_BYTE_IDENTICAL',
        'CANONICAL_STATE_AUTHORITY_PRESERVED',
        'TASK_CONTRACT_OBJECTIVES_MAINTAINED',
      ],
      forbiddenChanges: [
        'MODIFICATION_OF_UNTOUCHED_PARAGRAPHS',
        'INVENTION_OF_UNAUTHORIZED_PROPERTIES',
        'REGRESSION_OF_PREVIOUS_INTEGRITY_SCORE',
      ],
      provenance: `VALIDATOR_LOCALIZATION:${defect.defectId}`,
      suggestedPatch: cleanPatchText,
      timestamp: Date.now(),
    };
  }
}
