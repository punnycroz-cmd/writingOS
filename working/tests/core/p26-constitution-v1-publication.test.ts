import { describe, expect, test } from 'bun:test';
import { ConstitutionV1 } from '../../src/core/constitution-v1';

describe('Writing OS P26 — Constitution v1.0 Publication Suite', () => {

  describe('1. Constitution v1.0 Metadata & Preamble', () => {
    test('Verifies Version 1.0.0, Effective Date, and Preamble', () => {
      expect(ConstitutionV1.VERSION).toBe('1.0.0');
      expect(ConstitutionV1.EFFECTIVE_DATE).toBe('2026-08-27');
      expect(ConstitutionV1.PREAMBLE.length).toBeGreaterThan(50);
    });
  });

  describe('2. Core Articles & Governance Charters Publishing', () => {
    test('Verifies that all 8 Core Articles and 2 Governance Charters are published', () => {
      expect(ConstitutionV1.CORE_ARTICLES.length).toBe(8);
      expect(ConstitutionV1.GOVERNANCE_CHARTERS.length).toBe(2);

      const articleIds = ConstitutionV1.CORE_ARTICLES.map(a => a.articleId);
      expect(articleIds).toEqual([
        'ARTICLE_I', 'ARTICLE_II', 'ARTICLE_III', 'ARTICLE_IV',
        'ARTICLE_V', 'ARTICLE_VI', 'ARTICLE_VII', 'ARTICLE_VIII',
      ]);

      const charterIds = ConstitutionV1.GOVERNANCE_CHARTERS.map(c => c.charterId);
      expect(charterIds).toContain('CHARTER_A_REGISTER_AND_TENANT_ISOLATION');
      expect(charterIds).toContain('CHARTER_B_EVALUATION_AND_METRICS_GOVERNANCE');
    });
  });

  describe('3. Formal Exception Registry Resolution', () => {
    test('Verifies the 3 formal exception conditions are recorded', () => {
      const exceptions = ConstitutionV1.FORMAL_EXCEPTIONS;

      expect(exceptions.length).toBe(3);

      const excNarrative = exceptions.find(e => e.exceptionId.includes('NARRATIVE_SUBJECTIVITY'));
      expect(excNarrative?.targetArticleId).toBe('ARTICLE_I');
      expect(excNarrative?.properInterpretation).toContain('narrative intent without corrupting the objective world state');

      const excMacro = exceptions.find(e => e.exceptionId.includes('MACRO_RESTRUCTURE'));
      expect(excMacro?.targetArticleId).toBe('ARTICLE_VII');

      const excInvention = exceptions.find(e => e.exceptionId.includes('CREATIVE_INVENTION'));
      expect(excInvention?.targetArticleId).toBe('ARTICLE_IV');
    });
  });

  describe('4. Amendment & Change-Control Protocol', () => {
    test('Rejects amendments lacking evidence cards, counterevidence audits, or stress tests', () => {
      // 1. Rejected: No evidence cards
      const badAmendment1 = ConstitutionV1.validateProposedAmendment({
        amendmentId: 'AMD-001',
        type: 'MINOR',
        targetArticleId: 'ARTICLE_I',
        proposedStatement: 'Tweak statement',
        evidenceCardIds: [],
        counterevidenceAuditCompleted: true,
        adversarialStressTestPassed: true,
        explicitApprovalGranted: true,
      });
      expect(badAmendment1.approved).toBe(false);
      expect(badAmendment1.rejectionReason).toContain('Evidence Registry Cards');

      // 2. Rejected: No stress test
      const badAmendment2 = ConstitutionV1.validateProposedAmendment({
        amendmentId: 'AMD-002',
        type: 'MINOR',
        targetArticleId: 'ARTICLE_II',
        proposedStatement: 'Tweak statement',
        evidenceCardIds: ['EVID_01'],
        counterevidenceAuditCompleted: true,
        adversarialStressTestPassed: false,
        explicitApprovalGranted: true,
      });
      expect(badAmendment2.approved).toBe(false);
      expect(badAmendment2.rejectionReason).toContain('adversarial stress testing');

      // 3. Approved: Fully compliant
      const validAmendment = ConstitutionV1.validateProposedAmendment({
        amendmentId: 'AMD-003',
        type: 'PATCH',
        targetArticleId: 'ARTICLE_VIII',
        proposedStatement: 'Perfect statement clarification',
        evidenceCardIds: ['EVID_P25'],
        counterevidenceAuditCompleted: true,
        adversarialStressTestPassed: true,
        explicitApprovalGranted: true,
      });
      expect(validAmendment.approved).toBe(true);
    });
  });

  describe('5. Artifact Role Registry (final.txt)', () => {
    test('Confirms final.txt is officially classified as a Non-Authoritative Fiction Stress Fixture', () => {
      const fixture = ConstitutionV1.ARTIFACT_ROLE_REGISTRY['final.txt'];

      expect(fixture).toBeDefined();
      expect(fixture.artifactType).toBe('FICTION_STRESS_FIXTURE');
      expect(fixture.governingStatus).toBe('NON_AUTHORITATIVE_OBSERVATIONAL_FIXTURE');
      expect(fixture.description).toContain('Not an acceptance criterion');
    });
  });
});
