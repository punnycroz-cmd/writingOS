/**
 * Writing OS Core — Idempotency & Deduplication Manager (P13)
 * Guarantees that duplicate requests with identical idempotencyKey return cached results
 * without re-executing billable model calls or performing duplicate state mutations.
 */

export interface IdempotencyRecord<T = unknown> {
  idempotencyKey: string;
  operationType: string;
  result: T;
  executedAt: number;
  executionCount: number;
}

export class IdempotencyManager {
  private cache: Map<string, IdempotencyRecord> = new Map();

  public execute<T>(
    idempotencyKey: string,
    operationType: string,
    operationFn: () => T
  ): { result: T; wasCached: boolean; executionCount: number } {
    const existing = this.cache.get(idempotencyKey);

    if (existing) {
      existing.executionCount += 1;
      return {
        result: existing.result as T,
        wasCached: true,
        executionCount: existing.executionCount,
      };
    }

    // Execute fresh operation
    const result = operationFn();
    const record: IdempotencyRecord<T> = {
      idempotencyKey,
      operationType,
      result,
      executedAt: Date.now(),
      executionCount: 1,
    };

    this.cache.set(idempotencyKey, record as IdempotencyRecord);

    return {
      result,
      wasCached: false,
      executionCount: 1,
    };
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}
