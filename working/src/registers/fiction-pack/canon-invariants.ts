/**
 * Fiction Pack — Canon Invariants & Lore Gates
 * Manages fiction world rules, mathematical agreement, and lore boundaries.
 */

export interface CanonInvariantRule {
  ruleId: string;
  description: string;
  validator: (text: string) => { passed: boolean; reason?: string };
}

export class CanonInvariantEngine {
  private static rules: CanonInvariantRule[] = [];

  public static registerRule(rule: CanonInvariantRule): void {
    this.rules.push(rule);
  }

  public static auditCanon(text: string): { passed: boolean; violations: string[] } {
    const violations: string[] = [];
    for (const rule of this.rules) {
      const res = rule.validator(text);
      if (!res.passed && res.reason) {
        violations.push(`[${rule.ruleId}] ${res.reason}`);
      }
    }
    return {
      passed: violations.length === 0,
      violations,
    };
  }
}
