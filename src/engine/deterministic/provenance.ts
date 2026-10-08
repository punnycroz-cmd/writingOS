// src/engine/deterministic/provenance.ts
// [CC] provenance layer — rebuilt from history experiments (provenance v4 +
// iteration42 scoped classification). Normalizes number-words, dates,
// possessives before comparing against source+state.

import type { DocumentState } from '../semantic/types';

const ONES: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19,
};
const TENS: Record<string, number> = {
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};
const SCALES: Record<string, number> = { hundred: 100, thousand: 1000, million: 1000000, billion: 1000000000 };

function wordsToNumber(words: string[]): number | null {
  if (words.length === 0) return null;
  let total = 0, current = 0, hasNumber = false;
  for (const w of words) {
    if (ONES[w] !== undefined) { current += ONES[w]; hasNumber = true; }
    else if (TENS[w] !== undefined) { current += TENS[w]; hasNumber = true; }
    else if (SCALES[w] !== undefined) {
      if (current === 0) current = 1;
      current *= SCALES[w];
      if (SCALES[w] >= 1000) { total += current; current = 0; }
      hasNumber = true;
    } else return null;
  }
  return hasNumber ? total + current : null;
}

export interface NormalizedNumber { original: string; numeric: number; numericStr: string; position: number; }

export function extractNumberWords(text: string): NormalizedNumber[] {
  const results: NormalizedNumber[] = [];
  const all = [...Object.keys(ONES), ...Object.keys(TENS), ...Object.keys(SCALES)];
  const pat = new RegExp(`\\b(${all.join('|')})(?:\\s+(${all.join('|')}))*\\b`, 'gi');
  let m;
  while ((m = pat.exec(text)) !== null) {
    const num = wordsToNumber(m[0].toLowerCase().split(/\s+/));
    if (num !== null) results.push({ original: m[0], numeric: num, numericStr: String(num), position: m.index });
  }
  return results;
}

const MONTHS: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
  jan: '01', feb: '02', mar: '03', apr: '04', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

export interface NormalizedDate { original: string; isoForm: string; position: number; }

export function extractDates(text: string): NormalizedDate[] {
  const results: NormalizedDate[] = [];
  const mon = '(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)';
  let m;
  const p1 = new RegExp(`\\b${mon}\\s+(\\d{1,2}),?\\s+(\\d{4})\\b`, 'gi');
  while ((m = p1.exec(text)) !== null) {
    const mo = MONTHS[m[1].toLowerCase()];
    if (mo) results.push({ original: m[0], isoForm: `${m[3]}-${mo}-${m[2].padStart(2, '0')}`, position: m.index });
  }
  const p2 = new RegExp(`\\b(\\d{1,2})\\s+${mon}\\s+(\\d{4})\\b`, 'gi');
  while ((m = p2.exec(text)) !== null) {
    const mo = MONTHS[m[2].toLowerCase()];
    if (mo) results.push({ original: m[0], isoForm: `${m[3]}-${mo}-${m[1].padStart(2, '0')}`, position: m.index });
  }
  const p3 = /\b(\d{4})-(\d{2})-(\d{2})\b/g;
  while ((m = p3.exec(text)) !== null) {
    results.push({ original: m[0], isoForm: `${m[1]}-${m[2]}-${m[3]}`, position: m.index });
  }
  return results;
}

export function canonicalizeEntity(entity: string): string {
  return entity.replace(/['’]s$/i, '').replace(/s$/i, (match) => (entity.length <= 3 ? match : ''));
}

export type Provenance = 'SOURCE_TEXT' | 'CHARACTER_STATE' | 'CANON' | 'USER_PROVIDED' | 'ENTAILED' | 'INFERRED' | 'UNKNOWN';
export type DetailType = 'number' | 'date' | 'proper_noun' | 'explicit_claim';

export interface ProvenanceItem {
  detail: string;
  normalizedDetail?: string;
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

function charFirstName(state: DocumentState): string {
  return (state.character.identity || '').split('—')[0].trim().split(' ')[0].toLowerCase();
}

export function classifyProvenanceV4(
  revisedText: string,
  originalPassage: string,
  state: DocumentState,
): ProvenanceResult {
  const items: ProvenanceItem[] = [];
  const normalizeNums = (s: string) => s.toLowerCase().replace(/\$|,/g, '');
  const sourceLower = normalizeNums(originalPassage || '');
  const allStateLower = [
    normalizeNums(JSON.stringify(state.character || {})),
    normalizeNums(JSON.stringify(state.canon || {})),
    normalizeNums(JSON.stringify(state.informationOwnership || {})),
  ].join(' ');

  // 1. Digit numbers
  for (const n of revisedText.match(/\b\d+(?:\.\d+)?\b/g) || []) {
    const v = n.toLowerCase();
    let prov: Provenance = 'UNKNOWN', evidence = 'not found in source or state';
    if (sourceLower.includes(v)) { prov = 'SOURCE_TEXT'; evidence = 'found in source passage'; }
    else if (allStateLower.includes(v)) { prov = 'CHARACTER_STATE'; evidence = 'found in state'; }
    items.push({ detail: n, normalizedDetail: n, type: 'number', provenance: prov, evidence });
  }

  // 2. Number words
  for (const nw of extractNumberWords(revisedText)) {
    const origLower = nw.original.toLowerCase();
    let prov: Provenance = 'UNKNOWN', evidence = 'not found in source or state';
    if (sourceLower.includes(origLower) || sourceLower.includes(nw.numericStr)) {
      prov = 'SOURCE_TEXT'; evidence = `found in source (as "${nw.original}" or "${nw.numericStr}")`;
    } else if (allStateLower.includes(origLower) || allStateLower.includes(nw.numericStr)) {
      prov = 'CHARACTER_STATE'; evidence = `found in state (as "${nw.original}" or "${nw.numericStr}")`;
    }
    items.push({ detail: nw.original, normalizedDetail: nw.numericStr, type: 'number', provenance: prov, evidence });
  }

  // 3. Dates
  for (const d of extractDates(revisedText)) {
    let prov: Provenance = 'UNKNOWN', evidence = 'date not found in source or state';
    if (sourceLower.includes(d.original.toLowerCase()) || sourceLower.includes(d.isoForm)) {
      prov = 'SOURCE_TEXT'; evidence = 'date found in source';
    } else if (allStateLower.includes(d.original.toLowerCase()) || allStateLower.includes(d.isoForm)) {
      prov = 'CHARACTER_STATE'; evidence = 'date found in state';
    }
    items.push({ detail: d.original, normalizedDetail: d.isoForm, type: 'date', provenance: prov, evidence });
  }

  // 4. Explicit epistemic claims (matched against informationOwnership)
  const claimPatterns = [
    /\b(knew|realized|understood|could tell|recognized|figured out|deduced)\s+that\s+([^.,;]+)/gi,
    /\b(knew|realized|understood|could tell|recognized)\s+([^.,;]+)/gi,
    /\b(had\s+)?(stole|embezzled|taken|diverted)\s+([^.,;]+)/gi,
    /\b(moved\s+the\s+\w+)/gi,
  ];
  const charName = charFirstName(state);
  for (const pat of claimPatterns) {
    let m;
    while ((m = pat.exec(revisedText)) !== null) {
      const claim = m[0].toLowerCase();
      if (sourceLower.includes(claim)) continue;
      let prov: Provenance = 'UNKNOWN', evidence = 'claim not present in source';
      for (const entry of state.informationOwnership?.entries || []) {
        const factLower = entry.fact.toLowerCase();
        const claimWords = claim.split(/\s+/).filter(w => w.length > 3);
        const factWords = factLower.split(/\s+/).filter(w => w.length > 3);
        const overlap = claimWords.filter(w => factWords.includes(w)).length;
        if (overlap >= 2) {
          const knows = entry.knows.map(k => k.toLowerCase());
          const suspects = entry.suspects.map(k => k.toLowerCase());
          const unknown = entry.unknown.map(k => k.toLowerCase());
          if (knows.includes(charName)) { prov = 'CHARACTER_STATE'; evidence = `character KNOWS: "${entry.fact}"`; break; }
          else if (suspects.includes(charName)) { prov = 'UNKNOWN'; evidence = `character only SUSPECTS: "${entry.fact}" — certainty claim unsupported`; break; }
          else if (unknown.includes(charName)) { prov = 'UNKNOWN'; evidence = `character does NOT KNOW: "${entry.fact}"`; break; }
        }
      }
      items.push({ detail: m[0], type: 'explicit_claim', provenance: prov, evidence });
    }
  }

  // 5. Proper nouns (canonicalized)
  const COMMON_CAPITALIZED = new Set([
    'The', 'A', 'An', 'She', 'He', 'They', 'It', 'We', 'I', 'You', 'Her', 'His', 'Their', 'Its', 'Our', 'My', 'Your',
    'This', 'That', 'These', 'Those', 'But', 'And', 'Or', 'So', 'Because', 'When', 'While', 'If', 'Then', 'Now',
    'Room', 'Mr', 'Mrs', 'Dr', 'Ms',
  ]);
  for (const sent of revisedText.split(/(?<=[.!?])\s+/)) {
    const sentWords = sent.split(/\s+/).filter(w => w.length > 0);
    for (let i = 0; i < sentWords.length; i++) {
      const w = sentWords[i];
      const clean = w.replace(/[^a-zA-Z]/g, '');
      if (clean.length < 2 || i === 0) continue;
      if (!/^[A-Z]/.test(clean)) continue;
      if (COMMON_CAPITALIZED.has(clean) || COMMON_CAPITALIZED.has(w)) continue;
      const canonical = canonicalizeEntity(clean);
      const canonicalLower = canonical.toLowerCase();
      let prov: Provenance = 'UNKNOWN', evidence = 'proper noun not found in source or state';
      if (sourceLower.includes(canonicalLower)) { prov = 'SOURCE_TEXT'; evidence = `found in source (canonical: "${canonical}")`; }
      else if (allStateLower.includes(canonicalLower)) { prov = 'CHARACTER_STATE'; evidence = `found in state (canonical: "${canonical}")`; }
      items.push({ detail: clean, normalizedDetail: canonical, type: 'proper_noun', provenance: prov, evidence });
    }
  }

  const unsupported = items.filter(i => i.provenance === 'UNKNOWN');
  const hardBlocks = unsupported.filter(i => i.type === 'number' || i.type === 'date' || i.type === 'explicit_claim');
  const softSignals = unsupported.filter(i => i.type === 'proper_noun');
  let severity: ProvenanceResult['severity'] = 'ADVISORY';
  if (hardBlocks.length > 0) severity = 'HARD_BLOCK';
  else if (softSignals.length > 0) severity = 'SOFT_SIGNAL';
  return { items, unsupported, hardBlocks, softSignals, severity };
}
