import { describe, expect, test } from 'bun:test';
import { ConstitutionStressTester } from '../../src/core/constitution-stress-tester';

describe('Writing OS P24 — Constitution Adversarial Stress & Minimality Suite', () => {

  describe('1. Minimality Distillation: 8 Core Invariants & 2 Governance Charters', () => {
    test('Distills exactly 8 Core Constitutional Invariants with universal load-bearing scope', () => {
      const coreArticles = ConstitutionStressTester.getCoreArticles();

      expect(coreArticles.length).toBe(8);

      const coreIds = coreArticles.map(a => a.articleId);
      expect(coreIds).toEqual([
        'ARTICLE_I', 'ARTICLE_II', 'ARTICLE_III', 'ARTICLE_IV',
        'ARTICLE_V', 'ARTICLE_VI', 'ARTICLE_VII', 'ARTICLE_VIII',
      ]);

      coreArticles.forEach(art => {
        expect(art.statement.length).toBeGreaterThan(20);
        expect(art.crossRegisterUniversality.length).toBeGreaterThan(15);
      });
    });

    test('Decouples operational tenancy and external metrics into Governance Charters', () => {
      const charters = ConstitutionStressTester.getGovernanceCharters();

      expect(charters.length).toBe(2);
      const charterIds = charters.map(c => c.charterId);

      expect(charterIds).toContain('CHARTER_REGISTER_AND_TENANT_ISOLATION');
      expect(charterIds).toContain('CHARTER_EVALUATION_AND_METRICS_GOVERNANCE');
    });
  });

  describe('2. Typed Priority Tier Conflict Resolution Matrix', () => {
    test('Resolves priority conflicts based on 6 formal Typed Priority Tiers', () => {
      // Tier 1 (Meaning/Truth: Art. I) beats Tier 6 (Style: Art. VIII)
      const res1 = ConstitutionStressTester.resolveTierConflict('ARTICLE_I', 'ARTICLE_VIII');
      expect(res1.winnerArticleId).toBe('ARTICLE_I');
      expect(res1.dominantTier).toBe('TIER_1_MEANING_AND_TRUTH_CONDITIONS');

      // Tier 2 (Authority: Art. II) beats Tier 4 (Handoff: Art. IV)
      const res2 = ConstitutionStressTester.resolveTierConflict('ARTICLE_II', 'ARTICLE_IV');
      expect(res2.winnerArticleId).toBe('ARTICLE_II');
      expect(res2.dominantTier).toBe('TIER_2_AUTHORITY_AND_PROVENANCE');

      // Tier 3 (Integrity: Art. III) beats Tier 6 (Revision: Art. VII)
      const res3 = ConstitutionStressTester.resolveTierConflict('ARTICLE_III', 'ARTICLE_VII');
      expect(res3.winnerArticleId).toBe('ARTICLE_III');
      expect(res3.dominantTier).toBe('TIER_3_INTEGRITY_AND_COMMITMENT');
    });
  });

  describe('3. Counterexample Adversarial Stress Attacks across All 6 Registers', () => {
    test('Survives 6 diverse adversarial counterexample scenarios without constitutional breakdown', () => {
      const results = ConstitutionStressTester.evaluateCounterexampleStressCases();

      expect(results.length).toBe(6);

      // Verify all 6 registers are covered
      const registers = results.map(r => r.register);
      expect(registers).toContain('FICTION');
      expect(registers).toContain('BUSINESS');
      expect(registers).toContain('ACADEMIC');
      expect(registers).toContain('TECHNICAL');
      expect(registers).toContain('LEGAL');
      expect(registers).toContain('GENERAL');

      // Verify all 6 scenarios resolved successfully
      results.forEach(res => {
        expect(res.resolvedWithoutConstitutionalViolation).toBe(true);
        expect(res.resolutionMechanism.length).toBeGreaterThan(20);
      });
    });
  });
});
