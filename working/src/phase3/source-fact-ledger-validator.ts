import * as fs from 'fs';
import * as path from 'path';

export interface SourceFactLedgerRecord {
  ledgerFactId: string;
  claimId: string;
  sourcePackSourceId: string;
  claimText: string;
  claimType: string;
  epistemicStrength: string;
  causalStatus: string;
  sourceVerificationStatus: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'BLOCKED' | 'FAILED' | 'UNRESOLVED';
  factVerificationState: 'CANDIDATE' | 'UNSUPPORTED' | 'PARTIALLY_SUPPORTED' | 'SOURCE_VERIFIED';
  evidenceType: 'DIRECT' | 'PARTIAL' | 'BLOCKED' | 'NONE';
  evidenceExcerpt?: string;
  evidenceLocations: string[];
  retrievedArtifact: string;
  publicationDateObserved: string;
  publisherObserved: string;
  authorObserved: string;
  notes: string;
}

function findFile(relativePath: string): string {
  const candidates = [
    path.join(__dirname, '../../', relativePath),
    path.join(__dirname, '../../../', relativePath),
    path.join(process.cwd(), relativePath),
    path.join(process.cwd(), 'working', relativePath),
    path.join(process.cwd(), 'writing_os', relativePath),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.join(process.cwd(), relativePath);
}

export function validateLedgerRecord(record: SourceFactLedgerRecord): void {
  const schemaPath = findFile('nonfiction/ledger/source-fact-ledger-schema.json');
  if (fs.existsSync(schemaPath)) {
    const schemaStr = fs.readFileSync(schemaPath, 'utf-8');
    const schema = JSON.parse(schemaStr);
    for (const field of schema.required) {
      if ((record as any)[field] === undefined) {
        throw new Error(`Ledger record ${record.ledgerFactId} is missing required field: ${field}`);
      }
    }
  }

  validateEpistemicSafety(record);
}

export function validateEpistemicSafety(record: SourceFactLedgerRecord): void {
  if (record.sourceVerificationStatus === 'BLOCKED' && record.evidenceType === 'DIRECT') {
    throw new Error(`Epistemic Violation: BLOCKED source ${record.sourcePackSourceId} cannot have DIRECT evidence for claim ${record.claimId}`);
  }
  
  if (record.factVerificationState === 'SOURCE_VERIFIED') {
    throw new Error(`Epistemic Violation: Claim ${record.claimId} cannot be promoted to SOURCE_VERIFIED in Phase 3B`);
  }
}

export function buildSourceFactLedgerRecords(
  claimInventory: any[],
  verificationLedger: any[]
): SourceFactLedgerRecord[] {
  const verificationMap = new Map<string, any>();
  for (const v of verificationLedger) {
    verificationMap.set(v.sourcePackSourceId, v);
  }

  const records: SourceFactLedgerRecord[] = [];
  let index = 1;

  for (const claim of claimInventory) {
    let sourceIds: string[] = [];
    if (claim.sourceId) {
      sourceIds = Array.isArray(claim.sourceId) ? claim.sourceId : [claim.sourceId];
    } else if (claim.sourceIds) {
      sourceIds = claim.sourceIds;
    }

    if (sourceIds.length === 0) continue;

    for (const sid of sourceIds) {
      const vRecord = verificationMap.get(sid);
      if (!vRecord) {
        throw new Error(`Claim ${claim.claimId} references unknown source ${sid}`);
      }

      let evidenceType: 'DIRECT' | 'PARTIAL' | 'BLOCKED' | 'NONE' = 'NONE';
      let factVerificationState: 'CANDIDATE' | 'UNSUPPORTED' | 'PARTIALLY_SUPPORTED' | 'SOURCE_VERIFIED' = 'CANDIDATE';

      if (vRecord.verificationStatus === 'BLOCKED') {
        evidenceType = 'BLOCKED';
        factVerificationState = 'UNSUPPORTED';
      } else {
        evidenceType = 'NONE';
        factVerificationState = 'CANDIDATE';
      }

      const ledgerFactId = `LGR-NF-${index.toString().padStart(4, '0')}`;
      index++;

      records.push({
        ledgerFactId,
        claimId: claim.claimId,
        sourcePackSourceId: sid,
        claimText: claim.claimText,
        claimType: claim.claimType,
        epistemicStrength: claim.epistemicStrength,
        causalStatus: claim.causalStatus,
        sourceVerificationStatus: vRecord.verificationStatus,
        factVerificationState,
        evidenceType,
        evidenceExcerpt: '',
        evidenceLocations: vRecord.evidenceLocations || [],
        retrievedArtifact: vRecord.retrievedArtifact || '',
        publicationDateObserved: vRecord.publicationDateObserved || '',
        publisherObserved: vRecord.publisherObserved || '',
        authorObserved: vRecord.authorObserved || '',
        notes: 'Generated deterministically for Phase 3B start.',
      });
    }
  }

  return records;
}

export function validateLedgerSet(
  records: SourceFactLedgerRecord[],
  sourceIndex: any,
  verificationLedger: any[],
  claimInventory: any[]
): void {
  const claimIds = new Set<string>();
  const sourceIds = new Set<string>();
  
  for (const r of records) {
    if (claimIds.has(r.claimId)) {
      throw new Error(`Duplicate claim mapped in ledger: ${r.claimId}`);
    }
    claimIds.add(r.claimId);
    sourceIds.add(r.sourcePackSourceId);
    validateLedgerRecord(r);
  }

  if (claimIds.size !== claimInventory.length) {
    throw new Error(`Ledger must contain exactly ${claimInventory.length} unique claims, found: ${claimIds.size}`);
  }
}
