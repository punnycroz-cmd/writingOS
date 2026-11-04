/**
 * Business Pack — Brand Voice & Financial Metric Verification
 * Enforces executive precision, metric authorization, and brand voice guidelines.
 */

import { UniversalStateGraph, BaseEntity } from '../../core/state-model';

export interface BusinessEntityConfig {
  companyName: string;
  quarterlyRevenue?: string;
  activeInitiatives?: string[];
  prohibitedClaims?: string[];
}

export class BusinessBrandEngine {
  public static registerBusinessProfile(stateGraph: UniversalStateGraph, profile: BusinessEntityConfig): BaseEntity {
    return stateGraph.registerEntity({
      id: profile.companyName.toLowerCase().replace(/\s+/g, '_'),
      entityType: 'BUSINESS_ORGANIZATION',
      displayName: profile.companyName,
      properties: {
        revenue: profile.quarterlyRevenue || 'UNAUTHORIZED',
        initiatives: profile.activeInitiatives || [],
        prohibitedClaims: profile.prohibitedClaims || [],
      },
    });
  }

  public static auditBusinessClaims(text: string, stateGraph: UniversalStateGraph): { passed: boolean; violations: string[] } {
    const violations: string[] = [];

    // Financial Metric Hallucination Check
    // e.g. claiming $50M revenue when established is $20M
    const revenueMatch = text.match(/\$(\d+(?:\.\d+)?)\s*(?:M|million|B|billion)/i);
    if (revenueMatch) {
      const orgs = stateGraph.getAllEntities().filter(e => e.entityType === 'BUSINESS_ORGANIZATION');
      for (const org of orgs) {
        const authRevenue = (org.properties.get('revenue')?.value as string) || 'UNAUTHORIZED';
        if (authRevenue && authRevenue !== 'UNAUTHORIZED') {
          if (!text.includes(authRevenue)) {
            violations.push(`Unverified Financial Metric: Mention of "${revenueMatch[0]}" conflicts with authorized company revenue "${authRevenue}".`);
          }
        } else if (authRevenue === 'UNAUTHORIZED') {
          violations.push(`Unauthorized Financial Metric: Claim of "${revenueMatch[0]}" made without authorized revenue property in state.`);
        }
      }
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }
}
