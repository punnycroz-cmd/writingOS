// tests/phase3/phase3-phase-gates.test.ts
// Phase state machine and gate validation.

import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'node:fs';

function loadJson(path: string): any { return JSON.parse(readFileSync(path, 'utf-8')); }

describe('Phase State Machine', () => {
  const gates = loadJson('docs/phase3/PHASE_GATES.json');

  it('current phase is PHASE3_FOUNDATION', () => {
    expect(gates.currentPhase).toBe('PHASE3_FOUNDATION');
  });

  it('has 6 gates (0-5)', () => {
    expect(gates.gates.length).toBe(6);
  });

  it('Gate 0 expected state is PASS', () => {
    expect(gates.gates[0].expectedState).toBe('PASS');
  });

  it('Gate 1 expected state is READY', () => {
    expect(gates.gates[1].expectedState).toBe('READY');
  });

  it('Gates 2-5 are BLOCKED', () => {
    for (let i = 2; i <= 5; i++) {
      expect(gates.gates[i].expectedState).toBe('BLOCKED');
    }
  });

  it('legal transitions do not allow skipping phases', () => {
    // No transition from FOUNDATION directly to BENCHMARK
    const foundationToBenchmark = gates.legalTransitions.find(
      t => t.from === 'PHASE3_FOUNDATION' && t.to === 'PHASE3D_NONFICTION_BENCHMARK'
    );
    expect(foundationToBenchmark).toBeUndefined();
  });

  it('allowed states include all 7 phases', () => {
    expect(gates.allowedStates.length).toBe(7);
  });
});

describe('Canonical State', () => {
  const state = loadJson('docs/phase3/PHASE3_CANONICAL_STATE.json');

  it('stage is FOUNDATION', () => {
    expect(state.stage).toBe('FOUNDATION');
  });

  it('nonfiction containsGroundTruth is false', () => {
    expect(state.nonfiction.containsGroundTruth).toBe(false);
  });

  it('nonfiction sourceVerifiedClaimCount is 0', () => {
    expect(state.nonfiction.sourceVerifiedClaimCount).toBe(0);
  });

  it('nextStage is SOURCE_VERIFICATION', () => {
    expect(state.nextStage).toBe('SOURCE_VERIFICATION');
  });
});
