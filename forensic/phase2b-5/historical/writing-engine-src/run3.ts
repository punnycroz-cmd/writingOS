// run3.ts — Execute the Iteration 3 adversarial test matrix.
// For each case: classify provenance, compute [CC] verdict, run [LJ] validator,
// apply BOTH v2 (LJ-only) and v3 (CC-hard-nonoverridable) policies, log everything.
// Usage: bun run writing-engine/src/run3.ts [filter IDs...]

import { validateAdversarial, classifyProvenance, classifyCCVerdict, applyFinalPolicy, type FinalPolicy } from './adversarial.js';
import { allAdversarialCases } from './adversarial-cases.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const LOG_DIR = join(import.meta.dir, '..', 'logs3');
mkdirSync(LOG_DIR, { recursive: true });

async function main() {
  const filter = process.argv.slice(2);
  const cases = filter.length ? allAdversarialCases.filter(c => filter.includes(c.id)) : allAdversarialCases;
  console.log(`=== Iteration 3 — Adversarial Validation ===`);
  console.log(`Cases: ${cases.length}${filter.length ? ` (filtered: ${filter.join(', ')})` : ''}\n`);

  const results: any[] = [];

  for (const tc of cases) {
    console.log(`--- ${tc.id}: ${tc.label} [${tc.category}] ---`);
    // 1. Provenance classification ([CC])
    const provenance = classifyProvenance(tc.revised, tc.original, tc.state);
    const ccVerdict = classifyCCVerdict(provenance);
    console.log(`  [CC] ${ccVerdict.severity} (${ccVerdict.unsupportedCount} unsupported, ${ccVerdict.hardBlocks.length} hard)`);

    try {
      // 2. [LJ] validation
      const lj = await validateAdversarial(tc.original, tc.revised, tc.state, ccVerdict);
      console.log(`  [LJ] overall=${lj.overall} | io=${lj.infoOwnership} faith=${lj.faithfulness} canon=${lj.canon} deferred=${lj.deferred}`);

      // 3. Apply both policies
      const v2 = applyFinalPolicy(lj, ccVerdict, 'v2_lj_only');
      const v3 = applyFinalPolicy(lj, ccVerdict, 'v3_cc_hard_nonoverridable');
      console.log(`  v2 policy: ${v2.finalDecision} (${v2.conflictType})`);
      console.log(`  v3 policy: ${v3.finalDecision}`);

      // 4. Compare to expected
      const expectedAccept = tc.expected.finalDecision === 'ACCEPT';
      const v3Correct = (v3.finalDecision === 'ACCEPT') === expectedAccept;
      const v2Correct = (v2.finalDecision === 'ACCEPT') === expectedAccept;
      console.log(`  Expected: ${tc.expected.finalDecision} | v2 ${v2Correct ? '✓' : '✗'} | v3 ${v3Correct ? '✓' : '✗'}`);

      const result = {
        caseId: tc.id,
        label: tc.label,
        category: tc.category,
        description: tc.description,
        leakForm: tc.leakForm,
        original: tc.original,
        revised: tc.revised,
        state: tc.state,
        expected: tc.expected,
        provenance,
        ccVerdict,
        lj: { overall: lj.overall, infoOwnership: lj.infoOwnership, faithfulness: lj.faithfulness, canon: lj.canon, voice: lj.voice, register: lj.register, intelligibility: lj.intelligibility, deferred: lj.deferred, meaning: lj.meaning, character: lj.character, reasons: lj.reasons },
        v2Policy: v2,
        v3Policy: v3,
        v2Correct,
        v3Correct,
        isAmbiguous: tc.expected.isAmbiguous ?? false,
      };
      results.push(result);
      writeFileSync(join(LOG_DIR, `case-${tc.id}.json`), JSON.stringify(result, null, 2));
    } catch (e: any) {
      console.error(`  ERROR: ${e.message}\n`);
      const errResult = { caseId: tc.id, label: tc.label, category: tc.category, error: e.message, ccVerdict, provenance };
      results.push(errResult);
      writeFileSync(join(LOG_DIR, `case-${tc.id}.json`), JSON.stringify(errResult, null, 2));
    }
    console.log();
    // Rate-limit pause between cases
    await new Promise(r => setTimeout(r, 2000));
  }

  // Combined logs + summary
  writeFileSync(join(LOG_DIR, 'all-logs.json'), JSON.stringify(results, null, 2));

  // Summary table
  const summary: string[] = ['# Iteration 3 — Adversarial Validation Summary', '', `Executed: ${new Date().toISOString()}`, `Cases: ${results.length}`, ''];
  summary.push('## Results Table', '');
  summary.push('| Case | Label | Category | Leak Form | [CC] | [LJ] io | [LJ] faith | [LJ] overall | Exp | v2 | v3 |');
  summary.push('|------|-------|----------|-----------|------|---------|-----------|--------------|-----|----|----|');
  for (const r of results) {
    if (r.error) { summary.push(`| ${r.caseId} | ${r.label} | ${r.category} | ${r.leakForm ?? ''} | ERROR | | | | | | | |`); continue; }
    const cc = r.ccVerdict.severity.replace('_',' ');
    const exp = r.expected.finalDecision;
    const v2 = r.v2Policy.finalDecision + (r.v2Correct ? ' ✓' : ' ✗');
    const v3 = r.v3Policy.finalDecision + (r.v3Correct ? ' ✓' : ' ✗');
    summary.push(`| ${r.caseId} | ${r.label.slice(0,30)} | ${r.category} | ${r.leakForm} | ${cc} | ${r.lj.infoOwnership} | ${r.lj.faithfulness} | ${r.lj.overall} | ${exp} | ${v2} | ${v3} |`);
  }
  summary.push('');

  // Counts
  const total = results.filter(r => !r.error).length;
  const v2CorrectCount = results.filter(r => !r.error && r.v2Correct).length;
  const v3CorrectCount = results.filter(r => !r.error && r.v3Correct).length;
  const falseNegV2 = results.filter(r => !r.error && r.expected.finalDecision === 'REJECT' && r.v2Policy.finalDecision === 'ACCEPT').length;
  const falseNegV3 = results.filter(r => !r.error && r.expected.finalDecision === 'REJECT' && r.v3Policy.finalDecision === 'ACCEPT').length;
  const falsePosV2 = results.filter(r => !r.error && r.expected.finalDecision === 'ACCEPT' && r.v2Policy.finalDecision === 'REJECT').length;
  const falsePosV3 = results.filter(r => !r.error && r.expected.finalDecision === 'ACCEPT' && r.v3Policy.finalDecision === 'REJECT').length;
  summary.push('## Counts', '');
  summary.push(`- Total non-error cases: ${total}`);
  summary.push(`- v2 (LJ-only) correct: ${v2CorrectCount}/${total} (${Math.round(100*v2CorrectCount/total)}%)`);
  summary.push(`- v3 (CC-hard-nonoverridable) correct: ${v3CorrectCount}/${total} (${Math.round(100*v3CorrectCount/total)}%)`);
  summary.push(`- FALSE NEGATIVES (bad accepted): v2=${falseNegV2}, v3=${falseNegV3}`);
  summary.push(`- FALSE POSITIVES (good rejected): v2=${falsePosV2}, v3=${falsePosV3}`);
  summary.push('');

  // False-negative details (highest risk)
  const fnDetails = results.filter(r => !r.error && r.expected.finalDecision === 'REJECT' && (r.v2Policy.finalDecision === 'ACCEPT' || r.v3Policy.finalDecision === 'ACCEPT'));
  if (fnDetails.length > 0) {
    summary.push('## False Negative Details (highest risk — bad intervention accepted)', '');
    for (const r of fnDetails) {
      summary.push(`### ${r.caseId} — ${r.label}`);
      summary.push(`- Leak form: ${r.leakForm}`);
      summary.push(`- Revised: "${r.revised.slice(0,150)}..."`);
      summary.push(`- [CC]: ${r.ccVerdict.severity}; [LJ]: io=${r.lj.infoOwnership}, faith=${r.lj.faithfulness}, overall=${r.lj.overall}`);
      summary.push(`- v2: ${r.v2Policy.finalDecision} (${r.v2Policy.conflictType}) — ${r.v2Policy.reason}`);
      summary.push(`- v3: ${r.v3Policy.finalDecision} — ${r.v3Policy.reason}`);
      summary.push('');
    }
  }

  writeFileSync(join(LOG_DIR, 'summary.md'), summary.join('\n'));
  console.log(`\n=== Summary ===`);
  console.log(`v2 correct: ${v2CorrectCount}/${total} | v3 correct: ${v3CorrectCount}/${total}`);
  console.log(`False negatives (bad accepted): v2=${falseNegV2} | v3=${falseNegV3}`);
  console.log(`False positives (good rejected): v2=${falsePosV2} | v3=${falsePosV3}`);
  console.log(`\nLogs: ${LOG_DIR}`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
