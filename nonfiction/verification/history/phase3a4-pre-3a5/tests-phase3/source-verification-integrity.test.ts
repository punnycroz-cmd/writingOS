// tests/phase3/source-verification-integrity.test.ts
// Full 69-source invariant and identity mapping integrity test.

import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'node:fs';

function loadLedger(): any[] {
  return readFileSync('nonfiction/verification/source-verification-ledger.jsonl', 'utf-8').trim().split('\n').map(l => JSON.parse(l));
}

function loadSources(): any[] {
  const d = JSON.parse(readFileSync('nonfiction/source-pack/source-index.json', 'utf-8'));
  return d.sources || d;
}

function loadIdMap(): any {
  return JSON.parse(readFileSync('nonfiction/verification/source-id-map.json', 'utf-8'));
}

describe('Full 69-Source Verification Integrity', () => {
  const ledger = loadLedger();
  const sources = loadSources();
  const idMap = loadIdMap();

  it('has exactly 69 source mappings', () => {
    expect(sources.length).toBe(69);
    expect(idMap.mappings.length).toBe(69);
  });

  it('has exactly 69 verification records', () => {
    expect(ledger.length).toBe(69);
  });

  it('has zero duplicate IDs in ledger', () => {
    const ids = ledger.map(r => r.sourcePackSourceId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has zero missing source IDs (every discovery source is in ledger)', () => {
    const ledgerIds = new Set(ledger.map(r => r.sourcePackSourceId));
    const missing = sources.filter(s => !ledgerIds.has(s.sourceId));
    expect(missing.length).toBe(0);
  });

  it('has zero orphan verification records', () => {
    const sourceIds = new Set(sources.map(s => s.sourceId));
    const orphans = ledger.filter(r => !sourceIds.has(r.sourcePackSourceId));
    expect(orphans.length).toBe(0);
  });

  it('all records have required fields', () => {
    const required = [
      'sourcePackSourceId',
      'verificationSourceId',
      'verificationStatus',
      'verificationMethod',
      'sourceIdentityVerified',
      'notes'
    ];
    for (const r of ledger) {
      for (const f of required) {
        expect(r[f]).toBeDefined();
      }
    }
  });

  it('source-id-map.json has all 69 independent identity fingerprints and verified matches', () => {
    expect(idMap.allMapped).toBe(true);
    for (const m of idMap.mappings) {
      expect(m.identityMatch).toBe(true);
      expect(m.sourcePackIdentityFingerprint).toBeDefined();
      expect(m.sourcePackIdentityFingerprint.length).toBe(64); // SHA256 hex
      expect(m.verificationIdentityFingerprint).toBeDefined();
      expect(m.verificationIdentityFingerprint.length).toBe(64); // SHA256 hex
      expect(m.identityClassification).toBeDefined();
    }
  });
});
