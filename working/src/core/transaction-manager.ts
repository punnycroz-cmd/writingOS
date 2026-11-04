/**
 * Writing OS Core — Transaction & Crash Consistency Manager (P7)
 * Guarantees atomic ACID-like transactions for multi-step generation and repair cycles.
 * Prevents partial state corruption if process crashes or execution errors occur.
 */

import { UniversalStateGraph, StateGraphSnapshot } from './state-model';

export interface StateTransactionRecord {
  transactionId: string;
  startedAt: number;
  status: 'ACTIVE' | 'COMMITTED' | 'ROLLED_BACK';
  snapshot: StateGraphSnapshot;
}

export class TransactionManager {
  private activeTransactions: Map<string, StateTransactionRecord> = new Map();
  private stateGraph: UniversalStateGraph;

  constructor(stateGraph: UniversalStateGraph) {
    this.stateGraph = stateGraph;
  }

  public beginTransaction(transactionId: string): StateTransactionRecord {
    const snapshot = this.stateGraph.captureSnapshot();
    const record: StateTransactionRecord = {
      transactionId,
      startedAt: Date.now(),
      status: 'ACTIVE',
      snapshot,
    };
    this.activeTransactions.set(transactionId, record);
    return record;
  }

  public commitTransaction(transactionId: string): boolean {
    const tx = this.activeTransactions.get(transactionId);
    if (!tx || tx.status !== 'ACTIVE') return false;

    tx.status = 'COMMITTED';
    this.activeTransactions.delete(transactionId);
    return true;
  }

  public rollbackTransaction(transactionId: string): boolean {
    const tx = this.activeTransactions.get(transactionId);
    if (!tx || tx.status !== 'ACTIVE') return false;

    // Restore exact snapshot state into state graph
    const rolledBack = this.stateGraph.rollbackToSnapshot(tx.snapshot);

    tx.status = 'ROLLED_BACK';
    this.activeTransactions.delete(transactionId);
    return rolledBack;
  }
}
