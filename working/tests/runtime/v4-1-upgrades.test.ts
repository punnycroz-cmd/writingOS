import { describe, expect, test } from 'bun:test';
import { VoicePolisher } from '../../src/runtime/voice-polisher';

describe('Writing OS v4.1 — Precision Craft Guards & Voice Bounding Suite', () => {
  test('UNSUPPORTED_SPECIFICITY_GUARD: Flags ungrounded software/hardware subsystem hallucinations in executive memo', () => {
    const ungroundedMemo = `
MEMORANDUM
TO: Operations Committee
FROM: Software Security Group
SUBJECT: Deployment Delay

During integration testing, we detected that the token persistence layer failed under distributed edge caches.
The asynchronous event propagation queue experienced out-of-order execution across client endpoints.
Release is delayed six weeks.
    `;

    const report = VoicePolisher.evaluate(ungroundedMemo, {
      genre: 'GENERAL',
      tempo: 'TACTICAL_PROCEDURAL',
    });

    const guard = report.gateResults.find(g => g.gate === 'UNSUPPORTED_SPECIFICITY_GUARD');
    expect(guard).toBeDefined();
    expect(guard?.passed).toBe(false);
    expect(guard?.notes[0]).toContain('UNSUPPORTED_SPECIFICITY');
  });

  test('UNSUPPORTED_SPECIFICITY_GUARD: Passes when executive memo remains appropriately scoped to prompt', () => {
    const groundedMemo = `
MEMORANDUM
TO: Operations Committee
FROM: Systems Security Group
SUBJECT: Deployment Schedule Revision

During final integration testing of the core platform, internal audits identified a state validation defect within the authentication service.
Remediating this vulnerability requires restructuring internal session validation protocols and completing end-to-end regression cycles.
The release date is postponed by six weeks to ensure production integrity.
    `;

    const report = VoicePolisher.evaluate(groundedMemo, {
      genre: 'GENERAL',
      tempo: 'TACTICAL_PROCEDURAL',
    });

    const guard = report.gateResults.find(g => g.gate === 'UNSUPPORTED_SPECIFICITY_GUARD');
    expect(guard).toBeDefined();
    expect(guard?.passed).toBe(true);
  });

  test('COGNITIVE_SYNTAX_GUARD: Flags formulaic multi-POV transitions with identical structural phrasing', () => {
    const formulaicText = `
Felix examined the sheared locking pin. Where another saw a mystery, Felix saw mechanical data.
Garrett scanned the corridor shadows. Where another saw an empty hall, Garrett saw a kill zone.
Jax checked the floor grime. Where others saw dust, Jax saw an opportunity.
    `;

    const report = VoicePolisher.evaluate(formulaicText, {
      isMultiPOV: true,
      tempo: 'TACTICAL_PROCEDURAL',
    });

    const guard = report.gateResults.find(g => g.gate === 'COGNITIVE_SYNTAX_GUARD');
    expect(guard).toBeDefined();
    expect(guard?.passed).toBe(false);
    expect(guard?.notes[0]).toContain('Formulaic POV transition');
  });

  test('TROPE_CONVERGENCE_GUARD: Flags attractor basin cliché for minimal prompts', () => {
    const ruralClichéText = `
Thomas walked to the root cellar behind the old apple barn.
His grandfather had told him to leave the family secret in the dark.
At the bottom of the steps lay a child's cradle and woman's silver buckled shoes.
    `;

    const report = VoicePolisher.evaluate(ruralClichéText, {
      premiseAmbiguity: 'MINIMAL_PROMPT',
      genre: 'LITERARY',
      sceneRegister: 'LITERARY_CONTEMPLATIVE',
    });

    const guard = report.gateResults.find(g => g.gate === 'TROPE_CONVERGENCE_GUARD');
    expect(guard).toBeDefined();
    expect(guard?.passed).toBe(false);
    expect(guard?.notes[0]).toContain('TROPE_ATTRACTOR_BASIN');
  });

  test('SECOND_ORDER_OPSEC_GUARD: Passes when operational exposure acknowledges downstream risk tracking', () => {
    const opSecText = `
Valerie covered the classified fortress survey with the municipal ledger as the clerk entered.
She signed the land registry sheet, mindful that the visitor logbook in the vestibule recorded his arrival timestamp.
If the inspector compared the seal numbers, the subpoena risk would escalate by morning.
    `;

    const report = VoicePolisher.evaluate(opSecText, {
      sceneRegister: 'TACTICAL_PROCEDURAL',
      tempo: 'TACTICAL_PROCEDURAL',
    });

    const guard = report.gateResults.find(g => g.gate === 'SECOND_ORDER_OPSEC_GUARD');
    expect(guard).toBeDefined();
    expect(guard?.passed).toBe(true);
  });

  test('HOUSE_STYLE_ENTROPY_GUARD: Flags repetitive 19th-century rustic token clustering in contemporary/general genre', () => {
    const repetitiveRusticText = `
The room smelled of tallow and linseed oil as he adjusted his mackintosh over the oilcloth table.
Outside the sawmill, a dray horse slipped near the wharf tavern.
    `;

    const report = VoicePolisher.evaluate(repetitiveRusticText, {
      genre: 'GENERAL',
      tempo: 'TACTICAL_PROCEDURAL',
    });

    const guard = report.gateResults.find(g => g.gate === 'HOUSE_STYLE_ENTROPY_GUARD');
    expect(guard).toBeDefined();
    expect(guard?.passed).toBe(false);
    expect(guard?.notes[0]).toContain('HOUSE_STYLE_CONVERGENCE');
  });
});
