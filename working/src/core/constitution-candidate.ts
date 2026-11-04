/**
 * Writing OS Core — Constitution Candidate Set & Traceability Matrix (P23)
 * Distills 10 foundational Constitutional Candidate Articles extracted from empirical evidence (P0-P22).
 * Formulates implementation-independent universal invariants with explicit conflict priority rankings.
 */

export interface ConstitutionCandidateArticle {
  articleId: string;
  title: string;
  canonicalStatement: string;
  epistemicRationale: string;
  conflictPriorityRank: number; // 1 = Absolute Highest Priority
  supportingEvidencePhases: string[];
  scopeApplicability: ('FICTION' | 'ACADEMIC' | 'BUSINESS' | 'TECHNICAL' | 'LEGAL' | 'GENERAL')[];
  knownCounterevidence: string;
  implementationIndependenceGuarantee: string;
}

export class ConstitutionTraceabilityMatrix {
  private static articles: Map<string, ConstitutionCandidateArticle> = new Map();

  static {
    // Article I: Meaning & Truth Primacy
    this.registerArticle({
      articleId: 'ARTICLE_I',
      title: 'Meaning and Truth Primacy',
      canonicalStatement: 'Meaning, truth, and authoritative constraints outrank surface-level stylistic optimization.',
      epistemicRationale: 'Stylistic fluency without semantic truth produces deceptive prose and violates core authorial intent.',
      conflictPriorityRank: 1,
      supportingEvidencePhases: ['P3', 'P4', 'P5', 'P9', 'P10', 'P21'],
      scopeApplicability: ['FICTION', 'ACADEMIC', 'BUSINESS', 'TECHNICAL', 'LEGAL', 'GENERAL'],
      knownCounterevidence: 'None. In fiction, internal psychological truth and narrative constraints govern truth.',
      implementationIndependenceGuarantee: 'Independent of specific prompt engineering or LLM temperature settings.',
    });

    // Article II: Provenance-Bound Authority & Non-Elevation
    this.registerArticle({
      articleId: 'ARTICLE_II',
      title: 'Provenance-Bound Authority and Non-Elevation',
      canonicalStatement: 'State authority must be derived strictly from verified provenance; untrusted generation cannot self-elevate its own authority.',
      epistemicRationale: 'Allowing unverified text or model assertions to declare Canon authority causes irreversible state contamination.',
      conflictPriorityRank: 2,
      supportingEvidencePhases: ['P1', 'P2', 'P7', 'P13', 'P14', 'P15', 'P20'],
      scopeApplicability: ['FICTION', 'ACADEMIC', 'BUSINESS', 'TECHNICAL', 'LEGAL', 'GENERAL'],
      knownCounterevidence: 'None across 450+ adversarial state injection test cases.',
      implementationIndependenceGuarantee: 'Applies equally to in-memory graphs, document stores, and distributed ledgers.',
    });

    // Article III: Proof Before Autonomous Commitment
    this.registerArticle({
      articleId: 'ARTICLE_III',
      title: 'Proof Before Autonomous Commitment',
      canonicalStatement: 'The system must not autonomously commit a state-changing candidate when a mandatory integrity condition remains unestablished.',
      epistemicRationale: 'Silent autonomous commits of unverified candidates destroy human trust and introduce irrecoverable factual drift.',
      conflictPriorityRank: 3,
      supportingEvidencePhases: ['P1', 'P3', 'P6', 'P13', 'P15', 'P18'],
      scopeApplicability: ['FICTION', 'ACADEMIC', 'BUSINESS', 'TECHNICAL', 'LEGAL', 'GENERAL'],
      knownCounterevidence: 'None in automated release validation gates.',
      implementationIndependenceGuarantee: 'Enforces verification before commit regardless of transactional database engine.',
    });

    // Article IV: Safe Abstention & Proportionate Handoff
    this.registerArticle({
      articleId: 'ARTICLE_IV',
      title: 'Safe Abstention and Proportionate Handoff',
      canonicalStatement: 'When available evidence is insufficient for a safe autonomous decision, the system must abstain, clarify, or hand off rather than fabricate certainty.',
      epistemicRationale: 'Guessing under ambiguity causes severe hallucination. Controlled handoff preserves system integrity.',
      conflictPriorityRank: 4,
      supportingEvidencePhases: ['P2', 'P7', 'P8', 'P11', 'P16', 'P19'],
      scopeApplicability: ['FICTION', 'ACADEMIC', 'BUSINESS', 'TECHNICAL', 'LEGAL', 'GENERAL'],
      knownCounterevidence: 'Requires careful calibration to prevent excessive over-handoff on trivial creative variations.',
      implementationIndependenceGuarantee: 'Independent of human UI modalities (dialog, CLI, or inline comment).',
    });

    // Article V: State Temporal Validity & Stale Protection
    this.registerArticle({
      articleId: 'ARTICLE_V',
      title: 'State Temporal Validity and Stale Protection',
      canonicalStatement: 'Artifacts generated against stale state must never be committed as though they were generated against current state.',
      epistemicRationale: 'Concurrent edits or user mind-changes invalidate older generation assumptions.',
      conflictPriorityRank: 5,
      supportingEvidencePhases: ['P8', 'P12', 'P13', 'P14', 'P17', 'P20'],
      scopeApplicability: ['FICTION', 'ACADEMIC', 'BUSINESS', 'TECHNICAL', 'LEGAL', 'GENERAL'],
      knownCounterevidence: 'None in multi-turn longitudinal benchmarks.',
      implementationIndependenceGuarantee: 'Enforced via optimistic concurrency version vectors across any storage layer.',
    });

    // Article VI: Independent Decoupled Verification
    this.registerArticle({
      articleId: 'ARTICLE_VI',
      title: 'Independent Decoupled Verification',
      canonicalStatement: 'No component may unilaterally establish the validity of a state-changing result it produced.',
      epistemicRationale: 'Generators evaluate their own output with systematic self-serving bias.',
      conflictPriorityRank: 6,
      supportingEvidencePhases: ['P1', 'P3.1', 'P5', 'P6', 'P10.1', 'P15'],
      scopeApplicability: ['FICTION', 'ACADEMIC', 'BUSINESS', 'TECHNICAL', 'LEGAL', 'GENERAL'],
      knownCounterevidence: 'Requires independent rubric and separate evaluator instances.',
      implementationIndependenceGuarantee: 'Applies to deterministic rule engines, secondary models, and human-in-the-loop reviewers.',
    });

    // Article VII: Targeted Local Repair & Collateral Preservation
    this.registerArticle({
      articleId: 'ARTICLE_VII',
      title: 'Targeted Local Repair and Collateral Preservation',
      canonicalStatement: 'Revision must preserve valid unrelated content unless explicit authorial instruction directs otherwise.',
      epistemicRationale: 'Whole-document regenerations destroy good writing and introduce regression in unrelated paragraphs.',
      conflictPriorityRank: 7,
      supportingEvidencePhases: ['P3.1', 'P3.2', 'P6', 'P10.2', 'P16', 'P17'],
      scopeApplicability: ['FICTION', 'ACADEMIC', 'BUSINESS', 'TECHNICAL', 'LEGAL', 'GENERAL'],
      knownCounterevidence: 'High-level macro restructure requests explicitly authorize whole-document reordering.',
      implementationIndependenceGuarantee: 'Independent of diff/merge algorithms or token replacement engines.',
    });

    // Article VIII: Semantic Stability Under Surface Variation
    this.registerArticle({
      articleId: 'ARTICLE_VIII',
      title: 'Semantic Stability Under Surface Variation',
      canonicalStatement: 'Surface stylistic variation and voice adjustments must never silently alter authoritative semantics.',
      epistemicRationale: 'Tone changes (e.g. formal to casual) must not distort financial metrics or narrative facts.',
      conflictPriorityRank: 8,
      supportingEvidencePhases: ['P9', 'P10', 'P17', 'P21'],
      scopeApplicability: ['FICTION', 'ACADEMIC', 'BUSINESS', 'TECHNICAL', 'LEGAL', 'GENERAL'],
      knownCounterevidence: 'None in cross-register deep evaluation suites.',
      implementationIndependenceGuarantee: 'Evaluated by semantic claim preservation gates regardless of prose length.',
    });

    // Article IX: Register Isolation & Namespace Separation
    this.registerArticle({
      articleId: 'ARTICLE_IX',
      title: 'Register Isolation and Namespace Separation',
      canonicalStatement: 'Register-specific policies and tenant memory namespaces must remain strictly isolated.',
      epistemicRationale: 'Fiction policies (allowing creative metaphor) must never contaminate Academic or Business registries.',
      conflictPriorityRank: 9,
      supportingEvidencePhases: ['P3', 'P9', 'P10', 'P12', 'P13', 'P20'],
      scopeApplicability: ['FICTION', 'ACADEMIC', 'BUSINESS', 'TECHNICAL', 'LEGAL', 'GENERAL'],
      knownCounterevidence: 'None across 100-turn multi-tenant stress tests.',
      implementationIndependenceGuarantee: 'Enforced via explicit pack boundaries and tenant-scoped session stores.',
    });

    // Article X: External Metrics as Non-Authoritative Observations
    this.registerArticle({
      articleId: 'ARTICLE_X',
      title: 'External Metrics as Non-Authoritative Observations',
      canonicalStatement: 'External measurement systems and third-party detectors are observational data and must not directly govern authoring policies.',
      epistemicRationale: 'AI detectors track statistical token perplexity rather than authorial depth, causal fidelity, or truth.',
      conflictPriorityRank: 10,
      supportingEvidencePhases: ['P21', 'P22'],
      scopeApplicability: ['FICTION', 'ACADEMIC', 'BUSINESS', 'TECHNICAL', 'LEGAL', 'GENERAL'],
      knownCounterevidence: 'None in matched corpus research.',
      implementationIndependenceGuarantee: 'Locks core generator and repair engines against third-party heuristic drift.',
    });
  }

  public static registerArticle(article: ConstitutionCandidateArticle): void {
    this.articles.set(article.articleId, article);
  }

  public static getArticle(articleId: string): ConstitutionCandidateArticle | undefined {
    return this.articles.get(articleId);
  }

  public static getAllArticlesSortedByPriority(): ConstitutionCandidateArticle[] {
    return Array.from(this.articles.values()).sort(
      (a, b) => a.conflictPriorityRank - b.conflictPriorityRank
    );
  }
}
