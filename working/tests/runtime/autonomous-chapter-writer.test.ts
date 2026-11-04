import { describe, expect, test } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';
import { 
  AutonomousChapterWriter, 
  HierarchicalSceneDecomposer, 
  ChapterQAEngine, 
  ChapterBlueprint, 
  FullLengthChapterJob 
} from '../../src/runtime/autonomous-chapter-writer';

describe('Writing OS v5.0 — Autonomous Full-Length Chapter Writer Suite', () => {
  const sampleBlueprint: ChapterBlueprint = {
    chapterNumber: 1,
    title: 'The Threshold of the Borgo Pass',
    premise: 'Jonathan Harker travels by diligence and mysterious caleche across the Borgo Pass to Castle Dracula.',
    povCharacter: 'Jonathan Harker',
    internalShiftStart: 'Methodical Victorian professional curiosity',
    internalShiftEnd: 'Cold visceral dread and awareness of imprisonment',
    coreBeats: [
      'Arrival at Bistritz and supper at Golden Krone',
      'The landlady warns of St. George Eve and gives crucifix',
      'The diligence journey through the serpentine mountain pass',
      'Meeting the mysterious four-horse caleche at the summit',
      'The midnight drive amid blue flames and the circle of wolves',
      'Arrival at the ruined courtyard of Castle Dracula'
    ],
    requiredForeshadowing: ['Blue flames indicate buried treasure', 'Coachman possesses unnatural strength over wolves'],
    cliffhangerType: 'THREAT',
    characterStatesStart: {
      'Jonathan Harker': 'Energetic, rational, observant'
    },
    genre: 'GOTHIC_HORROR',
    setting: 'Transylvania, Borgo Pass',
    timeContext: '3–5 May 1897'
  };

  test('HierarchicalSceneDecomposer: Decomposes chapter blueprint into 6 scenes with distributed beat budgets', () => {
    const scenes = HierarchicalSceneDecomposer.decomposeChapter(sampleBlueprint, 6000);

    expect(scenes.length).toBeGreaterThanOrEqual(4);
    expect(scenes.length).toBeLessThanOrEqual(8);
    expect(scenes[0].beats.length).toBeGreaterThanOrEqual(4);

    const totalBeatBudget = scenes.reduce((acc, s) => acc + s.beats.reduce((bAcc, b) => bAcc + b.targetWordCount, 0), 0);
    expect(totalBeatBudget).toBeGreaterThan(5000);
  });

  test('AutonomousChapterWriter: Executes full single-job chapter generation and produces dual tracks with 7 QA Gates', async () => {
    const testOutputDir = path.join(process.cwd(), 'scratch_test_output', 'project-dracula', 'book-1', 'chapters', 'chapter-001');

    const job: FullLengthChapterJob = {
      projectId: 'project-dracula',
      bookId: 'book-1',
      chapterNumber: 1,
      chapterBlueprint: sampleBlueprint,
      targetWordCount: {
        min: 1200,
        target: 2000,
        max: 8000
      },
      modes: {
        rawAI: true,
        writingOSAI: true,
      },
      autoContinue: false,
      outputBaseDir: testOutputDir
    };

    const result = await AutonomousChapterWriter.executeChapterJob(job);

    expect(result.status).toBe('SUCCESS');
    expect(result.chapterNumber).toBe(1);
    expect(result.rawProse).toBeDefined();
    expect(result.writingOSProse).toBeDefined();
    expect(result.rawQAReport?.overallPassed).toBe(true);
    expect(result.writingOSQAReport?.overallPassed).toBe(true);
    expect(result.comparison).toBeDefined();
    expect(result.memoryUpdate.events.length).toBeGreaterThan(0);

    // Verify Output Filesystem Structure
    expect(fs.existsSync(path.join(testOutputDir, 'blueprint.json'))).toBe(true);
    expect(fs.existsSync(path.join(testOutputDir, 'scene-plan.json'))).toBe(true);
    expect(fs.existsSync(path.join(testOutputDir, 'raw-ai', 'chapter-001.md'))).toBe(true);
    expect(fs.existsSync(path.join(testOutputDir, 'writing-os-ai', 'chapter-001.md'))).toBe(true);
    expect(fs.existsSync(path.join(testOutputDir, 'qa', 'comparison.json'))).toBe(true);
    expect(fs.existsSync(path.join(testOutputDir, 'memory', 'chapter-memory-update.json'))).toBe(true);
    expect(fs.existsSync(path.join(testOutputDir, 'metadata.json'))).toBe(true);

    // Cleanup scratch test directory
    fs.rmSync(path.join(process.cwd(), 'scratch_test_output'), { recursive: true, force: true });
  });

  test('AutonomousChapterWriter: Autonomous multi-chapter sequence honors maxChapters limit', async () => {
    const chapter1 = { ...sampleBlueprint, chapterNumber: 1, title: 'Chapter 1' };
    const chapter2 = { ...sampleBlueprint, chapterNumber: 2, title: 'Chapter 2' };
    const chapter3 = { ...sampleBlueprint, chapterNumber: 3, title: 'Chapter 3' };
    const chapter4 = { ...sampleBlueprint, chapterNumber: 4, title: 'Chapter 4' };

    const blueprints = [chapter1, chapter2, chapter3, chapter4];

    const testOutputDirBase = path.join(process.cwd(), 'scratch_sequence_test');

    const job: FullLengthChapterJob = {
      projectId: 'seq-project',
      bookId: 'seq-book',
      chapterNumber: 1,
      chapterBlueprint: chapter1,
      targetWordCount: { min: 2000, target: 4500, max: 7000 },
      modes: { rawAI: false, writingOSAI: true },
      autoContinue: true,
      continuationPolicy: { maxChapters: 3 },
      outputBaseDir: path.join(testOutputDirBase, 'chapter-001')
    };

    const results = await AutonomousChapterWriter.runAutonomousNovelSequence(job, blueprints);

    expect(results.length).toBe(3); // Exactly 3 chapters generated, Chapter 4 prevented by safety limit
    expect(results[0].chapterNumber).toBe(1);
    expect(results[1].chapterNumber).toBe(2);
    expect(results[2].chapterNumber).toBe(3);

    // Cleanup
    fs.rmSync(testOutputDirBase, { recursive: true, force: true });
  });
});
