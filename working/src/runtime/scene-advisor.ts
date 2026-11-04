// working/src/runtime/scene-advisor.ts
// Scene Repair & Prose Expansion Blueprint Generator for Writing OS.

import { CANON_CHAPTER_MILESTONES, CANON_CHARACTERS } from './bible-engine';
import { FictionQualityMetrics, FictionViolation } from './fiction-evaluator';

export interface ExpansionBeat {
  type: 'SENSORY_ANCHOR' | 'DIALOGUE_BEAT' | 'PSYCHOLOGICAL_INTERIORITY' | 'TACTICAL_WORLD_BUILDING';
  title: string;
  suggestedPrompt: string;
  rationale: string;
}

export interface SceneExpansionBlueprint {
  chapterNumber: number;
  currentWordCount: number;
  targetWordCount: number;
  deficitWords: number;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedBeats: ExpansionBeat[];
  proseDirectives: string[];
}

export class SceneAdvisor {
  public static generateBlueprint(
    chapterNum: number,
    text: string,
    metrics: FictionQualityMetrics,
    violations: FictionViolation[]
  ): SceneExpansionBlueprint {
    const milestone = CANON_CHAPTER_MILESTONES[chapterNum];
    const targetWordCount = 1600;
    const currentWordCount = metrics.wordCount;
    const deficitWords = Math.max(0, targetWordCount - currentWordCount);

    const urgency: 'HIGH' | 'MEDIUM' | 'LOW' =
      deficitWords > 800 ? 'HIGH' : deficitWords > 400 ? 'MEDIUM' : 'LOW';

    const recommendedBeats: ExpansionBeat[] = [];
    const directives: string[] = [];

    // 1. Sensory Anchoring
    if (metrics.sensoryGroundingScore < 0.80 || deficitWords > 500) {
      recommendedBeats.push({
        type: 'SENSORY_ANCHOR',
        title: 'Tactile Environmental & Acoustic Grounding',
        suggestedPrompt: `Layer in the atmospheric pressure of the location (${milestone?.location || 'the scene setting'}). Describe the physical vibrations of the neural rig, the metallic scent of copper and heated solder, and the slashing rain against the glass.`,
        rationale: 'Deepens psychic immediacy and fulfills commercial fiction sensory immersion standards.',
      });
      directives.push('Anchor the opening 2 paragraphs with at least 3 distinct sensory modalities (temperature, acoustic hum, tactile resistance).');
    }

    // 2. Dialogue & Character Chemistry
    if (metrics.dialogueRatio < 0.20 || deficitWords > 500) {
      recommendedBeats.push({
        type: 'DIALOGUE_BEAT',
        title: 'Verbal Sparring & Real-Time Psychological Check-In',
        suggestedPrompt: `Introduce a rapid dialogue exchange between Maren and Elias over the biometric comm. Maren warns him of his climbing heart rate and synaptic thermal spike; Elias grounds himself in the sound of her voice.`,
        rationale: 'Brings dialogue ratio into the optimal 25%-45% commercial sweet spot while advancing character intimacy.',
      });
      directives.push('Replace summary narration with real-time spoken exchanges with active physical beats between lines.');
    }

    // 3. Psychological Interiority
    recommendedBeats.push({
      type: 'PSYCHOLOGICAL_INTERIORITY',
      title: 'Neural Vertigo & Memory Echoes',
      suggestedPrompt: `Detail Elias’s internal struggle as his brain balances 20 years of synthetic Layer 4 memories against the visceral reality of Maren beside him. The sensation of his temporal lobes burning under data overload.`,
      rationale: 'Fulfills the core theme of free will vs. algorithmic programming while adding 300+ words of rich internal prose.',
    });

    // 4. Tactical / World Mechanics
    if (chapterNum >= 19 && chapterNum <= 28) {
      recommendedBeats.push({
        type: 'TACTICAL_WORLD_BUILDING',
        title: 'Syndicate Defense Protocols & Hardware Friction',
        suggestedPrompt: `Describe the specific mechanics of the Dark Web Hacker’s drone override payload and the tactical deployment of the Syndicate strike team’s electronic warfare jammers.`,
        rationale: 'Elevates the techno-thriller authenticity of the Act 3 climax.',
      });
    }

    directives.push(`Expand total chapter volume by ~${deficitWords} words to reach standard commercial publishing length (1,500 - 2,200 words).`);

    return {
      chapterNumber: chapterNum,
      currentWordCount,
      targetWordCount,
      deficitWords,
      urgency,
      recommendedBeats,
      proseDirectives: directives,
    };
  }
}
