// src/phase3/verification-validator.ts
// Reusable pure validation module for Nonfiction source verification records.

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

export interface ValidationDiagnostic {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface IdentityFingerprintResult {
  fingerprint: string;
  identityMatch: boolean;
  reason: string;
}

// 1. Text Normalization Utilities
export function normalizeTitle(title?: string): string {
  if (!title) return '';
  let t = title.toLowerCase().trim();
  // Normalize smart quotes & apostrophes
  t = t.replace(/[\u2018\u2019\u201A\u201B']/g, "'");
  t = t.replace(/[\u201C\u201D\u201E\u201F"]/g, '"');
  // Normalize dashes (em-dash, en-dash, hyphens)
  t = t.replace(/[\u2013\u2014\u2015\-]/g, '-');
  // Normalize whitespace
  t = t.replace(/\s+/g, ' ');
  // Remove non-alphanumeric except basic spacing
  t = t.replace(/[^a-z0-9 ]/g, '').trim();
  return t;
}

export function normalizeUrl(url?: string): string {
  if (!url) return '';
  let u = url.toLowerCase().trim();
  // Strip trailing slashes
  u = u.replace(/\/+$/, '');
  // Normalize protocol
  u = u.replace(/^http:\/\//, 'https://');
  // Strip common tracking params or anchors
  u = u.replace(/#.*$/, '');
  return u;
}

export function normalizePublisher(pub?: string): string {
  if (!pub) return '';
  let p = pub.toLowerCase().trim();
  p = p.replace(/[^a-z0-9]/g, '');
  return p;
}

export function computeIdentityFingerprint(
  title: string,
  url: string,
  publisher?: string
): IdentityFingerprintResult {
  const normT = normalizeTitle(title);
  const normU = normalizeUrl(url);
  const normP = normalizePublisher(publisher);

  const fingerprint = `${normT}::${normU}::${normP}`;
  return {
    fingerprint,
    identityMatch: normT.length > 0 && normU.length > 0,
    reason: 'Deterministic fingerprint from normalized title, url, and publisher',
  };
}

// 2. Publication Date Validation
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

// 3. Source Identity Validation
export function validateSourceIdentity(
  record: Partial<VerificationRecord>,
  source?: SourcePackRecord
): string[] {
  const errors: string[] = [];
  if (!source) {
    errors.push(`No matching discovery source-pack record found for ${record.sourcePackSourceId}`);
    return errors;
  }

  // ID equality
  if (record.sourcePackSourceId !== source.sourceId) {
    errors.push(`Source ID mismatch: record=${record.sourcePackSourceId} vs sourcePack=${source.sourceId}`);
  }

  // URL matching
  const normRecUrl = normalizeUrl(record.sourceUrl || record.canonicalUrl);
  const normSpUrl = normalizeUrl(source.url || source.stableUrl);
  if (normRecUrl !== normSpUrl) {
    errors.push(`Canonical URL mismatch: record="${record.sourceUrl}" vs sourcePack="${source.url}"`);
  }

  // Title matching
  const normRecObsTitle = normalizeTitle(record.observedTitle || record.discoveryTitle);
  const normSpTitle = normalizeTitle(source.title);
  const titlesOverlap = normRecObsTitle === normSpTitle ||
                        normRecObsTitle.includes(normSpTitle) ||
                        normSpTitle.includes(normRecObsTitle);

  if (!titlesOverlap) {
    if (!record.titleMismatchReason || record.titleMismatchReason.trim() === '') {
      errors.push(`Title mismatch between observed="${record.observedTitle}" and discovery="${source.title}" without documented titleMismatchReason`);
    }
  }

  return errors;
}

// 4. Verification Status Criteria Validation
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

// 5. Evidence & Artifact Validation
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

// 6. Full Record Validation
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

  errors.push(...validatePublicationDate(record, source));
  if (source) {
    errors.push(...validateSourceIdentity(record, source));
  }
  errors.push(...validateVerificationStatus(record));
  errors.push(...validateArtifact(record));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
