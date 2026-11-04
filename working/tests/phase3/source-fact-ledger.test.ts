import { expect, test, describe } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';
import { validateLedgerSet, buildSourceFactLedgerRecords } from '../../src/phase3/source-fact-ledger-validator';
import * as crypto from 'crypto';

function findFile(relativePath: string): string {
  const candidates = [
    path.join(__dirname, '../../', relativePath),
    path.join(__dirname, '../../../', relativePath),
    path.join(process.cwd(), relativePath),
    path.join(process.cwd(), 'working', relativePath),
    path.join(process.cwd(), 'writing_os', relativePath),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.join(process.cwd(), relativePath);
}

describe('Phase 3B SourceFactLedger Invariants', () => {
  const ledgerPath = findFile('nonfiction/ledger/source-fact-ledger.jsonl');
  const ledgerStr = fs.readFileSync(ledgerPath, 'utf-8');
  const records = ledgerStr.trim().split('\n').map(l => JSON.parse(l));

  const claimInventoryPath = findFile('nonfiction/source-pack/claim-inventory.jsonl');
  const claimInventoryStr = fs.readFileSync(claimInventoryPath, 'utf-8');
  const claimInventory = claimInventoryStr.trim().split('\n').map(l => JSON.parse(l));

  const sourceIndexPath = findFile('nonfiction/source-pack/source-index.json');
  const sourceIndex = JSON.parse(fs.readFileSync(sourceIndexPath, 'utf-8'));

  const verificationLedgerPath = findFile('nonfiction/verification/source-verification-ledger.jsonl');
  const verificationLedgerStr = fs.readFileSync(verificationLedgerPath, 'utf-8');
  const verificationLedger = verificationLedgerStr.trim().split('\n').map(l => JSON.parse(l));

  test('Validates entire ledger set without error', () => {
    expect(() => validateLedgerSet(records, sourceIndex, verificationLedger, claimInventory)).not.toThrow();
  });

  test('sourceVerifiedClaims = 0', () => {
    const verified = records.filter(r => r.factVerificationState === 'SOURCE_VERIFIED');
    expect(verified.length).toBe(0);
  });

  test('containsGroundTruth = false', () => {
    const hasGroundTruth = records.some(r => r.factVerificationState === 'SOURCE_VERIFIED');
    expect(hasGroundTruth).toBe(false);
  });

  test('135 candidate claims mapped exactly 1-to-1', () => {
    expect(records.length).toBe(135);
    const claimIds = new Set(records.map(r => r.claimId));
    expect(claimIds.size).toBe(135);
  });

  test('BLOCKED sources mapped to UNSUPPORTED and BLOCKED evidence type', () => {
    const blockedRecords = records.filter(r => r.sourceVerificationStatus === 'BLOCKED');
    expect(blockedRecords.length).toBeGreaterThan(0);
    for (const r of blockedRecords) {
      expect(r.evidenceType).toBe('BLOCKED');
      expect(r.factVerificationState).toBe('UNSUPPORTED');
    }
  });

  test('Determinism: two independent builder runs from inputs produce bit-exact identical hashes', () => {
    // Run 1: build in memory
    const build1 = buildSourceFactLedgerRecords(claimInventory, verificationLedger);
    const str1 = build1.map(r => JSON.stringify(r)).join('\n') + '\n';
    const sha1 = crypto.createHash('sha256').update(str1).digest('hex');

    // Run 2: build again from scratch
    const build2 = buildSourceFactLedgerRecords(claimInventory, verificationLedger);
    const str2 = build2.map(r => JSON.stringify(r)).join('\n') + '\n';
    const sha2 = crypto.createHash('sha256').update(str2).digest('hex');

    // Expected disk file hash
    const diskSha = crypto.createHash('sha256').update(ledgerStr).digest('hex');

    // Assert true determinism
    expect(sha1).toBe(sha2);
    expect(sha1).toBe(diskSha);
  });
});
