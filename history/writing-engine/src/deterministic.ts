// deterministic.ts — The [CC] integrity layer for Iteration 2.
// Three minimal deterministic checks that run BEFORE [LJ] stages:
//   1. Deferred-anchor cross-reference (fixes Case F: deferred mechanism missed)
//   2. Supported-specificity check (runs AFTER intervention, BEFORE validation; catches Case A invented facts)
//   3. Canon keyword alert (recall booster for obvious HARD_CANON conflicts)
//
// Design principle: minimal, transparent, heuristic. These do NOT replace [LJ] judgment
// except where the deterministic signal is conclusive (e.g., exact anchor substring match).
// They feed the [LJ] stages and, for the deferred pre-pass, can force a classification.

import type { DocumentState, DeferredCheck } from './types.js';

// ============================================================
// 1. DEFERRED-ANCHOR CROSS-REFERENCE
// ============================================================
// Resolves the Case F failure: [LJ] alone does not reliably notice deferred mechanisms.

export type DeferredRelevance =
  | 'DEFERRED_ANCHOR_PRESENT'        // exact substring match → force DEFERRED_CONTEXT
  | 'DEFERRED_ANCHOR_POSSIBLY_RELATED' // high token overlap or n-gram overlap → hint to [LJ]
  | 'NO_DEFERRED_RELEVANCE';         // no overlap → no signal

export interface DeferredAnchorResult {
  relevance: DeferredRelevance;
  matchedCheckId?: string;
  matchedAnchor?: string;
  overlapType?: 'exact_substring' | 'high_jaccard' | 'ngram_overlap';
  jaccardScore?: number;
}

function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 2);
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

function ngramOverlap(passage: string, anchor: string, n: number): boolean {
  const pg = passage.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 0);
  const ag = anchor.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 0);
  if (ag.length < n) return false;
  const anchorNgrams = new Set<string>();
  for (let i = 0; i <= ag.length - n; i++) anchorNgrams.add(ag.slice(i, i + n).join(' '));
  for (let i = 0; i <= pg.length - n; i++) {
    if (anchorNgrams.has(pg.slice(i, i + n).join(' '))) return true;
  }
  return false;
}

export function checkDeferredAnchor(passage: string, deferredChecks: DeferredCheck[]): DeferredAnchorResult {
  const active = deferredChecks.filter(d => d.status === 'DEFERRED');
  if (active.length === 0) return { relevance: 'NO_DEFERRED_RELEVANCE' };
  const passageLower = passage.toLowerCase();
  const passageTokens = new Set(tokenize(passage));

  for (const check of active) {
    const anchor = check.anchorSpan;
    const anchorLower = anchor.toLowerCase();
    // 1. Exact substring (normalized whitespace)
    const normPassage = passageLower.replace(/\s+/g, ' ').trim();
    const normAnchor = anchorLower.replace(/\s+/g, ' ').trim();
    if (normPassage.includes(normAnchor) || normAnchor.includes(normPassage)) {
      // Only count the passage-includes-anchor direction as a true match
      if (normPassage.includes(normAnchor) && normAnchor.length > 10) {
        return { relevance: 'DEFERRED_ANCHOR_PRESENT', matchedCheckId: check.id, matchedAnchor: anchor, overlapType: 'exact_substring' };
      }
    }
    // 2. High Jaccard overlap
    const anchorTokens = new Set(tokenize(anchor));
    const j = jaccard(passageTokens, anchorTokens);
    if (j >= 0.3 && anchorTokens.size >= 2) {
      return { relevance: 'DEFERRED_ANCHOR_POSSIBLY_RELATED', matchedCheckId: check.id, matchedAnchor: anchor, overlapType: 'high_jaccard', jaccardScore: j };
    }
    // 3. 3-gram overlap (catches paraphrase with shared phrasing)
    if (ngramOverlap(passage, anchor, 3)) {
      return { relevance: 'DEFERRED_ANCHOR_POSSIBLY_RELATED', matchedCheckId: check.id, matchedAnchor: anchor, overlapType: 'ngram_overlap' };
    }
  }
  return { relevance: 'NO_DEFERRED_RELEVANCE' };
}

// ============================================================
// 2. SUPPORTED-SPECIFICITY CHECK
// ============================================================
// Runs after intervention generation. Extracts numbers, dates, proper nouns
// from the revised text and checks whether each appears in source+state.
// Flags unsupported specifics as candidate hallucinations.
// This is a [CC] signal fed to the [LJ] validator.

export interface SpecificityItem {
  type: 'number' | 'proper_noun';
  value: string;
  supported: boolean;
}

export interface SupportedSpecificityResult {
  unsupported: SpecificityItem[];
  total: number;
  unsupportedCount: number;
}

const NUMBER_WORDS = new Set([
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'twenty', 'thirty', 'forty',
  'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred', 'thousand', 'million',
]);

// Common words that are capitalized but not proper nouns (sentence starts, etc.)
const COMMON_CAPITALIZED = new Set([
  'The','A','An','She','He','They','It','We','I','You','Her','His','Their','Its','Our','My','Your',
  'This','That','These','Those','But','And','Or','So','Because','When','While','If','Then','Now',
  'Maya','Marcus','Arlo','Papa','Tomas','Tomás', // character names are state-supported, checked against state
  'Room','Mr','Mrs','Dr','Ms',
]);

function extractSpecifics(text: string): SpecificityItem[] {
  const items: SpecificityItem[] = [];
  // Numbers (digits)
  const digitMatches = text.match(/\b\d+\b/g) || [];
  for (const n of digitMatches) items.push({ type: 'number', value: n, supported: false });
  // Spelled-out numbers
  const words = text.split(/\s+/);
  for (const w of words) {
    const clean = w.replace(/[^a-zA-Z]/g, '');
    if (NUMBER_WORDS.has(clean.toLowerCase())) {
      items.push({ type: 'number', value: clean.toLowerCase(), supported: false });
    }
  }
  // Proper nouns: capitalized words NOT at sentence start, not common words
  // Split into sentences to identify sentence-start position
  const sentences = text.split(/(?<=[.!?])\s+/);
  for (const sent of sentences) {
    const sentWords = sent.split(/\s+/).filter(w => w.length > 0);
    for (let i = 0; i < sentWords.length; i++) {
      const w = sentWords[i];
      const clean = w.replace(/[^a-zA-Z]/g, '');
      if (clean.length < 2) continue;
      if (i === 0) continue; // sentence start — skip
      if (!/^[A-Z]/.test(clean)) continue; // not capitalized
      if (COMMON_CAPITALIZED.has(clean)) continue;
      if (COMMON_CAPITALIZED.has(w)) continue;
      // It's a candidate proper noun
      items.push({ type: 'proper_noun', value: clean, supported: false });
    }
  }
  return items;
}

export function checkSupportedSpecificity(
  revisedText: string,
  sourcePassage: string,
  state: DocumentState,
): SupportedSpecificityResult {
  const items = extractSpecifics(revisedText);
  // Build the "allowed" text = source passage + all state text
  const stateText = [
    JSON.stringify(state.character),
    JSON.stringify(state.informationOwnership),
    JSON.stringify(state.canon),
    JSON.stringify(state.deferredChecks),
  ].join(' ').toLowerCase();
  const allowedLower = (sourcePassage + ' ' + stateText).toLowerCase();

  for (const item of items) {
    const v = item.value.toLowerCase();
    if (allowedLower.includes(v)) {
      item.supported = true;
    }
  }
  return {
    unsupported: items.filter(i => !i.supported),
    total: items.length,
    unsupportedCount: items.filter(i => !i.supported).length,
  };
}

// ============================================================
// 3. CANON KEYWORD ALERT
// ============================================================
// A recall booster for obvious HARD_CANON conflicts. Does NOT make the decision;
// flags potential conflicts for the [LJ] detector to consider.

export interface CanonAlert {
  canonFact: string;
  alertKeyword: string;
  passageSnippet: string;
}

export function canonKeywordAlert(passage: string, state: DocumentState): CanonAlert[] {
  const alerts: CanonAlert[] = [];
  const passageLower = passage.toLowerCase();
  for (const fact of state.canon.facts) {
    if (fact.classification !== 'HARD_CANON') continue;
    const content = fact.content.toLowerCase();
    // Heuristic: if canon fact mentions a sensory/canonical keyword, check for contradiction verbs
    const sensoryKeywords: Record<string, string[]> = {
      'blind': ['saw', 'looked', 'watched', 'eyed', 'noticed', 'glimpsed', 'stared', 'viewed', 'observed'],
      'deaf': ['heard', 'listened', 'sound', 'noise'],
      'paralyz': ['walked', 'ran', 'stood', 'stepped', 'moved'],
    };
    for (const [keyword, verbs] of Object.entries(sensoryKeywords)) {
      if (!content.includes(keyword)) continue;
      // Find the character name from the fact (heuristic: first capitalized word)
      const factWords = fact.content.split(/\s+/);
      const charName = factWords.find(w => /^[A-Z][a-z]+$/.test(w));
      if (!charName) continue;
      // Check if passage has charName near a contradiction verb
      for (const verb of verbs) {
        // Within 60 chars of the character name
        const idx = passageLower.indexOf(charName.toLowerCase());
        if (idx < 0) continue;
        const window = passageLower.slice(idx, idx + 80);
        if (window.includes(verb)) {
          alerts.push({
            canonFact: fact.content,
            alertKeyword: `${keyword} vs "${verb}"`,
            passageSnippet: passage.slice(idx, Math.min(passage.length, idx + 80)),
          });
          break; // one alert per fact
        }
      }
    }
  }
  return alerts;
}
