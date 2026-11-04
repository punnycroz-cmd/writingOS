// working/tests/runtime/bible-continuity.test.ts
// Unit & Integration tests for Writing OS Bible Engine, Continuity Tracker, and Scene Advisor.

import { describe, it, expect } from 'bun:test';
import { BibleEngine } from '../../src/runtime/bible-engine';
import { ContinuityTracker } from '../../src/runtime/continuity-tracker';
import { SceneAdvisor } from '../../src/runtime/scene-advisor';
import { WritingOSRuntime } from '../../src/runtime/writing-os-runtime';

describe('Writing OS — Bible Engine & Canon Invariants', () => {
  it('validates Chapter 1 against Canon Bible with full milestone matching', () => {
    const ch1Sample = `
      Elias Thorne woke up in Halloway Medical Center after eleven days in a coma.
      His memory of the past twenty years was completely wiped out.
      Only one name echoed in his mind: Maren.
    `;
    const report = BibleEngine.validateChapter(1, ch1Sample);
    expect(report.passed).toBe(true);
    expect(report.act).toBe('ACT_1');
    expect(report.adherenceScore).toBeGreaterThan(0.70);
    expect(report.matchedKeywords).toContain('coma');
    expect(report.matchedKeywords).toContain('maren');
  });

  it('detects missing key milestone entities when an incorrect scene is provided', () => {
    const wrongSample = `The flowers were blooming in a peaceful meadow with no hospitals or neural tech.`;
    const report = BibleEngine.validateChapter(1, wrongSample);
    expect(report.adherenceScore).toBeLessThan(0.50);
    expect(report.missingKeywords.length).toBeGreaterThan(3);
  });
});

describe('Writing OS — Cross-Chapter Continuity Tracker', () => {
  it('computes correct escalating neural burnout and trauma healing trajectory', () => {
    const stateCh1 = ContinuityTracker.getExpectedState(1);
    const stateCh17 = ContinuityTracker.getExpectedState(17);
    const stateCh27 = ContinuityTracker.getExpectedState(27);

    expect(stateCh1.eliasNeuralBurnoutIndex).toBeLessThan(0.20);
    expect(stateCh17.marenTraumaHealingIndex).toBeGreaterThan(0.50);
    expect(stateCh27.eliasNeuralBurnoutIndex).toBeGreaterThanOrEqual(0.95);
  });

  it('flags anachronistic items referenced before their canonical introduction', () => {
    const prematureText = `In the clinic, Elias examined the stolen Black Archive Hard Drive on the desk.`;
    const report = ContinuityTracker.validateContinuity(2, prematureText);
    expect(report.stateConsistent).toBe(false);
    expect(report.violations.some(v => v.code === 'CONTINUITY_01_ANACHRONISTIC_ITEM_LEAK')).toBe(true);
  });

  it('validates injury consistency in Act 3 climax', () => {
    const act3Text = `Elias gripped his temples as a searing headache and fevered pulse tore through his skull.`;
    const report = ContinuityTracker.validateContinuity(26, act3Text);
    expect(report.violations.filter(v => v.code === 'CONTINUITY_02_INJURY_AMNESIA').length).toBe(0);
  });
});

describe('Writing OS — Scene Expansion Advisor & Runtime Orchestrator', () => {
  const runtime = new WritingOSRuntime();

  it('generates an actionable expansion blueprint for an under-length chapter', () => {
    const shortCh22 = `The thermal breach charge blew the lighthouse door open. Drones circled above.`;
    const response = runtime.processDocument({
      documentId: 'novel_en/CHAPTER_22_REAL_WORLD_BREACH.md',
      mode: 'FICTION',
      text: shortCh22,
    });

    expect(response.fictionReport).toBeDefined();
    expect(response.fictionReport!.expansionBlueprint).toBeDefined();
    const blueprint = response.fictionReport!.expansionBlueprint!;
    expect(blueprint.chapterNumber).toBe(22);
    expect(blueprint.deficitWords).toBeGreaterThan(1000);
    expect(blueprint.recommendedBeats.length).toBeGreaterThan(2);
    expect(blueprint.recommendedBeats.some(b => b.type === 'SENSORY_ANCHOR')).toBe(true);
    expect(blueprint.recommendedBeats.some(b => b.type === 'DIALOGUE_BEAT')).toBe(true);
  });

  it('integrates Bible adherence, continuity, and craft metrics in unified response', () => {
    const fullText = `
      The rain slashed against the clinic glass as Dr. Maren Solis adjusted the neural rig.
      "Elias," she said softly, watching the pulse monitor flicker amber. "Your synaptic channels are overheating."
      Elias breathed in the sharp scent of copper and lavender, grounding himself in the sound of her voice.
      "I can hold the Layer 2 tether," he whispered, feeling the cold steel beneath his fingers.
    `;
    const response = runtime.processDocument({
      documentId: 'CHAPTER_04_THE_FIRST_SESSION.md',
      mode: 'FICTION',
      register: 'COMMERCIAL_FICTION',
      text: fullText,
    });

    expect(response.status).toBeDefined();
    expect(response.fictionReport!.bibleReport).toBeDefined();
    expect(response.fictionReport!.continuityReport).toBeDefined();
    expect(response.fictionReport!.qualityReport).toBeDefined();
    expect(response.fictionReport!.expansionBlueprint).toBeDefined();
  });
});
