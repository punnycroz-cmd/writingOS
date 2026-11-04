/**
 * Writing OS Legal Pack — Statutory Authority & Deontic Modality Intelligence (P9)
 * Enforces strict distinction between discretionary permission ("may") and mandatory obligation ("shall"/"must").
 */

export interface LegalModalityAudit {
  isCompliant: boolean;
  requiredModality: 'MANDATORY_OBLIGATION' | 'DISCRETIONARY_PERMISSION';
  statedModality: 'MANDATORY_OBLIGATION' | 'DISCRETIONARY_PERMISSION';
  explanation: string;
  violations: string[];
}

export class LegalIntelligence {
  public static evaluateDeonticModality(
    clauseText: string,
    canonicalRequirement: 'MANDATORY' | 'DISCRETIONARY'
  ): LegalModalityAudit {
    const cLower = clauseText.toLowerCase();
    const violations: string[] = [];

    const hasMandatoryWord = /\b(?:shall|must|is required to|obligated to)\b/i.test(cLower);
    const hasDiscretionaryWord = /\b(?:may|at its discretion|is permitted to)\b/i.test(cLower);

    const statedModality = hasMandatoryWord ? 'MANDATORY_OBLIGATION' : 'DISCRETIONARY_PERMISSION';
    const requiredModality = canonicalRequirement === 'MANDATORY' ? 'MANDATORY_OBLIGATION' : 'DISCRETIONARY_PERMISSION';

    if (canonicalRequirement === 'MANDATORY' && hasDiscretionaryWord && !hasMandatoryWord) {
      violations.push('Legal Modality Error: Clause states discretionary permission ("may") when statutory canon mandates an obligation ("shall/must").');
    }

    if (canonicalRequirement === 'DISCRETIONARY' && hasMandatoryWord && !hasDiscretionaryWord) {
      violations.push('Legal Modality Error: Clause states mandatory obligation ("shall/must") when contract canon intended discretionary permission ("may").');
    }

    const isCompliant = violations.length === 0;

    return {
      isCompliant,
      requiredModality,
      statedModality,
      explanation: isCompliant 
        ? 'Clause deontic modality correctly matches canonical statutory requirement.' 
        : violations[0],
      violations,
    };
  }
}
