// triplets.ts — Iteration 4 controlled triplet benchmark.
// 18 triplets across 10 semantic classes. Each triplet has A (valid), B (invalid), C (ambiguous).
// Includes state-controlled and policy-controlled triplets.

import type { DocumentState } from './types.js';

export type InventionPolicy = 'NONE' | 'SOURCE_CONSTRAINED' | 'LICENSED_FICTION' | 'LIMITED_INFERENCE';

export interface TripletVariant {
  text: string;
  expected: 'ACCEPT' | 'REJECT' | 'UNCLEAR';
  reasoning: string;
}

export interface Triplet {
  id: string;
  semanticClass: string;
  basePassage: string;
  state: DocumentState;
  register: string;
  inventionPolicy: InventionPolicy;
  variantA: TripletVariant;   // valid
  variantB: TripletVariant;   // invalid
  variantC: TripletVariant;   // ambiguous
  reasoningBasis: string;
  isStateControlled?: boolean;  // same wording, different state
  isPolicyControlled?: boolean; // same text, different policy
}

// ---- Shared Maya state ----
const mayaBase = {
  identity: 'Maya Okafor — ICU night nurse, 34',
  goals: ['Get through the shift'],
  fears: ['Addiction relapse'],
  beliefs: ['Papa is dying'],
  memories: ['Papa teaching her to count by pill bottles', 'The cardamom-and-iron smell of Papa\'s pharmacy'],
  emotionalState: 'Controlled exhaustion',
  perceptualHabits: ['Counts IV drips', 'Smells rooms first', 'Reads dosage labels'],
  voice: 'Sparse, observational, uses numbers as anchors',
  currentKnowledge: ['Marcus handles finances', 'The clinic is struggling'],
};

const embezzlementState = (mayaKnows: 'unknown' | 'suspects' | 'knows'): DocumentState => ({
  character: { ...mayaBase, currentKnowledge: mayaKnows === 'knows' ? [...mayaBase.currentKnowledge, 'Marcus embezzled $40,000'] : mayaKnows === 'suspects' ? [...mayaBase.currentKnowledge, 'She saw a $40,000 discrepancy'] : mayaBase.currentKnowledge },
  informationOwnership: { entries: [{
    fact: 'Marcus embezzled $40,000 from the clinic over 18 months',
    knows: mayaKnows === 'knows' ? ['Marcus', 'Maya'] : ['Marcus'],
    suspects: mayaKnows === 'suspects' ? ['Maya'] : [],
    misunderstands: [],
    unknown: mayaKnows === 'unknown' ? ['Maya'] : [],
  }]},
  canon: { facts: [
    { content: 'Maya co-owns a clinic with Marcus', classification: 'HARD_CANON', source: 'ch1' },
    { content: 'Papa\'s house smells of cardamom and iron', classification: 'SOFT_CANON', source: 'ch1' },
  ]},
  deferredChecks: [],
  sceneId: 'triplet-scene',
  revisionId: 4,
});

// Helper: a passage where Maya observes Marcus at the desk
const marcusObservation = 'Marcus was at the desk. Maya watched him a moment, then went to check on her patient.';

// =====================================================================
// TRIPLETS 1-10: One per semantic class (the core benchmark)
// =====================================================================

export const triplets: Triplet[] = [
  // 1. SENSORY OBSERVATION
  {
    id: 'T1',
    semanticClass: 'sensory_observation',
    basePassage: 'Maya entered the kitchen.',
    state: { ...embezzlementState('unknown'), sceneId: 'T1' },
    register: 'fiction',
    inventionPolicy: 'LICENSED_FICTION',
    variantA: { text: 'Maya entered the kitchen. The scent of cardamom and iron hit her — Papa\'s pharmacy, distilled into the walls.', expected: 'ACCEPT', reasoning: 'State-supported (SOFT_CANON: cardamom and iron smell). Licensed sensory observation.' },
    variantB: { text: 'Maya entered the kitchen. The scent of burnt coffee and bleach filled the room — she could smell the embezzlement on him.', expected: 'REJECT', reasoning: 'Invented smell ("burnt coffee") + IO leak ("smell the embezzlement" — cannot perceive embezzlement as a scent).' },
    variantC: { text: 'Maya entered the kitchen. The room smelled faintly of something she could not place — old, familiar, almost medicinal.', expected: 'UNCLEAR', reasoning: 'Vague sensory detail that could be state-supported (cardamom/iron) or invented. Genuinely ambiguous.' },
    reasoningBasis: 'State-supported sensory detail (A) vs invented smell + IO leak (B) vs ambiguous vague sensory (C).',
  },

  // 2. VISIBLE BEHAVIOR
  {
    id: 'T2',
    semanticClass: 'visible_behavior',
    basePassage: marcusObservation,
    state: { ...embezzlementState('unknown'), sceneId: 'T2' },
    register: 'fiction',
    inventionPolicy: 'LICENSED_FICTION',
    variantA: { text: 'Marcus was at the desk, tapping his pen twice, three times. He would not meet her eyes. Maya watched him a moment, then went to check on her patient.', expected: 'ACCEPT', reasoning: 'Observable behavior (pen tapping, no eye contact). Licensed fictional observation.' },
    variantB: { text: 'Marcus was at the desk, hiding the ledger under his coat so Maya would not see the $40,000 discrepancy. Maya watched him a moment, then went to check on her patient.', expected: 'REJECT', reasoning: 'IO leak (Maya cannot know about the $40,000 discrepancy) + invented hidden action presented as observed.' },
    variantC: { text: 'Marcus was at the desk, his shoulders stiffening as he angled a document away from her. Maya watched him a moment, then went to check on her patient.', expected: 'UNCLEAR', reasoning: 'The "angling away" is observable, but implies Maya notices he is hiding something — borderline between observation and inference of concealment.' },
    reasoningBasis: 'Observable behavior (A) vs IO leak + invented hidden action (B) vs observable-but-implying-concealment (C).',
  },

  // 3. EMOTIONAL INFERENCE
  {
    id: 'T3',
    semanticClass: 'emotional_inference',
    basePassage: 'Tomás stood in the garden, his hands shaking.',
    state: { ...embezzlementState('unknown'), sceneId: 'T3' },
    register: 'fiction',
    inventionPolicy: 'LIMITED_INFERENCE',
    variantA: { text: 'Tomás stood in the garden, his hands shaking. Maya noticed he seemed uneasy.', expected: 'ACCEPT', reasoning: 'Observable (shaking hands) + reasonable inference ("seemed uneasy") under LIMITED_INFERENCE. No certainty claimed.' },
    variantB: { text: 'Tomás stood in the garden, his hands shaking. Maya knew he was terrified because he had helped Marcus hide the embezzled funds.', expected: 'REJECT', reasoning: 'IO leak (Maya cannot know Tomás helped Marcus) + certainty ("knew") about an unobservable emotional cause.' },
    variantC: { text: 'Tomás stood in the garden, his hands shaking. Maya wondered if something was wrong.', expected: 'ACCEPT', reasoning: 'Wondering is explicitly uncertain — licensed inference. (Adjusted from UNCLEAR because "wondered if" is clearly safe.)', },
    reasoningBasis: 'Reasonable inference (A) vs IO leak + certainty (B) vs explicit uncertainty (C — adjusted to ACCEPT because wondering is safe).',
  },

  // 4. MOTIVE INFERENCE
  {
    id: 'T4',
    semanticClass: 'motive_inference',
    basePassage: marcusObservation,
    state: { ...embezzlementState('unknown'), sceneId: 'T4' },
    register: 'fiction',
    inventionPolicy: 'LICENSED_FICTION',
    variantA: { text: 'Marcus was at the desk. He seemed distracted, glancing at the door as if expecting someone. Maya watched him a moment, then went to check on her patient.', expected: 'ACCEPT', reasoning: 'Observable behavior (glancing at door) + hedged inference ("as if expecting someone"). Licensed.' },
    variantB: { text: 'Marcus was at the desk. He was acting strangely because he wanted to cover his embezzlement before the audit. Maya watched him a moment, then went to check on her patient.', expected: 'REJECT', reasoning: 'IO leak (Maya cannot know the embezzlement or the audit motive). Private motive stated as fact.' },
    variantC: { text: 'Marcus was at the desk. There was something behind his eyes — a calculation, maybe, or a fear she could not name. Maya watched him a moment, then went to check on her patient.', expected: 'UNCLEAR', reasoning: 'Poetic/subjective description that could be observation or could imply Maya sees more than she should. Genuinely ambiguous.' },
    reasoningBasis: 'Hedged observable inference (A) vs IO leak + motive-as-fact (B) vs poetic ambiguous (C).',
  },

  // 5. MEMORY
  {
    id: 'T5',
    semanticClass: 'memory',
    basePassage: 'Maya thought about her childhood.',
    state: { ...embezzlementState('unknown'), sceneId: 'T5' },
    register: 'fiction',
    inventionPolicy: 'LICENSED_FICTION',
    variantA: { text: 'Maya thought about her childhood — Papa teaching her to count by pill bottles, the amber vials lining the wall of his pharmacy.', expected: 'ACCEPT', reasoning: 'State-supported memory (explicitly in memories: "Papa teaching her to count by pill bottles").' },
    variantB: { text: 'Maya thought about her childhood — the summer of 1998 when Papa first discovered Marcus was embezzling and said nothing about it.', expected: 'REJECT', reasoning: 'Invented memory + IO leak (Maya cannot know Papa discovered embezzlement) + invented date (1998).' },
    variantC: { text: 'Maya thought about her childhood — a summer she could barely remember, something involving Papa and the pharmacy that she had never quite understood.', expected: 'UNCLEAR', reasoning: 'Vague memory reference — could be state-supported or could be setting up an invented subplot. Ambiguous.' },
    reasoningBasis: 'State-supported memory (A) vs invented memory + IO leak + date (B) vs vague ambiguous memory (C).',
  },

  // 6. KNOWLEDGE (state-controlled: same wording, different state)
  {
    id: 'T6',
    semanticClass: 'knowledge',
    basePassage: marcusObservation,
    state: { ...embezzlementState('unknown'), sceneId: 'T6' },
    register: 'fiction',
    inventionPolicy: 'LICENSED_FICTION',
    variantA: { text: 'Marcus was at the desk. Maya watched him a moment, suspecting something was off with the finances — the discrepancy she had found still nagged at her. She went to check on her patient.', expected: 'REJECT', reasoning: 'State=UNKNOWN. Even suspicion about "finances" is unsupported when Maya has seen no discrepancy. (A is REJECT here because the state is UNKNOWN.)', },
    variantB: { text: 'Marcus was at the desk. Maya watched him a moment, knowing he had embezzled forty thousand dollars from the clinic. She went to check on her patient.', expected: 'REJECT', reasoning: 'State=UNKNOWN. Certainty about the embezzlement is a leak.' },
    variantC: { text: 'Marcus was at the desk. Maya watched him a moment, then went to check on her patient. Something about him bothered her, though she could not say what.', expected: 'ACCEPT', reasoning: 'Vague unease — no specific knowledge claimed. Licensed under fiction.' },
    reasoningBasis: 'State=UNKNOWN. Tests whether validator rejects both suspicion-about-finances (A, no basis) and certainty (B) while accepting vague unease (C).',
    isStateControlled: true,
  },

  // 7. CAUSAL INFERENCE
  {
    id: 'T7',
    semanticClass: 'causal_inference',
    basePassage: 'The clinic\'s bank statement showed a lower balance than expected.',
    state: { ...embezzlementState('unknown'), sceneId: 'T7' },
    register: 'fiction',
    inventionPolicy: 'LIMITED_INFERENCE',
    variantA: { text: 'The clinic\'s bank statement showed a lower balance than expected. Maya frowned — the numbers did not match what she had seen last month.', expected: 'ACCEPT', reasoning: 'Observable (lower balance) + reasonable comparison (last month). Licensed inference.' },
    variantB: { text: 'The clinic\'s bank statement showed a lower balance than expected because Marcus had diverted forty thousand dollars to an offshore account.', expected: 'REJECT', reasoning: 'IO leak (Maya cannot know the cause or the offshore account) + invented specific ($40,000, offshore). Causal assertion as fact.' },
    variantC: { text: 'The clinic\'s bank statement showed a lower balance than expected. Maya wondered if someone had made an error — or something worse.', expected: 'ACCEPT', reasoning: 'Wondering is explicitly uncertain. Licensed inference under LIMITED_INFERENCE. (Adjusted to ACCEPT — wondering is safe.)' },
    reasoningBasis: 'Reasonable comparison (A) vs IO leak + causal-as-fact (B) vs explicit uncertainty (C).',
  },

  // 8. QUANTIFICATION
  {
    id: 'T8',
    semanticClass: 'quantification',
    basePassage: 'Maya counted the IV drips in Room 4.',
    state: { ...embezzlementState('unknown'), sceneId: 'T8' },
    register: 'fiction',
    inventionPolicy: 'LICENSED_FICTION',
    variantA: { text: 'Maya counted the IV drips in Room 4 — four, as always.', expected: 'ACCEPT', reasoning: 'State-supported (perceptualHabits: "Counts the IV drips" + currentKnowledge: "Room 4 is her usual assignment" + "four IV drips" in habit). The number four is supported.' },
    variantB: { text: 'Maya counted the IV drips in Room 4 — one hundred and twenty-seven drips, each one a reminder of the forty thousand dollars Marcus had stolen.', expected: 'REJECT', reasoning: 'Invented quantity (127) + IO leak (forty thousand dollars, state=UNKNOWN).' },
    variantC: { text: 'Maya counted the IV drips in Room 4 — a few more than usual, she thought.', expected: 'UNCLEAR', reasoning: 'Vague quantification ("a few more") — could be licensed observation or could imply a specific unsupported count. Ambiguous.' },
    reasoningBasis: 'State-supported number (A, four) vs invented number + IO leak (B, 127 + $40k) vs vague quantification (C).',
  },

  // 9. IDENTITY
  {
    id: 'T9',
    semanticClass: 'identity',
    basePassage: 'A man Maya had never seen walked into the clinic.',
    state: { ...embezzlementState('unknown'), sceneId: 'T9' },
    register: 'fiction',
    inventionPolicy: 'LICENSED_FICTION',
    variantA: { text: 'A man Maya had never seen walked into the clinic. He was tall, with gray hair and a guarded expression. She did not recognize him.', expected: 'ACCEPT', reasoning: 'Observable physical description + explicit non-recognition. Licensed observation.' },
    variantB: { text: 'A man Maya had never seen walked into the clinic — it was David Chen, Marcus\'s accomplice, the one who had helped launder the embezzled funds.', expected: 'REJECT', reasoning: 'IO leak (Maya cannot know the identity, the accomplice role, or the laundering). Identity stated as fact.' },
    variantC: { text: 'A man Maya had never seen walked into the clinic. There was something familiar about his gait, though she could not place it.', expected: 'UNCLEAR', reasoning: 'Borderline — "something familiar" implies partial recognition without identifying. Could be licensed subjective impression or could be setting up an unsupported recognition. Ambiguous.' },
    reasoningBasis: 'Observable description + non-recognition (A) vs IO leak + identity-as-fact (B) vs borderline recognition (C).',
  },

  // 10. TEMPORAL KNOWLEDGE
  {
    id: 'T10',
    semanticClass: 'temporal_knowledge',
    basePassage: 'Maya checked the clock.',
    state: { ...embezzlementState('unknown'), sceneId: 'T10' },
    register: 'fiction',
    inventionPolicy: 'LICENSED_FICTION',
    variantA: { text: 'Maya checked the clock. Her shift was almost over.', expected: 'ACCEPT', reasoning: 'Vague temporal reference (no specific time). Licensed.' },
    variantB: { text: 'Maya checked the clock — 4:15 AM. In exactly 47 minutes, Marcus would confess to the embezzlement and the clinic would be shut down.', expected: 'REJECT', reasoning: 'Invented specific time (4:15 AM) + future-event leak (Marcus will confess) + IO leak (embezzlement).' },
    variantC: { text: 'Maya checked the clock. It was late — later than she thought. The night had gotten away from her.', expected: 'ACCEPT', reasoning: 'Vague temporal ("late") — licensed. (Adjusted to ACCEPT — vague temporal is safe.)' },
    reasoningBasis: 'Vague temporal (A) vs invented time + future leak (B) vs vague temporal (C — adjusted to ACCEPT).',
  },
];

// =====================================================================
// STATE-CONTROLLED TRIPLET: same wording, different state (T6 already is one; add T11)
// =====================================================================
export const stateControlledTriplets: Triplet[] = [
  {
    id: 'T11-UNKNOWN',
    semanticClass: 'knowledge_state_controlled',
    basePassage: marcusObservation,
    state: { ...embezzlementState('unknown'), sceneId: 'T11-UNKNOWN' },
    register: 'fiction',
    inventionPolicy: 'LICENSED_FICTION',
    variantA: { text: 'Maya knew Marcus had embezzled forty thousand dollars from the clinic.', expected: 'REJECT', reasoning: 'State=UNKNOWN. Certainty is a leak. (This is the "B" variant — testing that the validator rejects.)', },
    variantB: { text: 'Maya watched him, then went to check on her patient. Something about him bothered her.', expected: 'ACCEPT', reasoning: 'Vague unease — no knowledge claimed. Licensed.' },
    variantC: { text: 'Maya suspected something was wrong with the clinic\'s finances.', expected: 'REJECT', reasoning: 'State=UNKNOWN. Suspicion about finances is unsupported (no discrepancy seen).' },
    reasoningBasis: 'State=UNKNOWN. Same certainty wording as T11-KNOWS. Tests state-reading.',
    isStateControlled: true,
  },
  {
    id: 'T11-SUSPECTS',
    semanticClass: 'knowledge_state_controlled',
    basePassage: marcusObservation,
    state: { ...embezzlementState('suspects'), sceneId: 'T11-SUSPECTS' },
    register: 'fiction',
    inventionPolicy: 'LICENSED_FICTION',
    variantA: { text: 'Maya knew Marcus had embezzled forty thousand dollars from the clinic.', expected: 'REJECT', reasoning: 'State=SUSPECTS. Certainty is still a leak — suspicion cannot be upgraded to knowledge.' },
    variantB: { text: 'Maya suspected something was wrong with the clinic\'s finances — the discrepancy she had found still nagged at her.', expected: 'ACCEPT', reasoning: 'State=SUSPECTS. Suspicion matches state.' },
    variantC: { text: 'Maya watched him, wondering if the discrepancy she had seen meant something worse.', expected: 'ACCEPT', reasoning: 'Wondering — explicitly uncertain. Matches SUSPECTS state.' },
    reasoningBasis: 'State=SUSPECTS. Certainty (A) still REJECT; suspicion (B) now ACCEPT; wondering (C) ACCEPT.',
    isStateControlled: true,
  },
  {
    id: 'T11-KNOWS',
    semanticClass: 'knowledge_state_controlled',
    basePassage: marcusObservation,
    state: { ...embezzlementState('knows'), sceneId: 'T11-KNOWS' },
    register: 'fiction',
    inventionPolicy: 'LICENSED_FICTION',
    variantA: { text: 'Maya knew Marcus had embezzled forty thousand dollars from the clinic.', expected: 'ACCEPT', reasoning: 'State=KNOWS. Certainty is now supported. (The SC-3A case from Iteration 3.)' },
    variantB: { text: 'Maya suspected Marcus might have taken some money.', expected: 'ACCEPT', reasoning: 'State=KNOWS. Downgrading to suspicion is still safe (though odd).' },
    variantC: { text: 'Maya watched him, the forty thousand dollars a weight between them now.', expected: 'ACCEPT', reasoning: 'State=KNOWS. Reference to the known fact is supported.' },
    reasoningBasis: 'State=KNOWS. Same certainty wording as T11-UNKNOWN. Tests that validator consults state.',
    isStateControlled: true,
  },
];

// =====================================================================
// POLICY-CONTROLLED TRIPLET: same text, different inventionPolicy
// =====================================================================
const policyTestText = 'Maya entered the kitchen. The corridor smelled faintly of rain.';
const policyTestOriginal = 'Maya entered the kitchen.';
const policyTestState: DocumentState = {
  character: { ...mayaBase, currentKnowledge: [] },
  informationOwnership: { entries: [] },
  canon: { facts: [{ content: 'Papa\'s house smells of cardamom and iron', classification: 'SOFT_CANON', source: 'ch1' }] },
  deferredChecks: [],
  sceneId: 'T12',
  revisionId: 4,
};

export const policyControlledTriplets: Triplet[] = [
  {
    id: 'T12-NONE',
    semanticClass: 'policy_controlled',
    basePassage: policyTestOriginal,
    state: policyTestState,
    register: 'fiction',
    inventionPolicy: 'NONE',
    variantA: { text: policyTestText, expected: 'REJECT', reasoning: 'Policy=NONE: no invention allowed. "Smelled of rain" is invented sensory detail. Must be rejected.' },
    variantB: { text: 'Maya entered the kitchen.', expected: 'ACCEPT', reasoning: 'Policy=NONE: no invention — only the original.' },
    variantC: { text: 'Maya entered the kitchen. The kitchen was there.', expected: 'ACCEPT', reasoning: 'Policy=NONE: tautological, no invention.' },
    reasoningBasis: 'Policy=NONE. "Smelled of rain" must be rejected.',
    isPolicyControlled: true,
  },
  {
    id: 'T12-SOURCE',
    semanticClass: 'policy_controlled',
    basePassage: policyTestOriginal,
    state: policyTestState,
    register: 'fiction',
    inventionPolicy: 'SOURCE_CONSTRAINED',
    variantA: { text: policyTestText, expected: 'REJECT', reasoning: 'Policy=SOURCE_CONSTRAINED: only source-supported info. "Smelled of rain" is not in source or state. Rejected.' },
    variantB: { text: 'Maya entered the kitchen. The kitchen smelled of cardamom and iron.', expected: 'ACCEPT', reasoning: 'Policy=SOURCE_CONSTRAINED: cardamom and iron is SOFT_CANON — source/state-supported.' },
    variantC: { text: 'Maya entered the kitchen. The air was still.', expected: 'UNCLEAR', reasoning: 'Policy=SOURCE_CONSTRAINED: "air was still" is vague — borderline. Not clearly source-supported.' },
    reasoningBasis: 'Policy=SOURCE_CONSTRAINED. Cardamom (state) ACCEPT; rain (invented) REJECT; vague (unclear).',
    isPolicyControlled: true,
  },
  {
    id: 'T12-LICENSED',
    semanticClass: 'policy_controlled',
    basePassage: policyTestOriginal,
    state: policyTestState,
    register: 'fiction',
    inventionPolicy: 'LICENSED_FICTION',
    variantA: { text: policyTestText, expected: 'ACCEPT', reasoning: 'Policy=LICENSED_FICTION: sensory invention is licensed. "Smelled of rain" is ordinary fictional observation. ACCEPT (does not violate POV/canon/state).' },
    variantB: { text: 'Maya entered the kitchen. The kitchen smelled of cardamom and iron.', expected: 'ACCEPT', reasoning: 'Policy=LICENSED_FICTION: state-supported sensory. ACCEPT.' },
    variantC: { text: 'Maya entered the kitchen. The room smelled of the forty thousand dollars Marcus had stolen.', expected: 'REJECT', reasoning: 'Policy=LICENSED_FICTION does NOT authorize IO leaks. "Smell of $40k stolen" is an IO violation regardless of policy.' },
    reasoningBasis: 'Policy=LICENSED_FICTION. Rain (licensed invention) ACCEPT; cardamom (state) ACCEPT; IO leak (C) still REJECT.',
    isPolicyControlled: true,
  },
  {
    id: 'T12-INFERENCE',
    semanticClass: 'policy_controlled',
    basePassage: policyTestOriginal,
    state: policyTestState,
    register: 'fiction',
    inventionPolicy: 'LIMITED_INFERENCE',
    variantA: { text: policyTestText, expected: 'ACCEPT', reasoning: 'Policy=LIMITED_INFERENCE: sensory invention + plausible inference allowed. "Smelled of rain" is licensed.' },
    variantB: { text: 'Maya entered the kitchen. The corridor smelled of rain — a storm must be coming.', expected: 'ACCEPT', reasoning: 'Policy=LIMITED_INFERENCE: "a storm must be coming" is a plausible inference from the smell of rain. Licensed.' },
    variantC: { text: 'Maya entered the kitchen. The corridor smelled of rain, which meant Marcus would be in a bad mood and likely to confess.', expected: 'REJECT', reasoning: 'Policy=LIMITED_INFERENCE does not authorize unsupported causal chains or future-event leaks.' },
    reasoningBasis: 'Policy=LIMITED_INFERENCE. Sensory (A) ACCEPT; plausible inference (B) ACCEPT; unsupported causal chain (C) REJECT.',
    isPolicyControlled: true,
  },
];

// =====================================================================
// ADDITIONAL TRIPLETS to reach 18+ total
// =====================================================================
export const additionalTriplets: Triplet[] = [
  // 13. Canon contradiction (cleaner test)
  {
    id: 'T13',
    semanticClass: 'canon_contradiction',
    basePassage: 'Arlo entered the studio.',
    state: {
      character: { identity: 'Arlo Vance — blind sound engineer', goals: [], fears: [], beliefs: [], memories: [], emotionalState: '', perceptualHabits: ['Maps spaces by echo'], voice: 'precise about sound', currentKnowledge: [] },
      informationOwnership: { entries: [] },
      canon: { facts: [{ content: 'Arlo is totally blind', classification: 'HARD_CANON', source: 'ch1' }] },
      deferredChecks: [],
      sceneId: 'T13', revisionId: 4,
    },
    register: 'fiction',
    inventionPolicy: 'LICENSED_FICTION',
    variantA: { text: 'Arlo entered the studio. The floor hummed under his feet — a low, resonant vibration he had learned to read like a map.', expected: 'ACCEPT', reasoning: 'Tactile/auditory observation. Consistent with blind canon. Licensed.' },
    variantB: { text: 'Arlo entered the studio. He looked around at the mixing board, noting the blue glow of the LEDs and the red indicator lights.', expected: 'REJECT', reasoning: 'Canon violation: blind character using visual perception (looked, noting glow/colors).' },
    variantC: { text: 'Arlo entered the studio. The air felt blue to him — a color he remembered from before.', expected: 'UNCLEAR', reasoning: 'Synesthetic/metaphorical use of "blue" — could be licensed literary description or could imply visual memory. Genuinely ambiguous.' },
    reasoningBasis: 'Non-visual observation (A) vs canon violation (B, visual) vs synesthetic ambiguity (C).',
  },
  // 14. Deferred mechanism
  {
    id: 'T14',
    semanticClass: 'deferred_mechanism',
    basePassage: 'Maya paused at the garden bench.',
    state: {
      ...embezzlementState('unknown'),
      sceneId: 'T14',
      deferredChecks: [{ id: 'DC-1', type: 'foreshadowing', anchorSpan: 'the gardener had left a trowel on the bench', setupSummary: 'Trowel clue', status: 'DEFERRED' as const }],
    },
    register: 'fiction',
    inventionPolicy: 'LICENSED_FICTION',
    variantA: { text: 'Maya paused at the garden bench. A trowel sat on the wood, left there by someone. She did not pick it up.', expected: 'UNCLEAR', reasoning: 'References the deferred anchor (trowel on bench). Should DEFER, not resolve. (Adjusted: the validator should at minimum not resolve it.)', },
    variantB: { text: 'Maya paused at the garden bench. The trowel was a signal from Tomás — he had left it to warn her about Marcus\'s embezzlement.', expected: 'REJECT', reasoning: 'Resolves the deferred mechanism (explains the trowel) + IO leak (embezzlement).' },
    variantC: { text: 'Maya paused at the garden bench. Something about the trowel bothered her, though she could not say why.', expected: 'ACCEPT', reasoning: 'References the trowel without resolving it. Licensed vague unease.' },
    reasoningBasis: 'Reference without resolution (A — adjusted to UNCLEAR to test deferral) vs resolution (B, REJECT) vs vague unease (C, ACCEPT).',
  },
  // 15. Unsupported specific in nonfiction-style context
  {
    id: 'T15',
    semanticClass: 'unsupported_specific',
    basePassage: 'The patient was stable.',
    state: { ...embezzlementState('unknown'), sceneId: 'T15' },
    register: 'fiction',
    inventionPolicy: 'LICENSED_FICTION',
    variantA: { text: 'The patient was stable. Maya noted the readings on the monitor and moved on.', expected: 'ACCEPT', reasoning: 'No specific numbers invented. Vague reference to readings. Licensed.' },
    variantB: { text: 'The patient was stable — vitals 98.6°F, heart rate 72, blood pressure 120/80, on 1000ml of normal saline.', expected: 'REJECT', reasoning: 'Invented medical specifics (98.6, 72, 120/80, 1000ml). Not in source or state.' },
    variantC: { text: 'The patient was stable. The monitor showed numbers within normal range.', expected: 'ACCEPT', reasoning: 'Vague reference ("within normal range") — no specific invented numbers. Licensed. (Adjusted to ACCEPT — vague is safe.)' },
    reasoningBasis: 'Vague reference (A) vs invented specifics (B) vs vague range (C — ACCEPT).',
  },
];

export const allTriplets: Triplet[] = [...triplets, ...stateControlledTriplets, ...policyControlledTriplets, ...additionalTriplets];
