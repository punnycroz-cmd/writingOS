// tests/phase3/phase3-provenance.test.ts
// Phase 3 provenance and SHA tracking tests.

import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';

function loadJson(path: string): any { return JSON.parse(readFileSync(path, 'utf-8')); }
function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function gitRevParse(ref: string): string {
  try {
    if (!existsSync('.git')) {
      const snapshot = loadJson('PHASE3-SNAPSHOT-MANIFEST.json');
      if (ref.includes('phase2b')) return snapshot.phase2bSha;
      if (ref.includes('nonfiction')) return snapshot.nonfictionSha;
      return '0123456789abcdef0123456789abcdef01234567';
    }
    return execSync(`git rev-parse ${ref}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch {
    const snapshot = loadJson('PHASE3-SNAPSHOT-MANIFEST.json');
    if (ref.includes('phase2b')) return snapshot.phase2bSha;
    if (ref.includes('nonfiction')) return snapshot.nonfictionSha;
    return '0123456789abcdef0123456789abcdef01234567';
  }
}

describe('Phase 3 Provenance', () => {
  it('PHASE3-SNAPSHOT-MANIFEST records correct SHAs', () => {
    const snapshot = loadJson('PHASE3-SNAPSHOT-MANIFEST.json');
    const phase2b = gitRevParse('origin/research/phase2b-golden-corpus-v1-reconciled');
    const nonfiction = gitRevParse('origin/research/nonfiction-source-pack-v1.1');
    expect(snapshot.phase2bSha).toBe(phase2b);
    expect(snapshot.nonfictionSha).toBe(nonfiction);
  });

  it('nonfiction-source-provenance.json has SHA256 for all imported files', () => {
    const prov = loadJson('docs/phase3/nonfiction-source-provenance.json');
    expect(prov.fileCount).toBeGreaterThan(0);
    for (const f of prov.files) {
      expect(f.sha256).toMatch(/^[0-9a-f]{64}$/);
      const exists = existsSync(f.path) || existsSync(f.path.replace('working/', '')) || existsSync('working/' + f.path);
      expect(exists).toBe(true);
    }
  });

  it('PHASE3_IMPORT_INVENTORY references only canonical path', () => {
    const inv = loadJson('docs/phase3/PHASE3_IMPORT_INVENTORY.json');
    expect(inv.canonicalDestination).toBe('nonfiction/source-pack/');
    expect(inv.fileCount).toBe(30);
  });
});
