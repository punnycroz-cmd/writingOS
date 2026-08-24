// tests/phase3/verification-normalization.test.ts
// Phase 3A.4 verification normalization and live ledger validation tests.

import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import {
  validatePublicationDate,
  validateVerificationStatus,
  validateArtifact,
  validateFullRecord,
  normalizeTitle,
  normalizeUrl,
  canonicalizeIdentity,
  computeIdentityFingerprint,
  type VerificationRecord,
  type SourcePackRecord,
} from '../../src/phase3/verification-validator';

function loadLedger(): VerificationRecord[] {
  return readFileSync('nonfiction/verification/source-verification-ledger.jsonl', 'utf-8')
    .trim()
    .split('\n')
    .map(l => JSON.parse(l));
}

function loadSourcePack(): SourcePackRecord[] {
  const d = JSON.parse(readFileSync('nonfiction/source-pack/source-index.json', 'utf-8'));
  return d.sources || d;
}

describe('Verification Normalization — Text and URL Normalization Rules', () => {
  it('normalizes smart quotes, dashes, and whitespace in titles', () => {
    const titleA = '“Claims of ‘no difference’ in Reviews — Part 1”';
    const titleB = '"Claims of \'no difference\' in Reviews - Part 1"';
    expect(normalizeTitle(titleA)).toBe(normalizeTitle(titleB));
  });

  it('normalizes trailing slashes and HTTP vs HTTPS in canonical URLs', () => {
    const urlA = 'http://example.org/report/doc/';
    const urlB = 'https://example.org/report/doc';
    expect(normalizeUrl(urlA)).toBe(normalizeUrl(urlB));
  });

  it('generates consistent symmetric identity fingerprints', () => {
    const identA = canonicalizeIdentity('My Title', 'https://example.com/doc', 'NIH', 'John Doe');
    const identB = canonicalizeIdentity('“My Title”', 'http://example.com/doc/', 'nih', 'john doe');
    expect(computeIdentityFingerprint(identA)).toBe(computeIdentityFingerprint(identB));
  });
});

describe('Verification Normalization — Live 69-Source Ledger Audit', () => {
  const ledger = loadLedger();
  const sources = loadSourcePack();
  const sourceMap = new Map(sources.map(s => [s.sourceId, s]));

  it('all 69 records pass full schema and identity validation', () => {
    for (const r of ledger) {
      const sp = sourceMap.get(r.sourcePackSourceId);
      expect(sp).toBeDefined();
      const res = validateFullRecord(r, sp);
      if (!res.valid) {
        console.error(`Validation failure on ${r.sourcePackSourceId}:`, res.errors);
      }
      expect(res.valid).toBe(true);
      expect(res.errors.length).toBe(0);
    }
  });

  it('zero records use SYSTEM_CLOCK or transport timestamps as date evidence', () => {
    for (const r of ledger) {
      const ev = r.publicationDateEvidence || '';
      expect(ev.toUpperCase().includes('SYSTEM_CLOCK')).toBe(false);
      expect(ev.toUpperCase().includes('FILE_MTIME')).toBe(false);
    }
  });

  it('all BLOCKED records specify explicit verificationBlockReason', () => {
    const blocked = ledger.filter(r => r.verificationStatus === 'BLOCKED');
    expect(blocked.length).toBe(15);
    for (const b of blocked) {
      expect(b.verificationBlockReason).toBeDefined();
      expect(['BOT_PROTECTION', 'PDF_PARSER_LIMITATION', 'JSON_PARSE_LIMITATION']).toContain(b.verificationBlockReason!);
    }
  });

  it('preserves claim ground-truth boundary (0 SOURCE_VERIFIED claims)', () => {
    const summary = JSON.parse(readFileSync('nonfiction/verification/verification-normalization-summary.json', 'utf-8'));
    expect(summary.sourceVerifiedClaims).toBe(0);
    expect(summary.containsGroundTruth).toBe(false);
  });
});
