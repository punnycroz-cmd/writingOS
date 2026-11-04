import { WritingOSRuntime } from '../src/runtime/writing-os-runtime';
import * as fs from 'fs';
import * as path from 'path';

function findChapterDirs(): { commercialDir: string; novelDir: string } {
  const candidates = [
    {
      commercial: path.join(__dirname, '../../../layer4/full_commercial_en'),
      novel: path.join(__dirname, '../../../layer4/novel_en'),
    },
    {
      commercial: path.join(__dirname, '../layer4_novel_english/full_commercial_en'),
      novel: path.join(__dirname, '../layer4_novel_english/novel_en'),
    },
    {
      commercial: path.join(process.cwd(), 'layer4_novel_english/full_commercial_en'),
      novel: path.join(process.cwd(), 'layer4_novel_english/novel_en'),
    },
  ];

  for (const c of candidates) {
    if (fs.existsSync(c.novel)) {
      return { commercialDir: c.commercial, novelDir: c.novel };
    }
  }

  return {
    commercialDir: path.join(process.cwd(), 'full_commercial_en'),
    novelDir: path.join(process.cwd(), 'novel_en'),
  };
}

async function runLayer4Tests() {
  const runtime = new WritingOSRuntime();
  const { commercialDir, novelDir } = findChapterDirs();

  const chapterFiles: { label: string; path: string }[] = [];

  if (fs.existsSync(commercialDir)) {
    fs.readdirSync(commercialDir)
      .filter(f => f.endsWith('.md'))
      .forEach(f => chapterFiles.push({ label: 'full_commercial_en', path: path.join(commercialDir, f) }));
  }

  if (fs.existsSync(novelDir)) {
    fs.readdirSync(novelDir)
      .filter(f => f.endsWith('.md'))
      .sort((a, b) => a.localeCompare(b))
      .forEach(f => chapterFiles.push({ label: 'novel_en', path: path.join(novelDir, f) }));
  }

  console.log(`\n======================================================`);
  console.log(`   UPGRADED MASTER WRITING OS — LAYER 4 NOVEL AUDIT    `);
  console.log(`======================================================\n`);

  const results: any[] = [];

  for (const item of chapterFiles) {
    const chapterName = path.basename(item.path);
    const text = fs.readFileSync(item.path, 'utf-8');

    const res = runtime.processDocument({
      documentId: `${item.label}/${chapterName}`,
      mode: 'FICTION',
      register: 'COMMERCIAL_FICTION',
      text: text,
    });

    results.push({ item, res });

    const f = res.fictionReport;
    const b = f?.bibleReport;
    const c = f?.continuityReport;
    const exp = f?.expansionBlueprint;

    console.log(`▶ [${item.label}] ${chapterName}`);
    console.log(`  Grade: [${res.grade}] | Score: ${res.overallScore} | Status: ${res.status}`);
    console.log(`  Words: ${res.metrics.wordCount} | Dialogue: ${(res.metrics.dialogueRatio * 100).toFixed(1)}% | Sensory: ${res.metrics.sensoryGroundingScore}`);
    console.log(`  Bible Adherence: ${b ? `${(b.adherenceScore * 100).toFixed(0)}% (Act: ${b.act})` : 'N/A'}`);
    console.log(`  Continuity State: ${c?.stateConsistent ? 'Consistent' : 'VIOLATION DETECTED'}`);
    if (exp) {
      console.log(`  Expansion Blueprint: Deficit of +${exp.deficitWords} words (Urgency: ${exp.urgency})`);
    }
    console.log(`------------------------------------------------------`);
  }

  console.log(`\nAudit complete for ${results.length} chapters.`);
}

runLayer4Tests().catch(console.error);
