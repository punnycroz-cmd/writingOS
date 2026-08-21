// types.ts — State schema V1 (discovered through execution, not assumed)
// Every field here exists because the Character Specificity loop requires it.

// ---- CHARACTER STATE ----
// A character is not a name; a character is a causal nexus of attention, memory, belief, and habit.
export interface CharacterState {
  identity: string;              // canonical name + role
  goals: string[];               // active desires driving attention
  fears: string[];               // what the character dreads (drives what they notice)
  beliefs: string[];             // things they hold true (may be false)
  memories: string[];            // salient prior experiences that shape perception
  emotionalState: string;        // current affect (drives interpretation)
  perceptualHabits: string[];    // what this character specifically attends to (profession, culture, trauma)
  voice: string;                 // established speech/thought patterns
  currentKnowledge: string[];    // facts they currently possess (mirrors InfoOwnership "knows")
}

// ---- INFORMATION OWNERSHIP ----
// "Who knows what" — the engine's primary defense against leaking future/secret information.
export interface InfoOwnershipEntry {
  fact: string;
  knows: string[];        // characters who possess this fact
  suspects: string[];     // characters who suspect but don't know
  misunderstands: string[]; // characters who hold a wrong version
  unknown: string[];      // characters who do not possess this fact
  changedAt?: number;     // scene index when knowledge state changed
}

export interface InformationOwnership {
  entries: InfoOwnershipEntry[];
}

// ---- CANON STATE ----
// Epistemic classification of every established fact.
export type CanonClassification = 'HARD_CANON' | 'SOFT_CANON' | 'HYPOTHESIS' | 'UNKNOWN';

export interface CanonFact {
  content: string;
  classification: CanonClassification;
  source: string;  // where established (scene, prior chapter, author input)
}

export interface CanonState {
  facts: CanonFact[];
}

// ---- DEFERRED CHECKS ----
// Long-range mechanisms that cannot be judged locally.
export interface DeferredCheck {
  id: string;
  type: string;              // e.g. 'foreshadowing', 'mystery_clue', 'promise'
  anchorSpan: string;        // the setup text
  setupSummary: string;
  status: 'DEFERRED' | 'PASS' | 'FAIL';
  resolutionAnchor?: string;
}

// ---- DOCUMENT STATE (the persisted object) ----
export interface DocumentState {
  character: CharacterState;
  informationOwnership: InformationOwnership;
  canon: CanonState;
  deferredChecks: DeferredCheck[];
  sceneId: string;
  revisionId: number;
}

// ---- DIAGNOSTIC OUTPUT ----
export type DetectionClass =
  | 'GENERIC'                // could belong to any protagonist
  | 'CHARACTER_SPECIFIC'     // causally tied to this character
  | 'INTENTIONALLY_GENERIC'  // genericity is narratively purposeful
  | 'CANON_VIOLATION'        // contradicts established canon
  | 'DEFERRED_CONTEXT';      // meaning depends on unresolved future

export interface DetectionResult {
  classification: DetectionClass;
  evidence: string[];          // specific details present that tie to character
  absentDetails: string[];     // details this character would plausibly notice but are missing
  narrativelyPurposeful: boolean; // is the genericity intentional?
  canonConflicts: string[];    // any contradictions with canon
  reasoning: string;
}

// ---- SEVERITY ----
export type Severity = 'NONE' | 'MINOR' | 'MATERIAL' | 'CRITICAL';

// ---- DECISION ----
export type Decision =
  | 'ACCEPT_UNCHANGED'        // no intervention needed
  | 'OPTIONAL_POLISH'         // minor local edit permitted
  | 'TARGETED_REWRITE'        // material rewrite of specific region
  | 'ESCALATE'                // cannot resolve automatically
  | 'REJECT_AND_FLAG'         // canon violation / integrity risk — surface to author
  | 'DEFER'                   // cannot judge until later context exists
  | 'BLOCK_INTERVENTION';     // intervention was generated but validation blocked it

// ---- INTERVENTION ----
export type InterventionType =
  | 'lexical_substitution'
  | 'perception_detail'
  | 'attention_detail'
  | 'internal_thought'
  | 'sensory_detail'
  | 'metaphor'
  | 'rhythm'
  | 'memory_reference'
  | 'action_detail'
  | 'dialogue_adjustment';

export interface InterventionCandidate {
  revisedText: string;
  interventionTypes: InterventionType[];
  stateUsed: string[];        // which state fields informed the revision
  constraintsApplied: string[];
}

// ---- VALIDATION ----
export interface ValidationResult {
  meaning: 'PASS' | 'FAIL' | 'UNCLEAR';
  character: 'PASS' | 'FAIL' | 'UNCLEAR';
  infoOwnership: 'PASS' | 'FAIL' | 'UNCLEAR';
  canon: 'PASS' | 'FAIL' | 'UNCLEAR';
  voice: 'PASS' | 'FAIL' | 'UNCLEAR';
  register: 'PASS' | 'FAIL' | 'UNCLEAR';
  intelligibility: 'PASS' | 'FAIL' | 'UNCLEAR';
  deferred: 'PASS' | 'FAIL' | 'UNCLEAR';
  faithfulness: 'PASS' | 'FAIL' | 'UNCLEAR';
  overall: 'ACCEPT' | 'REJECT';
  reasons: string[];
}

// ---- DETERMINISTIC CHECK RESULTS (Iteration 2 [CC] layer) ----
export interface DeterministicChecks {
  deferredAnchor: {          // pre-detection
    relevance: string;
    matchedCheckId?: string;
    overlapType?: string;
    jaccardScore?: number;
  };
  canonAlerts: {              // pre-detection recall booster
    canonFact: string;
    alertKeyword: string;
    passageSnippet: string;
  }[];
  supportedSpecificity: {    // post-intervention, pre-validation
    unsupported: { type: string; value: string }[];
    total: number;
    unsupportedCount: number;
  } | null;
}

// ---- STATE TRANSITIONS (for multi-scene temporal tests) ----
export interface StateTransition {
  type: 'info_ownership' | 'canon_classification';
  fact: string;
  character?: string;
  from: string;
  to: string;
  atScene: string;
  reason: string;
}

// ---- LOG ENTRY (the auditable record — extended for Iteration 2) ----
export interface LogEntry {
  timestamp: string;
  caseId: string;
  sceneId: string;
  revisionId: number;
  originalPassage: string;
  diagnostic: string;          // 'character_specificity'
  deterministicChecks: DeterministicChecks;  // [CC] layer results
  detection: DetectionResult;
  severity: Severity;
  decision: Decision;
  intervention: InterventionCandidate | null;
  validation: ValidationResult | null;
  accepted: boolean;
  finalText: string;
  reason: string;              // why accepted/rejected (human-readable summary)
  remainingDeferred: string[];
  stateDiscovered: string[];
  stateTransitions: StateTransition[];  // transitions applied before this scene
  inputStateSummary: string;   // brief summary of state at this scene
}
