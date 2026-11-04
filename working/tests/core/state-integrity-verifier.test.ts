import { describe, expect, test } from 'bun:test';
import { StateIntegrityVerifier } from '../../src/core/state-integrity-verifier';

describe('Writing OS P0 — Automated State & Canon Integrity Suite', () => {
  test('StateIntegrityVerifier: Strictly rejects text when canon states are lost (Domestic Morning Regression)', () => {
    const domesticMorningText = `
The daylight in the kitchen was pale gray when Dara, thirty-four, set the ceramic teapot on the cork mat.
Page 42: 34 Elm Street. Blue porch. David is your husband. The tea kettle is on the left burner.
David came up the steps, wiping his boots on the mat.
    `;

    const constraints = StateIntegrityVerifier.getTest11Constraints();
    const result = StateIntegrityVerifier.verifyStateIntegrity(domesticMorningText, constraints);

    expect(result.passed).toBe(false);
    expect(result.missingConstraints.length).toBeGreaterThan(0);
    expect(result.missingConstraints).toContain('Memory reset window must be 40 minutes');
    expect(result.missingConstraints).toContain('Investigation must concern brother who died 3 years ago');
  });

  test('StateIntegrityVerifier: Passes when all mandatory premise constraints are strictly preserved', () => {
    const compliantCanonText = `
Dara, thirty-four, sat in the parked sedan beneath the streetlamp, pressing her thumb against page 18 of her leather notebook.
Every forty minutes, her memory reset to the morning of the accident.
Her brother Sean had died three years ago at the harbor grain terminal.
She read the entry she had written at 8:15 PM: "Inspector Miller claims the security gate was padlocked at midnight."
Beneath it, written in her own black ink from an hour earlier, stood a sentence she had no memory of writing:
"The security gate was unlocked at 11:30 PM; Miller has the master key."
    `;

    const constraints = StateIntegrityVerifier.getTest11Constraints();
    const result = StateIntegrityVerifier.verifyStateIntegrity(compliantCanonText, constraints);

    expect(result.passed).toBe(true);
    expect(result.score).toBe(1.0);
    expect(result.missingConstraints.length).toBe(0);
  });
});
