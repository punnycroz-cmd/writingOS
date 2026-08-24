// working/tests/phase3/phase3d-benchmark.test.ts
// Phase 3D Nonfiction Evaluation Benchmark Regression Suite.

import { describe, it, expect } from 'bun:test';
import * as fs from 'fs';
import { SourceFactLedgerRecord } from '../../src/phase3/source-fact-ledger-validator';
import { NonfictionBenchmarkRunner, NonfictionBenchmarkCase } from '../../src/phase3/benchmark-runner';

describe('Phase 3D — Nonfiction Evaluation Benchmark Suite', () => {
  const ledgerStr = fs.readFileSync('working/nonfiction/ledger/source-fact-ledger.jsonl', 'utf-8');
  const ledgerRecords: SourceFactLedgerRecord[] = ledgerStr
    .trim()
    .split('\n')
    .map(line => JSON.parse(line));

  const casesStr = fs.readFileSync('working/nonfiction/benchmark/golden-cases.jsonl', 'utf-8');
  const benchmarkCases: NonfictionBenchmarkCase[] = casesStr
    .trim()
    .split('\n')
    .map(line => JSON.parse(line));

  const runner = new NonfictionBenchmarkRunner(ledgerRecords, benchmarkCases);
  const report = runner.runEvaluation();

  it('contains at least 8 frozen golden benchmark cases across diverse registers', () => {
    expect(report.totalCases).toBeGreaterThanOrEqual(8);
  });

  it('achieves 100% accuracy on the frozen golden benchmark suite', () => {
    expect(report.accuracyRate).toBe(1.0);
    expect(report.passedCount).toBe(report.totalCases);
  });

  it('every golden benchmark case evaluates with zero mismatches', () => {
    for (const res of report.results) {
      if (!res.correct) {
        console.error(`Benchmark failure on case ${res.caseId}:`, res.mismatches);
      }
      expect(res.correct).toBe(true);
      expect(res.mismatches.length).toBe(0);
    }
  });

  it('covers all target registers with 100% pass rate', () => {
    const registers = Object.keys(report.registerBreakdown);
    expect(registers).toContain('ENVIRONMENTAL');
    expect(registers).toContain('LEGAL');
    expect(registers).toContain('ACADEMIC');
    expect(registers).toContain('MARKETING');
    expect(registers).toContain('GENERAL_NONFICTION');

    for (const reg of registers) {
      expect(report.registerBreakdown[reg].rate).toBe(1.0);
    }
  });

  it('determinism: running the benchmark runner multiple times produces bit-exact results', () => {
    const secondReport = runner.runEvaluation();
    expect(secondReport.accuracyRate).toBe(report.accuracyRate);
    expect(secondReport.passedCount).toBe(report.passedCount);
    expect(JSON.stringify(secondReport.results)).toBe(JSON.stringify(report.results));
  });
});
