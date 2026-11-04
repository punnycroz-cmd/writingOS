/**
 * Writing OS Core — Resource Budget Guard & Backpressure (P13)
 * Enforces hard operational limits on LLM calls, repair attempts, wall time, and context size.
 * Cleanly triggers HANDOFF_BUDGET_EXCEEDED when budgets are breached.
 */

export interface ResourceBudgetLimits {
  maxLlmCalls: number;
  maxRepairAttempts: number;
  maxWallTimeMs: number;
  maxContextTokens: number;
}

export interface ResourceBudgetUsage {
  llmCalls: number;
  repairAttempts: number;
  elapsedWallTimeMs: number;
  contextTokens: number;
}

export class ResourceBudgetGuard {
  private limits: ResourceBudgetLimits;
  private usage: ResourceBudgetUsage;
  private startTime: number;

  constructor(limits?: Partial<ResourceBudgetLimits>) {
    this.limits = {
      maxLlmCalls: limits?.maxLlmCalls ?? 5,
      maxRepairAttempts: limits?.maxRepairAttempts ?? 3,
      maxWallTimeMs: limits?.maxWallTimeMs ?? 15000,
      maxContextTokens: limits?.maxContextTokens ?? 8000,
    };

    this.usage = {
      llmCalls: 0,
      repairAttempts: 0,
      elapsedWallTimeMs: 0,
      contextTokens: 0,
    };

    this.startTime = Date.now();
  }

  public recordLlmCall(): void {
    this.usage.llmCalls += 1;
    this.checkBudget();
  }

  public recordRepairAttempt(): void {
    this.usage.repairAttempts += 1;
    this.checkBudget();
  }

  public recordContextTokens(tokens: number): void {
    this.usage.contextTokens = tokens;
    this.checkBudget();
  }

  public checkBudget(): { isWithinBudget: boolean; breachReason?: string } {
    this.usage.elapsedWallTimeMs = Date.now() - this.startTime;

    if (this.usage.llmCalls > this.limits.maxLlmCalls) {
      throw new Error(`HANDOFF_BUDGET_EXCEEDED: Exceeded max LLM call limit (${this.usage.llmCalls}/${this.limits.maxLlmCalls})`);
    }

    if (this.usage.repairAttempts > this.limits.maxRepairAttempts) {
      throw new Error(`HANDOFF_BUDGET_EXCEEDED: Exceeded max repair attempt limit (${this.usage.repairAttempts}/${this.limits.maxRepairAttempts})`);
    }

    if (this.usage.elapsedWallTimeMs > this.limits.maxWallTimeMs) {
      throw new Error(`HANDOFF_BUDGET_EXCEEDED: Exceeded max wall time limit (${this.usage.elapsedWallTimeMs}ms/${this.limits.maxWallTimeMs}ms)`);
    }

    if (this.usage.contextTokens > this.limits.maxContextTokens) {
      throw new Error(`HANDOFF_BUDGET_EXCEEDED: Exceeded max context token limit (${this.usage.contextTokens}/${this.limits.maxContextTokens})`);
    }

    return { isWithinBudget: true };
  }

  public getUsage(): ResourceBudgetUsage {
    this.usage.elapsedWallTimeMs = Date.now() - this.startTime;
    return { ...this.usage };
  }
}
