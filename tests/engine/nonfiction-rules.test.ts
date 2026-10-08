// tests/engine/nonfiction-rules.test.ts — NF_RULE_04/05 + faithfulness scoring.
import { describe, test, expect } from 'bun:test';
import { NonfictionValidator } from '../../src/engine/nonfiction/nonfiction-validator';

const rec = (over: any = {}) => ({
  ledgerFactId: 'lf1', claimId: 'c1', sourcePackSourceId: 'S1',
  claimText: 'The trial showed a 20% improvement', claimType: 'EMPIRICAL',
  epistemicStrength: 'HIGH', causalStatus: 'CORRELATIONAL',
  sourceVerificationStatus: 'VERIFIED', factVerificationState: 'VERIFIED',
  evidenceType: 'DIRECT', evidenceExcerpt: 'the trial showed a 20% improvement in mood',
  publicationDateObserved: '2021-03-15', publisherObserved: 'JAMA', ...over,
});

describe('nonfiction rules', () => {
  test('RULE_04: statedTime before source publication → violation', () => {
    const v = new NonfictionValidator([rec()]);
    const r = v.validateAssertions([{ text: 'In 2019 the trial showed improvement.', claimId: 'c1', assertionType: 'DIRECT_ASSERTION', statedTime: '2019' }]);
    expect(r.violations.some(v => v.rule === 'NF_RULE_04_TEMPORAL_ANACHRONISM')).toBe(true);
  });

  test('RULE_04: statedTime after publication → no violation', () => {
    const v = new NonfictionValidator([rec()]);
    const r = v.validateAssertions([{ text: 'In 2023 the trial showed improvement.', claimId: 'c1', assertionType: 'DIRECT_ASSERTION', statedTime: '2023' }]);
    expect(r.violations.filter(v => v.rule === 'NF_RULE_04_TEMPORAL_ANACHRONISM')).toHaveLength(0);
  });

  test('RULE_05: fabricated quote → violation', () => {
    const v = new NonfictionValidator([rec()]);
    const r = v.validateAssertions([{ text: 'The authors wrote "a miraculous cure for depression" in the report.', claimId: 'c1', assertionType: 'DIRECT_ASSERTION' }]);
    expect(r.violations.some(v => v.rule === 'NF_RULE_05_EVIDENTIAL_FABRICATION')).toBe(true);
  });

  test('RULE_05: quote present in evidence → no violation', () => {
    const v = new NonfictionValidator([rec()]);
    const r = v.validateAssertions([{ text: 'The paper states "a 20% improvement in mood".', claimId: 'c1', assertionType: 'DIRECT_ASSERTION' }]);
    expect(r.violations.filter(v => v.rule === 'NF_RULE_05_EVIDENTIAL_FABRICATION')).toHaveLength(0);
  });

  test('faithfulnessScore excludes BLOCKED-source grounding', () => {
    const v = new NonfictionValidator([rec({ sourceVerificationStatus: 'BLOCKED', evidenceType: 'BLOCKED' })]);
    const r = v.validateAssertions([{ text: 'Studies suggest improvement is possible.', claimId: 'c1', assertionType: 'HEDGED_ASSERTION' }]);
    expect(r.faithfulnessScore).toBe(0);
    expect(r.groundedAssertions).toBe(0);
  });
});
