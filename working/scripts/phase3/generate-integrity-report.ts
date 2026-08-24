// scripts/phase3/generate-integrity-report.ts
// Programmatically generate nonfiction/verification/verification-integrity-report.json from pure validator execution.

import { readFileSync, writeFileSync } from 'node:fs';
import {
  validateFullRecord,
  type SourcePackRecord,
  type VerificationRecord,
} from '../../src/phase3/verification-validator';

const spData = JSON.parse(readFileSync('nonfiction/source-pack/source-index.json', 'utf-8'));
const spSources: SourcePackRecord[] = spData.sources || spData;
const spMap = new Map<string, SourcePackRecord>(spSources.map(s => [s.sourceId, s]));

const ledgerLines = readFileSync('nonfiction/verification/source-verification-ledger.jsonl', 'utf-8')
  .trim()
  .split('\n')
  .map(l => JSON.parse(l) as VerificationRecord);

let validRecords = 0;
let invalidRecords = 0;
let identityMismatches = 0;
let publisherMismatches = 0;
let titleMismatches = 0;
let urlMismatches = 0;
let authorMismatches = 0;
let publicationDateIssues = 0;
let evidenceIssues = 0;
let artifactIssues = 0;
let statusSemanticIssues = 0;
let mappingIssues = 0;

const statusDistribution = {
  VERIFIED: 0,
  PARTIALLY_VERIFIED: 0,
  BLOCKED: 0,
  FAILED: 0,
  UNRESOLVED: 0,
};

const identityClassificationDistribution = {
  EXACT_NORMALIZED_MATCH: 0,
  DOCUMENTED_TITLE_VARIANT: 0,
  PARENT_PUBLICATION_RELATION: 0,
  MISMATCH: 0,
};

const publicationDateStatusDistribution = {
  SOURCE_VERIFIED_DATE: 0,
  DISCOVERY_INHERITED: 0,
  APPROXIMATE: 0,
  UNKNOWN: 0,
};

const blockedReasonDistribution = {
  BOT_PROTECTION: 0,
  PDF_PARSER_LIMITATION: 0,
  JSON_PARSE_LIMITATION: 0,
  ACCESS_RESTRICTION: 0,
  RATE_LIMIT: 0,
  OTHER_TECHNICAL_LIMITATION: 0,
};

for (const vr of ledgerLines) {
  const sp = spMap.get(vr.sourcePackSourceId);
  if (!sp) {
    mappingIssues++;
    invalidRecords++;
    continue;
  }

  const diag = validateFullRecord(vr, sp);
  if (diag.valid) {
    validRecords++;
  } else {
    invalidRecords++;
  }

  // Identity diagnostics
  if (!diag.identityComparison.match) {
    identityMismatches++;
  }
  if (diag.identityComparison.title.status === 'MISMATCH') {
    titleMismatches++;
  }
  if (diag.identityComparison.url.status === 'MISMATCH') {
    urlMismatches++;
  }
  if (diag.identityComparison.publisher.status === 'MISMATCH') {
    publisherMismatches++;
  }

  identityClassificationDistribution[diag.identityComparison.classification]++;

  // Date diagnostics
  if (diag.errors.some(e => e.includes('publicationDate'))) {
    publicationDateIssues++;
  }
  if (vr.publicationDateStatus && vr.publicationDateStatus in publicationDateStatusDistribution) {
    publicationDateStatusDistribution[vr.publicationDateStatus]++;
  }

  // Evidence & artifact diagnostics
  if (diag.errors.some(e => e.includes('evidenceLocations'))) {
    evidenceIssues++;
  }
  if (diag.errors.some(e => e.includes('artifact') || e.includes('SHA256'))) {
    artifactIssues++;
  }
  if (diag.errors.some(e => e.includes('verificationStatus') || e.includes('verificationBlockReason'))) {
    statusSemanticIssues++;
  }

  // Distribution counters
  if (vr.verificationStatus in statusDistribution) {
    statusDistribution[vr.verificationStatus]++;
  }
  if (vr.verificationBlockReason && vr.verificationBlockReason in blockedReasonDistribution) {
    blockedReasonDistribution[vr.verificationBlockReason]++;
  }
}

const report = {
  auditTimestamp: new Date().toISOString(),
  totalRecords: ledgerLines.length,
  validRecords,
  invalidRecords,
  identityMismatches,
  publisherMismatches,
  titleMismatches,
  urlMismatches,
  authorMismatches,
  publicationDateIssues,
  evidenceIssues,
  artifactIssues,
  statusSemanticIssues,
  mappingIssues,
  statusDistribution,
  identityClassificationDistribution,
  publicationDateStatusDistribution,
  blockedReasonDistribution,
  claimGroundTruthBoundary: {
    sourceVerifiedClaims: 0,
    containsGroundTruth: false,
  },
};

writeFileSync('nonfiction/verification/verification-integrity-report.json', JSON.stringify(report, null, 2));
console.log(`Generated verification-integrity-report.json: valid=${validRecords}, invalid=${invalidRecords}, identityMismatches=${identityMismatches}`);
