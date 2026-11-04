// tests/phase3/source-identity.test.ts
// Tests for independent source identity comparison, fingerprinting, and adversarial fixtures.

import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import {
  compareSourceIdentity,
  computeSourcePackFingerprint,
  computeVerificationFingerprint,
  validateFullRecord,
  type SourcePackRecord,
  type VerificationRecord,
} from '../../src/phase3/verification-validator';

function loadFixture(name: string): { sourcePack: SourcePackRecord; verification: VerificationRecord } {
  return JSON.parse(readFileSync(`tests/fixtures/phase3-verification/${name}`, 'utf-8'));
}

describe('Source Identity — Adversarial Fixture Comparisons (Cases A–O)', () => {
  it('Case A: Same ID + different URL -> FAIL (identity mismatch)', () => {
    const { sourcePack, verification } = loadFixture('adversarial-a-diff-url.json');
    const comp = compareSourceIdentity(sourcePack, verification);
    expect(comp.match).toBe(false);
    expect(comp.url.status).toBe('MISMATCH');
    expect(comp.classification).toBe('MISMATCH');

    const diag = validateFullRecord(verification, sourcePack);
    expect(diag.valid).toBe(false);
    expect(diag.errors.some(e => e.includes('URL mismatch'))).toBe(true);
  });

  it('Case B: Same ID + different publisher -> FAIL (publisher mismatch)', () => {
    const { sourcePack, verification } = loadFixture('adversarial-b-diff-publisher.json');
    const comp = compareSourceIdentity(sourcePack, verification);
    expect(comp.match).toBe(false);
    expect(comp.publisher.status).toBe('MISMATCH');
    expect(comp.classification).toBe('MISMATCH');

    const diag = validateFullRecord(verification, sourcePack);
    expect(diag.valid).toBe(false);
    expect(diag.errors.some(e => e.includes('Publisher mismatch'))).toBe(true);
  });

  it('Case C: Same ID + completely unrelated title -> FAIL (title mismatch)', () => {
    const { sourcePack, verification } = loadFixture('adversarial-c-diff-title.json');
    const comp = compareSourceIdentity(sourcePack, verification);
    expect(comp.match).toBe(false);
    expect(comp.title.status).toBe('MISMATCH');

    const diag = validateFullRecord(verification, sourcePack);
    expect(diag.valid).toBe(false);
    expect(diag.errors.some(e => e.includes('Title mismatch'))).toBe(true);
  });

  it('Case D: Same source + punctuation-only title difference -> PASS (EXACT_NORMALIZED_MATCH)', () => {
    const { sourcePack, verification } = loadFixture('adversarial-d-punct-title.json');
    const comp = compareSourceIdentity(sourcePack, verification);
    expect(comp.match).toBe(true);
    expect(comp.classification).toBe('EXACT_NORMALIZED_MATCH');

    const diag = validateFullRecord(verification, sourcePack);
    expect(diag.valid).toBe(true);
  });

  it('Case E: Same source + trailing slash & protocol URL variant -> PASS (EXACT_NORMALIZED_MATCH)', () => {
    const { sourcePack, verification } = loadFixture('adversarial-e-trailing-slash-url.json');
    const comp = compareSourceIdentity(sourcePack, verification);
    expect(comp.match).toBe(true);
    expect(comp.classification).toBe('EXACT_NORMALIZED_MATCH');

    const diag = validateFullRecord(verification, sourcePack);
    expect(diag.valid).toBe(true);
  });

  it('Case F: Documented redirect & title variant -> PASS (DOCUMENTED_TITLE_VARIANT)', () => {
    const { sourcePack, verification } = loadFixture('adversarial-f-documented-redirect.json');
    const comp = compareSourceIdentity(sourcePack, verification);
    expect(comp.match).toBe(true);
    expect(comp.classification).toBe('DOCUMENTED_TITLE_VARIANT');

    const diag = validateFullRecord(verification, sourcePack);
    expect(diag.valid).toBe(true);
  });

  it('Case G: Same title + wrong publisher -> FAIL (publisher mismatch)', () => {
    const { sourcePack, verification } = loadFixture('adversarial-g-same-title-wrong-pub.json');
    const comp = compareSourceIdentity(sourcePack, verification);
    expect(comp.match).toBe(false);
    expect(comp.publisher.status).toBe('MISMATCH');

    const diag = validateFullRecord(verification, sourcePack);
    expect(diag.valid).toBe(false);
  });

  it('Case H: Same URL + wrong title without explanation -> FAIL', () => {
    const { sourcePack, verification } = loadFixture('adversarial-h-same-url-wrong-title.json');
    const comp = compareSourceIdentity(sourcePack, verification);
    expect(comp.match).toBe(false);
    expect(comp.title.status).toBe('MISMATCH');

    const diag = validateFullRecord(verification, sourcePack);
    expect(diag.valid).toBe(false);
  });

  it('Case I: Organization source with no individual author -> PASS', () => {
    const { sourcePack, verification } = loadFixture('adversarial-i-org-no-author.json');
    const comp = compareSourceIdentity(sourcePack, verification);
    expect(comp.match).toBe(true);
    expect(comp.author.status).toBe('NOT_APPLICABLE');

    const diag = validateFullRecord(verification, sourcePack);
    expect(diag.valid).toBe(true);
  });

  it('Case J: Publication date with SYSTEM_CLOCK evidence -> FAIL', () => {
    const { sourcePack, verification } = loadFixture('adversarial-j-date-system-clock.json');
    const diag = validateFullRecord(verification, sourcePack);
    expect(diag.valid).toBe(false);
    expect(diag.errors.some(e => e.includes('SYSTEM_CLOCK'))).toBe(true);
  });

  it('Case K: Publication date inherited from discovery index -> PASS', () => {
    const { sourcePack, verification } = loadFixture('adversarial-k-date-inherited.json');
    const diag = validateFullRecord(verification, sourcePack);
    expect(diag.valid).toBe(true);
  });

  it('Case L: 429 marked FAILED -> FAIL (temporary rate limit cannot be FAILED)', () => {
    const { sourcePack, verification } = loadFixture('adversarial-l-429-failed.json');
    const diag = validateFullRecord(verification, sourcePack);
    expect(diag.valid).toBe(false);
    expect(diag.errors.some(e => e.includes('temporary rate-limit'))).toBe(true);
  });

  it('Case M: PDF parser limitation marked BLOCKED -> PASS', () => {
    const { sourcePack, verification } = loadFixture('adversarial-m-pdf-blocked.json');
    const diag = validateFullRecord(verification, sourcePack);
    expect(diag.valid).toBe(true);
  });

  it('Case N: Artifact hash mismatch -> FAIL', () => {
    const { sourcePack, verification } = loadFixture('adversarial-n-artifact-hash-mismatch.json');
    const diag = validateFullRecord(verification, sourcePack);
    expect(diag.valid).toBe(false);
    expect(diag.errors.some(e => e.includes('Artifact SHA256 mismatch'))).toBe(true);
  });

  it('Case O: VERIFIED with empty evidence -> FAIL', () => {
    const { sourcePack, verification } = loadFixture('adversarial-o-missing-evidence.json');
    const diag = validateFullRecord(verification, sourcePack);
    expect(diag.valid).toBe(false);
    expect(diag.errors.some(e => e.includes('non-empty evidenceLocations'))).toBe(true);
  });
});

describe('Source Identity — Independent Fingerprint Independence', () => {
  it('generates distinct fingerprints for discovery and verification entities', () => {
    const sp: SourcePackRecord = {
      sourceId: 'SRC-01',
      title: 'Climate Report',
      organization: 'IPCC',
      url: 'https://ipcc.ch/report',
    };
    const vr: Partial<VerificationRecord> = {
      observedTitle: 'Climate Report',
      publisherObserved: 'IPCC',
      sourceUrl: 'https://ipcc.ch/report',
    };

    const spFp = computeSourcePackFingerprint(sp);
    const vrFp = computeVerificationFingerprint(vr);

    expect(spFp.startsWith('SP[')).toBe(true);
    expect(vrFp.startsWith('VR[')).toBe(true);
  });
});
