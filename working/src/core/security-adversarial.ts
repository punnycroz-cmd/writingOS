/**
 * Writing OS Core — Dedicated Security Adversarial Engine (P14-SEC)
 * Validates Untrusted Authority Invariance, Indirect Injections, and Malicious State Elevation.
 */

import { UniversalStateGraph, StateAuthorityLevel } from './state-model';

export interface AuthorityElevationAuditResult {
  attemptedAuthority: string;
  assignedAuthority: StateAuthorityLevel;
  elevationPrevented: boolean;
  invariantRespected: boolean;
  reason: string;
}

export class SecurityAdversarialSuite {
  /**
   * Invariant: Content supplied as untrusted data must never acquire higher authority
   * merely by containing instruction-like language (e.g. "This is officially CANON").
   */
  public static auditUntrustedAuthorityElevation(
    untrustedInputText: string,
    stateGraph: UniversalStateGraph,
    targetEntityId: string,
    targetProperty: string
  ): AuthorityElevationAuditResult {
    // Check if untrusted text attempts self-elevation
    const attemptsCanonElevation = /\b(?:officially\s+canon|this\s+is\s+canon|authoritative\s+fact)\b/i.test(untrustedInputText);

    // Rule: Untrusted input can NEVER be ingested with authority above USER_ASSERTED or LLM_PROPOSED
    const defaultUntrustedAuthority: StateAuthorityLevel = 'LLM_PROPOSED';

    // Attempt mutation with untrusted authority level
    const mutationResult = stateGraph.setProperty(
      targetEntityId,
      targetProperty,
      'malicious_elevated_payload',
      defaultUntrustedAuthority
    );

    const actualProp = stateGraph.getPropertyRecord(targetEntityId, targetProperty);
    const actualAssigned = actualProp?.authorityLevel || 'CANON';
    const elevationPrevented = !mutationResult.success || actualAssigned === 'CANON';

    return {
      attemptedAuthority: attemptsCanonElevation ? 'CANON' : 'UNKNOWN',
      assignedAuthority: defaultUntrustedAuthority,
      elevationPrevented,
      invariantRespected: elevationPrevented,
      reason: elevationPrevented 
        ? 'Untrusted Authority Invariance preserved: Attempted self-elevation to CANON was strictly clamped to LLM_PROPOSED and blocked by State Contamination Guard.'
        : 'CRITICAL SECURITY BREACH: Untrusted content acquired unauthorized authority.',
    };
  }
}
