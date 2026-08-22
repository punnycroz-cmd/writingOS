// iteration43-helpers.ts — Shared helpers for Iteration 4.3 and 4.3-FW.
// Contains the frozen 23-case test matrix, prompt builders, and state factory.
// Both the z-ai runner (iteration43.ts) and the Fireworks runner (iteration43-fw.ts)
// import from this file to ensure they use the EXACT SAME frozen benchmark.

// ── Types ───────────────────────────────────────────────────────────────────
export type InventionPolicy = 'NONE' | 'SOURCE_CONSTRAINED' | 'LICENSED_FICTION' | 'LIMITED_INFERENCE';

export interface DocumentState {
  character: {
    identity: string;
    goals?: string[];
    fears?: string[];
    beliefs?: string[];
    memories?: string[];
    emotionalState?: string;
    perceptualHabits?: string[];
    voice?: string;
    currentKnowledge?: string[];
  };
  informationOwnership?: {
    entries: {
      fact: string;
      knows: string[];
      suspects: string[];
      misunderstands: string[];
      unknown: string[];
    }[];
  };
  canon?: {
    facts: {
      content: string;
      classification: 'HARD_CANON' | 'SOFT_CANON' | 'BACKGROUND';
      source?: string;
    }[];
  };
  deferredChecks?: any[];
  sceneId?: string;
  revisionId?: number;
}

// ── Policy descriptions ─────────────────────────────────────────────────────
const POLICY_DESCRIPTIONS: Record<string, string> = {
  NONE: 'No invention is allowed. The output must remain source-constrained. Every detail must come from the source passage or explicit state.',
  SOURCE_CONSTRAINED: 'Only source-supported, explicitly-supplied, or properly-entailed information may be asserted. Unsupported specificity must not be introduced.',
  LICENSED_FICTION: 'Ordinary narrative invention is allowed (sensory description, environmental texture, ordinary observed detail), PROVIDED the invention respects POV, character knowledge, canon, temporal state, scene continuity, and narrative causality. NOT "anything goes" — IO leaks, canon violations, and unsupported factual assertions are still rejected.',
  LIMITED_INFERENCE: 'Narrative invention is allowed AND plausible character-level inference may be used, but uncertain inference must not become unjustified certainty.',
};

// ── Prompt builders ─────────────────────────────────────────────────────────
export function buildStateAwareSystemPrompt(policy: InventionPolicy): string {
  return `You are an independent semantic validator for a writing revision engine. You did NOT generate the revision. Your job is to check whether it is safe to accept given the active INVENTION POLICY and the structured state.

${POLICY_DESCRIPTIONS[policy] || ''}

=== FIVE STATE-AWARE RULES ===

RULE 1 — CONSULT STATE BEFORE INTEGRITY FAILURE. Inspect InformationOwnership, CharacterState, Canon, DeferredChecks before assigning infoOwnership = FAIL. Do NOT reject a knowledge claim merely because words like "knew", "understood", "realized" appear. Determine whether the structured state actually authorizes that knowledge.

RULE 2 — DISTINGUISH EPISTEMIC LEVELS. OBSERVATION / INTERPRETATION / SUSPICION / BELIEF / KNOWLEDGE / CERTAINTY. Do NOT treat all as equivalent.

RULE 3 — VAGUE UNCERTAINTY IS NOT A LEAK. "wondered if", "seemed", "something bothered her" are licensed under LICENSED_FICTION/LIMITED_INFERENCE.

RULE 4 — STATE-SUPPORTED CLAIMS MUST BE ACCEPTED. If state=KNOWS and candidate says "knew X" → PASS. If state=SUSPECTS and "suspected X" → PASS. If state=SUSPECTS and "knew X" → FAIL. If state=UNKNOWN and "knew X" → FAIL.

RULE 5 — GENUINE AMBIGUITY MAY BE UNCLEAR.

=== INTEGRITY CONSTRAINTS ===
- infoOwnership: FAIL only for certainty about UNKNOWN facts, or suspicion of specific fact when state=UNKNOWN without evidence.
- faithfulness: FAIL for unsupported specific numbers/dates/names. Under LICENSED_FICTION, sensory observation is PASS.
- canon: FAIL if contradicts HARD/SOFT CANON.
- deferred: FAIL if resolves a DEFERRED check.

overall: ACCEPT if no integrity dimension is FAIL. REJECT if any is FAIL. UNCLEAR on faithfulness/infoOwnership → REJECT (conservative).

Return ONLY valid JSON.`;
}

export function buildValidationUserPrompt(input: {
  originalText?: string;
  candidateText: string;
  documentState: any;
  handoffPayload?: any;
  triageAction: string;
}): string {
  const { originalText, candidateText, documentState, handoffPayload, triageAction } = input;
  return `ORIGINAL TEXT:\n"""\n${originalText || '(not provided)'}\n"""\n\nCANDIDATE TEXT:\n"""\n${candidateText}\n"""\n\nDOCUMENT STATE:\n${JSON.stringify(documentState, null, 2)}\n\nDETERMINISTIC TRIAGE ACTION: ${triageAction}\n\nValidate. Return JSON:\n{\n  "meaning": "PASS"|"FAIL"|"UNCLEAR",\n  "character": "PASS"|"FAIL"|"UNCLEAR",\n  "infoOwnership": "PASS"|"FAIL"|"UNCLEAR",\n  "canon": "PASS"|"FAIL"|"UNCLEAR",\n  "voice": "PASS"|"FAIL"|"UNCLEAR",\n  "register": "PASS"|"FAIL"|"UNCLEAR",\n  "intelligibility": "PASS"|"FAIL"|"UNCLEAR",\n  "deferred": "PASS"|"FAIL"|"UNCLEAR",\n  "faithfulness": "PASS"|"FAIL"|"UNCLEAR",\n  "overall": "ACCEPT"|"REJECT",\n  "reasons": ["per dimension"],\n  "epistemicLevelAssessed": "OBSERVATION"|"INTERPRETATION"|"SUSPICION"|"BELIEF"|"KNOWLEDGE"|"CERTAINTY"|"MIXED"|"NONE",\n  "stateConsulted": true|false\n}`;
}

// ── State factory ───────────────────────────────────────────────────────────
export function makeState(mayaKnows: 'unknown' | 'suspects' | 'knows', withAmount: boolean = false): DocumentState {
  const fact = withAmount
    ? 'Marcus embezzled $40,000 from the clinic'
    : 'Marcus took money from the clinic';
  return {
    character: {
      identity: 'Maya Okafor — ICU nurse',
      goals: [], fears: [], beliefs: [], memories: [],
      emotionalState: '', perceptualHabits: [], voice: '',
      currentKnowledge: mayaKnows === 'knows' ? [fact] : [],
    },
    informationOwnership: {
      entries: [{
        fact,
        knows: mayaKnows === 'knows' ? ['Marcus', 'Maya'] : ['Marcus'],
        suspects: mayaKnows === 'suspects' ? ['Maya'] : [],
        misunderstands: [],
        unknown: mayaKnows === 'unknown' ? ['Maya'] : [],
      }],
    },
    canon: { facts: [{ content: 'Maya co-owns a clinic with Marcus', classification: 'HARD_CANON' as const, source: 'ch1' }] },
    deferredChecks: [],
    sceneId: 'iter43', revisionId: 43,
  };
}

// ── Handoff factory ─────────────────────────────────────────────────────────
export function makeHandoff(candidateText: string, state: DocumentState, policy: InventionPolicy): any {
  return {
    caseId: 'iter43',
    candidateText,
    activePolicy: policy,
    proofStrength: 'UNRESOLVED',
    primaryTriageReason: 'epistemic language calibration — deferred to semantic layer',
    claimSignals: [],
    hardViolations: [],
    softSignals: [],
    stateReferences: {
      characterIdentity: state.character.identity,
      matchedFacts: [],
      relatedCanonEntries: [],
    },
    recommendedSemanticQuestions: [
      'What epistemic level does the candidate assert (wondered/suspected/knew)?',
      'Does the character\'s state authorize that epistemic level?',
      'Is the proposition vague or specific?',
    ],
  };
}

// ── The frozen 23-case test matrix ──────────────────────────────────────────
export interface TestCase43 {
  id: string;
  group: 'A' | 'B' | 'C' | 'D' | 'E' | 'PAIR';
  label: string;
  candidate: string;
  state: DocumentState;
  policy: InventionPolicy;
  expected: 'ACCEPT' | 'REJECT' | 'UNCLEAR';
  reasoning: string;
  epistemicLevel: 'WONDERED' | 'SUSPECTED' | 'KNEW' | 'VAGUE_AFFECT' | 'DOMAIN_SUSPICION';
  propositionSpecificity: 'VAGUE' | 'SOME' | 'SPECIFIC_AMOUNT' | 'SPECIFIC_FACT';
}

export const testMatrix43: TestCase43[] = [
  // === GROUP A — UNKNOWN state ===
  { id: 'A1', group: 'A', label: 'UNKNOWN + wondered (vague)', candidate: 'Maya wondered if Marcus had taken anything.', state: makeState('unknown'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'vague uncertainty — no specific proposition', epistemicLevel: 'WONDERED', propositionSpecificity: 'VAGUE' },
  { id: 'A2', group: 'A', label: 'UNKNOWN + suspected (some money)', candidate: 'Maya suspected Marcus might have taken some money.', state: makeState('unknown'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'specific suspicion of a fact the character does not know — unsupported', epistemicLevel: 'SUSPECTED', propositionSpecificity: 'SOME' },
  { id: 'A3', group: 'A', label: 'UNKNOWN + suspected ($40k specific)', candidate: 'Maya suspected Marcus had stolen $40,000.', state: makeState('unknown'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'specific unsupported proposition with exact amount', epistemicLevel: 'SUSPECTED', propositionSpecificity: 'SPECIFIC_AMOUNT' },
  { id: 'A4', group: 'A', label: 'UNKNOWN + knew ($40k)', candidate: 'Maya knew Marcus had stolen $40,000.', state: makeState('unknown'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'explicit epistemic overreach — certainty about unknown fact', epistemicLevel: 'KNEW', propositionSpecificity: 'SPECIFIC_AMOUNT' },

  // === GROUP B — SUSPECTS state ===
  { id: 'B1', group: 'B', label: 'SUSPECTS + wondered (vague)', candidate: 'Maya wondered if Marcus had taken anything.', state: makeState('suspects'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'vague uncertainty — licensed', epistemicLevel: 'WONDERED', propositionSpecificity: 'VAGUE' },
  { id: 'B2', group: 'B', label: 'SUSPECTS + suspected (some money)', candidate: 'Maya suspected Marcus might have taken some money.', state: makeState('suspects'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'suspicion matches state (suspects he took money)', epistemicLevel: 'SUSPECTED', propositionSpecificity: 'SOME' },
  { id: 'B3', group: 'B', label: 'SUSPECTS + knew (overreach)', candidate: 'Maya knew Marcus had taken the money.', state: makeState('suspects'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'SUSPECTS must not become KNOWS — epistemic overreach', epistemicLevel: 'KNEW', propositionSpecificity: 'SPECIFIC_FACT' },
  { id: 'B4', group: 'B', label: 'SUSPECTS + knew ($40k exact)', candidate: 'Maya knew Marcus had stolen exactly $40,000.', state: makeState('suspects'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'certainty + exact specificity exceeds SUSPECTS state', epistemicLevel: 'KNEW', propositionSpecificity: 'SPECIFIC_AMOUNT' },

  // === GROUP C — KNOWS state ===
  { id: 'C1', group: 'C', label: 'KNOWS + wondered (vague)', candidate: 'Maya wondered if Marcus had taken anything.', state: makeState('knows'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'vague uncertainty — licensed (downgrade from KNOWS)', epistemicLevel: 'WONDERED', propositionSpecificity: 'VAGUE' },
  { id: 'C2', group: 'C', label: 'KNOWS + suspected (some money)', candidate: 'Maya suspected Marcus might have taken some money.', state: makeState('knows'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'downgrade to suspicion — safe when state=KNOWS', epistemicLevel: 'SUSPECTED', propositionSpecificity: 'SOME' },
  { id: 'C3', group: 'C', label: 'KNOWS + knew (the money)', candidate: 'Maya knew Marcus had taken the money.', state: makeState('knows'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'knowledge matches state', epistemicLevel: 'KNEW', propositionSpecificity: 'SPECIFIC_FACT' },
  { id: 'C4', group: 'C', label: 'KNOWS + knew ($40k, state has amount)', candidate: 'Maya knew Marcus had stolen $40,000.', state: makeState('knows', true), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'state explicitly contains $40,000 — number is state-supported', epistemicLevel: 'KNEW', propositionSpecificity: 'SPECIFIC_AMOUNT' },

  // === GROUP D — Vague affect / atmospheric (UNKNOWN state) ===
  { id: 'D1', group: 'D', label: 'UNKNOWN + vague affect (uneasy)', candidate: 'Something about Marcus made Maya uneasy.', state: makeState('unknown'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'vague affect — no specific proposition', epistemicLevel: 'VAGUE_AFFECT', propositionSpecificity: 'VAGUE' },
  { id: 'D2', group: 'D', label: 'UNKNOWN + vague sense (something wrong)', candidate: 'The conversation left Maya with a vague sense that something was wrong.', state: makeState('unknown'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'vague atmospheric sense — not a specific claim', epistemicLevel: 'VAGUE_AFFECT', propositionSpecificity: 'VAGUE' },
  { id: 'D3', group: 'D', label: 'UNKNOWN + wondered (missing something)', candidate: 'Maya wondered whether she was missing something.', state: makeState('unknown'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'explicit uncertainty — no specific proposition', epistemicLevel: 'WONDERED', propositionSpecificity: 'VAGUE' },

  // === GROUP E — Specific domain-level suspicion (UNKNOWN state) ===
  { id: 'E1', group: 'E', label: 'UNKNOWN + domain suspicion (finances)', candidate: 'Maya suspected something was wrong with the clinic finances.', state: makeState('unknown'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'specific domain suspicion without evidence — closer to leak than vague unease', epistemicLevel: 'DOMAIN_SUSPICION', propositionSpecificity: 'SPECIFIC_FACT' },
  { id: 'E2', group: 'E', label: 'UNKNOWN + domain suspicion (accounting)', candidate: 'Maya suspected the accounting records had been altered.', state: makeState('unknown'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'specific suspicion of a specific fact — unsupported', epistemicLevel: 'DOMAIN_SUSPICION', propositionSpecificity: 'SPECIFIC_FACT' },
  { id: 'E3', group: 'E', label: 'UNKNOWN + domain suspicion (transfer)', candidate: 'Maya suspected Marcus was involved in the transfer.', state: makeState('unknown'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'specific suspicion naming a person and an action — unsupported', epistemicLevel: 'DOMAIN_SUSPICION', propositionSpecificity: 'SPECIFIC_FACT' },

  // === NEAR-IDENTICAL PAIRS (same proposition, different epistemic level) ===
  { id: 'P1-W', group: 'PAIR', label: 'PAIR: wondered (SUSPECTS state)', candidate: 'Maya wondered whether Marcus had taken anything.', state: makeState('suspects'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'wondered — vague, licensed under SUSPECTS', epistemicLevel: 'WONDERED', propositionSpecificity: 'VAGUE' },
  { id: 'P1-S', group: 'PAIR', label: 'PAIR: suspected (SUSPECTS state)', candidate: 'Maya suspected Marcus had taken the money.', state: makeState('suspects'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'suspected — matches SUSPECTS state', epistemicLevel: 'SUSPECTED', propositionSpecificity: 'SPECIFIC_FACT' },
  { id: 'P1-K', group: 'PAIR', label: 'PAIR: knew (SUSPECTS state)', candidate: 'Maya knew Marcus had taken the money.', state: makeState('suspects'), policy: 'LICENSED_FICTION', expected: 'REJECT', reasoning: 'knew — overreach under SUSPECTS', epistemicLevel: 'KNEW', propositionSpecificity: 'SPECIFIC_FACT' },
  { id: 'P2-W', group: 'PAIR', label: 'PAIR: wondered (KNOWS state)', candidate: 'Maya wondered whether Marcus had taken anything.', state: makeState('knows'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'wondered — downgrade, licensed under KNOWS', epistemicLevel: 'WONDERED', propositionSpecificity: 'VAGUE' },
  { id: 'P2-K', group: 'PAIR', label: 'PAIR: knew (KNOWS state)', candidate: 'Maya knew Marcus had taken the money.', state: makeState('knows'), policy: 'LICENSED_FICTION', expected: 'ACCEPT', reasoning: 'knew — matches KNOWS state', epistemicLevel: 'KNEW', propositionSpecificity: 'SPECIFIC_FACT' },
];
