// working/src/runtime/writing-os-runtime.ts
// Unified Writing OS Master Orchestrator supporting State-Aware Fiction and Epistemic Nonfiction.

import * as fs from 'fs';
import * as path from 'path';
import { SourceFactLedgerRecord } from '../phase3/source-fact-ledger-validator';
import { NonfictionValidator, EvaluatedAssertion, EpistemicValidationReport } from '../phase3/nonfiction-validator';
import { EpistemicRuleConfig, DEFAULT_EPISTEMIC_CONFIG } from '../phase3/nonfiction-rules';
import { FictionQualityEvaluator, FictionEvaluationReport } from './fiction-evaluator';
import { BibleEngine, BibleValidationReport } from './bible-engine';
import { ContinuityTracker, ContinuityReport } from './continuity-tracker';
import { SceneAdvisor, SceneExpansionBlueprint } from './scene-advisor';

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
  };
  metrics: {
    wordCount: number;
    sentenceCount: number;
    timestamp: string;
    [key: string]: any;
  };
}

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

      // Compute status incorporating Bible and Continuity validity
      let finalStatus = qualityReport.status;
      if (continuityReport && !continuityReport.stateConsistent) {
        finalStatus = 'WARNING';
      }
      if (bibleReport && !bibleReport.passed) {
        finalStatus = 'WARNING';
      }

      return {
        documentId: request.documentId,
        mode: 'FICTION',
        register,
        status: finalStatus,
        overallScore: qualityReport.overallScore,
        grade: qualityReport.grade,
        fictionReport: {
          semanticTriage: finalStatus === 'REJECTED' ? 'NEEDS_REVISION' : 'PASS',
          stateConsistency: continuityReport ? continuityReport.stateConsistent : true,
          inventionAdherence: bibleReport ? bibleReport.passed : true,
          qualityReport,
          bibleReport,
          continuityReport,
          expansionBlueprint,
        },
        metrics: {
          ...baseMetrics,
          ...qualityReport.metrics,
        },
      };
    }
  }
}
