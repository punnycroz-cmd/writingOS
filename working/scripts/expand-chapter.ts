import { WritingOSRuntime } from '../src/runtime/writing-os-runtime';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: bun run working/scripts/expand-chapter.ts <chapter_file_or_number> [target_words]');
    console.log('Example: bun run working/scripts/expand-chapter.ts 22 1800');
    process.exit(1);
  }

  const input = args[0];
  const targetWords = args[1] ? parseInt(args[1], 10) : 1800;

  let filePath = input;
  let chapterNum = 0;

  if (/^\d+$/.test(input)) {
    chapterNum = parseInt(input, 10);
    const numStr = chapterNum.toString().padStart(2, '0');
    const candidates = [
      path.join(__dirname, '../../../../layer4/novel_en'),
      path.join(__dirname, '../../../packed/layer4_novel_english/novel_en'),
      path.join(process.cwd(), '../packed/layer4_novel_english/novel_en'),
      path.join(process.cwd(), 'packed/layer4_novel_english/novel_en'),
      path.join(process.cwd(), 'layer4_novel_english/novel_en'),
      path.join(process.cwd(), '../../layer4/novel_en'),
    ];
    for (const dir of candidates) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(f => f.includes(`CHAPTER_${numStr}`) || f.includes(`CHAPTER_${chapterNum}`));
        if (files.length > 0) {
          filePath = path.join(dir, files[0]);
          break;
        }
      }
    }
  } else {
    const match = path.basename(input).match(/CHAPTER_(\d+)/i);
    if (match) chapterNum = parseInt(match[1], 10);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`Error: Chapter file not found: ${filePath}`);
    process.exit(1);
  }

  const rawText = fs.readFileSync(filePath, 'utf-8');
  const runtime = new WritingOSRuntime();

  console.log(`\n======================================================`);
  console.log(`   WRITING OS v2.0 — PROSE EXPANSION & POLISH RUNNER  `);
  console.log(`======================================================`);
  console.log(`Target Chapter : Chapter ${chapterNum} (${path.basename(filePath)})`);
  console.log(`Original Words : ${rawText.split(/\s+/).length}`);
  console.log(`Target Words   : ${targetWords}`);
  console.log(`------------------------------------------------------\n`);

  const result = runtime.expandAndPolishChapter(chapterNum, rawText, targetWords);

  console.log(`[EXPANSION METRICS]`);
  console.log(`  • Original Grade : [${result.originalGrade}] (${result.originalWordCount} words)`);
  console.log(`  • Projected Grade: [${result.projectedGrade}] (${result.expandedWordCount} words)`);
  console.log(`  • Deficit Filled : +${result.deficitFilled} words`);
  console.log(`  • Filter Verbs Pruned: ${result.polishReport.filterWordsEliminated}`);
  console.log(`  • Immediacy Score: ${result.polishReport.immediacyScore}`);
  console.log(`\n[GENERATED SCENE EXPANSION BLOCKS (${result.expansionBlocks.length})]`);
  result.expansionBlocks.forEach((block, idx) => {
    console.log(`  ${idx + 1}. [${block.blockType}] ${block.title} (+${block.estimatedWords} words)`);
    console.log(`     Focus: ${block.targetSensoryFocus.join(', ')}`);
  });

  const outDir = path.join(process.cwd(), 'expanded_chapters');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, path.basename(filePath).replace('.md', '_EXPANDED.md'));
  fs.writeFileSync(outPath, result.expandedProse);

  console.log(`\n======================================================`);
  console.log(`✅ Expanded Chapter Draft Written to:\n   ${outPath}`);
  console.log(`======================================================\n`);
}

main().catch(console.error);
