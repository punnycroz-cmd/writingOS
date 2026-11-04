/**
 * Writing OS Core — Causal Faithfulness & Drift Engine (v5.2)
 * Audits whether generated prose is causally grounded in the active GenerationPlan,
 * Attention Map, and Psychological Causal Chain.
 * 
 * Formal Invariant: GENERATION_CAUSAL_FAITHFULNESS
 */

import { AttentionMap } from '../registers/fiction-pack/attention-engine';
import { PsychologicalCausalChain } from '../registers/fiction-pack/psychological-causality';
import { GenerationPlan } from './generation-plan';

export type CausalClassification = 
  | 'CAUSALLY_FAITHFUL' 
  | 'CAUSAL_DRIFT_UNINTENTIONAL' 
  | 'CAUSAL_OVERRIDE_INTENTIONAL';

export interface CausalFaithfulnessReport {
  faithfulnessScore: number; // 0.0 to 1.0
  classification: CausalClassification;
  groundedAttendedCues: string[];
  missingHighAttentionCues: string[];
  unjustifiedLeakedCues: string[];
  actionAlignmentPassed: boolean;
  driftExplanations: string[];
}

export class CausalFaithfulnessEngine {
  public static auditFaithfulness(
    candidateText: string,
    causalChain: PsychologicalCausalChain,
    attentionMap: AttentionMap,
    plan?: GenerationPlan
  ): CausalFaithfulnessReport {
    const textLower = candidateText.toLowerCase();
    const groundedAttendedCues: string[] = [];
    const missingHighAttentionCues: string[] = [];
    const unjustifiedLeakedCues: string[] = [];
    const driftExplanations: string[] = [];

    // Common stop words to ignore during cue matching
    const commonStops = new Set(['heavy', 'steady', 'floor', 'metal', 'steel', 'faint', 'room', 'door', 'cold', 'dark']);

    // 1. Audit HIGH Attention Stimuli representation
    for (const item of attentionMap.primaryFocusItems) {
      const cueWords = item.stimulusName.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !commonStops.has(w));
      const isPresent = cueWords.length > 0 ? cueWords.some(w => textLower.includes(w)) : textLower.includes(item.stimulusName.toLowerCase());
      if (isPresent) {
        groundedAttendedCues.push(item.stimulusName);
      } else {
        missingHighAttentionCues.push(item.stimulusName);
      }
    }

    // 2. Audit IGNORED Stimuli leakage (requires distinct multi-word phrase matching)
    for (const ignoredItem of attentionMap.filteredOutItems) {
      const cueWords = ignoredItem.stimulusName.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !commonStops.has(w));
      const isLeaked = cueWords.length >= 2 ? cueWords.every(w => textLower.includes(w)) : (cueWords.length === 1 && textLower.includes(cueWords[0]));
      if (isLeaked) {
        unjustifiedLeakedCues.push(ignoredItem.stimulusName);
        driftExplanations.push(`Unjustified Stimulus Leak: IGNORED cue "${ignoredItem.stimulusName}" appeared prominently without cognitive justification.`);
      }
    }

    // 3. Audit Action Beat Alignment
    let actionAlignmentPassed = true;
    if (causalChain.proseDirectives.actionCadence === 'DEFENSIVE_RETREAT') {
      const hasDefensiveAction = /\b(?:back|retreat|distance|braced|defensive|stepped away|shielded)\b/i.test(candidateText);
      const hasAggressiveAdvance = /\b(?:lunged forward|embraced warmly|smiled relaxed|charged|singing happily)\b/i.test(candidateText);
      if (!hasDefensiveAction || hasAggressiveAdvance) {
        actionAlignmentPassed = false;
        driftExplanations.push('Action Drift: Prose failed to reflect DEFENSIVE_RETREAT cadence or contradicted defensive posture.');
      }
    } else if (causalChain.proseDirectives.actionCadence === 'COOPERATIVE_ADVANCE') {
      const hasCooperativeAction = /\b(?:forward|stepped in|reached|assisted|open hands|closer|together)\b/i.test(candidateText);
      if (!hasCooperativeAction) {
        actionAlignmentPassed = false;
        driftExplanations.push('Action Drift: Prose failed to reflect COOPERATIVE_ADVANCE cadence.');
      }
    }

    // 4. Calculate Faithfulness Score (0.0 to 1.0)
    const totalHigh = attentionMap.primaryFocusItems.length;
    const highRatio = totalHigh > 0 ? groundedAttendedCues.length / totalHigh : 1.0;
    const penaltyPerLeak = 0.25 * unjustifiedLeakedCues.length;
    const actionPenalty = actionAlignmentPassed ? 0 : 0.35;

    const rawScore = Math.max(0.0, (highRatio * 0.7 + (1.0 - actionPenalty) * 0.3) - penaltyPerLeak);
    const faithfulnessScore = Number(rawScore.toFixed(2));

    // 5. Determine Classification
    let classification: CausalClassification = 'CAUSALLY_FAITHFUL';
    if (unjustifiedLeakedCues.length > 0 || !actionAlignmentPassed || faithfulnessScore < 0.65) {
      classification = 'CAUSAL_DRIFT_UNINTENTIONAL';
    }

    return {
      faithfulnessScore,
      classification,
      groundedAttendedCues,
      missingHighAttentionCues,
      unjustifiedLeakedCues,
      actionAlignmentPassed,
      driftExplanations,
    };
  }
}
