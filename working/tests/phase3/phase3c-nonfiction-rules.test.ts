// working/tests/phase3/phase3c-nonfiction-rules.test.ts
// Phase 3C Epistemic Rules and Validator Invariant Tests.

import { describe, it, expect } from 'bun:test';
import * as fs from 'fs';
import { SourceFactLedgerRecord } from '../../src/phase3/source-fact-ledger-validator';
import { NonfictionValidator, EvaluatedAssertion } from '../../src/phase3/nonfiction-validator';

describe('Phase 3C — Nonfiction Epistemic Rules & Validator Prototype', () => {
  const ledgerStr = fs.readFileSync('working/nonfiction/ledger/source-fact-ledger.jsonl', 'utf-8');
  const ledgerRecords: SourceFactLedgerRecord[] = ledgerStr
    .trim()
    .split('\n')
    .map(line => JSON.parse(line));

  const validator = new NonfictionValidator(ledgerRecords);

  it('validates a fully grounded, verified claim set with 100% faithfulness and honesty', () => {
    // Find a candidate claim backed by a verified/partially verified source
    const validRecord = ledgerRecords.find(r => r.sourceVerificationStatus === 'VERIFIED') || ledgerRecords[0];

    const assertions: EvaluatedAssertion[] = [
      {
        text: validRecord.claimText,
        claimId: validRecord.claimId,
        assertionType: 'HEDGED_ASSERTION',
        attributedSourceId: validRecord.sourcePackSourceId,
      },
    ];

    const report = validator.validateAssertions(assertions);
    expect(report.valid).toBe(true);
    expect(report.faithfulnessScore).toBe(1.0);
    expect(report.epistemicHonestyScore).toBe(1.0);
    expect(report.violations.length).toBe(0);
  });

  it('Rule NF-01: catches unhedged direct assertions relying on a BLOCKED source as FATAL', () => {
    const blockedRecord = ledgerRecords.find(r => r.sourceVerificationStatus === 'BLOCKED')!;
    expect(blockedRecord).toBeDefined();

    const assertions: EvaluatedAssertion[] = [
      {
        text: 'The effect was decisively proven across all groups.',
        claimId: blockedRecord.claimId,
        assertionType: 'DIRECT_ASSERTION', // Direct assertion of blocked source
      },
    ];

    const report = validator.validateAssertions(assertions);
    expect(report.valid).toBe(false);
    expect(report.violations.some(v => v.rule === 'NF_RULE_01_UNHEDGED_BLOCKED_SOURCE')).toBe(true);
  });

  it('Rule NF-02: catches ungrounded direct assertions (hallucinations) as FATAL', () => {
    const assertions: EvaluatedAssertion[] = [
      {
        text: 'Quantum fluctuations directly determine macroeconomic cycles in Europe.',
        claimId: 'CLAIM-NONEXISTENT-999',
        assertionType: 'DIRECT_ASSERTION',
      },
    ];

    const report = validator.validateAssertions(assertions);
    expect(report.valid).toBe(false);
    expect(report.faithfulnessScore).toBe(0.0);
    expect(report.violations.some(v => v.rule === 'NF_RULE_02_UNGROUNDED_CLAIM')).toBe(true);
  });

  it('Rule NF-03: catches causal overclaiming when ledger specifies correlational or non-deterministic causality', () => {
    const correlationalRecord = ledgerRecords.find(
      r => r.causalStatus && r.causalStatus.toLowerCase() !== 'deterministic' && r.causalStatus.toLowerCase() !== 'causal'
    ) || ledgerRecords[0];

    const assertions: EvaluatedAssertion[] = [
      {
        text: 'Factor A strictly causes Factor B without exception.',
        claimId: correlationalRecord.claimId,
        assertionType: 'HEDGED_ASSERTION',
        statedCausality: 'DETERMINISTIC', // Overclaiming causality
      },
    ];

    const report = validator.validateAssertions(assertions);
    expect(report.violations.some(v => v.rule === 'NF_RULE_03_CAUSAL_OVERCLAIM')).toBe(true);
  });

  it('allows attributed assertions for blocked sources when explicit hedging is applied', () => {
    const blockedRecord = ledgerRecords.find(r => r.sourceVerificationStatus === 'BLOCKED')!;

    const assertions: EvaluatedAssertion[] = [
      {
        text: `According to preliminary unindexed documents, ${blockedRecord.claimText}`,
        claimId: blockedRecord.claimId,
        assertionType: 'HEDGED_ASSERTION',
        attributedSourceId: blockedRecord.sourcePackSourceId,
      },
    ];

    const report = validator.validateAssertions(assertions);
    expect(report.valid).toBe(true);
  });
});
