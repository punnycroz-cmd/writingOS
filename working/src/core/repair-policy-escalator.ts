/**
 * Writing OS Core — Tiered Repair Policy Escalator (P16)
 * Governs autonomous revision boundaries based on failure severity and retry history.
 * Enforces immediate safe handoff on repeated major failures or critical state contradictions.
 */

export type RepairFailureSeverity = 'MINOR' | 'MAJOR' | 'CRITICAL';

export interface RepairEscalationDecision {
  action: 'AUTONOMOUS_TARGETED_REPAIR' | 'SAFE_HANDOFF_ESCALATE' | 'ABORT_CRITICAL';
  allowAutonomousRepair: boolean;
  rationale: string;
}

export class RepairPolicyEscalator {
  public static evaluateRepairAction(
    severity: RepairFailureSeverity,
    priorAttemptsCount: number
  ): RepairEscalationDecision {
    // 1. Critical State Contradictions must NEVER be blindly auto-repaired
    if (severity === 'CRITICAL') {
      return {
        action: 'ABORT_CRITICAL',
        allowAutonomousRepair: false,
        rationale: 'CRITICAL state contradiction detected. Autonomous repair prohibited to prevent hallucination compounding.',
      };
    }

    // 2. Major failures escalate after 1 attempt to halt token burning
    if (severity === 'MAJOR' && priorAttemptsCount >= 1) {
      return {
        action: 'SAFE_HANDOFF_ESCALATE',
        allowAutonomousRepair: false,
        rationale: `MAJOR failure persisted after ${priorAttemptsCount} attempt(s). Escalating to human operator via Safe Handoff.`,
      };
    }

    // 3. Minor failures permit up to 2 targeted repairs
    if (severity === 'MINOR' && priorAttemptsCount >= 2) {
      return {
        action: 'SAFE_HANDOFF_ESCALATE',
        allowAutonomousRepair: false,
        rationale: 'MINOR repair plateaued after 2 attempts. Escalating to human operator.',
      };
    }

    // 4. Clean autonomous repair permitted
    return {
      action: 'AUTONOMOUS_TARGETED_REPAIR',
      allowAutonomousRepair: true,
      rationale: `Permitting autonomous targeted repair attempt #${priorAttemptsCount + 1} for ${severity} issue.`,
    };
  }
}
