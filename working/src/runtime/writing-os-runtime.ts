// working/src/runtime/writing-os-runtime.ts
// Unified Writing OS Master Orchestrator (v2.0) supporting State-Aware Fiction, Epistemic Nonfiction, and Automated Prose Expansion.

import * as fs from 'fs';
import * as path from 'path';
import { SourceFactLedgerRecord } from '../phase3/source-fact-ledger-validator';
import { NonfictionValidator, EvaluatedAssertion, EpistemicValidationReport } from '../phase3/nonfiction-validator';
import { EpistemicRuleConfig, DEFAULT_EPISTEMIC_CONFIG } from '../phase3/nonfiction-rules';
import { FictionQualityEvaluator, FictionEvaluationReport } from './fiction-evaluator';
import { BibleEngine, BibleValidationReport } from './bible-engine';
import { ContinuityTracker, ContinuityReport } from './continuity-tracker';
import { SceneAdvisor, SceneExpansionBlueprint } from './scene-advisor';
import { VoicePolisher, VoicePolishReport } from './voice-polisher';
import { ProseExpander, ChapterExpansionResult } from './prose-expander';
import { MacroStructuralEvaluator, MacroStructuralReport } from './macro-structural-evaluator';
import { ReaderPersonaEvaluator, ReaderPersonaReport } from './reader-persona-evaluator';
import { BibleSynthesizer, ProjectBible } from './bible-synthesizer';
import { AutonomousNovelEngine, AutonomousGenerationRequest, AutonomousGenerationResult } from './autonomous-novel-engine';

export type WritingMode = 'FICTION' | 'NONFICTION';

export interface WritingOSRequest {
  documentId: string;
  mode: WritingMode;
  chapterNumber?: number;
  register?: string; // e.g., 'ACADEMIC', 'LEGAL', 'LITERARY', 'COMMERCIAL', 'COMMERCIAL_FICTION'
  text: string;
  assertions?: EvaluatedAssertion[]; // For Nonfiction evaluation
  stateContext?: Record<string, any>; // For Fiction state-aware tracking
  inventionPolicy?: 'CONSERVATIVE' | 'PERMISSIVE' | 'STRICT';
  projectId?: string;
  genre?: string;
}

export interface WritingOSResponse {
  documentId: string;
  mode: WritingMode;
  register: string;
  status: 'ACCEPTED' | 'REJECTED' | 'WARNING';
  overallScore: number; // 0.0 to 1.0
  grade?: string;
  nonfictionReport?: EpistemicValidationReport;
  fictionReport?: {
    semanticTriage: 'PASS' | 'NEEDS_REVISION';
    stateConsistency: boolean;
    inventionAdherence: boolean;
    qualityReport?: FictionEvaluationReport;
    bibleReport?: BibleValidationReport;
    continuityReport?: ContinuityReport;
    expansionBlueprint?: SceneExpansionBlueprint;
    polishReport?: VoicePolishReport;
    macroReport?: MacroStructuralReport;
    readerReport?: ReaderPersonaReport;
    bible?: ProjectBible;
  };
  metrics: {
    wordCount: number;
    sentenceCount: number;
    timestamp: string;
    [key: string]: any;
  };
}

import { MandatoryPipelineOrchestrator, PipelineAuditReport, RemediationPlan, ProductionDeliveryBundle, VerificationResult } from './pipeline-orchestrator';
import { StoryStateFactGraph, PostRewriteIntegrityAuditor, StoryFact, CanonProposalFact, PostRewriteIntegrityReport } from './story-state-engine';

export { MandatoryPipelineOrchestrator, StoryStateFactGraph, PostRewriteIntegrityAuditor };
export type { PipelineAuditReport, RemediationPlan, ProductionDeliveryBundle, VerificationResult, StoryFact, CanonProposalFact, PostRewriteIntegrityReport };

export class WritingOSRuntime {
  private nonfictionValidator: NonfictionValidator;
  private ledgerRecords: SourceFactLedgerRecord[];

  constructor(
    ledgerPath?: string,
    config: EpistemicRuleConfig = DEFAULT_EPISTEMIC_CONFIG
  ) {
    const candidatePaths = [
      ledgerPath,
      path.join(__dirname, '../../nonfiction/ledger/source-fact-ledger.jsonl'),
      path.join(__dirname, '../../../nonfiction/ledger/source-fact-ledger.jsonl'),
      'working/nonfiction/ledger/source-fact-ledger.jsonl',
      'writing_os/nonfiction/ledger/source-fact-ledger.jsonl',
      'nonfiction/ledger/source-fact-ledger.jsonl',
    ].filter((p): p is string => Boolean(p));

    let resolvedPath = '';
    for (const cp of candidatePaths) {
      if (fs.existsSync(cp)) {
        resolvedPath = cp;
        break;
      }
    }

    if (resolvedPath && fs.existsSync(resolvedPath)) {
      const ledgerStr = fs.readFileSync(resolvedPath, 'utf-8');
      this.ledgerRecords = ledgerStr
        .trim()
        .split('\n')
        .map(line => JSON.parse(line));
    } else {
      this.ledgerRecords = [];
    }
    this.nonfictionValidator = new NonfictionValidator(this.ledgerRecords, config);
  }

  public processDocument(request: WritingOSRequest): WritingOSResponse {
    const words = request.text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const sentences = request.text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

    const baseMetrics = {
      wordCount: words,
      sentenceCount: sentences,
      timestamp: new Date().toISOString(),
    };

    if (request.mode === 'NONFICTION') {
      const assertions = request.assertions || [];
      const nfReport = this.nonfictionValidator.validateAssertions(assertions);

      const status = nfReport.valid
        ? 'ACCEPTED'
        : nfReport.violations.some(v => v.severity === 'FATAL')
        ? 'REJECTED'
        : 'WARNING';

      const overallScore = Number(
        ((nfReport.faithfulnessScore + nfReport.epistemicHonestyScore) / 2).toFixed(3)
      );

      return {
        documentId: request.documentId,
        mode: 'NONFICTION',
        register: request.register || 'GENERAL_NONFICTION',
        status,
        overallScore,
        nonfictionReport: nfReport,
        metrics: baseMetrics,
      };
    } else {
      // Fiction Mode — State-Aware, Bible-Grounded, Stylistic & Continuity Engine
      const register = request.register || 'COMMERCIAL_FICTION';
      const qualityReport = FictionQualityEvaluator.evaluate(request.text, register);
      const polishReport = VoicePolisher.polish(request.text);

      // Extract Chapter Number if available in request or documentId
      let chapterNum = request.chapterNumber;
      if (!chapterNum) {
        const match = request.documentId.match(/chapter[_-]?0?(\d+)/i) || request.text.match(/chapter\s+0?(\d+)/i);
        if (match) chapterNum = parseInt(match[1], 10);
      }

      let bibleReport: BibleValidationReport | undefined;
      let continuityReport: ContinuityReport | undefined;
      let expansionBlueprint: SceneExpansionBlueprint | undefined;

      if (chapterNum && chapterNum > 0) {
        bibleReport = BibleEngine.validateChapter(chapterNum, request.text);
        continuityReport = ContinuityTracker.validateContinuity(chapterNum, request.text);

        // Generate Expansion Blueprint if chapter is under length
        if (qualityReport.metrics.wordCount < 1400) {
          expansionBlueprint = SceneAdvisor.generateBlueprint(
            chapterNum,
            request.text,
            qualityReport.metrics,
            qualityReport.violations
          );
        }
      }

      // Tier 1: Macro Structural & Scene Integrity Audit
      const macroReport = MacroStructuralEvaluator.evaluateChapter(request.text);

      // Tier 3: AI Reader Persona Evaluation
      const readerReport = ReaderPersonaEvaluator.evaluate(polishReport.polishedText, {
        genre: request.genre || 'GENERAL'
      });

      // Fetch or synthesize project bible
      const bible = request.projectId ? BibleSynthesizer.getBible(request.projectId) : undefined;

      // Run Tier 4: 14-Dimensional Post-Rewrite Integrity Audit
      const integrityReport = PostRewriteIntegrityAuditor.auditManuscriptPostRewrite(
        chapterNum || 1,
        request.text,
        polishReport.polishedText
      );

      // Unified Status & Score Computation
      let finalStatus: 'ACCEPTED' | 'REJECTED' | 'WARNING' = qualityReport.status;
      let finalScore = qualityReport.overallScore;
      let finalGrade = qualityReport.grade;

      if (!integrityReport.passed) {
        finalStatus = 'REJECTED';
        finalScore = 0.0;
        finalGrade = 'F';
      } else if (continuityReport && !continuityReport.stateConsistent) {
        finalStatus = 'WARNING';
        finalScore = Math.min(finalScore, 0.5);
        finalGrade = 'C';
      } else if (bibleReport && !bibleReport.passed) {
        finalStatus = 'WARNING';
        finalScore = Math.min(finalScore, Math.max(0.2, bibleReport.adherenceScore));
        finalGrade = finalScore < 0.5 ? 'D' : 'C';
      } else if (macroReport.status === 'NEEDS_REVISION') {
        finalStatus = 'WARNING';
        finalScore = Math.min(finalScore, 0.6);
        finalGrade = 'C';
      }

      return {
        documentId: request.documentId,
        mode: 'FICTION',
        register,
        status: finalStatus,
        overallScore: Number(finalScore.toFixed(2)),
        grade: finalGrade,
        fictionReport: {
          semanticTriage: finalStatus === 'REJECTED' ? 'NEEDS_REVISION' : 'PASS',
          stateConsistency: continuityReport ? continuityReport.stateConsistent : true,
          inventionAdherence: bibleReport ? bibleReport.passed : true,
          qualityReport,
          bibleReport,
          continuityReport,
          expansionBlueprint,
          polishReport,
          macroReport,
          readerReport,
          bible,
        },
        metrics: {
          ...baseMetrics,
          ...qualityReport.metrics,
        },
      };
    }
  }

  public expandAndPolishChapter(
    chapterNumber: number,
    chapterText: string,
    targetWords: number = 1800
  ): ChapterExpansionResult {
    return ProseExpander.expandChapter(chapterNumber, chapterText, targetWords);
  }

  public generateChapterFromPremise(request: AutonomousGenerationRequest): AutonomousGenerationResult {
    return AutonomousNovelEngine.generateChapter(request);
  }

  public auditManuscript(chapterNumber: number, text: string): PipelineAuditReport {
    return MandatoryPipelineOrchestrator.auditManuscript(chapterNumber, text);
  }

  public executePipeline(
    chapterNumber: number,
    originalText: string,
    remediationWorker: (raw: string, plan: RemediationPlan) => string
  ): ProductionDeliveryBundle {
    return MandatoryPipelineOrchestrator.executePipeline(chapterNumber, originalText, remediationWorker);
  }
}
