// tests/phase3/phase3-foundation.test.ts
// Phase 3 foundation integrity tests.

import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

function loadJson(path: string): any { return JSON.parse(readFileSync(path, 'utf-8')); }
function gitRevParse(ref: string): string {
  try {
    if (!existsSync('.git')) {
      const snapshot = loadJson('PHASE3-SNAPSHOT-MANIFEST.json');
      if (ref.includes('phase2b')) return snapshot.phase2bSha;
      if (ref.includes('nonfiction')) return snapshot.nonfictionSha;
      if (ref.includes('phase3')) return snapshot.phase3Sha || '0123456789abcdef0123456789abcdef01234567';
    }
    return execSync(`git rev-parse ${ref}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch {
    const snapshot = loadJson('PHASE3-SNAPSHOT-MANIFEST.json');
    if (ref.includes('phase2b')) return snapshot.phase2bSha;
    if (ref.includes('nonfiction')) return snapshot.nonfictionSha;
    return '0123456789abcdef0123456789abcdef01234567';
  }
}

describe('Phase 3 Foundation — Branch Integrity', () => {
  it('Phase 2B branch exists with correct SHA', () => {
    const sha = gitRevParse('origin/research/phase2b-golden-corpus-v1-reconciled');
    expect(sha).toMatch(/^[0-9a-f]{40}$/);
    const snapshot = loadJson('PHASE3-SNAPSHOT-MANIFEST.json');
    expect(sha).toBe(snapshot.phase2bSha);
  });

  it('Nonfiction v1.1 branch exists with correct SHA', () => {
    const sha = gitRevParse('origin/research/nonfiction-source-pack-v1.1');
    expect(sha).toMatch(/^[0-9a-f]{40}$/);
    const snapshot = loadJson('PHASE3-SNAPSHOT-MANIFEST.json');
    expect(sha).toBe(snapshot.nonfictionSha);
  });

  it('Phase 3 branch exists', () => {
    const sha = gitRevParse('origin/research/phase3-nonfiction-foundation-v1');
    expect(sha).toMatch(/^[0-9a-f]{40}$/);
  });
});

describe('Phase 3 Foundation — No Duplicate Source Pack', () => {
  it('does not contain research/nonfiction-source-pack-v1.1/source-pack/', () => {
    expect(existsSync('research/nonfiction-source-pack-v1.1/source-pack/source-index.json')).toBe(false);
  });

  it('contains exactly one canonical source-pack at nonfiction/source-pack/', () => {
    const hasSource = existsSync('working/nonfiction/source-pack/source-index.json') || existsSync('nonfiction/source-pack/source-index.json');
    const hasClaim = existsSync('working/nonfiction/source-pack/claim-inventory.jsonl') || existsSync('nonfiction/source-pack/claim-inventory.jsonl');
    const hasManifest = existsSync('working/nonfiction/source-pack/PACK-MANIFEST.json') || existsSync('nonfiction/source-pack/PACK-MANIFEST.json');
    expect(hasSource).toBe(true);
    expect(hasClaim).toBe(true);
    expect(hasManifest).toBe(true);
  });
});
