// run2.ts — Execute Iteration 2 on the full test matrix.
// Usage: bun run writing-engine/src/run2.ts

import { runLoop } from './engine.js';
import { allCases2 } from './cases2.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const LOG_DIR = join(import.meta.dir, '..', 'logs2');
mkdirSync(LOG_DIR, { recursive: true });

async function main() {
  const filter = process.argv.slice(2);
  const cases = filter.length ? allCases2.filter(c => filter.includes(c.id)) : allCases2;
  console.log('=== Character Specificity Decision Loop — Iteration 2 ===');
  console.log(`Cases: ${cases.length}${filter.length ? ` (filtered: ${filter.join(', ')})` : ''}\n`);
  const logs: any[] = [];

  for (const tc of cases) {
    console.log(`--- ${tc.id}: ${tc.label} [${tc.category}] ---`);
    console.log(`Expected: ${tc.expected}`);
    try {
      const log = await runLoop(tc.id, tc.passage, tc.state, tc.priorTransitions ?? []);
      logs.push(log);
      writeFileSync(join(LOG_DIR, `case-${log.caseId}.json`), JSON.stringify(log, null, 2));
      console.log(`  [CC] deferred: ${log.deterministicChecks.deferredAnchor.relevance}`);
      console.log(`  [CC] canon alerts: ${log.deterministicChecks.canonAlerts.length}`);
      console.log(`  [CC] unsupported specifics: ${log.deterministicChecks.supportedSpecificity?.unsupportedCount ?? 'n/a'}`);
      console.log(`  Detection: ${log.detection.classification} | Severity: ${log.severity} | Decision: ${log.decision} | Accepted: ${log.accepted}`);
      if (log.validation) console.log(`  Validation: ${log.validation.overall}`);
      console.log(`  Reason: ${log.reason.slice(0, 140)}${log.reason.length > 140 ? '...' : ''}`);
      if (log.accepted && log.intervention) console.log(`  Final: ${log.finalText.slice(0, 100)}...`);
      console.log();
    } catch (e: any) {
      console.error(`  ERROR: ${e.message}\n`);
      const errLog = { caseId: tc.id, error: e.message, stack: e.stack, label: tc.label, category: tc.category };
      logs.push(errLog);
      writeFileSync(join(LOG_DIR, `case-${tc.id}.json`), JSON.stringify(errLog, null, 2));
    }
  }

  // Combined logs
  writeFileSync(join(LOG_DIR, 'all-logs.json'), JSON.stringify(logs, null, 2));

  // Human-readable trace
  let trace = '# Iteration 2 — Execution Trace\n\n';
  trace += `Executed: ${new Date().toISOString()}\nCases: ${logs.length}\n\n`;
  trace += '## Summary Table\n\n| Case | Label | Category | [CC] Deferred | [CC] Unsupported | Detection | Severity | Decision | Validation | Accepted |\n';
  trace += '|------|-------|----------|---------------|------------------|-----------|----------|----------|------------|----------|\n';
  for (const log of logs) {
    if (log.error) { trace += `| ${log.caseId} | ERROR | — | — | — | — | — | — | — | — |\n`; continue; }
    const ccDef = log.deterministicChecks.deferredAnchor.relevance.replace(/_/g, ' ');
    const ccUns = log.deterministicChecks.supportedSpecificity?.unsupportedCount ?? 'n/a';
    const val = log.validation ? log.validation.overall : 'n/a';
    trace += `| ${log.caseId} | ${log.label} | ${log.category ?? ''} | ${ccDef} | ${ccUns} | ${log.detection.classification} | ${log.severity} | ${log.decision} | ${val} | ${log.accepted ? 'yes' : 'no'} |\n`;
  }
  trace += '\n';
  for (const log of logs) {
    if (log.error) { trace += `## Case ${log.caseId} — ERROR\n\n\`\`\`\n${log.error}\n\`\`\`\n\n`; continue; }
    trace += `## Case ${log.caseId} — ${log.label}\n\n`;
    trace += `**Category:** ${log.category ?? ''} | **Scene:** ${log.sceneId} | **State:** ${log.inputStateSummary}\n\n`;
    if (log.stateTransitions?.length) {
      trace += `**Prior state transitions:**\n`;
      for (const t of log.stateTransitions) {
        trace += `- ${t.type}: "${t.fact}" (${t.character ? t.character + ': ' : ''}${t.from} → ${t.to}) at ${t.atScene} — ${t.reason}\n`;
      }
      trace += '\n';
    }
    trace += `### Original\n> ${log.originalPassage.replace(/\n/g, '\n> ')}\n\n`;
    trace += `### [CC] Deterministic Layer\n- Deferred anchor: **${log.deterministicChecks.deferredAnchor.relevance}**${log.deterministicChecks.deferredAnchor.matchedCheckId ? ` (matched ${log.deterministicChecks.deferredAnchor.matchedCheckId}, ${log.deterministicChecks.deferredAnchor.overlapType})` : ''}\n- Canon alerts: ${log.deterministicChecks.canonAlerts.length}${log.deterministicChecks.canonAlerts.length ? ' (' + log.deterministicChecks.canonAlerts.map((a: any) => a.alertKeyword).join('; ') + ')' : ''}\n- Supported-specificity: ${log.deterministicChecks.supportedSpecificity ? `${log.deterministicChecks.supportedSpecificity.unsupportedCount} unsupported of ${log.deterministicChecks.supportedSpecificity.total} total` : 'n/a'}${log.deterministicChecks.supportedSpecificity?.unsupported?.length ? ' — unsupported: ' + log.deterministicChecks.supportedSpecificity.unsupported.map((i: any) => i.value).join(', ') : ''}\n\n`;
    trace += `### Detection\n- Classification: **${log.detection.classification}**\n- Narratively purposeful: ${log.detection.narrativelyPurposeful}\n- Canon conflicts: ${log.detection.canonConflicts.length ? log.detection.canonConflicts.join('; ') : 'none'}\n- Reasoning: ${log.detection.reasoning}\n\n`;
    trace += `### Severity → Decision\n${log.severity} → ${log.decision}\n\n`;
    if (log.intervention) {
      trace += `### Intervention\n- Types: ${log.intervention.interventionTypes.join(', ')}\n- State used: ${log.intervention.stateUsed.join('; ')}\n\n`;
      trace += `### Revised Text\n> ${log.intervention.revisedText.replace(/\n/g, '\n> ')}\n\n`;
    }
    if (log.validation) {
      const dims = ['meaning','character','infoOwnership','canon','voice','register','intelligibility','deferred','faithfulness'];
      const failed = dims.filter(d => log.validation[d] === 'FAIL');
      trace += `### Validation\n`;
      for (const d of dims) trace += `- ${d}: **${log.validation[d]}**\n`;
      trace += `- **Overall: ${log.validation.overall}**${failed.length ? ` (failed: ${failed.join(', ')})` : ''}\n\n`;
      trace += `**Reasons:**\n${log.validation.reasons.map((r: string) => `- ${r}`).join('\n')}\n\n`;
    }
    trace += `### Outcome\n${log.accepted ? '✅ ACCEPTED' : '❌ NOT ACCEPTED'} — ${log.reason}\n\n`;
    if (log.accepted && log.intervention) {
      trace += `### Final Text\n> ${log.finalText.replace(/\n/g, '\n> ')}\n\n`;
    }
    if (log.stateDiscovered.length) {
      trace += `### State Discovered\n${log.stateDiscovered.map((s: string) => `- ${s}`).join('\n')}\n\n`;
    }
    trace += `---\n\n`;
  }
  writeFileSync(join(LOG_DIR, 'execution-trace.md'), trace);
  console.log(`\nLogs written to ${LOG_DIR}`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
