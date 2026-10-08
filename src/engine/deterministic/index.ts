// src/engine/deterministic/index.ts
// [CC] deterministic triage — rebuilt from deleted-branch lineage
// (provenance v4 + iteration42 scoped classification).
//
// Emits the CanonicalTriageResult contract consumed by the semantic
// validator + arbitration layer.

import type {
  CanonicalTriageResult, DocumentState, EvidenceSignal,
  InventionPolicy, UnifiedHandoffPayload,
} from '../semantic/types';
import { classifyProvenanceV4, type ProvenanceItem } from './provenance';
import { extractClaims } from './claims';

export { classifyProvenanceV4 } from './provenance';
export { extractClaims, resolveClaim, EPISTEMIC_MARKERS } from './claims';
export type { ProvenanceItem } from './provenance';
export type { ExtractedClaim, ClaimResolution, EpistemicLevel } from './claims';

export interface DeterministicTriageInput {
  originalText: string;
  candidateText: string;
  state: DocumentState;
  policy: InventionPolicy;
  mode?: 'FICTION' | 'NONFICTION';
}

export function runDeterministicTriage(input: DeterministicTriageInput): CanonicalTriageResult {
  const { originalText, candidateText, state, policy } = input;

  const noTriage: CanonicalTriageResult = {
    action: 'DETERMINISTIC_ACCEPT', proofStrength: 'TRIVIAL',
    signals: [], scopedOverridesApplied: [],
    reasoning: 'Candidate identical to source',
  };

  try {
    if (originalText === candidateText) {
      // Identical text: provenance is trivially satisfied, but epistemic
      // claims are checked against state independently of the source —
      // a contradiction (knowledge leak) still blocks.
      const claims = extractClaims(candidateText, originalText, state);
      const signals: EvidenceSignal[] = [];
      let contradiction = false;
      for (const c of claims) {
        signals.push({
          type: c.status === 'supported' ? 'CLAIM_STATE_SUPPORTED'
            : c.status === 'contradicted' ? 'CLAIM_STATE_CONTRADICTED' : 'CLAIM_INSUFFICIENT_STATE',
          detail: `${c.claimed}: ${c.fact}`, evidence: c.actually,
        });
        if (c.status === 'contradicted') contradiction = true;
      }
      if (contradiction) {
        return {
          action: 'DETERMINISTIC_BLOCK', proofStrength: 'DETERMINISTIC',
          signals, scopedOverridesApplied: [],
          reasoning: '[CC] block — state contradiction (knowledge leak / impossible inference)',
        };
      }
      return noTriage;
    }

    const signals: EvidenceSignal[] = [];
    const hardViolations: string[] = [];
    const softSignals: string[] = [];

    // ── Provenance pass ────────────────────────────────────────────
    const prov = classifyProvenanceV4(candidateText, originalText, state);
    for (const item of prov.items) {
      if (item.provenance !== 'UNKNOWN') {
        if (item.type === 'number') {
          signals.push({ type: 'PROVENANCE_NUMBER_SUPPORTED', detail: item.detail, evidence: item.evidence });
        } else {
          signals.push({ type: 'PROVENANCE_SUPPORTED', detail: item.detail, evidence: item.evidence });
        }
      }
    }
    for (const b of prov.hardBlocks) {
      hardViolations.push(`unsupported ${b.type}: "${b.detail}"`);
      signals.push({ type: 'PROVENANCE_HARD_BLOCK', detail: b.detail, evidence: b.evidence });
    }
    for (const s of prov.softSignals) {
      softSignals.push(`unsupported proper noun: "${s.detail}"`);
      signals.push({ type: 'PROVENANCE_PROPER_NOUN_UNKNOWN', detail: s.detail, evidence: s.evidence });
    }

    // ── Epistemic-claim pass ───────────────────────────────────────
    const claims = extractClaims(candidateText, originalText, state);
    let hasStateContradiction = false;
    let hasInsufficient = false;
    for (const c of claims) {
      if (c.status === 'supported') {
        signals.push({ type: 'CLAIM_STATE_SUPPORTED', detail: `${c.claimed}: ${c.fact}`, evidence: c.actually });
      } else if (c.status === 'contradicted') {
        hasStateContradiction = true;
        signals.push({ type: 'CLAIM_STATE_CONTRADICTED', detail: `${c.claimed}: ${c.fact}`, evidence: c.actually });
      } else {
        hasInsufficient = true;
        signals.push({ type: 'CLAIM_INSUFFICIENT_STATE', detail: `${c.claimed}: ${c.fact}`, evidence: c.actually });
      }
    }

    // ── Policy-dependent treatment of soft signals ─────────────────
    const policyBlocksSoft = policy === 'NONE' || policy === 'SOURCE_CONSTRAINED';
    const contradictionBlocks = hasStateContradiction;
    const hardBlocks = hardViolations.length > 0;
    const softBlocks = policyBlocksSoft && softSignals.length > 0;

    if (contradictionBlocks || hardBlocks || softBlocks) {
      const reasons: string[] = [];
      if (contradictionBlocks) reasons.push('state contradiction (knowledge leak / impossible inference)');
      if (hardBlocks) reasons.push(`unsupported hard detail: ${hardViolations.join('; ')}`);
      if (softBlocks) reasons.push(`unsupported proper noun under ${policy} policy: ${softSignals.join('; ')}`);
      return {
        action: 'DETERMINISTIC_BLOCK', proofStrength: 'DETERMINISTIC',
        signals, scopedOverridesApplied: [],
        reasoning: `[CC] block — ${reasons.join(' + ')}`,
      };
    }

    // ── Handoff to [LJ] ────────────────────────────────────────────
    const claimSignals = signals.filter(s => s.type.startsWith('CLAIM_') || s.type === 'PROVENANCE_NUMBER_SUPPORTED');
    const payload: UnifiedHandoffPayload = {
      summary: `[CC] no deterministic block: ${prov.items.length} details checked, ${claims.length} epistemic claims`,
      claimSignals,
      hardViolations,
      softSignals,
      recommendedSemanticQuestions: [
        'Does the rewrite preserve the original meaning and tone?',
        'Are soft-signaled entities plausibly grounded in context?',
        hasInsufficient ? 'Are unresolvable epistemic claims licensed by invention policy?' : 'Is the epistemic structure consistent with character knowledge?',
      ],
      stateReferences: {
        characterName: (state.character.identity || '').split('—')[0].trim(),
        ioEntryCount: state.informationOwnership?.entries?.length ?? 0,
        canonFactCount: state.canon?.facts?.length ?? 0,
      },
    };

    return {
      action: 'HANDOFF_TO_LLM',
      proofStrength: hardViolations.length === 0 && softSignals.length === 0 ? 'DETERMINISTIC' : 'SCOPED',
      signals, scopedOverridesApplied: [], handoffPayload: payload,
      reasoning: `[CC] pass — ${prov.items.length} details, ${claims.length} claims checked; delegating semantics to [LJ]`,
    };
  } catch (e: any) {
    return {
      action: 'EXECUTION_ERROR', proofStrength: 'TRIVIAL', signals: [],
      scopedOverridesApplied: [],
      reasoning: `[CC] execution error: ${String(e?.message || e)}`,
    };
  }
}

// ── Semantic-application helpers (used by validators and the corpus driver) ──

export interface ScopedCCResult {
  severity: 'HARD_BLOCK' | 'SOFT_SIGNAL' | 'ADVISORY';
  hardBlocks: ProvenanceItem[];
  softSignals: ProvenanceItem[];
  unsupported: ProvenanceItem[];
}

export function classifyScopedCC(revisedText: string, originalPassage: string, state: DocumentState): ScopedCCResult {
  const r = classifyProvenanceV4(revisedText, originalPassage, state);
  return { severity: r.severity, hardBlocks: r.hardBlocks, softSignals: r.softSignals, unsupported: r.unsupported };
}
