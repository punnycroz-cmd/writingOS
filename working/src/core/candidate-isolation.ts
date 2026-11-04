/**
 * Writing OS Core — Untrusted Candidate Boundary & Isolation Layer
 * Encapsulates all raw generation outputs as untrusted candidates carrying LLM_PROPOSED authority.
 * Prevents unverified model assertions from prematurely entering or mutating the canonical State Graph.
 */

import { ExtractedCandidateClaim, ClaimExtractor } from './claim-extractor';
import { StateAuthorityLevel } from './state-model';

export interface UntrustedCandidate {
  candidateId: string;
  planId: string;
  rawText: string;
  authorityLevel: StateAuthorityLevel; // Always starts as 'LLM_PROPOSED'
  modelMetadata: {
    modelName: string;
    temperature?: number;
    generationDurationMs: number;
    generationTimestamp: number;
  };
  extractedClaims: ExtractedCandidateClaim[];
  isCommittedToState: boolean;
}

export class CandidateIsolationLayer {
  public static encapsulate(
    planId: string,
    rawText: string,
    modelName = 'llm-generator-v1',
    durationMs = 0,
    knownEntityIds: string[] = []
  ): UntrustedCandidate {
    const candidateId = `cand_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const extractedClaims = ClaimExtractor.extractFromText(rawText, knownEntityIds);

    return {
      candidateId,
      planId,
      rawText,
      authorityLevel: 'LLM_PROPOSED',
      modelMetadata: {
        modelName,
        generationDurationMs: durationMs,
        generationTimestamp: Date.now(),
      },
      extractedClaims,
      isCommittedToState: false,
    };
  }
}
