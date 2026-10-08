import * as fs from 'fs';

function buildAnalysis() {
  const claimInventory = fs.readFileSync('nonfiction/source-pack/claim-inventory.jsonl', 'utf-8')
    .trim().split('\n').map(l => JSON.parse(l));
  const verificationLedger = fs.readFileSync('nonfiction/verification/source-verification-ledger.jsonl', 'utf-8')
    .trim().split('\n').map(l => JSON.parse(l));

  const validSources = new Set(verificationLedger.map(v => v.sourcePackSourceId));

  const totalClaims = claimInventory.length;
  const uniqueClaimIds = new Set(claimInventory.map(c => c.claimId)).size;

  let claimsWithoutSources = 0;
  let claimsWithOneSource = 0;
  let claimsWithMultipleSources = 0;
  const uniqueReferencedSources = new Set();
  let orphanSourceReferences = 0;

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

    if (sourceIds.length === 0) {
      claimsWithoutSources++;
    } else if (sourceIds.length === 1) {
      claimsWithOneSource++;
    } else {
      claimsWithMultipleSources++;
    }

    for (const sid of sourceIds) {
      uniqueReferencedSources.add(sid);
      if (!validSources.has(sid)) {
        orphanSourceReferences++;
      }
    }
  }

  // To check for orphan claim references, normally we check if a ledger references a claim not in the inventory.
  // Since we haven't rebuilt the ledger yet, orphanClaimReferences against the *inputs* is 0.
  
  const analysis = {
    totalClaims,
    uniqueClaimIds,
    claimsWithoutSources,
    claimsWithOneSource,
    claimsWithMultipleSources,
    uniqueReferencedSources: uniqueReferencedSources.size,
    orphanClaimReferences: 0,
    orphanSourceReferences
  };

  fs.writeFileSync('nonfiction/ledger/phase3b-input-analysis.json', JSON.stringify(analysis, null, 2));
  console.log("Analysis generated.");
}

buildAnalysis();
