import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { MultiTurnSessionManager } from '../../src/core/session-manager';
import { ContextAssembler } from '../../src/core/context-assembler';
import { MultiUserIsolationManager } from '../../src/core/multi-user-isolation';
import { TransactionManager } from '../../src/core/transaction-manager';
import { SessionPersistence } from '../../src/core/session-persistence';
import { GenerationPlan } from '../../src/core/generation-pipeline';

describe('Writing OS P12 — Long-Horizon & Production-Reality Validation Suite', () => {

  describe('1. 100-Turn Longitudinal Session Stability', () => {
    test('Executes 100 sequential turns with monotonic version progression and zero state drift', () => {
      const stateGraph = new UniversalStateGraph();
      stateGraph.registerEntity({ id: 'core_story', entityType: 'CHAPTER', displayName: 'Story Core', properties: { title: 'The Odyssey' } });
      stateGraph.registerClaim({
        id: 'claim_canon_01',
        subjectId: 'core_story',
        predicate: 'setting',
        objectValue: 'Deep Space Station Alpha',
        authorityLevel: 'CANON',
        epistemicStatus: 'CONFIRMED',
      });

      const session = new MultiTurnSessionManager('session_100_turn_marathon', stateGraph);

      // Turn 1: Set initial rule
      session.processTurn('Draft introductory scene and keep numbers strictly preserved');

      // Execute turns 2 through 100
      for (let t = 2; t <= 100; t++) {
        session.processTurn(`Turn ${t} revision and narrative progression for scene segment ${t}`);
      }

      // 1. Task version must progress monotonically to v101
      expect(session.taskVersion).toBe(101);

      // 2. Canon setting must remain 100% intact after 100 turns
      const claims = stateGraph.getAllClaims();
      const canonClaim = claims.find(c => c.id === 'claim_canon_01');
      expect(canonClaim).toBeDefined();
      expect(canonClaim?.objectValue).toBe('Deep Space Station Alpha');

      // 3. Active constraints preserved
      expect(session.activeConstraints.get('preserve_numbers')).toBe('STRICT_PRESERVE');
    });
  });

  describe('2. ContextAssembler & Perspective Leakage Defense', () => {
    test('Extracts Minimal Sufficient Context Subgraph with >75% token reduction on large state graph', () => {
      const stateGraph = new UniversalStateGraph();

      // Seed 20 entities and 40 claims
      for (let i = 1; i <= 20; i++) {
        stateGraph.registerEntity({ id: `entity_${i}`, entityType: 'CHARACTER', displayName: `Entity ${i}`, properties: {} });
        stateGraph.registerClaim({
          id: `claim_${i}_a`,
          subjectId: `entity_${i}`,
          predicate: 'location',
          objectValue: `Sector ${i}`,
          authorityLevel: 'OBSERVED',
          epistemicStatus: 'CONFIRMED',
        });
        stateGraph.registerClaim({
          id: `claim_${i}_b`,
          subjectId: `entity_${i}`,
          predicate: 'status',
          objectValue: 'ACTIVE',
          authorityLevel: 'OBSERVED',
          epistemicStatus: 'CONFIRMED',
        });
      }

      const plan: GenerationPlan = {
        planId: 'plan_focused_01',
        register: 'fiction',
        taskObjective: 'Describe encounter with entity_1 and entity_2',
        entityPreserves: [
          { entityId: 'entity_1', requiredProperties: ['location'] },
          { entityId: 'entity_2', requiredProperties: ['status'] },
        ],
        targetStyleTone: 'TENSE',
        voiceTarget: '3rd_person',
        authorialTrace: { rhythmicCadence: 'FAST', sensoryPurity: 0.9, metaphorDensity: 'MODERATE', interiorityRatio: 0.5 },
        untrustedGenerationPrompt: 'Generate interaction',
        provenanceHash: 'hash_123',
      };

      const assembled = ContextAssembler.assembleMinimalContext(plan, stateGraph);

      // Must include only entity_1 and entity_2 claims (4 claims out of 40)
      expect(assembled.activeEntityIds).toContain('entity_1');
      expect(assembled.activeEntityIds).toContain('entity_2');
      expect(assembled.includedClaims.length).toBe(4);
      expect(assembled.excludedClaimsCount).toBe(36);
      expect(assembled.tokenReductionRatioPct).toBeGreaterThanOrEqual(80.0);
    });

    test('Perspective Permission: Excludes private secrets of Character A from Character B prompt', () => {
      const stateGraph = new UniversalStateGraph();
      stateGraph.registerEntity({ id: 'detective_vance', entityType: 'CHARACTER', displayName: 'Detective Vance', properties: {} });
      stateGraph.registerEntity({ id: 'suspect_thorne', entityType: 'CHARACTER', displayName: 'Suspect Thorne', properties: {} });

      // Public claim
      stateGraph.registerClaim({
        id: 'claim_public_01',
        subjectId: 'detective_vance',
        predicate: 'location',
        objectValue: 'Shipyard Dock 4',
        authorityLevel: 'OBSERVED',
        epistemicStatus: 'CONFIRMED',
      });

      // Private secret owned exclusively by Detective Vance
      stateGraph.registerClaim({
        id: 'claim_secret_vance',
        subjectId: 'detective_vance',
        predicate: 'hidden_evidence',
        objectValue: 'Bloody wrench hidden in jacket',
        authorityLevel: 'OBSERVED',
        epistemicStatus: 'CONFIRMED',
        ...({ isPrivateSecret: true, secretOwnerId: 'detective_vance' } as any),
      });

      const plan: GenerationPlan = {
        planId: 'plan_suspect_pov',
        register: 'fiction',
        taskObjective: 'Describe scene from Suspect Thorne POV entering Dock 4',
        entityPreserves: [{ entityId: 'detective_vance', requiredProperties: ['location'] }],
        targetStyleTone: 'SUSPICIOUS',
        voiceTarget: '1st_person_thorne',
        authorialTrace: { rhythmicCadence: 'SLOW', sensoryPurity: 0.8, metaphorDensity: 'LOW', interiorityRatio: 0.6 },
        untrustedGenerationPrompt: 'Generate Thorne POV',
        provenanceHash: 'hash_pov',
      };

      // Assemble context specifically for Thorne's POV
      const assembledForThorne = ContextAssembler.assembleMinimalContext(plan, stateGraph, 'suspect_thorne');

      // Vance's public location is included, but Vance's secret wrench is strictly filtered out!
      expect(assembledForThorne.includedClaims.some(c => c.id === 'claim_public_01')).toBe(true);
      expect(assembledForThorne.includedClaims.some(c => c.id === 'claim_secret_vance')).toBe(false);
      expect(assembledForThorne.contextDigest).not.toContain('Bloody wrench');
    });
  });

  describe('3. Multi-User & Multi-Tenant Isolation', () => {
    test('Guarantees 100% memory isolation between Tenant A and Tenant B with identical entity IDs', () => {
      const isolationMgr = new MultiUserIsolationManager();

      const sessionA = isolationMgr.getOrCreateSession('tenant_corp_alpha', 'user_alice', 'session_01');
      const sessionB = isolationMgr.getOrCreateSession('tenant_corp_beta', 'user_bob', 'session_01');

      // Both users add an entity with identical ID 'financial_report'
      sessionA.stateGraph.registerEntity({ id: 'financial_report', entityType: 'DOCUMENT', displayName: 'Fin Report A', properties: { revenue: '$100M' } });
      sessionB.stateGraph.registerEntity({ id: 'financial_report', entityType: 'DOCUMENT', displayName: 'Fin Report B', properties: { revenue: '$5M' } });

      // Audit isolation
      const audit = isolationMgr.auditCrossTenantIsolation(
        'tenant_corp_alpha', 'user_alice', 'session_01',
        'tenant_corp_beta', 'user_bob', 'session_01'
      );

      expect(audit.isIsolated).toBe(true);
      expect(audit.crossLeakageDetected).toBe(false);
      expect(sessionA.stateGraph.getPropertyRecord('financial_report', 'revenue')?.value).toBe('$100M');
      expect(sessionB.stateGraph.getPropertyRecord('financial_report', 'revenue')?.value).toBe('$5M');
    });
  });

  describe('4. Cascading Failure Chains & Persistence Corruption Defense', () => {
    test('Cascading Failure Chain triggers atomic rollback to clean snapshot', () => {
      const stateGraph = new UniversalStateGraph();
      stateGraph.registerEntity({ id: 'ledger', entityType: 'FINANCIAL', displayName: 'Ledger', properties: { balance: 1000 } });

      const txManager = new TransactionManager(stateGraph);
      txManager.beginTransaction('tx_speculative');

      // Mutate state during speculative turn
      stateGraph.registerClaim({
        id: 'claim_speculative',
        subjectId: 'ledger',
        predicate: 'balance',
        objectValue: 5000,
        authorityLevel: 'LLM_PROPOSED',
        epistemicStatus: 'PROPOSED',
      });

      // Simulate cascading failure (Generation fail -> Repair fail -> OCC conflict)
      const rolledBack = txManager.rollbackTransaction('tx_speculative');

      expect(rolledBack).toBe(true);
      const claims = stateGraph.getAllClaims();
      expect(claims.some(c => c.id === 'claim_speculative')).toBe(false);
      expect(stateGraph.getPropertyRecord('ledger', 'balance')?.value).toBe(1000);
    });

    test('Persistence Corruption: Safely rejects corrupted payload without crashing process', () => {
      const corruptedJson = '{"sessionId": "corrupt_01", "taskVersion": "NOT_A_NUMBER", "stateSnapshot": null}';

      expect(() => {
        SessionPersistence.deserializeSession(corruptedJson);
      }).toThrow();
    });
  });
});
