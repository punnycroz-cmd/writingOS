// forensic/phase2b-5/scripts/add-provenance.ts
// Adds explicit executionProvenance to all persisted result files.
// Also corrects GC-0038R1 semantic ground truth from FAIL/FAIL to PASS/PASS.
//
// Policy (per Phase 2B.5 task #16, #17):
//   - The reconciler must READ persisted provenance. It must NOT invent it.
//   - LLM + EXECUTED requires: provider, model, evaluatedAt, latencyMs > 0.
//   - DETERMINISTIC + EXECUTED: latencyMs may be absent or zero.
//   - INHERITED requires: sourceCaseId.
//   - EXECUTION_ERROR requires: error.
//
// This script is idempotent: it only adds/normalizes the executionProvenance field
// and corrects the GC-0038R1 ground truth. It does NOT overwrite existing
// execution evidence (latency, timestamps, validatorMode).

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const RESULTS_DIR = 'writing-engine/logs-golden-v1/results';
const CORPUS_FILE = 'corpus/golden-v1/cases.jsonl';

interface ExecutionProvenance {
  status: 'EXECUTED' | 'INHERITED' | 'EXECUTION_ERROR';
  sourceCaseId: string | null;
}

function deriveProvenance(result: any): ExecutionProvenance {
  const cs = result.currentSemantic;
  // If currentSemantic is null, the case was decided by deterministic triage
  // (DETERMINISTIC_ACCEPT or DETERMINISTIC_BLOCK). That is still a real
  // execution of the evaluator pipeline.
  if (cs === null || cs === undefined) {
    return { status: 'EXECUTED', sourceCaseId: null };
  }
  if (cs.validatorMode === 'EXECUTION_ERROR') {
    return { status: 'EXECUTION_ERROR', sourceCaseId: null };
  }
  // LLM or DETERMINISTIC validatorMode → EXECUTED
  return { status: 'EXECUTED', sourceCaseId: null };
}

function validateProvenance(result: any, prov: ExecutionProvenance): string[] {
  const issues: string[] = [];
  const cs = result.currentSemantic;
  if (prov.status === 'EXECUTED') {
    if (cs && cs.validatorMode === 'LLM') {
      if (!result.provider) issues.push('missing provider');
      if (!result.model) issues.push('missing model');
      if (!result.evaluatedAt) issues.push('missing evaluatedAt');
      if (!(cs.latencyMs > 0)) issues.push(`latencyMs not > 0 (got ${cs.latencyMs})`);
    }
    // DETERMINISTIC: latency may be 0/absent — no further requirements.
  } else if (prov.status === 'INHERITED') {
    if (!prov.sourceCaseId) issues.push('INHERITED requires sourceCaseId');
  } else if (prov.status === 'EXECUTION_ERROR') {
    if (!cs || !cs.error) issues.push('EXECUTION_ERROR requires error');
  }
  return issues;
}

function main() {
  let patched = 0;
  let alreadyOk = 0;
  const validationIssues: string[] = [];

  const files = readdirSync(RESULTS_DIR).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const path = `${RESULTS_DIR}/${f}`;
    const raw = readFileSync(path, 'utf-8');
    const result = JSON.parse(raw);

    // Normalize / add executionProvenance
    const existing = result.executionProvenance;
    let prov: ExecutionProvenance;
    if (existing && existing.status && typeof existing.status === 'string') {
      // Keep existing persisted provenance, but normalize shape.
      prov = {
        status: existing.status,
        sourceCaseId: existing.sourceCaseId ?? null,
      };
    } else {
      prov = deriveProvenance(result);
    }

    const issues = validateProvenance(result, prov);
    if (issues.length > 0) {
      validationIssues.push(`${result.caseId}: ${issues.join('; ')}`);
    }

    // Idempotent write: only update if provenance missing/changed or GC-0038R1 gt
    let changed = false;
    if (JSON.stringify(existing) !== JSON.stringify(prov)) changed = true;

    // GC-0038R1 ground-truth correction (task #14):
    // Maya is in KNOWS state. The observation "Maya saw Marcus hide the account
    // records" is consistent with her existing knowledge — it is licensed
    // narrative observation, not an information-ownership leak.
    // Therefore expectedSemantic.infoOwnership = PASS and faithfulness = PASS.
    if (result.caseId === 'GC-0038R1') {
      const expected = result.expectedSemantic || {};
      if (expected.infoOwnership !== 'PASS' || expected.faithfulness !== 'PASS') {
        expected.infoOwnership = 'PASS';
        expected.faithfulness = 'PASS';
        result.expectedSemantic = expected;
        changed = true;
      }
    }

    if (changed) {
      result.executionProvenance = prov;
      writeFileSync(path, JSON.stringify(result, null, 2) + '\n');
      patched++;
    } else {
      alreadyOk++;
    }
  }

  console.log(`Patched: ${patched} | Already OK: ${alreadyOk} | Total: ${files.length}`);
  if (validationIssues.length > 0) {
    console.log('\nVALIDATION ISSUES:');
    for (const v of validationIssues) console.log(`  ${v}`);
  }

  // Also correct GC-0038R1 ground truth in the corpus file (cases.jsonl).
  const lines = readFileSync(CORPUS_FILE, 'utf-8').trim().split('\n');
  let corpusPatched = 0;
  const out: string[] = [];
  for (const line of lines) {
    const obj = JSON.parse(line);
    if (obj.id === 'GC-0038R1') {
      const expected = obj.expectedSemantic || {};
      if (expected.infoOwnership !== 'PASS' || expected.faithfulness !== 'PASS') {
        expected.infoOwnership = 'PASS';
        expected.faithfulness = 'PASS';
        obj.expectedSemantic = expected;
        corpusPatched++;
      }
      // Also ensure notes reflect the ground-truth correction
      const correctedNote = 'Corrected: KNOWS-state observation is consistent with existing knowledge. infoOwnership=PASS, faithfulness=PASS, expectedFinalDecision=ACCEPT. Previous R6/UNRESOLVED tags were incorrectly applied by corpus builder.';
      if (obj.notes !== correctedNote) {
        obj.notes = correctedNote;
        corpusPatched++;
      }
    }
    out.push(JSON.stringify(obj));
  }
  if (corpusPatched > 0) {
    writeFileSync(CORPUS_FILE, out.join('\n') + '\n');
    console.log(`Corpus cases.jsonl patched (${corpusPatched} field updates on GC-0038R1).`);
  } else {
    console.log('Corpus cases.jsonl already correct.');
  }

  if (validationIssues.length > 0) {
    process.exit(2);
  }
}

main();
