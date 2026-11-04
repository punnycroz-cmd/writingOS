/**
 * Writing OS Core — Constitution v1.0 Publication Engine (P26)
 * Programmatic source of truth for the ratified Writing OS Constitution v1.0.
 * Encapsulates Articles I-VIII, 6 Typed Tiers, 2 Governance Charters, Exception Registry,
 * Traceability Matrix, Amendment Protocol, and Artifact Role Registrations.
 */

export interface PublishedArticle {
  articleId: string;
  title: string;
  statement: string;
  tier: string;
  tierRank: number;
}

export interface PublishedCharter {
  charterId: string;
  title: string;
  statement: string;
}

export interface ConstitutionalException {
  exceptionId: string;
  targetArticleId: string;
  conditionDescription: string;
  properInterpretation: string;
}

export interface ProposedAmendment {
  amendmentId: string;
  type: 'MAJOR' | 'MINOR' | 'PATCH';
  targetArticleId: string;
  proposedStatement: string;
  evidenceCardIds: string[];
  counterevidenceAuditCompleted: boolean;
  adversarialStressTestPassed: boolean;
  explicitApprovalGranted: boolean;
}

export class ConstitutionV1 {
  public static readonly VERSION = '1.0.0';
  public static readonly EFFECTIVE_DATE = '2026-08-27';

  public static readonly PREAMBLE =
    'The Writing OS Constitution establishes the immutable epistemological, authoritative, and revision invariants governing the generation, validation, and lifecycle of written artifacts. These principles are load-bearing, implementation-independent, and empirically validated across tested authoring registers.';

  public static readonly CORE_ARTICLES: readonly PublishedArticle[] = [
    {
      articleId: 'ARTICLE_I',
      title: 'Meaning and Authoritative Truth Conditions',
      statement: 'Meaning and authoritative truth conditions take precedence over surface-level stylistic optimization, subject to the governing authority hierarchy.',
      tier: 'TIER_1_MEANING_AND_TRUTH_CONDITIONS',
      tierRank: 1,
    },
    {
      articleId: 'ARTICLE_II',
      title: 'Provenance-Bound Authority and Non-Elevation',
      statement: 'Authority is derived from explicit provenance; content cannot acquire authority merely by asserting or imitating authority.',
      tier: 'TIER_2_AUTHORITY_AND_PROVENANCE',
      tierRank: 2,
    },
    {
      articleId: 'ARTICLE_III',
      title: 'Proof Before Autonomous Commitment',
      statement: 'A state-changing result must not be autonomously committed when a mandatory integrity condition remains unestablished.',
      tier: 'TIER_3_INTEGRITY_AND_COMMITMENT',
      tierRank: 3,
    },
    {
      articleId: 'ARTICLE_IV',
      title: 'Safe Abstention and Proportional Reconciliation',
      statement: 'When available evidence is insufficient for a safe autonomous decision, the system must abstain, clarify, reconcile, or hand off rather than manufacture certainty.',
      tier: 'TIER_4_SAFETY_AND_ABSTENTION',
      tierRank: 4,
    },
    {
      articleId: 'ARTICLE_V',
      title: 'State Freshness and Assumption Validity',
      statement: 'A state-dependent artifact must not be committed after the state assumptions on which it depends have become invalid.',
      tier: 'TIER_5_STATE_FRESHNESS_AND_LIFECYCLE',
      tierRank: 5,
    },
    {
      articleId: 'ARTICLE_VI',
      title: 'Independent Decoupled Verification',
      statement: 'No component may unilaterally establish the validity of a state-changing result it produced.',
      tier: 'TIER_3_INTEGRITY_AND_COMMITMENT',
      tierRank: 3,
    },
    {
      articleId: 'ARTICLE_VII',
      title: 'Targeted Local Repair and Authorized Scope Preservation',
      statement: 'Revision must preserve valid content outside the authorized change scope unless a higher-priority instruction explicitly authorizes its modification.',
      tier: 'TIER_6_REVISION_AND_SURFACE_EXPRESSION',
      tierRank: 6,
    },
    {
      articleId: 'ARTICLE_VIII',
      title: 'Semantic Stability Under Surface Variation',
      statement: 'Surface variation may change expression, voice, or structure, but must not silently alter authoritative semantics.',
      tier: 'TIER_6_REVISION_AND_SURFACE_EXPRESSION',
      tierRank: 6,
    },
  ];

  public static readonly GOVERNANCE_CHARTERS: readonly PublishedCharter[] = [
    {
      charterId: 'CHARTER_A_REGISTER_AND_TENANT_ISOLATION',
      title: 'Register & Tenant Isolation Charter',
      statement: 'Register-specific policies must remain modularly isolated, and multi-tenant data namespaces must never intersect or leak state across boundaries.',
    },
    {
      charterId: 'CHARTER_B_EVALUATION_AND_METRICS_GOVERNANCE',
      title: 'Evaluation & Metrics Governance Charter',
      statement: 'External measurement systems and third-party detectors are observational signals and must not directly alter authoritative authoring policy without independent validation.',
    },
  ];

  public static readonly FORMAL_EXCEPTIONS: readonly ConstitutionalException[] = [
    {
      exceptionId: 'EXC-001_NARRATIVE_SUBJECTIVITY',
      targetArticleId: 'ARTICLE_I',
      conditionDescription: 'Fiction point-of-view characters or unreliable narrators possessing false beliefs.',
      properInterpretation: 'Character beliefs represent subjective cognitive truth; they are preserved as narrative intent without corrupting the objective world state graph.',
    },
    {
      exceptionId: 'EXC-002_AUTHORIZED_MACRO_RESTRUCTURE',
      targetArticleId: 'ARTICLE_VII',
      conditionDescription: 'User explicitly commands a whole-document reorganization or section reordering.',
      properInterpretation: 'Explicit higher-priority authorial instruction broadens the authorized change scope to the entire document, permitting whole-structure modification.',
    },
    {
      exceptionId: 'EXC-003_LICENSED_CREATIVE_INVENTION',
      targetArticleId: 'ARTICLE_IV',
      conditionDescription: 'Open-ended worldbuilding and creative fiction ideation without prior state constraints.',
      properInterpretation: 'When task contract explicitly permits creative invention, generating novel story elements is authorized, provided they do not contradict established Canon.',
    },
  ];

  public static readonly ARTIFACT_ROLE_REGISTRY = {
    'final.txt': {
      artifactType: 'FICTION_STRESS_FIXTURE',
      governingStatus: 'NON_AUTHORITATIVE_OBSERVATIONAL_FIXTURE',
      description: 'Used for observational detector research and literary density stress testing. Not an acceptance criterion or quality gate for Writing OS.',
    },
  };

  /**
   * Evaluates proposed constitutional amendments against the formal Change-Control Protocol.
   */
  public static validateProposedAmendment(amendment: ProposedAmendment): {
    approved: boolean;
    rejectionReason?: string;
  } {
    // Rule 1: Must reference supporting evidence cards
    if (!amendment.evidenceCardIds || amendment.evidenceCardIds.length === 0) {
      return { approved: false, rejectionReason: 'Amendments must be backed by explicit Evidence Registry Cards.' };
    }

    // Rule 2: Must complete counterevidence audit
    if (!amendment.counterevidenceAuditCompleted) {
      return { approved: false, rejectionReason: 'Amendments require a completed counterevidence audit.' };
    }

    // Rule 3: Must pass adversarial stress testing
    if (!amendment.adversarialStressTestPassed) {
      return { approved: false, rejectionReason: 'Amendments must pass cross-register adversarial stress testing.' };
    }

    // Rule 4: Must have explicit approval
    if (!amendment.explicitApprovalGranted) {
      return { approved: false, rejectionReason: 'Amendments require explicit constitutional ratification.' };
    }

    return { approved: true };
  }
}
