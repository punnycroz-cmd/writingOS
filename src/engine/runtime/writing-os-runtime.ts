// src/engine/runtime/writing-os-runtime.ts
// Unified Writing OS orchestrator: Fiction (deterministic triage + [LJ]
// semantic validation + scoped arbitration) and Nonfiction (assertion
// extraction + epistemic rules vs the Source Fact Ledger).

import * as fs from 'fs';
import { SourceFactLedgerRecord } from '../nonfiction/source-fact-ledger-validator';
import { NonfictionValidator, EvaluatedAssertion, EpistemicValidationReport } from '../nonfiction/nonfiction-validator';
import { EpistemicRuleConfig, DEFAULT_EPISTEMIC_CONFIG } from '../nonfiction/nonfiction-rules';
import { extractAssertions } from '../nonfiction/assertion-extractor';
import { runDeterministicTriage } from '../deterministic/index';
import { validate } from '../semantic/validator';
import { arbitrate } from '../semantic/policy';
import type {
  DocumentState, InventionPolicy, SemanticValidationResult, CanonicalTriageResult,
} from '../semantic/types';

export type WritingMode = 'FICTION' | 'NONFICTION';
export type RuntimePolicy = InventionPolicy | 'CONSERVATIVE' | 'PERMISSIVE' | 'STRICT';

function mapPolicy(p: RuntimePolicy | undefined): InventionPolicy {
  switch (p) {
    case 'STRICT': return 'NONE';
    case 'CONSERVATIVE': return 'SOURCE_CONSTRAINED';
    case 'PERMISSIVE': return 'LICENSED_FICTION';
    default: return (p as InventionPolicy) || 'LICENSED_FICTION';
  }
}

const EMPTY_STATE: DocumentState = {
  character: { identity: '', goals: [], fears: [], beliefs: [], memories: [], emotionalState: '', perceptualHabits: [], voice: '', currentKnowledge: [] },
  informationOwnership: { entries: [] },
  canon: { facts: [] },
  deferredChecks: [],
  sceneId: 'runtime', revisionId: 0,
};

export interface WritingOSRequest {
  documentId: string;
  mode: WritingMode;
  register?: string;
  text: string;
  originalText?: string;           // source text the candidate derives from (rewriting)
  assertions?: EvaluatedAssertion[];
  stateContext?: Partial<DocumentState> | Record<string, any>;
  inventionPolicy?: RuntimePolicy;
}

export interface WritingOSResponse {
  documentId: string;
  mode: WritingMode;
  register: string;
  status: 'ACCEPTED' | 'REJECTED' | 'WARNING';
  overallScore: number;
  nonfictionReport?: EpistemicValidationReport;
  fictionReport?: {
    semanticTriage: 'PASS' | 'NEEDS_REVISION' | 'FAILED';
    stateConsistency: boolean;
    inventionAdherence: boolean;
    triage?: CanonicalTriageResult;
    semantic?: SemanticValidationResult;
    arbitrationPath?: string;
  };
  metrics: { wordCount: number; sentenceCount: number; timestamp: string };
}

export class WritingOSRuntime {
  private nonfictionValidator: NonfictionValidator;
  private ledgerRecords: SourceFactLedgerRecord[];

  constructor(
    ledgerPath: string = 'nonfiction/ledger/source-fact-ledger.jsonl',
    config: EpistemicRuleConfig = DEFAULT_EPISTEMIC_CONFIG,
  ) {
    if (fs.existsSync(ledgerPath)) {
      const ledgerStr = fs.readFileSync(ledgerPath, 'utf-8');
      this.ledgerRecords = ledgerStr.trim().split('\n').map(line => JSON.parse(line));
    } else {
      this.ledgerRecords = [];
    }
    this.nonfictionValidator = new NonfictionValidator(this.ledgerRecords, config);
  }

  private metrics(text: string) {
    return {
      wordCount: text.trim().split(/\s+/).filter(w => w.length > 0).length,
      sentenceCount: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
      timestamp: new Date().toISOString(),
    };
  }

  private documentState(request: WritingOSRequest): DocumentState {
    const ctx = request.stateContext as Partial<DocumentState> | undefined;
    return {
      ...EMPTY_STATE,
      ...(ctx || {}),
      character: { ...EMPTY_STATE.character, ...(ctx?.character || {}) },
      informationOwnership: ctx?.informationOwnership || { entries: [] },
      canon: ctx?.canon || { facts: [] },
      deferredChecks: ctx?.deferredChecks || [],
    };
  }

  // Full async pipeline: [CC] deterministic → [LJ] semantic → arbitrate.
  // Nonfiction: LLM/deterministic assertion extraction (when none supplied) → rules.
  public async processCandidate(request: WritingOSRequest): Promise<WritingOSResponse> {
    const base = {
      documentId: request.documentId,
      mode: request.mode,
      register: request.register || (request.mode === 'FICTION' ? 'LITERARY_FICTION' : 'GENERAL_NONFICTION'),
      metrics: this.metrics(request.text),
    };

    if (request.mode === 'NONFICTION') {
      let assertions = request.assertions;
      let extractionMode: string | undefined;
      if (!assertions) {
        const ex = await extractAssertions(request.text, this.ledgerRecords);
        if (ex.mode === 'EXECUTION_ERROR') {
          return {
            ...base, status: 'WARNING', overallScore: 0,
            fictionReport: undefined,
            metrics: { ...base.metrics },
          };
        }
        assertions = ex.assertions;
        extractionMode = ex.mode;
      }
      const nfReport = this.nonfictionValidator.validateAssertions(assertions);
      const status = nfReport.valid ? 'ACCEPTED'
        : nfReport.violations.some(v => v.severity === 'FATAL') ? 'REJECTED' : 'WARNING';
      return {
        ...base, status,
        overallScore: Number(((nfReport.faithfulnessScore + nfReport.epistemicHonestyScore) / 2).toFixed(3)),
        nonfictionReport: { ...nfReport },
      };
    }

    // ── Fiction path ────────────────────────────────────────────────
    const state = this.documentState(request);
    const policy = mapPolicy(request.inventionPolicy);
    const original = request.originalText ?? '';
    const triage = runDeterministicTriage({
      originalText: original,
      candidateText: request.text,
      state, policy, mode: 'FICTION',
    });

    if (triage.action === 'DETERMINISTIC_BLOCK') {
      return {
        ...base, status: 'REJECTED', overallScore: 0,
        fictionReport: {
          semanticTriage: 'FAILED', stateConsistency: false,
          inventionAdherence: false, triage,
          arbitrationPath: 'DETERMINISTIC_BLOCK → REJECT (non-overridable)',
        },
      };
    }
    if (triage.action === 'DETERMINISTIC_ACCEPT') {
      return {
        ...base, status: 'ACCEPTED', overallScore: 1,
        fictionReport: {
          semanticTriage: 'PASS', stateConsistency: true,
          inventionAdherence: true, triage,
          arbitrationPath: 'DETERMINISTIC_ACCEPT → fast path',
        },
      };
    }
    if (triage.action === 'EXECUTION_ERROR') {
      return {
        ...base, status: 'WARNING', overallScore: 0,
        fictionReport: {
          semanticTriage: 'NEEDS_REVISION', stateConsistency: false,
          inventionAdherence: false, triage,
          arbitrationPath: 'EXECUTION_ERROR → UNCLEAR',
        },
      };
    }

    // HANDOFF_TO_LLM → semantic validator → arbitration
    const semantic = await validate({
      candidateText: request.text,
      originalText: original,
      documentState: state,
      inventionPolicy: policy,
      triageResult: triage,
      handoffPayload: triage.handoffPayload,
    });

    // validate() already applies scoped arbitration — semantic.decision is final.
    const status = semantic.decision === 'ACCEPT' ? 'ACCEPTED' : semantic.decision === 'REJECT' ? 'REJECTED' : 'WARNING';
    const consistency = !(semantic.dimensions.some(d => (d.dimension === 'INFORMATION_OWNERSHIP' || d.dimension === 'FAITHFULNESS') && d.verdict === 'FAIL'));

    return {
      ...base, status,
      overallScore: status === 'ACCEPTED' ? 1 : status === 'REJECTED' ? 0 : 0.5,
      fictionReport: {
        semanticTriage: status === 'ACCEPTED' ? 'PASS' : status === 'REJECTED' ? 'FAILED' : 'NEEDS_REVISION',
        stateConsistency: consistency,
        inventionAdherence: semantic.decision !== 'REJECT',
        triage, semantic,
        arbitrationPath: semantic.arbitrationPath,
      },
    };
  }

  // Synchronous compat path (deterministic only). The LLM layer is not run
  // here — for full validation use processCandidate().
  public processDocument(request: WritingOSRequest): WritingOSResponse {
    const baseMetrics = this.metrics(request.text);

    if (request.mode === 'NONFICTION') {
      const assertions = request.assertions || [];
      const nfReport = this.nonfictionValidator.validateAssertions(assertions);
      const status = nfReport.valid ? 'ACCEPTED'
        : nfReport.violations.some(v => v.severity === 'FATAL') ? 'REJECTED' : 'WARNING';
      return {
        documentId: request.documentId, mode: 'NONFICTION',
        register: request.register || 'GENERAL_NONFICTION',
        status,
        overallScore: Number(((nfReport.faithfulnessScore + nfReport.epistemicHonestyScore) / 2).toFixed(3)),
        nonfictionReport: nfReport,
        metrics: baseMetrics,
      };
    }

    // Fiction, deterministic-only: triage verdict is honest — a HANDOFF is
    // reported as unverified rather than rubber-stamped.
    const state = this.documentState(request);
    const triage = runDeterministicTriage({
      originalText: request.originalText ?? request.text,
      candidateText: request.text,
      state, policy: mapPolicy(request.inventionPolicy), mode: 'FICTION',
    });

    if (triage.action === 'DETERMINISTIC_BLOCK') {
      return {
        documentId: request.documentId, mode: 'FICTION',
        register: request.register || 'LITERARY_FICTION',
        status: 'REJECTED', overallScore: 0,
        fictionReport: { semanticTriage: 'FAILED', stateConsistency: false, inventionAdherence: false, triage },
        metrics: baseMetrics,
      };
    }
    const needsLLM = triage.action === 'HANDOFF_TO_LLM';
    return {
      documentId: request.documentId, mode: 'FICTION',
      register: request.register || 'LITERARY_FICTION',
      status: needsLLM ? 'WARNING' : 'ACCEPTED',
      overallScore: needsLLM ? 0.5 : 1,
      fictionReport: {
        semanticTriage: needsLLM ? 'NEEDS_REVISION' : 'PASS',
        stateConsistency: true, inventionAdherence: true, triage,
        arbitrationPath: needsLLM ? 'HANDOFF_TO_LLM (sync path: semantic layer not run)' : 'DETERMINISTIC_ACCEPT',
      },
      metrics: baseMetrics,
    };
  }
}
