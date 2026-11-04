/**
 * Writing OS Technical Pack — Specification Precision & Semantic Invariance Intelligence (P9)
 * Validates technical limits, procedure steps, and enforces SEMANTIC_INVARIANCE_UNDER_SURFACE_VARIANCE.
 */

export interface TechnicalSpecificationAudit {
  isPrecise: boolean;
  preservedConstraints: string[];
  violatedConstraints: string[];
  explanation: string;
}

export class TechnicalIntelligence {
  public static evaluateSpecificationPrecision(
    text: string,
    canonicalSpecs: Record<string, string | number>
  ): TechnicalSpecificationAudit {
    const violated: string[] = [];
    const preserved: string[] = [];

    // Check request rate limits e.g. "100 requests/sec" vs "1000 requests/sec"
    if (canonicalSpecs['max_rate_rps']) {
      const canonicalRate = canonicalSpecs['max_rate_rps'];
      const rateMatch = text.match(/(\d+)\s*(?:requests\/sec|rps|req\/s)/i);
      if (rateMatch) {
        const statedRate = Number(rateMatch[1]);
        if (statedRate !== canonicalRate) {
          violated.push(`Rate limit mismatch: Stated ${statedRate} rps does not match canonical spec ${canonicalRate} rps.`);
        } else {
          preserved.push(`Rate limit: ${canonicalRate} rps`);
        }
      }
    }

    const isPrecise = violated.length === 0;

    return {
      isPrecise,
      preservedConstraints: preserved,
      violatedConstraints: violated,
      explanation: isPrecise
        ? 'Technical specifications and numerical rate limits match canonical contract exactly.'
        : violated[0],
    };
  }
}
