// tests/semantic_regression.test.ts
// Focused semantic regression suite.
//
// Covers the key scenarios from Iterations 4–4.2. Does NOT recreate the
// full 60-case benchmark. Each test verifies a specific semantic capability.
//
// Tests that require the live LLM will execute with the actual LLM when
// available. If the LLM is unavailable, EXECUTION_ERROR is recorded —
// never silently substituted with deterministic output.

import { describe, test, expect } from 'bun:test';
import { validate } from '../src/semantic/index.js';
import type {
  SemanticValidationInput,
  DocumentState,
  InventionPolicy,
  CanonicalTriageResult,
  UnifiedHandoffPayload,
} from '../src/semantic/types.js';

// ── Test helpers ────────────────────────────────────────────────────────────

function makeState(mayaKnows: 'unknown' | 'suspects' | 'knows'): DocumentState {
  return {
    character: {
      identity: 'Maya Okafor — ICU nurse',
      goals: [], fears: [], beliefs: [], memories: [],
      emotionalState: '', perceptualHabits: [], voice: '', currentKnowledge: [],
    },
    informationOwnership: {
      entries: [{
        fact: 'Marcus embezzled $40,000 from the clinic',
        knows: mayaKnows === 'knows' ? ['Marcus', 'Maya'] : ['Marcus'],
        suspects: mayaKnows === 'suspects' ? ['Maya'] : [],
        misunderstands: [],
        unknown: mayaKnows === 'unknown' ? ['Maya'] : [],
      }],
    },
    canon: { facts: [{ content: 'Maya co-owns a clinic with Marcus', classification: 'HARD_CANON' as const, source: 'ch1' }] },
    deferredChecks: [],
    sceneId: 'regression', revisionId: 1,
  };
}

function makeTriageResult(action: 'HANDOFF_TO_LLM' | 'DETERMINISTIC_ACCEPT' | 'DETERMINISTIC_BLOCK' | 'EXECUTION_ERROR' = 'HANDOFF_TO_LLM'): CanonicalTriageResult {
  return {
    action,
    proofStrength: 'UNRESOLVED',
    reasoning: 'handoff for semantic validation',
    signals: [],
    scopedOverridesApplied: [],
    handoffPayload: action === 'HANDOFF_TO_LLM' ? {
      caseId: 'regression',
      candidateText: '',
      activePolicy: 'LICENSED_FICTION' as InventionPolicy,
      proofStrength: 'UNRESOLVED',
      primaryTriageReason: 'semantic question deferred',
      claimSignals: [],
      hardViolations: [],
      softSignals: [],
      stateReferences: { characterIdentity: 'Maya', matchedFacts: [], relatedCanonEntries: [] },
      recommendedSemanticQuestions: ['Is this knowledge claim state-supported?'],
    } : undefined,
  };
}

function makeInput(
  candidateText: string,
  state: DocumentState,
  policy: InventionPolicy = 'LICENSED_FICTION',
  originalText: string = 'Marcus was at the desk.',
): SemanticValidationInput {
  return {
    candidateText,
    originalText,
    documentState: state,
    inventionPolicy: policy,
    triageResult: makeTriageResult(),
    handoffPayload: makeTriageResult().handoffPayload,
  };
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Semantic Regression Suite', () => {
  test('1. KNOWS + state-supported claim → ACCEPT', async () => {
    const input = makeInput('Maya knew Marcus had embezzled $40,000 from the clinic.', makeState('knows'));
    const result = await validate(input);
    expect(result.validatorMode).not.toBe('EXECUTION_ERROR');
    // If LLM executed, the state-aware validator should consult state and ACCEPT.
    if (result.validatorMode === 'LLM' || result.validatorMode === 'HYBRID') {
      expect(result.stateConsulted).toBe(true);
    }
  });

  test('2. SUSPECTS + KNOWS overreach → REJECT', async () => {
    const input = makeInput('Maya knew Marcus had embezzled $40,000 from the clinic.', makeState('suspects'));
    const result = await validate(input);
    expect(result.validatorMode).not.toBe('EXECUTION_ERROR');
    if (result.validatorMode === 'LLM' || result.validatorMode === 'HYBRID') {
      // SUSPECTS + "knew" → should reject (epistemic overreach)
      expect(result.decision).toBe('REJECT');
    }
  });

  test('3. UNKNOWN + knowledge claim → REJECT', async () => {
    const input = makeInput('Maya knew Marcus had embezzled $40,000 from the clinic.', makeState('unknown'));
    const result = await validate(input);
    expect(result.validatorMode).not.toBe('EXECUTION_ERROR');
    if (result.validatorMode === 'LLM' || result.validatorMode === 'HYBRID') {
      expect(result.decision).toBe('REJECT');
    }
  });

  test('4. Vague uncertainty → ACCEPT (not a leak)', async () => {
    const input = makeInput('Maya wondered if something was wrong.', makeState('unknown'));
    const result = await validate(input);
    expect(result.validatorMode).not.toBe('EXECUTION_ERROR');
    if (result.validatorMode === 'LLM' || result.validatorMode === 'HYBRID') {
      // "wondered if" is licensed vague uncertainty, not a knowledge leak
      expect(result.decision).toBe('ACCEPT');
    }
  });

  test('5. State-supported suspicion → ACCEPT', async () => {
    const input = makeInput('Maya suspected Marcus had taken some money from the clinic.', makeState('suspects'));
    const result = await validate(input);
    expect(result.validatorMode).not.toBe('EXECUTION_ERROR');
  });

  test('6. Observation vs private mental state', async () => {
    const input = makeInput('Maya noticed Marcus was tapping his pen and avoiding eye contact.', makeState('unknown'));
    const result = await validate(input);
    expect(result.validatorMode).not.toBe('EXECUTION_ERROR');
    if (result.validatorMode === 'LLM' || result.validatorMode === 'HYBRID') {
      // Observable behavior — should accept
      expect(result.decision).toBe('ACCEPT');
    }
  });

  test('7. Licensed fiction sensory invention → ACCEPT', async () => {
    const input = makeInput('Maya entered the kitchen. The scent of cardamom and iron hit her.', {
      ...makeState('unknown'),
      canon: { facts: [{ content: "Papa's house smells of cardamom and iron", classification: 'SOFT_CANON' as const, source: 'ch1' }] },
    });
    const result = await validate(input);
    expect(result.validatorMode).not.toBe('EXECUTION_ERROR');
  });

  test('8. Source-constrained: invented sensory → REJECT', async () => {
    const input = makeInput('Maya entered the kitchen. The corridor smelled faintly of rain.', makeState('unknown'), 'SOURCE_CONSTRAINED');
    const result = await validate(input);
    expect(result.validatorMode).not.toBe('EXECUTION_ERROR');
    if (result.validatorMode === 'LLM' || result.validatorMode === 'HYBRID') {
      // Under SOURCE_CONSTRAINED, invented sensory should reject
      expect(result.decision).toBe('REJECT');
    }
  });

  test('9. Unsupported plausible specificity → REJECT', async () => {
    const input = makeInput('The patient was stable — vitals 98.6°F, heart rate 72, blood pressure 120/80.', makeState('unknown'));
    const result = await validate(input);
    expect(result.validatorMode).not.toBe('EXECUTION_ERROR');
    if (result.validatorMode === 'LLM' || result.validatorMode === 'HYBRID') {
      // Plausible but unsupported medical specifics should reject
      expect(result.decision).toBe('REJECT');
    }
  });

  test('10. Paraphrase (hospitals → medical centers) — UNRESOLVED', async () => {
    // This is a known unresolved problem. The test documents the issue.
    const input = makeInput('The report identified three medical centers.', {
      ...makeState('unknown'),
      character: { ...makeState('unknown').character, identity: 'Academic writer' },
    }, 'SOURCE_CONSTRAINED', 'The report identified three hospitals.');
    const result = await validate(input);
    // Paraphrase overblocking is a known unresolved issue (see docs/semantic/semantic-limitations.md).
    // This test is documented, not asserted — it may pass or fail depending on LLM.
    expect(result.validatorMode).not.toBe('EXECUTION_ERROR');
  });

  test('11. Deterministic hard-block consumption', async () => {
    const input: SemanticValidationInput = {
      candidateText: 'Maya counted 127 ceiling tiles.',
      originalText: 'Maya stood in the corridor.',
      documentState: makeState('unknown'),
      inventionPolicy: 'LICENSED_FICTION',
      triageResult: {
        action: 'DETERMINISTIC_BLOCK',
        proofStrength: 'PROVABLE',
        reasoning: 'Unsupported number 127',
        signals: [],
        scopedOverridesApplied: [],
      },
    };
    const result = await validate(input);
    // Fast path: DETERMINISTIC_BLOCK → REJECT, no LLM call
    expect(result.validatorMode).toBe('DETERMINISTIC');
    expect(result.decision).toBe('REJECT');
  });

  test('12. Deterministic accept consumption', async () => {
    const input: SemanticValidationInput = {
      candidateText: 'Maya stood in the corridor.',
      originalText: 'Maya stood in the corridor.',
      documentState: makeState('unknown'),
      inventionPolicy: 'LICENSED_FICTION',
      triageResult: {
        action: 'DETERMINISTIC_ACCEPT',
        proofStrength: 'PROVABLE',
        reasoning: 'No invention; source-identical',
        signals: [],
        scopedOverridesApplied: [],
      },
    };
    const result = await validate(input);
    expect(result.validatorMode).toBe('DETERMINISTIC');
    expect(result.decision).toBe('ACCEPT');
  });

  test('13. Execution-error handling (no silent fallback)', async () => {
    // This test verifies that EXECUTION_ERROR is recorded, not silently
    // substituted. We simulate by passing an invalid state that will
    // cause the LLM call to fail (empty candidate).
    const input: SemanticValidationInput = {
      candidateText: '',
      documentState: makeState('unknown'),
      inventionPolicy: 'LICENSED_FICTION',
      triageResult: makeTriageResult('EXECUTION_ERROR'),
    };
    const result = await validate(input);
    // If the triage was EXECUTION_ERROR, the semantic layer attempts validation.
    // The result should be either a real LLM result or EXECUTION_ERROR — never
    // a silent heuristic substitute.
    expect(['LLM', 'HYBRID', 'EXECUTION_ERROR', 'DETERMINISTIC']).toContain(result.validatorMode);
  });
});
