import { describe, expect, test } from 'bun:test';
import { VoicePolisher } from '../../src/runtime/voice-polisher';

describe('Writing OS v4.0 — Context-Sensitive Grounding & Anti-House-Style Suite', () => {

  describe('1. Anti-Quantification & False-Precision Guard', () => {
    test('Flags unearned numerical precision in kinetic action scenes (e.g. "seventy paces a minute")', () => {
      const input = 'Corren kept his gait measured at seventy paces a minute while running from the patrol.';
      const report = VoicePolisher.polish(input, {
        sceneRegister: 'ACTION_KINETIC',
        tempo: 'ACTION_SPRINT'
      });

      expect(report.quantificationViolationsCount).toBeGreaterThan(0);
      const quantGate = report.gateResults.find(g => g.gate === 'QUANTIFICATION_GUARD');
      expect(quantGate?.passed).toBe(false);
      expect(quantGate?.notes[0]).toContain('FALSE_PRECISION_MEASUREMENT');
    });

    test('Flags artificial counting during panic/somatic injury (e.g. "counted twelve pulls across the shale")', () => {
      const input = 'He dragged his dead weight through the gravel and counted twelve pulls across the shale.';
      const report = VoicePolisher.polish(input, {
        sceneRegister: 'ACTION_KINETIC',
        threatLevel: 'LETHAL_COMBAT'
      });

      expect(report.quantificationViolationsCount).toBeGreaterThan(0);
      const quantGate = report.gateResults.find(g => g.gate === 'QUANTIFICATION_GUARD');
      expect(quantGate?.passed).toBe(false);
      expect(quantGate?.notes[0]).toContain('FALSE_PRECISION');
    });

    test('Permits necessary physical measurements in TACTICAL_PROCEDURAL engineering scenes', () => {
      const input = 'Vance measured the outer flange thickness at 3.2 millimeters with the stainless steel caliper.';
      const report = VoicePolisher.polish(input, {
        sceneRegister: 'TACTICAL_PROCEDURAL',
        tempo: 'TACTICAL_PROCEDURAL'
      });

      const quantGate = report.gateResults.find(g => g.gate === 'QUANTIFICATION_GUARD');
      expect(quantGate?.passed).toBe(true);
    });
  });

  describe('2. Anti-Performative Restraint Guard', () => {
    test('Flags formulaic affected subtlety (e.g. aligning towel until corners are square)', () => {
      const input = 'Arthur folded the dish towel in half, aligning the borders until the corners were square.';
      const report = VoicePolisher.polish(input, {
        sceneRegister: 'EMOTIONAL_INTIMACY',
        tempo: 'INTIMATE_QUIET'
      });

      expect(report.performativeRestraintCount).toBeGreaterThan(0);
      const perfGate = report.gateResults.find(g => g.gate === 'PERFORMATIVE_RESTRAINT_GUARD');
      expect(perfGate?.passed).toBe(false);
      expect(perfGate?.notes[0]).toContain('AFFECTED_TOWEL_SQUARE');
    });

    test('Flags exact degree rotation on mundane household appliances in emotional scene', () => {
      const input = 'He turned the brass gas valve ninety degrees, extinguishing the blue flame.';
      const report = VoicePolisher.polish(input, {
        sceneRegister: 'EMOTIONAL_INTIMACY'
      });

      expect(report.performativeRestraintCount).toBeGreaterThan(0);
      const perfGate = report.gateResults.find(g => g.gate === 'PERFORMATIVE_RESTRAINT_GUARD');
      expect(perfGate?.passed).toBe(false);
    });
  });

  describe('3. Psychological Depth & Anti-Substitution Layer', () => {
    test('Flags emotional scene that entirely substitutes hardware parts for human interiority', () => {
      const toolCatalog = 'The alternator was dead. He checked the socket, replaced the caliper, adjusted the lathe, and tightened the torque wrench on the cheater bar.';
      const report = VoicePolisher.polish(toolCatalog, {
        sceneRegister: 'EMOTIONAL_INTIMACY'
      });

      const depthGate = report.gateResults.find(g => g.gate === 'PSYCHOLOGICAL_DEPTH_GUARD');
      expect(depthGate?.passed).toBe(false);
      expect(depthGate?.notes[0]).toContain('mechanical equipment catalog');
    });

    test('Passes scene with authentic personal memory, voice, and human relationship focus', () => {
      const humanGrounded = 'Martin sat in the quiet workshop, remembering his brother voice in the old truck cabin.';
      const report = VoicePolisher.polish(humanGrounded, {
        sceneRegister: 'EMOTIONAL_INTIMACY'
      });

      const depthGate = report.gateResults.find(g => g.gate === 'PSYCHOLOGICAL_DEPTH_GUARD');
      expect(depthGate?.passed).toBe(true);
    });
  });

  describe('4. Context-Sensitive Scene Register Routing', () => {
    test('Defaulting accurately maps scene registers based on tempo when unspecified', () => {
      const sprintReport = VoicePolisher.polish('He sprinted toward the alley.', { tempo: 'ACTION_SPRINT' });
      expect(sprintReport.sceneRegister).toBe('ACTION_KINETIC');

      const quietReport = VoicePolisher.polish('She sat in the quiet room.', { tempo: 'INTIMATE_QUIET' });
      expect(quietReport.sceneRegister).toBe('EMOTIONAL_INTIMACY');

      const dreamReport = VoicePolisher.polish('He looked across the winter field.', { tempo: 'CONTEMPLATIVE_DREAM' });
      expect(dreamReport.sceneRegister).toBe('PSYCHOLOGICAL_INTROSPECTION');
    });
  });
});
