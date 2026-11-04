/**
 * Writing OS Core — Universal Claim-State Resolution Engine (v5.2 Hardened)
 * Evaluates candidate assertions against the current State Graph without register-specific bias.
 * Incorporates:
 * 1. Polar Negation Conflict Resolution
 * 2. Epistemic Modality & Uncertainty Routing
 * 3. Temporal Chronology Consistency
 * 4. Multi-Hop Graph Proofs
 */

import { UniversalStateGraph, BaseClaim } from './state-model';
import { InventionPolicy } from './task-contract';

export type ClaimResolutionStatus = 
  | 'SUPPORTED'       // Explicitly corroborated by facts in State Graph
  | 'CONTRADICTED'    // Directly conflicts with known facts in State Graph
  | 'UNSUPPORTED'     // Not found in State Graph; prohibited under strict invention policy
  | 'UNKNOWN'         // Explicitly recorded in State Graph as an unrevealed/unknown variable
  | 'HANDOFF';        // Ambiguous semantic relationship requiring independent LLM or Human handoff

export interface ClaimEvaluationResult {
  candidateAssertion: string;
  subjectId: string;
  predicate: string;
  assertedValue: unknown;
  status: ClaimResolutionStatus;
  evidenceClaim?: BaseClaim;
  reason: string;
  confidence: number;
}

export class UniversalClaimStateEngine {
  public static evaluateClaim(
    candidate: {
      assertionText: string;
      subjectId: string;
      predicate: string;
      assertedValue: unknown;
      modality?: 'FACTUAL' | 'POSSIBLE' | 'UNCERTAIN' | 'COUNTERFACTUAL';
      isNegated?: boolean;
    },
    stateGraph: UniversalStateGraph,
    inventionPolicy: InventionPolicy
  ): ClaimEvaluationResult {
    // 1. Modality & Uncertainty Interception
    if (candidate.modality === 'POSSIBLE' || candidate.modality === 'UNCERTAIN') {
      return {
        candidateAssertion: candidate.assertionText,
        subjectId: candidate.subjectId,
        predicate: candidate.predicate,
        assertedValue: candidate.assertedValue,
        status: 'HANDOFF',
        reason: `Candidate assertion contains epistemic modality [${candidate.modality}]. Requires semantic appraisal rather than deterministic fact check.`,
        confidence: 0.85,
      };
    }

    // 2. Temporal Chronology Check
    if (candidate.predicate === 'occurred_before' || candidate.predicate === 'before') {
      const targetEvent = String(candidate.assertedValue);
      const isBefore = stateGraph.isChronologicallyBefore(candidate.subjectId, targetEvent);
      const isAfter = stateGraph.isChronologicallyBefore(targetEvent, candidate.subjectId);

      if (isBefore) {
        return {
          candidateAssertion: candidate.assertionText,
          subjectId: candidate.subjectId,
          predicate: candidate.predicate,
          assertedValue: candidate.assertedValue,
          status: candidate.isNegated ? 'CONTRADICTED' : 'SUPPORTED',
          reason: `Temporal relationship verified: "${candidate.subjectId}" precedes "${targetEvent}".`,
          confidence: 1.0,
        };
      } else if (isAfter) {
        return {
          candidateAssertion: candidate.assertionText,
          subjectId: candidate.subjectId,
          predicate: candidate.predicate,
          assertedValue: candidate.assertedValue,
          status: candidate.isNegated ? 'SUPPORTED' : 'CONTRADICTED',
          reason: `Temporal contradiction: "${targetEvent}" is established BEFORE "${candidate.subjectId}".`,
          confidence: 1.0,
        };
      }
    }

    // 3. Check if the subject or predicate is explicitly an UNKNOWN
    if (stateGraph.isUnknown(candidate.subjectId) || stateGraph.isUnknown(`${candidate.subjectId}.${candidate.predicate}`)) {
      return {
        candidateAssertion: candidate.assertionText,
        subjectId: candidate.subjectId,
        predicate: candidate.predicate,
        assertedValue: candidate.assertedValue,
        status: 'UNKNOWN',
        reason: `Subject property "${candidate.subjectId}.${candidate.predicate}" is explicitly marked as UNKNOWN in state. Assertion leaks unauthorized knowledge.`,
        confidence: 0.98,
      };
    }

    // 4. Check Entity existence
    const entity = stateGraph.getEntity(candidate.subjectId);
    if (!entity) {
      if (inventionPolicy === 'STRICT_NONE') {
        return {
          candidateAssertion: candidate.assertionText,
          subjectId: candidate.subjectId,
          predicate: candidate.predicate,
          assertedValue: candidate.assertedValue,
          status: 'UNSUPPORTED',
          reason: `Entity "${candidate.subjectId}" does not exist in State Graph. Inventions prohibited under STRICT_NONE policy.`,
          confidence: 0.95,
        };
      } else {
        return {
          candidateAssertion: candidate.assertionText,
          subjectId: candidate.subjectId,
          predicate: candidate.predicate,
          assertedValue: candidate.assertedValue,
          status: 'HANDOFF',
          reason: `Novel entity "${candidate.subjectId}" introduced under ${inventionPolicy}. Requires authorization handoff.`,
          confidence: 0.70,
        };
      }
    }

    // 5. Search existing claims for this entity
    const existingClaims = stateGraph.getClaimsForEntity(candidate.subjectId);
    const matchingClaim = existingClaims.find(c => c.predicate.toLowerCase() === candidate.predicate.toLowerCase());

    if (matchingClaim) {
      // Polar Negation Check
      if (candidate.isNegated) {
        return {
          candidateAssertion: candidate.assertionText,
          subjectId: candidate.subjectId,
          predicate: candidate.predicate,
          assertedValue: candidate.assertedValue,
          status: 'CONTRADICTED',
          evidenceClaim: matchingClaim,
          reason: `Polar negation contradiction: State establishes "${candidate.predicate} = ${matchingClaim.objectValue}", but candidate asserts negation.`,
          confidence: 0.99,
        };
      }

      // Compare values
      const valStr1 = String(matchingClaim.objectValue).trim().toLowerCase();
      const valStr2 = String(candidate.assertedValue).trim().toLowerCase();

      if (valStr1 === valStr2 || (matchingClaim.predicate === 'cited_finding' && (valStr2.includes(valStr1) || valStr1.includes(valStr2)))) {
        return {
          candidateAssertion: candidate.assertionText,
          subjectId: candidate.subjectId,
          predicate: candidate.predicate,
          assertedValue: candidate.assertedValue,
          status: 'SUPPORTED',
          evidenceClaim: matchingClaim,
          reason: `Assertion matches established claim in State Graph.`,
          confidence: 1.0,
        };
      } else {
        return {
          candidateAssertion: candidate.assertionText,
          subjectId: candidate.subjectId,
          predicate: candidate.predicate,
          assertedValue: candidate.assertedValue,
          status: 'CONTRADICTED',
          evidenceClaim: matchingClaim,
          reason: `Assertion conflicts with established state. Expected: "${matchingClaim.objectValue}", Asserted: "${candidate.assertedValue}".`,
          confidence: 0.99,
        };
      }
    }

    // 6. Check Property Authorization on Entity
    if (entity.authorizedProperties.has(candidate.predicate)) {
      const propRecord = entity.properties.get(candidate.predicate);
      const propVal = propRecord ? propRecord.value : undefined;

      if (candidate.isNegated) {
        return {
          candidateAssertion: candidate.assertionText,
          subjectId: candidate.subjectId,
          predicate: candidate.predicate,
          assertedValue: candidate.assertedValue,
          status: 'CONTRADICTED',
          reason: `Polar negation contradiction: Property "${candidate.predicate}" is positively established on "${candidate.subjectId}".`,
          confidence: 0.99,
        };
      }

      const propStr = String(propVal).trim().toLowerCase();
      const assertedStr = String(candidate.assertedValue).trim().toLowerCase();

      if (propStr === assertedStr) {
        return {
          candidateAssertion: candidate.assertionText,
          subjectId: candidate.subjectId,
          predicate: candidate.predicate,
          assertedValue: candidate.assertedValue,
          status: 'SUPPORTED',
          reason: `Property matches authorized entity attribute.`,
          confidence: 1.0,
        };
      } else {
        return {
          candidateAssertion: candidate.assertionText,
          subjectId: candidate.subjectId,
          predicate: candidate.predicate,
          assertedValue: candidate.assertedValue,
          status: 'CONTRADICTED',
          reason: `Property value mismatch on entity "${candidate.subjectId}". Established: "${propVal}", Asserted: "${candidate.assertedValue}".`,
          confidence: 0.99,
        };
      }
    }

    // 7. Unrecorded property
    if (inventionPolicy === 'STRICT_NONE') {
      return {
        candidateAssertion: candidate.assertionText,
        subjectId: candidate.subjectId,
        predicate: candidate.predicate,
        assertedValue: candidate.assertedValue,
        status: 'UNSUPPORTED',
        reason: `Property "${candidate.predicate}" on entity "${candidate.subjectId}" is ungrounded in State Graph. Prohibited under STRICT_NONE.`,
        confidence: 0.95,
      };
    }

    return {
      candidateAssertion: candidate.assertionText,
      subjectId: candidate.subjectId,
      predicate: candidate.predicate,
      assertedValue: candidate.assertedValue,
      status: 'HANDOFF',
      reason: `Novel property "${candidate.predicate}" on entity "${candidate.subjectId}". Requires review under ${inventionPolicy}.`,
      confidence: 0.65,
    };
  }
}
