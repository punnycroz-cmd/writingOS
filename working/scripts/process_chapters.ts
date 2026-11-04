// working/scripts/process_chapters.ts
import { WritingOSRuntime } from '../src/runtime/writing-os-runtime';
import * as fs from 'fs';
import * as path from 'path';

const runtime = new WritingOSRuntime();

const rootPath = path.resolve(__dirname, '../../../');
const chapterDir = path.join(rootPath, 'packed', 'layer4_novel_english', 'novel_en');

const chapters = [
  { file: 'CHAPTER_01_THE_WAKING.md', title: 'Chapter 1: THE WAKING' },
  { file: 'CHAPTER_02_THE_SEARCH.md', title: 'Chapter 2: THE SEARCH' },
  { file: 'CHAPTER_03_THE_CLINIC.md', title: 'Chapter 3: THE CLINIC' },
];

let output = '';

for (const ch of chapters) {
  const filePath = path.join(chapterDir, ch.file);
  const original = fs.readFileSync(filePath, 'utf-8');
  const response = runtime.processDocument({
    documentId: `novel_en/${ch.file}`,
    mode: 'FICTION',
    register: 'COMMERCIAL_FICTION',
    text: original,
  });
  const polished = response.fictionReport?.polishReport?.polishedText ?? original;
  output += `# ${ch.title}\n\n`;
  output += `## Original\n\n`;
  output += original + '\n\n';
  output += `## Fixed (Polished)\n\n`;
  output += polished + '\n\n';
  output += '---\n\n';
}

const outPath = path.join(rootPath, 'chapters.md');
fs.writeFileSync(outPath, output, 'utf-8');
console.log('Wrote chapters.md to', outPath);
