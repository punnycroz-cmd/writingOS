// tests/phase3/phase3-provenance.test.ts
// Provenance verification tests.

import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';

function loadJson(path: string): any { return JSON.parse(readFileSync(path, 'utf-8')); }
function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

describe('Phase 3 Provenance', () => {
  it('PHASE3-SNAPSHOT-MANIFEST records correct SHAs', () => {
    const snapshot = loadJson('PHASE3-SNAPSHOT-MANIFEST.json');
    const phase2b = execSync('git rev-parse origin/research/phase2b-golden-corpus-v1-reconciled', { encoding: 'utf-8' }).trim();
    const nf = execSync('git rev-parse origin/research/nonfiction-source-pack-v1.1', { encoding: 'utf-8' }).trim();
    expect(snapshot.phase2bSha).toBe(phase2b);
    expect(snapshot.nonfictionSha).toBe(nf);
  });

  it('nonfiction-source-provenance.json has SHA256 for all imported files', () => {
    const prov = loadJson('docs/phase3/nonfiction-source-provenance.json');
    expect(prov.fileCount).toBeGreaterThan(0);
    for (const f of prov.files) {
      expect(f.sha256).toMatch(/^[0-9a-f]{64}$/);
      const actualPath = f.path.startsWith('nonfiction/') ? `working/${f.path}` : f.path;
      expect(existsSync(actualPath)).toBe(true);
      expect(sha256(actualPath)).toBe(f.sha256);
    }
  });

  it('PHASE3_IMPORT_INVENTORY references only canonical path', () => {
    const inv = loadJson('docs/phase3/PHASE3_IMPORT_INVENTORY.json');
    for (const f of inv.files) {
      expect(f.destinationPath).toMatch(/^nonfiction\/source-pack\//);
      expect(f.destinationPath).not.toMatch(/^research\/nonfiction-source-pack-v1\.1/);
    }
  });
});
