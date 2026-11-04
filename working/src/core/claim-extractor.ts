/**
 * Writing OS Core — Natural Language Claim Extraction Layer (v5.2 Hardened)
 * Bridges free-form prose, paraphrased assertions, modal verbs, and negations
 * into structured candidate claims for UniversalClaimStateEngine.
 */

export interface ExtractedCandidateClaim {
  rawSentence: string;
  subjectId: string;
  predicate: string;
  assertedValue: unknown;
  modality?: 'FACTUAL' | 'POSSIBLE' | 'UNCERTAIN' | 'COUNTERFACTUAL';
  isNegated?: boolean;
  confidence: number;
  extractionMethod: 'DETERMINISTIC_PATTERN' | 'LLM_PARSED';
}

const NUMBER_WORD_MAP: Record<string, string> = {
  one: '1', two: '2', three: '3', four: '4', five: '5',
  six: '6', seven: '7', eight: '8', nine: '9', ten: '10',
  eleven: '11', twelve: '12', thirteen: '13', fourteen: '14', fifteen: '15',
  twenty: '20', thirty: '30', forty: '40', fifty: '50', sixty: '60',
};

function normalizeNumberWords(str: string): string {
  let normalized = str.trim().toLowerCase();
  for (const [word, digit] of Object.entries(NUMBER_WORD_MAP)) {
    const reg = new RegExp(`\\b${word}\\b`, 'gi');
    normalized = normalized.replace(reg, digit);
  }
  return normalized;
}

export class ClaimExtractor {
  public static extractFromText(text: string, knownEntityIds: string[] = []): ExtractedCandidateClaim[] {
    const claims: ExtractedCandidateClaim[] = [];
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);

    const defaultSubject = knownEntityIds.length > 0 ? knownEntityIds[0].toLowerCase() : 'protagonist';

    for (const sentence of sentences) {
      const clean = sentence.trim();

      // Check Modality
      let modality: 'FACTUAL' | 'POSSIBLE' | 'UNCERTAIN' | 'COUNTERFACTUAL' = 'FACTUAL';
      if (/\b(?:could have been|might be|possibly|allegedly|hypothetically|it is possible that)\b/i.test(clean)) {
        modality = 'POSSIBLE';
      } else if (/\b(?:wasn't clear|not clear|unclear whether|disputed whether)\b/i.test(clean)) {
        modality = 'UNCERTAIN';
      }

      // Check Negation
      let isNegated = false;
      if (/\b(?:does not|did not|do not|never|lacks|fails to|is not)\b/i.test(clean)) {
        isNegated = true;
      }

      // 1. COMA / UNCONSCIOUSNESS PATTERNS (Run first to capture rich temporal variations)

      // 1A. Direct: [Subject] was in [coma/arrest] for [X days]
      const directComa = clean.match(/([A-Z][a-z]+|He|She)\s+(?:had been|was|spent)\s+(?:in\s+)?(?:a\s+)?(?:coma|non-REM arrest|unconscious(?:ness)?)\s+(?:for\s+)(\d+|[a-z]+)\s*(days?|weeks?|hours?|months?)/i);
      if (directComa) {
        const subj = directComa[1].toLowerCase();
        const duration = normalizeNumberWords(`${directComa[2]} ${directComa[3]}`);
        claims.push({
          rawSentence: clean,
          subjectId: (subj === 'he' || subj === 'she') ? defaultSubject : subj,
          predicate: 'coma_duration',
          assertedValue: duration,
          modality,
          isNegated,
          confidence: 0.95,
          extractionMethod: 'DETERMINISTIC_PATTERN',
        });
        continue;
      }

      // 1B. Inverted: [X days] passed while [Subject] remained unconscious
      const passiveComa = clean.match(/(\d+|[a-z]+)\s*(days?|weeks?|hours?)\s+(?:had\s+)?passed\s+while\s+([A-Z][a-z]+|he|she)\s+remained\s+unconscious/i);
      if (passiveComa) {
        const duration = normalizeNumberWords(`${passiveComa[1]} ${passiveComa[2]}`);
        const subj = passiveComa[3].toLowerCase();
        claims.push({
          rawSentence: clean,
          subjectId: (subj === 'he' || subj === 'she') ? defaultSubject : subj,
          predicate: 'coma_duration',
          assertedValue: duration,
          modality,
          isNegated,
          confidence: 0.94,
          extractionMethod: 'DETERMINISTIC_PATTERN',
        });
        continue;
      }

      // 1C. Awakening: [Subject] finally woke after [X days] in a coma
      const wokeComa = clean.match(/([A-Z][a-z]+|He|She)\s+(?:finally\s+)?(?:woke|awakened|regained consciousness)\s+after\s+(\d+|[a-z]+)\s*(days?|weeks?|hours?)/i);
      if (wokeComa) {
        const subj = wokeComa[1].toLowerCase();
        const duration = normalizeNumberWords(`${wokeComa[2]} ${wokeComa[3]}`);
        claims.push({
          rawSentence: clean,
          subjectId: (subj === 'he' || subj === 'she') ? defaultSubject : subj,
          predicate: 'coma_duration',
          assertedValue: duration,
          modality,
          isNegated,
          confidence: 0.93,
          extractionMethod: 'DETERMINISTIC_PATTERN',
        });
        continue;
      }

      // 1D. Prepositional: For [X days], [Subject] had not regained consciousness
      const prepComa = clean.match(/For\s+(?:nearly\s+)?(\d+|[a-z]+)\s*(days?|weeks?|hours?),\s*([A-Z][a-z]+|he|she)\s+had\s+(?:not\s+regained\s+consciousness|been\s+flatlined|remained\s+unconscious)/i);
      if (prepComa) {
        const duration = normalizeNumberWords(`${prepComa[1]} ${prepComa[2]}`);
        const subj = prepComa[3].toLowerCase();
        claims.push({
          rawSentence: clean,
          subjectId: (subj === 'he' || subj === 'she') ? defaultSubject : subj,
          predicate: 'coma_duration',
          assertedValue: duration,
          modality,
          isNegated: false, // Factual duration assertion despite negative predicate phrasing
          confidence: 0.93,
          extractionMethod: 'DETERMINISTIC_PATTERN',
        });
        continue;
      }

      // 1E. Clinical: [His/The] doctors kept [him/Subject] under for [X days]
      const clinicalComa = clean.match(/(?:His|The)\s+doctors\s+kept\s+([A-Z][a-z]+|him|her)\s+under\s+for\s+(\d+|[a-z]+)\s*(days?|weeks?|hours?)/i);
      if (clinicalComa) {
        const subj = clinicalComa[1].toLowerCase();
        const duration = normalizeNumberWords(`${clinicalComa[2]} ${clinicalComa[3]}`);
        claims.push({
          rawSentence: clean,
          subjectId: (subj === 'him' || subj === 'her') ? defaultSubject : subj,
          predicate: 'coma_duration',
          assertedValue: duration,
          modality,
          isNegated: false,
          confidence: 0.92,
          extractionMethod: 'DETERMINISTIC_PATTERN',
        });
        continue;
      }

      // 2. FINANCIAL REVENUE CLAIMS e.g. [Company] recorded/reported $20M in revenue
      const revenueMatch = clean.match(/([A-Z][A-Za-z0-9\s]+?)\s+(?:achieved|recorded|closed|reported|generated)\s+(?:that\s+)?(?:revenue\s+was\s+)?(\$[\d.]+\s*(?:M|B|million|billion))/i);
      if (revenueMatch) {
        const subj = revenueMatch[1].trim().toLowerCase().replace(/\s+/g, '_');
        claims.push({
          rawSentence: clean,
          subjectId: knownEntityIds.length > 0 ? knownEntityIds[0] : subj,
          predicate: 'revenue',
          assertedValue: revenueMatch[2].trim(),
          modality,
          isNegated,
          confidence: 0.92,
          extractionMethod: 'DETERMINISTIC_PATTERN',
        });
        continue;
      }

      // 2B. Passive / Modality revenue: The revenue could have been around $20M / Revenue was $20M
      const modalRevMatch = clean.match(/(?:The\s+)?revenue\s+(?:could have been around|was approximately|was|capped at)\s+(\$[\d.]+\s*(?:M|B|million|billion))/i);
      if (modalRevMatch) {
        claims.push({
          rawSentence: clean,
          subjectId: knownEntityIds.length > 0 ? knownEntityIds[0] : 'corp_finance',
          predicate: 'revenue',
          assertedValue: modalRevMatch[1].trim(),
          modality,
          isNegated,
          confidence: 0.93,
          extractionMethod: 'DETERMINISTIC_PATTERN',
        });
        continue;
      }

      // 3. DIRECT OWNERSHIP / ATTRIBUTE NEGATION: [Subject] does not own/have [Object]
      const ownershipNegMatch = clean.match(/([A-Z][a-z]+)\s+(?:does not|did not)\s+(?:own|have|possess|hold)\s+(?:the\s+)?([A-Za-z0-9_\-\s]+)/i);
      if (ownershipNegMatch) {
        claims.push({
          rawSentence: clean,
          subjectId: ownershipNegMatch[1].toLowerCase(),
          predicate: 'owns',
          assertedValue: ownershipNegMatch[2].trim().toLowerCase(),
          modality,
          isNegated: true,
          confidence: 0.95,
          extractionMethod: 'DETERMINISTIC_PATTERN',
        });
        continue;
      }

      // 3B. DIRECT OWNERSHIP: [Subject] owns/has [Object]
      const ownershipMatch = clean.match(/([A-Z][a-z]+)\s+(?:owns|has|possesses|holds)\s+(?:the\s+)?([A-Za-z0-9_\-\s]+)/i);
      if (ownershipMatch && !isNegated) {
        claims.push({
          rawSentence: clean,
          subjectId: ownershipMatch[1].toLowerCase(),
          predicate: 'owns',
          assertedValue: ownershipMatch[2].trim().toLowerCase(),
          modality,
          isNegated: false,
          confidence: 0.95,
          extractionMethod: 'DETERMINISTIC_PATTERN',
        });
        continue;
      }

      // 4. GENERIC UNSEEN DOMAIN METRIC: [Subject] [maintained/operated at/reached] [Value] [unit]
      const genericMetricMatch = clean.match(/([A-Za-z0-9_\-\s]+?)\s+(?:maintained|operated at|reached|exceeded|delivered)\s+([\d.]+\s*[A-Za-z/%]+)/i);
      if (genericMetricMatch) {
        const extractedSubj = genericMetricMatch[1].trim().toLowerCase().replace(/\s+/g, '_');
        claims.push({
          rawSentence: clean,
          subjectId: knownEntityIds.length > 0 ? knownEntityIds[0] : extractedSubj,
          predicate: 'operating_metric',
          assertedValue: genericMetricMatch[2].trim(),
          modality,
          isNegated,
          confidence: 0.91,
          extractionMethod: 'DETERMINISTIC_PATTERN',
        });
        continue;
      }

      // 5. NUMERICAL LETTERS COUNT
      const letterCountMatch = clean.match(/([A-Z][a-z]+|He|She)\s+(?:only\s+)?(?:knew|remembered|had)\s+(four|five|six|\d+)\s+letters/i);
      if (letterCountMatch) {
        const subj = letterCountMatch[1].toLowerCase();
        claims.push({
          rawSentence: clean,
          subjectId: (subj === 'he' || subj === 'she') ? defaultSubject : subj,
          predicate: 'known_letters_count',
          assertedValue: normalizeNumberWords(letterCountMatch[2]),
          modality,
          isNegated,
          confidence: 0.90,
          extractionMethod: 'DETERMINISTIC_PATTERN',
        });
        continue;
      }

      // 6. ACADEMIC CITATION ASSERTIONS
      const citationMatch = clean.match(/(.+?)\s*\[([A-Za-z]+ et al\., \d{4}|\d+)\]/i);
      if (citationMatch) {
        claims.push({
          rawSentence: clean,
          subjectId: citationMatch[2].trim(),
          predicate: 'cited_finding',
          assertedValue: citationMatch[1].trim(),
          modality,
          isNegated,
          confidence: 0.88,
          extractionMethod: 'DETERMINISTIC_PATTERN',
        });
        continue;
      }
    }

    return claims;
  }
}
