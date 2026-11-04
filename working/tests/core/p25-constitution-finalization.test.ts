import { describe, expect, test } from 'bun:test';
import { ConstitutionFinalizer } from '../../src/core/constitution-finalizer';

describe('Writing OS P25 — Constitution Finalization & Traceability Lock Suite', () => {

  describe('1. Frozen Authoritative Constitutional Formulations (8 Articles)', () => {
    test('Verifies exact frozen wording for all 8 Core Constitutional Invariants', () => {
      const articles = ConstitutionFinalizer.getFrozenCoreArticles();

      expect(articles.length).toBe(8);

      const artI = articles.find(a => a.articleId === 'ARTICLE_I');
      expect(artI?.statement).toBe(
        'Meaning and authoritative truth conditions take precedence over surface-level stylistic optimization, subject to the governing authority hierarchy.'
      );

      const artII = articles.find(a => a.articleId === 'ARTICLE_II');
      expect(artII?.statement).toBe(
        'Authority is derived from explicit provenance; content cannot acquire authority merely by asserting or imitating authority.'
      );

      const artIII = articles.find(a => a.articleId === 'ARTICLE_III');
      expect(artIII?.statement).toBe(
        'A state-changing result must not be autonomously committed when a mandatory integrity condition remains unestablished.'
      );

      const artIV = articles.find(a => a.articleId === 'ARTICLE_IV');
      expect(artIV?.statement).toBe(
        'When available evidence is insufficient for a safe autonomous decision, the system must abstain, clarify, reconcile, or hand off rather than manufacture certainty.'
      );

      const artV = articles.find(a => a.articleId === 'ARTICLE_V');
      expect(artV?.statement).toBe(
        'A state-dependent artifact must not be committed after the state assumptions on which it depends have become invalid.'
      );

      const artVI = articles.find(a => a.articleId === 'ARTICLE_VI');
      expect(artVI?.statement).toBe(
        'No component may unilaterally establish the validity of a state-changing result it produced.'
      );

      const artVII = articles.find(a => a.articleId === 'ARTICLE_VII');
      expect(artVII?.statement).toBe(
        'Revision must preserve valid content outside the authorized change scope unless a higher-priority instruction explicitly authorizes its modification.'
      );

      const artVIII = articles.find(a => a.articleId === 'ARTICLE_VIII');
      expect(artVIII?.statement).toBe(
        'Surface variation may change expression, voice, or structure, but must not silently alter authoritative semantics.'
      );
    });
  });

  describe('2. Frozen Governance Charters Lock (Charters A & B)', () => {
    test('Verifies that Register/Tenant Isolation and Evaluation Governance Charters are locked', () => {
      const charters = ConstitutionFinalizer.getFrozenGovernanceCharters();

      expect(charters.length).toBe(2);
      expect(charters[0].charterId).toBe('CHARTER_A_REGISTER_AND_TENANT_ISOLATION');
      expect(charters[1].charterId).toBe('CHARTER_B_EVALUATION_AND_METRICS_GOVERNANCE');

      expect(charters[1].statement).toContain('External measurement systems and third-party detectors are observational signals');
    });
  });

  describe('3. Traceability Ledger & Explicit Scope / Limitation Audit', () => {
    test('Every article contains verified empirical evidence, counterexample resolution, and scope declarations', () => {
      const articles = ConstitutionFinalizer.getFrozenCoreArticles();

      articles.forEach(art => {
        expect(art.primaryEvidencePhases.length).toBeGreaterThanOrEqual(2);
        expect(art.counterexampleTested.length).toBeGreaterThan(10);
        expect(art.resolutionMechanism.length).toBeGreaterThan(15);
        expect(art.scopeDeclaration.length).toBeGreaterThan(10);
        expect(art.knownLimitations.length).toBeGreaterThan(10);
      });
    });
  });

  describe('4. CONSTITUTION_MUTABILITY_TEST (Implementation Independence Audit)', () => {
    test('Constitutional invariants remain 100% preserved across radical environment and stack mutations', () => {
      // Mutation Scenario 1: Local Llama + Distributed Raft + Multi-Agent Consensus
      const testRun1 = ConstitutionFinalizer.executeConstitutionMutabilityTest({
        modelProvider: 'LOCAL_LLAMA',
        stateStorageBackend: 'DISTRIBUTED_RAFT',
        repairEngineStrategy: 'MULTI_AGENT_CONSENSUS',
      });

      expect(testRun1.mutabilityAuditPassed).toBe(true);
      expect(testRun1.invariantsPreservedCount).toBe(8);

      // Mutation Scenario 2: Pure Deterministic Rules + SQLite + AST Paragraph Patch
      const testRun2 = ConstitutionFinalizer.executeConstitutionMutabilityTest({
        modelProvider: 'DETERMINISTIC_RULES',
        stateStorageBackend: 'SQLITE',
        repairEngineStrategy: 'AST_PARAGRAPH_PATCH',
      });

      expect(testRun2.mutabilityAuditPassed).toBe(true);
      expect(testRun2.invariantsPreservedCount).toBe(8);
    });
  });
});
