// scripts/phase3/generate-source-id-map.ts
// Programmatically generate nonfiction/verification/source-id-map.json using compareSourceIdentity.

import { readFileSync, writeFileSync } from 'node:fs';
import {
  compareSourceIdentity,
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

const mappings = ledgerLines.map(vr => {
  const sp = spMap.get(vr.sourcePackSourceId);
  if (!sp) {
    throw new Error(`Missing source pack record for ${vr.sourcePackSourceId}`);
  }

  const comp = compareSourceIdentity(sp, vr);

  return {
    sourcePackSourceId: sp.sourceId,
    verificationSourceId: vr.verificationSourceId,
    sourcePackTitle: sp.title,
    verificationTitle: vr.observedTitle || vr.discoveryTitle || '',
    sourcePackCanonicalUrl: sp.url,
    verificationCanonicalUrl: vr.sourceUrl,
    sourcePackPublisher: sp.organization || 'N/A',
    verificationPublisher: vr.publisherObserved || 'N/A',
    sourcePackFingerprint: comp.sourcePackFingerprint,
    verificationFingerprint: comp.verificationFingerprint,
    titleComparison: comp.title,
    urlComparison: comp.url,
    publisherComparison: comp.publisher,
    authorComparison: comp.author,
    identityMatch: comp.match,
    identityClassification: comp.classification,
    mappingReason: comp.match
      ? 'Independently compared and verified across title, URL, publisher, and author'
      : `Identity comparison failed: ${comp.errors.join('; ')}`,
  };
});

const allMatched = mappings.every(m => m.identityMatch);

const output = {
  generatedAt: new Date().toISOString(),
  totalSources: spSources.length,
  totalLedgerRecords: ledgerLines.length,
  allMapped: mappings.length === spSources.length && allMatched,
  mappings,
};

writeFileSync('nonfiction/verification/source-id-map.json', JSON.stringify(output, null, 2));
console.log(`Generated source-id-map.json with ${mappings.length} mappings (allMatched: ${allMatched})`);
