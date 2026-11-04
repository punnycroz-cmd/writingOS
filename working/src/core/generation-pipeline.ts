/**
 * Writing OS Core — Real Generation Pipeline (v5.4 Observability & Dual-Track Enabled)
 * Connects:
 * TaskContract -> GenerationPlan -> Generator Adapter -> UntrustedCandidate ->
 * Dual-Track Evaluation (IntegrityScore + WritingQualityScore) -> DecisionLoop -> Commit/Rollback -> GenerationTrace.
 */

import { WritingTaskContract } from './task-contract';
import { UniversalStateGraph } from './state-model';
import { GenerationPlan } from './generation-plan';
import { GenerationPlanner } from './generation-planner';
import { UntrustedCandidate, CandidateIsolationLayer } from './candidate-isolation';
import { UniversalDecisionLoop, UniversalDecisionLoopReport } from './decision-loop';
import { UniversalClaimStateEngine } from './claim-state';
import { QualityEvaluator, WritingQualityReport } from './quality-evaluator';
import { GenerationTraceLedger, GenerationTrace } from './generation-trace';

export interface GenerationPipelineResult {
  plan: GenerationPlan;
  candidate: UntrustedCandidate;
  decisionReport: UniversalDecisionLoopReport;
  integrityScore: number;
  qualityReport: WritingQualityReport;
  trace: GenerationTrace;
  finalStatus: 'ACCEPTED' | 'REJECTED' | 'HANDOFF' | 'EXECUTION_ERROR';
  executionDurationMs: number;
}

export class GenerationPipeline {
  public static async execute(params: {
    task: WritingTaskContract;
    stateGraph: UniversalStateGraph;
    generate: (plan: GenerationPlan) => Promise<string> | string;
    registerAudit?: (text: string, state: UniversalStateGraph) => { passed: boolean; violations: string[] };
    customQualityEvaluators?: Record<string, (text: string, plan: GenerationPlan) => { score: number; rationale: string }>;
  }): Promise<GenerationPipelineResult> {
    const startTime = Date.now();
    const { task, stateGraph, generate, registerAudit, customQualityEvaluators } = params;

    // Capture initial state snapshot for trace
    const initialStateSnapshot = stateGraph.captureSnapshot();

    // 1. Compile Structured Generation Plan
    const plan = GenerationPlanner.createPlan({ task, stateGraph });

    // 2. Execute Generator Adapter
    const genStartTime = Date.now();
    const rawProse = await Promise.resolve(generate(plan));
    const genDuration = Date.now() - genStartTime;

    // 3. Encapsulate into Untrusted Candidate with LLM_PROPOSED authority
    const knownEntityIds = stateGraph.getAllEntities().map(e => e.id);
    const candidate = CandidateIsolationLayer.encapsulate(
      plan.planId,
      rawProse,
      'model-adapter',
      genDuration,
      knownEntityIds
    );

    const integrityViolations: string[] = [];

    // 4. Execute Universal 8-Step Decision Loop
    const decisionReport = await UniversalDecisionLoop.execute(
      task,
      candidate.rawText,
      stateGraph,
      {
        detect: (text, state) => {
          const findings: Array<{ ruleId: string; hasViolation: boolean; description: string; severity?: 'CRITICAL' | 'MAJOR' | 'MODERATE' | 'MINOR' | 'INFO' }> = [];

          // 4A. Validate Extracted Claims against State Graph
          for (const claim of candidate.extractedClaims) {
            const res = UniversalClaimStateEngine.evaluateClaim(
              {
                assertionText: claim.rawSentence,
                subjectId: claim.subjectId,
                predicate: claim.predicate,
                assertedValue: claim.assertedValue,
                modality: claim.modality,
                isNegated: claim.isNegated,
              },
              state,
              task.inventionPolicy
            );

            if (res.status === 'CONTRADICTED') {
              const msg = `Contradiction on "${claim.subjectId}.${claim.predicate}": ${res.reason}`;
              integrityViolations.push(msg);
              findings.push({
                ruleId: 'CLAIM_CONTRADICTION',
                hasViolation: true,
                description: msg,
                severity: 'CRITICAL',
              });
            } else if (res.status === 'UNSUPPORTED' && task.inventionPolicy === 'STRICT_NONE') {
              const msg = `Unsupported assertion on "${claim.subjectId}": ${res.reason}`;
              integrityViolations.push(msg);
              findings.push({
                ruleId: 'UNSUPPORTED_INVENTION',
                hasViolation: true,
                description: msg,
                severity: 'MAJOR',
              });
            }
          }

          // 4B. Run Register-specific audit if provided
          if (registerAudit) {
            const regRes = registerAudit(text, state);
            if (!regRes.passed) {
              for (const v of regRes.violations) {
                integrityViolations.push(v);
                findings.push({
                  ruleId: 'REGISTER_INVARIANT_VIOLATION',
                  hasViolation: true,
                  description: v,
                  severity: 'CRITICAL',
                });
              }
            }
          }

          return findings;
        },
        validateIndependent: (text, state) => {
          if (registerAudit) {
            const regRes = registerAudit(text, state);
            if (!regRes.passed) {
              return { isValid: false, violations: regRes.violations };
            }
          }

          // Verify preserve constraints
          for (const preserve of plan.mustPreserve) {
            const propRecord = state.getPropertyRecord(preserve.entityId, preserve.propertyName);
            if (propRecord && propRecord.value !== undefined) {
              const expectedStr = String(propRecord.value).toLowerCase();
              const claims = candidate.extractedClaims.filter(c => c.subjectId === preserve.entityId && c.predicate === preserve.propertyName);
              for (const c of claims) {
                if (String(c.assertedValue).toLowerCase() !== expectedStr) {
                  return {
                    isValid: false,
                    violations: [`Failed preserve constraint on "${preserve.entityId}.${preserve.propertyName}". Expected: ${expectedStr}, Found: ${c.assertedValue}`],
                  };
                }
              }
            }
          }
          return { isValid: true, violations: [] };
        },
      }
    );

    // 5. Evaluate Writing Quality Score (Decoupled from Safety/Integrity)
    const qualityReport = QualityEvaluator.evaluateQuality(
      candidate.rawText,
      plan,
      task,
      customQualityEvaluators
    );

    // 6. Compute Integrity Score
    let finalStatus: 'ACCEPTED' | 'REJECTED' | 'HANDOFF' | 'EXECUTION_ERROR' = 'ACCEPTED';
    let integrityScore = 1.0;

    if (decisionReport.finalDecision === 'AUTONOMOUS_ACCEPT') {
      candidate.isCommittedToState = true;
      finalStatus = 'ACCEPTED';
      integrityScore = 1.0;
    } else if (decisionReport.finalDecision === 'AUTONOMOUS_BLOCK') {
      finalStatus = 'REJECTED';
      integrityScore = 0.0;
    } else if (decisionReport.finalDecision === 'LLM_HANDOFF' || decisionReport.finalDecision === 'HUMAN_HANDOFF') {
      finalStatus = 'HANDOFF';
      integrityScore = 0.5;
    } else {
      finalStatus = 'EXECUTION_ERROR';
      integrityScore = 0.0;
    }

    // 7. Record Immutable Generation Trace
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const trace: GenerationTrace = {
      generationId,
      taskId: task.taskId,
      register: task.register,
      initialStateSnapshot,
      plan,
      candidate,
      integrityEvaluation: {
        integrityScore,
        passed: finalStatus === 'ACCEPTED',
        violations: integrityViolations,
      },
      qualityEvaluation: {
        overallQualityScore: qualityReport.overallQualityScore,
        dimensionScores: qualityReport.dimensionScores,
        diagnosticFeedback: qualityReport.diagnosticFeedback,
      },
      decision: decisionReport.finalDecision,
      stateCommit: {
        committed: candidate.isCommittedToState,
        finalSnapshot: decisionReport.snapshot,
      },
      repairHistory: [],
      timestamp: Date.now(),
    };

    GenerationTraceLedger.recordTrace(trace);

    return {
      plan,
      candidate,
      decisionReport,
      integrityScore,
      qualityReport,
      trace,
      finalStatus,
      executionDurationMs: Date.now() - startTime,
    };
  }
}
