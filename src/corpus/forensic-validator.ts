// src/corpus/forensic-validator.ts
// Pure validation functions for forensic manifest, inventory, and excluded-files policy.

import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

export interface ForensicManifest {
  task: string; snapshotCreatedAt: string; repository: string; branch: string; head: string;
  filesPreserved: number; filesExcluded: number | null; sanitizedFiles: number;
  categories: Record<string, number>; sensitivePatternsChecked: boolean; secretsFound: boolean;
  [key: string]: unknown;
}
export interface InventoryEntry {
  path: string; sizeBytes: number; sha256: string; gitTracked: boolean; gitIgnored: boolean;
  category: string; sensitive: boolean; preserved: boolean; sanitized: boolean;
}
export interface FileInventory {
  generatedAt: string; totalFiles: number; sensitiveFiles: number;
  categories: Record<string, number>; files: InventoryEntry[];
}
export interface HashVerification {
  hashMatch: number; hashMismatch: number; hashNotRecomputable: number; mismatches: string[];
}

// Files excluded from hash verification (self-referential or derived artifacts)
export const SELF_EXCLUDED_FILES = new Set([
  'forensic/phase2b-5/MANIFEST.json',
  'forensic/phase2b-5/file-inventory.json',
]);

// Derived artifacts that are regenerated on each reconciler run.
// These ARE preserved in the inventory (for forensic completeness) but their
// hashes are NOT verified (because they change on each reconciler run, creating
// a circular dependency: reconciler output → inventory hash → check #20 → reconciler output).
export const HASH_EXCLUDED_FILES = new Set([
  'writing-engine/logs-golden-v1/canonical-case-ledger.json',
  'writing-engine/logs-golden-v1/reconciliation-report.json',
  'writing-engine/logs-golden-v1/consistency-check.json',
  'writing-engine/logs-golden-v1/summary.json',
  'forensic/phase2b-5/test-results/reconciler-output.txt',
  'forensic/phase2b-5/test-results/corpus-tests.txt',
  'forensic/phase2b-5/test-results/lint.txt',
]);

export function validateManifestFields(manifest: Partial<ForensicManifest>): string[] {
  const issues: string[] = [];
  const required = ['task','snapshotCreatedAt','repository','branch','head','filesPreserved','sanitizedFiles','categories','sensitivePatternsChecked','secretsFound'];
  for (const f of required) {
    if (manifest[f as keyof ForensicManifest] === undefined || manifest[f as keyof ForensicManifest] === null) {
      issues.push(`MANIFEST missing field: ${f}`);
    }
  }
  return issues;
}

export function validateManifestSecurityFlags(manifest: Partial<ForensicManifest>): string[] {
  const issues: string[] = [];
  if (manifest.sensitivePatternsChecked !== true) issues.push('MANIFEST.sensitivePatternsChecked must be true');
  if (manifest.secretsFound !== false) issues.push('MANIFEST.secretsFound must be false');
  return issues;
}

export function validateManifestInventoryAgreement(manifest: Partial<ForensicManifest>, inventory: Partial<FileInventory>): string[] {
  const issues: string[] = [];
  if (manifest.filesPreserved !== inventory.totalFiles) {
    issues.push(`MANIFEST.filesPreserved=${manifest.filesPreserved} != inventory.totalFiles=${inventory.totalFiles}`);
  }
  return issues;
}

export function validatePreservedFilesExist(inventory: FileInventory): { issues: string[]; hashVerification: HashVerification } {
  const issues: string[] = [];
  const hashVerification: HashVerification = { hashMatch: 0, hashMismatch: 0, hashNotRecomputable: 0, mismatches: [] };
  for (const entry of inventory.files) {
    if (entry.preserved !== true) continue;
    // Self-referential files are skipped entirely (existence + hash)
    if (SELF_EXCLUDED_FILES.has(entry.path)) continue;
    if (!existsSync(entry.path)) {
      issues.push(`inventory lists preserved file but it does not exist: ${entry.path}`);
      continue;
    }
    // Hash-excluded files: verify existence but skip hash check
    if (HASH_EXCLUDED_FILES.has(entry.path)) continue;
    if (entry.sha256) {
      try {
        const buf = readFileSync(entry.path);
        const recomputed = createHash('sha256').update(buf).digest('hex');
        if (recomputed === entry.sha256) { hashVerification.hashMatch++; }
        else {
          hashVerification.hashMismatch++;
          hashVerification.mismatches.push(`HASH_MISMATCH: ${entry.path} (inv=${entry.sha256.slice(0,12)}... actual=${recomputed.slice(0,12)}...)`);
        }
      } catch { hashVerification.hashNotRecomputable++; }
    }
  }
  if (hashVerification.hashMismatch > 0) {
    issues.push(`${hashVerification.hashMismatch} hash mismatches\n  ${hashVerification.mismatches.join('\n  ')}`);
  }
  return { issues, hashVerification };
}

export function validateExcludedFilesPolicy(excludedFilesMd: string): string[] {
  const issues: string[] = [];
  const required = ['.env','node_modules','.git','credentials','api keys','github pat','private key'];
  const lower = excludedFilesMd.toLowerCase();
  for (const r of required) {
    if (!lower.includes(r)) issues.push(`EXCLUDED_FILES.md does not mention required policy: ${r}`);
  }
  return issues;
}

export function validateForensicInventory(
  manifest: ForensicManifest,
  inventory: FileInventory,
  excludedFilesMd: string
): { valid: boolean; issues: string[]; hashVerification: HashVerification } {
  const allIssues: string[] = [];
  allIssues.push(...validateManifestFields(manifest));
  allIssues.push(...validateManifestSecurityFlags(manifest));
  allIssues.push(...validateManifestInventoryAgreement(manifest, inventory));
  const { issues: fileIssues, hashVerification } = validatePreservedFilesExist(inventory);
  allIssues.push(...fileIssues);
  allIssues.push(...validateExcludedFilesPolicy(excludedFilesMd));
  return {
    valid: allIssues.length === 0,
    issues: allIssues,
    hashVerification,
  };
}
