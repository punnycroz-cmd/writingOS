// src/engine/nonfiction/assertion-extractor.ts
// Extracts epistemic assertions from nonfiction prose via [LJ], then maps
// each to a ledger claimId. Deterministic fallback: sentence splitting with
// type heuristics when no LLM is configured (reported via 'mode').

import { llmChat, extractJSON, llmConfigured } from '../llm';
import type { EvaluatedAssertion } from './nonfiction-validator';
import type { SourceFactLedgerRecord } from './source-fact-ledger-validator';
import type { EpistemicAssertionType } from './nonfiction-rules';

export interface ExtractionResult {
  assertions: EvaluatedAssertion[];
  mode: 'LLM' | 'DETERMINISTIC' | 'EXECUTION_ERROR';
  error?: string;
}

const SYSTEM = `You extract epistemic assertions from nonfiction prose and map each to a source-fact ledger.

Return a JSON object {"assertions": [...]} where each assertion is:
{
  "text": the exact sentence/claim from the text,
  "claimId": the claimId of the ledger record whose claimText this asserts, or null if none matches,
  "assertionType": one of "DIRECT_ASSERTION" (stated as fact), "HEDGED_ASSERTION" (qualified: "may", "suggests"), "ATTRIBUTED_ASSERTION" ("according to X"), "SPECULATIVE" (hypothesis),
  "statedCausality": "DETERMINISTIC" if the text says X causes/leads to Y, "CORRELATIONAL" if "associated with", else "NONE",
  "statedTime": an ISO-ish date (YYYY or YYYY-MM-DD) if the assertion gives a date for the fact, else null,
  "attributedSourceId": the sourcePackSourceId if attribution names the source, else null
}

Rules:
- Every sentence making a factual claim is an assertion. Opinions/questions are not.
- Map claimId conservatively — only when the assertion clearly restates that ledger claim.
- Keep quoted text verbatim inside "text".`;

export async function extractAssertions(
  text: string,
  ledgerRecords: SourceFactLedgerRecord[],
): Promise<ExtractionResult> {
  if (!llmConfigured()) return deterministicExtraction(text, ledgerRecords);

  const ledgerSummary = ledgerRecords.map(r => ({
    claimId: r.claimId,
    sourcePackSourceId: r.sourcePackSourceId,
    claimText: r.claimText,
    publicationDateObserved: r.publicationDateObserved,
  }));

  const r = await llmChat(SYSTEM, `TEXT:\n${text}\n\nLEDGER:\n${JSON.stringify(ledgerSummary, null, 1)}`);
  if (r.mode === 'EXECUTION_ERROR') {
    return { assertions: [], mode: 'EXECUTION_ERROR', error: r.error };
  }
  try {
    const parsed = extractJSON(r.content);
    const assertions: EvaluatedAssertion[] = (parsed.assertions || []).map((a: any) => ({
      text: String(a.text || ''),
      claimId: a.claimId || undefined,
      assertionType: (a.assertionType as EpistemicAssertionType) || 'DIRECT_ASSERTION',
      statedCausality: a.statedCausality || 'NONE',
      statedTime: a.statedTime || undefined,
      attributedSourceId: a.attributedSourceId || undefined,
    })).filter((a: EvaluatedAssertion) => a.text.length > 0);
    return { assertions, mode: 'LLM' };
  } catch (e: any) {
    return { assertions: [], mode: 'EXECUTION_ERROR', error: 'assertion parse: ' + String(e?.message || e) };
  }
}

// Deterministic fallback — sentence split + keyword heuristics. Honest: mode=DETERMINISTIC.
function deterministicExtraction(text: string, ledgerRecords: SourceFactLedgerRecord[]): ExtractionResult {
  const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 10);
  const assertions: EvaluatedAssertion[] = sentences.map(s => {
    const lower = s.toLowerCase();
    let type: EpistemicAssertionType = 'DIRECT_ASSERTION';
    if (/\b(according to|cites|per the|as reported by)\b/.test(lower)) type = 'ATTRIBUTED_ASSERTION';
    else if (/\b(may|might|could|suggests?|appears?|likely|possibly|potentially)\b/.test(lower)) type = 'HEDGED_ASSERTION';
    else if (/\b(hypothesis|we propose|perhaps|if true|conjecture)\b/.test(lower)) type = 'SPECULATIVE';
    const statedCausality = /\b(causes?|leads? to|results? in|because of|drives?)\b/.test(lower)
      ? 'DETERMINISTIC'
      : /\b(associat|correlat|linked)\w*/.test(lower) ? 'CORRELATIONAL' : 'NONE';
    const year = s.match(/\b(19|20)\d{2}\b/);
    // Best-effort ledger mapping: ≥60% content-word overlap with claimText
    let claimId: string | undefined;
    const sWords = new Set(lower.split(/\W+/).filter(w => w.length > 3));
    for (const rec of ledgerRecords) {
      const cWords = (rec.claimText || '').toLowerCase().split(/\W+/).filter(w => w.length > 3);
      if (cWords.length === 0) continue;
      const overlap = cWords.filter(w => sWords.has(w)).length / cWords.length;
      if (overlap >= 0.6) { claimId = rec.claimId; break; }
    }
    return { text: s, claimId, assertionType: type, statedCausality, statedTime: year ? year[0] : undefined };
  });
  return { assertions, mode: 'DETERMINISTIC' };
}
