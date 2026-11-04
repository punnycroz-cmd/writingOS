import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { TaskInterpreter } from '../../src/core/task-interpreter';
import { RequirementConflictEngine } from '../../src/core/requirement-conflict';
import { StateCompletenessEngine } from '../../src/core/state-completeness';
import { DocumentStateManager } from '../../src/core/document-state-manager';
import { TransactionManager } from '../../src/core/transaction-manager';

describe('Writing OS P7 — Open-World Core Validation Suite', () => {

  describe('1. Natural Language Task Interpretation & Ambiguity Detection', () => {
    test('Intercepts vague prompt with CLARIFICATION_HANDOFF and compiles rich prompt into structured contract', () => {
      // Case A: Vague Prompt without criteria
      const vagueResult = TaskInterpreter.interpret('Make this better');
      expect(vagueResult.status).toBe('REQUIRES_CLARIFICATION_HANDOFF');
      expect(vagueResult.confidenceScore).toBeLessThan(0.50);
      expect(vagueResult.detectedAmbiguities.length).toBeGreaterThan(0);

      // Case B: Rich Business Prompt
      const richPrompt = 'Turn these meeting notes into an executive memo for investors explaining our quarterly revenue growth';
      const richResult = TaskInterpreter.interpret(richPrompt);
      expect(richResult.status).toBe('CONTRACT_COMPILED');
      expect(richResult.inferredRegister).toBe('business');
      expect(richResult.inferredTaskType).toBe('synthesis');
      expect(richResult.contract?.register).toBe('business');
      expect(richResult.confidenceScore).toBeGreaterThanOrEqual(0.85);
    });
  });

  describe('2. Requirement Conflict Engine', () => {
    test('Detects mutually exclusive constraint pairs and halts with HANDOFF_REQUIREMENT_CONFLICT', () => {
      // Brevity vs Completeness conflict
      const conflictPrompt1 = 'Make this shorter and reduce length, but do not remove any information or details.';
      const report1 = RequirementConflictEngine.auditPromptConflicts(conflictPrompt1);

      expect(report1.hasConflict).toBe(true);
      expect(report1.recommendedAction).toBe('HALT_AND_HANDOFF');
      expect(report1.conflictingPairs[0].conflictType).toBe('BREVITY_VS_COMPLETENESS');

      // Verbatim vs Heavy Rewrite conflict
      const conflictPrompt2 = 'Use exact source wording verbatim, but rewrite substantially with a new tone.';
      const report2 = RequirementConflictEngine.auditPromptConflicts(conflictPrompt2);

      expect(report2.hasConflict).toBe(true);
      expect(report2.conflictingPairs[0].conflictType).toBe('EXACT_VERBATIM_VS_HEAVY_REWRITE');
    });
  });

  describe('3. State Missingness & Temporal Stale-Conflict Resolution', () => {
    test('Emits STATE_INSUFFICIENT when prerequisite chapter history is missing', () => {
      const graph = new UniversalStateGraph();
      // Only scene_1 is registered
      graph.registerEntity({ id: 'scene_1', entityType: 'GENERAL', displayName: 'Scene 1', properties: {} });

      const taskResult = TaskInterpreter.interpret('Continue Chapter 8 after the bridge explosion');
      expect(taskResult.contract).toBeDefined();

      const audit = StateCompletenessEngine.auditContinuityCompleteness(taskResult.contract!, graph, 8);
      expect(audit.isSufficient).toBe(false);
      expect(audit.status).toBe('STATE_INSUFFICIENT');
      expect(audit.missingPrerequisites.length).toBeGreaterThan(0);
      expect(audit.explanation).toContain('refuses to hallucinate ungrounded continuity');
    });

    test('Resolves temporal state conflict in favor of latest authoritative evidence', () => {
      const graph = new UniversalStateGraph();
      graph.registerEntity({
        id: 'elias',
        entityType: 'CHARACTER',
        displayName: 'Elias',
        properties: { maren_trust: 0.95 },
      });

      // Historical trust was 0.95, but latest observed scene witnessed betrayal (0.05)
      const resolution = StateCompletenessEngine.resolveTemporalConflict('elias', 'maren_trust', 0.95, 0.05, graph);
      expect(resolution.hasConflict).toBe(true);
      expect(resolution.resolvedValue).toBe(0.05);
    });
  });

  describe('4. Cross-Document State Propagation & Concurrency OCC', () => {
    test('Propagates verified facts between documents while blocking unverified LLM_PROPOSED claims', () => {
      const graph = new UniversalStateGraph();
      graph.registerEntity({ id: 'project_alpha', entityType: 'GENERAL', displayName: 'Project Alpha', properties: {} });

      const docManager = new DocumentStateManager(graph);
      docManager.registerDocument({ documentId: 'doc_tech_spec', title: 'Technical Spec', content: 'Base content' });
      docManager.registerDocument({ documentId: 'doc_user_guide', title: 'User Guide', content: 'Base content' });

      // Valid SOURCE_VERIFIED fact propagation
      const propResult1 = docManager.propagateFact({
        sourceDocId: 'doc_tech_spec',
        targetDocId: 'doc_user_guide',
        entityId: 'project_alpha',
        property: 'port_number',
        value: 8080,
        authority: 'SOURCE_VERIFIED',
      });
      expect(propResult1.allowed).toBe(true);
      expect(graph.getEntity('project_alpha')?.properties.get('port_number')?.value).toBe(8080);

      // Unverified LLM_PROPOSED claim blocked from cross-document canon
      const propResult2 = docManager.propagateFact({
        sourceDocId: 'doc_scratch',
        targetDocId: 'doc_user_guide',
        entityId: 'project_alpha',
        property: 'quantum_encryption',
        value: true,
        authority: 'LLM_PROPOSED',
      });
      expect(propResult2.allowed).toBe(false);
      expect(graph.getEntity('project_alpha')?.properties.has('quantum_encryption')).toBe(false);
    });

    test('Prevents silent overwrite when concurrent revision commits on a stale snapshot (OCC)', () => {
      const graph = new UniversalStateGraph();
      const docManager = new DocumentStateManager(graph);
      docManager.registerDocument({ documentId: 'doc_shared', title: 'Shared Doc', content: 'Version 1 text' });

      // User A and User B both read snapshot at v1
      const snapshotA = docManager.getDocumentSnapshot('doc_shared');
      const snapshotB = docManager.getDocumentSnapshot('doc_shared');
      expect(snapshotA?.currentVersionId).toBe(1);
      expect(snapshotB?.currentVersionId).toBe(1);

      // User A commits first -> succeeds and advances to v2
      const commitA = docManager.commitRevision({
        documentId: 'doc_shared',
        baseVersionId: 1,
        updatedContent: 'User A revised text',
      });
      expect(commitA.success).toBe(true);
      expect(commitA.committedVersionId).toBe(2);

      // User B attempts to commit with stale base v1 -> blocked by OCC
      const commitB = docManager.commitRevision({
        documentId: 'doc_shared',
        baseVersionId: 1,
        updatedContent: 'User B conflicting text',
      });
      expect(commitB.success).toBe(false);
      expect(commitB.status).toBe('CONCURRENCY_CONFLICT_DETECTED');
      expect(commitB.explanation).toContain('Attempted commit on stale snapshot');
    });
  });

  describe('5. Crash Consistency & Transaction Rollback', () => {
    test('Guarantees atomic rollback to exact pre-crash state graph snapshot', () => {
      const graph = new UniversalStateGraph();
      graph.registerEntity({
        id: 'user_account',
        entityType: 'GENERAL',
        displayName: 'Account',
        authorityLevel: 'OBSERVED',
        properties: { balance: 1000 },
      });

      const txManager = new TransactionManager(graph);
      txManager.beginTransaction('tx_generation_101');

      // Mid-generation state modification
      graph.setProperty('user_account', 'balance', 500, 'OBSERVED', []);
      expect(graph.getEntity('user_account')?.properties.get('balance')?.value).toBe(500);

      // Simulated process crash / execution exception -> Rollback transaction
      const rollbackSuccess = txManager.rollbackTransaction('tx_generation_101');
      expect(rollbackSuccess).toBe(true);

      // State is restored to exact snapshot
      expect(graph.getEntity('user_account')?.properties.get('balance')?.value).toBe(1000);
    });
  });
});
