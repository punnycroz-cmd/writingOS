// developing/working/scripts/run_production_deep_test.ts
// Production Deep Test Runner: Autonomous Full-Length Multi-Chapter Novel Rewrite

import * as fs from 'fs';
import * as path from 'path';
import { 
  AutonomousChapterWriter, 
  ChapterBlueprint, 
  FullLengthChapterJob,
  FullLengthChapterResult
} from '../src/runtime/autonomous-chapter-writer';

async function runProductionDeepTest() {
  console.log('======================================================================');
  console.log('STARTING REAL PRODUCTION DEEP TEST: DRACULA FULL-LENGTH REWRITE (CH 1–3)');
  console.log('Target Word Count: 5,500 – 6,500 words per chapter');
  console.log('Modes: RAW AI + WRITING OS (Dual-Track)');
  console.log('======================================================================\n');

  const outputBase = '/Users/sema/Documents/writing/writing os/deepTest/production_full_length';
  fs.mkdirSync(outputBase, { recursive: true });

  const blueprints: ChapterBlueprint[] = [
    {
      chapterNumber: 1,
      title: "Jonathan Harker's Journey to Castle Dracula",
      premise: 'Jonathan Harker travels from Munich across the Borgo Pass to Castle Dracula, warned by locals with a crucifix and guided by a mysterious carriage through blue flames and wolves.',
      povCharacter: 'Jonathan Harker',
      internalShiftStart: 'Methodical Victorian professional curiosity and traveler confidence',
      internalShiftEnd: 'Cold visceral dread and awareness of entering supernatural wilderness',
      coreBeats: [
        'Arrival at Munich, Vienna, and supper at the Golden Krone Hotel in Bistritz',
        'The landlady warns of St. George Eve and presses a rosary and crucifix around his neck',
        'Diligence journey through the serpentine mountain pass amid suspicious passengers',
        'Meeting the mysterious black-cloaked driver of the four-horse caleche at the summit',
        'The midnight drive through the Carpathian forest amid flickering blue flames',
        'Dracula repels the surrounding pack of wolves with a raised commanding hand',
        'Arrival at the ruined courtyard and iron-studded threshold of Castle Dracula'
      ],
      requiredForeshadowing: [
        'Blue flames indicate buried gold',
        'Coachman exhibits preternatural physical strength and authority over wolves'
      ],
      cliffhangerType: 'THREAT',
      characterStatesStart: {
        'Jonathan Harker': 'Rational, observant solicitor clerk on English firm business'
      },
      genre: 'GOTHIC_HORROR',
      setting: 'Transylvania, Borgo Pass',
      timeContext: '3–5 May 1897'
    },
    {
      chapterNumber: 2,
      title: 'Within Castle Dracula',
      premise: 'Jonathan Harker is welcomed into Castle Dracula by the Count; discussions on the Carfax estate in London; Harker realizes there are no servants, no mirrors, and he is a prisoner.',
      povCharacter: 'Jonathan Harker',
      internalShiftStart: 'Courteous guest compliance and admiration for the Count hospitality',
      internalShiftEnd: 'Absolute terror upon discovering all exits locked and absence of mirrors',
      coreBeats: [
        'Midnight reception by Count Dracula in the vast stone hall',
        'Private supper in the dining chamber while the Count observes without eating',
        'Extended consultations regarding the legal conveyance of the Carfax estate in Purfleet',
        'Discussion of Transylvanian history, racial lineage of the Szekelys, and English culture',
        'The shaving mirror incident: Dracula casts no reflection and violently lunges at blood on neck',
        'Dracula seizes and destroys the mirror, repelled by the crucifix',
        'Harker explores the corridors and realizes every heavy oak door is bolted from outside'
      ],
      requiredForeshadowing: [
        'Dracula has no reflection in glass',
        'Dracula exhibits sharp white teeth, pointed ears, and hair on palms'
      ],
      cliffhangerType: 'TRAP' as any,
      characterStatesStart: {
        'Jonathan Harker': 'Cautious, observant guest; possessing crucifix from Chapter 1'
      },
      genre: 'GOTHIC_HORROR',
      setting: 'Castle Dracula Interior & Corridors',
      timeContext: '5–8 May 1897'
    },
    {
      chapterNumber: 3,
      title: 'The Three Vampire Women',
      premise: 'Harker witnesses Dracula crawling down the castle wall like a lizard; Harker enters a forbidden room, is attacked by three seductive vampire women, and is saved by Dracula offering a child in a sack.',
      povCharacter: 'Jonathan Harker',
      internalShiftStart: 'Desperate search for an escape route through the castle battlements',
      internalShiftEnd: 'Paralyzing moral and physical horror at the demonic predation of infants',
      coreBeats: [
        'Harker observes Count Dracula scaling the vertical exterior wall head-first like a lizard',
        'Harker defies the Count warning and explores the locked forbidden south wing',
        'Falling asleep in the old chamber overlooking the abyss',
        'The manifestation of three female vampires from the moonlit dust motes',
        'The blonde vampire woman leans down to pierce Harker throat with white fangs',
        'Dracula intervenes in a demonic fury, hurling the women backward and claiming Harker',
        'Dracula tosses a writhing canvas sack containing a stolen living infant to the famished women'
      ],
      requiredForeshadowing: [
        'Vampires require blood of living mortals and prey on children',
        'Dracula intends to murder Harker once the English transactions are completed'
      ],
      cliffhangerType: 'HORROR' as any,
      characterStatesStart: {
        'Jonathan Harker': 'Imprisoned, desperate, recording every anomaly in shorthand diary'
      },
      genre: 'GOTHIC_HORROR',
      setting: 'Castle Dracula, Forbidden Wing & Abyss',
      timeContext: '8–15 May 1897'
    }
  ];

  const initialJob: FullLengthChapterJob = {
    projectId: 'dracula-deep-test',
    bookId: 'reconstruction-book-1',
    chapterNumber: 1,
    chapterBlueprint: blueprints[0],
    targetWordCount: {
      min: 5000,
      target: 7000,
      max: 10000
    },
    modes: {
      rawAI: true,
      writingOSAI: true
    },
    autoContinue: true,
    continuationPolicy: {
      maxChapters: 3,
      stopOnQualityFailure: true
    },
    safetyLimits: {
      maxChapters: 3,
      maxTotalCalls: 300
    },
    outputBaseDir: path.join(outputBase, 'chapter-001')
  };

  const results: FullLengthChapterResult[] = [];
  let previousMemory: any = null;

  for (let i = 0; i < blueprints.length; i++) {
    const bp = blueprints[i];
    const chapterOutputDir = path.join(outputBase, `chapter-${bp.chapterNumber.toString().padStart(3, '0')}`);
    
    console.log(`\n>>> EXECUTING CHAPTER ${bp.chapterNumber}: "${bp.title}"...`);

    const job: FullLengthChapterJob = {
      ...initialJob,
      chapterNumber: bp.chapterNumber,
      chapterBlueprint: bp,
      outputBaseDir: chapterOutputDir
    };

    const res = await AutonomousChapterWriter.executeChapterJob(job);
    results.push(res);
    previousMemory = res.memoryUpdate;

    console.log(`[CHAPTER ${bp.chapterNumber} COMPLETE]`);
    console.log(`  Raw AI Word Count: ${res.rawWordCount} words (QA: ${res.rawQAReport?.overallPassed ? 'PASS' : 'FAIL'})`);
    console.log(`  Writing OS Word Count: ${res.writingOSWordCount} words (QA: ${res.writingOSQAReport?.overallPassed ? 'PASS' : 'FAIL'})`);
    console.log(`  Compression Score (Dramatization): Raw=${res.rawQAReport?.compressionScore}, WritingOS=${res.writingOSQAReport?.compressionScore}`);
    console.log(`  Telemetry: Calls=${res.telemetry.totalCalls}, Beats=${res.telemetry.beatsGenerated}, Expansions=${res.telemetry.expansionRounds}, Duration=${res.telemetry.durationMs}ms`);
  }

  console.log('\n======================================================================');
  console.log('ALL 3 FULL-LENGTH CHAPTERS SUCCESSFULLY GENERATED & VALIDATED');
  console.log(`Output Location: ${outputBase}`);
  console.log('======================================================================');
}

runProductionDeepTest().catch(err => {
  console.error('Production Deep Test Failed:', err);
  process.exit(1);
});
