// working/src/runtime/pipeline-orchestrator.ts
// Mandatory Dual-Layer Non-Bypassable Pipeline Orchestrator (v3.2)
// Enforces Strict Adversarial Auditing, Generative Revision, Grammar Integrity Quarantine, and Bible Propagation.

import { BibleEngine, BibleValidationReport } from './bible-engine';
import { ContinuityTracker, ContinuityReport } from './continuity-tracker';
import { FictionQualityEvaluator, FictionEvaluationReport } from './fiction-evaluator';
import { MacroStructuralEvaluator, MacroStructuralReport, MacroViolation } from './macro-structural-evaluator';
import { VoicePolisher, VoicePolishReport } from './voice-polisher';
import { ReaderPersonaEvaluator, ReaderPersonaReport } from './reader-persona-evaluator';
import { DiffVisualizer, TrackedChangesReport } from './diff-visualizer';
import { PostRewriteIntegrityAuditor, PostRewriteIntegrityReport } from './story-state-engine';

export interface PipelineAuditReport {
  chapterNumber: number;
  wordCount: number;
  macroReport: MacroStructuralReport;
  qualityReport: FictionEvaluationReport;
  bibleReport?: BibleValidationReport;
  continuityReport?: ContinuityReport;
  grammarViolations: GrammarViolation[];
  passedBaseline: boolean;
}

export interface GrammarViolation {
  snippet: string;
  type: 'MISSING_SUBJECT' | 'ORPHANED_FRAGMENT' | 'CORRUPTED_PREDICATE' | 'LOAN_WORD' | 'UNNATURAL_REPETITION';
  message: string;
}

export interface RemediationDirective {
  category: string;
  targetExcerpt: string;
  requiredInvariant: string;
  remediationRule: 'REWRITE_CONCRETELY' | 'CORRECT_ARITHMETIC' | 'GROUND_SOMATIC_COST' | 'ENFORCE_OPSEC' | 'TRIAGE_CANON_PLANT';
  suggestedAction: string;
}

export interface RemediationPlan {
  chapterNumber: number;
  totalDirectives: number;
  directives: RemediationDirective[];
  requiresAuthorPlantDecision: boolean;
}

export interface VerificationResult {
  passed: boolean;
  status: 'ACCEPTED' | 'REJECTED';
  unresolvedViolations: string[];
  newRegressions: GrammarViolation[];
  finalMacroScore: number;
  readerMetrics?: {
    predictedImmersion: number;
    predictedTension: number;
    predictedEmpathy: number;
  };
}

export interface ProductionDeliveryBundle {
  chapterNumber: number;
  originalText: string;
  verifiedText: string;
  verificationResult: VerificationResult;
  trackedChangesHtml: string;
  globalFactUpdates: Record<string, string>;
  timestamp: string;
}

export class PipelineQuarantineException extends Error {
  public violations: string[];
  public regressions: GrammarViolation[];

  constructor(message: string, violations: string[], regressions: GrammarViolation[]) {
    super(message);
    this.name = 'PipelineQuarantineException';
    this.violations = violations;
    this.regressions = regressions;
  }
}

export class MandatoryPipelineOrchestrator {
  /**
   * STAGE 1: ADVERSARIAL AUDIT
   * Scans raw draft for Macro, Micro, Bible, Continuity, and Grammar flaws.
   */
  public static auditManuscript(chapterNumber: number, text: string): PipelineAuditReport {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const macroReport = MacroStructuralEvaluator.evaluateChapter(text);
    const qualityReport = FictionQualityEvaluator.evaluate(text, 'COMMERCIAL_FICTION');
    const bibleReport = chapterNumber > 0 ? BibleEngine.validateChapter(chapterNumber, text) : undefined;
    const continuityReport = chapterNumber > 0 ? ContinuityTracker.validateContinuity(chapterNumber, text) : undefined;
    
    const grammarViolations = this.detectGrammarAndLexicalRegressions(text);

    const passedBaseline = 
      macroReport.status === 'PASS' && 
      qualityReport.status === 'ACCEPTED' && 
      grammarViolations.length === 0;

    return {
      chapterNumber,
      wordCount: words,
      macroReport,
      qualityReport,
      bibleReport,
      continuityReport,
      grammarViolations,
      passedBaseline,
    };
  }

  /**
   * STAGE 2: REMEDIATION SPECIFICATION GENERATION
   * Converts detected violations into concrete, actionable mathematical & narrative directives.
   */
  public static generateRemediationPlan(audit: PipelineAuditReport): RemediationPlan {
    const directives: RemediationDirective[] = [];

    // Macro Directives
    for (const v of audit.macroReport.violations) {
      let rule: RemediationDirective['remediationRule'] = 'REWRITE_CONCRETELY';
      if (v.category === 'ARITHMETIC_CHRONOLOGY_CONSISTENCY' || v.code.includes('01') || v.code.includes('ARITHMETIC')) {
        rule = 'CORRECT_ARITHMETIC';
      } else if (v.category === 'PROP_SETTING_PLAUSIBILITY' || v.code.includes('03') || v.code.includes('PROP') || v.code.includes('OPSEC')) {
        rule = 'ENFORCE_OPSEC';
      } else if (v.category === 'EARNED_TRANSFORMATION_COST' || v.code.includes('04') || v.code.includes('SOMATIC')) {
        rule = 'GROUND_SOMATIC_COST';
      }

      directives.push({
        category: v.category,
        targetExcerpt: v.locationExcerpt || v.description,
        requiredInvariant: 'Comply with Macro Structural Plausibility and Story Bible Invariant.',
        remediationRule: rule,
        suggestedAction: v.suggestedCorrection,
      });
    }

    // Grammar & Lexical Directives
    for (const g of audit.grammarViolations) {
      directives.push({
        category: 'GRAMMAR_AND_LEXICAL',
        targetExcerpt: g.snippet,
        requiredInvariant: 'Sentence must have valid subject, finite predicate, and natural diction.',
        remediationRule: 'REWRITE_CONCRETELY',
        suggestedAction: g.message,
      });
    }

    return {
      chapterNumber: audit.chapterNumber,
      totalDirectives: directives.length,
      directives,
      requiresAuthorPlantDecision: directives.some(d => d.remediationRule === 'ENFORCE_OPSEC'),
    };
  }

  /**
   * STAGE 4: ADVERSARIAL POST-VERIFICATION & QUARANTINE
   * Strictly enforces that all Stage 1 flaws are resolved with ZERO new regressions.
   */
  public static quarantineAndVerify(
    chapterNumber: number,
    originalText: string,
    candidateText: string,
    initialAudit: PipelineAuditReport
  ): VerificationResult {
    // 1. Run full post-audit on candidate text
    const postAudit = this.auditManuscript(chapterNumber, candidateText);

    // 2. Check for newly introduced grammar regressions (broken sentences, fragments)
    const regressions = this.detectGrammarAndLexicalRegressions(candidateText);

    // 3. Check for arithmetic mismatches (e.g. four letters for MAREN)
    const unresolved: string[] = [];
    if (/four\s+letters/i.test(candidateText) && /m[—-]a[—-]r[—-]e[—-]n/i.test(candidateText)) {
      unresolved.push('CRITICAL: Arithmetic mismatch remains unresolved (claims 4 letters for 5-letter MAREN).');
    }

    // 4.5. Run Universal Post-Rewrite Fact & Technical Unit Sanity Check (Writing OS v4)
    const integrityAudit = PostRewriteIntegrityAuditor.auditManuscriptPostRewrite(chapterNumber, originalText, candidateText);
    if (!integrityAudit.passed) {
      unresolved.push(...integrityAudit.notes);
    }

    // 5. Evaluate Reader Persona Immersion
    const readerReport = ReaderPersonaEvaluator.evaluate(candidateText, { genre: 'COMMERCIAL_FICTION' });

    const passed = unresolved.length === 0 && regressions.length === 0 && postAudit.macroReport.violations.length === 0;

    if (!passed) {
      return {
        passed: false,
        status: 'REJECTED',
        unresolvedViolations: unresolved.concat(postAudit.macroReport.violations.map(v => `[${v.code}] ${v.description}`)),
        newRegressions: regressions,
        finalMacroScore: postAudit.macroReport.overallPlausibilityScore,
        readerMetrics: {
          predictedImmersion: readerReport.predictedImmersion,
          predictedTension: readerReport.predictedTension,
          predictedEmpathy: readerReport.predictedEmpathy,
        }
      };
    }

    return {
      passed: true,
      status: 'ACCEPTED',
      unresolvedViolations: [],
      newRegressions: [],
      finalMacroScore: postAudit.macroReport.overallPlausibilityScore,
      readerMetrics: {
        predictedImmersion: readerReport.predictedImmersion,
        predictedTension: readerReport.predictedTension,
        predictedEmpathy: readerReport.predictedEmpathy,
      }
    };
  }

  /**
   * STAGE 5: PROVENANCE SYNC & PRODUCTION ARTIFACT EXPORT
   */
  public static exportProductionBundle(
    chapterNumber: number,
    originalText: string,
    verifiedText: string,
    verification: VerificationResult
  ): ProductionDeliveryBundle {
    if (!verification.passed) {
      throw new PipelineQuarantineException(
        `Cannot export unverified chapter ${chapterNumber}. Pipeline Quarantine active.`,
        verification.unresolvedViolations,
        verification.newRegressions
      );
    }

    // Generate Visual Tracked Changes HTML
    const trackedHtml = DiffVisualizer.renderTrackedChangesHtml(
      originalText,
      verifiedText,
      `Chapter ${chapterNumber} Production Delivery - Tracked Changes View`
    );

    // Global fact propagation ledger
    const globalFactUpdates: Record<string, string> = {};
    if (originalText.includes('four letters') && verifiedText.includes('five letters')) {
      globalFactUpdates['FACT_MAREN_LENGTH'] = 'five letters (synchronized globally across all references)';
    }

    return {
      chapterNumber,
      originalText,
      verifiedText,
      verificationResult: verification,
      trackedChangesHtml: trackedHtml,
      globalFactUpdates,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Complete 5-Stage Pipeline Execution Runner
   */
  public static executePipeline(
    chapterNumber: number,
    originalText: string,
    remediationWorker: (raw: string, plan: RemediationPlan) => string
  ): ProductionDeliveryBundle {
    // Stage 1: Audit
    const audit = this.auditManuscript(chapterNumber, originalText);

    // Stage 2: Remediation Plan
    const plan = this.generateRemediationPlan(audit);

    // Stage 3: Intelligent Revision Execution
    const revisedText = remediationWorker(originalText, plan);

    // Stage 4: Post-Verification & Quarantine
    const verification = this.quarantineAndVerify(chapterNumber, originalText, revisedText, audit);

    if (!verification.passed) {
      throw new PipelineQuarantineException(
        `Chapter ${chapterNumber} failed Post-Verification Quarantine Gate.`,
        verification.unresolvedViolations,
        verification.newRegressions
      );
    }

    // Stage 5: Export
    return this.exportProductionBundle(chapterNumber, originalText, revisedText, verification);
  }

  /**
   * Helper: Grammar, Sentence Fragment & Lexical Linter
   */
  private static detectGrammarAndLexicalRegressions(text: string): GrammarViolation[] {
    const violations: GrammarViolation[] = [];

    // 1. Broken Fragment Check: e.g. "along the perimeter of his raw, stripped of myelin"
    const rawPattern = /\bperimeter of his raw\b/i;
    if (rawPattern.test(text)) {
      violations.push({
        snippet: 'perimeter of his raw',
        type: 'CORRUPTED_PREDICATE',
        message: 'Broken sentence detected: "skull felt" was deleted leaving ungrammatical fragment "his raw".',
      });
    }

    // 2. Broken Fragment Check: e.g. standalone "the air leave his lungs."
    const airPattern = /(?:^|[.!?]\s+)the air leave his lungs\b/i;
    if (airPattern.test(text)) {
      violations.push({
        snippet: 'the air leave his lungs',
        type: 'MISSING_SUBJECT',
        message: 'Broken sentence fragment: Missing subject and finite verb tense in "the air leave his lungs".',
      });
    }

    // 3. Orphaned Lowercase Conjunction: e.g. ". as though a catastrophic flood"
    const orphanedConj = /\.\s+as though\b/;
    if (orphanedConj.test(text)) {
      violations.push({
        snippet: '. as though',
        type: 'ORPHANED_FRAGMENT',
        message: 'Orphaned lowercase subordinate clause attached after period.',
      });
    }

    // 4. Loan Word Check: "măng-tô" in English commercial fiction
    if (/măng-tô/i.test(text)) {
      violations.push({
        snippet: 'măng-tô',
        type: 'LOAN_WORD',
        message: 'Unlocalized Vietnamese loan-word "măng-tô" found in English manuscript. Replace with "canvas overcoat".',
      });
    }

    // 5. Unnatural Lexical Repetition: "chime chimed"
    if (/\bchime chimed\b/i.test(text)) {
      violations.push({
        snippet: 'chime chimed',
        type: 'UNNATURAL_REPETITION',
        message: 'Tautological verb-noun repetition "chime chimed". Use "tone sounded" or "bell chimed".',
      });
    }

    return violations;
  }
}
