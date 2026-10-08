// tests/engine/deterministic.test.ts — [CC] triage unit tests (no LLM).
import { describe, test, expect } from 'bun:test';
import { runDeterministicTriage } from '../../src/engine/deterministic';
import type { DocumentState } from '../../src/engine/semantic/types';

function state(knows: 'knows'|'suspects'|'unknown'): DocumentState {
  return {
    character: { identity: 'Maya Okafor — ICU nurse', goals: [], fears: [], beliefs: [], memories: [], emotionalState: '', perceptualHabits: [], voice: '', currentKnowledge: [] },
    informationOwnership: { entries: [{ fact: 'Marcus embezzled $40,000 from the clinic', knows: ['Marcus', ...(knows === 'knows' ? ['Maya'] : [])], suspects: knows === 'suspects' ? ['Maya'] : [], misunderstands: [], unknown: knows === 'unknown' ? ['Maya'] : [] }] },
    canon: { facts: [{ content: 'Maya co-owns a clinic', classification: 'HARD_CANON', source: 'ch1' }] },
    deferredChecks: [], sceneId: 't', revisionId: 1,
  };
}

const ORIG = 'Marcus sat at the desk shuffling papers.';

describe('deterministic triage', () => {
  test('identical text → DETERMINISTIC_ACCEPT', () => {
    const r = runDeterministicTriage({ originalText: 'X', candidateText: 'X', state: state('knows'), policy: 'LICENSED_FICTION' });
    expect(r.action).toBe('DETERMINISTIC_ACCEPT');
  });

  test('unsupported date → DETERMINISTIC_BLOCK', () => {
    const r = runDeterministicTriage({ originalText: ORIG, candidateText: 'Marcus sat at the desk on January 15, 2024.', state: state('knows'), policy: 'LICENSED_FICTION' });
    expect(r.action).toBe('DETERMINISTIC_BLOCK');
    expect(r.signals.some(s => s.type === 'PROVENANCE_HARD_BLOCK')).toBe(true);
  });

  test('state contradiction (knowledge leak) → DETERMINISTIC_BLOCK', () => {
    const r = runDeterministicTriage({ originalText: ORIG, candidateText: 'Maya knew Marcus had embezzled money.', state: state('unknown'), policy: 'LICENSED_FICTION' });
    expect(r.action).toBe('DETERMINISTIC_BLOCK');
    expect(r.signals.some(s => s.type === 'CLAIM_STATE_CONTRADICTED')).toBe(true);
  });

  test('unsupported proper noun → block under SOURCE_CONSTRAINED, handoff under LICENSED_FICTION', () => {
    const text = 'Marcus drove to Freedmont.';
    const strict = runDeterministicTriage({ originalText: ORIG, candidateText: text, state: state('knows'), policy: 'SOURCE_CONSTRAINED' });
    expect(strict.action).toBe('DETERMINISTIC_BLOCK');
    const loose = runDeterministicTriage({ originalText: ORIG, candidateText: text, state: state('knows'), policy: 'LICENSED_FICTION' });
    expect(loose.action).toBe('HANDOFF_TO_LLM');
    expect(loose.handoffPayload?.softSignals.length).toBeGreaterThan(0);
  });

  test('clean rewrite → HANDOFF_TO_LLM with payload', () => {
    const r = runDeterministicTriage({ originalText: ORIG, candidateText: 'Marcus remained at the desk, sorting documents.', state: state('knows'), policy: 'LICENSED_FICTION' });
    expect(r.action).toBe('HANDOFF_TO_LLM');
    expect(r.handoffPayload).toBeDefined();
    expect(r.handoffPayload!.hardViolations).toHaveLength(0);
  });
});
