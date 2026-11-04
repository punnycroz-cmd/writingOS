/**
 * Writing OS Core — Operation Context & Distributed Correlation (P18)
 * Provides an immutable contextual envelope propagated across every stage of authoring:
 * Interpretation -> Planning -> Context -> Generation -> Validation -> Repair -> Commit -> Audit.
 */

export interface OperationContextProps {
  requestId: string;
  tenantId: string;
  userId: string;
  sessionId: string;
  taskVersion: number;
  stateVersion: number;
  planVersion: string;
  candidateVersion: string;
  policyVersion: string;
  modelId: string;
  correlationTraceId: string;
}

export class OperationContext {
  public readonly requestId: string;
  public readonly tenantId: string;
  public readonly userId: string;
  public readonly sessionId: string;
  public readonly taskVersion: number;
  public readonly stateVersion: number;
  public readonly planVersion: string;
  public readonly candidateVersion: string;
  public readonly policyVersion: string;
  public readonly modelId: string;
  public readonly correlationTraceId: string;
  public readonly timestamp: number;

  constructor(props: OperationContextProps) {
    this.requestId = props.requestId;
    this.tenantId = props.tenantId;
    this.userId = props.userId;
    this.sessionId = props.sessionId;
    this.taskVersion = props.taskVersion;
    this.stateVersion = props.stateVersion;
    this.planVersion = props.planVersion;
    this.candidateVersion = props.candidateVersion;
    this.policyVersion = props.policyVersion;
    this.modelId = props.modelId;
    this.correlationTraceId = props.correlationTraceId;
    this.timestamp = Date.now();
  }

  public static createInitial(
    tenantId: string,
    userId: string,
    sessionId: string,
    modelId: string = 'standard_v1'
  ): OperationContext {
    const ts = Date.now();
    const rand = Math.random().toString(36).substr(2, 6);
    return new OperationContext({
      requestId: `req_${ts}_${rand}`,
      tenantId,
      userId,
      sessionId,
      taskVersion: 1,
      stateVersion: 1,
      planVersion: 'plan_v1',
      candidateVersion: 'cand_v0',
      policyVersion: 'p16.0',
      modelId,
      correlationTraceId: `trace_${ts}_${rand}`,
    });
  }

  public nextTurn(newModelId?: string): OperationContext {
    return new OperationContext({
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      tenantId: this.tenantId,
      userId: this.userId,
      sessionId: this.sessionId,
      taskVersion: this.taskVersion + 1,
      stateVersion: this.stateVersion + 1,
      planVersion: `plan_v${this.taskVersion + 1}`,
      candidateVersion: `cand_v${this.taskVersion + 1}`,
      policyVersion: this.policyVersion,
      modelId: newModelId || this.modelId,
      correlationTraceId: this.correlationTraceId,
    });
  }

  public toJSON(): Record<string, unknown> {
    return {
      requestId: this.requestId,
      tenantId: this.tenantId,
      userId: this.userId,
      sessionId: this.sessionId,
      taskVersion: this.taskVersion,
      stateVersion: this.stateVersion,
      planVersion: this.planVersion,
      candidateVersion: this.candidateVersion,
      policyVersion: this.policyVersion,
      modelId: this.modelId,
      correlationTraceId: this.correlationTraceId,
      timestamp: this.timestamp,
    };
  }
}
