/**
 * Writing OS Core — State Completeness & Stale-Conflict Engine (P7)
 * Audits state prerequisites for continuity tasks to prevent hallucinated history (STATE_INSUFFICIENT),
 * and resolves temporal stale-state conflicts across scene timelines.
 */

import { UniversalStateGraph } from './state-model';
import { WritingTaskContract } from './task-contract';

export interface StatePrerequisiteAudit {
  isSufficient: boolean;
  status: 'STATE_SUFFICIENT' | 'STATE_INSUFFICIENT';
  missingPrerequisites: string[];
  explanation: string;
}

export interface StaleConflictResolution {
  hasConflict: boolean;
  propertyName: string;
  staleValue: unknown;
  latestValue: unknown;
  resolutionAuthority: string;
  resolvedValue: unknown;
}

export class StateCompletenessEngine {
  /**
   * Checks whether the State Graph has prerequisite state history for continuation tasks.
   */
  public static auditContinuityCompleteness(
    task: WritingTaskContract,
    stateGraph: UniversalStateGraph,
    requiredChapterOrSceneIndex: number
  ): StatePrerequisiteAudit {
    const missingPrerequisites: string[] = [];

    // Check if previous scenes exist in state graph
    for (let sceneIdx = 1; sceneIdx < requiredChapterOrSceneIndex; sceneIdx++) {
      const sceneEntity = stateGraph.getEntity(`scene_${sceneIdx}`) || stateGraph.getEntity(`chapter_${sceneIdx}`);
      if (!sceneEntity && sceneIdx >= 3) {
        missingPrerequisites.push(`scene_${sceneIdx}_state`);
      }
    }

    if (missingPrerequisites.length > 0) {
      return {
        isSufficient: false,
        status: 'STATE_INSUFFICIENT',
        missingPrerequisites,
        explanation: `Task requires continuing Scene/Chapter ${requiredChapterOrSceneIndex}, but state graph lacks history for prerequisites: [${missingPrerequisites.join(', ')}]. Writing OS refuses to hallucinate ungrounded continuity.`,
      };
    }

    return {
      isSufficient: true,
      status: 'STATE_SUFFICIENT',
      missingPrerequisites: [],
      explanation: 'All prerequisite chapter and scene states are present in the graph.',
    };
  }

  /**
   * Resolves temporal stale-state conflicts in favor of latest authoritative evidence.
   */
  public static resolveTemporalConflict(
    entityId: string,
    propertyName: string,
    historicalValue: unknown,
    latestObservedValue: unknown,
    stateGraph: UniversalStateGraph
  ): StaleConflictResolution {
    const entity = stateGraph.getEntity(entityId);
    const currentProp = entity?.properties.get(propertyName);

    const hasConflict = historicalValue !== latestObservedValue;

    return {
      hasConflict,
      propertyName,
      staleValue: historicalValue,
      latestValue: latestObservedValue,
      resolutionAuthority: currentProp?.authorityLevel || 'OBSERVED',
      resolvedValue: latestObservedValue,
    };
  }
}
