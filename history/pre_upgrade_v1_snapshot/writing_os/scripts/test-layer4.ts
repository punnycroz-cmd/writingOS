import { WritingOSRuntime } from '../src/runtime/writing-os-runtime';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: ts-node test-layer4.ts <chapter_path>');
    process.exit(1);
  }
  const chapterPath = args[0];
  const content = fs.readFileSync(chapterPath, 'utf-8');

  const runtime = new WritingOSRuntime();
  const result = runtime.processDocument({
    documentId: path.basename(chapterPath, path.extname(chapterPath)),
    mode: 'FICTION',
    text: content,
  });

  console.log('=== WritingOS Result ===');
  console.log(JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
