/**
 * Writing OS Core — Evidence Registry & Architectural Decision Ledger (P22)
 * Synthesizes all empirical findings, evidence levels (L0-L7), epistemic status classifications,
 * negative/superseded hypotheses, and Architecture Decision Records (ADRs 001-007).
 */

export type EvidenceLevel =
  | 'LEVEL_0_HYPOTHESIS'
  | 'LEVEL_1_UNIT_TEST'
  | 'LEVEL_2_CONTROLLED_BENCHMARK'
  | 'LEVEL_3_FROZEN_HOLDOUT'
  | 'LEVEL_4_MULTI_MODEL_REGISTER'
  | 'LEVEL_5_USER_EVIDENCE'
  | 'LEVEL_6_INDEPENDENT_REPLICATION'
  | 'LEVEL_7_PRODUCTION_OBSERVATION';

export type EpistemicStatus =
  | 'PROVEN_WITHIN_TESTED_SCOPE'
  | 'STRONGLY_SUPPORTED'
  | 'PROMISING'
  | 'OPEN_UNKNOWN';

export interface EvidenceCard {
  id: string;
  claim: string;
  definition: string;
  status: EpistemicStatus;
  highestEvidenceLevel: EvidenceLevel;
  supportingPhases: string[];
  sampleSize: number;
  datasets: string[];
  counterevidenceObserved: string;
  knownLimitations: string;
  independentReplicationPhases: string[];
  confidenceRating: 'HIGH_WITHIN_SCOPE' | 'MODERATE' | 'PRELIMINARY';
}

export interface NegativeEvidenceCard {
  id: string;
  rejectedHypothesis: string;
  initialAssumption: string;
  rejectionPhase: string;
  reason: string;
  supersededBy: string;
}

export interface ArchitectureDecisionRecord {
  adrId: string;
  title: string;
  context: string;
  decision: string;
  consequences: string;
  status: 'ACCEPTED_INVARIANT';
}

export class EvidenceRegistry {
  private static evidenceCards: Map<string, EvidenceCard> = new Map();
  private static negativeLedger: Map<string, NegativeEvidenceCard> = new Map();
  private static adrLedger: Map<string, ArchitectureDecisionRecord> = new Map();

  static {
    // 1. Register Core Evidence Cards
    this.registerCard({
      id: 'STATE_AUTHORITY_HIERARCHY',
      claim: 'Authoritative state cannot be overwritten or corrupted by untrusted model generation.',
      definition: 'State properties with higher authority (CANON, SOURCE_VERIFIED) strictly reject mutations proposed by lower authority (LLM_PROPOSED).',
      status: 'PROVEN_WITHIN_TESTED_SCOPE',
      highestEvidenceLevel: 'LEVEL_7_PRODUCTION_OBSERVATION',
      supportingPhases: ['P1', 'P2', 'P7', 'P8', 'P12', 'P13', 'P14', 'P15', 'P17', 'P18', 'P20'],
      sampleSize: 450,
      datasets: ['canonical_state_adversarial_v1', 'multi_tenant_isolation_matrix', 'red_team_injection_corpus'],
      counterevidenceObserved: 'Zero observed state authority inversions across all regression and adversarial suites.',
      knownLimitations: 'Requires distributed consensus protocol when scaling across multi-region write nodes.',
      independentReplicationPhases: ['P14', 'P17', 'P19', 'P20'],
      confidenceRating: 'HIGH_WITHIN_SCOPE',
    });

    this.registerCard({
      id: 'PERSISTENT_STATE_BURDEN_REDUCTION',
      claim: 'Persistent state memory substantially reduces human supervision minutes and constraint repetition.',
      definition: 'Maintaining a structured state graph eliminates user cognitive burden by preventing context drift across turns.',
      status: 'STRONGLY_SUPPORTED',
      highestEvidenceLevel: 'LEVEL_6_INDEPENDENT_REPLICATION',
      supportingPhases: ['P8', 'P10.2', 'P11', 'P11.1', 'P12', 'P17', 'P19'],
      sampleSize: 180,
      datasets: ['longitudinal_100_turn_corpus', 'user_study_n60_open_tasks'],
      counterevidenceObserved: 'None in tested longitudinal authoring workflows.',
      knownLimitations: 'Depends on initial user specification quality during task ingestion.',
      independentReplicationPhases: ['P10.1', 'P11.1', 'P19'],
      confidenceRating: 'HIGH_WITHIN_SCOPE',
    });

    this.registerCard({
      id: 'EXTERNAL_METRICS_NON_AUTHORITATIVE',
      claim: 'External detector scores are observational findings and must not govern generator policies.',
      definition: 'Commercial detector probability outputs lack linear correlation with editorial quality and must remain strictly observational.',
      status: 'PROVEN_WITHIN_TESTED_SCOPE',
      highestEvidenceLevel: 'LEVEL_3_FROZEN_HOLDOUT',
      supportingPhases: ['P21'],
      sampleSize: 60,
      datasets: ['detector_matched_corpus_v1'],
      counterevidenceObserved: 'Authentic human literature exhibited non-zero false positive AI probability (18.0%).',
      knownLimitations: 'Sample size limited to tested 6-condition matched corpus.',
      independentReplicationPhases: ['P21'],
      confidenceRating: 'HIGH_WITHIN_SCOPE',
    });

    // 2. Register Negative & Superseded Evidence Cards
    this.registerNegative({
      id: 'NEG-001_NAIVE_REGEX_WORD_BANNING',
      rejectedHypothesis: 'Banning specific stylistic words (e.g., "tapestry", "shiver") makes AI writing human-like.',
      initialAssumption: 'AI cliches can be eradicated through surface string matching.',
      rejectionPhase: 'P4',
      reason: 'Word banning produced sterile, unnatural prose that still lacked psychological depth and caused semantic regressions.',
      supersededBy: 'PSYCHOLOGICAL_CAUSALITY_AND_ATTENTION_FILTERING',
    });

    this.registerNegative({
      id: 'NEG-002_DETECTOR_SCORE_OPTIMIZATION',
      rejectedHypothesis: 'Optimizing prose generation to minimize GPTZero scores improves writing quality.',
      initialAssumption: 'Passing AI detectors is equivalent to writing high-quality human prose.',
      rejectionPhase: 'P21',
      reason: 'Detector optimization introduced arbitrary lexical noise (regex jitter) that severely degraded factual precision and authorial voice.',
      supersededBy: 'INDEPENDENT_DECOUPLED_QUALITY_AND_INTEGRITY_GATES',
    });

    // 3. Register Architecture Decision Records (ADRs 001 - 007)
    this.registerAdr({
      adrId: 'ADR-001',
      title: 'Deterministic Triage is Proof-Oriented',
      context: 'Ambiguous claims during parsing must be resolved deterministically rather than guessed.',
      decision: 'Enforce strict claim extraction with explicit confidence levels before state insertion.',
      consequences: 'Eliminates silent hallucinations at the ingestion boundary.',
      status: 'ACCEPTED_INVARIANT',
    });

    this.registerAdr({
      adrId: 'ADR-002',
      title: 'Unsupported is Distinct from Contradicted',
      context: 'A claim without supporting evidence in state must not be treated as a confirmed contradiction.',
      decision: 'Categorize claims as VERIFIED, CONTRADICTED, or UNSUPPORTED with appropriate triage pathways.',
      consequences: 'Enables safe inquiry/clarification without falsely failing valid creative assertions.',
      status: 'ACCEPTED_INVARIANT',
    });

    this.registerAdr({
      adrId: 'ADR-003',
      title: 'Entity Identity Does Not Imply Property Authorization',
      context: 'An authorized entity reference cannot unilaterally alter unauthorized properties.',
      decision: 'Validate authorization at the granular property level with explicit authority ranks.',
      consequences: 'Protects critical state facts (CANON) from partial entity updates.',
      status: 'ACCEPTED_INVARIANT',
    });

    this.registerAdr({
      adrId: 'ADR-004',
      title: 'Safe Handoff is an Authorized First-Class Outcome',
      context: 'When automated repair oscillates or state contradictions occur, more computation cannot create truth.',
      decision: 'Escalate to human supervision via structured HANDOFF rather than looping or guessing.',
      consequences: 'Ensures zero under-handoff on critical state contradictions.',
      status: 'ACCEPTED_INVARIANT',
    });

    this.registerAdr({
      adrId: 'ADR-005',
      title: 'External Metrics are Non-Authoritative Observations',
      context: 'Third-party tools and AI detectors produce noisy observational scores.',
      decision: 'Prohibit detector scores from mutating core authoring policies, state, or prompts.',
      consequences: 'Prevents policy drift and preserves authentic authorial voice.',
      status: 'ACCEPTED_INVARIANT',
    });

    this.registerAdr({
      adrId: 'ADR-006',
      title: 'Independent Decoupling of Generation and Validation',
      context: 'Evaluating prose with the same prompt/model that generated it introduces self-serving bias.',
      decision: 'Enforce separate dual-track validation (Integrity Gate vs Quality Gate).',
      consequences: 'Guarantees uncompromised integrity enforcement regardless of stylistic fluency.',
      status: 'ACCEPTED_INVARIANT',
    });

    this.registerAdr({
      adrId: 'ADR-007',
      title: 'Surface Variation Must Preserve Semantic State',
      context: 'Style transformations and tone revisions must never alter underlying facts.',
      decision: 'Enforce state preservation invariant: State(Rewritten) == State(Original).',
      consequences: 'Enables safe authorial voice adaptation without semantic regression.',
      status: 'ACCEPTED_INVARIANT',
    });
  }

  public static registerCard(card: EvidenceCard): void {
    this.evidenceCards.set(card.id, card);
  }

  public static getCard(id: string): EvidenceCard | undefined {
    return this.evidenceCards.get(id);
  }

  public static getAllCards(): EvidenceCard[] {
    return Array.from(this.evidenceCards.values());
  }

  public static registerNegative(card: NegativeEvidenceCard): void {
    this.negativeLedger.set(card.id, card);
  }

  public static getAllNegativeCards(): NegativeEvidenceCard[] {
    return Array.from(this.negativeLedger.values());
  }

  public static registerAdr(adr: ArchitectureDecisionRecord): void {
    this.adrLedger.set(adr.adrId, adr);
  }

  public static getAdr(adrId: string): ArchitectureDecisionRecord | undefined {
    return this.adrLedger.get(adrId);
  }

  public static getAllAdrs(): ArchitectureDecisionRecord[] {
    return Array.from(this.adrLedger.values());
  }
}
