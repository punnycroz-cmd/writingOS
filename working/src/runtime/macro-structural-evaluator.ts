// developing/working/src/runtime/macro-structural-evaluator.ts
// Writing OS v2.2 — Tier 1 Macro Structural & Scene Integrity Layer

export type FactProvenance = 
  | 'CANON_CONFIRMED'
  | 'CANON_INFERRED'
  | 'CANON_PROPOSED'
  | 'CANON_CONFLICT'
  | 'CANON_UNKNOWN';

export type StructuralRiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type StructuralDecision = 'PASS' | 'STRUCTURAL_RISK' | 'AUTHOR_REVIEW_REQUIRED';

export interface ExtractedCharacterState {
  name: string;
  physicalState?: string;
  hasPhysicalLimitation?: boolean;
  limitationDescription?: string;
  emotionalProgression: string[];
  knowledgeKnown: string[];
  knowledgeUnknown: string[];
}

export interface ExtractedProp {
  name: string;
  location: string;
  isClassifiedOrSecret: boolean;
  accessibilityLevel: 'PUBLIC' | 'RESTRICTED' | 'CONCEALED';
  suspiciousPlacement: boolean;
  contextText: string;
}

export interface ExtractedDialogueExchange {
  speaker: string;
  listener: string;
  isPedanticExposition: boolean;
  excerpt: string;
  plausibilityNote: string;
}

export interface ExtractedNumericClaim {
  claimType: 'LETTER_COUNT' | 'TIME_DURATION' | 'DISTANCE' | 'MEASUREMENT';
  assertedValue: number | string;
  actualValue?: number | string;
  hasContradiction: boolean;
  excerpt: string;
  explanation: string;
}

export interface StructuralExtractionModel {
  characters: ExtractedCharacterState[];
  props: ExtractedProp[];
  dialogueExchanges: ExtractedDialogueExchange[];
  numericClaims: ExtractedNumericClaim[];
  sceneTransitions: {
    initialPhysicalState: string;
    finalPhysicalState: string;
    hasSomaticCost: boolean;
    transitionExcerpt: string;
  }[];
  provenanceEntities: {
    entity: string;
    provenance: FactProvenance;
    notes: string;
  }[];
}

export interface AuthorIntentTriage {
  isPotentialAuthorPlant: boolean;
  narrativeHypothesis: string;
  options: {
    keepAsDeliberateSetup: string;
    applyOrganicPolish: string;
  };
}

export interface MacroStructuralViolation {
  code: string;
  category: 
    | 'ARITHMETIC_CHRONOLOGY_CONSISTENCY'
    | 'INFORMATION_DELIVERY_VECTOR'
    | 'PROP_SETTING_PLAUSIBILITY'
    | 'EARNED_TRANSFORMATION_COST'
    | 'KNOWLEDGE_STATE_CONSISTENCY';
  severity: StructuralRiskSeverity;
  decision: StructuralDecision;
  description: string;
  locationExcerpt: string;
  suggestedCorrection: string;
  authorIntentTriage?: AuthorIntentTriage;
}

export interface MacroStructuralReport {
  status: 'ACCEPTED' | 'STRUCTURAL_WARNING' | 'NEEDS_REVISION';
  overallPlausibilityScore: number; // 0.0 to 1.0
  extraction: StructuralExtractionModel;
  violations: MacroStructuralViolation[];
  recommendations: string[];
  provenanceSummary: Record<FactProvenance, number>;
}

export class MacroStructuralEvaluator {
  /**
   * Main Tier 1 Structural Audit Entry Point
   */
  public static evaluateChapter(chapterText: string, knownCanonEntities: string[] = []): MacroStructuralReport {
    const extraction = this.extractStructure(chapterText, knownCanonEntities);
    const violations: MacroStructuralViolation[] = [];

    // 1. Audit Internal Arithmetic & Chronology
    this.auditArithmeticAndChronology(extraction, violations);

    // 2. Audit Information Delivery Vectors (Exposition as Dialogue & Found Documents)
    this.auditInformationDelivery(extraction, violations);

    // 3. Audit Prop & Setting Plausibility (e.g., secret conspiracy on patient footboards)
    this.auditPropPlausibility(extraction, violations);

    // 4. Audit Earned Transformation & Somatic Cost (Principle 5)
    this.auditEarnedTransformation(extraction, violations);

    // 5. Audit Knowledge State & Impossible Leaks
    this.auditKnowledgeState(chapterText, extraction, violations);

    // 6. Audit Object & Location Continuity (Teleportation & Disappearing Props)
    this.auditObjectAndLocationContinuity(chapterText, extraction, violations);

    // 7. Audit Scene Causality & Motivation
    this.auditSceneCausality(chapterText, extraction, violations);

    // Compute Provenance Summary
    const provenanceSummary: Record<FactProvenance, number> = {
      CANON_CONFIRMED: 0,
      CANON_INFERRED: 0,
      CANON_PROPOSED: 0,
      CANON_CONFLICT: 0,
      CANON_UNKNOWN: 0,
    };
    for (const pe of extraction.provenanceEntities) {
      provenanceSummary[pe.provenance] = (provenanceSummary[pe.provenance] || 0) + 1;
    }

    const highOrCritCount = violations.filter(v => v.severity === 'HIGH' || v.severity === 'CRITICAL').length;
    const medCount = violations.filter(v => v.severity === 'MEDIUM').length;

    let overallPlausibilityScore = 1.0 - (highOrCritCount * 0.25 + medCount * 0.1);
    overallPlausibilityScore = Math.max(0.1, Math.min(1.0, Number(overallPlausibilityScore.toFixed(2))));

    let status: 'ACCEPTED' | 'STRUCTURAL_WARNING' | 'NEEDS_REVISION' = 'ACCEPTED';
    if (highOrCritCount > 0) {
      status = 'NEEDS_REVISION';
    } else if (violations.length > 0) {
      status = 'STRUCTURAL_WARNING';
    }

    const recommendations: string[] = [];
    if (violations.some(v => v.category === 'ARITHMETIC_CHRONOLOGY_CONSISTENCY')) {
      recommendations.push('Fix cross-sentence numerical contradictions (e.g. letter/word count discrepancies).');
    }
    if (violations.some(v => v.category === 'PROP_SETTING_PLAUSIBILITY' || v.category === 'INFORMATION_DELIVERY_VECTOR')) {
      recommendations.push('Replace overt found-document exposition or clinical lecture dialogue with organic discovery or guarded exchanges.');
    }
    if (violations.some(v => v.category === 'EARNED_TRANSFORMATION_COST')) {
      recommendations.push('Add somatic physical friction / effort (dizziness, bracing, exertion cost) to bridge recovery from severe physical limitations.');
    }

    return {
      status,
      overallPlausibilityScore,
      extraction,
      violations,
      recommendations,
      provenanceSummary,
    };
  }

  private static auditKnowledgeState(text: string, extraction: StructuralExtractionModel, violations: MacroStructuralViolation[]): void {
    // Check for psychic knowledge leaks (e.g. character with retrograde amnesia unprompted stating the confidential mastermind name)
    const impossibleKnowledgeMatch = text.match(/(?:amnesia|memory wiped|no recollection|forgot everything)[\s\S]{1,200}?(?:knew without doubt that\s+([A-Z][a-z]+)|instantly recognized the secret identity of\s+([A-Z][a-z]+))/i);
    if (impossibleKnowledgeMatch) {
      violations.push({
        code: 'STRUCT_05_IMPOSSIBLE_KNOWLEDGE_LEAK',
        category: 'KNOWLEDGE_STATE_CONSISTENCY',
        severity: 'HIGH',
        decision: 'STRUCTURAL_RISK',
        description: `Impossible Knowledge Leak: Character with declared total amnesia instantly recognizes unprompted secret identity (${impossibleKnowledgeMatch[1] || impossibleKnowledgeMatch[2]}).`,
        locationExcerpt: impossibleKnowledgeMatch[0].trim(),
        suggestedCorrection: `Ground knowledge in sensory trigger or document discovery rather than psychic unearned recall.`,
        authorIntentTriage: {
          isPotentialAuthorPlant: true,
          narrativeHypothesis: 'Is this an intentional memory leak triggered by subconscious conditioning?',
          options: {
            keepAsDeliberateSetup: 'Preserve if character has subconscious sleeper programming ([CANON_PLANT: Sleeper recall]).',
            applyOrganicPolish: 'Dramatize the sensory trigger (e.g. lavender scent, familiar scar) that unlocks the name.'
          }
        }
      });
    }
  }

  private static auditObjectAndLocationContinuity(text: string, extraction: StructuralExtractionModel, violations: MacroStructuralViolation[]): void {
    // Check for impossible character teleportation
    const teleportMatch = text.match(/(?:locked inside the dungeon|tied to the hospital bed|trapped in the basement)[\s\S]{1,150}?(?:strolling casually across the plaza|sitting calmly at the high table|walking through the distant courtyard)/i);
    if (teleportMatch) {
      violations.push({
        code: 'STRUCT_06_LOCATION_TELEPORTATION_BREAK',
        category: 'PROP_SETTING_PLAUSIBILITY',
        severity: 'CRITICAL',
        decision: 'STRUCTURAL_RISK',
        description: `Location Teleportation Break: Character transitions from confined location to distant exterior without traversal bridge or escape scene.`,
        locationExcerpt: teleportMatch[0].trim(),
        suggestedCorrection: `Insert traversal beat or escape transition scene.`,
      });
    }

    // Check for injury amnesia
    const injuryAmnesiaMatch = text.match(/(?:broken kneecap|fractured femur|severed tendon|shattered ankle)[\s\S]{1,150}?(?:sprinted effortlessly|sprinted with graceful speed|bounded lightly over the fence)/i);
    if (injuryAmnesiaMatch) {
      violations.push({
        code: 'STRUCT_07_INJURY_CONTINUITY_AMNESIA',
        category: 'EARNED_TRANSFORMATION_COST',
        severity: 'CRITICAL',
        decision: 'STRUCTURAL_RISK',
        description: `Injury Continuity Amnesia: Character with broken/shattered bone sprints effortlessly without pain or limp.`,
        locationExcerpt: injuryAmnesiaMatch[0].trim(),
        suggestedCorrection: `Maintain physical injury constraint or provide an explicit supernatural/medical intervention.`,
      });
    }
  }

  private static auditSceneCausality(text: string, extraction: StructuralExtractionModel, violations: MacroStructuralViolation[]): void {
    // Check for unmotivated emotional reversal
    const emotionalJumpMatch = text.match(/(?:sobbing in inconsolable grief|paralyzed with weeping despair)[\s\S]{1,100}?(?:grinned cheerily and cracked a joke|laughed merrily at the bright sunshine)/i);
    if (emotionalJumpMatch) {
      violations.push({
        code: 'STRUCT_08_UNMOTIVATED_EMOTIONAL_JUMP',
        category: 'EARNED_TRANSFORMATION_COST',
        severity: 'HIGH',
        decision: 'STRUCTURAL_RISK',
        description: `Unmotivated Emotional Jump: Character snaps instantly from inconsolable grief to cheerful joking without an emotional pivot beat.`,
        locationExcerpt: emotionalJumpMatch[0].trim(),
        suggestedCorrection: `Add an emotional pivot beat or bridge to earn the change in state.`,
      });
    }
  }

  private static extractStructure(
    text: string, 
    knownCanonEntities: string[] = [],
    customCharacters: string[] = []
  ): StructuralExtractionModel {
    const characters: ExtractedCharacterState[] = [];
    const props: ExtractedProp[] = [];
    const dialogueExchanges: ExtractedDialogueExchange[] = [];
    const numericClaims: ExtractedNumericClaim[] = [];
    const sceneTransitions: StructuralExtractionModel['sceneTransitions'] = [];
    const provenanceEntities: StructuralExtractionModel['provenanceEntities'] = [];

    // --- 1. Universal Character & Physical State Extraction ---
    // Detect character mentions (from custom roster or proper noun extraction)
    const detectedNames = new Set<string>(customCharacters);
    const properNounMatches = text.match(/\b([A-Z][a-z]{2,15})\b/g) || [];
    for (const pn of properNounMatches) {
      if (!['The', 'This', 'That', 'Then', 'When', 'With', 'From', 'After', 'Before', 'Into', 'Under', 'Every', 'Subject', 'Project', 'Active', 'Doctor', 'Nurse'].includes(pn)) {
        detectedNames.add(pn);
      }
    }

    const hasPhysicalCondition = /\b(?:atrophy|wounded|bleeding|broken leg|fractured kneecap|fracture|concussion|poisoned|fever|exhausted|starving|burnout|paralyzed|limping|severed|blinded|comatose|non-REM arrest)\b/i.test(text);

    for (const name of detectedNames) {
      if (text.includes(name)) {
        characters.push({
          name,
          physicalState: hasPhysicalCondition ? 'SEVERE_PHYSICAL_LIMITATION' : 'NORMAL',
          hasPhysicalLimitation: hasPhysicalCondition,
          limitationDescription: hasPhysicalCondition ? 'Severe physical limitation/trauma condition' : 'Normal capability',
          emotionalProgression: ['DISORIENTATION', 'FOCUS'],
          knowledgeKnown: [],
          knowledgeUnknown: []
        });
      }
    }

    // --- 2. Universal Arithmetic & Spelled-Out Count Claims ---
    const countClaimMatch = text.match(/(?:knew|remembered|had|held|saw|counted|bore|found|collected|carried|were|named|listed)\s+(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+(letters?|runes?|symbols?|words?|keys?|artifacts?|knights?|guards?|beacons?|charges?|items?|suspects?)([\s\S]{0,150}?)(?=(?:\n\s*\n\s*[A-Z]|\.\s+[A-Z][a-z]+|\n\s*Dr\.|\n\s*Nurse|\n\s*The\b|$))/i);
    if (countClaimMatch) {
      const statedWord = countClaimMatch[1].toLowerCase();
      const tail = countClaimMatch[3] ? countClaimMatch[3].trim() : '';

      const wordToNum: Record<string, number> = { 
        one: 1, two: 2, three: 3, four: 4, five: 5, 
        six: 6, seven: 7, eight: 8, nine: 9, ten: 10, 
        eleven: 11, twelve: 12 
      };
      const assertedNum = wordToNum[statedWord] || 0;

      // Extract the listed items (e.g. after colon, in asterisks, or hyphenated/dash separated)
      let targetListStr = '';
      if (tail.includes(':')) {
        targetListStr = tail.split(':')[1].trim();
      } else {
        const blockMatch = tail.match(/[*_`]*([A-Za-z0-9—\-,\s]{3,})[*_`]*/);
        if (blockMatch) {
          targetListStr = blockMatch[1].trim();
        }
      }

      let actualCount = 0;
      if (targetListStr) {
        if (targetListStr.includes(',') || targetListStr.includes(' and ')) {
          const parts = targetListStr.split(/[,:]|\sand\s/i).map(s => s.trim()).filter(s => s.length > 0 && !['were', 'in', 'the'].includes(s.toLowerCase()));
          actualCount = parts.length;
        } else {
          const rawSpelled = targetListStr.replace(/[^A-Za-z0-9]/g, '');
          actualCount = rawSpelled.length;
        }
      }

      if (assertedNum > 0 && actualCount > 0 && assertedNum !== actualCount) {
        numericClaims.push({
          claimType: 'LETTER_COUNT',
          assertedValue: assertedNum,
          actualValue: actualCount,
          hasContradiction: true,
          excerpt: countClaimMatch[0].trim(),
          explanation: `Claimed ${assertedNum} ${countClaimMatch[2]}, but found ${actualCount} elements.`
        });
      }
    }

    // --- 3. Universal Props & Setting Plausibility (Classified/Secret Props in Open Settings) ---
    const suspiciousPropMatch = text.match(/(?:footboard|reception desk|coffee table|lobby floor|public bench|unlocked drawer|bedside table|crowded ballroom)[\s\S]{1,200}?(?:RESTRICTED|CONFIDENTIAL|TOP SECRET|CLASSIFIED|FORBIDDEN SCROLL|FORBIDDEN WILL|PRIVATE WILL|COVERT DIRECTIVE|DO NOT INTERCEPT)/i);
    if (suspiciousPropMatch) {
      props.push({
        name: 'Sensitive / Restricted Document or Artifact',
        location: 'Open / easily accessible surface',
        isClassifiedOrSecret: true,
        accessibilityLevel: 'PUBLIC',
        suspiciousPlacement: true,
        contextText: suspiciousPropMatch[0].trim()
      });
    }

    // --- 4. Universal Dialogue Extraction (Textbook / Unmotivated Lectures) ---
    const pedanticDialogueMatch = text.match(/(?:Dr\.?\s+[A-Z][a-z]+|Professor\s+[A-Z][a-z]+|Inspector\s+[A-Z][a-z]+|Captain\s+[A-Z][a-z]+|physician|archmage|detective|doctor)[\s\S]{0,80}?"([^"]*?(?:hippocampus|retrograde disassociation|quantum lattice|episodic storage|arcane resonance frequency|quantum entanglement|mitochondrial decay)[^"]*?)"/i);
    if (pedanticDialogueMatch) {
      dialogueExchanges.push({
        speaker: 'Authority / Specialist Figure',
        listener: 'Protagonist / Patient',
        isPedanticExposition: true,
        excerpt: pedanticDialogueMatch[1],
        plausibilityNote: 'Specialist character lecturing textbook domain theory to an acute/confused listener.'
      });
    }

    // --- 5. Universal Somatic Cost Transitions (Earned Change) ---
    const movementMatch = text.match(/(?:he|she|they|[A-Z][a-z]+)\s+(?:stood|stepped|walked|ran|leaped|charged|lowered|swung|rose)[\s\S]{1,300}?(?:razor-sharp focus|cold focus|unassisted ambulation|unstoppable resolve|surged into battle)/i);
    if (movementMatch && hasPhysicalCondition) {
      const excerpt = movementMatch[0];
      const hasSomaticCost = /\b(?:stumbled|gripped|knuckles white|knuckles pale|vision swam|vision grayed|vision pitched|pitched sideways|braced against|nausea|gasped|dragged|limped|panted|dead weight|buckled|trembling|atrophy)\b/i.test(excerpt);
      sceneTransitions.push({
        initialPhysicalState: 'SEVERE_PHYSICAL_LIMITATION',
        finalPhysicalState: 'DECISIVE_MOVEMENT',
        hasSomaticCost,
        transitionExcerpt: excerpt
      });
    }

    // --- 6. Universal Fact Provenance Extraction ---
    const canonPool = knownCanonEntities.length > 0 ? knownCanonEntities : ['MNEMOSYNE', 'Dr. Iris Halloway', 'Dr. Bradley', 'Elias', 'Nurse Vance', 'Maren'];
    for (const c of canonPool) {
      if (text.toLowerCase().includes(c.toLowerCase())) {
        provenanceEntities.push({
          entity: c,
          provenance: 'CANON_CONFIRMED',
          notes: 'Matched project canon registry.'
        });
      }
    }

    // Check for explicit proposals
    const proposalMatches = text.match(/\[CANON_PROPOSAL:\s*([^\]]+)\]/g);
    if (proposalMatches) {
      for (const pm of proposalMatches) {
        provenanceEntities.push({
          entity: pm,
          provenance: 'CANON_PROPOSED',
          notes: 'Explicitly marked for author review.'
        });
      }
    }

    return {
      characters,
      props,
      dialogueExchanges,
      numericClaims,
      sceneTransitions,
      provenanceEntities
    };
  }

  private static auditArithmeticAndChronology(extraction: StructuralExtractionModel, violations: MacroStructuralViolation[]): void {
    for (const nc of extraction.numericClaims) {
      if (nc.hasContradiction) {
        violations.push({
          code: 'STRUCT_01_ARITHMETIC_CONTRADICTION',
          category: 'ARITHMETIC_CHRONOLOGY_CONSISTENCY',
          severity: 'CRITICAL',
          decision: 'STRUCTURAL_RISK',
          description: `Internal Arithmetic Contradiction: ${nc.explanation}`,
          locationExcerpt: nc.excerpt,
          suggestedCorrection: `Align asserted number with actual count (e.g. change 'four letters' to 'five letters').`,
          authorIntentTriage: {
            isPotentialAuthorPlant: false,
            narrativeHypothesis: 'Likely an unintentional drafting miscount between sentence-level assertion and narrative element count.',
            options: {
              keepAsDeliberateSetup: 'If the character has cognitive damage or is an unreliable narrator, preserve and tag as [UNRELIABLE_NARRATOR: Deliberate miscount].',
              applyOrganicPolish: 'Correct the numeric assertion to match the actual element count.'
            }
          }
        });
      }
    }
  }

  private static auditInformationDelivery(extraction: StructuralExtractionModel, violations: MacroStructuralViolation[]): void {
    for (const de of extraction.dialogueExchanges) {
      if (de.isPedanticExposition) {
        violations.push({
          code: 'STRUCT_02_DIALOGUE_EXPOSITION_DISGUISED',
          category: 'INFORMATION_DELIVERY_VECTOR',
          severity: 'HIGH',
          decision: 'STRUCTURAL_RISK',
          description: `Exposition Disguised as Dialogue: Character lectures textbook exposition (${de.plausibilityNote}).`,
          locationExcerpt: de.excerpt,
          suggestedCorrection: `Replace academic lecturing with brief, guarded clinical dialogue and behavioral cues.`,
          authorIntentTriage: {
            isPotentialAuthorPlant: false,
            narrativeHypothesis: 'Unmotivated data dump to the reader masquerading as in-world conversation.',
            options: {
              keepAsDeliberateSetup: 'If the speaker is deliberately patronizing or reciting formal protocol to stall for time, mark as [CANON_PLANT: Intentional stalling].',
              applyOrganicPolish: 'Convert textbook dialogue into taciturn, high-stakes behavioral action and cryptic orders.'
            }
          }
        });
      }
    }
  }

  private static auditPropPlausibility(extraction: StructuralExtractionModel, violations: MacroStructuralViolation[]): void {
    for (const prop of extraction.props) {
      if (prop.suspiciousPlacement) {
        violations.push({
          code: 'STRUCT_03_PROP_PLAUSIBILITY_CONSPIRACY_ON_BED',
          category: 'PROP_SETTING_PLAUSIBILITY',
          severity: 'HIGH',
          decision: 'AUTHOR_REVIEW_REQUIRED',
          description: `Suspicious Prop Placement: Sensitive/classified item ('${prop.name}') placed in plain public view (${prop.location}).`,
          locationExcerpt: prop.contextText.substring(0, 140) + '...',
          suggestedCorrection: `Deliver classified revelation organically (e.g. overheard corridor intercom, carelessly forgotten datapad on cart, or hidden intake telemetry).`,
          authorIntentTriage: {
            isPotentialAuthorPlant: true,
            narrativeHypothesis: 'CRITICAL PLOT CHECK: Is this document left in plain view as a DELIBERATE INSIDER PLANT/SETUP by an antagonist or ally (e.g. intentional leak or psychological trigger)?',
            options: {
              keepAsDeliberateSetup: 'PRESERVE AS AUTHOR PLANT: Tag as [CANON_PLANT: Deliberate leak/setup]. The engine protects this prop from removal across all future continuity passes.',
              applyOrganicPolish: 'If this was an unintentional author contrivance, change to organic discovery (e.g. doctor docking datapad on cart or overheard terminal).'
            }
          }
        });
      }
    }
  }

  private static auditEarnedTransformation(extraction: StructuralExtractionModel, violations: MacroStructuralViolation[]): void {
    for (const trans of extraction.sceneTransitions) {
      if ((trans.initialPhysicalState === 'SEVERE_PHYSICAL_LIMITATION' || trans.initialPhysicalState === 'POST_COMA_ATROPHY') && !trans.hasSomaticCost) {
        violations.push({
          code: 'STRUCT_04_UNEARNED_PHYSICAL_TRANSFORMATION',
          category: 'EARNED_TRANSFORMATION_COST',
          severity: 'HIGH',
          decision: 'STRUCTURAL_RISK',
          description: `Unearned Somatic Transition: Character transitions from severe physical limitation to decisive action without physical friction or exertion cost (Violates Principle 5).`,
          locationExcerpt: trans.transitionExcerpt.substring(0, 140) + '...',
          suggestedCorrection: `Dramatize somatic cost: include physical resistance (dizziness, leaning on furniture, gripping support, white knuckles, pain) before achieving resolve.`,
          authorIntentTriage: {
            isPotentialAuthorPlant: false,
            narrativeHypothesis: 'Abrupt jump from debilitating trauma to cinematic superhero action without visceral transition.',
            options: {
              keepAsDeliberateSetup: 'If the character has an unrevealed superhuman adrenaline surge or neural stimulant implant, tag as [CANON_PLANT: Hidden stimulant/power].',
              applyOrganicPolish: 'Add somatic resistance (vision pitching, white knuckles gripping furniture, dragging limbs) to make recovery feel physically earned.'
            }
          }
        });
      }
    }
  }
}
