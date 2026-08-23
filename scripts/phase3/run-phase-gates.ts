// scripts/phase3/run-phase-gates.ts
// Phase-gate runner — derives results from actual repository state.
// Prints gate report and writes machine-readable results.

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';

const PHASE3_SNAPSHOT = 'PHASE3-SNAPSHOT-MANIFEST.json';
const CANONICAL_STATE = 'docs/phase3/PHASE3_CANONICAL_STATE.json';
const PHASE_GATES = 'docs/phase3/PHASE_GATES.json';
const IMPORT_INVENTORY = 'docs/phase3/PHASE3_IMPORT_INVENTORY.json';
const OUTPUT_DIR = 'logs/phase3';

interface GateResult {
  id: number;
  name: string;
  state: 'PASS' | 'READY' | 'BLOCKED' | 'FAIL';
  checks: { name: string; passed: boolean; detail: string }[];
}

function sha256(path: string): string {
  try { return createHash('sha256').update(readFileSync(path)).digest('hex'); }
  catch { return 'HASH_ERROR'; }
}

function loadJson(path: string): any {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function gitRevParse(ref: string): string | null {
  try { return execSync(`git rev-parse ${ref}`, { encoding: 'utf-8' }).trim(); }
  catch { return null; }
}

// Gate 0: Repository Foundation
function checkGate0(): GateResult {
  const checks: { name: string; passed: boolean; detail: string }[] = [];
  
  // Check branches exist
  const phase2bSha = gitRevParse('origin/research/phase2b-golden-corpus-v1-reconciled');
  const nfSha = gitRevParse('origin/research/nonfiction-source-pack-v1.1');
  const phase3Sha = gitRevParse('origin/research/phase3-nonfiction-foundation-v1');
  
  checks.push({ name: 'phase2b_branch_exists', passed: !!phase2bSha, detail: phase2bSha || 'MISSING' });
  checks.push({ name: 'nonfiction_branch_exists', passed: !!nfSha, detail: nfSha || 'MISSING' });
  checks.push({ name: 'phase3_branch_exists', passed: !!phase3Sha, detail: phase3Sha || 'MISSING' });
  
  // Check provenance SHAs match
  const snapshot = loadJson(PHASE3_SNAPSHOT);
  checks.push({ name: 'phase2b_sha_matches', passed: snapshot.phase2bSha === phase2bSha, detail: `${snapshot.phase2bSha} vs ${phase2bSha}` });
  checks.push({ name: 'nonfiction_sha_matches', passed: snapshot.nonfictionSha === nfSha, detail: `${snapshot.nonfictionSha} vs ${nfSha}` });
  
  // Check no duplicate source pack
  const dupPath = 'research/nonfiction-source-pack-v1.1/source-pack/source-index.json';
  checks.push({ name: 'no_duplicate_source_pack', passed: !existsSync(dupPath), detail: existsSync(dupPath) ? 'DUPLICATE EXISTS' : 'clean' });
  
  // Check canonical source pack exists
  checks.push({ name: 'canonical_source_pack_exists', passed: existsSync('nonfiction/source-pack/source-index.json'), detail: 'nonfiction/source-pack/' });
  
  // Check manifests consistent
  const manifest = loadJson('nonfiction/source-pack/PACK-MANIFEST.json');
  const sourceIndex = loadJson('nonfiction/source-pack/source-index.json');
  const sources = sourceIndex.sources || sourceIndex;
  checks.push({ name: 'manifest_claim_count_matches', passed: manifest.claimCount === 135, detail: `${manifest.claimCount}` });
  checks.push({ name: 'source_count_matches', passed: sources.length === 69, detail: `${sources.length}` });
  
  // Check import inventory hashes
  const importInv = loadJson(IMPORT_INVENTORY);
  let hashMatch = 0, hashMismatch = 0;
  for (const f of importInv.files) {
    if (!existsSync(f.destinationPath)) { hashMismatch++; continue; }
    const actual = sha256(f.destinationPath);
    if (actual === f.destinationSha256) hashMatch++;
    else hashMismatch++;
  }
  checks.push({ name: 'import_hashes_valid', passed: hashMismatch === 0, detail: `${hashMatch} match, ${hashMismatch} mismatch` });
  
  const allPassed = checks.every(c => c.passed);
  return { id: 0, name: 'Repository Foundation', state: allPassed ? 'PASS' : 'FAIL', checks };
}

// Gate 1: Source Verification
function checkGate1(): GateResult {
  const checks: { name: string; passed: boolean; detail: string }[] = [];
  
  // Check if verification ledger exists
  const ledgerExists = existsSync('nonfiction/verification/source-verification-ledger.jsonl');
  checks.push({ name: 'verification_ledger_exists', passed: ledgerExists, detail: ledgerExists ? 'source-verification-ledger.jsonl' : 'MISSING' });
  
  if (!ledgerExists) {
    return { id: 1, name: 'Source Verification', state: 'FAIL', checks };
  }
  
  // Load ledger and check coverage
  const ledgerLines = readFileSync('nonfiction/verification/source-verification-ledger.jsonl', 'utf-8').trim().split('\n');
  const ledger = ledgerLines.map(l => JSON.parse(l));
  checks.push({ name: 'ledger_has_69_records', passed: ledger.length === 69, detail: `${ledger.length} records` });
  
  // Check all have valid dispositions
  const validStatuses = ['VERIFIED', 'PARTIALLY_VERIFIED', 'BLOCKED', 'FAILED', 'UNRESOLVED'];
  const invalid = ledger.filter(r => !validStatuses.includes(r.verificationStatus));
  checks.push({ name: 'all_records_valid_status', passed: invalid.length === 0, detail: `${invalid.length} invalid` });
  
  // Check summary exists and matches
  const summaryExists = existsSync('nonfiction/verification/source-verification-summary.json');
  checks.push({ name: 'summary_exists', passed: summaryExists, detail: summaryExists ? 'source-verification-summary.json' : 'MISSING' });
  
  if (summaryExists) {
    const summary = loadJson('nonfiction/verification/source-verification-summary.json');
    checks.push({ name: 'all_sources_have_disposition', passed: summary.allSourcesHaveDisposition === true, detail: `allSourcesHaveDisposition=${summary.allSourcesHaveDisposition}` });
    checks.push({ name: 'no_source_verified_claims', passed: summary.sourceVerifiedClaims === 0, detail: `${summary.sourceVerifiedClaims} SOURCE_VERIFIED claims` });
    checks.push({ name: 'no_ground_truth', passed: summary.containsGroundTruth === false, detail: `containsGroundTruth=${summary.containsGroundTruth}` });
  }
  
  // Check no duplicate source IDs
  const ids = ledger.map(r => r.sourceId);
  const uniqueIds = new Set(ids).size;
  checks.push({ name: 'no_duplicate_source_ids', passed: uniqueIds === ids.length, detail: `${uniqueIds} unique / ${ids.length} total` });
  
  const allPassed = checks.every(c => c.passed);
  return { id: 1, name: 'Source Verification', state: allPassed ? 'PASS' : 'FAIL', checks };
}

function main() {
  const gate0 = checkGate0();
  const gate1 = checkGate1();
  
  const gates = [gate0, gate1];
  // Gates 2-5 are BLOCKED (future phases not started)
  for (let i = 2; i <= 5; i++) {
    gates.push({ id: i, name: ['SourceFactLedger Ready', 'Nonfiction Rules Ready', 'Benchmark Ready', 'Integration Ready'][i-2], state: 'BLOCKED', checks: [] });
  }
  
  // Print report
  console.log('Phase 3 Foundation Gate Report\n');
  for (const g of gates) {
    console.log(`GATE ${g.id}  ${g.state}  ${g.name}`);
    for (const c of g.checks) {
      console.log(`  ${c.passed ? 'PASS' : 'FAIL'}  ${c.name}: ${c.detail}`);
    }
  }
  
  const gate0Pass = gate0.state === 'PASS';
  const gate1Pass = gate1.state === 'PASS';
  const overallState = gate0Pass && gate1Pass ? 'PHASE3A_SOURCE_VERIFICATION_COMPLETE' : 'PHASE3_FOUNDATION_BLOCKED';
  console.log(`\nOverall current state:\n${overallState}`);
  
  // Write machine-readable results
  const commitSha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
  const result = {
    timestamp: new Date().toISOString(),
    commitSha,
    currentPhase: 'PHASE3_FOUNDATION',
    overallState: gate0Pass && gate1Pass ? 'PHASE3A_SOURCE_VERIFICATION_COMPLETE' : 'PHASE3_FOUNDATION_BLOCKED',
    gates: gates.map(g => ({
      id: g.id,
      name: g.name,
      state: g.state,
      checks: g.checks,
    })),
  };
  
  writeFileSync(`${OUTPUT_DIR}/phase-gate-results.json`, JSON.stringify(result, null, 2));
  console.log(`\nResults written to ${OUTPUT_DIR}/phase-gate-results.json`);
  
  if (!gate0Pass || !gate1Pass) process.exit(1);
}

main();
