// forensic/phase2b-5/scripts/build-inventory.ts
// Builds file-inventory.json with sha256, size, git-tracked status, category, sensitive flag.
// Excludes node_modules, .git, .next, .zscripts.

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';

const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.next', '.zscripts', '.z-ai-config', 'upload', 'download', 'tool-results']);
const INCLUDE_DIRS = [
  'corpus',
  'src/corpus',
  'tests/corpus',
  'writing-engine',
  'docs/corpus',
  'forensic/phase2b-5',
  'logs43fw',
  'experiments',
];

// Sensitive patterns — actual secret values, not generic words.
const SENSITIVE_PATTERNS = [
  /github_pat_[A-Za-z0-9_]{20,}/,
  /ghp_[A-Za-z0-9]{36}/,
  /gho_[A-Za-z0-9]{36}/,
  /sk-[A-Za-z0-9]{20,}/,
  /AKIA[0-9A-Z]{16}/,
  /FIREWORKS_API_KEY\s*=\s*["'][^"']{20,}["']/,
  /OPENAI_API_KEY\s*=\s*["'][^"']{20,}["']/,
  /ANTHROPIC_API_KEY\s*=\s*["'][^"']{20,}["']/,
  /GOOGLE_API_KEY\s*=\s*["'][^"']{20,}["']/,
  /YOU_API_KEY\s*=\s*["'][^"']{20,}["']/,
];

function sha256(path: string): string {
  try {
    const buf = readFileSync(path);
    return createHash('sha256').update(buf).digest('hex');
  } catch {
    return 'HASH_ERROR';
  }
}

function isSensitive(path: string): boolean {
  try {
    const content = readFileSync(path, 'utf-8');
    for (const p of SENSITIVE_PATTERNS) {
      if (p.test(content)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

function categorize(path: string): string {
  if (path.endsWith('.test.ts')) return 'test';
  if (path.includes('/tests/') || path.startsWith('tests/')) return 'test';
  if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'source';
  if (path.endsWith('.json') || path.endsWith('.jsonl')) return 'data';
  if (path.endsWith('.md')) return 'report';
  if (path.endsWith('.log') || path.endsWith('.txt')) return 'log';
  if (path.endsWith('.sh')) return 'script';
  return 'other';
}

function walk(dir: string, base: string, out: string[]) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const full = `${dir}/${entry.name}`;
    const rel = full.startsWith(base + '/') ? full.slice(base.length + 1) : full;
    if (entry.isDirectory()) {
      walk(full, base, out);
    } else {
      out.push(rel);
    }
  }
}

function main() {
  const allFiles = new Set<string>();
  for (const d of INCLUDE_DIRS) {
    const found: string[] = [];
    walk(d, '.', found);
    for (const f of found) allFiles.add(f);
  }
  // Also include top-level relevant files
  for (const f of ['worklog.md', 'package.json', 'tsconfig.json', '.gitignore', 'README.md']) {
    if (existsSync(f)) allFiles.add(f);
  }

  // Get git-tracked set
  let tracked = new Set<string>();
  try {
    const out = execSync('git ls-files', { encoding: 'utf-8' });
    tracked = new Set(out.trim().split('\n'));
  } catch {}

  let ignored = new Set<string>();
  try {
    const out = execSync('git ls-files --others --ignored --exclude-standard', { encoding: 'utf-8' });
    ignored = new Set(out.trim().split('\n').filter(Boolean));
  } catch {}

  const inventory: any[] = [];
  let sensitiveCount = 0;
  for (const path of [...allFiles].sort()) {
    if (!existsSync(path)) continue;
    const st = statSync(path);
    const sensitive = isSensitive(path);
    if (sensitive) sensitiveCount++;
    const isTracked = tracked.has(path);
    const isIgnored = ignored.has(path);
    inventory.push({
      path,
      sizeBytes: st.size,
      sha256: sha256(path),
      gitTracked: isTracked,
      gitIgnored: isIgnored,
      category: categorize(path),
      sensitive,
      preserved: true,
      sanitized: false,
    });
  }

  // Summary categories
  const categories: Record<string, number> = {};
  for (const e of inventory) categories[e.category] = (categories[e.category] || 0) + 1;

  const result = {
    generatedAt: new Date().toISOString(),
    totalFiles: inventory.length,
    sensitiveFiles: sensitiveCount,
    categories,
    files: inventory,
  };
  writeFileSync('forensic/phase2b-5/file-inventory.json', JSON.stringify(result, null, 2));
  console.log(`Inventory: ${inventory.length} files | sensitive: ${sensitiveCount} | categories: ${JSON.stringify(categories)}`);
}

main();
