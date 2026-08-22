// tests/corpus/forensic-validator.test.ts
// Tests for the forensic inventory validation logic (check #20).

import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import {
  validateManifestFields,
  validateManifestSecurityFlags,
  validateManifestInventoryAgreement,
  validateExcludedFilesPolicy,
  validateForensicInventory,
  SELF_EXCLUDED_FILES,
  HASH_EXCLUDED_FILES,
  type ForensicManifest,
  type FileInventory,
} from '../../src/corpus/forensic-validator';

const FORENSIC_MANIFEST = 'forensic/phase2b-5/MANIFEST.json';
const FORENSIC_INVENTORY = 'forensic/phase2b-5/file-inventory.json';
const FORENSIC_EXCLUDED = 'forensic/phase2b-5/EXCLUDED_FILES.md';

function loadRealManifest(): ForensicManifest {
  return JSON.parse(readFileSync(FORENSIC_MANIFEST, 'utf-8'));
}
function loadRealInventory(): FileInventory {
  return JSON.parse(readFileSync(FORENSIC_INVENTORY, 'utf-8'));
}
function loadRealExcluded(): string {
  return readFileSync(FORENSIC_EXCLUDED, 'utf-8');
}

describe('forensic-validator — happy path (real artifacts)', () => {
  it('real MANIFEST.json passes field validation', () => {
    const manifest = loadRealManifest();
    const issues = validateManifestFields(manifest);
    expect(issues.length).toBe(0);
  });

  it('real MANIFEST.json has sensitivePatternsChecked=true and secretsFound=false', () => {
    const manifest = loadRealManifest();
    const issues = validateManifestSecurityFlags(manifest);
    expect(issues.length).toBe(0);
  });

  it('real manifest and inventory counts agree', () => {
    const manifest = loadRealManifest();
    const inventory = loadRealInventory();
    const issues = validateManifestInventoryAgreement(manifest, inventory);
    expect(issues.length).toBe(0);
  });

  it('real EXCLUDED_FILES.md passes policy validation', () => {
    const content = loadRealExcluded();
    const issues = validateExcludedFilesPolicy(content);
    expect(issues.length).toBe(0);
  });

  it('full forensic inventory validation passes on real artifacts', () => {
    const manifest = loadRealManifest();
    const inventory = loadRealInventory();
    const excluded = loadRealExcluded();
    const result = validateForensicInventory(manifest, inventory, excluded);
    expect(result.valid).toBe(true);
    expect(result.issues.length).toBe(0);
  });
});

describe('forensic-validator — failure cases for check #20', () => {
  // Case A: manifest says 924 files but inventory has 923
  it('Case A: detects manifest/inventory file count mismatch', () => {
    const manifest = loadRealManifest();
    const inventory = loadRealInventory();
    const badManifest = { ...manifest, filesPreserved: manifest.filesPreserved - 1 };
    const issues = validateManifestInventoryAgreement(badManifest, inventory);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]).toContain('filesPreserved');
  });

  // Case B: inventory lists a preserved file that doesn't exist
  it('Case B: detects preserved file that does not exist', () => {
    const manifest = loadRealManifest();
    const inventory = loadRealInventory();
    const excluded = loadRealExcluded();
    const badInventory: FileInventory = {
      ...inventory,
      files: [
        ...inventory.files,
        {
          path: 'forensic/phase2b-5/DOES_NOT_EXIST.json',
          sizeBytes: 100,
          sha256: '0'.repeat(64),
          gitTracked: false, gitIgnored: false, category: 'data',
          sensitive: false, preserved: true, sanitized: false,
        },
      ],
    };
    const result = validateForensicInventory(manifest, badInventory, excluded);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i: string) => i.includes('DOES_NOT_EXIST'))).toBe(true);
  });

  // Case C: manifest says secretsFound = true
  it('Case C: detects secretsFound=true in manifest', () => {
    const manifest = loadRealManifest();
    const inventory = loadRealInventory();
    const excluded = loadRealExcluded();
    const badManifest = { ...manifest, secretsFound: true };
    const result = validateForensicInventory(badManifest, inventory, excluded);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i: string) => i.includes('secretsFound'))).toBe(true);
  });

  // Case D: a hash mismatches (use a file that is NOT hash-excluded)
  it('Case D: detects SHA256 hash mismatch', () => {
    const manifest = loadRealManifest();
    const inventory = loadRealInventory();
    const excluded = loadRealExcluded();
    // Find a real file that is NOT self-excluded or hash-excluded
    const firstRealFile = inventory.files.find(
      (f) => f.preserved && f.sha256 && !SELF_EXCLUDED_FILES.has(f.path) && !HASH_EXCLUDED_FILES.has(f.path) && existsSync(f.path)
    );
    expect(firstRealFile).toBeDefined();
    const badInventory: FileInventory = {
      ...inventory,
      files: inventory.files.map((f) =>
        f.path === firstRealFile!.path ? { ...f, sha256: '0'.repeat(64) } : f
      ),
    };
    const result = validateForensicInventory(manifest, badInventory, excluded);
    expect(result.valid).toBe(false);
    expect(result.hashVerification.hashMismatch).toBeGreaterThan(0);
  });

  // Case E: EXCLUDED_FILES.md does not mention required exclusions
  it('Case E: detects missing exclusion policy entries', () => {
    const manifest = loadRealManifest();
    const inventory = loadRealInventory();
    const badExcluded = 'This file does not mention any required exclusions.';
    const result = validateForensicInventory(manifest, inventory, badExcluded);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i: string) => i.includes('.env'))).toBe(true);
    expect(result.issues.some((i: string) => i.includes('node_modules'))).toBe(true);
  });

  it('detects missing sensitivePatternsChecked flag', () => {
    const manifest = loadRealManifest();
    const badManifest = { ...manifest, sensitivePatternsChecked: false };
    const issues = validateManifestSecurityFlags(badManifest);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]).toContain('sensitivePatternsChecked');
  });

  it('detects missing manifest fields', () => {
    const badManifest: Partial<ForensicManifest> = { task: 'PHASE-2B-5' };
    const issues = validateManifestFields(badManifest);
    expect(issues.length).toBeGreaterThan(5);
  });
});
