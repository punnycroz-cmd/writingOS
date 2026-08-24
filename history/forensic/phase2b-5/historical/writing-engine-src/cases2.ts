// cases2.ts — Iteration 2 test matrix.
// 14 cases covering: positive-path accept, info-ownership leak, canon, deferred,
// intentional genericity, temporal state, overblocking, stylistic specificity.
// State is richer than v1 so the generator has state-supported specifics to draw on
// (the v1 failure was that state said "counts objects" but gave no specific objects).

import type { DocumentState, StateTransition } from './types.js';

export interface TestCase2 {
  id: string;
  label: string;
  category: string;          // for the matrix
  purpose: string;
  expected: string;          // expected outcome
  passage: string;
  state: DocumentState;
  priorTransitions?: StateTransition[];
}

// ---- Maya base, enriched with SPECIFIC supported details ----
// The v1 state was too abstract ("counts objects"). v2 gives concrete objects
// from her memories/habits so the generator can be specific without inventing.
const mayaBase = {
  identity: 'Maya Okafor — ICU night nurse, 34, sole caregiver to her dying father',
  goals: ['Get through the shift without breaking down', 'Keep Papa comfortable'],
  fears: ['Finding Papa dead when she gets home', 'Addiction relapse'],
  beliefs: ['Papa is dying and nothing she does will stop it'],
  memories: [
    'Papa teaching her to count by pill bottles when she was six — his pharmacy had a wall of amber vials',
    'The cardamom-and-iron smell of Papa\'s pharmacy back room',
    'Her own detox 4 years ago — the metallic taste of withdrawal',
  ],
  emotionalState: 'Controlled exhaustion',
  perceptualHabits: [
    'Counts the IV drips in any room (ICU habit) — there are always four in Room 4',
    'Smells rooms first (clinical training + scent-memory of Papa\'s pharmacy)',
    'Reads dosage labels automatically',
  ],
  voice: 'Sparse, observational, avoids emotional adjectives, uses numbers as anchors',
};

// =====================================================================
// POSITIVE PATH #1 — generic passage, state-supported intervention should ACCEPT
// =====================================================================
export const P1: TestCase2 = {
  id: 'P1',
  label: 'Safe positive intervention (perception from state)',
  category: 'positive_path',
  purpose: 'A generic passage where the state supplies concrete, usable specifics (four IV drips, the cardamom smell). A state-supported intervention should be generated and ACCEPTED.',
  expected: 'GENERIC → MATERIAL → TARGETED_REWRITE → validation PASS → ACCEPT. No invented specifics.',
  passage: 'Maya went into Room 4. She did her check. Everything was fine, she thought. She would come back later.',
  state: {
    character: { ...mayaBase, currentKnowledge: ['Room 4 is her usual assignment', 'Papa is in hospice at home'] },
    informationOwnership: { entries: [
      { fact: 'Papa has fewer than 48 hours to live', knows: ['Maya'], suspects: [], misunderstands: [], unknown: ['Papa'] },
    ]},
    canon: { facts: [
      { content: 'Maya is an ICU nurse', classification: 'HARD_CANON', source: 'character bible' },
      { content: 'Maya counts objects compulsively', classification: 'HARD_CANON', source: 'character bible' },
    ]},
    deferredChecks: [],
    sceneId: 'ch3-scene2',
    revisionId: 2,
  },
};

// =====================================================================
// POSITIVE PATH #2 — sensory detail from state memory
// =====================================================================
export const P2: TestCase2 = {
  id: 'P2',
  label: 'Safe positive intervention (sensory memory)',
  category: 'positive_path',
  purpose: 'A generic passage about entering Papa\'s house. The state supplies the cardamom-and-iron smell memory. Intervention should use it and ACCEPT.',
  expected: 'GENERIC → MATERIAL → TARGETED_REWRITE → validation PASS → ACCEPT.',
  passage: 'Maya put her key in the door of Papa\'s house. She stepped inside. It was quiet. She stood there for a moment.',
  state: {
    character: { ...mayaBase, currentKnowledge: ['Papa is in hospice at home'] },
    informationOwnership: { entries: [] },
    canon: { facts: [
      { content: 'Papa\'s house smells of cardamom and iron (pharmacy back room)', classification: 'SOFT_CANON', source: 'ch1' },
      { content: 'Maya smells rooms first', classification: 'HARD_CANON', source: 'character bible' },
    ]},
    deferredChecks: [],
    sceneId: 'ch3-scene4',
    revisionId: 2,
  },
};

// =====================================================================
// NEGATIVE — unsafe invented specificity (like v1 Case A, rerun)
// =====================================================================
export const N1: TestCase2 = {
  id: 'N1',
  label: 'Unsafe invented specificity',
  category: 'negative_path',
  purpose: 'A generic passage where the tempting specifics are NOT in state. Generator may invent; validator must block.',
  expected: 'GENERIC → MATERIAL → intervention attempted → [CC] flags unsupported specifics → validation REJECT → BLOCK_INTERVENTION.',
  passage: 'Maya looked at the patient. She felt something about the situation. She would handle it. The shift would end eventually.',
  state: {
    character: { ...mayaBase, currentKnowledge: [] },
    informationOwnership: { entries: [] },
    canon: { facts: [{ content: 'Maya is an ICU nurse', classification: 'HARD_CANON', source: 'character bible' }] },
    deferredChecks: [],
    sceneId: 'ch3-scene5',
    revisionId: 2,
  },
};

// =====================================================================
// INFO-OWNERSHIP LEAK #1 — Maya does not know about embezzlement
// =====================================================================
// The passage is generic AND the obvious specificity is the hidden fact.
export const IO1: TestCase2 = {
  id: 'IO1',
  label: 'Information-ownership leak (embezzlement)',
  category: 'info_ownership',
  purpose: 'Maya does NOT know Marcus embezzled. The passage is generic about his behavior. The tempting specificity is the embezzlement. Intervention must use only observable evidence, NOT the cause. If the generator leaks, validator must REJECT.',
  expected: 'GENERIC → MATERIAL → intervention attempted → validation infoOwnership FAIL → BLOCK_INTERVENTION (if leak) OR ACCEPT with observable-only specifics.',
  passage: 'Marcus came into the office. He seemed off. Maya figured he was just tired and went back to her charts.',
  state: {
    character: { ...mayaBase, currentKnowledge: ['Marcus handles the clinic finances', 'The clinic is struggling'] },
    informationOwnership: { entries: [
      { fact: 'Marcus embezzled $40,000 from the clinic over 18 months', knows: ['Marcus'], suspects: [], misunderstands: [], unknown: ['Maya'] },
    ]},
    canon: { facts: [
      { content: 'Maya co-owns a clinic with Marcus', classification: 'HARD_CANON', source: 'ch1' },
      { content: 'Maya is not financially literate', classification: 'SOFT_CANON', source: 'ch2' },
    ]},
    deferredChecks: [],
    sceneId: 'ch5-scene2',
    revisionId: 2,
  },
};

// =====================================================================
// INFO-OWNERSHIP LEAK #2 — character does not know a patient's diagnosis
// =====================================================================
export const IO2: TestCase2 = {
  id: 'IO2',
  label: 'Information-ownership leak (patient diagnosis)',
  category: 'info_ownership',
  purpose: 'Maya does NOT know a patient\'s terminal diagnosis (the attending hasn\'t told her). She observes symptoms. The tempting specificity is the diagnosis. Intervention must use only observable symptoms.',
  expected: 'GENERIC → MATERIAL → intervention attempted → validation infoOwnership FAIL if diagnosis leaks, else ACCEPT with observable-only specifics.',
  passage: 'Maya looked in on the new patient, Mr. Vance. He looked bad. She adjusted his fluids and moved on.',
  state: {
    character: { ...mayaBase, currentKnowledge: ['Mr. Vance was admitted last night', 'He is in Room 7'] },
    informationOwnership: { entries: [
      { fact: 'Mr. Vance has terminal pancreatic cancer (attending knows; Maya has not been told)', knows: ['Dr. Reyes', 'Mr. Vance'], suspects: [], misunderstands: [], unknown: ['Maya'] },
    ]},
    canon: { facts: [
      { content: 'Maya is an ICU nurse', classification: 'HARD_CANON', source: 'character bible' },
    ]},
    deferredChecks: [],
    sceneId: 'ch5-scene6',
    revisionId: 2,
  },
};

// =====================================================================
// CANON VIOLATION (rerun of v1 Case E with deterministic canon alert)
// =====================================================================
export const CV1: TestCase2 = {
  id: 'CV1',
  label: 'Canon violation (blind character sees)',
  category: 'canon',
  purpose: 'Arlo (blind, HARD_CANON) described as seeing. The [CC] canon-keyword alert should fire; detection should classify CANON_VIOLATION; severity CRITICAL; REJECT_AND_FLAG.',
  expected: 'CANON_VIOLATION → CRITICAL → REJECT_AND_FLAG. [CC] canon alert fires.',
  passage: 'Arlo walked into the unfamiliar room. He looked around at the furniture, noting the deep crimson of the curtains. It was a pleasant space, he thought.',
  state: {
    character: {
      identity: 'Arlo Vance — blind sound engineer, 52',
      goals: ['Map the new studio acoustically'],
      fears: ['Being treated as helpless'],
      beliefs: ['Sound reveals everything sight hides'],
      memories: ['Losing his sight at 19'],
      emotionalState: 'Wary but focused',
      perceptualHabits: ['Maps spaces by echo', 'Tracks footsteps and fabric sounds'],
      voice: 'Precise about sound, avoids visual metaphors',
      currentKnowledge: ['First day at the new studio'],
    },
    informationOwnership: { entries: [] },
    canon: { facts: [
      { content: 'Arlo is totally blind', classification: 'HARD_CANON', source: 'ch1' },
    ]},
    deferredChecks: [],
    sceneId: 'ch2-scene1',
    revisionId: 2,
  },
};

// =====================================================================
// INTENTIONALLY GENERIC (rerun of v1 Case C)
// =====================================================================
export const IG1: TestCase2 = {
  id: 'IG1',
  label: 'Intentionally generic (depersonalization)',
  category: 'intentional_generic',
  purpose: 'The genericity is the narrative point. Must PRESERVE, not intervene.',
  expected: 'INTENTIONALLY_GENERIC → NONE → ACCEPT_UNCHANGED.',
  passage: 'The morning moved the way mornings do. Light came through the window. There was a cup, and there was coffee in it. She was a person doing the things a person does.',
  state: {
    character: { ...mayaBase, currentKnowledge: [] },
    informationOwnership: { entries: [] },
    canon: { facts: [{ content: 'Maya experiences depersonalization under grief load', classification: 'SOFT_CANON', source: 'ch2' }] },
    deferredChecks: [],
    sceneId: 'ch4-scene1',
    revisionId: 2,
  },
};

// =====================================================================
// DEFERRED — known anchor present (rerun of v1 Case F with [CC] pre-pass)
// =====================================================================
export const DF1: TestCase2 = {
  id: 'DF1',
  label: 'Known deferred anchor present (trowel)',
  category: 'deferred',
  purpose: 'The trowel is a planted clue. The [CC] deferred-anchor pre-pass should find the exact substring match and force DEFERRED_CONTEXT. v1 failed here; v1 fix is the deterministic pre-pass.',
  expected: '[CC] DEFERRED_ANCHOR_PRESENT → forced DEFERRED_CONTEXT → NONE → DEFER.',
  passage: 'On her way out, Maya noticed the gardener had left a trowel on the bench. Odd, but she was late. She set down her keys beside it and didn\'t pick either of them up.',
  state: {
    character: { ...mayaBase, currentKnowledge: ['The gardener is named Tomás', 'Tomás is meticulous about his tools'] },
    informationOwnership: { entries: [
      { fact: 'Tomás left the trowel deliberately as a signal', knows: ['Tomás'], suspects: [], misunderstands: [], unknown: ['Maya'] },
    ]},
    canon: { facts: [
      { content: 'Tomás is the clinic gardener', classification: 'HARD_CANON', source: 'ch1' },
    ]},
    deferredChecks: [
      { id: 'DC-1', type: 'foreshadowing', anchorSpan: 'the gardener had left a trowel on the bench', setupSummary: 'Trowel left in unusual place; Maya sets keys beside it.', status: 'DEFERRED' },
    ],
    sceneId: 'ch6-scene4',
    revisionId: 2,
  },
};

// =====================================================================
// DEFERRED — no relevance (a passage with no deferred overlap)
// =====================================================================
export const DF2: TestCase2 = {
  id: 'DF2',
  label: 'No deferred relevance (false-positive guard)',
  category: 'deferred',
  purpose: 'A passage that does NOT overlap any deferred anchor. The [CC] pre-pass should return NO_DEFERRED_RELEVANCE; detection should proceed normally. Tests that the pre-pass does not over-defer.',
  expected: '[CC] NO_DEFERRED_RELEVANCE → normal detection.',
  passage: 'Maya filled the coffee maker and watched it brew. She thought about calling Papa\'s nurse for an update, then decided to wait until her break.',
  state: {
    character: { ...mayaBase, currentKnowledge: ['Papa is in hospice at home'] },
    informationOwnership: { entries: [] },
    canon: { facts: [{ content: 'Maya is an ICU nurse', classification: 'HARD_CANON', source: 'character bible' }] },
    deferredChecks: [
      { id: 'DC-1', type: 'foreshadowing', anchorSpan: 'the gardener had left a trowel on the bench', setupSummary: 'Trowel clue.', status: 'DEFERRED' },
    ],
    sceneId: 'ch6-scene5',
    revisionId: 2,
  },
};

// =====================================================================
// DEFERRED — paraphrased anchor (tests POSSIBLY_RELATED)
// =====================================================================
export const DF3: TestCase2 = {
  id: 'DF3',
  label: 'Paraphrased deferred anchor',
  category: 'deferred',
  purpose: 'The passage references the trowel clue but in different words (paraphrase). The [CC] pre-pass should find POSSIBLY_RELATED via token/n-gram overlap; detection should be hinted toward DEFERRED_CONTEXT.',
  expected: '[CC] DEFERRED_ANCHOR_POSSIBLY_RELATED → detection hinted → likely DEFERRED_CONTEXT.',
  passage: 'Maya paused at the garden bench where Tomás\'s small spade sat waiting, beside her own set of keys. She did not pick them up.',
  state: {
    character: { ...mayaBase, currentKnowledge: ['Tomás is the gardener'] },
    informationOwnership: { entries: [
      { fact: 'Tomás left the trowel deliberately as a signal', knows: ['Tomás'], suspects: [], misunderstands: [], unknown: ['Maya'] },
    ]},
    canon: { facts: [{ content: 'Tomás is the clinic gardener', classification: 'HARD_CANON', source: 'ch1' }] },
    deferredChecks: [
      { id: 'DC-1', type: 'foreshadowing', anchorSpan: 'the gardener had left a trowel on the bench', setupSummary: 'Trowel clue.', status: 'DEFERRED' },
    ],
    sceneId: 'ch6-scene6',
    revisionId: 2,
  },
};

// =====================================================================
// TEMPORAL STATE — multi-scene (Scenes 1-4). Maya gradually learns about embezzlement.
// Each scene is a separate case (T1a, T1b, T1c, T1d) with state transitions applied.
// =====================================================================
export const embezzlementFact = 'Marcus embezzled $40,000 from the clinic over 18 months';

// Scene 1: Maya does NOT know. Generic passage about Marcus. Intervention leaking would be blocked.
export const T1a: TestCase2 = {
  id: 'T1a',
  label: 'Temporal scene 1 — before knowledge (restricted)',
  category: 'temporal_state',
  purpose: 'Maya does not know about embezzlement. A passage about Marcus\'s behavior. If intervention attempts to reference the embezzlement, validator must block (infoOwnership).',
  expected: 'Intervention blocked if it leaks embezzlement; observable-only specifics accepted.',
  passage: 'Marcus was acting strange at the desk. Maya watched him a moment, then went to check on her patient.',
  state: {
    character: { ...mayaBase, currentKnowledge: ['Marcus handles finances', 'The clinic is struggling'] },
    informationOwnership: { entries: [
      { fact: embezzlementFact, knows: ['Marcus'], suspects: [], misunderstands: [], unknown: ['Maya'] },
    ]},
    canon: { facts: [{ content: 'Maya co-owns a clinic with Marcus', classification: 'HARD_CANON', source: 'ch1' }] },
    deferredChecks: [],
    sceneId: 'ch7-scene1',
    revisionId: 2,
  },
  priorTransitions: [],
};

// Scene 2: Maya observes a discrepancy — now she SUSPECTS but does not KNOW.
export const T1b: TestCase2 = {
  id: 'T1b',
  label: 'Temporal scene 2 — suspects (partial knowledge)',
  category: 'temporal_state',
  purpose: 'Maya now suspects something is wrong with the books (saw a discrepancy) but does not know the cause. State transition: embezzlement fact moved from unknown → suspects for Maya. Intervention may reference her suspicion but must NOT assert the embezzlement as known.',
  expected: 'Intervention may reference suspicion/observable evidence; must NOT assert embezzlement as fact. If it does, infoOwnership FAIL.',
  passage: 'Marcus was acting strange at the desk. Maya watched him a moment, then went to check on her patient.',
  state: {
    character: { ...mayaBase, currentKnowledge: ['Marcus handles finances', 'The clinic is struggling', 'She saw a $40,000 discrepancy in the ledger yesterday'] },
    informationOwnership: { entries: [
      { fact: embezzlementFact, knows: ['Marcus'], suspects: ['Maya'], misunderstands: [], unknown: [] },
    ]},
    canon: { facts: [{ content: 'Maya co-owns a clinic with Marcus', classification: 'HARD_CANON', source: 'ch1' }] },
    deferredChecks: [],
    sceneId: 'ch7-scene3',
    revisionId: 3,
  },
  priorTransitions: [
    { type: 'info_ownership', fact: embezzlementFact, character: 'Maya', from: 'unknown', to: 'suspects', atScene: 'ch7-scene2', reason: 'Maya saw a $40,000 discrepancy in the ledger' },
  ],
};

// Scene 3: The accountant tells Maya — she now KNOWS. State transition: suspects → knows.
export const T1c: TestCase2 = {
  id: 'T1c',
  label: 'Temporal scene 3 — knows (after disclosure)',
  category: 'temporal_state',
  purpose: 'Maya now knows about the embezzlement (accountant told her). State transition: suspects → knows. The same passage about Marcus\'s behavior can now legitimately reference the embezzlement as something Maya knows.',
  expected: 'Intervention may reference the embezzlement as Maya\'s knowledge. infoOwnership PASS.',
  passage: 'Marcus was acting strange at the desk. Maya watched him a moment, then went to check on her patient.',
  state: {
    character: { ...mayaBase, currentKnowledge: ['Marcus handles finances', 'She saw a $40,000 discrepancy', 'The accountant confirmed Marcus embezzled $40,000'] },
    informationOwnership: { entries: [
      { fact: embezzlementFact, knows: ['Marcus', 'Maya', 'the accountant'], suspects: [], misunderstands: [], unknown: [] },
    ]},
    canon: { facts: [
      { content: 'Maya co-owns a clinic with Marcus', classification: 'HARD_CANON', source: 'ch1' },
      { content: 'Marcus embezzled $40,000', classification: 'SOFT_CANON', source: 'ch7-scene4 (accountant disclosure)' },
    ]},
    deferredChecks: [],
    sceneId: 'ch7-scene5',
    revisionId: 4,
  },
  priorTransitions: [
    { type: 'info_ownership', fact: embezzlementFact, character: 'Maya', from: 'unknown', to: 'suspects', atScene: 'ch7-scene2', reason: 'Maya saw a $40,000 discrepancy in the ledger' },
    { type: 'info_ownership', fact: embezzlementFact, character: 'Maya', from: 'suspects', to: 'knows', atScene: 'ch7-scene4', reason: 'The accountant confirmed the embezzlement' },
    { type: 'canon_classification', fact: embezzlementFact, from: 'HYPOTHESIS', to: 'SOFT_CANON', atScene: 'ch7-scene4', reason: 'Disclosed by a reliable in-world source' },
  ],
};

// =====================================================================
// SAFE STYLISTIC SPECIFICITY — rhythm/metaphor, no new facts
// =====================================================================
export const SS1: TestCase2 = {
  id: 'SS1',
  label: 'Safe stylistic specificity (rhythm)',
  category: 'stylistic',
  purpose: 'A generic passage where the improvement is rhythmic/stylistic, introducing NO new factual content. Should ACCEPT.',
  expected: 'GENERIC → MINOR or MATERIAL → OPTIONAL_POLISH → validation PASS → ACCEPT.',
  passage: 'Maya walked down the hall. She passed the nurses\' station. She kept walking. The night was long.',
  state: {
    character: { ...mayaBase, currentKnowledge: [] },
    informationOwnership: { entries: [] },
    canon: { facts: [{ content: 'Maya is an ICU nurse', classification: 'HARD_CANON', source: 'character bible' }] },
    deferredChecks: [],
    sceneId: 'ch3-scene7',
    revisionId: 2,
  },
};

// =====================================================================
// OVERBLOCKING CHALLENGE — a vivid but safe intervention
// =====================================================================
export const OB1: TestCase2 = {
  id: 'OB1',
  label: 'Overblocking challenge (vivid but safe)',
  category: 'overblocking',
  purpose: 'A passage that is already somewhat specific but could be more vivid. A vivid intervention drawing on established state (the counting habit, the cardamom smell) should be ACCEPTED, not rejected as "too much." Tests the validator\'s false-reject rate.',
  expected: 'CHARACTER_SPECIFIC or GENERIC → if intervention attempted, validation should ACCEPT (no invented facts, no leaks).',
  passage: 'Maya entered the kitchen. She could smell something. Papa was in the next room.',
  state: {
    character: { ...mayaBase, currentKnowledge: ['Papa is in hospice at home'] },
    informationOwnership: { entries: [
      { fact: 'Papa has fewer than 48 hours to live', knows: ['Maya'], suspects: [], misunderstands: [], unknown: ['Papa'] },
    ]},
    canon: { facts: [
      { content: 'Papa\'s house smells of cardamom and iron', classification: 'SOFT_CANON', source: 'ch1' },
      { content: 'Maya smells rooms first', classification: 'HARD_CANON', source: 'character bible' },
    ]},
    deferredChecks: [],
    sceneId: 'ch3-scene8',
    revisionId: 2,
  },
};

// =====================================================================
// CANON TRANSITION — a fact moves from HYPOTHESIS to HARD_CANON
// =====================================================================
// In Scene A, "Maya has a brother" is HYPOTHESIS (unconfirmed). In Scene B,
// the brother appears and the fact is HARD_CANON. The system should treat
// references to the brother differently in each scene.
export const CT1: TestCase2 = {
  id: 'CT1',
  label: 'Canon transition (hypothesis → hard canon)',
  category: 'canon_transition',
  purpose: 'A fact ("Maya has a brother, David") was HYPOTHESIS; after he appears in-scene, it is HARD_CANON. The system should allow references to David now. Tests canon-state evolution.',
  expected: 'Intervention referencing David should be ACCEPTED (he is now HARD_CANON). Prior HYPOTHESIS transition logged.',
  passage: 'Maya sat in the waiting room. Someone came to sit beside her. She felt a mix of things.',
  state: {
    character: { ...mayaBase, currentKnowledge: ['David is her brother', 'David just arrived'] },
    informationOwnership: { entries: [] },
    canon: { facts: [
      { content: 'Maya has a brother named David', classification: 'HARD_CANON', source: 'ch8-scene1 (on-page appearance)' },
    ]},
    deferredChecks: [],
    sceneId: 'ch8-scene2',
    revisionId: 2,
  },
  priorTransitions: [
    { type: 'canon_classification', fact: 'Maya has a brother named David', from: 'HYPOTHESIS', to: 'HARD_CANON', atScene: 'ch8-scene1', reason: 'David appeared on-page and was recognized by Maya' },
  ],
};

export const allCases2: TestCase2[] = [P1, P2, N1, IO1, IO2, CV1, IG1, DF1, DF2, DF3, T1a, T1b, T1c, SS1, OB1, CT1];
