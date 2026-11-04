// tests/phase3/phase3a-verification.test.ts
// Phase 3A source verification integrity tests.

import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

function loadJson(path: string): any { return JSON.parse(readFileSync(path, 'utf-8')); }
function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

const LEDGER_PATH = 'working/nonfiction/verification/source-verification-ledger.jsonl';
const SOURCE_INDEX_PATH = 'working/nonfiction/source-pack/source-index.json';

function loadLedger(): any[] {
  return readFileSync(LEDGER_PATH, 'utf-8').trim().split('\n').map(l => JSON.parse(l));
}

function loadSources(): any[] {
  const d = loadJson(SOURCE_INDEX_PATH);
  return d.sources || d;
}

describe('Phase 3A Source Verification — Coverage', () => {
  const ledger = loadLedger();
  const sources = loadSources();

  it('ledger has exactly 69 records', () => {
    expect(ledger.length).toBe(69);
  });

  it('every source in source-index has a ledger record', () => {
    const ledgerIds = new Set(ledger.map(r => r.sourcePackSourceId));
    for (const s of sources) {
      expect(ledgerIds.has(s.sourceId)).toBe(true);
    }
  });

  it('no duplicate source IDs in ledger', () => {
    const ids = ledger.map(r => r.sourcePackSourceId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every record has a valid verification status', () => {
    const validStatuses = ['VERIFIED', 'PARTIALLY_VERIFIED', 'BLOCKED', 'FAILED', 'UNRESOLVED'];
    for (const r of ledger) {
      expect(validStatuses).toContain(r.verificationStatus);
    }
  });
});

describe('Phase 3A Source Verification — VERIFIED Records', () => {
  const ledger = loadLedger();
  const verified = ledger.filter(r => r.verificationStatus === 'VERIFIED');

  it('has verified records', () => {
    expect(verified.length).toBeGreaterThan(0);
  });

  it('every VERIFIED record has sourceIdentityVerified = true', () => {
    for (const r of verified) {
      expect(r.sourceIdentityVerified).toBe(true);
    }
  });

  it('every VERIFIED record has evidence locations', () => {
    for (const r of verified) {
      expect(r.evidenceLocations.length).toBeGreaterThan(0);
    }
  });

  it('every VERIFIED record has a verification method', () => {
    for (const r of verified) {
      expect(r.verificationMethod).toBeTruthy();
    }
  });

  it('every VERIFIED record with an artifact has correct SHA256', () => {
    for (const r of verified) {
      if (r.retrievedArtifact && r.artifactSha256) {
        const actualPath = r.retrievedArtifact.startsWith("nonfiction/") ? "working/" + r.retrievedArtifact : r.retrievedArtifact;
        expect(existsSync(actualPath)).toBe(true);
        expect(sha256(actualPath)).toBe(r.artifactSha256);
      }
    }
  });
});

describe('Phase 3A Source Verification — Ground Truth Boundary', () => {
  it('SOURCE_VERIFIED claims count is 0', () => {
    const summary = loadJson('working/nonfiction/verification/source-verification-summary.json');
    expect(summary.sourceVerifiedClaims).toBe(0);
  });

  it('containsGroundTruth is false', () => {
    const summary = loadJson('working/nonfiction/verification/source-verification-summary.json');
    expect(summary.containsGroundTruth).toBe(false);
  });

  it('no record has verificationStatus SOURCE_VERIFIED', () => {
    const ledger = loadLedger();
    for (const r of ledger) {
      expect(r.verificationStatus).not.toBe('SOURCE_VERIFIED');
    }
  });

  it('frozen source-pack is not modified', () => {
    const sourceIndex = loadJson(SOURCE_INDEX_PATH);
    const sources = sourceIndex.sources || sourceIndex;
    const sv = sources.filter((s: any) => s.verificationStatus === 'SOURCE_VERIFIED');
    expect(sv.length).toBe(0);
  });
});

describe('Phase 3A Source Verification — Summary Consistency', () => {
  const ledger = loadLedger();
  const summary = loadJson('working/nonfiction/verification/source-verification-summary.json');

  it('summary totalSources matches ledger count', () => {
    expect(summary.totalSources).toBe(ledger.length);
  });

  it('summary verified count matches ledger', () => {
    const verified = ledger.filter(r => r.verificationStatus === 'VERIFIED').length;
    expect(summary.verified).toBe(verified);
  });

  it('summary blocked count matches ledger', () => {
    const blocked = ledger.filter(r => r.verificationStatus === 'BLOCKED').length;
    expect(summary.blocked).toBe(blocked);
  });

  it('summary allSourcesHaveDisposition is true', () => {
    expect(summary.allSourcesHaveDisposition).toBe(true);
  });
});

describe('Phase 3A Source Verification — Frozen Source Pack', () => {
  it('source-index.json still has 69 sources', () => {
    const sources = loadSources();
    expect(sources.length).toBe(69);
  });

  it('source-index.json still has 0 SOURCE_VERIFIED', () => {
    const sources = loadSources();
    const sv = sources.filter((s: any) => s.verificationStatus === 'SOURCE_VERIFIED');
    expect(sv.length).toBe(0);
  });

  it('claim-inventory still has 135 claims', () => {
    const claims = readFileSync('working/nonfiction/source-pack/claim-inventory.jsonl', 'utf-8').trim().split('\n');
    expect(claims.length).toBe(135);
  });
});
