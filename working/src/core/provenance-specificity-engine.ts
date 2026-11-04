// developing/working/src/core/provenance-specificity-engine.ts
// Writing OS v4.2+ — Layer P0: Knowledge Provenance & Specificity Bounding Engine

export type FactProvenance = 
  | 'SOURCE_GIVEN'       // Directly asserted in user premise/input
  | 'SOURCE_INFERRED'    // Logically entailed by source facts
  | 'GENERIC_KNOWLEDGE'  // Universal domain knowledge (e.g., "audits take time")
  | 'CREATIVE_INVENTION' // Invented fictional/concrete details
  | 'UNKNOWN';           // Uncategorized assertion

export type SpecificityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME_MODULE';

export interface FactClaim {
  statement: string;
  provenance: FactProvenance;
  specificity: SpecificityLevel;
  necessity: 'ESSENTIAL' | 'SUPPORTING' | 'DECORATIVE' | 'UNNECESSARY';
  confidence: number; // 0.0 to 1.0
  isSupported: boolean;
  suppressionRecommended: boolean;
  reason?: string;
}

export interface SpecificityBudgetConfig {
  register: 'BUSINESS_MEMO' | 'TECHNICAL_REPORT' | 'LITERARY_FICTION' | 'CANON_CONTINUATION' | 'AMBIGUOUS_PREMISE' | 'GENERAL';
  maxCreativeSpecificity: SpecificityLevel;
  allowInventedSubsystems: boolean;
  maxUnsupportedClaims: number;
}

export const REGISTER_SPECIFICITY_BUDGETS: Record<string, SpecificityBudgetConfig> = {
  BUSINESS_MEMO: {
    register: 'BUSINESS_MEMO',
    maxCreativeSpecificity: 'LOW',
    allowInventedSubsystems: false,
    maxUnsupportedClaims: 0,
  },
  TECHNICAL_REPORT: {
    register: 'TECHNICAL_REPORT',
    maxCreativeSpecificity: 'LOW',
    allowInventedSubsystems: false,
    maxUnsupportedClaims: 0,
  },
  CANON_CONTINUATION: {
    register: 'CANON_CONTINUATION',
    maxCreativeSpecificity: 'MEDIUM',
    allowInventedSubsystems: false,
    maxUnsupportedClaims: 1,
  },
  LITERARY_FICTION: {
    register: 'LITERARY_FICTION',
    maxCreativeSpecificity: 'HIGH',
    allowInventedSubsystems: true,
    maxUnsupportedClaims: 100, // Fiction is free to invent details
  },
  AMBIGUOUS_PREMISE: {
    register: 'AMBIGUOUS_PREMISE',
    maxCreativeSpecificity: 'HIGH',
    allowInventedSubsystems: true,
    maxUnsupportedClaims: 100,
  },
  GENERAL: {
    register: 'GENERAL',
    maxCreativeSpecificity: 'MEDIUM',
    allowInventedSubsystems: false,
    maxUnsupportedClaims: 2,
  },
};

export class ProvenanceSpecificityEngine {
  /**
   * Extract factual and technical claims from a draft and assign provenance relative to premise facts.
   */
  public static extractAndAuditClaims(
    text: string,
    sourcePremiseFacts: string[],
    register: 'BUSINESS_MEMO' | 'TECHNICAL_REPORT' | 'LITERARY_FICTION' | 'CANON_CONTINUATION' | 'AMBIGUOUS_PREMISE' | 'GENERAL' = 'GENERAL'
  ): {
    claims: FactClaim[];
    unsupportedSpecificityRate: number;
    budgetExceeded: boolean;
    auditPassed: boolean;
    softenedText?: string;
  } {
    const budget = REGISTER_SPECIFICITY_BUDGETS[register] || REGISTER_SPECIFICITY_BUDGETS.GENERAL;
    const lowerText = text.toLowerCase();
    const lowerPremise = sourcePremiseFacts.map(f => f.toLowerCase()).join(' ');

    // Patterns indicating high-specificity invented technical architecture
    const inventedArchitecturePatterns = [
      { regex: /\b(?:token persistence layer|distributed (?:edge )?caches?|asynchronous event propagation|out-of-order execution|session validation pipeline|credential claims?)\b/gi, name: 'invented authentication/event subsystems' },
      { regex: /\b(?:state validation defect|synchronous validation barriers|microservice routing proxy|database sharding defect|distributed consensus lock)\b/gi, name: 'invented backend architecture' },
      { regex: /\b(?:jwt|oauth|sha256|aes-256|rsa-4096|tls 1\.3)\b/gi, name: 'ungrounded protocol standards' },
    ];

    const claims: FactClaim[] = [];
    let inventedCount = 0;

    // Scan for low-level technical claims
    for (const pat of inventedArchitecturePatterns) {
      let match: RegExpExecArray | null;
      const re = new RegExp(pat.regex.source, 'gi');
      while ((match = re.exec(text)) !== null) {
        const matchedPhrase = match[0];
        const isInPremise = lowerPremise.includes(matchedPhrase.toLowerCase());
        const prov: FactProvenance = isInPremise ? 'SOURCE_GIVEN' : 'CREATIVE_INVENTION';
        const isSupported = isInPremise || budget.allowInventedSubsystems;
        const suppressionRecommended = !isSupported && budget.register === 'BUSINESS_MEMO';

        if (!isSupported) {
          inventedCount++;
        }

        claims.push({
          statement: matchedPhrase,
          provenance: prov,
          specificity: 'EXTREME_MODULE',
          necessity: isInPremise ? 'ESSENTIAL' : 'UNNECESSARY',
          confidence: isInPremise ? 1.0 : 0.2,
          isSupported,
          suppressionRecommended,
          reason: isInPremise 
            ? 'Confirmed in source premise.' 
            : `Unprompted concrete technical module in ${register} register.`,
        });
      }
    }

    const unsupportedCount = claims.filter(c => !c.isSupported).length;
    const unsupportedSpecificityRate = claims.length > 0 ? Number((unsupportedCount / claims.length).toFixed(2)) : 0.0;
    const budgetExceeded = unsupportedCount > budget.maxUnsupportedClaims;
    const auditPassed = !budgetExceeded;

    // Generate softened text for memos if requested
    let softenedText = text;
    if (!auditPassed && budget.register === 'BUSINESS_MEMO') {
      softenedText = text
        .replace(/token persistence layer/gi, 'authentication controls')
        .replace(/distributed (?:edge )?caches?/gi, 'system services')
        .replace(/asynchronous event propagation/gi, 'event processing')
        .replace(/state validation defect/gi, 'vulnerability')
        .replace(/synchronous validation barriers/gi, 'remediation controls');
    }

    return {
      claims,
      unsupportedSpecificityRate,
      budgetExceeded,
      auditPassed,
      softenedText: auditPassed ? text : softenedText,
    };
  }
}
