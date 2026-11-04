import { describe, expect, test } from 'bun:test';
import { UniversalDecisionLoop } from '../../src/core/decision-loop';
import { UniversalStateGraph } from '../../src/core/state-model';
import { TaskContractValidator } from '../../src/core/task-contract';

describe('Writing OS P2-G — Execution Failure & Defensive Fallback Suite', () => {
  test('Unhandled exception in hook strictly resolves to EXECUTION_ERROR with zero state commit', async () => {
    const graph = new UniversalStateGraph();
    const task = TaskContractValidator.normalize({
      register: 'general',
      objective: 'Test defensive crash handling',
    });

    const report = await UniversalDecisionLoop.execute(
      task,
      'Some text to process.',
      graph,
      {
        detect: () => {
          throw new Error('SIMULATED_CRITICAL_MODEL_CRASH: Model server connection reset.');
        },
      }
    );

    expect(report.finalDecision).toBe('EXECUTION_ERROR');
    expect(report.stateCommitted).toBe(false);
    expect(report.executionError).toContain('SIMULATED_CRITICAL_MODEL_CRASH');
  });

  test('Invalid null TaskContract resolves to EXECUTION_ERROR safely without throwing', async () => {
    const graph = new UniversalStateGraph();
    const report = await UniversalDecisionLoop.execute(
      null as any,
      'Some text.',
      graph,
      { detect: () => [] }
    );

    expect(report.finalDecision).toBe('EXECUTION_ERROR');
    expect(report.stateCommitted).toBe(false);
  });
});
