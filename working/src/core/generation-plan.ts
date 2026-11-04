/**
 * Writing OS Core — Generation Plan Schema
 * The mandatory structured intermediate artifact governing all generative synthesis.
 * Every constraint, preserve rule, and requirement carries explicit epistemic provenance.
 */

import { RegisterType, InventionPolicy, AudienceLevel } from './task-contract';
import { StateAuthorityLevel } from './state-model';

export type ProvenanceSource = 'USER_TASK' | 'CANON' | 'SOURCE_CONSTRAINT' | 'REGISTER_POLICY' | 'STATE_INFERENCE';

export interface PlanContentRequirement {
  id: string;
  description: string;
  provenanceSource: ProvenanceSource;
  priority: 'MANDATORY' | 'HIGH' | 'DESIRABLE';
}

export interface PlanPreserveConstraint {
  entityId: string;
  propertyName: string;
  expectedValue: unknown;
  authorityLevel: StateAuthorityLevel;
  violationSeverity: 'CRITICAL' | 'MAJOR';
}

export interface PlanEvidenceConstraint {
  requiredSourceId?: string;
  permittedInferences: string[];
  forbiddenInventions: string[];
}

export interface PlanValidationTarget {
  targetMetric: string;
  passCriteria: string;
  enforceZeroContradictions: boolean;
}

export interface GenerationPlan {
  planId: string;
  taskId: string;
  register: RegisterType;
  objective: string;
  contentRequirements: PlanContentRequirement[];
  mustPreserve: PlanPreserveConstraint[];
  mustNotChange: string[];
  evidenceConstraints: PlanEvidenceConstraint;
  registerConstraints: Record<string, unknown>;
  inventionPolicy: InventionPolicy;
  audienceRequirements: {
    audienceLevel: AudienceLevel;
    targetFormality: string;
    perspective: string;
  };
  validationTargets: PlanValidationTarget[];
  createdTimestamp: number;
}
