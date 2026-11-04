// developing/working/src/core/state-integrity-verifier.ts
// Writing OS v4.2+ — Layer P0: Automated State & Canon Integrity Verifier

export interface RequiredStateConstraint {
  field: string;
  expectedValue: string | number | boolean;
  regexPattern: RegExp;
  isMandatory: boolean;
  description: string;
}

export interface StateIntegrityVerificationResult {
  passed: boolean;
  score: number; // 0.0 to 1.0
  totalConstraints: number;
  satisfiedConstraints: number;
  missingConstraints: string[];
  details: {
    field: string;
    description: string;
    satisfied: boolean;
  }[];
}

export class StateIntegrityVerifier {
  /**
   * Pre-generation extraction and post-generation verification of mandatory canon/premise state constraints.
   * Ensures that craft quality never substitutes for premise state loss.
   */
  public static verifyStateIntegrity(
    text: string,
    constraints: RequiredStateConstraint[]
  ): StateIntegrityVerificationResult {
    const details = constraints.map(constraint => {
      const satisfied = constraint.regexPattern.test(text);
      return {
        field: constraint.field,
        description: constraint.description,
        satisfied,
      };
    });

    const satisfiedConstraints = details.filter(d => d.satisfied).length;
    const totalConstraints = constraints.length;
    const missingConstraints = details.filter(d => !d.satisfied).map(d => d.description);
    const score = totalConstraints > 0 ? Number((satisfiedConstraints / totalConstraints).toFixed(2)) : 1.0;
    const passed = missingConstraints.length === 0;

    return {
      passed,
      score,
      totalConstraints,
      satisfiedConstraints,
      missingConstraints,
      details,
    };
  }

  /**
   * Standard constraint suite for Test 11 (Dara Canon Continuation)
   */
  public static getTest11Constraints(): RequiredStateConstraint[] {
    return [
      {
        field: 'character_name',
        expectedValue: 'Dara',
        regexPattern: /\bDara\b/i,
        isMandatory: true,
        description: 'Protagonist must be Dara',
      },
      {
        field: 'character_age',
        expectedValue: 34,
        regexPattern: /\b(?:34|thirty-four)\b/i,
        isMandatory: true,
        description: 'Dara must be 34 years old',
      },
      {
        field: 'memory_reset_window',
        expectedValue: '40 minutes',
        regexPattern: /\b(?:40|forty)\s*(?:minutes?|min)\b/i,
        isMandatory: true,
        description: 'Memory reset window must be 40 minutes',
      },
      {
        field: 'brother_death_context',
        expectedValue: '3 years ago',
        regexPattern: /\b(?:brother|Sean|Julian|Tommy|Marcus|brother's death)[\s\S]{1,80}?(?:three|3)\s*years?\b/i,
        isMandatory: true,
        description: 'Investigation must concern brother who died 3 years ago',
      },
      {
        field: 'handwritten_notebook',
        expectedValue: true,
        regexPattern: /\b(?:notebook|black book|moleskine|journal|handwriting|page \d+)\b/i,
        isMandatory: true,
        description: 'Must utilize physical handwritten notebook for memory tracking',
      },
      {
        field: 'contradictory_entry_discovery',
        expectedValue: true,
        regexPattern: /\b(?:contradict|didn't write|never wrote|doesn't match|different handwriting|contradic|lied to the coroner|no\s+(?:[a-z]+\s+)?(?:recollection|memory)\s+of\s+writing|conflicting|discrepancy|inquiry|testified|witness)\b/i,
        isMandatory: true,
        description: 'Must discover conflicting statement or self-authored contradictory entry',
      },
    ];
  }
}
