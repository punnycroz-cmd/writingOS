/**
 * Writing OS Business Pack — Metric Authorization & Executive Persuasion Intelligence (P9)
 * Enforces strict metric provenance and prevents unauthorized forecast hallucinations in executive communications.
 */

export interface BusinessMetricAudit {
  isAuthorized: boolean;
  authorizedMetrics: string[];
  unauthorizedMetrics: string[];
  explanation: string;
}

export class BusinessIntelligence {
  public static evaluateMetricAuthorization(
    text: string,
    authorizedMetrics: Record<string, string>
  ): BusinessMetricAudit {
    const unauthorizedMetrics: string[] = [];
    const foundAuthorized: string[] = [];

    // Extract currency or growth patterns (e.g. $18M, 45%, $250k)
    const metricMatches = text.match(/\$\d+(?:\.\d+)?(?:M|k|B)?|\b\d+%/g) || [];

    const authorizedValues = new Set(Object.values(authorizedMetrics).map(v => v.toLowerCase()));

    for (const match of metricMatches) {
      if (authorizedValues.has(match.toLowerCase())) {
        foundAuthorized.push(match);
      } else {
        unauthorizedMetrics.push(match);
      }
    }

    const isAuthorized = unauthorizedMetrics.length === 0;

    return {
      isAuthorized,
      authorizedMetrics: foundAuthorized,
      unauthorizedMetrics,
      explanation: isAuthorized 
        ? 'All financial figures and performance metrics are authorized by source canon.' 
        : `Unauthorized metrics detected: [${unauthorizedMetrics.join(', ')}].`,
    };
  }
}
