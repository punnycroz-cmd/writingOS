import { describe, expect, test } from 'bun:test';
import { ConstitutionTraceabilityMatrix } from '../../src/core/constitution-candidate';

describe('Writing OS P23 — Constitution Candidate Set & Traceability Suite', () => {

  describe('1. 10 Candidate Articles Completeness & Scope Universality', () => {
    test('Verifies that all 10 Candidate Articles are formally formulated with universal scope', () => {
      const articles = ConstitutionTraceabilityMatrix.getAllArticlesSortedByPriority();

      expect(articles.length).toBe(10);

      const expectedArticleIds = [
        'ARTICLE_I', 'ARTICLE_II', 'ARTICLE_III', 'ARTICLE_IV', 'ARTICLE_V',
        'ARTICLE_VI', 'ARTICLE_VII', 'ARTICLE_VIII', 'ARTICLE_IX', 'ARTICLE_X',
      ];

      expect(articles.map(a => a.articleId)).toEqual(expectedArticleIds);

      // Verify each article applies to all authoring domains
      articles.forEach(article => {
        expect(article.scopeApplicability).toContain('FICTION');
        expect(article.scopeApplicability).toContain('ACADEMIC');
        expect(article.scopeApplicability).toContain('BUSINESS');
        expect(article.scopeApplicability).toContain('TECHNICAL');
        expect(article.scopeApplicability).toContain('LEGAL');
        expect(article.scopeApplicability).toContain('GENERAL');
      });
    });
  });

  describe('2. Conflict Priority Hierarchy Invariants', () => {
    test('Meaning/Truth (Art. I) outranks Handoff (Art. IV), Local Repair (Art. VII), and Surface Variation (Art. VIII)', () => {
      const artI = ConstitutionTraceabilityMatrix.getArticle('ARTICLE_I');
      const artII = ConstitutionTraceabilityMatrix.getArticle('ARTICLE_II');
      const artIV = ConstitutionTraceabilityMatrix.getArticle('ARTICLE_IV');
      const artVII = ConstitutionTraceabilityMatrix.getArticle('ARTICLE_VII');
      const artVIII = ConstitutionTraceabilityMatrix.getArticle('ARTICLE_VIII');

      expect(artI?.conflictPriorityRank).toBe(1);
      expect(artII?.conflictPriorityRank).toBe(2);
      expect(artIV?.conflictPriorityRank).toBe(4);
      expect(artVII?.conflictPriorityRank).toBe(7);
      expect(artVIII?.conflictPriorityRank).toBe(8);

      expect(artI!.conflictPriorityRank).toBeLessThan(artIV!.conflictPriorityRank);
      expect(artIV!.conflictPriorityRank).toBeLessThan(artVII!.conflictPriorityRank);
      expect(artVII!.conflictPriorityRank).toBeLessThan(artVIII!.conflictPriorityRank);
    });
  });

  describe('3. Multi-Phase Empirical Provenance Traceability', () => {
    test('Every candidate article traces to at least 2 distinct empirical validation phases', () => {
      const articles = ConstitutionTraceabilityMatrix.getAllArticlesSortedByPriority();

      articles.forEach(article => {
        expect(article.supportingEvidencePhases.length).toBeGreaterThanOrEqual(2);
        expect(article.epistemicRationale.length).toBeGreaterThan(15);
        expect(article.implementationIndependenceGuarantee.length).toBeGreaterThan(15);
      });

      // Special check for Article X (External Metrics) tracing to P21/P22
      const artX = ConstitutionTraceabilityMatrix.getArticle('ARTICLE_X');
      expect(artX?.supportingEvidencePhases).toContain('P21');
      expect(artX?.supportingEvidencePhases).toContain('P22');
    });
  });

  describe('4. Implementation-Independence Formulation', () => {
    test('Candidate statements do not contain hardcoded code constants or ephemeral policy thresholds', () => {
      const articles = ConstitutionTraceabilityMatrix.getAllArticlesSortedByPriority();

      articles.forEach(article => {
        const stmt = article.canonicalStatement;
        // Verify absence of ephemeral numerical policy thresholds in constitutional statements
        expect(stmt).not.toContain('0.80');
        expect(stmt).not.toContain('maxAttempts');
        expect(stmt).not.toContain('10000 tokens');
        expect(stmt).not.toContain('regex');
      });
    });
  });
});
