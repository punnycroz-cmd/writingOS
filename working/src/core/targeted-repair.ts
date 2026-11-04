/**
 * Writing OS Core — Targeted Region-Scoped Repair Engine
 * Localizes validation failures to specific paragraphs/scenes and applies targeted surgical patches
 * without rewriting uncorrupted regions of the manuscript.
 */

import { TargetedRepairRecord } from './generation-trace';

export interface RegionalPatchRequest {
  fullText: string;
  regionIdentifier: string | number; // Paragraph index (0-based) or Section title
  repairedRegionText: string;
  violationAddressed: string;
}

export interface RegionalPatchResult {
  patchedFullText: string;
  repairRecord: TargetedRepairRecord;
  unchangedRegionsCount: number;
  patchAppliedSuccessfully: boolean;
}

export class TargetedRepairEngine {
  /**
   * Applies a surgical replacement to a single identified paragraph/section,
   * guaranteeing zero mutation in untouched surrounding text.
   */
  public static applyTargetedRepair(request: RegionalPatchRequest): RegionalPatchResult {
    const paragraphs = request.fullText.split(/\n\n+/);

    let targetIdx = -1;
    if (typeof request.regionIdentifier === 'number') {
      targetIdx = request.regionIdentifier;
    } else {
      targetIdx = paragraphs.findIndex(p => p.includes(String(request.regionIdentifier)));
    }

    if (targetIdx < 0 || targetIdx >= paragraphs.length) {
      return {
        patchedFullText: request.fullText,
        repairRecord: {
          repairId: `rep_fail_${Date.now()}`,
          targetedRegionId: String(request.regionIdentifier),
          originalSnippet: '',
          repairedSnippet: request.repairedRegionText,
          violationAddressed: request.violationAddressed,
          timestamp: Date.now(),
        },
        unchangedRegionsCount: paragraphs.length,
        patchAppliedSuccessfully: false,
      };
    }

    const originalSnippet = paragraphs[targetIdx];
    paragraphs[targetIdx] = request.repairedRegionText.trim();
    const patchedFullText = paragraphs.join('\n\n');

    const repairRecord: TargetedRepairRecord = {
      repairId: `rep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      targetedRegionId: String(request.regionIdentifier),
      originalSnippet,
      repairedSnippet: request.repairedRegionText.trim(),
      violationAddressed: request.violationAddressed,
      timestamp: Date.now(),
    };

    return {
      patchedFullText,
      repairRecord,
      unchangedRegionsCount: paragraphs.length - 1,
      patchAppliedSuccessfully: true,
    };
  }
}
