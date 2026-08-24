// tests/phase3/source-identity.test.ts
// Comprehensive identity and validation tests covering Cases 1 through 23.

import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import {
  compareSourceIdentity,
  canonicalizeIdentity,
  computeIdentityFingerprint,
  validateFullRecord,
  type SourcePackRecord,
  type VerificationRecord,
} from '../../src/phase3/verification-validator';

function loadFixture(name: string): { sourcePack: SourcePackRecord | null; verification: VerificationRecord } {
  return JSON.parse(readFileSync(`tests/fixtures/phase3-verification/${name}`, 'utf-8'));
}

describe('Phase 3A.4 Failure Invariants (Cases 1–15)', () => {
  it('Case 1: Wrong URL -> FAILS identity comparison and validation', () => {
    const { sourcePack, verification } = loadFixture('case-01-wrong-url.json');
    const comp = compareSourceIdentity(sourcePack!, verification);
    expect(comp.match).toBe(false);
    expect(comp.url.status).toBe('MISMATCH');

    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(false);
    expect(diag.errors.some(e => e.includes('URL mismatch'))).toBe(true);
  });

  it('Case 2: Wrong publisher -> FAILS identity comparison and validation', () => {
    const { sourcePack, verification } = loadFixture('case-02-wrong-publisher.json');
    const comp = compareSourceIdentity(sourcePack!, verification);
    expect(comp.match).toBe(false);
    expect(comp.publisher.status).toBe('MISMATCH');

    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(false);
    expect(diag.errors.some(e => e.includes('Publisher mismatch'))).toBe(true);
  });

  it('Case 3: Unrelated title -> FAILS', () => {
    const { sourcePack, verification } = loadFixture('case-03-unrelated-title.json');
    const comp = compareSourceIdentity(sourcePack!, verification);
    expect(comp.match).toBe(false);
    expect(comp.title.status).toBe('MISMATCH');

    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(false);
  });

  it('Case 4: Unrelated title + fake non-empty reason -> FAILS', () => {
    const { sourcePack, verification } = loadFixture('case-04-fake-reason-unrelated-title.json');
    const comp = compareSourceIdentity(sourcePack!, verification);
    expect(comp.match).toBe(false);
    expect(comp.title.status).toBe('MISMATCH');

    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(false);
  });

  it('Case 5: Conflicting author -> FAILS', () => {
    const { sourcePack, verification } = loadFixture('case-05-wrong-author.json');
    const comp = compareSourceIdentity(sourcePack!, verification);
    expect(comp.match).toBe(false);
    expect(comp.author.status).toBe('MISMATCH');

    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(false);
    expect(diag.errors.some(e => e.includes('Author mismatch'))).toBe(true);
  });

  it('Case 6: Wrong URL + manually entered canonical URL without redirect evidence -> FAILS', () => {
    const { sourcePack, verification } = loadFixture('case-06-manual-canonical-no-evidence.json');
    const comp = compareSourceIdentity(sourcePack!, verification);
    expect(comp.match).toBe(false);
    expect(comp.url.status).toBe('MISMATCH');

    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(false);
    expect(diag.errors.some(e => e.includes('differs from discovery without redirectEvidence'))).toBe(true);
  });

  it('Case 7: Fake redirect evidence leading to wrong site -> FAILS', () => {
    const { sourcePack, verification } = loadFixture('case-07-fake-redirect-evidence.json');
    const comp = compareSourceIdentity(sourcePack!, verification);
    expect(comp.match).toBe(false);
    expect(comp.url.status).toBe('MISMATCH');

    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(false);
  });

  it('Case 8: Identity comparison mismatch + sourceIdentityVerified=true -> FAILS (contradiction detected)', () => {
    const { sourcePack, verification } = loadFixture('case-08-identity-mismatch-with-flag-true.json');
    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(false);
    expect(diag.errors.some(e => e.includes('Contradiction: sourceIdentityVerified === true but identity comparison failed'))).toBe(true);
  });

  it('Case 9: Identity fingerprint mismatch -> FAILS', () => {
    const { sourcePack, verification } = loadFixture('case-09-fingerprint-mismatch.json');
    const comp = compareSourceIdentity(sourcePack!, verification);
    expect(comp.match).toBe(false);
    expect(comp.sourcePackIdentityFingerprint).not.toBe(comp.verificationIdentityFingerprint);
  });

  it('Case 10: SYSTEM_CLOCK date evidence -> FAILS', () => {
    const { sourcePack, verification } = loadFixture('case-10-system-clock-date.json');
    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(false);
    expect(diag.errors.some(e => e.includes('SYSTEM_CLOCK'))).toBe(true);
  });

  it('Case 11: HTTP transport timestamp used as publication date -> FAILS', () => {
    const { sourcePack, verification } = loadFixture('case-11-http-transport-date.json');
    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(false);
    expect(diag.errors.some(e => e.includes('HTTP transport header'))).toBe(true);
  });

  it('Case 12: FAILED status caused only by HTTP 429 rate limit -> FAILS', () => {
    const { sourcePack, verification } = loadFixture('case-12-429-marked-failed.json');
    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(false);
    expect(diag.errors.some(e => e.includes('temporary rate-limit'))).toBe(true);
  });

  it('Case 13: VERIFIED record with empty evidenceLocations -> FAILS', () => {
    const { sourcePack, verification } = loadFixture('case-13-missing-evidence-verified.json');
    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(false);
    expect(diag.errors.some(e => e.includes('non-empty evidenceLocations'))).toBe(true);
  });

  it('Case 14: Artifact SHA256 mismatch -> FAILS', () => {
    const { sourcePack, verification } = loadFixture('case-14-artifact-hash-mismatch.json');
    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(false);
    expect(diag.errors.some(e => e.includes('Artifact SHA256 mismatch'))).toBe(true);
  });

  it('Case 15: Missing source-pack mapping -> FAILS', () => {
    const { verification } = loadFixture('case-15-missing-source-mapping.json');
    const diag = validateFullRecord(verification, undefined);
    expect(diag.valid).toBe(false);
    expect(diag.errors.some(e => e.includes('No matching discovery source-pack record found'))).toBe(true);
  });
});

describe('Phase 3A.4 Pass Invariants (Cases 16–23)', () => {
  it('Case 16: Exact normalized match -> PASS (EXACT_NORMALIZED_MATCH)', () => {
    const { sourcePack, verification } = loadFixture('case-16-exact-normalized-match.json');
    const comp = compareSourceIdentity(sourcePack!, verification);
    expect(comp.match).toBe(true);
    expect(comp.classification).toBe('EXACT_NORMALIZED_MATCH');

    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(true);
  });

  it('Case 17: Punctuation/formatting title variant -> PASS (EXACT_NORMALIZED_MATCH)', () => {
    const { sourcePack, verification } = loadFixture('case-17-punctuation-title-variant.json');
    const comp = compareSourceIdentity(sourcePack!, verification);
    expect(comp.match).toBe(true);
    expect(comp.title.status).toBe('MATCH');

    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(true);
  });

  it('Case 18: Explicit official subtitle variant -> PASS (DOCUMENTED_TITLE_VARIANT)', () => {
    const { sourcePack, verification } = loadFixture('case-18-official-subtitle-variant.json');
    const comp = compareSourceIdentity(sourcePack!, verification);
    expect(comp.match).toBe(true);
    expect(comp.title.status).toBe('DOCUMENTED_VARIANT');

    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(true);
  });

  it('Case 19: Documented redirect -> PASS (EXACT_NORMALIZED_MATCH)', () => {
    const { sourcePack, verification } = loadFixture('case-19-documented-redirect.json');
    const comp = compareSourceIdentity(sourcePack!, verification);
    expect(comp.match).toBe(true);
    expect(comp.url.status).toBe('MATCH');

    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(true);
  });

  it('Case 20: Recognized publisher equivalence -> PASS (DOCUMENTED_TITLE_VARIANT)', () => {
    const { sourcePack, verification } = loadFixture('case-20-recognized-publisher-equivalence.json');
    const comp = compareSourceIdentity(sourcePack!, verification);
    expect(comp.match).toBe(true);
    expect(comp.publisher.status).toBe('DOCUMENTED_EQUIVALENT');

    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(true);
  });

  it('Case 21: Organizational source with no individual author -> PASS', () => {
    const { sourcePack, verification } = loadFixture('case-21-org-no-author.json');
    const comp = compareSourceIdentity(sourcePack!, verification);
    expect(comp.match).toBe(true);
    expect(comp.author.status).toBe('NOT_APPLICABLE');

    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(true);
  });

  it('Case 22: Valid DISCOVERY_INHERITED publication date -> PASS', () => {
    const { sourcePack, verification } = loadFixture('case-22-inherited-pub-date.json');
    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(true);
  });

  it('Case 23: PDF parser limitation -> BLOCKED passes validation', () => {
    const { sourcePack, verification } = loadFixture('case-23-pdf-blocked.json');
    const diag = validateFullRecord(verification, sourcePack!);
    expect(diag.valid).toBe(true);
  });
});

describe('Phase 3A.4 Symmetric Identity Fingerprinting', () => {
  it('computes identical SHA256 fingerprints from identical canonical identities', () => {
    const ident1 = canonicalizeIdentity('Climate Report 2024', 'https://ipcc.ch/report', 'IPCC', 'N/A');
    const ident2 = canonicalizeIdentity('“Climate Report 2024”', 'http://ipcc.ch/report/', 'ipcc', '');

    const fp1 = computeIdentityFingerprint(ident1);
    const fp2 = computeIdentityFingerprint(ident2);

    expect(fp1).toBe(fp2);
    expect(fp1.length).toBe(64);
  });
});
