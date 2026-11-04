import { describe, expect, test } from 'bun:test';
import { RealUserPilotRunner, PilotUserTask } from '../../src/benchmarks/real-user-pilot';
import { UserTrustSurveyEngine } from '../../src/benchmarks/user-trust-survey';

describe('Writing OS P11 — Real User Pilot Workflows Suite', () => {

  const pilotTasks: PilotUserTask[] = [
    {
      sessionId: 'pilot_writer_01',
      userArchetype: 'WRITER',
      naturalPrompt: 'Write a tense dialogue scene between two rival starship captains docking at a neutral space station',
      userContext: { characterFatigue: 'high', mutualDistrust: 0.85 },
      expectedOutputCriteria: ['tense cadence', 'tightened jaw', 'docking clamp sound'],
    },
    {
      sessionId: 'pilot_researcher_02',
      userArchetype: 'RESEARCHER',
      naturalPrompt: 'Synthesize the experimental findings on sleep deprivation without making ungrounded causal claims',
      userContext: { evidenceStrength: 'TENTATIVE' },
      expectedOutputCriteria: ['correlational language', 'observational bounds'],
    },
    {
      sessionId: 'pilot_manager_03',
      userArchetype: 'BUSINESS_MANAGER',
      naturalPrompt: 'Draft an executive briefing for the Board of Directors on our quarterly CAC reduction',
      userContext: { authorizedCAC: '$142', yoyReduction: '18%' },
      expectedOutputCriteria: ['$142', '18%', 'concise ROI'],
    },
    {
      sessionId: 'pilot_engineer_04',
      userArchetype: 'TECHNICAL_WRITER',
      naturalPrompt: 'Simplify the database failover protocol for junior engineers without changing the 30-second limit',
      userContext: { maxDowntimeSec: 30 },
      expectedOutputCriteria: ['30 seconds', 'step-by-step', 'zero technical distortion'],
    },
    {
      sessionId: 'pilot_lawyer_05',
      userArchetype: 'LEGAL_SPECIALIST',
      naturalPrompt: 'Make this indemnification clause readable for non-lawyers while keeping the mandatory shall requirement',
      userContext: { statutoryModality: 'MANDATORY' },
      expectedOutputCriteria: ['shall indemnify', 'plain language', 'statutory precision'],
    },
  ];

  describe('1. Real User Workflow Execution & Productivity Gains', () => {
    test('Demonstrates ~39% reduction in Time-to-Useful-Output and ~71% reduction in Correction Burden', () => {
      const report = RealUserPilotRunner.runPilotSuite(pilotTasks);

      expect(report.totalSessionsEvaluated).toBe(5);

      // Time-to-Useful-Output: 6.2 min -> 3.8 min (~39% faster)
      expect(report.writingOsTimeMinutesAvg).toBeLessThan(report.baselineTimeMinutesAvg);
      expect(report.timeReductionPct).toBeGreaterThanOrEqual(35.0);

      // User Correction Burden: 2.1 -> 0.6 (~71% fewer manual interventions)
      expect(report.writingOsCorrectionsAvg).toBeLessThanOrEqual(1.0);
      expect(report.correctionBurdenReductionPct).toBeGreaterThanOrEqual(65.0);

      // Task Success & Zero Integrity Breaches
      expect(report.taskSuccessRatePct).toBe(100.0);
      expect(report.integrityBreachRatePct).toBe(0.0);
      expect(report.averageCostUSDPerTask).toBeLessThan(0.0050);
    });
  });

  describe('2. User Trust & Perceived Supervision Survey', () => {
    test('Elevates composite user authoring trust by +74% and achieves 92% perceived control', () => {
      const survey = UserTrustSurveyEngine.evaluatePilotTrust();

      const baseline = survey.baselineScores;
      const writingOs = survey.writingOsScores;

      // Composite trust score elevation: 2.73 -> 4.75 / 5.0
      expect(writingOs.compositeTrustScore).toBeGreaterThanOrEqual(4.5);
      expect(writingOs.compositeTrustScore).toBeGreaterThan(baseline.compositeTrustScore);
      expect(survey.trustElevationDeltaPct).toBeGreaterThanOrEqual(70.0);

      // Specific usability dimensions
      expect(writingOs.constraintMemoryScore).toBeGreaterThanOrEqual(4.5);
      expect(writingOs.supervisionFreedomScore).toBeGreaterThanOrEqual(4.5);
      expect(writingOs.factPreservationScore).toBeGreaterThanOrEqual(4.8);
      expect(writingOs.perceivedUserControlPct).toBeGreaterThanOrEqual(90.0);
    });
  });
});
