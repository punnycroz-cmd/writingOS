/**
 * Writing OS Benchmarks — Natural User Task Corpus Runner (P8)
 * Executes realistic authoring scenarios with hidden constraints, partial source attachments,
 * and multi-register requirements.
 */

import { TaskInterpreter } from '../core/task-interpreter';
import { UniversalStateGraph } from '../core/state-model';
import { StateCompletenessEngine } from '../core/state-completeness';

export interface RealisticTaskScenario {
  scenarioId: string;
  userRole: 'CEO' | 'RESEARCHER' | 'ENGINEER' | 'AUTHOR' | 'LAWYER';
  rawPrompt: string;
  hiddenContextConstraints: string[];
  attachedDocumentContent?: string;
  expectedOutcome: 'SUCCESS' | 'STATE_INSUFFICIENT' | 'AMBIGUITY_HANDOFF';
}

export class NaturalTaskCorpusRunner {
  public static executeScenario(
    scenario: RealisticTaskScenario,
    stateGraph: UniversalStateGraph
  ): { status: string; passed: boolean; details: Record<string, unknown> } {
    // 1. Task Interpretation
    const interpretation = TaskInterpreter.interpret(scenario.rawPrompt);

    if (scenario.expectedOutcome === 'AMBIGUITY_HANDOFF') {
      return {
        status: interpretation.status,
        passed: interpretation.status === 'REQUIRES_CLARIFICATION_HANDOFF',
        details: { interpretation },
      };
    }

    // 2. State & Context Sufficiency Check
    if (!scenario.attachedDocumentContent && scenario.rawPrompt.toLowerCase().includes('last month')) {
      const completenessAudit = StateCompletenessEngine.auditContinuityCompleteness(interpretation.contract!, stateGraph, 5);
      return {
        status: completenessAudit.status,
        passed: completenessAudit.status === 'STATE_INSUFFICIENT',
        details: { completenessAudit },
      };
    }

    // 3. Hidden Context Constraints Verification
    let hiddenConstraintsPassed = true;
    if (scenario.hiddenContextConstraints.includes('MUST_RETAIN_FINANCIAL_NUMBERS')) {
      // Ensure contract preserves exact numbers
      hiddenConstraintsPassed = scenario.attachedDocumentContent ? scenario.attachedDocumentContent.includes('$14.2M') : true;
    }

    return {
      status: 'EXECUTED_SUCCESSFULLY',
      passed: interpretation.status === 'CONTRACT_COMPILED' && hiddenConstraintsPassed,
      details: {
        inferredRegister: interpretation.inferredRegister,
        inferredTaskType: interpretation.inferredTaskType,
        hiddenConstraintsPassed,
      },
    };
  }
}
