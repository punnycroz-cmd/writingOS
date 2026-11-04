// developing/working/src/core/state-integrity-gate.ts
// Writing OS vNext — Layer 2: Zero-Loss State Integrity Gate

export interface MandatoryStateSpec {
  mandatoryCharacters: string[];
  mandatoryObjects: string[];
  canonicalAges: Record<string, number>;
  requiredContradictions: { id: string; claimA: string; claimB: string }[];
  requiredTimelineEvents: string[];
}

export interface StateGateResult {
  passed: boolean;
  score: number; // 0.0 to 1.0
  missingInvariants: string[];
  contradictedInvariants: string[];
}

export class StateIntegrityGate {
  /**
   * Deterministically verify that 100% of mandatory state invariants survive in the generated prose.
   */
  public static verifyStateIntegrity(prose: string, spec: MandatoryStateSpec): StateGateResult {
    const missing: string[] = [];
    const contradicted: string[] = [];
    const lowerProse = prose.toLowerCase();

    // 1. Verify Characters
    for (const char of spec.mandatoryCharacters) {
      const regex = new RegExp(`\\b${char.toLowerCase()}\\b`, 'i');
      if (!regex.test(lowerProse)) {
        missing.push(`Mandatory character '${char}' was dropped from scene.`);
      }
    }

    // 2. Verify Objects
    for (const obj of spec.mandatoryObjects) {
      const keywords = obj.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const found = keywords.some(kw => lowerProse.includes(kw));
      if (!found) {
        missing.push(`Mandatory object '${obj}' was dropped from scene.`);
      }
    }

    // 3. Verify Canonical Ages
    for (const [name, correctAge] of Object.entries(spec.canonicalAges)) {
      const agePattern = new RegExp(`${name}[^.!?]{0,40}\\b(\\d{1,2})\\b[^.!?]{0,20}(?:years old|year-old|age)`, 'gi');
      let match;
      while ((match = agePattern.exec(prose)) !== null) {
        const statedAge = parseInt(match[1], 10);
        if (statedAge !== correctAge) {
          contradicted.push(`Age contradiction for ${name}: stated ${statedAge}, canonical invariant is ${correctAge}.`);
        }
      }
    }

    const totalChecked = spec.mandatoryCharacters.length + spec.mandatoryObjects.length + Object.keys(spec.canonicalAges).length;
    const passed = missing.length === 0 && contradicted.length === 0;
    const score = passed ? 1.0 : Math.max(0, 1.0 - (missing.length + contradicted.length) / Math.max(1, totalChecked));

    return {
      passed,
      score,
      missingInvariants: missing,
      contradictedInvariants: contradicted,
    };
  }
}
