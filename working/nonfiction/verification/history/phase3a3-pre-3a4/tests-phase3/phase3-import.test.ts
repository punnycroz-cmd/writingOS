// tests/phase3/phase3-import.test.ts
// Import verification: every imported file exists and hash matches.

import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

function loadJson(path: string): any { return JSON.parse(readFileSync(path, 'utf-8')); }
function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

describe('Phase 3 Import Integrity', () => {
  const inv = loadJson('docs/phase3/PHASE3_IMPORT_INVENTORY.json');

  it('has 30 imported files', () => {
    expect(inv.fileCount).toBe(30);
    expect(inv.files.length).toBe(30);
  });

  it('every imported file exists', () => {
    for (const f of inv.files) {
      expect(existsSync(f.destinationPath)).toBe(true);
    }
  });

  it('every imported file hash matches', () => {
    let mismatches = 0;
    for (const f of inv.files) {
      const actual = sha256(f.destinationPath);
      if (actual !== f.destinationSha256) {
        mismatches++;
      }
    }
    expect(mismatches).toBe(0);
  });

  it('all files are under nonfiction/source-pack/', () => {
    for (const f of inv.files) {
      expect(f.destinationPath).toMatch(/^nonfiction\/source-pack\//);
    }
  });
});
