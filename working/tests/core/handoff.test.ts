import { describe, expect, test } from 'bun:test';
import { HandoffRouter } from '../../src/core/handoff';

describe('Writing OS Core — Hardened HandoffRouter Zero-Fall-Through Specification', () => {
  test('Strictly routes ANY deterministic violation to AUTONOMOUS_BLOCK regardless of severity', () => {
    const severities = ['CRITICAL', 'MAJOR', 'MODERATE', 'MINOR', 'INFO'] as const;

    for (const sev of severities) {
      const decision = HandoffRouter.routeDecision({
        ruleId: 'TEST_VIOLATION',
        isDeterministicViolation: true,
        isAmbiguous: false,
        severity: sev,
        description: `Violation with severity ${sev}`,
        sourceContext: 'test snippet',
      });

      expect(decision.action).toBe('AUTONOMOUS_BLOCK');
      expect(decision.description).toContain(`Deterministic Violation`);
    }
  });

  test('Routes semantic ambiguity to appropriate LLM or Human handoff tier', () => {
    // Critical ambiguity -> HUMAN_HANDOFF
    const criticalAmbiguity = HandoffRouter.routeDecision({
      ruleId: 'HIGH_RISK_LORE',
      isDeterministicViolation: false,
      isAmbiguous: true,
      severity: 'CRITICAL',
      description: 'Major contradictory timeline unresolvable by heuristics',
      sourceContext: 'timeline snippet',
    });
    expect(criticalAmbiguity.action).toBe('HUMAN_HANDOFF');

    // Moderate ambiguity -> LLM_HANDOFF
    const moderateAmbiguity = HandoffRouter.routeDecision({
      ruleId: 'TONE_UNCERTAINTY',
      isDeterministicViolation: false,
      isAmbiguous: true,
      severity: 'MODERATE',
      description: 'Subtle sarcasm vs earnest reflection',
      sourceContext: 'dialogue snippet',
    });
    expect(moderateAmbiguity.action).toBe('LLM_HANDOFF');
  });

  test('Grants AUTONOMOUS_ACCEPT ONLY when completely clean (no violation, no ambiguity)', () => {
    const cleanPass = HandoffRouter.routeDecision({
      ruleId: 'CANON_CLEAN',
      isDeterministicViolation: false,
      isAmbiguous: false,
      severity: 'INFO',
      description: 'All 14 dimensions passed without error',
      sourceContext: 'clean manuscript snippet',
    });

    expect(cleanPass.action).toBe('AUTONOMOUS_ACCEPT');
    expect(cleanPass.severity).toBe('INFO');
  });
});
