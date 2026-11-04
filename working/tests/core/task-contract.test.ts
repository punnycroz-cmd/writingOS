import { describe, expect, test } from 'bun:test';
import { TaskContractValidator, WritingTaskContract } from '../../src/core/task-contract';

describe('Writing OS Core — Task Contract Specification', () => {
  test('Normalizes a raw fiction task with appropriate defaults', () => {
    const task = TaskContractValidator.normalize({
      register: 'fiction',
      objective: 'Write opening scene of chapter 4',
    });

    expect(task.register).toBe('fiction');
    expect(task.inventionPolicy).toBe('LICENSED_FICTION');
    expect(task.sourceConstraints).toBe('GUIDED');
    expect(task.voiceRequirements.targetFormality).toBe('literary');
    expect(task.stateRequirements.enforceTemporalOrder).toBe(true);
    expect(task.validationRequirements.enforceDeterministicProof).toBe(true);
  });

  test('Normalizes an academic task enforcing STRICT_NONE invention policy', () => {
    const task = TaskContractValidator.normalize({
      register: 'academic',
      objective: 'Synthesize methodology section from literature',
    });

    expect(task.register).toBe('academic');
    expect(task.inventionPolicy).toBe('STRICT_NONE');
    expect(task.sourceConstraints).toBe('STRICT');
    expect(task.voiceRequirements.targetFormality).toBe('academic');
    expect(task.voiceRequirements.perspective).toBe('objective');
  });

  test('Normalizes a business task with LIMITED_INFERENCE policy', () => {
    const task = TaskContractValidator.normalize({
      register: 'business',
      objective: 'Draft Q3 Executive Summary for Board',
      audience: 'EXECUTIVE',
    });

    expect(task.register).toBe('business');
    expect(task.inventionPolicy).toBe('LIMITED_INFERENCE');
    expect(task.audience).toBe('EXECUTIVE');
    expect(task.voiceRequirements.targetFormality).toBe('professional');
  });

  test('Throws descriptive error when objective is missing', () => {
    expect(() => {
      TaskContractValidator.normalize({ register: 'general' });
    }).toThrow("TaskContract Error: 'objective' is required.");
  });
});
