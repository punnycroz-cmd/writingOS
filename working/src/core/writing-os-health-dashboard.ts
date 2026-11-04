// developing/working/src/core/writing-os-health-dashboard.ts
// Writing OS v4.2+ — Generation Health Dashboard & 10 Observability Metrics

export interface WritingOSHealthMetrics {
  unsupportedSpecificityRate: number; // 0.0 to 1.0 (Lower is better in non-fiction)
  physicalDetailDensity: number;      // tokens per 100 words
  technicalDetailDensity: number;     // tokens per 100 words
  psychologicalInteriorRatio: number; // 0.0 to 1.0 (Higher in introspection)
  povDistinctiveness: number;         // 0.0 to 1.0 (Higher in multi-POV)
  creativeDiversityScore: number;     // 0.0 to 1.0 (Distance from trope basin)
  motifReuseRate: number;             // Repetition frequency across scenes
  consequencePersistence: number;     // 0.0 to 1.0 (Multi-horizon tracking)
  registerLeakage: number;            // 0.0 to 1.0 (0.0 is perfect isolation)
  compressionExpansionError: number;  // 0.0 to 1.0 (|actual - target| / target)
}

export class WritingOSHealthDashboard {
  /**
   * Compute comprehensive 10-dimensional health metrics for a given text output.
   */
  public static computeHealthMetrics(
    text: string,
    targetWordCount: number,
    options: {
      isFiction?: boolean;
      sourcePremiseFacts?: string[];
      isMultiPOV?: boolean;
      genre?: string;
    } = {}
  ): WritingOSHealthMetrics {
    const isFiction = options.isFiction ?? true;
    const words = text.match(/\b[a-zA-Z0-9'-]+\b/g) || [];
    const totalWords = Math.max(1, words.length);
    const lower = text.toLowerCase();

    // 1. Unsupported Specificity Rate
    const inventedModules = (lower.match(/\b(?:token persistence|distributed cache|asynchronous event propagation|state validation defect|synchronous validation barriers)\b/g) || []).length;
    const unsupportedSpecificityRate = !isFiction ? (inventedModules > 0 ? 0.75 : 0.0) : 0.0;

    // 2. Physical Detail Density
    const physicalTokens = (lower.match(/\b(?:boot|iron|brick|wood|sill|door|conduit|latch|glass|spreader|oar|table|stool|chisel|hammer|cup|shelf|wire|pipe|wrench)\b/g) || []).length;
    const physicalDetailDensity = Number(((physicalTokens / totalWords) * 100).toFixed(1));

    // 3. Technical Detail Density
    const technicalTokens = (lower.match(/\b(?:spectrometer|hydraulic|displacement|acoustic|substation|busbars|multimeter|interlock|voltage|amperage|alignment|shear)\b/g) || []).length;
    const technicalDetailDensity = Number(((technicalTokens / totalWords) * 100).toFixed(1));

    // 4. Psychological Interior Ratio
    const interiorTokens = (lower.match(/\b(?:remember|wondered|silently|memory|thought|understood|realized|doubt|hesitated|recognized|felt|believed|knew)\b/g) || []).length;
    const psychologicalInteriorRatio = Number((interiorTokens / Math.max(1, interiorTokens + physicalTokens)).toFixed(2));

    // 5. POV Distinctiveness
    let povDistinctiveness = 1.0;
    if (options.isMultiPOV) {
      const hasSymmetricalFormula = (lower.match(/\bwhere (?:another|others) saw\b/g) || []).length >= 2;
      povDistinctiveness = hasSymmetricalFormula ? 0.45 : 0.92;
    }

    // 6. Creative Diversity Score
    const hasAttractorBasin = /\b(?:root cellar|cellar)\b/i.test(lower) && /\b(?:dead|disappeared|secret)\b/i.test(lower) && /\b(?:shoes|cradle|trunk)\b/i.test(lower);
    const creativeDiversityScore = hasAttractorBasin ? 0.35 : 0.90;

    // 7. Motif Reuse Rate (Check for over-represented rustic tokens)
    const rusticTokens = (lower.match(/\b(?:tallow|linseed oil|mackintosh|oilcloth|dray horse)\b/g) || []).length;
    const motifReuseRate = Number((rusticTokens / totalWords).toFixed(3));

    // 8. Consequence Persistence
    const hasSecondOrder = /\b(?:logbook|registry|inquiry|subpoena|investigation|calendar|timestamp|audit|consequence)\b/i.test(lower);
    const consequencePersistence = hasSecondOrder ? 0.95 : 0.50;

    // 9. Register Leakage (e.g. narrative poetic prose leaking into business memos)
    let registerLeakage = 0.0;
    if (!isFiction) {
      const poeticTokens = (lower.match(/\b(?:shadows fell|whispered in the wind|golden sun|tenderly|ached)\b/g) || []).length;
      registerLeakage = poeticTokens > 0 ? 0.60 : 0.0;
    }

    // 10. Compression / Expansion Error
    const compressionExpansionError = Number((Math.abs(totalWords - targetWordCount) / Math.max(1, targetWordCount)).toFixed(2));

    return {
      unsupportedSpecificityRate,
      physicalDetailDensity,
      technicalDetailDensity,
      psychologicalInteriorRatio,
      povDistinctiveness,
      creativeDiversityScore,
      motifReuseRate,
      consequencePersistence,
      registerLeakage,
      compressionExpansionError,
    };
  }
}
