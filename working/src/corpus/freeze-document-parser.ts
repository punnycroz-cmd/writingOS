// src/corpus/freeze-document-parser.ts
// Robust parser for extracting canonical metrics from GOLDEN_CORPUS_V1_FREEZE.md.
// Compares parsed values against summary.json. Fails on missing/duplicate/malformed/mismatched metrics.

export interface MetricMismatch {
  metric: string;
  summaryValue: number | undefined;
  freezeDocValue: number | undefined;
  reason: 'MISSING_FROM_FREEZE_DOC' | 'MISSING_FROM_SUMMARY' | 'VALUE_MISMATCH' | 'DUPLICATE' | 'MALFORMED';
}

export interface ParseResult {
  metrics: Map<string, number>;
  errors: string[];
}

export const REQUIRED_METRICS: string[] = [
  'activeCases',
  'scorableTriage',
  'triageCorrect',
  'scorableFinal',
  'finalCorrect',
  'semanticScoringEligible',
  'ioOwnershipScorable',
  'ioOwnershipCorrect',
  'faithfulnessScorable',
  'faithfulnessCorrect',
  'falseAcceptance',
  'falseRejection',
  'r6Cases',
  'executionErrors',
  'llmExecuted',
  'deterministicFastPathed',
];

export function parseFreezeMetrics(content: string): ParseResult {
  const metrics = new Map<string, number>();
  const errors: string[] = [];
  const seen = new Map<string, number>();

  const rowRegex = /\|\s*([a-zA-Z][a-zA-Z0-9]*)\s*\|\s*(\d+)\s*\|/g;
  let match: RegExpExecArray | null;

  while ((match = rowRegex.exec(content)) !== null) {
    const rawName = match[1];
    const valueStr = match[2];
    const value = parseInt(valueStr, 10);

    const metricKey = REQUIRED_METRICS.find(
      (k) => k.toLowerCase() === rawName.toLowerCase()
    );

    if (metricKey === undefined) continue;

    if (isNaN(value)) {
      errors.push(`Malformed value for ${metricKey}: "${valueStr}"`);
      continue;
    }

    const count = seen.get(metricKey) || 0;
    seen.set(metricKey, count + 1);

    if (count > 0) {
      errors.push(`Duplicate metric ${metricKey}: first=${metrics.get(metricKey)}, second=${value}`);
    } else {
      metrics.set(metricKey, value);
    }
  }

  return { metrics, errors };
}

export function compareMetrics(
  parsed: Map<string, number>,
  summary: Record<string, unknown>
): MetricMismatch[] {
  const mismatches: MetricMismatch[] = [];

  for (const key of REQUIRED_METRICS) {
    const freezeValue = parsed.get(key);
    const summaryValue = summary[key];

    if (freezeValue === undefined) {
      mismatches.push({
        metric: key,
        summaryValue: typeof summaryValue === 'number' ? summaryValue : undefined,
        freezeDocValue: undefined,
        reason: 'MISSING_FROM_FREEZE_DOC',
      });
      continue;
    }

    if (typeof summaryValue !== 'number') {
      mismatches.push({
        metric: key,
        summaryValue: undefined,
        freezeDocValue: freezeValue,
        reason: 'MISSING_FROM_SUMMARY',
      });
      continue;
    }

    if (freezeValue !== summaryValue) {
      mismatches.push({
        metric: key,
        summaryValue,
        freezeDocValue: freezeValue,
        reason: 'VALUE_MISMATCH',
      });
    }
  }

  return mismatches;
}

export function validateFreezeDoc(
  freezeDocContent: string,
  summary: Record<string, unknown>
): {
  valid: boolean;
  parsed: Map<string, number>;
  parseErrors: string[];
  mismatches: MetricMismatch[];
  detail: string;
} {
  const { metrics, errors } = parseFreezeMetrics(freezeDocContent);
  const mismatches = compareMetrics(metrics, summary);

  const valid = errors.length === 0 && mismatches.length === 0;

  const parts: string[] = [];
  if (errors.length > 0) parts.push(`${errors.length} parse errors`);
  if (mismatches.length > 0) {
    parts.push(`${mismatches.length} metric mismatches:`);
    for (const m of mismatches) {
      parts.push(`  ${m.metric}: summary=${m.summaryValue} freezeDoc=${m.freezeDocValue} (${m.reason})`);
    }
  }
  if (valid) parts.push('all required metrics match summary');

  return {
    valid,
    parsed: metrics,
    parseErrors: errors,
    mismatches,
    detail: parts.join('\n'),
  };
}
