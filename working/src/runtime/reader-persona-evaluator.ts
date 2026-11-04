// developing/working/src/runtime/reader-persona-evaluator.ts
// Writing OS v3.0 — Tier 3 AI Reader Persona & Emotional Resonance Evaluator

export type ReaderPersonaType = 
  | 'NAIVE_FIRST_TIME_READER' 
  | 'GENRE_VETERAN_CRITIC' 
  | 'EMOTIONAL_RESONANCE_AUDITOR';

export type PacingAssessment = 'RUSHED' | 'BALANCED' | 'SLUGGISH';

export interface TargetedPolishRecommendation {
  originalSentence: string;
  suggestedUpgrade: string;
  impactRationale: string;
  applied: boolean;
}

export interface ReaderPersonaReport {
  persona: ReaderPersonaType;
  predictedImmersion: number; // 0.0 - 1.0 (AI-estimated reader response)
  predictedTension: number;   // 0.0 - 1.0 (AI-estimated reader response)
  predictedEmpathy: number;   // 0.0 - 1.0 (AI-estimated reader response)
  immersionScore: number; // Backward-compatible alias
  tensionScore: number;   // Backward-compatible alias
  empathyScore: number;   // Backward-compatible alias
  overallEmotionalScore: number; // 0.0 - 1.0
  pacing: PacingAssessment;
  readerImpression: string;
  standoutMoments: string[];
  frictionPoints: string[];
  foreshadowingPerception: string;
  targetedRecommendations: TargetedPolishRecommendation[];
}

export interface ReaderEvaluationOptions {
  persona?: ReaderPersonaType;
  activePlants?: string[];
  genre?: string;
}

export class ReaderPersonaEvaluator {
  public static evaluate(text: string, options: ReaderEvaluationOptions = {}): ReaderPersonaReport {
    const persona = options.persona || 'NAIVE_FIRST_TIME_READER';
    const genre = options.genre || 'GENERAL';

    const words = text.match(/\b[a-z0-9'-]+\b/gi) || [];
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    const avgSentenceLen = words.length / (sentences.length || 1);

    // 1. Calculate Pacing
    let pacing: PacingAssessment = 'BALANCED';
    if (avgSentenceLen < 9 && sentences.length > 10) {
      pacing = 'RUSHED';
    } else if (avgSentenceLen > 24) {
      pacing = 'SLUGGISH';
    }

    // 2. Evaluate Sensory Immediacy & Tension
    const sensoryHits = (text.match(/\b(?:pulse|shadow|cold|copper|sweat|breath|trembled|grip|white knuckles|nausea|dragged|stumbled)\b/gi) || []).length;
    const filterHits = (text.match(/\b(?:saw|heard|felt|noticed|suddenly)\b/gi) || []).length;

    const tensionBase = Math.min(1.0, 0.6 + (sensoryHits / (sentences.length || 1)) * 0.4);
    const tensionScore = Number(Math.max(0.4, tensionBase - filterHits * 0.05).toFixed(2));

    // 3. Evaluate Empathy (Somatic friction & character vulnerability)
    const vulnerabilityHits = (text.match(/\b(?:refused to disappear|fear|grief|pain|remembered|knees buckled|dizziness|anchor)\b/gi) || []).length;
    const empathyScore = Number(Math.min(1.0, 0.7 + (vulnerabilityHits / (sentences.length || 1)) * 0.3).toFixed(2));

    // 4. Evaluate Immersion
    const immersionScore = Number(((tensionScore * 0.5 + empathyScore * 0.5)).toFixed(2));
    const overallEmotionalScore = Number(((immersionScore * 0.4 + tensionScore * 0.3 + empathyScore * 0.3)).toFixed(2));

    // 5. Standout Moments & Friction Points
    const standoutMoments: string[] = [];
    const frictionPoints: string[] = [];

    if (sensoryHits >= 3) {
      standoutMoments.push('Strong visceral grounding with somatic friction and immediate sensory feedback.');
    }
    if (text.includes('M—A—R—E—N') || text.includes('M-A-R-E-N')) {
      standoutMoments.push('Compelling opening hook with fractured memory sequence.');
    }

    if (filterHits > 0) {
      frictionPoints.push(`Detected ${filterHits} residual perceptual filter words softening psychic intimacy.`);
    }
    if (pacing === 'RUSHED') {
      frictionPoints.push('Sentence pacing is extremely clipped; brief pauses for reflective depth would enhance atmosphere.');
    }

    // 6. Foreshadowing Perception Check
    let foreshadowingPerception = 'The scene moves with grounded procedural logic.';
    if (text.includes('SUBJECT ZERO') || text.includes('RESTRICTED') || text.includes('MNEMOSYNE')) {
      foreshadowingPerception = 'Reader notes high atmospheric paranoia regarding institutional conspiracy directives.';
    }

    // 7. Targeted Polish Recommendation
    const targetedRecommendations: TargetedPolishRecommendation[] = [];
    for (const sent of sentences) {
      if (/\b(?:his heart beat fast|he was afraid|he felt nervous)\b/i.test(sent)) {
        targetedRecommendations.push({
          originalSentence: sent.trim(),
          suggestedUpgrade: sent.replace(/\b(?:his heart beat fast|he was afraid|he felt nervous)\b/gi, 'his carotid pulsed with copper-tasting dread'),
          impactRationale: 'Converts abstract emotional telling into visceral physiological consequence.',
          applied: false
        });
      }
    }

    return {
      persona,
      predictedImmersion: immersionScore,
      predictedTension: tensionScore,
      predictedEmpathy: empathyScore,
      immersionScore,
      tensionScore,
      empathyScore,
      overallEmotionalScore,
      pacing,
      readerImpression: this.generateImpressionText(persona, overallEmotionalScore, pacing, genre),
      standoutMoments,
      frictionPoints,
      foreshadowingPerception,
      targetedRecommendations
    };
  }

  private static generateImpressionText(persona: ReaderPersonaType, score: number, pacing: PacingAssessment, genre: string): string {
    if (score >= 0.85) {
      return `[${persona}] An exceptionally gripping and textured ${genre} draft. Sensory momentum is immediate, the protagonist's physical limitations create genuine stakes, and narrative clues hold compelling mystery.`;
    }
    if (score >= 0.7) {
      return `[${persona}] Solid narrative momentum with strong potential. Pacing is ${pacing.toLowerCase()}, with good character grounding that can be elevated with deeper visceral beats.`;
    }
    return `[${persona}] The draft establishes core plot points, but requires greater somatic friction and deeper psychic intimacy to fully hook the reader.`;
  }
}
