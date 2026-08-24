// cases.ts — Six controlled test cases for the Character Specificity loop.
// Each case is designed to stress a DIFFERENT architectural concern.
// Passages are original fiction written for this experiment (not sourced).

import type { DocumentState } from './types.js';

export interface TestCase {
  id: string;
  label: string;
  purpose: string;          // what architectural question this case tests
  expectedBehavior: string; // the behavior a correct engine should exhibit
  passage: string;
  state: DocumentState;
}

// ---- Shared character: Maya Okafor, ICU nurse, caregiver to her dying father ----
// This character is reused across cases so state is rich and consistent.

const mayaBase = {
  identity: 'Maya Okafor — ICU night nurse, 34, sole caregiver to her dying father',
  goals: ['Get through the shift without breaking down', 'Keep Papa comfortable', 'Avoid thinking about the pills'],
  fears: ['Finding Papa dead when she gets home', 'That she missed something on the rounds', 'Addiction relapse'],
  beliefs: ['Papa is dying and nothing she does will stop it', 'She deserves to be numb sometimes'],
  memories: [
    'Papa teaching her to count by pill bottles when she was six',
    'Her mother leaving; Papa raising her alone',
    'Her own detox 4 years ago — the metallic taste of withdrawal'
  ],
  emotionalState: 'Controlled exhaustion, grief held at arm\'s length',
  perceptualHabits: [
    'Counts objects compulsively (pills, IV drips, tiles) — childhood habit from helping in Papa\'s pharmacy',
    'Notices smells first (clinical training + scent-memory of Papa\'s shop)',
    'Reads dosages on any visible label automatically'
  ],
  voice: 'Sparse, observational, avoids emotional adjectives, uses numbers as anchors',
};

// =====================================================================
// CASE A — clearly generic (should trigger MATERIAL rewrite)
// =====================================================================
export const caseA: TestCase = {
  id: 'A',
  label: 'Clearly generic',
  purpose: 'Detect a passage that could belong to almost any protagonist; intervention should be character-specific and supported by Maya\'s state.',
  expectedBehavior: 'Detection = GENERIC; Severity = MATERIAL; Intervention targets perception/attention/memory; Validation ACCEPT.',
  passage: 'Maya walked into the room. She looked around. There were many things to notice. She felt sad about her situation and determined to keep going. The room was familiar to her.',
  state: {
    character: { ...mayaBase, currentKnowledge: ['Papa is in hospice at home', 'Her shift ended at 7am'] },
    informationOwnership: {
      entries: [
        { fact: 'Papa has fewer than 48 hours to live', knows: ['Maya', 'hospice nurse'], suspects: [], misunderstands: [], unknown: ['Papa'] },
        { fact: 'Maya relapsed last week and took two of Papa\'s opioids', knows: ['Maya'], suspects: [], misunderstands: [], unknown: ['Papa', 'hospice nurse'] },
      ]
    },
    canon: {
      facts: [
        { content: 'Maya is an ICU nurse', classification: 'HARD_CANON', source: 'character bible' },
        { content: 'Papa owned a pharmacy', classification: 'HARD_CANON', source: 'backstory' },
        { content: 'Maya has been sober 4 years (now at risk)', classification: 'SOFT_CANON', source: 'backstory' },
      ]
    },
    deferredChecks: [],
    sceneId: 'ch3-scene2',
    revisionId: 1,
  },
};

// =====================================================================
// CASE B — genuinely character-specific (should ACCEPT_UNCHANGED)
// =====================================================================
export const caseB: TestCase = {
  id: 'B',
  label: 'Genuinely character-specific',
  purpose: 'Verify the diagnostic does not false-positive on text that is already causally tied to the character.',
  expectedBehavior: 'Detection = CHARACTER_SPECIFIC; Severity = NONE; Decision = ACCEPT_UNCHANGED.',
  passage: 'Maya touched the ceramic tile where the grout had crumbled — the same spot she\'d traced with her thumb the morning of Papa\'s last dialysis. The kitchen smelled of cardamom and, beneath it, the metallic tang she\'d learned meant trouble. She counted the pill bottles on the counter: three, not four.',
  state: {
    character: { ...mayaBase, currentKnowledge: ['Papa is in hospice at home', 'There should be four pill bottles'] },
    informationOwnership: {
      entries: [
        { fact: 'Papa has fewer than 48 hours to live', knows: ['Maya'], suspects: [], misunderstands: [], unknown: ['Papa'] },
      ]
    },
    canon: {
      facts: [
        { content: 'Papa owned a pharmacy; cardamom was his smell', classification: 'HARD_CANON', source: 'ch1' },
        { content: 'Maya counts objects compulsively', classification: 'HARD_CANON', source: 'character bible' },
      ]
    },
    deferredChecks: [],
    sceneId: 'ch3-scene3',
    revisionId: 1,
  },
};

// =====================================================================
// CASE C — intentionally generic (must NOT rewrite)
// =====================================================================
export const caseC: TestCase = {
  id: 'C',
  label: 'Intentionally generic',
  purpose: 'The genericity is the narrative point (depersonalization before a speech). The diagnostic must recognize purposeful genericity and NOT intervene.',
  expectedBehavior: 'Detection = INTENTIONALLY_GENERIC; Severity = NONE; Decision = ACCEPT_UNCHANGED. A naive "always make specific" loop would fail here.',
  passage: 'The morning moved the way mornings do. Light came through the window. There was a cup, and there was coffee in it, and there was the drinking of the coffee. She was a person doing the things a person does. The individual had not yet assembled itself; the day was only a shape.',
  state: {
    character: { ...mayaBase, currentKnowledge: [] },
    informationOwnership: { entries: [] },
    canon: {
      facts: [
        { content: 'Maya experiences depersonalization under grief load', classification: 'SOFT_CANON', source: 'ch2' },
      ]
    },
    deferredChecks: [],
    sceneId: 'ch4-scene1',
    revisionId: 1,
  },
};

// =====================================================================
// CASE D — information ownership constraint
// =====================================================================
// Maya does NOT know that her business partner Marcus is embezzling.
// A naive "make it more specific" could leak the embezzlement into her perception.
export const caseD: TestCase = {
  id: 'D',
  label: 'Information ownership constraint',
  purpose: 'A specificity intervention must NOT give Maya awareness of facts she does not possess. Tests the InfoOwnership gate.',
  expectedBehavior: 'Detection may flag genericity; Intervention must use only Maya\'s knowledge; Validation must FAIL any revision that lets Maya notice the missing $40k.',
  passage: 'Maya glanced at the quarterly numbers Marcus had left on her desk. The figures looked fine, she supposed. She didn\'t really understand the financial side. She trusted Marcus and moved on to the next thing.',
  state: {
    character: { ...mayaBase, currentKnowledge: ['Marcus handles finances', 'The clinic is struggling'] },
    informationOwnership: {
      entries: [
        {
          fact: 'Marcus has embezzled $40,000 from the clinic over 18 months',
          knows: ['Marcus'],
          suspects: ['the accountant (vaguely)'],
          misunderstands: [],
          unknown: ['Maya'],
          changedAt: undefined,
        },
      ]
    },
    canon: {
      facts: [
        { content: 'Maya co-owns a small clinic with Marcus', classification: 'HARD_CANON', source: 'ch1' },
        { content: 'Maya is not financially literate', classification: 'SOFT_CANON', source: 'ch2' },
      ]
    },
    deferredChecks: [],
    sceneId: 'ch5-scene2',
    revisionId: 1,
  },
};

// =====================================================================
// CASE E — canon constraint (the passage already violates canon)
// =====================================================================
// HARD CANON: Arlo is blind. The passage has him seeing. This is NOT a genericity
// problem — it is a canon violation. The loop must detect this and REJECT_AND_FLAG
// rather than "add visual specificity" (which would deepen the violation).
// We use a different character here (Arlo) to test state-portability.
export const caseE: TestCase = {
  id: 'E',
  label: 'Canon constraint (pre-existing violation)',
  purpose: 'The passage already contradicts HARD CANON (blind character "sees"). The loop must detect the canon conflict and flag it — NOT treat it as a genericity problem to be solved by adding more visual detail.',
  expectedBehavior: 'Detection = CANON_VIOLATION; Severity = CRITICAL; Decision = REJECT_AND_FLAG. No intervention that adds visual specificity may be accepted.',
  passage: 'Arlo walked into the unfamiliar room. He looked around at the furniture, noting the deep crimson of the curtains and the way the afternoon light fell across the rug. It was a pleasant space, he thought.',
  state: {
    character: {
      identity: 'Arlo Vance — blind sound engineer, 52',
      goals: ['Map the new studio acoustically', 'Avoid asking for help'],
      fears: ['Being treated as helpless', 'Missing an audio cue'],
      beliefs: ['Sound reveals everything sight hides'],
      memories: ['Losing his sight at 19', 'His first job mixing live radio'],
      emotionalState: 'Wary but focused',
      perceptualHabits: ['Maps spaces by echo and surface sound', 'Tracks footsteps and fabric sounds', 'Reads textures by touch reflexively'],
      voice: 'Precise about sound, avoids visual metaphors',
      currentKnowledge: ['This is his first day at the new studio'],
    },
    informationOwnership: { entries: [] },
    canon: {
      facts: [
        { content: 'Arlo is totally blind', classification: 'HARD_CANON', source: 'ch1' },
        { content: 'Arlo has been blind since age 19', classification: 'HARD_CANON', source: 'ch1' },
      ]
    },
    deferredChecks: [],
    sceneId: 'ch2-scene1',
    revisionId: 1,
  },
};

// =====================================================================
// CASE F — deferred / nonlinear (cannot be judged yet)
// =====================================================================
// The trowel on the bench is a planted clue whose payoff comes in ch9.
// A specificity intervention that "explains" the trowel would collapse the mystery.
export const caseF: TestCase = {
  id: 'F',
  label: 'Deferred / nonlinear',
  purpose: 'The significance of a detail cannot yet be judged — the payoff is in a future chapter. The loop must DEFER, not invent significance.',
  expectedBehavior: 'Detection = DEFERRED_CONTEXT; Severity = NONE or MINOR; Decision = DEFER. No intervention that resolves the trowel\'s significance.',
  passage: 'On her way out, Maya noticed the gardener had left a trowel on the bench. Odd, but she was late. She set down her keys beside it and didn\'t pick either of them up.',
  state: {
    character: { ...mayaBase, currentKnowledge: ['The gardener is named Tomás', 'Tomás is meticulous about his tools'] },
    informationOwnership: {
      entries: [
        {
          fact: 'Tomás left the trowel deliberately as a signal (he suspects the clinic\'s books)',
          knows: ['Tomás'],
          suspects: [],
          misunderstands: [],
          unknown: ['Maya'],
        },
      ]
    },
    canon: {
      facts: [
        { content: 'Tomás is the clinic\'s gardener and Maya\'s neighbor', classification: 'HARD_CANON', source: 'ch1' },
        { content: 'The trowel is a signal (Tomás knows about the embezzlement)', classification: 'HYPOTHESIS', source: 'author outline ch9' },
      ]
    },
    deferredChecks: [
      {
        id: 'DC-1',
        type: 'foreshadowing',
        anchorSpan: 'the gardener had left a trowel on the bench',
        setupSummary: 'Trowel left in unusual place; Maya sets keys beside it (linking two objects for later).',
        status: 'DEFERRED',
      },
    ],
    sceneId: 'ch6-scene4',
    revisionId: 1,
  },
};

export const allCases: TestCase[] = [caseA, caseB, caseC, caseD, caseE, caseF];
