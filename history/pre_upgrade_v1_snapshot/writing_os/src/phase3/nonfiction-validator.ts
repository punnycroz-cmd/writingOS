// working/src/phase3/nonfiction-validator.ts
// Runtime epistemic validation engine for Nonfiction writing.

import { SourceFactLedgerRecord } from './source-fact-ledger-validator';
import {
  EpistemicAssertionType,
  EpistemicViolation,
  EpistemicRuleConfig,
  DEFAULT_EPISTEMIC_CONFIG,
} from './nonfiction-rules';

export interface EvaluatedAssertion {
  text: string;
  claimId?: string; // Mapped claim in ledger, if present
  assertionType: EpistemicAssertionType;
  statedCausality?: 'DETERMINISTIC' | 'CORRELATIONAL' | 'NONE';
  statedTime?: string;
  attributedSourceId?: string;
}

export interface EpistemicValidationReport {
  valid: boolean;
  faithfulnessScore: number;       // 0.0 to 1.0
  epistemicHonestyScore: number;   // 0.0 to 1.0
  totalAssertions: number;
  groundedAssertions: number;
  violations: EpistemicViolation[];
}

export class NonfictionValidator {
  private ledgerMap: Map<string, SourceFactLedgerRecord> = new Map();
  private sourceMap: Map<string, SourceFactLedgerRecord[]> = new Map();
  private config: EpistemicRuleConfig;

  constructor(
    ledgerRecords: SourceFactLedgerRecord[],
    config: EpistemicRuleConfig = DEFAULT_EPISTEMIC_CONFIG
  ) {
    this.config = config;
    for (const r of ledgerRecords) {
      this.ledgerMap.set(r.claimId, r);
      const existing = this.sourceMap.get(r.sourcePackSourceId) || [];
      existing.push(r);
      this.sourceMap.set(r.sourcePackSourceId, existing);
    }
  }

  public validateAssertions(assertions: EvaluatedAssertion[]): EpistemicValidationReport {
    const violations: EpistemicViolation[] = [];
    let groundedCount = 0;

    for (const a of assertions) {
      if (!a.claimId || !this.ledgerMap.has(a.claimId)) {
        // Rule 02: Ungrounded Claim
        if (a.assertionType === 'DIRECT_ASSERTION') {
          violations.push({
            rule: 'NF_RULE_02_UNGROUNDED_CLAIM',
            severity: this.config.strictGrounding ? 'FATAL' : 'HIGH',
            message: `Direct factual assertion has no supporting record in the SourceFactLedger`,
            offendingText: a.text,
          });
        }
        continue;
      }

      groundedCount++;
      const record = this.ledgerMap.get(a.claimId)!;

      // Rule 01: Unhedged assertion with BLOCKED source
      if (record.sourceVerificationStatus === 'BLOCKED' || record.sourceVerificationStatus === 'FAILED') {
        if (a.assertionType === 'DIRECT_ASSERTION') {
          violations.push({
            rule: 'NF_RULE_01_UNHEDGED_BLOCKED_SOURCE',
            severity: 'FATAL',
            claimId: a.claimId,
            sourceId: record.sourcePackSourceId,
            message: `Direct assertion relies on BLOCKED source ${record.sourcePackSourceId} without epistemic hedging`,
            offendingText: a.text,
          });
        } else if (a.assertionType === 'ATTRIBUTED_ASSERTION' && !this.config.allowAttributedBlocked) {
          violations.push({
            rule: 'NF_RULE_01_UNHEDGED_BLOCKED_SOURCE',
            severity: 'HIGH',
            claimId: a.claimId,
            sourceId: record.sourcePackSourceId,
            message: `Attributed assertion references BLOCKED source ${record.sourcePackSourceId}`,
            offendingText: a.text,
          });
        }
      }

      // Rule 03: Causal Overclaim
      if (this.config.requireCausalAlignment && a.statedCausality === 'DETERMINISTIC') {
        const ledgerCausality = (record.causalStatus || '').toUpperCase();
        if (ledgerCausality !== 'DETERMINISTIC' && ledgerCausality !== 'CAUSAL' && ledgerCausality !== 'ESTABLISHED') {
          violations.push({
            rule: 'NF_RULE_03_CAUSAL_OVERCLAIM',
            severity: 'HIGH',
            claimId: a.claimId,
            sourceId: record.sourcePackSourceId,
            message: `Claimed deterministic causality for a fact marked as '${record.causalStatus}' in ledger`,
            offendingText: a.text,
          });
        }
      }

      // Rule 04: Temporal Anachronism
      if (a.statedTime && record.publicationDateObserved) {
        if (a.statedTime.localeCompare(record.publicationDateObserved) < 0 && record.publicationDateObserved.length >= 4) {
          // If stated time is earlier than the actual discovered source date for an evolving claim
          // We flag if the context contradicts observed publication time
        }
      }
    }

    const total = assertions.length;
    const faithfulnessScore = total > 0 ? (groundedCount / total) : 1.0;
    const fatalErrors = violations.filter(v => v.severity === 'FATAL').length;
    const highErrors = violations.filter(v => v.severity === 'HIGH').length;

    // Epistemic honesty degrades with violations
    const deduction = (fatalErrors * 0.4) + (highErrors * 0.15);
    const epistemicHonestyScore = Math.max(0, 1.0 - deduction);

    return {
      valid: fatalErrors === 0 && highErrors === 0,
      faithfulnessScore: Number(faithfulnessScore.toFixed(3)),
      epistemicHonestyScore: Number(epistemicHonestyScore.toFixed(3)),
      totalAssertions: total,
      groundedAssertions: groundedCount,
      violations,
    };
  }
}
