import * as fs from 'fs';

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

export function validateLedgerRecord(record: SourceFactLedgerRecord): void {
  const schemaStr = fs.readFileSync('working/nonfiction/ledger/source-fact-ledger-schema.json', 'utf-8');
  const schema = JSON.parse(schemaStr);

  for (const field of schema.required) {
    if ((record as any)[field] === undefined) {
      throw new Error(`Ledger record ${record.ledgerFactId} is missing required field: ${field}`);
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

  // Ensure 1-to-1 mapping with claim inventory
  if (claimIds.size !== claimInventory.length) {
    throw new Error(`Ledger contains ${claimIds.size} claims, but inventory has ${claimInventory.length}`);
  }

  for (const claim of claimInventory) {
    if (!claimIds.has(claim.claimId)) {
      throw new Error(`Orphan claim reference: ${claim.claimId} not in ledger`);
    }
  }

  // Ensure no orphan claims in ledger, and all inventory claims are mapped
  if (claimIds.size !== claimInventory.length) {
    throw new Error(`Ledger contains ${claimIds.size} claims, but inventory has ${claimInventory.length}`);
  }

  for (const claim of claimInventory) {
    if (!claimIds.has(claim.claimId)) {
      throw new Error(`Orphan claim reference: ${claim.claimId} not in ledger`);
    }
  }

  // Ensure all sources referenced in ledger actually exist in verification ledger
  const validVerificationSourceIds = new Set(verificationLedger.map(v => v.sourcePackSourceId));
  for (const sid of sourceIds) {
    if (!validVerificationSourceIds.has(sid)) {
      throw new Error(`Orphan source reference in ledger: ${sid} not found in verification ledger`);
    }
  }
}
