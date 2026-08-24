// tests/phase3/phase3-foundation.test.ts
// Phase 3 foundation integrity tests.

import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

function loadJson(path: string): any { return JSON.parse(readFileSync(path, 'utf-8')); }
function gitRevParse(ref: string): string {
  return execSync(`git rev-parse ${ref}`, { encoding: 'utf-8' }).trim();
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
    expect(existsSync('nonfiction/source-pack/source-index.json')).toBe(true);
    expect(existsSync('nonfiction/source-pack/claim-inventory.jsonl')).toBe(true);
    expect(existsSync('nonfiction/source-pack/PACK-MANIFEST.json')).toBe(true);
  });
});

describe('Phase 3 Foundation — Source Pack Counts', () => {
  const sourceIndex = loadJson('nonfiction/source-pack/source-index.json');
  const sources = sourceIndex.sources || sourceIndex;

  it('has exactly 69 sources', () => {
    expect(sources.length).toBe(69);
  });

  it('has correct tier distribution (29 GOLD, 25 SILVER, 15 BRONZE)', () => {
    const tiers: Record<string, number> = {};
    for (const s of sources) tiers[s.selectionStatus] = (tiers[s.selectionStatus] || 0) + 1;
    expect(tiers.GOLD).toBe(29);
    expect(tiers.SILVER).toBe(25);
    expect(tiers.BRONZE).toBe(15);
  });

  it('has correct verification distribution', () => {
    const vs: Record<string, number> = {};
    for (const s of sources) vs[s.verificationStatus] = (vs[s.verificationStatus] || 0) + 1;
    expect(vs.URL_VERIFIED).toBe(17);
    expect(vs.URL_EXISTS_BOT_BLOCKED).toBe(5);
    expect(vs.UNVERIFIED).toBe(47);
    expect(vs.SOURCE_VERIFIED || 0).toBe(0);
  });

  it('has exactly 135 claims', () => {
    const claims = readFileSync('nonfiction/source-pack/claim-inventory.jsonl', 'utf-8').trim().split('\n');
    expect(claims.length).toBe(135);
  });

  it('has 0 SOURCE_VERIFIED claims', () => {
    const claims = readFileSync('nonfiction/source-pack/claim-inventory.jsonl', 'utf-8').trim().split('\n');
    let sv = 0;
    for (const line of claims) {
      const c = JSON.parse(line);
      if (c.verificationLevel === 'SOURCE_VERIFIED' || c.epistemicLabelStatus === 'SOURCE_VERIFIED') sv++;
    }
    expect(sv).toBe(0);
  });

  it('PACK-MANIFEST has correct counts and status', () => {
    const manifest = loadJson('nonfiction/source-pack/PACK-MANIFEST.json');
    expect(manifest.version).toBe('1.1.0');
    expect(manifest.status).toBe('DISCOVERY_CORPUS');
    expect(manifest.claimCount).toBe(135);
    expect(manifest.groundTruth).not.toBe(true);
  });
});
