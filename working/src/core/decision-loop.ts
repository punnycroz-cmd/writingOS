/**
 * Writing OS Core — Universal Decision Loop (v5.2 Hardened & Fail-Safe)
 * The formal 8-step operational loop with complete Defensive Exception Isolation:
 * 1. Detector -> 2. Proof Assessor -> 3. Severity Evaluator -> 4. Decision Router ->
 * 5. Intervention Engine -> 6. Independent Validator -> 7. Event Logger -> 8. State Committer.
 */

import { UniversalStateGraph, StateGraphSnapshot } from './state-model';
import { WritingTaskContract } from './task-contract';
import { HandoffDecision, HandoffRouter, SeverityLevel, HandoffAction } from './handoff';

export interface DetectionFinding {
  ruleId: string;
  hasViolation: boolean;
  description: string;
  severity?: SeverityLevel;
  locationSnippet?: string;
}

export interface ProofEvaluation {
  ruleId: string;
  isEmpiricallyProven: boolean;
  proofEvidence?: string;
  isAmbiguous: boolean;
}

export interface DecisionLoopStepRecord {
  stepIndex: number;
  stepName: 
    | '1_DETECTOR' 
    | '2_PROOF_ASSESSOR' 
    | '3_SEVERITY_EVALUATOR' 
    | '4_DECISION_ROUTER' 
    | '5_INTERVENTION_ENGINE' 
    | '6_INDEPENDENT_VALIDATOR' 
    | '7_EVENT_LOGGER' 
    | '8_STATE_COMMITTER';
  passed: boolean;
  details: Record<string, unknown>;
  timestamp: number;
}

export interface UniversalDecisionLoopReport {
  taskId: string;
  originalText: string;
  finalText: string;
  finalDecision: HandoffAction;
  stepRecords: DecisionLoopStepRecord[];
  stateCommitted: boolean;
  snapshot?: StateGraphSnapshot;
  executionDurationMs: number;
  executionError?: string;
}

export class UniversalDecisionLoop {
  public static async execute(
    task: WritingTaskContract,
    inputText: string,
    stateGraph: UniversalStateGraph,
    hooks: {
      detect: (text: string, state: UniversalStateGraph) => DetectionFinding[];
      assessProof?: (finding: DetectionFinding, state: UniversalStateGraph) => ProofEvaluation;
      intervene?: (text: string, findings: DetectionFinding[]) => string;
      validateIndependent?: (text: string, state: UniversalStateGraph) => { isValid: boolean; violations: string[] };
    }
  ): Promise<UniversalDecisionLoopReport> {
    const startTime = Date.now();
    const stepRecords: DecisionLoopStepRecord[] = [];
    let currentText = inputText;

    try {
      // Defensive input validation
      if (!task || !task.taskId) {
        throw new Error('DecisionLoop Error: Invalid or missing WritingTaskContract.');
      }
      if (typeof inputText !== 'string') {
        throw new Error('DecisionLoop Error: Input text must be a string.');
      }
      if (!stateGraph) {
        throw new Error('DecisionLoop Error: UniversalStateGraph instance is required.');
      }
      if (!hooks || typeof hooks.detect !== 'function') {
        throw new Error('DecisionLoop Error: Mandatory hooks.detect function is missing.');
      }

      // STEP 1: DETECTOR
      const findings = hooks.detect(currentText, stateGraph);
      const hasViolations = Array.isArray(findings) && findings.some(f => f.hasViolation);
      stepRecords.push({
        stepIndex: 1,
        stepName: '1_DETECTOR',
        passed: !hasViolations,
        details: { totalFindings: findings?.length || 0, violationsCount: findings?.filter(f => f.hasViolation).length || 0, findings },
        timestamp: Date.now(),
      });

      // STEP 2: PROOF ASSESSOR
      const proofEvaluations: ProofEvaluation[] = (findings || []).map(f => {
        if (hooks.assessProof) {
          return hooks.assessProof(f, stateGraph);
        }
        return {
          ruleId: f.ruleId,
          isEmpiricallyProven: f.hasViolation,
          isAmbiguous: false,
          proofEvidence: f.hasViolation ? f.description : undefined,
        };
      });
      const anyAmbiguous = proofEvaluations.some(p => p.isAmbiguous);
      stepRecords.push({
        stepIndex: 2,
        stepName: '2_PROOF_ASSESSOR',
        passed: true,
        details: { proofEvaluations },
        timestamp: Date.now(),
      });

      // STEP 3: SEVERITY EVALUATOR
      let highestSeverity: SeverityLevel = 'INFO';
      for (const f of findings || []) {
        if (f.hasViolation) {
          if (f.severity === 'CRITICAL') highestSeverity = 'CRITICAL';
          else if (f.severity === 'MAJOR' && highestSeverity !== 'CRITICAL') highestSeverity = 'MAJOR';
          else if (f.severity === 'MODERATE' && highestSeverity !== 'CRITICAL' && highestSeverity !== 'MAJOR') highestSeverity = 'MODERATE';
          else if (f.severity === 'MINOR' && highestSeverity === 'INFO') highestSeverity = 'MINOR';
        }
      }
      stepRecords.push({
        stepIndex: 3,
        stepName: '3_SEVERITY_EVALUATOR',
        passed: true,
        details: { highestSeverity },
        timestamp: Date.now(),
      });

      // STEP 4: DECISION ROUTER
      const activeViolation = (findings || []).find(f => f.hasViolation);
      const initialHandoff = HandoffRouter.routeDecision({
        ruleId: activeViolation?.ruleId || 'CORE_CLEAN',
        isDeterministicViolation: hasViolations,
        isAmbiguous: anyAmbiguous,
        severity: highestSeverity,
        description: activeViolation?.description || 'Text passed all detector gates.',
        sourceContext: currentText.slice(0, 100),
      });
      stepRecords.push({
        stepIndex: 4,
        stepName: '4_DECISION_ROUTER',
        passed: initialHandoff.action === 'AUTONOMOUS_ACCEPT',
        details: { handoffDecision: initialHandoff },
        timestamp: Date.now(),
      });

      // STEP 5: INTERVENTION ENGINE (If needed and available)
      let interventionApplied = false;
      if (hasViolations && hooks.intervene) {
        const remediated = hooks.intervene(currentText, (findings || []).filter(f => f.hasViolation));
        if (remediated !== currentText) {
          currentText = remediated;
          interventionApplied = true;
        }
      }
      stepRecords.push({
        stepIndex: 5,
        stepName: '5_INTERVENTION_ENGINE',
        passed: true,
        details: { interventionApplied, textLength: currentText.length },
        timestamp: Date.now(),
      });

      // STEP 6: INDEPENDENT VALIDATOR
      let independentValid = true;
      let independentViolations: string[] = [];
      if (hooks.validateIndependent) {
        const valRes = hooks.validateIndependent(currentText, stateGraph);
        independentValid = valRes?.isValid ?? false;
        independentViolations = valRes?.violations || [];
      } else {
        const postFindings = hooks.detect(currentText, stateGraph);
        independentValid = !postFindings.some(f => f.hasViolation);
        independentViolations = postFindings.filter(f => f.hasViolation).map(f => f.description);
      }
      stepRecords.push({
        stepIndex: 6,
        stepName: '6_INDEPENDENT_VALIDATOR',
        passed: independentValid,
        details: { independentValid, independentViolations },
        timestamp: Date.now(),
      });

      // Final Decision Formulation
      let finalDecision: HandoffAction = 'AUTONOMOUS_ACCEPT';
      if (!independentValid || (hasViolations && !interventionApplied)) {
        finalDecision = 'AUTONOMOUS_BLOCK';
      } else if (anyAmbiguous) {
        finalDecision = highestSeverity === 'CRITICAL' ? 'HUMAN_HANDOFF' : 'LLM_HANDOFF';
      }

      // STEP 7: EVENT LOGGER
      stepRecords.push({
        stepIndex: 7,
        stepName: '7_EVENT_LOGGER',
        passed: true,
        details: {
          taskId: task.taskId,
          finalDecision,
          totalSteps: 8,
          durationMs: Date.now() - startTime,
        },
        timestamp: Date.now(),
      });

      // STEP 8: STATE COMMITTER
      let stateCommitted = false;
      let snapshot: StateGraphSnapshot | undefined;
      if (finalDecision === 'AUTONOMOUS_ACCEPT') {
        snapshot = stateGraph.captureSnapshot();
        stateCommitted = true;
      }
      stepRecords.push({
        stepIndex: 8,
        stepName: '8_STATE_COMMITTER',
        passed: stateCommitted,
        details: { stateCommitted, snapshot },
        timestamp: Date.now(),
      });

      return {
        taskId: task.taskId,
        originalText: inputText,
        finalText: currentText,
        finalDecision,
        stepRecords,
        stateCommitted,
        snapshot,
        executionDurationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      // Fail-Safe Catch: Return EXECUTION_ERROR, zero state commit
      return {
        taskId: task?.taskId || 'unknown_task',
        originalText: inputText,
        finalText: currentText,
        finalDecision: 'EXECUTION_ERROR',
        stepRecords,
        stateCommitted: false,
        executionDurationMs: Date.now() - startTime,
        executionError: err?.message || String(err),
      };
    }
  }
}
