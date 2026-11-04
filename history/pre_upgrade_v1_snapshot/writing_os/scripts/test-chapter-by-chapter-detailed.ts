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

async function main() {
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

  console.log(`======================================================================`);
  console.log(`   RUNNING UPGRADED WRITING OS — CHAPTER-BY-CHAPTER COMPREHENSIVE TEST`);
  console.log(`   Date: ${new Date().toISOString()}`);
  console.log(`   Total English Chapters: ${chapterFiles.length}`);
  console.log(`======================================================================\n`);

  const results: any[] = [];

  for (let i = 0; i < chapterFiles.length; i++) {
    const item = chapterFiles[i];
    const chapterName = path.basename(item.path);
    const text = fs.readFileSync(item.path, 'utf-8');

    console.log(`[TESTING ${i + 1}/${chapterFiles.length}] File: ${chapterName} (${item.label})`);

    const response = runtime.processDocument({
      documentId: `${item.label}/${chapterName}`,
      mode: 'FICTION',
      register: 'COMMERCIAL_FICTION',
      text: text,
    });

    results.push({ item, response });

    const m = response.metrics;
    const f = response.fictionReport;
    const b = f?.bibleReport;
    const c = f?.continuityReport;
    const q = f?.qualityReport;
    const exp = f?.expansionBlueprint;

    console.log(`   ├─ Grade: [${response.grade}] | Score: ${response.overallScore} | Status: ${response.status}`);
    console.log(`   ├─ Metrics: Words: ${m.wordCount} | Sentences: ${m.sentenceCount} | Paragraphs: ${m.paragraphCount} | Dialogue: ${(m.dialogueRatio * 100).toFixed(1)}%`);
    console.log(`   ├─ Craft: Sensory Score: ${m.sensoryGroundingScore} | Pacing Score: ${m.pacingCadenceScore} | Filter Words: ${m.filterWordDensity}/1k`);
    console.log(`   ├─ Bible Adherence: ${b ? `${(b.adherenceScore * 100).toFixed(0)}% (Act: ${b.act})` : 'N/A'}`);
    if (b && b.missingKeywords.length > 0) {
      console.log(`   │  └─ Missing Key Bible Terms: [${b.missingKeywords.join(', ')}]`);
    }
    console.log(`   ├─ Continuity: Burnout Index: ${(c?.expectedState.eliasNeuralBurnoutIndex! * 100).toFixed(0)}% | Healing Index: ${(c?.expectedState.marenTraumaHealingIndex! * 100).toFixed(0)}% | Consistent: ${c?.stateConsistent ? 'YES' : 'NO'}`);
    if (q && q.violations.length > 0) {
      console.log(`   ├─ Detected Violations (${q.violations.length}):`);
      q.violations.forEach(v => console.log(`   │  • [${v.severity}] ${v.code}: ${v.message}`));
    }
    if (exp) {
      console.log(`   └─ Blueprint: Deficit of +${exp.deficitWords} words to reach 1,600 word target (Urgency: ${exp.urgency})`);
    } else {
      console.log(`   └─ Blueprint: Target word count met.`);
    }
    console.log(`----------------------------------------------------------------------\n`);
  }

  console.log(`Summary: ${results.length} chapters tested.`);
}

main().catch(console.error);
