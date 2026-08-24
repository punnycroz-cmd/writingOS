// tests/phase3/source-verification-integrity.test.ts
// Full 69-source invariant test.

import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'node:fs';

function loadLedger(): any[] {
  return readFileSync('nonfiction/verification/source-verification-ledger.jsonl', 'utf-8').trim().split('\n').map(l => JSON.parse(l));
}

function loadSources(): any[] {
  const d = JSON.parse(readFileSync('nonfiction/source-pack/source-index.json', 'utf-8'));
  return d.sources || d;
}

describe('Full 69-Source Verification Integrity', () => {
  const ledger = loadLedger();
  const sources = loadSources();

  it('has exactly 69 source mappings', () => {
    expect(sources.length).toBe(69);
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

  it('has zero extra IDs (no orphan verification records)', () => {
    const sourceIds = new Set(sources.map(s => s.sourceId));
    const orphans = ledger.filter(r => !sourceIds.has(r.sourcePackSourceId));
    expect(orphans.length).toBe(0);
  });

  it('has zero orphan verification records', () => {
    const sourceIds = new Set(sources.map(s => s.sourceId));
    const orphans = ledger.filter(r => !sourceIds.has(r.sourcePackSourceId));
    expect(orphans.length).toBe(0);
  });

  it('all records have required fields', () => {
    const required = ['sourcePackSourceId', 'verificationSourceId', 'verificationStatus', 'verificationMethod', 'sourceIdentityVerified', 'evidenceLocations', 'notes'];
    for (const r of ledger) {
      for (const f of required) {
        expect(r[f]).toBeDefined();
      }
    }
  });

  it('source-id-map.json has all 69 mappings', () => {
    const map = JSON.parse(readFileSync('nonfiction/verification/source-id-map.json', 'utf-8'));
    expect(map.mappings.length).toBe(69);
    expect(map.allMapped).toBe(true);
  });
});
