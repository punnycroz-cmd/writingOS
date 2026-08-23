// scripts/phase3/self-audit.ts
// Verifies phase manifest, branch provenance, source-pack counts, import hashes,
// duplicate detection, ground-truth boundary, phase gate state.
// Exits non-zero on failure.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';

function sha256(path: string): string {
  try { return createHash('sha256').update(readFileSync(path)).digest('hex'); }
  catch { return 'HASH_ERROR'; }
}
function loadJson(path: string): any { return JSON.parse(readFileSync(path, 'utf-8')); }

let failures = 0;
function check(name: string, passed: boolean, detail: string) {
  console.log(`  ${passed ? 'PASS' : 'FAIL'}  ${name}: ${detail}`);
  if (!passed) failures++;
}

console.log('Phase 3 Self-Audit\n');

// 1. Phase manifest
console.log('1. Phase manifest:');
const snapshot = loadJson('PHASE3-SNAPSHOT-MANIFEST.json');
check('phase', snapshot.phase === '3', snapshot.phase);
check('stage', snapshot.stage === 'FOUNDATION', snapshot.stage);
check('status', snapshot.status === 'BOOTSTRAPPED', snapshot.status);
check('containsGroundTruth', snapshot.containsGroundTruth === false, String(snapshot.containsGroundTruth));
check('sourceVerifiedClaims', snapshot.sourceVerifiedClaims === 0, String(snapshot.sourceVerifiedClaims));

// 2. Branch provenance
console.log('\n2. Branch provenance:');
const phase2bSha = execSync('git rev-parse origin/research/phase2b-golden-corpus-v1-reconciled', { encoding: 'utf-8' }).trim();
const nfSha = execSync('git rev-parse origin/research/nonfiction-source-pack-v1.1', { encoding: 'utf-8' }).trim();
check('phase2b_sha_matches', snapshot.phase2bSha === phase2bSha, `${snapshot.phase2bSha} vs ${phase2bSha}`);
check('nonfiction_sha_matches', snapshot.nonfictionSha === nfSha, `${snapshot.nonfictionSha} vs ${nfSha}`);

// 3. Source-pack counts
console.log('\n3. Source-pack counts:');
const sourceIndex = loadJson('nonfiction/source-pack/source-index.json');
const sources = sourceIndex.sources || sourceIndex;
const vs: Record<string, number> = {};
const tiers: Record<string, number> = {};
for (const s of sources) {
  vs[s.verificationStatus] = (vs[s.verificationStatus] || 0) + 1;
  tiers[s.selectionStatus] = (tiers[s.selectionStatus] || 0) + 1;
}
check('source_count', sources.length === 69, `${sources.length}`);
check('gold_tier', (tiers.GOLD || 0) === 29, `${tiers.GOLD || 0}`);
check('silver_tier', (tiers.SILVER || 0) === 25, `${tiers.SILVER || 0}`);
check('bronze_tier', (tiers.BRONZE || 0) === 15, `${tiers.BRONZE || 0}`);
check('url_verified', (vs.URL_VERIFIED || 0) === 17, `${vs.URL_VERIFIED || 0}`);
check('url_exists_bot_blocked', (vs.URL_EXISTS_BOT_BLOCKED || 0) === 5, `${vs.URL_EXISTS_BOT_BLOCKED || 0}`);
check('unverified', (vs.UNVERIFIED || 0) === 47, `${vs.UNVERIFIED || 0}`);
check('source_verified', (vs.SOURCE_VERIFIED || 0) === 0, `${vs.SOURCE_VERIFIED || 0}`);

// 4. Claim counts
console.log('\n4. Claim counts:');
const claims = readFileSync('nonfiction/source-pack/claim-inventory.jsonl', 'utf-8').trim().split('\n');
check('claim_count', claims.length === 135, `${claims.length}`);
let sourceVerifiedClaims = 0;
for (const line of claims) {
  const c = JSON.parse(line);
  if (c.verificationLevel === 'SOURCE_VERIFIED' || c.epistemicLabelStatus === 'SOURCE_VERIFIED') sourceVerifiedClaims++;
}
check('source_verified_claims', sourceVerifiedClaims === 0, `${sourceVerifiedClaims}`);

// 5. Import hashes
console.log('\n5. Import hashes:');
const importInv = loadJson('docs/phase3/PHASE3_IMPORT_INVENTORY.json');
let hashMatch = 0, hashMismatch = 0;
for (const f of importInv.files) {
  if (!existsSync(f.destinationPath)) { hashMismatch++; continue; }
  const actual = sha256(f.destinationPath);
  if (actual === f.destinationSha256) hashMatch++;
  else hashMismatch++;
}
check('import_hashes', hashMismatch === 0, `${hashMatch} match, ${hashMismatch} mismatch`);

// 6. Duplicate detection
console.log('\n6. Duplicate detection:');
check('no_duplicate_source_pack', !existsSync('research/nonfiction-source-pack-v1.1/source-pack/source-index.json'), existsSync('research/nonfiction-source-pack-v1.1/source-pack/source-index.json') ? 'DUPLICATE EXISTS' : 'clean');

// 7. Ground-truth boundary
console.log('\n7. Ground-truth boundary:');
const manifest = loadJson('nonfiction/source-pack/PACK-MANIFEST.json');
check('ground_truth_false', manifest.groundTruth !== true, `groundTruth=${manifest.groundTruth}`);

// 8. Phase gate state
console.log('\n8. Phase gate state:');
const canonicalState = loadJson('docs/phase3/PHASE3_CANONICAL_STATE.json');
check('phase3_foundation', canonicalState.stage === 'FOUNDATION', canonicalState.stage);

console.log(`\n${failures === 0 ? 'SELF-AUDIT PASSED' : `SELF-AUDIT FAILED: ${failures} failures`}`);
if (failures > 0) process.exit(1);
