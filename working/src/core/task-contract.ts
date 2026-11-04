/**
 * Writing OS Core — Task Contract (v5.0 Hardened)
 * Universal schema that normalizes every writing task across all registers without hard-coded style thresholds.
 */

export type RegisterType = 'fiction' | 'academic' | 'business' | 'legal' | 'technical' | 'general';

export type InventionPolicy = 
  | 'STRICT_NONE'             // Zero invention allowed (Academic, Legal)
  | 'LIMITED_INFERENCE'       // Inference from source facts only (Business, Technical)
  | 'LICENSED_FICTION'        // Creative invention bounded strictly by Canon/State (Fiction)
  | 'OPEN';                   // Unconstrained exploratory

export type SourceConstraintLevel = 'STRICT' | 'GUIDED' | 'UNCONSTRAINED';

export type AudienceLevel = 'EXPERT' | 'EXECUTIVE' | 'GENERAL_PUBLIC' | 'TECHNICAL' | 'PEER_REVIEW';

export interface WritingTaskContract {
  taskId: string;
  taskType: 'generation' | 'rewrite' | 'continuation' | 'transformation' | 'synthesis' | 'audit';
  register: RegisterType;
  objective: string;
  sourceConstraints: SourceConstraintLevel;
  inventionPolicy: InventionPolicy;
  audience: AudienceLevel;
  voiceRequirements: {
    targetFormality: 'informal' | 'conversational' | 'professional' | 'academic' | 'literary';
    allowedFilterWords: boolean;
    perspective: 'first_person' | 'second_person' | 'third_person_limited' | 'third_person_omniscient' | 'objective';
  };
  stateRequirements: {
    requiredEntityTypes: string[];
    enforceTemporalOrder: boolean;
    requireProvenance: boolean;
    trackUnknowns: boolean;
  };
  validationRequirements: {
    enforceDeterministicProof: boolean;
    requireIndependentSemanticJudge: boolean;
    allowHandoffToHuman: boolean;
  };
  diagnosticMetrics?: Record<string, unknown>;
  customMetadata?: Record<string, unknown>;
}

export class TaskContractValidator {
  public static normalize(rawTask: Partial<WritingTaskContract>): WritingTaskContract {
    if (!rawTask.taskId) {
      rawTask.taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
    if (!rawTask.register) {
      rawTask.register = 'general';
    }
    if (!rawTask.taskType) {
      rawTask.taskType = 'generation';
    }
    if (!rawTask.objective) {
      throw new Error(`TaskContract Error: 'objective' is required.`);
    }

    const defaultInventionPolicy: Record<RegisterType, InventionPolicy> = {
      fiction: 'LICENSED_FICTION',
      academic: 'STRICT_NONE',
      legal: 'STRICT_NONE',
      business: 'LIMITED_INFERENCE',
      technical: 'LIMITED_INFERENCE',
      general: 'OPEN',
    };

    const defaultSourceConstraints: Record<RegisterType, SourceConstraintLevel> = {
      fiction: 'GUIDED',
      academic: 'STRICT',
      legal: 'STRICT',
      business: 'GUIDED',
      technical: 'STRICT',
      general: 'UNCONSTRAINED',
    };

    const defaultFormality: Record<RegisterType, 'informal' | 'conversational' | 'professional' | 'academic' | 'literary'> = {
      fiction: 'literary',
      academic: 'academic',
      legal: 'professional',
      business: 'professional',
      technical: 'professional',
      general: 'conversational',
    };

    return {
      taskId: rawTask.taskId,
      taskType: rawTask.taskType,
      register: rawTask.register,
      objective: rawTask.objective,
      sourceConstraints: rawTask.sourceConstraints || defaultSourceConstraints[rawTask.register],
      inventionPolicy: rawTask.inventionPolicy || defaultInventionPolicy[rawTask.register],
      audience: rawTask.audience || 'GENERAL_PUBLIC',
      voiceRequirements: {
        targetFormality: rawTask.voiceRequirements?.targetFormality || defaultFormality[rawTask.register],
        allowedFilterWords: rawTask.voiceRequirements?.allowedFilterWords ?? false,
        perspective: rawTask.voiceRequirements?.perspective || (rawTask.register === 'fiction' ? 'third_person_limited' : 'objective'),
      },
      stateRequirements: {
        requiredEntityTypes: rawTask.stateRequirements?.requiredEntityTypes || [],
        enforceTemporalOrder: rawTask.stateRequirements?.enforceTemporalOrder ?? true,
        requireProvenance: rawTask.stateRequirements?.requireProvenance ?? (rawTask.register !== 'general'),
        trackUnknowns: rawTask.stateRequirements?.trackUnknowns ?? true,
      },
      validationRequirements: {
        enforceDeterministicProof: rawTask.validationRequirements?.enforceDeterministicProof ?? true,
        requireIndependentSemanticJudge: rawTask.validationRequirements?.requireIndependentSemanticJudge ?? true,
        allowHandoffToHuman: rawTask.validationRequirements?.allowHandoffToHuman ?? true,
      },
      diagnosticMetrics: rawTask.diagnosticMetrics || {},
      customMetadata: rawTask.customMetadata || {},
    };
  }
}
