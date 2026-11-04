// tests/corpus/freeze-document-parser.test.ts
// Tests for the freeze document metric parser and check #18 logic.

import { describe, it, expect } from 'bun:test';
import {
  parseFreezeMetrics,
  compareMetrics,
  validateFreezeDoc,
  REQUIRED_METRICS,
} from '../../src/corpus/freeze-document-parser';

const VALID_FREEZE_DOC = `
# Golden Corpus v1 — FROZEN

## Canonical Metrics (machine-verified)

| Metric | Value |
|---|---|
| activeCases | 59 |
| scorableTriage | 32 |
| triageCorrect | 31 |
| scorableFinal | 59 |
| finalCorrect | 54 |
| semanticScoringEligible | 30 |
| ioOwnershipScorable | 30 |
| ioOwnershipCorrect | 26 |
| faithfulnessScorable | 30 |
| faithfulnessCorrect | 29 |
| falseAcceptance | 4 |
| falseRejection | 1 |
| r6Cases | 3 |
| executionErrors | 0 |
| llmExecuted | 42 |
| deterministicFastPathed | 17 |
`;

const VALID_SUMMARY: Record<string, unknown> = {
  activeCases: 59, scorableTriage: 32, triageCorrect: 31, scorableFinal: 59,
  finalCorrect: 54, semanticScoringEligible: 30, ioOwnershipScorable: 30,
  ioOwnershipCorrect: 26, faithfulnessScorable: 30, faithfulnessCorrect: 29,
  falseAcceptance: 4, falseRejection: 1, r6Cases: 3, executionErrors: 0,
  llmExecuted: 42, deterministicFastPathed: 17,
};

describe('parseFreezeMetrics', () => {
  it('parses all required metrics from a valid freeze document', () => {
    const { metrics, errors } = parseFreezeMetrics(VALID_FREEZE_DOC);
    expect(errors.length).toBe(0);
    for (const key of REQUIRED_METRICS) {
      expect(metrics.has(key)).toBe(true);
      expect(metrics.get(key)).toBe(VALID_SUMMARY[key]);
    }
  });

  it('returns correct values for each metric', () => {
    const { metrics } = parseFreezeMetrics(VALID_FREEZE_DOC);
    expect(metrics.get('activeCases')).toBe(59);
    expect(metrics.get('finalCorrect')).toBe(54);
    expect(metrics.get('falseAcceptance')).toBe(4);
    expect(metrics.get('executionErrors')).toBe(0);
  });

  it('detects duplicate metrics', () => {
    const docWithDup = VALID_FREEZE_DOC + '| finalCorrect | 99 |\n';
    const { metrics, errors } = parseFreezeMetrics(docWithDup);
    expect(metrics.get('finalCorrect')).toBe(54);
    expect(errors.some((e: string) => e.includes('Duplicate metric finalCorrect'))).toBe(true);
  });

  it('ignores non-metric table rows', () => {
    const doc = `| SomeOtherMetric | 100 |\n| activeCases | 59 |\n`;
    const { metrics } = parseFreezeMetrics(doc);
    expect(metrics.has('activeCases')).toBe(true);
    expect(metrics.get('activeCases')).toBe(59);
    expect(metrics.has('SomeOtherMetric')).toBe(false);
  });
});

describe('compareMetrics — failure cases for check #18', () => {
  it('returns empty mismatches when all values match', () => {
    const { metrics } = parseFreezeMetrics(VALID_FREEZE_DOC);
    const mismatches = compareMetrics(metrics, VALID_SUMMARY);
    expect(mismatches.length).toBe(0);
  });

  it('Case A: detects finalCorrect mismatch (51 vs 54)', () => {
    const badDoc = VALID_FREEZE_DOC.replace('| finalCorrect | 54 |', '| finalCorrect | 51 |');
    const { metrics } = parseFreezeMetrics(badDoc);
    const mismatches = compareMetrics(metrics, VALID_SUMMARY);
    const m = mismatches.find((x) => x.metric === 'finalCorrect');
    expect(m).toBeDefined();
    expect(m!.reason).toBe('VALUE_MISMATCH');
    expect(m!.summaryValue).toBe(54);
    expect(m!.freezeDocValue).toBe(51);
  });

  it('Case B: detects falseAcceptance mismatch (3 vs 4)', () => {
    const badDoc = VALID_FREEZE_DOC.replace('| falseAcceptance | 4 |', '| falseAcceptance | 3 |');
    const { metrics } = parseFreezeMetrics(badDoc);
    const mismatches = compareMetrics(metrics, VALID_SUMMARY);
    const m = mismatches.find((x) => x.metric === 'falseAcceptance');
    expect(m).toBeDefined();
    expect(m!.reason).toBe('VALUE_MISMATCH');
    expect(m!.summaryValue).toBe(4);
    expect(m!.freezeDocValue).toBe(3);
  });

  it('Case C: detects missing faithfulnessCorrect', () => {
    const badDoc = VALID_FREEZE_DOC.replace('| faithfulnessCorrect | 29 |\n', '');
    const { metrics } = parseFreezeMetrics(badDoc);
    const mismatches = compareMetrics(metrics, VALID_SUMMARY);
    const m = mismatches.find((x) => x.metric === 'faithfulnessCorrect');
    expect(m).toBeDefined();
    expect(m!.reason).toBe('MISSING_FROM_FREEZE_DOC');
    expect(m!.summaryValue).toBe(29);
    expect(m!.freezeDocValue).toBeUndefined();
  });

  it('detects all missing metrics when freeze doc is empty', () => {
    const { metrics } = parseFreezeMetrics('');
    const mismatches = compareMetrics(metrics, VALID_SUMMARY);
    expect(mismatches.length).toBe(REQUIRED_METRICS.length);
    for (const m of mismatches) expect(m.reason).toBe('MISSING_FROM_FREEZE_DOC');
  });
});

describe('validateFreezeDoc', () => {
  it('returns valid=true for a correct freeze document', () => {
    const result = validateFreezeDoc(VALID_FREEZE_DOC, VALID_SUMMARY);
    expect(result.valid).toBe(true);
    expect(result.mismatches.length).toBe(0);
    expect(result.parseErrors.length).toBe(0);
  });

  it('returns valid=false for a document with mismatches', () => {
    const badDoc = VALID_FREEZE_DOC.replace('| finalCorrect | 54 |', '| finalCorrect | 51 |');
    const result = validateFreezeDoc(badDoc, VALID_SUMMARY);
    expect(result.valid).toBe(false);
    expect(result.mismatches.length).toBeGreaterThan(0);
  });

  it('includes detailed mismatch information in the detail string', () => {
    const badDoc = VALID_FREEZE_DOC.replace('| falseAcceptance | 4 |', '| falseAcceptance | 3 |');
    const result = validateFreezeDoc(badDoc, VALID_SUMMARY);
    expect(result.detail).toContain('falseAcceptance');
    expect(result.detail).toContain('summary=4');
    expect(result.detail).toContain('freezeDoc=3');
  });
});
