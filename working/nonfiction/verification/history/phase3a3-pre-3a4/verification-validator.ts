// src/phase3/verification-validator.ts
// Pure, evidence-based source identity and verification validator for Nonfiction Phase 3A.

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

export interface VerificationRecord {
  sourcePackSourceId: string;
  verificationSourceId: string;
  sourcePackVersion?: string;
  sourceUrl: string;
  canonicalUrl?: string;
  discoveryTitle?: string;
  observedTitle?: string;
  titleMatch?: boolean;
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
  licenseEvidence?: string;
  notes: string;
  [key: string]: unknown;
}

export type IdentityClassification =
  | 'EXACT_NORMALIZED_MATCH'
  | 'DOCUMENTED_TITLE_VARIANT'
  | 'PARENT_PUBLICATION_RELATION'
  | 'MISMATCH';

export interface ComponentComparisonResult {
  status: 'MATCH' | 'DOCUMENTED_VARIANT' | 'DOCUMENTED_EQUIVALENT' | 'MISMATCH' | 'NOT_APPLICABLE' | 'UNKNOWN';
  reason: string;
}

export interface IdentityComparisonResult {
  match: boolean;
  classification: IdentityClassification;
  sourcePackFingerprint: string;
  verificationFingerprint: string;
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
  // Strip all smart quotes, single quotes, and double quotes to normalize quotation variance
  t = t.replace(/[\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F'"]/g, '');
  // Normalize Unicode dashes (em-dash, en-dash, figure dash, hyphens)
  t = t.replace(/[\u2012\u2013\u2014\u2015\-]/g, '-');
  // Normalize colons and semicolons surrounded by spaces
  t = t.replace(/\s*[:;]\s*/g, ': ');
  // Replace non-word punctuation with space while preserving words and basic hyphens
  t = t.replace(/[^\w\s\-:]/g, ' ');
  // Collapse whitespace
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

export function normalizeUrl(url?: string): string {
  if (!url) return '';
  let u = url.toLowerCase().trim();
  // Normalize protocol
  u = u.replace(/^http:\/\//, 'https://');
  // Strip fragment
  u = u.replace(/#.*$/, '');
  // Strip trailing slashes
  u = u.replace(/\/+$/, '');
  return u;
}

export function normalizePublisher(pub?: string): string {
  if (!pub) return '';
  let p = pub.toLowerCase().trim();
  // Strip legal suffixes / noise words
  p = p.replace(/\b(inc|incorporated|corp|corporation|ltd|llc|gmbh|co)\b\.?/g, '');
  p = p.replace(/[^\w\s]/g, ' ');
  p = p.replace(/\s+/g, ' ').trim();
  return p;
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

// 2. Independent Fingerprint Generators
export function computeSourcePackFingerprint(sp: SourcePackRecord): string {
  const normT = normalizeTitle(sp.title);
  const normU = normalizeUrl(sp.url || sp.stableUrl);
  const normP = normalizePublisher(sp.organization);
  return `SP[${normT}]::[${normU}]::[${normP}]`;
}

export function computeVerificationFingerprint(vr: Partial<VerificationRecord>): string {
  const title = vr.observedTitle || vr.discoveryTitle || '';
  const normT = normalizeTitle(title);
  const normU = normalizeUrl(vr.sourceUrl || vr.canonicalUrl);
  const normP = normalizePublisher(vr.publisherObserved);
  return `VR[${normT}]::[${normU}]::[${normP}]`;
}

// 3. Multi-Field Identity Comparison Function
export function compareSourceIdentity(
  sp: SourcePackRecord,
  vr: Partial<VerificationRecord>
): IdentityComparisonResult {
  const errors: string[] = [];

  const spFingerprint = computeSourcePackFingerprint(sp);
  const vrFingerprint = computeVerificationFingerprint(vr);

  // 1. URL Comparison
  const spUrlNorm = normalizeUrl(sp.url || sp.stableUrl);
  const vrUrlNorm = normalizeUrl(vr.sourceUrl || vr.canonicalUrl);
  let urlRes: ComponentComparisonResult;
  if (spUrlNorm === vrUrlNorm && spUrlNorm.length > 0) {
    urlRes = { status: 'MATCH', reason: 'Exact normalized URL match' };
  } else if (vr.canonicalUrl && normalizeUrl(vr.canonicalUrl) === spUrlNorm) {
    urlRes = { status: 'DOCUMENTED_EQUIVALENT', reason: 'Canonical URL matches discovery source' };
  } else {
    urlRes = { status: 'MISMATCH', reason: `URL mismatch: discovery="${sp.url}" vs verification="${vr.sourceUrl}"` };
    errors.push(urlRes.reason);
  }

  // 2. Title Comparison
  const spTitleNorm = normalizeTitle(sp.title);
  const vrTitleNorm = normalizeTitle(vr.observedTitle || vr.discoveryTitle || '');
  let titleRes: ComponentComparisonResult;
  if (spTitleNorm === vrTitleNorm && spTitleNorm.length > 0) {
    titleRes = { status: 'MATCH', reason: 'Exact normalized title match' };
  } else if (vr.titleMismatchReason && vr.titleMismatchReason.trim().length > 0) {
    titleRes = { status: 'DOCUMENTED_VARIANT', reason: vr.titleMismatchReason };
  } else {
    titleRes = { status: 'MISMATCH', reason: `Title mismatch without documented reason: discovery="${sp.title}" vs observed="${vr.observedTitle}"` };
    errors.push(titleRes.reason);
  }

  // 3. Publisher / Organization Comparison
  const spPubNorm = normalizePublisher(sp.organization);
  const vrPubNorm = normalizePublisher(vr.publisherObserved);
  let pubRes: ComponentComparisonResult;
  if (spPubNorm === vrPubNorm && spPubNorm.length > 0) {
    pubRes = { status: 'MATCH', reason: 'Exact normalized publisher match' };
  } else if (
    (spPubNorm.includes(vrPubNorm) || vrPubNorm.includes(spPubNorm)) &&
    spPubNorm.length > 0 &&
    vrPubNorm.length > 0
  ) {
    pubRes = { status: 'DOCUMENTED_EQUIVALENT', reason: `Publisher equivalent under organization hierarchy: discovery="${sp.organization}" vs observed="${vr.publisherObserved}"` };
  } else if (!vrPubNorm || !spPubNorm) {
    pubRes = { status: 'UNKNOWN', reason: 'Publisher information omitted in one or both records' };
  } else {
    pubRes = { status: 'MISMATCH', reason: `Publisher mismatch: discovery="${sp.organization}" vs observed="${vr.publisherObserved}"` };
    errors.push(pubRes.reason);
  }

  // 4. Author Comparison
  const spAuthNorm = normalizeAuthor(sp.author);
  const vrAuthNorm = normalizeAuthor(vr.authorObserved);
  let authRes: ComponentComparisonResult;
  if (!spAuthNorm && !vrAuthNorm) {
    authRes = { status: 'NOT_APPLICABLE', reason: 'Organizational/corporate authorship (no individual author specified)' };
  } else if (spAuthNorm === vrAuthNorm && spAuthNorm.length > 0) {
    authRes = { status: 'MATCH', reason: 'Exact normalized author match' };
  } else if (
    spAuthNorm.length > 0 &&
    vrAuthNorm.length > 0 &&
    (spAuthNorm.includes(vrAuthNorm) || vrAuthNorm.includes(spAuthNorm))
  ) {
    authRes = { status: 'DOCUMENTED_EQUIVALENT', reason: 'Author citation format equivalent' };
  } else {
    authRes = { status: 'UNKNOWN', reason: `Author variance: discovery="${sp.author}" vs observed="${vr.authorObserved}"` };
  }

  // Determine overall classification
  let classification: IdentityClassification = 'MISMATCH';
  const match = errors.length === 0 && urlRes.status !== 'MISMATCH' && titleRes.status !== 'MISMATCH' && pubRes.status !== 'MISMATCH';

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
    sourcePackFingerprint: spFingerprint,
    verificationFingerprint: vrFingerprint,
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

  // Invalid evidence values
  if (evidence.toUpperCase().includes('SYSTEM_CLOCK')) {
    errors.push(`publicationDateEvidence="${evidence}" is invalid (system clock cannot determine publication date)`);
  }
  if (evidence.toUpperCase().includes('FILE_MTIME') || evidence.toUpperCase().includes('GIT_REFLOG')) {
    errors.push(`publicationDateEvidence="${evidence}" is invalid (git/filesystem timestamps are not document publication dates)`);
  }

  // HTTP Last-Modified timestamp used as publication date
  const obs = record.publicationDateObserved || '';
  if (obs.includes('GMT') || /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),/.test(obs)) {
    errors.push(`publicationDateObserved="${obs}" appears to be an HTTP transport header, not a document publication date`);
  }

  // Allowed statuses
  const allowedStatuses = ['SOURCE_VERIFIED_DATE', 'DISCOVERY_INHERITED', 'APPROXIMATE', 'UNKNOWN'];
  if (status && !allowedStatuses.includes(status)) {
    errors.push(`publicationDateStatus="${status}" is invalid. Must be one of: ${allowedStatuses.join(', ')}`);
  }

  // Semantics rule: SOURCE_VERIFIED_DATE must have direct evidence from source or publisher metadata
  if (status === 'SOURCE_VERIFIED_DATE') {
    if (!evidence || evidence.trim() === '' || evidence.toLowerCase().includes('discovery')) {
      errors.push('SOURCE_VERIFIED_DATE requires explicit primary evidence from source document or publisher metadata');
    }
  }

  // Semantics rule: DISCOVERY_INHERITED must reference discovery index
  if (status === 'DISCOVERY_INHERITED') {
    if (!evidence.toLowerCase().includes('discovery')) {
      errors.push('DISCOVERY_INHERITED evidence must indicate derivation from frozen discovery source-index');
    }
  }

  return errors;
}

// 5. Verification Status Criteria Validation
export function validateVerificationStatus(
  record: Partial<VerificationRecord>
): string[] {
  const errors: string[] = [];
  const status = record.verificationStatus;

  if (!status || !['VERIFIED', 'PARTIALLY_VERIFIED', 'BLOCKED', 'FAILED', 'UNRESOLVED'].includes(status)) {
    errors.push(`Invalid verificationStatus: "${status}"`);
    return errors;
  }

  if (status === 'VERIFIED') {
    if (record.sourceIdentityVerified !== true) {
      errors.push('VERIFIED status requires sourceIdentityVerified === true');
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
    sourcePackFingerprint: '',
    verificationFingerprint: '',
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
  errors.push(...validateVerificationStatus(record));
  errors.push(...validateArtifact(record));

  return {
    valid: errors.length === 0,
    identityComparison: identityRes,
    errors,
    warnings,
  };
}
