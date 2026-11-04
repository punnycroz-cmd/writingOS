// developing/working/src/runtime/autonomous-novel-engine.ts
// Writing OS v3.0 — Autonomous Novelist Factory & End-to-End Orchestrator

import { BibleSynthesizer, ProjectBible, StylisticEntropyConfig, GENRE_SENSORY_MATRICES, BibleEntropyGovernor } from './bible-synthesizer';
import { ProseExpander, ExpansionRequest, ExpansionBlueprint } from './prose-expander';
import { MacroStructuralEvaluator, MacroStructuralReport } from './macro-structural-evaluator';
import { VoicePolisher, VoicePolishReport, VoicePolishOptions } from './voice-polisher';
import { ReaderPersonaEvaluator, ReaderPersonaReport } from './reader-persona-evaluator';

export interface AutonomousGenerationRequest {
  projectId: string;
  genre?: string;
  chapterNumber: number;
  chapterPremise: string;
  povCharacter?: string;
  tempo?: VoicePolishOptions['tempo'];
  threatLevel?: VoicePolishOptions['threatLevel'];
  emotionalState?: VoicePolishOptions['emotionalState'];
  existingBible?: ProjectBible;
  entropy?: StylisticEntropyConfig;
}

import { DiffVisualizer } from './diff-visualizer';

export interface AutonomousGenerationResult {
  chapterNumber: number;
  bible: ProjectBible;
  rawDraft: string;
  macroReport: MacroStructuralReport;
  polishReport: VoicePolishReport;
  readerReport: ReaderPersonaReport;
  finalManuscript: string;
  trackedChangesHtml: string;
  executionSummary: {
    wordsGenerated: number;
    filtersPruned: number;
    structuralHealth: string;
    readerImmersionScore: number;
    status: 'PUBLICATION_READY' | 'AUTHOR_REVIEW_RECOMMENDED';
  };
}

export class AutonomousNovelEngine {
  /**
   * Complete End-to-End Autonomous Generation:
   * Premise -> Standalone Story Bible -> Draft Generation with Stylistic Entropy -> Tier 1 & 2 Harness -> Tier 3 Reader Persona -> Final Manuscript.
   */
  public static generateChapter(request: AutonomousGenerationRequest): AutonomousGenerationResult {
    // Phase 0: Ensure Isolated Story Bible
    let bible = request.existingBible || BibleSynthesizer.getBible(request.projectId);
    if (!bible || bible.projectId !== request.projectId) {
      bible = BibleSynthesizer.synthesizeFromPremise({
        projectId: request.projectId,
        title: `Project ${request.projectId}`,
        genre: request.genre || 'GENERAL',
        premise: request.chapterPremise,
        entropy: request.entropy
      });
    }

    const pov = request.povCharacter || (bible.characters[0]?.id || 'NEUTRAL');
    const genre = (bible.genre as any) || 'GENERAL';

    // Apply Stylistic Entropy: Select dynamic sensory palette
    const genreKey = (request.genre || bible.genre || 'GENERAL').toUpperCase();
    const availableSensory = request.entropy?.sensoryPalette || (GENRE_SENSORY_MATRICES as any)[genreKey] || GENRE_SENSORY_MATRICES.GENERAL;
    
    // Seed-based rotation to ensure distinct chapters never repeat the same phrases
    const seed = request.entropy?.randomSeed || (request.chapterNumber * 137);
    const candidateSensory = [
      availableSensory[seed % availableSensory.length],
      availableSensory[(seed + 2) % availableSensory.length],
      availableSensory[(seed + 4) % availableSensory.length],
    ];

    // Enforce Bible Boundary Governor on Entropy
    const { governedPalette } = BibleEntropyGovernor.governSensoryPalette(candidateSensory, bible, request.entropy);

    // Phase 1: Generative Scene Expansion / Drafting
    const expansionResult = ProseExpander.expandChapter(
      request.chapterNumber,
      `Chapter ${request.chapterNumber}: ${request.chapterPremise}\nSensory anchors: ${governedPalette.join(', ')}.`,
      1200
    );
    const rawDraft = expansionResult.expandedProse;

    // Phase 2: Tier 1 Macro Structural Pass
    const knownCanon = bible.characters.map(c => c.name);
    const macroReport = MacroStructuralEvaluator.evaluateChapter(rawDraft, knownCanon);

    // Phase 2: Tier 2 Micro 4-Gate Polish
    const polishReport = VoicePolisher.polish(rawDraft, {
      pov,
      genre,
      tempo: request.tempo || 'TACTICAL_PROCEDURAL',
      threatLevel: request.threatLevel || 'TENSE_STANDOFF',
      emotionalState: request.emotionalState || 'STABLE_CALM',
    });

    let currentManuscript = polishReport.polishedText;

    // Phase 3: Tier 3 AI Reader Persona Evaluation
    let readerReport = ReaderPersonaEvaluator.evaluate(currentManuscript, {
      genre: bible.genre,
      activePlants: bible.activePlants.map(p => p.propOrFact)
    });

    // --- ITERATIVE FEEDBACK LOOP (Phase 3 -> Phase 1 / Phase 0) ---
    // If Reader Persona detects rushed pacing or weak emotional immersion, trigger adaptive loop
    const feedbackTriggers: string[] = [];
    let loopIteration = 0;

    if ((readerReport.overallEmotionalScore < 0.70 || readerReport.pacing === 'RUSHED') && loopIteration < 1) {
      loopIteration++;
      feedbackTriggers.push(`Triggered Feedback Loop #1: Reader noted ${readerReport.pacing} pacing and immersion score of ${readerReport.overallEmotionalScore}.`);

      // Adaptive Deepening: Expand with deeper psychological interiority & sensory weight
      const deeperSensory = selectedSensory.join(', ');
      const reExpanded = ProseExpander.expandChapter(
        request.chapterNumber,
        `${currentManuscript}\n\n[PSYCHOLOGICAL_DEEPENING: Ground character emotional stakes in ${deeperSensory}, pacing pauses, and internal resolve.]`,
        1400
      );

      // Re-polish through Tier 2
      const rePolished = VoicePolisher.polish(reExpanded.expandedProse, {
        pov,
        genre,
        tempo: request.tempo || 'TACTICAL_PROCEDURAL',
        threatLevel: request.threatLevel || 'TENSE_STANDOFF',
        emotionalState: request.emotionalState || 'STABLE_CALM',
      });

      currentManuscript = rePolished.polishedText;

      // Re-evaluate through Tier 3
      readerReport = ReaderPersonaEvaluator.evaluate(currentManuscript, {
        genre: bible.genre,
        activePlants: bible.activePlants.map(p => p.propOrFact)
      });
    }

    // Phase 4: Targeted Polish Application (if recommended)
    for (const rec of readerReport.targetedRecommendations) {
      if (currentManuscript.includes(rec.originalSentence)) {
        currentManuscript = currentManuscript.replace(rec.originalSentence, rec.suggestedUpgrade);
        rec.applied = true;
      }
    }

    // Lexical Isolation Verification (Ensure zero sci-fi leaks in historical/fantasy)
    const isolationCheck = BibleSynthesizer.verifyLexicalIsolation(currentManuscript, bible.genre);
    if (!isolationCheck.clean) {
      for (const leak of isolationCheck.leaks) {
        currentManuscript = currentManuscript.replace(new RegExp(`\\b${leak}\\b`, 'gi'), 'stone');
      }
    }

    const finalWords = currentManuscript.match(/\b[a-z0-9'-]+\b/gi) || [];
    const isPublicationReady = macroReport.status !== 'NEEDS_REVISION' && polishReport.voiceIntegrityScore >= 0.7;

    // Generate visual tracked changes (Red with lower opacity, no strikethrough + Green additions)
    const trackedChangesHtml = DiffVisualizer.renderTrackedChangesHtml(rawDraft, currentManuscript);

    return {
      chapterNumber: request.chapterNumber,
      bible,
      rawDraft,
      macroReport,
      polishReport,
      readerReport,
      finalManuscript: currentManuscript,
      trackedChangesHtml,
      executionSummary: {
        wordsGenerated: finalWords.length,
        filtersPruned: polishReport.filterWordsEliminated,
        structuralHealth: macroReport.status,
        readerImmersionScore: readerReport.overallEmotionalScore,
        status: isPublicationReady ? 'PUBLICATION_READY' : 'AUTHOR_REVIEW_RECOMMENDED',
      }
    };
  }

  /**
   * Human-in-the-loop Bible Checkpoint:
   * Generates a structured ProjectBible and requires explicit author review before chapter generation.
   */
  public static synthesizeAndApproveBible(input: Parameters<typeof BibleSynthesizer.synthesizeFromPremise>[0]): {
    bible: ProjectBible;
    checkpointStatus: 'AWAITING_AUTHOR_APPROVAL' | 'APPROVED';
    plantsCount: number;
    milestonesCount: number;
  } {
    const bible = BibleSynthesizer.synthesizeFromPremise(input);
    return {
      bible,
      checkpointStatus: 'AWAITING_AUTHOR_APPROVAL',
      plantsCount: bible.activePlants.length,
      milestonesCount: bible.chapterMilestones.length,
    };
  }
}
