import * as fs from 'fs';
import { SourceFactLedgerRecord, validateLedgerSet } from '../../src/phase3/source-fact-ledger-validator';

function buildLedger(): void {
  const claimInventoryLines = fs.readFileSync('nonfiction/source-pack/claim-inventory.jsonl', 'utf-8')
    .trim()
    .split('\n');
  const claimInventory = claimInventoryLines.map(l => JSON.parse(l));

  const sourceIndex = JSON.parse(fs.readFileSync('nonfiction/source-pack/source-index.json', 'utf-8'));

  const verificationLines = fs.readFileSync('nonfiction/verification/source-verification-ledger.jsonl', 'utf-8')
    .trim()
    .split('\n');
  const verificationLedger = verificationLines.map(l => JSON.parse(l));

  const verificationMap = new Map();
  for (const v of verificationLedger) {
    verificationMap.set(v.sourcePackSourceId, v);
  }

  const records: SourceFactLedgerRecord[] = [];
  let index = 1;
  let claimsWithDirectEvidence = 0;
  let claimsWithPartialEvidence = 0;
  let claimsBlocked = 0;
  let claimsUnsupported = 0;
  let claimsSourceVerified = 0;
  const representedClaims = new Set<string>();

  for (const claim of claimInventory) {
    let sourceIds: string[] = [];
    if (claim.sourceId) {
      if (Array.isArray(claim.sourceId)) {
        sourceIds = claim.sourceId;
      } else {
        sourceIds = [claim.sourceId];
      }
    } else if (claim.sourceIds) {
      sourceIds = claim.sourceIds;
    }

    if (sourceIds.length === 0) continue;

    representedClaims.add(claim.claimId);

    for (const sid of sourceIds) {
      const vRecord = verificationMap.get(sid);
      if (!vRecord) {
        throw new Error(`Claim ${claim.claimId} references unknown source ${sid}`);
      }

      let evidenceType: 'DIRECT' | 'PARTIAL' | 'BLOCKED' | 'NONE' = 'NONE';
      let factVerificationState: 'CANDIDATE' | 'UNSUPPORTED' | 'PARTIALLY_SUPPORTED' | 'SOURCE_VERIFIED' = 'CANDIDATE';
      
      // In Phase 3B, since we haven't executed the benchmark, we conservatively map the state.
      if (vRecord.verificationStatus === 'BLOCKED') {
        evidenceType = 'BLOCKED';
        factVerificationState = 'UNSUPPORTED';
        claimsBlocked++;
      } else {
        // We have no explicit evidence yet in Phase 3B
        evidenceType = 'NONE';
        factVerificationState = 'CANDIDATE';
      }

      if (factVerificationState === 'UNSUPPORTED') claimsUnsupported++;
      if (evidenceType === 'DIRECT') claimsWithDirectEvidence++;
      if (evidenceType === 'PARTIAL') claimsWithPartialEvidence++;
      if (factVerificationState === 'SOURCE_VERIFIED') claimsSourceVerified++;

      const ledgerFactId = `LGR-NF-${index.toString().padStart(4, '0')}`;
      index++;

      const record: SourceFactLedgerRecord = {
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
        evidenceExcerpt: "",
        evidenceLocations: vRecord.evidenceLocations || [],
        retrievedArtifact: vRecord.retrievedArtifact || "",
        publicationDateObserved: vRecord.publicationDateObserved || "",
        publisherObserved: vRecord.publisherObserved || "",
        authorObserved: vRecord.authorObserved || "",
        notes: "Generated deterministically for Phase 3B start."
      };

      records.push(record);
    }
  }

  validateLedgerSet(records, sourceIndex, verificationLedger, claimInventory);

  const outputStr = records.map(r => JSON.stringify(r)).join('\n') + '\n';
  fs.writeFileSync('nonfiction/ledger/source-fact-ledger.jsonl', outputStr);
  console.log(`Generated ${records.length} records in SourceFactLedger.`);

  const coverage = {
    totalClaims: claimInventory.length,
    claimsRepresented: representedClaims.size,
    claimsWithoutEvidence: claimInventory.length - claimsWithDirectEvidence - claimsWithPartialEvidence,
    claimsWithDirectEvidence,
    claimsWithPartialEvidence,
    claimsBlocked,
    claimsUnsupported,
    claimsSourceVerified
  };
  fs.writeFileSync('nonfiction/ledger/phase3b-coverage.json', JSON.stringify(coverage, null, 2));
}

buildLedger();
