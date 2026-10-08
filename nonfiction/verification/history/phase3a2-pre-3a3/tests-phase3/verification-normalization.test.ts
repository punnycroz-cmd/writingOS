// tests/phase3/verification-normalization.test.ts
// Phase 3A.2 verification normalization and adversarial validator tests.

import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import {
  validatePublicationDate,
  validateSourceIdentity,
  validateVerificationStatus,
  validateArtifact,
  validateFullRecord,
  normalizeTitle,
  normalizeUrl,
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

function loadFixture(name: string): any {
  return JSON.parse(readFileSync(`tests/fixtures/phase3-verification/${name}`, 'utf-8'));
}

describe('Verification Normalization — Adversarial Fixtures', () => {
  const sources = loadSourcePack();
  const sourceMap = new Map(sources.map(s => [s.sourceId, s]));

  it('Case A: Title mismatch without explanation -> FAILS', () => {
    const fixture = loadFixture('invalid-title-mismatch.json');
    const mockSp: SourcePackRecord = {
      sourceId: 'SRC-TEST-0001',
      title: 'Original Discovery Title',
      url: 'https://example.com/test',
    };
    const res = validateFullRecord(fixture, mockSp);
    expect(res.valid).toBe(false);
    expect(res.errors.some(e => e.includes('Title mismatch'))).toBe(true);
  });

  it('Case B: Publication date with SYSTEM_CLOCK evidence -> FAILS', () => {
    const fixture = loadFixture('invalid-date-provenance-clock.json');
    const res = validatePublicationDate(fixture);
    expect(res.length).toBeGreaterThan(0);
    expect(res.some(e => e.includes('SYSTEM_CLOCK'))).toBe(true);
  });

  it('Case C: Publication date with HTTP transport header format -> FAILS', () => {
    const fixture = loadFixture('invalid-date-provenance-retrieved.json');
    const res = validatePublicationDate(fixture);
    expect(res.length).toBeGreaterThan(0);
    expect(res.some(e => e.includes('HTTP transport header'))).toBe(true);
  });

  it('Case D: VERIFIED with sourceIdentityVerified=false -> FAILS', () => {
    const fixture = loadFixture('invalid-identity.json');
    const res = validateVerificationStatus(fixture);
    expect(res.length).toBeGreaterThan(0);
    expect(res.some(e => e.includes('sourceIdentityVerified === true'))).toBe(true);
  });

  it('Case E: VERIFIED with empty evidenceLocations -> FAILS', () => {
    const fixture = loadFixture('invalid-empty-evidence.json');
    const res = validateVerificationStatus(fixture);
    expect(res.length).toBeGreaterThan(0);
    expect(res.some(e => e.includes('non-empty evidenceLocations'))).toBe(true);
  });

  it('Case F: Artifact SHA256 mismatch -> FAILS', () => {
    const fixture = loadFixture('invalid-artifact-hash.json');
    const res = validateArtifact(fixture);
    expect(res.length).toBeGreaterThan(0);
    expect(res.some(e => e.includes('Artifact SHA256 mismatch'))).toBe(true);
  });

  it('Case G: FAILED caused solely by HTTP 429 rate limit -> FAILS', () => {
    const fixture = loadFixture('invalid-failed-429.json');
    const res = validateVerificationStatus(fixture);
    expect(res.length).toBeGreaterThan(0);
    expect(res.some(e => e.includes('temporary rate-limit'))).toBe(true);
  });

  it('Case H: Valid VERIFIED record passes all validation rules -> PASSES', () => {
    const fixture = loadFixture('valid-verified.json');
    const sp = sourceMap.get(fixture.sourcePackSourceId);
    const res = validateFullRecord(fixture, sp);
    expect(res.valid).toBe(true);
    expect(res.errors.length).toBe(0);
  });

  it('Case I: Valid BLOCKED record with PDF parser limitation -> PASSES', () => {
    const fixture = loadFixture('valid-blocked.json');
    const sp = sourceMap.get(fixture.sourcePackSourceId);
    const res = validateFullRecord(fixture, sp);
    expect(res.valid).toBe(true);
    expect(res.errors.length).toBe(0);
  });
});

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

  it('generates consistent identity fingerprints', () => {
    const fp1 = computeIdentityFingerprint('My Title', 'https://example.com/doc', 'NIH');
    const fp2 = computeIdentityFingerprint('“My Title”', 'http://example.com/doc/', 'nih');
    expect(fp1.fingerprint).toBe(fp2.fingerprint);
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
