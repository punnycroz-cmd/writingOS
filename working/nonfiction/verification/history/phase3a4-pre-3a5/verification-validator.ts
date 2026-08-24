// src/phase3/verification-validator.ts
// Pure, evidence-based source identity and verification validator for Nonfiction Phase 3A.4.

import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

export interface SourcePackRecord {
  sourceId: string;
  title: string;
  author?: string;
  organization?: string;
  publicationDate?: string;
  publicationDateStatus?: string;
  url: string;
  stableUrl?: string;
  [key: string]: unknown;
}

export type TitleVariantType =
  | 'EXACT'
  | 'PUNCTUATION_VARIANT'
  | 'FORMATTING_VARIANT'
  | 'OFFICIAL_SUBTITLE_VARIANT'
  | 'OFFICIAL_RENAMING'
  | 'PARENT_PUBLICATION'
  | 'MISMATCH';

export interface VerificationRecord {
  sourcePackSourceId: string;
  verificationSourceId: string;
  sourcePackVersion?: string;
  sourceUrl: string;
  canonicalUrl?: string;
  discoveryTitle?: string;
  observedTitle?: string;
  titleMatch?: boolean;
  titleVariantType?: TitleVariantType;
  titleMismatchReason?: string;
  authorObserved?: string;
  publisherObserved?: string;
  publicationDateObserved?: string;
  publicationDateStatus?: 'SOURCE_VERIFIED_DATE' | 'DISCOVERY_INHERITED' | 'APPROXIMATE' | 'UNKNOWN';
  publicationDateEvidence?: string;
  versionDateObserved?: string | null;
  pageLastModified?: string;
  retrievedAt?: string;
  sourceExists?: boolean;
  sourceIdentityVerified?: boolean;
  retrievalStatus?: string;
  verificationStatus: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'BLOCKED' | 'FAILED' | 'UNRESOLVED';
  verificationBlockReason?: 'BOT_PROTECTION' | 'PDF_PARSER_LIMITATION' | 'JSON_PARSE_LIMITATION' | 'ACCESS_RESTRICTION' | 'RATE_LIMIT' | 'OTHER_TECHNICAL_LIMITATION';
  verificationMethod: string;
  evidenceLocations?: string[];
  retrievedArtifact?: string;
  artifactSha256?: string;
  redirectObserved?: boolean;
  redirectEvidence?: string;
  licenseEvidence?: string;
  notes: string;
  [key: string]: unknown;
}

export interface CanonicalIdentity {
  title: string;
  canonicalUrl: string;
  publisher: string;
  author: string;
}

export type IdentityClassification =
  | 'EXACT_NORMALIZED_MATCH'
  | 'DOCUMENTED_TITLE_VARIANT'
  | 'DOCUMENTED_EQUIVALENT'
  | 'PARENT_PUBLICATION_RELATION'
  | 'MISMATCH';

export interface ComponentComparisonResult {
  status: 'MATCH' | 'DOCUMENTED_VARIANT' | 'DOCUMENTED_EQUIVALENT' | 'NOT_APPLICABLE' | 'UNKNOWN' | 'MISMATCH';
  reason: string;
}

export interface IdentityComparisonResult {
  match: boolean;
  classification: IdentityClassification;
  sourcePackIdentityFingerprint: string;
  verificationIdentityFingerprint: string;
  title: ComponentComparisonResult;
  url: ComponentComparisonResult;
  publisher: ComponentComparisonResult;
  author: ComponentComparisonResult;
  errors: string[];
}

export interface ValidationDiagnostic {
  valid: boolean;
  identityComparison: IdentityComparisonResult;
  errors: string[];
  warnings: string[];
}

// 1. Normalization Functions
export function normalizeTitle(title?: string): string {
  if (!title) return '';
  let t = title.toLowerCase().trim();
  t = t.replace(/[\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F'"]/g, '');
  t = t.replace(/[\u2012\u2013\u2014\u2015\-]/g, '-');
  t = t.replace(/\s*[:;]\s*/g, ': ');
  t = t.replace(/[^\w\s\-:]/g, ' ');
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

export function normalizeUrl(url?: string): string {
  if (!url) return '';
  let u = url.toLowerCase().trim();
  u = u.replace(/^http:\/\//, 'https://');
  u = u.replace(/#.*$/, '');
  u = u.replace(/\/+$/, '');
  return u;
}

export function normalizePublisher(pub?: string): string {
  if (!pub) return '';
  let p = pub.toLowerCase().trim();
  // Strip legal corporate suffixes without corrupting hyphenated prefixes
  p = p.replace(/\b(inc|incorporated|corp|corporation|ltd|llc|gmbh)\b\.?/g, '');
  p = p.replace(/[^\w\s]/g, ' ');
  p = p.replace(/\s+/g, ' ').trim();
  return p;
}

// Known recognized publisher equivalents
const KNOWN_PUBLISHER_EQUIVALENTS: Record<string, string[]> = {
  'oecd': ['organisation for economic co operation and development', 'organisation for economic cooperation and development', 'organization for economic cooperation and development', 'organization for economic co operation and development'],
  'ipcc': ['intergovernmental panel on climate change', 'un digital library'],
  'nih': ['national institutes of health', 'national library of medicine', 'pmc', 'pmc nih', 'pmc nih national library of medicine', 'ncbi'],
  'nist': ['national institute of standards and technology', 'csrc nist', 'csrc'],
  'noaa': ['national oceanic and atmospheric administration', 'noaa institutional repository'],
  'fao': ['food and agriculture organization', 'food and agriculture organization of the united nations', 'fao knowledge repository'],
  'bls': ['bureau of labor statistics', 'u s bureau of labor statistics', 'us bureau of labor statistics'],
  'bea': ['bureau of economic analysis', 'u s bureau of economic analysis', 'us bureau of economic analysis'],
  'census': ['census bureau', 'u s census bureau', 'us census bureau'],
  'nber': ['national bureau of economic research'],
  'cdc': ['centers for disease control and prevention', 'national center for health statistics', 'cdc nchs'],
  'who': ['world health organization'],
  'world bank': ['the world bank', 'international bank for reconstruction and development'],
  'wef': ['world economic forum'],
  'undp': ['united nations development programme'],
  'enisa': ['european union agency for cybersecurity'],
  'sec': ['sec edgar', 'u s securities and exchange commission'],
  'microsoft': ['microsoft corporation', 'microsoft corporation sec edgar'],
  'apple': ['apple inc', 'apple inc sec edgar'],
  'amazon': ['amazon com', 'amazon com inc', 'amazon com inc sec edgar'],
  'our world in data': ['owid', 'global change data lab'],
};

export function arePublishersEquivalent(pubA?: string, pubB?: string): boolean {
  const normA = normalizePublisher(pubA);
  const normB = normalizePublisher(pubB);
  if (!normA || !normB) return false;
  if (normA === normB) return true;

  for (const [canonical, aliases] of Object.entries(KNOWN_PUBLISHER_EQUIVALENTS)) {
    const all = [canonical, ...aliases];
    const matchA = all.some(alias => normA.includes(alias) || alias.includes(normA) || normA === alias);
    const matchB = all.some(alias => normB.includes(alias) || alias.includes(normB) || normB === alias);
    if (matchA && matchB) return true;
  }

  return false;
}

export function normalizeAuthor(author?: string): string {
  if (!author) return '';
  let a = author.toLowerCase().trim();
  if (['n/a', 'none', 'unknown', 'various', 'multiple authors'].some(v => a.includes(v))) {
    return '';
  }
  a = a.replace(/[^\w\s]/g, ' ');
  a = a.replace(/\s+/g, ' ').trim();
  return a;
}

// 2. Canonical Identity & Symmetric Fingerprint Functions
export function canonicalizeIdentity(
  title: string,
  url: string,
  publisher?: string,
  author?: string
): CanonicalIdentity {
  return {
    title: normalizeTitle(title),
    canonicalUrl: normalizeUrl(url),
    publisher: normalizePublisher(publisher),
    author: normalizeAuthor(author),
  };
}

export function computeIdentityFingerprint(identity: CanonicalIdentity): string {
  const serialized = `TITLE=${identity.title}|URL=${identity.canonicalUrl}|PUB=${identity.publisher}|AUTH=${identity.author}`;
  return createHash('sha256').update(serialized).digest('hex');
}

// 3. Component-by-Component Source Identity Comparison
export function compareSourceIdentity(
  sp: SourcePackRecord,
  vr: Partial<VerificationRecord>
): IdentityComparisonResult {
  const errors: string[] = [];

  const spIdent = canonicalizeIdentity(sp.title, sp.url || sp.stableUrl || '', sp.organization, sp.author);
  const vrIdent = canonicalizeIdentity(
    vr.observedTitle || vr.discoveryTitle || '',
    vr.sourceUrl || vr.canonicalUrl || '',
    vr.publisherObserved || sp.organization,
    vr.authorObserved || sp.author
  );

  const spFingerprint = computeIdentityFingerprint(spIdent);
  const vrFingerprint = computeIdentityFingerprint(vrIdent);

  // 1. URL Comparison
  const spUrlNorm = spIdent.canonicalUrl;
  const vrUrlNorm = normalizeUrl(vr.sourceUrl);
  const vrCanonicalNorm = normalizeUrl(vr.canonicalUrl);
  let urlRes: ComponentComparisonResult;

  if (spUrlNorm === vrUrlNorm && spUrlNorm.length > 0) {
    urlRes = { status: 'MATCH', reason: 'Exact normalized URL match' };
  } else if (vr.redirectObserved && vr.redirectEvidence && vrCanonicalNorm === spUrlNorm) {
    urlRes = { status: 'DOCUMENTED_VARIANT', reason: `Documented redirect: ${vr.redirectEvidence}` };
  } else if (vrCanonicalNorm === spUrlNorm && !vr.redirectObserved && !vr.redirectEvidence) {
    urlRes = { status: 'MISMATCH', reason: `URL mismatch: sourceUrl="${vr.sourceUrl}" differs from discovery without redirectEvidence` };
    errors.push(urlRes.reason);
  } else {
    urlRes = { status: 'MISMATCH', reason: `URL mismatch: discovery="${sp.url}" vs verification="${vr.sourceUrl}"` };
    errors.push(urlRes.reason);
  }

  // 2. Title Comparison
  const spTitleNorm = spIdent.title;
  const vrTitleNorm = vrIdent.title;
  let titleRes: ComponentComparisonResult;

  const validVariantTypes: TitleVariantType[] = [
    'EXACT',
    'PUNCTUATION_VARIANT',
    'FORMATTING_VARIANT',
    'OFFICIAL_SUBTITLE_VARIANT',
    'OFFICIAL_RENAMING',
    'PARENT_PUBLICATION',
  ];

  if (spTitleNorm === vrTitleNorm && spTitleNorm.length > 0) {
    titleRes = { status: 'MATCH', reason: 'Exact normalized title match' };
  } else if (
    vr.titleVariantType &&
    validVariantTypes.includes(vr.titleVariantType) &&
    vr.titleVariantType !== 'MISMATCH' &&
    vr.titleMismatchReason &&
    vr.titleMismatchReason.trim().length > 0
  ) {
    titleRes = {
      status: 'DOCUMENTED_VARIANT',
      reason: `[${vr.titleVariantType}] ${vr.titleMismatchReason}`,
    };
  } else {
    titleRes = {
      status: 'MISMATCH',
      reason: `Title mismatch without documented titleVariantType & reason: discovery="${sp.title}" vs observed="${vr.observedTitle}"`,
    };
    errors.push(titleRes.reason);
  }

  // 3. Publisher / Organization Comparison
  const spPubNorm = spIdent.publisher;
  const vrPubNorm = vrIdent.publisher;
  let pubRes: ComponentComparisonResult;

  if (spPubNorm === vrPubNorm && spPubNorm.length > 0) {
    pubRes = { status: 'MATCH', reason: 'Exact normalized publisher match' };
  } else if (arePublishersEquivalent(sp.organization, vr.publisherObserved)) {
    pubRes = {
      status: 'DOCUMENTED_EQUIVALENT',
      reason: `Publisher recognized equivalent: discovery="${sp.organization}" vs observed="${vr.publisherObserved}"`,
    };
  } else if (!vrPubNorm || !spPubNorm) {
    pubRes = { status: 'UNKNOWN', reason: 'Publisher omitted in one or both records' };
  } else {
    pubRes = { status: 'MISMATCH', reason: `Publisher mismatch: discovery="${sp.organization}" vs observed="${vr.publisherObserved}"` };
    errors.push(pubRes.reason);
  }

  // 4. Author Comparison
  const spAuthNorm = spIdent.author;
  const vrAuthNorm = vrIdent.author;
  let authRes: ComponentComparisonResult;

  if (!spAuthNorm && !vrAuthNorm) {
    authRes = { status: 'NOT_APPLICABLE', reason: 'Organizational/corporate authorship' };
  } else if (spAuthNorm === vrAuthNorm && spAuthNorm.length > 0) {
    authRes = { status: 'MATCH', reason: 'Exact normalized author match' };
  } else if (
    spAuthNorm.length > 0 &&
    vrAuthNorm.length > 0 &&
    (spAuthNorm.includes(vrAuthNorm) || vrAuthNorm.includes(spAuthNorm))
  ) {
    authRes = { status: 'DOCUMENTED_EQUIVALENT', reason: 'Author citation format equivalent' };
  } else if (!spAuthNorm || !vrAuthNorm) {
    authRes = { status: 'UNKNOWN', reason: `Author unspecified in one record: discovery="${sp.author}" vs observed="${vr.authorObserved}"` };
  } else {
    authRes = { status: 'MISMATCH', reason: `Author mismatch: discovery="${sp.author}" vs observed="${vr.authorObserved}"` };
    errors.push(authRes.reason);
  }

  // Overall match evaluation
  let classification: IdentityClassification = 'MISMATCH';
  const match = errors.length === 0 && urlRes.status !== 'MISMATCH' && titleRes.status !== 'MISMATCH' && pubRes.status !== 'MISMATCH' && authRes.status !== 'MISMATCH';

  if (match) {
    if (titleRes.status === 'MATCH' && urlRes.status === 'MATCH' && pubRes.status === 'MATCH') {
      classification = 'EXACT_NORMALIZED_MATCH';
    } else {
      classification = 'DOCUMENTED_TITLE_VARIANT';
    }
  }

  return {
    match,
    classification,
    sourcePackIdentityFingerprint: spFingerprint,
    verificationIdentityFingerprint: vrFingerprint,
    title: titleRes,
    url: urlRes,
    publisher: pubRes,
    author: authRes,
    errors,
  };
}

// 4. Publication Date Validation
export function validatePublicationDate(
  record: Partial<VerificationRecord>,
  source?: SourcePackRecord
): string[] {
  const errors: string[] = [];
  const status = record.publicationDateStatus;
  const evidence = record.publicationDateEvidence || '';

  if (evidence.toUpperCase().includes('SYSTEM_CLOCK')) {
    errors.push(`publicationDateEvidence="${evidence}" is invalid (system clock cannot determine publication date)`);
  }
  if (evidence.toUpperCase().includes('FILE_MTIME') || evidence.toUpperCase().includes('GIT_REFLOG')) {
    errors.push(`publicationDateEvidence="${evidence}" is invalid (git/filesystem timestamps are not document publication dates)`);
  }

  const obs = record.publicationDateObserved || '';
  if (obs.includes('GMT') || /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),/.test(obs)) {
    errors.push(`publicationDateObserved="${obs}" appears to be an HTTP transport header, not a document publication date`);
  }

  const allowedStatuses = ['SOURCE_VERIFIED_DATE', 'DISCOVERY_INHERITED', 'APPROXIMATE', 'UNKNOWN'];
  if (status && !allowedStatuses.includes(status)) {
    errors.push(`publicationDateStatus="${status}" is invalid. Must be one of: ${allowedStatuses.join(', ')}`);
  }

  if (status === 'SOURCE_VERIFIED_DATE') {
    if (!evidence || evidence.trim() === '' || evidence.toLowerCase().includes('discovery')) {
      errors.push('SOURCE_VERIFIED_DATE requires explicit primary evidence from source document or publisher metadata');
    }
  }

  if (status === 'DISCOVERY_INHERITED') {
    if (!evidence.toLowerCase().includes('discovery')) {
      errors.push('DISCOVERY_INHERITED evidence must indicate derivation from frozen discovery source-index');
    }
  }

  return errors;
}

// 5. Verification Status Criteria Validation
export function validateVerificationStatus(
  record: Partial<VerificationRecord>,
  identityComp?: IdentityComparisonResult
): string[] {
  const errors: string[] = [];
  const status = record.verificationStatus;

  if (!status || !['VERIFIED', 'PARTIALLY_VERIFIED', 'BLOCKED', 'FAILED', 'UNRESOLVED'].includes(status)) {
    errors.push(`Invalid verificationStatus: "${status}"`);
    return errors;
  }

  if (identityComp && !identityComp.match && record.sourceIdentityVerified === true) {
    errors.push('Contradiction: sourceIdentityVerified === true but identity comparison failed');
  }

  if (status === 'VERIFIED') {
    if (record.sourceIdentityVerified !== true) {
      errors.push('VERIFIED status requires sourceIdentityVerified === true');
    }
    if (identityComp && !identityComp.match) {
      errors.push('VERIFIED status requires identityComparison.match === true');
    }
    if (record.sourceExists !== true) {
      errors.push('VERIFIED status requires sourceExists === true');
    }
    if (!record.evidenceLocations || record.evidenceLocations.length === 0) {
      errors.push('VERIFIED status requires non-empty evidenceLocations array');
    }
    if (record.titleMatch === false && (!record.titleMismatchReason || record.titleMismatchReason.trim() === '')) {
      errors.push('VERIFIED status with titleMatch=false requires documented titleMismatchReason');
    }
  }

  if (status === 'BLOCKED') {
    if (!record.verificationBlockReason) {
      errors.push('BLOCKED status requires explicit verificationBlockReason');
    }
    const allowedReasons = [
      'BOT_PROTECTION',
      'PDF_PARSER_LIMITATION',
      'JSON_PARSE_LIMITATION',
      'ACCESS_RESTRICTION',
      'RATE_LIMIT',
      'OTHER_TECHNICAL_LIMITATION',
    ];
    if (record.verificationBlockReason && !allowedReasons.includes(record.verificationBlockReason)) {
      errors.push(`Invalid verificationBlockReason: "${record.verificationBlockReason}". Must be one of: ${allowedReasons.join(', ')}`);
    }
    if (!record.notes || record.notes.trim() === '') {
      errors.push('BLOCKED status requires explanatory notes');
    }
  }

  if (status === 'FAILED') {
    const notes = (record.notes || '').toLowerCase();
    if (notes.includes('429') || notes.includes('rate limit') || notes.includes('timeout')) {
      errors.push('FAILED status cannot be assigned solely for temporary rate-limit or timeout errors (use BLOCKED)');
    }
    if (!record.notes || record.notes.trim() === '') {
      errors.push('FAILED status requires explicit notes explaining why the source is considered failed');
    }
  }

  return errors;
}

// 6. Artifact Hash Validation
export function validateArtifact(
  record: Partial<VerificationRecord>
): string[] {
  const errors: string[] = [];

  if (record.retrievedArtifact) {
    if (!existsSync(record.retrievedArtifact)) {
      errors.push(`Retrieved artifact file does not exist: ${record.retrievedArtifact}`);
    } else if (record.artifactSha256) {
      try {
        const buf = readFileSync(record.retrievedArtifact);
        const actualSha = createHash('sha256').update(buf).digest('hex');
        if (actualSha !== record.artifactSha256) {
          errors.push(`Artifact SHA256 mismatch for ${record.retrievedArtifact}: recorded=${record.artifactSha256} actual=${actualSha}`);
        }
      } catch (err: any) {
        errors.push(`Failed to compute artifact hash: ${err.message}`);
      }
    }
  }

  return errors;
}

// 7. Full Record Validator
export function validateFullRecord(
  record: Partial<VerificationRecord>,
  source?: SourcePackRecord
): ValidationDiagnostic {
  const errors: string[] = [];
  const warnings: string[] = [];

  const requiredFields = [
    'sourcePackSourceId',
    'verificationSourceId',
    'sourceUrl',
    'verificationStatus',
    'verificationMethod',
    'sourceExists',
    'sourceIdentityVerified',
    'notes',
  ];

  for (const field of requiredFields) {
    if (record[field as keyof VerificationRecord] === undefined || record[field as keyof VerificationRecord] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  let identityRes: IdentityComparisonResult = {
    match: false,
    classification: 'MISMATCH',
    sourcePackIdentityFingerprint: '',
    verificationIdentityFingerprint: '',
    title: { status: 'UNKNOWN', reason: 'No source pack record provided' },
    url: { status: 'UNKNOWN', reason: 'No source pack record provided' },
    publisher: { status: 'UNKNOWN', reason: 'No source pack record provided' },
    author: { status: 'UNKNOWN', reason: 'No source pack record provided' },
    errors: ['No source pack record provided for comparison'],
  };

  if (source) {
    identityRes = compareSourceIdentity(source, record);
    if (!identityRes.match) {
      errors.push(...identityRes.errors);
    }
  } else {
    errors.push(`No matching discovery source-pack record found for ${record.sourcePackSourceId}`);
  }

  errors.push(...validatePublicationDate(record, source));
  errors.push(...validateVerificationStatus(record, identityRes));
  errors.push(...validateArtifact(record));

  return {
    valid: errors.length === 0,
    identityComparison: identityRes,
    errors,
    warnings,
  };
}
