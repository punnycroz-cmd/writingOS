/**
 * Writing OS Core — Bidirectional Causal Traceability Engine (v5.3)
 * Provides both Forward Causality (State -> Attention -> Causality -> Prose)
 * and Backward Audit (Prose Sentence -> Cognitive Justification in Trace).
 * 
 * Supports Intentional Authorial Overrides (CAUSAL_OVERRIDE_INTENTIONAL)
 * to preserve creative flexibility without triggering false drift alerts.
 */

import { AttentionMap } from '../registers/fiction-pack/attention-engine';
import { PsychologicalCausalChain } from '../registers/fiction-pack/psychological-causality';
import { ConsciousnessRepresentation } from '../registers/fiction-pack/character-consciousness';

export interface BackwardAuditRecord {
  sentenceIndex: number;
  sentenceText: string;
  mappedCognitiveStage?: 'PERCEPTION' | 'ATTENTION' | 'INTERPRETATION' | 'EMOTION' | 'INTENTION' | 'ACTION';
  justifyingStimulusOrState?: string;
  isIntentionalOverride: boolean;
  overrideProvenance?: string;
  isJustified: boolean;
}

export interface BidirectionalTraceReport {
  traceId: string;
  characterId: string;
  forwardDirectivesCount: number;
  backwardAuditedSentences: BackwardAuditRecord[];
  traceabilityScore: number; // 0.0 to 1.0 (ratio of justified sentences)
  allActionsGrounded: boolean;
  untraceableSnippets: string[];
}

export class CausalTraceabilityEngine {
  public static auditBackward(params: {
    prose: string;
    consciousness: ConsciousnessRepresentation;
    attentionMap: AttentionMap;
    causalChain: PsychologicalCausalChain;
    allowedOverrides?: Array<{ snippetSubstring: string; reason: string; provenance: string }>;
  }): BidirectionalTraceReport {
    const { prose, consciousness, attentionMap, causalChain, allowedOverrides } = params;
    const sentences = prose.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);

    const auditedRecords: BackwardAuditRecord[] = [];
    const untraceableSnippets: string[] = [];

    const attendedNames = attentionMap.primaryFocusItems.map(i => i.stimulusName.toLowerCase());
    const secondaryNames = attentionMap.secondaryItems.map(i => i.stimulusName.toLowerCase());
    const validStimuli = [...attendedNames, ...secondaryNames];

    sentences.forEach((sentence, idx) => {
      const lower = sentence.toLowerCase();

      // 1. Check for registered intentional override
      const override = allowedOverrides?.find(o => lower.includes(o.snippetSubstring.toLowerCase()));
      if (override) {
        auditedRecords.push({
          sentenceIndex: idx,
          sentenceText: sentence,
          isIntentionalOverride: true,
          overrideProvenance: `${override.provenance}: ${override.reason}`,
          isJustified: true,
        });
        return;
      }

      // 2. Check if sentence maps to an Action Beat
      const isAction = /\b(?:stepped|braced|shifted|moved|reached|retreated|advanced|grasped|curled|watched)\b/i.test(sentence);
      if (isAction) {
        auditedRecords.push({
          sentenceIndex: idx,
          sentenceText: sentence,
          mappedCognitiveStage: 'ACTION',
          justifyingStimulusOrState: `Cadence: ${causalChain.proseDirectives.actionCadence}`,
          isIntentionalOverride: false,
          isJustified: true,
        });
        return;
      }

      // 3. Check if sentence maps to Attended Perception or Focus
      const matchedStimulus = validStimuli.find(stim => {
        const words = stim.split(/\s+/).filter(w => w.length > 3);
        return words.some(w => lower.includes(w));
      });

      if (matchedStimulus) {
        auditedRecords.push({
          sentenceIndex: idx,
          sentenceText: sentence,
          mappedCognitiveStage: 'PERCEPTION',
          justifyingStimulusOrState: `Attended cue: "${matchedStimulus}"`,
          isIntentionalOverride: false,
          isJustified: true,
        });
        return;
      }

      // 4. Check if sentence maps to Internal Emotion/Somatic State
      const somatic = consciousness.emotionalPressure.somaticManifestation.toLowerCase();
      const emotion = consciousness.emotionalPressure.dominantEmotion.toLowerCase();
      if (lower.includes(somatic) || lower.includes(emotion) || lower.includes('pulse') || lower.includes('breath') || lower.includes('jaw') || lower.includes('tension')) {
        auditedRecords.push({
          sentenceIndex: idx,
          sentenceText: sentence,
          mappedCognitiveStage: 'EMOTION',
          justifyingStimulusOrState: `Somatic anchor: "${consciousness.emotionalPressure.somaticManifestation}"`,
          isIntentionalOverride: false,
          isJustified: true,
        });
        return;
      }

      // 5. Unjustified or unanchored sentence
      auditedRecords.push({
        sentenceIndex: idx,
        sentenceText: sentence,
        isIntentionalOverride: false,
        isJustified: false,
      });
      untraceableSnippets.push(sentence);
    });

    const justifiedCount = auditedRecords.filter(r => r.isJustified).length;
    const traceabilityScore = sentences.length > 0 ? Number((justifiedCount / sentences.length).toFixed(2)) : 1.0;

    return {
      traceId: `trace_bidi_${Date.now()}`,
      characterId: consciousness.characterId,
      forwardDirectivesCount: causalChain.beats.length + causalChain.proseDirectives.mandatorySensoryAnchors.length,
      backwardAuditedSentences: auditedRecords,
      traceabilityScore,
      allActionsGrounded: untraceableSnippets.length === 0,
      untraceableSnippets,
    };
  }
}
