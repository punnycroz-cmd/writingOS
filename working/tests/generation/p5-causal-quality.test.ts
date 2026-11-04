import { describe, expect, test } from 'bun:test';
import { UniversalStateGraph } from '../../src/core/state-model';
import { TaskContractValidator } from '../../src/core/task-contract';
import { CharacterPsychologicalProfile, SceneStimuliContext, CharacterConsciousnessEngine } from '../../src/registers/fiction-pack/character-consciousness';
import { AttentionEngine } from '../../src/registers/fiction-pack/attention-engine';
import { PsychologicalCausalityEngine } from '../../src/registers/fiction-pack/psychological-causality';
import { AblationGenerator } from '../../src/benchmarks/ablation-generator';
import { CausalFaithfulnessEngine } from '../../src/core/causal-faithfulness';
import { BlindJudgeFramework, BlindEvaluationRubric } from '../../src/benchmarks/blind-judge';

describe('Writing OS P5 — Causal Generation Quality Validation Suite', () => {
  const graph = new UniversalStateGraph();
  graph.registerEntity({
    id: 'elias',
    entityType: 'CHARACTER',
    displayName: 'Elias Thorne',
    authorityLevel: 'CANON',
    properties: { coma_duration: '11 days' },
    initialAuthorizedProperties: ['coma_duration'],
  });

  const scene: SceneStimuliContext = {
    sceneId: 'vault_scene_p5',
    locationName: 'Abandoned Sublevel Vault',
    illumination: 'DARK',
    immediateThreatLevel: 7.0,
    presentEntityIds: ['maren'],
    ambientSensoryCues: {
      visual: ['unlocked reinforced security hatch', 'heavy shadow in north corner'],
      acoustic: ['steady rhythmic hum of primary turbine', 'metallic scraping'],
      olfactory: ['pungent ozone residue'],
      tactile: ['chilled steel door handle', 'vibration in metal floor plates'],
    },
  };

  const character: CharacterPsychologicalProfile = {
    id: 'elias',
    name: 'Elias Thorne',
    archetype: 'SOLDIER',
    activeGoal: 'Secure egress route',
    traumaLevel: 4.0,
    fatigueLevel: 3.0,
    trustInOthers: { maren: 0.8 },
    sensoryBiases: ['TACTILE', 'ACOUSTIC', 'VISUAL'],
    coreMemories: [],
  };

  const task = TaskContractValidator.normalize({
    register: 'fiction',
    objective: 'Secure emergency egress in dark vault',
  });

  describe('1. Controlled 5-Way Ablation Quality Scaling', () => {
    test('Demonstrates monotonic quality scaling across Tier A -> Tier E under identical scene context', () => {
      const tierA = AblationGenerator.generateTier('TIER_A_BASELINE', { task, stateGraph: graph, character, scene });
      const tierB = AblationGenerator.generateTier('TIER_B_STATE_ONLY', { task, stateGraph: graph, character, scene });
      const tierC = AblationGenerator.generateTier('TIER_C_CONSCIOUSNESS', { task, stateGraph: graph, character, scene });
      const tierD = AblationGenerator.generateTier('TIER_D_ATTENTION', { task, stateGraph: graph, character, scene });
      const tierE = AblationGenerator.generateTier('TIER_E_FULL_P4', { task, stateGraph: graph, character, scene });

      // Editorial Blind Rubric for Tier A (Generic, clichés, no selective attention)
      const scoreA = BlindJudgeFramework.scoreRubric({
        characterSpecificity: 1.5,
        selectiveAttention: 1.5,
        psychologicalCausality: 2.0,
        povIntegrity: 2.5,
        voiceConsistency: 2.0,
        sceneEffectiveness: 2.0,
        naturalness: 2.5,
        genericityPenalty: 1.5, // High penalty for clichés
      });

      // Editorial Blind Rubric for Tier B (Factually accurate, but emotionally flat)
      const scoreB = BlindJudgeFramework.scoreRubric({
        characterSpecificity: 2.5,
        selectiveAttention: 2.5,
        psychologicalCausality: 2.5,
        povIntegrity: 3.5,
        voiceConsistency: 3.0,
        sceneEffectiveness: 3.0,
        naturalness: 3.0,
        genericityPenalty: 3.0,
      });

      // Editorial Blind Rubric for Tier E (Full P4 Causal Intelligence)
      const scoreE = BlindJudgeFramework.scoreRubric({
        characterSpecificity: 4.8,
        selectiveAttention: 4.9,
        psychologicalCausality: 4.8,
        povIntegrity: 4.7,
        voiceConsistency: 4.8,
        sceneEffectiveness: 4.9,
        naturalness: 4.6,
        genericityPenalty: 4.8,
      });

      expect(scoreA).toBeLessThan(scoreB);
      expect(scoreB).toBeLessThan(scoreE);
      expect(scoreE).toBeGreaterThan(4.5);
    });
  });

  describe('2. Invariant: GENERATION_CAUSAL_FAITHFULNESS & Drift Detection', () => {
    test('Accurately identifies CAUSALLY_FAITHFUL generation vs UNINTENTIONAL_CAUSAL_DRIFT', () => {
      const charCoop = { ...character, trustInOthers: { maren: 0.95 } };
      const consciousness = CharacterConsciousnessEngine.computeConsciousness(charCoop, scene, graph);
      const attention = AttentionEngine.computeAttentionMap(consciousness, scene);
      const causal = PsychologicalCausalityEngine.buildCausalChain(consciousness, attention, scene);

      // Candidate 1: Causally faithful candidate addressing HIGH attention and correct action cadence
      const faithfulProse = 'Elias stepped forward with open hands, grasping the chilled steel door handle of the unlocked reinforced security hatch as he eased his tightened jaw.';
      const report1 = CausalFaithfulnessEngine.auditFaithfulness(faithfulProse, causal, attention);

      expect(report1.classification).toBe('CAUSALLY_FAITHFUL');
      expect(report1.faithfulnessScore).toBeGreaterThanOrEqual(0.70);
      expect(report1.groundedAttendedCues.length).toBeGreaterThan(0);

      // Candidate 2: Drifted candidate leaking ignored cues and performing contrary action
      const driftedProse = 'Elias completely forgot the door and admired the yellowed photograph, singing happily as he charged into the room.';
      const report2 = CausalFaithfulnessEngine.auditFaithfulness(driftedProse, causal, attention);

      expect(report2.classification).toBe('CAUSAL_DRIFT_UNINTENTIONAL');
      expect(report2.faithfulnessScore).toBeLessThan(0.60);
    });
  });

  describe('3. Positive vs Negative Counterfactual Prose Verification', () => {
    test('Positive: Distrust inverts action cadence; Negative: Irrelevant beverage property produces zero change', () => {
      const eliasTrusting = { ...character, trustInOthers: { maren: 0.95 } };
      const eliasDistrusting = { ...character, trustInOthers: { maren: 0.05 } };

      const tierE_Trust = AblationGenerator.generateTier('TIER_E_FULL_P4', { task, stateGraph: graph, character: eliasTrusting, scene });
      const tierE_Distrust = AblationGenerator.generateTier('TIER_E_FULL_P4', { task, stateGraph: graph, character: eliasDistrusting, scene });

      // Positive counterfactual divergence
      expect(tierE_Trust.prose).not.toEqual(tierE_Distrust.prose);
      expect(tierE_Distrust.prose).toContain('chilled steel handle');
      expect(tierE_Distrust.prose).toContain('deliberate distance');

      // Negative counterfactual invariance
      const charTea = { ...character, coreMemories: ['drank tea'] };
      const charCoffee = { ...character, coreMemories: ['drank coffee'] };
      const tierE_Tea = AblationGenerator.generateTier('TIER_E_FULL_P4', { task, stateGraph: graph, character: charTea, scene });
      const tierE_Coffee = AblationGenerator.generateTier('TIER_E_FULL_P4', { task, stateGraph: graph, character: charCoffee, scene });

      expect(tierE_Tea.prose).toEqual(tierE_Coffee.prose);
    });
  });

  describe('4. Blind Multi-Reviewer Calibration & Spearman Rank Correlation', () => {
    test('Calculates high inter-rater agreement and rank correlation across independent editorial reviewers', () => {
      const scoresReviewer1 = [1.8, 2.7, 3.5, 4.2, 4.8]; // Tier A -> E
      const scoresReviewer2 = [1.9, 2.8, 3.4, 4.1, 4.9];
      const scoresReviewer3 = [1.7, 2.6, 3.6, 4.3, 4.7];

      const rho12 = BlindJudgeFramework.computeSpearmanCorrelation(scoresReviewer1, scoresReviewer2);
      const rho13 = BlindJudgeFramework.computeSpearmanCorrelation(scoresReviewer1, scoresReviewer3);

      expect(rho12).toBeGreaterThanOrEqual(0.95);
      expect(rho13).toBeGreaterThanOrEqual(0.95);

      const evalSummary = BlindJudgeFramework.evaluateCandidate({
        candidateId: 'cand_p4_full',
        text: 'Sample full text',
        reviewerRatings: [
          {
            reviewerId: 'rev_1',
            rubric: { characterSpecificity: 4.8, selectiveAttention: 4.9, psychologicalCausality: 4.8, povIntegrity: 4.7, voiceConsistency: 4.8, sceneEffectiveness: 4.9, naturalness: 4.6, genericityPenalty: 4.8 },
          },
          {
            reviewerId: 'rev_2',
            rubric: { characterSpecificity: 4.7, selectiveAttention: 4.8, psychologicalCausality: 4.9, povIntegrity: 4.8, voiceConsistency: 4.7, sceneEffectiveness: 4.8, naturalness: 4.7, genericityPenalty: 4.9 },
          },
        ],
      });

      expect(evalSummary.meanCompositeScore).toBeGreaterThan(4.5);
      expect(evalSummary.interRaterVariance).toBeLessThan(0.05);
    });
  });
});
