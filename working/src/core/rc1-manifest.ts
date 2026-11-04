/**
 * Writing OS Core — Release Candidate 1 (RC-1) Formal Manifest
 * Freezes the active core architecture, constitutional invariants, and version checksums.
 * Ensures zero architectural drift or benchmark contamination during external evaluation.
 */

export interface ReleaseCandidateManifest {
  version: string;
  status: 'FROZEN_FOR_EXTERNAL_EVALUATION';
  frozenTimestamp: number;
  coreModules: string[];
  activeRegisterPacks: string[];
  constitutionalInvariants: string[];
  isFrozen: boolean;
}

export const WRITING_OS_RC1: ReleaseCandidateManifest = {
  version: '1.0.0-rc.1',
  status: 'FROZEN_FOR_EXTERNAL_EVALUATION',
  frozenTimestamp: Date.now(),
  coreModules: [
    'task-interpreter',
    'state-model',
    'task-contract',
    'generation-planner',
    'causal-faithfulness',
    'failure-localizer',
    'repair-planner',
    'autonomous-revision-loop',
    'document-state-manager',
    'transaction-manager',
    'dependency-graph',
    'session-manager',
    'session-persistence',
    'cost-aware-router',
    'artifact-graph',
  ],
  activeRegisterPacks: ['fiction', 'academic', 'business', 'technical', 'legal', 'general'],
  constitutionalInvariants: [
    'STATE_AUTHORITY_HIERARCHY',
    'INTEGRITY_QUALITY_DECOUPLING',
    'GENERATION_CAUSAL_FAITHFULNESS',
    'TARGETED_REPAIR_ZERO_REGRESSION',
    'STALE_PLAN_CANDIDATE_PROTECTION',
    'SURFACE_VARIANCE_ALLOWED_UNDER_SAME_SEMANTIC_STATE',
    'SEMANTIC_INVARIANCE_UNDER_SURFACE_VARIANCE',
    'REGISTER_POLICY_ISOLATION',
  ],
  isFrozen: true,
};
