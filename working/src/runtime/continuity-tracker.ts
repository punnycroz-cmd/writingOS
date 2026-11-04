// working/src/runtime/continuity-tracker.ts
// Cross-Chapter Continuity & Character State Graph Engine for Writing OS.

export interface CharacterContinuityState {
  chapter: number;
  eliasNeuralBurnoutIndex: number; // 0.0 (healthy) to 1.0 (lethal collapse)
  marenTraumaHealingIndex: number; // 0.0 (guilt/stifled) to 1.0 (healed/committed)
  location: string;
  keyItemsHeld: string[];
}

export interface ContinuityViolation {
  code: string;
  severity: 'FATAL' | 'HIGH' | 'WARNING';
  message: string;
  chapterNumber: number;
}

export interface ContinuityReport {
  chapterNumber: number;
  expectedState: CharacterContinuityState;
  violations: ContinuityViolation[];
  stateConsistent: boolean;
  notes: string[];
}

export class ContinuityTracker {
  public static getExpectedState(chapterNum: number): CharacterContinuityState {
    // Dynamic trajectory defined by Master Story Bible
    let burnout = 0.05;
    let healing = 0.10;
    let loc = 'Halloway Medical Center';
    const items: string[] = [];

    if (chapterNum >= 1 && chapterNum <= 3) {
      burnout = 0.10;
      healing = 0.15;
      loc = chapterNum === 1 ? 'Halloway Medical Center' : 'Maren Solis Neuro-Clinic';
    } else if (chapterNum >= 4 && chapterNum <= 7) {
      burnout = 0.25;
      healing = 0.25;
      loc = 'Maren Solis Neuro-Clinic';
      if (chapterNum === 7) items.push('Black Archive Hard Drive');
    } else if (chapterNum >= 8 && chapterNum <= 14) {
      burnout = 0.45;
      healing = 0.40;
      loc = 'Outskirts Motels & Mobile Safehouses';
      items.push('Black Archive Hard Drive', 'Mobile Neuro-Rig');
    } else if (chapterNum >= 15 && chapterNum <= 21) {
      burnout = 0.60;
      healing = chapterNum >= 17 ? 0.70 : 0.45;
      loc = 'Coastal Lighthouse';
      items.push('Black Archive Hard Drive', 'Mobile Neuro-Rig', 'Emergency Saline Tethers');
    } else if (chapterNum >= 22 && chapterNum <= 28) {
      burnout = chapterNum >= 27 ? 0.95 : 0.80;
      healing = 0.90;
      loc = 'Coastal Lighthouse & Layer 3/4 Neural Chambers';
      items.push('Black Archive Hard Drive', 'Tactical Drone Transmitters', 'Quantum Sovereign Decryptor');
    } else {
      // Epilogue
      burnout = 1.0;
      healing = 1.0;
      loc = 'Sanctuary Node / Open Ocean';
      items.push('Layer-1 Cryo-Stasis Pod');
    }

    return {
      chapter: chapterNum,
      eliasNeuralBurnoutIndex: burnout,
      marenTraumaHealingIndex: healing,
      location: loc,
      keyItemsHeld: items,
    };
  }

  public static validateContinuity(chapterNum: number, text: string): ContinuityReport {
    const expected = this.getExpectedState(chapterNum);
    const violations: ContinuityViolation[] = [];
    const notes: string[] = [];
    const lower = text.toLowerCase();

    // 1. Check for Anachronistic Item Leaks
    if (chapterNum < 7 && lower.includes('black archive') && !lower.includes('rumor') && !lower.includes('project')) {
      violations.push({
        code: 'CONTINUITY_01_ANACHRONISTIC_ITEM_LEAK',
        severity: 'HIGH',
        message: `Chapter ${chapterNum} references the physical Black Archive drive before its heist in Chapter 7.`,
        chapterNumber: chapterNum,
      });
    }

    // 2. Check for Injury/Burnout Consistency
    if (chapterNum >= 22 && chapterNum <= 28) {
      // Elias should show signs of severe neuro-burnout (headache, nosebleed, thermal spike)
      const hasBurnoutCues = ['headache', 'nosebleed', 'blood', 'burn', 'heat', 'fever', 'shiver', 'temple', 'pulse', 'ache', 'collapse', 'strain', 'bleeding'].some(w => lower.includes(w));
      if (!hasBurnoutCues && chapterNum >= 25) {
        violations.push({
          code: 'CONTINUITY_02_INJURY_AMNESIA',
          severity: 'WARNING',
          message: `Elias should exhibit critical Thermal Burnout symptoms in Act 3 climax (expected burnout index: ${(expected.eliasNeuralBurnoutIndex * 100).toFixed(0)}%).`,
          chapterNumber: chapterNum,
        });
      } else {
        notes.push(`Neural burnout symptoms appropriately represented (${(expected.eliasNeuralBurnoutIndex * 100).toFixed(0)}% strain).`);
      }
    }

    // 3. Emotional Healing Arc Check
    if (chapterNum < 17 && lower.includes('i love you') && lower.includes('maren')) {
      violations.push({
        code: 'CONTINUITY_03_PREMATURE_ROMANCE_BEAT',
        severity: 'WARNING',
        message: `Maren still suffers unhealed trauma regarding Corwin Daly prior to the Chapter 17 Reef Ritual. Premature love confession risks unearned emotional arc.`,
        chapterNumber: chapterNum,
      });
    }

    return {
      chapterNumber: chapterNum,
      expectedState: expected,
      violations,
      stateConsistent: violations.filter(v => v.severity === 'FATAL' || v.severity === 'HIGH').length === 0,
      notes,
    };
  }
}
