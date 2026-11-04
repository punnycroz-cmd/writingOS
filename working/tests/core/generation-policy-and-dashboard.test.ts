import { describe, expect, test } from 'bun:test';
import { ContextAnalyzer, GenerationPolicyEngine } from '../../src/core/generation-policy-engine';
import { ProvenanceSpecificityEngine } from '../../src/core/provenance-specificity-engine';
import { WritingOSHealthDashboard } from '../../src/core/writing-os-health-dashboard';

describe('Writing OS v4.2+ — Context Analyzer & Generation Policy Suite', () => {
  test('ContextAnalyzer: Correctly classifies executive memorandum and assigns zero physical grounding budget', () => {
    const premise = 'Write an executive memorandum announcing a six-week deployment delay due to an identified security vulnerability.';
    const analysis = ContextAnalyzer.analyzePremise(premise);

    expect(analysis.isFiction).toBe(false);
    expect(analysis.register).toBe('EXECUTIVE_MEMO');
    expect(analysis.physicalRelevance).toBe('MINIMAL');

    const policy = GenerationPolicyEngine.derivePolicy(analysis);
    expect(policy.groundingMode).toBe('EPISTEMIC');
    expect(policy.detailBudget.physical).toBe(0);
    expect(policy.maxUnsupportedSpecificity).toBe('NONE');
  });

  test('ContextAnalyzer: Correctly classifies multi-POV tactical scene and assigns balanced mixed budget', () => {
    const premise = 'Three people — a cold analytical engineer, a cautious former soldier, and a street survivor — discover a forced-open door.';
    const analysis = ContextAnalyzer.analyzePremise(premise);

    expect(analysis.isFiction).toBe(true);
    expect(analysis.narrativeMode).toBe('MULTI_POV');
    expect(analysis.physicalRelevance).toBe('CRUCIAL');

    const policy = GenerationPolicyEngine.derivePolicy(analysis);
    expect(policy.groundingMode).toBe('MIXED');
    expect(policy.povMode).toBe('ANALYTICAL_COGNITION');
  });

  test('ProvenanceSpecificityEngine: Rejects ungrounded technical architecture in business memo', () => {
    const ungroundedMemo = `
MEMORANDUM
TO: Leadership
SUBJECT: Delay
The token persistence layer failed across distributed edge caches. Release delayed.
    `;
    const audit = ProvenanceSpecificityEngine.extractAndAuditClaims(
      ungroundedMemo,
      ['six-week delay', 'security vulnerability'],
      'BUSINESS_MEMO'
    );

    expect(audit.auditPassed).toBe(false);
    expect(audit.budgetExceeded).toBe(true);
    expect(audit.unsupportedSpecificityRate).toBeGreaterThan(0);
    expect(audit.softenedText).not.toContain('token persistence layer');
  });

  test('ProvenanceSpecificityEngine: Permits high creative specificity in literary fiction', () => {
    const fictionProse = `
Dr. Thorne examined the sheared pins of the deadbolt along the brick conduit.
    `;
    const audit = ProvenanceSpecificityEngine.extractAndAuditClaims(
      fictionProse,
      ['three people discover forced door'],
      'LITERARY_FICTION'
    );

    expect(audit.auditPassed).toBe(true);
    expect(audit.budgetExceeded).toBe(false);
  });

  test('WritingOSHealthDashboard: Computes comprehensive 10 metrics with high distinctiveness on calibrated multi-POV', () => {
    const multiPOVText = `
Dr. Thorne crouched by the jamb, running structural calculations in his head.
Branigan kept his eyes on the fatal funnel, carbine tight to his ribs.
Kip hissed from the drain, smelling red phosphorus matches.
    `;

    const metrics = WritingOSHealthDashboard.computeHealthMetrics(multiPOVText, 35, {
      isFiction: true,
      isMultiPOV: true,
      genre: 'TACTICAL_ADVENTURE'
    });

    expect(metrics.povDistinctiveness).toBe(0.92);
    expect(metrics.creativeDiversityScore).toBe(0.90);
    expect(metrics.unsupportedSpecificityRate).toBe(0.0);
    expect(metrics.compressionExpansionError).toBeLessThan(0.3);
  });
});
