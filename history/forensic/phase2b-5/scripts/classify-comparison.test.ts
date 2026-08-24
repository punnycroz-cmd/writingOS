// tests/corpus/classify-comparison.test.ts
// Canonical classifier test suite. Covers all 6 HistoricalComparison outcomes
// plus R6-specific cases. No mocking — tests the actual imported function.

import { describe, it, expect } from 'bun:test';
import { classifyHistoricalComparison, type ClassificationInput } from '../../src/corpus/classify-comparison';

function mk(overrides: Partial<ClassificationInput> = {}): ClassificationInput {
  return {
    expectedFinalDecision: 'REJECT',
    historicalObservedDecision: 'ACCEPT',
    historicalCorrect: false,
    currentFinalDecision: 'REJECT',
    currentFinalCorrect: true,
    isR6: false,
    isUnresolved: false,
    finalScorable: true,
    ...overrides,
  };
}

describe('classifyHistoricalComparison', () => {
  it('STABLE_SUCCESS when both historical and current are correct', () => {
    expect(classifyHistoricalComparison(mk({ historicalCorrect: true, currentFinalCorrect: true })))
      .toBe('STABLE_SUCCESS');
  });

  it('STABLE_SUCCESS is stable across different expected/observed values', () => {
    expect(classifyHistoricalComparison(mk({
      expectedFinalDecision: 'ACCEPT',
      historicalObservedDecision: 'ACCEPT',
      historicalCorrect: true,
      currentFinalDecision: 'ACCEPT',
      currentFinalCorrect: true,
    }))).toBe('STABLE_SUCCESS');
  });

  it('REGRESSION when historical was correct but current is wrong', () => {
    expect(classifyHistoricalComparison(mk({ historicalCorrect: true, currentFinalCorrect: false })))
      .toBe('REGRESSION');
  });

  it('IMPROVEMENT when historical was wrong but current is correct', () => {
    expect(classifyHistoricalComparison(mk({ historicalCorrect: false, currentFinalCorrect: true })))
      .toBe('IMPROVEMENT');
  });

  it('PERSISTENT_DEFECT when both wrong and NOT unresolved', () => {
    expect(classifyHistoricalComparison(mk({ historicalCorrect: false, currentFinalCorrect: false, isUnresolved: false })))
      .toBe('PERSISTENT_DEFECT');
  });

  it('KNOWN_DEFECT when both wrong AND unresolved', () => {
    expect(classifyHistoricalComparison(mk({ historicalCorrect: false, currentFinalCorrect: false, isUnresolved: true })))
      .toBe('KNOWN_DEFECT');
  });

  it('CHANGED_UNSCORABLE when finalScorable is false', () => {
    expect(classifyHistoricalComparison(mk({ finalScorable: false })))
      .toBe('CHANGED_UNSCORABLE');
  });

  it('R6 tag does NOT force KNOWN_DEFECT when current is correct (IMPROVEMENT)', () => {
    // GC-0031 case: R6-tagged, historical wrong, current correct -> IMPROVEMENT
    expect(classifyHistoricalComparison(mk({
      isR6: true,
      historicalCorrect: false,
      currentFinalCorrect: true,
      isUnresolved: false,
    }))).toBe('IMPROVEMENT');
  });

  it('R6 tag with both wrong AND unresolved -> KNOWN_DEFECT (GC-0033)', () => {
    expect(classifyHistoricalComparison(mk({
      isR6: true,
      historicalCorrect: false,
      currentFinalCorrect: false,
      isUnresolved: true,
    }))).toBe('KNOWN_DEFECT');
  });

  it('R6 tag with both wrong but resolved -> PERSISTENT_DEFECT', () => {
    expect(classifyHistoricalComparison(mk({
      isR6: true,
      historicalCorrect: false,
      currentFinalCorrect: false,
      isUnresolved: false,
    }))).toBe('PERSISTENT_DEFECT');
  });

  it('R6 tag does not affect STABLE_SUCCESS', () => {
    expect(classifyHistoricalComparison(mk({
      isR6: true,
      historicalCorrect: true,
      currentFinalCorrect: true,
    }))).toBe('STABLE_SUCCESS');
  });

  it('R6 tag does not affect REGRESSION', () => {
    expect(classifyHistoricalComparison(mk({
      isR6: true,
      historicalCorrect: true,
      currentFinalCorrect: false,
    }))).toBe('REGRESSION');
  });

  it('null currentFinalCorrect is treated as not correct', () => {
    expect(classifyHistoricalComparison(mk({
      historicalCorrect: true,
      currentFinalCorrect: null,
    }))).toBe('REGRESSION');
  });

  it('undefined historicalCorrect is treated as not correct', () => {
    expect(classifyHistoricalComparison(mk({
      historicalCorrect: undefined,
      currentFinalCorrect: true,
    }))).toBe('IMPROVEMENT');
  });

  it('full matrix: all 6 outcomes reachable', () => {
    const outcomes = new Set<string>();
    outcomes.add(classifyHistoricalComparison(mk({ historicalCorrect: true, currentFinalCorrect: true, finalScorable: true })));
    outcomes.add(classifyHistoricalComparison(mk({ historicalCorrect: true, currentFinalCorrect: false, finalScorable: true })));
    outcomes.add(classifyHistoricalComparison(mk({ historicalCorrect: false, currentFinalCorrect: true, finalScorable: true })));
    outcomes.add(classifyHistoricalComparison(mk({ historicalCorrect: false, currentFinalCorrect: false, finalScorable: true, isUnresolved: false })));
    outcomes.add(classifyHistoricalComparison(mk({ historicalCorrect: false, currentFinalCorrect: false, finalScorable: true, isUnresolved: true })));
    outcomes.add(classifyHistoricalComparison(mk({ finalScorable: false })));
    expect(outcomes.has('STABLE_SUCCESS')).toBe(true);
    expect(outcomes.has('REGRESSION')).toBe(true);
    expect(outcomes.has('IMPROVEMENT')).toBe(true);
    expect(outcomes.has('PERSISTENT_DEFECT')).toBe(true);
    expect(outcomes.has('KNOWN_DEFECT')).toBe(true);
    expect(outcomes.has('CHANGED_UNSCORABLE')).toBe(true);
    expect(outcomes.size).toBe(6);
  });
});
