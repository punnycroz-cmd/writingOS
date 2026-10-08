// src/engine/deterministic/claims.ts
// Epistemic-claim extraction + resolution against information-ownership state.
// Ported from history/writing-engine/src/iteration42.ts.

import type { DocumentState } from '../semantic/types';

export const EPISTEMIC_MARKERS: Record<string, RegExp> = {
  CERTAINTY: /\b(knew|realized|understood|had learned|had discovered|was aware|was certain|was sure)\b/gi,
  KNOWLEDGE: /\b(saw|watched|observed|noticed|confirmed|verified|proved)\b/gi,
  BELIEF: /\b(thought|believed|assumed|supposed|presumed|imagined|concluded|inferred|decided|reasoned)\b/gi,
  SUSPICION: /\b(suspected|wondered|questioned|doubted|feared|worried|hoped|guessed|speculated)\b/gi,
  INTERPRETATION: /\b(seemed|appeared|looked|sounded|felt like|as if|as though|probably|maybe|perhaps|likely)\b/gi,
  OBSERVATION: /\b(could see|could tell|could hear|could feel|evident|obvious|clear that)\b/gi,
};

export type EpistemicLevel = 'CERTAINTY' | 'KNOWLEDGE' | 'BELIEF' | 'SUSPICION' | 'INTERPRETATION' | 'OBSERVATION' | 'NONE';
export type ClaimResolution = 'STATE_SUPPORTED' | 'STATE_CONTRADICTION' | 'INSUFFICIENT_STATE' | 'NO_CLAIM_DETECTED';

export interface ExtractedClaim {
  type: string;
  level: EpistemicLevel;
  fact: string;
  claimed: boolean;
  actually: string;
  status: 'supported' | 'contradicted' | 'insufficient';
}

const SUPPORT_MAP: Record<string, Record<EpistemicLevel, 'supported' | 'contradicted' | 'insufficient'>> = {
  knows: {
    CERTAINTY: 'supported', KNOWLEDGE: 'supported', BELIEF: 'supported',
    SUSPICION: 'supported', INTERPRETATION: 'supported', OBSERVATION: 'supported', NONE: 'supported',
  },
  suspects: {
    CERTAINTY: 'contradicted', KNOWLEDGE: 'contradicted', BELIEF: 'contradicted',
    SUSPICION: 'supported', INTERPRETATION: 'supported', OBSERVATION: 'supported', NONE: 'insufficient',
  },
  misunderstands: {
    CERTAINTY: 'contradicted', KNOWLEDGE: 'contradicted', BELIEF: 'insufficient',
    SUSPICION: 'insufficient', INTERPRETATION: 'insufficient', OBSERVATION: 'insufficient', NONE: 'insufficient',
  },
  unknown: {
    CERTAINTY: 'contradicted', KNOWLEDGE: 'contradicted', BELIEF: 'contradicted',
    SUSPICION: 'contradicted', INTERPRETATION: 'insufficient', OBSERVATION: 'insufficient', NONE: 'insufficient',
  },
};

function charFirstName(state: DocumentState): string {
  return (state.character.identity || '').split('—')[0].trim().split(' ')[0].toLowerCase();
}

export function resolveClaim(
  state: DocumentState,
  fact: string,
  claimed: string,
  level: EpistemicLevel,
  subjectIsChar: boolean,
): ExtractedClaim {
  const entries = state.informationOwnership?.entries || [];
  if (!subjectIsChar || entries.length === 0) {
    return { type: 'information_ownership', fact, claimed, actually: claimed, status: 'insufficient', level };
  }
  const charName = charFirstName(state);
  const factWords = fact.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  for (const entry of entries) {
    const entryFactWords = entry.fact.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const overlap = factWords.filter(w => entryFactWords.includes(w)).length;
    if (overlap >= 2 || entry.fact.toLowerCase().includes(fact.toLowerCase())) {
      const knowerGroups: [string, string[]][] = [
        ['knows', entry.knows], ['suspects', entry.suspects],
        ['misunderstands', entry.misunderstands], ['unknown', entry.unknown],
      ];
      for (const [group, names] of knowerGroups) {
        if (names.map(n => n.toLowerCase()).includes(charName)) {
          return {
            type: 'information_ownership', fact: entry.fact, claimed,
            actually: `character ${group.toUpperCase()}s "${entry.fact}"`,
            status: SUPPORT_MAP[group][level], level,
          };
        }
      }
      return { type: 'information_ownership', fact: entry.fact, claimed, actually: `no state entry for "${charName}"`, status: 'insufficient', level };
    }
  }
  return { type: 'information_ownership', fact, claimed, actually: 'no matching IO fact', status: 'insufficient', level };
}

function extractSentenceSegment(text: string, idx: number): string {
  // From the marker to the end of the clause — used as the claim's "fact".
  const rest = text.slice(idx);
  const seg = rest.match(/([^.,;!?]{8,80})/);
  return seg ? seg[1].trim() : rest.slice(0, 80).trim();
}

export function extractClaims(
  text: string,
  originalText: string,
  state: DocumentState,
): ExtractedClaim[] {
  const claims: ExtractedClaim[] = [];
  const charName = charFirstName(state);
  const sourceLower = (originalText || '').toLowerCase();
  const seen = new Set<string>();

  for (const [level, pattern] of Object.entries(EPISTEMIC_MARKERS)) {
    let m;
    while ((m = pattern.exec(text)) !== null) {
      const key = `${level}@${m.index}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const fact = extractSentenceSegment(text, m.index);
      if (sourceLower.includes(m[0].toLowerCase()) && sourceLower.includes(fact.toLowerCase())) continue;
      const before = text.slice(Math.max(0, m.index - 60), m.index).toLowerCase();
      const subjectIsChar = before.includes(charName) || /\b(she|he|they|i|we)\s*$/.test(before);
      claims.push(resolveClaim(state, fact, m[0], level as EpistemicLevel, subjectIsChar));
    }
  }
  return claims;
}
