// tests/phase3/verification-normalization.test.ts
// Phase 3A.1 verification normalization tests.

import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

function loadLedger(): any[] {
  return readFileSync('nonfiction/verification/source-verification-ledger.jsonl', 'utf-8').trim().split('\n').map(l => JSON.parse(l));
}

describe('Verification Normalization — Case A: VERIFIED + titleMatch=false + no explanation', () => {
  it('fails if VERIFIED record has titleMatch=false and no titleMismatchReason', () => {
    const ledger = loadLedger();
    const violations = ledger.filter(r =>
      r.verificationStatus === 'VERIFIED' &&
      r.titleMatch === false &&
      !r.titleMismatchReason
    );
    expect(violations.length).toBe(0);
  });
});

describe('Verification Normalization — Case B: VERIFIED + no evidenceLocations', () => {
  it('fails if VERIFIED record has empty evidenceLocations', () => {
    const ledger = loadLedger();
    const violations = ledger.filter(r =>
      r.verificationStatus === 'VERIFIED' &&
      (!r.evidenceLocations || r.evidenceLocations.length === 0)
    );
    expect(violations.length).toBe(0);
  });
});

describe('Verification Normalization — Case C: VERIFIED + sourceIdentityVerified=false', () => {
  it('fails if VERIFIED record has sourceIdentityVerified=false', () => {
    const ledger = loadLedger();
    const violations = ledger.filter(r =>
      r.verificationStatus === 'VERIFIED' &&
      r.sourceIdentityVerified === false
    );
    expect(violations.length).toBe(0);
  });
});

describe('Verification Normalization — Case D: publicationDate equals retrieval timestamp', () => {
  it('fails if publicationDateObserved is an HTTP timestamp without evidence', () => {
    const ledger = loadLedger();
    const violations = ledger.filter(r => {
      const pub = r.publicationDateObserved || '';
      // Check if it looks like an HTTP timestamp (contains GMT or day-name)
      if (pub.includes('GMT') || pub.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),/)) {
        return !r.publicationDateEvidence || r.publicationDateEvidence === '';
      }
      return false;
    });
    expect(violations.length).toBe(0);
  });
});

describe('Verification Normalization — Case E: BLOCKED + identity contradiction', () => {
  it('fails if BLOCKED record has sourceIdentityVerified=false without explanation', () => {
    const ledger = loadLedger();
    const violations = ledger.filter(r =>
      r.verificationStatus === 'BLOCKED' &&
      r.sourceIdentityVerified === false &&
      !r.notes
    );
    expect(violations.length).toBe(0);
  });
});

describe('Verification Normalization — Case F: duplicate source IDs', () => {
  it('fails if duplicate sourcePackSourceId exists', () => {
    const ledger = loadLedger();
    const ids = ledger.map(r => r.sourcePackSourceId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Verification Normalization — Case G: missing source mapping', () => {
  it('fails if any discovery source is missing from ledger', () => {
    const sourceIndex = JSON.parse(readFileSync('nonfiction/source-pack/source-index.json', 'utf-8'));
    const sources = sourceIndex.sources || sourceIndex;
    const ledger = loadLedger();
    const ledgerIds = new Set(ledger.map(r => r.sourcePackSourceId));
    const missing = sources.filter((s: any) => !ledgerIds.has(s.sourceId));
    expect(missing.length).toBe(0);
  });
});

describe('Verification Normalization — Case H: artifact SHA mismatch', () => {
  it('fails if artifact SHA256 does not match file content', () => {
    const ledger = loadLedger();
    const mismatches: string[] = [];
    for (const r of ledger) {
      if (r.retrievedArtifact && r.artifactSha256 && existsSync(r.retrievedArtifact)) {
        const actual = createHash('sha256').update(readFileSync(r.retrievedArtifact)).digest('hex');
        if (actual !== r.artifactSha256) {
          mismatches.push(r.sourcePackSourceId);
        }
      }
    }
    expect(mismatches.length).toBe(0);
  });
});

describe('Verification Normalization — Case I: 429/tool error classified as FAILED', () => {
  it('fails if a record is FAILED due to tool error (should be BLOCKED or UNRESOLVED)', () => {
    const ledger = loadLedger();
    const toolFailures = ledger.filter(r =>
      r.verificationStatus === 'FAILED' &&
      (r.notes.includes('429') || r.notes.includes('rate limit') || r.notes.includes('parse error'))
    );
    expect(toolFailures.length).toBe(0);
  });
});

describe('Verification Normalization — Case J: valid PARTIALLY_VERIFIED', () => {
  it('passes if PARTIALLY_VERIFIED records have notes explaining what is missing', () => {
    const ledger = loadLedger();
    const partials = ledger.filter(r => r.verificationStatus === 'PARTIALLY_VERIFIED');
    expect(partials.length).toBeGreaterThan(0);
    for (const r of partials) {
      expect(r.notes.length).toBeGreaterThan(10);
    }
  });
});

describe('Verification Normalization — Case K: valid BLOCKED', () => {
  it('passes if BLOCKED records have notes explaining the block', () => {
    const ledger = loadLedger();
    const blocked = ledger.filter(r => r.verificationStatus === 'BLOCKED');
    expect(blocked.length).toBeGreaterThan(0);
    for (const r of blocked) {
      expect(r.notes.length).toBeGreaterThan(10);
    }
  });
});

describe('Verification Normalization — Case L: VERIFIED with explained title mismatch', () => {
  it('passes if VERIFIED records with titleMatch=false have titleMismatchReason', () => {
    const ledger = loadLedger();
    const verifiedMismatch = ledger.filter(r =>
      r.verificationStatus === 'VERIFIED' &&
      r.titleMatch === false
    );
    for (const r of verifiedMismatch) {
      expect(r.titleMismatchReason).toBeTruthy();
      expect(r.titleMismatchReason.length).toBeGreaterThan(10);
    }
  });
});
