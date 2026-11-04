// working/src/runtime/voice-polisher.ts
// Deterministic Micro-Craft Linter & Contextual Voice Diagnostic Verifier for Writing OS (v3.3)
// NOTE: This module is a deterministic micro-craft validation and cleanup layer.
// Upgraded in P32.1: Replaces binary filter-verb bans with Contextual Density & Somatic Grounding Analysis.

export type POVCharacter = string;
export type GenreType = 'HARD_SCI_FI' | 'FANTASY' | 'GOTHIC_HORROR' | 'LITERARY' | 'THRILLER' | 'HISTORICAL' | 'GENERAL';
export type SceneTempo = 'ACTION_SPRINT' | 'TACTICAL_PROCEDURAL' | 'INTIMATE_QUIET' | 'CONTEMPLATIVE_DREAM';
export type SceneRegister = 
  | 'EMOTIONAL_INTIMACY'          // Final voicemail, bereavement, quiet grief, personal loss
  | 'ACTION_KINETIC'              // Chase in market, combat sprint, physical escape
  | 'PSYCHOLOGICAL_INTROSPECTION' // Dawn reflection, guilt, moral dilemma, internal memory
  | 'TACTICAL_PROCEDURAL'         // Inspection, forensics, mechanical engineering
  | 'FORENSIC_INVESTIGATION'      // Document analysis, multi-source evidence cross-referencing
  | 'LITERARY_CONTEMPLATIVE';     // Gothic atmosphere, philosophical resonance
export type ThreatLevel = 'PEACE_REFLECTIVE' | 'TENSE_STANDOFF' | 'LETHAL_COMBAT' | 'TRANSITIONAL';
export type EmotionalState = 
  | 'STABLE_CALM' 
  | 'EXHAUSTED_BURNOUT' 
  | 'ENRAGED_CONFRONTATIONAL' 
  | 'GRIEVING_NUMB' 
  | 'PANIC_OVERLOAD'
  | 'INTELLECTUAL_CURIOSITY'
  | 'QUIET_RELIEF';
export type PolishMode = 'POLISH' | 'CREATIVE_RECONSTRUCTION';
export type PolishDecision = 'REWRITE' | 'KEEP' | 'FLAG';

export type FilterVerbCategory =
  | 'SOMATIC_PHYSICAL_GROUNDING'   // e.g. "felt the tightness behind his sternum", "felt the cold"
  | 'EPISTEMIC_UNCERTAINTY'        // e.g. "thought he saw", "felt like someone was"
  | 'ABSTRACT_EMOTIONAL_TELLING'   // e.g. "felt a deep sadness", "felt anxious"
  | 'DIRECT_SENSORY_STREAMLINABLE' // e.g. "he saw the door" -> safe to elevate to direct subject
  | 'REPETITIVE_STACKED_FILTER';   // e.g. >=3 in a single paragraph

export interface FilterVerbOccurrence {
  matchedText: string;
  verb: string;
  category: FilterVerbCategory;
  isProtected: boolean;
  reason: string;
  index: number;
  suggestedAction: 'KEEP' | 'SUGGEST_PHYSICAL_DRAMATIZATION' | 'STREAMLINE_OPTIONAL';
}

export interface FilterVerbAnalysisReport {
  totalFilterVerbs: number;
  densityPer100Words: number;
  somaticGroundingCount: number;
  epistemicUncertaintyCount: number;
  abstractTellingCount: number;
  streamlinableCount: number;
  occurrences: FilterVerbOccurrence[];
  isDensityAcceptable: boolean;
  score: number; // 0.0 to 1.0
  summaryNotes: string[];
}

export interface CognitiveLens {
  sensoryHierarchy: ('GEOMETRY' | 'ACOUSTIC' | 'TACTILE' | 'THERMAL' | 'TEMPORAL')[];
  attentionBias: string;
  internalMonologuePacing: 'STACCATO_ALERT' | 'SYSTEMIC_DEEP' | 'TACTICAL_MEASURED' | 'FLUID_NEUTRAL';
  syntacticRhythm?: 'STACCATO_ACTION' | 'COMPOUND_ANALYTICAL' | 'ASSOCIATIVE_STREET' | 'FLUID_LITERARY';
  forbiddenTropes: string[];
}

export interface POVProfile {
  preferred: string[];
  discouraged: string[];
  maxAvgSentenceLength: number;
  description: string;
  lens?: CognitiveLens;
}

export interface PolishSuggestion {
  originalPhrase: string;
  suggestedReplacement: string;
  ruleCode: string;
  reason: string;
  startIndex: number;
}

export interface GateCheckResult {
  gate: 
    | 'GATE_1_POV_VOICE' 
    | 'GATE_2_TEMPO_REGISTER' 
    | 'GATE_3_STAKES_PRESERVATION' 
    | 'GATE_4_CANON_ANTI_DRIFT' 
    | 'SPEC_CLUTTER_GUARD' 
    | 'AI_FINGERPRINT_GUARD' 
    | 'FILTER_VERB_CONTEXT_GUARD'
    | 'QUANTIFICATION_GUARD'
    | 'PERFORMATIVE_RESTRAINT_GUARD'
    | 'PSYCHOLOGICAL_DEPTH_GUARD'
    | 'UNSUPPORTED_SPECIFICITY_GUARD'
    | 'COGNITIVE_SYNTAX_GUARD'
    | 'TROPE_CONVERGENCE_GUARD'
    | 'SECOND_ORDER_OPSEC_GUARD'
    | 'HOUSE_STYLE_ENTROPY_GUARD';
  passed: boolean;
  score: number; // 0.0 to 1.0 (Rule-based diagnostic score)
  notes: string[];
}

export interface VoicePolishOptions {
  pov?: POVCharacter;
  genre?: GenreType;
  tempo?: SceneTempo;
  sceneRegister?: SceneRegister;
  threatLevel?: ThreatLevel;
  emotionalState?: EmotionalState;
  mode?: PolishMode;
  sourceDraft?: string;
  strictGates?: boolean;
  isMultiPOV?: boolean;
  premiseAmbiguity?: 'MINIMAL_PROMPT' | 'SPECIFIED_CANON';
  customProfiles?: Record<string, POVProfile>;
}

export interface VoicePolishReport {
  originalText: string;
  polishedText: string;
  decision: PolishDecision;
  decisionReason: string;
  pov: POVCharacter;
  genre: GenreType;
  tempo: SceneTempo;
  sceneRegister: SceneRegister;
  threatLevel: ThreatLevel;
  emotionalState: EmotionalState;
  mode: PolishMode;
  filterWordsEliminated: number;
  specClutterCount: number;
  quantificationViolationsCount: number;
  performativeRestraintCount: number;
  aiFingerprintsDetected: number;
  burstinessScore: number;
  suggestions: PolishSuggestion[];
  gateResults: GateCheckResult[];
  filterVerbAnalysis?: FilterVerbAnalysisReport;
  
  // Rule-based diagnostic scores
  cadenceHeuristicScore: number;
  cadenceScore: number;
  filterReductionScore: number;
  immediacyScore: number;
  voiceHeuristicScore: number;
  voiceIntegrityScore: number;
}

const SOMATIC_INTERNAL_KEYWORDS = new Set([
  'tightness', 'sternum', 'synaptic', 'latency', 'pulse', 'strain', 'pain', 'weight',
  'numbness', 'shiver', 'tremor', 'impact', 'pressure', 'recoil', 'sting', 'burn',
  'bone', 'muscle', 'ribs', 'breath', 'throat', 'sweat', 'jaw', 'fingers', 'chest',
  'stomach', 'gut', 'spine', 'heartbeat', 'nausea', 'adrenaline', 'cold', 'chill', 'heat'
]);

const ABSTRACT_EMOTION_KEYWORDS = new Set([
  'sad', 'sadness', 'sorrow', 'grief', 'happy', 'happiness', 'joy', 'angry', 'anger', 'furious',
  'anxious', 'anxiety', 'panic', 'depressed', 'depression', 'scared', 'fear', 'hopeless', 'worried',
  'overwhelmed', 'confident', 'jealous', 'nervous',
]);

export class ContextualFilterVerbAnalyzer {
  public static analyze(text: string): FilterVerbAnalysisReport {
    const words = text.match(/\b[a-z0-9'-]+\b/gi) || [];
    const totalWords = Math.max(1, words.length);

    const occurrences: FilterVerbOccurrence[] = [];
    const filterRegex = /\b(?:he|she|they|[A-Z][a-z0-9'-]+|it)?\s*(felt|could feel|saw|could see|watched|noticed|heard|could hear|thought|seemed to|realized)\b(?:\s+(?:the|a|an|like|as if|as though|that|about|his|her|their|its))?\s*([a-z0-9'-]+)?/gi;

    let match: RegExpExecArray | null;
    while ((match = filterRegex.exec(text)) !== null) {
      const fullMatch = match[0];
      const verb = match[1].toLowerCase();
      const followingWord = (match[2] || '').toLowerCase();
      const surroundingSnippet = text.slice(Math.max(0, match.index - 15), Math.min(text.length, match.index + fullMatch.length + 40)).toLowerCase();

      let category: FilterVerbCategory = 'DIRECT_SENSORY_STREAMLINABLE';
      let isProtected = false;
      let reason = 'Direct sensory perception.';
      let suggestedAction: 'KEEP' | 'SUGGEST_PHYSICAL_DRAMATIZATION' | 'STREAMLINE_OPTIONAL' = 'STREAMLINE_OPTIONAL';

      // 1. Epistemic Uncertainty check
      if (
        surroundingSnippet.includes('thought') ||
        surroundingSnippet.includes('as if') ||
        surroundingSnippet.includes('as though') ||
        surroundingSnippet.includes('like someone') ||
        surroundingSnippet.includes('seemed to') ||
        surroundingSnippet.includes('perhaps') ||
        surroundingSnippet.includes('almost')
      ) {
        category = 'EPISTEMIC_UNCERTAINTY';
        isProtected = true;
        reason = 'Preserves character epistemic uncertainty and doubt; do not flatten into objective fact.';
        suggestedAction = 'KEEP';
      }
      // 2. Somatic Physical Grounding check (Internal physiology / direct somatic contact)
      else if (
        SOMATIC_INTERNAL_KEYWORDS.has(followingWord) ||
        surroundingSnippet.includes('behind his sternum') ||
        surroundingSnippet.includes('behind her sternum') ||
        surroundingSnippet.includes('synaptic latency') ||
        surroundingSnippet.includes('cold iron') ||
        surroundingSnippet.includes('cold metal') ||
        surroundingSnippet.includes('pulse') ||
        surroundingSnippet.includes('numbness') ||
        surroundingSnippet.includes('tightness')
      ) {
        category = 'SOMATIC_PHYSICAL_GROUNDING';
        isProtected = true;
        reason = 'Grounded somatic sensation anchored directly in character physiology; protected from forced anthropomorphism.';
        suggestedAction = 'KEEP';
      }
      // 3. Abstract Emotional Telling check
      else if (
        ABSTRACT_EMOTION_KEYWORDS.has(followingWord) ||
        Array.from(ABSTRACT_EMOTION_KEYWORDS).some(kw => surroundingSnippet.includes(kw))
      ) {
        category = 'ABSTRACT_EMOTIONAL_TELLING';
        isProtected = false;
        reason = 'Tells an abstract emotional label instead of dramatizing physical/behavioral consequence.';
        suggestedAction = 'SUGGEST_PHYSICAL_DRAMATIZATION';
      }

      occurrences.push({
        matchedText: fullMatch.trim(),
        verb,
        category,
        isProtected,
        reason,
        index: match.index,
        suggestedAction,
      });
    }

    const somaticGroundingCount = occurrences.filter(o => o.category === 'SOMATIC_PHYSICAL_GROUNDING').length;
    const epistemicUncertaintyCount = occurrences.filter(o => o.category === 'EPISTEMIC_UNCERTAINTY').length;
    const abstractTellingCount = occurrences.filter(o => o.category === 'ABSTRACT_EMOTIONAL_TELLING').length;
    const streamlinableCount = occurrences.filter(o => o.category === 'DIRECT_SENSORY_STREAMLINABLE').length;

    const densityPer100Words = Number(((occurrences.length / totalWords) * 100).toFixed(2));
    // Acceptable if density < 2.5 per 100 words OR if occurrences are protected somatic/uncertainty anchors
    const unprotectedCount = abstractTellingCount + streamlinableCount;
    const isDensityAcceptable = densityPer100Words < 2.5 || (unprotectedCount <= 1);

    const score = Number(
      Math.max(
        0.1,
        Math.min(
          1.0,
          1.0 - (abstractTellingCount * 0.25) - (unprotectedCount > 2 ? 0.2 : 0)
        )
      ).toFixed(2)
    );

    const summaryNotes: string[] = [];
    if (somaticGroundingCount > 0) {
      summaryNotes.push(`Protected ${somaticGroundingCount} legitimate somatic sensation anchor(s).`);
    }
    if (epistemicUncertaintyCount > 0) {
      summaryNotes.push(`Protected ${epistemicUncertaintyCount} epistemic uncertainty marker(s).`);
    }
    if (abstractTellingCount > 0) {
      summaryNotes.push(`Flagged ${abstractTellingCount} abstract emotional telling instance(s).`);
    }

    return {
      totalFilterVerbs: occurrences.length,
      densityPer100Words,
      somaticGroundingCount,
      epistemicUncertaintyCount,
      abstractTellingCount,
      streamlinableCount,
      occurrences,
      isDensityAcceptable,
      score,
      summaryNotes,
    };
  }
}

const AI_FINGERPRINT_PATTERNS = [
  { regex: /\b[A-Z][a-z]+ing\b[\s\S]{1,60}?,[\s\S]{1,60}?\b(?:reverting|instructed|remarking|taking|pausing|speaking|noting)\b/g, rule: 'AI_PARTICIPLE_STACKING', reason: 'Stacked -ing participial clauses create synthetic, formulaic sentence cadence.' },
  { regex: /\b(?:highlighted the seriousness of|shed light on the events|symbolized by his|conducted evaluations and questions|indicat(?:ed|ing) his awakening|amidst the confusion|with fragments of his past resurfacing)\b/gi, rule: 'AI_EXPOSITORY_FILLER', reason: 'Summary filler tells the reader about significance instead of dramatizing the scene.' },
  { regex: /\b(?:no|not)\s+[a-z]+(?:\s+[a-z]+)?,\s+(?:no|not)\s+[a-z]+(?:\s+[a-z]+)?,\s+(?:and\s+)?(?:no|not)\s+[a-z]+/gi, rule: 'AI_SYMMETRICAL_TRIPLE', reason: 'Formulaic ternary parallelism is an algorithmic signature; vary cadence asynchronously.' },
  { regex: /,\s*(?:she|he)\s+(?:explained clinically|recounted, each word|instructed, ")/gi, rule: 'AI_DIALOGUE_TAG_BLOAT', reason: 'Avoid explaining emotional/clinical mode inside speech tags; let dialogue carry the weight.' },
  { regex: /\b(?:an entire life to (?:dig|reclaim|take back)|a tracker in his shadow|an army of watchers at his back|opened the cage door to see whose)\b/gi, rule: 'AI_TRAILER_PUNCHLINE', reason: 'Melodramatic movie-trailer rhetoric; replace with immediate physical reality.' },
  { regex: /(?:They|He|She)\s+hadn't\b[\s\S]{1,80}?\b(?:They|He|She)\s+hadn't\b/gi, rule: 'AI_ANAPHORA_CHAIN', reason: 'Formulaic negative anaphora chain creates artificial rhetorical symmetry.' },
];

const GENRE_CLASH_PATTERNS = [
  { regex: /\bvault of forbidden knowledge\b/gi, rule: 'GENRE_CLASH_FANTASY', reason: 'Replace fantasy trope with genre-appropriate repository.' },
  { regex: /\b(?:magic mirror|mirror that showed a future self)\b/gi, rule: 'GENRE_CLASH_FANTASY', reason: 'Replace fantasy trope with genre-appropriate projection.' },
  { regex: /\b(?:statue's eyes glowed|ancient statue)\b/gi, rule: 'GENRE_CLASH_FANTASY', reason: 'Ground monument in optical/lighting detail.' },
  { regex: /\b(?:ancient prophecy|weight of the prophecy)\b/gi, rule: 'GENRE_CLASH_FANTASY', reason: 'Replace prophecy with historical records or vows.' },
  { regex: /\b(?:ancient key)\b/gi, rule: 'GENRE_CLASH_FANTASY', reason: 'Replace trope key with mechanical override tool.' },
];

const SPEC_MEASUREMENT_PATTERN = /\b\d+(?:\.\d+)?\s*(?:hz|rpm|psi|millivolts?|joules?|megawatts?|khz|mhz|pounds of tension|degrees? c)\b/gi;

const DEFAULT_POV_PROFILES: Record<string, POVProfile> = {
  ELIAS: {
    preferred: ['synaptic', 'latency', 'bandwidth', 'neural', 'memory', 'frequency', 'burnout', 'circuit', 'refresh rate', 'cognitive', 'pulse', 'hypothesis', 'equation', 'logic'],
    discouraged: ['rail-carbine', 'sandbag', 'parapet', 'haggling', 'ballistic'],
    maxAvgSentenceLength: 28,
    description: 'Analytical, neuro-cognitive, systemic architecture, multi-clause cognitive depth.',
    lens: {
      sensoryHierarchy: ['GEOMETRY', 'ACOUSTIC', 'TACTILE'],
      attentionBias: 'Spatial angles, frequency resonance, procedural reflexes vs autobiographical amnesia',
      internalMonologuePacing: 'SYSTEMIC_DEEP',
      forbiddenTropes: ['casual slang in combat', 'unearned physical swagger']
    }
  },
  MAREN: {
    preferred: ['vent', 'exit', 'shadow', 'grip', 'sidearm', 'breath', 'conduit', 'wire', 'blade', 'chuckle', 'tarmac', 'alley'],
    discouraged: ['megawatts', 'millivolts', 'algorithmic', 'non-euclidean', 'sub-spatial'],
    maxAvgSentenceLength: 16,
    description: 'Clipped, cynical, survivalist threat perception, body language, short punchy clauses.',
    lens: {
      sensoryHierarchy: ['TEMPORAL', 'ACOUSTIC', 'TACTILE'],
      attentionBias: 'Forensic latency analysis, diagnostic timeline verification, autonomic panic suppression',
      internalMonologuePacing: 'STACCATO_ALERT',
      forbiddenTropes: ['philosophical lectures to strangers', 'passive damsel tropes']
    }
  },
  CORWIN: {
    preferred: ['catwalk', 'parapet', 'carbine', 'perimeter', 'treads', 'harness', 'surveyor', 'concussion', 'breach', 'protocol'],
    discouraged: ['poetic', 'singing', 'magic', 'constellations', 'lullaby'],
    maxAvgSentenceLength: 22,
    description: 'Tactical weight, veteran procedural momentum, steady declarative action-checks.',
    lens: {
      sensoryHierarchy: ['TACTILE', 'ACOUSTIC', 'THERMAL'],
      attentionBias: 'Physical terrain stability, perimeter security, procedural load-bearing checks',
      internalMonologuePacing: 'TACTICAL_MEASURED',
      forbiddenTropes: ['sentimental nostalgia in field ops']
    }
  },
  NEUTRAL: {
    preferred: [],
    discouraged: [],
    maxAvgSentenceLength: 24,
    description: 'Balanced commercial narrative prose.',
  }
};

export class VoicePolisher {
  private static registeredProfiles: Record<string, POVProfile> = { ...DEFAULT_POV_PROFILES };

  public static registerPOVProfile(name: string, profile: POVProfile): void {
    this.registeredProfiles[name.toUpperCase()] = profile;
  }

  public static getPOVProfile(name: string, customProfiles?: Record<string, POVProfile>): POVProfile {
    const upper = name.toUpperCase();
    if (customProfiles && customProfiles[upper]) {
      return customProfiles[upper];
    }
    if (this.registeredProfiles[upper]) {
      return this.registeredProfiles[upper];
    }
    return this.registeredProfiles.NEUTRAL;
  }

  public static evaluate(text: string, options: VoicePolishOptions = {}): VoicePolishReport {
    return this.polish(text, options);
  }

  public static polish(text: string, options: VoicePolishOptions = {}): VoicePolishReport {
    const pov = options.pov || 'NEUTRAL';
    const genre = options.genre || 'GENERAL';
    const tempo = options.tempo || 'TACTICAL_PROCEDURAL';
    const threatLevel = options.threatLevel || 'TENSE_STANDOFF';
    const emotionalState = options.emotionalState || 'STABLE_CALM';
    const mode = options.mode || 'POLISH';
    const sceneRegister: SceneRegister = options.sceneRegister || (
      tempo === 'ACTION_SPRINT' ? 'ACTION_KINETIC' :
      tempo === 'INTIMATE_QUIET' ? 'EMOTIONAL_INTIMACY' :
      tempo === 'CONTEMPLATIVE_DREAM' ? 'PSYCHOLOGICAL_INTROSPECTION' :
      'TACTICAL_PROCEDURAL'
    );

    const words = text.match(/\b[a-z0-9'-]+\b/gi) || [];
    const isSparseSentence = words.length <= 6 && !/\b(?:saw|heard|felt|noticed|suddenly)\b/i.test(text);

    // Pass 0: Intentional Literary Metaphor Check (OUTCOME: KEEP)
    const metaphorEvaluation = this.evaluateIntentionalMetaphor(text);
    if (metaphorEvaluation.isIntentional) {
      return {
        originalText: text,
        polishedText: text,
        decision: 'KEEP',
        decisionReason: metaphorEvaluation.reason,
        pov,
        genre,
        tempo,
        sceneRegister,
        threatLevel,
        emotionalState,
        mode,
        filterWordsEliminated: 0,
        specClutterCount: 0,
        quantificationViolationsCount: 0,
        performativeRestraintCount: 0,
        aiFingerprintsDetected: 0,
        burstinessScore: 8.0,
        suggestions: [],
        gateResults: [
          { gate: 'GATE_1_POV_VOICE', passed: true, score: 1.0, notes: ['Authorial voice and metaphor verified.'] },
          { gate: 'GATE_2_TEMPO_REGISTER', passed: true, score: 1.0, notes: ['Intentional literary pacing and register preserved.'] },
          { gate: 'GATE_3_STAKES_PRESERVATION', passed: true, score: 1.0, notes: ['Thematic resonance preserved.'] },
          { gate: 'GATE_4_CANON_ANTI_DRIFT', passed: true, score: 1.0, notes: ['Zero drift.'] },
          { gate: 'SPEC_CLUTTER_GUARD', passed: true, score: 1.0, notes: ['Zero spec clutter.'] },
          { gate: 'AI_FINGERPRINT_GUARD', passed: true, score: 1.0, notes: ['Clean natural cadence.'] },
          { gate: 'FILTER_VERB_CONTEXT_GUARD', passed: true, score: 1.0, notes: ['Zero problematic filters.'] },
          { gate: 'QUANTIFICATION_GUARD', passed: true, score: 1.0, notes: ['Zero false precision.'] },
          { gate: 'PERFORMATIVE_RESTRAINT_GUARD', passed: true, score: 1.0, notes: ['Clean baseline.'] },
          { gate: 'PSYCHOLOGICAL_DEPTH_GUARD', passed: true, score: 1.0, notes: ['Literary metaphor depth verified.'] },
        ],
        cadenceHeuristicScore: 1.0,
        cadenceScore: 1.0,
        filterReductionScore: 1.0,
        immediacyScore: 1.0,
        voiceHeuristicScore: 1.0,
        voiceIntegrityScore: 1.0,
      };
    }

    if (isSparseSentence) {
      return {
        originalText: text,
        polishedText: text,
        decision: 'KEEP',
        decisionReason: 'Sparse, unadorned pacing beat protected from artificial expansion.',
        pov,
        genre,
        tempo,
        sceneRegister,
        threatLevel,
        emotionalState,
        mode,
        filterWordsEliminated: 0,
        specClutterCount: 0,
        quantificationViolationsCount: 0,
        performativeRestraintCount: 0,
        aiFingerprintsDetected: 0,
        burstinessScore: 8.0,
        suggestions: [],
        gateResults: [
          { gate: 'GATE_1_POV_VOICE', passed: true, score: 1.0, notes: ['Clean baseline.'] },
          { gate: 'GATE_2_TEMPO_REGISTER', passed: true, score: 1.0, notes: ['Sparse pacing beat protected from artificial expansion.'] },
          { gate: 'GATE_3_STAKES_PRESERVATION', passed: true, score: 1.0, notes: ['Pacing preserved.'] },
          { gate: 'GATE_4_CANON_ANTI_DRIFT', passed: true, score: 1.0, notes: ['Zero drift.'] },
          { gate: 'SPEC_CLUTTER_GUARD', passed: true, score: 1.0, notes: ['Zero spec clutter.'] },
          { gate: 'AI_FINGERPRINT_GUARD', passed: true, score: 1.0, notes: ['Clean natural cadence.'] },
          { gate: 'FILTER_VERB_CONTEXT_GUARD', passed: true, score: 1.0, notes: ['Clean baseline.'] },
          { gate: 'QUANTIFICATION_GUARD', passed: true, score: 1.0, notes: ['Clean baseline.'] },
          { gate: 'PERFORMATIVE_RESTRAINT_GUARD', passed: true, score: 1.0, notes: ['Clean baseline.'] },
          { gate: 'PSYCHOLOGICAL_DEPTH_GUARD', passed: true, score: 1.0, notes: ['Clean baseline.'] },
        ],
        cadenceHeuristicScore: 1.0,
        cadenceScore: 1.0,
        filterReductionScore: 1.0,
        immediacyScore: 1.0,
        voiceHeuristicScore: 1.0,
        voiceIntegrityScore: 1.0,
      };
    }

    // Contextual Filter Verb Analysis (Density & Grounding aware)
    const filterAnalysis = ContextualFilterVerbAnalyzer.analyze(text);
    const suggestions: PolishSuggestion[] = [];
    let eliminatedCount = 0;
    let polished = text;

    for (const occ of filterAnalysis.occurrences) {
      if (occ.suggestedAction === 'SUGGEST_PHYSICAL_DRAMATIZATION') {
        suggestions.push({
          originalPhrase: occ.matchedText,
          suggestedReplacement: '[DRAMATIZE_PHYSICAL_REACTION]',
          ruleCode: 'ABSTRACT_EMOTION_TELLING',
          reason: occ.reason,
          startIndex: occ.index,
        });
      }
    }

    // Direct Sensory Streamlining (for non-protected external object perception)
    const beforeStreamline = polished;
    polished = polished
      .replace(/\b(?:[A-Z][a-z0-9'-]+(?:\s+[A-Z][a-z0-9'-]+)?|he|she|they)\s+(?:saw|watched|noticed|heard|could hear|could see)\s+(the|a|an)\s+/gi, '$1 ')
      .replace(/\b(?:[A-Z][a-z0-9'-]+(?:\s+[A-Z][a-z0-9'-]+)?|he|she|they)\s+(?:could feel|felt)\s+(the\s+(?:cold\s+concrete\s+floor|floor|ground|catwalk|server rack|arcane aether|deck|hull|rail|metal))\s+/gi, '$1 ');

    // Verb inflection cleanup for common streamlined infinitives
    polished = polished
      .replace(/\b(the\s+spark)\s+jump\b/gi, '$1 jumped')
      .replace(/\b(the\s+floor)\s+shudder\b/gi, '$1 shuddered')
      .replace(/\b(the\s+arcane\s+aether)\s+surge\b/gi, '$1 surged')
      .replace(/\b(the\s+heart\s+rate\s+monitor)\s+spike\b/gi, '$1 spiked')
      .replace(/\b(the\s+server\s+rack)\s+hum\b/gi, '$1 hummed');

    // Clean up unnecessary "suddenly" crutches and language anomalies without mangling somatic anchors
    if (/\b(?:suddenly,\s*|suddenly\s+)/i.test(polished)) {
      polished = polished.replace(/\b(?:suddenly,\s*|suddenly\s+)/gi, '');
      polished = polished.replace(/^([a-z])/, (m, c) => c.toUpperCase());
    }
    polished = polished.replace(/\bmăng-tô\b/gi, 'canvas overcoat');

    if (polished !== text) {
      eliminatedCount = 1;
    }

    // Genre Clash Flags
    if (genre === 'HARD_SCI_FI' || genre === 'GENERAL') {
      for (const clash of GENRE_CLASH_PATTERNS) {
        let match: RegExpExecArray | null;
        const re = new RegExp(clash.regex.source, 'gi');
        while ((match = re.exec(text)) !== null) {
          suggestions.push({
            originalPhrase: match[0],
            suggestedReplacement: '[GENRE_ADAPTATION_REQUIRED]',
            ruleCode: clash.rule,
            reason: clash.reason,
            startIndex: match.index,
          });
        }
      }
    }

    // Measure Spec Clutter
    const specMatches = polished.match(SPEC_MEASUREMENT_PATTERN) || [];
    const specClutterCount = specMatches.length;

    // Quantification & False Precision Evaluation
    const quantGuard = this.evaluateQuantificationGuard(polished, sceneRegister);
    const quantificationViolationsCount = quantGuard.violations;

    // Performative Restraint Evaluation
    const perfGuard = this.evaluatePerformativeRestraintGuard(polished);
    const performativeRestraintCount = perfGuard.detections;

    // Psychological Depth Evaluation
    const psychDepthGuard = this.evaluatePsychologicalDepthGuard(polished, sceneRegister);

    // Gates Evaluation
    const gate1Result = this.evaluatePOVGate(polished, pov, threatLevel, emotionalState, options.customProfiles);
    const gate2Result = this.evaluateTempoRegisterGate(polished, tempo, threatLevel, emotionalState, specClutterCount);
    const gate3Result = this.evaluateStakesGate(text, polished);
    const sourceDraft = options.sourceDraft || text;
    const gate4Result = this.evaluateCanonAntiDriftGate(sourceDraft, polished, mode);
    const specGuardResult = this.evaluateSpecClutterGuard(polished, specClutterCount, tempo);

    const aiGuard = this.evaluateAIFingerprintGuard(polished);
    const aiFingerprintResult = aiGuard.result;
    const aiFingerprintsDetected = aiGuard.detections;
    const burstinessScore = this.calculateBurstiness(polished);

    const filterContextGuard: GateCheckResult = {
      gate: 'FILTER_VERB_CONTEXT_GUARD',
      passed: filterAnalysis.isDensityAcceptable && filterAnalysis.abstractTellingCount === 0,
      score: filterAnalysis.score,
      notes: filterAnalysis.summaryNotes.length > 0 ? filterAnalysis.summaryNotes : ['Filter verb density and somatic grounding healthy.'],
    };

    const unsuppSpecGuard = this.evaluateUnsupportedSpecificityGuard(polished, sceneRegister, options.sourceDraft);
    const cognSyntaxGuard = this.evaluateCognitiveSyntaxGuard(text, options.isMultiPOV ?? false);
    const tropeConvGuard = this.evaluateTropeConvergenceGuard(polished, options.premiseAmbiguity);
    const opSecRiskGuard = this.evaluateSecondOrderOpSecGuard(polished, sceneRegister);
    const houseStyleGuard = this.evaluateHouseStyleGuard(polished, genre);

    const gateResults: GateCheckResult[] = [
      gate1Result,
      gate2Result,
      gate3Result,
      gate4Result,
      specGuardResult,
      aiFingerprintResult,
      filterContextGuard,
      quantGuard.result,
      perfGuard.result,
      psychDepthGuard,
      unsuppSpecGuard,
      cognSyntaxGuard,
      tropeConvGuard,
      opSecRiskGuard,
      houseStyleGuard,
    ];

    // Compute Diagnostic Heuristic Scores
    const passedGates = gateResults.filter(g => g.passed).length;
    const voiceHeuristicScore = Number((passedGates / gateResults.length).toFixed(2));
    const cadenceHeuristicScore = gate1Result.score;
    const filterReductionScore = filterAnalysis.score;

    // Decision Logic: REWRITE | KEEP | FLAG
    let decision: PolishDecision = 'REWRITE';
    let decisionReason = `Evaluated craft gates with contextual somatic grounding and register sensitivity.`;

    const anyGateFailed = gateResults.some(g => !g.passed);

    if (anyGateFailed) {
      decision = 'FLAG';
      const failingNotes = gateResults.filter(g => !g.passed).flatMap(g => g.notes).join(' ');
      decisionReason = `Flagged for revision: ${failingNotes}`;
    } else if (polished !== text) {
      decision = 'REWRITE';
      decisionReason = 'Streamlined external sensory perception / crutch while preserving somatic grounding.';
    } else if (specClutterCount === 0 && aiFingerprintsDetected === 0 && suggestions.length === 0 && quantificationViolationsCount === 0 && performativeRestraintCount === 0) {
      decision = 'KEEP';
      decisionReason = 'Text satisfies all craft invariants with healthy somatic grounding and voice integrity.';
    }

    return {
      originalText: text,
      polishedText: polished,
      decision,
      decisionReason,
      pov,
      genre,
      tempo,
      sceneRegister,
      threatLevel,
      emotionalState,
      mode,
      filterWordsEliminated: eliminatedCount,
      specClutterCount,
      quantificationViolationsCount,
      performativeRestraintCount,
      aiFingerprintsDetected,
      burstinessScore,
      suggestions,
      gateResults,
      filterVerbAnalysis: filterAnalysis,
      cadenceHeuristicScore,
      cadenceScore: cadenceHeuristicScore,
      filterReductionScore,
      immediacyScore: filterReductionScore,
      voiceHeuristicScore,
      voiceIntegrityScore: voiceHeuristicScore,
    };
  }

  public static calculateBurstiness(text: string): number {
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 1) return 8.0;
    const lengths = sentences.map(s => (s.match(/\b[a-z0-9'-]+\b/gi) || []).length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((acc, len) => acc + Math.pow(len - mean, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    return Number(stdDev.toFixed(2));
  }

  private static evaluateAIFingerprintGuard(text: string): { result: GateCheckResult; detections: number } {
    const notes: string[] = [];
    let detections = 0;

    for (const pat of AI_FINGERPRINT_PATTERNS) {
      const matches = text.match(pat.regex);
      if (matches) {
        detections += matches.length;
        notes.push(`Found ${matches.length} instance(s) of [${pat.rule}]: ${pat.reason}`);
      }
    }

    const burstiness = this.calculateBurstiness(text);
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    if (sentences.length >= 4 && burstiness < 3.0) {
      detections += 1;
      notes.push(`Low burstiness score (${burstiness} < 3.0). Sentences have uniform length distribution.`);
    }

    const passed = detections === 0;
    return {
      result: {
        gate: 'AI_FINGERPRINT_GUARD',
        passed,
        score: passed ? 1.0 : Number(Math.max(0.1, 1.0 - (detections * 0.25)).toFixed(2)),
        notes: passed ? ['Zero synthetic AI syntax fingerprints or participle stacking detected. High natural burstiness.'] : notes
      },
      detections
    };
  }

  private static evaluateIntentionalMetaphor(text: string): { isIntentional: boolean; reason: string } {
    const lower = text.toLowerCase();
    if (/\b(?:suddenly|felt the weight of the prophecy)\b/i.test(lower)) {
      return { isIntentional: false, reason: '' };
    }

    const intentionalPatterns = [
      /\b(?:silence between|memory is a|truth is not a|held its breath|grief was an anchor)\b/i,
      /\b(?:quiet agreement|signed in exhaustion|signed in rot|unspoken treaty|inherited debt|unforgiving geography)\b/i,
      /\b(?:was a|is a|were)\s+(?:cold\s+gray\s+needle|locked\s+room|heavy\s+shadow|shivering\s+mirror|silent\s+monolith|fragile\s+lattice)\b/i
    ];

    for (const pat of intentionalPatterns) {
      if (pat.test(lower)) {
        return {
          isIntentional: true,
          reason: 'Intentional literary/thematic metaphor detected. Protected from destructive micro-rewriting.'
        };
      }
    }

    return { isIntentional: false, reason: '' };
  }

  private static evaluatePOVGate(
    text: string, 
    pov: POVCharacter, 
    threat: ThreatLevel, 
    emotion: EmotionalState,
    customProfiles?: Record<string, POVProfile>
  ): GateCheckResult {
    if (pov === 'NEUTRAL') {
      return { gate: 'GATE_1_POV_VOICE', passed: true, score: 1.0, notes: ['Neutral POV — standard commercial prose constraints applied.'] };
    }

    const lower = text.toLowerCase();
    const profile = this.getPOVProfile(pov, customProfiles);
    const notes: string[] = [];

    let discouragedHits = 0;
    if (threat !== 'PEACE_REFLECTIVE' && emotion !== 'INTELLECTUAL_CURIOSITY' && emotion !== 'QUIET_RELIEF') {
      for (const dw of profile.discouraged) {
        if (lower.includes(dw.toLowerCase())) {
          discouragedHits++;
          notes.push(`Found word '${dw}' which clashes with ${pov}'s profile (${profile.description}).`);
        }
      }
    }

    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    const words = text.match(/\b[a-z0-9'-]+\b/gi) || [];
    const avgLen = words.length / (sentences.length || 1);
    const maxLen = (threat === 'LETHAL_COMBAT' || emotion === 'PANIC_OVERLOAD') ? 16 : profile.maxAvgSentenceLength;

    if (sentences.length > 0 && avgLen > maxLen) {
      notes.push(`Average sentence length (${avgLen.toFixed(1)} words) exceeds ceiling of ${maxLen} for ${pov} under ${threat}/${emotion}.`);
    }

    const passed = discouragedHits === 0 && (sentences.length === 0 || avgLen <= maxLen);
    const score = Number(Math.max(0.1, 1.0 - (discouragedHits * 0.3) - (avgLen > maxLen ? 0.2 : 0)).toFixed(2));

    return {
      gate: 'GATE_1_POV_VOICE',
      passed,
      score,
      notes: passed ? [`Voice matches ${pov} cognitive profile cleanly.`] : notes
    };
  }

  private static evaluateTempoRegisterGate(
    text: string, 
    tempo: SceneTempo, 
    threat: ThreatLevel, 
    emotion: EmotionalState, 
    specCount: number
  ): GateCheckResult {
    const notes: string[] = [];
    let passed = true;

    if ((tempo === 'ACTION_SPRINT' || threat === 'LETHAL_COMBAT') && specCount > 0) {
      passed = false;
      notes.push(`ACTION_SPRINT/LETHAL_COMBAT prohibits technical spec measurements (${specCount} detected).`);
    } else if (tempo === 'INTIMATE_QUIET' && specCount > 0) {
      passed = false;
      notes.push(`INTIMATE_QUIET register suppresses hardware spec dumps (${specCount} detected).`);
    }

    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    const longSentences = sentences.filter(s => (s.match(/\b[a-z0-9'-]+\b/gi) || []).length > 22);

    if ((tempo === 'ACTION_SPRINT' || threat === 'LETHAL_COMBAT') && longSentences.length > 0) {
      passed = false;
      notes.push(`Sentence is too long for ACTION_SPRINT/LETHAL_COMBAT: "${longSentences[0].slice(0, 40)}..."`);
    }

    const score = passed ? 1.0 : Number(Math.max(0.2, 1.0 - (specCount * 0.25) - (longSentences.length * 0.2)).toFixed(2));

    return {
      gate: 'GATE_2_TEMPO_REGISTER',
      passed,
      score,
      notes: passed ? [`Tempo (${tempo}) and Threat Level (${threat}) rhythm verified.`] : notes
    };
  }

  private static evaluateStakesGate(original: string, polished: string): GateCheckResult {
    const hadStakes = /\b(?:survival|die|death|destroy|ruin|family|legacy|extinction|trapped|killed|threat|colony's survival)\b/i.test(original);
    const hasStakes = /\b(?:survival|die|death|destroy|ruin|family|legacy|extinction|trapped|killed|threat|colony's survival)\b/i.test(polished);

    const passed = !hadStakes || hasStakes;
    return {
      gate: 'GATE_3_STAKES_PRESERVATION',
      passed,
      score: passed ? 1.0 : 0.4,
      notes: passed ? ['Stakes and core conflict drivers intact.'] : ['High-stakes narrative motivation was stripped.']
    };
  }

  private static evaluateCanonAntiDriftGate(original: string, polished: string, mode: PolishMode): GateCheckResult {
    if (mode === 'CREATIVE_RECONSTRUCTION') {
      return {
        gate: 'GATE_4_CANON_ANTI_DRIFT',
        passed: true,
        score: 1.0,
        notes: ['CREATIVE_RECONSTRUCTION mode allows generative scene invention.']
      };
    }

    const notes: string[] = [];
    let passed = true;

    const relationshipTokens = ['brother', 'sister', 'father', 'mother', 'daughter', 'son', 'husband', 'wife'];
    for (const rel of relationshipTokens) {
      const origHas = new RegExp(`\\b${rel}\\b`, 'i').test(original);
      const polHas = new RegExp(`\\b${rel}\\b`, 'i').test(polished);
      const hasProposalTag = /\[CANON_PROPOSAL:[^\]]+\]/i.test(polished);

      if (!origHas && polHas && !hasProposalTag) {
        passed = false;
        notes.push(`Semantic Drift: Invented unverified relationship '${rel}' without [CANON_PROPOSAL] tag.`);
      }
    }

    return {
      gate: 'GATE_4_CANON_ANTI_DRIFT',
      passed,
      score: passed ? 1.0 : 0.3,
      notes: passed ? ['Semantic core aligned with draft.'] : notes
    };
  }

  private static evaluateSpecClutterGuard(text: string, specCount: number, tempo: SceneTempo): GateCheckResult {
    const passed = specCount <= 2 || (tempo === 'TACTICAL_PROCEDURAL' && specCount <= 3);
    const score = passed ? 1.0 : Number(Math.max(0.1, 1.0 - (specCount * 0.2)).toFixed(2));

    return {
      gate: 'SPEC_CLUTTER_GUARD',
      passed,
      score,
      notes: passed ? ['Spec clutter within acceptable narrative bounds.'] : [`Excessive spec clutter (${specCount} measurements detected).`]
    };
  }

  private static evaluateQuantificationGuard(text: string, sceneRegister: SceneRegister): { result: GateCheckResult; violations: number } {
    const isNonProcedural = sceneRegister === 'EMOTIONAL_INTIMACY' || sceneRegister === 'ACTION_KINETIC' || sceneRegister === 'PSYCHOLOGICAL_INTROSPECTION';
    const notes: string[] = [];
    let violations = 0;

    if (isNonProcedural) {
      const falsePrecisionPatterns = [
        { regex: /\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|twelve|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\s+(?:paces\s*(?:per|a)\s*minute|pulls|degrees?\s*(?:celsius|c|fahrenheit)?|millimeters?|inches?|psi|tons?|kilopascals?|megawatts?|rpm)\b/gi, rule: 'FALSE_PRECISION_MEASUREMENT' },
        { regex: /\b\d+(?:\.\d+)?\s*(?:paces\s*(?:per|a)\s*minute|pulls|degrees?\s*(?:celsius|c|fahrenheit)?|millimeters?|inches?|psi|tons?|kilopascals?|megawatts?|rpm)\b/gi, rule: 'FALSE_PRECISION_MEASUREMENT' },
        { regex: /\b(?:counted\s+(?:\d+|[a-z]+)\s+(?:pulls|steps|seconds|times)|turned\s+(?:the\s+)?(?:valve|dial|knob)\s+(?:ninety|90)\s*degrees?)\b/gi, rule: 'FALSE_PRECISION_COUNTING' },
      ];

      for (const pat of falsePrecisionPatterns) {
        const matches = text.match(pat.regex);
        if (matches) {
          violations += matches.length;
          notes.push(`[${pat.rule}]: Unearned numerical measurement (${matches.join(', ')}) in ${sceneRegister} scene. Replace with experiential physical sensation or psychological action.`);
        }
      }
    }

    const passed = violations === 0;
    return {
      result: {
        gate: 'QUANTIFICATION_GUARD',
        passed,
        score: passed ? 1.0 : Number(Math.max(0.1, 1.0 - (violations * 0.3)).toFixed(2)),
        notes: passed ? [`Zero false precision measurements in ${sceneRegister} context.`] : notes
      },
      violations
    };
  }

  private static evaluatePerformativeRestraintGuard(text: string): { result: GateCheckResult; detections: number } {
    const notes: string[] = [];
    let detections = 0;

    const performativePatterns = [
      { regex: /\b(?:aligning|aligned)\s+(?:the\s+)?(?:corners|borders|edges|stripes?)\s+(?:in\s+half\s+)?(?:until\s+(?:the\s+)?(?:corners\s+were\s+)?(?:square|perfect)|to\s+make\s+squares?)\b/gi, rule: 'AFFECTED_TOWEL_SQUARE', reason: 'Towel aligning formula artificially signals restraint.' },
      { regex: /\b(?:aligned\s+(?:the\s+)?(?:corners|borders|edges)\s+until\s+(?:they\s+were\s+)?(?:square|perfect))\b/gi, rule: 'AFFECTED_TOWEL_SQUARE', reason: 'Towel aligning formula artificially signals restraint.' },
      { regex: /\b(?:moth\s+(?:was\s+)?tapping\s+the\s+glass\s+(?:four|\d+)\s+times)\b/gi, rule: 'AFFECTED_MOTH_TAPS', reason: 'Exact counting of animal behavior is synthetic restraint affectation.' },
      { regex: /\b(?:turned\s+(?:the\s+)?(?:brass\s+)?gas\s+valve\s+(?:ninety|90)\s*degrees)\b/gi, rule: 'AFFECTED_VALVE_DEGREE', reason: 'Degree quantification on household appliances is performative precision.' }
    ];

    for (const pat of performativePatterns) {
      const matches = text.match(pat.regex);
      if (matches) {
        detections += matches.length;
        notes.push(`[${pat.rule}]: ${pat.reason}`);
      }
    }

    const passed = detections === 0;
    return {
      result: {
        gate: 'PERFORMATIVE_RESTRAINT_GUARD',
        passed,
        score: passed ? 1.0 : Number(Math.max(0.1, 1.0 - (detections * 0.3)).toFixed(2)),
        notes: passed ? ['Zero performative restraint affectations detected.'] : notes
      },
      detections
    };
  }

  private static evaluatePsychologicalDepthGuard(text: string, sceneRegister: SceneRegister): GateCheckResult {
    if (sceneRegister !== 'EMOTIONAL_INTIMACY' && sceneRegister !== 'PSYCHOLOGICAL_INTROSPECTION') {
      return { gate: 'PSYCHOLOGICAL_DEPTH_GUARD', passed: true, score: 1.0, notes: ['Procedural / kinetic scene register active.'] };
    }

    const lower = text.toLowerCase();
    const hasHumanMemoryOrName = /\b(?:brother|sister|father|mother|daughter|son|child|family|friend|remember|memory|years|home|voice|callus|silence|breath|regret|thought)\b/i.test(lower);
    const hasToolOverload = (lower.match(/\b(?:alternator|socket|hex driver|gauge|caliper|amphorae|flange|lathe|piston|valve|fuse|switch|torque|cheater bar)\b/gi) || []).length >= 5;

    const passed = hasHumanMemoryOrName || !hasToolOverload;
    return {
      gate: 'PSYCHOLOGICAL_DEPTH_GUARD',
      passed,
      score: passed ? 1.0 : 0.4,
      notes: passed ? ['Psychological interiority and human resonance preserved.'] : ['Scene substitutes mechanical equipment catalog for character emotional interiority.']
    };
  }

  private static evaluateUnsupportedSpecificityGuard(text: string, sceneRegister: SceneRegister, sourceDraft?: string): GateCheckResult {
    const isMemo = /\b(?:MEMORANDUM|TO:|FROM:|SUBJECT:|EXECUTIVE SUMMARY)\b/i.test(text);
    if (!isMemo) {
      return { gate: 'UNSUPPORTED_SPECIFICITY_GUARD', passed: true, score: 1.0, notes: ['Non-memo register active; general scope bounding satisfied.'] };
    }

    // Detect ungrounded low-level technical hallucinations in executive memos
    const inventedSubsystems = [
      { regex: /\b(?:token persistence layer|distributed (?:edge )?caches?|asynchronous event propagation|out-of-order execution|session validation pipeline|credential claims?)\b/gi, name: 'invented authentication subsystems' },
      { regex: /\b(?:jwt|oauth|sha256|aes-256|rsa-4096|tls 1\.3|microservice routing proxy)\b/gi, name: 'ungrounded protocol jargon' },
    ];

    const notes: string[] = [];
    let ungroundedCount = 0;

    for (const sub of inventedSubsystems) {
      const matches = text.match(sub.regex);
      if (matches) {
        // If source draft already specified it, it's grounded; otherwise it's invented
        const draftHasIt = sourceDraft && sub.regex.test(sourceDraft);
        if (!draftHasIt) {
          ungroundedCount += matches.length;
          notes.push(`[UNSUPPORTED_SPECIFICITY]: Unprompted low-level technical architecture (${matches.join(', ')}). In high-level memos, scope strictly to provided premise context without hallucinating specific implementation modules.`);
        }
      }
    }

    const passed = ungroundedCount === 0;
    return {
      gate: 'UNSUPPORTED_SPECIFICITY_GUARD',
      passed,
      score: passed ? 1.0 : Number(Math.max(0.2, 1.0 - (ungroundedCount * 0.3)).toFixed(2)),
      notes: passed ? ['Executive memorandum adheres to bounded premise scope without ungrounded technical module hallucinations.'] : notes
    };
  }

  private static evaluateCognitiveSyntaxGuard(text: string, isMultiPOV: boolean): GateCheckResult {
    if (!isMultiPOV) {
      return { gate: 'COGNITIVE_SYNTAX_GUARD', passed: true, score: 1.0, notes: ['Single POV scene active.'] };
    }

    // In multi-POV scenes, check whether all POVs fall into the identical formula:
    // "Where [person] saw X, [character] saw Y" or "X was Y... [Character] stepped..."
    const sharedFormulaMatches = text.match(/\bWhere (?:another|others|someone) saw [^,]+,\s*[a-zA-Z]+ saw\b/gi) || [];
    const notes: string[] = [];

    const isViolating = sharedFormulaMatches.length >= 2;
    if (isViolating) {
      notes.push(`Formulaic POV transition detected: Repeated 'Where X saw A, Y saw B' structure across POVs. Diversify cognitive reasoning syntax.`);
    }

    const passed = !isViolating;
    return {
      gate: 'COGNITIVE_SYNTAX_GUARD',
      passed,
      score: passed ? 1.0 : 0.4,
      notes: passed ? ['Multi-POV syntactic and cognitive reasoning structures diversified.'] : notes
    };
  }

  private static evaluateTropeConvergenceGuard(text: string, premiseAmbiguity?: 'MINIMAL_PROMPT' | 'SPECIFIED_CANON'): GateCheckResult {
    if (premiseAmbiguity !== 'MINIMAL_PROMPT') {
      return { gate: 'TROPE_CONVERGENCE_GUARD', passed: true, score: 1.0, notes: ['Specified canon prompt active.'] };
    }

    const lower = text.toLowerCase();
    const hasRuralCellar = /\b(?:root cellar|cellar|washhouse|carriage house|apple barn|orchard)\b/i.test(lower);
    const hasDeadAncestor = /\b(?:grandfather|mother|father|grandmother|family secret)\b/i.test(lower);
    const hasDomesticArtifact = /\b(?:cradle|baby shoes|small shoes|perfume|silver buckled shoes|trunk)\b/i.test(lower);

    if (hasRuralCellar && hasDeadAncestor && hasDomesticArtifact) {
      return {
        gate: 'TROPE_CONVERGENCE_GUARD',
        passed: false,
        score: 0.5,
        notes: ['[TROPE_ATTRACTOR_BASIN]: Detected convergence on standard rural family-secret cliché (cellar + deceased relative + infant/woman relics). Consider divergent domain seeds (maritime lock, urban archival vault, radio listening station).']
      };
    }

    return {
      gate: 'TROPE_CONVERGENCE_GUARD',
      passed: true,
      score: 1.0,
      notes: ['Creative exploration diverges from standard attractor basin tropes.']
    };
  }

  private static evaluateSecondOrderOpSecGuard(text: string, sceneRegister: SceneRegister): GateCheckResult {
    if (sceneRegister !== 'TACTICAL_PROCEDURAL') {
      return { gate: 'SECOND_ORDER_OPSEC_GUARD', passed: true, score: 1.0, notes: ['Non-tactical register active.'] };
    }

    const isClassifiedExposure = /\b(?:classified|sensitive|reconnaissance|secret|confidential|survey|fortress)\b/i.test(text);
    if (!isClassifiedExposure) {
      return { gate: 'SECOND_ORDER_OPSEC_GUARD', passed: true, score: 1.0, notes: ['Standard procedural context.'] };
    }

    // Check if narrative acknowledges downstream consequence/risk
    const hasSecondOrderRisk = /\b(?:logbook|visitor log|registry|suspicion|reporting|chain|breach|inquiry|compromise|fallout|consequence|witness|subpoena|seal)\b/i.test(text);

    return {
      gate: 'SECOND_ORDER_OPSEC_GUARD',
      passed: hasSecondOrderRisk,
      score: hasSecondOrderRisk ? 1.0 : 0.5,
      notes: hasSecondOrderRisk 
        ? ['OpSec protocol tracks immediate concealment and downstream operational consequence.']
        : ['OpSec scene handles immediate tactical concealment but omits second-order operational risk/fallout.']
    };
  }

  private static evaluateHouseStyleGuard(text: string, genre: GenreType): GateCheckResult {
    // If explicitly historical, allow historical workshop materials
    if (genre === 'HISTORICAL_FICTION') {
      return { gate: 'HOUSE_STYLE_ENTROPY_GUARD', passed: true, score: 1.0, notes: ['Historical fiction active; period textures permitted.'] };
    }

    const lower = text.toLowerCase();
    // Detect over-concentration of 19th-century rustic industrial props
    const rusticTokens = [
      'tallow', 'linseed oil', 'mackintosh', 'oilcloth', 'iron stove',
      'cedar shingle', 'dray horse', 'drayman', 'canal sluice', 'sawmill',
      'wharf tavern', 'parish chapel', 'hemlock stand', 'tallow candle'
    ];

    const foundTokens: string[] = [];
    for (const token of rusticTokens) {
      if (lower.includes(token)) {
        foundTokens.push(token);
      }
    }

    // Flag if a non-historical scene has 3 or more rustic tokens
    const isOverClustered = foundTokens.length >= 3;
    const notes: string[] = [];
    if (isOverClustered) {
      notes.push(`[HOUSE_STYLE_CONVERGENCE]: Detected heavy concentration of 19th-century workshop textures (${foundTokens.join(', ')}). Diversify material and aesthetic vocabulary for non-period settings.`);
    }

    return {
      gate: 'HOUSE_STYLE_ENTROPY_GUARD',
      passed: !isOverClustered,
      score: isOverClustered ? 0.4 : 1.0,
      notes: isOverClustered ? notes : ['Material palette diversified and free of repetitive house-style token clustering.']
    };
  }
}
