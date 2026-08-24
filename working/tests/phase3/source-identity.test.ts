// tests/phase3/source-identity.test.ts
// Comprehensive Phase 3A.5 identity and validation tests covering Cases A through R.

import { describe, it, expect } from 'bun:test';
import { readFileSync } from 'node:fs';
import {
  compareSourceIdentity,
  canonicalizeIdentity,
  computeIdentityFingerprint,
  validateFullRecord,
  validateSourceMappingSet,
  type SourcePackRecord,
  type VerificationRecord,
} from '../../src/phase3/verification-validator';

describe('Phase 3A.5 Fallback Leakage Invariants (Cases A–D)', () => {
  const sp: SourcePackRecord = {
    sourceId: 'SRC-TEST-LEAK',
    title: 'Discovery Title of Document',
    organization: 'OECD',
    author: 'John Maynard Keynes',
    url: 'https://oecd.org/report',
  };

  it('Case A: Verification title missing + discovery title present -> UNKNOWN (does not fall back to discovery title)', () => {
    const vr: Partial<VerificationRecord> = {
      sourcePackSourceId: 'SRC-TEST-LEAK',
      verificationSourceId: 'SRC-TEST-LEAK',
      observedTitle: '',
      sourceUrl: 'https://oecd.org/report',
      publisherObserved: 'OECD',
      authorObserved: 'John Maynard Keynes',
      sourceIdentityVerified: true,
      verificationStatus: 'VERIFIED',
    };
    const comp = compareSourceIdentity(sp, vr);
    expect(comp.match).toBe(false);
    expect(comp.title.status).toBe('UNKNOWN');
    expect(comp.verificationIdentityFingerprint).not.toBe(comp.sourcePackIdentityFingerprint);
  });

  it('Case B: Verification publisher missing + discovery publisher present -> UNKNOWN (does not fall back to discovery organization)', () => {
    const vr: Partial<VerificationRecord> = {
      sourcePackSourceId: 'SRC-TEST-LEAK',
      verificationSourceId: 'SRC-TEST-LEAK',
      observedTitle: 'Discovery Title of Document',
      sourceUrl: 'https://oecd.org/report',
      publisherObserved: '',
      authorObserved: 'John Maynard Keynes',
      sourceIdentityVerified: true,
      verificationStatus: 'VERIFIED',
    };
    const comp = compareSourceIdentity(sp, vr);
    expect(comp.match).toBe(false);
    expect(comp.publisher.status).toBe('UNKNOWN');
  });

  it('Case C: Verification author missing + discovery author present -> UNKNOWN (does not fall back to discovery author)', () => {
    const vr: Partial<VerificationRecord> = {
      sourcePackSourceId: 'SRC-TEST-LEAK',
      verificationSourceId: 'SRC-TEST-LEAK',
      observedTitle: 'Discovery Title of Document',
      sourceUrl: 'https://oecd.org/report',
      publisherObserved: 'OECD',
      authorObserved: '',
    };
    const comp = compareSourceIdentity(sp, vr);
    expect(comp.author.status).toBe('UNKNOWN');
  });

  it('Case D: All verification metadata missing -> FAILS VERIFIED validation', () => {
    const vr: Partial<VerificationRecord> = {
      sourcePackSourceId: 'SRC-TEST-LEAK',
      verificationSourceId: 'SRC-TEST-LEAK',
      observedTitle: '',
      sourceUrl: '',
      publisherObserved: '',
      authorObserved: '',
      sourceExists: true,
      sourceIdentityVerified: true,
      verificationStatus: 'VERIFIED',
      verificationMethod: 'page_reader',
      notes: 'Empty verification record',
      evidenceLocations: ['https://example.com'],
    };
    const diag = validateFullRecord(vr, sp);
    expect(diag.valid).toBe(false);
  });
});

describe('Phase 3A.5 Author Comparison Invariants (Cases E–H)', () => {
  const sp: SourcePackRecord = {
    sourceId: 'SRC-TEST-AUTH',
    title: 'Macroeconomic Study',
    organization: 'NBER',
    author: 'David Card',
    url: 'https://nber.org/study',
  };

  it('Case E: Wrong author -> MISMATCH & fails identity comparison', () => {
    const vr: Partial<VerificationRecord> = {
      observedTitle: 'Macroeconomic Study',
      sourceUrl: 'https://nber.org/study',
      publisherObserved: 'NBER',
      authorObserved: 'Kenneth Arrow',
      sourceIdentityVerified: true,
      verificationStatus: 'VERIFIED',
    };
    const comp = compareSourceIdentity(sp, vr);
    expect(comp.match).toBe(false);
    expect(comp.author.status).toBe('MISMATCH');
  });

  it('Case F: Author format variant with et al. -> DOCUMENTED_EQUIVALENT', () => {
    const spEtAl: SourcePackRecord = { ...sp, author: 'David Card, Alan Krueger' };
    const vr: Partial<VerificationRecord> = {
      observedTitle: 'Macroeconomic Study',
      sourceUrl: 'https://nber.org/study',
      publisherObserved: 'NBER',
      authorObserved: 'David Card, Alan Krueger et al.',
      sourceIdentityVerified: true,
      verificationStatus: 'VERIFIED',
    };
    const comp = compareSourceIdentity(spEtAl, vr);
    expect(comp.author.status).toBe('DOCUMENTED_EQUIVALENT');
  });

  it('Case G: Organizational source without individual author -> NOT_APPLICABLE', () => {
    const spOrg: SourcePackRecord = { ...sp, author: 'N/A' };
    const vr: Partial<VerificationRecord> = {
      observedTitle: 'Macroeconomic Study',
      sourceUrl: 'https://nber.org/study',
      publisherObserved: 'NBER',
      authorObserved: 'N/A',
      sourceIdentityVerified: true,
      verificationStatus: 'VERIFIED',
    };
    const comp = compareSourceIdentity(spOrg, vr);
    expect(comp.author.status).toBe('NOT_APPLICABLE');
  });

  it('Case H: Unspecified author -> UNKNOWN', () => {
    const vr: Partial<VerificationRecord> = {
      observedTitle: 'Macroeconomic Study',
      sourceUrl: 'https://nber.org/study',
      publisherObserved: 'NBER',
      authorObserved: '',
    };
    const comp = compareSourceIdentity(sp, vr);
    expect(comp.author.status).toBe('UNKNOWN');
  });
});

describe('Phase 3A.5 Publisher Comparison Invariants (Cases I–K)', () => {
  const spOECD: SourcePackRecord = {
    sourceId: 'SRC-TEST-PUB',
    title: 'OECD Economic Outlook',
    organization: 'Organisation for Economic Co-operation and Development',
    url: 'https://oecd.org/outlook',
  };

  it('Case I: OECD acronym ↔ official name -> DOCUMENTED_EQUIVALENT via explicit dictionary', () => {
    const vr: Partial<VerificationRecord> = {
      observedTitle: 'OECD Economic Outlook',
      sourceUrl: 'https://oecd.org/outlook',
      publisherObserved: 'OECD',
      sourceIdentityVerified: true,
      verificationStatus: 'VERIFIED',
    };
    const comp = compareSourceIdentity(spOECD, vr);
    expect(comp.match).toBe(true);
    expect(comp.publisher.status).toBe('DOCUMENTED_EQUIVALENT');
  });

  it('Case J: Unrelated publisher suffix -> MISMATCH (no substring leakage)', () => {
    const vr: Partial<VerificationRecord> = {
      observedTitle: 'OECD Economic Outlook',
      sourceUrl: 'https://oecd.org/outlook',
      publisherObserved: 'Organisation for Economic Co-operation and Development - Japan Division Unrelated',
      sourceIdentityVerified: true,
      verificationStatus: 'VERIFIED',
    };
    const comp = compareSourceIdentity(spOECD, vr);
    expect(comp.match).toBe(false);
    expect(comp.publisher.status).toBe('MISMATCH');
  });

  it('Case K: Unrecognized repository / hosting platform -> MISMATCH', () => {
    const vr: Partial<VerificationRecord> = {
      observedTitle: 'OECD Economic Outlook',
      sourceUrl: 'https://oecd.org/outlook',
      publisherObserved: 'GitHub Documentation Mirror',
      sourceIdentityVerified: true,
      verificationStatus: 'VERIFIED',
    };
    const comp = compareSourceIdentity(spOECD, vr);
    expect(comp.match).toBe(false);
    expect(comp.publisher.status).toBe('MISMATCH');
  });
});

describe('Phase 3A.5 URL & Redirect Invariants (Cases L–O)', () => {
  const spURL: SourcePackRecord = {
    sourceId: 'SRC-TEST-URL',
    title: 'Security Standard',
    organization: 'NIST',
    url: 'https://csrc.nist.gov/sp800-53',
  };

  it('Case L: http -> https without redirectEvidence -> MISMATCH (raw difference must be explained)', () => {
    const vr: Partial<VerificationRecord> = {
      observedTitle: 'Security Standard',
      sourceUrl: 'http://csrc.nist.gov/sp800-53',
      publisherObserved: 'NIST',
      redirectObserved: false,
      sourceIdentityVerified: true,
      verificationStatus: 'VERIFIED',
    };
    const comp = compareSourceIdentity(spURL, vr);
    expect(comp.match).toBe(false);
    expect(comp.url.status).toBe('MISMATCH');
  });

  it('Case M: Documented redirect -> PASS (DOCUMENTED_VARIANT)', () => {
    const vr: Partial<VerificationRecord> = {
      observedTitle: 'Security Standard',
      sourceUrl: 'http://csrc.nist.gov/sp800-53',
      canonicalUrl: 'https://csrc.nist.gov/sp800-53',
      redirectObserved: true,
      redirectEvidence: 'HTTP 301 Permanent Redirect to canonical HTTPS endpoint',
      publisherObserved: 'NIST',
      sourceIdentityVerified: true,
      verificationStatus: 'VERIFIED',
    };
    const comp = compareSourceIdentity(spURL, vr);
    expect(comp.match).toBe(true);
    expect(comp.url.status).toBe('DOCUMENTED_VARIANT');
  });

  it('Case N: Wrong canonical URL in redirect -> MISMATCH', () => {
    const vr: Partial<VerificationRecord> = {
      observedTitle: 'Security Standard',
      sourceUrl: 'http://csrc.nist.gov/sp800-53',
      canonicalUrl: 'https://csrc.nist.gov/different-page',
      redirectObserved: true,
      redirectEvidence: 'Redirected to different page',
      publisherObserved: 'NIST',
      sourceIdentityVerified: true,
      verificationStatus: 'VERIFIED',
    };
    const comp = compareSourceIdentity(spURL, vr);
    expect(comp.match).toBe(false);
    expect(comp.url.status).toBe('MISMATCH');
  });

  it('Case O: Manual canonical URL without redirect evidence -> MISMATCH', () => {
    const vr: Partial<VerificationRecord> = {
      observedTitle: 'Security Standard',
      sourceUrl: 'https://other-site.gov/doc',
      canonicalUrl: 'https://csrc.nist.gov/sp800-53',
      redirectObserved: false,
      publisherObserved: 'NIST',
      sourceIdentityVerified: true,
      verificationStatus: 'VERIFIED',
    };
    const comp = compareSourceIdentity(spURL, vr);
    expect(comp.match).toBe(false);
    expect(comp.url.status).toBe('MISMATCH');
  });
});

describe('Phase 3A.5 Fine-Grained Identity Classifications (Case P)', () => {
  const spBase: SourcePackRecord = {
    sourceId: 'SRC-BASE',
    title: 'Standard Title',
    organization: 'World Bank',
    url: 'https://worldbank.org/report',
  };

  it('exact title + exact url + exact publisher -> EXACT_NORMALIZED_MATCH', () => {
    const vr: Partial<VerificationRecord> = {
      observedTitle: 'Standard Title',
      sourceUrl: 'https://worldbank.org/report',
      publisherObserved: 'World Bank',
    };
    expect(compareSourceIdentity(spBase, vr).classification).toBe('EXACT_NORMALIZED_MATCH');
  });

  it('title variant only -> TITLE_VARIANT', () => {
    const vr: Partial<VerificationRecord> = {
      observedTitle: 'Standard Title: Comprehensive 2024 Edition',
      titleVariantType: 'OFFICIAL_SUBTITLE_VARIANT',
      titleMismatchReason: 'Subtitle included in page title',
      sourceUrl: 'https://worldbank.org/report',
      publisherObserved: 'World Bank',
    };
    expect(compareSourceIdentity(spBase, vr).classification).toBe('TITLE_VARIANT');
  });

  it('publisher equivalent only -> PUBLISHER_EQUIVALENT', () => {
    const spOECD: SourcePackRecord = {
      sourceId: 'SRC-OECD',
      title: 'Economic Outlook',
      organization: 'Organisation for Economic Co-operation and Development',
      url: 'https://oecd.org/report',
    };
    const vr: Partial<VerificationRecord> = {
      observedTitle: 'Economic Outlook',
      sourceUrl: 'https://oecd.org/report',
      publisherObserved: 'OECD',
    };
    expect(compareSourceIdentity(spOECD, vr).classification).toBe('PUBLISHER_EQUIVALENT');
  });

  it('redirect only -> REDIRECT_EQUIVALENT', () => {
    const vr: Partial<VerificationRecord> = {
      observedTitle: 'Standard Title',
      sourceUrl: 'http://worldbank.org/report',
      canonicalUrl: 'https://worldbank.org/report',
      redirectObserved: true,
      redirectEvidence: 'HTTP 301 redirect to HTTPS',
      publisherObserved: 'World Bank',
    };
    expect(compareSourceIdentity(spBase, vr).classification).toBe('REDIRECT_EQUIVALENT');
  });
});

describe('Phase 3A.5 One-to-One Set Mapping Validator (Case Q)', () => {
  const sources: SourcePackRecord[] = [
    { sourceId: 'SRC-01', title: 'A', url: 'https://a.com' },
    { sourceId: 'SRC-02', title: 'B', url: 'https://b.com' },
  ];
  const records: VerificationRecord[] = [
    { sourcePackSourceId: 'SRC-01', verificationSourceId: 'SRC-01', sourceUrl: 'https://a.com', verificationStatus: 'VERIFIED', verificationMethod: 'page_reader', sourceExists: true, sourceIdentityVerified: true, notes: 'ok' },
    { sourcePackSourceId: 'SRC-02', verificationSourceId: 'SRC-02', sourceUrl: 'https://b.com', verificationStatus: 'VERIFIED', verificationMethod: 'page_reader', sourceExists: true, sourceIdentityVerified: true, notes: 'ok' },
  ];

  it('detects duplicate discovery IDs', () => {
    const dupSources = [...sources, { sourceId: 'SRC-01', title: 'A duplicate', url: 'https://a.com' }];
    const res = validateSourceMappingSet(dupSources, records);
    expect(res.valid).toBe(false);
    expect(res.duplicateDiscoveryIds).toContain('SRC-01');
  });

  it('detects duplicate verification IDs', () => {
    const dupRecords = [...records, { ...records[0] }];
    const res = validateSourceMappingSet(sources, dupRecords);
    expect(res.valid).toBe(false);
    expect(res.duplicateVerificationIds).toContain('SRC-01');
  });

  it('detects missing discovery IDs in verification', () => {
    const res = validateSourceMappingSet(sources, [records[0]]);
    expect(res.valid).toBe(false);
    expect(res.missingFromVerification).toContain('SRC-02');
  });

  it('detects orphan verification records', () => {
    const extraRecord: VerificationRecord = {
      sourcePackSourceId: 'SRC-99',
      verificationSourceId: 'SRC-99',
      sourceUrl: 'https://x.com',
      verificationStatus: 'VERIFIED',
      verificationMethod: 'page_reader',
      sourceExists: true,
      sourceIdentityVerified: true,
      notes: 'orphan',
    };
    const res = validateSourceMappingSet(sources, [...records, extraRecord]);
    expect(res.valid).toBe(false);
    expect(res.extraInVerification).toContain('SRC-99');
  });

  it('detects mismatched sourcePackSourceId vs verificationSourceId', () => {
    const mismatchedRecord: VerificationRecord = {
      ...records[0],
      verificationSourceId: 'SRC-WRONG-ID',
    };
    const res = validateSourceMappingSet(sources, [mismatchedRecord, records[1]]);
    expect(res.valid).toBe(false);
    expect(res.mismatchedIdPairs.length).toBe(1);
  });
});

describe('Phase 3A.5 Symmetric Identity Fingerprinting (Case R)', () => {
  it('computes identical SHA256 fingerprints from identical canonical identities', () => {
    const ident1 = canonicalizeIdentity('Climate Report 2024', 'https://ipcc.ch/report', 'IPCC', 'N/A');
    const ident2 = canonicalizeIdentity('“Climate Report 2024”', 'https://ipcc.ch/report/', 'ipcc', '');

    const fp1 = computeIdentityFingerprint(ident1);
    const fp2 = computeIdentityFingerprint(ident2);

    expect(fp1).toBe(fp2);
    expect(fp1.length).toBe(64);
  });

  it('computes different fingerprints for different canonical identities', () => {
    const ident1 = canonicalizeIdentity('Climate Report 2024', 'https://ipcc.ch/report', 'IPCC');
    const ident2 = canonicalizeIdentity('Climate Report 2025', 'https://ipcc.ch/report', 'IPCC');

    expect(computeIdentityFingerprint(ident1)).not.toBe(computeIdentityFingerprint(ident2));
  });
});
