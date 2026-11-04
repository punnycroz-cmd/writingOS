/**
 * Writing OS Core — Failure Localization Engine (P6)
 * Surgically diagnoses candidate prose defects down to the exact paragraph, sentence,
 * defect category, and severity level.
 */

import { UniversalStateGraph } from './state-model';
import { ConsciousnessRepresentation } from '../registers/fiction-pack/character-consciousness';
import { QualityEvaluationReport } from './quality-evaluator';

export type DefectType = 
  | 'VOICE_DRIFT' 
  | 'POV_LEAK' 
  | 'UNSUPPORTED_CLAIM' 
  | 'SOMATIC_CONTRADICTION' 
  | 'REPETITIVE_FILLER'
  | 'GENERIC_CLICHE';

export interface LocalizedDefect {
  defectId: string;
  paragraphIndex: number;
  paragraphText: string;
  defectType: DefectType;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  evidenceSnippet: string;
  repairScope: 'LOCAL';
  suggestedCorrection: string;
}

export class FailureLocalizer {
  public static localizeFailures(params: {
    prose: string;
    stateGraph: UniversalStateGraph;
    consciousness?: ConsciousnessRepresentation;
    qualityReport?: QualityEvaluationReport;
  }): LocalizedDefect[] {
    const { prose, stateGraph, consciousness, qualityReport } = params;
    const paragraphs = prose.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const defects: LocalizedDefect[] = [];

    paragraphs.forEach((para, idx) => {
      const paraLower = para.toLowerCase();

      // 1. Diagnose POV Knowledge Leak
      if (consciousness) {
        for (const unknownItem of consciousness.knowledgeBoundary) {
          const key = unknownItem.split('.').pop()?.toLowerCase();
          if (key && paraLower.includes(key)) {
            defects.push({
              defectId: `defect_pov_${idx}_${Date.now()}`,
              paragraphIndex: idx,
              paragraphText: para,
              defectType: 'POV_LEAK',
              severity: 'CRITICAL',
              evidenceSnippet: key,
              repairScope: 'LOCAL',
              suggestedCorrection: `Remove omniscient reference to unobserved state property "${key}".`,
            });
          }
        }
      }

      // 2. Diagnose Voice Drift / Clichés
      if (/\b(?:a wave of fear|gloomy shadows danced|shiver down his spine|time stood still)\b/i.test(para)) {
        defects.push({
          defectId: `defect_voice_${idx}_${Date.now()}`,
          paragraphIndex: idx,
          paragraphText: para,
          defectType: 'VOICE_DRIFT',
          severity: 'MAJOR',
          evidenceSnippet: para.match(/\b(?:a wave of fear|gloomy shadows danced|shiver down his spine|time stood still)\b/i)?.[0] || 'generic cliché',
          repairScope: 'LOCAL',
          suggestedCorrection: 'Replace generic melodrama with specific somatic and sensory perceptions.',
        });
      }

      // 3. Diagnose Somatic Contradiction (e.g. relaxed smiling in extreme trauma/exhaustion)
      if (consciousness && consciousness.emotionalPressure.intensity >= 7.0) {
        if (/\b(?:smiled warmly|laughed carefree|relaxed leisurely|stretched out lazily)\b/i.test(para)) {
          defects.push({
            defectId: `defect_somatic_${idx}_${Date.now()}`,
            paragraphIndex: idx,
            paragraphText: para,
            defectType: 'SOMATIC_CONTRADICTION',
            severity: 'CRITICAL',
            evidenceSnippet: 'relaxed action in high-threat somatic state',
            repairScope: 'LOCAL',
            suggestedCorrection: 'Align somatic actions with high emotional intensity and trauma constraints.',
          });
        }
      }
    });

    return defects;
  }
}
