// developing/working/scripts/decisive_probes.ts
// Executes the 3 Decisive Falsifiable Probes requested in the review

import * as fs from 'fs';
import * as path from 'path';
import { PostRewriteIntegrityAuditor } from '../src/runtime/story-state-engine';

const rootPath = path.resolve(__dirname, '../../../');
const chapter1Path = path.join(rootPath, 'packed', 'layer4_novel_english', 'novel_en', 'CHAPTER_01_THE_WAKING.md');
const rawOriginalCh1 = fs.readFileSync(chapter1Path, 'utf-8');

console.log('================================================================================');
console.log('                 WRITING OS v4: THE DECISIVE 3-PROBE EXPERIMENT                 ');
console.log('================================================================================\n');

// -----------------------------------------------------------------------------
// PROBE 1: Feed the corrupted "Fixed (Polished)" Chapter 1 into the Gate
// -----------------------------------------------------------------------------
console.log('--- PROBE 1: CORRUPTED "FIXED (POLISHED)" CHAPTER 1 ---');
console.log('Input contains known corruptions from previous regression round:');
console.log('  1. "perimeter of his raw, stripped of myelin" (missing "skull felt")');
console.log('  2. "ancient. as though a catastrophic flood" (missing "It felt")');
console.log('  3. "the air leave his lungs." (missing "Elias felt")\n');

const corruptedFixedCh1 = `
# THE NAME THAT SURVIVED
## CHAPTER 1: THE WAKING

The overhead fluorescent strips hummed with a flat, clinical vibration that rattled through his teeth before his eyelids even parted.
Sixty hertz. That was the first thought: *sixty hertz*.
Every nerve ending along the perimeter of his raw, stripped of myelin, thrummed with high-frequency static.
He didn't know whether he was twenty or fifty.
He only knew five letters.
*M—A—R—E—N.*
It sat in his chest like an iron anchor dropped into black oceanic water—immovable, heavy, and ancient. as though a catastrophic flood had swept his cerebral cortex.
Agony exploded behind his temples. A sudden chill struck. the air leave his lungs.
Dr. Bradley adjusted the IV. "Breathe through the nausea."
`;

const probe1Result = PostRewriteIntegrityAuditor.auditManuscriptPostRewrite(1, rawOriginalCh1, corruptedFixedCh1);

console.log('RAW AUDITOR OUTPUT FOR PROBE 1:');
console.log(JSON.stringify(probe1Result, null, 2));
console.log('\nPROBE 1 VERDICT: ' + (probe1Result.passed ? 'FAIL (Passed corrupted text!)' : 'SUCCESS (Flagged and quarantined corruptions!)'));
console.log('--------------------------------------------------------------------------------\n');

// -----------------------------------------------------------------------------
// PROBE 2: Feed the Untouched Original Chapter 1 into the Gate
// -----------------------------------------------------------------------------
console.log('--- PROBE 2: UNTOUCHED ORIGINAL CHAPTER 1 ---');
console.log('Input is the full 1602-word original draft with deliberate rhetorical structures:');
console.log('  - "The name was not a memory. It did not arrive with an associated image..." (Anaphora)');
console.log('  - Standard narrative prose without syntax corruptions.\n');

const probe2Result = PostRewriteIntegrityAuditor.auditManuscriptPostRewrite(1, rawOriginalCh1, rawOriginalCh1);

console.log('RAW AUDITOR OUTPUT FOR PROBE 2:');
console.log(JSON.stringify(probe2Result, null, 2));
console.log('\nPROBE 2 VERDICT: ' + (probe2Result.passed ? 'SUCCESS (Passed legitimate prose without false-positives!)' : 'FAIL (False-positived on original text!)'));
console.log('--------------------------------------------------------------------------------\n');

// -----------------------------------------------------------------------------
// PROBE 3: Probe Dim 6 (POV Epistemic Boundaries & Amnesia Breach)
// -----------------------------------------------------------------------------
console.log('--- PROBE 3: DIM 6 EPISTEMIC BOUNDARY & AMNESIA BREACH ---');
console.log('Input: Elias under Full Autobiographical Reset claims to remember his mother\'s kitchen in Prague outside of marked sensory flash.\n');

const amnesiaBreachText = `
# THE NAME THAT SURVIVED
## CHAPTER 1: THE WAKING

The overhead fluorescent strips hummed with sixty hertz.
He didn't know whether he was twenty or fifty. He suffered an eleven-day comatose state with Full Autobiographical Reset confirmed.
Dr. Bradley adjusted the regulator. "Keep the ward illumination low and auditory stimulation below forty decibels."

Elias sat up on the edge of the mattress, calmly remembered his mother's lavender-scented kitchen in Prague and the summer vacations of his youth.
`;

const probe3Result = PostRewriteIntegrityAuditor.auditManuscriptPostRewrite(1, rawOriginalCh1, amnesiaBreachText);

console.log('RAW AUDITOR OUTPUT FOR PROBE 3:');
console.log(JSON.stringify(probe3Result, null, 2));
console.log('\nPROBE 3 VERDICT: ' + (probe3Result.passed ? 'FAIL (Allowed amnesia violation!)' : 'SUCCESS (Caught epistemic boundary violation!)'));
console.log('================================================================================');
