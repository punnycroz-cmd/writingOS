// provenance.ts — Iteration 4 [CC] provenance layer with normalization.
// Improvements over Iteration 3:
//   1. Number-word normalization (forty thousand → 40000, twelve → 12)
//   2. Date normalization (August 21, 2026 / 2026-08-21 / 21 August 2026 → comparable)
//   3. Entity canonicalization (basic possessive handling: "Papa's" → "Papa")
// These are deterministic; semantic normalization remains [LJ].

import type { DocumentState } from './types.js';

// ============================================================
// NUMBER-WORD NORMALIZATION
// ============================================================
const ONES: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19,
};
const TENS: Record<string, number> = {
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};
const SCALES: Record<string, number> = {
  hundred: 100, thousand: 1000, million: 1000000, billion: 1000000000,
};

// Convert a sequence of number-words to a numeric value.
// Returns null if the words don't form a parseable number.
function wordsToNumber(words: string[]): number | null {
  if (words.length === 0) return null;
  let total = 0;
  let current = 0;
  let hasNumber = false;
  for (const w of words) {
    if (ONES[w] !== undefined) {
      current += ONES[w];
      hasNumber = true;
    } else if (TENS[w] !== undefined) {
      current += TENS[w];
      hasNumber = true;
    } else if (SCALES[w] !== undefined) {
      if (current === 0) current = 1;
      current *= SCALES[w];
      if (SCALES[w] >= 1000) {
        total += current;
        current = 0;
      }
      hasNumber = true;
    } else {
      return null; // not a number word
    }
  }
  return hasNumber ? total + current : null;
}

// Extract all number-word sequences from text and return them with their numeric equivalents.
export interface NormalizedNumber {
  original: string;        // "forty thousand"
  numeric: number;         // 40000
  numericStr: string;      // "40000"
  position: number;        // char offset
}

export function extractNumberWords(text: string): NormalizedNumber[] {
  const results: NormalizedNumber[] = [];
  const allNumberWords = [...Object.keys(ONES), ...Object.keys(TENS), ...Object.keys(SCALES)];
  // Build a regex that matches sequences of number-words
  const wordPattern = new RegExp(`\\b(${allNumberWords.join('|')})(?:\\s+(${allNumberWords.join('|')}))*\\b`, 'gi');
  let m;
  while ((m = wordPattern.exec(text)) !== null) {
    const words = m[0].toLowerCase().split(/\s+/);
    const num = wordsToNumber(words);
    if (num !== null) {
      results.push({
        original: m[0],
        numeric: num,
        numericStr: String(num),
        position: m.index,
      });
    }
  }
  return results;
}

// ============================================================
// DATE NORMALIZATION
// ============================================================
const MONTHS: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
  jan: '01', feb: '02', mar: '03', apr: '04', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

export interface NormalizedDate {
  original: string;
  isoForm: string;  // YYYY-MM-DD
  position: number;
}

export function extractDates(text: string): NormalizedDate[] {
  const results: NormalizedDate[] = [];
  // Pattern 1: "August 21, 2026" or "Aug 21 2026"
  const p1 = /\b((?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))\s+(\d{1,2}),?\s+(\d{4})\b/gi;
  let m;
  while ((m = p1.exec(text)) !== null) {
    const mon = MONTHS[m[1].toLowerCase()];
    const day = m[2].padStart(2, '0');
    const year = m[3];
    if (mon) results.push({ original: m[0], isoForm: `${year}-${mon}-${day}`, position: m.index });
  }
  // Pattern 2: "21 August 2026"
  const p2 = /\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})\b/gi;
  while ((m = p2.exec(text)) !== null) {
    const day = m[1].padStart(2, '0');
    const mon = MONTHS[m[2].toLowerCase()];
    const year = m[3];
    if (mon) results.push({ original: m[0], isoForm: `${year}-${mon}-${day}`, position: m.index });
  }
  // Pattern 3: "2026-08-21"
  const p3 = /\b(\d{4})-(\d{2})-(\d{2})\b/g;
  while ((m = p3.exec(text)) !== null) {
    results.push({ original: m[0], isoForm: `${m[1]}-${m[2]}-${m[3]}`, position: m.index });
  }
  return results;
}

// ============================================================
// ENTITY CANONICALIZATION (basic)
// ============================================================
// Strip possessives: "Papa's" → "Papa"
export function canonicalizeEntity(entity: string): string {
  return entity.replace(/['']s$/i, '').replace(/s$/i, (match) => {
    // Don't strip 's' from common short words
    if (entity.length <= 3) return match;
    return '';
  });
}

// ============================================================
// UNIFIED PROVENANCE CLASSIFICATION (with normalization)
// ============================================================
export type Provenance =
  | 'SOURCE_TEXT'
  | 'CHARACTER_STATE'
  | 'CANON'
  | 'USER_PROVIDED'
  | 'ENTAILED'
  | 'INFERRED'
  | 'UNKNOWN';

export type DetailType = 'number' | 'date' | 'proper_noun' | 'explicit_claim';

export interface ProvenanceItem {
  detail: string;            // the original text of the detail
  normalizedDetail?: string; // normalized form (e.g., "40000" for "forty thousand")
  type: DetailType;
  provenance: Provenance;
  evidence: string;
}

export interface ProvenanceResult {
  items: ProvenanceItem[];
  unsupported: ProvenanceItem[];
  hardBlocks: ProvenanceItem[];
  softSignals: ProvenanceItem[];
  severity: 'HARD_BLOCK' | 'SOFT_SIGNAL' | 'ADVISORY';
}

export function classifyProvenanceV4(
  revisedText: string,
  originalPassage: string,
  state: DocumentState,
): ProvenanceResult {
  const items: ProvenanceItem[] = [];
  // Normalize: strip $, commas from numbers in source/state so "40,000" matches "40000"
  const normalizeNums = (s: string) => s.toLowerCase().replace(/\$|,/g, '').replace(/\b(\d{1,3}),(\d{3})\b/g, '$1$2');
  const sourceLower = normalizeNums(originalPassage);
  const charLower = normalizeNums(JSON.stringify(state.character));
  const canonLower = normalizeNums(JSON.stringify(state.canon));
  const ioLower = normalizeNums(JSON.stringify(state.informationOwnership));
  const allStateLower = (charLower + ' ' + canonLower + ' ' + ioLower);

  // 1. Digit numbers
  const digitMatches = revisedText.match(/\b\d+(?:\.\d+)?\b/g) || [];
  for (const n of digitMatches) {
    const v = n.toLowerCase();
    let prov: Provenance = 'UNKNOWN';
    let evidence = 'not found in source or state';
    if (sourceLower.includes(v)) { prov = 'SOURCE_TEXT'; evidence = 'found in source passage'; }
    else if (allStateLower.includes(v)) { prov = 'CHARACTER_STATE'; evidence = 'found in state'; }
    items.push({ detail: n, normalizedDetail: n, type: 'number', provenance: prov, evidence });
  }

  // 2. Number words (NEW in v4 — fixes SC-3A)
  const numberWords = extractNumberWords(revisedText);
  for (const nw of numberWords) {
    // Check if the original word form is in source/state
    const origLower = nw.original.toLowerCase();
    const numStr = nw.numericStr;
    let prov: Provenance = 'UNKNOWN';
    let evidence = 'not found in source or state';
    if (sourceLower.includes(origLower) || sourceLower.includes(numStr)) {
      prov = 'SOURCE_TEXT'; evidence = `found in source (as "${nw.original}" or "${numStr}")`;
    } else if (allStateLower.includes(origLower) || allStateLower.includes(numStr)) {
      prov = 'CHARACTER_STATE'; evidence = `found in state (as "${nw.original}" or "${numStr}")`;
    }
    items.push({ detail: nw.original, normalizedDetail: numStr, type: 'number', provenance: prov, evidence });
  }

  // 3. Dates (NEW in v4)
  const dates = extractDates(revisedText);
  for (const d of dates) {
    let prov: Provenance = 'UNKNOWN';
    let evidence = 'date not found in source or state';
    if (sourceLower.includes(d.original.toLowerCase()) || sourceLower.includes(d.isoForm)) {
      prov = 'SOURCE_TEXT'; evidence = `date found in source`;
    } else if (allStateLower.includes(d.original.toLowerCase()) || allStateLower.includes(d.isoForm)) {
      prov = 'CHARACTER_STATE'; evidence = `date found in state`;
    }
    items.push({ detail: d.original, normalizedDetail: d.isoForm, type: 'date', provenance: prov, evidence });
  }

  // 4. Explicit knowledge claims (from v3, with improved IO matching)
  // Note: patterns require "had" before stole/embezzled/taken to avoid matching "moved on"
  const claimPatterns = [
    /\b(knew|realized|understood|could tell|recognized|figured out|deduced)\s+that\s+([^.,;]+)/gi,
    /\b(knew|realized|understood|could tell|recognized)\s+([^.,;]+)/gi,
    /\b(had\s+)?(stole|embezzled|taken|diverted)\s+([^.,;]+)/gi,
    /\b(moved\s+the\s+\w+)/gi,  // only "moved the money", not "moved on"
  ];
  for (const pat of claimPatterns) {
    let m;
    while ((m = pat.exec(revisedText)) !== null) {
      const claim = m[0].toLowerCase();
      if (sourceLower.includes(claim)) continue;
      let prov: Provenance = 'UNKNOWN';
      let evidence = 'claim not present in source';
      for (const entry of state.informationOwnership.entries) {
        const factLower = entry.fact.toLowerCase();
        const charName = state.character.identity.toLowerCase().split('—')[0].trim().split(' ')[0];
        const knows = entry.knows.map(k => k.toLowerCase());
        const suspects = entry.suspects.map(k => k.toLowerCase());
        const claimWords = claim.split(/\s+/).filter(w => w.length > 3);
        const factWords = factLower.split(/\s+/).filter(w => w.length > 3);
        const overlap = claimWords.filter(w => factWords.includes(w)).length;
        if (overlap >= 2) {
          if (knows.includes(charName)) {
            prov = 'CHARACTER_STATE'; evidence = `character KNOWS: "${entry.fact}"`; break;
          } else if (suspects.includes(charName)) {
            prov = 'UNKNOWN'; evidence = `character only SUSPECTS: "${entry.fact}" — certainty claim unsupported`; break;
          } else if (entry.unknown.map(k=>k.toLowerCase()).includes(charName)) {
            prov = 'UNKNOWN'; evidence = `character does NOT KNOW: "${entry.fact}"`; break;
          }
        }
      }
      items.push({ detail: m[0], type: 'explicit_claim', provenance: prov, evidence });
    }
  }

  // 5. Proper nouns (with canonicalization — fixes "Papas" false positive)
  const COMMON_CAPITALIZED = new Set([
    'The','A','An','She','He','They','It','We','I','You','Her','His','Their','Its','Our','My','Your',
    'This','That','These','Those','But','And','Or','So','Because','When','While','If','Then','Now',
    'Room','Mr','Mrs','Dr','Ms',
  ]);
  const sentences = revisedText.split(/(?<=[.!?])\s+/);
  for (const sent of sentences) {
    const sentWords = sent.split(/\s+/).filter(w => w.length > 0);
    for (let i = 0; i < sentWords.length; i++) {
      const w = sentWords[i];
      const clean = w.replace(/[^a-zA-Z]/g, '');
      if (clean.length < 2) continue;
      if (i === 0) continue;
      if (!/^[A-Z]/.test(clean)) continue;
      if (COMMON_CAPITALIZED.has(clean)) continue;
      if (COMMON_CAPITALIZED.has(w)) continue;
      // Canonicalize: strip possessive
      const canonical = canonicalizeEntity(clean);
      // Check if the canonical form is in source or state
      const canonicalLower = canonical.toLowerCase();
      let prov: Provenance = 'UNKNOWN';
      let evidence = 'proper noun not found in source or state';
      if (sourceLower.includes(canonicalLower)) { prov = 'SOURCE_TEXT'; evidence = `found in source (canonical: "${canonical}")`; }
      else if (allStateLower.includes(canonicalLower)) { prov = 'CHARACTER_STATE'; evidence = `found in state (canonical: "${canonical}")`; }
      items.push({ detail: clean, normalizedDetail: canonical, type: 'proper_noun', provenance: prov, evidence });
    }
  }

  // Classify
  const unsupported = items.filter(i => i.provenance === 'UNKNOWN');
  const hardBlocks = unsupported.filter(i => i.type === 'number' || i.type === 'date' || i.type === 'explicit_claim');
  const softSignals = unsupported.filter(i => i.type === 'proper_noun');
  let severity: 'HARD_BLOCK' | 'SOFT_SIGNAL' | 'ADVISORY' = 'ADVISORY';
  if (hardBlocks.length > 0) severity = 'HARD_BLOCK';
  else if (softSignals.length > 0) severity = 'SOFT_SIGNAL';

  return { items, unsupported, hardBlocks, softSignals, severity };
}
