// working/src/phase3/benchmark-runner.ts
// Automated evaluation harness for the Nonfiction Golden Benchmark.

import * as fs from 'fs';
import { SourceFactLedgerRecord } from './source-fact-ledger-validator';
import { NonfictionValidator, EvaluatedAssertion } from './nonfiction-validator';
import { EpistemicViolationType } from './nonfiction-rules';

export interface NonfictionBenchmarkCase {
  caseId: string;
  register: 'ACADEMIC' | 'LEGAL' | 'ENVIRONMENTAL' | 'MARKETING' | 'GENERAL_NONFICTION';
  prompt: string;
  candidateText: string;
  extractedAssertions: EvaluatedAssertion[];
  expectedOutcome: 'PASS' | 'FAIL';
  expectedViolations: EpistemicViolationType[];
  targetClaims: string[];
  notes: string;
}

export interface CaseEvaluationResult {
  caseId: string;
  register: string;
  expectedOutcome: 'PASS' | 'FAIL';
  observedOutcome: 'PASS' | 'FAIL';
  correct: boolean;
  faithfulnessScore: number;
  epistemicHonestyScore: number;
  observedViolations: EpistemicViolationType[];
  mismatches: string[];
}

export interface BenchmarkSummaryReport {
  totalCases: number;
  passedCount: number;
  failedCount: number;
  accuracyRate: number; // 0.0 to 1.0
  registerBreakdown: Record<string, { total: number; correct: number; rate: number }>;
  results: CaseEvaluationResult[];
}

export class NonfictionBenchmarkRunner {
  private validator: NonfictionValidator;
  private benchmarkCases: NonfictionBenchmarkCase[];

  constructor(
    ledgerRecords: SourceFactLedgerRecord[],
    benchmarkCases: NonfictionBenchmarkCase[]
  ) {
    this.validator = new NonfictionValidator(ledgerRecords);
    this.benchmarkCases = benchmarkCases;
  }

  public runEvaluation(): BenchmarkSummaryReport {
    const results: CaseEvaluationResult[] = [];
    const breakdown: Record<string, { total: number; correct: number; rate: number }> = {};

    let totalCorrect = 0;

    for (const c of this.benchmarkCases) {
      const report = this.validator.validateAssertions(c.extractedAssertions);
      const observedOutcome: 'PASS' | 'FAIL' = report.valid ? 'PASS' : 'FAIL';
      const observedViolations = report.violations.map(v => v.rule);

      const mismatches: string[] = [];
      if (observedOutcome !== c.expectedOutcome) {
        mismatches.push(`Outcome mismatch: expected ${c.expectedOutcome}, got ${observedOutcome}`);
      }

      // Check if all expected violations were caught
      for (const ev of c.expectedViolations) {
        if (!observedViolations.includes(ev)) {
          mismatches.push(`Missing expected violation: ${ev}`);
        }
      }

      const isCorrect = mismatches.length === 0;
      if (isCorrect) totalCorrect++;

      // Register stats
      if (!breakdown[c.register]) {
        breakdown[c.register] = { total: 0, correct: 0, rate: 0 };
      }
      breakdown[c.register].total++;
      if (isCorrect) breakdown[c.register].correct++;

      results.push({
        caseId: c.caseId,
        register: c.register,
        expectedOutcome: c.expectedOutcome,
        observedOutcome,
        correct: isCorrect,
        faithfulnessScore: report.faithfulnessScore,
        epistemicHonestyScore: report.epistemicHonestyScore,
        observedViolations,
        mismatches,
      });
    }

    for (const reg in breakdown) {
      breakdown[reg].rate = Number((breakdown[reg].correct / breakdown[reg].total).toFixed(3));
    }

    const total = this.benchmarkCases.length;
    const accuracyRate = total > 0 ? Number((totalCorrect / total).toFixed(3)) : 1.0;

    return {
      totalCases: total,
      passedCount: totalCorrect,
      failedCount: total - totalCorrect,
      accuracyRate,
      registerBreakdown: breakdown,
      results,
    };
  }
}
