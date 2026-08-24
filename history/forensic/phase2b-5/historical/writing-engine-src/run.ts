// run.ts — Execute the Character Specificity loop on all six test cases.
// Usage: bun run writing-engine/src/run.ts
// Output: writing-engine/logs/*.json + writing-engine/logs/execution-trace.md

import { runLoop } from './engine.js';
import { allCases } from './cases.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const LOG_DIR = join(import.meta.dir, '..', 'logs');
mkdirSync(LOG_DIR, { recursive: true });

async function main() {
  console.log('=== Character Specificity Decision Loop — Execution ===\n');
  const logs: any[] = [];

  for (const tc of allCases) {
    console.log(`--- Case ${tc.id}: ${tc.label} ---`);
    console.log(`Purpose: ${tc.purpose}`);
    console.log(`Expected: ${tc.expectedBehavior}`);
    console.log('Running loop...');
    try {
      const log = await runLoop(tc.id, tc.passage, tc.state);
      logs.push(log);
      console.log(`  Detection: ${log.detection.classification}`);
      console.log(`  Severity:  ${log.severity}`);
      console.log(`  Decision:  ${log.decision}`);
      console.log(`  Accepted:  ${log.accepted}`);
      if (log.validation) {
        console.log(`  Validation: ${log.validation.overall} (${log.validation.reasons.length} reasons)`);
      }
      if (log.intervention && log.accepted) {
        console.log(`  Final text preview: ${log.finalText.slice(0, 120)}...`);
      }
      console.log();
    } catch (e: any) {
      console.error(`  ERROR in case ${tc.id}: ${e.message}`);
      logs.push({ caseId: tc.id, error: e.message, stack: e.stack });
      console.log();
    }
  }

  // Write per-case JSON logs
  for (const log of logs) {
    writeFileSync(join(LOG_DIR, `case-${log.caseId}.json`), JSON.stringify(log, null, 2));
  }

  // Write human-readable execution trace
  let trace = '# Worked Execution Trace — Character Specificity Loop\n\n';
  trace += `Executed: ${new Date().toISOString()}\nCases: ${logs.length}\n\n`;
  for (const log of logs) {
    if (log.error) {
      trace += `## Case ${log.caseId} — ERROR\n\n\`\`\`\n${log.error}\n${log.stack ?? ''}\n\`\`\`\n\n`;
      continue;
    }
    trace += `## Case ${log.caseId} — ${log.severity} → ${log.decision} → ${log.accepted ? 'ACCEPTED' : 'NOT ACCEPTED'}\n\n`;
    trace += `**Scene:** ${log.sceneId} (rev ${log.revisionId})\n\n`;
    trace += `### Original Passage\n> ${log.originalPassage.replace(/\n/g, '\n> ')}\n\n`;
    trace += `### Detection\n- **Classification:** ${log.detection.classification}\n- **Narratively purposeful:** ${log.detection.narrativelyPurposeful}\n- **Canon conflicts:** ${log.detection.canonConflicts.length ? log.detection.canonConflicts.join('; ') : 'none'}\n- **Reasoning:** ${log.detection.reasoning}\n\n`;
    trace += `### Severity & Decision\n- Severity: ${log.severity}\n- Decision: ${log.decision}\n\n`;
    if (log.intervention) {
      trace += `### Intervention Candidate\n- Types: ${log.intervention.interventionTypes.join(', ')}\n- State used: ${log.intervention.stateUsed.join('; ')}\n- Constraints applied: ${log.intervention.constraintsApplied.join('; ')}\n\n`;
      trace += `### Revised Text\n> ${log.intervention.revisedText.replace(/\n/g, '\n> ')}\n\n`;
    } else {
      trace += `### Intervention\nNone generated (decision did not permit intervention).\n\n`;
    }
    if (log.validation) {
      trace += `### Independent Validation\n`;
      const dims = ['meaning','character','infoOwnership','canon','voice','register','intelligibility','deferred','faithfulness'];
      for (const d of dims) {
        trace += `- ${d}: **${(log.validation as any)[d]}**\n`;
      }
      trace += `- **Overall: ${log.validation.overall}**\n\n`;
      trace += `**Reasons:**\n${log.validation.reasons.map((r: string) => `- ${r}`).join('\n')}\n\n`;
    }
    if (log.accepted && log.intervention) {
      trace += `### Final Accepted Text\n> ${log.finalText.replace(/\n/g, '\n> ')}\n\n`;
    } else if (log.decision === 'BLOCK_INTERVENTION') {
      trace += `### Outcome\nIntervention was generated but BLOCKED by independent validation. Original text retained.\n\n`;
    } else if (log.decision === 'ACCEPT_UNCHANGED') {
      trace += `### Outcome\nNo intervention needed. Original retained.\n\n`;
    } else if (log.decision === 'DEFER') {
      trace += `### Outcome\nDeferred — cannot judge until later context. Deferred checks: ${log.remainingDeferred.join(', ') || 'none'}\n\n`;
    } else if (log.decision === 'REJECT_AND_FLAG') {
      trace += `### Outcome\nCanon violation flagged for author attention. No automated intervention.\n\n`;
    }
    if (log.stateDiscovered.length) {
      trace += `### State Discovered During Execution\n${log.stateDiscovered.map((s: string) => `- ${s}`).join('\n')}\n\n`;
    }
    trace += `---\n\n`;
  }

  // Summary table
  trace += `## Execution Summary\n\n| Case | Detection | Severity | Decision | Intervention | Validation | Accepted |\n|------|-----------|----------|----------|--------------|------------|----------|\n`;
  for (const log of logs) {
    if (log.error) { trace += `| ${log.caseId} | ERROR | — | — | — | — | — |\n`; continue; }
    trace += `| ${log.caseId} | ${log.detection.classification} | ${log.severity} | ${log.decision} | ${log.intervention ? 'yes' : 'no'} | ${log.validation ? log.validation.overall : 'n/a'} | ${log.accepted ? 'yes' : 'no'} |\n`;
  }

  writeFileSync(join(LOG_DIR, 'execution-trace.md'), trace);
  writeFileSync(join(LOG_DIR, 'all-logs.json'), JSON.stringify(logs, null, 2));
  console.log(`\nLogs written to ${LOG_DIR}`);
  console.log('  - case-{A..F}.json (per-case full logs)');
  console.log('  - execution-trace.md (human-readable trace)');
  console.log('  - all-logs.json (combined)');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
