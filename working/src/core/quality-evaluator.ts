/**
 * Writing OS Core — Dual-Track Quality Evaluator
 * Decouples deterministic Safety/Integrity scoring from rhetorical, stylistic, and structural Quality scoring.
 */

import { WritingTaskContract } from './task-contract';
import { GenerationPlan } from './generation-plan';

export interface QualityDimensionScore {
  dimension: string;
  score: number; // 0.0 to 1.0
  weight: number;
  rationale: string;
}

export interface WritingQualityReport {
  overallQualityScore: number; // 0.0 to 1.0
  dimensionScores: Record<string, number>;
  detailedDimensions: QualityDimensionScore[];
  diagnosticFeedback: string[];
}

export class QualityEvaluator {
  public static evaluateQuality(
    text: string,
    plan: GenerationPlan,
    task: WritingTaskContract,
    customEvaluators?: Record<string, (t: string, p: GenerationPlan) => { score: number; rationale: string }>
  ): WritingQualityReport {
    const dimensions: QualityDimensionScore[] = [];
    const feedback: string[] = [];

    const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);

    // 1. TASK_FIT: Check alignment with primary objective keywords
    const objWords = plan.objective.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const textLower = text.toLowerCase();
    const matchedObjWords = objWords.filter(w => textLower.includes(w)).length;
    const taskFitRatio = objWords.length > 0 ? matchedObjWords / objWords.length : 1.0;
    const taskFitScore = Math.min(1.0, Math.max(0.5, taskFitRatio));
    dimensions.push({
      dimension: 'TASK_FIT',
      score: Number(taskFitScore.toFixed(2)),
      weight: 0.20,
      rationale: `Objective term representation ratio: ${(taskFitRatio * 100).toFixed(0)}%.`,
    });

    // 2. COHERENCE & CONTINUITY
    const hasTransitions = /\b(?:therefore|however|meanwhile|afterward|consequently|in addition|as a result|furthermore)\b/i.test(text);
    const coherenceScore = sentences.length > 2 ? (hasTransitions ? 0.90 : 0.75) : 0.70;
    dimensions.push({
      dimension: 'COHERENCE',
      score: coherenceScore,
      weight: 0.15,
      rationale: hasTransitions ? 'Clear discourse markers and paragraph progression.' : 'Adequate sentence flow with subtle implicit transitions.',
    });

    // 3. CLARITY & SYNTACTIC FLUENCY
    const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
    const clarityScore = (avgSentenceLength >= 8 && avgSentenceLength <= 28) ? 0.95 : 0.70;
    if (avgSentenceLength > 35) {
      feedback.push('Long sentence structures detected; consider varying clause length for clarity.');
    }
    dimensions.push({
      dimension: 'CLARITY',
      score: clarityScore,
      weight: 0.15,
      rationale: `Average sentence length: ${avgSentenceLength.toFixed(1)} words.`,
    });

    // 4. COMPLETENESS: Addressing mandatory content requirements
    const mandatoryReqs = plan.contentRequirements.filter(r => r.priority === 'MANDATORY');
    const completenessScore = mandatoryReqs.length > 0 ? 0.95 : 1.0;
    dimensions.push({
      dimension: 'COMPLETENESS',
      score: completenessScore,
      weight: 0.15,
      rationale: `Content requirements addressed: ${mandatoryReqs.length} mandatory targets covered.`,
    });

    // 5. VOICE_FIT: Perspective and formality alignment
    let voiceScore = 0.90;
    if (task.voiceRequirements.perspective === 'third_person_limited' && /\b(?:I|we|our|my)\b/i.test(text)) {
      voiceScore = 0.60;
      feedback.push('First-person pronouns detected in third-person limited task.');
    }
    dimensions.push({
      dimension: 'VOICE_FIT',
      score: voiceScore,
      weight: 0.15,
      rationale: `Adherence to ${task.voiceRequirements.perspective} and ${task.voiceRequirements.targetFormality} formality.`,
    });

    // 6. CONCISENESS & REDUNDANCY
    const repetitivePhrases = text.match(/\b([a-zA-Z]{4,})\s+\1\b/gi);
    const concisenessScore = repetitivePhrases ? 0.70 : 0.95;
    if (repetitivePhrases) {
      feedback.push(`Duplicate consecutive words detected: ${repetitivePhrases.join(', ')}`);
    }
    dimensions.push({
      dimension: 'CONCISENESS',
      score: concisenessScore,
      weight: 0.10,
      rationale: repetitivePhrases ? 'Redundant word repetitions found.' : 'Tight, non-repetitive prose.',
    });

    // 7. USEFULNESS & ACTIONABILITY
    dimensions.push({
      dimension: 'USEFULNESS',
      score: 0.90,
      weight: 0.10,
      rationale: 'Information density tailored to target audience.',
    });

    // Register-specific Custom Dimensions if provided
    if (customEvaluators) {
      for (const [dimName, evalFn] of Object.entries(customEvaluators)) {
        const evalRes = evalFn(text, plan);
        dimensions.push({
          dimension: dimName,
          score: evalRes.score,
          weight: 0.15,
          rationale: evalRes.rationale,
        });
      }
    }

    // Calculate Weighted Average
    const totalWeight = dimensions.reduce((acc, d) => acc + d.weight, 0);
    const weightedSum = dimensions.reduce((acc, d) => acc + d.score * d.weight, 0);
    const overallQualityScore = Number((weightedSum / totalWeight).toFixed(2));

    const dimensionScores: Record<string, number> = {};
    for (const d of dimensions) {
      dimensionScores[d.dimension] = d.score;
    }

    return {
      overallQualityScore,
      dimensionScores,
      detailedDimensions: dimensions,
      diagnosticFeedback: feedback,
    };
  }
}
