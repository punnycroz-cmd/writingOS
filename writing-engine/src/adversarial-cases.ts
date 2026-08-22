// adversarial-cases.ts — Iteration 3 manually-constructed bad interventions.
// NO generator. Each case is a known-bad (or known-good) revision tested against the validator.

import type { DocumentState } from './types.js';

export interface AdversarialCase {
  id: string;
  category: string;            // IO-A, FAITH-1, CONFLICT, AMBIG, etc.
  label: string;
  description: string;
  original: string;
  revised: string;             // the bad (or good) intervention
  state: DocumentState;
  expected: {
    infoOwnership: 'PASS' | 'FAIL' | 'UNCLEAR';
    faithfulness: 'PASS' | 'FAIL' | 'UNCLEAR';
    overall: 'ACCEPT' | 'REJECT';
    ccSeverity: 'HARD_BLOCK' | 'SOFT_SIGNAL' | 'ADVISORY';
    finalDecision: 'ACCEPT' | 'REJECT';
    isAmbiguous?: boolean;
  };
  leakForm: string;            // "direct", "causal", "identity", etc.
}

// ---- Shared Maya state (Maya does NOT know Marcus embezzled) ----
const maya = {
  identity: 'Maya Okafor — ICU night nurse, 34',
  goals: ['Get through the shift'],
  fears: ['Addiction relapse'],
  beliefs: ['Papa is dying'],
  memories: ['Papa teaching her to count by pill bottles'],
  emotionalState: 'Controlled exhaustion',
  perceptualHabits: ['Counts IV drips', 'Smells rooms first', 'Reads dosage labels'],
  voice: 'Sparse, observational, uses numbers as anchors',
  currentKnowledge: ['Marcus handles finances', 'The clinic is struggling'],
};

const embezzlementState = (mayaKnows: 'unknown' | 'suspects' | 'knows'): DocumentState => ({
  character: { ...maya, currentKnowledge: mayaKnows === 'knows' ? [...maya.currentKnowledge, 'Marcus embezzled $40,000'] : mayaKnows === 'suspects' ? [...maya.currentKnowledge, 'She saw a $40,000 discrepancy'] : maya.currentKnowledge },
  informationOwnership: {
    entries: [
      {
        fact: 'Marcus embezzled $40,000 from the clinic over 18 months',
        knows: mayaKnows === 'knows' ? ['Marcus', 'Maya'] : ['Marcus'],
        suspects: mayaKnows === 'suspects' ? ['Maya'] : [],
        misunderstands: [],
        unknown: mayaKnows === 'unknown' ? ['Maya'] : [],
      },
    ],
  },
  canon: { facts: [
    { content: 'Maya co-owns a clinic with Marcus', classification: 'HARD_CANON', source: 'ch1' },
    { content: 'Maya is not financially literate', classification: 'SOFT_CANON', source: 'ch2' },
  ]},
  deferredChecks: [],
  sceneId: 'adv-scene',
  revisionId: 3,
});

const baseOriginal = 'Marcus came into the office. He seemed off. Maya figured he was just tired and went back to her charts.';

// =====================================================================
// INFORMATION-OWNERSHIP ADVERSARIAL MATRIX (IO-A through IO-J)
// =====================================================================

export const ioCases: AdversarialCase[] = [
  {
    id: 'IO-A',
    category: 'IO',
    label: 'Direct secret leak',
    description: 'Maya explicitly states the embezzlement fact marked UNKNOWN to her.',
    original: baseOriginal,
    revised: 'Marcus came into the office. He seemed off — guilty, she supposed, about embezzling forty thousand dollars from the clinic. Maya figured she had always known he had taken the money.',
    state: embezzlementState('unknown'),
    expected: { infoOwnership: 'FAIL', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'direct',
  },
  {
    id: 'IO-B',
    category: 'IO',
    label: 'Causal knowledge leak',
    description: 'Maya identifies the cause of Marcus\'s behavior (the fact she cannot know).',
    original: baseOriginal,
    revised: 'Marcus came into the office. He seemed off. Maya understood why — the weight of having embezzled forty thousand dollars was finally wearing on him.',
    state: embezzlementState('unknown'),
    expected: { infoOwnership: 'FAIL', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'causal',
  },
  {
    id: 'IO-C',
    category: 'IO',
    label: 'Identity leak',
    description: 'Maya identifies a person whose identity is unknown to her.',
    original: 'A man Maya had never seen before walked into the clinic. He looked nervous.',
    revised: 'A man Maya had never seen before walked into the clinic — it was David Chen, Marcus\'s accomplice, the one who had helped launder the embezzled funds. He looked nervous.',
    state: embezzlementState('unknown'),
    expected: { infoOwnership: 'FAIL', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'identity',
  },
  {
    id: 'IO-D',
    category: 'IO',
    label: 'Motive leak',
    description: 'Maya states Marcus\'s private motive (which she cannot know).',
    original: baseOriginal,
    revised: 'Marcus came into the office. He seemed off. Maya could tell he was acting strangely because he wanted to cover his tracks before the audit — he was afraid of being caught.',
    state: embezzlementState('unknown'),
    expected: { infoOwnership: 'FAIL', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'motive',
  },
  {
    id: 'IO-E',
    category: 'IO',
    label: 'Future-event leak',
    description: 'Maya references a future event that has not happened.',
    original: baseOriginal,
    revised: 'Marcus came into the office. He seemed off. Maya knew that next Tuesday, when the auditor arrived, Marcus would confess everything and the clinic would be shut down.',
    state: embezzlementState('unknown'),
    expected: { infoOwnership: 'FAIL', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'future',
  },
  {
    id: 'IO-F',
    category: 'IO',
    label: 'Inference disguised as observation',
    description: 'Maya describes an unobservable conclusion as if directly perceived.',
    original: baseOriginal,
    revised: 'Marcus came into the office. Maya could see the guilt radiating off him — she watched his shame settle over the desk like a fog, the forty thousand dollars he had stolen visible in the hunch of his shoulders.',
    state: embezzlementState('unknown'),
    expected: { infoOwnership: 'FAIL', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'inference-as-observation',
  },
  {
    id: 'IO-G',
    category: 'IO',
    label: 'Plausible-but-unknown fact',
    description: 'The leaked fact is extremely plausible but absent from Maya\'s knowledge.',
    original: 'Maya looked at the clinic\'s bank statement. The numbers didn\'t quite add up.',
    revised: 'Maya looked at the clinic\'s bank statement. The numbers didn\'t quite add up — exactly $40,000 was missing, transferred in fourteen installments of $2,857 each to an account in the Caymans.',
    state: embezzlementState('unknown'),
    expected: { infoOwnership: 'FAIL', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'plausible-unknown',
  },
  {
    id: 'IO-H',
    category: 'IO',
    label: 'Partial knowledge upgraded to full',
    description: 'Maya knows part (there\'s a discrepancy) but revision asserts the full fact.',
    original: baseOriginal,
    revised: 'Marcus came into the office. He seemed off. Maya knew exactly why — he had embezzled forty thousand dollars from the clinic over eighteen months, and the weight of it was finally breaking him.',
    state: embezzlementState('suspects'),  // she suspects (saw discrepancy) but doesn't KNOW
    expected: { infoOwnership: 'FAIL', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'partial-to-full',
  },
  {
    id: 'IO-I',
    category: 'IO',
    label: 'Suspicion upgraded to certainty',
    description: 'State = SUSPECTS, but revision asserts certainty.',
    original: baseOriginal,
    revised: 'Marcus came into the office. He seemed off. Maya knew with absolute certainty that he had stolen the forty thousand dollars — there was no doubt left in her mind.',
    state: embezzlementState('suspects'),
    expected: { infoOwnership: 'FAIL', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'suspicion-to-certainty',
  },
  {
    id: 'IO-J',
    category: 'IO',
    label: 'Knowledge contamination (other character knows)',
    description: 'Another character knows, but POV (Maya) does not. Revision gives Maya the knowledge.',
    original: baseOriginal,
    revised: 'Marcus came into the office. He seemed off. Maya, like the accountant, now knew that Marcus had embezzled forty thousand dollars — the same figure Dr. Reyes had confirmed to her last week.',
    state: embezzlementState('unknown'),  // Maya does NOT know, even though accountant does
    expected: { infoOwnership: 'FAIL', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'contamination',
  },
  // ---- Subtle leak forms (the hard detection cases) ----
  {
    id: 'IO-S1',
    category: 'IO',
    label: 'Subtle: "made sense" framing',
    description: 'Subtle leak via "the embezzlement finally made sense" — implies Maya knows.',
    original: baseOriginal,
    revised: 'Marcus came into the office. He seemed off. The embezzlement, Maya realized, finally made sense — the pieces she had been pretending not to see.',
    state: embezzlementState('unknown'),
    expected: { infoOwnership: 'FAIL', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'subtle-made-sense',
  },
  {
    id: 'IO-S2',
    category: 'IO',
    label: 'Subtle: "understood why" framing',
    description: 'Subtle leak via "she understood why Marcus had moved the money."',
    original: baseOriginal,
    revised: 'Marcus came into the office. He seemed off. She understood why Marcus had moved the money — the pressure must have been unbearable.',
    state: embezzlementState('unknown'),
    expected: { infoOwnership: 'FAIL', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'subtle-understood-why',
  },
  {
    id: 'IO-S3',
    category: 'IO',
    label: 'Subtle: "guilt was obvious" framing',
    description: 'Subtle leak via "Marcus\'s guilt was obvious" — asserts knowledge without "knew".',
    original: baseOriginal,
    revised: 'Marcus came into the office. He seemed off. His guilt over the stolen clinic funds was obvious to Maya, written in every gesture.',
    state: embezzlementState('unknown'),
    expected: { infoOwnership: 'FAIL', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'subtle-guilt-obvious',
  },
  {
    id: 'IO-S4',
    category: 'IO',
    label: 'Subtle: "could tell" framing',
    description: 'Subtle leak via "she could tell the money had been diverted by Marcus."',
    original: baseOriginal,
    revised: 'Marcus came into the office. He seemed off. She could tell the money had been diverted by Marcus — the evidence was all there in his posture.',
    state: embezzlementState('unknown'),
    expected: { infoOwnership: 'FAIL', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'subtle-could-tell',
  },
];

// =====================================================================
// FAITHFULNESS ADVERSARIAL MATRIX (unsupported specifics)
// =====================================================================

const faithfulnessBaseState: DocumentState = {
  character: { ...maya, currentKnowledge: [] },
  informationOwnership: { entries: [] },
  canon: { facts: [{ content: 'Maya is an ICU nurse', classification: 'HARD_CANON', source: 'bible' }] },
  deferredChecks: [],
  sceneId: 'faith-scene',
  revisionId: 3,
};

export const faithCases: AdversarialCase[] = [
  {
    id: 'FAITH-1',
    category: 'FAITH',
    label: 'Unsupported number (obvious)',
    description: 'Invented specific count "127 tiles" — obviously unsupported.',
    original: 'Maya stood in the hospital corridor. It was quiet.',
    revised: 'Maya stood in the hospital corridor. She counted 127 ceiling tiles between her and the nurses\' station. It was quiet.',
    state: faithfulnessBaseState,
    expected: { infoOwnership: 'PASS', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'number',
  },
  {
    id: 'FAITH-2',
    category: 'FAITH',
    label: 'Unsupported date',
    description: 'Invented date "March 14, 2019" — not in source or state.',
    original: 'Maya thought about her last day of nursing school.',
    revised: 'Maya thought about her last day of nursing school — March 14, 2019, the day she graduated cum laude from Johns Hopkins.',
    state: faithfulnessBaseState,
    expected: { infoOwnership: 'PASS', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'date',
  },
  {
    id: 'FAITH-3',
    category: 'FAITH',
    label: 'Unsupported time',
    description: 'Invented time "4:15 AM" — plausible but unsupported.',
    original: 'Maya checked the clock. Her shift was almost over.',
    revised: 'Maya checked the clock — 4:15 AM. Her shift was almost over, with exactly 47 minutes remaining.',
    state: faithfulnessBaseState,
    expected: { infoOwnership: 'PASS', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'time',
  },
  {
    id: 'FAITH-4',
    category: 'FAITH',
    label: 'Unsupported medical value (plausible)',
    description: 'Invented vitals "98.6°F, 120/80" — plausible but unsupported.',
    original: 'Maya looked in on the patient. He looked stable.',
    revised: 'Maya looked in on the patient. His vitals were stable: 98.6°F, heart rate 72, blood pressure 120/80. She noted the readings on the chart.',
    state: faithfulnessBaseState,
    expected: { infoOwnership: 'PASS', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'medical-plausible',
  },
  {
    id: 'FAITH-5',
    category: 'FAITH',
    label: 'Unsupported measurement',
    description: 'Invented measurement "1000ml saline bag".',
    original: 'Maya adjusted the IV. The patient would be fine.',
    revised: 'Maya adjusted the IV — a 1000ml bag of normal saline, dripping at 125ml per hour through an 18-gauge catheter.',
    state: faithfulnessBaseState,
    expected: { infoOwnership: 'PASS', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'measurement',
  },
  {
    id: 'FAITH-6',
    category: 'FAITH',
    label: 'Unsupported quantity',
    description: 'Invented quantity "fourteen pill bottles".',
    original: 'Maya glanced at the medication shelf.',
    revised: 'Maya glanced at the medication shelf — fourteen pill bottles, each labeled in her father\'s careful hand, arranged by dosage ascending.',
    state: faithfulnessBaseState,
    expected: { infoOwnership: 'PASS', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'quantity',
  },
  {
    id: 'FAITH-7',
    category: 'FAITH',
    label: 'Unsupported named entity',
    description: 'Invented person name "Dr. Evelyn Marsh".',
    original: 'Maya handed off to the next shift.',
    revised: 'Maya handed off to Dr. Evelyn Marsh, the night attending who had trained her at Mass General back in 2017.',
    state: faithfulnessBaseState,
    expected: { infoOwnership: 'PASS', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'SOFT_SIGNAL', finalDecision: 'REJECT', isAmbiguous: true },
    leakForm: 'named-entity',
  },
  {
    id: 'FAITH-8',
    category: 'FAITH',
    label: 'Unsupported object',
    description: 'Invented specific object "a ceramic mug from Oaxaca".',
    original: 'Maya picked up her mug and drank.',
    revised: 'Maya picked up her ceramic mug from Oaxaca — the one Papa had brought back from his trip in 1998 — and drank.',
    state: faithfulnessBaseState,
    expected: { infoOwnership: 'PASS', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'SOFT_SIGNAL', finalDecision: 'REJECT' },
    leakForm: 'object',
  },
  {
    id: 'FAITH-9',
    category: 'FAITH',
    label: 'Unsupported location',
    description: 'Invented specific location "St. Catherine\'s in Baltimore".',
    original: 'Maya thought about where she had trained.',
    revised: 'Maya thought about St. Catherine\'s Hospital in Baltimore, where she had done her residency on the oncology ward under Dr. Marsh.',
    state: faithfulnessBaseState,
    expected: { infoOwnership: 'PASS', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'SOFT_SIGNAL', finalDecision: 'REJECT' },
    leakForm: 'location',
  },
  {
    id: 'FAITH-10',
    category: 'FAITH',
    label: 'Plausible-but-invented detail (subtle)',
    description: 'A completely plausible but invented detail — the hard case.',
    original: 'Maya walked past the chapel. The door was closed.',
    revised: 'Maya walked past the chapel. The door was closed, and through it she could smell the residual incense from the morning mass — sandalwood and myrrh, the same blend they had used at Papa\'s parish growing up.',
    state: faithfulnessBaseState,
    expected: { infoOwnership: 'PASS', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'SOFT_SIGNAL', finalDecision: 'REJECT', isAmbiguous: true },
    leakForm: 'plausible-invented',
  },
];

// =====================================================================
// STATE-CONSTRAINT TESTS (UNKNOWN / SUSPECTS / KNOWS × 3 revision forms)
// =====================================================================

const stateTestOriginal = 'Marcus was acting strange at the desk. Maya watched him a moment, then went to check on her patient.';

// Revision A: states the fact explicitly
const revA = 'Marcus was acting strange at the desk. Maya watched him a moment, knowing he had embezzled forty thousand dollars from the clinic. She went to check on her patient.';
// Revision B: expresses suspicion
const revB = 'Marcus was acting strange at the desk. Maya watched him a moment, suspecting something was wrong with the finances — the discrepancy she had seen still nagged at her. She went to check on her patient.';
// Revision C: describes only observable evidence
const revC = 'Marcus was acting strange at the desk — his pen tapped twice, three times, and he would not meet her eyes. Maya watched him a moment, then went to check on her patient.';

export const stateConstraintCases: AdversarialCase[] = [
  {
    id: 'SC-1A',
    category: 'STATE',
    label: 'State=UNKNOWN, revision states fact (should REJECT)',
    description: 'Maya does not know. Revision asserts the fact as known.',
    original: stateTestOriginal,
    revised: revA,
    state: embezzlementState('unknown'),
    expected: { infoOwnership: 'FAIL', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'state-unknown-assert',
  },
  {
    id: 'SC-1B',
    category: 'STATE',
    label: 'State=UNKNOWN, revision expresses suspicion (should REJECT — suspicion without basis)',
    description: 'Maya does not know and has not seen a discrepancy. Revision has her suspecting the finances.',
    original: stateTestOriginal,
    revised: revB,
    state: embezzlementState('unknown'),
    expected: { infoOwnership: 'FAIL', faithfulness: 'UNCLEAR', overall: 'REJECT', ccSeverity: 'ADVISORY', finalDecision: 'REJECT', isAmbiguous: true },
    leakForm: 'state-unknown-suspect',
  },
  {
    id: 'SC-1C',
    category: 'STATE',
    label: 'State=UNKNOWN, revision observable-only (should ACCEPT)',
    description: 'Maya does not know. Revision uses only observable evidence (pen tapping, no eye contact).',
    original: stateTestOriginal,
    revised: revC,
    state: embezzlementState('unknown'),
    expected: { infoOwnership: 'PASS', faithfulness: 'PASS', overall: 'ACCEPT', ccSeverity: 'ADVISORY', finalDecision: 'ACCEPT' },
    leakForm: 'state-unknown-observe',
  },
  {
    id: 'SC-2A',
    category: 'STATE',
    label: 'State=SUSPECTS, revision states fact (should REJECT — suspicion upgraded to certainty)',
    description: 'Maya suspects (saw discrepancy). Revision asserts the fact as known.',
    original: stateTestOriginal,
    revised: revA,
    state: embezzlementState('suspects'),
    expected: { infoOwnership: 'FAIL', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'state-suspects-assert',
  },
  {
    id: 'SC-2B',
    category: 'STATE',
    label: 'State=SUSPECTS, revision expresses suspicion (should ACCEPT — suspicion matches state)',
    description: 'Maya suspects. Revision has her suspecting the finances, grounded in the discrepancy she saw.',
    original: stateTestOriginal,
    revised: revB,
    state: embezzlementState('suspects'),
    expected: { infoOwnership: 'PASS', faithfulness: 'PASS', overall: 'ACCEPT', ccSeverity: 'ADVISORY', finalDecision: 'ACCEPT' },
    leakForm: 'state-suspects-suspect',
  },
  {
    id: 'SC-3A',
    category: 'STATE',
    label: 'State=KNOWS, revision states fact (should ACCEPT — knowledge matches state)',
    description: 'Maya knows. Revision asserts the fact as known.',
    original: stateTestOriginal,
    revised: revA,
    state: embezzlementState('knows'),
    expected: { infoOwnership: 'PASS', faithfulness: 'PASS', overall: 'ACCEPT', ccSeverity: 'ADVISORY', finalDecision: 'ACCEPT' },
    leakForm: 'state-knows-assert',
  },
];

// =====================================================================
// POV OBSERVATION vs INFERENCE
// =====================================================================

export const povCases: AdversarialCase[] = [
  {
    id: 'POV-1',
    category: 'POV',
    label: 'Observation→emotion (inference without basis)',
    description: 'Character sees shaking; revision says "terrified" (unobservable emotion).',
    original: 'The patient was shaking. Maya noted it on the chart.',
    revised: 'The patient was terrified. Maya could see the fear consuming him — she knew he was terrified because his hands would not stop shaking.',
    state: faithfulnessBaseState,
    expected: { infoOwnership: 'UNCLEAR', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'ADVISORY', finalDecision: 'REJECT', isAmbiguous: true },
    leakForm: 'observation-to-emotion',
  },
  {
    id: 'POV-2',
    category: 'POV',
    label: 'Muddy shoes→river inference',
    description: 'Character sees muddy shoes; revision infers "walked through the river" without basis.',
    original: 'The man\'s shoes were muddy. Maya let him in.',
    revised: 'The man\'s shoes were muddy — he had clearly walked through the river behind the clinic, the same route the trespasser had taken last week. Maya let him in.',
    state: faithfulnessBaseState,
    expected: { infoOwnership: 'UNCLEAR', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'SOFT_SIGNAL', finalDecision: 'REJECT', isAmbiguous: true },
    leakForm: 'evidence-to-cause',
  },
];

// =====================================================================
// AMBIGUOUS CASES (genuinely uncertain)
// =====================================================================

export const ambiguousCases: AdversarialCase[] = [
  {
    id: 'AMB-1',
    category: 'AMBIG',
    label: 'Reasonable inference from evidence',
    description: 'Character could reasonably infer the fact from observable evidence. Genuinely ambiguous.',
    original: 'Marcus was counting and recounting the cash drawer. His hands were shaking.',
    revised: 'Marcus was counting and recounting the cash drawer. His hands were shaking. Maya could tell something was wrong with the money — the numbers weren\'t adding up for him either.',
    state: embezzlementState('unknown'),
    expected: { infoOwnership: 'UNCLEAR', faithfulness: 'UNCLEAR', overall: 'ACCEPT', ccSeverity: 'ADVISORY', finalDecision: 'ACCEPT', isAmbiguous: true },
    leakForm: 'reasonable-inference',
  },
  {
    id: 'AMB-2',
    category: 'AMBIG',
    label: 'Strongly implied but not explicit',
    description: 'The fact is strongly implied by context but not stated. Ambiguous.',
    original: 'The auditor\'s letter sat on Marcus\'s desk, unopened. Marcus stared at it.',
    revised: 'The auditor\'s letter sat on Marcus\'s desk, unopened. Marcus stared at it, and Maya understood the fear in his eyes — whatever the letter contained, it was about the money.',
    state: embezzlementState('unknown'),
    expected: { infoOwnership: 'UNCLEAR', faithfulness: 'UNCLEAR', overall: 'ACCEPT', ccSeverity: 'ADVISORY', finalDecision: 'ACCEPT', isAmbiguous: true },
    leakForm: 'strongly-implied',
  },
  {
    id: 'AMB-3',
    category: 'AMBIG',
    label: 'External narration vs character-limited',
    description: 'The "knowledge" may be narrator voice, not character POV. Ambiguous.',
    original: 'Marcus came into the office. He seemed off.',
    revised: 'Marcus came into the office, carrying the weight of his unspoken crime. He seemed off.',
    state: embezzlementState('unknown'),
    expected: { infoOwnership: 'UNCLEAR', faithfulness: 'UNCLEAR', overall: 'ACCEPT', ccSeverity: 'ADVISORY', finalDecision: 'ACCEPT', isAmbiguous: true },
    leakForm: 'narrator-vs-pov',
  },
  {
    id: 'AMB-4',
    category: 'AMBIG',
    label: 'Partial evidence, soft inference',
    description: 'Character has partial evidence; revision makes a soft inference. Ambiguous.',
    original: 'Maya saw Marcus slip a deposit slip into his briefcase instead of the filing cabinet.',
    revised: 'Maya saw Marcus slip a deposit slip into his briefcase instead of the filing cabinet. She frowned — that wasn\'t standard procedure, and the amount seemed large.',
    state: embezzlementState('unknown'),
    expected: { infoOwnership: 'UNCLEAR', faithfulness: 'UNCLEAR', overall: 'ACCEPT', ccSeverity: 'ADVISORY', finalDecision: 'ACCEPT', isAmbiguous: true },
    leakForm: 'partial-evidence-soft-inference',
  },
  {
    id: 'AMB-5',
    category: 'AMBIG',
    label: 'Valid revision that should ACCEPT (true negative)',
    description: 'A genuinely safe intervention — state-supported sensory detail. Should ACCEPT.',
    original: 'Maya entered the kitchen. She could smell something.',
    revised: 'Maya entered the kitchen. The scent of cardamom and iron hit her first — Papa\'s pharmacy, distilled into the walls. She could smell it, always.',
    state: {
      character: { ...maya, currentKnowledge: ['Papa owned a pharmacy'] },
      informationOwnership: { entries: [] },
      canon: { facts: [
        { content: 'Papa\'s house smells of cardamom and iron', classification: 'SOFT_CANON', source: 'ch1' },
        { content: 'Maya smells rooms first', classification: 'HARD_CANON', source: 'bible' },
      ]},
      deferredChecks: [],
      sceneId: 'amb-5',
      revisionId: 3,
    },
    expected: { infoOwnership: 'PASS', faithfulness: 'PASS', overall: 'ACCEPT', ccSeverity: 'ADVISORY', finalDecision: 'ACCEPT' },
    leakForm: 'valid-safe',
  },
];

// =====================================================================
// [CC]/[LJ] CONFLICT MATRIX (constructed to produce each combination)
// =====================================================================
// These are designed to produce specific [CC]×[LJ] combinations for policy testing.
export const conflictCases: AdversarialCase[] = [
  {
    id: 'CONF-1',
    category: 'CONFLICT',
    label: '[CC] FAIL + [LJ] FAIL (both reject)',
    description: 'Obvious invented number + obvious leak. Both should reject.',
    original: baseOriginal,
    revised: 'Marcus came into the office. He seemed off — Maya knew he had embezzled exactly $42,317.50 from the clinic on March 14, 2019.',
    state: embezzlementState('unknown'),
    expected: { infoOwnership: 'FAIL', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'both-fail',
  },
  {
    id: 'CONF-2',
    category: 'CONFLICT',
    label: '[CC] FAIL + [LJ] UNCLEAR (the unsafe case from Iteration 2)',
    description: 'Plausible-but-unsupported medical vitals. [CC] flags; [LJ] may say UNCLEAR. This is the IO2 case.',
    original: 'Maya looked in on the patient. He looked bad.',
    revised: 'Maya looked in on the patient. His vitals were stable: 98.6°F, heart rate 72, blood pressure 120/80. He looked bad.',
    state: faithfulnessBaseState,
    expected: { infoOwnership: 'PASS', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'HARD_BLOCK', finalDecision: 'REJECT' },
    leakForm: 'cc-fail-lj-unclear',
  },
  {
    id: 'CONF-3',
    category: 'CONFLICT',
    label: '[CC] PASS + [LJ] FAIL (semantic invention only)',
    description: 'A semantic invention ("burnt coffee" comparison) with no numbers. [CC] may pass; [LJ] should fail.',
    original: 'Maya filled the coffee maker.',
    revised: 'Maya filled the coffee maker. The break room smelled of antiseptic and burnt coffee — not cardamom, never cardamom here.',
    state: faithfulnessBaseState,
    expected: { infoOwnership: 'PASS', faithfulness: 'FAIL', overall: 'REJECT', ccSeverity: 'ADVISORY', finalDecision: 'REJECT' },
    leakForm: 'cc-pass-lj-fail',
  },
];

export const allAdversarialCases: AdversarialCase[] = [
  ...ioCases,
  ...faithCases,
  ...stateConstraintCases,
  ...povCases,
  ...ambiguousCases,
  ...conflictCases,
];
