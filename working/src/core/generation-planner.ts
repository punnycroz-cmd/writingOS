/**
 * Writing OS Core — Generation Planner Compiler
 * Compiles TaskContract + UniversalStateGraph + RegisterPack + UserObjective
 * into a structured, provenance-tagged GenerationPlan.
 */

import { WritingTaskContract, TaskContractValidator } from './task-contract';
import { UniversalStateGraph } from './state-model';
import { GenerationPlan, PlanContentRequirement, PlanPreserveConstraint } from './generation-plan';

export class GenerationPlanner {
  public static createPlan(params: {
    task: WritingTaskContract;
    stateGraph: UniversalStateGraph;
    additionalRequirements?: Array<{
      description: string;
      provenanceSource?: 'USER_TASK' | 'CANON' | 'SOURCE_CONSTRAINT' | 'REGISTER_POLICY';
      priority?: 'MANDATORY' | 'HIGH' | 'DESIRABLE';
    }>;
    registerConstraints?: Record<string, unknown>;
  }): GenerationPlan {
    const { task, stateGraph, additionalRequirements, registerConstraints } = params;
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // 1. Compile Content Requirements
    const contentRequirements: PlanContentRequirement[] = [
      {
        id: 'req_obj_primary',
        description: task.objective,
        provenanceSource: 'USER_TASK',
        priority: 'MANDATORY',
      },
    ];

    if (additionalRequirements) {
      additionalRequirements.forEach((req, idx) => {
        contentRequirements.push({
          id: `req_add_${idx + 1}`,
          description: req.description,
          provenanceSource: req.provenanceSource || 'USER_TASK',
          priority: req.priority || 'HIGH',
        });
      });
    }

    // 2. Compile Must-Preserve Constraints from Authorized State Entities
    const mustPreserve: PlanPreserveConstraint[] = [];
    const allEntities = stateGraph.getAllEntities();

    for (const entity of allEntities) {
      for (const propName of entity.authorizedProperties) {
        const propRecord = entity.properties.get(propName);
        if (propRecord && propRecord.value !== undefined) {
          mustPreserve.push({
            entityId: entity.id,
            propertyName: propName,
            expectedValue: propRecord.value,
            authorityLevel: propRecord.authorityLevel,
            violationSeverity: propRecord.authorityLevel === 'CANON' ? 'CRITICAL' : 'MAJOR',
          });
        }
      }
    }

    // 3. Compile Forbidden Inventions from Explicit Unknowns
    const unknowns = stateGraph.getUnknowns();
    const forbiddenInventions: string[] = unknowns.map(u => `Unauthorized revelation of state variable: ${u}`);

    // 4. Validation Targets
    const validationTargets = [
      {
        targetMetric: 'Deterministic State Contradiction Count',
        passCriteria: 'Zero contradictions allowed against established state graph.',
        enforceZeroContradictions: true,
      },
      {
        targetMetric: 'Invention Policy Compliance',
        passCriteria: `Strict adherence to ${task.inventionPolicy} invention boundaries.`,
        enforceZeroContradictions: true,
      },
    ];

    return {
      planId,
      taskId: task.taskId,
      register: task.register,
      objective: task.objective,
      contentRequirements,
      mustPreserve,
      mustNotChange: mustPreserve.map(p => `${p.entityId}.${p.propertyName}`),
      evidenceConstraints: {
        permittedInferences: task.inventionPolicy === 'LICENSED_FICTION' ? ['SCENE_CONTINUITY', 'SENSORY_TEXTURE'] : ['FACTUAL_DEDUCTION'],
        forbiddenInventions,
      },
      registerConstraints: registerConstraints || {},
      inventionPolicy: task.inventionPolicy,
      audienceRequirements: {
        audienceLevel: task.audience,
        targetFormality: task.voiceRequirements.targetFormality,
        perspective: task.voiceRequirements.perspective,
      },
      validationTargets,
      createdTimestamp: Date.now(),
    };
  }
}
